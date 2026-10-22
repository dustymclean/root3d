/** Question ideas shown at the last booking step, so clients who are unsure what to ask have a starting point. */

export const consultantPrompts: Record<string, string[]> = {
  'joel-perkins': [
    'Can you review my nutrient program and inputs for what my plants actually need?',
    'How do I check my suppliers and inputs for heavy-metal or contamination risk?',
    'How should I structure wholesale or distribution as I scale?',
  ],
  'danny-davis': [
    'Can you help me track down a recurring plant-health or irrigation problem?',
    'Is my room environment (temperature, humidity, airflow) set up right?',
    'How do I tighten biosecurity and clean-entry procedures in my facility?',
  ],
  'dusty-mclean': [
    'How do I make my records and SOPs inspection-ready?',
    'Where are the gaps between my inventory counts and my tracking system?',
    'Can we simplify my website, storefront, or business systems?',
  ],
  'hunter-porter': [
    'Which regulations and inspection requirements apply to my business?',
    'How do I spot and prevent mold or contamination problems early?',
    'Are my controllers, sensors, and electrical setup working the way they should?',
  ],
};

export const servicePrompts: Record<string, string[]> = {
  discovery: [
    'Which Root3D service fits what I need?',
    'What should I gather before a full session?',
    'What would a first engagement with you look like?',
  ],
  standard: [
    'Please review the documents I uploaded and tell me what to fix first.',
    'What are the three most important changes I should make this month?',
    'What should I measure to know whether the fix worked?',
  ],
};

export const fallbackPrompts = ['What is the biggest risk in my operation right now?', 'What should I prepare before our call?'];
