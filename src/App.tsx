import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/Guards';
import { Layout } from './components/Layout';
import { Book } from './pages/Book';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { GrowCoach } from './pages/public/GrowCoach';
import { ArticlePage, CaseStudies, Faq, KnowledgeBase } from './pages/public/Knowledge';
import { Resources, SopGenerator, ThcCalculator, Troubleshooter, VpdCalculator } from './pages/public/Tools';
import { Home } from './pages/public/Home';
import { Accessibility, CancellationPolicy, NotFound, PaymentPolicy, Privacy, RefundPolicy, Terms } from './pages/public/Legal';
import { Login, ResetPassword } from './pages/public/Login';
import { Pricing } from './pages/public/Pricing';
import { AreaPage, Services } from './pages/public/Services';
import { Team, TeamProfile } from './pages/public/Team';
import { AppointmentDetail, Appointments } from './pages/portal/Appointments';
import { Agreements, Files, InvoiceDetail, Invoices, Plans, ProfilePage } from './pages/portal/ClientPages';
import { Messages } from './pages/portal/Messages';
import { Overview } from './pages/portal/Overview';
import { PortalLayout } from './pages/portal/PortalLayout';
import { ProjectDetail, Projects } from './pages/portal/Projects';
import { ClientDetail, Clients } from './pages/portal/admin/Clients';
import { AuditAdmin, Billing, InboxAdmin, Schedule, ServicesAdmin, TimeTracking, UsersAdmin } from './pages/portal/admin/Manage';
import { AdminOverview } from './pages/portal/admin/Overview';
import { useAuth } from './store/auth';

export function App() {
  const init = useAuth((s) => s.init);
  useEffect(() => init(), [init]);

  const admin = (el: JSX.Element) => <RequireAuth admin>{el}</RequireAuth>;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:slug" element={<AreaPage />} />
        <Route path="grow-coach" element={<GrowCoach />} />
        <Route path="case-studies" element={<CaseStudies />} />
        <Route path="resources" element={<Resources />} />
        <Route path="resources/sop-generator" element={<SopGenerator />} />
        <Route path="resources/total-thc" element={<ThcCalculator />} />
        <Route path="resources/vpd" element={<VpdCalculator />} />
        <Route path="resources/troubleshooter" element={<Troubleshooter />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        <Route path="knowledge-base/:slug" element={<ArticlePage />} />
        <Route path="faq" element={<Faq />} />
        <Route path="accessibility" element={<Accessibility />} />
        <Route path="policies/payment" element={<PaymentPolicy />} />
        <Route path="policies/cancellation" element={<CancellationPolicy />} />
        <Route path="policies/refunds" element={<RefundPolicy />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="team" element={<Team />} />
        <Route path="team/:slug" element={<TeamProfile />} />
        <Route path="contact" element={<Contact />} />
        <Route path="book" element={<Book />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Login initial="signup" />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="portal" element={<RequireAuth><PortalLayout /></RequireAuth>}>
          <Route index element={<Overview />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/:id" element={<AppointmentDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:id" element={<Messages />} />
          <Route path="files" element={<Files />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="plans" element={<Plans />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="agreements" element={<Agreements />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={admin(<AdminOverview />)} />
          <Route path="admin/clients" element={admin(<Clients />)} />
          <Route path="admin/clients/:id" element={admin(<ClientDetail />)} />
          <Route path="admin/schedule" element={admin(<Schedule />)} />
          <Route path="admin/services" element={admin(<ServicesAdmin />)} />
          <Route path="admin/billing" element={admin(<Billing />)} />
          <Route path="admin/time" element={admin(<TimeTracking />)} />
          <Route path="admin/inbox" element={admin(<InboxAdmin />)} />
          <Route path="admin/users" element={admin(<UsersAdmin />)} />
          <Route path="admin/audit" element={admin(<AuditAdmin />)} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
