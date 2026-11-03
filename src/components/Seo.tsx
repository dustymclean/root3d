import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { areas } from '../data/areas';
import { articles } from '../data/knowledge';
import { team } from '../data/team';

type Meta = { title: string; description: string };
const BASE = 'https://r3dconsulting.com';
const fallback: Meta = {
  title: 'Mississippi Cannabis Consulting & Compliance | Root3D',
  description: 'Root3D helps Mississippi cannabis operators with facility audits, cultivation strategy, compliance SOPs, dispensary operations, and technology systems.',
};
const pages: Record<string, Meta> = {
  '/': fallback,
  '/about': { title: 'About Root3D | Mississippi Cannabis Consultants', description: 'Meet the Root3D team combining agricultural science, cultivation, facility engineering, compliance, business technology, and practical consulting.' },
  '/services': { title: 'Cannabis Consulting Services in Mississippi | Root3D', description: 'Explore commercial facility audits, cultivation, dispensary operations, agriculture, formulation, compliance workflows, and business technology services.' },
  '/team': { title: 'Meet Our Consultants | Root3D', description: 'Four consultants working together on cannabis cultivation, agricultural inputs, facility systems, operations, regulations, and technology.' },
  '/case-studies': { title: 'Consulting Process & Illustrative Scenarios | Root3D', description: 'See how Root3D investigates, plans, documents, and validates solutions. The scenarios are illustrations, not verified client results.' },
  '/pricing': { title: 'Cannabis Consulting Pricing | Root3D', description: 'Find Root3D discovery calls, hourly consulting, and project engagement options for cannabis and agribusiness operators.' },
  '/contact': { title: 'Contact Mississippi Cannabis Consultants | Root3D', description: 'Ask Root3D Consulting about cultivation, compliance, facility inspections, retail operations, or technology services.' },
  '/resources': { title: 'Free Cultivation & Compliance Tools | Root3D', description: 'Explore SOP generators, cultivation calculators, plant troubleshooting, and source-backed guides.' },
  '/resources/sop-generator': { title: 'SOP Generator for Cannabis Operations | Root3D', description: 'Generate an editable standard operating procedure draft and review it against your applicable rules.' },
  '/resources/total-thc': { title: 'Total THC Calculator — THCA × 0.877 + Delta-9 | Root3D', description: 'Calculate estimated total THC from THCA and delta-9 THC data in a certificate of analysis.' },
  '/resources/vpd': { title: 'VPD Calculator for Indoor Cultivation | Root3D', description: 'Calculate vapor pressure deficit from temperature, humidity, and leaf-temperature offset.' },
  '/resources/troubleshooter': { title: 'Cannabis Plant Troubleshooter | Root3D', description: 'Identify possible plant stress issues from leaf symptoms and environmental clues.' },
  '/knowledge-base': { title: 'Cannabis Compliance & Cultivation Guides | Root3D', description: 'Read sourced guides to medical cannabis compliance, hemp, lab results, cultivation, facilities, and SOPs.' },
  '/news': { title: 'Cannabis Regulatory & Industry News | Root3D', description: 'Review industry and regulatory updates with links to official sources and their publication dates.' },
  '/faq': { title: 'Cannabis Consulting FAQ | Root3D', description: 'Answers to questions about cannabis consulting, inspections, cultivation, compliance, and working with Root3D.' },
  '/book': { title: 'Book a Consultation | Root3D', description: 'Schedule a discovery call or consulting session with the Root3D team.' },
};
function setMeta(selector: string, kind: string, key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(kind, key);
    document.head.appendChild(el);
  }
  el.content = value;
}
/** Client-side route metadata; static prerendering is still recommended. */
export function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
    let data = pages[path] || fallback;
    const area = areas.find(a => path === `/services/${a.slug}`);
    const person = team.find(t => path === `/team/${t.slug}`);
    const article = articles.find(a => path === `/knowledge-base/${a.slug}`);
    if (area) data = { title: `${area.title} in Mississippi | Root3D`, description: `${area.short} Consult Root3D about practical, documented operations and facility systems.` };
    if (person) data = { title: `${person.name} — ${person.title} | Root3D`, description: person.summary };
    if (article) data = { title: `${article.title} | Root3D`, description: article.summary };
    const canonicalUrl = BASE + (path === '/' ? '/' : path);
    const privatePage = /^\/(?:portal|login|signup|reset-password)(?:\/|$)/.test(path);
    document.title = data.title;
    setMeta('meta[name="description"]', 'name', 'description', data.description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', data.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', data.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[name="robots"]', 'name', 'robots', privatePage ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname]);
  return null;
}
