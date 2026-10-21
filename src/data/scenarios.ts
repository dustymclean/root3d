import type { PipelineKey } from './company';

/**
 * Illustrative engagement scenarios that show the documentation method end to end.
 * These are NOT client results. Real case studies will replace them once clients approve publication in writing.
 */
export type Scenario = {
  slug: string;
  title: string;
  client: string;
  areas: string[];
  team: string[];
  record: Partial<Record<PipelineKey, string>>;
};

export const scenarios: Scenario[] = [
  {
    slug: 'pre-inspection-new-licensee',
    title: 'A new cultivation licensee six weeks from its first inspection',
    client: 'Newly licensed indoor cultivator',
    areas: ['facility-audits', 'technology-systems'],
    team: ['dusty-mclean', 'danny-davis'],
    record: {
      problem: 'The team had a license, a building, and a binder of template SOPs, but no one had walked the facility against the rules.',
      investigation: 'Mock inspection of every room, review of each SOP against the current regulations, and a test of the visitor log, camera coverage, and waste process.',
      idea: 'Most gaps were procedural, not physical. A few were physical: camera blind spots and a drain without a backflow device.',
      proposed_fix: 'Rewrite SOPs with the staff who do the work, add two cameras, fix the drain, and set up a daily log routine.',
      implementation: 'SOPs drafted, walked, and signed off room by room. Training recorded for every employee.',
      validation: 'A second mock inspection two weeks later with a fresh findings list.',
      backup_plan: 'Items that could not be fixed in time were documented with a corrective-action plan and dates.',
      cross_correlation: 'The drain finding fed into the irrigation review; the camera gaps fed into the network security plan.',
      final_report: 'Findings, fixes, photos, signed training records, and revision history delivered to the client portal.',
      follow_up: 'Monthly compliance check under a Tier 1 retainer.',
    },
  },
  {
    slug: 'uneven-irrigation',
    title: 'Plants at the far end of every row underperforming',
    client: 'Commercial indoor cultivator',
    areas: ['cultivation-processing', 'facility-audits'],
    team: ['danny-davis', 'joel-perkins', 'dusty-mclean'],
    record: {
      problem: 'The last third of each row ran smaller and showed deficiency symptoms, even though every plant was on the same feed.',
      investigation: 'Catch-cup tests at every emitter, pressure readings along each line, feed and runoff EC and pH logs, and a look at the plumbing layout.',
      idea: 'Pressure loss from a long run with many sharp elbows meant far emitters delivered less volume.',
      proposed_fix: 'Re-plumb with 45-degree fittings and a center feed, add a pressure gauge after the filter, and keep the feed recipe unchanged so the effect could be isolated.',
      implementation: 'One room re-plumbed first as a test, with the crew trained on the new layout.',
      validation: 'Emitter volumes compared before and after, plus plant measurements over the next run.',
      backup_plan: 'Pressure-compensating emitters if re-plumbing alone did not balance the room.',
      cross_correlation: 'Once delivery was even, the feed program could be tuned; sensor alerts were added for pressure drops.',
      final_report: 'Before-and-after data, the new plumbing diagram, and an updated irrigation SOP.',
      follow_up: 'Roll-out to the remaining rooms on the client’s schedule.',
    },
  },
  {
    slug: 'hemp-thc-drift',
    title: 'A hemp producer worried about pre-harvest testing',
    client: 'Licensed hemp producer',
    areas: ['agriculture-formulation', 'technology-systems'],
    team: ['dusty-mclean', 'joel-perkins'],
    record: {
      problem: 'In-house test results were creeping toward the limit as harvest approached, and the official sampling window was close.',
      investigation: 'Review of COAs and the lab’s reporting basis, recalculation of Total THC, cultivar history, and the planned harvest date.',
      idea: 'Results were trending up with maturity. Harvest timing and sampling date were the controllable variables.',
      proposed_fix: 'Schedule sampling and harvest together, track Total THC weekly on a shared dashboard, and prepare a documented remediation plan in advance.',
      implementation: 'Weekly testing schedule, Total THC tracking, and a written remediation SOP ready before sampling.',
      validation: 'Official results compared with in-house trend data.',
      backup_plan: 'If a lot tested high, follow the pre-approved remediation or disposal procedure and document every step.',
      cross_correlation: 'Cultivar selection for the next season was informed by the THC trend data.',
      final_report: 'Testing timeline, calculations, the remediation SOP, and recommendations for next season.',
      follow_up: 'Pre-season planning call before the next planting.',
    },
  },
  {
    slug: 'retail-variance',
    title: 'A dispensary with recurring inventory variances',
    client: 'Single-location dispensary',
    areas: ['dispensary-retail', 'technology-systems'],
    team: ['dusty-mclean', 'danny-davis'],
    record: {
      problem: 'Month-end counts never matched the tracking system, and staff were adjusting numbers to make them agree.',
      investigation: 'Transaction review, observation of receiving and sales, scale checks, and interviews with each shift.',
      idea: 'Receiving was recorded late, and one scale drifted. Adjustments were hiding the root causes.',
      proposed_fix: 'Record receiving at the dock, calibrate and log scales daily, require a reason for every adjustment, and add daily cycle counts.',
      implementation: 'New receiving and adjustment SOPs, staff training, and a simple daily count sheet.',
      validation: 'Variance tracked weekly for two months.',
      backup_plan: 'Escalation procedure for any unexplained variance, including when to notify the regulator.',
      cross_correlation: 'Product training for staff was added after the review showed frequent mis-rings between similar products.',
      final_report: 'Variance trend, SOPs, training records, and a dashboard for the manager.',
      follow_up: 'Quarterly reconciliation check.',
    },
  },
];
