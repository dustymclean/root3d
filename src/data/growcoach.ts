/** Grow Coach Connection: expert taxonomy, how sessions work, and the Gear Locker. */

/** The cannabis-centric taxonomy from the brief, plus the specialties our coaches cover. */
export const taxonomy = [
  'Aquaponics',
  'Living Soil',
  'KNF',
  'Commercial Hydro',
  'Tissue Culture',
  'IPM',
  'Irrigation',
  'Nutrient Formulation',
  'Genetics',
  'Compliance',
  'Lab Data',
  'Automation',
];

/** Used when the database is not connected. Mirrors 0003_v2.sql. */
export const growCoachExpertise: Record<string, string[]> = {
  'joel-perkins': ['Commercial Hydro', 'Living Soil', 'Nutrient Formulation', 'Genetics'],
  'danny-davis': ['Commercial Hydro', 'Living Soil', 'Tissue Culture', 'IPM', 'Irrigation'],
  'dusty-mclean': ['Compliance', 'Lab Data', 'Automation'],
};

export const howItWorks = [
  { title: 'Find your coach', text: 'Filter by growing style or problem, or switch on “Available today” for same-day help.' },
  { title: 'Book and pay securely', text: 'Pick a 15-minute quick call, a full hour, or the package with two follow-ups.' },
  { title: 'Fill your pre-call inbox', text: 'Upload high-resolution photos, video, lab results, schematics, and logs before the timer starts.' },
  { title: 'Meet in a private room', text: 'Your video room opens from your portal. Macro Mode magnifies the feed for close inspection.' },
  { title: 'Get your action plan', text: 'A session is not closed until your coach writes a plan with at least three concrete steps.' },
  { title: 'Follow up', text: 'Book a follow-up, message your coach, or upgrade to a package. Your history stays with you.' },
];

export const sessionFeatures = [
  { icon: 'Search', title: 'Searchable expert profiles', text: 'Every coach lists their specialties, background, and live availability.' },
  { icon: 'Zap', title: 'Same-day filter', text: 'Coaches who can take an urgent call today are flagged so you can find them fast.' },
  { icon: 'Upload', title: 'Pre-call inbox', text: 'Photos, video, lab results, and logs go to your coach before the session, not during it.' },
  { icon: 'ShieldCheck', title: 'Private video rooms', text: 'Each session gets its own room tied to your booking. Only you and your coach are invited.' },
  { icon: 'ZoomIn', title: 'Macro Mode', text: 'A 2.5× digital zoom for looking at trichomes, stomata, and pests. Zoom cannot add detail a camera did not capture, so pair it with sharp uploads.' },
  { icon: 'Timer', title: 'Timed sessions & extensions', text: 'At 50 minutes you can add 15 more for $25 without leaving the call.' },
  { icon: 'ClipboardCheck', title: 'Mandatory action plan', text: 'At least three actionable recommendations, saved to your portal and downloadable.' },
  { icon: 'Repeat', title: 'Follow-up packages', text: 'One hour plus two 30-minute follow-ups with the same coach for $300 (draft pricing).' },
] as const;

/** Practical, brand-neutral gear our coaches ask growers to have. Affiliate links, if added, will be disclosed. */
export const gearLocker = [
  {
    category: 'Inspection',
    items: [
      { name: '60× jeweler’s loupe', why: 'The cheapest way to read trichomes and spot mites before a call.' },
      { name: 'USB or phone-clip macro lens', why: 'Sharp close-ups for your pre-call inbox, far better than digital zoom.' },
      { name: 'Clip-on LED with neutral white light', why: 'Grow lights distort color. Neutral light shows real leaf symptoms.' },
    ],
  },
  {
    category: 'Measurement',
    items: [
      { name: 'Calibrated pH meter with calibration fluid', why: 'Most “deficiencies” we see are pH problems. Calibrate weekly.' },
      { name: 'EC / PPM meter', why: 'Know what you are feeding and what is coming out in runoff.' },
      { name: 'Temperature and humidity data logger', why: 'Overnight swings cause problems you will never see in person. Logs make them visible.' },
      { name: 'Infrared thermometer', why: 'Leaf surface temperature drives VPD more than room air does.' },
    ],
  },
  {
    category: 'Clean room basics',
    items: [
      { name: 'Dedicated footwear or shoe covers', why: 'Most pest outbreaks walk in on someone’s shoes.' },
      { name: 'Nitrile gloves and a sanitizer station', why: 'Simple biosecurity that prevents cross-contamination between rooms.' },
      { name: 'Sticky traps', why: 'Cheap early warning for flying pests. Check and log them weekly.' },
    ],
  },
  {
    category: 'Irrigation',
    items: [
      { name: '45° fittings instead of 90° elbows', why: 'Less friction loss, more even pressure, less strain on the pump.' },
      { name: 'Inline sediment filter', why: 'Protects emitters and solenoids from clogging.' },
      { name: 'Measuring cups at the drip line', why: 'Check that every emitter actually delivers the same volume.' },
    ],
  },
];
