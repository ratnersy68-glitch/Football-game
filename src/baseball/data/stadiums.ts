import type { Stadium } from '../core/types';

/**
 * Simplified ballparks inspired by the real MLB parks. Dimensions are approximate and
 * drive gameplay: the ball physics collides with these walls, so a 330-ft porch really
 * is easier to reach than a 415-ft alley. Edit freely.
 */
export const STADIUMS: Stadium[] = [
  // ---------------- AL EAST ----------------
  { id: 'camden', name: 'Oriole Park at Camden Yards', city: 'Baltimore', dims: [333, 376, 400, 373, 318], walls: [13, 13, 8, 10, 25], altitude: 30, foulWidth: 40, backstop: 58, wallColor: '#1e3d2a', seatColor: '#2d5a3c', feature: 'B&O Warehouse beyond right field' },
  { id: 'fenway', name: 'Fenway Park', city: 'Boston', dims: [310, 379, 390, 380, 302], walls: [37, 17, 17, 5, 3], wallZones: [{ from: -46, to: -14, h: 37 }], altitude: 20, foulWidth: 22, backstop: 60, wallColor: '#24533a', seatColor: '#2a6040', feature: 'The Green Monster (37-ft wall in left)' },
  { id: 'yankee', name: 'Yankee Stadium', city: 'New York', dims: [318, 399, 408, 385, 314], walls: [8, 8, 8, 8, 8], altitude: 55, foulWidth: 38, backstop: 52, wallColor: '#18263f', seatColor: '#1c3b74', feature: 'Short right-field porch' },
  { id: 'tropicana', name: 'Tropicana Field', city: 'St. Petersburg', dims: [315, 370, 404, 370, 322], walls: [11, 10, 9, 10, 11], altitude: 45, foulWidth: 42, backstop: 50, wallColor: '#1d3b66', seatColor: '#244d8a', roof: 'dome' },
  { id: 'rogers', name: 'Rogers Centre', city: 'Toronto', dims: [328, 368, 400, 359, 328], walls: [14, 12, 10, 12, 14], altitude: 250, foulWidth: 40, backstop: 60, wallColor: '#13366b', seatColor: '#1b4f9c', roof: 'retractable' },
  // ---------------- AL CENTRAL ----------------
  { id: 'ratefield', name: 'Rate Field', city: 'Chicago', dims: [330, 377, 400, 372, 335], walls: [8, 8, 8, 8, 8], altitude: 595, foulWidth: 40, backstop: 58, wallColor: '#1d1d1f', seatColor: '#1f3d2b' },
  { id: 'progressive', name: 'Progressive Field', city: 'Cleveland', dims: [325, 370, 405, 375, 325], walls: [19, 19, 9, 9, 9], altitude: 650, foulWidth: 36, backstop: 60, wallColor: '#1d3049', seatColor: '#2d4870', feature: '19-ft wall in left' },
  { id: 'comerica', name: 'Comerica Park', city: 'Detroit', dims: [345, 370, 412, 365, 330], walls: [7, 8, 8, 8, 8], altitude: 600, foulWidth: 44, backstop: 64, wallColor: '#1c2b3e', seatColor: '#26384f', feature: 'Deep center field' },
  { id: 'kauffman', name: 'Kauffman Stadium', city: 'Kansas City', dims: [347, 387, 410, 387, 347], walls: [8, 8, 8, 8, 8], altitude: 750, foulWidth: 45, backstop: 60, wallColor: '#1a3d6b', seatColor: '#1f5aa0', feature: 'Spacious, symmetrical outfield' },
  { id: 'target', name: 'Target Field', city: 'Minneapolis', dims: [339, 377, 404, 367, 328], walls: [8, 8, 8, 16, 23], altitude: 815, foulWidth: 38, backstop: 60, wallColor: '#1c2c45', seatColor: '#213a63', feature: '23-ft wall in right' },
  // ---------------- AL WEST ----------------
  { id: 'daikin', name: 'Daikin Park', city: 'Houston', dims: [315, 362, 409, 373, 326], walls: [21, 21, 10, 7, 7], wallZones: [{ from: -46, to: -16, h: 21 }], altitude: 45, foulWidth: 35, backstop: 49, wallColor: '#1b2a44', seatColor: '#2b3f66', roof: 'retractable', feature: 'Crawford Boxes in left' },
  { id: 'angel', name: 'Angel Stadium', city: 'Anaheim', dims: [347, 390, 396, 370, 350], walls: [8, 8, 8, 18, 18], altitude: 160, foulWidth: 42, backstop: 60, wallColor: '#183049', seatColor: '#25456b' },
  { id: 'sutter', name: 'Sutter Health Park', city: 'West Sacramento', dims: [330, 388, 403, 388, 325], walls: [8, 8, 8, 8, 8], altitude: 25, foulWidth: 34, backstop: 55, wallColor: '#1a3a2a', seatColor: '#21523a', feature: 'Intimate minor-league-sized park' },
  { id: 'tmobile', name: 'T-Mobile Park', city: 'Seattle', dims: [331, 378, 401, 381, 326], walls: [8, 8, 8, 8, 8], altitude: 20, foulWidth: 40, backstop: 60, wallColor: '#122b3a', seatColor: '#1a4b5c', roof: 'retractable', feature: 'Heavy marine air' },
  { id: 'globelife', name: 'Globe Life Field', city: 'Arlington', dims: [329, 372, 407, 374, 326], walls: [8, 8, 8, 8, 8], altitude: 550, foulWidth: 40, backstop: 50, wallColor: '#162a52', seatColor: '#213c74', roof: 'retractable' },
  // ---------------- NL EAST ----------------
  { id: 'truist', name: 'Truist Park', city: 'Atlanta', dims: [335, 385, 400, 375, 325], walls: [11, 11, 8, 16, 16], altitude: 1000, foulWidth: 38, backstop: 54, wallColor: '#182a48', seatColor: '#23406e', feature: 'Chop House in right' },
  { id: 'loandepot', name: 'loanDepot park', city: 'Miami', dims: [344, 386, 400, 387, 335], walls: [12, 12, 8, 8, 10], altitude: 10, foulWidth: 42, backstop: 47, wallColor: '#12293d', seatColor: '#1f6f8b', roof: 'retractable' },
  { id: 'citi', name: 'Citi Field', city: 'New York', dims: [335, 370, 408, 375, 330], walls: [8, 8, 8, 8, 8], altitude: 15, foulWidth: 42, backstop: 60, wallColor: '#141c2b', seatColor: '#1d3570' },
  { id: 'cbp', name: 'Citizens Bank Park', city: 'Philadelphia', dims: [329, 374, 401, 369, 330], walls: [11, 11, 6, 13, 13], altitude: 20, foulWidth: 40, backstop: 60, wallColor: '#1d2a3d', seatColor: '#2b4a7a', feature: 'Hitter-friendly bandbox' },
  { id: 'natspark', name: 'Nationals Park', city: 'Washington', dims: [337, 377, 402, 370, 335], walls: [8, 8, 8, 14, 14], altitude: 25, foulWidth: 40, backstop: 59, wallColor: '#1b2238', seatColor: '#1f2f62' },
  // ---------------- NL CENTRAL ----------------
  { id: 'wrigley', name: 'Wrigley Field', city: 'Chicago', dims: [355, 368, 400, 368, 353], walls: [12, 12, 12, 12, 12], altitude: 595, foulWidth: 24, backstop: 60, wallColor: '#24502b', seatColor: '#2a5f8a', feature: 'Ivy-covered brick walls; wind off the lake' },
  { id: 'gabp', name: 'Great American Ball Park', city: 'Cincinnati', dims: [328, 379, 404, 370, 325], walls: [12, 12, 8, 8, 8], altitude: 490, foulWidth: 38, backstop: 55, wallColor: '#1c1c1f', seatColor: '#8a2329', feature: 'Launching pad' },
  { id: 'amfam', name: 'American Family Field', city: 'Milwaukee', dims: [344, 371, 400, 374, 345], walls: [8, 8, 8, 8, 8], altitude: 635, foulWidth: 40, backstop: 56, wallColor: '#13243d', seatColor: '#1e3b6b', roof: 'retractable' },
  { id: 'pnc', name: 'PNC Park', city: 'Pittsburgh', dims: [325, 389, 399, 375, 320], walls: [6, 10, 10, 10, 21], altitude: 730, foulWidth: 36, backstop: 51, wallColor: '#1c1c1f', seatColor: '#2b2b2f', feature: '21-ft Clemente Wall; deep left-center' },
  { id: 'busch', name: 'Busch Stadium', city: 'St. Louis', dims: [336, 375, 400, 375, 335], walls: [8, 8, 8, 8, 8], altitude: 465, foulWidth: 42, backstop: 52, wallColor: '#183020', seatColor: '#9b1d26' },
  // ---------------- NL WEST ----------------
  { id: 'chase', name: 'Chase Field', city: 'Phoenix', dims: [330, 374, 407, 374, 334], walls: [8, 8, 25, 8, 8], altitude: 1080, foulWidth: 40, backstop: 50, wallColor: '#1f1f22', seatColor: '#6a1d2b', roof: 'retractable', feature: 'Center-field pool' },
  { id: 'coors', name: 'Coors Field', city: 'Denver', dims: [347, 390, 415, 375, 350], walls: [8, 8, 8, 14, 14], altitude: 5200, foulWidth: 44, backstop: 56, wallColor: '#1d2d22', seatColor: '#3c2b5c', feature: 'Mile-high thin air; huge outfield' },
  { id: 'dodger', name: 'Dodger Stadium', city: 'Los Angeles', dims: [330, 375, 395, 375, 330], walls: [4, 8, 8, 8, 4], altitude: 515, foulWidth: 46, backstop: 55, wallColor: '#142a52', seatColor: '#e0b53a', feature: 'Pitcher-friendly night air' },
  { id: 'petco', name: 'Petco Park', city: 'San Diego', dims: [336, 390, 396, 391, 322], walls: [8, 8, 8, 8, 8], altitude: 20, foulWidth: 42, backstop: 45, wallColor: '#2b2620', seatColor: '#1d3c63', feature: 'Western Metal Supply building in left' },
  { id: 'oracle', name: 'Oracle Park', city: 'San Francisco', dims: [339, 364, 391, 415, 309], walls: [8, 8, 8, 20, 24], altitude: 10, foulWidth: 40, backstop: 48, wallColor: '#1c2b22', seatColor: '#2b4c37', feature: 'Triples Alley in right-center; 24-ft arcade wall' },
];

export const STADIUM_BY_ID: Record<string, Stadium> = Object.fromEntries(STADIUMS.map((s) => [s.id, s]));

const ANGLES = [-45, -22.5, 0, 22.5, 45];

function interp(arr: readonly number[], angleDeg: number): number {
  const a = Math.max(-45, Math.min(45, angleDeg));
  for (let i = 0; i < 4; i++) {
    if (a <= ANGLES[i + 1]) {
      const t = (a - ANGLES[i]) / 22.5;
      // Cosine easing gives the outfield a rounded shape between the control points.
      const s = (1 - Math.cos(t * Math.PI)) / 2;
      return arr[i] + (arr[i + 1] - arr[i]) * s;
    }
  }
  return arr[4];
}

/** Distance from home plate to the outfield wall at a spray angle (deg). */
export function wallDistance(st: Stadium, angleDeg: number): number {
  return interp(st.dims, angleDeg);
}

/** Wall height at a spray angle (deg). */
export function wallHeight(st: Stadium, angleDeg: number): number {
  if (st.wallZones) for (const z of st.wallZones) if (angleDeg >= z.from && angleDeg <= z.to) return z.h;
  const a = Math.max(-45, Math.min(45, angleDeg));
  for (let i = 0; i < 4; i++) {
    if (a <= ANGLES[i + 1]) {
      const t = (a - ANGLES[i]) / 22.5;
      return st.walls[i] + (st.walls[i + 1] - st.walls[i]) * t;
    }
  }
  return st.walls[4];
}
