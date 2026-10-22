export type Faq = { q: string; a: string };

export const faqGroups: { title: string; items: Faq[] }[] = [
  {
    title: 'Working with Root3D',
    items: [
      { q: 'Who are you?', a: 'Root3D is four consultants: Joel Perkins (inputs, chemistry, and margins), Danny Davis (canopy, infrastructure, and training), Dusty McLean (data, documentation, and storefronts), and Hunter Porter (regulations, molds, and devices). You can hire one of us or the whole team.' },
      { q: 'Do you grow, sell, or transport cannabis?', a: 'No. Root3D provides educational and advisory services. We do not handle cannabis for clients.' },
      { q: 'Do you work outside Mississippi?', a: 'Yes. Most of our work can be done remotely, and we travel for on-site audits and builds. State-specific guidance is researched for each engagement.' },
      { q: 'Do you guarantee results?', a: 'No. We will not promise regulatory outcomes or yield numbers. We promise to diagnose carefully, recommend honestly, help you implement, and document everything.' },
      { q: 'Are you attorneys?', a: 'No. We research rules and turn them into operations. For legal opinions and filings that need an attorney, we work alongside your counsel.' },
      { q: 'Can I hire the whole team?', a: 'Yes. Combined engagements are common for facility audits, new builds, and multi-state work. Your history is shared, so no one asks you to repeat yourself.' },
    ],
  },
  {
    title: 'Booking & sessions',
    items: [
      { q: 'How do I start?', a: 'Book a free 15-minute discovery call. It is a peer conversation, not a sales pitch. If we are not the right fit, we will tell you.' },
      { q: 'How do we meet?', a: 'On Zoom, Discord, or Signal, your choice when you book. Your consultant posts the link in your portal before the call. We never ask for or share phone numbers. Facility audits can also be done on site.' },
      { q: 'How do I reschedule or cancel?', a: 'From your portal, up to 24 hours before the session. See the cancellation policy for details.' },
      { q: 'What happens after a session?', a: 'Your consultant writes an action plan with at least three concrete steps. It appears in your portal, and you can download it.' },
      { q: 'What should I upload before a call?', a: 'Sharp, well-lit photos and video, recent lab results, environmental logs, feed charts, schematics, and any SOPs you want reviewed.' },
    ],
  },
  {
    title: 'Grow Coach Connection',
    items: [
      { q: 'Is Grow Coach only for commercial growers?', a: 'No. It is built for home growers and hobbyists as well as commercial cultivators.' },
      { q: 'How do you see my plants up close?', a: 'Upload sharp macro photos of trichomes, stomata, and pests to your pre-call inbox. A live camera feed cannot add detail the lens did not capture, so good uploads matter most.' },
      { q: 'Can I extend a session?', a: 'Yes. At 50 minutes you will be offered 15 more minutes for $25 (draft pricing).' },
      { q: 'What is in the Grow Coach Package?', a: 'A one-hour consultation and two 30-minute follow-ups with the same coach, for $300 (draft pricing).' },
    ],
  },
  {
    title: 'Pricing & payment',
    items: [
      { q: 'Is pricing final?', a: 'Not yet. Prices marked as draft are pending final approval by the partners and may change.' },
      { q: 'How do retainers work?', a: 'Retainers bill monthly on the date you choose and start once the agreement is signed. No contract, no service.' },
      { q: 'How do I pay?', a: 'Invoices appear in your portal with a payment link or instructions. Online card payment will be enabled once our payment processor has approved our account.' },
      { q: 'Do you offer refunds?', a: 'Yes, under the refund policy. Sessions cancelled more than 24 hours ahead are not charged, and if we cancel or miss a session you are not charged.' },
    ],
  },
  {
    title: 'Privacy & files',
    items: [
      { q: 'Who can see my files?', a: 'You and the Root3D partners. Files are stored privately and opened through expiring links. The database enforces this on every request.' },
      { q: 'Will you share my information?', a: 'No. We never sell data, and we only share what a service provider needs to do its job, such as sending an email or hosting a call.' },
    ],
  },
  {
    title: 'Free resources',
    items: [
      { q: 'Is the SOP Generator really free?', a: 'Yes. It creates an editable starting draft. It is not legal advice and should be reviewed against current rules before use.' },
      { q: 'How current is the Knowledge Base?', a: 'Each article shows its last review date and sources. Rules change often, so always confirm with the regulator linked in the article.' },
    ],
  },
];
