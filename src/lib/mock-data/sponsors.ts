export type SponsorTier = "Title" | "Platinum" | "Gold" | "Silver" | "Community";

export type Sponsor = {
  id: string;
  name: string;
  tier: SponsorTier;
  logoUrl?: string;
  website?: string;
};

export const sponsors: Sponsor[] = [
  {
    id: "spn_1",
    name: "Sponsor Alpha",
    tier: "Title",
    website: "https://example.com",
  },
  {
    id: "spn_2",
    name: "Sponsor Beta",
    tier: "Platinum",
    website: "https://example.com",
  },
  {
    id: "spn_3",
    name: "Sponsor Gamma",
    tier: "Platinum",
    website: "https://example.com",
  },
  {
    id: "spn_4",
    name: "Sponsor Delta",
    tier: "Gold",
    website: "https://example.com",
  },
  {
    id: "spn_5",
    name: "Sponsor Epsilon",
    tier: "Gold",
    website: "https://example.com",
  },
  {
    id: "spn_6",
    name: "Sponsor Zeta",
    tier: "Silver",
    website: "https://example.com",
  },
  {
    id: "spn_7",
    name: "Sponsor Eta",
    tier: "Silver",
    website: "https://example.com",
  },
  {
    id: "spn_8",
    name: "Sponsor Theta",
    tier: "Silver",
    website: "https://example.com",
  },
  {
    id: "spn_9",
    name: "Community Partner 1",
    tier: "Community",
    website: "https://example.com",
  },
  {
    id: "spn_10",
    name: "Community Partner 2",
    tier: "Community",
    website: "https://example.com",
  },
];
