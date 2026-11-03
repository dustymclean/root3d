import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const BASE = 'https://r3dconsulting.com';
const slugs = file => [...readFileSync(file, 'utf8').matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const fixed = ['/', '/about', '/services', '/team', '/case-studies', '/pricing', '/contact', '/resources', '/knowledge-base', '/news', '/faq', '/resources/sop-generator', '/resources/total-thc', '/resources/vpd', '/resources/troubleshooter', '/mississippi-cannabis-consulting/', '/mississippi-hemp-consulting/', '/what-we-solve/'];
const paths = [...new Set([...fixed, ...slugs('src/data/areas.ts').map(s => `/services/${s}`), ...slugs('src/data/team.ts').map(s => `/team/${s}`), ...slugs('src/data/knowledge.ts').map(s => `/knowledge-base/${s}`)])].sort();
const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...paths.map(p => `  <url><loc>${BASE}${p}</loc></url>`), '</urlset>', ''].join('\n');
mkdirSync('public', {recursive:true});
writeFileSync('public/sitemap.xml', xml);
console.log(`Generated SEO sitemap with ${paths.length} public URLs`);
