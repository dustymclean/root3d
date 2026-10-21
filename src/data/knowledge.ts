/**
 * Compliance Vault / Knowledge Base articles. Each one lists its sources and the date it was last reviewed.
 * Rules change: every article tells readers to confirm against the current regulation.
 */

export type Section = { h: string; p?: string[]; list?: string[] };
export type Article = {
  slug: string;
  title: string;
  category: 'Compliance' | 'Cultivation' | 'Facility' | 'Technology' | 'Business';
  jurisdiction: string;
  summary: string;
  updated: string;
  author: string;
  tags: string[];
  sections: Section[];
  sources: { label: string; url: string }[];
};

export const categories = ['Compliance', 'Cultivation', 'Facility', 'Technology', 'Business'] as const;

export const articles: Article[] = [
  {
    slug: 'total-thc-explained',
    title: 'Total THC: what it is and how to calculate it',
    category: 'Compliance',
    jurisdiction: 'Federal & multi-state',
    summary: 'Why labs report THCA separately, where the 0.877 factor comes from, and how to check a certificate of analysis yourself.',
    updated: '2026-10-21',
    author: 'dusty-mclean',
    tags: ['THC', 'THCA', 'lab results', 'hemp', 'COA', 'potency'],
    sections: [
      {
        h: 'The short version',
        p: [
          'Raw plant material contains mostly THCA, the acid form of THC. Heat converts THCA into Δ9-THC by removing a carboxyl group, a process called decarboxylation. Total THC estimates how much Δ9-THC the material could contain once that happens.',
          'The common formula is Total THC = (THCA × 0.877) + Δ9-THC.',
        ],
      },
      {
        h: 'Where 0.877 comes from',
        p: [
          'When THCA loses its carboxyl group as carbon dioxide, the molecule gets lighter. The molar mass of Δ9-THC (about 314.5 g/mol) divided by the molar mass of THCA (about 358.5 g/mol) is about 0.877. So one milligram of THCA can become at most about 0.877 milligrams of THC.',
        ],
      },
      {
        h: 'Checking a certificate of analysis',
        list: [
          'Confirm the sample ID and batch number match your records.',
          'Check that results are on the basis your rules require, usually dry weight for hemp.',
          'Recalculate Total THC from the THCA and Δ9-THC lines and compare with the lab’s total.',
          'Look for the lab’s measurement uncertainty. A result near a legal limit may be treated differently depending on how uncertainty is applied.',
          'Keep the COA with the batch record for as long as your rules require.',
        ],
      },
      {
        h: 'Why it matters for hemp',
        p: [
          'Under the federal hemp rule, a hemp sample is tested for total THC on a dry-weight basis, and material above the acceptable level must be remediated or disposed of under the rule’s procedures. Federal legislation enacted in November 2025 also changes the statutory hemp definition to a total-THC basis and limits THC in finished products, with an effective date in November 2026. Confirm the current status with USDA and your state before relying on any threshold.',
        ],
      },
      {
        h: 'Try it',
        p: ['Use the Total THC calculator in Resources to run the numbers from your own COA.'],
      },
    ],
    sources: [
      { label: 'USDA AMS: Hemp production program', url: 'https://www.ams.usda.gov/rules-regulations/hemp' },
      { label: 'eCFR: 7 CFR Part 990, Domestic Hemp Production Program', url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-IX/part-990' },
      { label: 'PubChem: Tetrahydrocannabinolic acid', url: 'https://pubchem.ncbi.nlm.nih.gov/compound/Tetrahydrocannabinolic-acid' },
      { label: 'PubChem: Dronabinol (Δ9-THC)', url: 'https://pubchem.ncbi.nlm.nih.gov/compound/Dronabinol' },
    ],
  },
  {
    slug: 'mississippi-medical-cannabis-overview',
    title: 'Mississippi Medical Cannabis Program: who regulates what',
    category: 'Compliance',
    jurisdiction: 'Mississippi',
    summary: 'A plain-language map of the agencies, license types, and tracking system behind Mississippi’s medical program.',
    updated: '2026-10-21',
    author: 'dusty-mclean',
    tags: ['Mississippi', 'MSDH', 'Department of Revenue', 'licensing', 'Metrc'],
    sections: [
      {
        h: 'The law',
        p: ['Mississippi’s medical program was created by the Mississippi Medical Cannabis Act, Senate Bill 2095, signed in February 2022.'],
      },
      {
        h: 'Who regulates what',
        list: [
          'Mississippi State Department of Health (MSDH): patients and practitioners, plus cultivation, processing, testing, transportation, and disposal businesses.',
          'Mississippi Department of Revenue (DOR): dispensaries.',
          'Each agency publishes its own regulations, application requirements, and fee schedules. Read both if you are vertically integrated.',
        ],
      },
      {
        h: 'Seed-to-sale tracking',
        p: ['The program uses a state seed-to-sale tracking system. Licensees are expected to record plants, packages, transfers, testing, and sales in it, and physical inventory has to match.'],
      },
      {
        h: 'Where operators get into trouble',
        list: [
          'SOPs that describe a process staff do not actually follow',
          'Plant counts or package weights that drift from the tracking system',
          'Visitor and access logs that are incomplete',
          'Waste that is not rendered unusable, witnessed, and recorded as required',
          'Advertising or labeling that does not match current rules',
        ],
      },
      {
        h: 'Before you rely on this',
        p: ['Regulations and guidance are updated regularly. Always confirm requirements on the agency sites below, and get legal advice for licensing decisions.'],
      },
    ],
    sources: [
      { label: 'Mississippi Medical Cannabis Program (MSDH)', url: 'https://www.mmcp.ms.gov/' },
      { label: 'Mississippi Department of Revenue', url: 'https://www.dor.ms.gov/' },
      { label: 'Mississippi Legislature bill status (search SB 2095, 2022 session)', url: 'https://billstatus.ls.state.ms.us/' },
    ],
  },
  {
    slug: 'seed-to-sale-basics',
    title: 'Seed-to-sale tracking without the panic',
    category: 'Compliance',
    jurisdiction: 'Multi-state',
    summary: 'How systems like Metrc and BioTrack work, and the daily habits that keep physical inventory and the system in agreement.',
    updated: '2026-10-21',
    author: 'dusty-mclean',
    tags: ['Metrc', 'BioTrack', 'inventory', 'reconciliation', 'tags'],
    sections: [
      {
        h: 'What the system expects',
        p: ['Most state tracking systems follow the same idea: every plant, batch, and package has an identity, and every change to it is recorded. Moves, weights, transfers, lab samples, waste, and sales all leave a record a regulator can audit.'],
      },
      {
        h: 'Daily habits that prevent variances',
        list: [
          'Record changes when they happen, not at the end of the week.',
          'Use one scale per station and log its calibration checks.',
          'Reconcile a small cycle count every day instead of a full count once a quarter.',
          'Investigate any variance the same day and write down what you found.',
          'Restrict who can make adjustments, and require a reason for each one.',
        ],
      },
      {
        h: 'When numbers do not match',
        p: ['Do not “fix” the system to match the shelf without a documented reason. Stop, count again with a second person, trace the last transactions on the item, and record the cause. Many rules require notifying the regulator of certain discrepancies within a set time, so know yours before you need it.'],
      },
    ],
    sources: [
      { label: 'Metrc', url: 'https://www.metrc.com/' },
      { label: 'Mississippi Medical Cannabis Program (MSDH)', url: 'https://www.mmcp.ms.gov/' },
    ],
  },
  {
    slug: 'hemp-production-basics',
    title: 'Hemp production: licensing, sampling, and what happens if a test is hot',
    category: 'Compliance',
    jurisdiction: 'Federal',
    summary: 'The federal hemp program in plain language, from licensing to pre-harvest sampling to remediation.',
    updated: '2026-10-21',
    author: 'dusty-mclean',
    tags: ['hemp', 'USDA', 'sampling', 'remediation', 'FSA'],
    sections: [
      {
        h: 'Licensing',
        p: ['Hemp producers are licensed either by USDA directly or under a state or tribal plan that USDA has approved. Your license tells you which plan’s rules you follow.'],
      },
      {
        h: 'Reporting',
        p: ['Producers report planting information, including lot locations, to the USDA Farm Service Agency. Keep copies of everything you file.'],
      },
      {
        h: 'Pre-harvest sampling',
        p: ['A sample has to be collected by an authorized sampler and tested at a qualifying lab within the window set by the rule before harvest. Plan harvest dates around the sampling window, not the other way around.'],
      },
      {
        h: 'If a lot tests above the limit',
        p: ['The rule provides for remediation, such as blending or removing and destroying flower material and retesting, or for disposal. Both have to be done and documented according to your plan. Talk to your licensing authority before you act.'],
      },
      {
        h: 'Watch for federal changes',
        p: ['Federal legislation enacted in November 2025 changes how hemp is defined, including counting THCA toward the limit and restricting THC in finished products, with an effective date in November 2026. Confirm how it applies to your crop and products.'],
      },
    ],
    sources: [
      { label: 'USDA AMS: Hemp production program', url: 'https://www.ams.usda.gov/rules-regulations/hemp' },
      { label: 'eCFR: 7 CFR Part 990', url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-IX/part-990' },
      { label: 'USDA Farm Service Agency', url: 'https://www.fsa.usda.gov/' },
    ],
  },
  {
    slug: 'heavy-metals-risk',
    title: 'Heavy metals: where they come from and how to keep them out',
    category: 'Cultivation',
    jurisdiction: 'General',
    summary: 'Cannabis readily takes up metals from its environment. Here is how to find and reduce the sources.',
    updated: '2026-10-21',
    author: 'joel-perkins',
    tags: ['heavy metals', 'lead', 'arsenic', 'cadmium', 'mercury', 'inputs', 'COA'],
    sections: [
      {
        h: 'Why cannabis is sensitive',
        p: ['Cannabis is efficient at pulling minerals, including metals, out of soil and water. It has even been studied for cleaning contaminated soil. That is a liability for a crop that will be consumed.'],
      },
      {
        h: 'What labs usually test',
        p: ['State panels commonly include arsenic, cadmium, lead, and mercury. Some states test more. Check your state’s panel and action limits.'],
      },
      {
        h: 'Common sources',
        list: [
          'Native soil, fill, or amendments from unknown origin',
          'Source water, especially well water',
          'Mined mineral inputs and some phosphate fertilizers',
          'Low-quality supplements and “organic” products without documentation',
          'Equipment: galvanized or soldered metal in contact with nutrient solution',
        ],
      },
      {
        h: 'Reducing risk',
        list: [
          'Ask every input supplier for a recent certificate of analysis that includes heavy metals.',
          'Test your source water and your media before the first run.',
          'Keep a supplier file with lot numbers so a bad result can be traced.',
          'Change one input at a time, so you can tell which one moved a result.',
        ],
      },
    ],
    sources: [
      { label: 'Mississippi Medical Cannabis Program (MSDH): testing rules', url: 'https://www.mmcp.ms.gov/' },
      { label: 'U.S. EPA: Private drinking water wells', url: 'https://www.epa.gov/privatewells' },
    ],
  },
  {
    slug: 'ipm-fundamentals',
    title: 'Integrated pest management that a crew will actually follow',
    category: 'Cultivation',
    jurisdiction: 'General',
    summary: 'Scouting, thresholds, identification, and the controls that keep you on the right side of your state’s pesticide list.',
    updated: '2026-10-21',
    author: 'danny-davis',
    tags: ['IPM', 'pests', 'russet mites', 'spider mites', 'powdery mildew', 'scouting'],
    sections: [
      {
        h: 'Prevention first',
        list: [
          'Quarantine new plants and cuttings before they enter production.',
          'Control entry: dedicated footwear, clean clothing, and room order from clean to dirty.',
          'Keep environment in range. Many pathogens follow humidity and stagnant air.',
        ],
      },
      {
        h: 'Scout on a schedule',
        p: ['Assign rooms and days. Check leaf undersides, new growth, and sticky traps, and log what you see even when it is nothing. A log of “clean” is what makes the first sighting meaningful.'],
      },
      {
        h: 'Identify before you spray',
        p: ['Russet and broad mites are too small to see clearly without magnification; a 60× loupe or a digital microscope helps. Twisted or glossy new growth with no visible pests is a reason to look closer, not a reason to guess. Get an identification before you choose a control.'],
      },
      {
        h: 'Controls and compliance',
        p: ['Only use products your state allows for cannabis, and record every application with product, lot, rate, area, and applicator. Residue testing will find what the log does not mention.'],
      },
    ],
    sources: [
      { label: 'U.S. EPA: Introduction to Integrated Pest Management', url: 'https://www.epa.gov/ipm/introduction-integrated-pest-management' },
      { label: 'UC IPM: University of California Statewide IPM Program', url: 'https://ipm.ucanr.edu/' },
    ],
  },
  {
    slug: 'irrigation-friction-loss',
    title: 'Why your far emitters starve: friction loss and the 45-degree rule',
    category: 'Facility',
    jurisdiction: 'General',
    summary: 'Every fitting costs pressure. How to lay out irrigation so the last plant gets what the first one does.',
    updated: '2026-10-21',
    author: 'danny-davis',
    tags: ['irrigation', 'plumbing', 'pressure', 'pumps', 'fittings', '45 degree'],
    sections: [
      {
        h: 'The problem',
        p: ['Water loses pressure to friction as it moves through pipe and especially through fittings. Sharp turns cause turbulence. Add enough of them and the plants at the end of a line get less water and nutrient than the ones near the pump.'],
      },
      {
        h: 'The 45-degree rule',
        p: ['Where a run needs to change direction, a long-sweep bend or a pair of 45-degree fittings usually loses less pressure than a single short-radius 90-degree elbow. Fewer abrupt turns means more even delivery and less work for the pump.'],
      },
      {
        h: 'Other checks',
        list: [
          'Size main lines for your peak flow, not your average.',
          'Loop or center-feed long runs so pressure is balanced.',
          'Use pressure-compensating emitters where elevation or run length varies.',
          'Measure: catch emitter output in cups across the room and compare volumes.',
          'Install a pressure gauge after the filter, and log the reading.',
        ],
      },
    ],
    sources: [
      { label: 'USDA NRCS National Engineering Handbook, Part 623: Irrigation', url: 'https://directives.nrcs.usda.gov/' },
    ],
  },
  {
    slug: 'tissue-culture-basics',
    title: 'Tissue culture basics for cannabis operators',
    category: 'Cultivation',
    jurisdiction: 'General',
    summary: 'What a tissue culture program does, what a small lab needs, and why clean stock matters.',
    updated: '2026-10-21',
    author: 'danny-davis',
    tags: ['tissue culture', 'micropropagation', 'clean stock', 'HLVd', 'genetics', 'lab'],
    sections: [
      {
        h: 'Why operators invest in it',
        p: ['Mother plants accumulate pests, pathogens, and viroids over time. Tissue culture lets you keep genetics in small sterile vessels, test them, and regenerate clean plants, which protects a library of cultivars in far less space.'],
      },
      {
        h: 'The stages',
        list: ['Initiation: a small piece of clean tissue is placed on sterile media.', 'Multiplication: shoots are divided and grown on.', 'Rooting: shoots are moved to media that encourages roots.', 'Acclimatization: plantlets are hardened off for the grow room.'],
      },
      {
        h: 'What a starter lab needs',
        list: ['A clean room with controlled entry', 'A laminar flow hood', 'A way to sterilize media and tools, such as an autoclave or pressure sterilizer', 'Media ingredients and a log for every batch', 'Shelving with controlled light and temperature', 'Training in aseptic technique, which matters more than any equipment'],
      },
      {
        h: 'Testing',
        p: ['Pair the program with pathogen testing, such as for hop latent viroid, so the stock you preserve is actually clean.'],
      },
    ],
    sources: [
      { label: 'Murashige & Skoog (1962), Physiologia Plantarum', url: 'https://doi.org/10.1111/j.1399-3054.1962.tb08052.x' },
    ],
  },
  {
    slug: 'vpd-basics',
    title: 'Vapor pressure deficit (VPD) in plain language',
    category: 'Cultivation',
    jurisdiction: 'General',
    summary: 'Temperature and humidity together decide how hard a plant transpires. Here is how to read VPD.',
    updated: '2026-10-21',
    author: 'danny-davis',
    tags: ['VPD', 'humidity', 'temperature', 'environment', 'HVAC'],
    sections: [
      {
        h: 'What it is',
        p: ['VPD is the difference between how much moisture the air could hold at a given temperature and how much it actually holds. Higher VPD pulls water from leaves faster; lower VPD slows transpiration and can favor mold.'],
      },
      {
        h: 'How it is calculated',
        p: ['Saturation vapor pressure (kPa) ≈ 0.6108 × e^(17.27 × T ÷ (T + 237.3)), where T is in °C. VPD = saturation pressure × (1 − RH ÷ 100). Using leaf temperature instead of air temperature gives a better picture of what the plant feels.'],
      },
      {
        h: 'Using it',
        p: ['Targets vary by stage and cultivar. Watch the trend overnight as well as during the day; many problems start when lights go off and humidity spikes. The VPD calculator in Resources will run the numbers.'],
      },
    ],
    sources: [
      { label: 'FAO Irrigation and Drainage Paper 56, Chapter 3 (vapor pressure equations)', url: 'https://www.fao.org/4/x0490e/x0490e07.htm' },
    ],
  },
  {
    slug: 'writing-sops-that-work',
    title: 'Writing SOPs that survive an inspection and a shift change',
    category: 'Business',
    jurisdiction: 'General',
    summary: 'The parts every SOP needs, and how to keep procedures from going stale.',
    updated: '2026-10-21',
    author: 'dusty-mclean',
    tags: ['SOP', 'documentation', 'training', 'records', 'inspection'],
    sections: [
      {
        h: 'The parts',
        list: ['Purpose: why the procedure exists', 'Scope: where and to whom it applies', 'Responsibilities: who does it and who checks it', 'Procedure: numbered steps in the order they happen', 'Records: what gets written down, where, and for how long', 'References: the rules it satisfies', 'Revision history: who changed what, and when'],
      },
      {
        h: 'Make it real',
        list: ['Write it with the person who does the job.', 'Walk the floor with the draft and fix every step that does not match reality.', 'Train on it, and keep a signed training record.', 'Review it on a schedule and whenever a rule changes.'],
      },
      {
        h: 'Start faster',
        p: ['The free SOP Generator in Resources builds an editable starting draft from your business type and state. Have it reviewed before you use it.'],
      },
    ],
    sources: [{ label: 'Mississippi Medical Cannabis Program (MSDH)', url: 'https://www.mmcp.ms.gov/' }],
  },
  {
    slug: 'facility-network-security',
    title: 'Network security for cultivation facilities',
    category: 'Technology',
    jurisdiction: 'General',
    summary: 'Cameras, sensors, and controllers are computers. Simple steps to keep them from becoming the way in.',
    updated: '2026-10-21',
    author: 'danny-davis',
    tags: ['security', 'network', 'cameras', 'IoT', 'MFA', 'VPN', 'Cloudflare'],
    sections: [
      {
        h: 'The usual weak spots',
        list: ['Cameras and controllers still using default passwords', 'Everything on one flat network with the office laptops', 'Remote access through ports opened on the router', 'Shared logins nobody can account for', 'No offline backup of surveillance and records'],
      },
      {
        h: 'Practical fixes',
        list: ['Put cameras, sensors, and controllers on their own network segment.', 'Change every default password and keep an inventory of devices.', 'Use a VPN or a zero-trust tunnel for remote access instead of open ports.', 'Turn on multi-factor authentication for email, tracking systems, and banking.', 'Back up records and footage on a schedule, and test a restore.'],
      },
    ],
    sources: [
      { label: 'CISA: Cyber Essentials', url: 'https://www.cisa.gov/resources-tools/resources/cyber-essentials' },
      { label: 'NIST: Small Business Cybersecurity Corner', url: 'https://www.nist.gov/itl/smallbusinesscyber' },
    ],
  },
  {
    slug: 'dry-and-cure',
    title: 'Dry and cure: protecting the harvest you already grew',
    category: 'Cultivation',
    jurisdiction: 'General',
    summary: 'Where weight, potency, and terpenes get lost after harvest, and how to measure the process.',
    updated: '2026-10-21',
    author: 'danny-davis',
    tags: ['dry', 'cure', 'post-harvest', 'water activity', 'terpenes', 'mold'],
    sections: [
      {
        h: 'What goes wrong',
        p: ['Drying too fast locks in harshness and drives off terpenes. Drying too slow or too wet invites mold and microbial failures. Both are common and both are preventable.'],
      },
      {
        h: 'Measure it',
        list: ['Log room temperature and humidity throughout the dry.', 'Weigh sample branches daily to track moisture loss.', 'Use water activity, not just feel, to decide when product is ready. Some states set water-activity limits.', 'Record the conditions for every batch so you can repeat a good one.'],
      },
      {
        h: 'Starting points',
        p: ['Many growers start near 60°F and 60% relative humidity in the dry room and adjust from there. Treat that as a starting point, not a rule.'],
      },
    ],
    sources: [{ label: 'Mississippi Medical Cannabis Program (MSDH): testing rules', url: 'https://www.mmcp.ms.gov/' }],
  },
];

export const findArticle = (slug: string) => articles.find((a) => a.slug === slug);
