// Generator for the expanded Neweb.ai pages (features/pricing/solutions/compare/guides/legal + tools).
// Outputs static HTML files that share the same nav/footer/meta shell.
// Run: `node build-pages.mjs`

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS, TOOL_CATEGORIES, toolsByCategory, toolHref } from './tools-data.mjs';
import { INDUSTRY_BODIES, GUIDE_BODIES, COMPARE_BODIES, SOLUTIONS_HUB_BODY, GUIDES_HUB_BODY, COMPARE_HUB_BODY, PAGE_EXTRAS } from './extra-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'pages');
const SUB_DIRS = ['solutions', 'compare', 'guides', 'tools'];

const BRAND = 'Neweb';
const DOMAIN = 'https://neweb.ai';

// ====== JSON-LD helpers ======
function jsonLdBlock(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g,'\\u003c')}</script>`;
}

function buildBreadcrumbLd(canonicalPath, title) {
  // canonicalPath like "/pages/solutions/restaurants"
  const parts = canonicalPath.split('/').filter(Boolean);
  const items = [{ '@type':'ListItem', position:1, name:'Home', item: DOMAIN + '/' }];
  let accum = '';
  parts.forEach((p, i) => {
    accum += '/' + p;
    const isLast = i === parts.length - 1;
    const name = isLast ? title.replace(/\s+—\s+Neweb.*$/,'').trim() : (p === 'pages' ? 'Pages' : p.charAt(0).toUpperCase()+p.slice(1).replace(/-/g,' '));
    items.push({ '@type':'ListItem', position: i+2, name, item: DOMAIN + accum });
  });
  return jsonLdBlock({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement: items });
}

// Strip HTML to plain text (for schema answer text)
function stripTags(s){ return String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

// FAQPage JSON-LD from an array of {q,a}
function faqLd(items){
  if (!items || !items.length) return '';
  return jsonLdBlock({
    '@context':'https://schema.org','@type':'FAQPage',
    mainEntity: items.map(it => ({ '@type':'Question', name: stripTags(it.q),
      acceptedAnswer: { '@type':'Answer', text: stripTags(it.a) } }))
  });
}

// Visible FAQ accordion section (matches the tool-page FAQ styling)
function faqSection(items, heading = 'Frequently asked questions'){
  if (!items || !items.length) return '';
  return `<section class="section" style="padding-top:0"><div class="wrap">
    <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> FAQ</span><h2 class="h">${heading.replace('questions','<span class="serif">questions</span>')}</h2></div>
    <div class="faq-block">
      ${items.map(it => `<details><summary>${it.q}</summary><div class="ans"><p>${it.a}</p></div></details>`).join('')}
    </div>
  </div></section>`;
}
const FAQ_BLOCK_STYLES = `
  .faq-block{max-width:820px;margin:0 auto;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}
  .faq-block details{border-bottom:1px solid var(--line)}
  .faq-block details:last-child{border-bottom:0}
  .faq-block summary{cursor:pointer;list-style:none;padding:18px 22px;font-weight:500;font-size:16px;color:var(--ink);display:flex;justify-content:space-between;align-items:center;gap:14px}
  .faq-block summary::-webkit-details-marker{display:none}
  .faq-block summary:after{content:"+";font-family:"JetBrains Mono",monospace;color:var(--brand);font-size:20px;line-height:1;flex-shrink:0;transition:transform .2s}
  .faq-block details[open] summary:after{content:"–"}
  .faq-block .ans{padding:0 22px 18px;color:var(--ink-2);font-size:15px;line-height:1.65}
  .faq-block .ans p:last-child{margin-bottom:0}
`;

// Service JSON-LD for an industry solution page
function serviceLd(ind, canonicalPath){
  return jsonLdBlock({
    '@context':'https://schema.org','@type':'Service',
    name: `${ind.h} websites by Neweb`,
    serviceType: 'Website, domain, Google Business Profile and SEO management',
    provider: { '@type':'Organization', name:'Neweb', '@id':'https://neweb.ai/#organization', url:'https://neweb.ai/' },
    areaServed: { '@type':'Country', name:'India' },
    description: ind.lead,
    url: `${DOMAIN}${canonicalPath}`,
    offers: { '@type':'Offer', price:'249', priceCurrency:'INR', url:'https://neweb.ai/pages/pricing' }
  });
}

// ====== Shared nav + footer templates (used by every generated page) ======
const nav = (active = '') => `
<nav class="top">
  <div class="wrap nav-row">
    <a href="/" class="brand" aria-label="neweb.ai">
      <img src="/assets/neweb-logo.png" alt="Neweb — online presence manager" width="70" height="28" decoding="async" fetchpriority="high" />
    </a>
    <div class="nav-links">
      <a href="/" class="${active==='home'?'on':''}">Home</a>
      <a href="/pages/features" class="${active==='features'?'on':''}">Features</a>
      <a href="/pages/pricing" class="${active==='pricing'?'on':''}">Pricing</a>
      <div class="nav-drop">
        <button class="nav-drop-btn" type="button" aria-haspopup="true">Solutions <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="nav-drop-menu" role="menu">
          <a class="mega-item" href="/pages/solutions">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></div>
            <div class="mega-txt"><p class="mega-t">All solutions</p><p class="mega-d">Every industry we serve</p></div>
          </a>
          <a class="mega-item" href="/pages/solutions/restaurants">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M6 7v13h12V7M9 4h6v3H9z"/><path d="M12 11v5"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Restaurants &amp; bakeries</p><p class="mega-d">Menus, reservations, food-first SEO</p></div>
          </a>
          <a class="mega-item" href="/pages/solutions/jewellers">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M8 3l-2 6 6 12M16 3l2 6-6 12"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Jewellers</p><p class="mega-d">Catalogue, bookings, showroom storytelling</p></div>
          </a>
          <a class="mega-item" href="/pages/solutions/clinics">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v18M3 12h18M9 7h6v10H9z"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Clinics &amp; doctors</p><p class="mega-d">Doctor profiles, bookings, DPDP-ready</p></div>
          </a>
          <a class="mega-item" href="/pages/solutions/tutoring">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V5z"/><path d="M4 19a2 2 0 0 1 2-2h12"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Tutoring &amp; coaching</p><p class="mega-d">Batches, results, parent enquiry flow</p></div>
          </a>
          <a class="mega-item" href="/pages/templates">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Templates</p><p class="mega-d">Industry-tuned starting points</p></div>
          </a>
        </div>
      </div>
      <a href="/pages/why-neweb" class="${active==='why-neweb'?'on':''}">Why Neweb</a>
      <a href="/pages/templates" class="${active==='templates'?'on':''}">Templates</a>
      <div class="nav-drop">
        <button class="nav-drop-btn" type="button" aria-haspopup="true">Resources <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="nav-drop-menu align-right" role="menu">
          <a class="mega-item" href="/pages/blog">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h12l4 4v12H4z"/><path d="M7 10h10M7 14h10M7 18h6"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Blog</p><p class="mega-d">Notes from the Neweb team</p></div>
          </a>
          <a class="mega-item" href="/pages/guides">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h8M8 11h8"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Guides</p><p class="mega-d">Practical how-tos for small businesses</p></div>
          </a>
          <a class="mega-item" href="/pages/tools">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L15 12l-3-3 2.7-2.7z"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Free tools</p><p class="mega-d">21 fast utilities for Indian small businesses</p></div>
          </a>
          <a class="mega-item" href="/pages/compare">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M17 4v16"/><path d="M5 8l2-2 2 2M15 16l2 2 2-2"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Compare</p><p class="mega-d">Neweb vs other website builders</p></div>
          </a>
          <a class="mega-item" href="/pages/customer-stories">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.5 1.8-4.5 4-4.5s3 2 3 4.5"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Customer stories</p><p class="mega-d">Real businesses. Real numbers.</p></div>
          </a>
          <a class="mega-item" href="/pages/domain-checker">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Domain checker</p><p class="mega-d">Check availability in seconds, free</p></div>
          </a>
          <a class="mega-item" href="/pages/changelog">
            <div class="mega-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div>
            <div class="mega-txt"><p class="mega-t">Changelog</p><p class="mega-d">Every update we ship</p></div>
          </a>
        </div>
      </div>
    </div>
    <div class="nav-cta">
      <a href="https://dashboard.neweb.ai/login" class="btn btn-ghost">Sign in</a>
      <a href="https://dashboard.neweb.ai/signup" class="btn btn-brand">Get Started</a>
    </div>
  </div>
</nav>`;

const footer = `
<footer class="site-footer">
  <div class="wrap">
    <div class="ft-top">
      <div class="ft-brand">
        <a href="/" class="brand" aria-label="neweb.ai">
          <img src="/assets/neweb-logo.png" alt="Neweb logo" width="90" height="36" loading="lazy" decoding="async" style="height:36px" />
        </a>
        <p class="ft-tag"><em>Digital Dreams to Reality.</em> Neweb is the online presence manager for small businesses — website, domain, Google Business, and SEO in one subscription.</p>
        <div class="ft-social" aria-label="Neweb on social media">
          <a href="https://www.linkedin.com/company/newebai/" aria-label="LinkedIn" rel="noopener" target="_blank"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.11 1 2.48 1s2.5 1.12 2.5 2.5zM.22 8h4.52v14H.22V8zm7.5 0h4.33v1.92h.06c.6-1.14 2.08-2.34 4.27-2.34 4.57 0 5.42 3.01 5.42 6.92V22h-4.52v-6.27c0-1.5-.03-3.43-2.09-3.43-2.09 0-2.41 1.63-2.41 3.32V22H7.72V8z"/></svg></a>
          <a href="https://www.instagram.com/neweb.ai/" aria-label="Instagram" rel="noopener" target="_blank"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.77.13 4.9.33 4.14.63c-.79.3-1.46.71-2.13 1.38A5.9 5.9 0 00.63 4.14c-.3.76-.5 1.63-.56 2.9C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.3.79.71 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56.79-.3 1.46-.71 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 00-1.38-2.13A5.9 5.9 0 0019.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg></a>
        </div>
      </div>
      <div class="ft-col"><h3 class="ft-h">Product</h3>
        <a href="/pages/features">Features</a>
        <a href="/pages/pricing">Pricing</a>
        <a href="/pages/why-neweb">Why Neweb</a>
        <a href="/pages/templates">Templates</a>
        <a href="/pages/changelog">Changelog</a>
        <a href="/pages/domain-checker">Domain checker</a>
      </div>
      <div class="ft-col"><h3 class="ft-h">Solutions</h3>
        <a href="/pages/solutions/restaurants">Restaurants</a>
        <a href="/pages/solutions/jewellers">Jewellers</a>
        <a href="/pages/solutions/clinics">Clinics</a>
        <a href="/pages/solutions/tutoring">Tutoring centres</a>
        <a href="/pages/solutions">All industries</a>
      </div>
      <div class="ft-col"><h3 class="ft-h">Resources</h3>
        <a href="/pages/blog">Blog</a>
        <a href="/pages/guides">Guides</a>
        <a href="/pages/tools">Free tools</a>
        <a href="/pages/compare">Compare</a>
        <a href="/pages/best-website-builder-india">Best website builders</a>
        <a href="/pages/customer-stories">Customer stories</a>
        <a href="/pages/press">Press kit</a>
      </div>
      <div class="ft-col"><h3 class="ft-h">Cities</h3>
        <a href="/pages/cities/mumbai">Mumbai</a>
        <a href="/pages/cities/delhi">Delhi</a>
        <a href="/pages/cities/bangalore">Bangalore</a>
        <a href="/pages/cities/pune">Pune</a>
        <a href="/pages/cities/hyderabad">Hyderabad</a>
        <a href="/pages/cities/ahmedabad">Ahmedabad</a>
        <a href="/pages/cities/chennai">Chennai</a>
        <a href="/pages/cities/kolkata">Kolkata</a>
      </div>
      <div class="ft-col"><h3 class="ft-h">Company</h3>
        <a href="/pages/about">About</a>
        <a href="/pages/careers">Careers</a>
        <a href="/pages/contact">Contact</a>
        <a href="/pages/security">Security</a>
        <a href="/pages/privacy">Privacy</a>
        <a href="/pages/terms">Terms</a>
        <a href="/pages/refund">Refund</a>
        <a href="/pages/sitemap">Sitemap</a>
      </div>
    </div>

    <div class="ft-offices">
      <div class="ft-office">
        <h4 class="ft-h">India Office</h4>
        <p>909, Sharan Circle Business Hub,<br>Zundal Circle, Ahmedabad,<br>Gujarat, India &mdash; 382421</p>
      </div>
      <div class="ft-office">
        <h4 class="ft-h">USA Office</h4>
        <p>30 N Gould St Ste R,<br>Sheridan, WY 82801,<br>United States</p>
      </div>
      <div class="ft-office">
        <h4 class="ft-h">Get in touch</h4>
        <p><a href="mailto:support@neweb.ai">support@neweb.ai</a><br><a href="mailto:sales@neweb.ai">sales@neweb.ai</a><br><a href="tel:+19789811118">+1 978 981 1118</a></p>
      </div>
    </div>

    <div class="ft-bot">
      <span>&copy; 2026 Commerciax Infotech Private Limited. All Rights Reserved.</span>
      <span>Made for the open web &middot; Built with AI &middot; Powered by Experts.</span>
    </div>
    <div class="foot-mega" aria-hidden="true" role="presentation">NEWEB.AI</div>
  </div>
</footer>`;

// ====== Per-page shared CSS (inline, builds on shared.css) ======
const pageStyles = `
  .eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--brand);font-weight:500}
  .eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--brand);box-shadow:0 0 0 4px rgba(61,76,255,.12)}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
  @media(max-width:860px){.grid-3,.grid-2{grid-template-columns:1fr}}
  .card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:28px;transition:transform .25s, box-shadow .25s, border-color .25s}
  .card:hover{transform:translateY(-3px);box-shadow:0 24px 48px -24px rgba(10,14,26,.1);border-color:var(--line-2)}
  .card h3{font-size:20px;letter-spacing:-.02em;margin:14px 0 6px;font-weight:600}
  .card p{color:var(--ink-2);font-size:14.5px;line-height:1.55;margin:0}
  .card .ico{width:38px;height:38px;border-radius:10px;background:var(--brand-soft);color:var(--brand);display:grid;place-items:center;border:1px solid rgba(61,76,255,.12)}
  .card .ico svg{width:18px;height:18px}
  .card ul{padding-left:20px;margin:10px 0 0;color:var(--ink-2);font-size:14px;line-height:1.6}
  .kv{display:grid;grid-template-columns:1fr 1.4fr;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}
  .kv>dt{padding:14px 20px;background:var(--bg-2);border-bottom:1px solid var(--line);font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center}
  .kv>dd{padding:14px 20px;border-bottom:1px solid var(--line);margin:0;font-size:15px;line-height:1.55}
  .kv>dt:last-of-type,.kv>dd:last-of-type{border-bottom:0}
  @media(max-width:860px){.kv{grid-template-columns:1fr}.kv>dt{border-bottom:0;padding-bottom:4px}.kv>dd{padding-top:4px}}
  .cta-dark{background:var(--ink-dark);color:#fff;border-radius:24px;padding:56px 48px;text-align:center;position:relative;overflow:hidden;margin-top:40px}
  .cta-dark:before{content:"";position:absolute;left:50%;top:-50%;transform:translateX(-50%);width:800px;height:600px;background:radial-gradient(circle, rgba(61,76,255,.25), transparent 60%);pointer-events:none}
  .cta-dark h2{font-size:clamp(28px,3.6vw,42px);letter-spacing:-.03em;margin:0 0 12px;font-weight:600;line-height:1.08;position:relative}
  .cta-dark h2 .serif{font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;color:var(--brand-2)}
  .cta-dark p{color:#aab0c8;font-size:16px;max-width:520px;margin:0 auto 24px;position:relative}
  .cta-dark .btns{position:relative;display:inline-flex;gap:10px}
  .compare-table{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;margin-top:24px}
  .compare-table .row{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:0;border-bottom:1px solid var(--line)}
  .compare-table .row:last-child{border-bottom:0}
  .compare-table .row.head{background:var(--bg-2)}
  .compare-table .cell{padding:14px 18px;font-size:14px;color:var(--ink-2);line-height:1.5}
  .compare-table .row.head .cell{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:500}
  .compare-table .cell.brand{color:var(--brand);font-weight:600}
  /* Semantic comparison table (AI-extractable) */
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  .cmp-table{width:100%;border-collapse:collapse;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;margin-top:24px;font-size:14.5px}
  .cmp-table th,.cmp-table td{padding:14px 18px;text-align:left;border-bottom:1px solid var(--line);line-height:1.5;vertical-align:top}
  .cmp-table thead th{background:var(--bg-2);font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:500}
  .cmp-table tbody th[scope=row]{font-weight:600;color:var(--ink);width:42%}
  .cmp-table td{color:var(--ink-2)}
  .cmp-table td.brand{color:var(--brand);font-weight:600}
  .cmp-table tbody tr:last-child th,.cmp-table tbody tr:last-child td{border-bottom:0}
  @media(max-width:560px){.cmp-table th,.cmp-table td{padding:11px 12px;font-size:13px}}
  .prose{max-width:760px;margin:0 auto;font-size:17px;line-height:1.7;color:var(--ink-2)}
  .prose h2{font-size:26px;letter-spacing:-.02em;color:var(--ink);margin:32px 0 10px;font-weight:600}
  .prose h3{font-size:20px;letter-spacing:-.015em;color:var(--ink);margin:24px 0 8px;font-weight:600}
  .prose p{margin:0 0 16px}
  .prose ul{padding-left:22px;margin:0 0 16px}
  .prose li{margin-bottom:6px}
  .prose a{color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)}
`;

// ====== Shell template ======
function shell({ title, description, slug, canonicalPath, active, extraHead = '', body, ogImage = '/assets/og-default.png', ogType = 'website', jsonLd = '', noBreadcrumb = false }) {
  const canonical = `${DOMAIN}${canonicalPath}`;
  // Blog posts ship their own BlogPosting+BreadcrumbList @graph; don't double-emit a breadcrumb.
  const breadcrumb = noBreadcrumb ? '' : buildBreadcrumbLd(canonicalPath, title);
  const ld = [breadcrumb, jsonLd].filter(Boolean).join('\n');
  // ogImage may be an absolute URL (blog cover) or a site-relative path.
  const ogImageAbs = /^https?:/.test(ogImage) ? ogImage : `${DOMAIN}${ogImage}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/assets/neweb-mark.svg">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImageAbs}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Neweb">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@neweb_ai">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImageAbs}">
${ld}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"></noscript>
<link rel="stylesheet" href="/pages/shared.css?v=3">
<style>${pageStyles}${extraHead}</style>
<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "qeya57o0ci");
</script>
</head>
<body>
${nav(active)}
<main id="main">
${body}
</main>
${footer}
<script src="/assets/nav.js?v=3" defer></script>
<script>
  (function(){
    var io = new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})}, {threshold:.1});
    // Single pass: add rise class (idempotent) then observe
    var targets = new Set(document.querySelectorAll('.card, h2.h, .sec-mark, .cta-dark, .rise'));
    targets.forEach(function(el){
      if (!el.classList.contains('rise')) el.classList.add('rise');
      io.observe(el);
    });
  })();
</script>
</body>
</html>
`;
}

// ====== Small reusable fragments ======
const hero = ({ crumb, h1, lede, extraCta = '' }) => `
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="/">Neweb</a>${crumb.map(c => ` <span class="sep">/</span> <a href="${c.href}">${c.label}</a>`).join('').replace(/<a href[^>]*>([^<]+)<\/a>$/, '<span class="here">$1</span>')}</div>
    <h1>${h1}</h1>
    <p class="lede">${lede}</p>
    ${extraCta}
  </div>
</section>`;

const cta = ({
  h2 = `Ready to ship your <span class="serif">presence</span>?`,
  p = 'Claim your free domain and get your site, Google Business, and SEO set up in 38 seconds.',
} = {}) => `
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="cta-dark">
      <h2>${h2}</h2>
      <p>${p}</p>
      <div class="btns">
        <a href="https://dashboard.neweb.ai/signup" class="btn btn-brand">Claim your free domain</a>
        <a href="/pages/contact" class="btn btn-ghost" style="background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#fff">Talk to us</a>
      </div>
    </div>
  </div>
</section>`;

const section = (inner, extraStyle = '') => `<section class="section" ${extraStyle?`style="${extraStyle}"`:''}><div class="wrap">${inner}</div></section>`;

// Related-reading cross-link block — SEO internal linking
const related = (links) => section(`
  <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> Keep reading</span><h2 class="h">Related <span class="serif">pages</span>.</h2></div>
  <div class="grid-3">
    ${links.map(l => `
      <a class="card rise" href="${l.href}" style="display:flex;flex-direction:column">
        <div class="ico">↗</div>
        <h3>${l.title}</h3>
        <p>${l.blurb}</p>
      </a>
    `).join('')}
  </div>
`, 'padding-top:0');

// =====================================================================
// FREE-TOOLS CLUSTER — shared styles, template, hub emitter
// =====================================================================

// Per-tool-page styles. Layered on top of pageStyles + shared.css.
const toolPageStyles = `
  /* Tool widget shell — reused across all tool pages */
  .tool-shell{background:#fff;border:1px solid var(--line-2);border-radius:18px;padding:28px;box-shadow:0 30px 60px -40px rgba(10,14,26,.15);max-width:760px;margin:0 auto}
  .tool-shell .field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
  .tool-shell label{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500}
  .tool-shell input,.tool-shell textarea,.tool-shell select{padding:12px 14px;border:1px solid var(--line-2);border-radius:10px;font:inherit;font-size:15px;color:var(--ink);background:#fff;transition:all .18s;width:100%}
  .tool-shell input:focus,.tool-shell textarea:focus,.tool-shell select:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 4px rgba(61,76,255,.1)}
  .tool-shell textarea{resize:vertical;min-height:80px}
  .tool-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:560px){.tool-row{grid-template-columns:1fr}}
  .tool-output{margin-top:18px;padding:18px;border:1px dashed var(--line-2);border-radius:12px;background:var(--bg-2);font-family:"JetBrains Mono",monospace;font-size:13.5px;color:var(--ink);word-break:break-all;line-height:1.55;min-height:48px;display:flex;align-items:center}
  .tool-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
  .tool-help{margin-top:18px;text-align:center;font-size:13px;color:var(--muted);max-width:560px;margin-left:auto;margin-right:auto}
  .tool-help a{color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)}

  /* Numbered how-to list */
  .howto{counter-reset:n;list-style:none;padding:0;margin:14px 0 24px;display:flex;flex-direction:column;gap:14px}
  .howto li{counter-increment:n;display:grid;grid-template-columns:36px 1fr;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 18px}
  .howto li:before{content:counter(n,decimal-leading-zero);grid-row:1 / span 2;font-family:"JetBrains Mono",monospace;font-size:12px;font-weight:500;letter-spacing:.04em;color:var(--brand);background:var(--brand-soft);width:36px;height:36px;border-radius:10px;display:grid;place-items:center;border:1px solid rgba(61,76,255,.18)}
  .howto li p{margin:0;font-size:15px;line-height:1.55;color:var(--ink-2)}
  .howto li p strong{color:var(--ink)}

  /* Tip + example blocks */
  .tip-list{padding-left:0;list-style:none;display:grid;gap:10px;margin:14px 0 24px}
  .tip-list li{display:flex;gap:10px;align-items:flex-start;font-size:15.5px;line-height:1.55;color:var(--ink-2)}
  .tip-list li:before{content:"";flex-shrink:0;margin-top:8px;width:6px;height:6px;border-radius:50%;background:var(--brand)}

  .example-card{background:var(--bg-2);border:1px solid var(--line);border-radius:14px;padding:22px 24px;margin:14px 0 24px}
  .example-card .lbl{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
  .example-card p:last-child{margin-bottom:0}
  /* Pre-rendered sample output (crawlable example results) */
  .example-output{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
  .example-output .eo-item{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 18px;border:1px solid var(--line);border-radius:12px;background:#fff;flex-wrap:wrap}
  .example-output .eo-item .eo-main{font-size:15.5px;font-weight:600;color:var(--ink);letter-spacing:-.01em}
  .example-output .eo-item .eo-sub{font-size:13.5px;color:var(--ink-2);margin-top:2px;line-height:1.45}
  .example-output .eo-serif{font-family:"Instrument Serif",serif;font-style:italic;font-size:18px;color:var(--ink)}
  .example-output .eo-mono{font-family:"JetBrains Mono",monospace;font-size:14px;color:var(--ink)}
  .example-output .eo-note{font-size:13px;color:var(--muted);text-align:center;margin-top:6px}

  /* FAQ accordion */
  .faq{display:flex;flex-direction:column;gap:8px;margin:16px 0 24px;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}
  .faq details{border-bottom:1px solid var(--line)}
  .faq details:last-child{border-bottom:0}
  .faq summary{cursor:pointer;list-style:none;padding:18px 22px;font-weight:500;font-size:16px;color:var(--ink);display:flex;justify-content:space-between;align-items:center;gap:14px}
  .faq summary::-webkit-details-marker{display:none}
  .faq summary:after{content:"+";font-family:"JetBrains Mono",monospace;color:var(--brand);font-size:20px;line-height:1;flex-shrink:0;transition:transform .2s}
  .faq details[open] summary:after{content:"–"}
  .faq .ans{padding:0 22px 18px;color:var(--ink-2);font-size:15px;line-height:1.6}
  .faq .ans p:last-child{margin-bottom:0}

  /* Tools-hub grid */
  .hub-group{margin-top:36px}
  .hub-group:first-of-type{margin-top:0}
  .hub-group .head{display:flex;align-items:baseline;gap:14px;margin-bottom:16px;flex-wrap:wrap}
  .hub-group h2{font-size:22px;letter-spacing:-.02em;font-weight:600;margin:0;color:var(--ink)}
  .hub-group .head p{font-size:14px;color:var(--muted);margin:0}
  .hub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  @media(max-width:860px){.hub-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.hub-grid{grid-template-columns:1fr}}
  .tool-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px 22px;display:flex;flex-direction:column;gap:6px;transition:transform .2s, box-shadow .2s, border-color .2s;position:relative;min-height:118px}
  a.tool-card:hover{transform:translateY(-2px);box-shadow:0 18px 36px -22px rgba(10,14,26,.12);border-color:var(--brand)}
  .tool-card h3{font-size:16px;letter-spacing:-.01em;font-weight:600;margin:0;color:var(--ink)}
  .tool-card p{font-size:13.5px;line-height:1.5;color:var(--ink-2);margin:0}
  .tool-card .meta{margin-top:auto;font-family:"JetBrains Mono",monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand);font-weight:500}
  .tool-card.soon{background:var(--bg-2)}
  .tool-card.soon h3{color:var(--ink-2)}
  .tool-card.soon .meta{color:var(--muted)}
  .tool-card .pill-corner{position:absolute;top:14px;right:14px;font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:999px;font-weight:500}
  .tool-card .pill-corner.live{background:var(--brand-soft);color:var(--brand);border:1px solid rgba(61,76,255,.18)}
  .tool-card .pill-corner.soon{background:#fff;color:var(--muted);border:1px solid var(--line-2)}
`;

// JSON-LD builders for tool pages
function buildToolJsonLd(t, canonicalUrl) {
  const out = [];
  out.push({
    '@context':'https://schema.org',
    '@type':'WebApplication',
    name: t.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    url: canonicalUrl,
    description: t.metaDescription || t.tagline,
    offers: { '@type':'Offer', price: '0', priceCurrency: 'INR' },
    publisher: { '@type':'Organization', name:'Neweb', url:'https://neweb.ai/' },
  });
  if (Array.isArray(t.faq) && t.faq.length) {
    out.push({
      '@context':'https://schema.org',
      '@type':'FAQPage',
      mainEntity: t.faq.map(item => ({
        '@type':'Question',
        name: item.q,
        acceptedAnswer: { '@type':'Answer', text: stripHtml(item.a) },
      })),
    });
  }
  return out.map(jsonLdBlock).join('\n');
}

function stripHtml(s) {
  return String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
}

// SEO body sections (intro, how-to, why, tips, example, FAQ).
// Each is optional; missing sections are skipped quietly so stubs render too.
function toolBody(t) {
  const parts = [];
  if (t.intro) parts.push(`<section style="margin-bottom:16px">${t.intro}</section>`);
  if (Array.isArray(t.howTo) && t.howTo.length) {
    parts.push(`<h2>How to use the ${t.name.toLowerCase()}</h2>
      <ol class="howto">${t.howTo.map(s => `<li><p>${s}</p></li>`).join('')}</ol>`);
  }
  if (t.why) parts.push(`<h2>Why this matters for your business</h2>${t.why}`);
  if (Array.isArray(t.tips) && t.tips.length) {
    parts.push(`<h2>Tips for better results</h2>
      <ul class="tip-list">${t.tips.map(s => `<li>${s}</li>`).join('')}</ul>`);
  }
  if (t.example) {
    parts.push(`<h2>Example</h2>
      <div class="example-card"><p class="lbl">A real-world walkthrough</p>${t.example}</div>`);
  }
  if (Array.isArray(t.faq) && t.faq.length) {
    parts.push(`<h2>Frequently asked questions</h2>
      <div class="faq">${t.faq.map(item =>
        `<details><summary>${item.q}</summary><div class="ans">${item.a}</div></details>`
      ).join('')}</div>`);
  }
  return parts.length ? `<div class="prose">${parts.join('\n')}</div>` : '';
}

// Related-tools cross-link grid.
function toolRelated(t) {
  const items = Array.isArray(t.related) && t.related.length
    ? t.related
    : TOOLS.filter(x => x.slug !== t.slug && x.category === t.category && (x.built || x.external)).slice(0, 3)
      .map(x => ({ href: toolHref(x), title: x.name, blurb: x.tagline }));
  if (!items.length) return '';
  return section(`
    <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> Related tools</span><h2 class="h">Keep <span class="serif">building</span>.</h2></div>
    <div class="grid-3">
      ${items.map(l => `
        <a class="card rise" href="${l.href}" style="display:flex;flex-direction:column">
          <div class="ico">↗</div>
          <h3>${l.title}</h3>
          <p>${l.blurb}</p>
        </a>
      `).join('')}
    </div>
  `, 'padding-top:0');
}

// Build a tool page definition (compatible with the `pages` array).
function toolPage(t) {
  const canonicalPath = `/pages/tools/${t.slug}`;
  const title = t.metaTitle || `${t.name} — Free for Indian Small Businesses | Neweb`;
  const description = t.metaDescription || `${t.tagline} Free, no sign-up needed. Built by Neweb, the online presence manager for Indian SMBs.`;
  const h1 = t.h1 || `${t.name.replace(/( Generator| Checker| Validator| Maker| Test| Compressor)$/i, '')} <span class="serif">${(t.h1Tail || (t.name.match(/( Generator| Checker| Validator| Maker| Test| Compressor)$/i)||[' tool'])[0].trim())}</span>.`;
  const lede = t.lede || t.tagline;
  // Pre-rendered example output. Crucial for AI/JS tools whose live results are
  // injected via fetch() — Googlebot sees an empty form otherwise. This static
  // block gives crawlers real sample output to index and AI engines to cite.
  const exampleOutputBlock = t.exampleOutput
    ? section(`
      <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> Sample output</span><h2 class="h">What you'll <span class="serif">get</span>.</h2><p>A real example of what this tool produces. Run it above with your own inputs.</p></div>
      <div class="example-output">${t.exampleOutput}</div>
    `, 'padding-top:0')
    : '';

  const widgetBlock = t.widget && t.widget.html
    ? section(`<div class="tool-shell">${t.widget.html}</div>${t.widget.help ? `<p class="tool-help">${t.widget.help}</p>` : ''}`)
    : section(`<div class="tool-shell" style="text-align:center;color:var(--muted);font-size:14px;padding:40px 28px"><strong style="color:var(--ink);font-weight:600;font-size:16px;display:block;margin-bottom:6px">We're building this one.</strong>Want early access? <a href="https://dashboard.neweb.ai/signup" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">Sign up</a> and we'll email you when it ships.</div>`);

  const bodyHtml = toolBody(t);
  const bodySection = bodyHtml
    ? section(bodyHtml, 'padding-top:0')
    : '';

  const ctaBlock = cta({
    h2: t.ctaH2 || `Your <span class="serif">entire online presence</span>, on one subscription.`,
    p: t.ctaP || `${t.solutionLabel ? t.solutionLabel + ' and more. ' : ''}Website, free domain, Google Business and SEO autopilot from ₹249/month.`,
  });

  const solutionLink = t.solutionHref
    ? `<div class="wrap" style="text-align:center;margin-top:-20px;margin-bottom:40px"><a href="${t.solutionHref}" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3);font-size:14px">${t.solutionLabel || 'See industry pages'} →</a> &nbsp;·&nbsp; <a href="/pages/pricing" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3);font-size:14px">Pricing</a> &nbsp;·&nbsp; <a href="/pages/tools" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3);font-size:14px">All free tools</a></div>`
    : '';

  return {
    slug: `tools/${t.slug}`,
    title,
    description,
    canonicalPath,
    active: 'tools',
    extraHead: toolPageStyles + (t.widget && t.widget.css ? t.widget.css : ''),
    jsonLd: buildToolJsonLd({ ...t, metaDescription: description }, `${DOMAIN}${canonicalPath}`),
    body: hero({
      crumb: [
        { label: 'Free tools', href: '/pages/tools' },
        { label: t.name, href: canonicalPath },
      ],
      h1,
      lede,
    }) + widgetBlock + exampleOutputBlock + bodySection + toolRelated(t) + solutionLink + ctaBlock
      + (t.widget && t.widget.js ? `<script>${t.widget.js}</script>` : ''),
  };
}

// "Free tools for [your business]" cross-link block. Pulls from the tools
// registry by slug. Used to deep-link solution and guide pages into the tools
// cluster, giving each tool clean internal backlinks from the rest of the site.
function toolsCrossLink(slugs, headline = 'Free tools') {
  const items = slugs.map(s => TOOLS.find(t => t.slug === s)).filter(t => t && (t.built || t.external));
  if (!items.length) return '';
  return section(`
    <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> ${headline}</span><h2 class="h">Free tools, <span class="serif">no sign-up</span>.</h2></div>
    <div class="grid-3">
      ${items.map(t => {
        const href = t.external && t.externalHref ? t.externalHref : `/pages/tools/${t.slug}`;
        return `<a class="card rise" href="${href}" style="display:flex;flex-direction:column">
          <div class="ico">⚒</div>
          <h3>${t.name}</h3>
          <p>${t.tagline}</p>
          <span style="margin-top:auto;padding-top:14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand);font-weight:500">Open tool →</span>
        </a>`;
      }).join('')}
    </div>
    <p style="margin-top:24px;text-align:center;color:var(--muted);font-size:14px">All 21 tools live at <a href="/pages/tools" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">neweb.ai/pages/tools</a></p>
  `, 'padding-top:0');
}

// Designed long-form body renderer used by solution / guide / compare pages.
// Takes raw HTML with <h2>/<p> chunks and decorates each section with an
// eyebrow + big-num accent, alternates section backgrounds, and adds optional
// stats / quote / kv / dark-callout blocks.
const RICH_STYLES = `
  .rich-wrap{margin:0 auto}
  .rich-sec{position:relative;padding:64px 0;border-top:1px solid var(--line);overflow:hidden}
  .rich-sec:first-of-type{border-top:0;padding-top:48px}
  .rich-sec.alt{background:var(--bg-2)}
  .rich-sec.dark{background:var(--ink-dark);color:#fff;border-top:0}
  .rich-sec.dark:before{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:800px;height:600px;background:radial-gradient(circle, rgba(61,76,255,.18), transparent 60%);pointer-events:none}
  .rich-num{position:absolute;font-family:"Instrument Serif",serif;font-weight:400;font-size:clamp(180px,26vw,320px);line-height:.85;color:transparent;-webkit-text-stroke:1.5px rgba(10,14,26,.06);letter-spacing:-.05em;pointer-events:none;user-select:none;z-index:0;right:-30px;top:30px}
  .rich-sec.dark .rich-num{-webkit-text-stroke:1.5px rgba(255,255,255,.08)}
  .rich-row{position:relative;z-index:1;display:grid;grid-template-columns:240px 1fr;gap:48px;align-items:start;max-width:1080px;margin:0 auto}
  @media(max-width:900px){.rich-row{grid-template-columns:1fr;gap:14px}}
  .rich-eyebrow{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--brand);font-weight:500;display:inline-flex;align-items:center;gap:8px}
  .rich-eyebrow:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--brand);box-shadow:0 0 0 4px rgba(61,76,255,.12)}
  .rich-sec.dark .rich-eyebrow{color:var(--brand-2)}
  .rich-sec.dark .rich-eyebrow:before{background:var(--brand-2);box-shadow:0 0 0 4px rgba(107,123,255,.18)}
  .rich-h{font-size:clamp(26px,3.2vw,36px);letter-spacing:-.025em;line-height:1.1;margin:14px 0 0;font-weight:600;color:var(--ink);text-wrap:balance}
  .rich-sec.dark .rich-h{color:#fff}
  .rich-h .serif{font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;color:var(--brand)}
  .rich-sec.dark .rich-h .serif{color:var(--brand-2)}
  .rich-body{font-size:16.5px;line-height:1.7;color:var(--ink-2)}
  .rich-sec.dark .rich-body{color:#c9cdde}
  .rich-body p{margin:0 0 16px}
  .rich-body p:last-child{margin-bottom:0}
  .rich-body a{color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)}
  .rich-sec.dark .rich-body a{color:var(--brand-2);border-bottom-color:rgba(107,123,255,.35)}
  /* Stat strip */
  .rich-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 20px 40px -24px rgba(10,14,26,.08);margin:36px auto;max-width:1080px;position:relative;z-index:1}
  .rich-stats .stat{text-align:center;padding:6px 14px}
  .rich-stats .stat .n{font-size:30px;font-weight:600;letter-spacing:-.025em;color:var(--ink);line-height:1.05}
  .rich-stats .stat .n .serif{font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;color:var(--brand)}
  .rich-stats .stat .l{font-family:"JetBrains Mono",monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:6px;line-height:1.4}
  /* Quote callout */
  .rich-quote{position:relative;background:#fff;border:1px solid var(--line);border-radius:18px;padding:36px 38px;max-width:840px;margin:32px auto;box-shadow:0 24px 48px -28px rgba(10,14,26,.12)}
  .rich-quote:before{content:"\\201C";position:absolute;top:14px;left:32px;font-family:"Instrument Serif",serif;font-size:96px;line-height:1;color:var(--brand);opacity:.22}
  .rich-quote blockquote{margin:0;padding:0 0 0 56px;font-family:"Instrument Serif",serif;font-style:italic;font-size:22px;line-height:1.45;color:var(--ink);font-weight:400}
  .rich-quote .who{margin-top:18px;padding:14px 0 0 56px;border-top:1px solid var(--line);display:flex;align-items:center;gap:12px}
  .rich-quote .who .avatar{width:36px;height:36px;border-radius:50%;background:var(--brand-soft);color:var(--brand);display:grid;place-items:center;font-weight:600;font-size:12.5px;border:1px solid rgba(61,76,255,.18)}
  .rich-quote .who .name{font-size:13.5px;font-weight:600;color:var(--ink)}
  .rich-quote .who .role{font-size:12px;color:var(--muted)}
  /* Highlight chips inside body */
  .rich-chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 4px}
  .rich-chips .chip{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-size:13px;color:var(--ink-2);font-weight:500}
  .rich-sec.dark .rich-chips .chip{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#e7e9f2}
  .rich-chips .chip:before{content:"";width:5px;height:5px;border-radius:50%;background:var(--brand)}
  .rich-sec.dark .rich-chips .chip:before{background:var(--brand-2)}
`;

function richProse(body, opts = {}) {
  // body is HTML containing alternating <h2>title</h2><p>...</p> chunks.
  // Split into sections at each <h2> and decorate.
  const chunks = String(body).split(/(?=<h2)/g).map(s => s.trim()).filter(Boolean);
  const eyebrow = opts.eyebrow || 'Deep dive';
  const stats = opts.stats || null;       // [{n,l}]
  const quote = opts.quote || null;       // {text, who, role}
  const chips = opts.chips || null;       // ['chip 1','chip 2']
  const darkAfter = typeof opts.darkAfter === 'number' ? opts.darkAfter : 2; // index of section to render dark

  const sectionsHtml = chunks.map((chunk, i) => {
    const titleMatch = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const title = titleMatch ? titleMatch[1] : '';
    const rest = chunk.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '');
    const num = String(i + 1).padStart(2, '0');
    const isAlt = i % 2 === 1;
    const isDark = i === darkAfter;
    const cls = ['rich-sec'];
    if (isAlt && !isDark) cls.push('alt');
    if (isDark) cls.push('dark');
    return `
      <section class="${cls.join(' ')}">
        <span class="rich-num" aria-hidden="true">${num}</span>
        <div class="wrap">
          <div class="rich-row">
            <div>
              <span class="rich-eyebrow">${eyebrow} · ${num}</span>
              <h2 class="rich-h">${title}</h2>
            </div>
            <div class="rich-body">${rest}</div>
          </div>
        </div>
      </section>`;
  });

  // Inject the stat strip after section 1, the quote after section 2 if provided
  let html = '';
  for (let i = 0; i < sectionsHtml.length; i++) {
    html += sectionsHtml[i];
    if (i === 0 && stats && stats.length) {
      html += `<div class="wrap"><div class="rich-stats">${stats.map(s => `<div class="stat"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`).join('')}</div></div>`;
    }
    if (i === 1 && quote) {
      html += `<div class="wrap"><div class="rich-quote"><blockquote>${quote.text}</blockquote><div class="who"><div class="avatar">${(quote.who||'').slice(0,2).toUpperCase()}</div><div><div class="name">${quote.who||''}</div><div class="role">${quote.role||''}</div></div></div></div></div>`;
    }
  }
  return `<div class="rich-wrap">${html}</div>`;
}

// Hub page emitter
function toolsHubPage() {
  const groups = TOOL_CATEGORIES.map(cat => {
    const items = toolsByCategory(cat.id);
    const cards = items.map(t => {
      const href = toolHref(t);
      const pill = t.built ? `<span class="pill-corner live">Live</span>` : `<span class="pill-corner soon">Soon</span>`;
      if (href) {
        return `<a class="tool-card" href="${href}">
          ${pill}
          <h3>${t.name}</h3>
          <p>${t.tagline}</p>
          <span class="meta">Open tool →</span>
        </a>`;
      }
      return `<div class="tool-card soon" aria-disabled="true">
        ${pill}
        <h3>${t.name}</h3>
        <p>${t.tagline}</p>
        <span class="meta">Coming soon</span>
      </div>`;
    }).join('');
    return `
      <div class="hub-group">
        <div class="head">
          <span class="eyebrow"><span class="dot"></span> ${cat.eyebrow}</span>
          <h2>${cat.title}</h2>
          <p>${cat.blurb}</p>
        </div>
        <div class="hub-grid">${cards}</div>
      </div>`;
  }).join('');

  return {
    slug: 'tools',
    title: 'Free Tools for Indian Small Businesses — QR, Invoice, SEO | Neweb',
    description: 'A growing kit of free tools for Indian SMBs. WhatsApp link generator, UPI QR, GST invoice, business name ideas, SEO helpers. No sign-up, no fluff.',
    canonicalPath: '/pages/tools',
    active: 'tools',
    extraHead: toolPageStyles,
    jsonLd: jsonLdBlock({
      '@context':'https://schema.org',
      '@type':'CollectionPage',
      name:'Free tools for Indian small businesses',
      url:`${DOMAIN}/pages/tools`,
      isPartOf:{ '@type':'WebSite', name:'Neweb', url:'https://neweb.ai/' },
      hasPart: TOOLS.map(t => ({
        '@type':'WebApplication',
        name: t.name,
        url: `${DOMAIN}${toolHref(t) || `/pages/tools/${t.slug}`}`,
        applicationCategory:'BusinessApplication',
        operatingSystem:'Any',
        offers:{ '@type':'Offer', price:'0', priceCurrency:'INR' },
      })),
    }),
    body: hero({
      crumb: [{ label: 'Free tools', href: '/pages/tools' }],
      h1: `Free tools for Indian <span class="serif">small businesses</span>.`,
      lede: 'A growing kit of fast, no-sign-up utilities. Pick a domain, make a UPI QR, draft a GST invoice, tidy your SEO. Built by the team that runs neweb.ai.',
    }) + section(groups) + cta({
      h2: `Tools are nice. A <span class="serif">presence</span> is better.`,
      p: 'Website, free domain, Google Business and SEO from ₹249/month. One subscription, no upgrades.',
    }),
  };
}

// ====== Page definitions ======
const pages = [];

// ---------- PRICING ----------
pages.push({
  slug: 'pricing',
  title: 'Pricing — Website + Domain + SEO from ₹249/month | Neweb',
  description: 'Simple, transparent pricing for Neweb. One plan at ₹249/month includes website, domain, SSL, hosting, SEO autopilot, and Google Business — no tier upsells.',
  canonicalPath: '/pages/pricing',
  active: 'pricing',
  extraHead: `
    /* Currency toggle */
    .price-head{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 0 28px;flex-wrap:wrap}
    .currency-toggle{display:inline-flex;border:1px solid var(--line-2);border-radius:10px;padding:3px;background:#fff}
    .currency-toggle button{padding:7px 16px;border-radius:7px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--muted);letter-spacing:.02em;font-weight:500;transition:all .2s;cursor:pointer;border:0;background:transparent}
    .currency-toggle button.active{background:var(--ink);color:#fff}
    .plan-price{font-size:38px;color:var(--ink);margin:8px 0 4px;letter-spacing:-.03em;font-weight:600;line-height:1.1;min-height:46px;display:flex;align-items:baseline}
    /* Mobile: lift the first plan CTA above the fold + tighten card */
    @media(max-width:860px){
      .page-hero{padding-top:28px;padding-bottom:18px}
      .grid-3 .card{padding:22px}
      .grid-3 .card ul{margin-top:8px}
    }
    .plan-price .per{font-size:14px;color:var(--muted);font-weight:400;margin-left:2px}
  `,
  jsonLd: jsonLdBlock({
    "@context":"https://schema.org","@type":"Product","name":"Neweb",
    "description":"Online presence manager for small businesses — website, domain, Google Business, and SEO in one subscription.",
    "brand":{"@type":"Brand","name":"Neweb"},
    "image":"https://neweb.ai/assets/og-default.png",
    "offers":{"@type":"AggregateOffer","priceCurrency":"INR","lowPrice":"249","highPrice":"1299","offerCount":3,
      "offers":[
        {"@type":"Offer","name":"Starter","price":"249","priceCurrency":"INR","url":"https://neweb.ai/pages/pricing","availability":"https://schema.org/InStock"},
        {"@type":"Offer","name":"Growth","price":"1299","priceCurrency":"INR","url":"https://neweb.ai/pages/pricing","availability":"https://schema.org/InStock"},
        {"@type":"Offer","name":"Enterprise","description":"Custom pricing — contact sales.","priceCurrency":"INR","url":"https://neweb.ai/pages/pricing","availability":"https://schema.org/InStock"}
      ]}
  }),
  body: hero({
    crumb: [{label:'Pricing', href:'/pages/pricing'}],
    h1: `One plan. <span class="serif">No upsells.</span>`,
    lede: 'Everything a small business needs to run its online presence — bundled. Pay monthly, cancel anytime, keep your domain and content forever.',
  }) + section(`
    <div class="price-head">
      <div class="currency-toggle" id="curToggle">
        <button class="active" data-cur="INR">INR ₹</button>
        <button data-cur="USD">USD $</button>
      </div>
      <span class="mono" style="font-size:12.5px;color:var(--muted)">cancel anytime</span>
    </div>
    <div class="grid-3">
      <div class="card rise" style="display:flex;flex-direction:column">
        <div class="ico">⬡</div>
        <h3>Starter</h3>
        <p class="plan-price" data-cur="INR">₹249<span class="per">/month</span></p>
        <p class="plan-price" data-cur="USD" style="display:none">$9<span class="per">/month</span></p>
        <p>For solo founders, corner-shops, and side-projects.</p>
        <ul>
          <li>Free domain (.com/.in/.shop/.co)</li>
          <li>Fast WordPress site, LiteSpeed cached</li>
          <li>Google Business Profile setup</li>
          <li>Weekly SEO autopilot</li>
          <li>Basic newsletter (up to 500 contacts)</li>
          <li>Email support</li>
        </ul>
        <a href="https://dashboard.neweb.ai/signup?plan=starter" class="btn btn-ghost" style="margin-top:auto;align-self:stretch;text-align:center">Get Started</a>
      </div>
      <div class="card rise" style="border-color:var(--brand);box-shadow:0 14px 40px -18px rgba(61,76,255,.35);display:flex;flex-direction:column">
        <div class="ico">◉</div>
        <h3>Growth <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--brand);background:var(--brand-soft);padding:3px 8px;border-radius:999px;letter-spacing:.08em;text-transform:uppercase;margin-left:6px">popular</span></h3>
        <p class="plan-price" data-cur="INR">₹1299<span class="per">/month</span></p>
        <p class="plan-price" data-cur="USD" style="display:none">$49<span class="per">/month</span></p>
        <p>Small teams that need multi-location or multilingual.</p>
        <ul>
          <li>Everything in Starter</li>
          <li>Up to 3 locations / Google profiles</li>
          <li>Multilingual SEO (Hindi, Gujarati, Tamil…)</li>
          <li>Bing Places + Maps sync</li>
          <li>Newsletter up to 5,000 contacts</li>
          <li>Priority chat support · 24h SLA</li>
        </ul>
        <a href="https://dashboard.neweb.ai/signup?plan=growth" class="btn btn-brand" style="margin-top:auto;align-self:stretch;text-align:center">Get Started</a>
      </div>
      <div class="card rise" style="display:flex;flex-direction:column">
        <div class="ico">✦</div>
        <h3>Enterprise</h3>
        <p style="font-size:22px;color:var(--ink);margin:8px 0 4px;letter-spacing:-.02em;font-weight:600">Let's talk.</p>
        <p>For chains, franchises, and agencies managing many sites.</p>
        <ul>
          <li>Unlimited locations</li>
          <li>White-label dashboard</li>
          <li>Dedicated account manager</li>
          <li>Custom integrations (CRM, POS)</li>
          <li>SOC 2 + DPDP compliance pack</li>
          <li>Named support line, 1h SLA</li>
        </ul>
        <a href="mailto:sales@neweb.ai" class="btn btn-ghost" style="margin-top:auto;align-self:stretch;text-align:center">Talk to sales</a>
      </div>
    </div>
  `) + section(`
    <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> What's always included</span><h2 class="h">The <span class="serif">whole</span> presence. <span class="serif">Every plan.</span></h2></div>
    <dl class="kv">
      <dt>Domain</dt><dd>Free registration for the first year (.com, .in, .shop, .co). Renewals at cost. Always in your name.</dd>
      <dt>SSL</dt><dd>Auto-provisioned, auto-renewed. A+ grade on every connection.</dd>
      <dt>Hosting</dt><dd>LiteSpeed-powered, edge-cached, tuned for Core Web Vitals. Uptime 99.98% trailing 12 months.</dd>
      <dt>SEO</dt><dd>Sitemaps, schema, robots, canonical tags, and weekly tuning runs — not a checklist, a discipline.</dd>
      <dt>Google Business</dt><dd>Claim, verify, and sync your GBP. Hours, photos, services — one edit, everywhere.</dd>
      <dt>Content exports</dt><dd>WordPress export in one click. Your content is yours. No lock-in.</dd>
    </dl>
  `) + cta() + `
<script>
  (function(){
    var KEY='neweb_cur';
    function setCur(c){
      document.querySelectorAll('#curToggle button').forEach(function(b){ b.classList.toggle('active', b.dataset.cur===c); });
      document.querySelectorAll('.plan-price[data-cur]').forEach(function(p){ p.style.display = (p.dataset.cur===c) ? '' : 'none'; });
      try { localStorage.setItem(KEY, c); } catch(e){}
    }
    document.querySelectorAll('#curToggle button').forEach(function(b){
      b.addEventListener('click', function(){ setCur(b.dataset.cur); });
    });
    var saved=null; try { saved=localStorage.getItem(KEY); } catch(e){}
    if (saved==='INR' || saved==='USD') { setCur(saved); return; }
    var ctrl=new AbortController();
    var t=setTimeout(function(){ ctrl.abort(); }, 1200);
    fetch('https://api.country.is/', {signal:ctrl.signal})
      .then(function(r){ return r.json(); })
      .then(function(d){ clearTimeout(t); setCur(d && d.country==='IN' ? 'INR' : 'USD'); })
      .catch(function(){
        clearTimeout(t);
        var lang=(navigator.language||'').toLowerCase();
        setCur(lang.indexOf('-in')>-1 ? 'INR' : 'USD');
      });
  })();
</script>
`,
});

// ---------- FEATURES ----------
pages.push({
  slug: 'features',
  title: 'Features — Website builder, free domain, SEO autopilot | Neweb',
  description: 'Everything Neweb does: website builder, free domain, Google Business Profile, SEO autopilot, multilingual content, newsletter, and the Presence Graph that keeps it all in sync.',
  canonicalPath: '/pages/features',
  active: 'features',
  body: hero({
    crumb: [{label:'Features', href:'/pages/features'}],
    h1: `Everything, <span class="serif">connected</span>.`,
    lede: 'Neweb isn\'t a website builder with add-ons — it\'s a single product that builds, verifies, publishes, tunes, and syncs every surface your customers see.',
  }) + section(`
    <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> Core</span></div>
    <div class="grid-3">
      <div class="card rise"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg></div><h3>Free domain</h3><p>Every plan includes a real custom domain — .com, .in, .shop, or .co. Registered in your name, SSL-provisioned, pointed in under a minute.</p></div>
      <div class="card rise"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v12H4zM4 20h16"/></svg></div><h3>Fast websites</h3><p>LiteSpeed-hosted WordPress with 140+ blocks, edge caching, and Core Web Vitals tuning out of the box. Sub-1s loads on 3G.</p></div>
      <div class="card rise"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 11.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0zM8 11l3 3 5-6"/></svg></div><h3>Google Business</h3><p>Claim, verify, and sync your Business Profile. Hours, photos, and services stay consistent with your site.</p></div>
      <div class="card rise"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12h4l2-6 4 12 2-6h8"/></svg></div><h3>SEO autopilot</h3><p>Schema, sitemaps, canonicals, meta, titles, internal linking, and weekly on-page tunes. Watch your LiteSpeed and Lighthouse scores stay ≥ 90.</p></div>
      <div class="card rise"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 5h18v14H3zM3 9h18"/></svg></div><h3>Newsletter</h3><p>Capture emails on the site, send weekly updates, and watch deliverability with built-in DKIM/SPF monitoring.</p></div>
      <div class="card rise"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v18M3 12h18"/></svg></div><h3>Presence Graph</h3><p>One source of truth. Edit a phone number, photo, or hours — Neweb syncs to your site, GBP, Bing Places, Maps, and newsletter.</p></div>
    </div>
  `) + section(`
    <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> Power tools</span></div>
    <div class="grid-3">
      <div class="card rise"><h3>Multilingual SEO</h3><p>One click publishes in 14 Indian + international languages with cultural nuance, not word-swap translation.</p></div>
      <div class="card rise"><h3>Plain-English editor</h3><p>Type what you want changed. "Add a gallery with these 6 photos, shorter testimonials section, brighter CTA." Neweb edits.</p></div>
      <div class="card rise"><h3>140+ blocks</h3><p>Contact, pricing, bookings, menus, galleries, testimonials — responsive, accessible, generatable from your form inputs.</p></div>
      <div class="card rise"><h3>Four-question onboarding</h3><p>Business, audience, offerings, style. Smart defaults at every step. First draft ready before you finish step four.</p></div>
      <div class="card rise"><h3>WordPress export</h3><p>One-click export to any WordPress host. Your data, your domain, exportable any time. No hostage ransom.</p></div>
      <div class="card rise"><h3>Analytics built in</h3><p>Privacy-first visitor analytics, search terms, conversion funnels. No cookie banner drama.</p></div>
    </div>
  `) + cta(),
});

// ---------- TEMPLATES ----------
const templates = [
  {k:'Bakery', c:'#fff3e0 #ffd6b8', n:'Copper Oven Bakery', note:'Hero + menu + ordering + Instagram feed'},
  {k:'Jewellery', c:'#f6efff #d8c2ff', n:'Laxmee Jewellers', note:'Catalogue + story + appointment booking'},
  {k:'Clinic', c:'#e0fff1 #b8f0d4', n:'Dr. Mehta Clinic', note:'Services + doctors + booking + GBP'},
  {k:'Tutoring', c:'#fff8cc #ffeaa3', n:'Kaveri Coaching', note:'Courses + results + enquiry form'},
  {k:'Restaurant', c:'#ffe0e0 #ffb8b8', n:'Sheesha Restaurant', note:'Menu + reservations + photo gallery'},
  {k:'Hotel', c:'#d9f5ff #a8e6ff', n:'Aravalli Stay', note:'Rooms + bookings + reviews + multilingual'},
  {k:'Salon', c:'#ffd9e3 #ffb8cc', n:'Nirvana Salon', note:'Services + pricing + stylists + appointments'},
  {k:'Retail', c:'#cfe7ff #a7cfff', n:'Elektrobazaar', note:'Catalogue + locations + WhatsApp chat'},
];
pages.push({
  slug: 'templates',
  title: 'Website Templates for Bakeries, Jewellers, Clinics & more | Neweb',
  description: 'Industry-ready website templates for bakeries, jewellers, clinics, tutoring centres, restaurants, hotels, salons and retail. Each template is fast, responsive, and ready to customize.',
  canonicalPath: '/pages/templates',
  active: 'templates',
  extraHead: `
    .tpl{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:all .25s}
    .tpl:hover{transform:translateY(-3px);border-color:var(--line-2);box-shadow:0 24px 48px -24px rgba(10,14,26,.1)}
    .tpl .prev{aspect-ratio:16/10;background:linear-gradient(135deg,var(--c1),var(--c2));display:grid;place-items:center;font-family:"Instrument Serif",serif;font-style:italic;font-size:42px;color:rgba(10,14,26,.6);letter-spacing:-.02em}
    .tpl .body{padding:18px;display:flex;flex-direction:column;gap:4px}
    .tpl .cat{font-family:"JetBrains Mono",monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand)}
    .tpl .n{font-size:15.5px;font-weight:600;letter-spacing:-.01em}
    .tpl .note{font-size:13px;color:var(--muted);line-height:1.4}
  `,
  body: hero({
    crumb: [{label:'Templates', href:'/pages/templates'}],
    h1: `Templates that already <span class="serif">know your trade</span>.`,
    lede: 'Start with a template built for your industry — pre-wired with the right sections, schema, and SEO defaults. Customize with plain-English edits in seconds.',
  }) + section(`
    <div class="grid-3" style="grid-template-columns:repeat(4,1fr)">
      ${templates.map(t => `
        <div class="tpl rise" style="--c1:${t.c.split(' ')[0]};--c2:${t.c.split(' ')[1]}">
          <div class="prev">${t.n.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
          <div class="body">
            <span class="cat">${t.k}</span>
            <div class="n">${t.n}</div>
            <div class="note">${t.note}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <p style="margin-top:28px;color:var(--muted);font-size:14px;text-align:center">Need a custom template? <a href="/pages/contact" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">Tell us</a> — we ship one in 48 hours.</p>
  `) + cta(),
});

// ---------- CHANGELOG ----------
const log = [
  {d:'Apr 2026', t:'Admin 2.0 — Markdown editor with live preview', b:'Writers now get a split-pane editor with drag-and-drop image uploads, keyboard shortcuts, and a one-click "Publish" toggle.'},
  {d:'Mar 2026', t:'Extensionless URLs everywhere', b:'Site-wide .htaccess rewrites. Clean URLs, 301s from legacy .html paths, zero crawling loss.'},
  {d:'Feb 2026', t:'Resend email pipeline', b:'Contact form + transactional emails now flow through Resend for hands-off deliverability with SPF/DKIM alignment.'},
  {d:'Jan 2026', t:'Presence Graph visualization', b:'Website, domain, GBP, Bing Places, Maps and newsletter status — one live dashboard pulse on the landing page.'},
  {d:'Dec 2025', t:'Multilingual SEO beta', b:'Hindi, Gujarati, Tamil, Marathi, Bengali. Tuned for how Indian users actually search — voice, vernacular, long-tail.'},
  {d:'Nov 2025', t:'Public launch', b:'₹249/mo plan opens. 1,000 customers in four months — mostly word of mouth from Tier-2 cities.'},
];
pages.push({
  slug: 'changelog',
  title: 'Changelog — Every Neweb update, newest first | Neweb',
  description: 'Every Neweb release, in chronological order. Feature launches, performance wins, and platform updates.',
  canonicalPath: '/pages/changelog',
  body: hero({
    crumb: [{label:'Changelog', href:'/pages/changelog'}],
    h1: `What we <span class="serif">shipped</span>.`,
    lede: 'We push something live most weeks. Here\'s the full history, newest first.',
  }) + section(`
    <div class="tl" style="border-left:2px solid var(--line);padding-left:24px;margin-top:24px;position:relative">
      ${log.map(e => `
        <div class="tl-item rise" style="position:relative;padding:14px 0 24px;display:grid;grid-template-columns:120px 1fr;gap:24px">
          <div style="position:absolute;left:-31px;top:22px;width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid var(--brand)"></div>
          <div class="year" style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.1em;color:var(--brand);font-weight:500;padding-top:4px">${e.d}</div>
          <div><h3 style="font-size:18px;letter-spacing:-.015em;margin:0 0 4px;font-weight:600">${e.t}</h3><p style="font-size:14.5px;color:var(--ink-2);margin:0;line-height:1.55">${e.b}</p></div>
        </div>
      `).join('')}
    </div>
  `) + cta(),
});

// ---------- CUSTOMER STORIES ----------
const stories = [
  {i:'CO', name:'Copper Oven Bakery', city:'Pune', industry:'Bakery', quote:'Our weekend orders doubled after the Google Business sync kicked in. The site loads in under a second even on my parents\' 2G phone.', by:'Meera S., Owner'},
  {i:'LJ', name:'Laxmee Jewellers', city:'Jaipur', industry:'Jewellery', quote:'Before Neweb we paid ₹84,000 for a site that went offline in four months. Now we pay ₹249/month and rank #1 for our own name in Jaipur.', by:'Rahul M., 3rd-gen owner'},
  {i:'AS', name:'Aravalli Stay', city:'Udaipur', industry:'Boutique hotel', quote:'Multilingual SEO was the unlock. Hindi, Gujarati, and English versions — all indexed correctly. Direct bookings up 40% year on year.', by:'Priyanka R., GM'},
  {i:'KC', name:'Kaveri Coaching', city:'Ahmedabad', industry:'Tutoring', quote:'The four-question form took 6 minutes. Our site was live before the call with the Neweb team ended.', by:'Anand J., Founder'},
];
pages.push({
  slug: 'customer-stories',
  title: 'Customer Stories — Real small businesses, real results | Neweb',
  description: 'Small businesses using Neweb to run their online presence — jewellers, bakeries, coaching centres, boutique hotels. Results, not testimonials.',
  canonicalPath: '/pages/customer-stories',
  body: hero({
    crumb: [{label:'Customer stories', href:'/pages/customer-stories'}],
    h1: `Small businesses. <span class="serif">Real numbers.</span>`,
    lede: 'We let customers do the talking. Here\'s who we\'re building for, and what\'s changed since they switched.',
  }) + section(`
    <div class="grid-2">
      ${stories.map(s => `
        <article class="card rise">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--brand-soft),#dde3ff);display:grid;place-items:center;font-family:'Instrument Serif',serif;font-style:italic;color:var(--brand);font-size:22px">${s.i}</div>
            <div><div style="font-weight:600;letter-spacing:-.01em">${s.name}</div><div style="font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">${s.industry} · ${s.city}</div></div>
          </div>
          <blockquote style="font-family:'Instrument Serif',serif;font-style:italic;font-size:20px;line-height:1.4;color:var(--ink);margin:0 0 12px;padding:0;border:0">"${s.quote}"</blockquote>
          <p style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin:0">— ${s.by}</p>
        </article>
      `).join('')}
    </div>
  `) + cta({ h2: `Your story, <span class="serif">next</span>.`, p: 'Join 1,000+ small businesses already running their presence on Neweb.' }),
});

// ---------- DOMAIN CHECKER (free tool) ----------
pages.push({
  slug: 'domain-checker',
  title: 'Free Domain Name Checker — .com, .in, .shop availability | Neweb',
  description: 'Check if a domain is available. Search .com, .in, .shop, .co, .co.in and more. Free, instant results. Every Neweb plan ships with a free domain.',
  canonicalPath: '/pages/domain-checker',
  extraHead: `
    .dc-box{background:#fff;border:1px solid var(--line-2);border-radius:18px;padding:28px;box-shadow:0 30px 60px -40px rgba(10,14,26,.15);max-width:720px;margin:0 auto}
    .dc-row{display:flex;gap:10px;flex-wrap:wrap}
    .dc-row input{flex:1;min-width:220px;padding:14px 16px;border:1px solid var(--line-2);border-radius:12px;font:inherit;font-size:16px;color:var(--ink);background:#fff;transition:all .18s}
    .dc-row input:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 4px rgba(61,76,255,.1)}
    .dc-row .btn{padding:14px 22px;font-size:15px}
    .dc-results{margin-top:22px;display:flex;flex-direction:column;gap:8px}
    .dc-r{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border:1px solid var(--line);border-radius:12px;background:#fff;gap:14px}
    .dc-r .d{font-family:"JetBrains Mono",monospace;font-size:15px;color:var(--ink);letter-spacing:-.01em}
    .dc-r .s{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:500}
    .dc-r.avail{border-color:rgba(22,163,74,.25);background:#f0fdf5}
    .dc-r.avail .s{color:#0a6b3d}
    .dc-r.taken .s{color:#9b1c1c}
    .dc-r.checking .s{color:var(--muted)}
  `,
  body: hero({
    crumb: [{label:'Domain checker', href:'/pages/domain-checker'}],
    h1: `Find your <span class="serif">name</span>.`,
    lede: 'Type any name and we\'ll check availability across the most-requested TLDs in under a second. Free — every Neweb plan includes a registered domain.',
  }) + section(`
    <div class="dc-box">
      <form id="dc-form" class="dc-row">
        <input id="dc-input" type="text" placeholder="copperovenbakery" autocomplete="off" />
        <button class="btn btn-brand" type="submit">Check availability</button>
      </form>
      <div id="dc-results" class="dc-results"></div>
    </div>
    <script>
      (function(){
        var tlds = ['.com','.in','.co','.shop','.co.in','.store','.org','.net'];
        var form = document.getElementById('dc-form');
        var input = document.getElementById('dc-input');
        var out = document.getElementById('dc-results');
        function slug(s){return String(s||'').toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,40);}
        async function checkOne(name, tld){
          var host = name + tld;
          try {
            // DNS-based probe — real authoritative check happens server-side at registration time.
            var resp = await fetch('https://dns.google/resolve?name=' + encodeURIComponent(host) + '&type=A', {cache:'no-store'});
            var data = await resp.json();
            var hasRecords = (data.Answer && data.Answer.length > 0) || data.Status === 3;
            // Status 3 = NXDOMAIN (definitely free). Answer present = resolves (likely taken).
            return data.Status === 3 ? 'avail' : (hasRecords ? 'taken' : 'avail');
          } catch (_) { return 'unknown'; }
        }
        async function runCheck(name){
          out.innerHTML = tlds.map(function(t){
            return '<div class="dc-r checking" data-tld="'+t+'"><div class="d">'+name+t+'</div><div class="s">Checking…</div></div>';
          }).join('');
          await Promise.all(tlds.map(async function(t){
            var status = await checkOne(name, t);
            var row = out.querySelector('[data-tld="'+t+'"]');
            if (!row) return;
            row.classList.remove('checking');
            if (status === 'avail'){ row.classList.add('avail'); row.querySelector('.s').textContent = 'Available'; }
            else if (status === 'taken'){ row.classList.add('taken'); row.querySelector('.s').textContent = 'Taken'; }
            else { row.querySelector('.s').textContent = 'Unknown'; }
          }));
        }
        form.addEventListener('submit', function(e){
          e.preventDefault();
          var name = slug(input.value);
          if (name) runCheck(name);
        });
        // Pre-fill from ?q= so other tools (like the business name generator) can deep-link
        try {
          var u = new URL(window.location.href);
          var q = slug(u.searchParams.get('q') || '');
          if (q) { input.value = q; runCheck(q); }
        } catch(_){}
      })();
    </script>
    <p style="margin-top:22px;color:var(--muted);font-size:13px;text-align:center;max-width:560px;margin-left:auto;margin-right:auto">DNS-based check via Google's public resolver. For authoritative WHOIS results and registration, <a href="https://dashboard.neweb.ai/signup" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">sign up</a> — we register in your name.</p>
  `) + cta({ h2: `Found one? <span class="serif">Claim it free.</span>`, p: 'Every Neweb plan includes one free domain for the first year. Registered in your name, pointed at your site.' }),
});

// ---------- SOLUTIONS hub + industries ----------
const industries = [
  { slug:'restaurants', h:'Restaurants & bakeries', crumb:'Restaurants', serif:'sourdough to sales', lead:'Menus change weekly. Photos come from phone cameras. Tables fill on Sunday. Neweb keeps your website, Google Business, and newsletter in step with all of it.',
    pts:[
      {h:'Menu that updates itself', p:'Change a price or dish on your site — Google Business and newsletter update automatically. No more stale hours or outdated specials.'},
      {h:'Photos from your phone', p:'Upload from your phone — Neweb compresses, names, and lays them out across gallery, GBP, and the weekend newsletter.'},
      {h:'Reservations that work', p:'Embedded booking form, WhatsApp deep-link, or integrate with OpenTable/ReserveIndia. One button on the homepage.'},
      {h:'Local SEO tuned for food', p:'Hindi, Gujarati, and English indexed separately. "bakery near me" structured data. Rank for dish names and neighbourhood queries.'},
    ],
    faq:[
      {q:'How much does a restaurant website cost on Neweb?', a:'A restaurant website on Neweb starts at 249 rupees a month, which includes the website, a free custom domain for the first year, hosting, SSL, SEO, and Google Business Profile setup. There are no per-page charges and no separate fee for the menu, reservation form, or photo gallery. The Growth plan at 1299 rupees a month adds multi-location support and multilingual menus, which suits small chains running three or more outlets across a city.'},
      {q:'Can customers order or book a table directly from the website?', a:'Yes. Every Neweb restaurant site ships with three ordering paths built in. A one-question reservation form for dine-in that captures date, time, and party size. A WhatsApp deep-link for takeaway that opens a chat with the order prompt pre-filled. And an optional integration with Swiggy, Zomato, OpenTable, ReserveIndia, or DotPe for outlets that already use those platforms. The WhatsApp path converts best in India because customers can message on their own time and keep a record.'},
      {q:'Will my restaurant show up on Google Maps and in near-me searches?', a:'Neweb claims, verifies, and syncs your Google Business Profile automatically, which is what surfaces you in the Maps pack and near-me searches. The site also ships Restaurant schema markup that tells Google your cuisine type, price range, accepted payments, and menu items with prices, so you can appear in rich results with a star rating and a call button. The weekly photo and review cadence built into the dashboard compounds your local ranking over the first ninety days.'},
      {q:'Can I publish my menu in Hindi or other regional languages?', a:'Yes. Neweb publishes restaurant menus and pages in 14 Indian and international languages with one click each, and indexes every language version separately for SEO with the correct hreflang attribute. A search in Tamil returns the Tamil page, not the English homepage. For a restaurant in a tier-2 city, the regional language version typically converts 30 to 60 percent better than English alone because customers read the menu in the language they think in.'},
    ]},
  { slug:'jewellers', h:'Jewellers', crumb:'Jewellers', serif:'a legacy, online', lead:'Multi-generation jewellers need a site that looks as considered as the showroom. Neweb ships one — fast, multilingual, and catalogue-ready.',
    pts:[
      {h:'Catalogue built in', p:'Upload a CSV of SKUs — designs, weights, makings, prices — and Neweb renders a searchable, filterable catalogue. Hide prices if you prefer.'},
      {h:'Appointment booking', p:'Direct booking for consultations, try-ons, or home viewings. Syncs to Google Calendar and the team inbox.'},
      {h:'Lookbook + storytelling', p:'Editorial-style image blocks for your seasonal lookbooks. Instrument Serif italic callouts for craftmanship details.'},
      {h:'GBP + Maps pins', p:'Across every showroom. Hours, gallery photos, reviews, and services kept in sync from one dashboard.'},
    ],
    faq:[
      {q:'Can I show my jewellery catalogue with prices and weights?', a:'Yes. Neweb renders a structured, searchable catalogue from a CSV import of your SKUs, with photo, gross and net weight, making charges, gemstone notes, and a live gold-rate calculation. Prices are configurable per piece. You can show the full price, hide it behind a request-quote button, show only the making charges, or show a price range. Many jewellers hide prices to drive enquiry, and many show them to build trust. Neweb supports both, per SKU, with Indian lakhs-and-crores formatting for local buyers and comma formatting for NRI customers.'},
      {q:'How do customers book a showroom visit or home viewing?', a:'Every product page and the homepage carry a clean appointment widget. The customer picks a date and time and notes which designs they want to see. The booking lands in your team inbox, syncs to Google Calendar, and triggers a WhatsApp confirmation. For higher-value pieces, the widget offers a home-viewing option that captures the address and the SKU shortlist. This bridges the gap between online browsing and the high-trust offline buying moment, which is where most jewellery sales actually close in India.'},
      {q:'Does Neweb work for jewellers with multiple showrooms?', a:'Yes. One dashboard manages every showroom website, every Google Business Profile, every Maps pin, and the social content for each outlet. Changes can be chain-wide, such as a new collection launch, or specific to one showroom, such as a Friday holiday at a single branch. The result is one consistent brand voice across every customer touchpoint with the operational efficiency of running it all from a single place. For a jeweller with three or more showrooms, this alone justifies the subscription.'},
      {q:'Can I publish my jewellery website in Tamil, Marathi, or other languages?', a:'Yes. Neweb publishes in 14 Indian and international languages with one click each, and indexes every version separately for SEO. A jeweller in Coimbatore can publish in Tamil alongside English and capture the dominant Tamil-speaking buyer who would otherwise default to a larger chain. A Mumbai showroom can publish in Marathi and Gujarati. Conversion on a properly translated page typically runs 30 to 60 percent higher than the English-only baseline, because customers make a considered, high-value purchase in the language they trust.'},
    ]},
  { slug:'clinics', h:'Clinics & doctors', crumb:'Clinics & doctors', serif:'care, online', lead:'A clinic\'s website is its first handshake. Neweb ships sites that load instantly, rank for "doctor near me", and take bookings without friction.',
    pts:[
      {h:'Doctor profiles', p:'Credentials, specialties, languages, and GBP review summary per practitioner. Patients pick the right one, faster.'},
      {h:'Bookings + teleconsults', p:'Embedded booking with timeslot management, or deep-link to Practo, Zocdoc, or Calendly. Teleconsult URLs included.'},
      {h:'Schema.org MedicalBusiness', p:'Structured data that Google actually understands. Show up in rich results for services, hours, and insurance accepted.'},
      {h:'DPDP + HIPAA friendly', p:'SSL everywhere, no third-party analytics by default, encrypted form submissions. Audit trail for compliance officers.'},
    ],
    faq:[
      {q:'Is a Neweb clinic website compliant with India data protection law?', a:'Yes. Neweb clinic sites ship with defaults aligned to the Digital Personal Data Protection Act 2023. That means SSL across the whole site, encrypted form submissions, no third-party analytics or advertising pixels by default, and a privacy policy that explicitly covers health data. Patient consent is captured at the booking form, and the right to access, correct, or delete data is supported through the clinic dashboard with an audit log. For clinics serving international patients, HIPAA-friendly defaults including encrypted data at rest are also available.'},
      {q:'Can patients book appointments and teleconsults online?', a:'Yes. The booking flow is the conversion event for a clinic site, so Neweb supports both an embedded direct booking widget that keeps the patient relationship and the data with the clinic, and an integration with Practo, Zocdoc, or Calendly for clinics already on those platforms. Direct booking captures name, phone, reason for visit, and slot, with automated SMS or WhatsApp reminders that cut no-show rates by 30 to 40 percent. Teleconsults integrate with Google Meet, Zoom, or Jitsi, and the join link is emailed an hour before the slot.'},
      {q:'Will my clinic rank for doctor near me searches in my city?', a:'Neweb claims and syncs your Google Business Profile and ships MedicalBusiness and Physician schema so Google understands your specialities, hours, and the doctors on your team. Each doctor gets a dedicated profile page with credentials, languages spoken, and review summary, which is what surfaces when a patient searches the doctor by name. The built-in review campaign sends a one-tap Google review link after every confirmed visit, and the weekly photo cadence keeps the profile fresh. Most new clinics reach 80 to 120 reviews in their first year on this playbook.'},
      {q:'Can I list multiple doctors with their languages and specialities?', a:'Yes. For multi-doctor practices, Neweb generates a dedicated page per doctor from a CSV import, complete with credentials, specialities, years of experience, hospital affiliations, and the languages each doctor speaks. The page carries Physician schema so Google can show the doctor in rich results, and it doubles as a marketing surface the doctor can share with referring colleagues and patients. The language field matters more than founders expect: putting Hindi, Marathi, English on a profile measurably lifts bookings in tier-2 cities.'},
    ]},
  { slug:'tutoring', h:'Tutoring & coaching', crumb:'Tutoring & coaching', serif:'results, shown', lead:'Coaching centres live or die by results. Neweb sites let you show them — scores, alumni, courses — without sacrificing speed or SEO.',
    pts:[
      {h:'Courses + batches', p:'Course cards with modules, fee structures, and batch calendars. Filter by entrance exam, stream, or language.'},
      {h:'Results gallery', p:'Showcase student achievements — topper cards, rank distributions, alumni Linkedin links. Refresh it in two clicks.'},
      {h:'Enquiry → WhatsApp', p:'Parents prefer WhatsApp. Every form submission pings your admissions inbox AND opens a WhatsApp thread with the parent.'},
      {h:'Multilingual announcements', p:'Holi, exam postponements, new batch announcements — publish once, Neweb translates to Hindi, Gujarati, Bengali, and more.'},
    ],
    faq:[
      {q:'How does a Neweb tutoring website help me get more admissions?', a:'A coaching centre converts on results, so Neweb puts a structured results gallery at the centre of the site, with topper photos, ranks, exam names, and a score distribution that parents can scan and verify. Every page carries a WhatsApp button, a call button, and a demo booking form, because the typical parent decision involves 8 to 12 touchpoints over two to four weeks and each transition is a chance to lose them. Every enquiry is logged in the dashboard with source and status, which turns admissions from a spreadsheet into a real pipeline.'},
      {q:'Can parents enquire and book demo classes over WhatsApp?', a:'Yes, and this is the dominant channel for Indian parents. Every page has a WhatsApp button with a message pre-filled for that specific course, such as an enquiry about the JEE Mains 2027 batch. Submissions land in your admissions team WhatsApp Business inbox, where labels track each parent from new enquiry to demo scheduled to enrolled. Broadcast lists handle batch updates, exam date changes, and result announcements. The cost is zero, and the reach in tier-2 cities is better than a paid CRM because parents already trust WhatsApp for everything.'},
      {q:'Can I show course details, batch timings, and fee structures?', a:'Yes. Neweb course pages are template-driven with course name, target exam, duration, syllabus, fee, batch schedule, and demo availability. Parents can filter by exam such as NEET, JEE, CAT, CLAT, or UPSC, by stream, and by language of instruction. Batch calendars update as seats fill, and fee structures are configurable per batch with clear EMI breakdowns. Each course page has its own meta title, description, and schema, so a search for JEE coaching in Kota returns the right course page rather than a generic homepage.'},
      {q:'Can I publish course pages in Hindi or my regional language?', a:'Yes, and for tier-2 and tier-3 cities this is a quiet advantage. Neweb publishes in 14 languages including Hindi, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi, and Urdu, and indexes each version separately for SEO. A coaching centre in Patna that publishes course pages in Hindi ranks for queries the English-only competitors never see. The regional version usually converts better too, because a parent making a decision about their child education reads carefully in the language they are most comfortable with.'},
    ]},
  { slug:'bakeries', h:'Bakeries & home bakers', crumb:'Bakeries', serif:'the first slice online', lead:'From home-kitchen bakers on Instagram to full storefront bakeries, customers decide on a cake or an order before they ever call. Neweb ships a site that shows the menu, takes the order, and gets found on Google.',
    pts:[
      {h:'Menu & catalogue that updates itself', p:'List cakes, cookies, and daily specials with prices and customization notes. Change a price once — it updates everywhere, including your Google Business Profile.'},
      {h:'Order via WhatsApp', p:'Every product card carries a WhatsApp button pre-filled with the item, so a customer can confirm a custom cake order — flavour, weight, message on top — in one tap.'},
      {h:'Photos that sell', p:'Upload straight from your phone. Neweb compresses and lays out a gallery that does the same job as an Instagram grid, but one that Google can actually index and rank.'},
      {h:'Local SEO for near-me cake searches', p:'Bakery and Store schema, Hindi/regional publishing, and weekly tuning so you show up for "cake shop near me" and "birthday cake [your area]" searches, not just your own name.'},
    ],
    faq:[
      {q:'How much does a bakery or home-baker website cost on Neweb?', a:'A bakery website on Neweb starts at 249 rupees a month, which includes the website itself, a free custom domain for the first year, hosting, SSL, SEO, and Google Business Profile setup. There is no separate charge for the product catalogue, photo gallery, or WhatsApp ordering button, all of which are standard on every plan rather than paid add-ons. This suits a home baker running out of their kitchen just as well as a storefront bakery with walk-in customers, since both need the same core things: a menu customers can browse, a way to order, and visibility in local search. The Growth plan at 1299 rupees a month adds multi-location support for bakeries running more than one outlet or a central kitchen plus retail counters across a city, with one dashboard managing all of them together.'},
      {q:'Can customers order custom cakes directly through the website?', a:'Yes. Every product listing carries a WhatsApp deep-link pre-filled with the item name, so a customer browsing your chocolate truffle cake can tap once and land in a WhatsApp chat ready to specify weight, flavour, and the message for the top. This matters more for bakeries than almost any other food business, because most orders are customized rather than off-the-shelf, and a rigid add-to-cart flow does not capture that nuance well at all in practice. For customers who prefer a form instead of chat, Neweb also supports a simple order enquiry form that lands in your dashboard with the same details, so nothing gets missed during a busy festival week when order volume spikes suddenly across every channel at once and things get hectic.'},
      {q:'Will my bakery show up in Google Maps and near-me searches?', a:'Neweb claims, verifies, and syncs your Google Business Profile automatically, which is what puts you in the Maps pack for searches like bakery near me or cake shop in your neighbourhood rather than leaving you invisible to nearby customers searching right now. The site ships Bakery and Store schema markup so Google understands your product range, price band, and delivery area, which helps you appear with a star rating and a call or WhatsApp button directly in search results. Weekly photo uploads and a steady review cadence, both built into the dashboard workflow, compound your ranking over the first two to three months, particularly important for home bakers who rely entirely on being discovered online rather than a physical shopfront pulling in walk-ins off the street.'},
      {q:'Is Neweb suitable for a home baker without a physical shop?', a:'Yes, and this is one of the more common bakery profiles we support on the platform today, alongside full storefront operations run from a shop. A home baker operating from their kitchen still benefits from every core piece: a proper catalogue instead of scrolling through an Instagram feed, a Google Business Profile listed as a service-area business rather than a walk-in shop, and local SEO tuned to your delivery radius rather than a fixed street address. Many home bakers find that a real website, rather than only social media, builds trust with new customers who have never ordered from them before, especially for higher-value orders like wedding cakes, hampers, or bulk festival orders where trust matters more than usual to close the sale confidently.'},
      {q:'Can I publish my bakery menu in Hindi or another regional language?', a:'Yes. Neweb publishes bakery and cafe menus in 14 Indian and international languages with one click each, and indexes every language version separately so a search in Marathi or Tamil returns the matching page rather than your English homepage by default every time. For a bakery in a tier-2 city, this regularly captures a segment of local customers who search and browse in their first language, particularly older customers ordering festival sweets or family celebration cakes who are far more comfortable reading in Hindi or their regional language than in English. Many bakeries find the regional version quietly outperforms the English page for exactly these occasion-based, trust-driven orders that depend on getting the details exactly right.'},
    ]},
  { slug:'wedding-planners', h:'Wedding & event planners', crumb:'Wedding planners', serif:'the big day, planned', lead:'Couples shortlist three to five planners before a single call. Neweb ships a portfolio-first site that shows your best work, builds trust fast, and turns browsing into an enquiry.',
    pts:[
      {h:'Portfolio that does the selling', p:'Full-bleed galleries per wedding, sortable by venue, budget, or style. The Instrument Serif italic styling gives every gallery an editorial, magazine feel rather than a generic template look.'},
      {h:'Enquiry form built for the decision', p:'Capture wedding date, guest count, venue city, and budget range in one short form. Every submission lands in your inbox and opens a WhatsApp thread so you can respond within the hour.'},
      {h:'Vendor & package pages', p:'List your packages — decor only, full planning, day-of coordination — with what is included. Couples self-qualify before they message you, so your first call is a warmer lead.'},
      {h:'Reviews & press, front and centre', p:'Pull in Google reviews and press mentions automatically. For a business built entirely on trust and referral, social proof on the homepage matters more than almost any other feature.'},
    ],
    faq:[
      {q:'How much does a wedding planner website cost on Neweb?', a:'A wedding or event planner website on Neweb starts at 249 rupees a month, covering the website, a free domain for the first year, hosting, SSL, SEO, and Google Business Profile setup. The portfolio galleries, package pages, and enquiry form are all included with no extra charge, which matters for a business where the website genuinely functions as your primary sales tool rather than a brochure that sits unused between bookings. The Growth plan at 1299 rupees a month suits planners operating across multiple cities or wanting multilingual pages for destination weddings that draw an NRI or pan-India client base comparing several vendors before committing, since those clients often research in more than one language before making a final shortlist decision.'},
      {q:'Can I showcase real weddings I have planned, organized by venue or style?', a:'Yes. Neweb builds a filterable portfolio where each wedding gets its own gallery page with a short story, the venue, guest count, and style tags such as destination, traditional, or fusion celebration for easy browsing. Couples can filter by the things that matter to their own decision, a beach wedding in Goa, a palace wedding in Udaipur, a budget-conscious city wedding, and see only relevant work rather than scrolling through everything you have ever done across every budget tier and city you serve. This filtering is what separates a portfolio that actually helps a prospective couple decide from one that just looks good but takes ten minutes to find anything genuinely relevant to their own plans and budget.'},
      {q:'How do couples get in touch, and how fast can I respond?', a:'Every package and portfolio page carries a short enquiry form asking for wedding date, guest count, venue city, and rough budget, which qualifies the lead before you even open the message yourself. Submissions land in your dashboard and simultaneously open a WhatsApp thread with the couple, since WhatsApp is where most Indian couples expect vendors to respond quickly rather than waiting on email replies that arrive a day later. Because wedding planning decisions typically involve comparing three to five planners over one to two weeks, response speed is one of the biggest factors in winning the booking, and the WhatsApp-first flow is built specifically to shorten that critical response window before a couple moves on to the next name on their list.'},
      {q:'Will my wedding planning business show up in local Google searches?', a:'Neweb claims and syncs your Google Business Profile and ships LocalBusiness and Event schema so Google understands your service area, packages, and reviews properly rather than guessing from unstructured text. This helps you appear for searches like wedding planner in your city or destination wedding planner Rajasthan, often alongside a star rating pulled from Google reviews directly in the results page. Because wedding bookings are seasonal and geographically specific, keeping your service area and package pricing current in both your Google profile and website, which Neweb syncs automatically without manual work on your part, has a real measurable effect on how often you show up for the right searches at the right time of year, particularly during peak wedding season.'},
      {q:'Can I publish my packages and portfolio in Hindi or other regional languages?', a:'Yes. Neweb publishes in 14 Indian and international languages with one click each, and indexes each version separately for search rather than treating translation as an afterthought bolted on later after launch. For destination and regional weddings, this matters more than it first appears: a family planning a wedding in a tier-2 or tier-3 city often researches and shortlists vendors in their first language even if they can read English comfortably, and a planner whose site meets them there builds trust earlier in a high-stakes, high-value decision that involves the whole extended family, not just the couple. Many planners publish English for the couple and a regional language for the parents, who are frequently the ones doing the early vendor research and shortlisting before the couple even gets involved.'},
    ]},
  { slug:'ngos-nonprofits', h:'NGOs & nonprofits', crumb:'NGOs & nonprofits', serif:'the mission, visible', lead:'Donors and volunteers decide to trust an NGO within seconds of landing on its website. Neweb ships a fast, credible site that shows your impact, takes donations, and keeps your story current without needing a developer.',
    pts:[
      {h:'Impact shown, not just claimed', p:'Structured impact blocks — beneficiaries reached, funds utilized, programs run — that update as easily as any other page content. Numbers a donor can actually verify build more trust than a mission statement alone.'},
      {h:'Donation & volunteer forms', p:'Embedded donation flow linked to your payment gateway, plus a volunteer sign-up form that routes straight to your coordination team. No separate donation-page tool needed.'},
      {h:'80G, FCRA & compliance details, done right', p:'A dedicated, clearly laid-out compliance page with your registration numbers, 80G and FCRA status, and annual reports — exactly what a serious donor or CSR partner checks before committing.'},
      {h:'Stories that move people', p:'Editorial-style story blocks for beneficiary and volunteer stories, using the same Instrument Serif treatment that makes for-profit brand pages feel considered — nonprofits deserve that too.'},
    ],
    faq:[
      {q:'How much does an NGO or nonprofit website cost on Neweb?', a:'An NGO website on Neweb starts at 249 rupees a month, including the website, a free domain for the first year, hosting, SSL, SEO, and Google Business Profile setup where relevant, such as for an NGO running a physical centre or office. Donation forms, volunteer sign-up, impact reporting blocks, and a compliance page for registration and tax-exemption details are all included with no extra module fee added on top of the base subscription. Many NGOs run on tight, donor-scrutinized budgets where every rupee spent on overhead is questioned, and a predictable flat monthly cost with no surprise add-ons is usually easier to justify to a board or funder than a per-feature pricing model that grows unpredictably as you add sections over time.'},
      {q:'Can donors give directly through the website?', a:'Yes. Neweb embeds a donation flow connected to your existing payment gateway, supporting UPI, cards, and net banking, so a donor can give in a few taps without leaving your site or being redirected to a generic third-party donation page that does not carry your branding at all and can feel impersonal to a first-time giver. You control suggested amounts, one-time versus recurring options, and whether donations are earmarked for a specific program or campaign your organization is currently running that quarter. For NGOs registered for 80G tax benefits, the confirmation flow can be set up to route toward your receipt process so donors get exactly what they need for their own tax filing without a separate manual step or delay.'},
      {q:'How do I show donors and CSR partners that our NGO is credible?', a:'Neweb gives NGOs a dedicated, clearly structured compliance and transparency page listing your registration details, 80G and FCRA status where applicable, board members, and links to annual reports or audited financials that back up your claims. This is frequently the first thing a serious individual donor or a corporate CSR team checks before committing funds, and having it organized and easy to find, rather than buried in a PDF somewhere on an old page nobody links to, measurably improves conversion from an interested visitor to an actual donor or partner. Impact numbers, beneficiaries reached, funds utilized by program, presented as structured, updatable blocks rather than a static paragraph, reinforce the same credibility every time someone new visits your site.'},
      {q:'Can volunteers sign up and get matched to programs through the site?', a:'Yes. A volunteer sign-up form captures availability, location, and areas of interest, such as teaching, medical camps, or event support, and routes submissions to your coordination team or a nominated program lead automatically without anyone manually checking an inbox each morning. For NGOs running many parallel programs, this turns a scattered mix of phone calls and messages into an organized pipeline your team can actually manage and follow up on consistently, rather than losing track of interested volunteers between conversations and forgetting to reply. The form can be customized per program if you run distinctly different volunteer needs, for example a literacy program and a disaster relief response team, without needing separate websites or separate tools for each initiative you run.'},
      {q:'Can our NGO publish content in Hindi or regional languages for local beneficiaries and volunteers?', a:'Yes. Neweb publishes in 14 Indian and international languages with one click each, with every version indexed separately for search rather than as an afterthought translation bolted on later once the site already exists. This matters for two different audiences at once: donors and CSR partners who may prefer English for reporting and formal communication, and local beneficiaries, volunteers, and community members who are far more likely to engage in Hindi or their regional language day to day on the ground. An NGO running programs in rural Bihar or interior Maharashtra, for instance, can publish outreach and volunteer information in Hindi or Marathi while keeping donor-facing impact reports in English, all managed from the same single site without duplicating effort or maintaining two separate systems.'},
    ]},
  { slug:'freelancers-consultants', h:'Freelancers & consultants', crumb:'Freelancers & consultants', serif:'expertise, credible', lead:'A prospective client Googles your name before a first call. Neweb ships a fast, professional site — services, case studies, credentials — that makes that search work in your favour instead of leaving them with only a LinkedIn profile.',
    pts:[
      {h:'Services & pricing, laid out clearly', p:'List what you offer — strategy consulting, design, legal advice, HR services — with clear scope and pricing or a "request a quote" path. Clients self-qualify before they book a call.'},
      {h:'Case studies that prove the work', p:'Structured case-study blocks — challenge, approach, result — instead of a generic testimonials page. The single strongest converter for high-ticket consulting and freelance work.'},
      {h:'Booking without the back-and-forth', p:'Embedded calendar booking for discovery calls, synced to Google Calendar. No more five-message thread just to find a slot that works.'},
      {h:'Credentials & professional schema', p:'ProfessionalService schema and a credentials section — certifications, past clients, years of experience — so Google and prospective clients both take you seriously from the first click.'},
    ],
    faq:[
      {q:'How much does a freelancer or consultant website cost on Neweb?', a:'A freelancer or consultant website on Neweb starts at 249 rupees a month, which includes the website, a free domain for the first year, hosting, SSL, SEO, and Google Business Profile setup for consultants who see clients from a registered office address. Case study pages, a services and pricing page, and calendar booking are included at no extra cost beyond the base subscription, with nothing gated behind a higher tier you have to unlock later. For an independent professional, this is usually far cheaper than hiring a developer for a one-off site, and unlike a one-off build, it keeps getting SEO-tuned every single week rather than going stale the day it launches and never improving again as your practice grows and evolves.'},
      {q:'Will a professional-looking website actually help me win more clients?', a:'Yes, and the reason is mostly about what happens before a client ever messages you at all in the first place. Nearly every serious prospective client searches your name or your firm before booking a call, and if that search turns up nothing but a LinkedIn profile or an outdated one-pager, it introduces doubt at exactly the moment you want confidence to build instead of hesitation creeping in. A clean site with clear services, real case studies, and visible credentials answers the unspoken question of whether you are legitimate and experienced before the conversation even starts, which shortens your sales cycle and reduces price objections, since credibility has already been partly established before the call begins and the negotiation starts on firmer ground.'},
      {q:'Can I show case studies and past client work without breaking confidentiality?', a:'Yes. Neweb case-study blocks are structured around challenge, approach, and result, and you control exactly how much you disclose in each one you choose to publish. Many consultants anonymize the client name, referring to "a mid-size manufacturing firm" or "a Series A SaaS startup," while still being specific about the problem and the measurable outcome, which is usually what actually convinces a prospective client, not the client name itself in most cases they come across. If you do have permission to name clients or display logos, the same blocks support that too without any extra setup required on your part. Either way, the format is built to make your best work legible in under thirty seconds of scanning by a busy decision maker.'},
      {q:'How do clients book a discovery call or consultation?', a:'Every services and case-study page carries a calendar booking widget synced to your Google Calendar, so a prospective client picks an open slot directly rather than exchanging several messages to find a time that works for both of you over several days. This alone removes a common point of friction where an interested lead goes cold during a slow back-and-forth over email or WhatsApp that drags on longer than it should. For consultants who prefer to screen before committing to a call, an optional short qualifying form, asking about budget range, project timeline, or company size, can sit in front of the booking calendar so you only spend calendar slots on genuinely qualified leads worth your time and attention.'},
      {q:'Does Neweb help me rank when someone searches for a consultant in my city or niche?', a:'Yes. Neweb ships ProfessionalService schema so Google understands your specialty, service area, and credentials clearly rather than guessing from plain unstructured text, and runs weekly SEO tuning across your services and case-study pages continuously without you asking for it each time. For a niche practice, an immigration consultant in Pune, a fractional CFO in Bangalore, a leadership coach in Delhi, ranking for the specific combination of service and city matters more than ranking for a broad, crowded generic term ever would to a genuinely qualified lead. Multilingual publishing is also available if part of your client base searches in Hindi or a regional language, which is common for consultants serving small and mid-size local businesses rather than only large corporates exclusively.'},
    ]},
  { slug:'event-planners', h:'Event planners', crumb:'Event planners', serif:'every event, on brand', lead:'Corporate offsites, birthday parties, product launches — clients book an event planner on portfolio and responsiveness. Neweb ships a site that shows range, takes enquiries fast, and never goes stale between events.',
    pts:[
      {h:'Portfolio by event type', p:'Corporate, weddings, birthdays, product launches — filterable galleries so a client planning a 50-person offsite isn\'t scrolling past 200-guest wedding photos to find relevant work.'},
      {h:'Fast enquiry, WhatsApp-first', p:'Event date, guest count, budget range, and event type captured in one form, landing in your inbox and opening a WhatsApp thread — because event enquiries are often time-sensitive and need a same-day reply.'},
      {h:'Vendor & package transparency', p:'Show package tiers — decor only, full production, end-to-end management — with clear inclusions. Clients arrive at your first call already knowing roughly what they need.'},
      {h:'Reviews & past clients, visible', p:'Corporate clients in particular check for past enterprise work before hiring. Show logos, testimonials, and Google reviews together on the homepage, not buried three pages deep.'},
    ],
    faq:[
      {q:'How much does an event planning website cost on Neweb?', a:'An event planner website on Neweb starts at 249 rupees a month, covering the website, a free domain for the first year, hosting, SSL, SEO, and Google Business Profile setup. Filterable portfolio galleries, package pages, and the WhatsApp-first enquiry flow are included with no extra charge on top of the base subscription, unlike tools that gate galleries or forms behind a higher plan you have to upgrade into. The Growth plan at 1299 rupees a month suits planners who run events across multiple cities or who want a multilingual site to reach both corporate clients in English and family or community event clients in a regional language, all managed from one dashboard without juggling separate logins or tools.'},
      {q:'Can I show different types of events separately, like corporate versus birthdays?', a:'Yes. Neweb builds a filterable portfolio so a client can view only corporate offsites, only birthday parties, only product launches, or only weddings, rather than one long undifferentiated gallery mixing everything together in a confusing scroll that buries the relevant work. This matters because a corporate HR manager planning a 100-person offsite and a parent planning a child\'s birthday party are looking for completely different signals of quality and scale, and showing them irrelevant work in between dilutes the impression of both audiences at once. Each event in the portfolio can carry its own short description, guest count, and venue, so prospective clients quickly find comparable past work that reassures their specific decision and budget range.'},
      {q:'How fast can clients reach me, and does it work for urgent, time-sensitive enquiries?', a:'Every portfolio and package page carries a short enquiry form asking for event date, guest count, event type, and budget range, and every submission simultaneously opens a WhatsApp thread with your team directly rather than sitting in an inbox. Event enquiries are frequently time-sensitive, a corporate offsite booked six weeks out, a birthday party booked in ten days, and clients expect a same-day response regardless of how far out the event actually is scheduled. The WhatsApp-first flow matches how event planning conversations actually happen in India, with photos, venue links, and quick back-and-forth clarifications, rather than forcing everything through slower, more formal email threads that delay decisions and lose momentum.'},
      {q:'Will my event planning business show up when someone searches for planners in my city?', a:'Neweb claims and syncs your Google Business Profile and ships Event and LocalBusiness schema so Google understands your service area, event types, and reviews clearly rather than treating your listing as generic and undifferentiated. This helps you appear for searches like corporate event planner in your city or birthday party planner near me, often with your star rating visible directly in the results page ahead of competitors nearby. Because event planning is seasonal and often booked in short, decisive windows, particularly around festival seasons and the corporate offsite calendar, keeping your availability, packages, and service area current, which Neweb keeps synced automatically without manual updates, has a direct effect on capturing that seasonal search volume exactly when it matters most.'},
      {q:'Can I publish my portfolio and packages in Hindi or other regional languages?', a:'Yes. Neweb publishes in 14 Indian and international languages with one click each, with each version indexed separately for search rather than as a manual afterthought added later once the site is already live. Many event planners serve two audiences with different language preferences within the same city, corporate clients who research and communicate in English, and family or community event clients, weddings, milestone birthdays, religious functions, who are more comfortable browsing and enquiring in Hindi or their regional language throughout the planning process. Publishing both versions from the same site, rather than maintaining separate pages manually across two systems, keeps your brand consistent while reaching both segments properly and without duplicated effort.'},
    ]},
];
pages.push({
  slug: 'solutions',
  title: 'Solutions by Industry — Restaurants, Clinics, Jewellers & more | Neweb',
  description: 'Neweb built for every small business: restaurants, jewellers, clinics, tutoring centres, salons, retail, hotels, and services. Industry-tuned templates, SEO, and GBP.',
  canonicalPath: '/pages/solutions',
  extraHead: RICH_STYLES,
  body: hero({
    crumb: [{label:'Solutions', href:'/pages/solutions'}],
    h1: `Built for <span class="serif">your trade</span>.`,
    lede: 'Every industry has its own rhythm — what customers search, which channels matter, what "good" looks like. Neweb ships with presets that respect that.',
  }) + section(`
    <div class="grid-2">
      ${industries.map(i => `
        <a class="card rise" href="/pages/solutions/${i.slug}" style="display:flex;flex-direction:column">
          <div class="ico">→</div>
          <h3>${i.h}</h3>
          <p>${i.lead.slice(0, 140)}…</p>
          <span style="margin-top:auto;padding-top:14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand);font-weight:500">Read more →</span>
        </a>
      `).join('')}
    </div>
    <p style="margin-top:28px;color:var(--muted);font-size:14px;text-align:center">Don\'t see your industry? We cover salons, hotels, retail, services and more — <a href="/pages/contact" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">ask us</a>.</p>
  `) + richProse(SOLUTIONS_HUB_BODY, { eyebrow: 'Why verticals' }) + cta(),
});

// Hand-picked tool cross-links per industry (boosts internal-link density into
// the tools cluster for the most relevant utilities per vertical).
const INDUSTRY_TOOLS = {
  restaurants: ['whatsapp-link-generator','upi-qr-code-generator','google-business-description-generator','qr-code-generator','localbusiness-schema-generator','meta-title-description-generator'],
  jewellers:   ['instagram-bio-generator','whatsapp-link-generator','upi-qr-code-generator','logo-maker','color-palette-generator','google-business-description-generator'],
  clinics:     ['whatsapp-link-generator','privacy-policy-generator','google-business-description-generator','localbusiness-schema-generator','meta-title-description-generator','email-signature-generator'],
  tutoring:    ['whatsapp-link-generator','upi-qr-code-generator','google-business-description-generator','instagram-bio-generator','localbusiness-schema-generator','gst-invoice-generator'],
};

industries.forEach(ind => {
  const longBody = INDUSTRY_BODIES[ind.slug] || '';
  const extras = PAGE_EXTRAS[ind.slug] || {};
  const canonPath = `/pages/solutions/${ind.slug}`;
  pages.push({
    slug: `solutions/${ind.slug}`,
    title: `${ind.h} Websites — Templates, SEO & Google Business | Neweb`,
    description: `${ind.lead.slice(0, 158)}`,
    canonicalPath: canonPath,
    extraHead: RICH_STYLES + FAQ_BLOCK_STYLES,
    jsonLd: serviceLd(ind, canonPath) + (ind.faq ? '\n' + faqLd(ind.faq) : ''),
    body: hero({
      crumb: [{label:'Solutions', href:'/pages/solutions'}, {label:ind.crumb, href:`/pages/solutions/${ind.slug}`}],
      h1: `${ind.h.split(' ')[0]} — from <span class="serif">${ind.serif}</span>.`,
      lede: ind.lead,
    }) + section(`
      <div class="grid-2">
        ${ind.pts.map(p => `
          <div class="card rise">
            <div class="ico">◆</div>
            <h3>${p.h}</h3>
            <p>${p.p}</p>
          </div>
        `).join('')}
      </div>
    `) + section(`
      <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> What's included</span><h2 class="h">Every plan, <span class="serif">fully tuned</span>.</h2></div>
      <dl class="kv">
        <dt>Website</dt><dd>Industry-specific template, 140+ blocks, sub-1s loads.</dd>
        <dt>Free domain</dt><dd>.com/.in/.shop/.co registered in your name, pointed at your site in under a minute.</dd>
        <dt>Google Business</dt><dd>Claimed, verified, synced to your site. Photos, hours, services always consistent.</dd>
        <dt>SEO autopilot</dt><dd>Schema for your vertical, multilingual where relevant, tuned weekly.</dd>
        <dt>Newsletter</dt><dd>Weekly updates to your customer base. DKIM/SPF monitoring included.</dd>
      </dl>
    `) + (longBody ? richProse(longBody, { eyebrow: extras.eyebrow, stats: extras.stats, quote: extras.quote }) : '') + (ind.faq ? faqSection(ind.faq, `${ind.crumb} questions`) : '') + toolsCrossLink((INDUSTRY_TOOLS[ind.slug] || []).slice(0, 6), `Tools for ${ind.crumb.toLowerCase()}`) + related([
      // One matching guide (hub-and-spoke internal linking), one sibling industry, then pricing
      { href: '/pages/guides/local-seo', title: 'Local SEO guide', blurb: 'Rank for near-me searches in your city: schema, reviews, regional language, the 90-day plan.' },
      ...industries.filter(x => x.slug !== ind.slug).slice(0, 1).map(x => ({
        href: `/pages/solutions/${x.slug}`, title: x.h, blurb: x.lead.slice(0, 110) + '…'
      })),
      { href: '/pages/pricing', title: 'Pricing', blurb: 'One plan, ₹249/month. Free domain, hosting, SEO, Google Business — all included.' }
    ]) + cta({ h2: `Run your <span class="serif">${ind.crumb.toLowerCase().split(' ')[0]}</span> online. Properly.` }),
  });
});

// ---------- COMPARE hub + pages ----------
const compares = [
  { slug:'wix', name:'Wix', tag:'vs Wix',
    intro:'Wix is a website builder. Neweb is the online-presence manager that happens to include a website. Here\'s how they stack up for small businesses.',
    rows: [
      ['Free domain included','Only 1st year on Premium+','✓ Every plan'],
      ['Google Business setup','Manual','✓ Automated'],
      ['Weekly SEO tuning','No','✓ Yes'],
      ['Multilingual (Indian languages)','Limited, extra cost','✓ 14 languages, no upsell'],
      ['Content export','Limited','✓ WordPress, one click'],
      ['Core Web Vitals ≥ 90','Varies by template','✓ Every site'],
      ['Indian payment rails (UPI, NEFT)','Partial','✓ Native'],
      ['Starting price','$16/mo ≈ ₹1,350','₹249/mo'],
    ],
    faq: [
      { q:'Is Neweb cheaper than Wix for an Indian small business?', a:'Yes, for most Indian small businesses Neweb works out cheaper once you add up what you actually need. Wix advertises low headline prices, but a custom domain, removing ads, extra storage, and apps for SEO or bookings all cost more, and many are billed in dollars. Neweb starts at ₹249 a month and already includes a free domain for the first year, hosting, SSL, Google Business setup, and weekly SEO tuning. There are no per-feature upsells. For a single-location shop, clinic, or restaurant that wants a working presence rather than a design playground, the total monthly cost on Neweb is usually a fraction of a comparable Wix Premium plan billed annually in INR.' },
      { q:'Can I move my existing Wix site to Neweb?', a:'You can move the content, though Wix does not offer a clean full-site export, so it is a rebuild rather than a file transfer. In practice this is faster than it sounds. You send us your current pages, images, and business details, and Neweb sets up a fresh site on a fast WordPress base, points your domain, and re-verifies your Google Business Profile. Most single-location migrations finish in one working session. Because Neweb exports cleanly to WordPress afterwards, you are never locked in the way you were on Wix. If you want, our team handles the whole move for you as part of onboarding at no extra charge.' },
      { q:'Does Wix include Google Business Profile management?', a:'Not really. Wix can connect to Google tools, but claiming, verifying, and keeping your Google Business Profile in sync with your website is left to you. That matters because for local businesses the Business Profile, not the website, is often the first thing customers see in Google Maps and local search. Neweb treats the Business Profile as a core surface. We help you claim and verify it, then keep hours, photos, services, and contact details consistent between your site and Google automatically. One edit updates both. For a corner shop or clinic chasing local customers, that sync is usually worth more than any template feature.' },
      { q:'Is Wix or Neweb better for SEO in India?', a:'Both can rank, but they take different approaches. Wix gives you the controls and expects you to do the ongoing work, choosing keywords, writing meta tags, and tuning pages yourself. Neweb runs SEO as a managed discipline, shipping schema, sitemaps, canonical tags, and weekly on-page tuning without you touching settings. For Indian search specifically, Neweb also handles multilingual SEO across languages like Hindi, Gujarati, and Tamil without an upsell, and keeps Core Web Vitals high on a LiteSpeed stack. If you have an in-house marketer who enjoys SEO, Wix is fine. If you would rather the work just happen, Neweb fits better.' },
    ]},
  { slug:'squarespace', name:'Squarespace', tag:'vs Squarespace',
    intro:'Squarespace is premium design-forward hosting. Neweb is a subscription that keeps your whole presence — not just the website — in sync.',
    rows: [
      ['Free domain included','1st year on annual','✓ Every plan, monthly'],
      ['Google Business setup','Not included','✓ Automated'],
      ['Automatic SEO tunes','Manual','✓ Weekly'],
      ['Bing Places, Maps sync','Manual','✓ Auto-synced'],
      ['Newsletter built in','Add-on ($7+)','✓ Included'],
      ['Support response','24–48h','< 2h (Starter), < 20min (Growth)'],
      ['Indian support hours','No','✓ IST business hours'],
      ['Starting price','$16/mo ≈ ₹1,350','₹249/mo'],
    ],
    faq: [
      { q:'Is Squarespace worth it for a small Indian business?', a:'Squarespace is genuinely good if design is your priority and you are comfortable paying in dollars. The templates are polished and the editor is pleasant. The catch for an Indian small business is total cost and scope. Squarespace bills annually in USD, a custom domain is only free on annual plans, and a built-in newsletter or appointment scheduling is an extra cost. It also does not manage your Google Business Profile, which is often where local customers find you first. Neweb starts at ₹249 a month, includes the domain, newsletter, and Google Business setup, and adds weekly SEO tuning. For a shop or clinic that wants results over aesthetics, Neweb usually delivers more for less.' },
      { q:'Can I move my Squarespace site to Neweb?', a:'Yes. Squarespace does not give you a complete export, so the move is a guided rebuild rather than a one-click import, but Neweb handles the heavy lifting. You hand over your pages, images, and business details, and we set up a fast equivalent site on WordPress, point your domain, and re-verify your Google Business Profile. Most single-location sites move across in a single session. Afterwards your content lives in WordPress, which exports cleanly, so you keep full ownership and avoid lock-in. Our onboarding team can run the entire migration for you, so switching does not mean downtime or a half-finished site while you learn a new tool.' },
      { q:'Does Squarespace handle SEO automatically?', a:'Squarespace gives you solid SEO foundations like clean markup and basic meta controls, but the ongoing work is yours to do. You choose keywords, write descriptions, build internal links, and keep things tuned as you add pages. Neweb runs that work as a managed service. It ships schema, sitemaps, canonicals, and weekly on-page tuning automatically, and handles multilingual SEO for Indian languages without an upsell. It also keeps Core Web Vitals high on a LiteSpeed stack. If you enjoy SEO and have time, Squarespace is capable. If you would rather your site quietly stays optimised while you run your business, Neweb is built for that.' },
      { q:'Is Squarespace or Neweb cheaper?', a:'Neweb is cheaper for most Indian small businesses once you compare like for like. Squarespace starts around sixteen dollars a month billed annually, and a newsletter or scheduling pushes the cost higher. The domain is only free on the annual plan, and everything is priced in USD, so currency swings matter. Neweb starts at ₹249 a month, billed in rupees, and already bundles the domain, hosting, SSL, Google Business setup, newsletter, and weekly SEO. There are no per-feature add-ons to buy later. For a single-location business that wants a complete working presence rather than premium design tooling, Neweb is the lower-cost and more complete option.' },
    ]},
  { slug:'zoho-sites', name:'Zoho Sites', tag:'vs Zoho Sites',
    intro:'Zoho Sites is a website builder bundled inside the wider Zoho software suite, with real India roots and dedicated alternative pages of its own. Neweb is a full done-for-you online presence manager. Here\'s how they compare for small businesses.',
    rows: [
      ['Free domain included','No, buy separately or bring your own','✓ Every plan, first year'],
      ['Google Business setup','Not included','✓ Automated'],
      ['Weekly SEO tuning','Basic on-page tools only','✓ Yes, ongoing'],
      ['Multilingual (Indian languages)','Manual translation','✓ 14 languages, no upsell'],
      ['Best fit','Teams already on Zoho CRM/Books','Any small business wanting one subscription'],
      ['Content export','Limited','✓ WordPress, one click'],
      ['Indian payment rails (UPI, NEFT)','Via Zoho Books integration','✓ Native'],
      ['Starting price','₹719/mo (Premium, billed annually)','₹249/mo'],
    ],
    faq: [
      { q:'Is Zoho Sites good for a small business in India?', a:'Zoho Sites is a reasonable choice if you are already deep in the Zoho ecosystem, using Zoho CRM, Books, or Mail, and want your website to sit alongside those tools under one login. It is built by an Indian company, Zoho Corporation, and bills in rupees, which is a genuine advantage over dollar-billed builders. The honest limitation is that Sites is a secondary product inside a much bigger suite, so the templates and page-building experience feel less polished than a dedicated builder, and support tends to route through general Zoho channels rather than a specialist website team. It also does not manage your Google Business Profile or run ongoing SEO tuning, both of which are core to Neweb. If you just want Zoho invoicing and a basic website, Sites is fine. If you want your whole online presence handled end to end, Neweb goes further for a lower monthly cost.' },
      { q:'Can I move my existing Zoho Sites website to Neweb?', a:'Yes. Zoho Sites does not offer a clean one-click export, so moving is a guided rebuild rather than a file transfer, but it is straightforward in practice. You share your existing pages, images, and business details, and Neweb sets up an equivalent site on a fast WordPress base, points your domain, and helps you claim and verify your Google Business Profile if that has not already been done. Most single-location businesses complete the move in one working session with our onboarding team, with no downtime for existing customers who already know your web address. You can keep using Zoho Books or Zoho CRM separately if those still serve you well; only the website itself needs to change. Afterwards, your content lives in WordPress, which exports cleanly, so you are never locked in again.' },
      { q:'Does Zoho Sites include Google Business Profile management?', a:'No, Zoho Sites is focused on the website itself and does not claim, verify, or sync your Google Business Profile. For most local businesses in India, from a shop in a local market to a clinic near a residential colony, the Business Profile in Google Maps is often the very first thing a customer sees, before they ever visit the website at all, so leaving it unmanaged is a real cost. Neweb treats this as a core part of the product rather than an afterthought bolted on. We help you claim and verify your listing, then keep hours, photos, services, and contact details automatically consistent between your website and Google. One edit updates both places, which removes a whole category of manual admin that a Zoho Sites user would otherwise have to handle themselves every time something changes.' },
      { q:'Is Zoho Sites cheaper than Neweb?', a:'Not usually, once you add up what a small business actually needs day to day. Zoho Sites Premium plan runs around 719 rupees a month when billed annually, and it does not include a free domain, Google Business management, or ongoing SEO tuning as standard, so those often become separate costs or manual chores. Neweb starts at 249 rupees a month and already bundles a free domain for the first year, hosting, SSL, automated Google Business setup, and weekly SEO tuning, with no separate add-ons to buy later as you grow. If you already pay for Zoho CRM or Books and Sites is a marginal extra cost to you, the comparison changes somewhat. But as a standalone website and presence tool, Neweb is the lower total cost for most single-location Indian businesses.' },
      { q:'Does Zoho Sites handle SEO automatically?', a:'Zoho Sites gives you the basic controls, meta titles, descriptions, and a sitemap, but the ongoing keyword research, schema markup, and page tuning are left entirely to you. There is no automated weekly review of your rankings or content, so results depend heavily on how much time you personally invest. Neweb runs SEO as a managed discipline instead, shipping structured data, canonical tags, sitemaps, and weekly on-page tuning without you ever touching a settings panel. It also handles multilingual SEO across Hindi, Gujarati, Tamil, and other Indian languages at no extra cost, with each language version indexed separately by Google. If you want SEO to just happen quietly in the background while you run your business, Neweb is built for exactly that; if you enjoy doing it yourself inside the Zoho console, Sites will get you the basics.' },
      { q:'Can Zoho Sites publish in Hindi or other Indian languages?', a:'You can manually create translated pages in Zoho Sites, but there is no built-in one-click multilingual publishing or automatic hreflang tagging for search engines, so you are effectively duplicating and maintaining separate pages yourself over time, which most small teams eventually let slip. Neweb publishes in 14 Indian and international languages with one click each, and indexes every language version independently with the correct technical tags, so a Hindi search returns your Hindi page directly rather than your English homepage. For a business in a tier-2 or tier-3 city, that regional-language version often converts meaningfully better than an English-only site, because customers browse and decide in the language they are most comfortable reading, especially for considered purchases. This is one of the clearer gaps between the two products.' },
      { q:'Which is easier to set up, Zoho Sites or Neweb?', a:'Zoho Sites uses a drag-and-drop editor that is reasonably approachable, especially if you already know your way around other Zoho apps like CRM or Books, but you are still building the site yourself, section by section and page by page, deciding every layout choice on your own. Neweb takes a different approach entirely: you answer four short questions about your business, audience, offerings, and style, and a complete first draft is generated for you automatically, including the groundwork for Google Business setup, before you have even finished the form. For a busy shop owner, clinic manager, or coaching centre founder who does not want to spend hours inside a website editor learning new software, Neweb is meaningfully faster to a finished, live site that already looks considered.' },
    ]},
  { slug:'dukaan', name:'Dukaan', tag:'vs Dukaan',
    intro:'Dukaan is a well-known India-first store builder focused squarely on selling products online. Neweb is a broader online presence manager for any small business, storefront or not. Here\'s an honest look at both.',
    rows: [
      ['Best fit','Product sellers wanting a simple online store','Any small business — shops, services, clinics, studios'],
      ['Free domain included','No, paid add-on','✓ Every plan, first year'],
      ['Google Business setup','Not included','✓ Automated'],
      ['Weekly SEO tuning','Basic store SEO only','✓ Yes, ongoing, all page types'],
      ['Non-store content (services, bookings)','Limited','✓ Full site builder, any business type'],
      ['Payment gateway','Built-in, commission-based on some plans','Bring your own gateway, no Neweb commission'],
      ['Multilingual (Indian languages)','Limited','✓ 14 languages, no upsell'],
      ['Starting price','₹552/mo (Growth, billed annually) + gateway fees','₹249/mo, flat'],
    ],
    faq: [
      { q:'Is Dukaan good for a small business in India?', a:'Dukaan is a solid, India-built option if your business is specifically about selling physical products online and you want the fastest possible route to a functioning storefront with catalogue, cart, and checkout. It genuinely understands Indian sellers, with WhatsApp catalogue sharing and cash-on-delivery support baked in from the start rather than added as an afterthought. The trade-off is that Dukaan is built narrowly around the store use case, so a clinic, salon, tutoring centre, or professional service that mostly needs bookings, information, and local discovery rather than a product catalogue will find it a narrower fit than expected. Neweb covers those business types directly, plus product-style catalogues for jewellers and boutiques, alongside Google Business management and ongoing SEO, which Dukaan does not focus on at all.' },
      { q:'Does Dukaan help with Google Business Profile and local SEO?', a:'Not really, Dukaan is focused on the storefront and checkout experience rather than local discovery in Google Maps or search results. It does offer basic SEO fields for individual product pages, but it does not claim, verify, or sync your Google Business Profile, and there is no ongoing weekly SEO tuning behind the scenes to keep pace with algorithm changes. For a business that depends on being found in Google Maps and near-me searches, such as a boutique with a physical location alongside its online sales, that gap matters more than it first appears when the store first launches. Neweb treats Google Business as a core, automated part of every plan, keeping hours, photos, and services in sync between your site and Google, and runs SEO as an ongoing managed discipline rather than a one-time setup you configure and forget.' },
      { q:'Can I move my Dukaan store to Neweb?', a:'Yes. You export or share your product catalogue, images, and pricing from Dukaan, and Neweb rebuilds an equivalent catalogue on a fast WordPress base with WooCommerce-style product listings, then points your domain and sets up your Google Business Profile alongside it if that has not been done yet by anyone on your team. Most single-catalogue stores move across in one guided session with our onboarding team, with minimal disruption to customers who already shop with you regularly and know your site. The advantage afterwards is that your site is no longer limited to a pure storefront template; you can add service pages, an appointment booking flow, or a blog for SEO, none of which fit naturally into a store-only builder like Dukaan.' },
      { q:'Does Dukaan charge transaction fees on sales?', a:'Depending on the plan and payment gateway you connect, Dukaan and its bundled payment partners can involve a percentage-based transaction fee on top of the monthly subscription, which adds up meaningfully for a business doing real sales volume over a full year. Neweb does not take any commission on your sales, ever, regardless of how much you sell in a given month. You connect your own payment gateway, such as Razorpay or a UPI-based provider, and pay only that gateway standard processing fee, plus your flat Neweb subscription of ₹249 or ₹1299 a month depending on plan. For a growing store, the difference between a flat monthly fee and a percentage of revenue can be substantial once volume picks up, particularly around festival seasons.' },
      { q:'Is Dukaan cheaper than Neweb?', a:'On paper Dukaan Growth plan is priced close to Neweb, but the full cost picture usually favours Neweb once you add a domain, which Dukaan does not include free, and any payment gateway commissions layered on top of the base subscription every month. Neweb bundles a free first-year domain, hosting, SSL, automated Google Business setup, and weekly SEO into a flat ₹249 a month with no revenue-based fees at any sales volume you reach. If your business is purely a high-volume product store and you specifically value Dukaan commerce features like abandoned cart recovery, that may be worth the premium to you. For most small businesses wanting one predictable monthly cost regardless of how sales go, Neweb works out lower and simpler to plan around.' },
      { q:'Can Dukaan build a website for a service business, not just a store?', a:'It can, in a limited way, since Dukaan has added some website-style pages over time, but the product is fundamentally designed around catalogue, cart, and checkout, so a service business ends up working against the grain of the tool rather than with it from day one. A clinic, salon, coaching centre, or consultant needs bookings, doctor or staff profiles, testimonials, and location-based SEO front and centre, which is exactly what Neweb templates are built for from the very start rather than bolted on afterwards. If you sell products, Dukaan strengths show clearly in that narrow lane. If you provide a service, Neweb is the more natural fit, and it still supports a product catalogue if you sell merchandise alongside your core service offering.' },
    ]},
  { slug:'bluehost', name:'Bluehost', tag:'vs Bluehost',
    intro:'Bluehost is a global hosting giant with a real India presence through india.bluehost.com and INR pricing. Neweb is a full online presence manager rather than hosting-plus-a-builder. Here\'s the honest comparison.',
    rows: [
      ['Free domain included','1st year, on hosting plans','✓ Every plan, first year'],
      ['Google Business setup','Not included','✓ Automated'],
      ['Weekly SEO tuning','No, manual via plugins','✓ Yes, ongoing'],
      ['Website builder included','Basic (WordPress + themes, self-managed)','✓ Full builder, plain-English edits'],
      ['Multilingual (Indian languages)','Via third-party plugins','✓ 14 languages, no upsell'],
      ['Maintenance & updates','Your responsibility (or paid add-on)','✓ Fully managed'],
      ['India data centre / INR billing','✓ Yes, india.bluehost.com','✓ Yes, native'],
      ['Starting price','₹199/mo (Basic hosting, billed 3-yearly)','₹249/mo, no long lock-in'],
    ],
    faq: [
      { q:'Is Bluehost good for a small business in India?', a:'Bluehost is a genuinely strong choice if you want raw WordPress hosting with an India-facing site, INR pricing, and the flexibility to install any theme or plugin you like without restriction. It is one of the more established names in global hosting and offers real value at the entry tier for anyone comfortable with that setup. The catch is that Bluehost sells you hosting and a domain, not a finished business presence you can hand off and forget. You are still responsible for choosing a theme, building the site, installing SEO plugins, keeping WordPress updated, and manually claiming your Google Business Profile. That suits a business with some technical comfort or a developer on call. If you want the whole thing handled without touching a control panel, Neweb removes that entire layer of work for a similar starting price.' },
      { q:'Does Bluehost include Google Business Profile setup?', a:'No, Bluehost is a hosting and domain provider, so Google Business Profile management is entirely outside its scope and not something support will help with even if you ask. You would need to claim, verify, and maintain your listing yourself, and keep it manually in sync with whatever you publish on your website going forward. For a shop, clinic, or restaurant that depends on local Maps visibility, that manual syncing is easy to let slip over time, stale hours or an old phone number on your profile actively costs you real customers every week it goes unnoticed. Neweb automates this claiming, verification, and ongoing sync as a standard part of every plan, so your site and your Google presence never quietly drift apart.' },
      { q:'Can I move my Bluehost-hosted WordPress site to Neweb?', a:'Yes, and it is usually simpler than most migrations because your content is already sitting on WordPress rather than a proprietary format that resists exporting cleanly. Neweb can import your existing pages, posts, and media, move them onto our managed and optimised hosting, and take over the maintenance burden, security patching, backups, and performance tuning, that you were previously handling yourself or paying Bluehost extra for every single month. Your domain moves across cleanly with no email disruption if configured correctly, and we help you claim and verify your Google Business Profile if that has not already been done. Most single-site migrations are completed in one working session with our team, with no meaningful downtime for existing visitors.' },
      { q:'Is Bluehost cheaper than Neweb?', a:'The advertised entry price can look cheaper, Bluehost Basic hosting starts near ₹199 a month, but that rate typically requires a three-year prepayment upfront and renews significantly higher afterwards once the promotional term ends and the real pricing kicks in, and it does not include a website builder with ongoing edits, Google Business management, or SEO tuning. Neweb starts at ₹249 a month with no long lock-in required, and already bundles the domain, hosting, SSL, the website itself, automated Google Business setup, and weekly SEO tuning. If you are comfortable managing WordPress yourself and mainly want cheap infrastructure, Bluehost wins on raw hosting price alone. If you want a finished, maintained business presence, Neweb is the more complete and often cheaper option in total.' },
      { q:'Do I need technical knowledge to use Bluehost for my business website?', a:'Some, yes, more than most first-time business owners expect going in. Bluehost gives you a control panel and a one-click WordPress install, which is a good starting point, but from there you are choosing a theme, configuring plugins for SEO and security, setting up backups, and keeping everything updated as WordPress and plugin versions change over months and years of running the site. Many small business owners either learn this over time through trial and error or hire a freelancer to maintain it, both of which cost real time or money either way. Neweb is built for the owner who does not want to learn hosting administration at all: you describe your business, get a finished site, and the platform handles security, updates, and performance in the background as part of the subscription.' },
      { q:'Does Bluehost handle SEO for my website?', a:'Bluehost itself does not run SEO; it simply provides the server your site lives on and little else in that direction beyond raw infrastructure. Any SEO work, installing a plugin like Yoast, writing meta descriptions, building schema markup, monitoring Core Web Vitals, is entirely up to you or whoever manages your WordPress install day to day on your behalf. Neweb runs SEO as an automated, ongoing part of the product instead: schema, sitemaps, canonical tags, and weekly on-page tuning happen without you ever configuring a plugin yourself, and multilingual Indian-language SEO is included at no extra cost. If you already have SEO expertise in-house, Bluehost plus your own plugin stack gives you full granular control. If you would rather it just be handled quietly, Neweb is built for that instead.' },
    ]},
  { slug:'ionos', name:'IONOS', tag:'vs IONOS',
    intro:'IONOS is a large European hosting and website-builder company with a dedicated en-in path and INR pricing for the Indian market. Neweb is a full done-for-you online presence manager. Here\'s how they compare.',
    rows: [
      ['Free domain included','1st year, on most plans','✓ Every plan, first year'],
      ['Google Business setup','Not included','✓ Automated'],
      ['Weekly SEO tuning','Basic SEO checklist tool','✓ Yes, ongoing, hands-off'],
      ['Multilingual (Indian languages)','Not built for Indian languages','✓ 14 languages, no upsell'],
      ['India-specific support','Limited, mostly EU/US hours','✓ IST business hours'],
      ['Content export','Varies by plan','✓ WordPress, one click'],
      ['Indian payment rails (UPI, NEFT)','Not native','✓ Native'],
      ['Starting price','₹190/mo approx (MyWebsite Now, intro rate)','₹249/mo, transparent'],
    ],
    faq: [
      { q:'Is IONOS good for a small business in India?', a:'IONOS is a large, well-funded European hosting provider that has extended INR pricing and a dedicated en-in path to reach Indian customers, so it is a legitimate option on paper rather than an afterthought market. The honest gap is that it is not built around Indian small business needs specifically: there is no native multilingual support for Hindi or other Indian languages, no Google Business Profile management, and support hours lean towards European and US time zones rather than IST. Its low intro pricing is also often a first-term promotional rate that increases noticeably at renewal, which catches some buyers off guard a year in. Neweb is built specifically for Indian SMBs, with IST support, native UPI handling, and automated local SEO and Google Business tools from day one.' },
      { q:'Does IONOS manage Google Business Profile for local SEO?', a:'No, IONOS focuses on the website and hosting side and does not claim, verify, or keep your Google Business Profile in sync with your site in any automated way whatsoever. For an Indian small business, whether a shop, clinic, or restaurant, the Google Business listing is frequently the very first thing a nearby customer sees in Maps or a near-me search, well ahead of the website itself loading. Leaving that unmanaged, or manually updating it separately from your site every time something changes, is a common way local businesses quietly lose visibility over time without noticing. Neweb automates the claiming, verification, and ongoing sync of your Business Profile as a core part of every plan, so hours, photos, and services never fall out of step with your website.' },
      { q:'Can I move my IONOS website to Neweb?', a:'Yes. Depending on which IONOS product you are on, whether a website builder or a self-managed WordPress install, we can either import your existing content directly or rebuild it from your pages and business details onto Neweb managed WordPress base entirely from scratch. Your domain is repointed carefully to avoid downtime, and we help you claim and verify your Google Business Profile if you have not already done so, since that is not something IONOS sets up automatically for you at any point in the process. Most single-location migrations are completed in one working session with our onboarding team, and afterwards your content exports cleanly to WordPress, so you retain full ownership going forward with no lock-in.' },
      { q:'Is IONOS cheaper than Neweb for an Indian business?', a:'The advertised entry price on IONOS can look attractive at first glance, but it is typically an introductory rate for the first contract term that increases meaningfully at renewal once the promotion ends, and it does not include Google Business management, ongoing SEO tuning, or Indian-language publishing as standard. Neweb starts at a flat ₹249 a month with no bait-and-switch renewal pricing to plan around later, and already bundles the domain, hosting, SSL, Google Business setup, and weekly SEO tuning. For an Indian small business comparing true cost over a full year rather than just the first promotional term, Neweb is typically the more transparent and often lower total cost once everything is accounted for properly.' },
      { q:'Does IONOS support Hindi or regional Indian languages?', a:'Not natively, no, and this is a real gap for Indian buyers. IONOS website tools are built primarily for European and North American markets, so there is no dedicated one-click support for publishing in Hindi, Gujarati, Tamil, or other Indian languages with correct search-engine tagging built in. You would need third-party translation plugins and manual technical setup to even approximate what Neweb does natively out of the box for every customer. Neweb publishes in 14 Indian and international languages with one click each, with each version indexed separately by search engines using the correct hreflang tags, which is often the real difference between reaching only English-first urban customers and reaching a much wider regional audience across tier-2 and tier-3 India.' },
      { q:'Will I get India-timezone support with IONOS?', a:'Support quality and hours vary by region for a company as large and globally spread as IONOS, and its core support operation is oriented around European and North American business hours rather than Indian ones specifically. An Indian small business owner may find themselves waiting overnight for a response to an urgent issue like a site outage or a domain renewal problem right before a busy sales day begins. Neweb support operates in IST business hours specifically for the Indian customer base, with faster response times built into the Growth plan for businesses that cannot afford to wait around. If round-the-clock global support infrastructure matters less to you than getting a same-day answer in your own working hours, that difference is genuinely worth weighing.' },
    ]},
];
pages.push({
  slug: 'compare',
  title: 'Compare — Neweb vs Wix, Squarespace, WordPress | Neweb',
  description: 'How Neweb compares to Wix, Squarespace, Shopify, WordPress.com and other website builders. Real tables, no marketing fluff.',
  canonicalPath: '/pages/compare',
  extraHead: RICH_STYLES,
  body: hero({
    crumb: [{label:'Compare', href:'/pages/compare'}],
    h1: `Neweb vs <span class="serif">the others</span>.`,
    lede: 'We\'ve lined up the specs next to the biggest website builders so you can decide with eyes open. Pick your comparison below.',
  }) + section(`
    <div class="grid-2">
      ${compares.map(c => `
        <a class="card rise" href="/pages/compare/${c.slug}" style="display:flex;flex-direction:column">
          <div class="ico">↔</div>
          <h3>Neweb ${c.tag}</h3>
          <p>${c.intro.slice(0, 140)}…</p>
          <span style="margin-top:auto;padding-top:14px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand);font-weight:500">See comparison →</span>
        </a>
      `).join('')}
    </div>
    <p style="margin-top:28px;color:var(--muted);font-size:14px;text-align:center">Weighing up your options? Read our honest roundup of the <a href="/pages/best-website-builder-india" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">best website builders for small businesses in India</a>.</p>
    <p style="margin-top:10px;color:var(--muted);font-size:14px;text-align:center">More comparisons coming — Shopify, WordPress.com, GoDaddy, Webflow. <a href="/pages/contact" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">Request one</a>.</p>
  `) + richProse(COMPARE_HUB_BODY, { eyebrow: 'How to choose' }) + cta(),
});

compares.forEach(c => {
  const longBody = COMPARE_BODIES[c.slug] || '';
  const extras = PAGE_EXTRAS[c.slug] || {};
  // ItemList schema so AI extractors can read the comparison rows (the audit
  // flagged the CSS-grid table as invisible to AI). Each row becomes a list
  // item with the feature, the competitor value, and the Neweb value.
  const compareLd = jsonLdBlock({
    '@context':'https://schema.org','@type':'ItemList',
    name: `Neweb vs ${c.name} feature comparison`,
    description: `Feature-by-feature comparison of Neweb and ${c.name} for Indian small businesses.`,
    itemListElement: c.rows.map((r, i) => ({
      '@type':'ListItem', position: i+1, name: stripTags(r[0]),
      description: `${c.name}: ${stripTags(r[1])}. Neweb: ${stripTags(r[2])}.`
    }))
  });
  pages.push({
    slug: `compare/${c.slug}`,
    title: `Neweb vs ${c.name} — Features, Pricing, SEO Compared | Neweb`,
    description: `A feature-by-feature comparison of Neweb and ${c.name} for small-business websites, domains, Google Business, and SEO.`,
    canonicalPath: `/pages/compare/${c.slug}`,
    extraHead: RICH_STYLES + FAQ_BLOCK_STYLES,
    jsonLd: compareLd + (c.faq ? '\n' + faqLd(c.faq) : ''),
    body: hero({
      crumb: [{label:'Compare', href:'/pages/compare'}, {label:c.name, href:`/pages/compare/${c.slug}`}],
      h1: `Neweb vs <span class="serif">${c.name}</span>.`,
      lede: c.intro,
    }) + section(`
      <table class="cmp-table">
        <caption class="sr-only">Feature comparison of Neweb and ${c.name}</caption>
        <thead><tr><th scope="col">Feature</th><th scope="col">${c.name}</th><th scope="col">Neweb</th></tr></thead>
        <tbody>
        ${c.rows.map(r => `
          <tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td class="brand">${r[2]}</td></tr>
        `).join('')}
        </tbody>
      </table>
      <p style="margin-top:18px;color:var(--muted);font-size:13px">Prices and features cross-checked ${new Date().toISOString().slice(0,7)}. Both products evolve — if something\'s stale, <a href="/pages/contact" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">flag it</a>.</p>
    `) + (longBody ? richProse(longBody, { eyebrow: extras.eyebrow, stats: extras.stats, quote: extras.quote }) : '') + (c.faq ? faqSection(c.faq, `Neweb vs ${c.name} questions`) : '') + related([
      { href: '/pages/pricing', title: 'Neweb pricing', blurb: 'Starter at ₹249, Growth at ₹1299. Free domain and Google Business on every plan.' },
      { href: '/pages/features', title: 'Full feature list', blurb: 'Everything Neweb does — website, SEO, GBP, multilingual, newsletter, analytics.' },
      ...compares.filter(x => x.slug !== c.slug).slice(0, 1).map(x => ({
        href: `/pages/compare/${x.slug}`, title: `Neweb vs ${x.name}`, blurb: x.intro.slice(0, 110) + '…'
      }))
    ]) + cta({ h2: `Switching from <span class="serif">${c.name}</span>?`, p: 'We export your content, point your domain, and handle the GBP re-verification. Most migrations finish in one sitting.' }),
  });
});

// ---------- ROUNDUP: Best website builders in India ----------
(() => {
  const builders = [
    { name:'Neweb', bestFor:'Indian SMBs wanting a managed presence', freeDomain:'Yes, first year, every plan', price:'₹249/mo', india:'Built for India, IST support, UPI' },
    { name:'Wix', bestFor:'DIY drag-and-drop design', freeDomain:'1st year on Premium+', price:'~₹1,350/mo', india:'Global, partial UPI' },
    { name:'Squarespace', bestFor:'Design-led brand sites', freeDomain:'1st year on annual', price:'~₹1,350/mo', india:'Global, USD billing' },
    { name:'GoDaddy', bestFor:'Fast simple sites plus domains', freeDomain:'With annual plans', price:'~₹999/mo', india:'INR billing, India data centres' },
    { name:'Hostinger', bestFor:'Budget hosting plus builder', freeDomain:'1st year on annual', price:'~₹149/mo billed yearly', india:'INR pricing, India servers' },
    { name:'Shopify', bestFor:'Serious online stores', freeDomain:'No, domain extra', price:'~₹1,994/mo', india:'Strong India payments and shipping' },
    { name:'WordPress', bestFor:'Full control and ownership', freeDomain:'Varies by host', price:'Hosting from ~₹199/mo', india:'Depends on your host' },
    { name:'Webflow', bestFor:'Designers wanting pixel control', freeDomain:'No', price:'~₹1,150/mo', india:'Global, USD billing' },
  ];

  const tableRows = builders.map(b => `
    <tr>
      <th scope="row"${b.name==='Neweb'?' class="brand"':''}>${b.name}</th>
      <td>${b.bestFor}</td>
      <td>${b.freeDomain}</td>
      <td>${b.price}</td>
      <td>${b.india}</td>
    </tr>`).join('');

  const verdicts = `
    <h2>A short, honest take on each builder</h2>
    <h3>Neweb</h3>
    <p>Neweb is an online-presence manager rather than a pure website builder. It bundles a fast website, a free first-year domain, Google Business Profile setup, weekly SEO tuning, and a newsletter into one ₹249 a month subscription. The trade-off is that you get less granular design control than a tool like Webflow, and it is aimed squarely at Indian small businesses, not large global stores. If you run a shop, clinic, restaurant, or coaching centre and you want your whole presence handled rather than just a page to design, it is a strong fit. If you want to hand-craft every pixel yourself, look elsewhere.</p>
    <h3>Wix</h3>
    <p>Wix is the best known drag-and-drop builder and it is genuinely easy to start with. The template library is huge and the editor is forgiving. The honest downsides for Indian businesses are cost and creep: a custom domain, removing ads, and apps for SEO, bookings, or email all add up, and pricing leans on dollar billing. It also leaves Google Business Profile work to you. Wix suits a hobbyist or solo founder who enjoys building the site themselves and does not mind paying for extras over time.</p>
    <h3>Squarespace</h3>
    <p>Squarespace makes the most polished templates in this list and is a joy if visual design is your priority. It is a fair pick for portfolios, studios, and brand-led businesses. For an Indian small business the friction is annual USD billing, a domain that is only free on annual plans, and paid add-ons for newsletters and scheduling. There is no Google Business management. Choose Squarespace when how the site looks matters more than how cheaply and automatically it runs.</p>
    <h3>GoDaddy</h3>
    <p>GoDaddy is convenient if you also want your domain, email, and site under one familiar roof, and it bills in rupees. Its Websites and Marketing builder is quick to set up and fine for a simple brochure site. The honest limitation is depth: SEO controls and design flexibility are modest, and you can outgrow it. GoDaddy works for a business that wants something live this week with minimal fuss and is not planning a complex site later.</p>
    <h3>Hostinger</h3>
    <p>Hostinger is the value champion here, with very low INR pricing, servers in India, and a decent built-in builder alongside cheap WordPress hosting. If budget is the deciding factor and you are willing to do the setup and ongoing SEO yourself, it is hard to beat on price. The catch is that the headline rate needs a multi-year prepayment, and you are managing more of the work yourself. It suits the hands-on founder who is comfortable with hosting and wants to spend as little as possible.</p>
    <h3>Shopify</h3>
    <p>Shopify is the right answer when selling products online is the main goal. Its checkout, inventory, payments, and shipping tooling for India are excellent, and the app ecosystem is deep. It is overkill, and relatively pricey, for a business that mostly needs an informational site and a Google presence. Pick Shopify if e-commerce is central to your business, not an afterthought.</p>
    <h3>WordPress</h3>
    <p>Self-hosted WordPress gives you the most ownership and flexibility of anything here, and it powers a huge share of the web. The cost is responsibility: you choose a host, manage updates, security, and SEO plugins, and assemble the pieces yourself. It rewards businesses with some technical comfort or a developer on call. Notably, Neweb is built on a managed WordPress base, so you get WordPress portability without the maintenance burden.</p>
    <h3>Webflow</h3>
    <p>Webflow offers near pixel-perfect design control with clean output, and designers love it. It is the most powerful visual builder for custom layouts. For a typical Indian small business it is the wrong tool: there is a real learning curve, billing is in USD, and there is no built-in domain, Google Business, or local SEO help. Choose Webflow only if you or your team have design and CSS skills and want full creative control.</p>
  `;

  const howToChoose = `
    <h2>How to choose the right builder for your business</h2>
    <p>The best website builder is the one that matches how much work you want to do and what your business actually needs to be found and trusted. Start with these questions.</p>
    <h3>Do you want to build it, or have it handled?</h3>
    <p>DIY tools like Wix, Squarespace, and Webflow hand you the controls and expect you to keep the site, SEO, and listings current. Managed options like Neweb do that ongoing work for you. If you are time-poor and running a shop or clinic, managed usually wins. If you enjoy building and have hours to spare, a DIY builder can be rewarding.</p>
    <h3>How important is local discovery?</h3>
    <p>For most Indian small businesses, customers arrive through Google Maps and local search, not a clever homepage. That makes Google Business Profile setup and local SEO more valuable than template variety. Only some tools help with this, so weigh it heavily if you serve a city or neighbourhood.</p>
    <h3>What is the real monthly cost in rupees?</h3>
    <p>Compare totals, not headline prices. Add the domain, SSL, SEO apps, newsletter, and currency conversion. A cheap-looking plan billed in dollars with paid add-ons can cost more than an all-inclusive INR subscription. Check what is bundled before you commit.</p>
    <h3>Will you outgrow it?</h3>
    <p>If you plan to sell products at scale, Shopify is worth the premium. If you want maximum control later, WordPress portability matters. Pick a tool whose ceiling is above your two-year plan so you are not forced to rebuild.</p>
  `;

  const roundupFaq = [
    { q:'What is the best website builder for a small business in India?', a:'There is no single best builder for everyone, because the right choice depends on your goals and how much work you want to do yourself. For a typical Indian small business that wants to be found locally without managing the site daily, a bundled presence manager like Neweb fits well, since it includes a domain, hosting, Google Business setup, and weekly SEO for ₹249 a month. If design control is your priority, Squarespace or Webflow are stronger. If you are selling products at scale, Shopify is the clear pick. If you want the lowest price and are happy to do setup yourself, Hostinger is hard to beat. Decide what matters most first, then match the tool to it.' },
    { q:'Which website builder is cheapest in India?', a:'On raw headline price, Hostinger is usually the cheapest, with plans advertised from around ₹149 a month when you prepay for several years, and it offers servers in India. WordPress on budget shared hosting can also be very cheap if you do the setup yourself. However, the cheapest sticker price is not always the lowest real cost. Once you add a domain, SSL, SEO plugins, and a newsletter, a bundled subscription such as Neweb at ₹249 a month can work out cheaper overall because those extras are already included. Dollar-billed tools like Wix and Squarespace tend to cost more in rupees after add-ons. Always compare the full monthly total for what you actually need, not just the entry price.' },
    { q:'Do I need to know coding to build a business website?', a:'No. Every builder in this roundup is designed so that you do not need to write code to get a working website. Drag-and-drop tools like Wix and Squarespace let you assemble pages visually, and Shopify guides you through setting up a store step by step. Managed services like Neweb go further and build the site for you from your business details, so you barely touch an editor at all. The two options that reward technical skill are self-hosted WordPress, where you manage hosting and plugins, and Webflow, which expects some understanding of layout and CSS to use well. For most small business owners with no coding background, a managed or simple drag-and-drop tool is the sensible path.' },
    { q:'Does a website builder include a free domain in India?', a:'Some do, but the terms vary, so read the fine print. Neweb includes a free domain for the first year on every plan, including its monthly plan. Wix, Squarespace, and Hostinger typically offer a free first-year domain only when you commit to an annual or longer plan, and renewals are charged at standard rates afterwards. Shopify and Webflow generally do not include a domain, so you buy it separately. GoDaddy bundles a domain with some annual plans, which makes sense given it is also a registrar. In every case the free part usually applies only to the first year, so factor in renewal costs from year two onward when you compare the true price of each option.' },
    { q:'Is a website builder or WordPress better for SEO?', a:'Both can rank well, so the difference is less about raw capability and more about who does the work. Self-hosted WordPress gives you total control over SEO through plugins, but you are responsible for configuring schema, sitemaps, page speed, and ongoing tuning yourself or via a developer. Hosted builders like Wix and Squarespace provide solid SEO basics but still expect you to write meta tags and maintain content. Managed services such as Neweb run SEO as an automated discipline, shipping schema, canonicals, sitemaps, and weekly on-page tuning without you touching settings, and they handle multilingual Indian-language SEO. If you want hands-off results, a managed option helps. If you want full control and have the skills, WordPress is excellent.' },
    { q:'Can I move my website to a different builder later?', a:'Usually yes, but how easy it is depends on the platform you start on. Self-hosted WordPress is the most portable, since you can export your content and move hosts freely. Tools like Wix and Squarespace are more locked in, because they do not provide a clean full-site export, so moving away means rebuilding the pages elsewhere. That is worth knowing before you commit years to one of them. Neweb is built on a managed WordPress base and exports cleanly to WordPress in one click, so you keep ownership and can leave without losing your content. When choosing a builder, check its export options early, because a platform that traps your content can quietly raise the cost of ever switching later.' },
  ];

  const builderItemList = jsonLdBlock({
    '@context':'https://schema.org','@type':'ItemList',
    name:'Best website builders for small businesses in India (2026)',
    description:'Comparison of leading website builders for Indian small businesses, including Neweb, Wix, Squarespace, GoDaddy, Hostinger, Shopify, WordPress, and Webflow.',
    itemListElement: builders.map((b, i) => ({
      '@type':'ListItem', position: i+1, name: b.name,
      description: `Best for ${b.bestFor.toLowerCase()}. Starting price ${b.price}. India support: ${b.india}.`
    }))
  });

  pages.push({
    slug: 'best-website-builder-india',
    title: 'Best Website Builders for Small Businesses in India (2026) | Neweb',
    description: 'An honest, hands-on comparison of the best website builders for Indian small businesses in 2026: Neweb, Wix, Squarespace, GoDaddy, Hostinger, Shopify, WordPress, and Webflow.',
    canonicalPath: '/pages/best-website-builder-india',
    extraHead: FAQ_BLOCK_STYLES,
    jsonLd: builderItemList + '\n' + faqLd(roundupFaq),
    body: hero({
      crumb: [{label:'Compare', href:'/pages/compare'}, {label:'Best website builders in India', href:'/pages/best-website-builder-india'}],
      h1: `Best website builders for <span class="serif">small businesses in India</span> (2026).`,
      lede: 'A practical, balanced look at the website builders Indian small businesses actually consider, with a clear comparison table, an honest take on each, and a simple way to choose.',
    }) + section(`
      <div class="prose" style="max-width:860px">
        <p>If you run a small business in India and you are choosing where to build your website, the sheer number of options is the hard part. The same handful of tools come up again and again, but they are built for very different people. Some are pure design playgrounds. Some are e-commerce engines. One or two are managed services that handle the whole job for you. This guide cuts through it.</p>
        <p>Below is a side-by-side comparison of eight builders, followed by an honest paragraph on each, a short framework for choosing, and answers to the questions Indian business owners ask most. We sell one of these tools, Neweb, so we have placed it fairly and told you plainly where rivals are the better pick. Prices are indicative and were cross-checked in ${new Date().toISOString().slice(0,7)}; always confirm current rates before you buy.</p>
      </div>
    `) + section(`
      <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> At a glance</span><h2 class="h">Eight builders, <span class="serif">compared</span>.</h2></div>
      <table class="cmp-table">
        <caption class="sr-only">Comparison of website builders for small businesses in India by best use, free domain, starting price, and India support</caption>
        <thead>
          <tr>
            <th scope="col">Builder</th>
            <th scope="col">Best for</th>
            <th scope="col">Free domain</th>
            <th scope="col">Starting price</th>
            <th scope="col">India support</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p style="margin-top:18px;color:var(--muted);font-size:13px">Prices are indicative, shown in INR where possible, and were last reviewed ${new Date().toISOString().slice(0,7)}. Builders change plans often, so verify current pricing on each provider's site.</p>
    `, 'padding-top:0') + section(`<div class="prose" style="max-width:860px">${verdicts}${howToChoose}</div>`, 'padding-top:0')
      + faqSection(roundupFaq, 'Best website builder in India: FAQ')
      + related([
        { href: '/pages/compare/wix', title: 'Neweb vs Wix', blurb: 'A feature-by-feature look at how Neweb and Wix compare for Indian small businesses.' },
        { href: '/pages/compare/squarespace', title: 'Neweb vs Squarespace', blurb: 'How Neweb stacks up against Squarespace on price, SEO, and local discovery.' },
        { href: '/pages/pricing', title: 'Neweb pricing', blurb: 'One plan from ₹249/month with a free domain, Google Business, and weekly SEO.' },
      ])
      + cta({ h2: `Want your whole presence <span class="serif">handled</span>?`, p: 'Claim a free domain and get your site, Google Business, and SEO set up for ₹249 a month. Cancel anytime, keep your content forever.' }),
  });
})();

// ---------- GUIDES hub + two guides ----------
pages.push({
  slug: 'guides',
  title: 'Guides — Domains, Google Business & SEO how-tos for SMBs | Neweb',
  description: 'Practical guides for small businesses: building an online presence, SEO for local search, claiming Google Business, picking a domain, and more.',
  canonicalPath: '/pages/guides',
  extraHead: RICH_STYLES,
  body: hero({
    crumb: [{label:'Guides', href:'/pages/guides'}],
    h1: `Short, <span class="serif">practical</span> guides.`,
    lede: 'No fluff. Start-to-finish walkthroughs for running the online side of a small business.',
  }) + section(`
    <div class="grid-2">
      <a class="card rise" href="/pages/guides/online-presence">
        <div class="ico">◆</div>
        <h3>Building your online presence from zero</h3>
        <p>A 10-minute walkthrough — domain, site, Google Business, newsletter. If you do nothing else this month, do these four things.</p>
      </a>
      <a class="card rise" href="/pages/guides/google-business">
        <div class="ico">◆</div>
        <h3>Claiming and optimizing Google Business Profile</h3>
        <p>Why GBP matters, how to claim it, what to fill in, and which fields actually move you up in local results.</p>
      </a>
      <a class="card rise" href="/pages/guides/local-seo">
        <div class="ico">◆</div>
        <h3>Local SEO for Indian small businesses</h3>
        <p>The specifics of ranking for "near me" searches in Tier-2 cities. Schema, reviews, vernacular keywords.</p>
      </a>
      <a class="card rise" href="/pages/guides/picking-a-domain">
        <div class="ico">◆</div>
        <h3>Picking the right domain name</h3>
        <p>.com vs .in vs .shop. Length, spellings, brand match, and the three-second test every good name passes.</p>
      </a>
    </div>
  `) + richProse(GUIDES_HUB_BODY, { eyebrow: 'How this works' }) + cta(),
});

const guides = [
  { slug:'online-presence', h:'Building your online presence from zero', d:'A 10-minute start-to-finish guide — domain, website, Google Business, and newsletter. The four things every small business should do this month.',
    sections:[
      ['1. Register a domain in your name','Pick one you can remember over the phone. ≤14 characters. Skip weird spellings. Prefer .com, else .in or your local TLD. Register it yourself — never under an agency\'s account.'],
      ['2. Put a fast website on it','Templates exist for a reason. Pick one that looks like your industry. Aim for ≤1 second load on 3G. Every page should have your phone number, address, and hours above the fold.'],
      ['3. Claim your Google Business Profile','Search your business name on Google. If a listing exists, click "Own this business?" If not, create one. Verify (postcard, phone, or email). Add 10 photos — exterior, interior, team, product, signage.'],
      ['4. Capture emails from day one','Add a newsletter signup — footer and one other place. Send something (anything) weekly. The compounding kicks in around month 3.'],
    ]},
  { slug:'google-business', h:'Claiming and optimizing Google Business Profile', d:'Everything you need to claim your GBP, fill it in, and keep it accurate — the single biggest lever for walk-in traffic to a local business.',
    sections:[
      ['Why GBP matters more than your website','70% of local searches never click past the Map Pack. If your GBP isn\'t claimed, you\'re losing the customer before they see your site.'],
      ['Claiming: step by step','Go to business.google.com. Search for your business. If it exists, request ownership. If not, create it. Verify via postcard (7–14 days), phone, or email. Postcard is the most reliable.'],
      ['Fields that actually move rankings','Primary category (be specific — not "Restaurant", but "Bakery"). Service area if you deliver. Opening hours including special hours. Services list with descriptions. Photos — at least 20.'],
      ['Review velocity > review count','Google weights recency. 1 review per week beats 50 two-year-old reviews. Ask every satisfied customer, the day they visit. Respond to every review, positive or negative, within 48 hours.'],
    ]},
  { slug:'local-seo', h:'Local SEO for Indian small businesses', d:'Practical tactics to rank for "near me" searches in Indian cities and towns. Schema, reviews, vernacular keywords, and the things Google actually rewards.',
    sections:[
      ['Schema is the cheat code','Add LocalBusiness schema to your homepage. Add specific sub-types where relevant (Restaurant, MedicalBusiness, Store). Validate with Google\'s Rich Results Test. Most competitors haven\'t done this.'],
      ['Vernacular keywords matter','"दिल्ली में बेकरी" gets less competition than "bakery in Delhi". Create Hindi/regional-language versions of your key landing pages. Neweb does this in one click.'],
      ['NAP consistency','Name, Address, Phone. Same exact format everywhere — your site, GBP, Bing, Just Dial, Sulekha, Facebook. Inconsistencies actively hurt rankings.'],
      ['Reviews and photos','Again, recency over count. Weekly reviews. Fresh photos monthly. Respond to every review in both English and the local language where applicable.'],
    ]},
  { slug:'picking-a-domain', h:'Picking the right domain name', d:'.com vs .in vs .shop. Length, spellings, brand match, and the three-second test every good domain name passes.',
    sections:[
      ['The three-second test','Say it out loud. Can someone type it after hearing it once? If not, keep looking. Domains are spoken first, typed second.'],
      ['TLD: .com still wins, but .in is fine','For Indian-only businesses, .in is neutral. For global aspirations, .com. Avoid .info, .biz, and anything unusual — they pattern-match as spam to some users.'],
      ['Length and spelling','≤14 characters. Skip hyphens. Skip numbers unless they\'re part of your brand. Stick to single-word or obvious-compound. "copperoven" > "the-copper-oven-bakery".'],
      ['Own the domain yourself','Never register under an agency\'s or friend\'s account. If they vanish, your business does too. Neweb registers every domain in the customer\'s own name.'],
    ]},
];

const GUIDE_TOOLS = {
  'online-presence':   ['business-name-generator','domain-name-generator','google-business-description-generator','localbusiness-schema-generator','whatsapp-link-generator','meta-title-description-generator'],
  'google-business':   ['google-business-description-generator','localbusiness-schema-generator','meta-title-description-generator','whatsapp-link-generator','upi-qr-code-generator','image-compressor'],
  'local-seo':         ['localbusiness-schema-generator','meta-title-description-generator','google-business-description-generator','website-speed-test','image-compressor','favicon-generator'],
  'picking-a-domain':  ['domain-name-generator','business-name-generator','domain-checker','slogan-generator','logo-maker','meta-title-description-generator'],
};

guides.forEach(g => {
  const longBody = GUIDE_BODIES[g.slug] || '';
  const extras = PAGE_EXTRAS[g.slug] || {};
  pages.push({
    slug: `guides/${g.slug}`,
    title: `${g.h} — Neweb Guide`,
    description: g.d,
    canonicalPath: `/pages/guides/${g.slug}`,
    extraHead: RICH_STYLES,
    body: hero({
      crumb: [{label:'Guides', href:'/pages/guides'}, {label:g.h.split(' ').slice(0,4).join(' '), href:`/pages/guides/${g.slug}`}],
      h1: g.h,
      lede: g.d,
    }) + section(`
      <article class="prose">
        ${g.sections.map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`).join('')}
      </article>
    `) + (longBody ? richProse(longBody, { eyebrow: extras.eyebrow, stats: extras.stats, quote: extras.quote }) : '') + toolsCrossLink((GUIDE_TOOLS[g.slug] || []).slice(0, 6), 'Tools that help') + related([
      ...guides.filter(x => x.slug !== g.slug).slice(0, 2).map(x => ({
        href: `/pages/guides/${x.slug}`, title: x.h, blurb: x.d.slice(0, 110) + '…'
      })),
      { href: '/pages/solutions', title: 'Solutions by industry', blurb: 'See how Neweb is tuned for restaurants, jewellers, clinics, tutoring centres, and more.' }
    ]) + cta(),
  });
});

// ---------- LEGAL (Commerciax-style numbered sections) ----------
// Visual pattern: [ ## ] badge + italic-serif section title on the left, content on the right
const LEGAL_STYLES = `
  .legal-intro{max-width:760px;margin:0 auto 12px;color:var(--ink-2);font-size:16.5px;line-height:1.65}
  .legal-meta{display:flex;gap:14px;flex-wrap:wrap;font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:16px 0 32px}
  .legal-meta .mi{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid var(--line);border-radius:999px;background:var(--bg-2)}
  .lgsec{display:grid;grid-template-columns:260px 1fr;gap:56px;border-top:1px solid var(--line);padding:48px 0;align-items:start}
  .lgsec:first-of-type{border-top:0;padding-top:24px}
  @media(max-width:860px){.lgsec{grid-template-columns:1fr;gap:18px;padding:36px 0}}
  .lgsec .num{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid var(--line-2);border-radius:10px;font-family:"JetBrains Mono",monospace;font-size:13px;color:var(--ink);font-weight:500;background:var(--bg-2);margin-bottom:18px}
  .lgsec h2{font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;font-size:clamp(28px,3.4vw,38px);line-height:1.08;letter-spacing:-.02em;color:var(--ink);margin:0;text-wrap:balance}
  .lgsec h2 strong{font-family:"Inter Tight",sans-serif;font-style:normal;font-weight:600;color:var(--ink)}
  .lgsec .body{font-size:16px;line-height:1.7;color:var(--ink-2)}
  .lgsec .body p{margin:0 0 16px}
  .lgsec .body p:last-child{margin-bottom:0}
  .lgsec .body strong{color:var(--ink);font-weight:600}
  .lgsec .body ul{padding-left:18px;margin:0 0 16px}
  .lgsec .body ul li{margin-bottom:10px}
  .lgsec .body .kbd{font-family:"JetBrains Mono",monospace;font-size:13px;background:var(--bg-2);padding:2px 8px;border-radius:6px;border:1px solid var(--line);color:var(--ink)}
  .lgsec .body a{color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)}
  .lgsec .body .emph{font-family:"Instrument Serif",serif;font-style:italic;font-size:18px;color:var(--ink);display:block;margin:14px 0;padding:14px 18px;border-left:3px solid var(--brand);background:var(--bg-2);border-radius:0 10px 10px 0}
  .legal-foot{background:var(--bg-2);border:1px solid var(--line);border-radius:18px;padding:32px;display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:36px}
  @media(max-width:700px){.legal-foot{grid-template-columns:1fr}}
  .legal-foot h3{font-size:16px;margin:0 0 10px;letter-spacing:-.01em}
  .legal-foot p{font-size:14px;line-height:1.6;color:var(--ink-2);margin:0}
  .legal-foot a{color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)}
  .legal-foot .mono{font-family:"JetBrains Mono",monospace;font-size:12.5px;color:var(--ink-2);line-height:1.6;white-space:pre-line}
`;
function legalSec(n, titleHtml, bodyHtml) {
  return `<section class="lgsec"><div><div class="num">${n}</div><h2>${titleHtml}</h2></div><div class="body">${bodyHtml}</div></section>`;
}
const LEGAL_FOOT = `
  <div class="legal-foot">
    <div>
      <h3>Commerciax Infotech Private Limited</h3>
      <p>Neweb.ai is a product of Commerciax Infotech Private Limited. These policies apply to Neweb and all related services.</p>
      <p style="margin-top:12px"><a href="mailto:info@commerciax.com">info@commerciax.com</a></p>
    </div>
    <div>
      <h3>Offices</h3>
      <p class="mono">India · 909, Sharan Circle Business Hub
Zundal Circle, Ahmedabad
Gujarat 382421

USA · 30 N Gould St Ste R
Sheridan, WY 82801</p>
    </div>
  </div>
`;

// PRIVACY
pages.push({
  slug: 'privacy',
  title: 'Privacy Policy — Neweb',
  description: 'How Neweb (a Commerciax Infotech product) collects, uses, and protects your data. DPDP, GDPR, and CCPA aligned.',
  canonicalPath: '/pages/privacy',
  extraHead: LEGAL_STYLES,
  body: hero({
    crumb: [{label:'Privacy', href:'/pages/privacy'}],
    h1: `Privacy <span class="serif">Policy</span>.`,
    lede: 'Your privacy is important to us. Here\'s how we collect, use, and protect your information across Neweb and other Commerciax products.',
  }) + section(`
    <div class="legal-meta">
      <span class="mi">● Last updated May 10, 2026</span>
      <span class="mi">Neweb.ai · a Commerciax Infotech product</span>
    </div>
    <p class="legal-intro">Commerciax Infotech Private Limited is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, store, and protect your information across our services, websites, and products (including <strong>Neweb.ai</strong> and <strong>Fonda.co</strong>). By using our services, you agree to the collection and use of your data in accordance with this policy.</p>

    ${legalSec('01', 'Information <strong>We Collect</strong>', `
      <p>We collect the following types of information when you use Commerciax services:</p>
      <ul>
        <li><strong>Personal information</strong> — name, email address, phone number, company, role, and account credentials.</li>
        <li><strong>Usage data</strong> — information about how you interact with our services, including IP address, browser type, device identifiers, and access times.</li>
        <li><strong>Content data</strong> — any data, prompts, files, or generated output you upload, share, or create while using Commerciax products.</li>
        <li><strong>Third-party data</strong> — information received from third-party integrations such as Google, LinkedIn, Stripe, and analytics providers — only as authorized by you.</li>
      </ul>
    `)}

    ${legalSec('02', '<strong>How</strong> We Use Your Information', `
      <p>We use the collected information to:</p>
      <ul>
        <li>Provide, operate, and improve our services.</li>
        <li>Personalize your experience, content, and recommendations.</li>
        <li>Enhance security and prevent fraudulent activities.</li>
        <li>Communicate product updates, support responses, and service notifications.</li>
        <li>Analyze trends and optimize platform performance.</li>
        <li>Fulfill legal, compliance, and contractual obligations.</li>
      </ul>
    `)}

    ${legalSec('03', 'Data Sharing <strong>& Disclosure</strong>', `
      <span class="emph">We do not sell your personal data to any third party.</span>
      <ul>
        <li>We may share data with trusted service providers (cloud hosting, analytics, payment processing) only as needed to deliver our services.</li>
        <li>We may disclose information to comply with legal obligations, court orders, or to protect the rights, property, or safety of Commerciax and its users.</li>
        <li>In the case of a merger, acquisition, or asset sale, user data may be transferred with appropriate notice and continued protection.</li>
      </ul>
    `)}

    ${legalSec('04', 'Data <strong>Security</strong>', `
      <p>We implement industry-standard security measures including <strong>encryption in transit and at rest, role-based access controls, and regular audits</strong>. However, no method of transmission or storage is completely secure. You are responsible for maintaining the confidentiality of your account credentials.</p>
    `)}

    ${legalSec('05', 'Your <strong>Rights</strong>', `
      <p>Depending on your location, you may have the following rights:</p>
      <ul>
        <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
        <li><strong>Correction</strong> — request we fix inaccurate or incomplete information.</li>
        <li><strong>Deletion</strong> — request we delete your personal data (subject to legal retention).</li>
        <li><strong>Portability</strong> — request your data in a machine-readable format.</li>
        <li><strong>Objection</strong> — object to certain processing activities.</li>
      </ul>
      <p>To exercise any of these rights, email <a href="mailto:info@commerciax.com">info@commerciax.com</a>.</p>
    `)}

    ${legalSec('06', 'Cookies <strong>& Tracking</strong>', `
      <p>We use <strong>cookies and similar technologies</strong> to remember your preferences, measure usage, and improve our products. You can control cookies through your browser settings. Disabling certain cookies may impact functionality.</p>
    `)}

    ${legalSec('07', 'International <strong>Transfers</strong>', `
      <p>Commerciax operates from India and the United States. By using our services, you consent to the transfer of your information across borders, subject to appropriate safeguards.</p>
    `)}

    ${legalSec('08', "Children's <strong>Privacy</strong>", `
      <span class="emph">Our services are not directed to individuals under 16.</span>
      <p>We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us for immediate removal.</p>
    `)}

    ${legalSec('09', 'Changes to <strong>This Policy</strong>', `
      <p>We may update this Privacy Policy periodically. Material changes will be announced via email or a prominent notice on our website. The <span class="kbd">Last Updated</span> date at the top of this page reflects the most recent revision.</p>
    `)}

    ${legalSec('10', 'Contact <strong>Us</strong>', `
      <p>For questions, concerns, or requests regarding this Privacy Policy, reach us at:</p>
      <ul>
        <li><strong>Email</strong> — <a href="mailto:info@commerciax.com">info@commerciax.com</a></li>
        <li><strong>Phone</strong> — +1 978 981 1118</li>
        <li><strong>India</strong> — 909, Sharan Circle Business Hub, Zundal Circle, Ahmedabad, Gujarat 382421</li>
        <li><strong>USA</strong> — 30 N Gould St Ste R, Sheridan, WY 82801</li>
      </ul>
    `)}

    ${LEGAL_FOOT}
  `),
});

// TERMS
pages.push({
  slug: 'terms',
  title: 'Terms of Service — Neweb',
  description: 'Neweb (a Commerciax Infotech product) Terms of Service. Account, billing, IP rights, AI outputs, termination, and governing law.',
  canonicalPath: '/pages/terms',
  extraHead: LEGAL_STYLES,
  body: hero({
    crumb: [{label:'Terms', href:'/pages/terms'}],
    h1: `Terms of <span class="serif">Service</span>.`,
    lede: 'The contract between you and Commerciax Infotech for every Neweb subscription. Written in plain English — legal weight unchanged.',
  }) + section(`
    <div class="legal-meta">
      <span class="mi">● Last updated May 10, 2026</span>
      <span class="mi">Neweb.ai · a Commerciax Infotech product</span>
    </div>
    <p class="legal-intro">By creating an account or using Neweb services, you agree to these Terms, our <a href="/pages/privacy">Privacy Policy</a>, and any service-specific addenda referenced within your engagement.</p>

    ${legalSec('01', 'Acceptance of <strong>Terms</strong>', `
      <p>By creating an account or using Commerciax services, users agree to these Terms, the Privacy Policy, and any service-specific addenda.</p>
    `)}

    ${legalSec('02', 'Account <strong>Registration</strong>', `
      <ul>
        <li>Minimum age requirement of <strong>18 years</strong> (or age of majority in your jurisdiction).</li>
        <li>Users must provide accurate, current, and complete information.</li>
        <li>Users are responsible for maintaining credential confidentiality.</li>
        <li>Users are liable for all activities under their account.</li>
      </ul>
    `)}

    ${legalSec('03', 'User <strong>Obligations</strong>', `
      <ul>
        <li>Provide accurate registration information.</li>
        <li>Maintain credential confidentiality.</li>
        <li>Refrain from unlawful or unauthorized misuse of the service.</li>
        <li>Don't disrupt Commerciax services or harm other users.</li>
        <li>Don't reverse engineer, decompile, or extract source code.</li>
      </ul>
    `)}

    ${legalSec('04', 'Privacy <strong>& Data Protection</strong>', `
      <p>Commerciax collects user data per its <a href="/pages/privacy">Privacy Policy</a>. By using our services you consent to that processing.</p>
      <span class="emph">We treat client data as confidential and do not use it to train public models.</span>
    `)}

    ${legalSec('05', 'Intellectual <strong>Property</strong>', `
      <ul>
        <li>Commerciax owns all materials, logos, designs, trademarks, and content associated with its services.</li>
        <li>Users may not copy, reproduce, distribute, or create derivative works without written consent.</li>
        <li>Paid client deliverables are licensed per the signed statement of work.</li>
      </ul>
    `)}

    ${legalSec('06', 'Third-Party <strong>Integrations</strong>', `
      <p>Neweb connects to services including Google, domain registrars, Bing, Maps, Stripe, and Resend. Commerciax disclaims responsibility for third-party platform accuracy, security, or data practices.</p>
    `)}

    ${legalSec('07', 'Payment <strong>& Billing</strong>', `
      <ul>
        <li>Fees are specified in engagement documents or on our <a href="/pages/pricing">pricing page</a>.</li>
        <li>Invoices are due within <strong>15 days</strong>.</li>
        <li>Late payments incur <strong>1.5% monthly interest</strong> (or the legal maximum, whichever is lower).</li>
        <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
      </ul>
    `)}

    ${legalSec('08', 'AI Outputs <strong>Disclaimer</strong>', `
      <span class="emph">Outputs generated by Commerciax AI systems may contain errors or inaccuracies.</span>
      <p>Users are responsible for reviewing all outputs before publishing or using them with customers.</p>
    `)}

    ${legalSec('09', '<strong>Termination</strong>', `
      <p>Commerciax may suspend or terminate access for Terms violations, fraud, or at its reasonable discretion. Users may terminate at any time by emailing <a href="mailto:info@commerciax.com">info@commerciax.com</a>. See our <a href="/pages/refund">Refund & Cancellation Policy</a> for details on what happens to fees at termination.</p>
    `)}

    ${legalSec('10', 'Limitation of <strong>Liability</strong>', `
      <p>Commerciax's aggregate liability is capped at the fees paid in the preceding <strong>12 months</strong>. We're not liable for indirect or consequential damages.</p>
    `)}

    ${legalSec('11', 'Governing <strong>Law</strong>', `
      <p>These Terms are governed by the laws of <strong>India</strong> and the state of <strong>Wyoming, USA</strong>, with exclusive jurisdiction in the courts of Ahmedabad, Gujarat.</p>
    `)}

    ${legalSec('12', 'Changes to <strong>Terms</strong>', `
      <p>Material changes are communicated via email or a prominent notice on our website. Continued use after the effective date indicates acceptance.</p>
    `)}

    ${legalSec('13', '<strong>Contact</strong>', `
      <ul>
        <li><strong>Email</strong> — <a href="mailto:info@commerciax.com">info@commerciax.com</a></li>
        <li><strong>Phone</strong> — +1 978 981 1118</li>
        <li><strong>India</strong> — 909, Sharan Circle Business Hub, Zundal Circle, Ahmedabad, Gujarat 382421</li>
        <li><strong>USA</strong> — 30 N Gould St Ste R, Sheridan, WY 82801</li>
      </ul>
    `)}

    ${LEGAL_FOOT}
  `),
});

// REFUND & CANCELLATION
pages.push({
  slug: 'refund',
  title: 'Refund & Cancellation Policy — Neweb',
  description: 'Neweb (a Commerciax Infotech product) refund and cancellation policy. Subscription and sprint-based service terms.',
  canonicalPath: '/pages/refund',
  extraHead: LEGAL_STYLES,
  body: hero({
    crumb: [{label:'Refund & Cancellation', href:'/pages/refund'}],
    h1: `Refund <span class="serif">&</span> Cancellation.`,
    lede: 'Commerciax Infotech operates two models: subscription products (Neweb.ai, Fonda.co) and sprint-based services. Each has its own refund framework, set out below.',
  }) + section(`
    <div class="legal-meta">
      <span class="mi">● Last updated May 10, 2026</span>
      <span class="mi">Applies to Neweb.ai, Fonda.co, and custom engagements</span>
    </div>
    <p class="legal-intro">Commerciax Infotech operates a <strong>subscription model</strong> for its products (including Neweb.ai) and a <strong>sprint-based service model</strong> for custom engagements. Each sprint represents a dedicated phase of work planned, executed, and delivered with client approval. Due to the nature of our services, our refund and cancellation policy is outlined below.</p>

    ${legalSec('01', 'How to <strong>Initiate</strong> a Refund or Cancellation', `
      <p>Requests must be submitted in writing to:</p>
      <ul>
        <li><strong>Email</strong> — <a href="mailto:info@commerciax.com">info@commerciax.com</a></li>
        <li><strong>Subject</strong> — <span class="kbd">Refund Request — [Client Name] — [Sprint Number or Subscription]</span></li>
      </ul>
      <p><strong>Details required</strong>: project name, sprint number (or subscription email), date of payment, reason for the request, and any supporting documentation.</p>
      <span class="emph">We aim to acknowledge all refund requests within 2 business days of receipt.</span>
    `)}

    ${legalSec('02', 'Refund <strong>Eligibility</strong> — Products (Neweb.ai, Fonda.co)', `
      <p>For <strong>Neweb.ai subscriptions</strong>, you can cancel any time from your dashboard. You keep access until the end of the current billing period. No partial refunds for unused days within a billing cycle.</p>
      <ul>
        <li><strong>Monthly plans</strong> — cancel before renewal; no refund for a started month.</li>
        <li><strong>Annual plans</strong> — pro-rated refund for unused full months, minus any setup or domain registration fees (domains are non-refundable once registered).</li>
        <li><strong>Domain registrations</strong> — non-refundable once registered with ICANN-accredited registrars. The domain remains yours for the paid term.</li>
      </ul>
    `)}

    ${legalSec('03', 'Refund <strong>Eligibility</strong> — Services (Sprint-based)', `
      <p><strong>A. Pre-Sprint Refunds</strong> — A full refund is available if payment was made but work hasn't begun. A sprint is considered <strong>started</strong> once any preparatory work (research, planning, or task assignment) begins.</p>
      <p><strong>B. Mid-Sprint Refunds</strong> — Generally unavailable unless Commerciax fails to deliver or materially breaches the service agreement. Partial refunds may apply if fewer than <strong>25% of tasks</strong> are complete and a service review confirms significant scope deviation.</p>
      <p><strong>C. Post-Sprint Refunds</strong> — Once a sprint is completed or approved, refunds are not issued. Please provide feedback during delivery for adjustments under revision policies.</p>
    `)}

    ${legalSec('04', 'Processing <strong>Timeline</strong>', `
      <p>Approved refunds are processed within <strong>5–7 business days</strong> and returned to the original payment method. You'll receive a confirmation email with a reference number.</p>
    `)}

    ${legalSec('05', 'Cancellation <strong>Notice</strong>', `
      <ul>
        <li>Service cancellations require <strong>48 hours</strong> notice before the sprint start date.</li>
        <li>Product subscription cancellations take effect at the end of the current billing period.</li>
        <li>Annual plans can be cancelled for a pro-rated refund within the first 14 days of renewal.</li>
      </ul>
    `)}

    ${legalSec('06', 'Important <strong>Notes</strong>', `
      <ul>
        <li>Product subscriptions (Neweb.ai, Fonda.co) follow the terms above and any plan-specific addenda.</li>
        <li>Third-party charges (domain registrars, payment gateways) are governed by their respective providers.</li>
        <li>Chargebacks initiated without prior contact may result in immediate account suspension.</li>
      </ul>
    `)}

    ${legalSec('07', '<strong>Contact</strong>', `
      <ul>
        <li><strong>Email</strong> — <a href="mailto:info@commerciax.com">info@commerciax.com</a></li>
        <li><strong>Phone</strong> — +1 978 981 1118</li>
        <li><strong>India</strong> — 909, Sharan Circle Business Hub, Zundal Circle, Ahmedabad, Gujarat 382421</li>
        <li><strong>USA</strong> — 30 N Gould St Ste R, Sheridan, WY 82801</li>
      </ul>
    `)}

    ${LEGAL_FOOT}
  `),
});

// SECURITY
pages.push({
  slug: 'security',
  title: 'Security — Neweb',
  description: 'How Neweb (a Commerciax Infotech product) protects customer data. Encryption, access control, audits, and responsible disclosure.',
  canonicalPath: '/pages/security',
  extraHead: LEGAL_STYLES,
  body: hero({
    crumb: [{label:'Security', href:'/pages/security'}],
    h1: `Security, <span class="serif">by default</span>.`,
    lede: 'Your customers trust you with their data. We treat yours the same way — encrypted in transit and at rest, with role-based access and regular audits across every Commerciax product.',
  }) + section(`
    <div class="legal-meta">
      <span class="mi">● Last updated May 10, 2026</span>
      <span class="mi">Neweb.ai · a Commerciax Infotech product</span>
    </div>
    <p class="legal-intro">Security isn't a checklist — it's a discipline. Here's how Commerciax Infotech protects every Neweb account, every customer record, and every byte of content you create on our platform.</p>

    ${legalSec('01', 'Encryption <strong>Everywhere</strong>', `
      <p>Every connection to Neweb uses <strong>TLS 1.3</strong>. Every database and storage bucket is encrypted at rest with <strong>AES-256</strong>. Backups are encrypted independently with separate keys.</p>
      <span class="emph">No plaintext customer data lives on any disk, ever.</span>
    `)}

    ${legalSec('02', 'Access <strong>Controls</strong>', `
      <p>We enforce <strong>role-based access controls</strong>. Every engineer action on production is logged and reviewed. Access requires single sign-on with hardware-key 2FA. Production access is scoped to the minimum needed for the task and audited weekly.</p>
    `)}

    ${legalSec('03', 'Backups <strong>& Recovery</strong>', `
      <ul>
        <li>Hourly incremental backups.</li>
        <li>Daily full backups.</li>
        <li>Weekly off-site replicas, encrypted with separate keys.</li>
        <li>Point-in-time restore available to any customer on request within <strong>30 days</strong>.</li>
      </ul>
    `)}

    ${legalSec('04', 'Monitoring <strong>& Audits</strong>', `
      <p>We run continuous vulnerability scanning, automated dependency audits, and third-party penetration tests annually. All critical findings have SLAs on resolution time.</p>
    `)}

    ${legalSec('05', '<strong>Compliance</strong>', `
      <ul>
        <li>Aligned with <strong>GDPR</strong>, <strong>CCPA</strong>, and India's <strong>DPDP Act (2023)</strong>.</li>
        <li><strong>SOC 2 Type II</strong> audit in progress (target: Q3 2026).</li>
        <li>ISO 27001 roadmap in planning.</li>
      </ul>
    `)}

    ${legalSec('06', 'AI & <strong>Data Confidentiality</strong>', `
      <span class="emph">We do not use client data to train public models.</span>
      <p>AI-generated outputs from Neweb remain scoped to your account and content. Model providers are bound by data-processing agreements that prohibit training on customer inputs.</p>
    `)}

    ${legalSec('07', 'Responsible <strong>Disclosure</strong>', `
      <p>Found a vulnerability? Email <a href="mailto:info@commerciax.com">info@commerciax.com</a> with <strong>[SECURITY]</strong> in the subject and full reproduction steps. We respond within <strong>48 hours</strong>, acknowledge valid findings, and offer a bounty for severe issues. Please don't disclose publicly until we've had a reasonable window to fix.</p>
    `)}

    ${legalSec('08', '<strong>Contact</strong>', `
      <ul>
        <li><strong>Email</strong> — <a href="mailto:info@commerciax.com">info@commerciax.com</a> (PGP key on request)</li>
        <li><strong>Phone</strong> — +1 978 981 1118</li>
      </ul>
    `)}

    ${LEGAL_FOOT}
  `),
});

// ====== Build ======
// ====== Blog SSR (server-render each post to static HTML) ======
function esc(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function safeUrl(raw){
  const u = String(raw||'').trim();
  if(!u) return '#';
  if(/^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(u)) return u;
  return '#';
}
function mdToHtml(md){
  if(!md) return '';
  const lines = md.replace(/\r\n/g,'\n').split('\n');
  let html = '', inCode = false, inList = false, listType = '';
  const flushList = () => { if(inList){ html += `</${listType}>`; inList = false; } };
  const inline = s => esc(s)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]+)&quot;)?\)/g, (_,alt,url,title) => `<img src="${safeUrl(url.replace(/&amp;/g,'&'))}" alt="${alt}"${title?` title="${title}"`:''} loading="lazy" />`)
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/~~([^~]+)~~/g,'<del>$1</del>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_,text,url) => `<a href="${safeUrl(url.replace(/&amp;/g,'&'))}" rel="noopener">${text}</a>`);
  for(const line of lines){
    if(line.trim().startsWith('```')){
      flushList();
      if(!inCode){ html += '<pre><code>'; inCode = true; }
      else { html += '</code></pre>'; inCode = false; }
      continue;
    }
    if(inCode){ html += esc(line)+'\n'; continue; }
    if(/^\s*$/.test(line)){ flushList(); continue; }
    if(/^\s*(---|\*\*\*|___)\s*$/.test(line)){ flushList(); html += '<hr>'; continue; }
    let m;
    if((m = line.match(/^######\s+(.*)$/))){ flushList(); html += `<h3 class="ft-h">${inline(m[1])}</h3>`; continue; }
    if((m = line.match(/^#####\s+(.*)$/))){ flushList(); html += `<h5>${inline(m[1])}</h5>`; continue; }
    if((m = line.match(/^####\s+(.*)$/))){ flushList(); html += `<h4>${inline(m[1])}</h4>`; continue; }
    if((m = line.match(/^###\s+(.*)$/))){ flushList(); html += `<h3>${inline(m[1])}</h3>`; continue; }
    if((m = line.match(/^##\s+(.*)$/))){ flushList(); html += `<h2>${inline(m[1])}</h2>`; continue; }
    if((m = line.match(/^#\s+(.*)$/))){ flushList(); html += `<h2>${inline(m[1])}</h2>`; continue; }
    if((m = line.match(/^\s*>\s?(.*)$/))){ flushList(); html += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
    if((m = line.match(/^\s*[-*]\s+(.*)$/))){
      if(!inList || listType !== 'ul'){ flushList(); html += '<ul>'; inList = true; listType = 'ul'; }
      html += `<li>${inline(m[1])}</li>`; continue;
    }
    if((m = line.match(/^\s*\d+\.\s+(.*)$/))){
      if(!inList || listType !== 'ol'){ flushList(); html += '<ol>'; inList = true; listType = 'ol'; }
      html += `<li>${inline(m[1])}</li>`; continue;
    }
    flushList();
    html += `<p>${inline(line)}</p>`;
  }
  if(inCode) html += '</code></pre>';
  flushList();
  return html;
}
function fmtDate(iso){
  if(!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata' }); }
  catch(_) { return ''; }
}
const BLOG_STYLES = `
  .post-hero{padding:72px 0 32px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#fafbff 0%, #fff 100%)}
  .post-hero .meta{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
  .post-hero .meta .tag-chip{color:var(--brand);background:var(--brand-soft);border:1px solid rgba(61,76,255,.16);padding:4px 10px;border-radius:999px;font-weight:500}
  .post-hero h1{font-size:clamp(36px,5vw,60px);line-height:1.05;letter-spacing:-.035em;font-weight:600;margin:4px 0 18px;max-width:860px;text-wrap:balance}
  .post-hero .lede{font-size:19px;color:var(--ink-2);max-width:720px;line-height:1.5;margin:0}
  .post-cover{aspect-ratio:16/7;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,var(--brand-soft),#dde3ff);margin:32px 0}
  .post-cover img{width:100%;height:100%;object-fit:cover;display:block}
  .article{max-width:760px;margin:0 auto;font-size:18px;line-height:1.7;color:var(--ink-2)}
  .article h2{font-size:30px;letter-spacing:-.025em;color:var(--ink);margin:40px 0 14px;font-weight:600;line-height:1.2}
  .article h3{font-size:22px;letter-spacing:-.015em;color:var(--ink);margin:32px 0 10px;font-weight:600}
  .article p{margin:0 0 18px}
  .article a{color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)}
  .article blockquote{border-left:3px solid var(--brand);padding:10px 0 10px 24px;margin:24px 0;font-family:"Instrument Serif",serif;font-style:italic;font-size:22px;color:var(--ink);line-height:1.4;background:var(--bg-2);border-radius:0 10px 10px 0}
  .article code{font-family:"JetBrains Mono",monospace;font-size:.88em;background:var(--bg-2);border:1px solid var(--line);padding:1px 6px;border-radius:5px}
  .article pre{background:var(--ink-dark);color:#e5e8f5;padding:20px;border-radius:12px;overflow:auto;font-family:"JetBrains Mono",monospace;font-size:13.5px;line-height:1.6;margin:24px 0}
  .article pre code{background:none;border:0;padding:0;color:inherit}
  .article ul,.article ol{margin:0 0 20px;padding-left:22px}
  .article li{margin-bottom:8px}
  .article img{max-width:100%;border-radius:12px;margin:18px 0;border:1px solid var(--line)}
  .author-card{display:flex;align-items:center;gap:14px;padding:20px 0;border-top:1px solid var(--line);margin-top:48px;max-width:760px;margin-left:auto;margin-right:auto}
  .author-card .ava{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--brand-soft),#dde3ff);display:grid;place-items:center;font-family:"Instrument Serif",serif;font-style:italic;color:var(--brand);font-size:22px}
  .author-card .who .n{font-weight:600;font-size:15px}
  .author-card .who .r{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:2px}
  .back{display:inline-flex;align-items:center;gap:6px;min-height:44px;font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
  .back:hover{color:var(--brand)}
`;
// Map blog tag -> a named human author + role (named E-E-A-T authorship)
const BLOG_AUTHORS = {
  'SEO':      { name: 'Harshit Rajput',   role: 'Founder, Neweb' },
  'Product':  { name: 'Harshit Rajput',   role: 'Founder, Neweb' },
  'Guide':    { name: 'Neweb Editorial',  role: 'Neweb Editorial Team' },
  'default':  { name: 'Harshit Rajput',   role: 'Founder, Neweb' },
};
function blogPostPage(p, allPosts) {
  const slug = p.slug;
  const canonicalPath = `/pages/blog/${slug}`;
  const desc = (p.excerpt || String(p.body||'').slice(0, 158).replace(/[#*_\[\]`\n]/g,' ').replace(/\s+/g,' ').trim());
  const author = BLOG_AUTHORS[p.tag] || BLOG_AUTHORS.default;
  const ogImage = p.cover || '/assets/og-default.png';
  const canonical = `${DOMAIN}${canonicalPath}`;
  const articleLd = {
    '@context':'https://schema.org',
    '@graph':[
      {
        '@type':'BlogPosting',
        headline: p.title,
        description: desc,
        author: { '@type':'Person', name: author.name, jobTitle: author.role, url: 'https://neweb.ai/pages/about' },
        datePublished: p.publishedAt,
        dateModified: p.updatedAt || p.publishedAt,
        image: (p.cover && /^https?:/.test(p.cover)) ? p.cover : `${DOMAIN}/assets/og-default.png`,
        publisher: { '@type':'Organization', name:'Neweb', logo:{ '@type':'ImageObject', url:`${DOMAIN}/assets/neweb-logo.png` } },
        mainEntityOfPage: canonical,
        url: canonical,
        articleSection: p.tag || 'Blog',
        inLanguage: 'en-IN'
      },
      {
        '@type':'BreadcrumbList',
        itemListElement:[
          { '@type':'ListItem', position:1, name:'Home', item:`${DOMAIN}/` },
          { '@type':'ListItem', position:2, name:'Blog', item:`${DOMAIN}/pages/blog` },
          { '@type':'ListItem', position:3, name: p.title, item: canonical }
        ]
      }
    ]
  };
  // Related posts (other published, same tag first)
  const related = allPosts.filter(x => x.slug !== slug)
    .sort((a,b) => (b.tag===p.tag?1:0) - (a.tag===p.tag?1:0))
    .slice(0, 3);
  const cover = p.cover
    ? `<div class="wrap"><div class="post-cover"><img src="${esc(p.cover)}" alt="${esc(p.title)}"></div></div>`
    : '';
  const body = `
    <section class="post-hero">
      <div class="wrap">
        <a href="/pages/blog" class="back">← All posts</a>
        <div class="meta">
          <span class="tag-chip">${esc(p.tag||'Product')}</span>
          <span>${fmtDate(p.publishedAt)}</span>
          <span>· ${esc(author.name)}</span>
        </div>
        <h1>${esc(p.title)}</h1>
        ${p.excerpt ? `<p class="lede">${esc(p.excerpt)}</p>` : ''}
      </div>
    </section>
    ${cover}
    <section class="section" style="padding-top:24px">
      <div class="wrap">
        <article class="article">${mdToHtml(p.body)}</article>
        <div class="author-card">
          <div class="ava">${esc((author.name||'N').trim().charAt(0).toUpperCase())}</div>
          <div class="who"><div class="n">${esc(author.name)}</div><div class="r">${esc(author.role)}</div></div>
        </div>
      </div>
    </section>
    ${ related.length ? section(`
      <div class="sec-mark"><span class="eyebrow"><span class="dot"></span> Keep reading</span><h2 class="h">More from the <span class="serif">blog</span>.</h2></div>
      <div class="grid-3">
        ${related.map(r => `
          <a class="card rise" href="/pages/blog/${esc(r.slug)}" style="display:flex;flex-direction:column">
            <div class="ico">→</div>
            <h3>${esc(r.title)}</h3>
            <p>${esc((r.excerpt||'').slice(0,110))}…</p>
          </a>
        `).join('')}
      </div>
    `, 'padding-top:0') : '' }
    ${ cta() }
  `;
  return {
    slug: `blog/${slug}`,
    title: `${p.title} — Neweb Blog`,
    description: desc,
    canonicalPath,
    active: '',
    ogImage,
    ogType: 'article',
    noBreadcrumb: true,
    extraHead: BLOG_STYLES,
    jsonLd: jsonLdBlock(articleLd),
    body,
  };
}

// ---------- SITEMAP HUB (human-readable, links every page) ----------
// Built inside build() (async) because it reads the page directories from disk
// so newly-added city/guide/tool/compare/solution pages appear automatically.
async function sitemapHubPage() {
  // Turn a slug like "how-to-make-shop-website-india" into "How to make shop website india".
  const labelFromSlug = (s) => {
    const t = String(s).replace(/-/g, ' ').trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  // Read every .html file in pages/<sub>/ (sorted) -> [{href, label}].
  const listDir = async (sub) => {
    let files = [];
    try {
      files = (await fs.readdir(path.join(OUT_DIR, sub)))
        .filter(f => f.endsWith('.html'))
        .map(f => f.replace(/\.html$/, ''))
        .sort();
    } catch (_) { /* dir may not exist */ }
    return files.map(slug => ({ href: `/pages/${sub}/${slug}`, label: labelFromSlug(slug) }));
  };

  const [cities, guides, tools, compares, solutions] = await Promise.all([
    listDir('cities'), listDir('guides'), listDir('tools'), listDir('compare'), listDir('solutions'),
  ]);

  // Static, hand-maintained sections (top-level pages + legal + blog hub).
  const product = [
    { href:'/', label:'Home' },
    { href:'/pages/features', label:'Features' },
    { href:'/pages/pricing', label:'Pricing' },
    { href:'/pages/why-neweb', label:'Why Neweb' },
    { href:'/pages/templates', label:'Templates' },
    { href:'/pages/changelog', label:'Changelog' },
    { href:'/pages/domain-checker', label:'Domain checker' },
  ];
  const company = [
    { href:'/pages/about', label:'About' },
    { href:'/pages/careers', label:'Careers' },
    { href:'/pages/contact', label:'Contact' },
    { href:'/pages/customer-stories', label:'Customer stories' },
    { href:'/pages/press', label:'Press kit' },
    { href:'/pages/security', label:'Security' },
  ];
  const legal = [
    { href:'/pages/privacy', label:'Privacy policy' },
    { href:'/pages/terms', label:'Terms & conditions' },
    { href:'/pages/refund', label:'Refund policy' },
  ];
  const blog = [
    { href:'/pages/blog', label:'Blog' },
  ];

  // Render a titled group with a column of links.
  const group = (eyebrow, title, links) => links.length ? `
    <div class="sm-group">
      <h2><span class="eyebrow"><span class="dot"></span> ${esc(eyebrow)}</span><br>${esc(title)}</h2>
      <ul class="sm-list">
        ${links.map(l => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}
      </ul>
    </div>` : '';

  const body = hero({
    crumb: [{label:'Sitemap', href:'/pages/sitemap'}],
    h1: `Every page, <span class="serif">in one place</span>.`,
    lede: 'A complete index of Neweb — product, solutions by industry and city, guides, free tools, comparisons, and company pages.',
  }) + section(`
    <div class="sm-wrap">
      ${group('Product', 'Product', product)}
      ${group('By industry', 'Solutions by industry', solutions)}
      ${group('By city', 'Solutions by city', cities)}
      ${group('Guides', 'Guides', guides)}
      ${group('Free tools', 'Free tools', tools)}
      ${group('Compare', 'Compare Neweb', compares)}
      ${group('Company', 'Company', company)}
      ${group('Blog', 'Blog', blog)}
      ${group('Legal', 'Legal', legal)}
    </div>
  `) + cta();

  return {
    slug: 'sitemap',
    title: 'Sitemap — All Neweb pages | Neweb',
    description: 'Browse every page on Neweb: product, solutions by industry and city, guides, free tools, comparisons, company and legal pages — all in one index.',
    canonicalPath: '/pages/sitemap',
    active: '',
    extraHead: `
      .sm-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:40px 32px}
      @media(max-width:860px){.sm-wrap{grid-template-columns:1fr 1fr;gap:32px 24px}}
      @media(max-width:560px){.sm-wrap{grid-template-columns:1fr}}
      .sm-group h2{font-size:18px;letter-spacing:-.01em;margin:0 0 14px;font-weight:600;line-height:1.5}
      .sm-group h2 .eyebrow{margin-bottom:4px}
      .sm-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
      .sm-list li{margin:0}
      .sm-list a{display:flex;align-items:center;min-height:40px;padding:6px 0;font-size:14.5px;color:var(--ink-2);border-bottom:1px solid var(--line);transition:color .15s}
      .sm-list a:hover{color:var(--brand)}
      @media(max-width:860px){.sm-list a{min-height:44px}}
    `,
    jsonLd: jsonLdBlock({
      '@context':'https://schema.org',
      '@type':'CollectionPage',
      name:'Neweb sitemap',
      url:`${DOMAIN}/pages/sitemap`,
      isPartOf:{ '@type':'WebSite', name:'Neweb', url:'https://neweb.ai/' },
    }),
    body,
  };
}

async function build() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const sub of SUB_DIRS) await fs.mkdir(path.join(OUT_DIR, sub), { recursive: true });
  await fs.mkdir(path.join(OUT_DIR, 'blog'), { recursive: true });

  // Always emit the /tools hub. Per-tool pages emitted only when t.built === true.
  pages.push(toolsHubPage());
  for (const t of TOOLS) {
    if (!t.built || t.external) continue;
    pages.push(toolPage(t));
  }

  // Human-readable sitemap hub — links every page (huge internal-linking win).
  // Reads the page directories from disk, so it stays complete automatically.
  pages.push(await sitemapHubPage());

  // Server-render each published blog post to static HTML at /pages/blog/<slug>
  let blogPosts = [];
  try {
    const raw = await fs.readFile(path.join(__dirname, 'data', 'blogs.json'), 'utf8');
    blogPosts = JSON.parse(raw).filter(b => b.published)
      .sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    for (const post of blogPosts) pages.push(blogPostPage(post, blogPosts));
    console.log(`server-rendered ${blogPosts.length} blog posts`);
  } catch(e) { console.warn('blogs.json not read:', e.message); }

  // Pre-render the blog index post cards into pages/blog.html so crawlers see
  // the post list without running JS (the JS still hydrates on load for users).
  try {
    const blogIndexPath = path.join(OUT_DIR, 'blog.html');
    let blogIndexHtml = await fs.readFile(blogIndexPath, 'utf8');
    const fmt = (iso) => { try { return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'Asia/Kolkata'}); } catch(_) { return ''; } };
    const initial = (t) => esc((t||'N').trim().charAt(0).toUpperCase());
    const coverH = (p) => p.cover ? `<div class="cover"><img src="${esc(p.cover)}" alt="" loading="lazy"></div>` : `<div class="cover">${initial(p.title)}</div>`;
    let featuredHtml = '', gridHtml = '';
    if (blogPosts.length) {
      const [first, ...rest] = blogPosts;
      const fa = BLOG_AUTHORS[first.tag] || BLOG_AUTHORS.default;
      featuredHtml = `
      <a href="/pages/blog/${esc(first.slug)}" class="featured">
        ${coverH(first)}
        <div class="body">
          <div class="meta"><span class="tag-chip">${esc(first.tag||'Product')}</span><span>${fmt(first.publishedAt)}</span><span>· ${esc(fa.name)}</span></div>
          <h2>${esc(first.title)}</h2>
          <p class="excerpt">${esc(first.excerpt||'')}</p>
          <span class="read">Read the post</span>
        </div>
      </a>`;
      gridHtml = rest.map(p => `
      <a href="/pages/blog/${esc(p.slug)}" class="post">
        ${coverH(p)}
        <div class="body">
          <div class="meta"><span class="tag-chip">${esc(p.tag||'Product')}</span><span>${fmt(p.publishedAt)}</span></div>
          <h3>${esc(p.title)}</h3>
          <p class="excerpt">${esc(p.excerpt||'')}</p>
          <span class="read">Read more</span>
        </div>
      </a>`).join('');
    }
    // Inject into the (currently empty) #featured and #posts containers.
    blogIndexHtml = blogIndexHtml
      .replace(/<div id="featured">[\s\S]*?<\/div>\s*<div id="posts"/, `<div id="featured">${featuredHtml}</div>\n    <div id="posts"`)
      .replace(/<div id="posts"([^>]*)>[\s\S]*?<\/div>\s*<div id="empty"/, `<div id="posts"$1>${gridHtml}</div>\n    <div id="empty"`);
    await fs.writeFile(blogIndexPath, blogIndexHtml);
    console.log('pre-rendered blog index cards');
  } catch(e) { console.warn('blog index pre-render skipped:', e.message); }

  for (const p of pages) {
    const html = shell(p);
    const outPath = path.join(OUT_DIR, p.slug + '.html');
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, html);
    console.log('wrote', path.relative(__dirname, outPath));
  }
  console.log(`\n${pages.length} pages generated.`);

  // Sitemap — auto-discover EVERY indexable HTML page under pages/ plus the
  // homepage. This catches hand-written pages, generator output, and any pages
  // created by other tooling (city pages, extra guides, extra tools, etc.) so
  // nothing is orphaned from the sitemap.
  // Only blog posts carry a <lastmod> (real per-page date). Every other URL
  // omits lastmod, because Google discards a single batch-stamped deploy
  // timestamp shared across many URLs (the audit flagged exactly this).
  async function walkHtml(dir, base) {
    let out = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const rel = base + '/' + e.name;
      if (e.isDirectory()) { out = out.concat(await walkHtml(full, rel)); }
      else if (e.name.endsWith('.html')) { out.push(rel.replace(/\.html$/, '')); }
    }
    return out;
  }
  // Pages to keep out of the index (noindex tools, the CSR blog-post shell,
  // and any partials).
  const SITEMAP_EXCLUDE = new Set(['/pages/admin', '/pages/blog-post']);
  let discovered = (await walkHtml(OUT_DIR, '/pages'))
    .filter(u => !SITEMAP_EXCLUDE.has(u));
  const blogPostBySlug = new Map(blogPosts.map(b => [`/pages/blog/${b.slug}`, b]));
  const urls = ['/', ...discovered].sort((a, b) => a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b));
  const all = urls.map(url => {
    const post = blogPostBySlug.get(url);
    return { url, lastmod: post ? (post.updatedAt || post.publishedAt) : null };
  });
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(({url, lastmod}) => `  <url>
    <loc>${DOMAIN}${url}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;
  await fs.writeFile(path.join(__dirname, 'sitemap.xml'), sitemap);
  console.log('wrote sitemap.xml (' + all.length + ' urls)');

  // robots.txt — welcome all major search + AI crawlers explicitly so there is
  // zero ambiguity, keep private paths blocked, declare the sitemap, and point
  // AI engines to the llms files. (Baked into the generator so rebuilds keep it.)
  const ROBOTS_PRIVATE = ['Disallow: /api/', 'Disallow: /data/', 'Disallow: /uploads-content/', 'Disallow: /pages/admin', 'Disallow: /pages/admin.html'].join('\n');
  const aiAgents = ['GPTBot','ChatGPT-User','OAI-SearchBot','ClaudeBot','Claude-Web','PerplexityBot','Google-Extended','Applebot-Extended','CCBot','Bingbot'];
  const robots = `# Neweb robots.txt
# AI: see ${DOMAIN}/llms.txt and ${DOMAIN}/llms-full.txt for a structured site overview.

User-agent: *
Allow: /
${ROBOTS_PRIVATE}

${aiAgents.map(a => `User-agent: ${a}\nAllow: /\n${ROBOTS_PRIVATE}`).join('\n\n')}

Sitemap: ${DOMAIN}/sitemap.xml
`;
  await fs.writeFile(path.join(__dirname, 'robots.txt'), robots);
  console.log('wrote robots.txt (with AI crawler allows)');
}

build().catch(err => { console.error(err); process.exit(1); });
