import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <section className="section">
      <div className="container prose">
        <p className="eyebrow">Legal</p>
        <h1>Privacy policy</h1>
        <p className="muted">Last updated October 2026. This policy is a plain-language draft pending legal review.</p>
        <h2>What we collect</h2>
        <p>Your name, email, phone, company details, intake answers, booking history, messages, files you upload, and billing records. We collect only what we need to deliver consulting services.</p>
        <h2>How we use it</h2>
        <p>To schedule and run sessions, share your history among Root3D consultants so you never repeat yourself, send reminders and invoices, and meet legal and tax obligations. We never sell your data.</p>
        <h2>Who can see it</h2>
        <p>Only you and the Root3D partners. Files are stored privately and are reachable only through signed, expiring links. Our database enforces these rules on every request.</p>
        <h2>Service providers</h2>
        <p>We use a hosted database and file store, a video meeting provider for live sessions, and a payment processor for card payments. Each receives only what it needs to do its job.</p>
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
