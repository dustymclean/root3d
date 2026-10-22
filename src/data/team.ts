export type Claim = {
  text: string;
  /** Claims we have not yet confirmed. Shown with a "pending review" tag until the consultant signs off. */
  needsReview?: boolean;
};

export type Specialty = { title: string; text: string; needsReview?: boolean };

export type Consultant = {
  slug: string;
  name: string;
  first: string;
  title: string;
  headline: string;
  photo: string;
  photoAlt: string;
  photoPosition?: string;
  summary: string;
  story: Claim[];
  background: Claim[];
  specialties: Specialty[];
  categories: string[];
  approach: string;
  focus: string;
  /** Service-area slugs this consultant leads or supports (see data/areas.ts). */
  areas: string[];
  /** Optional short muted clip shown on the profile. */
  video?: string;
  bookable: boolean;
};

export const team: Consultant[] = [
  {
    slug: 'joel-perkins',
    name: 'Joel Perkins',
    first: 'Joel',
    title: 'Executive Consultant · Supply Chain Architect',
    headline: 'Agricultural Scientist, Formulation Specialist & Systems Architect',
    photo: 'team/joel-perkins.jpg',
    photoAlt: 'Headshot of Joel Perkins',
    summary:
      'Joel bridges agricultural biochemistry and large-scale operations. He designs nutrient programs and input strategies, vets suppliers, and structures the distribution and margin side of the business so the science pays for itself.',
    story: [
      {
        text: 'Joel came to agriculture from an unusual direction. He started in the California entertainment industry as a concert promoter running multiple live events every week, and was the lead vocalist and lyricist for the thrash metal band Six Pack of Doom. Running shows taught him logistics, crowds, and cash flow long before he ran a facility.',
      },
      {
        text: 'He moved into medical cannabis as manager of the Sespe Creek Collective in California, growing it into one of the state’s leading medical hubs, serving more than 10,000 registered patients, including oncology patients and wounded combat veterans.',
      },
      {
        text: 'Concern about agricultural contaminants like glyphosate pushed him into microbiology. He founded and ran a biological, fermentation-based fertilizer line that became a staple in the Humboldt market and was adopted by Driscoll’s growers for commercial berry production.',
      },
      {
        text: 'After serving as Chief Operating Officer of Primordial Solutions, Joel spent six years as a Division Head at Wilbur-Ellis, where he formulated botanical fertilizer lines and traveled internationally as a keynote speaker on plant metabolism. In Nevada he managed 24-hour, high-volume retail operations at Oasis Cannabis and led the restructuring of Bofloral’s US division into Valley of Fire Distribution. He is the formulator of Cowbell Cow Mag, an acetate-based calcium and magnesium supplement.',
      },
      {
        text: 'Today Joel is Head of Operations at Lake Leaf Cultivation, the tribal cannabis enterprise of the Mille Lacs Band of Ojibwe in Minnesota: a vertically integrated, 50,000-square-foot cultivation, manufacturing, and processing operation opened in April 2024, with more than 100 team members, wholesale relationships, and dispensaries in Onamia, Hinckley, and Isle.',
      },
    ],
    background: [
      { text: 'Head of Operations, Lake Leaf Cultivation (Mille Lacs Band of Ojibwe, Minnesota)' },
      { text: 'Founder, Valley of Fire Distribution (restructured from Bofloral’s US division)' },
      { text: 'Division Head, Wilbur-Ellis (six years)' },
      { text: 'Chief Operating Officer, Primordial Solutions' },
      { text: 'Founder, biological fermentation fertilizer line (Humboldt; Driscoll’s berry growers)' },
      { text: 'Retail operations, Oasis Cannabis (Nevada)' },
      { text: 'Manager, Sespe Creek Collective (California, 10,000+ registered patients)' },
      { text: 'Formulator, Cowbell Cow Mag' },
      { text: 'Product development, Habitarium' },
      { text: 'International keynote speaker on plant metabolism' },
    ],
    specialties: [
      {
        title: 'Acetate-based nutrient strategies',
        text: 'Joel pioneered commercial use of potassium and calcium acetate, which give the plant carbon in its most accessible form as a direct Acetyl-CoA precursor, to support metabolism, resin, and terpene production. We trial it on a test block and measure before rolling it out, because results depend on cultivar and environment.',
      },
      {
        title: 'Biological fertilizers & fermentation',
        text: 'Microbial and fermentation-based inputs, how to brew and apply them consistently, and how to keep them from becoming a contamination source.',
      },
      {
        title: 'Low heavy-metal input sourcing',
        text: 'Supplier vetting, certificate-of-analysis review, and input documentation that reduce the risk of failed heavy-metal panels.',
      },
      {
        title: 'Genetics & supplier evaluation',
        text: 'Sourcing cultivars and inputs from suppliers who can back up what they sell, and building relationships that hold up under scrutiny.',
      },
      {
        title: 'Distribution, margins & liquidity',
        text: 'Wholesale agreements, margin strategy, and cash-flow planning for businesses that cannot rely on ordinary banking. Joel calls the liquidity side "Backpack Banking": practical payment paths and cash procedures for restricted markets.',
      },
      {
        title: 'Operational scaling',
        text: 'Turning a working room into a working facility: staffing, throughput, procurement, and the controls that keep quality from slipping as volume grows.',
      },
    ],
    categories: [
      'Commercial agricultural science',
      'Nutrient formulation',
      'Facility strategy',
      'Operational scaling',
      'Product development',
      'Genetics',
      'Supplier evaluation',
      'Business commercialization',
    ],
    approach: 'Treat every facility like a live lab. Change one variable, measure it honestly, and keep what works.',
    focus: 'Inputs, chemistry, and margins',
    areas: ['agriculture-formulation', 'cultivation-processing', 'multi-state', 'dispensary-retail'],
    bookable: true,
  },
  {
    slug: 'danny-davis',
    name: 'Danny Davis',
    first: 'Danny',
    title: 'Head Cultivator · Facility Engineer',
    headline: 'Master Cultivator, Facility Operator & Technical Systems Consultant',
    photo: 'team/danny-davis.jpg',
    photoAlt: 'Danny Davis inside an operating cultivation facility',
    photoPosition: 'center 20%',
    summary:
      'Danny is the owner and head cultivator of Manna Holdings LLC (Farming Manna), a veteran-owned Mississippi operation. He combines field-medic discipline, network security training, and hands-on cultivation to keep plants healthy, systems running, and teams sharp.',
    story: [
      {
        text: 'Danny served as a U.S. Army combat medic and earned the Expert Field Medical Badge. He brings that background into the grow room as biosecurity: clean entry procedures, contamination control, and the habit of doing it right every time because shortcuts eventually show up in the plants.',
      },
      {
        text: 'After the Army he moved into enterprise technology and earned Cisco CCNA Security. That is why his facility work includes the network: segmented systems, Cloudflare, isolated Linux virtual machines, proxies, and encrypted communications, so cultivation data and camera feeds are not left exposed.',
      },
      {
        text: 'Today he owns and runs Farming Manna, a veteran-owned commercial operation in Mississippi with a clean inspection history. His genetics work has included a project in Barcelona documenting about 650 cultivars, and he designs custom cultivation hardware in Tinkercad when the off-the-shelf part does not fit.',
      },
      {
        text: 'Danny believes cultivators should understand their operation, not just follow a checklist. He spends as much time on people as on plants, helping high-turnover crews shift from an employee mindset to an owner mindset, drawing on mentoring and focus techniques that include Hemi-Sync audio.',
      },
    ],
    background: [
      { text: 'U.S. Army combat medic, Expert Field Medical Badge (EFMB)' },
      { text: 'Cisco CCNA Security' },
      { text: 'Owner and head cultivator, Manna Holdings LLC (Farming Manna), veteran-owned, Mississippi' },
      { text: 'Clean state inspection history at Farming Manna' },
      { text: 'Genetics project in Barcelona documenting about 650 cultivars' },
      { text: 'Linux, Cloudflare, and network security practice' },
      { text: '3D design and hardware prototyping in Tinkercad' },
    ],
    specialties: [
      {
        title: 'Irrigation & the 45-degree rule',
        text: 'Plumbing laid out to cut friction loss, for example swapping hard 90-degree elbows for pairs of 45s, so pressure stays even across the room and pumps are not overworked.',
      },
      {
        title: 'Plant health & IPM',
        text: 'Diagnosing deficiencies, pests, and pathogens from the plant and the environment together, then building an integrated pest management routine the crew can keep up.',
      },
      {
        title: 'Tissue culture & micropropagation',
        text: 'Clean-stock programs, lab layout, media prep, and training, so your genetics are preserved and your mother rooms stop being a liability.',
      },
      {
        title: 'Environmental controls & facility troubleshooting',
        text: 'HVAC, dehumidification, airflow, and lighting reviewed as one system, with practical adjustments when conditions shift.',
      },
      {
        title: 'Facility security & operational privacy',
        text: 'Network segmentation, secure remote access, and communication habits that protect cultivation data, camera systems, and your intellectual property.',
      },
      {
        title: 'Team culture & training',
        text: 'Floor training, strain documentation, and leadership coaching that builds a crew who owns the outcome.',
      },
    ],
    categories: [
      'Cultivation coaching',
      'Commercial facility audits',
      'Irrigation and environmental optimization',
      'Plant diagnostics',
      'Cultivation management',
      'Tissue culture',
      'Operational training',
      'Infrastructure consulting',
    ],
    approach: 'Teach growers to understand their room, not just follow instructions. The best fix is the one your team can run without me.',
    focus: 'Canopy, plumbing, and training',
    areas: ['facility-audits', 'cultivation-processing', 'technology-systems'],
    bookable: true,
  },
  {
    slug: 'dusty-mclean',
    name: 'Dusty McLean',
    first: 'Dusty',
    title: 'Systems Architect · Compliance & OSINT',
    headline: 'Technologist, OSINT Researcher & Business Systems Strategist',
    photo: 'team/dusty-mclean.jpg',
    photoAlt: 'Dusty McLean, full-length portrait in a blue floral dress',
    photoPosition: 'center 10%',
    summary:
      'Dusty translates complicated business, compliance, and technology problems into systems people can actually run. She builds the documentation, data pipelines, storefronts, and research that keep operators audit-ready without slowing them down.',
    story: [
      {
        text: 'Dusty is an IT professional and researcher based in Mississippi, with an Associate of Science background in Information Technology Systems and Communication Systems. She is a commissioned Mississippi Notary Public and a USDA-licensed hemp producer, so the paperwork side of this industry is not abstract to her.',
      },
      {
        text: 'She founded Pixie’s Pantry and Pixie’s Distribution, and is managing partner of Ole Brook Web Services. That work spans WordPress and WooCommerce builds, B2B wholesale portals, structured CSV and JSON product data, and automation that keeps catalogs, orders, and records in sync.',
      },
      {
        text: 'Her research background includes OSINT and cybersecurity. She is a course author for OnlySecurity, writing curriculum on investigative methodology, digital privacy, and image analysis. For clients, that becomes regulatory intelligence, competitive research, and due diligence on partners and suppliers.',
      },
      {
        text: 'Dusty also treats consumption and vaporization hardware with a Durable Medical Equipment mindset: material safety, airpath quality, and battery documentation rather than novelty marketing. She has built patient resource directories and product education for medical cannabis patients.',
      },
    ],
    background: [
      { text: 'A.S. background, Information Technology Systems and Communication Systems' },
      { text: 'Commissioned Mississippi Notary Public' },
      { text: 'USDA-licensed hemp producer' },
      { text: 'Managing partner, Ole Brook Web Services (OBWS)' },
      { text: 'Founder, Pixie’s Pantry and Pixie’s Distribution' },
      { text: 'Course author, OnlySecurity (OSINT, digital privacy, image analysis)' },
    ],
    specialties: [
      {
        title: 'Compliance documentation & SOPs',
        text: 'Inspection-ready SOPs, records, and checklists written from the actual rules, with owners and review dates so they stay current.',
      },
      {
        title: 'Total THC & lab-data review',
        text: 'Batch monitoring against statutory limits using Total THC = (THCA × 0.877) + Δ9-THC, with alerts before a number drifts into trouble.',
      },
      {
        title: 'E-commerce & B2B systems',
        text: 'WordPress and WooCommerce storefronts, wholesale portals, and structured product feeds that stay accurate across thousands of SKUs.',
      },
      {
        title: 'Automation & sensor alerts',
        text: 'Connecting environmental sensors, spreadsheets, and business tools so the right person hears about a problem while it is still small.',
      },
      {
        title: 'OSINT & regulatory intelligence',
        text: 'Source-backed research on rules, competitors, partners, and suppliers, delivered with citations you can check.',
      },
      {
        title: 'Hardware safety & product education',
        text: 'Material, airpath, and battery documentation for consumption hardware, plus clear product education for customers and patients.',
      },
    ],
    categories: [
      'Website and e-commerce architecture',
      'Process automation',
      'OSINT',
      'Regulatory intelligence',
      'Competitive research',
      'Documentation',
      'Commercialization',
      'Digital systems',
      'Strategic business development',
    ],
    approach: 'If it is not written down, it did not happen. Good systems make the right thing the easy thing.',
    focus: 'Data, documentation, and storefronts',
    areas: ['technology-systems', 'dispensary-retail', 'multi-state', 'facility-audits'],
    bookable: true,
  },
  {
    slug: 'hunter-porter',
    name: 'Hunter Porter',
    first: 'Hunter',
    title: 'Regulatory Analyst · Systems & Devices',
    headline: 'Regulatory Interpretation, Cultivation Methods & Device Systems',
    photo: 'team/hunter-porter.jpg',
    photoAlt: 'Hunter Porter in a navy jacket and cap, sitting outdoors in a park',
    photoPosition: '55% 20%',
    video: 'team/hunter-porter.mp4',
    summary:
      'Hunter reads the rules the way an engineer reads a schematic. He studied electrical technology, and he brings that same precision to regulations, mold problems, growing methods, and the devices that run a facility. He notices what others miss and does not stop until he has the answer.',
    story: [
      {
        text: 'Hunter studied electrical technology, and it shows in how he approaches every problem: understand the whole system first, then find the part that is failing. He studies systems he may never touch, and the ones he does touch, he speaks their language.',
      },
      {
        text: 'On the regulatory side, Hunter reads and interprets the law closely: what a rule actually requires, how it is applied, and what an operator has to do to follow it day to day. He is not an attorney; he helps clients understand and operationalize the rules, and works alongside counsel when legal advice is needed.',
      },
      {
        text: 'In the grow, he knows molds and contamination, and he is fluent across multiple cultivation methods. That combination matters, because many mold problems start as environment, equipment, or procedure problems that only someone who understands all three will catch.',
      },
      {
        text: 'Like Dusty, Hunter can find the answer to almost anything. He is thorough, gives his full heart to every project, and is often the person who spots the detail everyone else walked past.',
      },
    ],
    background: [
      { text: 'Studied Electrical Technology' },
      { text: 'Regulatory reading and interpretation' },
      { text: 'Mold identification and contamination prevention' },
      { text: 'Experience across multiple growing methods' },
      { text: 'Electrical systems and cultivation devices' },
    ],
    specialties: [
      {
        title: 'Reading & interpreting the law',
        text: 'Plain-language breakdowns of what a regulation requires, where it is ambiguous, and how to build procedures that follow it. Research and interpretation, not legal advice.',
      },
      {
        title: 'Mold & contamination',
        text: 'Finding where mold comes from, whether it is airflow, humidity, equipment, or handling, and putting prevention in place before it reaches a lab test.',
      },
      {
        title: 'Growing methods',
        text: 'Practical knowledge across multiple cultivation methods, so advice fits the system you actually run.',
      },
      {
        title: 'Devices & electrical systems',
        text: 'Controllers, sensors, lighting, and the electrical side of a facility, reviewed by someone trained in electrical technology.',
      },
      {
        title: 'Research & root-cause analysis',
        text: 'Thorough investigation that keeps going until it finds the real cause, with the evidence written down.',
      },
    ],
    categories: [
      'Regulatory interpretation',
      'Compliance procedures',
      'Mold and contamination',
      'Cultivation methods',
      'Electrical systems and devices',
      'Facility audits',
      'Research and root-cause analysis',
    ],
    approach: 'Understand the whole system before you touch any part of it. The answer is usually in the detail nobody checked.',
    focus: 'Law, molds, and devices',
    areas: ['facility-audits', 'multi-state', 'cultivation-processing', 'technology-systems'],
    bookable: true,
  },
];

export const findConsultant = (slug: string) => team.find((c) => c.slug === slug);
