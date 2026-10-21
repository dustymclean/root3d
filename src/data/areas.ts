/** Service areas from the master brief. Each gets its own page at /services/:slug. */

export type Area = {
  slug: string;
  title: string;
  icon: 'ClipboardCheck' | 'Sprout' | 'Store' | 'FlaskConical' | 'Cpu' | 'Map';
  short: string;
  intro: string;
  problems: string[];
  deliverables: { title: string; text: string }[];
  /** Service ids from the services table that fit this area. */
  packages: string[];
  leads: string[];
  faqs: { q: string; a: string }[];
};

export const areas: Area[] = [
  {
    slug: 'facility-audits',
    title: 'Commercial Facility Audits',
    icon: 'ClipboardCheck',
    short: 'Pre-audit remediation: find and fix the failure points before an inspector does.',
    intro:
      'An unannounced inspection should be routine. We walk your facility the way a regulator, an engineer, and an auditor would, document what we find, and help you fix it in priority order. Mechanical, electrical, plumbing, sanitation, security, records, and inventory are reviewed together because they fail together.',
    problems: [
      'An inspection is coming and you do not know what the inspector will find',
      'Recurring mold, pests, or contamination you cannot trace',
      'Plant counts or inventory that do not match your tracking system',
      'Irrigation, HVAC, or electrical systems that are undersized or failing',
      'SOPs that exist on paper but not on the floor',
      'Camera, access-control, or network gaps',
    ],
    deliverables: [
      { title: 'MEP diagnostic report', text: 'Mechanical, electrical, and plumbing review covering airflow, drainage, surface integrity, and system capacity, with photos and priorities.' },
      { title: 'Mock inspection', text: 'A walk-through against your state’s rules with a written findings list and the evidence an inspector would expect to see.' },
      { title: 'Inventory reconciliation', text: 'Physical counts reconciled against Metrc, BioTrack, or your system of record, with variances explained and corrected.' },
      { title: 'Remediation plan', text: 'Each finding gets an owner, a fix, a cost estimate, and a re-check date.' },
    ],
    packages: ['mep-diagnostics', 'inventory-recon', 'tier-2'],
    leads: ['danny-davis', 'dusty-mclean', 'hunter-porter', 'joel-perkins'],
    faqs: [
      { q: 'Do you guarantee we will pass?', a: 'No one honest can. We find what we can, fix what you approve, and document it. The decision belongs to the regulator.' },
      { q: 'Can you work around our production schedule?', a: 'Yes. Most audits are planned around harvests and room turns, and some work can happen remotely from photos and records.' },
    ],
  },
  {
    slug: 'cultivation-processing',
    title: 'Cultivation & Processing',
    icon: 'Sprout',
    short: 'Canopy management, plant health, genetics, tissue culture, and post-harvest consistency.',
    intro:
      'Consistent harvests come from consistent systems. We work in the canopy with your team: room layout, environment, irrigation, IPM, genetics, and the post-harvest steps where quality is most often lost. Every recommendation is tested on a small scale first and written into your SOPs once it works.',
    problems: [
      'Yields or quality that swing from run to run',
      'Pest or pathogen pressure that keeps coming back',
      'Mother stock that is tired, infected, or undocumented',
      'Dry and cure problems that cost you potency, terpenes, or weight',
      'A new room or facility build that needs a plan from day one',
      'Staff turnover that resets your progress every few months',
    ],
    deliverables: [
      { title: 'Canopy & room plan', text: 'Layout, plant counts, environment targets, and a run calendar from clone to cure.' },
      { title: 'IPM program', text: 'Scouting routine, thresholds, approved controls, and a log your crew will keep.' },
      { title: 'Tissue culture lab build', text: 'Lab design, sterile workflow, media-prep training, and a clean-stock program for your genetics.' },
      { title: 'Cultivation SOPs & training', text: 'Room-by-room procedures and hands-on training so the process survives staff changes.' },
    ],
    packages: ['standard', 'tc-lab', 'tier-2'],
    leads: ['danny-davis', 'joel-perkins', 'hunter-porter'],
    faqs: [
      { q: 'Do you work with living soil and hydro?', a: 'Both. Our coaches work across commercial hydroponics, coco, living soil, and organic or KNF-style programs.' },
      { q: 'Will you take over our grow?', a: 'No. We advise, train, and help implement. Your team stays in control, and we make sure they understand why each change works.' },
    ],
  },
  {
    slug: 'dispensary-retail',
    title: 'Dispensary & Retail Operations',
    icon: 'Store',
    short: 'Inventory, staff training, product education, storefronts, and margins.',
    intro:
      'Retail is where every upstream decision becomes revenue or loss. We tighten inventory and reconciliation, train staff to explain products honestly, review hardware and product safety, and build the online and in-store systems that keep pricing, catalogs, and records accurate.',
    problems: [
      'Shrink and variances between the shelf and the tracking system',
      'Staff who cannot answer basic product or strain questions',
      'Catalogs, prices, and menus that drift out of sync',
      'Thin margins with no clear view of which products carry the store',
      'Consumption hardware with no safety documentation',
    ],
    deliverables: [
      { title: 'Inventory & reconciliation workflow', text: 'Receiving, counts, adjustments, and end-of-day procedures tied to your tracking system.' },
      { title: 'Staff product training', text: 'Cultivar characteristics, lab results, labeling, and honest product education.' },
      { title: 'Storefront & data feeds', text: 'Online menus, WooCommerce or B2B portals, and structured product data that stays accurate.' },
      { title: 'Margin review', text: 'Product mix, vendor terms, and pricing reviewed with your actual numbers.' },
    ],
    packages: ['standard', 'inventory-recon', 'tier-1'],
    leads: ['dusty-mclean', 'joel-perkins', 'danny-davis'],
    faqs: [
      { q: 'Which point-of-sale or tracking systems do you know?', a: 'We work from your system of record, including Metrc and BioTrack integrations. If we have not used your tool, we will say so and learn it on our time, not yours.' },
    ],
  },
  {
    slug: 'agriculture-formulation',
    title: 'Agriculture & Formulation',
    icon: 'FlaskConical',
    short: 'Nutrient programs, biological fertilizers, input sourcing, and heavy-metal risk reduction.',
    intro:
      'What goes into the root zone ends up in the lab report. We design feed programs around your cultivars and environment, evaluate biological and mineral inputs, and vet suppliers so contamination risk is managed before it reaches a test panel. Product developers get help with formulation, documentation, and getting to market.',
    problems: [
      'Deficiencies or lockouts that do not respond to the usual fixes',
      'Failed or borderline heavy-metal or microbial tests',
      'Input costs climbing without a matching improvement in results',
      'Suppliers who cannot document what is in the bag',
      'A product idea that needs formulation and a path to market',
    ],
    deliverables: [
      { title: 'Feed program', text: 'Stage-by-stage nutrition tuned to your cultivars, media, and water, with targets for EC, pH, and runoff.' },
      { title: 'Input & supplier review', text: 'Certificates of analysis, sourcing, and documentation checks for heavy-metal and microbial risk.' },
      { title: 'Biological program', text: 'Fermentation and microbial inputs that are brewed, applied, and logged consistently.' },
      { title: 'Product development support', text: 'Formulation, trial design, labeling review, and commercialization planning.' },
    ],
    packages: ['standard', 'tier-1', 'tier-2'],
    leads: ['joel-perkins', 'danny-davis'],
    faqs: [
      { q: 'Will a new feed program shorten my cycle?', a: 'Sometimes, but we do not promise it. We trial changes on a test block, measure the result, and only scale what works in your facility.' },
    ],
  },
  {
    slug: 'technology-systems',
    title: 'Technology & Business Systems',
    icon: 'Cpu',
    short: 'Websites, e-commerce, automation, sensor alerts, security, OSINT, and documentation.',
    intro:
      'Most operators run on a pile of spreadsheets, logins, and good intentions. We build the systems underneath: storefronts and B2B portals, structured product data, automations that move information where it needs to go, sensor alerts, secure networks, and research that is backed by sources you can check.',
    problems: [
      'Records spread across paper, spreadsheets, and someone’s phone',
      'A website or store that does not sell, or does not stay updated',
      'Environmental problems discovered the morning after',
      'Cameras, sensors, and laptops on one flat, exposed network',
      'Decisions about partners or suppliers made without real research',
    ],
    deliverables: [
      { title: 'Website & e-commerce build', text: 'WordPress, WooCommerce, or custom storefronts, plus B2B ordering portals.' },
      { title: 'Data & automation', text: 'Structured CSV and JSON catalogs, integrations, and automations that remove double entry.' },
      { title: 'Sensor alerts', text: 'Environmental data connected to alerts so the right person knows within minutes.' },
      { title: 'Security hardening', text: 'Network segmentation, secure remote access, and practical operational privacy.' },
      { title: 'OSINT & due diligence', text: 'Source-backed research reports on partners, suppliers, competitors, and regulations.' },
    ],
    packages: ['standard', 'tier-1'],
    leads: ['dusty-mclean', 'danny-davis', 'hunter-porter'],
    faqs: [
      { q: 'Do you only work with cannabis businesses?', a: 'No. Our systems work applies to any small business, and many of our tools came from agriculture and wholesale distribution.' },
    ],
  },
  {
    slug: 'multi-state',
    title: 'Multi-State Consulting',
    icon: 'Map',
    short: 'Regulatory gap analysis and expansion planning for operators crossing state lines.',
    intro:
      'Every state writes its own rules for licensing, testing, packaging, tracking, and advertising. We map what changes when you cross a border, compare it with how you operate today, and deliver a transition plan so a playbook that works in one market does not create violations in the next.',
    problems: [
      'Expanding into a new state without knowing what changes',
      'Different tracking systems, testing panels, and label rules per market',
      'SOPs written for one state being used in another',
      'Distribution or supply agreements that need to work across markets',
    ],
    deliverables: [
      { title: 'Regulatory gap analysis', text: 'A state-by-state matrix of rules that affect your operation, with citations and update dates.' },
      { title: 'Transition plan', text: 'What to change, in what order, with owners and timelines for each new market.' },
      { title: 'SOP localization', text: 'Your existing procedures adapted to each state’s requirements.' },
      { title: 'Distribution strategy', text: 'Supply, wholesale, and margin planning across markets.' },
    ],
    packages: ['mso-gap', 'priority'],
    leads: ['dusty-mclean', 'hunter-porter', 'joel-perkins'],
    faqs: [
      { q: 'Are you lawyers?', a: 'No. We research and operationalize the rules. For legal opinions and filings that require an attorney, we work alongside your counsel.' },
    ],
  },
];

export const findArea = (slug: string) => areas.find((a) => a.slug === slug);

/** Core consulting services listed in the brief. */
export const coreServices = [
  'Commercial cultivation and canopy management',
  'Agricultural formulations',
  'Biological fertilizers',
  'Genetics and tissue culture',
  'HVAC and environmental systems',
  'Irrigation engineering',
  'Microbial and heavy-metal risk reduction',
  'Cultivation and processing audits',
  'Inventory reconciliation',
  'Metrc workflows',
  'Dispensary operations',
  'Facility security',
  'Documentation and SOP development',
  'Regulatory research',
  'Multi-state expansion',
  'Business systems',
  'E-commerce',
  'Automation',
  'Technical OSINT',
  'Distribution and commercialization',
];
