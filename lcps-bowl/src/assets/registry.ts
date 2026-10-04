/**
 * Authoritative registry of the supplied correction-pack assets.
 * Every entry maps an ORIGINAL supplied file to the copied project file and the SHA-256 of the original bytes
 * (from the pack's SHA256SUMS.txt). tests/assets.test.ts re-hashes the copied files against these values.
 */
export interface GearAsset { itemId: string; name: string; slot: 'helmet' | 'pads'; source: string; path: string; sha256: string }
export interface LogoAsset { teamId: string; source: string; path: string; sha256: string }

export const GEAR_ASSETS: GearAsset[] = [
  { itemId: 'speedflex', name: 'SPEEDFLEX', slot: 'helmet', source: 'gear/25C53D5B-3475-4BED-B326-2FB03A0A5B5C.jpeg', path: 'assets/gear/speedflex.jpeg', sha256: 'd5370c4fa9a6fe5ba1c10ab96d15bd01753d8aa467f9cc3c5a440efd273ffeda' },
  { itemId: 'f7', name: 'F7', slot: 'helmet', source: 'gear/3A6EFFAB-8FD9-42AD-9E99-162ADC973A56.jpeg', path: 'assets/gear/f7.jpeg', sha256: 'a0091fbc7cf868394199ccdc6cc5d07f77f28a5ae94f59dbe6cc781317b71615' },
  { itemId: 'vicis-zero2', name: 'VICIS ZERO2', slot: 'helmet', source: 'gear/94A2F4DE-7730-423A-ABBB-C8CAB722B78D.jpeg', path: 'assets/gear/vicis-zero2.jpeg', sha256: '5089e07f8a7a678cdff6d837f984ab13a8f642d264248f9235e1b9cc8cc316c2' },
  { itemId: 'vicis-zero2-trench', name: 'VICIS ZERO2 TRENCH', slot: 'helmet', source: 'gear/0A2D9EEB-F7B5-4504-8F92-1EBF914501F9.jpeg', path: 'assets/gear/vicis-zero2-trench.jpeg', sha256: '21c2b34a656984138fa4173057027f9dc2445cd9a9ecf76958135ab8a7f364f2' },
  { itemId: 'x-flex-pads', name: 'X-FLEX PADS', slot: 'pads', source: 'gear/16961CB2-D683-4D8C-9AEE-5D01AF1D0307(1).jpeg', path: 'assets/gear/x-flex-pads.jpeg', sha256: '870eeee3cf324c0690cea6aa9ed13babd073580f60f2a6e4a58a4b610715bfb4' },
  { itemId: 'vicis-elite-pads', name: 'VICIS ELITE PADS', slot: 'pads', source: 'gear/EB908341-A1CF-42CD-969F-D48411E0B595(1).jpeg', path: 'assets/gear/vicis-elite-pads.jpeg', sha256: '59a7b02b64ff2aec1a2db465b32d92f5434233db4fa35cf02e0547b86af319be' },
  { itemId: 'battle-pads', name: 'BATTLE PADS', slot: 'pads', source: 'gear/08D2B271-8C9B-48C7-BEF3-28256D1519C6(1).jpeg', path: 'assets/gear/battle-pads.jpeg', sha256: '635ad5684db71f80ce50bb6b13efc8e2ed53fda72fba567f12d240effd63874d' },
  { itemId: '2-in-1-pads', name: '2-IN-1 PADS', slot: 'pads', source: 'gear/738AF0EB-3B68-4A96-8C89-3CC9D191C8E4(1).jpeg', path: 'assets/gear/2-in-1-pads.jpeg', sha256: '25e4075b0e786ef7298566808d0af2e845e0ccb73c3655248934104a64be7a8f' },
];

const L = (teamId: string, sha256: string): LogoAsset => ({ teamId, source: `logos/${teamId}.png`, path: `assets/teams/${teamId}/logo.png`, sha256 });
export const LOGO_ASSETS: LogoAsset[] = [
  L('briar-woods', '241447312fdaf8bdb2f045e7b4e507afe28d223c7005b4cefdea5bdf058901cb'),
  L('broad-run', '202e2b54bef72e4baa6934c75880c946e630cd1304091954d91fcf8b14211e77'),
  L('dominion', '7904fd9730940789eb42a4252b419229a4a19e8b4c88b1c88c3838504ae964cd'),
  L('freedom', '212bce504a6bc422b0bfd4cd2f326c16b306d871757ef9e8486fc4367da8bf70'),
  L('heritage', '8427ec5d18c8c2623330761c2741a1c50b4f52e920fafaebf1d7a2a043e7c2d0'),
  L('independence', 'e2cdcc14c6237578fdd8361c6d5aae304e587fa9be641f4b4da5b0967340bba6'),
  L('john-champe', 'ca77606dd472d30b5532cd29193e6c35d9cd6174246033fd8e802722cc40b63b'),
  L('lightridge', 'c192503b05fa60c4390269cabbd733f1e966bf6a7533768c222cd945fb1b7f5c'),
  L('loudoun-county', '24b33980f22a6b3d01e24f2232c768136145e00872abcdf80325a9ee5d44f8bc'),
  L('loudoun-valley', '06e822db6830200a8f3c421f0b3ce439d7b9cc99a33141e667085d0cc3677c0c'),
  L('park-view', '6e6e3b253415aa144d794f9cf475aa4f5938647fcbf51192ca498430b423ce41'),
  L('potomac-falls', '2b088a5e1afcbe350472b281def94ddc8654650848611d84158607fde46b3f1e'),
  L('riverside', 'ddb830ecc2e0bbf6cea5d40f08bc651b5637ef97be1c7e8abf1999c936ea6e09'),
  L('rock-ridge', '75ee4c833395ad287a97f1534a30264621d2972e87412e3c2e972acf198f593a'),
  L('stone-bridge', '199a345209c12898b2ab959da9d01261952b009f1773704e0c8ccc1b939fbd2e'),
  L('tuscarora', '12329b95701dbde64a7bf1519f1cc35990b39395c51ef94abe2762f6282197ae'),
  L('woodgrove', 'c47c6d71e67fe2086f5544f711a3b9b1d3b8a98daa9be2d25ad38cad2300c445'),
];

export const gearAsset = (itemId: string) => GEAR_ASSETS.find((g) => g.itemId === itemId);
export const logoAsset = (teamId: string) => LOGO_ASSETS.find((l) => l.teamId === teamId);
