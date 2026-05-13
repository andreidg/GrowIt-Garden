export interface FrostData {
  region: string;
  lastSpringFrost: string; // "May 14"
  firstFallFrost: string;  // "Sep 17"
  zone: string;            // "3b–4a"
}

export const FROST_DATA: Record<string, FrostData> = {
  Calgary:  { region: "Calgary",  lastSpringFrost: "May 14", firstFallFrost: "Sep 17", zone: "3b–4a" },
  Edmonton: { region: "Edmonton", lastSpringFrost: "May 23", firstFallFrost: "Sep 10", zone: "3a–4a" },
  "Red Deer": { region: "Red Deer", lastSpringFrost: "May 21", firstFallFrost: "Sep 12", zone: "3b" },
  Airdrie:  { region: "Airdrie",  lastSpringFrost: "May 18", firstFallFrost: "Sep 13", zone: "3b" },
  Cochrane: { region: "Cochrane", lastSpringFrost: "May 20", firstFallFrost: "Sep 11", zone: "3b" },
  Okotoks:  { region: "Okotoks",  lastSpringFrost: "May 13", firstFallFrost: "Sep 18", zone: "4a" },
};
