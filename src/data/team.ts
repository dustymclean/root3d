export type Claim = {
  text: string;
  /** Claims we have not yet confirmed. Shown with a "pending review" tag until the consultant signs off. */
  needsReview?: boolean;
};

export type Consultant = {
  slug: string;
  name: string;
  title: string;
  photo: string;
  photoPosition?: string;
  summary: string;
  background: Claim[];
  specialties: string[];
  focus: string;
  bookable: boolean;
};

export const team: Consultant[] = [
  {
    slug: 'joel-perkins',
    name: 'Joel Perkins',
    title: 'Executive Consultant · Supply Chain Architect',
    photo: 'team/joel-perkins.jpg',
    summary:
      'Blends formulation chemistry with high-volume operations to shorten grow cycles, protect margins, and strengthen compliance. Treats each facility like a live lab, testing compliant process tweaks that lift yield and customer pull.',
    background: [
      { text: 'Head of Operations, Lake Leaf Cultivation (Mille Lacs Band of Ojibwe, MN): 50,000 sq ft vertically integrated operation', needsReview: true },
      { text: 'Founded a biological fermentation fertilizer line used by Humboldt growers and Driscoll’s', needsReview: true },
      { text: 'Built Valley of Fire Distribution (Bofloral US)', needsReview: true },
      { text: 'Six years as Division Head at Wilbur-Ellis', needsReview: true },
      { text: 'COO, Primordial Solutions; operations work with Oasis Cannabis (NV)', needsReview: true },
      { text: 'Ran Sespe Creek Collective, serving 10,000+ patients', needsReview: true },
      { text: 'Creator of Cowbell Cow Mag', needsReview: true },
    ],
    specialties: [
      'Potassium and calcium acetate nutrient technology',
      'Fertigation and nutrient formulation',
      'Low heavy-metal input sourcing',
      'Genetics and distribution strategy',
      'Margin and liquidity planning',
    ],
    focus: 'Inputs, chemistry, and margins',
    bookable: true,
  },
  {
    slug: 'danny-davis',
    name: 'Danny Davis',
    title: 'Head Cultivator · Facility Engineer',
    photo: 'team/danny-davis.jpg',
    photoPosition: 'center 20%',
    summary:
      'Premium indoor cultivation lead combining environmental control, team leadership, and tech integration. Designs practical adjustments when conditions shift so the crop, and the inspectors, stay happy.',
    background: [
      { text: 'U.S. Army combat medic, Expert Field Medical Badge' },
      { text: 'Cisco CCNA Security' },
      { text: 'Owner, Manna Holdings LLC (Farming Manna): veteran-owned Mississippi operator with clean inspections' },
      { text: 'Genetics work in Barcelona across 650 cultivars' },
    ],
    specialties: [
      'Irrigation and plumbing design',
      'Tissue culture and bio-security',
      'Facility security and network hardening',
      'Rapid prototyping',
      'Team culture and mentoring',
    ],
    focus: 'Canopy, plumbing, and training',
    bookable: true,
  },
  {
    slug: 'dusty-mclean',
    name: 'Dusty McLean',
    title: 'Systems Architect · Compliance & OSINT',
    photo: 'team/dusty-mclean.jpg',
    photoPosition: 'center 10%',
    summary:
      'Translates cannabis regulations into workable systems: filings, inspection-ready SOPs, seed-to-sale documentation, and the data pipelines that keep operators audit-ready without slowing them down.',
    background: [
      { text: 'A.S., IT & Communication Systems' },
      { text: 'Mississippi Notary Public' },
      { text: 'USDA-licensed hemp producer' },
      { text: 'Managing partner, OBWS' },
      { text: 'Founder, Pixie’s Pantry and Pixie’s Distribution' },
      { text: 'Author, OnlySecurity course' },
    ],
    specialties: [
      'Licensing filings and SOP development',
      'Seed-to-sale documentation systems',
      'Sensor alerts and automation',
      'B2B portals, storefronts, and data feeds',
      'Total THC calculations and lab data review',
    ],
    focus: 'Data, alerts, and storefronts',
    bookable: true,
  },
];

export const findConsultant = (slug: string) => team.find((c) => c.slug === slug);
