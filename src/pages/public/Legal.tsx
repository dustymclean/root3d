import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <section className="section">
      <div className="container prose">
        <p className="eyebrow">Legal</p>
        <h1>Privacy policy</h1>
        <p className="muted">Last updated October 2026. This policy is a plain-language draft pending legal review.</p>
        <h2>What we collect</h2>
        <p>Your name, email, company details, intake answers, booking history, messages, files you upload, and billing records. We collect only what we need to deliver consulting services.</p>
        <h2>How we use it</h2>
        <p>To schedule and run sessions, share your history among Root3D consultants so you never repeat yourself, send reminders and invoices, and meet legal and tax obligations. We never sell your data.</p>
        <h2>Who can see it</h2>
        <p>Only you and the Root3D partners. Files are stored privately and are reachable only through signed, expiring links. Our database enforces these rules on every request.</p>
        <h2>Service providers</h2>
        <p>We use a hosted database and file store, meeting services (Zoom, Discord, or Signal) for live sessions, and a payment processor for card payments. Each receives only what it needs to do its job.</p>
        <h2>Your choices</h2>
        <p>You can update your profile at any time and ask us to export or delete your account by <Link to="/contact">contacting us</Link>. Some billing records must be kept for tax purposes.</p>
      </div>
    </section>
  );
}

export function Terms() {
  return (
    <section className="section">
      <div className="container prose">
        <p className="eyebrow">Legal</p>
        <h1>Terms of service</h1>
        <p className="muted">Last updated October 2026. These terms are a plain-language draft pending legal review.</p>
        <h2>Our services</h2>
        <p>Root3D Consulting provides educational and advisory services. We do not grow, process, sell, or transport cannabis, and our guidance does not replace legal advice from a licensed attorney.</p>
        <h2>Bookings</h2>
        <p>You can reschedule or cancel a session yourself up to 24 hours before it starts. Cancellations inside 24 hours and missed sessions may be charged in full.</p>
        <h2>Retainers</h2>
        <p>Retainers begin only after a signed agreement: no contract, no service. They bill monthly on the date you choose and can be cancelled with written notice before the next billing date.</p>
        <h2>Payments</h2>
        <p>Invoices are due on receipt unless stated otherwise. Refunds are handled case by case and recorded in your portal.</p>
        <h2>Your content</h2>
        <p>Files and data you share remain yours. You give us permission to use them only to deliver your engagement.</p>
      </div>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="section">
      <div className="container prose">
        <p className="eyebrow">404</p>
        <h1>That page wandered off</h1>
        <p className="lede">The link may be old or mistyped.</p>
        <Link to="/" className="btn btn-primary">Back home</Link>
      </div>
    </section>
  );
}

function Policy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="section">
      <div className="container prose">
        <p className="eyebrow">Policies</p>
        <h1>{title}</h1>
        <p className="muted">Last updated October 2026. This is a plain-language draft pending business and legal review.</p>
        {children}
        <p className="small muted mt">
          Related: <Link to="/policies/payment">Payment</Link> · <Link to="/policies/cancellation">Cancellation</Link> ·{' '}
          <Link to="/policies/refunds">Refunds</Link> · <Link to="/accessibility">Accessibility</Link> · <Link to="/privacy">Privacy</Link> ·{' '}
          <Link to="/terms">Terms</Link>
        </p>
      </div>
    </section>
  );
}

export function Accessibility() {
  return (
    <Policy title="Accessibility statement">
      <p>We want everyone to be able to find us, book with us, and use their portal, including people who use screen readers, keyboard navigation, magnification, or voice control.</p>
      <h2>Our target</h2>
      <p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA across the public site and the client portal.</p>
      <h2>What we have done</h2>
      <ul>
        <li>A skip-to-content link and a logical heading order on every page</li>
        <li>Full keyboard access to navigation, booking, forms, and tools, with visible focus</li>
        <li>Text alternatives for photos and descriptive labels on controls</li>
        <li>Color contrast chosen to meet AA, and no information conveyed by color alone</li>
        <li>Animations reduced automatically when your device asks for reduced motion</li>
        <li>A choice of Zoom, Discord, or Signal, including voice-only and text chat, plus on-site visits for facility work</li>
      </ul>
      <h2>Live sessions</h2>
      <p>Sessions run on Zoom, Discord, or Signal, which are third-party services with their own terms. If you need captions, an interpreter, or another format, tell us when you book and we will arrange it or hold the session by text chat.</p>
      <h2>Tell us about a barrier</h2>
      <p>If something does not work for you, <Link to="/contact?topic=Accessibility">contact us</Link>. We will reply within two business days and, while we fix it, help you complete what you were trying to do another way.</p>
    </Policy>
  );
}

export function PaymentPolicy() {
  return (
    <Policy title="Payment policy">
      <h2>How billing works</h2>
      <ul>
        <li>Paid sessions create an invoice in your portal when you book.</li>
        <li>Fixed-fee projects are quoted in writing and invoiced as described in the signed proposal or statement of work, which may include a deposit or milestone payments.</li>
        <li>Retainers bill monthly on the day of the month you choose (the 1st through the 28th) and begin only after the agreement is signed. No contract, no service.</li>
        <li>Session extensions are $25 per additional 15 minutes and are added to your invoice.</li>
      </ul>
      <h2>How to pay</h2>
      <p>Each invoice shows a payment link or payment instructions. Online card payment, card holds at booking, and automatic retainer billing will be enabled only after our payment processor has approved Root3D for cannabis-related consulting. Until then, we will never ask for card details by email or message.</p>
      <h2>Due dates and late payment</h2>
      <p>Session invoices are due by the session date. Project and retainer invoices are due on the date shown. If a retainer invoice is unpaid, retainer services may pause until the account is current.</p>
      <h2>Taxes and receipts</h2>
      <p>Applicable taxes are shown on the invoice. Paid invoices are marked in your portal and serve as your receipt.</p>
      <h2>Pricing</h2>
      <p>Prices marked as draft are pending final approval and may change. The price on your invoice at the time of booking is the price you pay.</p>
    </Policy>
  );
}

export function CancellationPolicy() {
  return (
    <Policy title="Cancellation & rescheduling policy">
      <h2>Sessions</h2>
      <ul>
        <li>Reschedule or cancel from your portal up to 24 hours before the start time at no charge. The invoice for a cancelled session is voided.</li>
        <li>Cancellations within 24 hours are recorded as late and may be charged in full.</li>
        <li>If you miss a session without notice, it is recorded as a no-show and may be charged in full.</li>
        <li>If you are running late, message your consultant. Sessions end at the scheduled time unless you add an extension.</li>
      </ul>
      <h2>If we cancel</h2>
      <p>If a consultant has to cancel or misses a session, you will not be charged and we will help you rebook at the next available time, or refund anything you paid.</p>
      <h2>On-site visits</h2>
      <p>On-site visits may involve travel booked in advance. The proposal for the visit will state any non-refundable travel costs and the cancellation window that applies.</p>
      <h2>Retainers</h2>
      <p>Retainers are month to month. Cancel with written notice before your next billing date, and service continues through the end of the period you have paid for.</p>
      <h2>Emergencies</h2>
      <p>We understand that crops and inspections do not keep office hours. Tell us what happened; we waive late-cancellation charges for genuine emergencies at our discretion.</p>
    </Policy>
  );
}

export function RefundPolicy() {
  return (
    <Policy title="Refund policy">
      <h2>When you are not charged or are refunded</h2>
      <ul>
        <li>Sessions cancelled more than 24 hours ahead: the invoice is voided, or any payment is refunded.</li>
        <li>Sessions we cancel or miss: full refund, or a free rebooking if you prefer.</li>
        <li>Technical failure on our side that prevents a session: full refund or rebooking.</li>
        <li>Duplicate or incorrect charges: refunded once confirmed.</li>
      </ul>
      <h2>When refunds are reviewed case by case</h2>
      <ul>
        <li>Late cancellations and no-shows</li>
        <li>Completed sessions where you feel something went wrong. Tell us within 7 days and a partner will review it with you.</li>
        <li>Fixed-fee projects, according to the deliverables and milestones in your signed proposal</li>
        <li>Partial retainer months</li>
      </ul>
      <h2>How to request one</h2>
      <p>Open a support ticket in your portal or <Link to="/contact?topic=Refund%20request">contact us</Link> with the invoice number. Every refund decision and amount is recorded on the invoice in your portal.</p>
      <h2>Timing</h2>
      <p>Approved refunds are issued to the original payment method where possible. How long it takes to appear depends on the payment method and provider.</p>
    </Policy>
  );
}
