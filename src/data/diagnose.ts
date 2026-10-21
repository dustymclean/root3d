/** A troubleshooting decision tree for common leaf symptoms. Educational only; it narrows the possibilities, it does not diagnose. */

export type Node =
  | { id: string; question: string; options: { label: string; next: string }[] }
  | { id: string; result: string; likely: string[]; checkFirst: string[]; next: string[]; article?: string };

export const nodes: Node[] = [
  {
    id: 'start',
    question: 'What are you seeing?',
    options: [
      { label: 'Yellowing or discolored leaves', next: 'where' },
      { label: 'Spots, burnt edges, or tips', next: 'spots' },
      { label: 'Twisted, glossy, or stunted new growth', next: 'twist' },
      { label: 'White powder or fuzzy growth', next: 'pm' },
      { label: 'Tiny dots, webbing, or visible bugs', next: 'bugs' },
      { label: 'Drooping or clawing leaves', next: 'droop' },
    ],
  },
  {
    id: 'where',
    question: 'Where did it start?',
    options: [
      { label: 'Older, lower leaves', next: 'lower' },
      { label: 'New growth at the top', next: 'upper' },
    ],
  },
  {
    id: 'lower',
    question: 'What does the yellowing look like?',
    options: [
      { label: 'Even yellowing of the whole leaf', next: 'r-n' },
      { label: 'Yellow between the veins, veins stay green', next: 'r-mg' },
      { label: 'Yellow or brown edges that look scorched', next: 'r-k' },
    ],
  },
  {
    id: 'upper',
    question: 'What does the new growth look like?',
    options: [
      { label: 'Pale or yellow between the veins', next: 'r-fe' },
      { label: 'Twisted or deformed as well', next: 'twist' },
    ],
  },
  {
    id: 'spots',
    question: 'What kind of spots?',
    options: [
      { label: 'Rusty brown spots, often on middle leaves', next: 'r-ca' },
      { label: 'Burnt tips that curl up', next: 'r-burn' },
      { label: 'Spots with yellow halos, spreading', next: 'r-path' },
    ],
  },
  {
    id: 'twist',
    question: 'Do you see any pests with a 60× loupe?',
    options: [
      { label: 'No pests visible, I have not used magnification', next: 'r-look' },
      { label: 'Tiny pale or tan specks on new growth', next: 'r-mites' },
      { label: 'Nothing, even with magnification', next: 'r-twist' },
    ],
  },
  {
    id: 'bugs',
    question: 'Which describes it best?',
    options: [
      { label: 'Fine stippling and webbing under leaves', next: 'r-spider' },
      { label: 'Small flies around the media', next: 'r-gnats' },
      { label: 'Silvery streaks and black specks', next: 'r-thrips' },
    ],
  },
  {
    id: 'droop',
    question: 'How do the leaves look?',
    options: [
      { label: 'Heavy, dark, curled down like a claw', next: 'r-claw' },
      { label: 'Limp and soft, media is wet', next: 'r-over' },
      { label: 'Limp and thin, media is dry', next: 'r-under' },
    ],
  },
  { id: 'pm', result: 'Possible powdery mildew', likely: ['Powdery mildew'], checkFirst: ['Overnight humidity and temperature swings', 'Airflow under the canopy'], next: ['Isolate affected plants', 'Correct environment before treating', 'Use only state-approved controls and log every application'], article: 'ipm-fundamentals' },
  { id: 'r-n', result: 'Possible nitrogen deficiency', likely: ['Nitrogen deficiency', 'Normal late-flower fade', 'pH out of range causing lockout'], checkFirst: ['Input and runoff pH', 'Feed EC and runoff EC'], next: ['Correct pH before adding nutrients', 'Compare feed strength with your program', 'Photograph and log the progression'] },
  { id: 'r-mg', result: 'Possible magnesium deficiency', likely: ['Magnesium deficiency', 'Calcium–magnesium imbalance', 'pH lockout'], checkFirst: ['Root-zone pH', 'Whether you use RO or soft water'], next: ['Correct pH first', 'Review Ca:Mg in your feed', 'Watch whether new leaves stay clean'] },
  { id: 'r-k', result: 'Possible potassium issue', likely: ['Potassium deficiency', 'Salt build-up', 'Heat stress'], checkFirst: ['Runoff EC compared with feed EC', 'Leaf surface temperature'], next: ['Flush or adjust feed if runoff EC is high', 'Check canopy temperature', 'Log and compare over several days'] },
  { id: 'r-fe', result: 'Possible iron or micronutrient lockout', likely: ['Iron deficiency, often from high pH', 'Root-zone problems', 'Overwatering'], checkFirst: ['Root-zone pH', 'Root health and smell'], next: ['Bring pH into range', 'Inspect roots', 'Avoid adding micronutrients until pH is corrected'] },
  { id: 'r-ca', result: 'Possible calcium issue', likely: ['Calcium deficiency', 'pH lockout', 'Low transpiration from high humidity'], checkFirst: ['pH', 'VPD in the room'], next: ['Correct pH and environment', 'Review calcium in your feed', 'Track whether new spots appear'], article: 'vpd-basics' },
  { id: 'r-burn', result: 'Possible nutrient burn', likely: ['Feed too strong', 'Salt build-up in media'], checkFirst: ['Feed EC against your program', 'Runoff EC'], next: ['Reduce feed strength', 'Flush if runoff is far above feed', 'Watch new growth over the next week'] },
  { id: 'r-path', result: 'Possible fungal or bacterial leaf spot', likely: ['Leaf spot pathogen', 'Septoria or similar'], checkFirst: ['Humidity and leaf wetness', 'Whether spots are spreading'], next: ['Remove and bag affected leaves', 'Improve airflow and lower humidity', 'Get an identification before treating'], article: 'ipm-fundamentals' },
  { id: 'r-look', result: 'Look closer before you treat', likely: ['Russet or broad mites', 'Herbicide or chemical exposure', 'Heat or light stress'], checkFirst: ['Inspect new growth at 60× or under a microscope', 'Recent sprays or new inputs'], next: ['Get magnified photos into your pre-call inbox', 'Quarantine affected plants', 'Book a quick call before spraying anything'], article: 'ipm-fundamentals' },
  { id: 'r-mites', result: 'Possible russet or broad mites', likely: ['Hemp russet mite', 'Broad mite'], checkFirst: ['Confirm under magnification', 'How many rooms are affected'], next: ['Isolate plants and control traffic between rooms', 'Use only state-approved controls', 'Plan a clean-stock reset if mothers are infested'], article: 'ipm-fundamentals' },
  { id: 'r-twist', result: 'Possible environmental or genetic cause', likely: ['Light or heat stress', 'Genetic mutation', 'Viroid infection such as HLVd'], checkFirst: ['Light distance and intensity', 'Whether one cultivar or many are affected'], next: ['Adjust light and heat', 'Consider a viroid test on the mother', 'Book a Grow Coach session with photos'], article: 'tissue-culture-basics' },
  { id: 'r-spider', result: 'Possible spider mites', likely: ['Two-spotted spider mite'], checkFirst: ['Leaf undersides', 'Low humidity and high heat'], next: ['Isolate and scout every room', 'Use only state-approved controls', 'Log location, count, and treatment'], article: 'ipm-fundamentals' },
  { id: 'r-gnats', result: 'Possible fungus gnats', likely: ['Fungus gnats'], checkFirst: ['How wet the media stays between waterings'], next: ['Let the top of the media dry between waterings', 'Use sticky traps to monitor', 'Consider approved biological controls'], article: 'ipm-fundamentals' },
  { id: 'r-thrips', result: 'Possible thrips', likely: ['Thrips'], checkFirst: ['Blue or yellow sticky traps', 'Leaf undersides and flowers'], next: ['Isolate and scout', 'Use only state-approved controls', 'Log and track counts weekly'], article: 'ipm-fundamentals' },
  { id: 'r-claw', result: 'Possible nitrogen excess or overwatering', likely: ['Too much nitrogen', 'Overwatering', 'Root-zone oxygen problems'], checkFirst: ['Feed program in veg and early flower', 'Watering frequency'], next: ['Reduce nitrogen', 'Let media dry back', 'Check drainage'] },
  { id: 'r-over', result: 'Possible overwatering', likely: ['Overwatering', 'Poor drainage', 'Root rot starting'], checkFirst: ['Pot weight before watering', 'Root color and smell'], next: ['Water by weight, not by schedule', 'Improve drainage and airflow', 'Inspect roots'], article: 'irrigation-friction-loss' },
  { id: 'r-under', result: 'Possible underwatering or uneven irrigation', likely: ['Underwatering', 'Emitters delivering unevenly'], checkFirst: ['Catch-cup test across emitters', 'Pressure at the end of the line'], next: ['Balance irrigation pressure', 'Adjust volume per event', 'Log and compare'], article: 'irrigation-friction-loss' },
];

export const findNode = (id: string) => nodes.find((n) => n.id === id)!;
