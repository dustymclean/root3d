/** Company-level messaging from the Root3D master brief. */

export const tagline = 'Hardening the Cannabis Supply Chain from Seed to Sale.';
export const coreMessage = ['Agriculture.', 'Science.', 'Technology.', 'Business.', 'Real-World Execution.'];
export const positioning = 'Three backgrounds. Three perspectives. One commitment to solving real problems.';
export const pillars = ['People', 'Plants', 'Solutions'];

export const mission =
  'Root3D is a multidisciplinary agricultural, cannabis, technology, and business consulting firm. We combine scientific research, commercial cultivation, facility engineering, compliance, cybersecurity, automation, and commercialization under one roof.';

export const philosophy =
  'We are practical problem-solvers, not generic consultants selling templates. Our work is honest, accessible, and scientifically grounded. We diagnose the problem, implement the fix, document the result, and put safeguards in place so it does not happen again.';

/** The thesis behind the team: failures cross disciplines, so the fix has to as well. */
export const triadThesis = [
  'Operational failures in regulated agriculture rarely stay in one department. A restriction in an irrigation line changes how the plant feeds. That shows up in the lab results, which shows up in the compliance report, which shows up in retail margins.',
  'Root3D was built around that chain. Joel works the inputs and the chemistry, Danny works the canopy and the infrastructure, and Dusty works the data, the documentation, and the storefront. Together we cover seed to sale, and we talk to each other so you do not have to translate between specialists.',
];

/** Documentation philosophy: every engagement moves through these stages and is recorded as it goes. */
export const pipeline = [
  { key: 'problem', title: 'Initial Problem', text: 'What is actually happening, in your words and in the data, before anyone assumes a cause.' },
  { key: 'investigation', title: 'Investigation', text: 'Walk-throughs, photos, logs, lab results, plumbing, and paperwork. We collect evidence first.' },
  { key: 'idea', title: 'Idea', text: 'Candidate explanations, ranked by likelihood and by how cheaply each can be tested.' },
  { key: 'proposed_fix', title: 'Proposed Fix', text: 'A specific change with an owner, a cost, and what we expect to see if it works.' },
  { key: 'implementation', title: 'Implementation', text: 'The change is made, with your team, and every step is written down.' },
  { key: 'validation', title: 'Validation', text: 'We measure whether it worked against the expectation we set before we started.' },
  { key: 'backup_plan', title: 'Backup Plan', text: 'What we do if it did not work, or if conditions change next month.' },
  { key: 'cross_correlation', title: 'Cross-Correlation', text: 'How the finding touches agriculture, engineering, compliance, technology, and the business, so lessons travel.' },
  { key: 'final_report', title: 'Final Report', text: 'A written record you own: sources, decisions, results, and version history.' },
  { key: 'follow_up', title: 'Follow-Up', text: 'A scheduled check-in to confirm the fix held and to catch the next issue early.' },
] as const;

export type PipelineKey = (typeof pipeline)[number]['key'];

/** How the three partners combine on common engagement types. */
export const synergy = [
  {
    area: 'Cultivation & canopy',
    joel: 'Designs the feed program and input chemistry, including acetate-based strategies.',
    danny: 'Runs canopy management, irrigation dynamics, and the daily room routine.',
    dusty: 'Builds batch logs, structured strain libraries, and the records inspectors ask for.',
  },
  {
    area: 'Facility engineering',
    joel: 'Reviews environmental chemistry and raw-input purity, including heavy-metal risk.',
    danny: 'Re-engineers plumbing and irrigation, and prototypes hardware in 3D.',
    dusty: 'Connects sensor data to alerts and automated workflows so problems surface early.',
  },
  {
    area: 'Commercialization & retail',
    joel: 'Structures wholesale and distribution agreements and margin strategy.',
    danny: 'Trains retail and floor staff on cultivar characteristics and product knowledge.',
    dusty: 'Engineers storefronts, B2B portals, product feeds, and transaction records.',
  },
  {
    area: 'Compliance & risk',
    joel: 'Vets suppliers and input documentation for contamination risk.',
    danny: 'Brings biosecurity discipline and facility network and physical security practice.',
    dusty: 'Researches the rules, writes the SOPs, and runs the Total THC and lab-data math.',
  },
];

export const values = [
  { title: 'Honest answers', text: 'If we are not the right fit, or the fix is cheap and simple, we will say so on the first call.' },
  { title: 'Evidence before opinions', text: 'We look at your data, your plants, and your paperwork before recommending anything.' },
  { title: 'Teach, do not just tell', text: 'Your team should understand why a change works, so they can run it without us.' },
  { title: 'Write it down', text: 'Every engagement ends with documentation you own: what we found, what we changed, and what to watch.' },
  { title: 'No guarantees we cannot keep', text: 'Regulators and plants make their own decisions. We promise diligence, not outcomes.' },
  { title: 'Your information stays yours', text: 'Client files are private, access is limited to your consultants, and we never sell data.' },
];

/** Who we work with. */
export const audiences = [
  { title: 'Commercial operators', text: 'Licensed cultivators, processors, and vertically integrated companies that need fixes before inspectors find problems.' },
  { title: 'Dispensaries & retail', text: 'Storefronts that need tighter inventory, better staff training, and cleaner reconciliation.' },
  { title: 'New license holders', text: 'Teams that just received a license and need SOPs, systems, and a build-out plan fast.' },
  { title: 'Multi-state operators', text: 'Companies expanding across state lines that need a clear view of what changes at the border.' },
  { title: 'Small businesses', text: 'Hemp producers, smoke shops, and suppliers who need practical help without enterprise pricing.' },
  { title: 'Home growers', text: 'Hobbyists who want a real cultivator to look at their plants and give a straight answer.' },
];

export const contactEmail = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || 'contact@r3dconsulting.com';
