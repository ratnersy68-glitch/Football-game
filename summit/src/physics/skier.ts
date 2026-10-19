/**
 * Skier / snowboarder physics controller.
 *
 * Grounded: gravity along the slope, Coulomb snow friction, quadratic air drag (tuck
 * changes CdA), powder/slush drag, snowplow braking and edge grip that redirects velocity
 * toward the skis (carving) up to a lateral-acceleration limit — any remaining sideways
 * slip becomes skid friction. Contact is a true heightfield constraint: the rider leaves
 * the snow whenever the surface falls away faster than gravity can follow (lips, rollers,
 * cliffs), flies ballistically, and lands with an impact/orientation check.
 *
 * Air: Q/E spin about a (cork-tiltable) vertical axis, arrows flip about the body's
 * lateral axis, 1–4 grab. Real rotation integrals feed the trick namer.
 */
import { Quaternion, Vector3 } from 'three';
import { clamp, damp, lerp, wrapAngle } from '../core/math';
import { SURFACE_PHYS, type Terrain } from '../world/terrain';
import type { Surface } from '../world/types';
import type { ObstacleIndex } from '../world/resortBuilder';
import { RailSystem } from './rails';
import type { RailDef } from '../world/types';
import { newAirData, type AirData, type Landing } from './tricks';

export const G = 9.81;
const MASS = 78;
const RHO = 1.15;

export interface GearStats { speed: number; control: number; carving: number; stability: number; jump: number; powder: number }
export const BASE_GEAR: GearStats = { speed: 0.5, control: 0.5, carving: 0.5, stability: 0.5, jump: 0.5, powder: 0.5 };

export interface SkierInput {
  steer: number; tuck: boolean; brake: boolean; carve: boolean; jump: boolean;
  spin: number; flip: number; tilt: number; grab: number;
}
export const NO_INPUT: SkierInput = { steer: 0, tuck: false, brake: false, carve: false, jump: false, spin: 0, flip: 0, tilt: 0, grab: 0 };

export interface PhysicsWorld {
  terrain: Terrain;
  obstacles?: ObstacleIndex;
  rails?: RailSystem;
  wind?: { x: number; z: number };
}

export type SkierState = 'ride' | 'air' | 'grind' | 'crashed' | 'recover' | 'lift' | 'hold';

export interface SkierEvent {
  type: 'jump' | 'takeoff' | 'land' | 'crash' | 'grindStart' | 'grindEnd' | 'collide' | 'recovered';
  v?: number;
  landing?: Landing;
  air?: AirData;
  grind?: { name: string; seconds: number; quality: number; bonus: number };
  reason?: string;
}

const UP = new Vector3(0, 1, 0);
const _n = new Vector3(), _f = new Vector3(), _r = new Vector3(), _v = new Vector3(), _t = new Vector3();
const _q = new Quaternion(), _q2 = new Quaternion();
const _m = { x: 0, y: 0, z: 0 };

export class Skier {
  pos = new Vector3();
  vel = new Vector3();
  /** Ski heading (yaw) — forward = (sin yaw, 0, cos yaw). */
  yaw = 0;
  state: SkierState = 'ride';
  board: 'ski' | 'snowboard' = 'ski';
  gear: GearStats = { ...BASE_GEAR };
  normal = new Vector3(0, 1, 0);
  surface: Surface = 'groomed';
  contact = true;
  /** Seconds since contact was lost (for hop vs air). */
  noContact = 0;
  airTime = 0;
  /** World-space body orientation (air & render). */
  bodyQ = new Quaternion();
  airQ = new Quaternion();
  air: AirData = newAirData();
  takeoffY = 0;
  maxY = 0;
  spinVel = 0;
  flipVel = 0;
  corkTilt = 0;
  launchDir = new Vector3(0, 0, 1);
  // animation outputs
  lean = 0;
  compression = 0;
  crouch = 0;
  tuckAmt = 0;
  brakeAmt = 0;
  edge = 0;
  grab = 0;
  grabAmt = 0;
  slip = 0;
  switchRiding = false;
  stumble = 0;
  // crash
  crashT = 0;
  crashSpin = new Vector3();
  recoverFrom = new Quaternion();
  // grind
  rail: RailDef | null = null;
  railSeg = 0;
  railT = 0;
  railDir = 1;
  railSpeed = 0;
  railTime = 0;
  railBalance = 0;
  railBalVel = 0;
  railSlide = false;
  railCooldown = 0;
  railName = '';
  railStartYaw = 0;
  events: SkierEvent[] = [];
  /** Distance travelled on snow (stats). */
  distance = 0;
  topSpeed = 0;
  private jumpHeld = false;
  private surfTimer = 0;
  private rngState = 12345;
  pipeAir = false;
  /** When true a render-side ragdoll drives the crashed body. */
  externalCrash = false;
  inverted = false;
  takeoffYaw = 0;
  lastGroundY = 0;
  impact = 0;

  get speed() { return this.vel.length(); }
  get grounded() { return this.state === 'ride' || this.state === 'grind'; }

  private rand() {
    this.rngState = (this.rngState * 1664525 + 1013904223) >>> 0;
    return this.rngState / 4294967296;
  }

  /** Place on the snow at xz facing yaw, at rest (or with an initial speed). */
  place(world: PhysicsWorld, x: number, z: number, yaw: number, speed = 0) {
    const y = world.terrain.height(x, z);
    this.pos.set(x, y, z);
    this.yaw = yaw;
    this.vel.set(Math.sin(yaw) * speed, 0, Math.cos(yaw) * speed);
    world.terrain.normal(x, z, _m);
    this.normal.set(_m.x, _m.y, _m.z);
    this.vel.addScaledVector(this.normal, -this.vel.dot(this.normal));
    this.state = 'ride';
    this.contact = true;
    this.noContact = 0;
    this.airTime = 0;
    this.crashT = 0;
    this.rail = null;
    this.stumble = 0;
    this.spinVel = this.flipVel = this.corkTilt = 0;
    this.groundQuat(this.bodyQ);
    this.airQ.copy(this.bodyQ);
    this.lastGroundY = y;
  }

  /** Orientation with up = snow normal and forward = skis. */
  groundQuat(out: Quaternion, up: Vector3 = this.normal): Quaternion {
    _f.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    _f.addScaledVector(up, -_f.dot(up)).normalize();
    _r.crossVectors(up, _f).normalize();
    return quatFromBasis(out, _r, up, _f);
  }

  step(dt: number, input: SkierInput, world: PhysicsWorld) {
    // fixed substeps for stable contact handling
    const n = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / n;
    for (let i = 0; i < n; i++) this.substep(h, input, world);
    const sp = this.speed;
    if (sp > this.topSpeed && this.state !== 'lift') this.topSpeed = sp;
  }

  private substep(dt: number, input: SkierInput, world: PhysicsWorld) {
    switch (this.state) {
      case 'ride': this.ride(dt, input, world); break;
      case 'air': this.fly(dt, input, world); break;
      case 'grind': this.grindStep(dt, input, world); break;
      case 'crashed': this.crashStep(dt, world); break;
      case 'recover': this.recoverStep(dt, world); break;
      case 'hold': {
        const y = world.terrain.height(this.pos.x, this.pos.z);
        this.pos.y = y; this.vel.set(0, 0, 0);
        world.terrain.normal(this.pos.x, this.pos.z, _m);
        this.normal.set(_m.x, _m.y, _m.z);
        this.groundQuat(this.bodyQ);
        this.crouch = lerp(this.crouch, 0.3, damp(4, dt));
        break;
      }
      case 'lift': break;
    }
    if (this.railCooldown > 0) this.railCooldown -= dt;
  }

  // ---------------------------------------------------------------- ground
  private ride(dt: number, input: SkierInput, world: PhysicsWorld) {
    const T = world.terrain;
    const gear = this.gear;
    // forces use the last contact normal (re-sampling here would flatten kicker lips)
    const n = this.normal;
    this.surfTimer -= dt;
    if (this.surfTimer <= 0) { this.surface = T.surfaceAt(this.pos.x, this.pos.z); this.surfTimer = 0.06; }
    const sp = SURFACE_PHYS[this.surface];
    const isBoard = this.board === 'snowboard';

    const v = this.vel;
    let speed = v.length();

    // ---- steering (yaw of the skis)
    const carve = input.carve;
    const grip = sp.grip * (0.78 + 0.45 * gear.carving) * (carve ? 1.12 : 1) * (this.stumble > 0 ? 0.6 : 1);
    const latMax = grip * G * (carve ? 1.3 : 0.98) * clamp(n.y * 1.25, 0.4, 1.2);
    const steer = clamp(input.steer, -1, 1);
    let yawRate: number;
    if (speed < 2.2) {
      yawRate = steer * (2.4 + 0.8 * gear.control);
    } else {
      const follow = latMax / speed;
      const skid = (1.55 + 0.9 * gear.control) * (isBoard ? 1.1 : 1);
      yawRate = steer * (carve ? Math.min(follow * 1.05, 2.6) : Math.max(follow * 1.1, skid));
    }
    // braking turns the skis across the fall line slightly (hockey stop) at speed
    this.yaw = wrapAngle(this.yaw - yawRate * dt);
    // slight self-alignment of the skis to the travel direction when sliding sideways w/o input
    if (speed > 1.5 && Math.abs(steer) < 0.05 && !input.brake) {
      const vy = Math.atan2(v.x, v.z);
      let d = wrapAngle(vy - this.yaw);
      if (Math.abs(d) > Math.PI / 2) d = wrapAngle(d - Math.PI);
      this.yaw = wrapAngle(this.yaw + d * damp(1.6, dt));
    }
    // instability on ice/moguls at speed
    const rough = this.surface === 'moguls' ? 1 : this.surface === 'ice' ? 0.6 : this.surface === 'rock' ? 1.2 : 0.1;
    this.yaw += (this.rand() - 0.5) * rough * (1.2 - gear.stability) * Math.min(1, speed / 25) * 2.2 * dt;

    // ski axes on the plane
    _f.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    _f.addScaledVector(n, -_f.dot(n)).normalize();

    // ---- forces
    _t.set(0, -G, 0);
    _t.addScaledVector(n, -_t.dot(n)); // tangential gravity
    v.addScaledVector(_t, dt);
    // poling / skating push on flats
    const slopeAlong = -_t.dot(_f) / G;
    if (input.tuck && speed < 6 && slopeAlong > -0.05) {
      const push = (isBoard ? 1.0 : 2.0) * (1 - speed / 6);
      v.addScaledVector(_f, (v.dot(_f) >= -0.1 ? 1 : -1) * push * dt);
    }
    speed = v.length();
    if (speed > 1e-4) {
      const N = G * Math.max(0.15, n.y);
      const muEff = sp.mu * (1.18 - 0.36 * gear.speed);
      let dec = muEff * N;
      // air drag (relative to wind)
      const wx = world.wind?.x ?? 0, wz = world.wind?.z ?? 0;
      const rvx = v.x - wx, rvz = v.z - wz;
      const rel = Math.hypot(rvx, v.y, rvz);
      const tuck = input.tuck && speed >= 4;
      const cda = (tuck ? (isBoard ? 0.32 : 0.24) : input.brake ? 0.75 : 0.5) * (1.06 - 0.12 * gear.speed);
      dec += (0.5 * RHO * cda / MASS) * rel * rel * ((v.x * rvx + v.z * rvz + v.y * v.y) / Math.max(1e-3, speed * rel));
      // powder / slush sink drag
      const depth = this.surface === 'powder' ? 0.35 + 0.65 * T.conditions.powder : this.surface === 'slush' ? 0.8 : 0.2;
      dec += sp.drag * depth * (1.25 - 0.8 * gear.powder) * speed * (isBoard ? 0.75 : 1);
      // snowplow / skid brake
      // snowplow at low speed, skidded check turns at speed: strong enough to hold on steeps
      if (input.brake) dec += (2.8 + 0.13 * speed) * Math.max(0.5, grip);
      const ns = Math.max(0, speed - dec * dt);
      v.multiplyScalar(ns / speed);
      speed = ns;
    }

    // ---- edge grip: redirect velocity toward the skis, rest is skid
    let slipAngle = 0;
    if (speed > 0.3) {
      const fwdSign = v.dot(_f) >= 0 ? 1 : -1;
      _r.copy(_f).multiplyScalar(fwdSign);
      // signed angle from v to fdir around n
      _v.copy(v).normalize();
      const cross = _t.crossVectors(_v, _r).dot(n);
      const dot = clamp(_v.dot(_r), -1, 1);
      const ang = Math.atan2(cross, dot);
      const maxRot = (latMax / Math.max(speed, 0.6)) * dt;
      const rot = clamp(ang, -maxRot, maxRot);
      _q.setFromAxisAngle(n, rot);
      v.applyQuaternion(_q);
      slipAngle = ang - rot;
      const sideslip = Math.abs(Math.sin(clamp(slipAngle, -Math.PI / 2, Math.PI / 2)));
      if (sideslip > 0.01) {
        const skidDec = (2.4 + 3.2 * grip) * sideslip * G * 0.35;
        const ns = Math.max(0, speed - skidDec * dt);
        v.multiplyScalar(ns / speed);
        speed = ns;
      }
      this.switchRiding = fwdSign < 0;
    }
    this.slip = lerp(this.slip, Math.abs(slipAngle), damp(8, dt));

    // ---- jump charge / pop
    if (input.jump) {
      this.crouch = Math.min(1, this.crouch + dt / 0.4);
      this.jumpHeld = true;
    } else if (this.jumpHeld) {
      this.jumpHeld = false;
      const pop = (2.4 + 2.4 * this.crouch) * (0.82 + 0.36 * gear.jump);
      v.addScaledVector(n, pop);
      this.crouch = 0;
      this.events.push({ type: 'jump', v: pop });
      this.leaveGround(world, true);
      this.pos.addScaledVector(v, dt);
      return;
    } else this.crouch = Math.max(0, this.crouch - dt * 3);

    // ---- integrate & contact
    const ox = this.pos.x, oz = this.pos.z;
    this.pos.addScaledVector(v, dt);
    const hg = T.height(this.pos.x, this.pos.z);
    const gap = this.pos.y - hg;
    const gravDrop = 0.5 * G * n.y * dt * dt + 0.0004;
    if (gap > gravDrop) {
      // the snow fell away faster than gravity can pull us down → airborne
      this.leaveGround(world, false);
    } else {
      this.pos.y = hg;
      T.normal(this.pos.x, this.pos.z, _m);
      const nn = _n.set(_m.x, _m.y, _m.z);
      const vn = v.dot(nn);
      if (vn < 0) {
        const s0 = v.length();
        v.addScaledVector(nn, -vn);
        // smooth transitions keep momentum; sharp ones (compressions) lose the normal part
        if (s0 > 0 && Math.abs(vn) / s0 < 0.22) v.setLength(s0);
        this.compression = Math.min(1, this.compression + Math.abs(vn) * 0.15);
      }
      this.normal.copy(nn);
      this.contact = true;
      this.lastGroundY = hg;
    }
    this.distance += Math.hypot(this.pos.x - ox, this.pos.z - oz);
    this.compression = lerp(this.compression, 0, damp(5, dt));

    // ---- animation helpers
    const latAcc = speed * yawRate;
    this.lean = lerp(this.lean, clamp(-latAcc / G, -1.1, 1.1) * (this.switchRiding ? -1 : 1), damp(7, dt));
    this.edge = Math.abs(this.lean);
    this.tuckAmt = lerp(this.tuckAmt, input.tuck ? 1 : 0, damp(6, dt));
    this.brakeAmt = lerp(this.brakeAmt, input.brake ? 1 : 0, damp(8, dt));
    if (this.stumble > 0) this.stumble -= dt;
    this.groundQuat(this.bodyQ);

    this.checkObstacles(world);
    this.checkRails(world, input);
    this.keepInBounds(world);
  }

  private leaveGround(_world: PhysicsWorld, popped: boolean) {
    this.state = 'air';
    this.contact = false;
    this.airTime = 0;
    this.noContact = 0;
    this.air = newAirData(this.switchRiding);
    this.takeoffY = this.pos.y;
    this.maxY = this.pos.y;
    this.spinVel = 0; this.flipVel = 0; this.corkTilt = 0;
    this.inverted = false;
    this.takeoffYaw = this.yaw;
    // start the air orientation from the ground pose, nudged toward upright
    _n.copy(this.normal).lerp(UP, 0.45).normalize();
    this.groundQuat(this.airQ, _n);
    _t.set(this.vel.x, 0, this.vel.z);
    if (_t.lengthSq() > 1e-4) this.launchDir.copy(_t.normalize());
    else this.launchDir.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    // halfpipe walls: remember so we can steer the rider back into the pipe
    this.pipeAir = Math.abs(this.normal.y) < 0.55;
    if (popped) this.events.push({ type: 'takeoff', v: this.vel.y });
  }

  // ---------------------------------------------------------------- air
  private fly(dt: number, input: SkierInput, world: PhysicsWorld) {
    const T = world.terrain;
    const gear = this.gear;
    this.airTime += dt;
    this.noContact += dt;
    const v = this.vel;
    v.y -= G * dt;
    const wx = world.wind?.x ?? 0, wz = world.wind?.z ?? 0;
    const rvx = v.x - wx, rvz = v.z - wz;
    const rel = Math.hypot(rvx, v.y, rvz);
    const kd = (0.5 * RHO * 0.45) / MASS;
    v.x -= kd * rel * rvx * dt; v.y -= kd * rel * v.y * dt; v.z -= kd * rel * rvz * dt;
    // tiny air steering (and on short hops the skis keep turning as on snow)
    const steer = clamp(input.steer, -1, 1);
    if (this.airTime < 0.35 && input.spin === 0) {
      const turn = steer * Math.min(2.2, 12 / Math.max(4, Math.hypot(v.x, v.z))) * 0.8 * dt;
      this.takeoffYaw -= turn;
      _q.setFromAxisAngle(UP, -turn);
      this.airQ.premultiply(_q);
    }
    if (Math.abs(steer) > 0.05) {
      _t.set(-this.launchDir.z, 0, this.launchDir.x); // left
      v.addScaledVector(_t, -steer * 1.1 * dt);
    }
    // pipe assist: bring vertical airs back over the transition
    if (this.pipeAir) {
      const f = T.features.featureAt(this.pos.x, this.pos.z, -1);
      if (f && f.kind === 'halfpipe') {
        const ox = this.pos.x - f.x, oz = this.pos.z - f.z;
        const vOff = ox * -f.dz + oz * f.dx;
        const rx = -f.dz, rz = f.dx;
        const vLat = v.x * rx + v.z * rz;
        const want = -Math.sign(vOff) * 1.2;
        const dv = (want - vLat) * damp(3, dt);
        v.x += rx * dv; v.z += rz * dv;
      }
    }

    // ---- rotations
    const big = this.airTime > 0.12;
    const spinMax = (6.2 + 2.6 * gear.jump) * (this.board === 'snowboard' ? 1.05 : 1);
    const flipMax = 4.6 + 1.8 * gear.jump;
    const spinIn = big ? clamp(input.spin, -1, 1) : 0;
    const flipIn = big ? clamp(input.flip, -1, 1) : 0;
    if (spinIn !== 0) this.spinVel = lerp(this.spinVel, spinIn * spinMax, damp(9, dt));
    else {
      // finish to the nearest half rotation if close, else stop
      const rem = remainderTo(this.air.spinAccum, Math.PI);
      if (Math.abs(this.spinVel) > 0.3 && Math.abs(rem) > 0.05 && Math.abs(rem) < 1.2 && Math.sign(rem) === Math.sign(this.spinVel)) {
        this.spinVel = Math.sign(this.spinVel) * Math.max(2.2, Math.min(Math.abs(this.spinVel), Math.abs(rem) * 9));
      } else this.spinVel = lerp(this.spinVel, 0, damp(7, dt));
    }
    if (flipIn !== 0) this.flipVel = lerp(this.flipVel, flipIn * flipMax, damp(8, dt));
    else {
      const rem = remainderTo(this.air.flipAccum, Math.PI * 2);
      if (Math.abs(this.flipVel) > 0.3 && Math.abs(rem) > 0.05 && Math.abs(rem) < 2.2 && Math.sign(rem) === Math.sign(this.flipVel)) {
        this.flipVel = Math.sign(this.flipVel) * Math.max(2.4, Math.min(Math.abs(this.flipVel), Math.abs(rem) * 7));
      } else this.flipVel = lerp(this.flipVel, 0, damp(6, dt));
    }
    const tiltIn = big ? clamp(input.tilt, -1, 1) : 0;
    this.corkTilt = lerp(this.corkTilt, tiltIn * 1.2, damp(tiltIn !== 0 ? 3.2 : 2.4, dt));
    if (Math.abs(this.corkTilt) > 0.35 && Math.abs(this.spinVel) > 1) this.air.offAxisTime += dt;

    // spin about the (cork-tilted) world vertical
    _t.copy(UP).applyAxisAngle(this.launchDir, this.corkTilt);
    _q.setFromAxisAngle(_t, -this.spinVel * dt);
    this.airQ.premultiply(_q);
    // flip about the body's lateral (left) axis: + = frontflip
    _q2.setFromAxisAngle(_v.set(1, 0, 0), this.flipVel * dt);
    this.airQ.multiply(_q2);
    this.airQ.normalize();
    this.air.spinAccum += this.spinVel * dt; // positive = right (E)
    this.air.flipAccum += this.flipVel * dt;
    const up = _v.set(0, 1, 0).applyQuaternion(this.airQ);
    if (up.y < -0.25 && !this.inverted) { this.inverted = true; this.air.inversions++; }
    else if (up.y > 0.15) this.inverted = false;

    // grabs
    this.grab = big ? input.grab : 0;
    if (this.grab > 0) this.air.grabTimes[this.grab] += dt;
    this.grabAmt = lerp(this.grabAmt, this.grab > 0 ? 1 : 0, damp(10, dt));
    this.crouch = lerp(this.crouch, 0.25 + (Math.abs(this.spinVel) > 1 || Math.abs(this.flipVel) > 1 ? 0.35 : 0), damp(5, dt));

    // landing assist close to the snow when no rotation is commanded
    const ground = T.height(this.pos.x, this.pos.z);
    const hAbove = this.pos.y - ground;
    if (spinIn === 0 && flipIn === 0 && v.y < 0 && this.airTime > 0.3) {
      const ttl = hAbove / Math.max(1, -v.y);
      if (ttl < 0.45) {
        T.normal(this.pos.x, this.pos.z, _m);
        _n.set(_m.x, _m.y, _m.z);
        const upB = _v.set(0, 1, 0).applyQuaternion(this.airQ);
        if (upB.dot(_n) > Math.cos(1.05)) {
          // nearest good landing: skis along travel (or switch)
          const fwdB = _t.set(0, 0, 1).applyQuaternion(this.airQ);
          const vdir = _r.set(v.x, 0, v.z);
          if (vdir.lengthSq() > 0.01) {
            vdir.normalize();
            const sign = fwdB.x * vdir.x + fwdB.z * vdir.z >= 0 ? 1 : -1;
            const saveYaw = this.yaw;
            this.yaw = Math.atan2(vdir.x * sign, vdir.z * sign);
            const target = this.groundQuat(_q, _n);
            this.yaw = saveYaw;
            this.airQ.slerp(target, damp(5 + 3 * gear.stability, dt));
          }
        }
      }
    }
    this.bodyQ.copy(this.airQ);

    // integrate
    this.pos.addScaledVector(v, dt);
    if (this.pos.y > this.maxY) this.maxY = this.pos.y;
    this.air.air = this.airTime;
    this.air.height = Math.max(this.air.height, this.maxY - Math.min(this.takeoffY, ground));

    // rails can be caught from the air
    if (this.checkRails(world, input)) return;

    const hg = T.height(this.pos.x, this.pos.z);
    if (this.pos.y <= hg) {
      this.pos.y = hg;
      this.land(world, input);
    }
    this.keepInBounds(world);
  }

  private land(world: PhysicsWorld, _input: SkierInput) {
    const T = world.terrain;
    T.normal(this.pos.x, this.pos.z, _m);
    const n = this.normal.set(_m.x, _m.y, _m.z);
    const v = this.vel;
    const vn = v.dot(n);
    const impact = Math.max(0, -vn);
    this.impact = impact;
    v.addScaledVector(n, -vn);
    const up = _v.set(0, 1, 0).applyQuaternion(this.airQ);
    const fwd = _t.set(0, 0, 1).applyQuaternion(this.airQ);
    fwd.addScaledVector(n, -fwd.dot(n));
    const angUp = Math.acos(clamp(up.dot(n), -1, 1));
    const vt = _r.copy(v);
    const sp = vt.length();
    let align = 1;
    if (sp > 1.5 && fwd.lengthSq() > 1e-4) align = Math.abs(fwd.normalize().dot(vt.multiplyScalar(1 / sp)));
    const st = this.gear.stability;
    const hop = this.airTime < 0.3 && Math.abs(this.air.spinAccum) < 0.9 && Math.abs(this.air.flipAccum) < 0.9;
    let landing: Landing;
    const crashImpact = 13.5 + 5 * st;
    if (impact > crashImpact || angUp > 0.95 + 0.1 * st || (sp > 4 && align < 0.42)) landing = 'crash';
    else if (hop) landing = 'clean';
    else if (impact > crashImpact * 0.72 || angUp > 0.5 + 0.12 * st || align < 0.8) landing = 'sketchy';
    else landing = 'clean';

    if (hop && Math.abs(this.air.spinAccum) < 0.3) this.yaw = wrapAngle(this.takeoffYaw + this.air.spinAccum * -1);
    else if (fwd.lengthSq() > 1e-4) this.yaw = Math.atan2(fwd.x, fwd.z);
    this.compression = Math.min(1, impact * 0.12 + 0.2);
    this.grab = 0;
    this.grabAmt = 0;
    const air = this.air;
    if (landing === 'crash') {
      this.events.push({ type: 'land', v: impact, landing, air });
      this.crash(impact > crashImpact ? 'Hard impact' : angUp > 0.95 ? 'Over-rotated' : 'Landed sideways');
      return;
    }
    if (landing === 'sketchy') { v.multiplyScalar(0.8); this.stumble = 0.6; }
    this.state = 'ride';
    this.contact = true;
    this.events.push({ type: 'land', v: impact, landing, air });
    this.groundQuat(this.bodyQ);
  }

  // ---------------------------------------------------------------- rails
  private checkRails(world: PhysicsWorld, input: SkierInput): boolean {
    if (!world.rails || this.railCooldown > 0) return false;
    const hit = world.rails.query(this.pos.x, this.pos.z);
    if (!hit) return false;
    const dy = this.pos.y - hit.y;
    if (dy < -0.3 || dy > 0.55 || this.vel.y > 2.5) return false;
    const hs = Math.hypot(this.vel.x, this.vel.z);
    if (hs < 1.5) return false;
    const along = (this.vel.x * hit.tx + this.vel.z * hit.tz) / Math.hypot(hit.tx, hit.tz);
    if (Math.abs(along) < hs * 0.45) return false;
    this.rail = hit.rail;
    this.railSeg = hit.seg;
    this.railT = hit.t;
    this.railDir = along >= 0 ? 1 : -1;
    this.railSpeed = Math.max(2, Math.abs(along) + Math.max(0, -this.vel.y) * 0.2);
    this.railTime = 0;
    this.railBalance = (this.rand() - 0.5) * 0.3;
    this.railBalVel = 0;
    // body angle relative to the rail decides 50-50 vs slide
    const bodyFwd = _t.set(0, 0, 1).applyQuaternion(this.state === 'air' ? this.airQ : this.bodyQ);
    const rx = hit.tx * this.railDir, rz = hit.tz * this.railDir;
    const c = Math.abs((bodyFwd.x * rx + bodyFwd.z * rz) / Math.max(1e-3, Math.hypot(bodyFwd.x, bodyFwd.z) * Math.hypot(rx, rz)));
    this.railSlide = c < 0.6 || input.spin !== 0;
    const kindName = hit.rail.kind === 'box' ? 'Box' : hit.rail.kind === 'tube' ? 'Tube' : 'Rail';
    this.railName = this.railSlide ? `${kindName} Slide` : `50-50 ${kindName}`;
    if (this.state === 'air') {
      const c = Math.round(Math.abs(this.air.spinAccum) / (Math.PI / 2));
      if (c >= 1 && this.railSlide) this.railName = `${c * 90 + (c % 2 === 1 ? 0 : 0)} On ${this.railName}`;
    }
    this.railStartYaw = this.yaw;
    this.state = 'grind';
    this.pos.set(hit.x, hit.y, hit.z);
    this.events.push({ type: 'grindStart' });
    return true;
  }

  private grindStep(dt: number, input: SkierInput, world: PhysicsWorld) {
    const rail = this.rail!;
    const p = world.rails!.advance(rail, this.railSeg, this.railT, 0)!;
    const ty = p.ty * this.railDir;
    // gravity along the rail, metal friction
    const fric = rail.kind === 'box' ? 0.12 : 0.07;
    this.railSpeed += (-G * ty - fric * G - 0.004 * this.railSpeed * this.railSpeed) * dt;
    this.railTime += dt;
    // balance: an inverted pendulum the rider counter-steers
    const st = this.gear.stability;
    const wobble = (this.rand() - 0.5) * (1.6 + this.railSpeed * 0.06) * (1.3 - 0.6 * st);
    this.railBalVel += (this.railBalance * (2.2 - st) + wobble * 4 + clamp(input.steer, -1, 1) * 3.4) * dt;
    this.railBalVel *= 1 - Math.min(0.9, 2.2 * dt);
    this.railBalance += this.railBalVel * dt;
    const ended = this.railSpeed <= 0.4;
    const next = ended ? null : world.rails!.advance(rail, this.railSeg, this.railT, this.railDir * this.railSpeed * dt);
    const quality = clamp(1 - Math.abs(this.railBalance), 0, 1);
    if (Math.abs(this.railBalance) > 1) {
      this.endGrind(world, 'bail');
      return;
    }
    if (!next || input.jump) {
      this.endGrind(world, input.jump ? 'pop' : 'end');
      return;
    }
    this.railSeg = next.seg; this.railT = next.t;
    this.pos.set(next.x, next.y, next.z);
    this.vel.set(next.tx * this.railDir * this.railSpeed, next.ty * this.railDir * this.railSpeed, next.tz * this.railDir * this.railSpeed);
    // pose: slides sideways, 50-50 along the rail, leaning with the balance
    const ryaw = Math.atan2(next.tx * this.railDir, next.tz * this.railDir);
    this.yaw = this.railSlide ? ryaw + Math.PI / 2 : ryaw;
    this.normal.set(0, 1, 0);
    this.groundQuat(this.bodyQ, UP);
    this.lean = lerp(this.lean, this.railBalance * 0.7, damp(10, dt));
    this.crouch = lerp(this.crouch, 0.45, damp(6, dt));
    void quality;
  }

  private endGrind(world: PhysicsWorld, how: 'bail' | 'pop' | 'end') {
    const seconds = this.railTime;
    const quality = clamp(1 - Math.abs(this.railBalance), 0, 1);
    const full = how !== 'bail' && this.rail ? 1 : 0;
    const bonus = (this.railSlide ? 140 : 60) + full * 120 + (this.rail?.kind === 'rainbow' || this.rail?.kind === 'kinked' ? 150 : 0) + (this.railName.includes(' On ') ? 200 : 0);
    this.events.push({ type: 'grindEnd', grind: { name: this.railName, seconds, quality, bonus: how === 'bail' ? 0 : bonus }, reason: how });
    this.railCooldown = 0.35;
    this.rail = null;
    if (how === 'bail') {
      // fall off the side
      _t.set(-this.vel.z, 0, this.vel.x).normalize().multiplyScalar(Math.sign(this.railBalance) * 2.5);
      this.vel.add(_t);
      if (this.speed > 4.5) { this.crash('Lost balance on the rail'); return; }
    }
    if (how === 'pop') this.vel.y += 3.6 * (0.85 + 0.3 * this.gear.jump);
    else this.vel.y += 0.6;
    this.yaw = Math.atan2(this.vel.x, this.vel.z) + (this.railSlide && how !== 'bail' ? 0 : 0);
    this.switchRiding = false;
    this.leaveGround(world, false);
    if (this.railSlide) {
      // keep the slide orientation; rider must spin out to land straight
      this.airQ.copy(this.bodyQ);
    }
    void world;
  }

  // ---------------------------------------------------------------- crash
  crash(reason: string) {
    if (this.state === 'crashed' || this.state === 'recover') return;
    this.state = 'crashed';
    this.crashT = 0;
    this.rail = null;
    const sp = this.speed;
    this.crashSpin.set((this.rand() - 0.5) * 2, (this.rand() - 0.5) * 2, (this.rand() - 0.5) * 2).normalize().multiplyScalar(2 + sp * 0.35);
    this.events.push({ type: 'crash', v: sp, reason });
    this.grab = 0; this.grabAmt = 0;
  }

  private crashStep(dt: number, world: PhysicsWorld) {
    const T = world.terrain;
    this.crashT += dt;
    if (this.externalCrash) {
      // a ragdoll owns the body; we only decide when to get up
      if ((this.crashT > 1.3 && this.speed < 1.2) || this.crashT > 5) {
        this.state = 'recover';
        this.crashT = 0;
        T.normal(this.pos.x, this.pos.z, _m);
        this.yaw = Math.atan2(_m.x, _m.z) + Math.PI / 2;
        this.normal.set(_m.x, _m.y, _m.z);
        this.groundQuat(this.recoverFrom);
        this.vel.set(0, 0, 0);
      }
      return;
    }
    const v = this.vel;
    const hg = T.height(this.pos.x, this.pos.z) + 0.25;
    if (this.pos.y > hg + 0.4) {
      // tumbling through the air (off a cliff / big impact)
      v.y -= G * dt;
      this.pos.addScaledVector(v, dt);
      const h2 = T.height(this.pos.x, this.pos.z) + 0.25;
      if (this.pos.y < h2) this.pos.y = h2;
    } else {
      // sliding / rolling on the snow: tangential gravity vs heavy body friction
      T.normal(this.pos.x, this.pos.z, _m);
      const n = this.normal.set(_m.x, _m.y, _m.z);
      v.addScaledVector(n, -v.dot(n));
      _t.set(0, -G, 0).addScaledVector(n, G * n.y);
      v.addScaledVector(_t, dt);
      const sp = v.length();
      const dec = (0.75 * G * Math.max(0.2, n.y) + 0.06 * sp * sp + 0.3 * sp) * dt;
      if (sp > 0) v.multiplyScalar(Math.max(0, sp - dec) / sp);
      this.pos.addScaledVector(v, dt);
      this.pos.y = T.height(this.pos.x, this.pos.z) + 0.25;
      this.crashSpin.multiplyScalar(1 - Math.min(0.9, 2.5 * dt));
    }
    const w = this.crashSpin.length();
    if (w > 1e-3) {
      _q.setFromAxisAngle(_t.copy(this.crashSpin).multiplyScalar(1 / w), w * dt);
      this.bodyQ.premultiply(_q).normalize();
    }
    this.keepInBounds(world);
    // on very steep faces the body keeps sliding; recover once slow (or after a while)
    if ((this.crashT > 1.3 && this.speed < 1.2) || this.crashT > 5) {
      this.state = 'recover';
      this.crashT = 0;
      this.recoverFrom.copy(this.bodyQ);
      T.normal(this.pos.x, this.pos.z, _m);
      // stand up facing across the fall line so we don't immediately slide away
      this.yaw = Math.atan2(_m.x, _m.z) + Math.PI / 2;
      this.vel.set(0, 0, 0);
    }
  }

  private recoverStep(dt: number, world: PhysicsWorld) {
    const T = world.terrain;
    this.crashT += dt;
    this.pos.y = T.height(this.pos.x, this.pos.z);
    T.normal(this.pos.x, this.pos.z, _m);
    this.normal.set(_m.x, _m.y, _m.z);
    const target = this.groundQuat(_q);
    const k = clamp(this.crashT / 0.9, 0, 1);
    this.bodyQ.slerpQuaternions(this.recoverFrom, target, k * k * (3 - 2 * k));
    this.crouch = 1 - k * 0.7;
    if (k >= 1) {
      this.state = 'ride';
      this.vel.set(0, 0, 0);
      this.events.push({ type: 'recovered' });
    }
  }

  // ---------------------------------------------------------------- misc
  private checkObstacles(world: PhysicsWorld) {
    if (!world.obstacles) return;
    const o = world.obstacles.hit(this.pos.x, this.pos.z, 0.32);
    if (!o) return;
    const dx = this.pos.x - o.x, dz = this.pos.z - o.z;
    const d = Math.hypot(dx, dz) || 1;
    const nx = dx / d, nz = dz / d;
    const vin = -(this.vel.x * nx + this.vel.z * nz);
    if (vin <= 0) return;
    if (vin > 5.5) {
      this.events.push({ type: 'collide', v: vin, reason: o.kind });
      this.crash(o.kind === 'tree' ? 'Hit a tree' : o.kind === 'rock' ? 'Hit a rock' : 'Collision');
      this.vel.x += nx * vin * 0.6; this.vel.z += nz * vin * 0.6;
      return;
    }
    // soft bump: remove the inward component and push out
    this.vel.x += nx * vin * 1.1; this.vel.z += nz * vin * 1.1;
    const push = 0.32 + o.r - d;
    if (push > 0) { this.pos.x += nx * push; this.pos.z += nz * push; }
    this.events.push({ type: 'collide', v: vin, reason: o.kind });
  }

  private keepInBounds(world: PhysicsWorld) {
    const T = world.terrain;
    const minX = T.x0 + 20, maxX = T.maxX - 20, minZ = T.z0 + 20, maxZ = T.maxZ - 20;
    if (this.pos.x < minX) { this.pos.x = minX; this.vel.x = Math.max(0, this.vel.x); }
    if (this.pos.x > maxX) { this.pos.x = maxX; this.vel.x = Math.min(0, this.vel.x); }
    if (this.pos.z < minZ) { this.pos.z = minZ; this.vel.z = Math.max(0, this.vel.z); }
    if (this.pos.z > maxZ) { this.pos.z = maxZ; this.vel.z = Math.min(0, this.vel.z); }
  }
}

function remainderTo(a: number, unit: number): number {
  const target = Math.round(a / unit) * unit;
  return target - a;
}

/** Quaternion from orthonormal basis vectors (x, y, z columns). */
export function quatFromBasis(out: Quaternion, x: Vector3, y: Vector3, z: Vector3): Quaternion {
  const m11 = x.x, m12 = y.x, m13 = z.x;
  const m21 = x.y, m22 = y.y, m23 = z.y;
  const m31 = x.z, m32 = y.z, m33 = z.z;
  const tr = m11 + m22 + m33;
  if (tr > 0) {
    const s = 0.5 / Math.sqrt(tr + 1.0);
    out.set((m32 - m23) * s, (m13 - m31) * s, (m21 - m12) * s, 0.25 / s);
  } else if (m11 > m22 && m11 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
    out.set(0.25 * s, (m12 + m21) / s, (m13 + m31) / s, (m32 - m23) / s);
  } else if (m22 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
    out.set((m12 + m21) / s, 0.25 * s, (m23 + m32) / s, (m13 - m31) / s);
  } else {
    const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
    out.set((m13 + m31) / s, (m23 + m32) / s, 0.25 * s, (m21 - m12) / s);
  }
  return out.normalize();
}
