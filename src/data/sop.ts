/** SOP Generator content. Produces an editable starting draft; never a substitute for reading the current rules. */

export type BusinessType = 'cultivation' | 'processing' | 'dispensary' | 'hemp';

export const businessTypes: { id: BusinessType; label: string }[] = [
  { id: 'cultivation', label: 'Cannabis cultivation' },
  { id: 'processing', label: 'Processing / manufacturing' },
  { id: 'dispensary', label: 'Dispensary / retail' },
  { id: 'hemp', label: 'Hemp producer' },
];

export type Jurisdiction = { id: string; label: string; regulators: { name: string; url: string }[]; tracking: string };

export const jurisdictions: Jurisdiction[] = [
  {
    id: 'MS',
    label: 'Mississippi',
    regulators: [
      { name: 'Mississippi State Department of Health, Medical Cannabis Program', url: 'https://www.mmcp.ms.gov/' },
      { name: 'Mississippi Department of Revenue (dispensaries)', url: 'https://www.dor.ms.gov/' },
    ],
    tracking: 'Metrc',
  },
  {
    id: 'MN',
    label: 'Minnesota',
    regulators: [{ name: 'Minnesota Office of Cannabis Management', url: 'https://mn.gov/ocm/' }],
    tracking: 'Metrc',
  },
  {
    id: 'NV',
    label: 'Nevada',
    regulators: [{ name: 'Nevada Cannabis Compliance Board', url: 'https://ccb.nv.gov/' }],
    tracking: 'Metrc',
  },
  {
    id: 'CA',
    label: 'California',
    regulators: [{ name: 'California Department of Cannabis Control', url: 'https://cannabis.ca.gov/' }],
    tracking: 'Metrc',
  },
  {
    id: 'US',
    label: 'Federal hemp (USDA plan)',
    regulators: [{ name: 'USDA Agricultural Marketing Service, Hemp Production Program', url: 'https://www.ams.usda.gov/rules-regulations/hemp' }],
    tracking: 'your recordkeeping system',
  },
  {
    id: 'OTHER',
    label: 'Another state',
    regulators: [],
    tracking: 'your state’s tracking system',
  },
];

export type Answers = {
  company: string;
  facility: string;
  license: string;
  owner: string;
  approver: string;
  tracking: string;
  retention: string;
  cameraRetention: string;
  effective: string;
};

export type Topic = {
  id: string;
  title: string;
  types: BusinessType[];
  purpose: string;
  scope: string;
  responsibilities: string[];
  steps: string[];
  records: string[];
};

/** Placeholders in steps: {company} {facility} {owner} {tracking} {retention} {cameraRetention} */
export const topics: Topic[] = [
  {
    id: 'sanitation',
    title: 'Sanitation & Cleaning',
    types: ['cultivation', 'processing', 'dispensary', 'hemp'],
    purpose: 'Keep work areas, equipment, and surfaces clean to prevent contamination of plants and product.',
    scope: 'All rooms, equipment, and surfaces at {facility}.',
    responsibilities: ['{owner} maintains the cleaning schedule and verifies completion.', 'Every employee cleans their work area at the end of each task and shift.'],
    steps: [
      'Post the cleaning schedule in each room listing surfaces, frequency, method, and approved cleaning agents.',
      'Before cleaning, put on the required protective equipment and remove product from the area.',
      'Remove debris, then clean surfaces with detergent and water before sanitizing.',
      'Apply the approved sanitizer at the label concentration and contact time.',
      'Clean tools and equipment between rooms or batches to prevent cross-contamination.',
      'Record the date, time, area, agent used, and initials on the cleaning log.',
      'Report any damage, pests, mold, or leaks to {owner} immediately.',
    ],
    records: ['Cleaning log', 'Safety data sheets for every chemical used', 'Corrective-action notes'],
  },
  {
    id: 'access',
    title: 'Facility Access & Visitor Log',
    types: ['cultivation', 'processing', 'dispensary', 'hemp'],
    purpose: 'Control who enters restricted areas and keep a complete record of every visitor.',
    scope: 'All entrances and restricted areas at {facility}.',
    responsibilities: ['{owner} approves visitors and audits the log weekly.', 'Employees escort visitors at all times.'],
    steps: [
      'Restricted areas are marked and accessible only to authorized employees.',
      'Visitors check in at the designated entrance and present valid government-issued photo ID.',
      'Record the visitor’s name, organization, purpose, ID verification, escort, and times in and out.',
      'Issue a visitor badge that is visible at all times and collected at check-out.',
      'An authorized employee escorts the visitor for the entire visit.',
      'Regulators and inspectors are admitted according to the rules, and {owner} is notified immediately.',
      'Keep visitor logs for {retention}.',
    ],
    records: ['Visitor log', 'Badge issue and return record', 'Access-control reports'],
  },
  {
    id: 'security',
    title: 'Security & Surveillance',
    types: ['cultivation', 'processing', 'dispensary', 'hemp'],
    purpose: 'Protect people, product, and records, and keep surveillance working and retained.',
    scope: 'Alarm, camera, lock, and network systems at {facility}.',
    responsibilities: ['{owner} is responsible for security systems and incident reporting.', 'Every employee reports suspicious activity immediately.'],
    steps: [
      'Check that all cameras are recording and time-stamped correctly at the start of each day.',
      'Keep surveillance footage for {cameraRetention}, stored securely with access limited to authorized staff.',
      'Test the alarm system on the schedule set by the manufacturer and the rules, and log each test.',
      'Change default passwords on all cameras, recorders, and controllers, and keep them on a separate network segment.',
      'Limit keys, codes, and badges to authorized staff, and revoke them the same day someone leaves.',
      'Report any theft, loss, breach, or system outage to {owner} at once and to the regulator within the required time.',
    ],
    records: ['Daily camera check log', 'Alarm test log', 'Key and badge register', 'Incident reports'],
  },
  {
    id: 'inventory',
    title: 'Inventory & Seed-to-Sale Tracking',
    types: ['cultivation', 'processing', 'dispensary'],
    purpose: 'Keep physical inventory and {tracking} in agreement at all times.',
    scope: 'All plants, batches, and packages handled at {facility}.',
    responsibilities: ['{owner} reviews variances daily.', 'Only trained employees with their own logins record transactions in {tracking}.'],
    steps: [
      'Record every plant, batch, package, transfer, sample, waste event, and sale in {tracking} when it happens.',
      'Use calibrated scales, verify calibration daily, and record the check.',
      'Run a daily cycle count on a rotating set of items and a full count on the schedule the rules require.',
      'Investigate any variance the same day with a second employee. Do not adjust {tracking} without a documented reason.',
      'Record the cause, the correction, and the employees involved for every adjustment.',
      'Notify the regulator of discrepancies, theft, or loss within the required time.',
    ],
    records: ['Cycle count sheets', 'Scale calibration log', 'Adjustment log with reasons', '{tracking} reports'],
  },
  {
    id: 'waste',
    title: 'Waste Disposal',
    types: ['cultivation', 'processing', 'dispensary', 'hemp'],
    purpose: 'Dispose of plant material and product waste so it is unusable, witnessed, and recorded.',
    scope: 'All cannabis or hemp waste generated at {facility}.',
    responsibilities: ['{owner} schedules and supervises waste events.', 'Two employees witness each event.'],
    steps: [
      'Store waste in a secured, labeled area until disposal.',
      'Weigh waste and record it in {tracking} before rendering it unusable.',
      'Render waste unusable using the method allowed by the rules, such as grinding and mixing with other waste.',
      'Two employees witness and sign the waste record.',
      'Dispose of the mixture through the approved channel and keep receipts.',
      'Keep waste records for {retention}.',
    ],
    records: ['Waste log with weights and witnesses', 'Disposal receipts', 'Surveillance of waste events'],
  },
  {
    id: 'training',
    title: 'Employee Training',
    types: ['cultivation', 'processing', 'dispensary', 'hemp'],
    purpose: 'Make sure every employee is trained on the procedures they perform before they perform them.',
    scope: 'All employees and contractors at {company}.',
    responsibilities: ['{owner} maintains the training plan and records.', 'Employees complete training before working unsupervised.'],
    steps: [
      'Assign each role the SOPs it must be trained on.',
      'Train new employees on safety, security, and their role’s SOPs before their first unsupervised shift.',
      'Use a demonstration and a check-off for hands-on tasks.',
      'Retrain whenever an SOP changes and at least once a year.',
      'Record the date, trainer, topic, and employee signature for each session.',
    ],
    records: ['Training matrix by role', 'Signed training records'],
  },
  {
    id: 'ipm',
    title: 'Integrated Pest Management',
    types: ['cultivation', 'hemp'],
    purpose: 'Prevent, detect, and control pests and pathogens using only allowed methods and products.',
    scope: 'All growing areas at {facility}.',
    responsibilities: ['{owner} maintains the IPM plan and the list of approved products.', 'Assigned staff scout on schedule.'],
    steps: [
      'Quarantine incoming plants and cuttings before they enter production.',
      'Scout each room on its assigned day, including leaf undersides and new growth, using magnification.',
      'Check and replace sticky traps weekly and log counts.',
      'Identify the pest or pathogen before choosing a control.',
      'Use only products allowed for cannabis or hemp in this jurisdiction, at label rates.',
      'Record each application: product, lot, rate, area, applicator, date, and re-entry interval.',
    ],
    records: ['Scouting log', 'Trap count log', 'Pesticide application records', 'Approved product list'],
  },
  {
    id: 'harvest',
    title: 'Harvest & Batch Tracking',
    types: ['cultivation', 'hemp'],
    purpose: 'Harvest, weigh, and track each batch so it can be traced from plant to package.',
    scope: 'All harvests at {facility}.',
    responsibilities: ['{owner} approves harvest dates.', 'Harvest crew records weights and identifiers.'],
    steps: [
      'Confirm the harvest date fits any required testing or sampling window.',
      'Assign a batch identifier and record plants harvested in {tracking}.',
      'Record wet weight by batch on a calibrated scale.',
      'Dry and cure in a monitored room, logging temperature and humidity.',
      'Record dry weight and any waste, then move to packaging or storage.',
    ],
    records: ['Harvest log', 'Dry room environment log', 'Batch records'],
  },
  {
    id: 'sampling',
    title: 'Pre-Harvest Sampling',
    types: ['hemp'],
    purpose: 'Coordinate official pre-harvest sampling and testing within the required window.',
    scope: 'Every lot grown by {company}.',
    responsibilities: ['{owner} schedules sampling and keeps lab results.'],
    steps: [
      'Request sampling from an authorized sampler within the window required by your plan.',
      'Make every lot accessible and clearly identified for the sampler.',
      'Do not harvest before the sample is collected, and harvest within the required time after sampling.',
      'Keep lab results with the lot records.',
      'If a lot does not meet the limit, follow your plan’s remediation or disposal procedure and record each step.',
    ],
    records: ['Sampling requests and confirmations', 'Certificates of analysis', 'Remediation or disposal records'],
  },
  {
    id: 'receiving',
    title: 'Receiving & Transfers',
    types: ['processing', 'dispensary'],
    purpose: 'Verify every incoming transfer against its manifest before accepting it.',
    scope: 'All incoming and outgoing transfers at {facility}.',
    responsibilities: ['{owner} or a designated receiver accepts transfers.'],
    steps: [
      'Receive transfers only in the designated area under camera coverage.',
      'Compare packages, labels, and weights to the manifest in {tracking}.',
      'Reject or note any discrepancy before accepting.',
      'Accept the transfer in {tracking} at the time of receipt.',
      'Move product to secure storage immediately.',
    ],
    records: ['Signed manifests', 'Receiving discrepancies log'],
  },
  {
    id: 'recall',
    title: 'Product Hold & Recall',
    types: ['processing', 'dispensary'],
    purpose: 'Quickly hold, trace, and recall affected product when a problem is found.',
    scope: 'All products sold or transferred by {company}.',
    responsibilities: ['{owner} leads holds and recalls and communicates with the regulator.'],
    steps: [
      'Place affected product on hold in {tracking} and physically separate it.',
      'Identify every package and customer affected using batch records.',
      'Notify the regulator as required and follow its instructions.',
      'Notify affected customers and partners.',
      'Document the root cause and the corrective action.',
    ],
    records: ['Hold and recall log', 'Customer notifications', 'Root-cause report'],
  },
  {
    id: 'pos',
    title: 'Point of Sale & ID Verification',
    types: ['dispensary'],
    purpose: 'Verify every customer’s eligibility before a sale and record the sale correctly.',
    scope: 'All sales at {facility}.',
    responsibilities: ['Sales staff verify identification and eligibility.', '{owner} audits sales records.'],
    steps: [
      'Verify valid identification and any required patient or caregiver credential for every customer.',
      'Confirm the purchase is within allowed limits before completing the sale.',
      'Record the sale so it appears in {tracking} as required.',
      'Refuse any sale that cannot be verified, and record the refusal.',
    ],
    records: ['Sales records', 'Refusal log'],
  },
  {
    id: 'extraction',
    title: 'Extraction Safety',
    types: ['processing'],
    purpose: 'Operate extraction equipment safely and keep each run documented.',
    scope: 'Extraction rooms and equipment at {facility}.',
    responsibilities: ['{owner} authorizes operators and maintains equipment certifications.'],
    steps: [
      'Only trained, authorized operators run extraction equipment.',
      'Inspect equipment, ventilation, and gas detection before each run.',
      'Follow the manufacturer’s operating procedure and the facility’s fire and building code requirements.',
      'Record inputs, solvents, settings, yields, and operator for each run.',
      'Shut down and report any leak, alarm, or malfunction immediately.',
    ],
    records: ['Run logs', 'Equipment inspection log', 'Certifications'],
  },
];

export function fill(text: string, a: Answers) {
  const v = (x: string, label: string) => x.trim() || `[${label}]`;
  return text
    .replaceAll('{company}', v(a.company, 'Company name'))
    .replaceAll('{facility}', v(a.facility, 'Facility name and address'))
    .replaceAll('{owner}', v(a.owner, 'Responsible person or title'))
    .replaceAll('{tracking}', v(a.tracking, 'tracking system'))
    .replaceAll('{retention}', v(a.retention, 'the period required by your rules'))
    .replaceAll('{cameraRetention}', v(a.cameraRetention, 'the period required by your rules'));
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Builds the HTML draft shown in the editor and used for exports. */
export function buildSop(type: BusinessType, j: Jurisdiction, chosen: Topic[], a: Answers) {
  const typeLabel = businessTypes.find((b) => b.id === type)!.label;
  const f = (t: string) => esc(fill(t, a));
  const regs = j.regulators.length
    ? j.regulators.map((r) => `<li>${esc(r.name)}: ${esc(r.url)}</li>`).join('')
    : '<li>[Add your state regulator and the regulations this SOP satisfies]</li>';
  const head = `
<h1>${f('{company}')} Standard Operating Procedures</h1>
<p><strong>Business type:</strong> ${esc(typeLabel)} · <strong>Jurisdiction:</strong> ${esc(j.label)}</p>
<table>
<tr><th>Facility</th><td>${f('{facility}')}</td></tr>
<tr><th>License number</th><td>${esc(a.license.trim() || '[License number]')}</td></tr>
<tr><th>SOP owner</th><td>${f('{owner}')}</td></tr>
<tr><th>Approved by</th><td>${esc(a.approver.trim() || '[Name and title]')}</td></tr>
<tr><th>Effective date</th><td>${esc(a.effective || '[Date]')}</td></tr>
<tr><th>Version</th><td>1.0 (draft)</td></tr>
</table>
<p class="disclaimer"><strong>Draft for review.</strong> Generated by the Root3D SOP Generator as a starting point. It is not legal advice and may not reflect current rules. Confirm every requirement against your regulations and have the final version reviewed before use.</p>`;
  const body = chosen
    .map(
      (t, i) => `
<h2>SOP ${i + 1}: ${esc(t.title)}</h2>
<h3>Purpose</h3><p>${f(t.purpose)}</p>
<h3>Scope</h3><p>${f(t.scope)}</p>
<h3>Responsibilities</h3><ul>${t.responsibilities.map((r) => `<li>${f(r)}</li>`).join('')}</ul>
<h3>Procedure</h3><ol>${t.steps.map((s) => `<li>${f(s)}</li>`).join('')}</ol>
<h3>Records</h3><ul>${t.records.map((r) => `<li>${f(r)}</li>`).join('')}</ul>`,
    )
    .join('');
  const foot = `
<h2>References</h2><ul>${regs}</ul>
<h2>Revision history</h2>
<table><tr><th>Version</th><th>Date</th><th>Change</th><th>By</th></tr>
<tr><td>1.0</td><td>${esc(a.effective || '[Date]')}</td><td>Initial draft</td><td>${f('{owner}')}</td></tr></table>`;
  return head + body + foot;
}
