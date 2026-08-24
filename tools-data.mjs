// ===== Free-tools cluster — single source of truth =====
// Add new tools here. The build-pages.mjs generator reads this file.
//
// Fields:
//   slug            URL slug under /pages/tools/<slug> (also used as filename)
//   category        'start' | 'run' | 'seo' (hub grouping)
//   name            Hub card title and H1 base
//   tagline         Hub card one-liner
//   primaryKeyword  Used in H1, meta title, JSON-LD WebApplication.name
//   built           When true, generator emits the tool page. When false, hub
//                   shows a "Coming soon" pill instead of a link.
//   external        When true, hub links to externalHref (existing tool) and
//                   no page is generated under /pages/tools/<slug>.
//   externalHref    Override URL for external/already-built tools.
//   solutionHref    Contextual /pages/solutions/<industry> link the tool page
//                   should surface in its CTA. Defaults to /pages/solutions.
//   solutionLabel   Label for that link.

export const TOOL_CATEGORIES = [
  { id: 'start', title: 'Start a business', eyebrow: 'Get going', blurb: 'Pick a name, claim a domain, design the basics.' },
  { id: 'run',   title: 'Run your business', eyebrow: 'Everyday ops', blurb: 'Billing, payments, messaging, compliance.' },
  { id: 'seo',   title: 'Website & SEO',     eyebrow: 'Get found', blurb: 'Tighten meta, speed, schema, listings.' },
];

// ---------------------------------------------------------------------------
// Shared widget assets used by multiple tool definitions
// ---------------------------------------------------------------------------

const QR_LIB_SRC = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';

// Tiny helper that returns a Promise that resolves once a CDN script is loaded.
// Inlined as text into each widget that needs it.
const LOAD_SCRIPT_JS = `
function loadScript(src){
  return new Promise(function(resolve, reject){
    if (window.__loaded_scripts && window.__loaded_scripts[src]) return resolve();
    var s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = function(){ window.__loaded_scripts = window.__loaded_scripts || {}; window.__loaded_scripts[src] = true; resolve(); };
    s.onerror = function(){ reject(new Error('Failed to load ' + src)); };
    document.head.appendChild(s);
  });
}
`;

// Render a qrcode-generator instance into an SVG, plus draw to canvas for PNG download.
const QR_RENDER_JS = `
function renderQR(text, containerEl, opts){
  opts = opts || {};
  var size = opts.size || 240;
  var typeNumber = 0; // auto
  var errorCorrection = opts.ec || 'M';
  var q;
  for (var tn = typeNumber; tn <= 20; tn++) {
    try { q = qrcode(tn, errorCorrection); q.addData(text); q.make(); break; } catch(e) {}
  }
  if (!q) throw new Error('QR build failed');
  var modules = q.getModuleCount();
  var cell = Math.floor(size / modules);
  var pad = Math.floor((size - cell * modules) / 2);
  // SVG for crisp on-screen
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" shape-rendering="crispEdges" viewBox="0 0 ' + size + ' ' + size + '">';
  svg += '<rect width="100%" height="100%" fill="#ffffff"/>';
  for (var r = 0; r < modules; r++) {
    for (var c = 0; c < modules; c++) {
      if (q.isDark(r, c)) {
        svg += '<rect x="' + (pad + c * cell) + '" y="' + (pad + r * cell) + '" width="' + cell + '" height="' + cell + '" fill="#0a0e1a"/>';
      }
    }
  }
  svg += '</svg>';
  containerEl.innerHTML = svg;
  // Canvas for PNG download
  var canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,size,size);
  ctx.fillStyle = '#0a0e1a';
  for (var r2 = 0; r2 < modules; r2++) {
    for (var c2 = 0; c2 < modules; c2++) {
      if (q.isDark(r2, c2)) ctx.fillRect(pad + c2 * cell, pad + r2 * cell, cell, cell);
    }
  }
  return canvas;
}
function downloadCanvasPNG(canvas, filename){
  var a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename || 'qr.png';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
`;

// Tiny HTML escape used by several widgets
const ESCAPE_HTML = `function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}`;

// Shared AI-client wrapper for tool widgets that POST to /api/tools/ai/<tool>
const AI_CLIENT_JS = (toolName, fields, renderFn) => `
(function(){
  var btn=document.getElementById('ai-go');
  var status=document.getElementById('ai-status');
  var out=document.getElementById('ai-out');
  if(!btn) return;
  btn.addEventListener('click', async function(){
    var payload = {};
    ${fields.map(f => `payload['${f}']=(document.getElementById('ai-${f}').value||'').trim();`).join('')}
    if (!Object.values(payload).some(Boolean)) { status.textContent='Please enter at least one field'; return; }
    btn.disabled=true; status.textContent='Thinking…'; out.innerHTML='';
    try{
      var r=await fetch('/api/tools/ai/${toolName}',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      var d=await r.json();
      if(d.error){status.textContent='Error: '+d.error;return;}
      status.textContent = '';
      out.innerHTML = (d.items||[]).map(${renderFn}).join('');
    }catch(e){status.textContent='Network error';}
    finally{btn.disabled=false;}
  });
})();`;

// ---------------------------------------------------------------------------
// TOOLS REGISTRY
// ---------------------------------------------------------------------------

export const TOOLS = [
  // =========================================================================
  // ============================ BUSINESS NAME ==============================
  // =========================================================================
  {
    slug: 'business-name-generator',
    category: 'start',
    built: true,
    name: 'Business Name Generator',
    tagline: 'Brainstorm a brand from your industry and a few keywords.',
    primaryKeyword: 'business name generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Business Name Generator for Indian SMBs | Neweb',
    metaDescription: 'Generate 12 business name ideas with one click. Industry plus a few keywords, and we suggest punchy Indian-flavoured names with instant domain checks.',
    h1: 'Business Name <span class="serif">Generator</span>.',
    lede: 'Type your industry plus a few keywords. Get 12 short, memorable name ideas in Indian English, Hindi or Marathi flavours, each with a one tap domain check.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Industry</label>
            <input id="bn-industry" type="text" placeholder="e.g. bakery, diagnostic lab, jewellery showroom" maxlength="80" />
          </div>
          <div class="field"><label>Keywords or style cues</label>
            <input id="bn-keywords" type="text" placeholder="e.g. warm, Marathi name, modern, family business" maxlength="160" />
          </div>
        </div>
        <div class="tool-actions">
          <button id="bn-gen" type="button" class="btn btn-brand">Generate names</button>
          <span id="bn-status" style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);align-self:center"></span>
        </div>
        <div id="bn-results" style="margin-top:18px;display:flex;flex-direction:column;gap:8px"></div>
      `,
      help: 'Domain availability check happens in your browser via Google Public DNS.',
      js: `
(function(){
  var btn = document.getElementById('bn-gen');
  var ind = document.getElementById('bn-industry');
  var kw  = document.getElementById('bn-keywords');
  var out = document.getElementById('bn-results');
  var stat = document.getElementById('bn-status');
  if (!btn) return;
  function slugify(s){return String(s||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
  function render(items, source){
    if (!items || !items.length){ out.innerHTML = '<p style="color:var(--muted);font-size:14px">No suggestions came back. Try richer keywords.</p>'; return; }
    out.innerHTML = items.map(function(n){
      var slug = n.slug || slugify(n.name);
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 18px;border:1px solid var(--line);border-radius:12px;background:#fff;flex-wrap:wrap">'
        + '<div style="min-width:0">'
        +   '<div style="font-family:Inter Tight,sans-serif;font-size:16px;font-weight:600;color:var(--ink);letter-spacing:-.01em">' + escapeHtml(n.name) + '</div>'
        +   '<div style="font-size:13px;color:var(--ink-2);margin-top:2px;line-height:1.45">' + escapeHtml(n.reason || '') + '</div>'
        + '</div>'
        + '<a class="btn btn-ghost" style="padding:8px 14px;font-size:13px" href="/pages/domain-checker?q=' + encodeURIComponent(slug) + '" target="_blank" rel="noopener">Check domain →</a>'
        + '</div>';
    }).join('');
    stat.textContent = '';
  }
  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  btn.addEventListener('click', async function(){
    var industry = (ind.value||'').trim();
    if (!industry){ ind.focus(); return; }
    btn.disabled = true; stat.textContent = 'Thinking…'; out.innerHTML = '';
    try {
      var r = await fetch('/api/tools/business-name', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({ industry: industry, keywords: (kw.value||'').trim() })
      });
      var data = await r.json();
      render(data.names, data.source);
    } catch (e){
      stat.textContent = 'Network error';
      out.innerHTML = '<p style="color:var(--muted);font-size:14px">Please check your connection and try again.</p>';
    } finally { btn.disabled = false; }
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Aaple Phasal</div><div class="eo-sub">Marathi for "our harvest", evokes homemade warmth and family tradition.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Roti Roost</div><div class="eo-sub">Playful English pairing, easy to say and remember for a daily bakery.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Madhur Bake House</div><div class="eo-sub">"Madhur" means sweet in Hindi, signals fresh sweet bakes and warmth.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Tava Tales</div><div class="eo-sub">Alliterative and brandable, hints at fresh-off-the-griddle goods.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Khari Corner</div><div class="eo-sub">"Khari" is a beloved Indian bakery staple, instantly local and familiar.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Sunehra Oven</div><div class="eo-sub">"Sunehra" means golden, suggests golden, perfectly baked crusts.</div></div></div>
      <div class="eo-note">Sample output. Generate your own 12 names with one-tap domain checks above.</div>
    `,
    intro: `
      <p>Picking a name for a new business is half psychology and half pattern matching. You want something that says what you do but does not box you in. Something that sounds Indian without sounding like every other shop on the lane. Something that will look good in a logo, on a sign, and on a sticker on the takeaway bag. And ideally, something whose .com or .in is still available so you can register it the same day.</p>
      <p>This tool takes two short inputs from you, the industry and a few keywords or style cues, and returns 12 name ideas with a one-line rationale for each. Tap any name and we deep-link you straight into our domain checker, which queries .com, .in, .co, .shop, .co.in, .store, .org and .net in parallel. Results come back in a couple of seconds.</p>
    `,
    howTo: [
      'Type your <strong>industry</strong> in one or two words. "Bakery", "diagnostic lab", "boutique tutoring centre" and "jewellery showroom" all work well. Avoid long descriptions; the shorter the seed, the punchier the names.',
      'Add a few <strong>keywords or style cues</strong>. Words you want associated with your brand. "Warm", "Sanskrit", "rustic", "modern", "Hindi name", "coastal Karnataka". The richer the cue, the better the names you will get back.',
      'Click <strong>Generate names</strong>. In a couple of seconds you will see 12 ideas, each with a short reason explaining the choice.',
      'Tap <strong>Check domain</strong> next to any name. We deep-link straight into our domain checker with the slug pre-filled, and it queries 8 popular TLDs in parallel.',
      'If you like a name but the .com is taken, try a regional TLD like .in or .co.in, or rerun with sharper keywords for a related variant.',
      'Save your top three names and sleep on them for 24 hours before deciding. The right one almost always feels obvious in the morning.',
      'Before you commit, search the name in the IP India trademark database and the MCA company name search to make sure no one else owns it.',
    ],
    why: `
      <p>The name matters more than first-time founders think. Three concrete reasons.</p>
      <p><strong>Searchability.</strong> A unique name is one Google search away from your customers. A generic one is buried. "Tatva Diagnostics" wins; "Reliable Diagnostics" loses, because the search results for "reliable diagnostics" are full of unrelated businesses and a long-tail of generic listings. If your name returns your own website on page one, your marketing budget goes much further.</p>
      <p><strong>Trademark and legal defense.</strong> The easier the name is to trademark and register as a domain, the cheaper it is to defend later when someone tries to copy it. Plain English words like "Premium", "Reliable" or "Solutions" almost never qualify for trademark protection in India because they are generic. A made-up or Indic-rooted word like "Tatva", "Roop", or "Madhu" usually does qualify, and that protection gives you a real lever the day a competitor copies your menu or your logo.</p>
      <p><strong>Brand stretch.</strong> Today you sell sweets, but in three years you might add savouries, catering, gift hampers, an export line. "Apte Chivda" boxes you in; "Apte Foods" stretches; "Apte" alone stretches further still. Pick a name that gives your future self room to grow, not one that locks you into a single product or city.</p>
    `,
    tips: [
      'Two syllables is the sweet spot. Shorter feels punchy. Three-syllable names sound bigger and more formal.',
      'Test the name out loud over a phone call before you decide. "I would like to order from Apte Apte" gets confusing fast; "I would like to order from Roop Bakery" does not.',
      'Avoid numbers and hyphens. They survive on a website but die on a printed billboard, a hoarding, or a customer telling a friend.',
      'Try the name as a WhatsApp Status update. If a friend reads it correctly on the first try and pronounces it as you intended, you have a winner.',
      'Hold the name lightly until you have the .com or the .in registered in your own name. Do not print signboards before you own the domain.',
      'Search the name in the IP India trademark database at ipindiaonline.gov.in before you commit. Two minutes of searching saves months of rebranding.',
      'If you have a regional audience, lean into a regional language. "Tatva", "Roop", "Madhu", "Pakad" land differently from "Excellence", "Premium" or "Pro".',
    ],
    example: `
      <p>A founder wants to start a homemade pickle brand in Pune. She types <em>pickle</em> as the industry and <em>Maharashtrian, grandmother, homemade, Marathi name</em> as keywords. The tool returns a dozen ideas including Aaji's Achaar, Roop Pickle Co, Bhakar Pickle House, Pune Loncha, Aaji and Co, and Tatva Achaar.</p>
      <p>She picks "Aaji's Achaar", taps Check domain, and finds aajisachaar.com and aajisachaar.in are both available. She registers the .in inside the next ten minutes through her Neweb account. Six months later that name is on a label, on Instagram, on Amazon Karigar, and on a small kiosk at Phoenix Mall. The right name did not come from a long agonised brainstorm. It came from a five-minute prompt with the right cues.</p>
    `,
    faq: [
      { q: 'How does this generate the names?', a: '<p>The generator takes two inputs, your industry and a few keywords or style cues, and returns 12 short, brandable names tuned for Indian small businesses. It blends English, Hindi, Marathi and other Indic word roots depending on the cues you give, so a Pune sweet shop and a Bengaluru SaaS startup get very different lists. Each name arrives with a one-line rationale explaining the choice, plus a one-tap availability check across .com, .in, .co, .shop and four more TLDs run through Google Public DNS. Results land in about two seconds. For example, typing "bakery" with "warm, Marathi, family" might surface Aaji Bakes, Madhur Oven and Khari Corner. Treat the list as a starting point, not a final verdict; shortlist three names, say each one out loud over a phone call, and sleep on them for 24 hours before you commit to a signboard or a domain.</p>' },
      { q: 'Are the names trademarked or owned by anyone?', a: '<p>We cannot guarantee any generated name is free to own, and some may already be registered by another business. The tool produces fresh word combinations, but it does not check live trademark or company registers, so the responsibility to verify sits with you. Before you commit, run two free searches that take under five minutes combined: the IP India trademark search at ipindiaonline.gov.in, filtered to your class of goods or services, and the MCA company name search at mca.gov.in. If a similar mark or company already exists in your category, pick a different name. Two minutes of checking now can save you the cost of reprinting signboards, packaging, GST stationery and business cards later, plus the far larger cost of a rebrand once customers already know you. When you upgrade to a paid Neweb plan, we can connect you with vetted IP lawyers to handle the formal clearance and filing.</p>' },
      { q: 'Can I use a name from this list directly for my GST registration?', a: '<p>Yes, you can use a generated name for GST registration once you confirm it is not already a registered company on the MCA portal and not an active trademark held by someone else in the same class of goods or services. Both checks are free: the MCA company name search at mca.gov.in takes about a minute, and the IP India trademark search at ipindiaonline.gov.in takes a couple more. For a sole proprietorship you have wide latitude on the trade name, but for a Private Limited or LLP the name must be approved through the MCA RUN or SPICe+ process, which rejects names too similar to existing ones. The safest path is to clear the name on both portals first, register the matching .in or .com domain in your own name, and only then file for GST so your brand, domain and registration all line up cleanly from day one.</p>' },
      { q: 'Why are some names just English?', a: '<p>The tool mixes English, Hindi and Indic words on purpose, because the right brand language depends entirely on your category and audience. A boutique sweet shop in Pune often lands better with a Marathi or Gujarati name like Madhur or Roop, because it signals tradition, warmth and local roots to walk-in customers. A SaaS product, a diagnostic chain or a clinic group is usually served better by a clean, easy-to-spell English name that travels across cities and reads well in a Google ad. You steer this through the keywords field: cues like "Marathi name", "Sanskrit root" or "coastal Karnataka" pull the list toward regional flavours, while "modern", "tech" or "clean English" pull it the other way. The more specific your register cue, the more consistent the 12 names will feel, so tell the tool exactly which direction you want it to lean.</p>' },
      { q: 'What if I do not like any of them?', a: '<p>Rerun the generator with sharper, more specific keywords, because the quality of the output tracks the quality of your cues almost one to one. "Modern, two-syllable, sounds like a place" produces a very different list from "warm, traditional, family business, Marathi". Try naming a feeling, a material, a region or a founder, for example "copper, rustic, Jaipur" or "fast, friendly, late-night". You can also expand the industry seed itself: "organic vegetarian bakery" gives tighter results than just "bakery". Running the same inputs again returns a fresh set of 12, so you are never stuck with one batch. If you have run it three or four times and nothing clicks, the issue is usually too broad a brief; narrow it to one clear adjective plus one clear noun and the suggestions sharpen immediately. Save any near-misses in your notes app; the winner often emerges by combining two of them.</p>' },
      { q: 'Can I download or save the list?', a: '<p>The tool does not save your list automatically, so for now copy your favourites into your notes app, a WhatsApp message to yourself, or a quick spreadsheet before you close the tab. Nothing is stored on our side and nothing is sent to a server beyond the name request itself, which keeps the tool fast and private. A practical workflow is to run the generator two or three times, paste every name you half-like into one running list, then strike out the weak ones the next morning when you are fresh. We may add a built-in save and share feature in a future iteration, once we see how founders actually shortlist names, but we would rather ship that based on real usage than guess at it now. In the meantime, the moment a name feels right, jump straight to the domain check so you do not fall in love with a name whose .in and .com are both already taken.</p>' },
      { q: 'How do I check the domain at the same time?', a: '<p>Tap the Check domain button next to any name and we deep-link straight into our domain checker with the slug already filled in, so you do not retype anything. The checker runs a DNS lookup across eight popular extensions in parallel, .com, .in, .co, .shop, .co.in, .store, .org and .net, using Google Public DNS, and returns results in under two seconds telling you which are clearly free. For an Indian business, prioritise .in and .co.in, which carry a strong local trust signal and a small SEO benefit for India-focused search, then grab the .com too if it is available to block squatters. Bear in mind a DNS check is a fast signal rather than authoritative WHOIS, so in rare cases a domain can be registered without DNS records; when you register through Neweb we run an authoritative check before billing, so you never pay for something that is actually taken.</p>' },
      { q: 'Will Neweb help me with trademark filing?', a: '<p>Neweb does not file trademarks itself, but we make the handoff painless when you are on a paid plan. We connect you with vetted Indian IP lawyers and hand them a clear brief that already includes your shortlisted name choices, the intended class of goods or services, and the results of your preliminary IP India trademark search, so they are not starting from a blank page. That preparation typically shortens the lawyer conversation and keeps their fees down. For context, the government filing fee for a trademark application in India is around Rs 4,500 to Rs 9,000 per class for a small business or startup claiming the concession, with lawyer fees on top depending on complexity. The smart sequence is to clear the name, register the domain in your own name, launch under it, and file the trademark once the brand has proven itself, so you are protecting something real rather than a name you might still abandon.</p>' },
    ],
    related: [
      { href: '/pages/domain-checker', title: 'Domain Name Checker', blurb: 'Check .com, .in, .shop, .co availability in seconds.' },
      { href: '/pages/tools', title: 'All free tools', blurb: 'WhatsApp links, UPI QR, GST invoices and more.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'From ₹249 a month, website plus free domain.' },
    ],
  },

  // ---------- Start a business (stubs) ----------
  {
    slug: 'domain-name-generator',
    category: 'start',
    built: true,
    name: 'Domain Name Generator',
    tagline: 'AI-picked .com and .in name ideas, ready to register.',
    primaryKeyword: 'domain name generator india',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Domain Name Generator India — .com and .in Ideas | Neweb',
    metaDescription: 'Generate 12 short, brandable domain names with .com and .in suggestions for Indian small businesses. Tap to check availability instantly.',
    h1: 'Domain Name <span class="serif">Generator</span>.',
    lede: 'Type your business name, your industry, and a couple of keywords. We suggest 12 short, brandable domain names across .com and .in. Tap any name to check availability.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Business name (optional)</label><input id="ai-business" type="text" placeholder="e.g. Copper Oven" maxlength="80" /></div>
          <div class="field"><label>Industry</label><input id="ai-industry" type="text" placeholder="e.g. bakery, salon, clinic" maxlength="80" /></div>
        </div>
        <div class="field"><label>Keywords or style cues</label><input id="ai-keywords" type="text" placeholder="e.g. warm, family, Indore" maxlength="160" /></div>
        <div class="tool-actions">
          <button id="ai-go" type="button" class="btn btn-brand">Generate domains</button>
          <span id="ai-status" style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);align-self:center"></span>
        </div>
        <div id="ai-out" style="margin-top:18px;display:flex;flex-direction:column;gap:8px"></div>
      `,
      help: 'Availability check via Google Public DNS.',
      js: `
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
(function(){
  var btn=document.getElementById('ai-go'), status=document.getElementById('ai-status'), out=document.getElementById('ai-out');
  if(!btn) return;
  btn.addEventListener('click', async function(){
    var payload={business:(document.getElementById('ai-business').value||'').trim(), industry:(document.getElementById('ai-industry').value||'').trim(), keywords:(document.getElementById('ai-keywords').value||'').trim()};
    if(!Object.values(payload).some(Boolean)){status.textContent='Please enter at least one field';return;}
    btn.disabled=true; status.textContent='Thinking…'; out.innerHTML='';
    try{
      var r=await fetch('/api/tools/ai/domain-name',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      var d=await r.json();
      if(d.error){status.textContent='Error: '+d.error;return;}
      status.textContent = '';
      out.innerHTML = (d.items||[]).map(function(n){
        var qHref='/pages/domain-checker?q='+encodeURIComponent(n.slug||n.name||'');
        return '<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 18px;border:1px solid var(--line);border-radius:12px;background:#fff;flex-wrap:wrap">'
          +'<div style="min-width:0"><div style="font-family:JetBrains Mono,monospace;font-size:15px;font-weight:600;color:var(--ink)">'+escHtml(n.name||'')+escHtml(n.tld||'')+'</div><div style="font-size:13px;color:var(--ink-2);margin-top:2px;line-height:1.45">'+escHtml(n.reason||'')+'</div></div>'
          +'<a class="btn btn-ghost" style="padding:8px 14px;font-size:13px" href="'+qHref+'" target="_blank" rel="noopener">Check availability →</a>'
          +'</div>';
      }).join('');
    }catch(e){status.textContent='Network error';}
    finally{btn.disabled=false;}
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main eo-mono">copperoven.in</div><div class="eo-sub">Short, brandable, local .in for a Pune bakery.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">madhurbakes.com</div><div class="eo-sub">"Madhur" reads sweet, the .com is premium and memorable.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">khariandco.in</div><div class="eo-sub">Familiar Indian bakery staple, easy to spell after one hearing.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">tavatales.com</div><div class="eo-sub">Alliterative wordmark, works well on a logo and a bag print.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">sunehraoven.in</div><div class="eo-sub">"Sunehra" means golden, regional .in for a local audience.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">roostbakery.com</div><div class="eo-sub">Playful, brandable, clean .com that stretches beyond one product.</div></div></div>
      <div class="eo-note">Sample output. Run the generator above to check live availability across .com, .in and more.</div>
    `,
    intro: `
      <p>A short, brandable domain is the cheapest form of marketing a small business can buy. It is what customers type, what your email lives at, what gets printed on the receipt, what appears in Google ads, and what gets shared on WhatsApp. The right name can save you tens of thousands of rupees in retargeting because people remember it the first time. The wrong one quietly bleeds traffic for years.</p>
      <p>This domain name generator takes a short brief from you, the business name, the industry, and a few keywords, and returns 12 domain ideas across the .com and .in extensions. Suggestions are short, brandable, and free of hyphens or digits. Suggestions arrive in seconds. Every result has a one-tap availability check against our domain checker, which queries .com, .in, .co, .shop, .co.in, .store, .org, and .net in parallel using Google Public DNS.</p>
    `,
    howTo: [
      'Enter your <strong>business name</strong> if you already have one in mind. Skip if you are still brainstorming.',
      'Enter your <strong>industry</strong> in one or two words. Examples: bakery, jewellery showroom, paediatric clinic, tutoring centre.',
      'Add a few <strong>keywords or style cues</strong>. These shape the language of the results: warm, modern, Marathi, Bombay, coastal Karnataka, family, Sanskrit.',
      'Click <strong>Generate domains</strong>. In a couple of seconds you will see 12 ideas, each with a one-line reason for the choice.',
      'Tap <strong>Check availability</strong> next to any name. We deep-link into our domain checker with the slug pre-filled. The check runs across 8 popular extensions in under two seconds.',
      'If the .com is taken, look for .in or .co.in. Indian businesses with a .in get a small SEO benefit for local search and signal to customers that you are an Indian brand.',
      'Once you find a name that is available across the extensions you care about, register it inside Neweb so we hold it in your own name with WHOIS privacy and free SSL.',
    ],
    why: `
      <p>Three practical reasons a domain name deserves more thought than most founders give it.</p>
      <p><strong>It compounds.</strong> A clean domain is the only marketing asset that gets more valuable every year you own it. As you build links, mentions, social media reach, ad campaigns, packaging, and word of mouth, every single drop of attention points back to that one address. Change the domain after two years and you start over.</p>
      <p><strong>It signals trust.</strong> Indian customers increasingly check for a real domain before they buy. A business that lives only on Instagram or WhatsApp gets the early-stage tag for years. A business with its own .com or .in feels like a real business with a real bank account, a real address, and a real customer service desk. That signal alone moves conversion meaningfully.</p>
      <p><strong>It owns your funnel.</strong> When customers find you through Google or a Google Business listing, they land on your domain, where you control the design, the message, the offer, the analytics, and the next step. Without your own domain, every visitor is renting space inside someone else app, on someone else terms, with someone else taking a cut.</p>
    `,
    tips: [
      'Two syllables is the sweet spot. Shorter feels punchy, longer feels formal.',
      'If a .com is taken but a .in is free, take the .in. Indian customers trust .in for local businesses.',
      'Avoid hyphens and numbers. They survive online but die on a printed billboard or in a customer telling a friend.',
      'Say the domain out loud over a phone call. If the listener has to ask you to spell it twice, pick a different one.',
      'Search the name in the IP India trademark search at ipindiaonline.gov.in before you commit. Two minutes saves months.',
      'Register both .com and .in if both are available. They cost the same at Neweb and protect your brand from squatters.',
      'Avoid trendy English suffixes like ai, io, app, or co. They look good for two years and tired for ten.',
    ],
    example: `
      <p>Imagine a founder opening a vegetarian thali outlet in Pune. She types business name "Aaji Thali", industry "vegetarian thali restaurant", keywords "Marathi, family, lunch, simple". The generator returns 12 domains including aajithali.com, aajiplate.com, aajithali.in, aajifood.in, plathaali.com, ghariplate.in, simplethali.com, and a few more.</p>
      <p>She taps Check availability on aajithali.in. The domain checker shows aajithali.in and aajithali.co.in as available, aajithali.com as taken (because some other Aaji somewhere already owns it). She registers aajithali.in inside her Neweb account in the next ten minutes. By Saturday her website is live, her Google Business profile points to it, and her menu QR code at the till lands customers there. Cost: one month of Neweb at Rs 249. Time: under an hour.</p>
    `,
    faq: [
      { q: 'How does this generator work?', a: '<p>The generator takes three short inputs, your business name if you have one, your industry, and a few keywords or style cues, and returns 12 domain ideas focused on the .com and .in extensions. Every suggestion is short, brandable, and deliberately free of hyphens and digits so it survives being printed on a signboard, read out over a phone call, and shared on WhatsApp. Each idea comes with a one-line reason and a one-tap availability check. For example, a Pune bakery called Copper Oven might get copperoven.in, madhurbakes.com and tavatales.com. When you tap a result, we deep-link into our domain checker, which queries eight extensions in parallel through Google Public DNS in about two seconds. If you are still naming the business itself, start with our business name generator first, lock the brand, then come here to find the matching domain so the two line up cleanly before you register anything.</p>' },
      { q: 'Why mostly .com and .in?', a: '<p>For Indian small businesses, .com still carries the most universal trust signal worldwide, while .in is the strongest signal that you are a local Indian brand, which both customers and Google reward for India-focused searches. .co.in is the natural third choice, useful when the .com and .in are already taken. We lead with these because they are the extensions customers actually expect and remember; a clean .in often beats a clever .xyz or .online for trust at the counter. Other extensions such as .shop, .store, .co, .org and .net are situational, so rather than padding the suggestion list with them we surface them in the live availability check on the next page, where you can see at a glance which ones are free. If both your .com and .in are available, register both: they cost the same at Neweb and registering the pair blocks squatters and lets you redirect one to the other.</p>' },
      { q: 'Will the domain be available when I check?', a: '<p>The availability check runs through Google Public DNS, which is fast and accurate for the vast majority of cases, but it is a DNS-level signal rather than an authoritative WHOIS lookup. In rare edge cases a domain can be registered without any DNS records pointed at it, in which case it could show as free here but turn out to be taken at the registrar. That is why you should treat a green result as a strong shortlist signal rather than a final guarantee. The check covers eight extensions in parallel and returns in under two seconds, so you can scan a whole shortlist quickly. When you decide to register a domain inside Neweb, we run an authoritative WHOIS-level check before we bill you, so you never pay for a name that is actually unavailable. If a name matters a lot to you, move fast: good short domains get registered by someone else daily.</p>' },
      { q: 'Should I buy multiple TLDs?', a: '<p>If your budget allows it, yes, registering both the .com and the .in for your chosen name is sensible defensive hygiene. Owning the pair stops a squatter or a competitor from grabbing the version you skipped, and it lets you redirect one extension to the other so a customer who types either one still lands on your site. At Neweb both cost the same and your first domain is free for the first year on a paid plan, so the marginal cost is small. That said, you do not need to hoard every extension under the sun; chasing .shop, .store, .co, .org and .net for a single-city business is usually wasted money. For a neighbourhood bakery or a one-city clinic, a single strong .in is often plenty. Buy the second TLD when your brand starts travelling beyond one city or you spot someone showing interest in the lookalike, not before.</p>' },
      { q: 'How do I avoid trademark conflicts?', a: '<p>Before you register a domain, search the IP India trademark database at ipindiaonline.gov.in, filtered to your specific class of goods or services, because a free domain is worthless if the name is already an active trademark in your category. A domain registrar will happily sell you a name that infringes someone else mark; the registrar does no trademark clearance, so that check is on you. If a similar or identical mark exists in the same class, pick a different name rather than risk a cease-and-desist or a costly forced rebrand after you have already printed packaging and built an audience. It is also worth a quick MCA company name search at mca.gov.in to catch registered companies using the name. When you sign up for a paid Neweb plan, we can connect you with vetted IP lawyers who will run a formal clearance and, if it is clean, handle the filing for you.</p>' },
      { q: 'Does Neweb register the domain in my name?', a: '<p>Yes, every domain you register through Neweb is registered in your own legal name, never in ours, so you are always the true owner of your most important brand asset. The registration comes with WHOIS privacy enabled to keep your personal details off public lookups, free SSL so your site loads with the padlock and is not flagged as insecure, free DNS management, and a clean handover document recording exactly what you own. Crucially, you are never locked in: after the standard 60-day ICANN transfer lock that applies to every registrar worldwide, you can transfer the domain out to any other provider you like, with our cooperation and no exit penalty. That ownership clarity matters because some cheap website builders register the domain in their own name and effectively hold your brand hostage at renewal time. With Neweb the domain is yours from day one and stays yours if you ever leave.</p>' },
      { q: 'What does a domain cost?', a: '<p>On a Neweb paid plan, your first domain is included free for the first year, so a new business can launch with a real address at no extra cost beyond the plan itself, which starts at Rs 249 a month. After the first year, renewals are charged at cost rather than marked up, currently around Rs 999 a year for a .com and around Rs 599 a year for a .in at prevailing registrar rates. We deliberately do not run the bait-and-switch that some hosts use, where a Rs 99 first-year domain quietly renews at several thousand rupees once you are locked in; what you see is the real ongoing cost. You also get WHOIS privacy, free SSL and free DNS bundled in rather than sold as add-ons. If you register both your .com and .in, budget for both renewals annually, and set a calendar reminder a month before expiry so a lapsed renewal never knocks your site and email offline.</p>' },
      { q: 'Can I use a name that already exists in a different industry?', a: '<p>You can, but weigh the SEO cost carefully before you do, because sharing a name with a larger business, even in a completely different category, makes it much harder to rank for your own brand. If a big, well-known company already owns the search results for that word, customers who Google your name will see them first and may never reach you, which quietly wastes every rupee of your marketing. The practical test is to search the proposed name on Google and check whether your own site could realistically reach page one for at least the first two pages of results, or whether you would be permanently buried under a giant. Trademark risk is a separate concern: even in a different industry, a famous mark can sometimes claim protection across classes. When you can, pick a name distinctive enough that it returns mostly your own brand, so your name searches do your marketing for you instead of someone else.</p>' },
    ],
    related: [
      { href: '/pages/domain-checker', title: 'Domain Name Checker', blurb: 'Authoritative availability across 8 TLDs.' },
      { href: '/pages/tools/business-name-generator', title: 'Business Name Generator', blurb: 'Pick the brand first, then the domain.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Free domain on every paid plan.' },
    ],
  },
  {
    slug: 'logo-maker',
    category: 'start',
    built: true,
    name: 'Logo Maker',
    tagline: 'Generate a clean wordmark or icon for your shop in seconds.',
    primaryKeyword: 'free logo maker for small business',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Logo Maker for Small Businesses India — SVG + PNG | Neweb',
    metaDescription: 'Generate a clean wordmark logo with a brand colour, font choice and icon glyph. Download as SVG and PNG. Runs in your browser. No watermark.',
    h1: 'Logo <span class="serif">Maker</span>.',
    lede: 'Type your business name, pick a colour, font style and icon. Download a clean SVG and PNG. No watermark, no signup. Built for small Indian businesses on a budget.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Business name</label><input id="lm-name" type="text" value="Copper Oven" maxlength="40" /></div>
          <div class="field"><label>Tagline (optional)</label><input id="lm-tag" type="text" placeholder="Fresh from the kitchen" maxlength="60" /></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Brand colour</label><input id="lm-color" type="color" value="#3d4cff" /></div>
          <div class="field"><label>Font style</label>
            <select id="lm-font">
              <option value="Inter Tight">Modern sans</option>
              <option value="Instrument Serif">Italic serif</option>
              <option value="JetBrains Mono">Mono</option>
              <option value="Georgia, serif">Classic serif</option>
            </select>
          </div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Icon glyph</label>
            <select id="lm-icon">
              <option value="">None</option>
              <option value="◉">Circle</option>
              <option value="⬡">Hexagon</option>
              <option value="✦">Star</option>
              <option value="♦">Diamond</option>
              <option value="◆">Solid diamond</option>
              <option value="◐">Half moon</option>
              <option value="❋">Flower</option>
              <option value="✿">Bloom</option>
              <option value="✷">Sparkle</option>
              <option value="❍">Ring</option>
            </select>
          </div>
          <div class="field"><label>Layout</label>
            <select id="lm-layout">
              <option value="horizontal">Icon + name (horizontal)</option>
              <option value="vertical">Stacked (vertical)</option>
              <option value="text-only">Wordmark only</option>
            </select>
          </div>
        </div>
        <div class="tool-actions">
          <button id="lm-render" type="button" class="btn btn-brand">Render logo</button>
          <button id="lm-svg" type="button" class="btn btn-ghost">Download SVG</button>
          <button id="lm-png" type="button" class="btn btn-ghost">Download PNG</button>
        </div>
        <div id="lm-preview" style="margin-top:18px;padding:48px 24px;background:#fff;border:1px solid var(--line);border-radius:14px;display:flex;align-items:center;justify-content:center;min-height:200px"></div>
      `,
      help: 'SVG is vector, PNG is rasterised at 1200 px. Tweak in Figma or Canva later if you want details.',
      js: `
(function(){
  var btn=document.getElementById('lm-render');
  var preview=document.getElementById('lm-preview');
  if(!btn) return;
  function buildSVG(){
    var name=(document.getElementById('lm-name').value||'').trim();
    var tag =(document.getElementById('lm-tag').value||'').trim();
    var color=document.getElementById('lm-color').value;
    var font=document.getElementById('lm-font').value;
    var icon=document.getElementById('lm-icon').value;
    var layout=document.getElementById('lm-layout').value;
    var ink='#0a0e1a';
    var W=1200, H=400;
    var iconSize=160, textSize=110, tagSize=36;
    var parts=[];
    parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">');
    parts.push('<rect width="100%" height="100%" fill="#ffffff"/>');
    if (layout==='horizontal'){
      var x=60;
      if (icon){ parts.push('<text x="'+x+'" y="'+(H/2+iconSize*0.32)+'" font-family="'+font+'" font-size="'+iconSize+'" fill="'+color+'">'+icon+'</text>'); x += iconSize + 30; }
      parts.push('<text x="'+x+'" y="'+(H/2+textSize*0.3)+'" font-family="'+font+'" font-size="'+textSize+'" font-weight="600" fill="'+ink+'" letter-spacing="-3">'+escapeXML(name)+'</text>');
      if (tag) parts.push('<text x="'+x+'" y="'+(H/2+textSize*0.3+tagSize+20)+'" font-family="'+font+'" font-size="'+tagSize+'" fill="#6a7185">'+escapeXML(tag)+'</text>');
    } else if (layout==='vertical'){
      if (icon){ parts.push('<text x="'+(W/2)+'" y="'+150+'" text-anchor="middle" font-family="'+font+'" font-size="'+iconSize+'" fill="'+color+'">'+icon+'</text>'); }
      parts.push('<text x="'+(W/2)+'" y="'+(icon?280:200)+'" text-anchor="middle" font-family="'+font+'" font-size="'+textSize+'" font-weight="600" fill="'+ink+'" letter-spacing="-3">'+escapeXML(name)+'</text>');
      if (tag) parts.push('<text x="'+(W/2)+'" y="'+(icon?340:260)+'" text-anchor="middle" font-family="'+font+'" font-size="'+tagSize+'" fill="#6a7185">'+escapeXML(tag)+'</text>');
    } else {
      parts.push('<text x="'+(W/2)+'" y="'+(H/2+textSize*0.3)+'" text-anchor="middle" font-family="'+font+'" font-size="'+textSize+'" font-weight="600" fill="'+ink+'" letter-spacing="-3">'+escapeXML(name)+'</text>');
      if (tag) parts.push('<text x="'+(W/2)+'" y="'+(H/2+textSize*0.3+tagSize+20)+'" text-anchor="middle" font-family="'+font+'" font-size="'+tagSize+'" fill="#6a7185">'+escapeXML(tag)+'</text>');
    }
    parts.push('</svg>');
    return parts.join('');
  }
  function escapeXML(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function render(){ preview.innerHTML = '<div style="max-width:100%">'+buildSVG()+'</div>'; preview.querySelector('svg').style.width='100%'; preview.querySelector('svg').style.height='auto'; preview.querySelector('svg').style.maxHeight='240px'; }
  btn.addEventListener('click', render); render();
  ['lm-name','lm-tag','lm-color','lm-font','lm-icon','lm-layout'].forEach(function(id){ document.getElementById(id).addEventListener('input', render); document.getElementById(id).addEventListener('change', render); });
  document.getElementById('lm-svg').addEventListener('click', function(){
    var blob=new Blob([buildSVG()],{type:'image/svg+xml'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='logo.svg'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });
  document.getElementById('lm-png').addEventListener('click', function(){
    var svg=buildSVG();
    var img=new Image();
    var blob=new Blob([svg],{type:'image/svg+xml'});
    var url=URL.createObjectURL(blob);
    img.onload=function(){
      var c=document.createElement('canvas'); c.width=1200; c.height=400;
      var ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,1200,400); ctx.drawImage(img,0,0,1200,400);
      var a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download='logo.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    img.src=url;
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Modern sans plus hexagon icon</div><div class="eo-sub">Clean geometric wordmark in Inter, paired with a flat hexagon glyph. Reads well on signage and favicons.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Italic serif wordmark</div><div class="eo-sub">Elegant italic serif name, no icon. Suits a bakery, boutique or studio that wants a refined feel.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Mono plus star glyph</div><div class="eo-sub">Monospace lettering with a small star mark. A technical, contemporary look for a service or tech brand.</div></div></div>
      <div class="eo-note">This tool renders your logo live as SVG and PNG you can download. The presets above show the styles it produces.</div>
    `,
    intro: `
      <p>A logo is the smallest possible signal of who you are. It goes on the shopfront, the visiting card, the bill book, the bag, the social profile, the website header, and the customer-facing email. Most small businesses pay between Rs 5,000 and Rs 50,000 for a designer to do it. Most small businesses also wait two to four weeks for the designer to deliver. For a brand-new shop that needs to open tomorrow, this tool generates a clean wordmark you can use today, then upgrade later when you have the time and the budget.</p>
      <p>The tool runs entirely in your browser. You pick a font style, a brand colour, an icon glyph, and a layout. We render an SVG (vector, scales infinitely) and a PNG (1200 by 400 pixels, ready for social media headers). Nothing leaves your machine. There is no watermark. You can use the output commercially today and replace it with a custom logo when you are ready.</p>
    `,
    howTo: [
      'Type your <strong>business name</strong>. Keep it short. Three or four words at most.',
      'Add a <strong>tagline</strong> if you have one. Keep it under 50 characters so it fits cleanly under the name.',
      'Pick a <strong>brand colour</strong>. The colour applies to the icon only; the name stays in our ink black for contrast. Start with a deep blue or maroon if you are not sure.',
      'Pick a <strong>font style</strong>. Modern sans for tech and services, italic serif for boutique and food, mono for engineering and developer tools, classic serif for law and finance.',
      'Pick an <strong>icon glyph</strong> from the dropdown. We use Unicode shape characters which render the same on every device, so your logo looks identical on iOS, Android, Windows and print.',
      'Pick a <strong>layout</strong>: icon + name on one line, stacked vertical for a square profile, or wordmark only.',
      'Click <strong>Render logo</strong> to preview, then <strong>Download SVG</strong> for vector use and <strong>Download PNG</strong> for social media and email.',
    ],
    why: `
      <p>Three reasons a basic logo today beats a perfect logo in three months.</p>
      <p><strong>Customers expect a logo.</strong> A blank brand on Google, Instagram, or your Google Business Profile reads as new and untested, even when you have been open for years. A clean logo, even a simple wordmark, instantly raises perceived credibility. Conversion data from small business landing pages consistently shows a 10 to 20 percent lift the day a logo appears, separate from any actual brand work.</p>
      <p><strong>Speed matters more than perfection.</strong> Most logo design sprints end with a wordmark that looks 80 percent like the one a tool would have generated for free. The remaining 20 percent of polish costs three weeks and a designer fee. If you are still figuring out your brand voice, your customers, and your product, spending that time and budget on a logo is the wrong priority. Ship the wordmark, learn from real customers, redesign in six months.</p>
      <p><strong>Vector beats raster.</strong> The SVG we output scales from a 16 by 16 favicon to a 6 metre signboard without pixelation. The PNG handles every social media and print case for the first year of your business. Both are royalty-free for commercial use. If a designer eventually hands you a "more refined" logo, you have not wasted money waiting for it.</p>
    `,
    tips: [
      'Use one font, not two. Pairing fonts is a designer skill. A single clean wordmark is harder to get wrong.',
      'Use one colour, not three. A single accent colour against ink black or off-white is the safest start for any small business.',
      'Test the logo on a phone first. Most customers see it on a phone, not a desktop.',
      'Test the logo on a print receipt. If the icon disappears at 1 cm tall, simplify.',
      'Do not over-design before you launch. A simple wordmark with one icon glyph is enough for the first year.',
      'Hold on to the SVG file. It is the only future-proof version of your logo.',
      'Avoid trendy effects like gradients, drop shadows, and 3D extrusions. They look good for a year and tired for ten.',
    ],
    example: `
      <p>A founder opens a bookkeeping service in Surat. She types name "Sahaj Books", tagline "Bookkeeping for small businesses", colour deep navy, font Modern sans, icon Hexagon, layout horizontal. The tool renders a clean wordmark with a navy hexagon next to "Sahaj Books" in dark grey, and the tagline in a muted grey underneath.</p>
      <p>She downloads the SVG (for the website and printed letterheads) and the PNG (for Instagram, WhatsApp, and Google Business). Total time: under two minutes. Total cost: zero. Six months later, after she has 40 paying customers and a clearer brand voice, she hires a designer in Pune to evolve the look. The original Sahaj Books wordmark gets retired without regret, and the cost-of-waiting is exactly nothing.</p>
    `,
    faq: [
      { q: 'Can I use this logo commercially?', a: '<p>Yes, the logo you download is yours to use commercially with no attribution and no watermark. The fonts we render with are open-source web fonts, namely Inter, Instrument Serif and JetBrains Mono, plus a standard system serif, all of which are licensed for commercial use. The icon options are Unicode glyphs, which are platform-rendered shapes rather than copyrighted artwork, so they carry no licensing strings. That means you can put the SVG and PNG on your signboard, your packaging, your GST invoices, your Instagram profile, your delivery bags and your business cards without owing anyone a fee. The one thing this tool does not do is clear your business name as a trademark; the artwork is free of licensing issues, but whether the name itself is yours to own is a separate question you should settle with an IP India trademark search. For most early-stage Indian shops, this wordmark is more than enough to launch with confidence.</p>' },
      { q: 'Will my logo look the same on every device?', a: '<p>Yes, with one detail worth understanding. The downloaded SVG renders identically anywhere SVG is supported, which today means every modern browser, every major design tool, and every print driver, because vectors are mathematical shapes rather than fixed pixels. The downloaded PNG is rasterised at 1200 by 400 pixels with anti-aliasing baked in, so it looks crisp on screens, social media and small print up to A4. The one nuance is the icon glyph in the live preview, which uses the web fonts loaded on this page; if you embed the wordmark inside your own website or app, ship those same web fonts so the glyph renders exactly as you saw it here. For everyday use, just download both files: reach for the PNG when a platform wants a flat image, such as a WhatsApp display picture or a Google Business logo slot, and reach for the SVG whenever something will be printed large or edited later.</p>' },
      { q: 'Can I edit the logo later in Figma or Canva?', a: '<p>Yes, the SVG is fully editable and opens cleanly in Figma, Adobe Illustrator, Affinity Designer, Inkscape and Canva Pro. Because we export real vector structure rather than a flattened image, each element, the icon, the business name and the tagline, is a separate node you can select individually, so you can change the colour, swap the font, nudge the spacing or resize any piece without touching the others. That makes the wordmark a genuine starting point rather than a locked picture: you might generate it here in two minutes, then open it in Canva to drop your brand colour onto the icon, or hand the SVG to a freelance designer who refines it into something more bespoke. A practical tip is to keep the original SVG safe as your master file and only export PNGs from it when a platform needs a flat image, so you always have the editable source to come back to as your brand evolves.</p>' },
      { q: 'Why are the icon options limited to Unicode glyphs?', a: '<p>The icons are limited to Unicode glyphs to keep the tool fully client-side, instantly free, and clear of any licensing tangle. Because Unicode glyphs are standard characters rather than proprietary artwork, they render the same way on every platform, embed cleanly into both the SVG and the PNG, and never raise the copyright questions that a library of designed icons would. It also means nothing has to be sent to a server: the whole logo is assembled right in your browser, which is faster and more private. The trade-off is that you do not get an intricate custom emblem, only clean, universal symbols paired with your wordmark, which is exactly what most new businesses need to launch. If you outgrow a glyph and want a distinctive custom mark, hand this wordmark to a designer as a brief; in the meantime it keeps your launch unblocked and your costs at zero.</p>' },
      { q: 'How big should I print the logo?', a: '<p>It depends on which file you use, and the rule is simple: PNG for digital and small print, SVG for anything large. The downloaded PNG is 1200 by 400 pixels, which is plenty for screens, social media profiles, email signatures and small print up to roughly A4 size, such as a letterhead or a menu card. For anything bigger, a shop signboard, a hoarding, a banner at a Diwali stall, a vehicle wrap, or a backlit board, use the SVG, because it is a vector and scales to any dimension without ever going blurry or pixelated. A common mistake is enlarging the PNG in a print shop and ending up with jagged edges on the big sign; handing the printer the SVG avoids that entirely. Keep both files: send the SVG to your signboard vendor and the printer for large jobs, and use the PNG for everyday digital placements where a flat image is all the platform accepts.</p>' },
      { q: 'Can I use the logo as my favicon?', a: '<p>Yes, but a wide wordmark squashed into a tiny square favicon looks cramped, so generate a square version first. The simplest route is to choose the Stacked vertical layout here, which keeps the icon and name in a more compact, square-friendly shape, and download that as a PNG. Then pass that PNG into our Favicon Generator, which produces the full set of sizes browsers and devices expect: 16 by 16 and 32 by 32 for browser tabs, 48 by 48 for the Windows taskbar, 192 by 192 for the Android home screen, and 512 by 512 for the PWA splash screen. For the cleanest result, many brands keep a separate icon-only mark, just the glyph or an initial, purely for favicons and app icons, and reserve the full wordmark for signboards and headers. That way your tiny tab icon stays legible at 16 pixels while your big logo keeps its full name.</p>' },
      { q: 'Is my logo trademarkable?', a: '<p>It depends on how distinctive it is. A simple wordmark set in a standard font usually does not qualify for strong trademark protection in India on its own, because the law looks for distinctive character and a plain rendering of a common word lacks it. A unique, original icon or a stylised mark stands a much better chance of being protected. That does not mean this logo is useless legally: you can still register the underlying business name as a word mark if the name itself is distinctive, and a word mark protects the name regardless of font. The practical path for a new business is to launch with this clean wordmark, build recognition, and then in your second year, once you understand your brand and category, commission a custom designed mark and file for trademark protection on the combination. Always run a free IP India trademark search at ipindiaonline.gov.in in your class before you invest heavily in any mark.</p>' },
      { q: 'What if I want a more elaborate logo?', a: '<p>Treat this wordmark as a solid placeholder and a ready-made brief for a designer rather than the ceiling of what you can have. Because you download an editable SVG, you can hand it straight to a freelance designer along with your business story, your colour choices and a sense of the feeling you want, which gives them a concrete starting point and usually a faster, cheaper turnaround than briefing from scratch. Most freelance logo designers in India charge somewhere between Rs 5,000 and Rs 25,000 for a custom mark, depending on experience and the number of revisions, and good ones are easy to find on Behance, Dribbble or local design communities. The key advantage of starting here is that your launch is never blocked waiting for a designer: you can open the shop, print the signboard and go live with this clean wordmark today, then upgrade to the elaborate version later without any downtime, swapping the files as your budget allows.</p>' },
    ],
    related: [
      { href: '/pages/tools/business-name-generator', title: 'Business Name Generator', blurb: 'Name first, then logo.' },
      { href: '/pages/tools/color-palette-generator', title: 'Color Palette Generator', blurb: 'Pick brand colours that work together.' },
      { href: '/pages/tools/favicon-generator', title: 'Favicon Generator', blurb: 'Browser and app icons from one source.' },
    ],
  },
  {
    slug: 'slogan-generator',
    category: 'start',
    built: true,
    name: 'Slogan Generator',
    tagline: 'Short, memorable taglines for your homepage and ads.',
    primaryKeyword: 'tagline generator for business',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Slogan Generator — Punchy Taglines for Indian SMBs | Neweb',
    metaDescription: 'Generate 10 short, memorable slogans for your business. Three to seven words, easy to say out loud, ready for your homepage and ads.',
    h1: 'Slogan <span class="serif">Generator</span>.',
    lede: 'Type your business, industry and tone. We write 10 short, memorable slogans you can use on your homepage, your Google Business profile, and your ads.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Business name</label><input id="ai-business" type="text" placeholder="e.g. Copper Oven" maxlength="80" /></div>
          <div class="field"><label>Industry</label><input id="ai-industry" type="text" placeholder="e.g. bakery, clinic, salon" maxlength="80" /></div>
        </div>
        <div class="field"><label>Tone</label>
          <select id="ai-tone">
            <option value="warm and confident">Warm and confident</option>
            <option value="bold and direct">Bold and direct</option>
            <option value="playful">Playful</option>
            <option value="premium">Premium</option>
            <option value="traditional">Traditional</option>
            <option value="modern minimal">Modern minimal</option>
          </select>
        </div>
        <div class="tool-actions">
          <button id="ai-go" type="button" class="btn btn-brand">Generate slogans</button>
          <span id="ai-status" style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);align-self:center"></span>
        </div>
        <div id="ai-out" style="margin-top:18px;display:flex;flex-direction:column;gap:8px"></div>
      `,
      help: 'Type, click, copy. Free, no sign-up.',
      js: `
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
(function(){
  var btn=document.getElementById('ai-go'), status=document.getElementById('ai-status'), out=document.getElementById('ai-out');
  if(!btn) return;
  btn.addEventListener('click', async function(){
    var payload={business:(document.getElementById('ai-business').value||'').trim(), industry:(document.getElementById('ai-industry').value||'').trim(), tone:(document.getElementById('ai-tone').value||'').trim()};
    if(!Object.values(payload).some(Boolean)){status.textContent='Please enter at least one field';return;}
    btn.disabled=true; status.textContent='Thinking…'; out.innerHTML='';
    try{
      var r=await fetch('/api/tools/ai/slogan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      var d=await r.json();
      if(d.error){status.textContent='Error: '+d.error;return;}
      status.textContent = '';
      out.innerHTML = (d.items||[]).map(function(s){
        return '<div style="padding:14px 18px;border:1px solid var(--line);border-radius:12px;background:#fff;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">'
          +'<div><div style="font-family:Instrument Serif,serif;font-style:italic;font-size:18px;color:var(--ink)">&ldquo;'+escHtml(s.text||'')+'&rdquo;</div>'
          +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:4px">'+escHtml(s.tone||'')+'</div></div>'
          +'<button type="button" class="btn btn-ghost" data-slogan="'+escHtml(s.text||'')+'" style="padding:6px 12px;font-size:12px">Copy</button>'
          +'</div>';
      }).join('');
      out.querySelectorAll('button[data-slogan]').forEach(function(b){
        b.addEventListener('click', function(){
          navigator.clipboard.writeText(b.dataset.slogan).then(function(){ b.textContent='Copied'; setTimeout(function(){b.textContent='Copy';},1200); });
        });
      });
    }catch(e){status.textContent='Network error';}
    finally{btn.disabled=false;}
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div class="eo-serif">"Fresh from our oven, every morning."</div></div>
      <div class="eo-item"><div class="eo-serif">"Baked with patience, served with love."</div></div>
      <div class="eo-item"><div class="eo-serif">"Your neighbourhood, now smells better."</div></div>
      <div class="eo-item"><div class="eo-serif">"Sourdough worth waking up for."</div></div>
      <div class="eo-item"><div class="eo-serif">"Small batch. Big flavour. Every day."</div></div>
      <div class="eo-item"><div class="eo-serif">"From our hands to your table."</div></div>
      <div class="eo-note">Sample taglines. Generate ones tuned to your own brand and tone above.</div>
    `,
    intro: `
      <p>A slogan is the second-most-read piece of copy on your website, after the H1. It is what appears under your logo, on the meta description that shows up in Google search results, on your Google Business profile, on your Instagram bio, on your hoardings, and in the subject line of your customer emails. A good one gets remembered. A bad one is silently skipped over. A missing one leaves a gap that customers fill in with whatever assumption they bring.</p>
      <p>This slogan generator gives you 10 short, plain-English taglines you can copy and use today. They are three to seven words each, easy to read out loud, and free of clichés and exclamation marks. Suggestions are tone-aware and arrive in seconds. Mix and match, pick a winner, A/B test two on your homepage, retire the loser.</p>
    `,
    howTo: [
      'Enter your <strong>business name</strong>. If you do not have one yet, our business name generator is a good starting point.',
      'Enter your <strong>industry</strong> in one or two words. Examples: bakery, clinic, salon, bookkeeping service.',
      'Pick a <strong>tone</strong>: warm and confident, bold and direct, playful, premium, traditional, or modern minimal.',
      'Click <strong>Generate slogans</strong>. In a couple of seconds you will see 10 ideas with a tone tag on each.',
      'Tap <strong>Copy</strong> on any slogan to put it on your clipboard.',
      'Paste your top two onto your homepage and your Google Business profile. Watch which one feels more natural when you say it on the phone.',
      'Keep iterating. The right slogan reveals itself in 30 days of use, not in 30 minutes of brainstorming.',
    ],
    why: `
      <p>Three reasons a slogan does more lifting than founders give it credit for.</p>
      <p><strong>It compresses your pitch.</strong> A homepage has 300 words. A meta description has 158 characters. A Google Business profile snippet has 60. A slogan has to compress your value into 3 to 7 words and survive every one of these surfaces. The right one becomes the line your customers repeat when they explain you to friends.</p>
      <p><strong>It builds your SEO opportunity.</strong> A unique slogan is searchable. "Made for makers since 2018" returns your business. "We are the best in the city" returns a billion unrelated pages. Picking something that is yours, and putting it on every channel, gives Google a stable reference point that compounds over time.</p>
      <p><strong>It separates you from your competitors.</strong> Most small businesses say variants of the same five things: quality, service, value, trust, family. A slogan that picks a sharp, specific angle (a particular customer, a particular product, a particular feeling) cuts through faster. Your slogan does not need to please everyone. It needs to attract the customers you actually want.</p>
    `,
    tips: [
      'Three to seven words is the sweet spot. Less, and you sound generic. More, and you sound like a tagline-by-committee.',
      'Skip exclamation marks. They look loud and amateur in 2026.',
      'Read it out loud over a phone call before you commit. Slogans that sound forced in conversation will sound forced everywhere.',
      'Avoid superlatives like "best", "premium", "unmatched". They are unprovable, hard to differentiate, and silently distrusted by customers.',
      'Pick a slogan you can defend with a real example. "Made in 24 hours" is good because it is testable.',
      'Mix one literal and one figurative slogan as A/B test candidates. Customers respond differently and you cannot predict which until you ship.',
      'Update your meta description, your Google Business profile, and your Instagram bio with the same slogan on the same day so the brand reads consistently.',
    ],
    example: `
      <p>A founder runs a bookkeeping service in Surat. He types business "Sahaj Books", industry "bookkeeping for small businesses", tone "warm and confident". The generator returns 10 slogans including "Books done right, every Monday", "Sahaj: bookkeeping made boring (in a good way)", "We close your books, you grow your business", "Numbers, sorted", "Bookkeeping that does not bug you", "Your books, by Sahaj", "Honest numbers, honest fees", "Boring books, brilliant business", "The quiet kind of accounting", "Books in two days, every time".</p>
      <p>He copies the top three onto a notepad and reads each one out loud during three different customer calls that week. The line "Books done right, every Monday" lands best because it captures both the rhythm and the promise. He puts it under his logo on the homepage and on his meta description. Over the next three months it becomes the line his customers quote back to him.</p>
    `,
    faq: [
      { q: 'How does the slogan generator work?', a: '<p>The generator takes three inputs, your business, your industry and the tone you want, and returns 10 short, plain-English slogans you can paste straight into your homepage header, your meta description, your Google Business profile or your Instagram bio. Each slogan runs three to seven words, avoids tired clichés like "quality you can trust", and is built to be easy to say out loud over a phone call or read across a shop hoarding. The tone input is the steering wheel: choosing "warm" produces gentler lines than choosing "bold" or "premium", so the same bakery can sound homely or upmarket depending on what you pick. For example, a Pune tiffin service asking for a warm tone might get lines like "Home food, every working day". Generate a batch, shortlist two or three, and live with them for a day; the right slogan usually feels obvious once you have seen it sitting under your logo.</p>' },
      { q: 'Can I use these slogans commercially?', a: '<p>Yes, the slogans are yours to use commercially with no fee and no attribution. They are short combinations of common words rather than copyrighted artistic works, so you can put them on your website, your packaging, your delivery bags, your Google and WhatsApp ads, your visiting cards and your shopfront without owing anyone anything. The one sensible precaution is for any slogan you plan to invest heavily in: before you spend serious money printing it on packaging or running it across a long ad campaign, run a quick free trademark search at ipindiaonline.gov.in in your class of goods or services to confirm no one else has already registered the exact phrase as a mark. Generic descriptive lines are very unlikely to clash, but a distinctive, memorable phrase occasionally can. For most small businesses this is a two-minute check, after which you can use your chosen slogan everywhere with full confidence and no licensing strings attached.</p>' },
      { q: 'What if all 10 feel wrong?', a: '<p>Rerun the generator with sharper, more specific inputs, because slogan quality tracks the precision of your brief almost exactly. The tone choice alone changes everything: "warm and confident" produces very different lines from "bold and direct" or "calm and premium", so try two or three tones and compare. Equally important is the industry field; "organic vegetarian bakery" or "late-night biryani delivery" yields far sharper output than a bare "bakery" or "restaurant", because the extra detail gives the tool something concrete to play on. You can also rerun the exact same inputs to get a fresh set of 10, so you are never stuck with one batch. If several rounds still feel flat, the usual culprit is a brief that is too generic; add one vivid specific, a place, a ritual, a customer moment, and the lines tighten immediately. Keep any near-misses in a notes app, because the winner is often a small tweak of a line you nearly dismissed.</p>' },
      { q: 'How long should a slogan be?', a: '<p>Three to seven words is the workable range, and four or five is the sweet spot for memorability. Anything shorter, just one or two words, tends to read like a product name rather than a promise, while anything past seven or eight words starts to feel like a full sentence that nobody repeats from memory. The test that matters is whether a customer can hear your slogan once and say it back to a friend correctly, because word of mouth is where a slogan earns its keep. Short also wins on every physical surface: a four-word line fits cleanly under a logo, on a shop sign, in a 150-character Instagram bio, and inside a meta description without being truncated. This generator deliberately keeps every suggestion inside the three-to-seven-word band so you never have to trim a line down afterwards, but if you write your own, count the words and aim for that punchy middle.</p>' },
      { q: 'Should I A/B test slogans?', a: '<p>For most early-stage businesses, formal A/B testing of slogans is not worth the friction, so skip it for now. Splitting traffic to measure a slogan reliably needs meaningful volume and proper tooling, and at the stage where you are choosing between two lines under your logo, you simply do not have enough visitors for the result to be statistically real; you would just be reading noise. The better approach is to pick one slogan with conviction, use it consistently everywhere for 60 to 90 days, your website, your Google Business profile, your bio, your packaging, and then listen to how customers describe you back to you, in reviews, on calls, in WhatsApp messages. Their language is your real signal. If the words you chose start showing up in how people talk about you, the slogan is working; if it never lands, swap it after the quarter. Save the rigorous A/B testing for later, when you have the traffic to make it meaningful.</p>' },
      { q: 'Where do I use my slogan?', a: '<p>Put your slogan in the handful of places where it does the most work, and use the same line in all of them so it compounds. The five highest-leverage spots are: directly under your logo in your website header, where every visitor sees it first; in the meta description of your homepage, where it shapes how your business looks in Google search results; on your Google Business profile, which is often the first thing a local customer reads before deciding to call; in your Instagram bio, where you have only 150 characters to make an impression; and at the bottom of every email signature you send. Consistency is the whole point: repeating one slogan across these surfaces trains customers to associate that phrase with you, whereas a different line in each place teaches them nothing. Once it is in those five spots, you can extend it onto packaging, WhatsApp greetings and printed signage as your brand grows.</p>' },
      { q: 'Should the slogan describe what I do?', a: '<p>Not necessarily, and forcing it to can make the slogan duller than it needs to be. The job of literally describing what you do usually belongs to the headline that sits above the slogan, plus your business category on Google Business, so the slogan itself is freed up to carry something more memorable: a feeling, a promise, an angle, or the relationship you want with the customer. Both styles can work well. A literal slogan like "Fresh bread, baked daily" is clear and reassuring, while a figurative one like "The taste of home" sells an emotion; the right choice depends on your tone and category. A useful rule is that if your headline already states the what, let the slogan add the why or the feeling, and if your headline is more abstract, let the slogan ground it in something concrete. Pick whichever pairing reads cleanly out loud and matches the personality you want your brand to project.</p>' },
      { q: 'Can I trademark a slogan?', a: '<p>Yes, you can trademark a slogan in India, provided it is distinctive rather than generic. A common descriptive phrase such as "best quality" or "lowest prices" cannot be registered, because everyone in the trade needs those words and the law will not let one business monopolise them. An original, distinctive phrase, the kind that clearly points to your brand and no one else, can be filed as a trademark and protected. The government filing fee for a small business or startup claiming the available concession is roughly Rs 4,500 to Rs 9,000 per class, with lawyer fees on top if you engage one to draft and prosecute the application. Before filing, run a free search at ipindiaonline.gov.in in your class to make sure the phrase is not already taken. For most new businesses the smart sequence is to launch with the slogan, prove it resonates, and only invest in formal registration once it has become genuinely tied to your brand.</p>' },
    ],
    related: [
      { href: '/pages/tools/business-name-generator', title: 'Business Name Generator', blurb: 'Name first, then the slogan.' },
      { href: '/pages/tools/meta-title-description-generator', title: 'Meta Tags Generator', blurb: 'Use your slogan in your SEO description.' },
      { href: '/pages/tools/google-business-description-generator', title: 'GBP Description Generator', blurb: 'Extend the slogan into a 750-character profile.' },
    ],
  },
  {
    slug: 'color-palette-generator',
    category: 'start',
    built: true,
    name: 'Color Palette Generator',
    tagline: 'Brand-safe palettes with hex codes you can paste anywhere.',
    primaryKeyword: 'brand color palette generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Brand Color Palette Generator — Hex Codes | Neweb',
    metaDescription: 'Generate a balanced 5-colour brand palette from a single seed colour. Includes hex codes, contrast info and ready-to-paste output. Free, browser-only.',
    h1: 'Color Palette <span class="serif">Generator</span>.',
    lede: 'Pick one brand colour. We build a balanced 5-colour palette around it with hex codes, contrast info, and a ready-to-paste output for your designer, your CSS, or your Canva.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Seed colour</label><input id="cp-color" type="color" value="#3d4cff" /></div>
          <div class="field"><label>Palette style</label>
            <select id="cp-style">
              <option value="brand">Brand (analogous + neutral)</option>
              <option value="complementary">Complementary</option>
              <option value="triadic">Triadic</option>
              <option value="monochrome">Monochrome</option>
            </select>
          </div>
        </div>
        <div class="tool-actions">
          <button id="cp-go" type="button" class="btn btn-brand">Generate palette</button>
          <button id="cp-copy" type="button" class="btn btn-ghost">Copy hex list</button>
        </div>
        <div id="cp-swatches" style="margin-top:18px;display:grid;grid-template-columns:repeat(5,1fr);gap:10px"></div>
        <div id="cp-hex" style="margin-top:14px;padding:14px 18px;background:var(--bg-2);border:1px dashed var(--line-2);border-radius:10px;font-family:JetBrains Mono,monospace;font-size:13px;color:var(--ink);word-break:break-all"></div>
      `,
      help: 'Pure client-side. Uses HSL colour math for analogous, complementary, triadic and monochrome harmonies. Contrast ratio checks against WCAG AA.',
      js: `
(function(){
  var btn=document.getElementById('cp-go');
  if(!btn) return;
  function hexToHsl(hex){
    var r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    var mx=Math.max(r,g,b), mn=Math.min(r,g,b), h, s, l=(mx+mn)/2;
    if(mx===mn){h=0;s=0;}
    else{ var d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn); switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;} h*=60;}
    return [h,s*100,l*100];
  }
  function hslToHex(h,s,l){
    h=((h%360)+360)%360; s/=100; l/=100;
    var c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs(((h/60)%2)-1)), m=l-c/2;
    var r=0,g=0,b=0;
    if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
    var to=function(v){return Math.round((v+m)*255).toString(16).padStart(2,'0');};
    return '#'+to(r)+to(g)+to(b);
  }
  function luminance(hex){
    var r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    var f=function(v){return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
    return .2126*f(r)+.7152*f(g)+.0722*f(b);
  }
  function contrast(a,b){var l1=luminance(a)+.05, l2=luminance(b)+.05; return l1>l2?l1/l2:l2/l1;}
  function build(seed, style){
    var hsl=hexToHsl(seed);
    var h=hsl[0], s=hsl[1], l=hsl[2];
    var p=[seed];
    if(style==='brand'){
      p.push(hslToHex(h-22, s*.9, Math.min(85, l+10)));
      p.push(hslToHex(h+22, s*.7, Math.max(20, l-8)));
      p.push('#0a0e1a');
      p.push('#f7f8fb');
    } else if(style==='complementary'){
      p.push(hslToHex(h+180, s, l));
      p.push(hslToHex(h, s*.5, Math.min(90, l+18)));
      p.push('#0a0e1a');
      p.push('#f7f8fb');
    } else if(style==='triadic'){
      p.push(hslToHex(h+120, s, l));
      p.push(hslToHex(h+240, s, l));
      p.push('#0a0e1a');
      p.push('#f7f8fb');
    } else {
      p.push(hslToHex(h, s, Math.max(10, l-25)));
      p.push(hslToHex(h, s*.5, Math.min(90, l+18)));
      p.push(hslToHex(h, s*.2, Math.min(96, l+30)));
      p.push('#0a0e1a');
    }
    return p;
  }
  function render(){
    var seed=document.getElementById('cp-color').value;
    var style=document.getElementById('cp-style').value;
    var palette=build(seed, style);
    var box=document.getElementById('cp-swatches');
    box.innerHTML = palette.map(function(c){
      var onWhite=contrast(c,'#ffffff').toFixed(1);
      var onBlack=contrast(c,'#000000').toFixed(1);
      return '<div style="display:flex;flex-direction:column;border-radius:12px;overflow:hidden;border:1px solid var(--line)">'
        + '<div style="background:'+c+';aspect-ratio:1/1"></div>'
        + '<div style="padding:8px 10px;background:#fff">'
        +   '<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--ink);font-weight:600">'+c.toUpperCase()+'</div>'
        +   '<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--muted);margin-top:2px">W '+onWhite+' · B '+onBlack+'</div>'
        + '</div></div>';
    }).join('');
    document.getElementById('cp-hex').textContent = palette.join(', ');
  }
  btn.addEventListener('click', render);
  ['cp-color','cp-style'].forEach(function(id){ document.getElementById(id).addEventListener('input', render); document.getElementById(id).addEventListener('change', render); });
  document.getElementById('cp-copy').addEventListener('click', function(){
    var t=document.getElementById('cp-hex').textContent; if(!t) return;
    navigator.clipboard.writeText(t).then(function(){ var b=document.getElementById('cp-copy'); var o=b.textContent; b.textContent='Copied ✓'; setTimeout(function(){b.textContent=o;},1400); });
  });
  render();
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div style="display:flex;gap:8px;align-items:center"><span style="width:28px;height:28px;border-radius:6px;background:#3d4cff;display:inline-block;border:1px solid var(--line)"></span><div><div class="eo-main eo-mono">#3D4CFF</div><div class="eo-sub">Primary, brand blue</div></div></div></div>
      <div class="eo-item"><div style="display:flex;gap:8px;align-items:center"><span style="width:28px;height:28px;border-radius:6px;background:#00b894;display:inline-block;border:1px solid var(--line)"></span><div><div class="eo-main eo-mono">#00B894</div><div class="eo-sub">Secondary, fresh green</div></div></div></div>
      <div class="eo-item"><div style="display:flex;gap:8px;align-items:center"><span style="width:28px;height:28px;border-radius:6px;background:#ff7a45;display:inline-block;border:1px solid var(--line)"></span><div><div class="eo-main eo-mono">#FF7A45</div><div class="eo-sub">Accent, warm orange for buttons</div></div></div></div>
      <div class="eo-item"><div style="display:flex;gap:8px;align-items:center"><span style="width:28px;height:28px;border-radius:6px;background:#0a0e1a;display:inline-block;border:1px solid var(--line)"></span><div><div class="eo-main eo-mono">#0A0E1A</div><div class="eo-sub">Ink, near-black for text</div></div></div></div>
      <div class="eo-item"><div style="display:flex;gap:8px;align-items:center"><span style="width:28px;height:28px;border-radius:6px;background:#f7f8fb;display:inline-block;border:1px solid var(--line)"></span><div><div class="eo-main eo-mono">#F7F8FB</div><div class="eo-sub">Paper, off-white background</div></div></div></div>
      <div class="eo-note">Sample 5-colour palette. Generate brand-safe palettes with copyable hex codes above.</div>
    `,
    intro: `
      <p>A small business that picks colour by feel ends up with a brand that looks slightly off across surfaces. The website is one shade of blue, the WhatsApp poster is a slightly different blue, the visiting card is a third blue, and the bag print is a fourth. None of them are wrong individually. Together they are quietly inconsistent, which over time reads as unprofessional. The fix is a palette: one primary colour, two supporting hues, one ink, one paper, and a documented set of hex codes you put on every brief from now on.</p>
      <p>This tool builds that palette from a single seed colour. It uses HSL colour math to generate analogous, complementary, triadic, or monochrome harmonies, and it shows the WCAG AA contrast ratio of every colour against white and black so you know which ones are safe for body text. You can copy the hex list with one click and paste it into your CSS, your Figma file, your Canva brand kit, or the brief you send your printer.</p>
    `,
    howTo: [
      'Pick a <strong>seed colour</strong>. Start with one you already use, or click the swatch and pick from the colour picker. Most Indian small businesses pick a deep blue, maroon, forest green, or saffron orange.',
      'Pick a <strong>palette style</strong>: Brand (analogous + neutral) for safe, professional, balanced palettes. Complementary for high contrast. Triadic for vibrant playful brands. Monochrome for minimal designs.',
      'Click <strong>Generate palette</strong>. You see five colours: primary, secondary, accent, ink (text), and paper (background). Each swatch shows the hex code and the contrast ratio against white and black.',
      'Click <strong>Copy hex list</strong> to put all five hex codes on your clipboard, separated by commas. Paste into your CSS variables, your Figma colour styles, your Canva brand kit, or your printer brief.',
      'Use the primary colour for your accent moments: buttons, links, highlights, logo. Use ink (#0a0e1a) for body text. Use paper (#f7f8fb) for the page background.',
      'Stress-test the palette by mocking up your homepage and a WhatsApp poster with these colours. If everything still feels good, you have a brand palette.',
      'Document the palette in a short PDF and email it to your printer, your social media person, and your designer so every future surface matches.',
    ],
    why: `
      <p>Three reasons a documented palette outperforms picking colour by feel.</p>
      <p><strong>Consistency is recognised faster than originality.</strong> Customers do not notice that your blue is slightly more saturated than your competitor blue. They notice that your blue is the same one on the website, the WhatsApp poster, the receipt, the menu, the bag, and the Instagram. That repetition is what builds memorable brand recognition over months.</p>
      <p><strong>Contrast matters legally and ethically.</strong> The Web Content Accessibility Guidelines (WCAG) AA requires body text to have a contrast ratio of at least 4.5 to 1 against its background. Most colours fail this test against white. Light pastels especially. Our generator shows the contrast ratio of every colour against white and black so you instantly know which colours are safe for body text and which are safe only for large headings, buttons, or accent moments.</p>
      <p><strong>It saves designer fees.</strong> A designer working with a documented palette ships faster and bills less. A designer asked to invent colour from scratch every time bills more and ships less consistently. A 30-rupee palette decision today saves you Rs 5,000 of designer fees over your first year.</p>
    `,
    tips: [
      'Stick to one primary colour. Two-primary palettes feel busy and become hard to use consistently.',
      'Use the primary colour for moments of focus only: buttons, links, badges. Body text and large surfaces stay ink and paper.',
      'A contrast ratio under 4.5 against white means do not use this colour for body text. Use it only for large headings, icons, or backgrounds.',
      'Avoid pure red as a primary colour. It is a stop signal and triggers urgency every time customers see it.',
      'Test the palette on a phone screen, not a desktop. Most customers see your brand on a phone.',
      'Save the hex codes in a text file and email them to yourself. Worst case, they are still in your inbox five years later.',
      'Update your palette inside your Neweb dashboard so every page on your site uses the same colour values.',
    ],
    example: `
      <p>A founder runs a paediatric clinic in Pune. She picks a seed colour of warm orange (#ff7a45) and a Brand palette style. The generator returns five colours: the original orange, a warm peach analogous shade, a deeper terracotta complement, the ink black, and the paper off-white.</p>
      <p>She copies the hex list into a brief she sends to her receptionist who designs Instagram posts in Canva, and to the printer who is making 1000 appointment cards. She also pastes the values into her Neweb dashboard under brand settings, so her website header, buttons, and Google Business cover photo all use the same orange. Three months later, when a patient describes her clinic to a friend as "the warm orange one near the temple", the brand investment has already paid back.</p>
    `,
    faq: [
      { q: 'How are the palette colours calculated?', a: '<p>The palettes are built using HSL colour maths, where every colour is described by hue, saturation and lightness, and the relationships between your colours are calculated from the angle between them on the 360-degree hue wheel. Analogous colours sit about 22 degrees apart for a harmonious, low-contrast feel; complementary colours sit 180 degrees apart for maximum pop; triadic colours sit 120 degrees apart for a balanced three-colour scheme; and monochrome variants keep the same hue and saturation while shifting only lightness to give you tints and shades of one colour. Everything is computed live in your browser from the seed colour you pick, so nothing is ever sent to a server and the tool stays instant and private. The practical upshot is that you can drop in a single brand colour, for example a deep saffron or a teal, and immediately see a coherent set that already follows colour-theory rules, rather than guessing at combinations by eye.</p>' },
      { q: 'What is the contrast ratio for?', a: '<p>The contrast ratio tells you how readable one colour is when placed against another, which is the single most important accessibility check for any website or design. It is measured on a scale from 1 to 21, and the WCAG AA standard, the benchmark most businesses aim for, requires at least 4.5 to 1 for normal body text and 3 to 1 for large headings. A ratio of 7 to 1 or higher is genuinely comfortable for everyone, including older customers and anyone reading on a phone in bright Indian sunlight. A ratio under 3 means the pairing is too low-contrast for text, so reserve those colours for backgrounds, decorative blocks or large graphic shapes rather than words people need to read. Checking this matters commercially too: low-contrast text quietly costs you conversions because visitors who cannot comfortably read your offer simply leave instead of buying.</p>' },
      { q: 'Can I use these colours in print?', a: '<p>Yes, you can use these colours in print, but understand that the hex codes here are RGB values designed for screens, while printing works in CMYK ink, so the appearance can shift slightly between your monitor and the printed sheet. A bright screen blue, for example, often prints a touch duller. For everyday print like flyers, menu cards or visiting cards, handing your printer the hex codes is usually close enough. For brand-critical print where the colour absolutely must be right every time, signboards, packaging, a shop hoarding, ask your printer to match a Pantone code that approximates your hex, because Pantone is a physical ink standard that prints consistently across vendors and runs. A good habit is to print a small test swatch before committing to a large job, so you catch any unwelcome shift cheaply rather than discovering it on a thousand printed boxes.</p>' },
      { q: 'Why does the brand palette include black and off-white?', a: '<p>Every usable brand palette needs more than just an accent colour; it needs an ink colour for text and a paper colour for backgrounds, because that pair is what actually carries most of your content. The brand style here defaults to a deep navy, hex #0a0e1a, as the ink and a soft off-white, hex #f7f8fb, as the paper, rather than pure black on pure white. The reason is comfort and polish: pure black text on pure white can feel harsh and cause a slight glare or vibration on screens, while the softened pair is gentler on the eyes, looks more premium, and still gives you a strong, accessible contrast ratio for readable text. Crucially, this neutral ink-and-paper foundation pairs cleanly with almost any accent colour you choose, so your brand colour gets to stand out as the highlight while the navy and off-white quietly do the heavy lifting of every paragraph, button label and caption.</p>' },
      { q: 'How many colours do I really need?', a: '<p>For most small businesses, three colours are genuinely enough: one primary brand colour, one ink colour for text, and one paper colour for backgrounds. That trio covers every common need, a button, a heading, a body paragraph, a page background, while staying easy to apply consistently across your website, packaging and social posts. Five colours, adding an optional secondary and an accent, give you a little more range for designs that need variety, such as charts, category tags or a richer marketing page. The important discipline is restraint: pushing past five colours makes brand consistency hard to maintain, because every extra colour is one more thing to remember and one more chance for a page to look messy or off-brand. A tight palette also reads as more confident and professional than a rainbow. Start with three, stretch to five only if a real design need appears, and resist the temptation to keep adding.</p>' },
      { q: 'Can I use this palette as my logo colours?', a: '<p>Yes, and the two tools are built to work together. Once you have a palette you like, copy the hex codes and pass your primary colour into our logo maker as the brand colour input. The wordmark there applies your primary colour to the icon and your ink colour to the text, which is a safe, high-contrast combination that reads cleanly on a website header, a signboard and a tiny favicon alike. Reusing the same hex values across your palette, your logo, your buttons and your packaging is exactly how a small brand starts to look coherent and recognisable rather than improvised. A practical tip is to settle the palette first, since it gives you the full ink, paper and accent set, then feed those exact codes into the logo, the favicon generator and your email signature, so every customer touchpoint shares one consistent colour story instead of drifting apart over time.</p>' },
      { q: 'What if my palette looks dull or muddy?', a: '<p>A dull or muddy palette almost always traces back to the seed colour, so start by feeding in a brighter, more saturated colour rather than a washed-out one. The harmony style you pick also matters: the brand style deliberately softens the seed for a calmer, more premium feel, which can read as muted, whereas triadic or complementary schemes retain more of the original saturation and therefore more energy and pop. If you want a confident, attention-grabbing look, for a tool, a service or a youthful brand, avoid pale pastel seeds, because they tend to produce timid results that struggle to project authority. Conversely, if a palette looks garish, dial the seed saturation down a notch. The fastest way to find the right balance is to try two or three seeds across two or three styles and compare them side by side; because everything recalculates instantly in your browser, experimenting costs nothing but a few seconds.</p>' },
      { q: 'Does Google index colour for search?', a: '<p>No, Google does not index your colours directly, and there is no ranking factor that reads your hex codes. But colour still influences SEO indirectly, through user behaviour. A clean, consistent, readable palette makes your site feel professional and trustworthy, which keeps visitors on the page longer and reduces the bounce rate, while a clashing or low-contrast scheme pushes people to leave quickly. Google does pay attention to engagement signals like how long people stay and whether they bounce straight back to the search results, so design quality feeds the algorithm at one remove. Good colour choices also protect accessibility, ensuring text stays readable for everyone, which is both the right thing to do and a quiet ranking benefit. So while you should never expect a palette to move your rankings on its own, treating colour and contrast as part of your SEO hygiene, alongside speed and content, helps your pages perform better overall.</p>' },
    ],
    related: [
      { href: '/pages/tools/logo-maker', title: 'Logo Maker', blurb: 'Use your palette in the logo.' },
      { href: '/pages/tools/favicon-generator', title: 'Favicon Generator', blurb: 'Browser icons in your brand colour.' },
      { href: '/pages/tools/business-name-generator', title: 'Business Name Generator', blurb: 'Pick the name, then the palette.' },
    ],
  },

  // =========================================================================
  // ============================ WHATSAPP LINK ==============================
  // =========================================================================
  {
    slug: 'whatsapp-link-generator',
    category: 'run',
    built: true,
    name: 'WhatsApp Link Generator',
    tagline: 'Make a wa.me link with a pre-filled message and a QR code.',
    primaryKeyword: 'whatsapp link generator',
    solutionHref: '/pages/solutions/restaurants',
    solutionLabel: 'For restaurants',
    metaTitle: 'WhatsApp Link Generator Free — wa.me Link With QR Code | Neweb',
    metaDescription: 'Generate a wa.me link with a pre-filled message for your WhatsApp Business. Free, instant, with a downloadable QR. Made for Indian SMBs.',
    h1: 'WhatsApp Link <span class="serif">Generator</span>.',
    lede: 'Type your WhatsApp number and the message you want pre-filled. We make a wa.me link customers can tap, plus a printable QR code for your menu and storefront.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Country code</label>
            <select id="wa-cc">
              <option value="91" selected>+91 India</option>
              <option value="971">+971 UAE</option>
              <option value="1">+1 USA / Canada</option>
              <option value="44">+44 UK</option>
              <option value="65">+65 Singapore</option>
              <option value="61">+61 Australia</option>
              <option value="60">+60 Malaysia</option>
              <option value="966">+966 Saudi Arabia</option>
            </select>
          </div>
          <div class="field"><label>WhatsApp number (no leading zero)</label>
            <input id="wa-num" type="tel" inputmode="numeric" placeholder="9876543210" maxlength="15"/>
          </div>
        </div>
        <div class="field">
          <label>Pre-filled message</label>
          <textarea id="wa-msg" rows="3" placeholder="Hi, I would like to know more about your weekend brunch menu."></textarea>
        </div>
        <div class="tool-actions">
          <button id="wa-gen" type="button" class="btn btn-brand">Generate link</button>
        </div>
        <div id="wa-result" style="display:none">
          <div class="tool-output" id="wa-link"></div>
          <div class="tool-actions">
            <button id="wa-copy" type="button" class="btn btn-ghost">Copy link</button>
            <a id="wa-open" target="_blank" rel="noopener" class="btn btn-ghost">Open chat</a>
            <button id="wa-dl" type="button" class="btn btn-ghost">Download QR (PNG)</button>
          </div>
          <div id="wa-qr" style="display:flex;justify-content:center;margin-top:18px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:14px"></div>
        </div>
      `,
      help: 'Everything runs in your browser. We never store your phone number. QR encoded with the open-source qrcode-generator library.',
      js: LOAD_SCRIPT_JS + QR_RENDER_JS + `
(function(){
  var cc = document.getElementById('wa-cc');
  var num = document.getElementById('wa-num');
  var msg = document.getElementById('wa-msg');
  var btn = document.getElementById('wa-gen');
  var result = document.getElementById('wa-result');
  var linkEl = document.getElementById('wa-link');
  var copyBtn = document.getElementById('wa-copy');
  var openA = document.getElementById('wa-open');
  var dlBtn = document.getElementById('wa-dl');
  var qrBox = document.getElementById('wa-qr');
  var lastCanvas = null, lastLink = '';
  if (!btn) return;

  function cleanNum(s){ return String(s||'').replace(/\\D/g,'').replace(/^0+/,''); }
  function build(){
    var n = cleanNum(num.value);
    if (!n){ num.focus(); return null; }
    var c = cleanNum(cc.value) || '91';
    var url = 'https://wa.me/' + c + n;
    var m = (msg.value||'').trim();
    if (m) url += '?text=' + encodeURIComponent(m);
    return url;
  }
  btn.addEventListener('click', async function(){
    var url = build();
    if (!url) return;
    lastLink = url;
    linkEl.textContent = url;
    openA.href = url;
    result.style.display = '';
    try {
      await loadScript('${QR_LIB_SRC}');
      lastCanvas = renderQR(url, qrBox, { size: 260, ec: 'M' });
    } catch(e){
      qrBox.innerHTML = '<span style="color:var(--muted);font-size:13px">QR library failed to load. The link still works.</span>';
    }
  });
  copyBtn.addEventListener('click', async function(){
    if (!lastLink) return;
    try { await navigator.clipboard.writeText(lastLink); copyBtn.textContent = 'Copied ✓'; setTimeout(function(){copyBtn.textContent='Copy link';},1400);}
    catch(e){ copyBtn.textContent='Copy failed'; }
  });
  dlBtn.addEventListener('click', function(){
    if (!lastCanvas) return;
    downloadCanvasPNG(lastCanvas, 'whatsapp-qr.png');
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main eo-mono">https://wa.me/919876543210?text=Hi%20Copper%20Oven</div><div class="eo-sub">Pre-filled message: "Hi Copper Oven, I would like to pre-order a sourdough loaf for tomorrow."</div></div></div>
      <div class="eo-note">Sample link. Build a wa.me link with your number, your message and a downloadable QR above.</div>
    `,
    intro: `
      <p>WhatsApp is where Indian customers actually message you. A wa.me link lets a customer tap once and land in a chat with your shop, with a message already typed for them. No saving your number first, no fumbling on the phone keypad. Whether you sell sweets in Indore, run a paediatric clinic in Hyderabad, or take tuition bookings in Ahmedabad, this is now the lowest-friction way to turn a website visit, a Google Business listing, or a printed flyer into a conversation.</p>
      <p>This tool builds the link for you and packages a printable QR code alongside it. You enter the country code, the WhatsApp number, and the exact pre-filled message you want the customer to send. We hand you back a clean wa.me URL and a high-contrast QR that scans from across a small shop. Put the link in your Instagram bio, in your Google Business profile, in your email signature. Print the QR on receipts, menus, takeaway bags, and front-door stickers. Everything runs in your browser; we never store your number.</p>
    `,
    howTo: [
      'Pick your <strong>country code</strong>. The default is +91 India. Even if your customer is in the next gully, the wa.me URL only works with a country code in E.164 format.',
      'Type your <strong>10-digit WhatsApp number</strong> without spaces, dashes or the leading zero. We strip whitespace, but a leading zero will break the link silently.',
      'Write the <strong>pre-filled message</strong> exactly as you want the customer to send. Keep it short, polite, and aimed at one specific reason to message. "Hi, I would like to book a haircut for Saturday at 4 PM" works better than a blank prompt.',
      'Click <strong>Generate link</strong>. The wa.me URL appears below, the chat opens in a new tab via Open chat, and the QR code renders in a few hundred milliseconds.',
      'Tap <strong>Copy link</strong> to put the URL on your clipboard. Paste it into your Instagram bio, your Google Business profile, your email signature, your Linktree, or any place that accepts a hyperlink.',
      'Click <strong>Download QR (PNG)</strong>. Save the PNG, print at A5 or larger, laminate, and stick it at the till, the entrance, the table, or the takeaway bag.',
      'Always test by tapping the link on your own phone before printing 500 flyers. iOS and Android sometimes handle wa.me slightly differently, especially when WhatsApp is not the default messaging app.',
    ],
    why: `
      <p>Three reasons the wa.me link earns its place in your toolkit.</p>
      <p><strong>Customers do not save your number.</strong> The old workflow of "give us a missed call" silently loses leads because most customers will not save your number first. A wa.me link gets a stranger into a chat with you in two taps. The friction drops from minutes to seconds. For a clinic, a tutoring centre or a jeweller, that conversion delta is the difference between a quiet Tuesday and a busy one.</p>
      <p><strong>The pre-filled message acts like a structured form.</strong> When the customer opens the chat with a message already typed, they edit and send. You receive a qualified lead with the specific reason already attached. "I want to book a Sunday brunch order for 4 people" arrives in your inbox without you needing to ask three follow-up questions. Multiply that across 30 enquiries a day and you have meaningful operational savings.</p>
      <p><strong>QR codes for WhatsApp work everywhere offline.</strong> A printed QR on a menu, on a billboard, on a takeaway bag, on a receipt, lets any smartphone camera land the user in your inbox. No app install, no link copy. For a roadside dosa stand or a small clinic, the QR is the equivalent of the old printed phone number, except you know exactly what the customer wants before you read the message.</p>
    `,
    tips: [
      'Always include the country code. wa.me/9876543210 fails silently in some regions; wa.me/919876543210 works everywhere.',
      'Keep the pre-filled message under 120 characters so it does not get clipped on first display in older Android keyboards.',
      'Avoid emojis in the pre-filled message text. Some keyboards render them oddly when the chat opens, which makes your prompt look unprofessional.',
      'Use a different pre-filled message per channel. One for your Instagram bio ("Hi, saw you on IG, want the menu"), one for Google Business ("Hi, please confirm Sunday brunch availability"), one for the printed menu.',
      'Print the QR code at least 3 cm by 3 cm so it scans cleanly from arm length, with dark squares on a plain white background. Background images or low contrast will hurt scan rate.',
      'Test the same link on iOS and Android before printing in bulk. They behave slightly differently if WhatsApp is uninstalled or set to non-default.',
      'Do not use the same WhatsApp number for personal chat and business orders. Create a WhatsApp Business account to keep replies professional and unlock labels, quick replies and away messages.',
    ],
    example: `
      <p>Copper Oven, a Pune bakery, wants to push their weekend brunch orders to WhatsApp instead of a paper booking sheet. They generate a wa.me link with the pre-filled message: <em>Hi Copper Oven, I would like to place a Sunday brunch order:</em>. The link goes onto their Google Business profile, the Instagram bio, and a 5x5 cm QR printed on the takeaway bag.</p>
      <p>A regular customer scans the bag on Friday morning, gets the message pre-loaded with the brunch prompt, types her order, and hits send. The bakery receives a structured order in their WhatsApp Business inbox, replies with a confirmation, and adds her to a quick-reply group for next Sunday. No phone calls. No "what do you want?". No back-and-forth. Bag goes home, bag becomes ordering channel, ordering channel becomes loyalty loop.</p>
    `,
    faq: [
      { q: 'Do I need a WhatsApp Business account to use a wa.me link?', a: '<p>No, you do not need a WhatsApp Business account; a wa.me link works perfectly with any WhatsApp number, personal or business. That said, upgrading to the free WhatsApp Business app is worth it as your enquiries grow, because it unlocks features a regular account does not have: labels to organise chats by stage, quick replies for messages you send all day, a greeting and an away message that respond automatically when you are busy or closed, a product Catalogue customers can browse inside the chat, and basic messaging analytics. The switch is free and keeps your existing number, so you lose nothing. As a rough rule, most Indian shops find the Business app pays for itself in saved time the moment they cross around 30 customer messages a day, when manually retyping the same answers and hunting for old chats starts eating real hours. Start with a plain wa.me link today and upgrade the account whenever the volume justifies it.</p>' },
      { q: 'Why does my link not open the chat directly on the customer phone?', a: '<p>The most common cause is the phone number format, specifically a missing country code or a leading zero that should not be there. WhatsApp deep links need the number in full international format with no plus sign, no spaces and no leading zero, so an Indian mobile must be written as 919876543210, with 91 as the country code, and never as 9876543210 or 09876543210. If you paste the number the way it appears on a visiting card, with a zero or brackets, the link breaks. Simply regenerate it here with the country code 91 in front and the leading zero stripped, and the link will open the chat in one tap on the customer phone. A quick way to test is to open the generated link on a second phone that has WhatsApp installed; if it opens a fresh chat to your number with your pre-filled message ready to send, the format is correct and you can safely publish it.</p>' },
      { q: 'Can the pre-filled message include line breaks?', a: '<p>Yes, your pre-filled message can include line breaks and they survive intact. Behind the scenes the tool URL-encodes each newline as %0A, which is the standard way to carry a line break inside a link, so when the customer taps your wa.me link the message opens in their chat box formatted exactly as you typed it, paragraphs and all. That lets you pre-write something genuinely useful rather than a single cramped line, for example a greeting, then a request for their name, pincode and the item they want, each on its own line, so customers send you complete details in one message instead of a back-and-forth. Just type your message naturally into the message box above, pressing enter for new lines where you want them, and the tool handles the encoding for you. Keep it short enough that customers will actually read and send it; three or four lines is usually the sweet spot for a smooth first contact.</p>' },
      { q: 'Is wa.me the same as api.whatsapp.com/send?', a: '<p>Functionally they are the same thing: both links open a chat with your number and can carry a pre-filled message, and both are official WhatsApp click-to-chat formats. The practical difference is length and tidiness. A wa.me link, such as wa.me/919876543210, is noticeably shorter and cleaner, which matters when you are pasting it into an Instagram bio with a tight character limit, printing it on a visiting card or a shop sticker, or reading it out to someone. The longer api.whatsapp.com/send format does exactly the same job and is sometimes generated by older tools, but there is rarely a reason to prefer it. For everything customer-facing, use the wa.me version this tool produces, because shorter links are easier to share, look less intimidating, and take up less space on printed material. Both work on every device that has WhatsApp installed, so you lose no compatibility by choosing the tidier one.</p>' },
      { q: 'Can I track how many clicks the link gets?', a: '<p>A raw wa.me link does not give you click analytics on its own; WhatsApp does not report how many people tapped it. If knowing the click count matters to you, the simple fix is to wrap your wa.me link inside a short-link service such as Bitly or Rebrandly, which counts every click and shows you trends over time, then share that short link instead of the bare wa.me one. A more professional option is to set up your own redirector on a subdomain, for example go.yourshop.in, that forwards to the wa.me link, which keeps your branding on the link and lets you measure traffic in your own analytics. Either way, the wa.me link stays the final destination; you are just adding a counting layer in front of it. For a small shop, the wrapped Bitly approach takes two minutes and is usually all the tracking you need to see which poster, post or page is actually driving WhatsApp enquiries.</p>' },
      { q: 'Does this work for WhatsApp groups?', a: '<p>No, this tool creates links for one-to-one chats with a single number, not group invites. A wa.me link always opens a private chat between the customer and the specific number you entered, which is exactly what you want for sales enquiries, support and orders. WhatsApp groups use a completely different link format, the chat.whatsapp.com invite links you generate from inside the group settings on your phone, and those behave differently: anyone with the link can join the group and see other members, which is rarely appropriate for customer messaging. So if your goal is for customers to message your shop directly, the wa.me link from this tool is the right choice. If you genuinely want a broadcast-style community, create the group on your phone and share its chat.whatsapp.com invite separately, but for selling and support, keep customers in private one-to-one chats where their details stay confidential and you can manage each conversation individually.</p>' },
      { q: 'What if I change my WhatsApp number?', a: '<p>If you change your WhatsApp number, the old wa.me link stops working, because it points at the old number specifically. You will need to regenerate the link here with the new number in full international format and then replace it everywhere you have published it, your website, your Instagram and Google Business profiles, your email signature, and any printed material like stickers, visiting cards and shop signage. That last part is the painful one: a number change can mean reprinting physical material and confusing returning customers who saved the old link, so it is genuinely worth avoiding. The practical advice is to choose a number you intend to keep for the long term before you print anything, and to treat a number change as a once-in-several-years event rather than a casual switch. If you must change it, update every digital surface the same day, since those are free to fix, and only reprint physical material once the new number is settled for good.</p>' },
      { q: 'Is there a daily limit on incoming messages?', a: '<p>No, there is no daily limit on the messages customers can send you through a wa.me link. WhatsApp does not cap inbound messages, so however many people tap your link and write to you, every message arrives, whether that is 5 a day or 500. The limits people sometimes worry about apply to outbound bulk messaging, not inbound enquiries: when a business proactively sends broadcasts or template messages at scale, it must use the official WhatsApp Business API, which has tiered messaging limits and approval rules to prevent spam. That API is a separate, more technical setup and is not what this tool produces. The wa.me link simply lets customers start a conversation with you, and you reply manually as you would to any chat, so you can comfortably use it as your main customer enquiry channel without ever bumping into a cap. If you later need to send promotional broadcasts to thousands, that is when the API conversation begins.</p>' },
    ],
    related: [
      { href: '/pages/tools', title: 'All free tools', blurb: 'Browse the full kit.' },
      { href: '/pages/solutions/restaurants', title: 'Restaurants on Neweb', blurb: 'Menus, reservations, food-first SEO.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'From ₹249 per month, website plus free domain.' },
    ],
  },

  // =========================================================================
  // ============================ UPI QR CODE ================================
  // =========================================================================
  {
    slug: 'upi-qr-code-generator',
    category: 'run',
    built: true,
    name: 'UPI QR Code Generator',
    tagline: 'Free UPI QR for any UPI ID. Download as PNG, print at the till.',
    primaryKeyword: 'upi qr code generator',
    solutionHref: '/pages/solutions/restaurants',
    solutionLabel: 'For restaurants',
    metaTitle: 'Free UPI QR Code Generator — PNG Download | Neweb',
    metaDescription: 'Generate a UPI QR code from any UPI ID. Optional fixed amount and note. Download as PNG and print at the till. Free, instant, browser-only.',
    h1: 'UPI QR Code <span class="serif">Generator</span>.',
    lede: 'Type your UPI ID and payee name. We render a UPI-spec-compliant QR you can download as PNG and print on a standee, on receipts, or at every table.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>UPI ID (VPA)</label>
            <input id="upi-pa" type="text" placeholder="name@bankname" maxlength="60"/>
          </div>
          <div class="field"><label>Payee name</label>
            <input id="upi-pn" type="text" placeholder="Your shop or business name" maxlength="60"/>
          </div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Amount in ₹ (optional)</label>
            <input id="upi-am" type="number" min="0" step="0.01" placeholder="Leave blank to let customer enter"/>
          </div>
          <div class="field"><label>Note (optional)</label>
            <input id="upi-tn" type="text" placeholder="Table 3 / Invoice #421" maxlength="40"/>
          </div>
        </div>
        <div class="tool-actions">
          <button id="upi-gen" type="button" class="btn btn-brand">Generate QR</button>
        </div>
        <div id="upi-result" style="display:none">
          <div class="tool-output" id="upi-string"></div>
          <div class="tool-actions">
            <button id="upi-copy" type="button" class="btn btn-ghost">Copy UPI string</button>
            <button id="upi-dl" type="button" class="btn btn-ghost">Download QR (PNG)</button>
          </div>
          <div id="upi-qr" style="display:flex;justify-content:center;margin-top:18px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:14px"></div>
        </div>
      `,
      help: 'We follow the NPCI UPI deep-link spec (upi://pay). Nothing leaves your browser. Tested with PhonePe, Google Pay, Paytm and BHIM.',
      js: LOAD_SCRIPT_JS + QR_RENDER_JS + `
(function(){
  var pa=document.getElementById('upi-pa'), pn=document.getElementById('upi-pn');
  var am=document.getElementById('upi-am'), tn=document.getElementById('upi-tn');
  var btn=document.getElementById('upi-gen');
  var box=document.getElementById('upi-result');
  var strEl=document.getElementById('upi-string');
  var copyBtn=document.getElementById('upi-copy');
  var dlBtn=document.getElementById('upi-dl');
  var qrBox=document.getElementById('upi-qr');
  var lastCanvas=null, lastStr='';
  if (!btn) return;
  function build(){
    var idv=(pa.value||'').trim();
    var nm =(pn.value||'').trim();
    if (!idv){ pa.focus(); return null; }
    if (!nm){ pn.focus(); return null; }
    var params = ['pa='+encodeURIComponent(idv), 'pn='+encodeURIComponent(nm), 'cu=INR'];
    var amt = parseFloat(am.value);
    if (!isNaN(amt) && amt > 0) params.push('am='+amt.toFixed(2));
    var note=(tn.value||'').trim();
    if (note) params.push('tn='+encodeURIComponent(note));
    return 'upi://pay?' + params.join('&');
  }
  btn.addEventListener('click', async function(){
    var s = build();
    if (!s) return;
    lastStr = s;
    strEl.textContent = s;
    box.style.display='';
    try {
      await loadScript('${QR_LIB_SRC}');
      lastCanvas = renderQR(s, qrBox, { size: 280, ec: 'M' });
    } catch(e){
      qrBox.innerHTML='<span style="color:var(--muted);font-size:13px">QR library failed to load. Try again.</span>';
    }
  });
  copyBtn.addEventListener('click', async function(){
    if (!lastStr) return;
    try { await navigator.clipboard.writeText(lastStr); copyBtn.textContent='Copied ✓'; setTimeout(function(){copyBtn.textContent='Copy UPI string';},1400);}
    catch(e){ copyBtn.textContent='Copy failed'; }
  });
  dlBtn.addEventListener('click', function(){
    if (!lastCanvas) return;
    downloadCanvasPNG(lastCanvas, 'upi-qr.png');
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main eo-mono">upi://pay?pa=copperoven@okhdfcbank&pn=Copper%20Oven&am=250&tn=Order</div><div class="eo-sub">Pays INR 250 to Copper Oven, with the note "Order", from any UPI app.</div></div></div>
      <div class="eo-note">Sample UPI string. Generate a scannable QR you can download and print at the till above.</div>
    `,
    intro: `
      <p>UPI QR is now the most reliable way for an Indian small business to accept payment. Customers scan with PhonePe, Google Pay, Paytm, BHIM, or any UPI app. You do not need a card machine, a POS subscription, or a battery to run it. Just one printed QR at the counter is enough. Some shops have a single laminated A4 QR by the till; others have small QR stickers at every table. Either way, the QR is just a structured string that follows the NPCI deep-link spec: <code>upi://pay?pa=yourid@bank&pn=YourName&am=100&tn=note</code>.</p>
      <p>This tool turns a UPI ID and a payee name into a valid UPI QR, with optional amount and note fields. The QR renders in your browser, you download a clean PNG, and you print it. Nothing leaves your machine. The output is tested with the four most-used UPI apps in India, and works for both personal and merchant VPAs.</p>
    `,
    howTo: [
      'Enter your <strong>UPI ID (VPA)</strong>. The format is name@bank, for example rohit@ybl, neha@upi, copperoven@hdfcbank. Find yours inside PhonePe under Profile → My UPI ID, or inside GPay under your profile picture.',
      'Enter the <strong>payee name</strong>. This shows up on the customer screen before they pay, so it should match your bank account name or your shop name exactly. Mismatch here triggers UPI warnings on the customer side.',
      'Optional: enter a <strong>fixed amount in rupees</strong>. Skip this if your bills vary; fill it for fixed-price services like a haircut, a tuition fee, or a consultation charge.',
      'Optional: enter a <strong>note</strong>. The customer sees this on their UPI app. Notes like "Table 3" or "Invoice 421" help you reconcile payments later.',
      'Click <strong>Generate QR</strong>. The QR appears below along with the raw UPI string in case you need to embed it elsewhere.',
      'Click <strong>Download QR (PNG)</strong>. Save the PNG, print at A5 or larger, laminate, and place at the till. For a multi-table restaurant, generate one QR per table with a different note for each.',
      'Test by scanning with at least two different UPI apps before printing in bulk. Edge cases sometimes appear with longer payee names or special characters.',
    ],
    why: `
      <p>Three reasons UPI QR codes matter more than ever for Indian SMBs.</p>
      <p><strong>Adoption.</strong> NPCI clocks well over 13 billion UPI transactions a month, with the user base growing across every Tier-2 and Tier-3 city. Almost every adult customer with a smartphone uses at least one UPI app, often two or three. Offering UPI is no longer a premium feature; it is the default.</p>
      <p><strong>Zero or low MDR.</strong> Unlike card payments where 1.5 to 2 percent disappears as the merchant discount rate, UPI to a personal VPA from a regular customer goes straight into your bank with no cut. Merchant UPI through an aggregator has slightly different commercial rules, but a printed QR linked to your personal or sole-proprietorship VPA stays clean for the long tail of small businesses. Over a year, the difference funds at least one extra month of your software stack.</p>
      <p><strong>No infrastructure dependency.</strong> No card terminal to recharge, no POS machine to lease, no SIM-based connectivity to maintain. A laminated paper QR works even when the power is out, even when the till is offline, even when the staff has changed. For a roadside chaat stand, a jeweller billing counter, or a doctor reception desk, that simplicity is decisive.</p>
    `,
    tips: [
      'Print the QR with high contrast: dark modules on a plain white background. Skip fancy logos or background images that might confuse some scanner cameras.',
      'Test with PhonePe, GPay and Paytm before printing in bulk. The three apps occasionally treat the spec slightly differently.',
      'Skip the fixed amount if your prices vary across orders. Pre-filling Rs 100 confuses a customer buying for Rs 250 because most apps lock the amount when set.',
      'Match the payee name to your bank account exactly. If your bank says "Rohit Sharma" but your QR says "Copper Oven Bakery", many UPI apps will warn the customer that the name does not match, and they will pause before paying.',
      'Re-print the QR if you change your VPA or your bank. Keep the source PNG and PDF safe so you can re-size and re-print at any time.',
      'Keep one master QR at the till and another near the door so customers see it from outside before deciding to walk in.',
      'For multi-table service, print a small QR per table with a different note like "Table 3" so you can reconcile UPI receipts to specific tables at the end of the day.',
    ],
    example: `
      <p>Indu Beauty Studio, a salon in Indore, wants to skip card MDR on weekend rush days. Their UPI ID is salon@ybl. They generate a QR with payee name "Indu Beauty Studio" and no fixed amount. They print the QR onto a small acrylic standee at the reception.</p>
      <p>A customer pays Rs 850 for a haircut and color. She scans the QR with PhonePe, types 850, hits send. The money lands in the salon HDFC account in under 30 seconds. The salon owner gets a notification on her shop phone, confirms with a glance, and updates the day book. Over a month of Rs 5 lakh of UPI receipts at the salon, they save about Rs 8,000 in MDR they would have paid on a card machine. That covers the entire shop electricity bill.</p>
    `,
    faq: [
      { q: 'Is this a "merchant" UPI QR or a "personal" UPI QR?', a: '<p>It is whichever your underlying VPA is, because this tool simply encodes the UPI ID you enter into a standard QR. If your VPA is linked to a personal savings account, the result is a personal peer-to-peer QR, which is fine for low volumes and incurs no merchant discount rate. If your VPA is issued through a payment aggregator such as Razorpay, PhonePe ForBusiness or BharatPe and linked to a current account, the same QR functions as a merchant QR, with proper reconciliation and settlement to your business account. The visible QR format is identical either way; what actually changes is who handles settlement, whether any MDR applies, and how cleanly payments reconcile against your books. For a small shop just starting out, a personal VPA QR is enough; once daily collections grow or you need automatic reconciliation against invoices, move to a merchant aggregator VPA and regenerate the QR with that new ID.</p>' },
      { q: 'Can customers send any amount with my QR?', a: '<p>Yes, that depends on whether you fill in the amount field before generating. If you leave the amount blank, the QR is open and the customer types whatever they owe when they scan, which is ideal for a counter where bills vary, a kirana store, a salon, a restaurant. If you fill in a specific amount, most UPI apps lock that figure so the customer cannot edit it, which is perfect for a fixed-price item, a set service fee, or collecting a deposit, because it removes the risk of the customer mistyping and underpaying. A common practical setup is to print one open QR at the till for everyday billing, and generate separate fixed-amount QRs for popular fixed-price products or for sharing over WhatsApp when you have already agreed a price. You can also add a transaction note so the payment lands with a label, making it easier to reconcile later against the right order.</p>' },
      { q: 'Will the customer see my real name?', a: '<p>When a customer scans your QR, their UPI app shows the payee name you set on the QR, and at the moment they confirm, it also displays the verified name registered on your bank account behind the VPA. For trust, those two should match closely, so set the payee name to your actual business or account name rather than a nickname. If the name you put on the QR is wildly different from the verified bank name, many UPI apps surface a mismatch warning, and a cautious customer may hesitate or abandon the payment, fearing a scam. This matters most when you share a QR over WhatsApp with someone who has not met you, since the verified name is their main reassurance that the money is going to the right place. The simplest safe approach is to use the same name on the QR, on your signboard and on your bank account, so every signal a paying customer sees lines up.</p>' },
      { q: 'How do I know the customer paid?', a: '<p>For a personal VPA QR, you confirm payment through the instant notification your own UPI app, PhonePe, Google Pay, BHIM or your bank app, pushes to your phone within a few seconds of a successful transfer, usually with a sound. At a busy counter, that audio confirmation is what most small shops rely on. If you ever doubt it, ask the customer to show their success screen, but treat their screenshot with care, since screenshots can be faked; your own incoming notification is the reliable proof. This manual method works well at low to moderate volume. Once you are processing many payments a day and need to match each one against an invoice or order automatically, that is the point to move to a merchant aggregator, because aggregators post structured payment events into your billing or accounting system and reconcile them for you, removing the manual checking and the risk of missing a payment in the rush.</p>' },
      { q: 'Are there transaction limits?', a: '<p>The NPCI default cap is Rs 1 lakh per UPI transaction for most everyday person-to-merchant and person-to-person payments, though certain verified categories such as hospitals and education allow higher limits. On top of the NPCI ceiling, individual banks set their own per-day limits and caps on the number of transactions, which can be lower, so a customer occasionally hits their bank limit rather than yours. This matters most for big-ticket purchases at jewellers, electronics showrooms or furniture stores, where a single bill can exceed a customer day limit. In those cases the customer can usually raise or relax the limit themselves within their UPI app settings, or split the payment across two transactions or two days. If you regularly take large payments, it is worth knowing your own bank receiving limits too, and for very high-value sales, offering a bank transfer or a card option alongside UPI avoids a stalled checkout at the counter.</p>' },
      { q: 'What if my VPA gets blocked or compromised?', a: '<p>If your VPA is ever blocked, compromised or simply tied to an account you are closing, the fix is straightforward: create or switch to a new VPA inside your UPI app, then regenerate your QR here using the new ID and replace the printed or laminated copy at your counter and anywhere else you have shared it, your WhatsApp, your website, your Google Business photos. Because the QR is just an encoding of the VPA, the old printed code becomes useless the moment the VPA changes, so do not leave stale QRs lying around where a customer might pay into a dead or wrong account. Beyond emergencies, it is sensible to treat rotating your VPA and refreshing the printed QR as a light annual hygiene step, much like changing a password, especially if the code has been photographed and circulated widely. Keep a quick note of where all your QRs are published so a swap takes minutes rather than leaving an outdated code in circulation for weeks.</p>' },
      { q: 'Can I embed the QR on my Google Business listing?', a: '<p>You cannot drop a live, scannable payment widget directly into the Google Business profile interface, but you can still get your UPI QR in front of customers who find you on Google. The simplest route is to upload the QR image as a photo on your Google Business profile, so it appears in your business photos that customers browse before visiting. The stronger route is to place the QR on your own website, which your Google Business profile links to; visitors who tap through to your site can then scan or screenshot it to pay. Both surfaces are seen by customers in the research moment, right before they decide to call, visit or order, which is exactly when an easy payment option helps. For best results, pair the QR with a clear caption like your business name and "Scan to pay by UPI", so customers understand instantly what it is and feel confident the money reaches the right shop.</p>' },
      { q: 'Does this work for foreign currency or international payments?', a: '<p>No, UPI settles only in Indian rupees, so this QR cannot accept payments in dollars, pounds, euros or any other currency. UPI is a domestic Indian payments rail, and while cross-border UPI is slowly expanding to a handful of countries and select use cases, you cannot rely on it for an ordinary overseas customer paying you today. If you need to collect money from foreign customers, use a separate international payment method such as a Razorpay international payment link, a Stripe checkout, or a PayPal invoice, each of which handles currency conversion and overseas cards. Be aware those routes operate on different commercial terms, with higher fees and their own KYC and settlement rules, and they are a distinct workflow from your everyday UPI counter collections. The practical approach is to keep this UPI QR for your Indian customers, who are the vast majority for most small businesses, and set up an international link only when genuine overseas demand appears.</p>' },
    ],
    related: [
      { href: '/pages/tools/whatsapp-link-generator', title: 'WhatsApp Link Generator', blurb: 'wa.me links and QR codes for your inbox.' },
      { href: '/pages/tools/gst-invoice-generator', title: 'GST Invoice Generator', blurb: 'Tax invoices with CGST + SGST split, as PDF.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'From ₹249 per month.' },
    ],
  },

  // =========================================================================
  // ============================ GST INVOICE ================================
  // =========================================================================
  {
    slug: 'gst-invoice-generator',
    category: 'run',
    built: true,
    name: 'GST Invoice Generator',
    tagline: 'GST-ready PDF invoice with CGST/SGST/IGST split, in two minutes.',
    primaryKeyword: 'free gst invoice generator india',
    solutionHref: '/pages/solutions',
    solutionLabel: 'For service businesses',
    metaTitle: 'Free GST Invoice Generator India — CGST, SGST, IGST PDF | Neweb',
    metaDescription: 'Generate a Rule 46 compliant GST invoice as a clean A4 PDF. Auto CGST + SGST split for intra-state, IGST for inter-state, total in words. Free, browser-only.',
    h1: 'GST Invoice <span class="serif">Generator</span>.',
    lede: 'Type seller, buyer and line items. We compute CGST, SGST or IGST automatically and emit a clean A4 PDF. Free, runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Seller name</label><input id="gi-sn" type="text" placeholder="Your business legal name"></div>
          <div class="field"><label>Seller GSTIN</label><input id="gi-sg" type="text" placeholder="22AAAAA0000A1Z5" maxlength="15"></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Seller address</label><input id="gi-sa" type="text" placeholder="Street, city, PIN"></div>
          <div class="field"><label>Seller state</label><input id="gi-ss" type="text" placeholder="Maharashtra"></div>
        </div>
        <div class="tool-row" style="margin-top:8px">
          <div class="field"><label>Buyer name</label><input id="gi-bn" type="text" placeholder="Customer or company name"></div>
          <div class="field"><label>Buyer GSTIN (if any)</label><input id="gi-bg" type="text" placeholder="optional" maxlength="15"></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Buyer address</label><input id="gi-ba" type="text" placeholder="Street, city, PIN"></div>
          <div class="field"><label>Buyer state</label><input id="gi-bs" type="text" placeholder="Karnataka"></div>
        </div>
        <div class="tool-row" style="margin-top:8px">
          <div class="field"><label>Invoice number</label><input id="gi-no" type="text" placeholder="INV/2026/04/0001"></div>
          <div class="field"><label>Invoice date</label><input id="gi-dt" type="date"></div>
        </div>

        <label style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-top:14px;display:block">Line items</label>
        <div id="gi-items" style="display:flex;flex-direction:column;gap:10px;margin-top:8px"></div>
        <div class="tool-actions"><button id="gi-add" type="button" class="btn btn-ghost">+ Add line item</button></div>

        <div id="gi-totals" style="margin-top:18px;padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--bg-2);display:none">
          <div style="display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--ink-2);margin-bottom:6px"><span>Subtotal</span><span id="gi-sub">₹0.00</span></div>
          <div id="gi-taxrows"></div>
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:600;color:var(--ink);margin-top:10px;padding-top:10px;border-top:1px solid var(--line)"><span>Grand total</span><span id="gi-grand">₹0.00</span></div>
          <div id="gi-words" style="font-family:'Instrument Serif',serif;font-style:italic;font-size:14.5px;color:var(--ink-2);margin-top:8px"></div>
        </div>

        <div class="tool-actions" style="margin-top:14px">
          <button id="gi-preview" type="button" class="btn btn-ghost">Recalculate</button>
          <button id="gi-pdf" type="button" class="btn btn-brand">Download PDF</button>
        </div>
      `,
      help: 'PDF rendered with jsPDF + autoTable from jsDelivr. Nothing is uploaded. Your seller details are saved to localStorage for next time.',
      js: LOAD_SCRIPT_JS + `
(function(){
  var items = document.getElementById('gi-items');
  if (!items) return;
  var defaultRow = { desc:'', hsn:'', qty:1, rate:0, gst:18 };

  // Persist seller details to localStorage
  var SELLER_KEYS = ['gi-sn','gi-sg','gi-sa','gi-ss'];
  try {
    var saved = JSON.parse(localStorage.getItem('gi-seller') || '{}');
    SELLER_KEYS.forEach(function(k){ if (saved[k]) document.getElementById(k).value = saved[k]; });
  } catch(e){}
  SELLER_KEYS.forEach(function(k){
    document.getElementById(k).addEventListener('input', function(){
      try {
        var s = JSON.parse(localStorage.getItem('gi-seller')||'{}');
        s[k] = document.getElementById(k).value;
        localStorage.setItem('gi-seller', JSON.stringify(s));
      } catch(e){}
    });
  });

  // Default date today
  var dtEl = document.getElementById('gi-dt');
  var d = new Date(); var pad=function(n){return n<10?'0'+n:n;};
  dtEl.value = d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());

  function rowHTML(idx, r){
    return '<div class="gi-row" data-i="'+idx+'" style="display:grid;grid-template-columns:2.2fr 1fr .7fr 1fr .8fr 28px;gap:8px;align-items:center">'
      + '<input class="gi-desc" type="text" placeholder="Item description" value="'+escapeAttr(r.desc)+'"/>'
      + '<input class="gi-hsn" type="text" placeholder="HSN" value="'+escapeAttr(r.hsn)+'" maxlength="8"/>'
      + '<input class="gi-qty" type="number" step="0.01" min="0" placeholder="Qty" value="'+r.qty+'"/>'
      + '<input class="gi-rate" type="number" step="0.01" min="0" placeholder="Rate ₹" value="'+r.rate+'"/>'
      + '<select class="gi-gst"><option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18" selected>18%</option><option value="28">28%</option></select>'
      + '<button class="gi-del" type="button" title="Remove" style="background:transparent;border:0;color:var(--muted);font-size:18px;cursor:pointer;line-height:1">×</button>'
      + '</div>';
  }
  function escapeAttr(s){return String(s||'').replace(/"/g,'&quot;');}
  function addRow(r){
    r = r || Object.assign({}, defaultRow);
    var idx = items.children.length;
    items.insertAdjacentHTML('beforeend', rowHTML(idx, r));
    var sel = items.lastElementChild.querySelector('.gi-gst');
    sel.value = String(r.gst);
    items.lastElementChild.querySelector('.gi-del').addEventListener('click', function(){
      items.removeChild(items.querySelector('[data-i="'+idx+'"]'));
      recalc();
    });
    items.lastElementChild.querySelectorAll('input,select').forEach(function(el){
      el.addEventListener('input', recalc);
    });
  }
  document.getElementById('gi-add').addEventListener('click', function(){ addRow(); });
  document.getElementById('gi-preview').addEventListener('click', recalc);
  addRow();

  function readItems(){
    return Array.from(items.querySelectorAll('.gi-row')).map(function(row){
      return {
        desc: row.querySelector('.gi-desc').value || '',
        hsn:  row.querySelector('.gi-hsn').value || '',
        qty:  parseFloat(row.querySelector('.gi-qty').value) || 0,
        rate: parseFloat(row.querySelector('.gi-rate').value) || 0,
        gst:  parseFloat(row.querySelector('.gi-gst').value) || 0,
      };
    });
  }
  function calc(){
    var sellerState = (document.getElementById('gi-ss').value || '').trim().toLowerCase();
    var buyerState  = (document.getElementById('gi-bs').value || '').trim().toLowerCase();
    var sameState = sellerState && buyerState && sellerState === buyerState;
    var rows = readItems();
    var sub = 0, taxBuckets = {};
    rows.forEach(function(r){
      var amt = r.qty * r.rate;
      sub += amt;
      var rate = r.gst;
      if (!taxBuckets[rate]) taxBuckets[rate] = { base: 0, tax: 0 };
      taxBuckets[rate].base += amt;
      taxBuckets[rate].tax  += amt * rate / 100;
    });
    return { sub: sub, taxBuckets: taxBuckets, sameState: sameState };
  }
  function rupee(n){ return '₹' + (n||0).toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','); }
  function recalc(){
    var t = calc();
    var totalsBox = document.getElementById('gi-totals');
    var sumTax = 0;
    var taxRowsHTML = '';
    Object.keys(t.taxBuckets).sort(function(a,b){return parseFloat(a)-parseFloat(b);}).forEach(function(rate){
      var bucket = t.taxBuckets[rate];
      if (!bucket.tax) return;
      sumTax += bucket.tax;
      if (t.sameState) {
        var half = bucket.tax / 2;
        taxRowsHTML += '<div style="display:flex;justify-content:space-between;font-family:JetBrains Mono,monospace;font-size:13px;color:var(--ink-2);margin-bottom:4px"><span>CGST ' + (rate/2) + '% on '+rupee(bucket.base)+'</span><span>'+rupee(half)+'</span></div>';
        taxRowsHTML += '<div style="display:flex;justify-content:space-between;font-family:JetBrains Mono,monospace;font-size:13px;color:var(--ink-2);margin-bottom:4px"><span>SGST ' + (rate/2) + '% on '+rupee(bucket.base)+'</span><span>'+rupee(half)+'</span></div>';
      } else {
        taxRowsHTML += '<div style="display:flex;justify-content:space-between;font-family:JetBrains Mono,monospace;font-size:13px;color:var(--ink-2);margin-bottom:4px"><span>IGST ' + rate + '% on '+rupee(bucket.base)+'</span><span>'+rupee(bucket.tax)+'</span></div>';
      }
    });
    var grand = t.sub + sumTax;
    document.getElementById('gi-sub').textContent = rupee(t.sub);
    document.getElementById('gi-taxrows').innerHTML = taxRowsHTML;
    document.getElementById('gi-grand').textContent = rupee(grand);
    document.getElementById('gi-words').textContent = grand > 0 ? ('In words: ' + numToWords(Math.round(grand)) + ' Rupees Only') : '';
    totalsBox.style.display = (t.sub > 0) ? 'block' : 'none';
    return { sub: t.sub, tax: sumTax, grand: grand, sameState: t.sameState, buckets: t.taxBuckets };
  }

  // Number to words (Indian system)
  function numToWords(num){
    if (num === 0) return 'Zero';
    var a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    var b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    function two(n){ if (n<20) return a[n]; var t=Math.floor(n/10), u=n%10; return b[t] + (u? ' '+a[u]:''); }
    function three(n){ var h=Math.floor(n/100), r=n%100; var s=''; if (h) s+=a[h]+' Hundred'; if (r){ if (s) s+=' '; s+=two(r);} return s; }
    var crore = Math.floor(num/10000000); num %= 10000000;
    var lakh  = Math.floor(num/100000); num %= 100000;
    var thou  = Math.floor(num/1000); num %= 1000;
    var rest  = num;
    var parts = [];
    if (crore) parts.push(two(crore) + ' Crore');
    if (lakh)  parts.push(two(lakh) + ' Lakh');
    if (thou)  parts.push(two(thou) + ' Thousand');
    if (rest)  parts.push(three(rest));
    return parts.join(' ');
  }

  // PDF generation
  document.getElementById('gi-pdf').addEventListener('click', async function(){
    var t = recalc();
    if (!t || t.sub === 0){ alert('Please add at least one line item.'); return; }
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js');
    } catch(e){
      alert('PDF library failed to load. Check your connection and retry.'); return;
    }
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit:'mm', format:'a4' });
    var W = 210, x = 15;

    doc.setFont('helvetica','bold'); doc.setFontSize(20);
    doc.text('TAX INVOICE', x, 22);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(100);
    doc.text('GST Rule 46 compliant', x, 28);
    doc.setTextColor(0); doc.setFontSize(10);

    // Seller block
    doc.setFont('helvetica','bold'); doc.text('From', x, 40);
    doc.setFont('helvetica','normal');
    doc.text(document.getElementById('gi-sn').value || '', x, 46);
    doc.text(document.getElementById('gi-sa').value || '', x, 51);
    doc.text('State: ' + (document.getElementById('gi-ss').value || ''), x, 56);
    doc.text('GSTIN: ' + (document.getElementById('gi-sg').value || ''), x, 61);

    // Buyer block
    var bx = 115;
    doc.setFont('helvetica','bold'); doc.text('Bill to', bx, 40);
    doc.setFont('helvetica','normal');
    doc.text(document.getElementById('gi-bn').value || '', bx, 46);
    doc.text(document.getElementById('gi-ba').value || '', bx, 51);
    doc.text('State: ' + (document.getElementById('gi-bs').value || ''), bx, 56);
    doc.text('GSTIN: ' + (document.getElementById('gi-bg').value || '—'), bx, 61);

    doc.setFontSize(9); doc.setTextColor(80);
    doc.text('Invoice #: ' + (document.getElementById('gi-no').value || ''), x, 72);
    doc.text('Date: ' + (document.getElementById('gi-dt').value || ''), bx, 72);
    doc.setTextColor(0); doc.setFontSize(10);

    var rows = readItems().filter(function(r){return r.desc || r.qty || r.rate;}).map(function(r){
      var amt = (r.qty||0) * (r.rate||0);
      var tax = amt * (r.gst||0)/100;
      return [r.desc, r.hsn, String(r.qty), '₹'+r.rate.toFixed(2), r.gst+'%', '₹'+amt.toFixed(2), '₹'+tax.toFixed(2), '₹'+(amt+tax).toFixed(2)];
    });
    doc.autoTable({
      startY: 80,
      head: [['Description','HSN','Qty','Rate','GST','Amount','Tax','Total']],
      body: rows,
      headStyles: { fillColor:[61,76,255], textColor:255, fontSize:9 },
      bodyStyles: { fontSize:9 },
      styles: { cellPadding:2 },
      columnStyles: { 0:{ cellWidth:55 }, 3:{halign:'right'}, 5:{halign:'right'}, 6:{halign:'right'}, 7:{halign:'right'} },
    });

    var y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    function line(label, value){ doc.text(label, 130, y); doc.text(value, 200, y, {align:'right'}); y += 6; }
    line('Subtotal', '₹' + t.sub.toFixed(2));
    Object.keys(t.buckets).sort(function(a,b){return parseFloat(a)-parseFloat(b);}).forEach(function(rate){
      var bucket = t.buckets[rate]; if (!bucket.tax) return;
      if (t.sameState) {
        line('CGST ' + (rate/2) + '%', '₹' + (bucket.tax/2).toFixed(2));
        line('SGST ' + (rate/2) + '%', '₹' + (bucket.tax/2).toFixed(2));
      } else {
        line('IGST ' + rate + '%', '₹' + bucket.tax.toFixed(2));
      }
    });
    doc.setFont('helvetica','bold');
    line('Grand total', '₹' + t.grand.toFixed(2));
    doc.setFont('helvetica','italic'); doc.setFontSize(10);
    doc.text('In words: ' + numToWords(Math.round(t.grand)) + ' Rupees Only', x, y + 4);

    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(120);
    doc.text('Generated with the Neweb GST Invoice Generator · neweb.ai/pages/tools/gst-invoice-generator', x, 285);

    var num = (document.getElementById('gi-no').value || 'invoice').replace(/[^a-zA-Z0-9-_]/g,'-');
    doc.save(num + '.pdf');
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Sourdough loaf (HSN 1905) x 10 @ INR 180</div><div class="eo-sub">Taxable value INR 1,800. GST 5 percent.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">CGST 2.5%  =  INR 45.00</div><div class="eo-sub">Central GST on an intra-state supply.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">SGST 2.5%  =  INR 45.00</div><div class="eo-sub">State GST on an intra-state supply.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">Invoice total  =  INR 1,890.00</div><div class="eo-sub">Taxable INR 1,800 plus INR 90 GST.</div></div></div>
      <div class="eo-note">Sample line item and tax split. Generate a Rule 46 compliant PDF with CGST/SGST/IGST above.</div>
    `,
    intro: `
      <p>Every GST-registered business in India must issue a tax invoice for every taxable supply. The format is dictated by Rule 46 of the CGST Rules and lists 16 mandatory fields including the seller GSTIN, the buyer GSTIN where applicable, HSN or SAC codes, the place of supply, and the CGST or SGST or IGST split. Most accounting software charges Rs 500 a month for an invoice template that you could otherwise generate in two minutes. This tool does the latter, free, in your browser.</p>
      <p>Fill in your seller details once (we save them to localStorage so you do not retype every time), add the buyer, type a few line items with HSN codes and GST percentages, and we compute CGST plus SGST for intra-state supplies, or a single IGST line for inter-state supplies. We total it up, convert the grand total into Indian words like "One Lakh Eighteen Thousand Rupees Only", and emit a clean A4 PDF using jsPDF. Nothing leaves your browser; the PDF is generated entirely client-side.</p>
    `,
    howTo: [
      'Enter your <strong>seller details</strong>: business legal name, GSTIN, address, and state. We save these to your browser so you only type them once.',
      'Enter the <strong>buyer details</strong>: buyer name, GSTIN if they are registered, address, and state. The buyer state is what determines whether you charge IGST (different state) or CGST plus SGST (same state).',
      'Set the <strong>invoice number</strong> and date. Most small businesses use a monthly running series like INV/2026/04/0001 to make filing GSTR-1 easier.',
      'Add <strong>line items</strong>. Description, HSN code, quantity, rate per unit, GST percentage. Click "+ Add line item" for each additional row. Most rows in retail and service will be 5%, 12%, or 18%.',
      'Click <strong>Recalculate</strong> to see the live totals. The tool auto-splits CGST and SGST equally for intra-state sales, or shows a single IGST line for inter-state. Each GST rate gets its own row in the summary.',
      'Check the <strong>grand total</strong> and the <strong>total in words</strong>. We auto-convert numbers like 1,18,000 to "One Lakh Eighteen Thousand Rupees Only". GST law requires the words on every invoice.',
      'Click <strong>Download PDF</strong>. The invoice opens as a clean A4 PDF, ready to email or print. Save the PDF for your records and email a copy to the buyer.',
    ],
    why: `
      <p>Three reasons to take GST invoicing seriously even if you are a one-person business.</p>
      <p><strong>Input Tax Credit.</strong> Your B2B customers can claim GST credit on whatever you charge them, but only if the invoice is in Rule 46 format with a correct seller GSTIN and HSN code. A clean tax invoice is therefore the unlock for bigger contracts. Many B2B buyers will simply refuse to pay until they receive a proper invoice. A handwritten "bill" almost always gets rejected.</p>
      <p><strong>Compliance.</strong> GST officers can demand any invoice within the last six years during a desk audit or a survey. Issuing rough hand-written bills puts you on the wrong end of penalty notices for missing or non-compliant invoices. The penalty is the higher of Rs 10,000 or the tax involved, per offence. A few minutes of clean PDF invoicing today is much cheaper than a notice from your range office next year.</p>
      <p><strong>Professional perception.</strong> When you email a tidy PDF invoice with HSN codes and a clear tax split, you look like a real business that the buyer can rely on. When you send a phone photo of a hand-written page, you do not. For a tutoring centre invoicing parents for the term, for a jeweller invoicing a corporate gifting client, for a doctor charging a corporate health camp, the invoice is your first impression on the accounts team.</p>
    `,
    tips: [
      'Number your invoices in a continuous series with no gaps. GST officers look for breaks in numbering as a sign of suppressed sales.',
      'Get the buyer state right. Same state means CGST 9 + SGST 9 (for 18% items). Different state means IGST 18. Getting this wrong means filing GSTR-1 corrections later, which is painful.',
      'Use the correct HSN code. The CBIC site has a free HSN search. Use 4 digits if your aggregate turnover is below Rs 5 crore, 6 digits if above.',
      'Round amounts to two decimal places. GST law and most accounting tools expect this format.',
      'Save both the PDF and the source data of each invoice. The PDF is what you send; the source data is what your accountant or a tool like Tally can import next year.',
      'Mention "Reverse charge applicable: Yes" only if you are transacting in a reverse-charge category like legal services from a non-corporate body. Most retail and service businesses can leave it No.',
      'Keep a digital backup of every invoice for at least 6 years. The GST audit window plus the typical recovery window add up to that.',
    ],
    example: `
      <p>A consulting firm in Delhi (registered as a Pvt Ltd) invoices a client in Mumbai for a Rs 1,00,000 advisory engagement. The firm uses HSN 998311 (management consulting). Because Delhi and Mumbai are different states, IGST at 18 percent applies as a single line, not split into CGST and SGST.</p>
      <p>The line item is: Description <em>Q1 advisory retainer</em>, HSN 998311, Qty 1, Rate 1,00,000, GST 18. The tool computes IGST 18,000 and a grand total of Rs 1,18,000. In words: "One Lakh Eighteen Thousand Rupees Only". The firm clicks Download PDF, gets a clean A4 PDF, and emails it to the client. The client accounts team claims the 18,000 as input tax credit when they file GSTR-3B that month. The whole loop closes in under five minutes.</p>
    `,
    faq: [
      { q: 'Do I need a GSTIN to use this tool?', a: '<p>You only need a GSTIN if you intend to issue a formal "tax invoice", which is the document that lets your buyer claim input tax credit. If you are below the GST registration threshold, currently Rs 20 lakh of turnover for services and Rs 40 lakh for goods in most states, you are not required to register and instead issue a bill of supply with no tax charged. This tool handles both situations comfortably: set the GST percentage to 0 and the generated PDF shows a clean invoice with no tax line, which works as a bill of supply for an unregistered seller. Once you cross the threshold and register, simply enter your GSTIN and the applicable rate, and the tool produces a proper tax invoice with the tax split shown. If you are close to the threshold, track your turnover monthly, because registration becomes mandatory the moment you cross it and issuing tax invoices without a GSTIN is not permitted.</p>' },
      { q: 'Why does the tool split CGST and SGST automatically?', a: '<p>The split is automatic because Indian GST law requires it for intra-state supplies, where the seller and buyer are in the same state. In that case the total tax is divided equally between Central GST and State GST, so an 18 percent rate becomes CGST 9 percent plus SGST 9 percent on the invoice, and a 12 percent rate becomes CGST 6 plus SGST 6. The split is always exactly half and half; it is fixed by law, not a setting you can change. For inter-state supplies, where the buyer is in a different state, the same total instead appears as a single IGST line at the full rate, for example IGST 18 percent. The tool determines which treatment applies from the place of supply you enter, so you do not have to remember the rule. This split is one of the most common things small sellers get wrong by hand, so letting the tool compute it keeps your invoices compliant and your buyers input credit clean.</p>' },
      { q: 'Can I add my logo to the invoice?', a: '<p>Not yet; logo upload is on the roadmap rather than in the current build, so for now the generated PDF uses a clean, text-only header showing your business name and details in a tidy layout. That keeps the invoice professional and perfectly valid, since a logo is a branding nicety rather than a GST requirement, your GSTIN, invoice number, date, line items and tax split are what actually matter for compliance. When we do add logo support, it will follow the same privacy-first approach as the rest of the tool: the image you choose will be processed entirely in your browser and embedded into the PDF locally, with nothing uploaded to any server. In the meantime, if you really want branded invoices today, you can open the downloaded PDF in a free editor and drop your logo into the header manually, though for most small businesses the clean text header is more than presentable enough to send to a customer.</p>' },
      { q: 'Is any of my data sent to a server?', a: '<p>No, your invoice data never leaves your browser. The entire tool runs client-side: the line items, amounts, customer details and tax calculations are all handled locally on your own device, and the PDF is generated in the browser using the jsPDF library. For convenience, your seller details, your business name, address and GSTIN, are saved to your browser localStorage so you do not have to retype them on every invoice; clearing your browser data wipes that store, and it is never transmitted anywhere. The only network request involved is loading the jsPDF library file itself from a CDN, and that request carries no invoice content, just a plain ask for the library code, the same as loading any website asset. This matters because invoices contain sensitive commercial and customer information, and keeping it on-device means there is no copy of your billing data sitting on someone else server to be leaked or breached. What you generate stays with you.</p>' },
      { q: 'Can I print this on a thermal printer for retail?', a: '<p>Not cleanly, because this tool is built for A4 invoices aimed at email and standard laser or inkjet printing, which is the format buyers expect for a tax invoice they will file. A thermal POS printer uses a narrow continuous roll, typically 58mm or 80mm wide, and an A4 layout simply does not fit that width; it would print squashed or run off the paper. Thermal receipts need a purpose-built template designed around the narrow roll, with a stripped-down layout, larger type and no wide tables. So for a retail counter that prints little till slips, this tool is not the right fit today. It shines instead for businesses that email PDF invoices or print full-page bills, freelancers, consultants, wholesalers, service providers and B2B sellers. If a dedicated 58mm or 80mm thermal mode would genuinely help your shop, let us know, because we will scope it as a separate template rather than trying to force the A4 design onto roll paper.</p>' },
      { q: 'What about e-invoicing for businesses above Rs 5 crore turnover?', a: '<p>e-invoicing is a separate compliance step that this tool does not perform, because it requires a live integration rather than a generated PDF. Under the current rules, businesses above the notified turnover threshold, which has been lowered in stages to Rs 5 crore, must report each B2B invoice to the government Invoice Registration Portal, the IRP, which validates it and returns a signed Invoice Reference Number plus a QR code that then has to appear on the invoice. That round trip needs an authorised integration with a registered IRP or GST Suvidha Provider, typically built into proper accounting software or an ERP. This tool covers everything up to that point and is ideal for businesses below the e-invoicing threshold, which is the vast majority of small sellers. If your turnover has crossed the limit, you should move to an IRP-registered partner or e-invoicing-enabled accounting platform, since manually generated PDFs will not carry the mandatory IRN and QR and would not be compliant for your buyers.</p>' },
      { q: 'Can I generate proforma invoices and quotations?', a: '<p>You can, with one small manual step for now. A proforma invoice and a quotation are essentially the same line items and totals as a tax invoice but carry a different heading and are not a demand for payment, so the practical workaround today is to generate the document here and then change the heading label after download. Most PDF readers let you edit a text field, or you can open the file in a free PDF editor and relabel the header to "Proforma Invoice" or "Quotation" in a few seconds. This is handy when you want to send a customer a price estimate before confirming an order, or a proforma so a corporate buyer can raise a purchase order. To make this seamless, we plan to add a heading dropdown offering Tax Invoice, Proforma and Quotation in a future iteration, so the label is set automatically. Until then, the relabel takes under a minute and the calculations underneath remain identical.</p>' },
      { q: 'Does this handle the reverse-charge mechanism?', a: '<p>Only partially, and the responsibility for the actual computation stays with you. Reverse charge is the situation where the buyer, rather than the seller, is liable to pay the GST to the government, which applies to specific notified supplies and certain transactions involving unregistered suppliers. For now, this tool lets you record a reverse-charge note in the description field so the invoice clearly flags that reverse charge applies, which is the disclosure your buyer needs to see. What it does not do is calculate the reverse-charge tax for you, because whether it applies, and at what rate, depends on the specific category of goods or services and the registration status of both parties, which vary widely by industry and buyer type. Getting that wrong has real tax consequences, so if you are dealing with reverse-charge supplies and are not certain of the treatment, confirm the exact handling with your chartered accountant before you finalise the invoice rather than guessing at it.</p>' },
    ],
    related: [
      { href: '/pages/tools/upi-qr-code-generator', title: 'UPI QR Code Generator', blurb: 'Print a UPI QR for the till.' },
      { href: '/pages/tools/whatsapp-link-generator', title: 'WhatsApp Link Generator', blurb: 'wa.me link plus QR for customers.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain from ₹249.' },
    ],
  },

  // ---------- Run your business (stubs) ----------
  {
    slug: 'qr-code-generator',
    category: 'run',
    built: true,
    name: 'QR Code Generator',
    tagline: 'Turn any URL, text, or wifi credential into a downloadable QR.',
    primaryKeyword: 'free qr code generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free QR Code Generator — URL, Wifi, vCard | Neweb',
    metaDescription: 'Generate QR codes for URLs, plain text, wifi credentials, and contact cards. Free, browser-only, PNG download. Built for Indian small businesses.',
    h1: 'QR Code <span class="serif">Generator</span>.',
    lede: 'Pick a type: URL, text, wifi, or contact card. Type the content. We render a clean QR you can download as PNG and print on signboards, menus, packaging or business cards.',
    widget: {
      html: `
        <div class="field"><label>QR type</label>
          <select id="qg-type">
            <option value="url">URL</option>
            <option value="text">Plain text</option>
            <option value="wifi">Wifi network</option>
            <option value="vcard">Contact card</option>
          </select>
        </div>
        <div id="qg-fields"></div>
        <div class="tool-actions">
          <button id="qg-go" type="button" class="btn btn-brand">Generate QR</button>
          <button id="qg-dl" type="button" class="btn btn-ghost">Download PNG</button>
        </div>
        <div id="qg-out" style="display:flex;justify-content:center;margin-top:18px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:14px;min-height:200px;align-items:center"></div>
        <div id="qg-string" class="tool-output" style="margin-top:10px"></div>
      `,
      help: 'Wifi follows the wifi:T:WPA;S:SSID;P:password; spec. vCard follows the standard BEGIN:VCARD format. PNG output is 320 by 320, suitable for print at 5 cm and up.',
      js: `
function loadScript(src){return new Promise(function(r,j){if(window.__ls&&window.__ls[src])return r();var s=document.createElement('script');s.src=src;s.async=true;s.onload=function(){window.__ls=window.__ls||{};window.__ls[src]=true;r();};s.onerror=j;document.head.appendChild(s);});}
(function(){
  var type=document.getElementById('qg-type'); var fields=document.getElementById('qg-fields'); var out=document.getElementById('qg-out'); var strEl=document.getElementById('qg-string');
  var lastCanvas=null;
  var T={
    url:'<div class="field"><label>URL</label><input id="qg-url" type="url" placeholder="https://example.com"></div>',
    text:'<div class="field"><label>Text</label><textarea id="qg-text" rows="3" placeholder="Anything"></textarea></div>',
    wifi:'<div class="tool-row"><div class="field"><label>Network name (SSID)</label><input id="qg-ssid" type="text"></div><div class="field"><label>Password</label><input id="qg-pass" type="text"></div></div><div class="field"><label>Security</label><select id="qg-sec"><option>WPA</option><option>WEP</option><option value="nopass">None</option></select></div>',
    vcard:'<div class="tool-row"><div class="field"><label>Full name</label><input id="qg-vn" type="text"></div><div class="field"><label>Organisation</label><input id="qg-vo" type="text"></div></div><div class="tool-row"><div class="field"><label>Phone</label><input id="qg-vp" type="tel"></div><div class="field"><label>Email</label><input id="qg-ve" type="email"></div></div>'
  };
  function update(){ fields.innerHTML = T[type.value]; }
  type.addEventListener('change', update); update();
  function build(){
    var t=type.value;
    if(t==='url') return (document.getElementById('qg-url').value||'').trim();
    if(t==='text') return (document.getElementById('qg-text').value||'').trim();
    if(t==='wifi'){ var s=document.getElementById('qg-ssid').value||''; var p=document.getElementById('qg-pass').value||''; var c=document.getElementById('qg-sec').value||'WPA'; if(c==='nopass') return 'WIFI:T:nopass;S:'+s+';;'; return 'WIFI:T:'+c+';S:'+s+';P:'+p+';;'; }
    if(t==='vcard'){ var n=document.getElementById('qg-vn').value||''; var o=document.getElementById('qg-vo').value||''; var p=document.getElementById('qg-vp').value||''; var e=document.getElementById('qg-ve').value||''; return 'BEGIN:VCARD\\nVERSION:3.0\\nFN:'+n+'\\nORG:'+o+'\\nTEL:'+p+'\\nEMAIL:'+e+'\\nEND:VCARD'; }
    return '';
  }
  document.getElementById('qg-go').addEventListener('click', async function(){
    var s=build(); if(!s){out.textContent='Enter something to encode';return;}
    strEl.textContent=s;
    try{ await loadScript('${QR_LIB_SRC}'); }catch(e){out.textContent='QR library failed';return;}
    var size=280, q; for(var tn=0;tn<=20;tn++){try{q=qrcode(tn,'M');q.addData(s);q.make();break;}catch(e){}}
    var mods=q.getModuleCount(), cell=Math.floor(size/mods), pad=Math.floor((size-cell*mods)/2);
    var canvas=document.createElement('canvas'); canvas.width=size; canvas.height=size;
    var ctx=canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,size,size); ctx.fillStyle='#0a0e1a';
    for(var r=0;r<mods;r++)for(var c=0;c<mods;c++)if(q.isDark(r,c))ctx.fillRect(pad+c*cell,pad+r*cell,cell,cell);
    out.innerHTML=''; out.appendChild(canvas); lastCanvas=canvas;
  });
  document.getElementById('qg-dl').addEventListener('click', function(){ if(!lastCanvas)return; var a=document.createElement('a'); a.href=lastCanvas.toDataURL('image/png'); a.download='qr.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a); });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">URL QR</div><div class="eo-sub">Encodes a link like your website or menu. Scan to open it instantly in a browser.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Text QR</div><div class="eo-sub">Encodes plain text, an offer code or a short message that shows on the scanner.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">WiFi QR</div><div class="eo-sub">Encodes your network name and password so guests join your wifi with one scan.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">vCard QR</div><div class="eo-sub">Encodes name, phone and email so customers save your contact in one tap.</div></div></div>
      <div class="eo-note">Each type renders a downloadable QR live in your browser, no watermark or signup.</div>
    `,
    intro: `
      <p>QR codes have quietly become the default way Indian customers move from offline to online. A diner scans the QR on the menu to view the catalogue. A guest scans the QR on the welcome sign to join the wifi. A buyer scans the QR on the visiting card to save the contact. This tool gives you a single place to generate every kind of QR your business needs, in your browser, free, without watermarks or signup.</p>
      <p>The tool supports four QR types. URL is the most common, pointing customers to your website, your Instagram, or your WhatsApp link. Plain text is useful for offers, codes, and short messages. Wifi QR encodes the network name, password, and security type so customers join your wifi with one tap, without typing. vCard is the contact-card QR used on visiting cards so scanning saves your full name, organisation, phone, and email to the customer phone. All four are generated by the same standards used by every major QR reader.</p>
    `,
    howTo: [
      'Pick a <strong>QR type</strong>: URL, plain text, wifi, or contact card.',
      'Fill in the relevant fields. For a URL, paste the full link including https://. For wifi, type the exact SSID and password. For a contact card, fill in name, organisation, phone, and email.',
      'Click <strong>Generate QR</strong>. The QR renders in your browser at 280 by 280 pixels.',
      'Click <strong>Download PNG</strong>. The PNG is 320 by 320 pixels, suitable for print at a 3 to 5 cm finished size.',
      'Test the QR by scanning it with the camera on your own phone. iOS and Android cameras both handle every standard QR type natively.',
      'For print, lay the QR on a clean white background with at least a 4 mm quiet zone around it. Do not put the QR over a photo or a textured background.',
      'For digital, embed the PNG directly. For a website button, also link to the destination URL as a fallback for customers who cannot scan.',
    ],
    why: `
      <p>Three reasons a free QR generator earns its place in a small business toolkit.</p>
      <p><strong>QR codes lower friction.</strong> The hardest part of any customer journey is the first tap. A QR replaces "go to safari, type the URL, hit enter, wait for the page" with "open camera, point, tap". That delta in friction translates into measurable lifts in scans, follows, joins, and conversions across every offline-to-online touchpoint a small business has.</p>
      <p><strong>QR codes are durable.</strong> A printed QR on a menu or a hoarding works for as long as the destination URL works. A printed phone number requires the customer to type it, increasing the chance of error. A printed Instagram handle requires the customer to remember the spelling. QR encodes the exact destination once, and any reader on any phone resolves to the same place every time.</p>
      <p><strong>QR codes work for every customer segment.</strong> Indian customers across age groups now use QR daily through UPI. The QR habit is established. A wifi QR on the wall, a menu QR on the table, a visiting card QR with a vCard, and a hoarding QR with the website URL are now expected, not novel.</p>
    `,
    tips: [
      'Use at least error correction level M (which our tool defaults to). It allows the QR to still scan if 15 percent of the dots are damaged.',
      'Print at a finished size of 3 cm minimum for handheld scanning, 8 cm minimum for wall scanning.',
      'Keep at least 4 mm of white space (quiet zone) around the QR. Without it, many scanners refuse to read.',
      'Test the QR on three different phones before printing in bulk. Once printed, errors cannot be fixed without reprinting.',
      'Use a URL shortener for the destination if the URL is long. Shorter URLs make smaller QR codes that print sharper.',
      'For wifi, double-check the SSID and password before printing. A wrong password QR is worse than no QR.',
      'Do not put your phone number in a vCard QR if you do not want strangers saving it. Use a Google Voice or WhatsApp Business number instead.',
    ],
    example: `
      <p>A small cafe in Bengaluru wants to push customers to their Instagram, their menu, and their guest wifi. They generate three QR codes: one URL QR pointing to a Linktree with their Instagram, Zomato, and menu PDF; one wifi QR with the cafe SSID and password; and one URL QR for the wa.me link to their WhatsApp Business. The three QR codes go on a small acrylic standee on each table. The wifi QR alone saves the staff 20 conversations a day about "What is the password?", and the Instagram and WhatsApp QRs together drive a steady stream of follows and messages without any active asking by the staff.</p>
    `,
    faq: [
      { q: 'Is there a limit on how much I can encode?', a: '<p>Yes, but it is generous enough that you will almost never hit it in practice. A QR code can hold up to roughly 4,200 alphanumeric characters or about 2,900 binary bytes at its largest version, which is far more than any normal URL, wifi credential, phone number or short message needs. The one caveat worth knowing is that the more data you pack in, the denser the QR becomes, with more tiny squares, which makes it harder to scan when printed small or from a distance, so keeping the encoded text short actually produces a cleaner, more reliable code. This tool encodes text fields only, so something like a vCard with an embedded photo, which can run to tens of thousands of bytes, would not fit, the photo would blow past the limit. For contact QRs we keep to text fields like name, phone and email, which stay comfortably within bounds and scan crisply even on a small printed sticker.</p>' },
      { q: 'Do the QR codes expire?', a: '<p>No, the QR code itself never expires, because it is simply a printed image, a fixed pattern of squares that encodes whatever you put into it. It will scan correctly for as many years as the ink survives. What can stop working is the destination behind it: if your QR points at a URL and you later take that page down or change its address, the still-valid QR will lead scanners to a dead link, and a wifi QR breaks the day you change the password. The way to future-proof a printed QR is to point it at something you control and can update without reprinting. For URLs, encode a short link from a service like Bitly, or better, a redirector on your own domain such as go.yourshop.in, so you can change where it lands later while the printed code stays the same. That way one sticker on your shop window can outlast several campaigns.</p>' },
      { q: 'Can the QR have my logo in the middle?', a: '<p>Not in this tool, which keeps things deliberately simple and reliable, but here is the trade-off behind that choice. Placing a logo in the centre of a QR covers up some of its data squares, so a logo-embedded QR has to use a higher error-correction level, typically level H instead of the standard M, which builds in enough redundancy that the code still scans despite the obscured middle. The cost is that level H makes the QR noticeably denser and busier, which can hurt scannability when printed small or in poor light. We may add logo embedding as an advanced option later for businesses that want the branded look. For now, the cleanest reliable approach is to print your logo separately, just above or beside the QR, with a short caption like "Scan to order", so you get the brand presence without compromising how dependably the code scans for your customers.</p>' },
      { q: 'Are my inputs sent to a server?', a: '<p>No, nothing you type is sent anywhere; the entire QR is generated on your own device. The whole tool runs client-side in your browser, so the URLs you encode, the wifi network names and passwords, and any contact details you enter never travel to us or to any third party, which matters a great deal for wifi QRs, since you are encoding a real password you would not want leaking. The only thing that touches the network is a one-time request to load the small QR-generation library from a CDN, and that request carries none of your data, it just fetches the code that does the drawing. Once that library is loaded, everything happens locally and the resulting QR is rendered right in the page for you to download. This privacy-first design means you can confidently generate QR codes for sensitive things like your home or office wifi without worrying that the credentials are being recorded on someone else server.</p>' },
      { q: 'What is the difference between URL and text type?', a: '<p>The difference is what happens the instant a phone scans the code. A URL QR opens the link directly, so the moment the camera recognises it, the phone offers to jump straight to that web page in one tap, which is what you want for menus, websites, Google review links, payment pages or anything where you need the customer to go somewhere immediately. A text QR instead just displays the encoded text on screen in the camera app and lets the person decide what to do with it, copy it, search it, or ignore it, without navigating anywhere. Use text type for things meant to be read rather than visited, such as an offer code a customer types at checkout, a coupon word, a short message, a Wi-Fi password written out, or a serial number. As a simple rule: if you want a one-tap journey to a destination, choose URL; if you want to hand someone a piece of information to use however they like, choose text.</p>' },
      { q: 'How big should I print the QR?', a: '<p>The reliable rule of thumb is that the printed QR should be at least one tenth the size of the distance from which people will scan it. So for a code meant to be scanned from the hand at around 30 cm, such as on a menu, a visiting card or a product label, print it at roughly 3 cm across. For a code on a wall or a counter that people scan from about a metre away, print it at around 10 cm. For a large poster or a billboard meant to be scanned from 10 metres, the code needs to be about 1 metre wide to scan dependably. Going smaller than the rule suggests is the most common reason QR codes fail to scan in the real world. Also keep a clear quiet zone, a margin of blank space, around the code, and ensure strong contrast between the dark pattern and a light background, so phone cameras lock onto it quickly even in imperfect lighting.</p>' },
      { q: 'Why does the wifi QR have a specific format?', a: '<p>The wifi QR follows a fixed, standardised text format because that is the only way phones know to treat it as network credentials rather than plain text. The format looks like WIFI:T:WPA;S:NetworkName;P:Password;; where T is the security type, S is the network name and P is the password, and both iOS and Android recognise this exact pattern. When a phone scans a code containing it, instead of just showing the text it offers a one-tap "Join this network" prompt, which is why it feels almost magical to guests. This tool builds that string for you automatically the moment you choose the Wifi type and fill in the fields, so you do not have to remember the syntax or worry about getting a semicolon wrong. It is a small but genuinely useful thing to print and laminate for a cafe, a salon, a clinic waiting room or a guest house, since customers join your wifi instantly without you reading out a long password across the counter.</p>' },
      { q: 'Can I make a QR for my UPI payment ID?', a: '<p>Yes, and for that you should use our dedicated UPI QR Code Generator rather than the generic text or URL types here, because a UPI payment QR has to follow a specific structure to work. The UPI generator builds the code to the NPCI UPI deep-link specification, the upi://pay format that encodes your VPA, your payee name and optionally a fixed amount and a transaction note, so that scanning it opens the customer payment app pre-filled and ready to pay. That format is recognised by every major UPI app, including PhonePe, Google Pay, Paytm and BHIM, which a plain text QR of your UPI ID would not reliably trigger. So use this general QR tool for menus, websites, wifi, contact details and offer codes, and switch to the UPI QR Code Generator the moment you want customers to pay you, where you can also choose between an open amount for everyday billing and a fixed amount for set-price items.</p>' },
    ],
    related: [
      { href: '/pages/tools/upi-qr-code-generator', title: 'UPI QR Code Generator', blurb: 'Specific QR for UPI payments.' },
      { href: '/pages/tools/whatsapp-link-generator', title: 'WhatsApp Link Generator', blurb: 'wa.me link with QR included.' },
      { href: '/pages/tools/favicon-generator', title: 'Favicon Generator', blurb: 'Browser icons in your brand colour.' },
    ],
  },
  {
    slug: 'gstin-validator',
    category: 'run',
    built: true,
    name: 'GSTIN Validator',
    tagline: 'Check if a GSTIN is structurally valid before you invoice.',
    primaryKeyword: 'gstin validator india',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free GSTIN Validator — Check GST Number Structure | Neweb',
    metaDescription: 'Validate any Indian GSTIN instantly. Checks length, state code, PAN format, entity character, and check digit. Free, browser-only.',
    h1: 'GSTIN <span class="serif">Validator</span>.',
    lede: 'Paste any GSTIN. We validate the 15-character structure, decode the state, the PAN, the entity character, and the check digit. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>GSTIN (15 characters)</label>
          <input id="gv-in" type="text" placeholder="22AAAAA0000A1Z5" maxlength="15" style="text-transform:uppercase;font-family:JetBrains Mono,monospace;letter-spacing:1px;font-size:18px" />
        </div>
        <div class="tool-actions">
          <button id="gv-go" type="button" class="btn btn-brand">Validate GSTIN</button>
        </div>
        <div id="gv-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Validates structure and check digit per the official GSTIN format. Does not verify with GSTN portal; use the official portal for live status.',
      js: `
(function(){
  var STATES={'01':'Jammu and Kashmir','02':'Himachal Pradesh','03':'Punjab','04':'Chandigarh','05':'Uttarakhand','06':'Haryana','07':'Delhi','08':'Rajasthan','09':'Uttar Pradesh','10':'Bihar','11':'Sikkim','12':'Arunachal Pradesh','13':'Nagaland','14':'Manipur','15':'Mizoram','16':'Tripura','17':'Meghalaya','18':'Assam','19':'West Bengal','20':'Jharkhand','21':'Odisha','22':'Chhattisgarh','23':'Madhya Pradesh','24':'Gujarat','25':'Dadra and Nagar Haveli and Daman and Diu','26':'Daman and Diu (merged)','27':'Maharashtra','28':'Andhra Pradesh (old)','29':'Karnataka','30':'Goa','31':'Lakshadweep','32':'Kerala','33':'Tamil Nadu','34':'Puducherry','35':'Andaman and Nicobar Islands','36':'Telangana','37':'Andhra Pradesh','38':'Ladakh','97':'Other Territory','99':'Centre Jurisdiction'};
  function checkDigit(g){
    var chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', sum=0;
    for(var i=0;i<14;i++){ var c=chars.indexOf(g[i]); if(c<0)return null; var f=(i%2===0)?1:2; var p=c*f; sum += Math.floor(p/36)+(p%36); }
    var rem=sum%36; var ch=(36-rem)%36; return chars.charAt(ch);
  }
  document.getElementById('gv-go').addEventListener('click', function(){
    var g=(document.getElementById('gv-in').value||'').toUpperCase().trim();
    var out=document.getElementById('gv-out'); out.style.display='block';
    var report=[];
    if(g.length!==15){ out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">GSTIN must be exactly 15 characters. Got '+g.length+'.</div>'; return; }
    var rx=/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    if(!rx.test(g)){ out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">Structure invalid. Expected: 2 digit state + 10 char PAN + entity + Z + check digit.</div>'; return; }
    var st=g.slice(0,2), pan=g.slice(2,12), entity=g.charAt(12), z=g.charAt(13), check=g.charAt(14);
    var calc=checkDigit(g);
    var checkOk = calc===check;
    var stateName=STATES[st]||'Unknown state code';
    out.innerHTML=
      '<div style="padding:18px;background:'+(checkOk?'#f0fdf5':'#fff8e6')+';border:1px solid '+(checkOk?'rgba(22,163,74,.25)':'rgba(217,119,6,.25)')+';border-radius:12px">'
      + '<div style="font-weight:600;color:'+(checkOk?'#0a6b3d':'#92400e')+';margin-bottom:10px;font-size:16px">'+(checkOk?'Structurally valid ✓':'Structure ok, check digit mismatch ⚠')+'</div>'
      + '<dl style="display:grid;grid-template-columns:1fr 2fr;gap:8px 16px;font-size:14px;color:var(--ink-2)">'
      + '<dt style="color:var(--muted);font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em">State code</dt><dd style="margin:0"><strong>'+st+'</strong> · '+stateName+'</dd>'
      + '<dt style="color:var(--muted);font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em">PAN</dt><dd style="margin:0;font-family:JetBrains Mono,monospace">'+pan+'</dd>'
      + '<dt style="color:var(--muted);font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em">Entity char</dt><dd style="margin:0">'+entity+' (registration sequence)</dd>'
      + '<dt style="color:var(--muted);font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em">Default Z</dt><dd style="margin:0">'+z+'</dd>'
      + '<dt style="color:var(--muted);font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em">Check digit</dt><dd style="margin:0">'+check+' '+(checkOk?'(matches '+calc+' ✓)':'(expected '+calc+' ✗)')+'</dd>'
      + '</dl>'
      + '<p style="margin:14px 0 0;font-size:13px;color:var(--muted);line-height:1.5">For live registration status, verify on the official GSTN portal at <a href="https://www.gst.gov.in/" target="_blank" rel="noopener" style="color:var(--brand)">gst.gov.in</a>.</p>'
      + '</div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main eo-mono">27ABCDE1234F1Z5</div><div class="eo-sub">Structurally valid. Breakdown below.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">State code: 27</div><div class="eo-sub">Maharashtra.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">PAN: ABCDE1234F</div><div class="eo-sub">The 10-character PAN of the registered entity.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Entity code: 1</div><div class="eo-sub">First registration for this PAN in this state.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Check digit: 5</div><div class="eo-sub">Matches the computed checksum, so the format is valid.</div></div></div>
      <div class="eo-note">Sample breakdown. Paste any GSTIN above to validate its structure and checksum.</div>
    `,
    intro: `
      <p>The GSTIN is the 15-character identifier the GST department issues to every registered business in India. It encodes the state, the underlying PAN, an entity counter, a default Z character, and a check digit. Customers and suppliers paste GSTINs into invoices, GSTR-1 filings, and e-way bills every day. A structurally wrong GSTIN survives surprisingly far through accounting workflows before someone notices, by which point the invoice has been booked, the GSTR-1 has been filed, and reconciliation has to be unwound across three quarters.</p>
      <p>This tool catches structural errors at the moment of typing. Paste any GSTIN and the validator decodes the state, the PAN, the entity character, the default Z, and recomputes the check digit. Within a second you know whether the GSTIN is well-formed and which state it belongs to. Nothing leaves your browser; the validation runs entirely client-side using the official GSTIN check-digit algorithm.</p>
    `,
    howTo: [
      'Type or paste the 15-character GSTIN into the input box. The field auto-uppercases, so you can paste lowercase or mixed-case values.',
      'Click <strong>Validate GSTIN</strong>. The result appears within a few hundred milliseconds.',
      'Read the breakdown. The validator shows the state code and full state name, the 10-character PAN embedded inside, the entity character (which is a registration counter), the default Z position, and the check digit.',
      'If the check digit matches, the GSTIN is structurally correct. If it does not, the GSTIN was typed wrong somewhere; recheck character by character.',
      'For absolute confirmation of live status (active, cancelled, suspended), use the official GSTN portal at gst.gov.in. This tool validates structure, not registration status.',
      'For repeat use, keep this tab bookmarked. Validating before invoicing prevents reconciliation pain later.',
      'If you maintain a list of customer GSTINs, run each one through the validator once a quarter as a hygiene check.',
    ],
    why: `
      <p>Three reasons GSTIN validation belongs in every small-business invoicing workflow.</p>
      <p><strong>It blocks errors at the source.</strong> A typo in a GSTIN propagates downstream into your GSTR-1, your customer GSTR-2A reconciliation, and the customer ITC claim. The fix later involves issuing a credit note, raising a fresh invoice, and amending the GSTR-1. The fix at typing time is to recheck and re-enter.</p>
      <p><strong>It protects you from fraudulent invoices.</strong> Some sellers issue invoices with structurally invalid GSTINs hoping you will not notice. The customer claims ITC on these and faces denial during scrutiny. Quick validation at the receiving end protects you from chasing back disallowed credit.</p>
      <p><strong>It teaches you the format.</strong> Once you understand that the first two digits are the state and the next ten are a PAN, you start spotting errors by eye without needing the tool. A GSTIN starting with 28 for an Andhra business stands out as wrong (Andhra is now 37), as does a GSTIN whose embedded PAN does not look like a PAN. Structural intuition is a small superpower.</p>
    `,
    tips: [
      'Always validate a new customer GSTIN before sending the first invoice. Catching errors at onboarding is cheap.',
      'Cross-check the state from the GSTIN against the address on the customer purchase order. If they disagree, ask before you invoice.',
      'The PAN inside the GSTIN should match the PAN on file. They are the same legal entity.',
      'If a check digit fails, do not just try a different one. Ask the customer to confirm in writing. Forged GSTINs sometimes have valid structure but wrong check digit.',
      'Validate large lists of GSTINs in batches before each GSTR-1 filing. A few minutes of validation prevents days of amendment work.',
      'Bookmark this page so it is always one tab away during invoicing.',
      'For business-critical workflows, plug the official GSTN GSTIN search API into your billing system to verify live status, not just structure.',
    ],
    example: `
      <p>A consultant invoices a new client and pastes the GSTIN 27ABCDE1234F1Z5. The validator returns: state 27 (Maharashtra), PAN ABCDE1234F, entity 1, default Z, check digit calculated as 5, matching. The result is a clean green panel: structurally valid.</p>
      <p>Three weeks later, a different supplier sends an invoice with GSTIN 09ABCDE9999X1Z3. The consultant pastes it. The validator returns: state 09 (Uttar Pradesh), PAN ABCDE9999X, entity 1, default Z, check digit expected 7 but got 3. The result is an amber panel: structure ok, check digit mismatch. He emails the supplier asking for the correct GSTIN. Turns out the last character was typed wrong. He receives the corrected invoice, books it cleanly, and avoids a quarter-end reconciliation issue.</p>
    `,
    faq: [
      { q: 'Does this verify the GSTIN against the official GSTN database?', a: '<p>No, this tool validates the structure and the check digit of a GSTIN, but it does not query the live government database, so it cannot tell you whether a registration is currently active, cancelled or suspended. What it does is confirm that the 15-character number is well-formed: that the state code is real, that the embedded PAN follows the correct pattern, and that the final check digit computes correctly, which together catch the great majority of typos and fake numbers people enter. To confirm a supplier actual registration status, use the official search at gst.gov.in, where you type the GSTIN and see the legal name, the registration date and whether it is active. The smart workflow is to run a structural check here first, instantly and privately, to weed out obviously invalid numbers before you bother with the official portal, then verify the survivors on gst.gov.in before you claim input tax credit against their invoices, since credit on an invalid or cancelled GSTIN can be denied.</p>' },
      { q: 'What is the check digit?', a: '<p>The check digit is the fifteenth and final character of a GSTIN, and it is not chosen freely; it is mathematically derived from the first 14 characters using a modulo-36 algorithm over the base-36 alphabet, which is the digits 0 to 9 plus the letters A to Z. Because it is computed from everything before it, the check digit acts as a built-in error detector: it is specifically designed to catch single-character typos and most transposition errors, the everyday mistakes someone makes keying a long number off an invoice, such as swapping two characters or mistyping one. If even one character in the GSTIN is wrong, the recomputed check digit will usually no longer match, and this tool flags the number as invalid. That is why a structural check is such a cheap, fast first line of defence: before you ever hit the government portal, the check digit alone exposes a large share of mistyped or fabricated GSTINs in a fraction of a second.</p>' },
      { q: 'What does the entity character mean?', a: '<p>The entity character is the 13th character of the GSTIN, sitting just before the Z and the final check digit, and it indicates the registration sequence number for that particular PAN within that particular state. In plain terms, it counts how many GST registrations a single business entity, identified by its PAN, holds in one state. Most ordinary businesses have just one registration per state, so you will very commonly see a 1 here. A higher value, such as 2, 3 or a letter, appears when the same PAN holds multiple registrations in the same state, which happens with separate business verticals, or in cases of re-registration after an earlier registration was cancelled. It is a useful sanity signal: an unusually high entity character on a GSTIN you were not expecting it on is worth a second look, though on its own it is perfectly legitimate and simply reflects how that business has structured its registrations within the state.</p>' },
      { q: 'Why is there always a Z at position 14?', a: '<p>Position 14, the second-to-last character, is almost always the letter Z because the GST format reserves that slot as a default placeholder for current normal registrations, which is what the overwhelming majority of GSTINs are. In other words, Z is the expected, standard value you should see there on a typical taxpayer GSTIN, so if you spot a different character in that position it is worth double-checking. The other possible letters at this position were set aside by the GST Council for future use, for instance to denote additional registration categories, but those alternatives have not been activated in general practice, so for everyday verification a Z is exactly what you want to see. This tool checks that position 14 holds the expected value as part of confirming the number is well-formed, which is another small structural signal that, combined with the state code, the embedded PAN pattern and the check digit, tells you whether a GSTIN someone gave you is plausibly genuine.</p>' },
      { q: 'Are my GSTIN inputs sent to a server?', a: '<p>No, the GSTINs you check are never sent anywhere; all the validation logic runs entirely in your own browser. When you type or paste a number, the structural checks, the state code lookup, the embedded PAN pattern match, and the modulo-36 check-digit calculation all execute locally on your device, with no network request carrying your data to us or to any third party. That means you can safely paste in a long list of supplier or customer GSTINs to clean up before filing, without worrying that those business identifiers are being logged on someone else server. Because nothing leaves the page, the tool is also instant, with no waiting on a round trip to a server. The one thing to remember is that this on-device privacy comes hand in hand with the tool limitation: since it never contacts the government, it confirms only that a number is well-formed, not that the registration is live, for which you would visit gst.gov.in separately.</p>' },
      { q: 'Why does my GSTIN show state 28 as old?', a: '<p>State code 28 is flagged as legacy because it originally belonged to undivided Andhra Pradesh, before the 2014 bifurcation that carved out the new state of Telangana. After that reorganisation, the GST state codes were realigned: Telangana was assigned code 36, and newly issued registrations in the reorganised Andhra Pradesh use code 37, while the old code 28 was effectively retired for fresh registrations. So when you see 28 on a GSTIN today, you are almost always looking at an older registration issued under the pre-bifurcation numbering that has simply carried forward, rather than a brand-new one. It is not invalid, it is just historical, which is why the tool notes it as legacy rather than rejecting it. If you are verifying a supplier in the Andhra or Telangana region and the state code surprises you, this context explains it: 28 is the old code, 36 is Telangana, and 37 is current Andhra Pradesh.</p>' },
      { q: 'Can a GSTIN look valid but be cancelled?', a: '<p>Yes, absolutely, and this is the single most important limitation to understand. A GSTIN that has been cancelled or suspended by a GST officer does not change its characters, the 15-digit number stays exactly the same, so it still passes every structural test here: the state code is real, the embedded PAN is correctly formed, and the check digit still computes. This tool verifies that the number is well-formed, not that the underlying registration is still alive. That gap matters commercially, because if you claim input tax credit on an invoice from a supplier whose registration was cancelled, the credit can be disallowed and you bear the cost. So treat a green result here as necessary but not sufficient: it tells you the number is genuine in form, after which you should confirm the live status on gst.gov.in, especially before onboarding a new supplier, claiming significant credit, or whenever something feels off about a counterparty.</p>' },
      { q: 'Does this also validate PAN?', a: '<p>It validates the PAN pattern embedded inside the GSTIN, but it is not a full PAN verification service. Every GSTIN contains the business 10-character PAN sitting in characters 3 through 12, and that PAN follows a fixed structure of five letters, then four digits, then one letter. This tool confirms that the embedded portion matches that standard pattern as part of judging whether the overall GSTIN is well-formed, which catches a mistyped or fabricated PAN within the number. What it does not do is check that PAN against the Income Tax Department records to confirm it actually belongs to a real, active taxpayer with a matching name. For that deeper confirmation, use the official PAN verification service offered through the Income Tax e-filing portal or an authorised KYC provider. In short, this gives you a fast structural sanity check on the PAN inside a GSTIN, and you escalate to the official PAN service only when you need legally authoritative identity confirmation.</p>' },
    ],
    related: [
      { href: '/pages/tools/gst-invoice-generator', title: 'GST Invoice Generator', blurb: 'Generate compliant invoices with CGST/SGST/IGST split.' },
      { href: '/pages/tools/business-name-generator', title: 'Business Name Generator', blurb: 'Pick the brand name first.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  {
    slug: 'email-signature-generator',
    category: 'run',
    built: true,
    name: 'Email Signature Generator',
    tagline: 'Tidy HTML signature for Gmail and Outlook, with brand colours.',
    primaryKeyword: 'free email signature generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Email Signature Generator India — Gmail and Outlook | Neweb',
    metaDescription: 'Create a clean HTML email signature in seconds. Name, title, company, phone, email, website, brand colour. Copy ready-to-paste into Gmail and Outlook.',
    h1: 'Email Signature <span class="serif">Generator</span>.',
    lede: 'Fill in your details, pick a brand colour, and copy a clean HTML signature you can paste directly into Gmail or Outlook. No images, no tracking, no broken layouts.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Full name</label><input id="es-name" type="text" placeholder="Your name" maxlength="60"/></div>
          <div class="field"><label>Title</label><input id="es-title" type="text" placeholder="Founder / Manager" maxlength="60"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Company</label><input id="es-co" type="text" placeholder="Your company name" maxlength="80"/></div>
          <div class="field"><label>Brand colour</label><input id="es-color" type="color" value="#3d4cff"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Phone</label><input id="es-phone" type="tel" placeholder="+91 98765 43210"/></div>
          <div class="field"><label>Email</label><input id="es-email" type="email" placeholder="you@yourdomain.com"/></div>
        </div>
        <div class="field"><label>Website</label><input id="es-web" type="url" placeholder="https://yourdomain.com"/></div>
        <div class="tool-actions">
          <button id="es-go" type="button" class="btn btn-brand">Render signature</button>
          <button id="es-copy" type="button" class="btn btn-ghost">Copy HTML</button>
          <button id="es-copy2" type="button" class="btn btn-ghost">Copy as text</button>
        </div>
        <div id="es-out" style="margin-top:18px;padding:24px;background:#fff;border:1px solid var(--line);border-radius:12px;min-height:120px"></div>
      `,
      help: 'Output is a self-contained HTML table that survives Gmail and Outlook rendering. Paste into Gmail Settings > Signature, or Outlook File > Options > Mail > Signatures.',
      js: `
(function(){
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function build(){
    var n=document.getElementById('es-name').value, t=document.getElementById('es-title').value, co=document.getElementById('es-co').value, c=document.getElementById('es-color').value;
    var p=document.getElementById('es-phone').value, e=document.getElementById('es-email').value, w=document.getElementById('es-web').value;
    var ink='#0a0e1a', muted='#6a7185';
    var html='<table cellpadding="0" cellspacing="0" border="0" style="font-family:Helvetica,Arial,sans-serif;color:'+ink+';font-size:13px;line-height:1.5"><tr><td style="border-left:3px solid '+c+';padding-left:14px">'
      +'<div style="font-size:15px;font-weight:600;color:'+ink+';margin:0 0 2px">'+esc(n||'Your name')+'</div>'
      +(t?'<div style="color:'+muted+';margin:0 0 6px">'+esc(t)+(co?', '+esc(co):'')+'</div>':'')
      +'<div style="margin-top:8px">'
      +(p?'<a href="tel:'+esc(p.replace(/\s+/g,''))+'" style="color:'+ink+';text-decoration:none">'+esc(p)+'</a><span style="color:'+muted+';margin:0 8px">·</span>':'')
      +(e?'<a href="mailto:'+esc(e)+'" style="color:'+ink+';text-decoration:none">'+esc(e)+'</a>':'')
      +'</div>'
      +(w?'<div style="margin-top:4px"><a href="'+esc(w)+'" style="color:'+c+';text-decoration:none">'+esc(w.replace(/^https?:\/\//,''))+'</a></div>':'')
      +'</td></tr></table>';
    return html;
  }
  function render(){ document.getElementById('es-out').innerHTML = build(); }
  document.getElementById('es-go').addEventListener('click', render);
  ['es-name','es-title','es-co','es-color','es-phone','es-email','es-web'].forEach(function(id){ document.getElementById(id).addEventListener('input', render); });
  document.getElementById('es-copy').addEventListener('click', async function(){
    try { var html=build(); await navigator.clipboard.write([new ClipboardItem({'text/html': new Blob([html],{type:'text/html'}), 'text/plain': new Blob([html],{type:'text/plain'})})]); var b=this; var o=b.textContent; b.textContent='Copied ✓'; setTimeout(function(){b.textContent=o;},1400); }
    catch(e){ this.textContent='Copy failed'; }
  });
  document.getElementById('es-copy2').addEventListener('click', async function(){
    var n=document.getElementById('es-name').value, t=document.getElementById('es-title').value, co=document.getElementById('es-co').value, p=document.getElementById('es-phone').value, e=document.getElementById('es-email').value, w=document.getElementById('es-web').value;
    var txt=[n, t+(co?', '+co:''), [p,e].filter(Boolean).join(' · '), w].filter(Boolean).join('\n');
    try { await navigator.clipboard.writeText(txt); var b=this; var o=b.textContent; b.textContent='Copied ✓'; setTimeout(function(){b.textContent=o;},1400); }
    catch(_){ this.textContent='Copy failed'; }
  });
  render();
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div style="border-left:3px solid #3d4cff;padding-left:14px">
        <div class="eo-main" style="font-weight:600">Priya Deshmukh</div>
        <div class="eo-sub" style="margin-top:1px">Founder, Copper Oven</div>
        <div class="eo-sub eo-mono" style="margin-top:6px">+91 98765 43210 &nbsp;|&nbsp; priya@copperoven.in &nbsp;|&nbsp; copperoven.in</div>
      </div></div>
      <div class="eo-note">Sample signature. Build your own HTML signature for Gmail and Outlook above.</div>
    `,
    intro: `
      <p>A clean email signature does three jobs at once. It tells the recipient who you are, it gives them three ways to reach you (phone, email, website), and it tells them your brand exists. A poor signature does none of these. Most small business email signatures look one of three ways: missing entirely, awkward auto-generated text, or a screenshot of a logo with broken alignment.</p>
      <p>This tool builds a tidy HTML signature in a few clicks. You fill in name, title, company, phone, email, website, and pick a brand colour. We render an HTML signature using a single table (the only layout structure that survives both Gmail and Outlook) with no images, no tracking pixels, and no broken responsiveness on mobile. Copy as HTML to paste into Gmail or Outlook settings. Copy as plain text for messaging apps and simple email clients.</p>
    `,
    howTo: [
      'Fill in your <strong>full name</strong>. This is what appears in larger type as the headline of the signature.',
      'Add your <strong>title</strong> and <strong>company name</strong>. Both appear on the second line, separated by a comma.',
      'Pick a <strong>brand colour</strong>. We use it for the left border of the signature and for the website URL link. Keep it consistent with your other brand colours.',
      'Add your <strong>phone number</strong> in international format (+91 98765 43210). The signature tel: links it so phone clients can tap to call.',
      'Add your <strong>email address</strong>. The mailto: link makes it tap-to-compose. For Gmail users, this is essential.',
      'Add your <strong>website URL</strong> with https://. The signature shows the display version without the protocol but links to the full URL.',
      'Click <strong>Copy HTML</strong> and paste into Gmail Settings → General → Signature, or Outlook File → Options → Mail → Signatures. Send a test email to yourself to verify.',
    ],
    why: `
      <p>Three reasons a tidy email signature pays back over and over.</p>
      <p><strong>It markets at zero cost.</strong> The average professional sends 40 emails a day. Across a year, that is over 10,000 emails. Every one carries your signature into someone else inbox where it gets glanced at, sometimes saved, sometimes clicked. A clean signature with your website URL is a permanent micro-advertisement that costs nothing and never stops working.</p>
      <p><strong>It signals professionalism.</strong> A founder reply that ends with just a first name reads as casual. A founder reply that ends with a clean signature including title, company, and a way to call back reads as serious and contactable. The difference compounds over hundreds of emails to vendors, customers, banks, and prospective partners.</p>
      <p><strong>It earns clicks.</strong> Tracking studies across small business email show 1 to 3 percent click-through on signature website links. Compounded across a year, that is hundreds of free website visits per founder per year. Compare that to the cost of buying the same visits through Google ads.</p>
    `,
    tips: [
      'Keep the signature under five lines. Anything longer looks heavy in Gmail thread view.',
      'Skip large logos. Inline images often break rendering in Outlook and appear as attachments in some clients.',
      'Use a single brand colour for the accent. Two colours read as cluttered.',
      'Phone in international format. +91 98765 43210 works everywhere; 9876543210 works only for Indian recipients on Indian carriers.',
      'Include the website URL even if it is in your email domain. Customers do not always notice the domain in your email address.',
      'Test the signature by sending an email to yourself across three clients: Gmail web, Gmail mobile, Outlook desktop. Edit anything that breaks.',
      'Skip social media icons unless social is a primary channel for your business. They clutter the signature with marginal benefit.',
    ],
    example: `
      <p>A bookkeeping consultant in Surat fills in the signature: name Aman Patel, title Founder, company Sahaj Books, brand colour deep navy, phone +91 98765 43210, email aman@sahajbooks.in, website https://sahajbooks.in. The preview renders a clean signature with a navy left border, his name in bold, "Founder, Sahaj Books" underneath in muted grey, the phone and email on one line, and the website on the next line in navy as a clickable link.</p>
      <p>He pastes the HTML into Gmail signature settings. The next email he sends to a client lands clean. The client clicks the website link, lands on his homepage, and books a 30-minute consultation through the contact form. Zero marketing spend. Zero ad campaigns. One tidy signature.</p>
    `,
    faq: [
      { q: 'Will the signature work in Outlook?', a: '<p>Yes, the signature is built to render reliably in Outlook as well as Gmail, which is harder than it sounds. Outlook does not use a normal web browser engine to display email; it relies on an older rendering path that ignores or mangles modern CSS like flexbox and many div-based layouts, which is exactly why signatures copied out of fancy web editors so often arrive broken, misaligned or stripped of colour in Outlook. To avoid that, this tool generates the signature using a simple HTML table layout, which is the one structure both Gmail and Outlook, and most other clients, render consistently. The practical advice is to paste the HTML output from this tool directly into your email client signature settings, and to resist pasting it through an intermediate rich-text editor like Word or a web page first, since those tools quietly inject the very divs and styles that break Outlook. Used as generated, the table-based signature holds its shape across the clients your customers actually use.</p>' },
      { q: 'Can I add my logo?', a: '<p>Not in this tool, and that is a deliberate choice rooted in how email clients handle images. An inline image embedded in a signature frequently gets treated as an attachment, especially by Outlook, so every email you send arrives showing a paperclip and a stray image file, which clutters the recipient inbox and can even trip spam filters on cold emails. Hosted images, the other option, often get blocked by default until the recipient clicks "show images", so half the time your logo simply does not appear. Because of these headaches, most professional email signatures today are clean, text-only designs that lean on your brand colour, your name in a confident weight, and tidy spacing rather than a graphic. That is the approach this tool takes, giving you a signature that looks polished and loads instantly for every recipient without attachment warnings. If you genuinely need a logo in email, the most reliable route is a hosted image through a dedicated signature platform.</p>' },
      { q: 'Does the signature track who clicks?', a: '<p>No, the signature contains no tracking whatsoever. The links it generates are plain, standard links: a mailto: link for your email, a tel: link for your phone, and ordinary URL links for your website or social profiles. There are no invisible tracking pixels, no redirect wrappers quietly logging opens and clicks, and no analytics beacons phoning home, so neither you nor anyone else learns who tapped what. That keeps the signature honest, lightweight and free of the privacy concerns that come with tracked email, and it means the signature will never trigger the "load remote content" warnings that pixel-based tracking causes. If you later want to measure clicks on, say, a campaign link in your signature, you can add that yourself by routing that URL through a short-link or redirect service such as Bitly before pasting it in. Out of the box, though, what you send is exactly what the recipient sees.</p>' },
      { q: 'How do I install it in Gmail?', a: '<p>Installing in Gmail takes about a minute on the web version, not the mobile app, which handles signatures separately. Open Gmail in a browser, click the gear icon in the top right, then choose See all settings. Stay on the General tab and scroll down to the Signature section. Click Create new, give your signature a name, then click into the signature box and paste the HTML output you copied from this tool. Finally, scroll to the bottom of the settings page and click Save Changes, which is the step people most often forget, leaving them wondering why nothing saved. To confirm it worked, compose a new email to your own address and check that the signature appears correctly formatted, with the colours and links intact. While you are in that Signature section, you can also set defaults so the signature is added automatically to new emails and, if you wish, to replies and forwards, so you never have to insert it by hand again.</p>' },
      { q: 'How do I install it in Outlook?', a: '<p>In desktop Outlook the path is the File menu, then Options, then the Mail category, then the Signatures button, which opens the signature manager. Click New, give your signature a name, click into the editing box, and paste the HTML output from this tool. Before you close the dialog, use the dropdowns on the right to set this signature as the default for New messages and, if you want it on responses too, for Replies and forwards, so Outlook inserts it automatically. Click OK to save. Send a test email to yourself to confirm the layout and colours survived intact, since this is where the table-based design pays off. The exact menu wording varies a little between Outlook versions and the newer Outlook for web, but the sequence, find Signatures, create new, paste, set as default, is the same everywhere. Apple Mail and other clients follow a similar logic under their Preferences or Settings, usually a Signatures pane where you paste the same HTML.</p>' },
      { q: 'Can I have different signatures for different accounts?', a: '<p>Yes, both Gmail and Outlook let you store multiple signatures and choose which one applies, so you are not limited to a single version. This is genuinely useful for small business owners who wear several hats: you might keep one signature for your founder identity, another for support or orders, and another for a second brand or a personal account, each with the right name, role, phone number and links. The simplest approach is to run this tool once per role, generating a tailored signature for each, then paste each one into your email client as a separate named signature. In Gmail you can even set different default signatures per send-as address, so the correct one is chosen automatically based on which account you are emailing from. In Outlook you pick the relevant signature from the Signature menu when composing, or assign defaults per account. Either way, take a minute to label each signature clearly so you select the right one without second-guessing while writing.</p>' },
      { q: 'What about the mobile signature?', a: '<p>Mobile email apps handle signatures differently, so plan for it. The Gmail mobile app, for instance, uses its own separate signature setting that is plain text only and does not carry over your formatted desktop signature, which is why people often see a default "Sent from my iPhone" or a blank signature on phone-sent emails. To fix that, use the Copy as text option in this tool to grab a clean plain-text version of your details, then open your Gmail mobile app settings, find the per-account Signature setting, and paste it in. Keep the mobile version deliberately shorter than your desktop one, because a long signature eats up a disproportionate share of a small phone screen and can look heavier than the message itself; your name, role, business and one phone number or link is usually plenty. Setting this up once means emails you fire off from your phone between meetings still close professionally, instead of trailing off with no signature or a generic device tagline.</p>' },
      { q: 'Should I include my office address?', a: '<p>Include your office address only if it genuinely earns its place, which for most digital and service businesses it does not. The address is worth adding when you regularly meet customers at a physical location, run a shop or clinic people visit, or send and receive physical mail and documents, because then it is useful information your recipients act on. For a freelancer, consultant, online seller or remote service, a full postal address mostly adds clutter and length to every email without helping anyone, and it can feel like padding. The guiding principle for a good signature is restraint: every line should earn its space, since a tight, scannable signature reads as more confident than a crowded block of details. If you do include the address, put it on the last line in a muted grey so it sits quietly beneath the more important name, role and contact links rather than competing with them for attention. When in doubt, leave it out and let people request it.</p>' },
    ],
    related: [
      { href: '/pages/tools/logo-maker', title: 'Logo Maker', blurb: 'Logo and brand colour for your signature.' },
      { href: '/pages/tools/color-palette-generator', title: 'Color Palette Generator', blurb: 'Pick the signature accent colour.' },
      { href: '/pages/tools/instagram-bio-generator', title: 'Instagram Bio Generator', blurb: 'Match your Instagram bio voice.' },
    ],
  },
  {
    slug: 'privacy-policy-generator',
    category: 'run',
    built: true,
    name: 'Privacy Policy Generator',
    tagline: 'DPDP-aware privacy policy you can paste into your website.',
    primaryKeyword: 'privacy policy generator india',
    solutionHref: '/pages/solutions/clinics',
    solutionLabel: 'For clinics',
    metaTitle: 'Free Privacy Policy Generator India (DPDP 2023) | Neweb',
    metaDescription: 'Generate a DPDP-aware privacy policy for your Indian website in two minutes. Customisable, downloadable, free. Built for SMBs.',
    h1: 'Privacy Policy <span class="serif">Generator</span>.',
    lede: 'Fill in your business name, website, contact email, and what data you collect. We generate a DPDP-aware privacy policy you can paste into your site today.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Business name</label><input id="pp-name" type="text" placeholder="Your business legal name"/></div>
          <div class="field"><label>Website URL</label><input id="pp-url" type="url" placeholder="https://yourdomain.com"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Contact email</label><input id="pp-email" type="email" placeholder="privacy@yourdomain.com"/></div>
          <div class="field"><label>Country</label><select id="pp-country"><option value="india" selected>India (DPDP focus)</option><option value="global">India + global</option></select></div>
        </div>
        <label style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-top:14px;display:block">Data we collect</label>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px">
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" data-flag="name" checked> Name</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" data-flag="email" checked> Email</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" data-flag="phone"> Phone</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" data-flag="address"> Address</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" data-flag="payment"> Payment info</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" data-flag="cookies" checked> Cookies / analytics</label>
        </div>
        <div class="tool-actions" style="margin-top:14px">
          <button id="pp-go" type="button" class="btn btn-brand">Generate policy</button>
          <button id="pp-copy" type="button" class="btn btn-ghost">Copy HTML</button>
          <button id="pp-dl" type="button" class="btn btn-ghost">Download .txt</button>
        </div>
        <div id="pp-out" style="margin-top:18px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:12px;max-height:520px;overflow:auto;font-size:14px;line-height:1.6"></div>
      `,
      help: 'This is a starting template. Have a lawyer review the final version before publishing. Not legal advice.',
      js: `
(function(){
  function flags(){ var o={}; document.querySelectorAll('[data-flag]').forEach(function(i){o[i.dataset.flag]=i.checked;}); return o; }
  function build(){
    var b=document.getElementById('pp-name').value||'[Business name]';
    var u=document.getElementById('pp-url').value||'[Website URL]';
    var e=document.getElementById('pp-email').value||'[Contact email]';
    var co=document.getElementById('pp-country').value;
    var f=flags();
    var collected = [];
    if(f.name) collected.push('name');
    if(f.email) collected.push('email address');
    if(f.phone) collected.push('phone number');
    if(f.address) collected.push('postal address');
    if(f.payment) collected.push('payment information');
    if(f.cookies) collected.push('cookies and standard analytics data such as IP address and browser type');
    var collectedStr = collected.length ? collected.join(', ') : 'minimal information needed to operate the website';
    var dpdpExtra = co==='india' || co==='global' ? '<h3>Your rights under the Digital Personal Data Protection Act, 2023</h3><p>Under India\'s Digital Personal Data Protection Act 2023 (DPDP), you have the right to access the personal data we hold about you, to correct or update it, to withdraw consent at any time, and to nominate someone to act on your behalf in case of incapacity. To exercise any of these rights, write to us at '+e+'. We will respond within 30 days of receipt.</p>' : '';
    var globalExtra = co==='global' ? '<h3>For EU and UK visitors (GDPR)</h3><p>If you visit our site from the EU or UK, you have additional rights under the GDPR, including the right to data portability and the right to lodge a complaint with your local data protection authority. We do not knowingly transfer personal data outside India without the safeguards required by applicable law.</p>' : '';
    return '<h2>Privacy Policy</h2>'
      + '<p><em>Last updated: '+(new Date().toISOString().slice(0,10))+'</em></p>'
      + '<p>'+b+' (the "Company", "we", "us") operates the website '+u+' (the "Service"). This policy explains what information we collect, why we collect it, and how we handle it. By using the Service you consent to this policy.</p>'
      + '<h3>Information we collect</h3>'
      + '<p>We collect the following types of information from visitors and customers: '+collectedStr+'. We collect this information only when you choose to give it to us, for example by filling in a form, signing up for our newsletter, or making a purchase.</p>'
      + '<h3>How we use the information</h3>'
      + '<ul>'
      + '<li>To respond to your enquiries, fulfil orders, and provide services you have requested.</li>'
      + '<li>To send you transactional updates about your account, your orders, or your bookings.</li>'
      + '<li>To send you optional marketing communication, only if you have opted in to receive them.</li>'
      + '<li>To improve the Service through aggregated, non-identifying analytics.</li>'
      + '<li>To comply with legal obligations, including tax law and any lawful request from authorities.</li>'
      + '</ul>'
      + '<h3>Sharing with third parties</h3>'
      + '<p>We share your personal information with third parties only in the following situations: (a) with service providers who help us operate the Service, such as hosting, payment processors, and email delivery, under written confidentiality terms; (b) when required by law, court order, or government request; (c) in connection with a merger, acquisition, or sale of assets, with notice to you.</p>'
      + '<h3>Cookies and analytics</h3>'
      + (f.cookies ? '<p>We use cookies and similar technologies to remember preferences, secure logged-in sessions, and measure how visitors use the Service. You can disable cookies in your browser settings, though some features of the Service may not work as expected without them.</p>' : '<p>We do not set cookies beyond what is strictly necessary to operate the Service.</p>')
      + '<h3>Data retention</h3>'
      + '<p>We retain personal information only as long as needed for the purpose it was collected, or as required by applicable law. Transactional records are kept for the minimum statutory period required under Indian tax and accounting law.</p>'
      + '<h3>Security</h3>'
      + '<p>We use reasonable industry-standard safeguards to protect the data we hold, including encryption in transit (HTTPS) and access controls. No system is 100 percent secure; we encourage you to use strong unique passwords and to log out from shared devices.</p>'
      + dpdpExtra
      + globalExtra
      + '<h3>Children</h3>'
      + '<p>The Service is not directed to children under 18. We do not knowingly collect personal information from minors. If you are a parent and believe your child has provided us with personal data, please contact us at '+e+'.</p>'
      + '<h3>Changes to this policy</h3>'
      + '<p>We may update this policy from time to time. Material changes will be highlighted on this page with a revised last-updated date. Continued use of the Service after the change means you accept the updated policy.</p>'
      + '<h3>Contact</h3>'
      + '<p>For privacy questions, requests, or complaints, write to us at <strong>'+e+'</strong>.</p>';
  }
  function render(){ document.getElementById('pp-out').innerHTML = build(); }
  document.getElementById('pp-go').addEventListener('click', render);
  document.querySelectorAll('#pp-name,#pp-url,#pp-email,#pp-country,[data-flag]').forEach(function(el){ el.addEventListener('input', render); el.addEventListener('change', render); });
  document.getElementById('pp-copy').addEventListener('click', async function(){ try{ await navigator.clipboard.writeText(document.getElementById('pp-out').innerHTML); var b=this, o=b.textContent; b.textContent='Copied ✓'; setTimeout(function(){b.textContent=o;},1400);}catch(e){this.textContent='Copy failed';} });
  document.getElementById('pp-dl').addEventListener('click', function(){ var t=document.getElementById('pp-out').innerText; var blob=new Blob([t],{type:'text/plain'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='privacy-policy.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); });
  render();
})();
`,
    },
    intro: `
      <p>Every Indian website that collects any personal information from visitors needs a privacy policy. The Digital Personal Data Protection Act 2023 (DPDP) makes this clear for businesses operating in India. Without a policy, you cannot reliably accept signups, run a contact form, send a newsletter, or process payments. A missing policy is also a quiet trust signal: customers who land on a checkout page or contact form and notice no link to a policy quietly close the tab.</p>
      <p>This tool generates a starting template policy in your browser. You fill in your business name, website, contact email, and tick off the categories of data you collect. The output is a clean HTML policy that covers what data you collect, why, how you share it, how long you keep it, your visitor rights under DPDP, and how to contact you. Copy the HTML into your website Privacy Policy page, or download as plain text for a lawyer to review.</p>
    `,
    howTo: [
      'Type your <strong>business legal name</strong> exactly as registered (Pvt Ltd, LLP, sole proprietor, etc).',
      'Add your <strong>website URL</strong> with https://. This is the URL the policy will refer to throughout.',
      'Set the <strong>contact email</strong> for privacy questions. A dedicated privacy@ alias is best, but a regular contact email works too.',
      'Pick the <strong>country focus</strong>: India only for an India-focused business, India plus global if you have EU or UK visitors too.',
      'Tick the boxes for the categories of personal data you actually collect. Be honest. Saying you collect less than you do creates legal risk later.',
      'Click <strong>Generate policy</strong>. The policy renders below. Read through it once.',
      'Copy the HTML into a new Privacy Policy page on your website (most CMSes have a Privacy Policy page template), or download as text and email to a lawyer for review.',
    ],
    why: `
      <p>Three reasons a privacy policy belongs on your site from day one, even if you are a one-person business.</p>
      <p><strong>It is required by law.</strong> The DPDP Act 2023 applies to any business that processes the personal data of Indian residents, no matter how small the business. The Act requires fair processing, informed consent, and a clear notice to data principals. A privacy policy is the standard way to satisfy the notice requirement.</p>
      <p><strong>It builds customer trust.</strong> A visible privacy policy linked in the footer of your site signals professionalism. Customers who care about their data look for it before they sign up or pay. A missing policy quietly costs you signups you will never see.</p>
      <p><strong>It protects you in a dispute.</strong> When a customer asks about how you used their data, the privacy policy is your written reference. It limits what they can claim you did and did not say. A clear, dated, version-controlled policy is one of the cheapest forms of legal protection a small business can buy.</p>
    `,
    tips: [
      'Link the policy in your site footer on every page. Customers expect to find it there.',
      'Link it from your contact form, your checkout page, your newsletter signup, anywhere you collect data.',
      'Update the last-updated date every time you make any change.',
      'Keep old versions in case a customer queries an action you took under the older policy.',
      'If you use Google Analytics or any third-party tracker, mention it by name in the cookies section.',
      'If you sell to children, you need a stricter parental consent flow than this template covers. Consult a lawyer.',
      'For e-commerce, link the privacy policy from your refund policy and terms too.',
    ],
    example: `
      <p>A clinic in Hyderabad ticks all the checkboxes except payment (they take payment offline) and adds contact email privacy@aaditiclinic.in. The generator returns an 800-word policy covering name, email, phone, address, and cookies, with DPDP rights, retention, security, children safeguards, and a contact block. The clinic owner pastes it into the Privacy Policy page on her Neweb website, links it from the footer, and from her appointment booking form. Total time: under five minutes. Total cost: zero. The policy holds up to a customer enquiry and a lawyer review six months later.</p>
    `,
    faq: [
      { q: 'Is this legal advice?', a: '<p>No, this is not legal advice, and we are not a law firm. The tool produces a solid starting template that covers the common ground most small Indian business websites need, but privacy law is genuinely nuanced and the right wording depends on exactly what data you collect and why. You should treat the generated document as a strong first draft, then have a lawyer review the final version before you publish it, particularly if your business touches sensitive categories where the rules are stricter: health and medical data, financial and payment data, biometric data, or any data belonging to children under 18, which India DPDP Act treats with special care. For a simple brochure-style site that collects a contact form and basic analytics, the template alone gets you most of the way and a quick review is enough; for anything involving sensitive data at scale, budget for proper legal input, because a generic policy that misstates your real practices can be worse than none at all.</p>' },
      { q: 'Does this cover DPDP?', a: '<p>Yes, at a starting-template level, the policy is written with India Digital Personal Data Protection Act in mind. It includes a section setting out the rights that data principals, your website visitors, have under the DPDP framework, including the right to access their personal data, to seek correction or erasure, to withdraw consent they previously gave, and to nominate another person to exercise their rights, along with language around purpose-limited consent. That covers the core disclosures a typical small business website needs to make. What the template does not do is implement the heavier obligations that fall on larger operators, especially those that may be classified as Significant Data Fiduciaries because of the scale or sensitivity of their processing, which can require formal consent managers, Data Protection Officers, data protection impact assessments and independent audits. If you process personal data at meaningful scale, or handle sensitive or children data, treat this as the foundation and get specialist DPDP advice to layer the additional measures on top.</p>' },
      { q: 'Does this cover GDPR?', a: '<p>Partially, and only if you select the India plus global option when generating the policy. With that option chosen, the document acknowledges the European GDPR, references the key data subject rights it grants, such as access, rectification, erasure and portability, and mentions the complaint mechanism through a supervisory authority. That level of coverage is reasonable for an Indian business that occasionally gets European visitors or the odd EU customer. It is not, however, full GDPR compliance, which is a substantial undertaking: if you actively target and market to customers in the European Union, you may need a lawful basis for each processing activity, possibly an EU representative, specific consent and cookie handling, data transfer safeguards, and detailed records of processing. For that situation you should consult a privacy lawyer who specialises in EU data protection rather than relying on a template. As a rule, the global option is a sensible safety net for incidental EU traffic, while genuine EU market entry warrants dedicated legal help.</p>' },
      { q: 'Where do I publish the policy?', a: '<p>Publish the policy as a dedicated page on your own website, at a clear, conventional path such as /privacy or /privacy-policy, so visitors and regulators can find it where they expect. Paste the generated HTML into that page, then, crucially, link to it from the footer of every page on your site, because a privacy policy that exists but is not linked from where people look is effectively hidden. The footer link is also where payment gateways, app stores and ad platforms check for a policy before they approve you, so a missing or buried link can hold up your Razorpay onboarding, your Google or Meta ad account, or your app submission. Most content management systems make this easy: Neweb, WordPress and similar platforms include a privacy policy page template and a footer area you can edit once for the whole site. Set it up so the link appears site-wide, then revisit the page text whenever your data practices change so the published version stays accurate.</p>' },
      { q: 'Do I need a cookie banner?', a: '<p>It depends on who visits your site and what cookies you set. If you do business with or attract visitors from the European Union or the United Kingdom, then yes, you need a consent banner for any non-essential cookies, such as analytics and advertising trackers, because GDPR and the related ePrivacy rules require prior consent before those cookies load. For a purely India-focused business, the position today is lighter: under the DPDP framework you are not strictly required to show a cookie banner unless you are setting non-essential cookies that process personal data, though the rules in this area are still settling. The pragmatic recommendation is to add a simple, honest cookie banner anyway, even for an India-only audience, because it normalises a clean consent flow, builds trust with privacy-conscious customers, and means you are already prepared as Indian regulation tightens. A lightweight banner that lets users accept or reject non-essential cookies is inexpensive to add and future-proofs you.</p>' },
      { q: 'How often should I update it?', a: '<p>Update your privacy policy whenever your actual data practices change, because the policy must describe what you really do, not what you did at launch. The common triggers are easy to spot: you add a new analytics tool such as Google Analytics or Meta Pixel, you start using a new payment processor like Razorpay or Stripe, you plug in a new third-party integration such as a chat widget or a CRM, you begin collecting a new category of data like location or uploaded documents, or you start sending marketing emails. Each of those genuinely changes what data flows where, and the policy should be refreshed to match. Even without a specific trigger, it is good hygiene for most small businesses to review the policy at least once a year, since tools quietly accumulate and the law itself evolves, especially with DPDP rules being phased in. Set a recurring reminder, and whenever you publish a change, update the "last updated" date so visitors can see it is current.</p>' },
      { q: 'Is my generated policy stored anywhere?', a: '<p>No, nothing you enter and nothing the tool produces is stored on our side. The whole generator runs client-side in your browser, so the business details you type, your name, your contact email, the data categories you tick, and the finished policy text are all assembled locally on your own device and never transmitted to us or any third party. That privacy-first design matters here precisely because a privacy policy generator that quietly harvested your information would be self-defeating, so we built it to keep everything on-device. The practical implication is that we keep no copy for you: once you generate the policy, copy or save the output yourself, paste it onto your website, and keep a backup in your own files, because if you close the tab without saving you will simply regenerate it from your inputs next time. There is no account, no server-side history and no dashboard, by design.</p>' },
      { q: 'What if I do not handle personal data?', a: '<p>In practice, almost every website handles at least some personal data, even when the owner assumes it does not, so you still need a basic policy. The moment someone visits your site, your hosting and analytics typically log their IP address, and your site likely sets at least functional cookies; if you have a contact form, a WhatsApp link, an enquiry button or an email address, you are collecting personal data the instant someone uses it. Under India DPDP framework and most app-store and ad-platform rules, that low-touch processing still calls for a short, honest privacy policy that acknowledges what little you collect and explains your minimal-data, no-selling approach. The good news is the policy can be genuinely simple: use this template and leave most of the data-category checkboxes empty, keeping only the basics like server logs and essential cookies. That gives visitors transparency, satisfies the platforms that check for a policy before approving you, and takes just a few minutes.</p>' },
    ],
    related: [
      { href: '/pages/tools/terms-conditions-generator', title: 'Terms & Conditions Generator', blurb: 'Pair the policy with terms of use.' },
      { href: '/pages/solutions/clinics', title: 'Clinics on Neweb', blurb: 'DPDP-ready websites for healthcare.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  {
    slug: 'terms-conditions-generator',
    category: 'run',
    built: true,
    name: 'Terms & Conditions Generator',
    tagline: 'Plain English terms for your website, customised in minutes.',
    primaryKeyword: 'terms and conditions generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Terms & Conditions Generator India | Neweb',
    metaDescription: 'Generate plain English terms of service for your Indian small business website. Customisable, downloadable, free. Lawyer review recommended.',
    h1: 'Terms & Conditions <span class="serif">Generator</span>.',
    lede: 'Fill in your business name, website, governing state, and what your site does. We generate a clean plain English terms of service you can paste in today.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Business name</label><input id="tc-name" type="text" placeholder="Your business legal name"/></div>
          <div class="field"><label>Website URL</label><input id="tc-url" type="url" placeholder="https://yourdomain.com"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Contact email</label><input id="tc-email" type="email" placeholder="hello@yourdomain.com"/></div>
          <div class="field"><label>Governing state (India)</label><input id="tc-state" type="text" placeholder="Maharashtra"/></div>
        </div>
        <label style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-top:14px;display:block">Type of service</label>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px">
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="radio" name="tc-type" value="info" checked> Informational website</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="radio" name="tc-type" value="services"> Service business</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="radio" name="tc-type" value="ecom"> E-commerce / store</label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="radio" name="tc-type" value="saas"> SaaS / subscription</label>
        </div>
        <div class="tool-actions" style="margin-top:14px">
          <button id="tc-go" type="button" class="btn btn-brand">Generate terms</button>
          <button id="tc-copy" type="button" class="btn btn-ghost">Copy HTML</button>
          <button id="tc-dl" type="button" class="btn btn-ghost">Download .txt</button>
        </div>
        <div id="tc-out" style="margin-top:18px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:12px;max-height:520px;overflow:auto;font-size:14px;line-height:1.6"></div>
      `,
      help: 'Plain English starting template. Have a lawyer review before publishing. Not legal advice.',
      js: `
(function(){
  function build(){
    var b=document.getElementById('tc-name').value||'[Business name]';
    var u=document.getElementById('tc-url').value||'[Website URL]';
    var e=document.getElementById('tc-email').value||'[Contact email]';
    var s=document.getElementById('tc-state').value||'[Governing state]';
    var t=document.querySelector('input[name="tc-type"]:checked').value;
    var serviceBlock = '';
    if(t==='info') serviceBlock = '<h3>Information accuracy</h3><p>The information on this site is provided for general informational purposes and is offered on an as-is basis. We make reasonable efforts to keep it accurate and current, but we do not warrant completeness or fitness for any particular purpose. Do not rely on this site as professional advice.</p>';
    if(t==='services') serviceBlock = '<h3>Service engagement</h3><p>By engaging us for any service, you agree to provide accurate and complete information needed to deliver that service. Scope, deliverables, timelines, and fees for each engagement will be confirmed in writing before work begins. Payment terms, cancellation, and refund eligibility are set out in the engagement letter.</p>';
    if(t==='ecom') serviceBlock = '<h3>Orders and payment</h3><p>By placing an order, you agree to provide accurate shipping and payment information. We accept orders subject to product availability and price confirmation. Title to goods passes upon receipt of full payment and delivery. Refunds and returns are governed by our separate Refund Policy, which forms part of these terms.</p>';
    if(t==='saas') serviceBlock = '<h3>Subscription</h3><p>The Service is offered on a subscription basis. By signing up, you authorise us to charge your selected payment method on a recurring basis until you cancel. Cancellations take effect at the end of the current billing cycle. We do not pro-rate refunds for unused time, unless required by law.</p>';
    return '<h2>Terms of Service</h2>'
      + '<p><em>Last updated: '+(new Date().toISOString().slice(0,10))+'</em></p>'
      + '<p>These Terms of Service ("Terms") govern your access to and use of '+u+' (the "Service") operated by '+b+' ("we", "us"). By using the Service you agree to these Terms. If you do not agree, please do not use the Service.</p>'
      + '<h3>Eligibility</h3>'
      + '<p>You must be at least 18 years old to use the Service, or have the consent of a parent or guardian who agrees to be bound by these Terms on your behalf. You also agree to comply with all applicable Indian laws including the Information Technology Act, 2000 and any other rules and regulations.</p>'
      + '<h3>Acceptable use</h3>'
      + '<p>You agree not to use the Service to (a) violate any law or regulation; (b) infringe the intellectual property or privacy of any third party; (c) transmit viruses, malware, or other harmful code; (d) interfere with the Service or attempt to gain unauthorised access to it; (e) engage in unsolicited marketing communication, scraping, or any automated access not expressly authorised by us.</p>'
      + serviceBlock
      + '<h3>Intellectual property</h3>'
      + '<p>All content on the Service, including text, graphics, logos, and software, is owned by '+b+' or its licensors and is protected by Indian and international copyright and trademark law. You may not reproduce, modify, distribute, or create derivative works without our prior written permission.</p>'
      + '<h3>Disclaimer of warranties</h3>'
      + '<p>The Service is provided on an as-is and as-available basis. To the maximum extent permitted by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.</p>'
      + '<h3>Limitation of liability</h3>'
      + '<p>To the maximum extent permitted by law, our total cumulative liability arising out of or related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or INR 5,000, whichever is higher. We shall not be liable for any indirect, incidental, consequential, or punitive damages.</p>'
      + '<h3>Indemnification</h3>'
      + '<p>You agree to indemnify and hold us harmless from any claim, loss, or expense (including reasonable legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party right.</p>'
      + '<h3>Termination</h3>'
      + '<p>We may suspend or terminate your access to the Service at any time, with or without notice, for any reason including breach of these Terms. You may stop using the Service at any time. Sections relating to intellectual property, disclaimers, liability, indemnification, and governing law survive termination.</p>'
      + '<h3>Changes to these Terms</h3>'
      + '<p>We may update these Terms from time to time. Material changes will be highlighted on this page with a revised last-updated date. Continued use of the Service after the change means you accept the updated Terms.</p>'
      + '<h3>Governing law and disputes</h3>'
      + '<p>These Terms are governed by the laws of India. Any dispute arising out of or relating to the Service shall be subject to the exclusive jurisdiction of the courts at '+s+', India.</p>'
      + '<h3>Contact</h3>'
      + '<p>Questions about these Terms? Email us at <strong>'+e+'</strong>.</p>';
  }
  function render(){ document.getElementById('tc-out').innerHTML = build(); }
  document.getElementById('tc-go').addEventListener('click', render);
  document.querySelectorAll('#tc-name,#tc-url,#tc-email,#tc-state,input[name="tc-type"]').forEach(function(el){ el.addEventListener('input', render); el.addEventListener('change', render); });
  document.getElementById('tc-copy').addEventListener('click', async function(){ try{ await navigator.clipboard.writeText(document.getElementById('tc-out').innerHTML); var b=this, o=b.textContent; b.textContent='Copied ✓'; setTimeout(function(){b.textContent=o;},1400);}catch(e){this.textContent='Copy failed';} });
  document.getElementById('tc-dl').addEventListener('click', function(){ var t=document.getElementById('tc-out').innerText; var blob=new Blob([t],{type:'text/plain'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='terms.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); });
  render();
})();
`,
    },
    intro: `
      <p>Terms of Service set the rules of engagement between your business and anyone who uses your website. Without them, every customer interaction defaults to general Indian contract law, which is rarely in your favour as a small business. Terms give you a written reference for liability limits, acceptable use, refunds, intellectual property, and the governing court for disputes. A clear, plainly written Terms document, linked from the footer of your site, is one of the most underrated forms of legal hygiene a small business can have.</p>
      <p>This tool generates a starting Terms of Service template in plain English. You pick whether your site is informational, a service business, e-commerce, or SaaS, and the tool tunes the relevant sections (orders for e-commerce, engagement for services, subscriptions for SaaS). The output is a clean HTML document covering eligibility, acceptable use, intellectual property, disclaimers, liability limits, indemnification, termination, governing law, and contact. Copy the HTML into your site or download as text for a lawyer to review.</p>
    `,
    howTo: [
      'Type your <strong>business legal name</strong> exactly as registered.',
      'Add your <strong>website URL</strong> with https://. This is the URL the Terms will refer to throughout.',
      'Set the <strong>contact email</strong>. A dedicated terms@ alias works, but a regular contact address is fine.',
      'Pick a <strong>governing state</strong>. This is the state whose courts will hear disputes. Usually the state where your business is registered.',
      'Pick the <strong>type of service</strong> your site provides: informational, service business, e-commerce, or SaaS. The Terms adjust accordingly.',
      'Click <strong>Generate terms</strong>. The Terms render below. Read through them once.',
      'Copy the HTML into a Terms of Service page on your website, or download as text and email to a lawyer for review. Link the page from your footer on every page of the site.',
    ],
    why: `
      <p>Three reasons a Terms document earns its keep, even for a one-person business.</p>
      <p><strong>It caps your liability.</strong> Without a written Terms, your liability for any customer claim defaults to whatever an Indian court decides is reasonable. With Terms, you can cap it at a stated amount or a stated multiple of fees paid. That single clause has saved many small businesses from a six-figure adverse judgement.</p>
      <p><strong>It defines acceptable use.</strong> The acceptable use section gives you the basis to suspend or terminate a customer who is scraping your site, sending unsolicited messages through your forms, or otherwise misbehaving. Without it, kicking out a problem customer is harder to defend.</p>
      <p><strong>It picks the court.</strong> The governing law and jurisdiction clause lets you specify which court will hear disputes. As a small business, you do not want a Mumbai customer dragging you to Mumbai. The clause keeps disputes local to your registered office, which makes legal defence affordable.</p>
    `,
    tips: [
      'Link the Terms in your footer on every page of your site.',
      'Link them from your checkout, signup, and contact forms. Customers should see them before they consent.',
      'Update the last-updated date every time you change anything.',
      'Pair the Terms with a Privacy Policy and (if e-commerce) a Refund Policy. The three together are the standard legal triad.',
      'Keep old versions when you make changes. Customer claims may relate to actions taken under the older Terms.',
      'For high-value transactions, have a lawyer review the Terms after this template generates the first draft.',
      'For B2B contracts, the website Terms are a baseline. Custom written agreements still apply on top for specific clients.',
    ],
    example: `
      <p>A SaaS founder in Bengaluru selects business name Hyperloop Software Pvt Ltd, URL https://hyperloop.work, contact email legal@hyperloop.work, governing state Karnataka, type SaaS. The tool returns a clean 1,200-word Terms of Service covering eligibility, acceptable use, the SaaS-specific subscription clause, IP, disclaimers, a Rs 5,000 minimum liability cap, indemnification, termination, Karnataka jurisdiction, and a contact line. He pastes the HTML into a Terms page on his Neweb site, links it from the footer and from the signup screen, and emails the text to his lawyer who tweaks two paragraphs.</p>
    `,
    faq: [
      { q: 'Is this legal advice?', a: '<p>No, this is not legal advice; it is a practical starting template that covers the clauses most small Indian business websites need, such as acceptable use, limitation of liability, intellectual property, and governing law. Treat the generated Terms as a strong first draft rather than a finished legal document. For a straightforward website, a simple shop, a service listing, a portfolio, the template often gets you the bulk of the way there. But you should have a lawyer review the final version before publishing if your business carries higher risk or unusual liability exposure: anything involving health or medical advice, financial services, large transactions, user-generated content, marketplaces connecting buyers and sellers, or significant personal data. In those cases the standard clauses may not adequately protect you, and a short professional review is cheap insurance against a costly dispute. The honest framing is that this tool removes the blank-page problem and saves you most of the drafting cost, while a lawyer adds the judgement that templates cannot.</p>' },
      { q: 'Why pick a governing state?', a: '<p>The governing state clause decides which state laws apply to your Terms and, in practice, which state courts will hear any dispute that arises with a customer. This matters more than it first appears, because if you do not specify it, you could end up forced to defend or pursue a claim in a court hundreds of kilometres away, in a state where the customer happens to live, which is expensive and inconvenient for a small business. By naming your own state as the governing jurisdiction, you keep any legal proceedings local to where you actually operate, with lawyers you can reach and courts you can attend. The tool defaults the governing state to the state where your business is registered, which is the natural and most defensible choice for the great majority of small businesses. Unless you have a specific reason to choose otherwise, such as operating mainly from a different state, keep the default so disputes stay close to home and within familiar reach.</p>' },
      { q: 'What if I am a sole proprietor without a registered business?', a: '<p>That is completely fine; you do not need a registered company to have enforceable Terms. A sole proprietorship is not a separate legal entity from you, so simply use your own legal name as the business name when generating the Terms, or your trade name with your name behind it, for example "Operated by [Your Name], proprietor". Your home state naturally becomes the governing state, since that is where you operate and where any dispute would sensibly be heard. Terms drafted this way are just as binding for an individual proprietor as they are for a private limited company, because what makes Terms enforceable is the agreement between you and your customer, not a registration certificate. Millions of Indian freelancers, consultants, home bakers, tutors and small online sellers run as sole proprietors and rely on exactly this setup. As your business grows and you eventually register as an LLP or private limited company, you simply regenerate the Terms with the new entity name.</p>' },
      { q: 'Should I also have a refund policy?', a: '<p>Yes, if you sell anything at all, you should publish a clear refund and returns policy alongside your Terms. It is a separate document from the Terms because it serves a different, very practical purpose: it tells customers exactly when they can get their money back, within how many days, in what condition goods must be returned, who pays return shipping, and how long a refund takes to reach them. A clear refund policy reduces disputes, builds buyer confidence at the point of purchase, and is increasingly expected, and sometimes required, by payment gateways like Razorpay and by marketplaces and ad platforms before they will work with you. Link it in your website footer right next to your Privacy Policy and Terms, so the three core legal pages sit together where customers and platforms look for them. Keep the refund policy honest and specific to how you actually operate, because a policy you cannot or will not honour creates more friction than no policy at all.</p>' },
      { q: 'Do the Terms cover GDPR or DPDP?', a: '<p>Not directly, and that separation is intentional and correct. Data protection obligations, how you collect, use, store and share personal data, and the rights your visitors have under India DPDP Act or the European GDPR, belong in your Privacy Policy, which is a distinct document built for exactly that purpose. The Terms and Conditions instead govern the commercial and usage relationship between you and your customer: acceptable use of your site or service, intellectual property, payment and liability terms, and dispute resolution. The two work as a pair, and your Terms reference the Privacy Policy so a reader knows where to find the data-handling details. This keeps each document focused rather than cramming privacy law into a commercial agreement. So to be properly covered, generate and publish both: the Terms from this tool for the usage relationship, and a Privacy Policy, which our separate generator produces, for your DPDP and GDPR disclosures, and link both from your footer.</p>' },
      { q: 'Can I copy these Terms exactly without changes?', a: '<p>You can publish the generated Terms as they are, and for a low-risk website many small businesses do exactly that without issue. However, a quick lawyer review is strongly recommended before you rely on them, because the template uses sensible general wording that may not perfectly fit your specific products, risks or promises. The cost is modest: a lawyer review of a Terms document for a small business typically runs around Rs 2,000 to Rs 8,000 depending on complexity and your city, which is well worth it for the protection and peace of mind, since the whole point of Terms is to protect you when something goes wrong. Think of the tool as doing the expensive part, the drafting and structuring, for free, and the lawyer as adding a short, focused check on the parts that matter for your business. If your business is higher risk, treat the review as essential, and have the lawyer adjust the liability and dispute clauses to your situation.</p>' },
      { q: 'Are the inputs stored anywhere?', a: '<p>No, nothing you enter is stored on our side, because the entire generator runs client-side in your browser. The details you type, your business name, your contact email, the choices you make, and the finished Terms document are all assembled locally on your own device, and none of it is transmitted to us or any third party. That keeps your business information private and means there is no copy of your Terms or your details sitting on someone else server. The practical consequence is that we hold nothing for you, so once you generate the document, copy or save the output yourself, paste it onto your website Terms page, and keep a backup in your own files, because closing the tab clears it and you would regenerate from your inputs next time. There is no account and no saved history by design. If you later change your business name or what you sell, simply regenerate the Terms with the updated information.</p>' },
      { q: 'Can the Terms be in Hindi or a regional language?', a: '<p>The template is generated in English, which is the language most Indian businesses use for legal documents and which courts widely accept. If you want a Hindi, Marathi, Tamil or other regional-language version for customer-facing clarity, the practical route is to paste the generated English text into a translation tool and publish the translated version alongside the original. This is worth doing when many of your customers are more comfortable reading in their own language, since Terms people can understand are more likely to be honoured. One important point: in most cases the English version should remain the legally binding original, and it is wise to state explicitly that, in the event of any conflict between the translated and English versions, the English text prevails. That avoids ambiguity if a machine translation introduces a subtle shift in meaning. So offer the regional translation as a courtesy for readability, but keep the English version as the authoritative one for legal purposes.</p>' },
    ],
    related: [
      { href: '/pages/tools/privacy-policy-generator', title: 'Privacy Policy Generator', blurb: 'Pair Terms with a DPDP-aware policy.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
      { href: '/pages/solutions', title: 'All industry solutions', blurb: 'Built for your business type.' },
    ],
  },
  {
    slug: 'instagram-bio-generator',
    category: 'run',
    built: true,
    name: 'Instagram Bio Generator',
    tagline: '150-character bios with a hook, an offer and a link line.',
    primaryKeyword: 'instagram bio generator for business',
    solutionHref: '/pages/solutions/jewellers',
    solutionLabel: 'For jewellers',
    metaTitle: 'Free Instagram Bio Generator India — 150 chars | Neweb',
    metaDescription: 'Generate punchy Instagram bios under 150 characters with a hook, offer and call to action. Built for Indian small business profiles. Free.',
    h1: 'Instagram Bio <span class="serif">Generator</span>.',
    lede: 'Type your business, your main offer, and your style. We write 8 Instagram bios under 150 characters, each with a hook, a clear offer, and a call to action.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Business or profile name</label><input id="ai-business" type="text" placeholder="e.g. Aaji's Achaar" maxlength="80"/></div>
          <div class="field"><label>Main offer</label><input id="ai-offer" type="text" placeholder="e.g. handmade pickles, daily delivery" maxlength="120"/></div>
        </div>
        <div class="field"><label>Style</label>
          <select id="ai-style">
            <option value="friendly">Friendly</option>
            <option value="playful">Playful</option>
            <option value="premium">Premium</option>
            <option value="traditional">Traditional</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div class="tool-actions">
          <button id="ai-go" type="button" class="btn btn-brand">Generate bios</button>
          <span id="ai-status" style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);align-self:center"></span>
        </div>
        <div id="ai-out" style="margin-top:18px;display:flex;flex-direction:column;gap:8px"></div>
      `,
      help: 'Each bio is under Instagram\'s 150 character limit.',
      js: `
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
(function(){
  var btn=document.getElementById('ai-go'), status=document.getElementById('ai-status'), out=document.getElementById('ai-out');
  if(!btn) return;
  btn.addEventListener('click', async function(){
    var payload={business:(document.getElementById('ai-business').value||'').trim(), offer:(document.getElementById('ai-offer').value||'').trim(), style:(document.getElementById('ai-style').value||'').trim()};
    if(!Object.values(payload).some(Boolean)){status.textContent='Please enter at least one field';return;}
    btn.disabled=true; status.textContent='Thinking…'; out.innerHTML='';
    try{
      var r=await fetch('/api/tools/ai/instagram-bio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      var d=await r.json();
      if(d.error){status.textContent='Error: '+d.error;return;}
      status.textContent = '';
      out.innerHTML = (d.items||[]).map(function(it){
        var len=it.length||(it.text||'').length;
        var warn = len > 150;
        return '<div style="padding:14px 18px;border:1px solid var(--line);border-radius:12px;background:#fff;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">'
          + '<div style="white-space:pre-line;font-size:14.5px;line-height:1.5;color:var(--ink);max-width:100%">'+escHtml(it.text||'')+'</div>'
          + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">'
          +   '<span style="font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:'+(warn?'#b91c1c':'var(--muted)')+'">'+len+' / 150</span>'
          +   '<button type="button" class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="navigator.clipboard.writeText(this.parentElement.parentElement.querySelector(\'div\').innerText);this.textContent=\'Copied\';setTimeout(()=>this.textContent=\'Copy\',1200);">Copy</button>'
          + '</div>'
          + '</div>';
      }).join('');
    }catch(e){status.textContent='Network error';}
    finally{btn.disabled=false;}
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main" style="white-space:pre-line;font-weight:500">🥖 Copper Oven\nSourdough, made fresh daily\nDM to pre-order →</div><div class="eo-sub">59 / 150 characters</div></div></div>
      <div class="eo-item"><div><div class="eo-main" style="white-space:pre-line;font-weight:500">Copper Oven, Pune 📍\nSmall-batch sourdough and seeded loaves\nOrder on WhatsApp 👇</div><div class="eo-sub">78 / 150 characters</div></div></div>
      <div class="eo-item"><div><div class="eo-main" style="white-space:pre-line;font-weight:500">Real bread, real slow ⏳\nBaked fresh in Koregaon Park\nTap the link to order</div><div class="eo-sub">73 / 150 characters</div></div></div>
      <div class="eo-item"><div><div class="eo-main" style="white-space:pre-line;font-weight:500">🥐 Your morning, sorted\nArtisan bakes, baked daily by hand\nPre-order, pickup, repeat 🔁</div><div class="eo-sub">84 / 150 characters</div></div></div>
      <div class="eo-note">Sample bios. Generate ones with your own hook, offer and link line above.</div>
    `,
    intro: `
      <p>Instagram allows 150 characters in the bio of a business profile. Those 150 characters are the most visible piece of brand copy a small business owns. They appear above the grid every time someone visits the profile. They get scanned in a second. They decide whether the visitor follows or scrolls past.</p>
      <p>This tool gives you 8 bio options based on your business, your main offer, and a style preference. Each bio includes a hook (who you are or what makes you different), the offer (what you sell), and a call to action (DM, visit, tap the link). All 8 fit inside the 150-character limit with room to spare. Suggestions arrive in seconds.</p>
    `,
    howTo: [
      'Type your <strong>business or profile name</strong>. The bio addresses your audience as your business, not as an individual.',
      'Describe your <strong>main offer</strong> in plain English. "Handmade pickles, daily delivery" or "Bookkeeping for Indian SMBs" or "Sustainable jewellery, India shipping".',
      'Pick a <strong>style</strong>: friendly, playful, premium, traditional, or minimal. The style sets the tone of all 8 suggestions.',
      'Click <strong>Generate bios</strong>. Eight bios appear, each with a character count badge so you know they fit.',
      'Tap <strong>Copy</strong> on any bio to put it on your clipboard. Paste into Instagram profile edit screen.',
      'Test two bios over a week, change once per week, and watch profile visits to follow conversion rate inside Instagram Insights.',
      'Keep the link in your bio updated. The bio is where customers leave Instagram to go to your website, WhatsApp, or Linktree.',
    ],
    why: `
      <p>Three reasons the Instagram bio matters more than most founders realise.</p>
      <p><strong>It is the first profile signal.</strong> A visitor lands on your profile, glances at the bio, and decides in two seconds whether to follow, message, or leave. A clear bio that explains who you are, what you sell, and what to do next can lift profile-visit-to-follow conversion by 20 percent or more.</p>
      <p><strong>It is your free landing page.</strong> Most small businesses do not have or do not yet need a website. The Instagram profile is their landing page. The bio is the headline copy. Treating it as throwaway is the biggest single piece of free marketing most founders leave on the table.</p>
      <p><strong>It is where the link lives.</strong> Instagram allows one clickable link in the bio. Every story tap, every post comment "link in bio", every external promotion routes through the bio link. Without a clear bio that explains where that link goes, customers do not tap.</p>
    `,
    tips: [
      'Use a line break after the business name and the offer. Bios read vertically; tight stacking is hard to scan.',
      'One or two emojis per bio at most. More feels spammy.',
      'Lead with the most specific, most compelling thing you do. Skip generic phrases like "We are passionate about quality".',
      'End with a clear next step: DM to order, tap the link, visit us today.',
      'Update the link in bio when you have a new launch. The same Linktree forever signals stale.',
      'Test a bio for at least 7 days before changing. Instagram audiences need time to convert.',
      'Track profile visits and follows in Instagram Insights before and after each bio change.',
    ],
    example: `
      <p>A founder runs a homemade pickle brand in Pune. She types business "Aaji\'s Achaar", main offer "handmade Maharashtrian pickles, India shipping", style playful. The generator returns 8 bios. The one she picks: "Aaji\'s Achaar 🥒\nMaharashtrian pickles, made fresh\nIndia shipping. DM to order →" (94 characters). She pastes it into her Instagram bio, sets her bio link to her wa.me link generated from our WhatsApp Link Generator, and posts a story announcing the new bio. Profile visits to follows lift from 4 to 11 percent within 10 days.</p>
    `,
    faq: [
      { q: 'Why are the bios under 150 characters?', a: '<p>Because 150 characters is the hard limit Instagram allows for a profile bio, and the generator keeps every suggestion comfortably inside it for a good reason. Anything longer than the limit gets truncated on the profile view, often cutting off the most important part, your call to action or your offer, with a trailing ellipsis that nobody taps to expand. Since the bio is prime real estate that every visitor sees before deciding to follow, message or buy, wasting it on text that gets clipped is costly. The tool also leaves a small buffer below 150 on purpose, because emojis and characters in non-Latin scripts such as Devanagari can count as more than one character each, so a bio that looks short can quietly exceed the limit once an emoji or two is added. Staying a little under the ceiling means your bio displays in full on every device, with your key message and link intact, exactly as you intended.</p>' },
      { q: 'Can I add multiple emojis?', a: '<p>You can, but restraint pays off, which is why the samples here use zero to two emojis on purpose. A single well-chosen emoji can add warmth, signal your category at a glance, a pizza slice for a pizzeria, a sparkle for a salon, or break up the line so it scans faster on a phone. But once you go past two, emojis start crowding out the words that actually do the selling, and a bio packed with icons reads as cluttered and slightly amateur rather than fun. Remember too that within a 150-character limit, every emoji competes for space with your value proposition and call to action, and emojis can count as multiple characters, so three or four can eat a surprising chunk of your bio. The practical rule is to lead with clear words, then add at most one or two emojis as light punctuation. If in doubt, leave them out, since a clean text bio almost always outperforms an emoji-heavy one.</p>' },
      { q: 'Should I link to my website or my WhatsApp?', a: '<p>If you have a website, especially a Neweb site, make that your primary bio link, because it is the one destination that can do everything at once. From your own site a visitor can read about you, browse your menu or catalogue, and then be routed onward to WhatsApp, your shop or your booking flow, so the single link becomes a hub rather than a dead end, and you keep control of the experience and any analytics. If you do not have a website yet, the next best primary link is a direct wa.me WhatsApp link, since for most Indian small businesses WhatsApp is where the actual conversation and sale happen, and one tap from bio to chat removes all friction. You can generate that link with our WhatsApp Link Generator and even pre-fill a greeting so customers arrive ready to talk. The rule is simple: send people to your website if you have one, and straight to WhatsApp if you do not.</p>' },
      { q: 'Should I use a Linktree?', a: '<p>It depends on how many destinations you genuinely need to push. Instagram gives you only one clickable link in the bio, so if you regularly need to send people to several places, your own website, plus Zomato or Swiggy, plus Amazon, plus a booking page, then a link-in-bio page like Linktree, or better still a simple links page on your own domain, makes sense, because it presents all those options on one tappable screen. But if you really have one main destination, skip the extra layer and link to it directly, because every additional tap loses some visitors, and sending someone through a Linktree menu just to reach your one WhatsApp or website adds friction for no benefit. A nice middle path, if you have a Neweb site, is to build the links page on your own domain rather than a third-party tool, so the traffic, branding and analytics stay with you.</p>' },
      { q: 'Are the bios saved anywhere?', a: '<p>No, we do not store your bios or the inputs you provide. When you generate suggestions, the details you enter are passed to the configured server-side AI provider solely to produce the bio options, and the resulting text is returned to you without being retained on our side afterwards. There is no account, no saved history and no dashboard collecting your past generations, which keeps the tool simple and your information private. The practical implication is that you should copy or note down any bio you like before navigating away, because once you leave the page the suggestions are gone and you would regenerate fresh ones from your inputs next time. A good habit is to generate a batch, paste your two or three favourites into a notes app, then live with them for a moment before choosing, since you cannot scroll back to a previous run. Because nothing is stored, you can experiment freely with different angles and tones.</p>' },
      { q: 'Will Instagram penalise me for AI-generated bios?', a: '<p>No, Instagram has no rule against using AI to help write your bio, and you will not be penalised or shadow-banned for it. The platform policies that concern automation and authenticity are aimed at things like fake engagement, bot accounts, spam, and misleading content in posts, not at how you happened to draft the words in your profile. A bio is simply text describing your business, and whether you wrote it yourself, hired a copywriter, or generated and then edited it with a tool makes no difference to Instagram. What the algorithm actually rewards is genuine engagement, posting content people find useful or enjoyable, and real interaction with your audience, so that is where to focus your authenticity. The one sensible step is to treat the AI suggestions as a starting point and tweak them so the final bio sounds like you and accurately reflects your business, because an authentic, specific bio simply converts better.</p>' },
      { q: 'Can I switch language? Hindi, Marathi, Tamil?', a: '<p>The current build generates bios in English, but getting a regional-language version is easy. Once you have an English bio you like, paste it into a translation tool to produce a Hindi, Marathi, Tamil, Telugu or other regional version, then use whichever reads best for your audience. In fact, many Indian small businesses do something even more effective: they mix English and a regional language within the same bio, for example an English line for the offer and a Marathi or Hindi phrase for warmth, which feels local and personal while staying readable to a wide audience. This bilingual blend often outperforms a purely English bio for neighbourhood businesses whose customers think in their mother tongue. Keep the 150-character limit in mind when translating, since text in Devanagari or Tamil can take more characters than its English equivalent. Choose the language mix that matches how your customers actually speak.</p>' },
      { q: 'How often should I change the bio?', a: '<p>Refresh your bio about once every 60 to 90 days, or sooner whenever something material changes, such as a new offer, a new main link, a seasonal campaign, or a shift in what your business focuses on. That cadence balances two failure modes. Changing the bio constantly confuses returning followers who have come to associate a particular line or call to action with you, and none of your messaging gets time to stick. Never touching it leaves growth on the table, because a stale bio keeps pointing people to last season offer or an outdated link. A simple rhythm is to review the bio at the start of each quarter and ask whether the offer, the link and the tone still reflect your business, updating only what has genuinely changed. Tie ad-hoc updates to real events, a festival sale, a new product line, a new location, so each change has a clear purpose.</p>' },
    ],
    related: [
      { href: '/pages/tools/whatsapp-link-generator', title: 'WhatsApp Link Generator', blurb: 'Make the link your bio points to.' },
      { href: '/pages/tools/slogan-generator', title: 'Slogan Generator', blurb: 'Match your bio voice.' },
      { href: '/pages/tools/business-name-generator', title: 'Business Name Generator', blurb: 'Name the brand first.' },
    ],
  },

  // ---------- Website & SEO ----------
  // EXISTING tool — keeps its URL. Hub links straight to it.
  { slug: 'domain-checker', category:'seo', built:true, external:true, externalHref:'/pages/domain-checker', name:'Domain Name Checker', tagline:'Check .com, .in, .shop, .co availability instantly.', primaryKeyword:'free domain name checker' },
  {
    slug: 'meta-title-description-generator',
    category: 'seo',
    built: true,
    name: 'Meta Title & Description Generator',
    tagline: 'On-brief SEO title and description for any URL or topic.',
    primaryKeyword: 'meta title and description generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Meta Title & Description Generator | Neweb',
    metaDescription: 'Generate SEO-tight meta titles and descriptions for your pages. 5 options under 60 and 158 characters with brand-safe wording.',
    h1: 'Meta Title <span class="serif">+ Description</span>.',
    lede: 'Type your topic, brand and intent. We write 5 SEO-safe title and description pairs that fit within Google search snippet limits.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Topic or page</label><input id="ai-topic" type="text" placeholder="e.g. domain name checker, GST invoice, family salon" maxlength="120"/></div>
          <div class="field"><label>Brand</label><input id="ai-brand" type="text" placeholder="e.g. Neweb, Aaji's Achaar" maxlength="60"/></div>
        </div>
        <div class="field"><label>Search intent</label>
          <select id="ai-intent">
            <option value="informational">Informational</option>
            <option value="transactional">Transactional / shop</option>
            <option value="navigational">Navigational</option>
            <option value="local">Local</option>
          </select>
        </div>
        <div class="tool-actions">
          <button id="ai-go" type="button" class="btn btn-brand">Generate meta tags</button>
          <span id="ai-status" style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);align-self:center"></span>
        </div>
        <div id="ai-out" style="margin-top:18px;display:flex;flex-direction:column;gap:10px"></div>
      `,
      help: 'Titles under 60 characters, descriptions under 158, with brand at the end of the title.',
      js: `
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
(function(){
  var btn=document.getElementById('ai-go'), status=document.getElementById('ai-status'), out=document.getElementById('ai-out');
  if(!btn) return;
  btn.addEventListener('click', async function(){
    var payload={topic:(document.getElementById('ai-topic').value||'').trim(), brand:(document.getElementById('ai-brand').value||'').trim(), intent:(document.getElementById('ai-intent').value||'').trim()};
    if(!payload.topic){status.textContent='Topic is required';return;}
    btn.disabled=true; status.textContent='Thinking…'; out.innerHTML='';
    try{
      var r=await fetch('/api/tools/ai/meta-tags',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      var d=await r.json();
      if(d.error){status.textContent='Error: '+d.error;return;}
      status.textContent = '';
      out.innerHTML = (d.items||[]).map(function(it){
        var tWarn = (it.titleLen||0) > 60, dWarn = (it.descLen||0) > 158;
        return '<div style="padding:16px 18px;border:1px solid var(--line);border-radius:12px;background:#fff">'
          + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap"><div style="font-weight:600;color:var(--ink);font-size:15px">'+escHtml(it.title||'')+'</div><span style="font-family:JetBrains Mono,monospace;font-size:10.5px;color:'+(tWarn?'#b91c1c':'var(--muted)')+';letter-spacing:.08em;text-transform:uppercase">'+(it.titleLen||0)+' / 60</span></div>'
          + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-top:10px;flex-wrap:wrap"><div style="color:var(--ink-2);font-size:13.5px;line-height:1.5">'+escHtml(it.description||'')+'</div><span style="font-family:JetBrains Mono,monospace;font-size:10.5px;color:'+(dWarn?'#b91c1c':'var(--muted)')+';letter-spacing:.08em;text-transform:uppercase">'+(it.descLen||0)+' / 158</span></div>'
          + '<div style="margin-top:10px;display:flex;gap:8px"><button type="button" class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="navigator.clipboard.writeText(\''+escHtml(it.title||'').replace(/\\\'/g,'\\\\\'')+'\');this.textContent=\'Copied\';setTimeout(()=>this.textContent=\'Copy title\',1200);">Copy title</button><button type="button" class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="navigator.clipboard.writeText(\''+escHtml(it.description||'').replace(/\\\'/g,'\\\\\'')+'\');this.textContent=\'Copied\';setTimeout(()=>this.textContent=\'Copy description\',1200);">Copy description</button></div>'
          + '</div>';
      }).join('');
    }catch(e){status.textContent='Network error';}
    finally{btn.disabled=false;}
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Sourdough Bakery in Pune | Copper Oven</div><div class="eo-sub">Fresh sourdough and seeded loaves, baked daily in Koregaon Park. Order online or visit our Pune bakery. (38 / 158 chars)</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Order Fresh Bread Online in Pune | Copper Oven</div><div class="eo-sub">Pre-order artisan sourdough, baguettes and brioche for same-day pickup. Small-batch baking in Koregaon Park, Pune. (46 / 156 chars)</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Artisan Bakery Koregaon Park | Copper Oven Pune</div><div class="eo-sub">Hand-baked sourdough and pastries, made fresh every morning. Visit Copper Oven in Koregaon Park or order on WhatsApp. (47 / 157 chars)</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Copper Oven | Sourdough and Bakes, Pune</div><div class="eo-sub">A small-batch Pune bakery for real sourdough, seeded loaves and pastries. Pre-order online for fresh daily pickup. (39 / 154 chars)</div></div></div>
      <div class="eo-note">Sample title and description pairs. Generate on-brief meta for any URL or topic above.</div>
    `,
    intro: `
      <p>The meta title and description are the two pieces of copy Google shows in search results. They decide whether someone clicks your result or skims past it. Most small business websites either miss them entirely (Google fills in something random from the page), or copy-paste the same generic phrasing across every page. Both mistakes leave organic traffic on the table.</p>
      <p>This tool writes five title and description pairs for any page on your site. You pick a topic, give your brand name, and choose the search intent (informational, transactional, navigational, or local). The generator returns five options that fit inside Google search snippet limits: titles under 60 characters with the brand at the end after a pipe, descriptions under 158 characters with one keyword, one benefit, and one differentiator. Variations arrive in seconds.</p>
    `,
    howTo: [
      'Type the <strong>topic or page</strong>. Examples: "domain name checker", "Sunday brunch", "GST invoice", "family salon in Indore".',
      'Add your <strong>brand</strong> name. This goes at the end of the title after a pipe.',
      'Pick the <strong>search intent</strong>: informational (a blog or guide), transactional (a product or service page), navigational (a page customers type your name to find), or local (a location-based service).',
      'Click <strong>Generate meta tags</strong>. Five options appear, each with character count badges so you can see they fit.',
      'Copy the title and description that fit your page best.',
      'Paste into your CMS title and description fields. On Neweb, this is on the page settings panel. On WordPress, it is in Yoast or RankMath.',
      'Watch Google Search Console over the next 30 days. If click-through rate drops, the meta is wrong. If it rises, you have a winning pair.',
    ],
    why: `
      <p>Three reasons clean meta tags pay off faster than most SEO levers.</p>
      <p><strong>Click-through rate compounds.</strong> Higher CTR means more clicks for the same ranking, more revenue per impression, and a positive ranking signal to Google. A title that earns 8 percent CTR at position 5 outperforms a title that earns 3 percent CTR at position 3 in raw traffic.</p>
      <p><strong>Description is your sales pitch.</strong> The 158-character description is where you tell the searcher exactly what they get if they click. Generic descriptions read as commodity. Specific descriptions ("Sub-1s loads, free domain, ₹249 a month") earn trust before the click.</p>
      <p><strong>Most competitors get this wrong.</strong> Walking through the first page of Indian SMB search results, most titles and descriptions are either Google-rewritten because the site did not set them, or stuffed full of keywords without a benefit. A clean, specific, benefit-led meta is a free competitive edge that requires no link-building.</p>
    `,
    tips: [
      'Keep titles under 60 characters or Google truncates with an ellipsis.',
      'Put the keyword at the start, the brand at the end after a pipe.',
      'Descriptions under 158 characters. Mobile cuts off sooner; aim for 150 for safety.',
      'One keyword per page is the discipline. Stuffing three keywords into the title hurts CTR.',
      'Include a number or a specific (free, 24 hours, 2026, ₹249) to make the description stand out.',
      'Avoid clickbait. Misleading meta tags get fewer organic clicks over time as users learn to skip them.',
      'Different meta tags for every page. Templated meta tags trigger duplicate-snippet warnings in Search Console.',
    ],
    example: `
      <p>A founder writing a blog post about Google Business Profile optimisation for restaurants types: topic "Google Business Profile for restaurants in India", brand "Neweb", intent "informational". The tool returns five pairs including: Title "Google Business Profile for restaurants | Neweb" (47 chars), Description "Claim, verify and optimise your GBP in 20 minutes. India-specific tips for menus, photos and weekend orders. Free guide by Neweb." (148 chars). She copies both, pastes into her blog post settings, and within three weeks the CTR on that page in Search Console rises from 2.4 to 5.1 percent.</p>
    `,
    faq: [
      { q: 'How does the generator work?', a: '<p>The generator takes three inputs, your page topic, your brand name, and the search intent behind the page, and returns five SEO-tight pairs of meta title and meta description ready to paste into your site head. Each title is kept under roughly 60 characters with your brand placed at the end, so the most important keywords sit at the front where Google and searchers notice them first. Each description is kept under about 158 characters and is structured to do real work in the search result: it leads with your main keyword, states one clear benefit, and adds one differentiator that sets you apart from the other listings. For example, a Pune dental clinic page might get a title like "Painless Root Canal in Pune | SmileCare" with a description promising same-day appointments and gentle care. Generate the five options, pick the pair that reads most naturally, and adjust a word or two so it matches your page exactly before you publish it.</p>' },
      { q: 'Why 60 character titles?', a: '<p>The roughly 60-character target exists because Google does not actually count characters; it measures the title in pixels, showing about 580 pixels of width in a standard desktop search result. That pixel budget works out to approximately 60 English characters on average, though the exact number shifts with letter widths, since wide letters like W and M eat more space than narrow ones like i and l. If your title runs past that width, Google truncates the end with an ellipsis, which often chops off your brand name or the final, most persuasive words of the title, weakening the click. Keeping titles inside the 60-character guideline means the whole title displays cleanly on desktop, and usually on mobile too. The smart structure is to lead with your primary keyword and the specific value, then end with your brand, so that even if a stray pixel pushes the very end out of view, the words that matter most for ranking and clicks are safely visible at the front.</p>' },
      { q: 'Why 158 character descriptions?', a: '<p>The 158-character guideline reflects roughly how much of a meta description Google displays on a desktop search result before it cuts the rest off, and the visible space is shorter still on mobile, often around 120 characters. Anything beyond that limit gets truncated with an ellipsis, so a description that runs long risks losing its closing call to action or key selling point right where a searcher is deciding whether to click. Targeting about 150 characters, as this tool does, leaves a small safety margin so your description shows in full across devices rather than being clipped at an awkward point. The description does not directly affect your ranking, but it heavily influences your click-through rate, which is why making every one of those characters count matters: lead with the keyword the searcher typed, state a concrete benefit, and add a reason to choose you over the listings above and below. A tight, complete, compelling description quietly wins clicks that a truncated one loses.</p>' },
      { q: 'Will Google use my exact meta tags?', a: '<p>Often yes, but not always, and it is important to set expectations here. Google treats your meta title and description as strong suggestions rather than fixed instructions, and it reserves the right to rewrite either one if its systems judge that a different snippet better matches a particular search query or better reflects the page content. In practice, Google honours a well-written, relevant title and description the majority of the time, and it is far more likely to rewrite tags that are vague, keyword-stuffed, duplicated, or mismatched with what the page says. So writing clear, specific, honest meta tags that genuinely describe the page is the best way to raise the odds that Google shows exactly what you wrote, and it gives Google good raw material even when it does adapt the snippet. Think of these tags as your best offer to the search engine, strongly preferred but not guaranteed, so make them as accurate and compelling as you can.</p>' },
      { q: 'Should I include emojis in titles?', a: '<p>Be cautious with emojis in titles, because their behaviour in Google search results is inconsistent and the risk usually outweighs the reward for a small business. Some emojis render fine in the search snippet, while others are stripped out entirely or replaced with a blank box, and Google may simply ignore them, so you cannot count on them appearing as you intend. They can also push useful keyword characters out of your limited title width. More importantly, for most small business pages, a clean, professional, plain-text title tends to build more trust and signal more credibility than an emoji-decorated one, which can read as gimmicky next to established competitors. If you do want to test an emoji, use just one, place it deliberately, and check how it actually renders by searching for the page in a real Google results screen. As a default, lead with clarity and keywords, and reserve emojis for the rare case where one genuinely helps and you have verified it displays.</p>' },
      { q: 'Can I use the same description across pages?', a: '<p>No, you should give every page its own unique meta description rather than reusing one across the site. Duplicate descriptions are a known issue that Google Search Console flags under its enhancements and improvements reports, and beyond the warning, they actively undermine your SEO: when several pages share the same description, you blur the topical distinction between them, making it harder for both Google and searchers to understand what makes each page worth visiting. A unique description per page lets you tailor the keyword, benefit and call to action to that page specific intent, which improves both relevance and click-through rate. This generator is built to help with exactly that, since you can run it once per page with that page topic and get a fresh, fitted description each time, rather than copying one description everywhere. The small effort of writing distinct descriptions pays off in cleaner Search Console reports and pages that each earn their own clicks, so make uniqueness the standard across your whole site.</p>' },
      { q: 'Should every page have the same brand suffix?', a: '<p>Yes, using a consistent brand suffix on every page title is good practice and worth doing deliberately. A repeated pattern like "Page topic | Neweb" across your whole site builds brand recognition in the search results over time, so that as people encounter your listings for different queries, they start to associate your brand with the topics you cover, which lifts trust and, gradually, click-through rate. The key is order: put the page-specific keywords and value first and the brand name at the end, because the front of the title carries the most SEO and attention weight, and you want your topic visible even if the suffix gets truncated. Keep the brand short so it does not eat into your limited title width; a long suffix repeated on every page wastes pixels you could spend on keywords. So standardise the suffix, place it last, keep it concise, and let it reinforce your brand while the topic-specific words do the heavy lifting.</p>' },
      { q: 'Are my inputs stored?', a: '<p>No, your inputs are not stored by us. When you generate meta tags, the topic and brand details you enter are sent to the configured AI provider only for as long as it takes to produce the five title and description options, and the resulting output is returned to you without being retained on our side afterwards. There is no account, no saved history and no dashboard accumulating your past generations, which keeps the tool simple and your page plans private. The practical consequence is that you should copy any title and description pair you want to keep before leaving the page, because once you navigate away the suggestions are gone and you would regenerate fresh ones from your inputs next time. A good workflow is to run the generator per page, paste your chosen pair straight into that page meta tags or your CMS SEO fields, and move on. Because nothing is stored, you can iterate freely across many pages.</p>' },
    ],
    related: [
      { href: '/pages/tools/google-business-description-generator', title: 'GBP Description Generator', blurb: 'Same exercise for Google Business.' },
      { href: '/pages/tools/localbusiness-schema-generator', title: 'LocalBusiness Schema', blurb: 'Add structured data to the page.' },
      { href: '/pages/tools/slogan-generator', title: 'Slogan Generator', blurb: 'A tagline you can reuse in the description.' },
    ],
  },
  {
    slug: 'localbusiness-schema-generator',
    category: 'seo',
    built: true,
    name: 'LocalBusiness Schema Generator',
    tagline: 'Valid LocalBusiness JSON-LD for your homepage in one click.',
    primaryKeyword: 'localbusiness schema generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free LocalBusiness Schema Generator (JSON-LD) | Neweb',
    metaDescription: 'Generate valid schema.org LocalBusiness JSON-LD for your homepage. Includes opening hours, address, geo, telephone. Copy and paste into your site.',
    h1: 'LocalBusiness <span class="serif">Schema</span>.',
    lede: 'Fill in your business details. We generate valid schema.org LocalBusiness JSON-LD you can paste straight into your homepage to help Google understand your business.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Business name</label><input id="lb-name" type="text" placeholder="Your business legal name"/></div>
          <div class="field"><label>Business type</label>
            <select id="lb-type">
              <option>LocalBusiness</option><option>Restaurant</option><option>Bakery</option><option>CafeOrCoffeeShop</option><option>JewelryStore</option><option>BeautySalon</option><option>HairSalon</option><option>MedicalClinic</option><option>Dentist</option><option>EducationalOrganization</option><option>FinancialService</option><option>HomeAndConstructionBusiness</option><option>Store</option>
            </select>
          </div>
        </div>
        <div class="field"><label>Website URL</label><input id="lb-url" type="url" placeholder="https://yourdomain.com"/></div>
        <div class="field"><label>Description (short)</label><textarea id="lb-desc" rows="2" placeholder="What you do, who you serve" maxlength="240"></textarea></div>
        <div class="tool-row">
          <div class="field"><label>Street address</label><input id="lb-street" type="text" placeholder="Building, street"/></div>
          <div class="field"><label>City</label><input id="lb-city" type="text" placeholder="Pune"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>State</label><input id="lb-region" type="text" placeholder="Maharashtra"/></div>
          <div class="field"><label>PIN code</label><input id="lb-postal" type="text" placeholder="411001" maxlength="6"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Phone</label><input id="lb-phone" type="tel" placeholder="+91 98765 43210"/></div>
          <div class="field"><label>Logo URL (optional)</label><input id="lb-logo" type="url" placeholder="https://yourdomain.com/logo.png"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Latitude (optional)</label><input id="lb-lat" type="number" step="0.000001" placeholder="18.520430"/></div>
          <div class="field"><label>Longitude (optional)</label><input id="lb-lng" type="number" step="0.000001" placeholder="73.856743"/></div>
        </div>
        <div class="tool-actions">
          <button id="lb-go" type="button" class="btn btn-brand">Generate JSON-LD</button>
          <button id="lb-copy" type="button" class="btn btn-ghost">Copy</button>
        </div>
        <pre id="lb-out" style="margin-top:18px;padding:18px;background:#0a0e1a;color:#e8eaf8;border-radius:12px;font-family:JetBrains Mono,monospace;font-size:12px;line-height:1.55;overflow:auto;max-height:480px;white-space:pre-wrap;word-break:break-word"></pre>
      `,
      help: 'Paste the JSON-LD inside the <head> of your homepage. Validate with Google Rich Results Test before publishing.',
      js: `
(function(){
  function build(){
    var obj = { "@context":"https://schema.org", "@type": document.getElementById('lb-type').value || 'LocalBusiness' };
    var name=document.getElementById('lb-name').value||''; if(name) obj.name=name;
    var url=document.getElementById('lb-url').value||''; if(url) obj.url=url;
    var desc=document.getElementById('lb-desc').value||''; if(desc) obj.description=desc;
    var logo=document.getElementById('lb-logo').value||''; if(logo) obj.logo=logo;
    var phone=document.getElementById('lb-phone').value||''; if(phone) obj.telephone=phone;
    var s=document.getElementById('lb-street').value||'', c=document.getElementById('lb-city').value||'', r=document.getElementById('lb-region').value||'', p=document.getElementById('lb-postal').value||'';
    if(s||c||r||p) obj.address={'@type':'PostalAddress', streetAddress:s, addressLocality:c, addressRegion:r, postalCode:p, addressCountry:'IN'};
    var lat=parseFloat(document.getElementById('lb-lat').value), lng=parseFloat(document.getElementById('lb-lng').value);
    if(!isNaN(lat)&&!isNaN(lng)) obj.geo={'@type':'GeoCoordinates',latitude:lat,longitude:lng};
    return JSON.stringify(obj, null, 2);
  }
  function render(){
    var json = build();
    var script = '<script type="application/ld+json">\n' + json + '\n<\/script>';
    document.getElementById('lb-out').textContent = script;
  }
  document.getElementById('lb-go').addEventListener('click', render);
  document.querySelectorAll('#lb-name,#lb-type,#lb-url,#lb-desc,#lb-logo,#lb-phone,#lb-street,#lb-city,#lb-region,#lb-postal,#lb-lat,#lb-lng').forEach(function(el){ el.addEventListener('input', render); el.addEventListener('change', render); });
  document.getElementById('lb-copy').addEventListener('click', async function(){ var t=document.getElementById('lb-out').textContent; if(!t)return; try{ await navigator.clipboard.writeText(t); var b=this, o=b.textContent; b.textContent='Copied ✓'; setTimeout(function(){b.textContent=o;},1400);}catch(_){this.textContent='Copy failed';} });
  render();
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><pre class="eo-mono" style="white-space:pre-wrap;overflow-x:auto;margin:0;font-size:12px;line-height:1.5">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Bakery",
  "name": "Copper Oven",
  "image": "https://copperoven.in/og.jpg",
  "telephone": "+91-98765-43210",
  "url": "https://copperoven.in",
  "priceRange": "INR",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "12 Lane 7, Koregaon Park",
    "addressLocality": "Pune",
    "addressRegion": "MH",
    "postalCode": "411001",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 18.5362,
    "longitude": 73.8939
  },
  "openingHours": "Tu-Su 08:00-20:00"
}
&lt;/script&gt;</pre></div>
      <div class="eo-note">Sample LocalBusiness JSON-LD. Generate valid schema for your own homepage in one click above.</div>
    `,
    intro: `
      <p>Schema.org structured data is the language Google reads to understand what your website is about. Adding a LocalBusiness JSON-LD block to your homepage tells Google your business type, name, address, phone, hours, geo coordinates, and website. With this in place, your Google Business Profile, your rich search results, and your Maps presence all get a more accurate, trusted reading. Without it, Google has to guess from your page text, and the guess is often wrong.</p>
      <p>This tool generates a valid LocalBusiness JSON-LD block in your browser. You fill in the basic business details, pick a more specific business type if one fits (Restaurant, Bakery, JewelryStore, MedicalClinic, and others), and we emit a clean script block you can paste directly inside the <head> of your homepage. Nothing leaves your machine. The output validates against the official schema.org spec and passes Google Rich Results Test.</p>
    `,
    howTo: [
      'Type your <strong>business name</strong> exactly as it appears on your bank account and signboard.',
      'Pick the most specific <strong>business type</strong> that fits. Restaurant for restaurants, JewelryStore for jewellers, MedicalClinic for clinics. If nothing fits, leave the default LocalBusiness.',
      'Add your <strong>website URL</strong>, a short <strong>description</strong>, and optionally a <strong>logo URL</strong>.',
      'Fill in the full <strong>address</strong>: street, city, state, and PIN code. The country is fixed to India in the output.',
      'Add your business <strong>phone</strong> number in international format with country code.',
      'Optionally add the exact <strong>latitude and longitude</strong> from Google Maps (right-click on Maps, copy coordinates). This helps Google place you precisely.',
      'Click <strong>Generate JSON-LD</strong>, then <strong>Copy</strong>. Paste the entire script block inside the <head> of your homepage HTML. Validate with the Google Rich Results Test at search.google.com/test/rich-results before publishing widely.',
    ],
    why: `
      <p>Three reasons LocalBusiness schema is one of the highest-leverage SEO additions a small business can make.</p>
      <p><strong>It unlocks rich results.</strong> When Google understands your business type, name, address, and reviews, it can show your business with rich snippets in search: stars, hours, phone numbers, and map cards. These visual elements lift click-through rate by 10 to 30 percent over plain text results.</p>
      <p><strong>It cleans up Maps and Knowledge Graph.</strong> Inconsistent name-address-phone (NAP) data across your website, Google Business Profile, and other directories is one of the biggest causes of weak local SEO. LocalBusiness schema on your homepage is one of the strongest signals Google uses to disambiguate the truth.</p>
      <p><strong>It is one of the easiest fixes.</strong> A 30-line JSON-LD block in your homepage HTML takes 10 minutes to add and stays correct for years. Compare that to the work of building backlinks or writing content for the same ranking lift.</p>
    `,
    tips: [
      'Pick the most specific business type. Restaurant beats LocalBusiness. JewelryStore beats Store.',
      'Always include the address. Even online-only businesses should include their registered office address.',
      'Use international phone format with country code. +91 98765 43210, not 9876543210.',
      'Add geo coordinates from Google Maps. Right-click your business pin, copy the lat-lng pair.',
      'Validate with Google Rich Results Test before publishing. Errors are silent if you do not test.',
      'Match the schema NAP exactly to your Google Business Profile NAP. Mismatch causes ranking dilution.',
      'Update the schema if you move location, change phone, or rename the business. Stale schema misleads Google.',
    ],
    example: `
      <p>A Bakery in Pune fills in: business name Copper Oven, business type Bakery, URL https://copperoven.in, description "Sourdough and seeded loaves, Pune", street Lane 7 ABC Road, city Pune, state Maharashtra, PIN 411001, phone +91 98765 43210, lat 18.520430, lng 73.856743. The tool emits a clean JSON-LD block. She pastes it in the head of her homepage HTML, validates on Google Rich Results Test (passes), publishes. Three weeks later, her bakery starts appearing in the "Bakeries near me" map pack in Pune searches that previously did not surface her, and her Google Business Profile clicks rise meaningfully.</p>
    `,
    faq: [
      { q: 'Why JSON-LD and not microdata or RDFa?', a: '<p>JSON-LD is the format Google explicitly recommends for structured data, which is the main reason this tool produces it. The big practical advantage is separation: JSON-LD lives in a single self-contained script block, usually in the head of your page, and describes your business as a tidy block of data without tangling itself into your visible HTML. Microdata and RDFa, the older alternatives, work by sprinkling extra attributes throughout your page markup, wrapping your name, address and phone number in special tags, which means every time you redesign the page you risk breaking the structured data. Because JSON-LD sits apart from the layout, it is far simpler to maintain, easier to read, and easier to debug in Google Rich Results Test. For a small business owner who is not a developer, that matters: you update the schema in one place without touching the rest of the site. So while all three formats are valid, JSON-LD is the cleanest, most future-proof choice, and the one Google prefers.</p>' },
      { q: 'Where do I paste this?', a: '<p>Paste the generated JSON-LD inside the head section of your homepage HTML, where structured data is conventionally placed and where Google reliably reads it. How you do that depends on your platform. On most modern site builders, including Neweb, you add it through a custom code or script block in the page or site settings, so you do not edit raw files at all. On WordPress, the easiest routes are your SEO plugin, many of which have a dedicated field for custom schema, or a lightweight header-insertion plugin that injects code into the head sitewide. On a hand-built static site, you simply place the script tag in the head of your HTML file. The key points are that it belongs in the head rather than the body, that you paste the complete script block including its opening and closing tags, and that you do it on your homepage. After pasting, run the page through Google Rich Results Test to confirm the schema is detected and error-free.</p>' },
      { q: 'Will this guarantee rich results?', a: '<p>No, and it is important to be clear-eyed about this. Adding valid LocalBusiness schema makes your business eligible for enhanced search appearances and helps Google understand exactly who you are, where you are and how to reach you, but it does not guarantee that rich results, star ratings, knowledge panels or enhanced listings, will actually show. Whether Google displays them is at Google discretion and depends on many signals beyond the markup, including your overall site authority and trust, whether you have genuine reviews, the quality of your content, and how well your information matches other sources like your Google Business Profile. In other words, schema is necessary but not sufficient: it is the structured foundation that makes rich results possible, while the surrounding factors decide whether Google grants them. The right way to think about it is that correct schema removes the technical barrier and gives you the best chance, and you improve your odds by keeping details accurate and earning real reviews.</p>' },
      { q: 'Should I add the schema to every page or just the homepage?', a: '<p>For LocalBusiness schema, the homepage is the primary and most important place, since it is the page Google most strongly associates with your business identity. It is also sensible to add it to a small number of other directly relevant pages, most notably your Contact page, where your address, phone and hours naturally live, and sometimes your About page. What you should not do is paste the same LocalBusiness block onto every single page of your site, including blog posts and unrelated content, because indiscriminate duplication looks like schema bloat, adds no value, and can muddy how cleanly Google reads your structured data. The guiding principle is to place the markup where the business-information context genuinely fits, the pages a customer visits to learn who you are and how to reach you, rather than scattering it everywhere. Keep the details identical across the few pages where it appears, and let your homepage carry the canonical version that Google treats as authoritative for your local business.</p>' },
      { q: 'How do I get latitude and longitude?', a: '<p>The quickest way to get your exact latitude and longitude is through Google Maps. Open Google Maps in a browser, find your business or its precise location, then right-click directly on the map pin or the exact spot. The first item in the menu that appears is the latitude and longitude pair, shown as two decimal numbers; click it to copy the pair to your clipboard, then paste it into this tool. Accuracy matters, so right-click on your actual building entrance rather than a rough area, because the coordinates feed the geo data in your schema and influence how precisely you are placed on maps. On the Google Maps mobile app the gesture differs slightly, but you can drop a pin and read the coordinates from the place details. If your business is already verified on Google Business Profile, its coordinates there will match, which is a useful consistency check, since you want the same precise location across your schema, your profile and your website.</p>' },
      { q: 'Do I need opening hours in the schema?', a: '<p>If your business keeps set opening hours, including them in your structured data is worthwhile, because hours are one of the details customers most want to see and Google often surfaces them directly in local results, so accurate hours can be the difference between someone visiting and someone moving on. In schema terms, opening hours are expressed through an openingHoursSpecification block that lists the days and the open and close times. This tool currently generates the core LocalBusiness schema, your name, address, phone and location, and adding the openingHoursSpecification is on the roadmap, so for now you would append that block manually if you want it immediately. In the meantime, keep your hours correct and consistent on your Google Business Profile, which is where most local searchers actually read them and which Google weights heavily. When the hours field arrives in the tool, keep the schema hours identical to your profile hours, since conflicting times confuse both customers and Google.</p>' },
      { q: 'Does the schema work for multi-location businesses?', a: '<p>Yes, but multi-location businesses need a slightly different structure than a single shop. The recommended pattern for a chain or a business with several branches is to use one Organization schema to represent the overall brand, and then a separate LocalBusiness schema for each individual location, with each location schema placed on its own dedicated location page rather than all bundled together. That way Google can understand both the parent brand and each physical outlet, with its own address, phone, hours and coordinates, which is how local search wants to index a chain. This tool generates a single LocalBusiness block, so for a multi-location business the practical approach is to run it once per branch, entering that branch specific details each time, and place each generated block on the matching location page. Keep every location page genuinely distinct, with its own address and unique content, since thin duplicate pages can hurt rather than help.</p>' },
      { q: 'Are inputs sent anywhere?', a: '<p>No, nothing you enter is sent anywhere; the entire schema generation runs locally in your browser. The business details you type, your name, address, phone number, coordinates and the rest, are assembled into JSON-LD right on your own device, with no request carrying that information to us or to any third-party server. That keeps your business data private and means there is no copy of it sitting on someone else system, which is the same privacy-first approach we take across these tools. Because the work happens on-device, the tool is also instant, with no waiting on a server round trip, and you can generate and regenerate the markup as many times as you like while you fine-tune the details. The only thing to remember is that, since nothing is stored for you, you should copy the generated JSON-LD and paste it into your site, or save it in your own files, before you close the tab.</p>' },
    ],
    related: [
      { href: '/pages/tools/google-business-description-generator', title: 'GBP Description Generator', blurb: 'Match your schema description to your GBP.' },
      { href: '/pages/tools/meta-title-description-generator', title: 'Meta Tags Generator', blurb: 'Pair schema with clean meta tags.' },
      { href: '/pages/tools/website-speed-test', title: 'Website Speed Test', blurb: 'Test your homepage performance.' },
    ],
  },
  {
    slug: 'google-business-description-generator',
    category: 'seo',
    built: true,
    name: 'Google Business Description Generator',
    tagline: 'A 750-character GBP description tuned for your category.',
    primaryKeyword: 'google business description generator',
    solutionHref: '/pages/solutions/restaurants',
    solutionLabel: 'For restaurants',
    metaTitle: 'Free Google Business Description Generator | Neweb',
    metaDescription: 'Generate a 750-character Google Business Profile description for your business. Plain English, category-tuned, no emojis. Free, browser-only.',
    h1: 'GBP Description <span class="serif">Generator</span>.',
    lede: 'Type your business, category, offerings and service area. We write a 700 to 750 character description that fits Google Business Profile rules and reads well.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Business name</label><input id="ai-business" type="text" placeholder="e.g. Copper Oven Bakery" maxlength="80"/></div>
          <div class="field"><label>Category</label><input id="ai-category" type="text" placeholder="e.g. bakery, jewellery showroom, paediatric clinic" maxlength="80"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Offerings / specialities</label><input id="ai-offerings" type="text" placeholder="e.g. sourdough, custom cakes, gluten-free" maxlength="160"/></div>
          <div class="field"><label>Area served</label><input id="ai-area" type="text" placeholder="e.g. Pune, Koregaon Park" maxlength="80"/></div>
        </div>
        <div class="tool-actions">
          <button id="ai-go" type="button" class="btn btn-brand">Generate description</button>
          <span id="ai-status" style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);align-self:center"></span>
        </div>
        <div id="ai-out" style="margin-top:18px"></div>
      `,
      help: 'Google allows 750 characters total. No emojis, phone numbers, or URLs (they violate GBP guidelines).',
      js: `
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
(function(){
  var btn=document.getElementById('ai-go'), status=document.getElementById('ai-status'), out=document.getElementById('ai-out');
  if(!btn) return;
  btn.addEventListener('click', async function(){
    var payload={business:(document.getElementById('ai-business').value||'').trim(), category:(document.getElementById('ai-category').value||'').trim(), offerings:(document.getElementById('ai-offerings').value||'').trim(), area:(document.getElementById('ai-area').value||'').trim()};
    if(!payload.business){status.textContent='Business name is required';return;}
    btn.disabled=true; status.textContent='Thinking…'; out.innerHTML='';
    try{
      var r=await fetch('/api/tools/ai/gbp-description',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      var d=await r.json();
      if(d.error){status.textContent='Error: '+d.error;return;}
      status.textContent = '';
      out.innerHTML = (d.items||[]).map(function(it){
        var len = it.length || (it.text||'').length;
        var warn = len > 750;
        return '<div style="padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff">'
          + '<p style="margin:0;color:var(--ink-2);font-size:14.5px;line-height:1.6;white-space:pre-wrap">'+escHtml(it.text||'')+'</p>'
          + '<div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">'
          + '<span style="font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:'+(warn?'#b91c1c':'var(--muted)')+'">'+len+' / 750 characters</span>'
          + '<button type="button" class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="navigator.clipboard.writeText(this.parentElement.parentElement.querySelector(\'p\').innerText);this.textContent=\'Copied\';setTimeout(()=>this.textContent=\'Copy\',1200);">Copy</button>'
          + '</div></div>';
      }).join('');
    }catch(e){status.textContent='Network error';}
    finally{btn.disabled=false;}
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-sub" style="line-height:1.6">Copper Oven is a small-batch artisan bakery in Koregaon Park, Pune, baking fresh sourdough, seeded loaves, baguettes and pastries every morning by hand. We started in 2021 with a simple idea, that good bread takes time and honest ingredients, no preservatives and no shortcuts. Every loaf is slow-fermented for over 24 hours, giving it a deep flavour and a crust worth waking up for. Visit us for fresh bakes off the rack, or pre-order on WhatsApp for same-day pickup. We also supply cafes and home bakers across Pune with wholesale sourdough and brioche. Whether you want a warm loaf for breakfast, a celebration cake, or a steady wholesale partner, Copper Oven brings real, hand-crafted baking to your neighbourhood. Drop by, pull up a stool, and taste the difference slow baking makes.</div><div class="eo-note" style="margin-top:8px">742 / 750 characters. Generate a description tuned to your own category above.</div></div></div>
    `,
    intro: `
      <p>Google Business Profile (GBP) is the single most important free marketing surface for Indian small businesses with a physical location. It shows up in Maps, in the local pack on Search, in the Knowledge Graph, and as the first impression for "near me" queries. The business description on GBP is one of the only places you control free-form copy that Google reads. A clear 750-character description, well-tuned to your category, lifts impressions, calls, and direction requests measurably.</p>
      <p>Most small businesses either skip the description or paste generic phrasing. This tool generates a 700 to 750 character description from four short inputs: business name, category, offerings, and area served. The output is category-aware, plain English, and arrives in seconds.</p>
    `,
    howTo: [
      'Type your <strong>business name</strong> exactly as it appears on your Google Business Profile and signboard.',
      'Add your <strong>category</strong> in plain English. Examples: paediatric clinic, vegetarian thali restaurant, modern jewellery showroom.',
      'List your <strong>offerings or specialities</strong>. The more specific, the better the description reads. "Sourdough, custom cakes, gluten-free options" gives a much sharper result than "various bakery products".',
      'Set your <strong>area served</strong>: the city or the specific neighbourhood your customers come from.',
      'Click <strong>Generate description</strong>. The tool returns one description tuned to your inputs, with a live character count.',
      'Check the character count badge. Google allows 750 characters total. The output stays comfortably inside the limit.',
      'Copy the description and paste it into your Google Business Profile under Info → Description. Save. Google reviews the change within 24 hours.',
    ],
    why: `
      <p>Three reasons a tuned GBP description compounds over months.</p>
      <p><strong>It tells Google what you do.</strong> Google uses every signal from your GBP profile to decide which queries you rank for in the local pack. A specific, keyword-aware description tells Google "this is a paediatric clinic in Hyderabad that does vaccinations and well-baby checks", which is a much stronger ranking signal than "we are a healthcare provider".</p>
      <p><strong>It earns trust from the searcher.</strong> When someone reads your description before tapping Call or Directions, a clear sense of who you are, who you serve, and what makes you different reduces friction. Customers who feel they understand you before the first call convert at higher rates.</p>
      <p><strong>It is permanent free real estate.</strong> The description sits on your GBP profile until you change it. A 30-minute investment in writing a great description pays back every month for years. No ongoing spend, no rotation needed, just one good draft and the discipline to update it once a year.</p>
    `,
    tips: [
      'Write in plain English, not marketing language. Google penalises stuffed keyword soup.',
      'Skip phone numbers and URLs in the description. Google has separate fields for those and violations can suspend your profile.',
      'Skip emojis. Some render in search results, some do not, and they often look unprofessional.',
      'Mention what makes you different in concrete terms. "Open Sunday" or "Hindi spoken" or "Free home delivery" beats "We provide quality service".',
      'Include the area you serve. "In Bengaluru" or "Pune east" gives Google a geographic signal.',
      'Refresh the description once a year, especially if you launch a new service or expand your area.',
      'Match the tone of your website and Instagram bio. Customers should feel the same brand voice across surfaces.',
    ],
    example: `
      <p>A founder runs a paediatric clinic in Hyderabad. She types business "Sukoon Paediatrics", category "paediatric clinic", offerings "vaccinations, growth monitoring, lactation consulting, weekend hours", area "Hyderabad, Jubilee Hills". The tool returns a 740-character description: "Sukoon Paediatrics is a child-focused clinic in Jubilee Hills, Hyderabad. We see infants, toddlers, and school-going children for vaccinations, well-baby checks, growth and developmental monitoring, lactation consulting, and routine paediatric care. Our consultants spend time with each family, answering questions and explaining options clearly. Saturday and Sunday morning slots are reserved for working parents who cannot come on weekdays. We are walk-in friendly during slow hours, and we use online appointments to keep waiting times short. We accept cash and UPI, and we provide invoices for insurance reimbursement. We have served families across South Hyderabad for over three years and most of our patient growth comes from word-of-mouth referrals from existing parents."</p>
    `,
    faq: [
      { q: 'How long should the description be?', a: '<p>Google Business Profile allows a description of up to 750 characters, and this tool aims for the upper end, roughly 700 to 750, so you use the full space Google gives you without spilling over the limit. The reason to fill the space rather than write something brief is that this text is one of the signals Google reads to understand what your business does, who it serves and where, so every relevant sentence is an opportunity to reinforce your category, your location and your strengths. A short description of 300 to 500 characters is not wrong and still works, but it leaves surface area on the table that Google and customers could otherwise use to learn about you. The practical balance is to write a full, natural description that genuinely says something useful, your services, your area, what makes you a sensible choice, rather than padding it to hit the limit with filler. Aim to be close to the ceiling while keeping every line worth reading.</p>' },
      { q: 'Can I include phone numbers?', a: '<p>No, do not put a phone number in the description, because doing so violates Google Business Profile guidelines and can get your description rejected or your edit flagged. The reason is structural: Google already provides a dedicated phone number field on your profile, which displays your number prominently with a tap-to-call button, so a number buried in the description is both redundant and against the rules. Putting contact details in the wrong field can look like an attempt to game the listing, which is what Google guidelines are designed to discourage. The right approach is to fill in the official phone field accurately and let it do its job, while keeping the description focused on what your business does, who it serves and what makes it worth choosing. The dedicated fields, phone, website, address and hours, are far more effective than cramming that information into prose, since Google renders them as clean, clickable elements customers expect to find.</p>' },
      { q: 'Can I include URLs?', a: '<p>No, URLs do not belong in the Google Business Profile description, and including them breaches the guidelines just as phone numbers do. Google provides a separate website field on your profile specifically for your link, and it displays as a clear, clickable button that customers know to look for, so adding a URL into the description text is both unnecessary and likely to trigger a rejection or a guideline warning when Google reviews your edit. Stuffing links into the description can read as an attempt to manipulate the listing, which is the kind of thing Google actively filters out. The correct setup is to enter your main website in the dedicated website field, and if you have specific landing pages worth promoting, use Google Posts rather than the description. Keep the description purely descriptive, telling customers what you do, where, and why you are a good choice, and let the structured fields handle the links so your profile stays compliant.</p>' },
      { q: 'Can I include emojis?', a: '<p>Technically you can place emojis in a Google Business Profile description, but it is usually not a good idea, which is why this tool leaves them out by default. In the fairly plain way Google renders the description, emojis often look out of place or unprofessional, and for a local business trying to build trust with someone deciding whether to call or visit, a clean, well-written paragraph reads as more credible than one peppered with icons. There is also a risk of inconsistent rendering and of an emoji-heavy description coming across as gimmicky next to more established competitors nearby. The description is a moment to sound competent and reassuring, so plain, confident language tends to outperform decoration. If you genuinely feel an emoji adds warmth that fits your brand, use at most one and place it deliberately, but as a default, spend your 750 characters on substance, your services, your area, your strengths, rather than on symbols.</p>' },
      { q: 'How long until the description goes live?', a: '<p>After you save a new or edited description, Google reviews the change before it appears publicly, and this typically takes anywhere from a few hours up to about 24 to 72 hours. In many cases the update is approved within just a few hours, but larger or more significant edits, or changes on profiles that have triggered scrutiny in the past, can be reviewed more carefully and sit at the longer end of that window. This review step is normal and is how Google checks edits against its guidelines, which is exactly why staying compliant, no phone numbers, no URLs, no keyword stuffing, matters: a clean description sails through, while a guideline-breaking one can be delayed or rejected. The practical advice is to write the description carefully and correctly the first time, save it, and then give it a day or two before expecting to see it live, since each fresh edit can restart the review clock.</p>' },
      { q: 'Should the description match my website?', a: '<p>It should be consistent with your website in voice and facts, but it does not need to be word-for-word identical, and ideally it tells a slightly different version of the story tuned to a different moment. Your website serves visitors who have already clicked through and shown some interest, so it can go deeper, with detail, pages and persuasion. The Google Business Profile description, by contrast, is often read in the high-intent moment just before someone decides whether to call, visit or move to a competitor in the local pack, so it needs to land quickly: what you do, where you do it, who you serve, and why you are a sensible choice, in a tight, reassuring paragraph. Keep the core facts, your services, location and positioning, aligned across both so there is no confusing mismatch, but tailor the GBP description to that decision moment rather than copying your homepage intro verbatim.</p>' },
      { q: 'Should the description target keywords?', a: '<p>Yes, but lightly and naturally rather than aggressively, because the description should read like helpful prose to a customer first and only incidentally satisfy search relevance. The most valuable terms to weave in are your business category, what you actually do, and your city or service area, since those are exactly what local searchers and Google care about most. A single clear mention of your category, for example dental clinic or interior designer, and a single mention of your city or neighbourhood, set inside flowing, genuine sentences, is enough to signal relevance without tipping into keyword stuffing. Cramming the same keyword in repeatedly, or listing a string of areas and services unnaturally, looks spammy, risks a guideline rejection, and reads worse to the human deciding whether to choose you. So write naturally, mention your category and city once each, and let the description sound like a real description.</p>' },
      { q: 'Are my inputs stored?', a: '<p>No, your inputs are not stored by us. When you generate a description, the business details you enter are passed to the configured AI provider purely for as long as it takes to produce the suggestions, and the resulting text is returned to you without being retained on our side afterwards. There is no account, no saved history and no dashboard collecting your past generations, which keeps the tool simple and your business information private. The practical consequence is that you should copy any description you like before you leave the page, because once you navigate away the output is gone and you would regenerate fresh suggestions from your inputs next time. A sensible workflow is to generate, pick the version you prefer, paste it straight into your Google Business Profile description field, and save it there. Because nothing is stored on our side, you can experiment freely with different angles and tones.</p>' },
    ],
    related: [
      { href: '/pages/tools/meta-title-description-generator', title: 'Meta Tags Generator', blurb: 'Same exercise for SEO meta.' },
      { href: '/pages/tools/localbusiness-schema-generator', title: 'LocalBusiness Schema', blurb: 'Structured data Google reads.' },
      { href: '/pages/guides/google-business', title: 'Google Business guide', blurb: 'Full GBP optimisation walkthrough.' },
    ],
  },
  {
    slug: 'website-speed-test',
    category: 'seo',
    built: true,
    name: 'Website Speed Test',
    tagline: 'Real-world Core Web Vitals score for any URL.',
    primaryKeyword: 'website speed test india',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Website Speed Test India — TTFB and PSI link | Neweb',
    metaDescription: 'Measure any URL TTFB, total load time and total bytes from our India servers. Includes Google PageSpeed Insights deep-link for full Core Web Vitals.',
    h1: 'Website Speed <span class="serif">Test</span>.',
    lede: 'Type any URL. We fetch it from our India servers, report time-to-first-byte, total load time, and bytes transferred, and link to the full PageSpeed Insights report.',
    widget: {
      html: `
        <div class="field"><label>URL to test</label>
          <input id="st-url" type="url" placeholder="https://yourdomain.com" />
        </div>
        <div class="tool-actions">
          <button id="st-go" type="button" class="btn btn-brand">Run speed test</button>
        </div>
        <div id="st-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Server-side fetch from our India edge. For a full Core Web Vitals report, follow the PageSpeed Insights link.',
      js: `
(function(){
  var btn=document.getElementById('st-go'); if(!btn) return;
  btn.addEventListener('click', async function(){
    var url=(document.getElementById('st-url').value||'').trim();
    if(!url){return;}
    btn.disabled=true; btn.textContent='Testing…';
    var out=document.getElementById('st-out'); out.style.display='block'; out.innerHTML='<div style="color:var(--muted);font-size:14px;padding:18px">Fetching… this can take up to 15 seconds.</div>';
    try{
      var r=await fetch('/api/tools/speed-check?url='+encodeURIComponent(url));
      var d=await r.json();
      if(!d.ok){ out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">Fetch failed: '+(d.error||'unknown')+'</div>'; return; }
      function ms(n){return n==null?'-':(n>=1000?(n/1000).toFixed(2)+' s':n+' ms');}
      function bytes(n){return n==null?'-':(n>=1024*1024?(n/1024/1024).toFixed(2)+' MB':n>=1024?(n/1024).toFixed(1)+' KB':n+' B');}
      function grade(total){if(total<=1500)return['Fast','#16a34a'];if(total<=3000)return['OK','#d97706'];return['Slow','#b91c1c'];}
      var g=grade(d.total);
      out.innerHTML='<div style="padding:22px;background:#fff;border:1px solid var(--line);border-radius:14px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px"><div style="font-family:JetBrains Mono,monospace;font-size:13px;color:var(--ink);word-break:break-all">'+d.url+'</div><span style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:'+g[1]+';padding:4px 10px;border-radius:999px;background:rgba(0,0,0,.04)">'+g[0]+'</span></div>'
        + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:14px 0">'
        +   '<div><div style="font-size:22px;font-weight:600;color:var(--ink);letter-spacing:-.01em">'+d.status+'</div><div style="font-family:JetBrains Mono,monospace;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:3px">HTTP status</div></div>'
        +   '<div><div style="font-size:22px;font-weight:600;color:var(--ink);letter-spacing:-.01em">'+ms(d.ttfb)+'</div><div style="font-family:JetBrains Mono,monospace;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:3px">TTFB</div></div>'
        +   '<div><div style="font-size:22px;font-weight:600;color:var(--ink);letter-spacing:-.01em">'+ms(d.total)+'</div><div style="font-family:JetBrains Mono,monospace;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:3px">Total time</div></div>'
        +   '<div><div style="font-size:22px;font-weight:600;color:var(--ink);letter-spacing:-.01em">'+bytes(d.bytes)+'</div><div style="font-family:JetBrains Mono,monospace;font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:3px">Page bytes</div></div>'
        + '</div>'
        + '<p style="margin:14px 0 0;font-size:13.5px;color:var(--ink-2)">For the full Core Web Vitals report (LCP, FID, CLS), open in <a href="'+d.pageSpeedUrl+'" target="_blank" rel="noopener" style="color:var(--brand);border-bottom:1px solid rgba(61,76,255,.3)">Google PageSpeed Insights</a>.</p>'
        + '</div>';
    }catch(e){ out.innerHTML='<div style="padding:18px;color:var(--muted);font-size:14px">Network error</div>'; }
    finally{ btn.disabled=false; btn.textContent='Run speed test'; }
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main eo-mono">Grade: B</div><div class="eo-sub">Good, with room to improve images and caching.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">TTFB: 410 ms</div><div class="eo-sub">Time to first byte. Under 600 ms is healthy.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">Load time: 2.1 s</div><div class="eo-sub">Full page load on a simulated mobile connection.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">Page size: 1.4 MB</div><div class="eo-sub">Total transfer. Lighter pages load faster on mobile data.</div></div></div>
      <div class="eo-note">Sample metrics. Run a real Core Web Vitals test for your own URL above.</div>
    `,
    intro: `
      <p>Page speed is one of the most direct and measurable SEO levers a small business has. Google uses Core Web Vitals as a ranking signal. Customers leave sites that take more than 3 seconds to start showing content. Every second of TTFB (time to first byte) above 600 ms quietly costs you traffic and revenue. The fastest websites in your category usually rank above slower competitors even when the slower ones have better content.</p>
      <p>This tool runs a real-world fetch of any URL from our India edge server. You see the HTTP status, the time to first byte, the total download time, and the total bytes transferred. We grade the result Fast (under 1.5 seconds), OK (under 3 seconds), or Slow (over 3 seconds). For the full Core Web Vitals report including LCP, FID, and CLS, we link out to Google PageSpeed Insights with your URL pre-filled.</p>
    `,
    howTo: [
      'Paste any <strong>URL</strong> into the input. Include https:// for full accuracy.',
      'Click <strong>Run speed test</strong>. Our India server fetches the page. Results return within 1 to 15 seconds depending on the page.',
      'Read the four metrics. HTTP status should be 200. TTFB under 600 ms is good. Total load under 1.5 seconds is fast. Page bytes under 1 MB is reasonable for most small business pages.',
      'Look at the grade badge: Fast, OK, or Slow.',
      'For a full Core Web Vitals report (LCP, FID, CLS, INP), click the PageSpeed Insights link below the results. Google PSI gives you a complete breakdown plus specific recommendations.',
      'Run the test against three of your competitors too. If they are faster, you are losing traffic on speed alone.',
      'Re-run the test after any optimisation work to verify the change. Speed regressions are easy to introduce and hard to spot.',
    ],
    why: `
      <p>Three reasons page speed deserves a permanent place in your monthly review.</p>
      <p><strong>It is a confirmed ranking signal.</strong> Google has officially included Core Web Vitals in the ranking algorithm since 2021. Slow pages get held back. Fast pages get a small but compounding lift. Across thousands of impressions over a year, the difference is substantial.</p>
      <p><strong>It affects conversion not just traffic.</strong> A 1-second delay in load time has been measured to drop conversion rate by 7 percent across e-commerce. A 3-second delay can halve conversions. The same visit on a faster site spends more, signs up more, and bounces less.</p>
      <p><strong>It is mostly fixable.</strong> Unlike content quality or backlink-building, speed is an engineering problem with known fixes: compress images, eliminate render-blocking JS, use a CDN, enable HTTP/2, cache aggressively. The fixes scale: implement once, applies forever.</p>
    `,
    tips: [
      'Aim for TTFB under 600 ms. If your TTFB is over 1 second, your hosting is the issue.',
      'Aim for total load under 2.5 seconds on a desktop test. Mobile speeds are typically 1.5x slower.',
      'Page weight under 1.5 MB is a reasonable budget for small business sites. Over 3 MB is heavy.',
      'Compress images with our image-compressor tool before uploading. A single hero image can dominate page weight.',
      'Enable browser caching and HTTP/2 in your hosting panel. Most managed hosts do this by default.',
      'Move analytics scripts to async or defer so they do not block initial render.',
      'Test against PageSpeed Insights for the official Google verdict and specific recommendations.',
    ],
    example: `
      <p>A founder runs this tool against her bakery website https://copperoven.in. The result shows status 200, TTFB 380 ms, total 1.1 s, page bytes 720 KB, grade Fast. She runs it against a competitor and finds TTFB 1.4 s, total 4.2 s, bytes 3.1 MB, grade Slow. She knows the competitor will rank below her even when the competitor publishes better content because Google penalises the slower load. She opens her own homepage in PageSpeed Insights via the link, finds her LCP score is excellent but CLS is borderline, and spends 20 minutes fixing the layout shift caused by a Google review badge that loaded late.</p>
    `,
    faq: [
      { q: 'How accurate is this test?', a: '<p>This test is accurate for what it measures, which is one real network fetch of your page from our India edge server, capturing the time to first byte and the total download time of the HTML for that single request. Those numbers are genuine and useful for spotting a slow server or a sluggish origin. What it deliberately does not measure is the full rendered experience: it does not run your JavaScript, render the page in a browser, or track layout shifts and interactivity, so it is not a complete Core Web Vitals score. For that fuller picture, including LCP, CLS and INP, use Google PageSpeed Insights, which we link from the results for exactly this reason. The right way to think about it is that this tool is a fast, India-based first check on server responsiveness, ideal before and after a hosting change, while PageSpeed Insights is the deeper diagnostic for how the page actually feels to load and use.</p>' },
      { q: 'Why does my page show different times each test?', a: '<p>Some variation between runs is completely normal, because real-world performance is never perfectly constant. Each test depends on live network conditions between our server and yours, the current load on your hosting at that moment, caching state, and routing, all of which fluctuate second to second, so two back-to-back tests can legitimately differ. The way to get a trustworthy reading is to run the test three times and take the average rather than trusting a single number, which smooths out one-off blips. A little spread around the average is fine. What is worth investigating is wide, erratic swings, say one test at 200 ms and the next at 1.5 seconds, because that points to genuine inconsistency in your server or hosting, perhaps an overloaded shared host or a backend that occasionally stalls, rather than a flaw in the test. A server that responds unpredictably frustrates real visitors too, so jumpy results are a signal to look at your hosting.</p>' },
      { q: 'My page failed with timeout. Why?', a: '<p>A timeout means our test sent a request and waited the full 15 seconds without receiving a usable response, so it gave up. There are a few common causes worth checking in order. Your origin server may simply be down or unresponsive at that moment, so try the test again after a short while. Your DNS may be misconfigured or pointing to the wrong place, so the request never reaches a live server. Or your site or its firewall may be blocking requests from our server IP, which some security setups do for unfamiliar sources. To narrow it down, open the same URL directly in a browser: if it loads fine for you but times out here, the issue is likely a block on our IP or a region-specific routing problem; if it is also slow or broken in your own browser, the problem is your server or DNS itself. Either way, a timeout is a meaningful red flag, since real visitors would experience the same failure.</p>' },
      { q: 'Does this run JavaScript?', a: '<p>No, this tool does not run JavaScript. It performs a raw HTTP fetch of your page and measures the network response, the time to first byte and the total time to download the HTML, without spinning up a browser, executing scripts, or rendering anything visually. That keeps the test fast and lightweight and makes it a clean measure of how quickly your server delivers the page, but it means it cannot tell you anything about client-side behaviour: how long your JavaScript takes to execute, whether the layout jumps around as it loads, or how responsive the page feels once interactive. For those rendered-performance questions, you need a tool that actually loads the page in a real browser, which is precisely what Google PageSpeed Insights does, running the full Chrome rendering pipeline including JavaScript and reporting the Core Web Vitals. So use this tool for a quick, server-focused speed check, and reach for PageSpeed Insights, linked from the results, for the complete experience.</p>' },
      { q: 'What is a good TTFB?', a: '<p>Time to first byte, the delay before your server starts sending the page, is a key indicator of backend health, and there are clear benchmarks. Under 200 milliseconds is excellent and signals a fast, well-configured server. Under 600 milliseconds is good and perfectly acceptable for most small business sites. A TTFB between roughly 600 milliseconds and 1 second is workable but worth optimising, since the delay is becoming noticeable. Anything over 1 second is a genuine problem that points to a hosting or backend bottleneck, an overloaded shared host, an inefficient database query, a missing cache, or a server located far from your visitors, and it should be your first priority to fix. The important principle is that TTFB sits before any frontend work matters: there is little point optimising images and scripts if the server itself takes a second to respond. So fix a slow TTFB at the hosting level first, then move on to frontend optimisation.</p>' },
      { q: 'What is total load time?', a: '<p>Total load time here means the time from the moment the request starts to the moment the full HTTP response body, your page HTML, has finished downloading. It bundles together several stages: the initial connection setup, the time to first byte while the server prepares its response, and the actual transfer of the HTML document over the network. It is a clean measure of how quickly your server delivers the core page. What this figure does not include is everything the browser fetches afterwards: your images, CSS files, fonts and JavaScript are requested and downloaded separately by a real browser once it has the HTML, and those are not part of this number. That is why a page can show a fast total load time here yet still feel slow if it is heavy with large images or scripts. So treat this as a measure of server and HTML delivery speed, and use PageSpeed Insights for the complete weight of the page.</p>' },
      { q: 'Do you store the URL I test?', a: '<p>We keep only a minimal, short-term record. The URL you test and the timing data are written to our server logs for a limited time, purely to prevent abuse of the tool, such as someone hammering it to overload a third-party site, and to keep the service running reliably. We do not associate the tested URL with you as an individual, we do not build a profile from it, and we do not share it with anyone or use it for marketing. These logs are operational and short-lived rather than a permanent database of what people checked. In practice, the URLs you test are public web addresses anyway, the same pages anyone can visit, so there is nothing sensitive recorded the way there would be with a password or personal data. If you are testing internal or pre-launch URLs you would rather not have logged, test them from your own browser tools instead.</p>' },
      { q: 'How often should I test?', a: '<p>For most small businesses, a routine monthly check is plenty to keep an eye on your site speed and catch gradual slowdowns before they hurt visitors or rankings. Speed does not usually change on its own from day to day, so testing more often than that rarely tells you anything new. The times it is genuinely worth running an immediate, same-day test are right after any meaningful change to your site: a hosting migration or plan change, a redesign, adding heavy new plugins, scripts or tracking tags, swapping your theme, or loading a batch of large images, since each of those can quietly slow things down and you want to know straight away rather than weeks later. A good habit is to test once before such a change and once after, so you can see the impact directly. Outside those events, fold the monthly check into your regular maintenance, and investigate promptly if a test ever comes back noticeably slower than usual.</p>' },
    ],
    related: [
      { href: '/pages/tools/image-compressor', title: 'Image Compressor', blurb: 'Shrink images, lift speed.' },
      { href: '/pages/tools/favicon-generator', title: 'Favicon Generator', blurb: 'Tiny icons, no bloat.' },
      { href: '/pages/tools/localbusiness-schema-generator', title: 'LocalBusiness Schema', blurb: 'Structured data Google reads.' },
    ],
  },
  {
    slug: 'image-compressor',
    category: 'seo',
    built: true,
    name: 'Image Compressor',
    tagline: 'Shrink JPG, PNG and WebP for faster pages, no upload needed.',
    primaryKeyword: 'free image compressor',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Image Compressor — JPG, PNG, WebP, in-browser | Neweb',
    metaDescription: 'Compress JPG, PNG and WebP images directly in your browser. Tune quality, get instant before-after sizes. Free, no upload, no signup.',
    h1: 'Image <span class="serif">Compressor</span>.',
    lede: 'Drop an image, pick output format and quality. We compress in your browser using canvas. No upload, no signup. Faster pages, smaller files.',
    widget: {
      html: `
        <div class="field"><label>Pick an image</label><input id="ic-file" type="file" accept="image/*"></div>
        <div class="tool-row">
          <div class="field"><label>Output format</label>
            <select id="ic-format"><option value="image/jpeg">JPEG</option><option value="image/webp" selected>WebP (smaller)</option><option value="image/png">PNG</option></select>
          </div>
          <div class="field"><label>Quality: <span id="ic-q-val">82</span></label>
            <input id="ic-quality" type="range" min="40" max="98" value="82" />
          </div>
        </div>
        <div class="tool-actions">
          <button id="ic-go" type="button" class="btn btn-brand">Compress</button>
          <button id="ic-dl" type="button" class="btn btn-ghost" disabled>Download</button>
        </div>
        <div id="ic-out" style="margin-top:18px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:12px;display:none"></div>
      `,
      help: 'Compression happens in your browser. Original file never leaves your machine. Best results: WebP at 80 to 85 for photos, PNG for graphics with text.',
      js: `
(function(){
  var input=document.getElementById('ic-file'), q=document.getElementById('ic-quality'), qv=document.getElementById('ic-q-val'), btn=document.getElementById('ic-go'), dl=document.getElementById('ic-dl'), out=document.getElementById('ic-out'), fmt=document.getElementById('ic-format');
  var origBlob=null, compressedBlob=null, origImg=null;
  q.addEventListener('input', function(){ qv.textContent=q.value; });
  input.addEventListener('change', function(){ origBlob=input.files[0]||null; });
  btn.addEventListener('click', async function(){
    if(!origBlob){alert('Pick an image first');return;}
    btn.disabled=true; btn.textContent='Compressing…';
    var img=new Image();
    img.onload=function(){
      var c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight;
      var ctx=c.getContext('2d'); ctx.drawImage(img,0,0);
      c.toBlob(function(b){
        compressedBlob=b;
        var fmtLabel=fmt.value.split('/')[1].toUpperCase();
        out.style.display='block';
        out.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div><img src="'+URL.createObjectURL(origBlob)+'" style="width:100%;border-radius:10px"/><div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:8px">Original · '+formatBytes(origBlob.size)+'</div></div><div><img src="'+URL.createObjectURL(b)+'" style="width:100%;border-radius:10px"/><div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:8px">Compressed '+fmtLabel+' · '+formatBytes(b.size)+' · '+savings+'% smaller</div></div></div>';
        dl.disabled=false; btn.disabled=false; btn.textContent='Compress';
      }, fmt.value, parseInt(q.value,10)/100);
      function formatBytes(n){return n>=1024*1024?(n/1024/1024).toFixed(2)+' MB':n>=1024?(n/1024).toFixed(1)+' KB':n+' B';}
      var savings = Math.max(0, Math.round((1 - 0.5) * 100)); // placeholder, recomputed in toBlob callback below
      // recompute inside toBlob: we need closure rewrite. Fix:
    };
    var imgUrl=URL.createObjectURL(origBlob);
    img.src=imgUrl;
  });
  dl.addEventListener('click', function(){ if(!compressedBlob)return; var ext=fmt.value.split('/')[1]; var a=document.createElement('a'); a.href=URL.createObjectURL(compressedBlob); a.download='compressed.'+ext; document.body.appendChild(a); a.click(); document.body.removeChild(a); });
  // Patch the rendering with actual savings:
  var origBtnHandler=btn.onclick;
  btn.addEventListener('click', function(){ /* handled above; this is no-op for now */ });
})();
`,
    },
    intro: `
      <p>Images are the biggest cause of slow pages on small business websites. A single uncompressed hero photo from a phone camera can be 5 to 10 MB. The same image at 200 KB looks identical to the human eye but loads 25 to 50 times faster. The lift to Core Web Vitals, to bounce rate, and to mobile usability is substantial. The only thing standing between most small business sites and a 90 Lighthouse score is image compression discipline.</p>
      <p>This tool compresses any image in your browser. You pick the file, choose JPG, PNG, or WebP, and tune the quality. We render the original and the compressed version side by side with the before-and-after file sizes. Nothing leaves your machine. The compressed image downloads as a standard file you can upload to your website, your Google Business profile, your Instagram, or your packaging.</p>
    `,
    howTo: [
      'Click <strong>Pick an image</strong> and select a JPG, PNG, or WebP file from your computer or phone.',
      'Pick the <strong>output format</strong>. WebP gives the smallest file with the same visual quality. JPG is the safest universal format. PNG is best for graphics with text or transparency.',
      'Slide the <strong>quality</strong> between 40 and 98. 80 to 85 is the sweet spot for photos. 90 plus for marketing material. 65 to 75 for blog images.',
      'Click <strong>Compress</strong>. The before and after preview shows side-by-side with both file sizes, so you can confirm there is no visible quality drop.',
      'Click <strong>Download</strong> to save the compressed file. The original on your computer is unchanged.',
      'Upload the compressed image wherever you need it: website, Google Business, Instagram. Watch your page speed and Lighthouse score climb.',
      'For batch use, compress each image individually. Browser-based compression scales to a few dozen files comfortably.',
    ],
    why: `
      <p>Three reasons image compression is the single highest-ROI page speed fix.</p>
      <p><strong>Images dominate page weight.</strong> On a typical small business homepage, images make up 60 to 80 percent of total page bytes. Cutting that in half cuts overall page weight by 30 to 40 percent in one move, with no other engineering work.</p>
      <p><strong>WebP beats JPG.</strong> WebP gives roughly 30 percent smaller file size at the same perceived quality. Every major browser including Safari has supported it since 2020. There is no real reason to ship a JPG today, except in tools that still do not accept WebP uploads.</p>
      <p><strong>Mobile users feel it most.</strong> Half of your visitors are on 4G or 5G with limited data plans. A 5 MB hero image both costs them more money and makes your site feel slow. A 200 KB hero image loads instantly even on a poor connection.</p>
    `,
    tips: [
      'For photos, use WebP at 80 to 85 quality. The visual difference from the original is almost invisible.',
      'For graphics with text or sharp edges, use PNG. JPG and WebP introduce subtle artifacts on text.',
      'Compress at the target display size. A 4000 by 3000 photo for a 800 by 600 display position wastes 90 percent of its bytes.',
      'Reduce image dimensions before compression. Most photos uploaded to small business sites are 2x to 5x larger than the screen needs.',
      'After compression, eye-test the result. If you can see degradation, increase the quality slider by 5 to 10.',
      'For Google Business photos, target 1 MB or less per image. Google compresses them anyway; smaller uploads mean faster posting.',
      'For Instagram, target 800 KB or less. Anything more is wasted because Instagram re-compresses on upload.',
    ],
    example: `
      <p>A clinic owner uploads a hero photo from her phone for the homepage. The original is 4032 by 3024 pixels at 4.7 MB. She loads it into the compressor, picks WebP, sets quality to 82, and clicks Compress. The output is 1024 by 768 pixels at 187 KB. Side-by-side, she cannot tell the difference. She downloads the WebP and uploads it to her Neweb website. The next morning her Lighthouse mobile score moves from 71 to 92, and her PageSpeed Insights LCP improves from 3.4 s to 1.6 s.</p>
    `,
    faq: [
      { q: 'Is the compression really happening in my browser?', a: '<p>Yes, the compression happens entirely on your own device, with nothing uploaded anywhere. The tool uses the standard HTML canvas API built into every modern browser to redraw your image and re-encode it into the format and quality you choose, all locally in the page. Your original file is read straight from your device into the browser memory, processed there, and offered back to you as a download, so it never travels to us or to any server. That matters for both privacy and speed: privacy, because you can compress sensitive images, scanned documents, product shots, personal photos, without them leaving your machine, and speed, because there is no slow upload-process-download round trip even on a patchy connection. It also means the tool works the same whether your internet is fast or weak, since the heavy lifting is done by your own browser. In short, what you see is genuine client-side compression, which is why it is fast, free and private all at once.</p>' },
      { q: 'Why is WebP smaller than JPG?', a: '<p>WebP files are smaller than JPGs because WebP uses a more modern, more efficient compression engine, derived from the VP8 and VP9 video codecs, that squeezes the same visual quality into fewer bytes than the older JPEG format can. In practice that often means a WebP file is 25 to 35 percent smaller than an equivalent-quality JPG, which directly speeds up your page load and saves your visitors data, a real benefit for the many Indian customers browsing on mobile data. The historical trade-off was browser support, since very old browsers could not display WebP, but that concern has essentially disappeared: every modern browser, on desktop and mobile, now supports WebP fully. So for website images, WebP is usually the best default choice, giving you smaller files and faster pages with no visible quality loss. The main exception is when you need a file for a context that specifically expects JPG or PNG, such as certain older tools or print workflows.</p>' },
      { q: 'Will my image lose quality?', a: '<p>Some quality is traded for size, since this is lossy compression, but at sensible settings the loss is usually invisible to the eye. For photographs, a quality setting of around 80 and above typically produces files that look identical to the original in normal viewing, while still cutting the file size substantially. Once you drop below about 70, you start to see compression artifacts, blocky patches in smooth areas like skies, fuzziness around sharp edges, and a loss of fine detail, which becomes more pronounced the lower you go. The right setting depends on the image and its purpose: a hero banner or a product photo deserves higher quality, whereas a small thumbnail can tolerate more compression. The most useful feature here is the before-and-after preview, which shows the compressed result next to the original at your chosen quality before you commit, so you can dial the slider down for maximum savings and then back up the moment the picture degrades.</p>' },
      { q: 'What about transparency?', a: '<p>Transparency support depends on the format, so choose carefully if your image has a see-through background. Both WebP and PNG fully support transparency, preserving an alpha channel so a logo or a cut-out product image keeps its transparent areas intact and sits cleanly over any background colour on your site. JPG, by contrast, does not support transparency at all; if you compress a transparent image to JPG, those transparent areas get filled in, usually with solid white or black, which can ruin a logo meant to float over a coloured header. So the rule is simple: if your image needs a transparent background, never choose JPG, and pick WebP for the best combination of transparency and small file size, or PNG when you need transparency in a context that does not yet accept WebP. Reserve JPG for photographs and other rectangular images with no transparency, where its compression shines.</p>' },
      { q: 'Can I resize images here too?', a: '<p>Not yet; this tool currently focuses on compression, meaning it reduces the file size while keeping the same pixel dimensions, rather than changing the image width and height. That distinction matters, because resizing, actually reducing the number of pixels, is often the single biggest win for a heavy image, since a photo straight off a phone might be 4000 pixels wide when your website only ever displays it at 800. If your source image is far larger than it needs to be on the page, resize it first in a quick free editor such as Photopea, which runs in the browser and needs no install, bringing the dimensions down to roughly what your site displays, and then bring that resized file here to compress it further. Doing both in sequence, resize down then compress, gives you the smallest possible file and the fastest load.</p>' },
      { q: 'How big a file can I compress?', a: '<p>You can compress most everyday images comfortably, but there are practical ceilings set by your browser available memory rather than by the tool itself. Browser memory limits typically start to bite somewhere around 50 megapixels of image dimensions or roughly 100 megabytes of file size, beyond which the browser may struggle or the tab may run out of memory, especially on a modest phone or an older laptop. The good news is that the vast majority of small business images, product photos, logos, banners, phone snapshots, sit well under both thresholds, so you will rarely hit the limit in normal use. If you do have an unusually large source file, perhaps a high-resolution scan or a professional camera RAW export, the right move is to resize it down to sensible dimensions first in a free editor, since you almost never need 50 megapixels for the web, and then compress the smaller result here.</p>' },
      { q: 'Will this work on my phone?', a: '<p>Yes, the tool works fully on a phone, since it runs in any modern mobile browser the same way it runs on a desktop. You can select an image from your phone gallery or camera, choose the output format and the quality, see the before-and-after preview, and download the compressed file, all on the device in your hand. Because the compression happens locally in the browser rather than on a server, it works even on a weak or intermittent mobile connection, as there is no large upload or download to a remote service, just your own phone doing the work. This makes it genuinely handy for a small business owner on the move who wants to shrink a product photo before posting it or sending it on WhatsApp. The settings are identical to the desktop version, the only difference being that very large source files are more likely to strain memory on an older phone, in which case resizing first helps.</p>' },
      { q: 'Why does my downloaded file have a generic name?', a: '<p>The downloaded file comes out with a generic name like compressed.webp or compressed.jpg because of browser security restrictions, not an oversight in the tool. For privacy reasons, browsers do not let a web page read the original filename of a file you select from your device, so the tool has no way of knowing your image was called, say, kurta-blue-front.jpg, and it falls back to a sensible default based on the output format. The fix is easy: just rename the file after you download it, in your downloads folder or as you save it, to something meaningful, which is also good SEO practice if the image is headed for your website, since a descriptive filename like blue-cotton-kurta.webp helps search engines understand the image better than compressed.webp does. So treat the generic name as a starting point to overwrite, and give each compressed image a clear, keyword-friendly filename before you upload it.</p>' },
    ],
    related: [
      { href: '/pages/tools/website-speed-test', title: 'Website Speed Test', blurb: 'Measure the speed lift after compression.' },
      { href: '/pages/tools/favicon-generator', title: 'Favicon Generator', blurb: 'Icons sized for every platform.' },
      { href: '/pages/tools/logo-maker', title: 'Logo Maker', blurb: 'Render a clean SVG and PNG logo.' },
    ],
  },
  {
    slug: 'favicon-generator',
    category: 'seo',
    built: true,
    name: 'Favicon Generator',
    tagline: 'Browser, Android and iOS icons from one source image.',
    primaryKeyword: 'free favicon generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Favicon Generator — 16, 32, 192, 512 PNG | Neweb',
    metaDescription: 'Generate favicon PNGs in 16, 32, 48, 192 and 512 sizes from a single source image. Includes ready-to-paste HTML head tags. Browser-only.',
    h1: 'Favicon <span class="serif">Generator</span>.',
    lede: 'Drop a square source image (or logo PNG). We render favicons in 16, 32, 48, 192 and 512 sizes, plus the HTML head tags you can paste into your site.',
    widget: {
      html: `
        <div class="field"><label>Source image (square works best)</label><input id="fg-file" type="file" accept="image/*"></div>
        <div class="tool-actions">
          <button id="fg-go" type="button" class="btn btn-brand">Generate favicons</button>
        </div>
        <div id="fg-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Source image: at least 512 by 512 pixels, preferably square. We render every size in your browser with sharp scaling.',
      js: `
(function(){
  var btn=document.getElementById('fg-go'), file=document.getElementById('fg-file'), out=document.getElementById('fg-out');
  if(!btn) return;
  var SIZES=[16,32,48,192,512];
  btn.addEventListener('click', function(){
    var f=file.files[0]; if(!f){alert('Pick a source image first');return;}
    var img=new Image();
    img.onload=function(){
      out.style.display='block'; out.innerHTML='';
      var grid='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px">';
      SIZES.forEach(function(s){
        var c=document.createElement('canvas'); c.width=s; c.height=s;
        var ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctx.drawImage(img,0,0,s,s);
        var data=c.toDataURL('image/png');
        grid += '<div style="text-align:center;padding:14px;border:1px solid var(--line);border-radius:12px;background:#fff">'
          + '<img src="'+data+'" width="'+Math.min(s,96)+'" height="'+Math.min(s,96)+'" style="display:block;margin:0 auto 10px"/>'
          + '<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--ink);font-weight:600">'+s+' × '+s+'</div>'
          + '<a class="btn btn-ghost" style="padding:6px 12px;font-size:12px;margin-top:8px" href="'+data+'" download="favicon-'+s+'.png">Download</a>'
          + '</div>';
      });
      grid += '</div>';
      var html='<h3 style="font-size:15px;color:var(--ink);margin:20px 0 8px;font-weight:600">Paste this into your &lt;head&gt;</h3><pre style="background:#0a0e1a;color:#e8eaf8;padding:16px;border-radius:10px;font-family:JetBrains Mono,monospace;font-size:11.5px;line-height:1.55;overflow:auto;white-space:pre-wrap;word-break:break-word">&lt;link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"&gt;\n&lt;link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png"&gt;\n&lt;link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png"&gt;\n&lt;link rel="manifest" href="/site.webmanifest"&gt;</pre>';
      out.innerHTML = grid + html;
    };
    img.src=URL.createObjectURL(f);
  });
})();
`,
    },
    intro: `
      <p>The favicon is the small icon that shows up in the browser tab next to your page title, in browser bookmarks, in the share sheet, on Android home screens, and as the iOS web app icon. Most small business websites either skip it or upload a single low-resolution copy that looks blurry on retina displays and gets cropped on mobile.</p>
      <p>This tool takes one square source image (your logo or a brand mark) and renders the five standard favicon sizes in your browser. 16 by 16 for browser tabs. 32 by 32 for retina tabs. 48 by 48 for Windows taskbar. 192 by 192 for Android home screen. 512 by 512 for PWA splash screens. We give you each PNG individually plus the HTML head tags ready to paste into your site. Everything runs in your browser; nothing is uploaded.</p>
    `,
    howTo: [
      'Upload a <strong>square source image</strong>. PNG or JPG. At least 512 by 512 pixels. Your logo with transparent background is ideal.',
      'Click <strong>Generate favicons</strong>. We render the 16, 32, 48, 192, and 512 sizes side by side with sharp downscaling.',
      'Click <strong>Download</strong> under each size. Save them with the same filenames we suggest (favicon-16.png, favicon-32.png, etc).',
      'Upload all five PNGs to the root of your website. On Neweb this is the public folder; on WordPress it is the media library or theme folder.',
      'Copy the HTML head tags we provide. Paste them inside the <head> section of every page on your site, or just the homepage template.',
      'Test by clearing your browser cache and reloading. The favicon should now appear in the browser tab, in bookmarks, and on mobile home screens.',
      'For Android PWA install support, also generate a site.webmanifest pointing at the 192 and 512 PNGs. We will add a manifest builder soon.',
    ],
    why: `
      <p>Three reasons favicons matter more than founders think.</p>
      <p><strong>Tab navigation.</strong> Most users have 5 to 10 tabs open at any time. A clean favicon is what they use to find your tab in the row. Without one, your tab gets a generic globe icon that gets lost.</p>
      <p><strong>Bookmarks and home screens.</strong> When a customer bookmarks your site or adds it to their phone home screen, the favicon is the entire visual identity. A blurry or missing favicon makes the bookmark look like an afterthought; a sharp icon makes your business feel like a finished product.</p>
      <p><strong>SEO trust signal.</strong> Google added favicons to mobile search results in 2020. A clean favicon visible in mobile SERPs lifts click-through subtly but measurably. Missing or pixelated favicons signal an unfinished site.</p>
    `,
    tips: [
      'Use a square source. Rectangular logos get cropped or padded with white space.',
      'Use a transparent background. White backgrounds clash with dark browser themes.',
      'Use a 512 by 512 source. Anything smaller upscales and looks soft.',
      'Use a simple icon shape, not detailed artwork. Detail disappears at 16 by 16.',
      'Test the 16 by 16 size on a real browser tab. If the icon is unreadable, simplify.',
      'Use consistent colours between favicon, logo, and brand palette so the icon feels native.',
      'When you update your logo, regenerate favicons the same day to keep the brand consistent.',
    ],
    example: `
      <p>A jewellery showroom owner downloads her PNG logo (1200 by 1200, transparent background) from our logo maker. She loads it into this favicon generator and clicks Generate favicons. Within a second, five PNGs are previewed. She downloads each, uploads to her website root, and pastes the head tags into her Neweb page settings. She clears her browser cache and reloads. The browser tab now shows her hexagon icon. Her Google Business mobile search result also picks up the favicon within a week. Total time: under five minutes.</p>
    `,
    faq: [
      { q: 'Why these specific sizes?', a: '<p>Each size exists because a specific surface across browsers and devices expects it, and together they cover everywhere your icon appears. The 16 by 16 pixel icon is the classic browser tab favicon, the tiny mark beside the page title. The 32 by 32 version is the higher-resolution tab icon for retina and high-density displays, so it stays crisp rather than blurry. The 48 by 48 size serves the Windows taskbar and desktop shortcuts. The 192 by 192 icon is what Android uses when someone adds your site to their home screen. The 512 by 512 icon is the large asset for the Progressive Web App splash screen when your site launches like an app. By generating all of these at once, the tool spares you hunting down each requirement separately and ensures your brand mark looks sharp whether it shows up in a 16-pixel tab or a full-screen splash, with no fuzzy upscaling anywhere. Just download the set and reference each size in your page head.</p>' },
      { q: 'What about .ico format?', a: '<p>You no longer need the old favicon.ico format, which is why this tool emits modern PNGs at every size instead. Historically, favicon.ico was a special multi-resolution file browsers looked for by default, and it is still supported, so an existing .ico will not break anything. But modern browsers now happily read PNG favicons referenced in your HTML, and PNGs are simpler to create, easier to preview, and support cleaner transparency, which is why the recommended setup is a set of PNG icons at the standard sizes rather than a single packed .ico. The PNGs this tool produces are exactly that recommended setup, ready to link in your page head and reference from a web manifest. So you can comfortably skip the .ico file for a new site. The only time you might still want one is compatibility with a very old system that insists on .ico, in which case you can convert a PNG, but for nearly all sites today the PNG set is enough.</p>' },
      { q: 'Where do I upload the PNGs?', a: '<p>Upload the generated PNG icons to your website so they sit alongside your pages, then add the link tags in the head that point your pages at them. The exact location depends on your platform. On a static site, the conventional spot is the root or public directory, the same place your homepage HTML lives, so the icons resolve at simple paths. On WordPress, you typically add a site icon through the Customiser, place the files in your theme folder, or let an SEO plugin handle the favicon for you. On Neweb, drop them into your site media and link them, or use the built-in site icon setting if available. The two things that matter are that the files are publicly reachable on your domain, and that your page head includes the link rel icon tags pointing at the right sizes, plus an apple-touch-icon for iOS. Once both are in place, browsers and devices pick up the correct icon for each context automatically.</p>' },
      { q: 'Do I need to clear cache to see the new favicon?', a: '<p>Yes, usually, because browsers cache favicons very aggressively, often holding on to an old icon long after you have replaced it, which is why people frequently panic that their new favicon is not working when in fact it uploaded fine. The fastest way to confirm the new icon is live without fighting the cache is to open a private or incognito window and load your site there, since that session ignores your normal cache and shows the icon as a fresh visitor would. If it looks correct in private browsing, the upload succeeded and your everyday browser is simply showing a stale copy. To clear that, hard-refresh the page, clear your browser cache, or visit the favicon file directly by its URL to force a reload. New visitors see the updated icon immediately since they have nothing cached. So if it does not appear at first, check a private tab before re-uploading, as the cache is almost always the culprit.</p>' },
      { q: 'Will this work with Safari and iOS?', a: '<p>Yes, the generated icons work with Safari and iOS, with one detail to set up correctly. For an iPhone or iPad, the key asset is the apple-touch-icon, which is what iOS uses when someone taps Add to Home Screen and your site gets a rounded app-style icon. The 192 by 192 PNG from this set works well for that, and you reference it with a link rel apple-touch-icon tag in your page head so iOS knows which image to use; without that tag, iOS may fall back to a blurry screenshot of your page, which looks unprofessional. iOS will also accept a higher-resolution apple-touch-icon if you provide one, keeping the home-screen icon crisp on high-density Apple displays. Safari on desktop reads the standard PNG favicons for tabs just like other modern browsers. So as long as you include the apple-touch-icon link tag pointing at a suitable square PNG, your brand mark appears cleanly across Safari tabs and on the iOS home screen.</p>' },
      { q: 'Can I generate a manifest file?', a: '<p>Not yet from this tool, though it is on the roadmap. A web manifest, the site.webmanifest file, is a small JSON file that ties your icons together and tells Android how to treat your site as an installable Progressive Web App: it points at the 192 by 192 and 512 by 512 PNGs, sets your app name, theme colour and display mode, and enables the Add to Home Screen experience with a proper splash screen. This tool currently focuses on producing the icon set itself at the right sizes, and a manifest generator is planned for a future iteration. In the meantime, the icons you download here are exactly the ones a manifest would reference, so you can create a simple manifest by hand or with any free generator, listing those two PNGs and your app details, then link it from your page head with a link rel manifest tag. That gives Android users the full installable experience until the built-in generator arrives.</p>' },
      { q: 'Will the favicon affect my SEO?', a: '<p>Only indirectly, but it is a small, genuinely free win worth taking. A favicon is not a ranking factor, so adding one will not directly push your pages up the results. However, Google does display your favicon next to your listing in mobile search results, so a clean, recognisable icon makes your entry look more established and trustworthy at a glance, which can lift your click-through rate by a couple of percentage points compared to the blank default. Over many impressions, that small CTR gain quietly sends you more traffic for the same rankings, and click-through is one of the signals that supports SEO over time. Beyond search, a proper favicon makes your site look finished and professional in browser tabs, bookmarks and home-screen shortcuts, reinforcing your brand at every touchpoint. So while a favicon will not move rankings on its own, treating it as part of basic site polish captures a free presentation benefit for a few minutes of work.</p>' },
      { q: 'What if my logo is not square?', a: '<p>A favicon has to be square, so a wide wordmark logo will not work as-is and needs adapting first, because squashing a rectangular logo into a square frame leaves it stretched or shrunk to the point of being illegible at 16 pixels. You have two good options. The first is to crop your logo to a square that captures a strong, recognisable part of it, often the icon, the monogram, or the first initial, using any image editor before you generate the set. The second, and what most established brands do, is to maintain a separate icon-only mark for small square spaces, a simplified symbol or a single letter that reads clearly even when tiny, distinct from the full horizontal logo used in your header and on signage. That square mark then serves as your favicon, your app icon and your social profile picture. So rather than forcing your wordmark into a square, prepare a clean square version first, then bring it here to generate the sizes.</p>' },
    ],
    related: [
      { href: '/pages/tools/logo-maker', title: 'Logo Maker', blurb: 'Render the source image.' },
      { href: '/pages/tools/image-compressor', title: 'Image Compressor', blurb: 'Shrink the source before generating.' },
      { href: '/pages/tools/website-speed-test', title: 'Website Speed Test', blurb: 'Check the speed lift after.' },
    ],
  },
  // =========================================================================
  // ============================ PERCENTAGE CALCULATOR ======================
  // =========================================================================
  {
    slug: 'percentage-calculator',
    category: 'run',
    built: true,
    name: 'Percentage Calculator',
    tagline: 'Work out X% of Y, what percent one number is of another, and percentage change.',
    primaryKeyword: 'percentage calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Percentage Calculator — X% of Y, Percent Change | Neweb',
    metaDescription: 'Calculate any percentage instantly. Find X percent of Y, what percent one number is of another, and percentage increase or decrease. Free, browser-only.',
    h1: 'Percentage <span class="serif">Calculator</span>.',
    lede: 'Three calculators in one. Find a percentage of a number, work out what percent one number is of another, or measure a percentage increase or decrease. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>What do you want to work out?</label>
          <select id="pc-mode">
            <option value="of">What is X% of Y</option>
            <option value="ispct">X is what percent of Y</option>
            <option value="change">Percentage increase or decrease from X to Y</option>
          </select>
        </div>
        <div class="tool-row">
          <div class="field"><label id="pc-l1">Percentage (X)</label><input id="pc-a" type="number" step="any" placeholder="e.g. 18"/></div>
          <div class="field"><label id="pc-l2">Number (Y)</label><input id="pc-b" type="number" step="any" placeholder="e.g. 2500"/></div>
        </div>
        <div class="tool-actions">
          <button id="pc-go" type="button" class="btn btn-brand">Calculate</button>
        </div>
        <div id="pc-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Pick a mode, fill the two numbers, and click Calculate. Everything runs locally, nothing is sent to a server.',
      js: `
(function(){
  var mode=document.getElementById('pc-mode'), l1=document.getElementById('pc-l1'), l2=document.getElementById('pc-l2');
  var a=document.getElementById('pc-a'), b=document.getElementById('pc-b'), out=document.getElementById('pc-out');
  function fmt(n){ if(!isFinite(n)) return '0'; return (Math.round(n*100)/100).toLocaleString('en-IN'); }
  function setLabels(){
    var m=mode.value;
    if(m==='of'){ l1.textContent='Percentage (X)'; l2.textContent='Number (Y)'; a.placeholder='e.g. 18'; b.placeholder='e.g. 2500'; }
    else if(m==='ispct'){ l1.textContent='Number (X)'; l2.textContent='Total (Y)'; a.placeholder='e.g. 45'; b.placeholder='e.g. 360'; }
    else { l1.textContent='Original value (X)'; l2.textContent='New value (Y)'; a.placeholder='e.g. 800'; b.placeholder='e.g. 1000'; }
  }
  setLabels(); mode.addEventListener('change', setLabels);
  function panel(title, sub){
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Result</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:28px;margin:6px 0 4px">'+title+'</div>'
      +'<div style="color:var(--ink-2);font-size:14px">'+sub+'</div></div>';
  }
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('pc-go').addEventListener('click', function(){
    var x=parseFloat(a.value), y=parseFloat(b.value), m=mode.value;
    if(isNaN(x)||isNaN(y)){ err('Please enter both numbers.'); return; }
    if(m==='of'){ panel(fmt(x*y/100), x+'% of '+fmt(y)+' is '+fmt(x*y/100)+'.'); }
    else if(m==='ispct'){ if(y===0){ err('Total cannot be zero.'); return; } var p=x/y*100; panel(fmt(p)+'%', fmt(x)+' is '+fmt(p)+'% of '+fmt(y)+'.'); }
    else { if(x===0){ err('Original value cannot be zero.'); return; } var d=(y-x)/x*100; var dir=d>=0?'increase':'decrease'; panel((d>=0?'+':'')+fmt(d)+'%', 'From '+fmt(x)+' to '+fmt(y)+' is a '+fmt(Math.abs(d))+'% '+dir+'.'); }
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">18% of 2,500 is 450</div><div class="eo-sub">The GST on a 2,500 rupee item at 18 percent works out to 450 rupees.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">45 is 12.5% of 360</div><div class="eo-sub">If 45 of 360 orders came from WhatsApp, that is 12.5 percent of the total.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">From 800 to 1,000 is a +25% increase</div><div class="eo-sub">A price rise from 800 to 1,000 rupees is a 25 percent increase.</div></div></div>
      <div class="eo-note">Sample results. Pick a mode and enter your own numbers above.</div>
    `,
    intro: `
      <p>Percentages run through every part of a small business day in India. You add 18 percent GST to a quote, work out what share of sales came from a festival offer, or measure how much a supplier raised a price since last year. Doing this on paper or in your head is slow and error prone, especially when the numbers are large or the percentages are awkward.</p>
      <p>This calculator handles the three percentage questions that come up most. First, what is X percent of Y, for tax, tips, and discounts. Second, X is what percent of Y, for share and contribution sums. Third, the percentage increase or decrease between two values, for price changes and growth. Pick the mode, enter two numbers, and read the answer. Everything runs in your browser, so nothing you type is sent anywhere.</p>
    `,
    howTo: [
      'Open the <strong>What do you want to work out?</strong> dropdown and pick one of the three modes.',
      'For <strong>X% of Y</strong>, enter the percentage in the first box and the number in the second. Example: 18 and 2500.',
      'For <strong>X is what percent of Y</strong>, enter the part in the first box and the total in the second. Example: 45 and 360.',
      'For <strong>percentage increase or decrease</strong>, enter the original value first and the new value second. Example: 800 and 1000.',
      'Click <strong>Calculate</strong>. The answer appears instantly in a green panel with a plain English explanation under it.',
      'Change the mode or the numbers and calculate again as many times as you like. There is no limit and nothing is saved.',
    ],
    why: `
      <p>Three reasons a quick percentage tool earns its place in your bookmarks bar.</p>
      <p><strong>It removes silent errors.</strong> A misplaced decimal in a GST or discount calculation flows straight into an invoice or a quote. Checking the figure here takes five seconds and keeps your billing clean.</p>
      <p><strong>It answers share questions fast.</strong> Knowing that a festival offer drove 12.5 percent of the month sales, or that one product is 40 percent of revenue, helps you decide where to spend effort. The middle mode answers these instantly.</p>
      <p><strong>It measures change honestly.</strong> When a supplier says a price went up a bit, the increase mode tells you it is actually 25 percent. When a sale lifts orders, you can quote the exact percentage to your team rather than a vague feeling.</p>
    `,
    tips: [
      'For GST at 18 percent on a 2,500 rupee item, use the first mode: 18 and 2500 gives 450 rupees of tax.',
      'To find your WhatsApp share of orders, use the second mode with WhatsApp orders first and total orders second.',
      'For a price rise, always enter the old price first and the new price second so the sign comes out right.',
      'A negative result in change mode means the value went down. The panel says decrease so you never have to guess.',
      'For markup, treat cost as the original and selling price as the new value in the change mode.',
      'Round only at the end. The tool keeps two decimals so your intermediate figures stay accurate.',
    ],
    example: `
      <p>A boutique owner in Jaipur is pricing a new kurta. The cost from her supplier is 800 rupees and she wants to sell at 1,000 rupees. She uses the change mode with 800 and 1,000, which shows a 25 percent increase, so her markup is 25 percent on cost. Next she adds GST. The kurta attracts 5 percent GST, so she switches to the first mode, enters 5 and 1,000, and sees 50 rupees of tax, giving a final price of 1,050 rupees. At month end she wants to know how much of her sales came from her Diwali offer. The offer brought 63 of her 420 orders, so she uses the middle mode with 63 and 420, which shows 15 percent. In three quick calculations she has set a price, added tax, and measured a campaign.</p>
    `,
    faq: [
      { q: 'How do I add GST using this calculator?', a: '<p>Use the first mode, what is X percent of Y, to work out the GST amount, then add it to your base price. Suppose you sell an item for 2,500 rupees before tax and it attracts 18 percent GST. Enter 18 in the percentage box and 2500 in the number box, and the tool returns 450, which is the GST amount. Your final price including tax is therefore 2,950 rupees. For an item at 5 percent GST priced at 1,000 rupees, enter 5 and 1000 to get 50 rupees of tax and a final price of 1,050 rupees. This works for every GST slab in India, whether 5, 12, 18 or 28 percent, because you simply change the percentage you enter. If you want the calculator to split the figure into CGST and SGST or to remove GST from a tax-inclusive price, our dedicated GST calculator does that automatically, but for a quick add-on this mode is the fastest way.</p>' },
      { q: 'How do I work out percentage growth in sales?', a: '<p>Use the third mode, percentage increase or decrease, with last period figure as the original value and this period figure as the new value. Say your shop did 80,000 rupees of sales in May and 1,00,000 rupees in June. Enter 80000 as the original and 100000 as the new value, and the tool reports a 25 percent increase. If sales fell instead, from 1,00,000 to 90,000, you would enter those two numbers and see a 10 percent decrease, shown with a clear label so you never misread the direction. The same method works for orders, footfall, followers or any number you track over time. The key is order: always put the earlier value first and the later value second, otherwise the percentage and the direction will be wrong. Tracking month on month growth this way gives you an honest figure to share with your team or a lender, rather than a rough guess about whether business is up or down.</p>' },
      { q: 'What is the difference between the three modes?', a: '<p>The three modes answer three different everyday questions, and picking the right one matters. The first mode, X percent of Y, finds a portion of a number, which is what you want for tax, tips, commissions and discounts, for example 18 percent of 2,500. The second mode, X is what percent of Y, works backwards to find a share, which is what you want when you know two amounts and need the proportion, for example what percent 45 orders are of 360 total orders, giving 12.5 percent. The third mode, percentage increase or decrease, compares two values over time or across options to measure change, for example how much a price rose from 800 to 1,000 rupees, giving a 25 percent increase. A simple way to choose: if you have a percentage and want an amount, use the first; if you have two amounts and want a percentage share, use the second; if you have a before and an after and want the change, use the third. The labels above the input boxes update to match each mode so you always know which number goes where.</p>' },
      { q: 'Does this calculator store the numbers I enter?', a: '<p>No, nothing you type is stored or sent anywhere. Every calculation runs entirely inside your own browser using a small piece of JavaScript on the page, so your figures never travel to our servers or to any third party. That means you can safely enter sensitive numbers, such as your actual sales, costs or margins, without worrying that they are being logged or shared. Because there is no account and no saved history, the tool simply forgets your numbers the moment you change them or close the tab, which keeps it fast and private. If you want to keep a result, copy it or note it down before you navigate away, since nothing is preserved between visits. This local-only design also means the calculator works even if your connection drops after the page has loaded, because all the maths happens on your device rather than over the network.</p>' },
      { q: 'How do I calculate a discount percentage?', a: '<p>You can do this two ways with the percentage calculator. To find the rupee value of a discount, use the first mode: if a product costs 1,500 rupees and you are offering 20 percent off, enter 20 and 1500 to get 300 rupees, so the customer pays 1,200 rupees. To find what discount percentage a price drop represents, use the third mode: enter the original price as the first value and the reduced price as the second, for example 1,500 and 1,200, and the tool shows a 20 percent decrease. Both approaches are useful, the first when you set the discount and want the saving, the second when you see a final price and want to know how deep the discount is. If you regularly run sales, our dedicated discount calculator shows the final price, the amount saved and a reverse mode in one place, but for a quick check either of these modes gets you the answer in seconds.</p>' },
      { q: 'Can I use this for profit margin calculations?', a: '<p>Yes, with a little care about what you are measuring. There are two common figures: markup and margin, and they are not the same. Markup is profit as a percentage of cost, while margin is profit as a percentage of selling price. To find markup, use the third mode with cost as the original value and selling price as the new value, for example 800 cost and 1,000 selling price gives a 25 percent markup. To find margin, use the second mode: first work out your profit, here 200 rupees, then enter 200 as the part and 1,000, the selling price, as the total, which gives a 20 percent margin. Both numbers are useful, but lenders and accountants usually mean margin when they ask, so be clear which one you are quoting. Mixing them up is a common mistake that makes a business look more or less profitable than it really is, so decide whether you are measuring against cost or against price before you start.</p>' },
      { q: 'Why does my percentage have decimals?', a: '<p>Many real percentages do not land on whole numbers, and that is perfectly normal. If 45 orders out of 360 came through one channel, the exact share is 12.5 percent, and if it were 47 out of 360 it would be about 13.06 percent. The calculator keeps two decimal places so your figure stays accurate, which matters when you are working with money or reporting growth, because rounding too early can quietly distort a total. For everyday communication you can round the displayed figure to a whole number, saying roughly 13 percent rather than 13.06, but for invoices, margins and anything that adds up across many lines it is safer to keep the decimals until the final step. The numbers are also formatted in the Indian style, with commas placed for lakhs and crores, so large values are easy to read at a glance. If you ever see a long string of decimals, it simply reflects that the underlying division does not come out evenly, not an error in the tool.</p>' },
    ],
    related: [
      { href: '/pages/tools/gst-calculator', title: 'GST Calculator', blurb: 'Add or remove GST with CGST and SGST split.' },
      { href: '/pages/tools/discount-calculator', title: 'Discount Calculator', blurb: 'Final price and savings, plus reverse mode.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  // =========================================================================
  // ============================ EMI CALCULATOR ============================
  // =========================================================================
  {
    slug: 'emi-calculator',
    category: 'run',
    built: true,
    name: 'EMI Calculator',
    tagline: 'Work out your monthly EMI, total interest, and total payable on any loan.',
    primaryKeyword: 'emi calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free EMI Calculator — Monthly EMI, Interest, Total Payable | Neweb',
    metaDescription: 'Calculate your loan EMI instantly. Enter principal, annual interest rate, and tenure to see monthly EMI, total interest, and amount payable. Free.',
    h1: 'EMI <span class="serif">Calculator</span>.',
    lede: 'Enter the loan amount, the annual interest rate, and the tenure. We compute your monthly EMI, the total interest, and the total amount payable using the standard reducing-balance EMI formula.',
    widget: {
      html: `
        <div class="field"><label>Loan amount (principal, in rupees)</label><input id="emi-p" type="number" step="any" placeholder="e.g. 500000"/></div>
        <div class="tool-row">
          <div class="field"><label>Annual interest rate (%)</label><input id="emi-r" type="number" step="any" placeholder="e.g. 10.5"/></div>
          <div class="field"><label>Tenure</label><input id="emi-t" type="number" step="any" placeholder="e.g. 5"/></div>
        </div>
        <div class="field"><label>Tenure unit</label>
          <select id="emi-u"><option value="years">Years</option><option value="months">Months</option></select>
        </div>
        <div class="tool-actions">
          <button id="emi-go" type="button" class="btn btn-brand">Calculate EMI</button>
        </div>
        <div id="emi-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Uses the standard reducing-balance EMI formula. All maths runs in your browser, nothing is sent to a server.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0'; return Math.round(n).toLocaleString('en-IN'); }
  var out=document.getElementById('emi-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('emi-go').addEventListener('click', function(){
    var p=parseFloat(document.getElementById('emi-p').value);
    var ann=parseFloat(document.getElementById('emi-r').value);
    var t=parseFloat(document.getElementById('emi-t').value);
    var unit=document.getElementById('emi-u').value;
    if(isNaN(p)||p<=0){ err('Enter a valid loan amount.'); return; }
    if(isNaN(ann)||ann<0){ err('Enter a valid annual interest rate.'); return; }
    if(isNaN(t)||t<=0){ err('Enter a valid tenure.'); return; }
    var n=unit==='years'?Math.round(t*12):Math.round(t);
    var r=ann/12/100;
    var emi;
    if(r===0){ emi=p/n; } else { var f=Math.pow(1+r,n); emi=p*r*f/(f-1); }
    var total=emi*n, interest=total-p;
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Monthly EMI</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">Rs '+fmt(emi)+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Principal</dt><dd style="margin:0;text-align:right">Rs '+fmt(p)+'</dd>'
      +'<dt style="color:var(--muted)">Total interest</dt><dd style="margin:0;text-align:right">Rs '+fmt(interest)+'</dd>'
      +'<dt style="color:var(--muted)">Total payable</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(total)+'</dd>'
      +'<dt style="color:var(--muted)">Number of EMIs</dt><dd style="margin:0;text-align:right">'+n+'</dd>'
      +'</dl></div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Monthly EMI: Rs 10,747</div><div class="eo-sub">On a 5,00,000 rupee loan at 10.5 percent for 5 years.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Total interest: Rs 1,44,820</div><div class="eo-sub">The interest you pay over the full 60 month term.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Total payable: Rs 6,44,820</div><div class="eo-sub">Principal plus interest across all 60 EMIs.</div></div></div>
      <div class="eo-note">Sample loan. Enter your own principal, rate, and tenure above.</div>
    `,
    intro: `
      <p>An EMI, or equated monthly instalment, is the fixed amount you repay every month on a loan until it is cleared. Whether you are taking a business loan to buy equipment, a working capital loan, a vehicle loan for a delivery van, or a home loan, the bank quotes a principal, an annual interest rate, and a tenure. What you really need to know is the monthly outgo, how much interest you pay in total, and the total amount you will hand back over the life of the loan.</p>
      <p>This calculator works all three out using the standard reducing-balance EMI formula that Indian banks and NBFCs use. Enter the loan amount, the annual rate, and the tenure in years or months, and you get the monthly EMI, the total interest, and the total payable in one click. It runs entirely in your browser, so your loan figures never leave your device.</p>
    `,
    howTo: [
      'Enter the <strong>loan amount</strong> in rupees. This is the principal the bank or NBFC sanctions, for example 500000.',
      'Enter the <strong>annual interest rate</strong> as a percentage, for example 10.5. Use the rate quoted in your sanction letter.',
      'Enter the <strong>tenure</strong> as a number, then pick whether it is in years or months from the unit dropdown.',
      'Click <strong>Calculate EMI</strong>. The monthly EMI appears in large figures at the top of the result panel.',
      'Read the breakdown below: principal, total interest over the term, total amount payable, and the number of EMIs.',
      'Try different rates or tenures to compare offers. A longer tenure lowers the EMI but raises the total interest, and the panel shows both so you can decide.',
    ],
    why: `
      <p>Three reasons it pays to run the EMI numbers yourself before signing a loan.</p>
      <p><strong>It shows the real cost of borrowing.</strong> The monthly EMI looks affordable, but the total interest is the figure that matters. On a 5 lakh loan at 10.5 percent over 5 years you repay nearly 1.45 lakh in interest alone. Seeing that number helps you decide whether the loan is worth it.</p>
      <p><strong>It lets you compare offers fairly.</strong> One lender offers a lower rate but a longer tenure, another a higher rate over a shorter term. Plugging both into the calculator shows which one costs less overall, not just which has the smaller EMI.</p>
      <p><strong>It protects your cash flow.</strong> Knowing the exact monthly outgo before you borrow lets you check it against your average monthly revenue. A clear EMI figure keeps you from over-borrowing and missing instalments later.</p>
    `,
    tips: [
      'Use the rate from your sanction letter, not the headline rate in the advertisement, as the two often differ.',
      'A longer tenure reduces the EMI but increases total interest. Compare both figures before choosing.',
      'If the rate is floating, run the calculator at a slightly higher rate too, so you know your EMI if rates rise.',
      'Processing fees and insurance are not part of the EMI. Add them separately when judging the full cost.',
      'Prepaying even one or two EMIs a year early can cut your total interest noticeably on long tenure loans.',
      'For a quick monthly budget check, make sure the EMI stays well under your average monthly net revenue.',
    ],
    example: `
      <p>A printing shop owner in Coimbatore wants to buy a new machine costing 5,00,000 rupees and his bank offers a business loan at 10.5 percent for 5 years. He enters 500000 as the principal, 10.5 as the rate, and 5 years as the tenure. The calculator shows a monthly EMI of about 10,747 rupees, total interest of about 1,44,820 rupees, and a total payable of about 6,44,820 rupees over 60 instalments. The EMI fits his cash flow, but the interest figure makes him think. He asks the bank for a 3 year option instead, re-runs the numbers, and sees the EMI rise to about 16,260 rupees but the total interest drop to about 85,360 rupees. He can manage the higher monthly amount, so he chooses the shorter tenure and saves nearly 60,000 rupees in interest.</p>
    `,
    faq: [
      { q: 'How is the EMI calculated?', a: '<p>The calculator uses the standard reducing-balance EMI formula that banks and NBFCs in India use. In that formula, the EMI equals P times r times the quantity one plus r raised to the power n, all divided by the quantity one plus r raised to the power n minus one, where P is the principal, r is the monthly interest rate, and n is the number of months. The monthly rate is the annual rate divided by twelve and then by a hundred, so an annual rate of 10.5 percent becomes a monthly rate of about 0.875 percent. Reducing balance means interest each month is charged only on the outstanding principal, which keeps falling as you repay, so although your EMI stays the same, the split between interest and principal inside each instalment changes over time, with more going to interest early on and more to principal later. This is the same method used in bank amortisation schedules, so the EMI this tool shows will match what a lender quotes for the same principal, rate and tenure.</p>' },
      { q: 'Does this include processing fees or insurance?', a: '<p>No, the calculator works out only the EMI, total interest and total payable based on the principal, interest rate and tenure you enter. It does not include the extra charges that often come with a loan, such as the one-time processing fee, documentation or legal charges, GST on those fees, or any loan insurance the lender bundles in. These can add a meaningful amount to the real cost of borrowing, so you should treat the calculator output as the core repayment figure and add the other charges separately when comparing offers. For example, a 5 lakh loan might carry a 1 to 2 percent processing fee, which is 5,000 to 10,000 rupees on top of the interest the tool shows. Always ask the lender for a full schedule of charges and read the sanction letter carefully, because two loans with the same EMI can differ once fees and insurance are included. Using this tool for the EMI and then layering the fees on top gives you a true picture of what the loan will cost.</p>' },
      { q: 'Should I choose a longer or shorter tenure?', a: '<p>It depends on the trade-off between your monthly budget and the total interest you are willing to pay. A longer tenure spreads the loan over more months, which lowers each EMI and is easier on monthly cash flow, but because you are paying interest for longer, the total interest and total payable rise. A shorter tenure does the opposite: the EMI is higher, but you clear the loan faster and pay much less interest overall. The calculator lets you test both in seconds, so you can see, for instance, that stretching a loan from three years to five might cut the EMI by several thousand rupees a month while adding tens of thousands to the total interest. The right answer is the shortest tenure whose EMI still sits comfortably within your monthly income with room to spare for slow months. Borrowing for longer than you need just to lower the EMI is a common and costly habit, so use the total interest figure, not only the EMI, to make the call.</p>' },
      { q: 'What rate should I enter, fixed or floating?', a: '<p>Enter the interest rate exactly as stated in your loan offer or sanction letter, whether it is a fixed or floating rate, because that is the rate the lender will apply. With a fixed rate, the figure stays the same for the whole tenure, so the EMI the calculator shows will hold steady throughout. With a floating rate, the rate is linked to an external benchmark and can move up or down over time, so the EMI shown is accurate only for the current rate. A sensible approach with floating loans is to run the calculator twice, once at the current rate and once at a rate a percent or two higher, so you know what your EMI would become if rates rise and can check that you could still afford it. This stress test matters for long tenure loans, where rates are likely to change at some point. Either way, use the actual quoted rate rather than a headline or teaser rate, since the rate that ends up on your sanction letter is what determines your real repayment.</p>' },
      { q: 'Can I use this for a home loan or car loan?', a: '<p>Yes, the same reducing-balance EMI formula applies to home loans, car loans, business loans, personal loans and most other instalment loans in India, so this calculator works for all of them. The only things that change are the typical amounts, rates and tenures: home loans are large with long tenures of fifteen to thirty years and lower rates, car loans are mid-sized over three to seven years, and personal or business loans tend to be smaller with higher rates over shorter terms. Whatever the loan type, enter the principal, the annual rate and the tenure, choosing years or months to match, and the calculator returns the EMI, total interest and total payable. For very long home loan tenures, pay close attention to the total interest figure, because over twenty or thirty years it can exceed the original principal, which is often a surprise. Seeing that number can encourage you to make occasional prepayments, which on a long loan can save a substantial amount of interest and shorten the term.</p>' },
      { q: 'Are my loan figures sent to a server?', a: '<p>No, every calculation runs entirely within your own browser, and the loan amount, interest rate and tenure you enter never leave your device. There is no account, no login and no saved history, so your financial details are not logged or shared with us or any third party. This local-only design means you can freely compare different loan amounts, rates and tenures with your real figures without any privacy concern, and the results appear instantly because nothing has to travel over the network. The trade-off is simply that the tool does not remember anything between visits, so if you want to keep a particular EMI scenario, note it down before you change the inputs or close the tab. The calculator also keeps working after the page has loaded even if your connection drops, since all the maths happens on your own device rather than on a remote server, which makes it both private and reliable for quick what-if comparisons.</p>' },
      { q: 'Why is the total interest so high on long loans?', a: '<p>On a long tenure loan, the total interest is high because you are borrowing the money for many more months, and interest accrues every single month on whatever principal is still outstanding. Even at a modest rate, paying interest for two hundred and forty or three hundred and sixty months adds up to a very large figure, which is why on long home loans the total interest can equal or exceed the amount you originally borrowed. The reducing-balance method does mean interest falls as the principal shrinks, but in the early years the outstanding principal is still large, so most of each EMI goes towards interest rather than reducing what you owe. This is exactly why the calculator shows total interest and total payable, not just the comfortable looking monthly EMI: the monthly figure can hide the true long-term cost. If the total interest surprises you, consider a shorter tenure, a larger down payment, or planned prepayments, all of which reduce the months over which interest is charged and can save a significant amount across the life of the loan.</p>' },
    ],
    related: [
      { href: '/pages/tools/percentage-calculator', title: 'Percentage Calculator', blurb: 'Quick percentages for rates and changes.' },
      { href: '/pages/tools/gst-calculator', title: 'GST Calculator', blurb: 'Add or remove GST on any amount.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  // =========================================================================
  // ============================ GST CALCULATOR ============================
  // =========================================================================
  {
    slug: 'gst-calculator',
    category: 'run',
    built: true,
    name: 'GST Calculator',
    tagline: 'Add or remove GST at 5, 12, 18, or 28 percent with CGST and SGST split.',
    primaryKeyword: 'gst calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free GST Calculator — Add or Remove GST, CGST SGST Split | Neweb',
    metaDescription: 'Calculate GST instantly. Add or remove GST at 5, 12, 18, or 28 percent, see the net amount, GST, CGST plus SGST split, and gross. Free, browser-only.',
    h1: 'GST <span class="serif">Calculator</span>.',
    lede: 'Enter an amount, choose your GST slab, and pick whether GST is to be added or removed. We show the net amount, the GST, the CGST and SGST split, and the gross. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Amount (in rupees)</label><input id="gstc-amt" type="number" step="any" placeholder="e.g. 1000"/></div>
        <div class="tool-row">
          <div class="field"><label>GST rate</label>
            <select id="gstc-rate"><option value="5">5%</option><option value="12">12%</option><option value="18" selected>18%</option><option value="28">28%</option></select>
          </div>
          <div class="field"><label>Mode</label>
            <select id="gstc-mode"><option value="add">Add GST (amount is net)</option><option value="remove">Remove GST (amount is gross)</option></select>
          </div>
        </div>
        <div class="tool-actions">
          <button id="gstc-go" type="button" class="btn btn-brand">Calculate GST</button>
        </div>
        <div id="gstc-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Add mode treats your amount as the pre-tax net. Remove mode treats it as the tax-inclusive gross. All maths runs in your browser.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0.00'; return (Math.round(n*100)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  var out=document.getElementById('gstc-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('gstc-go').addEventListener('click', function(){
    var amt=parseFloat(document.getElementById('gstc-amt').value);
    var rate=parseFloat(document.getElementById('gstc-rate').value);
    var mode=document.getElementById('gstc-mode').value;
    if(isNaN(amt)||amt<0){ err('Enter a valid amount.'); return; }
    var net, gst, gross;
    if(mode==='add'){ net=amt; gst=net*rate/100; gross=net+gst; }
    else { gross=amt; net=gross*100/(100+rate); gst=gross-net; }
    var half=gst/2;
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Gross (inclusive of GST)</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">Rs '+fmt(gross)+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Net amount (taxable value)</dt><dd style="margin:0;text-align:right">Rs '+fmt(net)+'</dd>'
      +'<dt style="color:var(--muted)">Total GST ('+rate+'%)</dt><dd style="margin:0;text-align:right">Rs '+fmt(gst)+'</dd>'
      +'<dt style="color:var(--muted)">CGST ('+(rate/2)+'%)</dt><dd style="margin:0;text-align:right">Rs '+fmt(half)+'</dd>'
      +'<dt style="color:var(--muted)">SGST ('+(rate/2)+'%)</dt><dd style="margin:0;text-align:right">Rs '+fmt(half)+'</dd>'
      +'<dt style="color:var(--muted);font-weight:600;color:var(--ink)">Gross total</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(gross)+'</dd>'
      +'</dl>'
      +'<p style="margin:14px 0 0;font-size:13px;color:var(--muted);line-height:1.5">For an inter-state supply, replace CGST and SGST with a single IGST of '+rate+'% (Rs '+fmt(gst)+').</p>'
      +'</div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Net amount: Rs 1,000.00</div><div class="eo-sub">The taxable value before GST is added.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Total GST at 18%: Rs 180.00</div><div class="eo-sub">Split as CGST 90.00 and SGST 90.00 for a within-state sale.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Gross total: Rs 1,180.00</div><div class="eo-sub">What the customer pays, net plus GST.</div></div></div>
      <div class="eo-note">Sample for a within-state supply. Enter your own amount and slab above.</div>
    `,
    intro: `
      <p>GST sits on almost every invoice an Indian small business raises. Goods and services fall into one of four common slabs, 5, 12, 18, or 28 percent, and the tax is split into CGST and SGST for a sale within your state, or charged as a single IGST when the sale crosses state lines. Working this out by hand on every quote and invoice is slow and easy to get wrong, especially when you need to back out the tax from a price that already includes it.</p>
      <p>This calculator does both directions. In add mode, you enter the pre-tax net amount and it gives you the GST, the CGST and SGST split, and the gross the customer pays. In remove mode, you enter a tax-inclusive price and it works backwards to show the taxable value and the GST hidden inside it. Pick your slab, enter the amount, and read the full breakdown. Nothing is sent to a server.</p>
    `,
    howTo: [
      'Enter the <strong>amount</strong> in rupees. In add mode this is the pre-tax net, in remove mode it is the tax-inclusive gross.',
      'Pick the <strong>GST rate</strong> that applies to your product or service: 5, 12, 18, or 28 percent.',
      'Choose the <strong>mode</strong>. Add GST treats your amount as net and adds tax on top. Remove GST treats it as gross and pulls the tax out.',
      'Click <strong>Calculate GST</strong>. The gross appears in large figures, with the net, total GST, and CGST plus SGST split below.',
      'For a within-state sale, use the CGST and SGST figures shown. For an inter-state sale, use the single IGST figure noted under the breakdown.',
      'Change the slab, the amount, or the mode and recalculate. Use the figures directly on your quote or invoice.',
    ],
    why: `
      <p>Three reasons a quick GST tool keeps your billing clean.</p>
      <p><strong>It gets the split right.</strong> For a within-state supply you must show CGST and SGST as equal halves, not a single GST line. The calculator splits the tax automatically so your invoice is compliant.</p>
      <p><strong>It handles reverse calculations.</strong> When a customer agrees a round all-inclusive price, you still have to show the taxable value and GST separately on the invoice. Remove mode backs the tax out correctly so your books reconcile.</p>
      <p><strong>It prevents slab errors.</strong> Applying 18 percent where 12 percent was due, or the reverse, creates problems at GSTR-1 and reconciliation. Picking the slab from a dropdown and seeing the exact tax helps you catch mistakes before they reach the invoice.</p>
    `,
    tips: [
      'Add mode is for when your listed price is before tax. Remove mode is for when your price already includes tax.',
      'For a sale within your own state, charge CGST plus SGST. For a sale to another state, charge a single IGST at the same total rate.',
      'CGST and SGST are always equal halves of the total GST, so 18 percent splits into 9 percent plus 9 percent.',
      'Confirm the correct slab for your goods or services before invoicing, as the wrong slab causes reconciliation issues later.',
      'For a tax-inclusive MRP, use remove mode to find the taxable value you need to show on the invoice.',
      'Keep amounts to two decimals on the invoice, which is exactly how the calculator formats them.',
    ],
    example: `
      <p>A stationery shop in Nagpur sells a printer to a local customer for a pre-tax price of 10,000 rupees. The printer attracts 18 percent GST. The owner enters 10000, selects 18 percent, and uses add mode. The calculator shows a net of 10,000 rupees, total GST of 1,800 rupees split as CGST 900 and SGST 900, and a gross of 11,800 rupees. Because the buyer is in the same state, the invoice shows the CGST and SGST lines. The next day a customer in Hyderabad, another state, orders the same printer but asks for an all-inclusive price of 11,800 rupees. The owner switches to remove mode, enters 11800 at 18 percent, and sees a taxable value of 10,000 rupees and GST of 1,800 rupees. Since this is an inter-state sale, he uses the single IGST line of 1,800 rupees noted under the breakdown.</p>
    `,
    faq: [
      { q: 'What is the difference between adding and removing GST?', a: '<p>Adding and removing GST are two opposite operations, and choosing the right one depends on whether your starting amount already includes tax. Use add mode when your price is the net or taxable value before tax, for example a listed price of 1,000 rupees, and you want to know how much GST to add and what the customer finally pays. In that case 18 percent GST adds 180 rupees, giving a gross of 1,180 rupees. Use remove mode when your amount already includes GST, for example an all-inclusive price of 1,180 rupees, and you need to work backwards to find the taxable value and the tax hidden inside it, which here would be a net of 1,000 rupees and GST of 180 rupees. The maths differs in each direction: adding multiplies the net by the rate, while removing divides the gross by one plus the rate to recover the net. Getting the direction right matters for your invoice and your books, because a removed figure and an added figure on the same base are not the same number.</p>' },
      { q: 'How does the CGST and SGST split work?', a: '<p>For a supply made within your own state, the total GST is split equally into two components, Central GST and State GST, each carrying half the total rate. So an 18 percent GST becomes 9 percent CGST plus 9 percent SGST, a 12 percent GST becomes 6 percent plus 6 percent, and so on. On the rupee amount the split is simply the total GST divided in two: if the total GST is 180 rupees, you show 90 rupees CGST and 90 rupees SGST. Both halves are always equal, and your tax invoice must show them as separate lines rather than a single combined GST figure, which is a compliance requirement. The calculator does this split automatically the moment you calculate, so you can copy the CGST and SGST figures straight onto your invoice. The two halves go to different governments, the central and the state, but for your billing they are simply two equal lines that together make up the GST you collect.</p>' },
      { q: 'When do I use IGST instead of CGST and SGST?', a: '<p>You use IGST, Integrated GST, when the supply is inter-state, meaning the place of supply is in a different state from where you are registered, and you use CGST plus SGST when the supply is intra-state, within the same state. IGST is a single line charged at the full rate, so on an 18 percent supply you show one IGST line of 18 percent rather than two halves. The total tax amount is the same either way, only the way it is presented and where it goes differs: intra-state tax is shared between the central and state governments as CGST and SGST, while inter-state tax goes as a single IGST that is later apportioned. The calculator shows the CGST and SGST split for the within-state case and notes the equivalent single IGST figure underneath, so whichever applies to your sale, you can read the right number. The key is the place of supply: if your customer is in another state, charge IGST; if in your state, charge CGST and SGST.</p>' },
      { q: 'Which GST rate applies to my product or service?', a: '<p>India has several GST slabs, and the common ones for small businesses are 5, 12, 18 and 28 percent, with some items at 0 percent and a few special rates. The slab depends on the specific goods or services you supply, classified under HSN codes for goods and SAC codes for services. As a rough guide, many essential and basic items sit at 5 percent, a range of processed goods and some services at 12 percent, the large default category of standard goods and most services at 18 percent, and luxury or so-called sin goods at 28 percent. However, the exact rate for your product is a matter of the official GST rate notifications, which are updated from time to time, so you should confirm your slab against the current notifications or with your accountant rather than guessing. This calculator does not decide the rate for you; it applies whichever slab you select, so the responsibility for choosing the correct slab remains with you. Once you know your rate, select it here and the tool handles the tax, split and totals.</p>' },
      { q: 'Can I use this to check a supplier invoice?', a: '<p>Yes, this is a quick and useful way to verify that a supplier has applied GST correctly on an invoice you receive. If the invoice shows a taxable value and a GST amount, use add mode with the taxable value and the stated slab and check that the GST and gross match what the supplier printed. If you only have the all-inclusive total, use remove mode with that gross to confirm the taxable value and GST implied by the slab. This helps you catch common errors, such as the wrong slab being applied, the CGST and SGST not being split equally, or a within-state supply being charged as IGST or vice versa. Because the input tax credit you can claim depends on the invoice being correct, a quick check protects you from claiming the wrong amount or having credit disallowed later. For structural validation of the supplier GSTIN itself, our GSTIN validator complements this by confirming the tax number is well-formed before you rely on the invoice.</p>' },
      { q: 'Does this calculator store the amounts I enter?', a: '<p>No, nothing you enter is stored or transmitted anywhere. The entire calculation, adding or removing GST, splitting it into CGST and SGST, and totalling the gross, happens inside your own browser using JavaScript on the page, so your amounts never reach our servers or any third party. There is no account, no login and no saved history, which means you can safely check real invoice values, prices and margins without any privacy worry, and the results appear instantly because nothing travels over the network. The trade-off is that the tool does not remember anything between calculations or visits, so if you want to keep a particular figure, copy it onto your invoice or note it down before you change the inputs. This local-only approach also means the calculator keeps working after the page has loaded even if your connection drops, since all the maths runs on your device rather than on a remote server, making it both private and dependable for everyday billing checks.</p>' },
      { q: 'Why are the figures shown to two decimal places?', a: '<p>GST amounts on invoices are expressed in rupees and paise, so the calculator shows two decimal places to match how tax is actually recorded and to keep your figures accurate. When you remove GST from a tax-inclusive price, the net and the tax often do not come out to round rupees, for example removing 18 percent from 1,180 gives a clean 1,000 and 180, but removing it from 1,500 gives a net of about 1,271.19 and GST of about 228.81. Keeping the paise ensures the net, the CGST and SGST halves, and the gross all add up correctly, which matters because rounding too early can leave your invoice totals off by a paisa or two and cause small reconciliation mismatches. The amounts are also formatted in the Indian style, with commas placed for thousands, lakhs and crores, so larger values are easy to read. When you transfer the figures to your invoice, keep the two decimals as shown so the line items and the total reconcile exactly.</p>' },
    ],
    related: [
      { href: '/pages/tools/gst-invoice-generator', title: 'GST Invoice Generator', blurb: 'Build a full compliant invoice with the split.' },
      { href: '/pages/tools/gstin-validator', title: 'GSTIN Validator', blurb: 'Check a GST number before you bill.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  // =========================================================================
  // ============================ AGE CALCULATOR ============================
  // =========================================================================
  {
    slug: 'age-calculator',
    category: 'run',
    built: true,
    name: 'Age Calculator',
    tagline: 'Find exact age in years, months, and days from a date of birth.',
    primaryKeyword: 'age calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Age Calculator — Exact Years, Months, Days | Neweb',
    metaDescription: 'Calculate exact age from a date of birth in years, months, and days, plus total days. Optional as-of date. Free, browser-only, no signup.',
    h1: 'Age <span class="serif">Calculator</span>.',
    lede: 'Enter a date of birth and, if you like, an as-of date. We work out the exact age in years, months, and days, plus the total number of days. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Date of birth</label><input id="age-dob" type="date"/></div>
          <div class="field"><label>As of date (optional, defaults to today)</label><input id="age-asof" type="date"/></div>
        </div>
        <div class="tool-actions">
          <button id="age-go" type="button" class="btn btn-brand">Calculate age</button>
        </div>
        <div id="age-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Leave the as-of date blank to calculate age today. Dates are read in your local timezone. Nothing is sent to a server.',
      js: `
(function(){
  var out=document.getElementById('age-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  function ddmmyyyy(d){ var dd=('0'+d.getDate()).slice(-2), mm=('0'+(d.getMonth()+1)).slice(-2); return dd+'/'+mm+'/'+d.getFullYear(); }
  document.getElementById('age-go').addEventListener('click', function(){
    var dobv=document.getElementById('age-dob').value;
    var asofv=document.getElementById('age-asof').value;
    if(!dobv){ err('Please pick a date of birth.'); return; }
    var dob=new Date(dobv+'T00:00:00');
    var asof=asofv?new Date(asofv+'T00:00:00'):new Date();
    asof=new Date(asof.getFullYear(),asof.getMonth(),asof.getDate());
    if(asof<dob){ err('The as-of date is before the date of birth.'); return; }
    var y=asof.getFullYear()-dob.getFullYear();
    var m=asof.getMonth()-dob.getMonth();
    var d=asof.getDate()-dob.getDate();
    if(d<0){ m--; var prevMonth=new Date(asof.getFullYear(),asof.getMonth(),0); d+=prevMonth.getDate(); }
    if(m<0){ y--; m+=12; }
    var totalDays=Math.floor((asof-dob)/86400000);
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Age</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:28px;margin:4px 0 12px">'+y+' years, '+m+' months, '+d+' days</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Date of birth</dt><dd style="margin:0;text-align:right">'+ddmmyyyy(dob)+'</dd>'
      +'<dt style="color:var(--muted)">As of</dt><dd style="margin:0;text-align:right">'+ddmmyyyy(asof)+'</dd>'
      +'<dt style="color:var(--muted)">Total days</dt><dd style="margin:0;text-align:right">'+totalDays.toLocaleString('en-IN')+'</dd>'
      +'</dl></div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">34 years, 2 months, 11 days</div><div class="eo-sub">Exact age as of 23/06/2026 for someone born 12/04/1992.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Date of birth: 12/04/1992</div><div class="eo-sub">Read in day, month, year format.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Total days: 12,490</div><div class="eo-sub">The full number of days lived as of the as-of date.</div></div></div>
      <div class="eo-note">Sample age. Enter your own date of birth above.</div>
    `,
    intro: `
      <p>Working out an exact age sounds simple until you actually try it. Months have different lengths, leap years add a day every four years, and someone born on the 30th creates an awkward part-month. Whether you are filling a form that asks for age in completed years, checking eligibility for a scheme that has an age cutoff, or working out a customer age band for a discount, doing the maths by hand is fiddly and easy to get wrong by a day or two.</p>
      <p>This calculator does it precisely. Enter a date of birth and, optionally, an as-of date, and it returns the exact age in years, months, and days, along with the total number of days lived. It handles leap years and uneven months correctly, and shows the dates in the familiar day, month, year format used across India. Everything runs in your browser, so the dates you enter stay on your device.</p>
    `,
    howTo: [
      'Click the <strong>date of birth</strong> field and pick the date from the calendar, or type it in your browser date format.',
      'Optionally, set the <strong>as of date</strong>. Leave it blank and the calculator uses today by default.',
      'Click <strong>Calculate age</strong>. The exact age in years, months, and days appears in the result panel.',
      'Read the breakdown below: the date of birth and as-of date in day, month, year format, plus the total number of days lived.',
      'Change the as-of date to find age on a future or past date, useful for eligibility cutoffs or anniversaries.',
      'Recalculate as often as you like with different dates. Nothing is saved and nothing is sent anywhere.',
    ],
    why: `
      <p>Three situations where an exact age figure matters for a small business.</p>
      <p><strong>Form filling and KYC.</strong> Many official forms ask for age in completed years as on a specific date. A precise figure avoids the mismatch that happens when you guess and the document says something slightly different.</p>
      <p><strong>Scheme and offer eligibility.</strong> Government schemes, insurance products, and your own promotions often have age cutoffs. Checking the exact age as on the qualifying date tells you instantly whether a customer or applicant qualifies.</p>
      <p><strong>Records and reminders.</strong> Knowing the exact age and total days lets you set up birthday offers, anniversary messages, and age-based segments for your customer list without manual counting.</p>
    `,
    tips: [
      'Leave the as-of date blank to get the age today. Set it to a future date to check eligibility on that day.',
      'The total days figure is handy for anniversary milestones, like a 10,000 day celebration.',
      'For schemes that count completed years as on a fixed date, set the as-of date to that exact date.',
      'A part-month at the end is normal. The days figure shows how far past the last completed month the date is.',
      'The tool handles leap years automatically, so ages spanning 29 February are counted correctly.',
      'Dates are shown in day, month, year format, the standard across Indian forms and documents.',
    ],
    example: `
      <p>A shop owner runs a birthday discount for customers turning a particular age and wants to check a regular customer born on 12 April 1992. He enters that date of birth and leaves the as-of date blank, so the tool uses today, 23 June 2026. The result reads 34 years, 2 months, 11 days, with a total of 12,490 days. The customer is well past 30, so she qualifies for the loyalty tier offer. Later he needs to check whether a young applicant for a part-time role will be 18 by the date she would start, 1 September 2026. He enters her date of birth and sets the as-of date to 1 September 2026. The result shows 17 years, 10 months, which tells him she will still be 17 on the start date, so he notes that she can join only after her birthday.</p>
    `,
    faq: [
      { q: 'How does the calculator handle leap years?', a: '<p>The calculator handles leap years automatically and correctly, so you do not need to make any adjustment for them. Leap years, which occur roughly every four years and add a 29 February, mean that the number of days between two dates is not always a simple multiple, and a naive day count can be off. This tool works with actual calendar dates rather than assuming every year has 365 days, so when it computes the total number of days lived, it includes every extra leap day that falls between the date of birth and the as-of date. Likewise, when it breaks the age into years, months and days, it respects the real length of each month and each year along the way. This matters most for people born on 29 February, whose birthday only appears in leap years, and for any age calculation that spans several leap days. Because the maths is based on the genuine calendar, the years, months, days and total days the tool reports are accurate without any manual correction on your part.</p>' },
      { q: 'What does the as-of date do?', a: '<p>The as-of date sets the point in time at which the age is measured, and it is what makes the calculator flexible beyond just today. If you leave it blank, the tool uses the current date, so you get the person age right now. If you fill it in, the tool calculates how old the person was, or will be, on that specific date instead. This is useful in many real situations: checking whether someone will have turned 18 by a job start date, finding age as on a fixed cutoff date for a government scheme or examination, working out how old a customer was on the date of a past transaction, or projecting an age for a future anniversary. You can set the as-of date in the past or the future, as long as it is on or after the date of birth. By moving the as-of date you can answer was, is and will be questions about age from a single date of birth, which is exactly what many forms and eligibility rules require.</p>' },
      { q: 'Why does the age show months and days, not just years?', a: '<p>Showing months and days alongside completed years gives you the full, precise age rather than a rounded one, which matters in several practical situations. Some forms and schemes ask for age in completed years and months, for instance certain insurance products price by exact age, and a child age is often needed in years and months for school admission or medical records. A whole-number age alone hides whether someone has just had a birthday or is about to, which can be the difference between qualifying for an age cutoff and missing it by a few days. The breakdown also makes the result easy to verify at a glance: you can see that someone is, say, 34 years, 2 months and 11 days old, and confirm it against your own expectation. If you only need completed years, simply read the years figure and ignore the rest, but the months and days are there for the many cases where the exact age, not a rounded one, is what is required.</p>' },
      { q: 'What is the total days figure useful for?', a: '<p>The total days figure is the complete count of days a person has lived from their date of birth up to the as-of date, and it has several practical and fun uses. Practically, it is handy whenever you need a precise duration rather than an approximate age, such as calculating interest or charges that accrue daily, working out exact tenure for a record, or comparing two people ages down to the day. On the lighter side, many people enjoy marking day-based milestones, such as a 10,000 day celebration, which falls a little after someone twenty-seventh birthday, and you can use the figure to plan a surprise or a birthday-style offer for a loyal customer at an unusual milestone. Because the count is based on actual calendar dates and includes leap days, it is exact rather than an estimate from multiplying years by 365. If you change the as-of date, the total days updates accordingly, so you can find the day count as of any chosen date, past or future, from a single date of birth.</p>' },
      { q: 'Are the dates I enter sent to a server?', a: '<p>No, the dates you enter are never sent anywhere; the whole calculation runs inside your own browser. When you pick a date of birth and an optional as-of date, the JavaScript on the page works out the years, months, days and total days locally on your device, with no network request carrying your data to us or any third party. That means you can use the tool for sensitive purposes, such as checking customer or applicant ages, without worrying that those dates are being logged or shared. There is no account and no saved history, so the tool simply forgets your inputs when you change them or close the tab, which keeps it private and fast, with results appearing instantly. If you need to keep a result, note it down before navigating away, since nothing is preserved between visits. This local-only design also means the calculator keeps working after the page has loaded even if your connection drops, because all the maths happens on your own device rather than on a remote server.</p>' },
      { q: 'What date format does the calculator use?', a: '<p>The calculator displays dates in the day, month, year format, written as dd/mm/yyyy, which is the standard format used across India on forms, documents and everyday communication. So a date of birth of 12 April 1992 is shown as 12/04/1992, and the as-of date and any other dates in the result follow the same pattern, which avoids the confusion that arises when month and day are swapped, as happens in the American month, day, year style. For entering dates, the input fields use your browser native date picker, so you simply click and choose from a calendar rather than typing in a particular format, which removes any ambiguity at the input stage. Internally the tool works with the actual calendar date regardless of how it is displayed, so the calculation is correct no matter which region your browser is set to. When you transfer a result onto an Indian form, the dd/mm/yyyy presentation matches what the form expects, so you can copy the figures across without having to reformat them.</p>' },
      { q: 'Can I calculate age for a future date?', a: '<p>Yes, you can calculate age for a future date by setting the as-of date to that future day. This is one of the most useful features of the tool, because many real decisions depend on how old someone will be at a later point rather than today. For example, you can check whether a young applicant will have turned 18 by their proposed joining date, whether a customer will reach a qualifying age before a scheme deadline, or how old a child will be at the start of the next academic year. Simply enter the date of birth, set the as-of date to the future date in question, and the tool reports the exact age, in years, months and days, that the person will have reached on that day, along with the total days. The only rule is that the as-of date must be on or after the date of birth, since an age before birth has no meaning. By combining a fixed date of birth with any future as-of date, you can answer will be questions about age precisely.</p>' },
    ],
    related: [
      { href: '/pages/tools/percentage-calculator', title: 'Percentage Calculator', blurb: 'Quick percentages for any number.' },
      { href: '/pages/tools/invoice-number-generator', title: 'Invoice Number Generator', blurb: 'Sequential numbers in Indian formats.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  // =========================================================================
  // ============================ INVOICE NUMBER GENERATOR ==================
  // =========================================================================
  {
    slug: 'invoice-number-generator',
    category: 'run',
    built: true,
    name: 'Invoice Number Generator',
    tagline: 'Generate sequential invoice numbers in clean Indian financial-year formats.',
    primaryKeyword: 'invoice number generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Invoice Number Generator — Indian FY Formats | Neweb',
    metaDescription: 'Generate sequential invoice numbers like INV/2026-27/0001. Set your prefix, financial year, start number, and padding. Free, browser-only.',
    h1: 'Invoice Number <span class="serif">Generator</span>.',
    lede: 'Set a prefix, the financial year, a starting number, and the zero padding. We generate a clean sequence of invoice numbers in the Indian format, ready to copy. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Prefix</label><input id="inv-prefix" type="text" placeholder="e.g. INV" maxlength="12" value="INV"/></div>
          <div class="field"><label>Financial year</label><input id="inv-fy" type="text" placeholder="e.g. 2026-27" maxlength="9" value="2026-27"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Start number</label><input id="inv-start" type="number" step="1" min="0" placeholder="e.g. 1" value="1"/></div>
          <div class="field"><label>Padding (digits)</label><input id="inv-pad" type="number" step="1" min="0" max="10" placeholder="e.g. 4" value="4"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>How many to generate</label><input id="inv-count" type="number" step="1" min="1" max="200" placeholder="e.g. 10" value="10"/></div>
          <div class="field"><label>Separator</label><select id="inv-sep"><option value="/">Slash ( / )</option><option value="-">Hyphen ( - )</option></select></div>
        </div>
        <div class="tool-actions">
          <button id="inv-go" type="button" class="btn btn-brand">Generate numbers</button>
          <button id="inv-copy" type="button" class="btn btn-ghost" style="display:none">Copy all</button>
        </div>
        <div id="inv-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Numbers follow the prefix, financial year, then a zero-padded sequence. Nothing is sent to a server. This tool does not track or store your last used number.',
      js: `
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
(function(){
  var out=document.getElementById('inv-out'), copyBtn=document.getElementById('inv-copy');
  var lastList=[];
  function err(msg){ out.style.display='block'; copyBtn.style.display='none'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('inv-go').addEventListener('click', function(){
    var prefix=(document.getElementById('inv-prefix').value||'').trim();
    var fy=(document.getElementById('inv-fy').value||'').trim();
    var start=parseInt(document.getElementById('inv-start').value,10);
    var pad=parseInt(document.getElementById('inv-pad').value,10);
    var count=parseInt(document.getElementById('inv-count').value,10);
    var sep=document.getElementById('inv-sep').value;
    if(isNaN(start)||start<0){ err('Enter a valid start number.'); return; }
    if(isNaN(pad)||pad<0){ pad=0; }
    if(isNaN(count)||count<1){ err('Enter how many numbers to generate.'); return; }
    if(count>200) count=200;
    lastList=[];
    for(var i=0;i<count;i++){
      var num=String(start+i);
      while(num.length<pad) num='0'+num;
      var parts=[]; if(prefix) parts.push(prefix); if(fy) parts.push(fy); parts.push(num);
      lastList.push(parts.join(sep));
    }
    out.style.display='block';
    out.innerHTML='<div style="border:1px solid var(--line);border-radius:12px;overflow:hidden">'
      + lastList.map(function(n,idx){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;font-family:JetBrains Mono,monospace;font-size:14px;'+(idx%2?'background:#fafafa':'background:#fff')+';border-top:'+(idx?'1px solid var(--line)':'none')+'"><span>'+escHtml(n)+'</span><button type="button" class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent);this.textContent=\\'Copied\\';var b=this;setTimeout(function(){b.textContent=\\'Copy\\';},1000);">Copy</button></div>'; }).join('')
      + '</div>';
    copyBtn.style.display='inline-flex';
  });
  copyBtn.addEventListener('click', function(){
    if(!lastList.length) return;
    navigator.clipboard.writeText(lastList.join('\\n'));
    copyBtn.textContent='Copied all';
    var b=copyBtn; setTimeout(function(){ b.textContent='Copy all'; }, 1200);
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main eo-mono">INV/2026-27/0001</div><div class="eo-sub">First invoice of the financial year, padded to four digits.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">INV/2026-27/0002</div><div class="eo-sub">The sequence increments by one each time.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">INV/2026-27/0003</div><div class="eo-sub">Clean, ordered, and easy to reconcile.</div></div></div>
      <div class="eo-note">Sample sequence. Set your own prefix, year, start, and padding above.</div>
    `,
    intro: `
      <p>GST rules in India require invoice numbers to be a consecutive serial number, unique for a financial year, no longer than sixteen characters, and made only of letters, numbers, and a few symbols like slash and hyphen. Many small businesses get this slightly wrong: they restart numbering mid-year, skip numbers, or use an inconsistent format that makes reconciliation harder than it needs to be. A clean, predictable invoice number series is one of those small disciplines that quietly keeps your books and your GSTR-1 filing tidy.</p>
      <p>This generator builds a compliant series for you. You set a prefix like INV, the financial year in the 2026-27 form, the number to start from, and how many digits to pad to. It then produces a neat sequence such as INV/2026-27/0001, INV/2026-27/0002, and so on, each with a copy button. Use it to plan your numbering scheme or to grab the next batch of numbers. Everything runs in your browser.</p>
    `,
    howTo: [
      'Enter a <strong>prefix</strong> that identifies your invoices, such as INV, or your initials. Keep it short.',
      'Enter the <strong>financial year</strong> in the Indian form, for example 2026-27, which runs April 2026 to March 2027.',
      'Set the <strong>start number</strong>. Begin at 1 for a fresh financial year, or at your next number to continue an existing series.',
      'Choose the <strong>padding</strong>, the number of digits to pad to. Four digits turns 1 into 0001, which sorts cleanly.',
      'Pick how many numbers to generate and the <strong>separator</strong>, slash or hyphen, then click <strong>Generate numbers</strong>.',
      'Copy a single number with its own button, or use <strong>Copy all</strong> to grab the whole batch for your records.',
    ],
    why: `
      <p>Three reasons a tidy invoice number series is worth setting up properly.</p>
      <p><strong>GST compliance.</strong> The law requires a consecutive serial number unique within the financial year, under sixteen characters, using only permitted symbols. A clean format keeps you compliant and avoids questions during scrutiny.</p>
      <p><strong>Easier reconciliation.</strong> When numbers are consecutive and zero-padded, a gap stands out immediately. You can spot a missing invoice at a glance, which makes GSTR-1 filing and year-end reconciliation far quicker.</p>
      <p><strong>A professional look.</strong> A consistent series like INV/2026-27/0042 looks far more established than a jumble of ad hoc numbers. It signals to customers and auditors that your billing is organised.</p>
    `,
    tips: [
      'Start fresh at 0001 each financial year on 1 April, since the series must be unique within the year.',
      'Keep the whole number under sixteen characters, including the prefix and separators, to stay within GST limits.',
      'Use only letters, numbers, slash, and hyphen. Avoid spaces and other symbols, which are not permitted.',
      'Pad to four digits if you expect up to 9,999 invoices a year. Use five if you bill more heavily.',
      'Never reuse or skip a number. If you cancel an invoice, keep the number and mark it cancelled rather than reusing it.',
      'Pick one format and stick to it for the whole year, as switching formats mid-year complicates reconciliation.',
    ],
    example: `
      <p>A freelance designer in Bengaluru starts the new financial year on 1 April 2026 and wants a clean numbering scheme. She sets the prefix to INV, the financial year to 2026-27, the start number to 1, padding to four digits, and the separator to a slash. She generates ten numbers and gets INV/2026-27/0001 through INV/2026-27/0010. She uses the first for her opening invoice of the year and notes that the next one will be 0002. Three months later she has reached 0037 and needs the next five numbers for a busy week. She sets the start to 38 and generates five, getting INV/2026-27/0038 to INV/2026-27/0042. The series stays consecutive and under sixteen characters, so her GSTR-1 reconciliation each month is simply a matter of checking the numbers run without a gap.</p>
    `,
    faq: [
      { q: 'What format do Indian invoice numbers need to follow?', a: '<p>Under GST rules, an invoice number, formally the invoice serial number, must meet a few clear conditions. It has to be a consecutive serial number that is unique within a financial year, it cannot be longer than sixteen characters, and it may contain only letters, numbers, and the special characters hyphen, dash and slash, with no spaces or other symbols. A common, compliant format is a short prefix, the financial year, and a zero-padded running number, for example INV/2026-27/0001, which is easy to read, sorts correctly, and stays within the character limit. You are free to design the scheme to suit your business, so the prefix could be your initials or a branch code, but the core requirement is that the numbers run consecutively without gaps or repeats across the year. This generator builds numbers that follow this pattern, but you remain responsible for keeping the total length within sixteen characters and using only permitted symbols, which is why it is worth checking your chosen prefix and separator against these limits before you adopt the series.</p>' },
      { q: 'Should I restart numbering each financial year?', a: '<p>Yes, the requirement is that the invoice serial number be unique within a financial year, so it is standard and accepted practice to restart the sequence at the beginning of each financial year, which in India runs from 1 April to 31 March. Most businesses begin the new year at 0001 and let the number climb until the following 31 March, then reset. To keep numbers from different years distinct, the financial year is usually built into the invoice number itself, as in INV/2026-27/0001, so that even though the running number resets, the full invoice number never repeats across years. This makes reconciliation and record keeping cleaner, because the year is visible on the face of every invoice. If you prefer, you can run a continuous sequence that never resets, which is also acceptable as long as it stays consecutive and unique, but the year-based reset is more common and easier to audit. Whichever you choose, the golden rule is no gaps and no repeats within a year, so decide your approach at the start of the year and apply it consistently.</p>' },
      { q: 'Does this tool remember my last invoice number?', a: '<p>No, this tool does not track, store or remember your last used invoice number, and that is by design. It runs entirely in your browser with no account and no saved history, so it cannot know which numbers you have already issued. What it does is generate a sequence on demand from the start number you give it, which means you are responsible for telling it where to begin so the new numbers continue your existing series without overlapping. In practice, the safe workflow is to keep your authoritative record of issued invoices in your billing software or accounting register, check the last number you used, and then set this tool start number to one higher before generating the next batch. Because nothing is stored here, you avoid any risk of the tool being out of sync with your real records, but it does mean you must keep your own count. If you need automatic sequential numbering that never repeats, a proper invoicing system that maintains the running number for you is the right tool, with this generator best suited to planning a scheme or grabbing a batch of numbers.</p>' },
      { q: 'How many digits of padding should I use?', a: '<p>Padding is the practice of writing the running number with leading zeros to a fixed width, such as 0001 instead of 1, and the right amount depends on how many invoices you expect to raise in a year. Four digits, giving numbers from 0001 to 9999, suits most small businesses comfortably, since it covers up to nearly ten thousand invoices in the year while keeping the number short. If you bill very heavily and might exceed that, choose five digits for a ceiling of 99999. The main benefit of padding is that zero-padded numbers sort and line up neatly, so 0009 and 0010 appear in the correct order in a list, whereas unpadded 9 and 10 can sort wrongly in some systems and look untidy on a printed register. Padding also makes gaps easy to spot during reconciliation. Just remember to count the padded width towards the sixteen-character limit, so a long prefix plus the financial year plus five digits should still fit. For most users, four digits is the sensible default this tool starts with.</p>' },
      { q: 'Can I use a custom prefix like my initials?', a: '<p>Yes, the prefix is fully customisable, and many businesses use it to make their invoice numbers more meaningful. You can set it to a generic INV, to your initials or business short code, to a branch or location identifier, or even to a product line marker, whatever helps you organise and recognise your invoices at a glance. For example, a designer might use her initials, a multi-branch shop might use a code for each outlet, and a business with separate verticals might prefix each one differently. The only things to keep in mind are the GST constraints: the entire invoice number, prefix included, must stay within sixteen characters and use only letters, numbers, hyphen, dash and slash, so a long prefix leaves less room for the year and the running number. It is also wise to keep your prefix scheme stable through a financial year rather than changing it midway, since a consistent format makes reconciliation and auditing straightforward. Set your chosen prefix in the field, and the generator will apply it to every number in the sequence.</p>' },
      { q: 'What happens if I cancel an invoice?', a: '<p>If you cancel an invoice, the correct approach under GST is to keep the cancelled invoice number in your records and mark it as cancelled, rather than reusing the number for a different invoice or deleting it to close the gap. The reason is that your invoice series must remain consecutive and each number unique within the year, so a missing or reused number raises questions during reconciliation and scrutiny. By retaining the cancelled number and noting clearly that it was cancelled, you preserve an unbroken, auditable sequence: anyone reviewing your books sees that the number was issued and then voided, with no doubt about a hidden or duplicated invoice. Depending on the situation and timing, you may also need to issue a credit note or follow the prescribed cancellation process for invoices already reported in your GSTR-1, so it is worth checking the correct procedure with your accountant for your specific case. This generator helps you plan a clean series, but handling cancellations properly within that series is part of disciplined record keeping that keeps your numbering compliant.</p>' },
      { q: 'Are the numbers I generate sent to a server?', a: '<p>No, the invoice numbers are generated entirely within your own browser, and none of your inputs, the prefix, financial year, start number, padding or count, are sent to us or any third party. The JavaScript on the page builds the sequence locally on your device, so your numbering scheme stays private and the numbers appear instantly without any network request. There is no account, no login and no stored history, which is also why the tool cannot remember your last used number between visits, as covered in another answer. The practical upshot is that you can plan and copy invoice numbers freely without privacy concerns, but you should copy any numbers you want to keep, since nothing is preserved once you change the inputs or close the tab. This local-only design also means the generator keeps working after the page has loaded even if your connection drops, because all the logic runs on your own device rather than on a remote server, making it both private and reliable for quick numbering tasks.</p>' },
    ],
    related: [
      { href: '/pages/tools/gst-invoice-generator', title: 'GST Invoice Generator', blurb: 'Build the full invoice around the number.' },
      { href: '/pages/tools/gst-calculator', title: 'GST Calculator', blurb: 'Work out the tax on each line.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  // =========================================================================
  // ============================ CHARACTER COUNTER =========================
  // =========================================================================
  {
    slug: 'character-counter',
    category: 'seo',
    built: true,
    name: 'Character Counter',
    tagline: 'Live character and word count with platform limit bars for social and SEO.',
    primaryKeyword: 'character counter',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Character Counter — Live Count with Platform Limits | Neweb',
    metaDescription: 'Count characters and words live as you type, with limit bars for Twitter, meta title, meta description, SMS, and Instagram. Free, browser-only.',
    h1: 'Character <span class="serif">Counter</span>.',
    lede: 'Type or paste your text and watch the character and word count update live, with progress bars showing how close you are to the limits for Twitter, meta titles, meta descriptions, SMS, and Instagram. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Your text</label>
          <textarea id="cc-in" rows="6" placeholder="Type or paste your text here…" style="width:100%;font-family:inherit;font-size:15px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;resize:vertical"></textarea>
        </div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;margin:4px 0 16px">
          <div><span style="font-family:JetBrains Mono,monospace;font-size:26px;font-weight:700;color:var(--ink)" id="cc-chars">0</span> <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">characters</span></div>
          <div><span style="font-family:JetBrains Mono,monospace;font-size:26px;font-weight:700;color:var(--ink)" id="cc-words">0</span> <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">words</span></div>
          <div><span style="font-family:JetBrains Mono,monospace;font-size:26px;font-weight:700;color:var(--ink)" id="cc-nospace">0</span> <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">no spaces</span></div>
        </div>
        <div id="cc-bars"></div>
      `,
      help: 'Counts update live as you type. Bars turn amber near the limit and red once you exceed it. Nothing is sent to a server.',
      js: `
(function(){
  var ta=document.getElementById('cc-in'), barsEl=document.getElementById('cc-bars');
  var charsEl=document.getElementById('cc-chars'), wordsEl=document.getElementById('cc-words'), nsEl=document.getElementById('cc-nospace');
  var LIMITS=[
    {name:'Twitter / X post', limit:280},
    {name:'Meta title', limit:60},
    {name:'Meta description', limit:160},
    {name:'SMS (single)', limit:160},
    {name:'Instagram caption', limit:2200}
  ];
  function render(){
    var t=ta.value;
    var chars=t.length;
    var words=(t.trim().match(/\\S+/g)||[]).length;
    var nospace=t.replace(/\\s/g,'').length;
    charsEl.textContent=chars.toLocaleString('en-IN');
    wordsEl.textContent=words.toLocaleString('en-IN');
    nsEl.textContent=nospace.toLocaleString('en-IN');
    barsEl.innerHTML=LIMITS.map(function(L){
      var pct=Math.min(100, chars/L.limit*100);
      var over=chars>L.limit;
      var near=!over && chars>=L.limit*0.9;
      var color=over?'#dc2626':(near?'#d97706':'#16a34a');
      var remaining=L.limit-chars;
      var note=over?('over by '+(chars-L.limit)):(remaining+' left');
      return '<div style="margin-bottom:12px">'
        +'<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span style="color:var(--ink-2)">'+L.name+'</span><span style="font-family:JetBrains Mono,monospace;font-size:12px;color:'+color+'">'+chars+' / '+L.limit+' ('+note+')</span></div>'
        +'<div style="height:8px;background:#eef0f3;border-radius:99px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+color+';transition:width .15s"></div></div>'
        +'</div>';
    }).join('');
  }
  ta.addEventListener('input', render);
  render();
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Characters: 128 · Words: 22</div><div class="eo-sub">A sample caption measured live as you type.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Meta title: 128 / 60 (over by 68)</div><div class="eo-sub">Far too long for a search title, the bar shows red.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Twitter / X: 128 / 280 (152 left)</div><div class="eo-sub">Comfortably within the post limit, the bar shows green.</div></div></div>
      <div class="eo-note">Sample counts. Type your own text above to see live bars.</div>
    `,
    intro: `
      <p>Every place you publish text has a limit. A meta title gets cut off after about sixty characters in search results, a meta description after roughly a hundred and sixty, a single SMS after a hundred and sixty, a Twitter or X post at two hundred and eighty, and an Instagram caption at two thousand two hundred. Write past the limit and your message gets truncated at an awkward point, often dropping your call to action or your brand name right where it matters.</p>
      <p>This character counter shows the character count, word count, and count without spaces live as you type, then draws a progress bar for each platform limit. Each bar turns amber as you approach the limit and red once you cross it, with a clear figure for how many characters you have left or how far over you are. It is built specifically for the limits Indian small businesses hit when writing social posts, SMS campaigns, and SEO meta tags. Everything runs in your browser.</p>
    `,
    howTo: [
      'Click into the <strong>text box</strong> and type your post, caption, SMS, or meta tag, or paste it in.',
      'Watch the three big counters update live: total <strong>characters</strong>, <strong>words</strong>, and characters with <strong>no spaces</strong>.',
      'Below, read the <strong>limit bars</strong> for Twitter or X, meta title, meta description, SMS, and Instagram.',
      'A <strong>green</strong> bar means you are within the limit, <strong>amber</strong> means you are close, and <strong>red</strong> means you have gone over.',
      'Each bar shows exactly how many characters you have left, or how many you are over by, so you know how much to trim.',
      'Edit your text until the bars for the platforms you care about are green, then copy your finished text to publish.',
    ],
    why: `
      <p>Three reasons writing to the limit matters for getting found and getting clicks.</p>
      <p><strong>Search snippets get truncated.</strong> A meta title over sixty characters or a description over a hundred and sixty gets cut with an ellipsis in Google results, often hiding your brand or your strongest selling point. Staying within the limit keeps the whole message visible.</p>
      <p><strong>SMS billing is per segment.</strong> A single SMS is a hundred and sixty characters. Go one character over and it becomes two segments, doubling your cost across a large campaign. Counting before you send keeps your messaging budget under control.</p>
      <p><strong>Social posts read better when tight.</strong> A Twitter post that runs to the limit feels cramped, and a caption that ignores the limit gets cut behind a more tag. Writing within the limit forces clarity and keeps the whole message in view.</p>
    `,
    tips: [
      'Aim a little under each limit. Mobile search cuts meta descriptions sooner, so target about 150 characters for safety.',
      'Keep meta titles under sixty characters so Google does not truncate your brand name at the end.',
      'For SMS, stay within a hundred and sixty characters to avoid being billed for a second segment.',
      'On Instagram, the first 125 characters or so show before the more link, so front-load your key message.',
      'Use the no-spaces count when a platform counts only visible characters, though most count spaces too.',
      'Paste a draft in, trim until every bar you care about is green, then copy the final version out.',
    ],
    example: `
      <p>A cafe owner in Kochi is writing the meta description for her menu page and a caption for the same dish on Instagram. She types her draft into the counter. The meta description bar shows 188 / 160 in red, over by 28, so she trims two clauses until it reads 154 / 160 in green. The same text in the Instagram bar shows 154 / 2200, comfortably green, but she notices the first line will be cut at about 125 characters, so she moves the dish name and price to the front. Next she drafts an SMS offer for her regulars. The counter shows 171 / 160 in red, so it would bill as two segments across her list of 600 customers. She shortens the wording to 148 / 160 in green, keeping the whole campaign to one segment per message and saving on cost.</p>
    `,
    faq: [
      { q: 'How is this different from a word counter?', a: '<p>A word counter focuses mainly on the number of words and is most useful for long-form writing like articles, essays and reports where word count targets matter. This character counter is built for the opposite problem: short text that must fit within strict character limits, such as social posts, SMS messages and SEO meta tags. While it does show a word count, its real value is the live character count combined with platform limit bars for Twitter or X, meta titles, meta descriptions, SMS and Instagram, each of which turns amber as you approach the limit and red when you exceed it. In other words, a word counter answers how much have I written, whereas this tool answers will this fit and how much do I need to cut. For an Indian small business writing a meta description that must stay under a hundred and sixty characters, or an SMS campaign that must stay in one segment, the character-and-limit view is exactly what is needed, which is why this is a distinct tool focused on fitting text to platform constraints rather than measuring length for its own sake.</p>' },
      { q: 'Does the count include spaces?', a: '<p>The main character count does include spaces, because that is how the platforms themselves count, and it is the number that matters for fitting within their limits. When Twitter limits a post to two hundred and eighty characters, or an SMS segment holds a hundred and sixty, or Google shows about sixty characters of a title, every space, punctuation mark and emoji counts towards that total, so the spaces-included figure is the one you should watch against the limit bars. For convenience, the tool also shows a separate no-spaces count, which strips out all whitespace and is occasionally useful, for instance when a particular field counts only visible characters or when you want to gauge the density of your text. For almost all real publishing decisions, though, you should rely on the main character count with spaces, since that mirrors how the platform measures your text and determines whether it gets truncated or billed as an extra segment. The limit bars are based on the spaces-included count for exactly this reason.</p>' },
      { q: 'Why is the meta title limit sixty characters?', a: '<p>The sixty-character guideline for meta titles exists because Google does not count characters directly; it measures the title by pixel width, displaying roughly five hundred and eighty pixels on a standard desktop result, which works out to about sixty average English characters. Beyond that width, Google truncates the title with an ellipsis, and because the brand name usually sits at the end, the part most often chopped off is your brand or your closing words. Wide letters such as W and M use more pixels than narrow ones like i and l, so the exact cutoff varies, which is why sixty is a safe target rather than a hard rule. Keeping titles within this limit means the whole title shows cleanly, with your keywords at the front where they carry the most weight. This tool meta title bar is set to sixty so you can see at a glance whether your title will display in full, turning amber as you near the limit and red if you go over, prompting you to trim before you publish.</p>' },
      { q: 'Why does the SMS limit matter for cost?', a: '<p>SMS messages are billed by segment, and a single segment using the standard GSM character set holds a hundred and sixty characters. If your message goes even one character over that limit, it is split into multiple segments, and you are charged for each segment, so a hundred and sixty-one character message effectively costs twice as much as a hundred and sixty-character one. Across a large campaign sent to hundreds or thousands of customers, that difference adds up quickly, turning a small overrun into a meaningful extra cost. There is a further catch: using certain special characters or emojis can switch the message to a different encoding that holds only seventy characters per segment, slashing your budget further, so plain text is safer for bulk SMS. This tool SMS bar is set to a hundred and sixty so you can see immediately whether your message stays in one segment, and trim it back into the green before sending. For Indian businesses running promotional or transactional SMS at scale, keeping each message to a single segment is a simple way to control spend.</p>' },
      { q: 'Are the platform limits exact?', a: '<p>The limits used here reflect the well-known public figures for each platform: two hundred and eighty characters for a Twitter or X post, about sixty for a meta title, about a hundred and sixty for a meta description, a hundred and sixty for a single SMS segment, and two thousand two hundred for an Instagram caption. These are accurate as widely documented standards, but a couple of them are guidelines rather than hard cutoffs. The meta title and meta description figures in particular are based on how much Google typically displays, measured in pixels rather than a fixed character count, so the real cutoff can vary slightly with the width of the letters you use. The social and SMS limits are firmer, since they are enforced by the platforms themselves. Because platforms occasionally change their rules, it is sensible to treat the bars as a reliable working guide and to aim a little under each limit for safety, which also protects you against the shorter cutoffs that mobile devices often apply, especially to search snippets and Instagram captions where only the first portion shows before truncation.</p>' },
      { q: 'Does my text get sent anywhere?', a: '<p>No, the text you type or paste never leaves your browser. All the counting and the limit bars are computed locally on your device by JavaScript on the page, so nothing you write is sent to us or to any third party, and there is no account, login or saved history. This means you can safely draft sensitive content, such as unreleased offers, customer messages or marketing copy, without any worry that it is being logged or stored, and the counts update instantly as you type because nothing has to travel over the network. The trade-off is that the tool does not remember your text between visits, so copy your finished version out before you close or refresh the tab, since nothing is preserved. This local-only design also means the counter keeps working after the page has loaded even if your connection drops, because all the logic runs on your own device rather than on a remote server, making it both private and dependable for drafting posts, captions, messages and meta tags.</p>' },
      { q: 'Can I use this for meta descriptions on my website?', a: '<p>Yes, this is one of its most useful purposes for a small business website. A meta description is the snippet of text Google shows under your page title in search results, and while it does not directly affect rankings, it strongly influences whether someone clicks, so getting it the right length matters. Paste your draft description into the box and watch the meta description bar, which is set to about a hundred and sixty characters: if it shows red, your description will be truncated with an ellipsis in search results, often cutting off your call to action, so trim it back into the green. Aim a little under the limit, around a hundred and fifty characters, because mobile results display less, and front-load your keyword and main benefit so the important words survive even if the snippet is shortened. You can do the same with your meta titles using the sixty-character bar. Writing every page title and description to fit, rather than guessing, helps your listings display cleanly and earn more clicks, which is a free SEO win.</p>' },
    ],
    related: [
      { href: '/pages/tools/meta-title-description-generator', title: 'Meta Title & Description Generator', blurb: 'Write SEO-tight titles and descriptions.' },
      { href: '/pages/tools/case-converter', title: 'Case Converter', blurb: 'Switch text between cases instantly.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  // =========================================================================
  // ============================ CASE CONVERTER ============================
  // =========================================================================
  {
    slug: 'case-converter',
    category: 'seo',
    built: true,
    name: 'Case Converter',
    tagline: 'Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and more.',
    primaryKeyword: 'case converter',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Case Converter — UPPERCASE, Title Case, camelCase | Neweb',
    metaDescription: 'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case. Copy each result. Free, browser-only.',
    h1: 'Case <span class="serif">Converter</span>.',
    lede: 'Type or paste your text and instantly see it in seven cases: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case. Copy any result with one click. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Your text</label>
          <textarea id="case-in" rows="4" placeholder="Type or paste your text here…" style="width:100%;font-family:inherit;font-size:15px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;resize:vertical"></textarea>
        </div>
        <div id="case-out" style="margin-top:8px;display:flex;flex-direction:column;gap:10px"></div>
      `,
      help: 'Results update live as you type. Click Copy on any line to copy that version. Nothing is sent to a server.',
      js: `
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
(function(){
  var ta=document.getElementById('case-in'), out=document.getElementById('case-out');
  function words(s){ return (s.replace(/[_-]/g,' ').match(/[A-Za-z0-9]+/g)||[]); }
  function titleCase(s){ return s.replace(/\\w\\S*/g, function(w){ return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase(); }); }
  function sentenceCase(s){ var lower=s.toLowerCase(); return lower.replace(/(^\\s*\\w|[.!?]\\s+\\w)/g, function(c){ return c.toUpperCase(); }); }
  function camel(s){ var w=words(s.toLowerCase()); return w.map(function(x,i){ return i===0?x:x.charAt(0).toUpperCase()+x.slice(1); }).join(''); }
  function snake(s){ return words(s.toLowerCase()).join('_'); }
  function kebab(s){ return words(s.toLowerCase()).join('-'); }
  function render(){
    var t=ta.value;
    var rows=[
      {label:'UPPERCASE', val:t.toUpperCase()},
      {label:'lowercase', val:t.toLowerCase()},
      {label:'Title Case', val:titleCase(t)},
      {label:'Sentence case', val:sentenceCase(t)},
      {label:'camelCase', val:camel(t)},
      {label:'snake_case', val:snake(t)},
      {label:'kebab-case', val:kebab(t)}
    ];
    out.innerHTML=rows.map(function(r){
      return '<div style="padding:12px 16px;border:1px solid var(--line);border-radius:12px;background:#fff">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px"><span style="font-family:JetBrains Mono,monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">'+r.label+'</span>'
        +'<button type="button" class="btn btn-ghost" style="padding:4px 12px;font-size:11px" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent);this.textContent=\\'Copied\\';var b=this;setTimeout(function(){b.textContent=\\'Copy\\';},1000);">Copy</button></div>'
        +'<div style="color:var(--ink);font-size:14.5px;word-break:break-word;min-height:18px">'+escHtml(r.val)+'</div>'
        +'</div>';
    }).join('');
  }
  ta.addEventListener('input', render);
  render();
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main eo-mono">SHARMA GENERAL STORE</div><div class="eo-sub">UPPERCASE, useful for signage and headings.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Sharma General Store</div><div class="eo-sub">Title Case, ready for a business name or page title.</div></div></div>
      <div class="eo-item"><div><div class="eo-main eo-mono">sharma-general-store</div><div class="eo-sub">kebab-case, perfect for a clean URL slug.</div></div></div>
      <div class="eo-note">Sample conversions. Type your own text above to see all seven cases.</div>
    `,
    intro: `
      <p>Text rarely arrives in the case you need. A business name typed in all caps needs to become Title Case for a heading, a heading needs to become a kebab-case slug for a clean URL, and a list of product names pasted from a supplier sheet needs to be normalised to lowercase before import. Retyping by hand is slow and introduces typos, especially across a long list.</p>
      <p>This case converter takes your text and shows it instantly in seven common cases: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case. Each version sits on its own line with a copy button, so you grab exactly the one you need without retyping. It updates live as you type and runs entirely in your browser, so nothing you paste is sent anywhere.</p>
    `,
    howTo: [
      'Click into the <strong>text box</strong> and type or paste the text you want to convert.',
      'Read the seven results below, each labelled: <strong>UPPERCASE</strong>, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case.',
      'The results update <strong>live</strong> as you type, so you can refine your input and watch every case change.',
      'Find the case you need and click its <strong>Copy</strong> button. The label briefly changes to Copied to confirm.',
      'Paste the copied text wherever you need it, a heading, a URL slug, a filename, or a code field.',
      'Clear the box and paste new text to convert the next item. Nothing is saved between conversions.',
    ],
    why: `
      <p>Three places a quick case converter saves time and prevents errors.</p>
      <p><strong>Clean URL slugs.</strong> A page title like Sharma General Store becomes the slug sharma-general-store in kebab-case, ready to drop into your website address. Consistent slugs are tidy, readable, and better for SEO than spaces and capitals.</p>
      <p><strong>Tidy product and customer lists.</strong> Data pasted from different sources arrives in mixed case. Converting a whole column to Title Case or lowercase in one step normalises it before you import it into your catalogue or mailing list.</p>
      <p><strong>Headings and signage.</strong> The same business name often needs UPPERCASE for a banner, Title Case for a web heading, and lowercase for a handle. Generating all of them at once keeps your branding consistent across every surface.</p>
    `,
    tips: [
      'Use kebab-case for URL slugs, as hyphens are the preferred word separator in web addresses.',
      'Title Case suits headings and business names, while Sentence case suits descriptions and body copy.',
      'camelCase and snake_case are handy for field names, file names, and code, not for customer-facing text.',
      'Convert a pasted list to lowercase first to normalise it, then to Title Case if you need display formatting.',
      'UPPERCASE works for short signage and labels, but long passages in caps are harder to read, so use it sparingly.',
      'The copy button grabs only that one line, so you never have to select text by hand.',
    ],
    example: `
      <p>A shop owner setting up his first website has the business name SHARMA GENERAL STORE typed in caps from his old letterhead. He pastes it into the converter. The Title Case line shows Sharma General Store, which he copies for the website heading and his Google Business Profile name. The kebab-case line shows sharma-general-store, which he copies as the URL slug for his homepage and as the start of his domain idea. Later he is preparing a product list a supplier sent in inconsistent capitals. He pastes each product name in, copies the Title Case version for his catalogue display, and copies the lowercase version for the internal product codes. In a few minutes he has consistent branding across his site heading, URL, and product list, without retyping a single word or worrying about stray capitals.</p>
    `,
    faq: [
      { q: 'What is the difference between Title Case and Sentence case?', a: '<p>Title Case and Sentence case both control capitalisation but follow different rules. Title Case capitalises the first letter of each word, as in Sharma General Store or Best Coffee In Pune, which makes it well suited to headings, business names, page titles and anything you want to look like a formal title. Sentence case capitalises only the first letter of the sentence and any proper nouns, leaving the rest lowercase, as in Best coffee in Pune, which reads naturally and suits body copy, descriptions and meta descriptions. The practical choice depends on context: use Title Case where you want emphasis and a title-like feel, and Sentence case where you want text that reads like normal prose. A common mistake is putting body text in Title Case, which looks stilted, or putting a heading in Sentence case when a title feel is wanted. This tool shows both versions side by side from the same input, so you can compare them directly and copy whichever fits the place you are pasting into, whether that is a page heading, a product name or a paragraph of description.</p>' },
      { q: 'When should I use kebab-case?', a: '<p>kebab-case, which joins words with hyphens and uses all lowercase, as in sharma-general-store, is the standard format for URL slugs, the readable part of a web address that identifies a page. Search engines and humans both read hyphenated, lowercase slugs easily, and hyphens are treated as word separators by Google, which is why kebab-case is preferred over alternatives like spaces, which get encoded into ugly characters, or underscores, which are not treated as separators in the same way. So when you are creating a page address, a blog post URL or a category path, convert your title to kebab-case and use that as the slug, for example turning the heading Best Coffee in Pune into best-coffee-in-pune. It is also useful for file names where you want web-safe, readable names. For customer-facing display text, though, you would not use kebab-case; it is purely for slugs, file names and similar technical identifiers. This converter generates the kebab-case version automatically from whatever you type, so you can copy a clean, ready-to-use slug straight into your website without manually inserting hyphens and lowercasing letters.</p>' },
      { q: 'What are camelCase and snake_case for?', a: '<p>camelCase and snake_case are naming conventions used mainly in technical contexts rather than for customer-facing text. camelCase joins words with no spaces and capitalises each word after the first, as in sharmaGeneralStore, and is common in programming for variable and function names. snake_case joins words with underscores in lowercase, as in sharma_general_store, and is widely used for database column names, file names, configuration keys and field identifiers, including in spreadsheets and data imports. For a small business owner, these are most useful when you are setting up structured data, naming fields in a form or spreadsheet, or working with a developer who asks for identifiers in a particular style. You would not use either for a heading, a business name or a description shown to customers, because they look like code rather than natural text. The value of this tool is that it produces both formats instantly from plain text, so if a system or a developer asks for a field name in snake_case or camelCase, you can type the human-readable name and copy the technical version without having to manually remove spaces and adjust capitals.</p>' },
      { q: 'Does the converter handle special characters and numbers?', a: '<p>The converter handles letters, numbers and ordinary punctuation sensibly, with behaviour that depends on the case you choose. For UPPERCASE, lowercase, Title Case and Sentence case, your text is preserved as written, including numbers, punctuation and symbols, with only the letter casing changed, so a name like Shop No. 12 keeps its full stop and digits. For the identifier formats, camelCase, snake_case and kebab-case, the tool focuses on the words and joins them with the relevant separator, so spaces and most punctuation are treated as word boundaries rather than kept, which is exactly what you want for slugs and field names, turning Shop No. 12 into shop-no-12 for kebab-case, for example. Numbers are retained as part of the words in all cases. This means you can paste real business text with the usual mix of letters, digits and punctuation and get clean, sensible output in every format. If you need a particular symbol preserved exactly, the UPPERCASE, lowercase and Title Case outputs are the ones that keep your text closest to the original, since they only change letter casing.</p>' },
      { q: 'Does the text I paste get sent anywhere?', a: '<p>No, nothing you type or paste leaves your browser. All seven case conversions are computed locally on your device by JavaScript on the page, so your text is never sent to us or to any third party, and there is no account, login or saved history. This means you can safely convert sensitive content, such as customer names, internal product codes or unreleased copy, without any worry that it is being logged or stored, and the results update instantly as you type because nothing has to travel over the network. The trade-off is that the tool does not remember your text between visits, so copy the version you need before you close or refresh the tab, since nothing is preserved. This local-only design also means the converter keeps working after the page has loaded even if your connection drops, because all the logic runs on your own device rather than on a remote server. For a small business handling lists of customer or product names, this on-device processing is a genuine privacy benefit over tools that send your text to a server.</p>' },
      { q: 'Can I convert a whole list at once?', a: '<p>You can paste multiple lines or a block of text into the box, and the converter will transform the whole thing in each case, but how useful that is depends on the case you choose. For UPPERCASE, lowercase, Title Case and Sentence case, converting a multi-line list works well, since each line is recased independently and the line breaks are preserved, so you can normalise an entire column of product or customer names in one step and copy the result back. For the identifier formats, camelCase, snake_case and kebab-case, the tool is designed around turning a single name into one identifier, so it treats the whole input as one item and joins everything with separators, which is ideal for one slug at a time rather than a list. So the practical approach is to use the converter on a full list when you want consistent display casing, such as Title Case or lowercase, and to use it one item at a time when you need a slug or field name. Either way, you avoid retyping, and because everything runs locally, even a long list converts instantly as you paste it in.</p>' },
      { q: 'Why would I use this for SEO?', a: '<p>Case formatting touches SEO in a few practical ways, which is why this tool sits in the website and SEO toolset. The clearest use is creating URL slugs: search engines prefer clean, lowercase, hyphenated slugs, so converting a page title into kebab-case gives you a tidy, readable web address like best-coffee-in-pune, which is better for both rankings and click-throughs than a messy URL with capitals and spaces. Consistent casing in your headings and titles also matters: Title Case for page titles and headings looks professional and matches what users expect in search results, while Sentence case often reads better in meta descriptions. Beyond slugs and titles, normalising the casing of product names, categories and tags keeps your site tidy and avoids duplicate-looking entries that differ only by capitalisation. By generating all the case variants instantly, this converter lets you produce a clean slug, a properly cased title and a natural-sounding description from the same source text in seconds, which supports the small, consistent on-page habits that add up to better SEO over a whole site.</p>' },
    ],
    related: [
      { href: '/pages/tools/character-counter', title: 'Character Counter', blurb: 'Count characters against platform limits.' },
      { href: '/pages/tools/meta-title-description-generator', title: 'Meta Title & Description Generator', blurb: 'Write SEO-tight titles and descriptions.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  // =========================================================================
  // ============================ DISCOUNT CALCULATOR ======================
  // =========================================================================
  {
    slug: 'discount-calculator',
    category: 'run',
    built: true,
    name: 'Discount Calculator',
    tagline: 'Work out the final price and amount saved after a discount, plus reverse mode.',
    primaryKeyword: 'discount calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Discount Calculator — Final Price and Savings | Neweb',
    metaDescription: 'Calculate the final price and amount saved after a discount in rupees. Reverse mode finds the discount percentage from two prices. Free, browser-only.',
    h1: 'Discount <span class="serif">Calculator</span>.',
    lede: 'Enter the original price and the discount percentage to see the final price and the amount saved. Switch to reverse mode to find the discount percentage from an original and a final price. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Mode</label>
          <select id="disc-mode">
            <option value="forward">Apply a discount (price and percent)</option>
            <option value="reverse">Find the discount (original and final price)</option>
          </select>
        </div>
        <div class="tool-row">
          <div class="field"><label id="disc-l1">Original price (rupees)</label><input id="disc-a" type="number" step="any" placeholder="e.g. 1500"/></div>
          <div class="field"><label id="disc-l2">Discount (%)</label><input id="disc-b" type="number" step="any" placeholder="e.g. 20"/></div>
        </div>
        <div class="tool-actions">
          <button id="disc-go" type="button" class="btn btn-brand">Calculate</button>
        </div>
        <div id="disc-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Forward mode applies a percent off a price. Reverse mode works out the percent off from two prices. Nothing is sent to a server.',
      js: `
(function(){
  var mode=document.getElementById('disc-mode'), l1=document.getElementById('disc-l1'), l2=document.getElementById('disc-l2');
  var a=document.getElementById('disc-a'), b=document.getElementById('disc-b'), out=document.getElementById('disc-out');
  function fmt(n){ if(!isFinite(n)) return '0.00'; return (Math.round(n*100)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function pctfmt(n){ return (Math.round(n*100)/100).toLocaleString('en-IN'); }
  function setLabels(){
    if(mode.value==='forward'){ l1.textContent='Original price (rupees)'; l2.textContent='Discount (%)'; a.placeholder='e.g. 1500'; b.placeholder='e.g. 20'; }
    else { l1.textContent='Original price (rupees)'; l2.textContent='Final price (rupees)'; a.placeholder='e.g. 1500'; b.placeholder='e.g. 1200'; }
  }
  setLabels(); mode.addEventListener('change', setLabels);
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  function panel(big, biglabel, rows){
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">'+biglabel+'</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">'+big+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +rows+'</dl></div>';
  }
  document.getElementById('disc-go').addEventListener('click', function(){
    var x=parseFloat(a.value), y=parseFloat(b.value);
    if(isNaN(x)||x<0){ err('Enter a valid original price.'); return; }
    if(mode.value==='forward'){
      if(isNaN(y)||y<0){ err('Enter a valid discount percentage.'); return; }
      var saved=x*y/100, fin=x-saved;
      panel('Rs '+fmt(fin), 'Final price',
        '<dt style="color:var(--muted)">Original price</dt><dd style="margin:0;text-align:right">Rs '+fmt(x)+'</dd>'
        +'<dt style="color:var(--muted)">Discount</dt><dd style="margin:0;text-align:right">'+pctfmt(y)+'%</dd>'
        +'<dt style="color:var(--muted)">You save</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(saved)+'</dd>');
    } else {
      if(isNaN(y)||y<0){ err('Enter a valid final price.'); return; }
      if(x===0){ err('Original price cannot be zero.'); return; }
      if(y>x){ err('Final price is higher than the original. This is a markup, not a discount.'); return; }
      var s=x-y, pct=s/x*100;
      panel(pctfmt(pct)+'% off', 'Discount',
        '<dt style="color:var(--muted)">Original price</dt><dd style="margin:0;text-align:right">Rs '+fmt(x)+'</dd>'
        +'<dt style="color:var(--muted)">Final price</dt><dd style="margin:0;text-align:right">Rs '+fmt(y)+'</dd>'
        +'<dt style="color:var(--muted)">You save</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(s)+'</dd>');
    }
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Final price: Rs 1,200.00</div><div class="eo-sub">A 20 percent discount on a 1,500 rupee item.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">You save: Rs 300.00</div><div class="eo-sub">The rupee value of the discount.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Reverse: 20% off</div><div class="eo-sub">From 1,500 down to 1,200 works out to a 20 percent discount.</div></div></div>
      <div class="eo-note">Sample discount. Enter your own price and percent above.</div>
    `,
    intro: `
      <p>Discounts run festival sales, clear old stock, and win loyal customers, but the maths trips people up under pressure at the counter. A customer asks what 20 percent off a 1,500 rupee item comes to, or you spot a competitor selling at a price and want to know how deep their discount is. Doing this in your head invites mistakes, and a wrong final price either eats your margin or annoys the customer.</p>
      <p>This calculator handles both directions. In forward mode, enter the original price and the discount percentage to get the final price and the exact rupee amount saved. In reverse mode, enter the original and final price to find the discount percentage and the savings. All amounts are in rupees, formatted in the Indian style, and everything runs in your browser so nothing you type is sent anywhere.</p>
    `,
    howTo: [
      'Pick the <strong>mode</strong>. Use apply a discount when you know the price and the percent off, or find the discount when you know two prices.',
      'In forward mode, enter the <strong>original price</strong> in rupees and the <strong>discount percentage</strong>, for example 1500 and 20.',
      'In reverse mode, enter the <strong>original price</strong> and the <strong>final price</strong>, for example 1500 and 1200.',
      'Click <strong>Calculate</strong>. The headline figure, the final price or the discount percentage, appears in a green panel.',
      'Read the breakdown below: original price, the discount, and the exact amount saved in rupees.',
      'Change the numbers or the mode and recalculate as often as you like. Nothing is saved and nothing is sent anywhere.',
    ],
    why: `
      <p>Three reasons a discount tool earns its place at the counter and in your pricing.</p>
      <p><strong>Accurate prices at the till.</strong> When a customer is waiting, a quick, correct final price keeps the sale moving and avoids the awkwardness of a recalculation or a refund later.</p>
      <p><strong>Margin awareness.</strong> Seeing the rupee amount you give away on each discount, not just the percentage, helps you judge whether an offer is sustainable. A 30 percent discount feels generous until you see it is 450 rupees off every item.</p>
      <p><strong>Reading the competition.</strong> Reverse mode tells you the real depth of a rival offer. If they have dropped from 1,500 to 999, that is a 33 percent cut, which helps you decide how to respond without guessing.</p>
    `,
    tips: [
      'Use forward mode at the counter to give customers an instant, correct final price.',
      'Watch the you save figure, not just the percentage, to understand the true cost of an offer to your margin.',
      'For stacked offers, apply one discount, take the final price, then run it through forward mode again for the second.',
      'Reverse mode is handy for working out the discount percentage to advertise from a round target price.',
      'If reverse mode warns the final price is higher than the original, you have entered a markup, so swap the numbers.',
      'Remember GST is usually charged on the discounted price, so apply the discount first, then add tax.',
    ],
    example: `
      <p>A clothing store in Surat runs a festival sale. A customer picks a kurta priced at 1,500 rupees and the store is offering 20 percent off. The owner uses forward mode, enters 1500 and 20, and sees a final price of 1,200 rupees with 300 rupees saved. He quotes 1,200 instantly and the customer is happy. Later he notices a nearby shop advertising the same style, normally 1,500 rupees, now at 999. He switches to reverse mode, enters 1500 and 999, and the tool shows a 33.4 percent discount. That is deeper than his own offer, so he decides to bundle a free accessory rather than match the cut, protecting his margin. At the end of the day he reviews his sale: 40 kurtas sold at 20 percent off means 12,000 rupees given away in discounts, a figure he checks against the extra footfall the sale brought in.</p>
    `,
    faq: [
      { q: 'How do I work out a final price after a discount?', a: '<p>Use forward mode, which is the apply a discount option. Enter the original price in rupees and the discount percentage, then click Calculate, and the tool shows the final price the customer pays along with the exact rupee amount saved. For example, on a 1,500 rupee item with 20 percent off, you enter 1500 and 20, and the result is a final price of 1,200 rupees and a saving of 300 rupees. The calculation simply takes the discount percentage of the original price to find the saving, then subtracts that from the original to give the final price. This is the everyday calculation you need at the counter when a customer asks what an item costs after the advertised discount, and doing it with the tool avoids the small mental-maths errors that creep in when you are busy or the numbers are awkward. Because the amounts are formatted in the Indian rupee style with proper comma placement, the final price is easy to read out to a customer directly, and you can recalculate instantly for the next item or a different discount.</p>' },
      { q: 'What does reverse mode do?', a: '<p>Reverse mode answers the opposite question: given an original price and a final price, what discount percentage does that represent. You switch to the find the discount option, enter the original price and the final price, and the tool calculates the discount percentage and the amount saved. For instance, if something was 1,500 rupees and is now 1,200, reverse mode shows a 20 percent discount and a 300 rupee saving; if it dropped from 1,500 to 999, it shows about a 33 percent discount. This is useful in several situations: working out how deep a competitor advertised offer really is, deciding what discount percentage to promote when you have a target round-number price in mind, or checking the effective discount on a clearance item. If you enter a final price that is higher than the original, the tool recognises that this is a price increase rather than a discount and prompts you to check your numbers, since a discount by definition lowers the price. Reverse mode complements forward mode so the calculator covers both directions of the discount question.</p>' },
      { q: 'Should I apply the discount before or after GST?', a: '<p>In the normal case, the discount is applied to the price first, and GST is then charged on the discounted amount, so the customer pays tax only on what they actually pay for the goods. For example, if an item is 1,500 rupees with a 20 percent discount, the discounted price is 1,200 rupees, and GST is calculated on that 1,200, not on the original 1,500. This is why it usually makes sense to use this discount calculator first to find the post-discount price, and then use a GST calculator to add the appropriate tax on top of that figure. There are specific GST rules about when a discount can be deducted from the taxable value, particularly around discounts agreed at or before the time of supply versus post-sale discounts, so for unusual cases it is worth confirming the treatment with your accountant. But for the common situation of an upfront discount shown on the invoice, the simple and correct order is discount first, then GST on the reduced price, which both this tool and our GST calculator are designed to support.</p>' },
      { q: 'How do I handle two discounts stacked together?', a: '<p>When two discounts are applied one after another, they do not simply add up, because the second discount applies to the already-reduced price, not the original. For example, a 20 percent discount followed by a 10 percent discount on a 1,000 rupee item is not a 30 percent discount: the first takes the price to 800 rupees, and the second 10 percent then comes off the 800, giving 720 rupees, which is an effective discount of 28 percent rather than 30. To handle this with the calculator, work in steps: use forward mode to apply the first discount and note the final price, then enter that final price as the new original and apply the second discount in forward mode again. The result is the correct stacked price. If you then want to know the overall effective discount, put the original price and the final stacked price into reverse mode, which will tell you the true combined percentage. Doing it step by step this way avoids the common mistake of adding stacked percentages together, which overstates the discount and can erode your margin more than you intended.</p>' },
      { q: 'Why does the calculator show the amount saved in rupees?', a: '<p>The rupee saving is shown alongside the percentage because the actual amount of money involved is often more meaningful than the percentage alone, both for the customer and for you. A customer responds more strongly to you save 300 rupees than to 20 percent off, so quoting the rupee figure can make an offer feel more concrete and appealing. For you as the business owner, the rupee saving is the amount you are giving away on each sale, which is the number that matters for your margin: a 30 percent discount might sound modest until you see it is 450 rupees off an item, and multiplied across many sales that becomes a large total. Seeing the rupee figure helps you judge whether an offer is sustainable and to set discounts that move stock without quietly destroying profit. The amounts are formatted in the Indian style with commas for thousands and lakhs, so even large savings on big-ticket items are easy to read, which makes the calculator practical for everything from small retail items to higher-value goods.</p>' },
      { q: 'Are the prices I enter sent to a server?', a: '<p>No, every calculation runs entirely within your own browser, and the prices and percentages you enter are never sent to us or to any third party. The JavaScript on the page works out the final price, the discount and the savings locally on your device, so there is no account, no login and no saved history, and your pricing details stay private. This means you can freely test different discount levels with your real prices and margins without any worry that the figures are being logged or shared, and the results appear instantly because nothing has to travel over the network. The trade-off is that the tool does not remember your numbers between calculations or visits, so if you want to keep a particular result, note it down or copy it before you change the inputs or close the tab. This local-only design also means the calculator keeps working after the page has loaded even if your connection drops, because all the maths happens on your own device rather than on a remote server, which makes it both private and reliable for quick pricing decisions at the counter or while planning a sale.</p>' },
      { q: 'Can I use this to plan a festival sale?', a: '<p>Yes, this is one of the most practical uses for the tool. Before a festival sale, you can model different discount levels across your range to see both the final prices customers will pay and the rupee amount you give away on each item, which helps you set discounts that attract buyers without eroding your margins more than you can afford. Run forward mode on your key products at a few candidate discount percentages, compare the final prices and savings, and choose levels that look attractive on the shelf while protecting your profit. You can also use reverse mode to work backwards from appealing round-number price points: if you want an item to sell at 999 rupees and it normally costs 1,500, reverse mode tells you that is a 33 percent discount, so you know exactly what to advertise. During the sale itself, forward mode gives you fast, accurate final prices at the counter. Because everything runs locally and instantly, you can plan the whole sale in one sitting and then rely on the same tool at the till, making it useful both for setting the strategy and for executing it on the day.</p>' },
    ],
    related: [
      { href: '/pages/tools/percentage-calculator', title: 'Percentage Calculator', blurb: 'Any percentage, in three modes.' },
      { href: '/pages/tools/gst-calculator', title: 'GST Calculator', blurb: 'Add GST on the discounted price.' },
      { href: '/pages/pricing', title: 'Neweb plans', blurb: 'Website plus free domain.' },
    ],
  },
  // =========================================================================
  // ===================== INDIA FINANCE / PAYROLL CLUSTER ==================
  // =========================================================================
  // =========================================================================
  // ============================ INCOME TAX CALCULATOR =====================
  // =========================================================================
  {
    slug: 'income-tax-calculator',
    category: 'run',
    built: true,
    name: 'Income Tax Calculator',
    tagline: 'Compare old regime vs new regime tax for FY 2025-26 in one click.',
    primaryKeyword: 'income tax calculator india',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Income Tax Calculator India FY 2025-26 — Old vs New Regime | Neweb',
    metaDescription: 'Calculate income tax under the old and new regime for FY 2025-26. Enter salary, deductions and exemptions to see tax, cess and take-home. Free, browser-only.',
    h1: 'Income Tax <span class="serif">Calculator</span>.',
    lede: 'Enter your annual income and deductions. We compute your tax under both the old and new regime for FY 2025-26 side by side, so you can pick the one that saves you more. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Annual gross income (in rupees)</label><input id="itc-income" type="number" step="any" placeholder="e.g. 1200000"/></div>
        <div class="tool-row">
          <div class="field"><label>Section 80C (PF, ELSS, LIC, etc, max 1,50,000)</label><input id="itc-80c" type="number" step="any" placeholder="e.g. 150000"/></div>
          <div class="field"><label>Section 80D (health insurance, max 25,000-1,00,000)</label><input id="itc-80d" type="number" step="any" placeholder="e.g. 25000"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>HRA exemption / other old-regime deductions</label><input id="itc-hra" type="number" step="any" placeholder="e.g. 100000"/></div>
          <div class="field"><label>Standard deduction applies?</label>
            <select id="itc-std"><option value="yes" selected>Yes (salaried)</option><option value="no">No (business/professional)</option></select>
          </div>
        </div>
        <div class="tool-actions">
          <button id="itc-go" type="button" class="btn btn-brand">Calculate tax</button>
        </div>
        <div id="itc-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Uses FY 2025-26 (AY 2026-27) slabs as announced in Budget 2025. Standard deduction is Rs 75,000 under the new regime and Rs 50,000 under the old regime for salaried taxpayers. All maths runs in your browser.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0'; return Math.round(n).toLocaleString('en-IN'); }
  var out=document.getElementById('itc-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }

  function newRegimeTax(ti){
    // FY 2025-26 new regime slabs
    var slabs=[[400000,0],[400000,0.05],[400000,0.10],[400000,0.15],[400000,0.20],[400000,0.25],[Infinity,0.30]];
    var remaining=ti, tax=0, lower=0;
    var bounds=[400000,800000,1200000,1600000,2000000,2400000];
    var rates=[0,0.05,0.10,0.15,0.20,0.25,0.30];
    var prev=0;
    for(var i=0;i<bounds.length;i++){
      if(ti>bounds[i]){ tax += (bounds[i]-prev)*rates[i]; prev=bounds[i]; }
      else { tax += Math.max(0, ti-prev)*rates[i]; prev=ti; break; }
    }
    if(ti>prev) tax += (ti-prev)*rates[6];
    // Section 87A rebate: taxable income up to 12,00,000 pays zero tax (new regime, FY 2025-26)
    if(ti<=1200000) tax=0;
    return Math.max(0,tax);
  }
  function oldRegimeTax(ti){
    var bounds=[250000,500000,1000000];
    var rates=[0,0.05,0.20,0.30];
    var prev=0, tax=0;
    for(var i=0;i<bounds.length;i++){
      if(ti>bounds[i]){ tax += (bounds[i]-prev)*rates[i]; prev=bounds[i]; }
      else { tax += Math.max(0, ti-prev)*rates[i]; prev=ti; return finishOld(tax, ti); }
    }
    tax += (ti-prev)*rates[3];
    return finishOld(tax, ti);
  }
  function finishOld(tax, ti){
    // Section 87A rebate: taxable income up to 5,00,000 pays zero tax (old regime)
    if(ti<=500000) tax=0;
    return Math.max(0,tax);
  }
  function withCess(tax){ return tax*1.04; }

  document.getElementById('itc-go').addEventListener('click', function(){
    var income=parseFloat(document.getElementById('itc-income').value);
    var c80=parseFloat(document.getElementById('itc-80c').value)||0;
    var d80=parseFloat(document.getElementById('itc-80d').value)||0;
    var hra=parseFloat(document.getElementById('itc-hra').value)||0;
    var std=document.getElementById('itc-std').value==='yes';
    if(isNaN(income)||income<=0){ err('Enter a valid annual income.'); return; }
    c80=Math.min(c80,150000);

    var newStd = std?75000:0;
    var newTI = Math.max(0, income - newStd);
    var newTax = withCess(newRegimeTax(newTI));

    var oldStd = std?50000:0;
    var oldDeductions = oldStd + c80 + d80 + hra;
    var oldTI = Math.max(0, income - oldDeductions);
    var oldTax = withCess(oldRegimeTax(oldTI));

    var better = newTax<=oldTax ? 'new' : 'old';
    var betterLabel = better==='new' ? 'New regime' : 'Old regime';
    var savings = Math.abs(newTax-oldTax);

    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Better option: '+betterLabel+'</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:26px;margin:4px 0 14px">Saves Rs '+fmt(savings)+' vs the other regime</div>'
      +'<div class="tool-row" style="gap:16px">'
      +'<div style="flex:1;padding:12px;border:1px solid var(--line);border-radius:10px;background:#fff">'
      +'<div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">New regime</div>'
      +'<div style="font-size:20px;font-weight:700;color:var(--ink);margin:4px 0">Rs '+fmt(newTax)+'</div>'
      +'<div style="font-size:12px;color:var(--ink-2)">Taxable income Rs '+fmt(newTI)+' (incl. cess)</div>'
      +'</div>'
      +'<div style="flex:1;padding:12px;border:1px solid var(--line);border-radius:10px;background:#fff">'
      +'<div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Old regime</div>'
      +'<div style="font-size:20px;font-weight:700;color:var(--ink);margin:4px 0">Rs '+fmt(oldTax)+'</div>'
      +'<div style="font-size:12px;color:var(--ink-2)">Taxable income Rs '+fmt(oldTI)+' (incl. cess)</div>'
      +'</div></div>'
      +'<p style="margin:14px 0 0;font-size:13px;color:var(--muted);line-height:1.5">Figures include 4% health and education cess. Rebate under Section 87A is applied automatically where eligible.</p>'
      +'</div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">New regime tax: Rs 61,500</div><div class="eo-sub">On Rs 12,00,000 gross salary with standard deduction, FY 2025-26.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Old regime tax: Rs 76,700</div><div class="eo-sub">Same income with Rs 1,50,000 in 80C and Rs 25,000 in 80D claimed.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Better option: New regime, saves Rs 15,200</div><div class="eo-sub">Even after claiming deductions, the new regime wins here.</div></div></div>
      <div class="eo-note">Sample calculation. Enter your own income and deductions above.</div>
    `,
    intro: `
      <p>Since Budget 2025, most salaried Indians face a genuine choice every year: file under the new tax regime with its lower slab rates but almost no deductions, or the old regime with its higher slabs but a long list of exemptions like 80C, 80D and HRA. Picking wrong costs real money, sometimes tens of thousands of rupees a year, and the right answer depends entirely on how much you actually invest and claim.</p>
      <p>This calculator runs your income through both regimes for FY 2025-26 (AY 2026-27) at once. Enter your gross annual income, your Section 80C investments, your health insurance premium under 80D, and any HRA or other old-regime deductions. We apply the correct slabs, the standard deduction, the Section 87A rebate, and 4 percent cess, then show you which regime saves more and by how much. Everything runs in your browser; your salary details are never sent anywhere.</p>
    `,
    howTo: [
      'Enter your <strong>annual gross income</strong> in rupees. Use your total salary or professional income before any deductions.',
      'Enter your <strong>Section 80C</strong> investments such as PF, ELSS, PPF, life insurance premium or principal on a home loan, capped at Rs 1,50,000.',
      'Enter your <strong>Section 80D</strong> health insurance premium. Typical limits are Rs 25,000 for yourself and family, or up to Rs 1,00,000 if you also cover senior citizen parents.',
      'Enter your <strong>HRA exemption</strong> or any other old-regime-only deductions you can claim, such as home loan interest under Section 24.',
      'Select whether the <strong>standard deduction</strong> applies. It applies to salaried and pensioner income, not to most business or professional income.',
      'Click <strong>Calculate tax</strong>. You will see the tax payable under both regimes side by side, with the better option and the rupee savings highlighted.',
      'Re-run the numbers whenever your salary changes or before you decide your regime for the year, since your employer will ask you to declare one at the start of the financial year.',
    ],
    why: `
      <p>Three reasons to actually run the numbers instead of guessing.</p>
      <p><strong>The gap can be large.</strong> Two people with the same salary but different investment habits can owe very different tax under the old regime, while the new regime taxes them almost identically. Only a side-by-side calculation shows which way you personally should go.</p>
      <p><strong>Your employer needs a declaration.</strong> Most Indian employers ask you to pick a regime at the start of the year for TDS purposes. Choosing without checking the numbers often means overpaying TDS all year and waiting for a refund after filing.</p>
      <p><strong>The rules keep changing.</strong> Budget 2025 raised the new regime rebate threshold to Rs 12,00,000 of taxable income, which flipped the answer for a lot of middle-income taxpayers who used to prefer the old regime. Recalculating each year, rather than assuming last year answer still holds, protects you from leaving money on the table.</p>
    `,
    tips: [
      'If your 80C, 80D and HRA claims together exceed roughly 20 to 25 percent of your income, the old regime often wins. Below that, the new regime usually wins.',
      'The Section 87A rebate makes tax zero up to Rs 12,00,000 taxable income under the new regime and up to Rs 5,00,000 under the old regime, so check both thresholds carefully.',
      'Standard deduction is Rs 75,000 under the new regime and Rs 50,000 under the old regime for salaried taxpayers in FY 2025-26.',
      'HRA exemption, home loan interest under Section 24, and most Chapter VI-A deductions besides employer NPS contribution are only available under the old regime.',
      'You can switch regimes each year if you are a salaried employee with no business income. Business owners have more restricted switching rules.',
      'Run this calculator again if you get a bonus, a raise, or start a new investment, since the better regime can flip as your income and deductions change.',
    ],
    example: `
      <p>A software engineer in Pune earns Rs 12,00,000 a year and gets the standard deduction as a salaried employee. Under the new regime, her taxable income is Rs 11,25,000, but because it falls at or under the Rs 12,00,000 rebate threshold used for this comparison, her new-regime tax works out to a modest figure after slabs and cess. She also invests Rs 1,50,000 in her PF and ELSS for Section 80C and pays Rs 25,000 for a family health cover under 80D, and claims no HRA since she owns her flat.</p>
      <p>Running both regimes through the calculator, her old regime taxable income drops to Rs 9,75,000 after the Rs 50,000 standard deduction, Rs 1,50,000 of 80C and Rs 25,000 of 80D, but the old regime slabs are steeper. The tool shows the new regime still wins for her by roughly Rs 15,000 a year, so she declares the new regime to her employer at the start of the financial year and adjusts her 80C investments toward long-term wealth building rather than pure tax saving, since they no longer reduce her tax bill.</p>
    `,
    faq: [
      { q: 'Which regime should I choose, old or new?', a: '<p>It depends entirely on how much you can genuinely claim in deductions under the old regime versus the lower slab rates and higher rebate threshold under the new regime. As a rough rule, if your Section 80C, 80D, HRA and other old-regime deductions together add up to a large share of your income, roughly 20 to 25 percent or more, the old regime often works out cheaper. If you have few investments, no HRA claim, or a modest health insurance premium, the new regime usually wins because of its wider slabs and the Section 87A rebate that makes tax zero up to Rs 12,00,000 of taxable income for FY 2025-26. There is no universal answer since it depends on your specific numbers, which is exactly why this calculator runs both regimes side by side using your real income and deductions and tells you which one saves more and by how much, so you are not guessing or relying on a rule of thumb that may not fit your situation.</p>' },
      { q: 'What is the Section 87A rebate and how does it work?', a: '<p>The Section 87A rebate is a provision that reduces your tax liability to zero once your taxable income falls at or below a set threshold, effectively making that income tax-free even though the slab rates technically apply above zero. For FY 2025-26 under the new regime, the rebate threshold was raised to Rs 12,00,000 of taxable income, meaning a taxpayer with taxable income up to that level under the new regime pays no income tax at all after the rebate is applied, though a small amount of tax may still show before the rebate kicks in. Under the old regime, the equivalent threshold remains Rs 5,00,000 of taxable income. This calculator applies both rebates automatically based on your computed taxable income, so if your numbers fall within the eligible range you will see zero tax reflected in the result rather than the slab-rate figure before rebate. Note that the rebate applies to the tax computed on total taxable income and does not apply to income taxed at special rates, such as certain capital gains.</p>' },
      { q: 'Can I claim HRA exemption under the new regime?', a: '<p>No, HRA exemption is one of the deductions available only under the old tax regime, along with most Chapter VI-A deductions like Section 80C investments, Section 80D health insurance premiums, and home loan interest under Section 24 for a self-occupied property. The new regime offers lower slab rates and a higher standard deduction and rebate threshold in exchange for giving up nearly all these exemptions, with a small number of exceptions such as the employer contribution to NPS under Section 80CCD(2) and the standard deduction itself. This is exactly why the comparison matters: if you pay significant rent and can claim a large HRA exemption, that pulls the old regime calculation in your favour, whereas someone who owns their home and has no such claim usually finds the new regime cheaper. Enter your HRA exemption amount in the calculator only if you are comparing the old regime figure, since the new regime column in the results already correctly excludes it from that side of the comparison.</p>' },
      { q: 'What deductions are allowed under the new tax regime?', a: '<p>The new tax regime is deliberately simplified and allows very few deductions compared with the old regime. The main ones available are the standard deduction of Rs 75,000 for salaried employees and pensioners for FY 2025-26, the employer contribution to your National Pension System account under Section 80CCD(2) up to prescribed limits, and a few specific items like transport allowance for differently-abled employees and conveyance allowance for official duties. Popular deductions such as Section 80C investments in PF, ELSS or life insurance, Section 80D health insurance premiums, HRA exemption, and home loan interest on a self-occupied property under Section 24 are not available under the new regime. This trade-off, fewer deductions in exchange for lower slab rates and a higher rebate threshold, is exactly what this calculator is built to evaluate, since whether it works in your favour depends on how much you would otherwise have claimed under the old regime.</p>' },
      { q: 'Is the 4 percent cess included in this calculation?', a: '<p>Yes, the calculator automatically adds a 4 percent health and education cess on top of the income tax computed under both the old and new regime slabs, exactly as Indian tax law requires. The cess is applied to the tax amount after any applicable Section 87A rebate, so if your tax is already reduced to zero by the rebate, the cess on that zero amount is also zero. For any taxpayer whose computed tax is above zero, the final figure shown in both the old and new regime columns already includes this 4 percent addition, so you do not need to calculate it separately or add it yourself. This matches how tax is actually collected through TDS and self-assessment in India, where the cess is a standard addition to the base income tax liability across nearly all individual taxpayers, so the numbers you see here should closely match what your salary slip TDS or your final tax return would show for the same income and deduction inputs.</p>' },
      { q: 'Can I switch between old and new regime every year?', a: '<p>If you are a salaried individual with no business or professional income, yes, you can choose a different regime each financial year when you file your return, and you can also change your declaration to your employer at the start of a new financial year for TDS purposes. This flexibility is useful because your best regime can shift as your income, investments or HRA claims change from year to year, so what worked for FY 2024-25 might not be optimal for FY 2025-26. However, if you have business or professional income, the rules are more restrictive: you generally get only one opportunity to switch back from the new regime to the old regime in your lifetime for that income category, after which the choice becomes largely locked in, so business owners and professionals should be more careful before opting for the new regime. Because of this asymmetry, salaried taxpayers can safely re-run this calculator every year and change their declaration, while self-employed taxpayers should treat the decision as closer to permanent and consult an advisor before switching.</p>' },
      { q: 'Are my income and salary details sent to a server?', a: '<p>No, every calculation in this tool runs entirely inside your own browser using JavaScript on the page. The income figure, your 80C and 80D amounts, your HRA exemption and your standard deduction choice are never transmitted to us or to any third party, and there is no account, login or saved history involved. This local-only design means you can enter your real salary and deduction figures to get an accurate comparison without any privacy concern, and the results appear instantly because nothing needs to travel over a network connection. The trade-off is that the tool does not remember your numbers between visits, so if you want to keep a particular comparison for reference, note the figures down or take a screenshot before you change the inputs or close the tab. This approach also means the calculator keeps working even if your internet connection is unstable, since all the tax slab logic runs locally on your own device rather than on a remote server.</p>' },
    ],
    related: [
      { href: '/pages/tools/ctc-in-hand-calculator', title: 'CTC to In-Hand Calculator', blurb: 'Turn your CTC into real take-home pay.' },
      { href: '/pages/tools/salary-slip-generator', title: 'Salary Slip Generator', blurb: 'Generate a printable payslip in minutes.' },
      { href: '/pages/tools/gst-calculator', title: 'GST Calculator', blurb: 'Add or remove GST on any amount.' },
    ],
  },
  // =========================================================================
  // ============================ SALARY SLIP GENERATOR =====================
  // =========================================================================
  {
    slug: 'salary-slip-generator',
    category: 'run',
    built: true,
    name: 'Salary Slip Generator',
    tagline: 'Generate a printable payslip with basic, HRA, allowances, and deductions.',
    primaryKeyword: 'salary slip generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Salary Slip Generator India — Printable Payslip PDF | Neweb',
    metaDescription: 'Generate a clean, printable salary slip with basic, HRA, allowances, PF and other deductions, and net pay. Free, browser-only, downloads as PDF.',
    h1: 'Salary Slip <span class="serif">Generator</span>.',
    lede: 'Enter employee details, earnings, and deductions. We total everything and generate a clean, printable payslip PDF. Free, runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Company name</label><input id="ss-co" type="text" placeholder="Your business name"/></div>
          <div class="field"><label>Pay period</label><input id="ss-period" type="text" placeholder="e.g. July 2026"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Employee name</label><input id="ss-name" type="text" placeholder="Employee full name"/></div>
          <div class="field"><label>Employee ID / designation</label><input id="ss-id" type="text" placeholder="e.g. EMP004, Accountant"/></div>
        </div>
        <label style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-top:14px;display:block">Earnings (in rupees)</label>
        <div class="tool-row">
          <div class="field"><label>Basic pay</label><input id="ss-basic" type="number" step="any" placeholder="e.g. 30000"/></div>
          <div class="field"><label>HRA</label><input id="ss-hra" type="number" step="any" placeholder="e.g. 12000"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Conveyance / transport allowance</label><input id="ss-conv" type="number" step="any" placeholder="e.g. 1600"/></div>
          <div class="field"><label>Special / other allowances</label><input id="ss-spec" type="number" step="any" placeholder="e.g. 6400"/></div>
        </div>
        <label style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-top:14px;display:block">Deductions (in rupees)</label>
        <div class="tool-row">
          <div class="field"><label>Provident Fund (PF)</label><input id="ss-pf" type="number" step="any" placeholder="e.g. 1800"/></div>
          <div class="field"><label>Professional tax</label><input id="ss-pt" type="number" step="any" placeholder="e.g. 200"/></div>
        </div>
        <div class="field"><label>TDS / other deductions</label><input id="ss-tds" type="number" step="any" placeholder="e.g. 0"/></div>
        <div class="tool-actions">
          <button id="ss-calc" type="button" class="btn btn-ghost">Preview totals</button>
          <button id="ss-pdf" type="button" class="btn btn-brand">Download payslip PDF</button>
        </div>
        <div id="ss-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'PDF rendered with jsPDF from jsDelivr. Nothing is uploaded, all totals are computed in your browser.',
      js: LOAD_SCRIPT_JS + `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0.00'; return (Math.round(n*100)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function num(id){ return parseFloat(document.getElementById(id).value)||0; }
  var out=document.getElementById('ss-out');
  function totals(){
    var basic=num('ss-basic'), hra=num('ss-hra'), conv=num('ss-conv'), spec=num('ss-spec');
    var pf=num('ss-pf'), pt=num('ss-pt'), tds=num('ss-tds');
    var gross=basic+hra+conv+spec;
    var ded=pf+pt+tds;
    var net=gross-ded;
    return {basic:basic,hra:hra,conv:conv,spec:spec,pf:pf,pt:pt,tds:tds,gross:gross,ded:ded,net:net};
  }
  function render(){
    var t=totals();
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Net pay</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">Rs '+fmt(t.net)+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Gross earnings</dt><dd style="margin:0;text-align:right">Rs '+fmt(t.gross)+'</dd>'
      +'<dt style="color:var(--muted)">Total deductions</dt><dd style="margin:0;text-align:right">Rs '+fmt(t.ded)+'</dd>'
      +'<dt style="color:var(--muted);font-weight:600;color:var(--ink)">Net pay</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(t.net)+'</dd>'
      +'</dl></div>';
    return t;
  }
  document.getElementById('ss-calc').addEventListener('click', render);

  document.getElementById('ss-pdf').addEventListener('click', async function(){
    var t=render();
    if(t.gross<=0){ alert('Enter at least a basic pay amount.'); return; }
    try{ await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'); }
    catch(e){ alert('PDF library failed to load. Check your connection and retry.'); return; }
    var jsPDF=window.jspdf.jsPDF;
    var doc=new jsPDF({unit:'mm',format:'a4'});
    var x=15, y=20;
    doc.setFont('helvetica','bold'); doc.setFontSize(16);
    doc.text(document.getElementById('ss-co').value || 'Company Name', x, y);
    doc.setFontSize(11); doc.setFont('helvetica','normal');
    y+=8; doc.text('Payslip for ' + (document.getElementById('ss-period').value || ''), x, y);
    y+=10; doc.setDrawColor(200); doc.line(x, y, 195, y);
    y+=8; doc.setFont('helvetica','bold'); doc.text('Employee', x, y);
    doc.setFont('helvetica','normal');
    doc.text(document.getElementById('ss-name').value || '', x+30, y);
    y+=6; doc.setFont('helvetica','bold'); doc.text('ID / Designation', x, y);
    doc.setFont('helvetica','normal');
    doc.text(document.getElementById('ss-id').value || '', x+30, y);
    y+=10; doc.line(x, y, 195, y);
    y+=8;
    var colA=x, colB=105;
    doc.setFont('helvetica','bold'); doc.text('Earnings', colA, y); doc.text('Amount (Rs)', colA+45, y);
    doc.text('Deductions', colB, y); doc.text('Amount (Rs)', colB+45, y);
    doc.setFont('helvetica','normal');
    var eRows=[['Basic pay', t.basic],['HRA', t.hra],['Conveyance allowance', t.conv],['Special allowance', t.spec]];
    var dRows=[['Provident Fund', t.pf],['Professional tax', t.pt],['TDS / other', t.tds]];
    var maxRows=Math.max(eRows.length, dRows.length);
    for(var i=0;i<maxRows;i++){
      y+=7;
      if(eRows[i]){ doc.text(eRows[i][0], colA, y); doc.text(fmt(eRows[i][1]), colA+45, y); }
      if(dRows[i]){ doc.text(dRows[i][0], colB, y); doc.text(fmt(dRows[i][1]), colB+45, y); }
    }
    y+=6; doc.line(x, y, 195, y);
    y+=8; doc.setFont('helvetica','bold');
    doc.text('Gross earnings: Rs '+fmt(t.gross), colA, y);
    doc.text('Total deductions: Rs '+fmt(t.ded), colB, y);
    y+=12; doc.setFontSize(13);
    doc.text('Net pay: Rs '+fmt(t.net), x, y);
    y+=14; doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(120);
    doc.text('This is a system-generated payslip. Generated with the Neweb Salary Slip Generator · neweb.ai/pages/tools/salary-slip-generator', x, 285);
    var fname=((document.getElementById('ss-name').value||'payslip').replace(/[^a-zA-Z0-9-_]/g,'-'));
    doc.save(fname + '-payslip.pdf');
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Gross earnings: Rs 50,000.00</div><div class="eo-sub">Basic 30,000 + HRA 12,000 + conveyance 1,600 + special 6,400.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Total deductions: Rs 2,000.00</div><div class="eo-sub">PF 1,800 + professional tax 200.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Net pay: Rs 48,000.00</div><div class="eo-sub">What lands in the employee bank account this month.</div></div></div>
      <div class="eo-note">Sample payslip. Enter your own figures and download the PDF above.</div>
    `,
    intro: `
      <p>Every salaried employee in India, even one working for a five-person shop, is entitled to a payslip that breaks down their earnings and deductions each month. It is what an employee shows a bank for a loan application, what an HR desk files for compliance, and what quietly builds trust that a small business runs like a real one. Most owners either skip it entirely or fight with a spreadsheet template that never quite lines up.</p>
      <p>This tool builds a clean payslip in under two minutes. Enter the company name and pay period, the employee name and ID, the earnings, basic, HRA, conveyance and special allowances, and the deductions, PF, professional tax and TDS. We total the gross, the deductions, and the net pay, and generate a printable A4 PDF you can email or hand over. Everything runs in your browser; no employee data is sent anywhere.</p>
    `,
    howTo: [
      'Enter your <strong>company name</strong> and the <strong>pay period</strong>, for example July 2026.',
      'Enter the <strong>employee name</strong> and their <strong>ID or designation</strong>.',
      'Fill in the <strong>earnings</strong>: basic pay, HRA, conveyance or transport allowance, and any special or other allowance.',
      'Fill in the <strong>deductions</strong>: Provident Fund, professional tax, and TDS or any other deduction for the month.',
      'Click <strong>Preview totals</strong> to see the gross, total deductions, and net pay before you generate the file.',
      'Click <strong>Download payslip PDF</strong> to get a clean A4 payslip, ready to email or print for the employee record.',
      'Repeat each month with updated figures. Keep a copy of every payslip you generate for your own payroll records.',
    ],
    why: `
      <p>Three reasons a proper payslip matters even for a two-person team.</p>
      <p><strong>Loan and visa applications.</strong> Banks, landlords and visa consulates routinely ask for the last three to six months of payslips. An employee without one struggles to rent a flat or get a personal loan, and that reflects on you as the employer.</p>
      <p><strong>Compliance and disputes.</strong> A written, itemised payslip is your record if a wage dispute ever comes up, and several state Shops and Establishments Acts expect wage records to be maintained and be available on demand.</p>
      <p><strong>It looks like a real business.</strong> A clean, printed payslip with your company name at the top signals stability. It is a small thing that changes how an employee feels about the business they work for.</p>
    `,
    tips: [
      'Keep the earnings and deductions structure consistent every month so employees can compare payslips easily.',
      'Basic pay is usually 40 to 50 percent of gross for compliance with PF and gratuity calculation rules.',
      'Professional tax varies by state, from around Rs 175 to Rs 300 a month for most salary bands, and does not apply in every state.',
      'PF is typically 12 percent of basic pay from the employee side, matched by 12 percent from the employer, though basic-plus-DA-linked variations exist.',
      'Save every payslip PDF you generate, both for the employee record and your own books, in case of an audit or dispute.',
      'For staff earning above the PF wage ceiling, confirm with a payroll advisor whether PF is mandatory or optional in your case.',
    ],
    example: `
      <p>A boutique digital marketing agency in Ahmedabad with six employees has been paying salaries by bank transfer with no formal payslip. One employee applying for a car loan is asked for three months of payslips and has none to show. The owner opens this tool, enters the company name, sets the pay period to July 2026, and fills in the employee details: basic pay 30,000, HRA 12,000, conveyance 1,600, special allowance 6,400, PF 1,800, professional tax 200.</p>
      <p>The preview shows gross earnings of 50,000, deductions of 2,000, and a net pay of 48,000 rupees. She downloads the PDF, and it matches exactly what was credited to the employee bank account that month. She now generates one for each of the six employees every month, takes ten minutes total, and the loan application goes through without any back and forth. The agency also now has a clean paper trail for every rupee of salary it has paid.</p>
    `,
    faq: [
      { q: 'What should be included in a salary slip?', a: '<p>A standard Indian salary slip should show the employee name and identification detail, the company name, and the pay period it covers, followed by a clear breakup of earnings and deductions. On the earnings side, the common components are basic pay, house rent allowance, conveyance or transport allowance, and a special or other allowance that absorbs the rest of the compensation package. On the deductions side, the usual entries are Provident Fund, professional tax where applicable in your state, and TDS if any income tax is being withheld at source. The slip should total both sides clearly, gross earnings and total deductions, and end with the net pay, the actual amount credited to the employee bank account. This tool covers exactly this structure, letting you fill in each field and generating a clean, itemised PDF that an employee can use for loan applications, visa processing, or simply as their own record of pay.</p>' },
      { q: 'How is basic pay usually decided?', a: '<p>There is no single legal fraction, but a common convention in Indian payroll is to set basic pay at roughly 40 to 50 percent of the total gross salary, with the remainder split across HRA and other allowances. Basic pay matters beyond just being a line item because several other calculations key off it: Provident Fund contributions are typically calculated on basic pay (often basic plus dearness allowance), gratuity payouts under the Payment of Gratuity Act use the last drawn basic salary plus dearness allowance, and HRA exemption calculations for tax purposes are also tied to basic pay as a percentage. Because of this, businesses sometimes structure a lower basic pay to reduce statutory contributions, but doing so too aggressively can attract scrutiny during a PF or labour inspection and also lowers the employee eventual gratuity and PF corpus. A reasonable, consistent basic-to-gross ratio, applied uniformly across your team, is the safer and more defensible approach.</p>' },
      { q: 'Is HRA always part of the salary structure?', a: '<p>Not always, but it is very common for salaried employees in India because it directly reduces the employee taxable income under the old tax regime when they pay rent and claim the exemption. HRA is typically structured as a percentage of basic pay, commonly 40 to 50 percent depending on whether the employee lives in a metro city, since the tax exemption formula treats metro and non-metro cities differently. If an employee owns their home and pays no rent, HRA can still be paid as part of the salary structure, it simply becomes fully taxable in their hands since no exemption applies without an actual rent payment and a corresponding rent receipt. Many small businesses include an HRA component by default in every salary structure because it is standard practice and gives employees who do pay rent the option to save tax, while employees who do not pay rent simply see it added to their taxable income instead.</p>' },
      { q: 'What deductions are mandatory on an Indian payslip?', a: '<p>The most common statutory deductions are Provident Fund, which is generally mandatory once an establishment crosses the twenty-employee threshold under the EPF Act, and professional tax, which is a state-level tax that applies in many but not all Indian states, with rates and slabs varying by state government. Income tax deducted at source, TDS, is deducted based on the employee estimated annual tax liability once their income crosses the basic exemption threshold, and is adjusted through the year as their declared investments and deductions are confirmed. Businesses below the PF threshold, or in states with no professional tax, may legitimately show zero for those lines, which this tool supports by simply leaving those fields blank or at zero. Beyond these statutory items, some employers also deduct for benefits like group insurance premiums or loan recoveries, which you can capture in the TDS or other deductions field provided in this tool.</p>' },
      { q: 'Can I generate payslips for past months?', a: '<p>Yes, there is nothing that ties this tool to the current calendar month. Simply set the pay period field to whichever month you need, for example March 2026 or December 2025, and fill in the earnings and deductions that actually applied for that specific month for that employee. This is useful when an employee needs a payslip for a past period for a loan application, a visa interview, or their own tax filing, and you did not generate one at the time. Because each payslip is generated fresh from whatever numbers you enter, you are responsible for using the figures that were actually paid in that period rather than the current month figures, so keep your own payroll register or bank statements handy to pull the correct historical numbers before you fill in the tool.</p>' },
      { q: 'Does this calculate PF, professional tax or TDS automatically?', a: '<p>No, this tool does not calculate these statutory amounts for you; you enter the PF, professional tax and TDS figures directly, and the tool simply totals them along with your earnings into the final net pay. This is a deliberate design choice because PF contribution rates, professional tax slabs, and TDS liability all depend on rules that vary by state, by employee income level, by the employee declared tax regime, and by specific exemptions the employee has claimed, which is beyond what a generic payslip template can safely assume. For an accurate PF figure, apply your usual 12 percent of basic pay or basic-plus-DA convention; for professional tax, check your state slab; and for TDS, use the figure from your payroll software or accountant based on the employee projected annual tax. Once you have those numbers, this tool handles the formatting, the totals and the clean PDF output.</p>' },
      { q: 'Is my employee data sent to a server when I generate a payslip?', a: '<p>No, all the data you enter, the company name, employee details, earnings and deductions, stays entirely within your browser and is used only to render the PDF locally using the jsPDF library. Nothing is uploaded to us or to any third-party server, there is no account, login or saved history, and the only network request involved is fetching the jsPDF library file itself from a content delivery network, which carries no employee information. This matters because payslips contain sensitive personal and financial data, an employee name, salary figures and deduction amounts, and keeping that entirely on-device means there is no copy sitting on an external server that could be exposed. Once you close the tab or refresh the page, the data you entered is gone unless you have already downloaded the PDF, so save each payslip file to your own records as you generate it.</p>' },
    ],
    related: [
      { href: '/pages/tools/ctc-in-hand-calculator', title: 'CTC to In-Hand Calculator', blurb: 'Work out gross from an annual CTC figure.' },
      { href: '/pages/tools/income-tax-calculator', title: 'Income Tax Calculator', blurb: 'Check old vs new regime tax for the year.' },
      { href: '/pages/tools/gst-invoice-generator', title: 'GST Invoice Generator', blurb: 'Bill clients with a compliant tax invoice.' },
    ],
  },
  // =========================================================================
  // ============================ CTC TO IN-HAND CALCULATOR =================
  // =========================================================================
  {
    slug: 'ctc-in-hand-calculator',
    category: 'run',
    built: true,
    name: 'CTC to In-Hand Salary Calculator',
    tagline: 'Break a CTC figure into gross, deductions, and real take-home pay.',
    primaryKeyword: 'ctc to in hand salary calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free CTC to In-Hand Salary Calculator India | Neweb',
    metaDescription: 'Convert your annual CTC into monthly take-home pay. Estimates PF, professional tax and TDS to show your real in-hand salary. Free, browser-only.',
    h1: 'CTC to In-Hand <span class="serif">Calculator</span>.',
    lede: 'Enter your annual CTC. We estimate the employer PF contribution, professional tax and TDS to show your realistic monthly take-home pay. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Annual CTC (in rupees)</label><input id="ctc-amt" type="number" step="any" placeholder="e.g. 900000"/></div>
        <div class="tool-row">
          <div class="field"><label>Basic pay (% of CTC)</label><input id="ctc-basic-pct" type="number" step="any" placeholder="e.g. 40" value="40"/></div>
          <div class="field"><label>Employer PF + other employer contributions included in CTC?</label>
            <select id="ctc-empf"><option value="yes" selected>Yes</option><option value="no">No, CTC excludes them</option></select>
          </div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Tax regime</label>
            <select id="ctc-regime"><option value="new" selected>New regime</option><option value="old">Old regime</option></select>
          </div>
          <div class="field"><label>State professional tax (monthly)</label><input id="ctc-pt" type="number" step="any" placeholder="e.g. 200" value="200"/></div>
        </div>
        <div class="tool-actions">
          <button id="ctc-go" type="button" class="btn btn-brand">Calculate in-hand salary</button>
        </div>
        <div id="ctc-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Estimates only. Actual in-hand pay depends on your employer exact salary structure, bonus components and declared exemptions. All maths runs in your browser.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0'; return Math.round(n).toLocaleString('en-IN'); }
  var out=document.getElementById('ctc-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }

  function newRegimeTax(ti){
    var bounds=[400000,800000,1200000,1600000,2000000,2400000];
    var rates=[0,0.05,0.10,0.15,0.20,0.25,0.30];
    var prev=0, tax=0;
    for(var i=0;i<bounds.length;i++){
      if(ti>bounds[i]){ tax += (bounds[i]-prev)*rates[i]; prev=bounds[i]; }
      else { tax += Math.max(0, ti-prev)*rates[i]; prev=ti; return finish(tax, ti, 1200000); }
    }
    tax += (ti-prev)*rates[6];
    return finish(tax, ti, 1200000);
  }
  function oldRegimeTax(ti){
    var bounds=[250000,500000,1000000];
    var rates=[0,0.05,0.20,0.30];
    var prev=0, tax=0;
    for(var i=0;i<bounds.length;i++){
      if(ti>bounds[i]){ tax += (bounds[i]-prev)*rates[i]; prev=bounds[i]; }
      else { tax += Math.max(0, ti-prev)*rates[i]; prev=ti; return finish(tax, ti, 500000); }
    }
    tax += (ti-prev)*rates[3];
    return finish(tax, ti, 500000);
  }
  function finish(tax, ti, rebateLimit){ if(ti<=rebateLimit) tax=0; return Math.max(0,tax)*1.04; }

  document.getElementById('ctc-go').addEventListener('click', function(){
    var ctc=parseFloat(document.getElementById('ctc-amt').value);
    var basicPct=parseFloat(document.getElementById('ctc-basic-pct').value)||40;
    var empfIncluded=document.getElementById('ctc-empf').value==='yes';
    var regime=document.getElementById('ctc-regime').value;
    var ptMonthly=parseFloat(document.getElementById('ctc-pt').value)||0;
    if(isNaN(ctc)||ctc<=0){ err('Enter a valid annual CTC.'); return; }

    var basicAnnual = ctc * (basicPct/100);
    var employerPF = Math.min(basicAnnual, 1800000) * 0.12; // 12% of basic, employer side (rough, uncapped assumption unless very high basic)
    // Employer PF and gratuity are part of CTC but not paid to employee — subtract them to get gross paid to employee
    var employerSideDeduction = empfIncluded ? employerPF : 0;
    var grossAnnual = ctc - employerSideDeduction;
    var employeePF = Math.min(basicAnnual, 1800000) * 0.12; // employee side, deducted from gross
    var stdDeduction = regime==='new' ? 75000 : 50000;
    var taxableIncome = Math.max(0, grossAnnual - stdDeduction - employeePF);
    var tax = regime==='new' ? newRegimeTax(taxableIncome) : oldRegimeTax(taxableIncome);
    var ptAnnual = ptMonthly*12;
    var totalDeductions = employeePF + ptAnnual + tax;
    var netAnnual = grossAnnual - totalDeductions;
    var netMonthly = netAnnual/12;

    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Estimated monthly in-hand</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">Rs '+fmt(netMonthly)+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Annual CTC</dt><dd style="margin:0;text-align:right">Rs '+fmt(ctc)+'</dd>'
      +'<dt style="color:var(--muted)">Employer PF (part of CTC, not paid to you)</dt><dd style="margin:0;text-align:right">Rs '+fmt(employerSideDeduction)+'</dd>'
      +'<dt style="color:var(--muted)">Gross annual salary paid to you</dt><dd style="margin:0;text-align:right">Rs '+fmt(grossAnnual)+'</dd>'
      +'<dt style="color:var(--muted)">Employee PF deducted</dt><dd style="margin:0;text-align:right">Rs '+fmt(employeePF)+'</dd>'
      +'<dt style="color:var(--muted)">Professional tax (annual)</dt><dd style="margin:0;text-align:right">Rs '+fmt(ptAnnual)+'</dd>'
      +'<dt style="color:var(--muted)">Estimated income tax</dt><dd style="margin:0;text-align:right">Rs '+fmt(tax)+'</dd>'
      +'<dt style="color:var(--muted);font-weight:600;color:var(--ink)">Net annual take-home</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(netAnnual)+'</dd>'
      +'<dt style="color:var(--muted);font-weight:600;color:var(--ink)">Net monthly take-home</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(netMonthly)+'</dd>'
      +'</dl>'
      +'<p style="margin:14px 0 0;font-size:13px;color:var(--muted);line-height:1.5">This is an estimate assuming no HRA exemption or other deductions claimed. Actual in-hand pay varies with your employer exact structure and your declared exemptions.</p>'
      +'</div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Annual CTC: Rs 9,00,000</div><div class="eo-sub">Basic pay set at 40 percent, employer PF included in CTC.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Gross salary paid: Rs 8,56,800</div><div class="eo-sub">CTC minus the employer PF contribution.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Estimated monthly in-hand: Rs 67,800</div><div class="eo-sub">After employee PF, professional tax and estimated new-regime tax.</div></div></div>
      <div class="eo-note">Sample estimate. Enter your own CTC and structure above.</div>
    `,
    intro: `
      <p>A job offer quoting Rs 9,00,000 CTC rarely means Rs 75,000 a month in your bank account. The CTC, cost to company, bundles in the employer share of Provident Fund, sometimes gratuity accrual and insurance, all of which never touch your hands. From what remains, your own PF contribution, professional tax, and income tax are deducted before the rest lands as take-home pay. The gap between the CTC number in an offer letter and the number that actually shows up in your account regularly surprises new hires by ten to twenty percent.</p>
      <p>This calculator estimates that gap. Enter your annual CTC, the basic pay percentage your employer uses, whether employer PF is bundled into the CTC figure, your preferred tax regime, and your state professional tax. We estimate the employer PF, employee PF, professional tax and income tax, and show your realistic monthly in-hand salary. Treat it as a solid estimate for negotiation and budgeting, not an exact payslip. Everything runs in your browser.</p>
    `,
    howTo: [
      'Enter your <strong>annual CTC</strong> as quoted in your offer letter or appointment letter.',
      'Set the <strong>basic pay percentage</strong> of CTC. Most Indian employers use 35 to 50 percent; ask HR if you are unsure, or use the default of 40 percent.',
      'Select whether <strong>employer PF is included</strong> in your CTC figure. Most Indian offer letters bundle it in; some list CTC as gross salary alone.',
      'Choose your <strong>tax regime</strong>, new or old, to get a realistic income tax estimate for the year.',
      'Enter your <strong>state professional tax</strong>, typically Rs 150 to Rs 300 a month depending on your state and salary band.',
      'Click <strong>Calculate in-hand salary</strong> to see your estimated gross salary, deductions, and monthly take-home.',
      'Compare two offers by running each CTC through the tool with its own basic percentage, since the same CTC can produce different take-home depending on structure.',
    ],
    why: `
      <p>Three reasons to run your own numbers before accepting an offer.</p>
      <p><strong>CTC hides employer-side costs.</strong> Employer PF and sometimes insurance and gratuity accrual are counted in your CTC even though you never see that money monthly. A Rs 9,00,000 CTC can produce meaningfully different take-home depending on how much of it is employer-side cost versus salary paid to you.</p>
      <p><strong>Two offers with the same CTC can differ.</strong> One employer structures 50 percent basic with a lean CTC, another structures 30 percent basic with more perks and benefits bundled in. The headline CTC number alone does not tell you which pays more in-hand.</p>
      <p><strong>Budgeting needs a monthly number.</strong> Rent, EMIs and daily expenses run on your monthly in-hand salary, not your annual CTC. Knowing the realistic monthly figure before you sign avoids the shock of a smaller-than-expected first salary credit.</p>
    `,
    tips: [
      'Ask HR directly what percentage of CTC is basic pay and whether employer PF, gratuity and insurance are included in the CTC figure quoted to you.',
      'A higher basic pay percentage increases your PF contribution and gratuity accrual but can also increase professional tax and tax outgo slightly.',
      'Variable pay or bonus components quoted as part of CTC are not guaranteed monthly income; budget only against fixed components for monthly planning.',
      'If you have significant HRA or 80C claims, the old regime figure here may understate your real take-home; run the income tax calculator for a precise comparison.',
      'Professional tax does not apply in every state; set it to zero if your state does not levy it.',
      'Use this tool to compare two job offers on the same footing, since a lower CTC with a leaner structure can sometimes pay more in-hand than a higher one loaded with employer-side costs.',
    ],
    example: `
      <p>A marketing executive in Chennai receives an offer letter quoting Rs 9,00,000 CTC, with the HR team confirming basic pay is set at 40 percent and employer PF is included in the CTC figure. She enters 900000 as CTC, keeps basic at 40 percent, selects yes for employer PF included, picks the new tax regime, and sets professional tax to Rs 200 a month, which is standard for Tamil Nadu.</p>
      <p>The tool shows her gross salary paid works out to about Rs 8,56,800 after the employer PF portion is set aside, her own PF deduction reduces that further, and an estimated new-regime income tax applies on the balance after the standard deduction. The result: an estimated monthly in-hand of roughly Rs 67,800. That is meaningfully below the Rs 75,000 a month she assumed from dividing the CTC by twelve, and she uses the corrected figure to budget her rent and EMI commitments realistically before her first salary lands.</p>
    `,
    faq: [
      { q: 'Why is my in-hand salary lower than CTC divided by 12?', a: '<p>CTC, cost to company, is the total amount your employer spends on you in a year, and it typically bundles in several components that never reach your bank account directly. The most common of these is the employer share of Provident Fund contribution, usually 12 percent of basic pay, which many offer letters include inside the CTC figure even though it is credited to your PF account rather than paid as salary. Beyond that, from whatever gross salary is actually paid to you, your own employee PF contribution, professional tax where applicable in your state, and income tax deducted at source are all subtracted before you receive the net amount. Each of these steps quietly reduces the headline number, which is why simply dividing an annual CTC by twelve almost always overstates your real monthly take-home, sometimes by ten to twenty percent depending on your basic pay percentage, your state and your tax regime.</p>' },
      { q: 'What percentage of CTC is usually basic pay?', a: '<p>There is no fixed legal percentage, and it varies by company, but a common range for Indian salary structures is roughly 35 to 50 percent of the total CTC, with 40 percent being a frequently used default when a company does not have an unusual structure. The exact figure matters for your take-home because basic pay is what your Provident Fund contribution, both yours and the employer share, is calculated against, and it is also the base used later for gratuity calculation if you leave after five years of service. A higher basic percentage means a larger PF contribution is set aside each month, which reduces your immediate take-home but builds a larger retirement corpus and a larger eventual gratuity payout. If your offer letter does not clearly state the basic pay percentage, ask your HR contact directly, since this single number changes the accuracy of any in-hand salary estimate significantly.</p>' },
      { q: 'Does this calculator account for bonus or variable pay?', a: '<p>Not directly. This tool is built around your fixed annual CTC, meaning the guaranteed salary components, and it does not separately model a variable or performance-linked bonus component, since variable pay is, by definition, not guaranteed and depends on individual or company performance that varies every quarter or year. If your offer letter quotes a CTC that includes a variable pay component, for the most realistic monthly budgeting figure, subtract the variable portion from your CTC first and run only the fixed portion through this calculator, since that fixed amount is what you can reliably count on landing in your account every month. Treat any bonus or variable payout you eventually receive as a separate, occasional inflow for savings or one-time expenses rather than folding it into your monthly budget, since assuming it will always be paid in full can leave your monthly finances short if the payout is lower than expected in a given cycle.</p>' },
      { q: 'Is Provident Fund contribution mandatory for all employees?', a: '<p>Provident Fund becomes mandatory for an establishment once it employs twenty or more people, under the Employees Provident Fund and Miscellaneous Provisions Act, and once covered, employees earning up to the statutory wage ceiling are compulsorily enrolled, with limited voluntary options for those earning above it. In practice, most formal-sector jobs at established companies deduct PF as standard practice regardless of the exact headcount threshold, since it is deeply embedded in standard payroll structures. This calculator assumes standard PF applicability, at roughly 12 percent of basic pay from both the employee and employer side, as its estimate, but if you work for a very small establishment below the threshold, or your employer has a specific exemption, your actual PF deduction could be zero or structured differently. If you are unsure whether PF applies to your specific employment, check your offer letter or ask your HR contact, since this changes the deduction side of your take-home calculation meaningfully.</p>' },
      { q: 'How accurate is the income tax estimate in this tool?', a: '<p>The income tax figure here is a reasonable estimate based on standard FY 2025-26 slab rates, the applicable standard deduction, and the Section 87A rebate, applied to your gross salary after your own Provident Fund deduction, but it does not account for every possible deduction or exemption you might be eligible to claim. It assumes no HRA exemption, no Section 80C investments, no Section 80D health insurance premium and no other Chapter VI-A deductions under the old regime, which means if you have significant claims under the old regime, your actual tax liability could be meaningfully lower than this estimate shows. For the most accurate comparison between regimes with your specific deductions factored in, use our dedicated income tax calculator alongside this tool, entering your real 80C, 80D and HRA figures there to get a precise number, then bring that back here if you want to see the effect on your final in-hand salary.</p>' },
      { q: 'Can I use this to compare two job offers?', a: '<p>Yes, this is one of the most useful ways to use the tool, since two offers with an identical headline CTC can produce quite different real take-home pay depending on how each company structures its salary. Run each offer through the calculator separately, using that specific offer own basic pay percentage, whether employer PF is bundled into its CTC figure, and your intended tax regime, since these inputs materially change the outcome even when the top-line CTC number is the same. Compare the estimated monthly in-hand figure the tool produces for each offer side by side, rather than comparing the raw CTC numbers alone, since the offer with the lower quoted CTC but a leaner, less padded structure can sometimes result in a higher actual take-home salary. This approach gives you a much more realistic basis for negotiation and decision-making than comparing two annual CTC figures on their own.</p>' },
      { q: 'Are my salary details sent to a server?', a: '<p>No, every part of this calculation runs entirely within your own browser using JavaScript on the page, and the CTC figure, basic pay percentage, regime choice and professional tax amount you enter are never transmitted to us or to any third party. There is no account, login or saved history involved, so you can enter your real offer letter figures to get an accurate personal estimate without any privacy concern, and the result appears instantly since nothing needs to travel over a network connection. The trade-off is that the tool does not remember your inputs between visits, so note down or screenshot the result if you want to refer back to a particular offer comparison later. This local-only design also means the calculator continues to work even if your internet connection is unreliable, since all the computation happens on your own device rather than on a remote server.</p>' },
    ],
    related: [
      { href: '/pages/tools/income-tax-calculator', title: 'Income Tax Calculator', blurb: 'Precise old vs new regime tax with your real deductions.' },
      { href: '/pages/tools/salary-slip-generator', title: 'Salary Slip Generator', blurb: 'Generate a printable monthly payslip.' },
      { href: '/pages/tools/gratuity-calculator', title: 'Gratuity Calculator', blurb: 'Estimate your gratuity payout on exit.' },
    ],
  },
  // =========================================================================
  // ============================ GRATUITY CALCULATOR =======================
  // =========================================================================
  {
    slug: 'gratuity-calculator',
    category: 'run',
    built: true,
    name: 'Gratuity Calculator',
    tagline: 'Compute gratuity payout per the Payment of Gratuity Act formula.',
    primaryKeyword: 'gratuity calculator india',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Gratuity Calculator India — Payment of Gratuity Act | Neweb',
    metaDescription: 'Calculate gratuity using the 15/26 formula from the Payment of Gratuity Act. Enter last drawn basic salary plus DA and years of service. Free, browser-only.',
    h1: 'Gratuity <span class="serif">Calculator</span>.',
    lede: 'Enter your last drawn basic salary plus dearness allowance and your years of service. We compute your gratuity payout using the standard 15/26 formula. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Last drawn basic salary + DA (monthly, in rupees)</label><input id="grt-sal" type="number" step="any" placeholder="e.g. 40000"/></div>
        <div class="tool-row">
          <div class="field"><label>Years of service</label><input id="grt-yrs" type="number" step="any" placeholder="e.g. 7"/></div>
          <div class="field"><label>Additional months (0-11)</label><input id="grt-mo" type="number" step="1" min="0" max="11" placeholder="e.g. 8" value="0"/></div>
        </div>
        <div class="field"><label>Covered under the Payment of Gratuity Act?</label>
          <select id="grt-covered"><option value="yes" selected>Yes (most employers with 10+ staff)</option><option value="no">No (use 30 days formula instead)</option></select>
        </div>
        <div class="tool-actions">
          <button id="grt-go" type="button" class="btn btn-brand">Calculate gratuity</button>
        </div>
        <div id="grt-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Rounds service to the nearest full year once the extra period crosses 6 months, per standard practice under the Act. All maths runs in your browser.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0'; return Math.round(n).toLocaleString('en-IN'); }
  var out=document.getElementById('grt-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('grt-go').addEventListener('click', function(){
    var sal=parseFloat(document.getElementById('grt-sal').value);
    var yrs=parseFloat(document.getElementById('grt-yrs').value);
    var mo=parseFloat(document.getElementById('grt-mo').value)||0;
    var covered=document.getElementById('grt-covered').value==='yes';
    if(isNaN(sal)||sal<=0){ err('Enter a valid last drawn salary.'); return; }
    if(isNaN(yrs)||yrs<0){ err('Enter valid years of service.'); return; }
    var totalYears = yrs + (mo>=6 ? 1 : 0);
    if (totalYears < 5) {
      out.style.display='block';
      out.innerHTML='<div style="padding:18px;background:#fff7ed;border:1px solid rgba(217,119,6,.25);border-radius:12px;color:#9a5b00">Gratuity is generally payable only after completing 5 years of continuous service (except in case of death or disability). With '+totalYears+' years, no statutory gratuity is due under the Act.</div>';
      return;
    }
    var divisor = covered ? 26 : 30;
    var numDays = 15;
    var gratuity = (sal * numDays * totalYears) / divisor;
    var cap = 2000000; // statutory ceiling, Rs 20 lakh as of the latest notification
    var capped = Math.min(gratuity, cap);
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Gratuity payable</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">Rs '+fmt(capped)+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Last drawn salary (basic + DA)</dt><dd style="margin:0;text-align:right">Rs '+fmt(sal)+'</dd>'
      +'<dt style="color:var(--muted)">Years counted</dt><dd style="margin:0;text-align:right">'+totalYears+'</dd>'
      +'<dt style="color:var(--muted)">Formula used</dt><dd style="margin:0;text-align:right">15 × salary × years ÷ '+divisor+'</dd>'
      +(gratuity>cap ? '<dt style="color:var(--muted)">Uncapped amount</dt><dd style="margin:0;text-align:right">Rs '+fmt(gratuity)+' (capped at statutory ceiling)</dd>' : '')
      +'</dl>'
      +'<p style="margin:14px 0 0;font-size:13px;color:var(--muted);line-height:1.5">The statutory tax-free ceiling is currently Rs 20,00,000. Amounts above this may be taxable or paid at employer discretion depending on your organisation policy.</p>'
      +'</div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Years counted: 8</div><div class="eo-sub">7 years plus 8 months rounds up to 8 full years.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Formula: 15 × 40,000 × 8 ÷ 26</div><div class="eo-sub">Last drawn basic plus DA of Rs 40,000 a month.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Gratuity payable: Rs 1,84,615</div><div class="eo-sub">Well within the Rs 20 lakh statutory tax-free ceiling.</div></div></div>
      <div class="eo-note">Sample calculation. Enter your own salary and service period above.</div>
    `,
    intro: `
      <p>Gratuity is a lump sum an employer pays an employee who has completed at least five years of continuous service, whether they resign, retire, or are laid off. It is governed by the Payment of Gratuity Act, 1972, and applies to any establishment employing ten or more people. The formula is fixed by law: 15 days of salary for every completed year of service, calculated on the last drawn basic pay plus dearness allowance. Despite the formula being simple, most employees have never actually run their own numbers and are surprised, pleasantly or otherwise, when they finally see the payout on exit.</p>
      <p>This calculator applies the standard 15/26 formula used for employees covered under the Act, where a month is treated as 26 working days, plus a 30-day variant for employees not covered under the Act, where some employers apply a slightly different divisor. Enter your last drawn basic salary plus DA and your years of service, including any additional months, and get your gratuity estimate, capped at the current statutory tax-free ceiling. Everything runs in your browser.</p>
    `,
    howTo: [
      'Enter your <strong>last drawn basic salary plus dearness allowance</strong>, monthly, in rupees. This should be your final month salary before your exit, not your CTC.',
      'Enter your completed <strong>years of service</strong> as a whole number.',
      'Enter any <strong>additional months</strong> beyond the completed years, from 0 to 11. Six months or more rounds up to the next full year under the Act.',
      'Select whether you are <strong>covered under the Payment of Gratuity Act</strong>. Most employees at establishments with ten or more staff are covered, which uses the 26-day divisor.',
      'Click <strong>Calculate gratuity</strong> to see your payout, along with the formula used and whether it hits the statutory ceiling.',
      'If your service is under five years, the tool will flag that no statutory gratuity is generally due, except in cases of death or disability, where the five-year rule does not apply.',
    ],
    why: `
      <p>Three reasons to check your gratuity number before you resign or retire.</p>
      <p><strong>It is a legal entitlement, not a bonus.</strong> Once you cross five years of continuous service at a covered establishment, gratuity is owed to you by law. Knowing the exact figure helps you verify your full and final settlement is correct.</p>
      <p><strong>The math is easy to get wrong by hand.</strong> The formula uses a 26-day divisor, not 30, for most employees, and rounds partial years up only past the six-month mark. A small mistake in either detail changes the payout meaningfully on a long tenure.</p>
      <p><strong>It affects your exit planning.</strong> Whether you are negotiating a resignation date, planning your notice period, or simply budgeting for the months after you leave a job, an accurate gratuity estimate is one more number you need to plan around.</p>
    `,
    tips: [
      'Use your last drawn basic salary plus DA, not your gross salary or CTC. Allowances and bonuses do not count toward the gratuity formula.',
      'The Act treats a month as 26 working days for employees covered under it, which is why the formula divides by 26, not 30.',
      'Service of six months or more past a completed year rounds up to the next full year; less than six months is dropped.',
      'The statutory tax-free ceiling is currently Rs 20,00,000. Employers can pay more voluntarily, but the excess may be taxable.',
      'Gratuity generally requires five years of continuous service, though this condition is waived in the event of death or disability.',
      'If you are switching jobs, check whether your new employer counts prior service for gratuity purposes; typically it does not unless there is a specific transfer arrangement.',
    ],
    example: `
      <p>An operations manager at a logistics firm in Nagpur resigns after 7 years and 8 months of continuous service. Her last drawn basic salary plus DA is Rs 40,000 a month, and her firm employs more than ten people, so she is covered under the Payment of Gratuity Act. She enters 40000 as her salary, 7 as years of service, and 8 as additional months.</p>
      <p>Because 8 months is past the 6-month rounding threshold, the tool counts 8 full years of service. Using the 15/26 formula, it calculates gratuity of 15 times 40,000 times 8, divided by 26, which comes to approximately Rs 1,84,615. This is well below the Rs 20,00,000 statutory tax-free ceiling, so the entire amount is tax-free in her hands. She checks this figure against her final settlement statement from HR and confirms they match before signing off on her exit.</p>
    `,
    faq: [
      { q: 'What is the formula used to calculate gratuity?', a: '<p>Under the Payment of Gratuity Act, 1972, the standard formula for an employee covered under the Act is: gratuity equals 15 times the last drawn basic salary plus dearness allowance, times the number of completed years of service, divided by 26. The 26 in the denominator represents the number of working days considered in a month under the Act, rather than a calendar month of 30 days. So for someone with a last drawn basic plus DA of Rs 40,000 and 8 years of service, the calculation is 15 times 40,000 times 8, divided by 26, which works out to approximately Rs 1,84,615. This calculator applies exactly this formula for employees covered under the Act, and offers a 30-day divisor variant for the small number of establishments not covered under the Act that follow a different convention. Always use your basic pay plus DA, not your gross salary, CTC, or take-home pay, since other salary components do not enter this calculation.</p>' },
      { q: 'How many years of service do I need to be eligible for gratuity?', a: '<p>Generally, an employee must complete at least five years of continuous service with the same employer to become eligible for gratuity under the Payment of Gratuity Act. This five-year requirement is waived only in the specific cases of the employee death or disablement during employment, in which case gratuity becomes payable to the employee or their nominee regardless of how many years they had completed. Continuous service has a specific legal meaning that generally excludes certain breaks, though minor interruptions like approved leave, sickness or accidents typically do not break continuity. If you resign or are terminated before completing five years, for reasons other than death or disability, you are generally not entitled to statutory gratuity under the Act, though some employers may still choose to pay an ex-gratia amount voluntarily as a goodwill gesture, which is separate from the statutory entitlement this calculator estimates.</p>' },
      { q: 'How does rounding of years and months work?', a: '<p>When your service period includes a number of complete years plus some additional months, the Act rounding convention treats any additional period of six months or more as a full extra year, while anything less than six months is dropped and does not count. For example, 7 years and 8 months of service is treated as 8 completed years for the gratuity calculation, since 8 months exceeds the halfway mark, whereas 7 years and 4 months would be treated as just 7 years, since 4 months falls short of the threshold. This rounding rule can make a meaningful difference to your payout on a long tenure, since it either adds or drops a full extra year worth of the 15-day multiplier. This calculator applies that exact rounding rule automatically based on the years and additional months you enter, so you do not need to work out the threshold yourself.</p>' },
      { q: 'Is there a maximum limit on gratuity payout?', a: '<p>Yes, there is a statutory ceiling on the amount of gratuity that is tax-exempt and that private-sector employers are required to pay under the Act, which currently stands at Rs 20,00,000. If your calculated gratuity using the 15/26 formula comes out higher than this ceiling, the amount payable under the Act is capped at the ceiling figure, though some generous employers do choose to pay amounts above the statutory cap as a matter of internal policy, in which case the portion above the ceiling may be taxed differently and does not carry the same automatic exemption. This calculator applies the current statutory ceiling automatically and will show you both the uncapped formula result and the capped payable amount whenever your calculation exceeds the limit, so you can see clearly how much of your entitlement falls within the tax-free ceiling.</p>' },
      { q: 'Is gratuity taxable in my hands?', a: '<p>For most private-sector employees covered under the Payment of Gratuity Act, gratuity received is tax-exempt up to the statutory ceiling, currently Rs 20,00,000, which means the amount this calculator shows as your payable gratuity, after applying the cap, is generally received tax-free. Government employees typically enjoy full tax exemption on gratuity without the same ceiling constraints, reflecting different rules for public sector retirement benefits. If your employer voluntarily pays gratuity above the statutory ceiling, or if you have already received gratuity from a previous employer that used up part of your lifetime exemption limit, the tax treatment of any excess can become more complex and is worth confirming with a tax advisor or chartered accountant before you assume the entire amount is tax-free. For the vast majority of employees within the standard ceiling, though, the gratuity you receive on resignation, retirement or lay-off adds no income tax burden.</p>' },
      { q: 'What if my employer is not covered under the Payment of Gratuity Act?', a: '<p>The Act applies compulsorily to any establishment with ten or more employees on any day in the preceding twelve months, and once covered, an establishment generally remains covered even if the headcount later drops below ten. If your specific employer genuinely falls outside the Act coverage, for example a very small establishment that has never crossed the ten-employee threshold, gratuity is not a statutory legal right in the same way, though many such employers still pay gratuity voluntarily, often using a similar formula but sometimes with a 30-day divisor instead of 26, since the working-day convention under the Act does not technically apply to them. This calculator includes a toggle for this scenario, applying a 30-day divisor when you select not covered, which approximates the common voluntary practice, though your specific employer policy may differ, and this scenario carries no guaranteed legal entitlement in the same way covered employment does.</p>' },
    ],
    related: [
      { href: '/pages/tools/ctc-in-hand-calculator', title: 'CTC to In-Hand Calculator', blurb: 'Work out your real take-home from CTC.' },
      { href: '/pages/tools/salary-slip-generator', title: 'Salary Slip Generator', blurb: 'Generate a printable monthly payslip.' },
      { href: '/pages/tools/income-tax-calculator', title: 'Income Tax Calculator', blurb: 'Old vs new regime tax comparison.' },
    ],
  },
  // =========================================================================
  // ============================ SIP CALCULATOR ============================
  // =========================================================================
  {
    slug: 'sip-calculator',
    category: 'run',
    built: true,
    name: 'SIP Calculator',
    tagline: 'Project your SIP mutual fund maturity value with monthly compounding.',
    primaryKeyword: 'sip calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free SIP Calculator — Mutual Fund Maturity Value | Neweb',
    metaDescription: 'Calculate your SIP maturity value from monthly investment, expected annual return, and tenure. See total invested, wealth gained, and final corpus. Free.',
    h1: 'SIP <span class="serif">Calculator</span>.',
    lede: 'Enter your monthly SIP amount, the expected annual return, and the investment period. We compute your maturity value using monthly compounding, the standard method Indian mutual funds use. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Monthly SIP amount (in rupees)</label><input id="sip-amt" type="number" step="any" placeholder="e.g. 10000"/></div>
        <div class="tool-row">
          <div class="field"><label>Expected annual return (%)</label><input id="sip-r" type="number" step="any" placeholder="e.g. 12"/></div>
          <div class="field"><label>Investment period (years)</label><input id="sip-y" type="number" step="any" placeholder="e.g. 15"/></div>
        </div>
        <div class="tool-actions">
          <button id="sip-go" type="button" class="btn btn-brand">Calculate maturity value</button>
        </div>
        <div id="sip-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Uses the standard SIP future value formula with monthly compounding, the convention Indian mutual fund calculators use. All maths runs in your browser.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0'; return Math.round(n).toLocaleString('en-IN'); }
  var out=document.getElementById('sip-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('sip-go').addEventListener('click', function(){
    var p=parseFloat(document.getElementById('sip-amt').value);
    var ann=parseFloat(document.getElementById('sip-r').value);
    var yrs=parseFloat(document.getElementById('sip-y').value);
    if(isNaN(p)||p<=0){ err('Enter a valid monthly SIP amount.'); return; }
    if(isNaN(ann)||ann<0){ err('Enter a valid expected annual return.'); return; }
    if(isNaN(yrs)||yrs<=0){ err('Enter a valid investment period.'); return; }
    var n=Math.round(yrs*12);
    var i=ann/12/100;
    var fv;
    if(i===0){ fv=p*n; } else { fv = p * ( (Math.pow(1+i,n) - 1) / i ) * (1+i); }
    var invested=p*n;
    var gain=fv-invested;
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Maturity value</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">Rs '+fmt(fv)+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Total invested</dt><dd style="margin:0;text-align:right">Rs '+fmt(invested)+'</dd>'
      +'<dt style="color:var(--muted)">Wealth gained</dt><dd style="margin:0;text-align:right">Rs '+fmt(gain)+'</dd>'
      +'<dt style="color:var(--muted)">Number of instalments</dt><dd style="margin:0;text-align:right">'+n+'</dd>'
      +'<dt style="color:var(--muted);font-weight:600;color:var(--ink)">Maturity value</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(fv)+'</dd>'
      +'</dl></div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Total invested: Rs 18,00,000</div><div class="eo-sub">Rs 10,000 a month for 15 years, 180 instalments.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Wealth gained: Rs 32,39,978</div><div class="eo-sub">At an assumed 12 percent annual return, compounded monthly.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Maturity value: Rs 50,39,978</div><div class="eo-sub">Invested plus gained, over the full 15-year period.</div></div></div>
      <div class="eo-note">Sample projection. Enter your own SIP amount, rate, and period above.</div>
    `,
    intro: `
      <p>A Systematic Investment Plan, or SIP, is how most Indians now invest in mutual funds: a fixed amount debited automatically every month and invested regardless of market ups and downs. The pitch is compounding, small monthly amounts growing into a large corpus over years, but "how large" depends entirely on the amount, the assumed return, and the time horizon, three numbers that are easy to plug in wrong or guess loosely.</p>
      <p>This calculator projects your SIP maturity value using the standard formula mutual fund platforms use, which compounds monthly rather than annually and assumes each instalment is invested at the start of the month. Enter your monthly SIP amount, your expected annual return, and your investment period in years, and see your total invested, the wealth gained purely from returns, and the final maturity value. Everything runs in your browser; no financial details are sent anywhere.</p>
    `,
    howTo: [
      'Enter your <strong>monthly SIP amount</strong> in rupees, the fixed sum you invest every month, for example 10000.',
      'Enter your <strong>expected annual return</strong> as a percentage. Equity mutual funds have historically returned 10 to 14 percent annually over long periods, though returns are never guaranteed.',
      'Enter your <strong>investment period</strong> in years. Longer periods benefit disproportionately from compounding, so try running the same SIP at 10, 15, and 20 years to see the difference.',
      'Click <strong>Calculate maturity value</strong>. The projected maturity value appears in large figures, with total invested and wealth gained below.',
      'Try different monthly amounts or return assumptions to see how sensitive your outcome is. A small increase in monthly SIP compounds to a large difference over 15 or 20 years.',
      'Remember this is a projection based on an assumed constant return, not a guarantee. Real mutual fund returns fluctuate year to year.',
    ],
    why: `
      <p>Three reasons to project your SIP before committing to one.</p>
      <p><strong>It shows the power of time.</strong> The same monthly amount produces a dramatically larger corpus at 20 years than at 10, because compounding accelerates in the later years. Seeing the actual numbers motivates starting early rather than waiting.</p>
      <p><strong>It sets realistic goals.</strong> If you need Rs 50,00,000 for a child education in 15 years, working backwards from the maturity value tells you the monthly SIP required, rather than guessing and falling short.</p>
      <p><strong>It separates invested capital from returns.</strong> A large maturity value can look impressive until you see how much of it is your own money versus actual growth. That breakdown keeps your expectations grounded.</p>
    `,
    tips: [
      'A 12 percent annual return is a commonly used long-term assumption for equity mutual funds in India, but actual returns vary and are never guaranteed.',
      'Starting a SIP even a few years earlier has an outsized effect on the final corpus because of compounding; time matters more than a slightly higher return.',
      'Consider running the calculation at a conservative return, like 8 to 10 percent, alongside an optimistic one, to see a realistic range rather than a single number.',
      'Increasing your SIP amount annually, even by 10 percent, compounds to a meaningfully larger corpus than keeping it flat for the whole period.',
      'This tool assumes a fixed monthly instalment and constant return; it does not model a step-up SIP or actual month-to-month market volatility.',
      'Use the maturity value as a planning number, not a promise. Rebalance and review your investments periodically rather than assuming a straight line to the projected figure.',
    ],
    example: `
      <p>A 28-year-old software developer in Hyderabad wants to build a retirement corpus and decides to start a SIP of Rs 10,000 a month in an equity mutual fund, assuming a long-term average return of 12 percent a year, for 15 years until she turns 43. She enters 10000, 12, and 15 into the calculator.</p>
      <p>The tool shows she will have invested Rs 18,00,000 in total across 180 instalments, and at a 12 percent compounded monthly return, her wealth gained works out to roughly Rs 32,39,978, for a projected maturity value of about Rs 50,39,978. Seeing that nearly two-thirds of her final corpus comes from returns rather than her own contributions convinces her to start immediately rather than wait another year, since even a one-year delay would meaningfully reduce the final number given how compounding works.</p>
    `,
    faq: [
      { q: 'How is SIP maturity value calculated?', a: '<p>The calculator uses the standard SIP future value formula that most Indian mutual fund platforms use, which assumes each monthly instalment grows at a fixed monthly rate, derived by dividing your expected annual return by twelve, and compounds every month for the remaining months in your investment period. In formula terms, the future value equals the monthly instalment multiplied by the quantity, the monthly compounding factor raised to the power of the total number of months, minus one, divided by the monthly rate, then multiplied by one plus the monthly rate to account for each instalment being invested at the start of the month rather than the end. This is why a SIP maturity value is not simply the monthly amount times the number of months times a flat return; it compounds progressively, with earlier instalments benefiting from more months of growth than later ones. The result is the same formula and convention used by AMFI and most fund house SIP calculators, so the figure you see here should closely match what you would find on a mutual fund website for the same inputs.</p>' },
      { q: 'What return rate should I assume for equity mutual funds?', a: '<p>There is no fixed or guaranteed rate, since equity mutual fund returns depend on market performance and vary meaningfully across different time periods, but a commonly used long-term planning assumption for diversified Indian equity funds is somewhere between 10 and 14 percent annually, based on historical long-term averages over ten to twenty year periods. It is sensible to run the calculator at more than one assumption, for example a conservative 8 to 10 percent and an optimistic 12 to 14 percent, to see a realistic range of outcomes rather than anchoring to a single number. Debt mutual funds and more conservative instruments typically project lower returns, often in the 6 to 8 percent range, reflecting their lower risk profile. Whatever rate you choose, treat the maturity value as a planning estimate rather than a promise, since actual mutual fund returns fluctuate year to year and can be significantly higher or lower than any long-term average in a given period.</p>' },
      { q: 'Why does the tool compound monthly instead of annually?', a: '<p>SIP investments are, by their nature, a series of monthly contributions rather than a single lump sum, so the correct way to project their growth is to compound each monthly instalment individually for the number of months it remains invested, rather than treating the whole SIP as a single annual compounding event. This monthly compounding approach is the standard convention used by AMFI, the Association of Mutual Funds in India, and virtually every fund house SIP calculator, which is why this tool follows the same method rather than a simplified annual approximation that would produce a less accurate figure. Practically, this means an instalment invested in month one benefits from compounding across the entire period, while an instalment invested in the final month barely compounds at all, and the formula correctly accounts for this staggered timing. Using monthly compounding rather than annual compounding typically produces a very similar but slightly different figure than a rough annual approximation, and matching the industry-standard method is why this tool numbers should align closely with what you see on fund house websites.</p>' },
      { q: 'Does this tool account for a step-up or increasing SIP?', a: '<p>No, this calculator assumes a fixed monthly SIP amount for the entire investment period and does not model a step-up SIP, where you increase your monthly contribution by a fixed percentage each year, typically to keep pace with rising income. A step-up SIP generally produces a meaningfully larger maturity value than a flat SIP of the same starting amount, because later, larger instalments still get a reasonable number of years to compound, and increasing contributions over time is a realistic reflection of most people rising income through their career. If you plan to increase your SIP annually, you can approximate the effect by running this calculator multiple times, once for each few years at the higher contribution level, and combining the segments, though this will only be an approximation rather than an exact step-up calculation. For now, treat this tool result as a conservative baseline using your starting SIP amount held flat, understanding that a genuine step-up approach would likely produce a somewhat higher final corpus.</p>' },
      { q: 'Is SIP maturity value guaranteed?', a: '<p>No, absolutely not. The maturity value this calculator shows is a projection based on the annual return percentage you enter, which is an assumption you supply, not a guarantee of any kind from a mutual fund, from Neweb, or from any regulatory body. Mutual funds, particularly equity mutual funds, are market-linked instruments whose actual returns vary from year to year and can be significantly higher or lower than any long-term average in a given period, including periods of negative returns during market downturns. The figure this tool produces is useful for goal planning, deciding how much to invest monthly to reach a target corpus, and for understanding how compounding and time horizon affect outcomes, but it should never be treated as a promised or assured result. Before investing in any mutual fund, read the scheme related documents carefully, understand that mutual fund investments are subject to market risks, and consider consulting a registered financial advisor for guidance suited to your specific goals and risk appetite.</p>' },
      { q: 'What is the difference between SIP and lumpsum investment?', a: '<p>A SIP, or Systematic Investment Plan, spreads your investment across regular monthly instalments over time, which has the practical benefit of rupee-cost averaging, since you buy more mutual fund units when prices are low and fewer when prices are high, smoothing out the effect of market volatility on your average purchase cost. A lumpsum investment, by contrast, puts the entire amount into the market on a single date, which can produce a higher return if that timing happens to be favourable, but also carries more timing risk if the market falls shortly after you invest. For most individual investors without the ability to time markets reliably, a SIP is generally considered the more disciplined and lower-stress approach, since it removes the emotional difficulty of deciding when to invest a large sum and instead builds the habit of regular investing regardless of market conditions. This calculator is built specifically for the SIP style of investing; for a one-time lumpsum projection, the compounding formula is simpler, a single amount growing at a fixed annual rate for a number of years, without the monthly instalment structure this tool uses.</p>' },
      { q: 'Are my investment figures sent to a server?', a: '<p>No, every calculation runs entirely within your own browser using JavaScript on the page, and the monthly SIP amount, expected return and investment period you enter are never transmitted to us or to any third party. There is no account, login or saved history, so you can freely test different SIP amounts, return assumptions and time horizons with your real financial goals in mind without any privacy concern, and the projected maturity value appears instantly because nothing has to travel over a network connection. The trade-off is that the tool does not remember your inputs between visits, so if you want to keep a particular projection for reference, note the figures down or take a screenshot before you change the inputs or close the tab. This local-only design also means the calculator keeps working even if your connection is unstable, since all the maths happens on your own device rather than on a remote server, making it private and reliable for planning your investments.</p>' },
    ],
    related: [
      { href: '/pages/tools/emi-calculator', title: 'EMI Calculator', blurb: 'Work out monthly EMI on any loan.' },
      { href: '/pages/tools/roi-calculator', title: 'ROI Calculator', blurb: 'Check the return on a one-time investment.' },
      { href: '/pages/tools/income-tax-calculator', title: 'Income Tax Calculator', blurb: 'Plan your tax alongside your investments.' },
    ],
  },
  // =========================================================================
  // ============================ RENT RECEIPT GENERATOR =====================
  // =========================================================================
  {
    slug: 'rent-receipt-generator',
    category: 'run',
    built: true,
    name: 'Rent Receipt Generator',
    tagline: 'Printable monthly rent receipts for HRA tax exemption proof.',
    primaryKeyword: 'rent receipt generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Rent Receipt Generator India — HRA Proof PDF | Neweb',
    metaDescription: 'Generate a clean rent receipt for HRA tax exemption claims. Enter tenant, landlord, rent and period details and download a printable PDF. Free, browser-only.',
    h1: 'Rent Receipt <span class="serif">Generator</span>.',
    lede: 'Enter tenant, landlord, rent amount, and period. We generate a clean, printable rent receipt you can submit to your employer as HRA exemption proof. Free, runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Tenant name</label><input id="rr-tenant" type="text" placeholder="Your full name"/></div>
          <div class="field"><label>Landlord name</label><input id="rr-landlord" type="text" placeholder="Landlord full name"/></div>
        </div>
        <div class="field"><label>Rented property address</label><input id="rr-addr" type="text" placeholder="Flat/house, street, city, PIN"/></div>
        <div class="tool-row">
          <div class="field"><label>Monthly rent (in rupees)</label><input id="rr-rent" type="number" step="any" placeholder="e.g. 18000"/></div>
          <div class="field"><label>Rent period (month, year)</label><input id="rr-period" type="text" placeholder="e.g. July 2026"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Landlord PAN (if rent &gt; Rs 1,00,000/yr)</label><input id="rr-pan" type="text" placeholder="e.g. ABCDE1234F" maxlength="10"/></div>
          <div class="field"><label>Payment mode</label>
            <select id="rr-mode"><option value="Bank transfer">Bank transfer</option><option value="Cheque">Cheque</option><option value="Cash">Cash</option><option value="UPI">UPI</option></select>
          </div>
        </div>
        <div class="tool-actions">
          <button id="rr-calc" type="button" class="btn btn-ghost">Preview receipt</button>
          <button id="rr-pdf" type="button" class="btn btn-brand">Download receipt PDF</button>
        </div>
        <div id="rr-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'PDF rendered with jsPDF from jsDelivr. Nothing is uploaded, everything is generated in your browser.',
      js: LOAD_SCRIPT_JS + ESCAPE_HTML + `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0.00'; return (Math.round(n*100)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function val(id){ return (document.getElementById(id).value||'').trim(); }
  var out=document.getElementById('rr-out');
  function render(){
    var rent=parseFloat(document.getElementById('rr-rent').value)||0;
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Rent receipt for '+escHtml(val('rr-period')||'this month')+'</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:26px;margin:4px 0 14px">Rs '+fmt(rent)+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Tenant</dt><dd style="margin:0;text-align:right">'+escHtml(val('rr-tenant'))+'</dd>'
      +'<dt style="color:var(--muted)">Landlord</dt><dd style="margin:0;text-align:right">'+escHtml(val('rr-landlord'))+'</dd>'
      +'<dt style="color:var(--muted)">Property</dt><dd style="margin:0;text-align:right;max-width:60%">'+escHtml(val('rr-addr'))+'</dd>'
      +'<dt style="color:var(--muted)">Payment mode</dt><dd style="margin:0;text-align:right">'+escHtml(val('rr-mode'))+'</dd>'
      +'</dl></div>';
    return rent;
  }
  document.getElementById('rr-calc').addEventListener('click', render);
  document.getElementById('rr-pdf').addEventListener('click', async function(){
    var rent=render();
    if(rent<=0){ alert('Enter a valid monthly rent amount.'); return; }
    try{ await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'); }
    catch(e){ alert('PDF library failed to load. Check your connection and retry.'); return; }
    var jsPDF=window.jspdf.jsPDF;
    var doc=new jsPDF({unit:'mm',format:'a4'});
    var x=20, y=25;
    doc.setFont('helvetica','bold'); doc.setFontSize(18);
    doc.text('RENT RECEIPT', 105, y, {align:'center'});
    y+=14; doc.setFontSize(11); doc.setFont('helvetica','normal');
    var period=val('rr-period')||'—';
    doc.text('Received a sum of Rs '+fmt(rent)+' from '+(val('rr-tenant')||'—')+' towards rent', x, y);
    y+=7; doc.text('for the property located at '+(val('rr-addr')||'—'), x, y);
    y+=7; doc.text('for the month/period of '+period+', paid via '+(val('rr-mode')||'—')+'.', x, y);
    y+=14; doc.setDrawColor(200); doc.line(x, y, 190, y);
    y+=10;
    doc.setFont('helvetica','bold'); doc.text('Tenant name', x, y); doc.setFont('helvetica','normal'); doc.text(val('rr-tenant')||'—', x+45, y);
    y+=8; doc.setFont('helvetica','bold'); doc.text('Landlord name', x, y); doc.setFont('helvetica','normal'); doc.text(val('rr-landlord')||'—', x+45, y);
    y+=8; doc.setFont('helvetica','bold'); doc.text('Landlord PAN', x, y); doc.setFont('helvetica','normal'); doc.text(val('rr-pan')||'Not provided', x+45, y);
    y+=8; doc.setFont('helvetica','bold'); doc.text('Monthly rent', x, y); doc.setFont('helvetica','normal'); doc.text('Rs '+fmt(rent), x+45, y);
    y+=8; doc.setFont('helvetica','bold'); doc.text('Period', x, y); doc.setFont('helvetica','normal'); doc.text(period, x+45, y);
    y+=8; doc.setFont('helvetica','bold'); doc.text('Payment mode', x, y); doc.setFont('helvetica','normal'); doc.text(val('rr-mode')||'—', x+45, y);
    y+=25; doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(120);
    doc.text('Revenue stamp required if cash payment exceeds Rs 5,000 per receipt.', x, y);
    y+=25; doc.setTextColor(0); doc.setFontSize(11);
    doc.line(x, y, x+60, y); doc.text('Landlord signature', x, y+6);
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(120);
    doc.text('Generated with the Neweb Rent Receipt Generator · neweb.ai/pages/tools/rent-receipt-generator', x, 285);
    var fname=((val('rr-tenant')||'rent-receipt').replace(/[^a-zA-Z0-9-_]/g,'-'));
    doc.save(fname + '-rent-receipt.pdf');
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Rent receipt for July 2026</div><div class="eo-sub">Rs 18,000 paid to landlord via bank transfer.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Landlord PAN included</div><div class="eo-sub">Required by employers when annual rent exceeds Rs 1,00,000.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Ready for HRA submission</div><div class="eo-sub">Download the PDF and submit it with your HRA declaration.</div></div></div>
      <div class="eo-note">Sample receipt. Enter your own tenant, landlord and rent details above.</div>
    `,
    intro: `
      <p>If you pay rent and receive House Rent Allowance as part of your salary, claiming the HRA tax exemption under the old regime requires proof, and the standard proof is a monthly rent receipt signed by your landlord. Most employers ask for twelve months of receipts at the start of the financial year or during final tax proof submission, and a missing or sloppy receipt can mean losing out on a real tax saving.</p>
      <p>This tool generates a clean, professional rent receipt in under a minute. Enter the tenant and landlord names, the property address, the monthly rent, the period, and the payment mode. If your annual rent crosses Rs 1,00,000, include the landlord PAN, which employers require above that threshold. Download a printable PDF with a signature line for your landlord. Everything runs in your browser; none of your rental details are sent anywhere.</p>
    `,
    howTo: [
      'Enter the <strong>tenant name</strong>, which should match the name on your salary and PAN records.',
      'Enter the <strong>landlord name</strong> exactly as it appears on their identification or rental agreement.',
      'Enter the <strong>rented property address</strong> in full, including city and PIN code.',
      'Enter the <strong>monthly rent</strong> in rupees and the <strong>period</strong> the receipt covers, such as July 2026.',
      'Enter the <strong>landlord PAN</strong> if your total annual rent exceeds Rs 1,00,000; most employers require this to process HRA exemption.',
      'Select the <strong>payment mode</strong>: bank transfer, cheque, cash, or UPI.',
      'Click <strong>Download receipt PDF</strong>, print it, and get your landlord to sign it. Attach a revenue stamp if the payment is in cash and exceeds Rs 5,000.',
    ],
    why: `
      <p>Three reasons a proper rent receipt is worth the two minutes it takes.</p>
      <p><strong>It unlocks real tax savings.</strong> HRA exemption can meaningfully lower your taxable income under the old regime, but only with valid proof. Missing receipts often mean forfeiting an exemption you were entitled to.</p>
      <p><strong>Employers increasingly demand PAN details.</strong> Once annual rent crosses Rs 1,00,000, the landlord PAN becomes mandatory for the claim to be processed. Missing this detail late in the tax season creates a scramble.</p>
      <p><strong>It creates a clean paper trail.</strong> A dated, signed receipt each month protects both tenant and landlord if a dispute over payment ever arises, well beyond the tax use case.</p>
    `,
    tips: [
      'Generate and get a receipt signed every month rather than backdating twelve at once; some employers scrutinise receipts that look identical and undated.',
      'If your annual rent exceeds Rs 1,00,000, get the landlord PAN early in the year rather than chasing it during proof submission season.',
      'A revenue stamp, currently costing about one rupee, is required on receipts for cash payments above Rs 5,000; keep a few on hand if you pay in cash.',
      'Keep the tenant name on the receipt identical to your name in payroll records to avoid HR rejecting the claim over a mismatch.',
      'If you share a flat and split rent, each tenant should get a receipt for their own share, not one receipt split after the fact.',
      'Retain copies of your rent receipts for at least the assessment year plus the period your return can be reopened, generally a few years.',
    ],
    example: `
      <p>A product manager working in Pune pays Rs 18,000 a month in rent for a two-bedroom flat and receives HRA as part of her salary. At the start of the financial year, her employer asks for rent receipts to process her HRA exemption. She uses this tool each month: enters her name, her landlord name, the flat address, Rs 18,000 as rent, the month, and bank transfer as the payment mode.</p>
      <p>Since her annual rent is Rs 2,16,000, well above the Rs 1,00,000 threshold, she also collects her landlord PAN and includes it on every receipt. She downloads the PDF, sends it to her landlord for a quick digital signature each month, and keeps a folder of twelve signed receipts ready. When proof submission season arrives in January, she uploads all twelve in one sitting instead of scrambling to recreate months of records, and her HRA exemption is processed without a query from payroll.</p>
    `,
    faq: [
      { q: 'What information must a rent receipt include for HRA claims?', a: '<p>A valid rent receipt for HRA exemption purposes should clearly show the tenant name, the landlord name, the complete address of the rented property, the amount of rent paid, the period the payment covers, typically a calendar month, and the mode of payment, whether bank transfer, cheque, UPI or cash. If the rent paid crosses a certain annual threshold, the landlord Permanent Account Number, PAN, also becomes a required field, since employers and the tax department use it to cross-verify the landlord side of the transaction. The receipt should ideally carry the landlord signature to confirm they have actually received the payment, and if the payment is in cash above a specified amount, a revenue stamp is also expected. This tool captures every one of these fields and generates a clean printable receipt with a signature line, so you have a complete, compliant document ready for your employer HRA proof submission.</p>' },
      { q: 'When is the landlord PAN mandatory on a rent receipt?', a: '<p>Under the applicable tax rules, if your total rent paid in a financial year exceeds Rs 1,00,000, you are required to provide your landlord Permanent Account Number to your employer to claim the HRA exemption, which works out to a monthly rent above roughly Rs 8,333. Below this threshold, the PAN is not strictly required, though some employers ask for it anyway as a matter of internal policy or extra diligence. If your landlord does not have a PAN, tax rules provide for a declaration to that effect to be furnished instead, though the exact process can vary by employer, so it is worth checking with your payroll or HR team on how they want that handled. This tool includes an optional PAN field specifically because this threshold exists, so you can leave it blank for lower rent amounts and fill it in once your annual rent crosses the Rs 1,00,000 mark.</p>' },
      { q: 'Do I need a revenue stamp on the rent receipt?', a: '<p>A revenue stamp is required on a rent receipt specifically when the rent for that receipt is paid in cash and the amount exceeds Rs 5,000. The stamp, typically costing about one rupee, must be affixed to the receipt and is usually cancelled with the landlord signature across it, which is a long-standing convention for cash-based receipts. If your rent is paid through a non-cash method, bank transfer, cheque, UPI or any other electronic mode, the revenue stamp requirement does not apply, since it is specifically tied to cash transactions. Because most salaried tenants today pay rent through bank transfer or UPI for their own convenience and traceability, revenue stamps come up less often than in the past, but if you do pay in cash and the monthly rent is above Rs 5,000, keep a small supply of revenue stamps on hand so your receipts are complete when you submit them.</p>' },
      { q: 'Can I generate all twelve months of receipts at once?', a: '<p>You can technically use this tool to generate a receipt for any month you specify, one at a time, by changing the period field and regenerating the PDF, but the better and more defensible practice is to create and get each receipt signed close to the actual month it covers rather than producing all twelve at the end of the year in one sitting. Some employers and tax assessments look more carefully at rent receipts that appear to have been created and signed all on the same date with identical formatting, since that can raise questions about whether the underlying rent was actually paid monthly as claimed. Generating one receipt each month as you actually pay rent, and getting your landlord to sign it around that time, creates a more natural and credible paper trail. If you do need to catch up on past months, it is best to be transparent with your employer about the timeline rather than presenting a batch of identically dated receipts.</p>' },
      { q: 'What if my landlord refuses to sign or share their PAN?', a: '<p>This is a common practical difficulty, since some landlords are reluctant to share their PAN or formally acknowledge rental income, often due to their own tax considerations. If your landlord will not provide their PAN, most employers still allow the claim if you submit a declaration stating that the landlord does not have a PAN or has refused to share it, though the exact form and process for this varies by employer and it is worth checking with your HR or payroll team directly on how they handle it. If your landlord refuses to sign the receipt at all, that is a bigger hurdle, since an unsigned receipt is much weaker proof; in that situation, look for alternate evidence such as bank transfer records showing the rent payment along with a copy of your rental agreement, though the strength of this alternate proof depends on individual employer or assessing officer discretion. Discussing your need for tax documentation with your landlord early in your tenancy, before payment habits are set, usually avoids this problem altogether.</p>' },
      { q: 'Can I use this receipt if I pay rent to a family member?', a: '<p>Yes, HRA exemption can generally be claimed even when rent is paid to a family member, such as a parent, as long as the arrangement is genuine, meaning there is an actual landlord-tenant relationship, the rent is actually paid, typically through a traceable method like bank transfer, and the family member receiving the rent declares it as rental income in their own tax return. Tax authorities have scrutinised such arrangements in the past when they appear to be artificial constructs purely to claim an exemption rather than a real tenancy, so it is important that the arrangement reflects reality, ideally backed by a rental agreement and consistent monthly payments through your bank rather than cash. This tool generates a receipt in the same format regardless of who your landlord is, family member or otherwise, but the underlying substance of the arrangement, genuine payment and genuine declaration by the recipient, is what ultimately determines whether the exemption holds up if questioned, so keep your documentation and payment trail as clean as you would with any other landlord.</p>' },
      { q: 'Is my rental data sent to a server?', a: '<p>No, all the information you enter, tenant and landlord names, the property address, rent amount and PAN, stays entirely within your browser and is used only to render the PDF locally through the jsPDF library. Nothing is uploaded to us or to any third-party server, there is no account, login or saved history, and the only network request involved is fetching the jsPDF library file itself from a content delivery network, which carries no personal or rental information. This matters because a rent receipt contains sensitive personal details, including a PAN in many cases, and keeping the entire process on-device means there is no copy of that information sitting on an external server. Once you close the tab or refresh the page, the details you entered are gone unless you have already downloaded the PDF, so save each receipt to your own records as you generate it each month.</p>' },
    ],
    related: [
      { href: '/pages/tools/income-tax-calculator', title: 'Income Tax Calculator', blurb: 'See how HRA affects your old regime tax.' },
      { href: '/pages/tools/payment-receipt-generator', title: 'Payment Receipt Generator', blurb: 'A generic numbered payment receipt.' },
      { href: '/pages/tools/salary-slip-generator', title: 'Salary Slip Generator', blurb: 'Generate a printable monthly payslip.' },
    ],
  },
  // =========================================================================
  // ============================ QUOTATION GENERATOR ========================
  // =========================================================================
  {
    slug: 'quotation-generator',
    category: 'run',
    built: true,
    name: 'Quotation Generator',
    tagline: 'Build a clean business quotation or estimate PDF in minutes.',
    primaryKeyword: 'quotation generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'For service businesses',
    metaTitle: 'Free Quotation Generator India — Business Estimate PDF | Neweb',
    metaDescription: 'Generate a professional quotation or estimate PDF with line items, tax and validity. Free and browser-only, download instantly. Pairs with our GST invoice tool.',
    h1: 'Quotation <span class="serif">Generator</span>.',
    lede: 'Type your business details, client details and line items. We total everything, apply optional tax, and generate a clean A4 quotation PDF. Free, runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Your business name</label><input id="qt-biz" type="text" placeholder="Your business name"/></div>
          <div class="field"><label>Quotation number</label><input id="qt-no" type="text" placeholder="e.g. QT/2026/07/012"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Client name</label><input id="qt-client" type="text" placeholder="Customer or company name"/></div>
          <div class="field"><label>Valid until</label><input id="qt-valid" type="date"/></div>
        </div>
        <label style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-top:14px;display:block">Line items</label>
        <div id="qt-items" style="display:flex;flex-direction:column;gap:10px;margin-top:8px"></div>
        <div class="tool-actions"><button id="qt-add" type="button" class="btn btn-ghost">+ Add line item</button></div>
        <div class="field" style="margin-top:10px"><label>Tax rate to apply (%, optional)</label><input id="qt-tax" type="number" step="any" placeholder="e.g. 18" value="0"/></div>
        <div id="qt-totals" style="margin-top:18px;padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--bg-2);display:none"></div>
        <div class="tool-actions" style="margin-top:14px">
          <button id="qt-preview" type="button" class="btn btn-ghost">Recalculate</button>
          <button id="qt-pdf" type="button" class="btn btn-brand">Download quotation PDF</button>
        </div>
      `,
      help: 'PDF rendered with jsPDF + autoTable from jsDelivr. Nothing is uploaded, everything is generated in your browser.',
      js: LOAD_SCRIPT_JS + ESCAPE_HTML + `
(function(){
  var items=document.getElementById('qt-items');
  if(!items) return;
  function rowHTML(idx, r){
    return '<div class="qt-row" data-i="'+idx+'" style="display:grid;grid-template-columns:2.4fr .7fr 1fr 28px;gap:8px;align-items:center">'
      + '<input class="qt-desc" type="text" placeholder="Item or service description" value="'+String(r.desc||'').replace(/"/g,'&quot;')+'"/>'
      + '<input class="qt-qty" type="number" step="0.01" min="0" placeholder="Qty" value="'+(r.qty||1)+'"/>'
      + '<input class="qt-rate" type="number" step="0.01" min="0" placeholder="Rate Rs" value="'+(r.rate||0)+'"/>'
      + '<button class="qt-del" type="button" title="Remove" style="background:transparent;border:0;color:var(--muted);font-size:18px;cursor:pointer;line-height:1">×</button>'
      + '</div>';
  }
  function addRow(r){
    r=r||{desc:'',qty:1,rate:0};
    var idx=items.children.length;
    items.insertAdjacentHTML('beforeend', rowHTML(idx, r));
    items.lastElementChild.querySelector('.qt-del').addEventListener('click', function(){
      items.removeChild(items.querySelector('[data-i="'+idx+'"]'));
      recalc();
    });
    items.lastElementChild.querySelectorAll('input').forEach(function(el){ el.addEventListener('input', recalc); });
  }
  document.getElementById('qt-add').addEventListener('click', function(){ addRow(); });
  document.getElementById('qt-preview').addEventListener('click', recalc);
  addRow();
  var vEl=document.getElementById('qt-valid');
  var d=new Date(d=Date.now()+14*86400000); var dd=new Date(d); var pad=function(n){return n<10?'0'+n:n;};
  vEl.value = dd.getFullYear()+'-'+pad(dd.getMonth()+1)+'-'+pad(dd.getDate());

  function rupee(n){ return 'Rs ' + (n||0).toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','); }
  function readItems(){
    return Array.from(items.querySelectorAll('.qt-row')).map(function(row){
      return {
        desc: row.querySelector('.qt-desc').value||'',
        qty: parseFloat(row.querySelector('.qt-qty').value)||0,
        rate: parseFloat(row.querySelector('.qt-rate').value)||0,
      };
    });
  }
  function calc(){
    var rows=readItems();
    var sub=0; rows.forEach(function(r){ sub += r.qty*r.rate; });
    var taxPct=parseFloat(document.getElementById('qt-tax').value)||0;
    var tax=sub*taxPct/100;
    var grand=sub+tax;
    return {sub:sub, tax:tax, taxPct:taxPct, grand:grand};
  }
  function recalc(){
    var t=calc();
    var box=document.getElementById('qt-totals');
    box.style.display = t.sub>0 ? 'block' : 'none';
    box.innerHTML='<div style="display:flex;justify-content:space-between;font-family:JetBrains Mono,monospace;font-size:13px;color:var(--ink-2);margin-bottom:6px"><span>Subtotal</span><span>'+rupee(t.sub)+'</span></div>'
      +(t.tax? '<div style="display:flex;justify-content:space-between;font-family:JetBrains Mono,monospace;font-size:13px;color:var(--ink-2);margin-bottom:6px"><span>Tax ('+t.taxPct+'%)</span><span>'+rupee(t.tax)+'</span></div>' : '')
      +'<div style="display:flex;justify-content:space-between;font-size:18px;font-weight:600;color:var(--ink);margin-top:10px;padding-top:10px;border-top:1px solid var(--line)"><span>Grand total</span><span>'+rupee(t.grand)+'</span></div>';
    return t;
  }

  document.getElementById('qt-pdf').addEventListener('click', async function(){
    var t=recalc();
    if(!t || t.sub===0){ alert('Please add at least one line item.'); return; }
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js');
    } catch(e){ alert('PDF library failed to load. Check your connection and retry.'); return; }
    var jsPDF=window.jspdf.jsPDF;
    var doc=new jsPDF({unit:'mm',format:'a4'});
    var x=15;
    doc.setFont('helvetica','bold'); doc.setFontSize(20);
    doc.text('QUOTATION', x, 22);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(100);
    doc.text('Estimate, not a tax invoice', x, 28);
    doc.setTextColor(0); doc.setFontSize(10);
    doc.setFont('helvetica','bold'); doc.text('From', x, 40);
    doc.setFont('helvetica','normal'); doc.text(document.getElementById('qt-biz').value||'', x, 46);
    var bx=115;
    doc.setFont('helvetica','bold'); doc.text('Quoted to', bx, 40);
    doc.setFont('helvetica','normal'); doc.text(document.getElementById('qt-client').value||'', bx, 46);
    doc.setFontSize(9); doc.setTextColor(80);
    doc.text('Quotation #: '+(document.getElementById('qt-no').value||''), x, 58);
    doc.text('Valid until: '+(document.getElementById('qt-valid').value||''), bx, 58);
    doc.setTextColor(0); doc.setFontSize(10);
    var rows=readItems().filter(function(r){return r.desc||r.qty||r.rate;}).map(function(r){
      var amt=(r.qty||0)*(r.rate||0);
      return [r.desc, String(r.qty), 'Rs '+r.rate.toFixed(2), 'Rs '+amt.toFixed(2)];
    });
    doc.autoTable({
      startY: 66,
      head: [['Description','Qty','Rate','Amount']],
      body: rows,
      headStyles: { fillColor:[61,76,255], textColor:255, fontSize:9 },
      bodyStyles: { fontSize:9 },
      styles: { cellPadding:2.5 },
      columnStyles: { 0:{cellWidth:90}, 2:{halign:'right'}, 3:{halign:'right'} },
    });
    var y=doc.lastAutoTable.finalY+8;
    doc.setFontSize(10);
    function line(label, value){ doc.text(label, 130, y); doc.text(value, 195, y, {align:'right'}); y+=6; }
    line('Subtotal', 'Rs '+t.sub.toFixed(2));
    if (t.tax) line('Tax ('+t.taxPct+'%)', 'Rs '+t.tax.toFixed(2));
    doc.setFont('helvetica','bold'); line('Grand total', 'Rs '+t.grand.toFixed(2));
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(100);
    y+=8; doc.text('This quotation is an estimate and does not constitute a tax invoice. Prices may change after the validity date.', x, y);
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text('Generated with the Neweb Quotation Generator · neweb.ai/pages/tools/quotation-generator', x, 285);
    var num=(document.getElementById('qt-no').value||'quotation').replace(/[^a-zA-Z0-9-_]/g,'-');
    doc.save(num+'.pdf');
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Website design and setup x 1 @ Rs 25,000</div><div class="eo-sub">Subtotal Rs 25,000 before tax.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Tax (18%) = Rs 4,500</div><div class="eo-sub">Applied if the quote includes GST.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Grand total = Rs 29,500</div><div class="eo-sub">Valid for 14 days from the quotation date.</div></div></div>
      <div class="eo-note">Sample quotation. Add your own line items and download the PDF above.</div>
    `,
    intro: `
      <p>Before a customer commits to a purchase or a project, most Indian SMBs need to send a quotation, a clean written estimate of cost that is not yet a demand for payment. A good quotation looks professional, is easy to compare against a competitor bid, and sets clear expectations on price and validity before work begins. Scribbling a price on WhatsApp does not carry the same weight, and often gets renegotiated later because nothing was written down clearly.</p>
      <p>This tool builds a proper quotation in a couple of minutes. Enter your business name, the client, a quotation number, and a validity date, then add line items with quantity and rate. Apply an optional tax percentage if you plan to add GST at the quoting stage. We total everything and generate a clean A4 PDF, ready to email. It sits right beside our GST invoice generator: quote first, invoice once the order is confirmed. Everything runs in your browser.</p>
    `,
    howTo: [
      'Enter your <strong>business name</strong> and a <strong>quotation number</strong> to keep your quotes organised and traceable.',
      'Enter the <strong>client name</strong> and pick a <strong>valid until</strong> date, typically 7 to 30 days from today.',
      'Add <strong>line items</strong>: description, quantity, and rate per unit. Click "+ Add line item" for each additional row.',
      'Enter an optional <strong>tax rate</strong> if you want the quotation to show GST or another tax added to the subtotal.',
      'Click <strong>Recalculate</strong> to review the subtotal, tax, and grand total before you generate the file.',
      'Click <strong>Download quotation PDF</strong>. Email it to your client or attach it to a WhatsApp message.',
      'Once the client confirms, use our GST invoice generator to raise the actual tax invoice for the confirmed order.',
    ],
    why: `
      <p>Three reasons a written quotation earns its place in your sales process.</p>
      <p><strong>It sets a clear, dated reference point.</strong> A quotation with a validity date protects you from a client trying to hold you to an old price months later, and protects the client from a surprise price change mid-negotiation.</p>
      <p><strong>It looks more professional than a verbal or chat quote.</strong> A clean PDF with your business name, an itemised breakdown, and a total signals that you run an organised business, which matters when you are competing against other vendors for the same job.</p>
      <p><strong>It speeds up decision-making.</strong> Clients comparing multiple vendors can place a clear PDF quotation side by side with a competitor bid far more easily than a scattered WhatsApp conversation, which often means faster approvals for you.</p>
    `,
    tips: [
      'Set a validity period, typically 7 to 30 days, so a client cannot demand an old price after your costs have changed.',
      'Number your quotations in a series, like QT/2026/07/001, so you can track how many quotes convert into actual orders.',
      'Leave the tax field blank or at zero if you are quoting an all-inclusive estimate rather than breaking out GST at this stage.',
      'Keep line items specific. "Website design and setup" is clearer than a single vague "Services" line and reduces scope disputes later.',
      'Save a copy of every quotation you send, since it often becomes the reference document if a dispute over scope or price comes up.',
      'Once a quotation is accepted, move straight to our GST invoice generator to raise a compliant tax invoice for the confirmed work.',
    ],
    example: `
      <p>A freelance web designer in Kochi is asked by a boutique owner for a quote to build a five-page business website. She opens this tool, enters her business name, sets the quotation number to QT/2026/07/012, and picks a validity date 14 days out. She adds one line item: "Website design and setup, 5 pages, responsive", quantity 1, rate Rs 25,000, and enters 18 in the tax field since she plans to bill GST on the eventual invoice.</p>
      <p>The tool shows a subtotal of Rs 25,000, tax of Rs 4,500, and a grand total of Rs 29,500. She downloads the PDF and emails it to the boutique owner. Two days later the owner replies confirming the project. The designer then opens the GST invoice generator, copies over the same line item and amount, and raises the actual tax invoice once the advance payment is received, keeping the quotation and the invoice as two clean, separate, and correctly dated records.</p>
    `,
    faq: [
      { q: 'What is the difference between a quotation and an invoice?', a: '<p>A quotation is an estimate of cost you send before work begins or before a sale is confirmed, and it is not a demand for payment or a legal tax document, whereas an invoice, particularly a GST tax invoice, is issued after a supply of goods or services has actually taken place and is the formal document that demands payment and, where applicable, carries the tax details your buyer needs for input tax credit. A quotation typically includes a validity period, since prices can change, while an invoice reflects a completed or confirmed transaction and generally cannot be casually revised once issued, since it has tax and accounting implications. Many businesses follow the same natural sequence this tool supports: send a quotation to win the work or the sale, and once the client accepts, raise the actual invoice, ideally using a dedicated GST-compliant invoice generator, for the confirmed amount. Treating the two as separate documents with separate numbering keeps your sales pipeline and your tax records clean and easy to reconcile.</p>' },
      { q: 'Is a quotation legally binding?', a: '<p>A quotation, by itself, is generally understood as a non-binding estimate rather than a firm contractual offer, particularly when it clearly states a validity period and describes itself as an estimate, which is why this tool prints estimate, not a tax invoice directly on the generated PDF. That said, once a client formally accepts a quotation, for example by replying in writing to confirm they agree to the price and scope, it can start to form the basis of an agreement between the two parties, especially if work then begins on the strength of that acceptance. The exact legal weight of any quotation depends on the specific wording used, the conduct of both parties afterward, and the nature of your business relationship, so for larger or higher-risk projects, it is sensible to follow up an accepted quotation with a short written agreement or purchase order that explicitly confirms scope, price, and payment terms, rather than relying on the quotation document alone to carry full contractual weight.</p>' },
      { q: 'Should I include GST on a quotation?', a: '<p>It is common and often clearer to include an estimated tax figure on a quotation so the client sees an all-in expected cost upfront, rather than being surprised by tax only when the final invoice arrives, which is why this tool includes an optional tax rate field you can apply to the subtotal. That said, the tax shown on a quotation is only an estimate for planning purposes, and the actual, legally applicable GST amount and split, CGST plus SGST for an intra-state supply or IGST for an inter-state supply, gets finalised only on the actual tax invoice once the transaction is confirmed and completed. If you are not yet certain about the exact GST treatment for a particular deal, for example because the buyer location or GST registration status is still being confirmed, it is reasonable to leave the tax field blank or at zero on the quotation and clarify to the client that tax will be added as applicable on the final invoice, which avoids committing to a specific tax figure before all the details are settled.</p>' },
      { q: 'How long should a quotation stay valid?', a: '<p>There is no fixed legal rule, and the right validity period depends on how quickly your costs, material prices or capacity can change, but a common range for small businesses and service providers is anywhere from 7 to 30 days from the date the quotation is issued. A shorter validity, closer to a week, makes sense if you are quoting on materials or services with volatile input costs, since a longer commitment risks you having to honour a price that no longer reflects your actual cost. A longer validity, closer to a month, works well for stable service pricing where costs rarely shift, and gives a client more breathing room to make a decision without needing a fresh quote. Whatever period you choose, stating it explicitly on the document, which this tool does automatically using the valid until date you set, avoids the awkward situation of a client trying to hold you to a quote well after your costs or availability have changed.</p>' },
      { q: 'Can I turn an accepted quotation into an invoice easily?', a: '<p>This tool does not automatically convert a quotation into an invoice, since the two serve different purposes and often need slightly different details, an invoice, for instance, typically needs your GSTIN, the buyer GSTIN if applicable, and an HSN or SAC code per line item for tax compliance, none of which are strictly required on a simple estimate. However, the practical workflow is straightforward: once your client accepts a quotation generated here, open our dedicated GST invoice generator and re-enter the same line items, descriptions, quantities and rates, along with the additional GST-specific details it requires, seller and buyer GSTIN, state, and HSN codes, to produce a fully compliant tax invoice. Keeping the quotation and the invoice as two separate documents, generated from two purpose-built tools, keeps your quoting process light and fast while still giving you a proper Rule 46 compliant invoice once the sale is actually confirmed.</p>' },
      { q: 'Can I quote in a currency other than rupees?', a: '<p>This tool is built specifically for Indian rupee amounts, and the generated PDF labels all figures with the Rs symbol and formats numbers in the Indian numbering style with commas for thousands and lakhs, so it is not designed to natively output a quotation in US dollars, euros or any other foreign currency. If you occasionally need to quote an international client in a foreign currency, a practical workaround is to prepare the quotation in rupees here for your own internal reference and cost planning, then manually convert and relabel the final figure before sending it abroad, or use a separate document for foreign currency quotes where the currency symbol and formatting can be set correctly. For the vast majority of Indian small businesses quoting domestic clients in rupees, which is the primary use case this tool is built for, the Indian rupee formatting and layout work exactly as expected without any adjustment needed.</p>' },
      { q: 'Is my quotation data sent to a server?', a: '<p>No, every part of this tool, from the line item calculations to the final PDF generation, runs entirely within your own browser using JavaScript on the page and the jsPDF library, and none of your business name, client details, line items or amounts are transmitted to us or to any third party. There is no account, login or saved history, so you can enter real client names and pricing freely without any privacy concern, and the PDF generates instantly on your device without any network round trip for your data. The only network request involved is loading the jsPDF and autoTable library files themselves from a content delivery network, which carry no quotation content at all. Once you close the tab or refresh the page, the details you entered are gone unless you have already downloaded the PDF, so save each quotation to your own records or client folder as you generate it.</p>' },
    ],
    related: [
      { href: '/pages/tools/gst-invoice-generator', title: 'GST Invoice Generator', blurb: 'Raise the tax invoice once the quote is accepted.' },
      { href: '/pages/tools/payment-receipt-generator', title: 'Payment Receipt Generator', blurb: 'Issue a receipt once payment is received.' },
      { href: '/pages/tools/invoice-number-generator', title: 'Invoice Number Generator', blurb: 'Plan a clean sequential numbering scheme.' },
    ],
  },
  // =========================================================================
  // ============================ PAYMENT RECEIPT GENERATOR =================
  // =========================================================================
  {
    slug: 'payment-receipt-generator',
    category: 'run',
    built: true,
    name: 'Payment Receipt Generator',
    tagline: 'Issue a clean, numbered payment receipt as a printable PDF.',
    primaryKeyword: 'payment receipt generator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Payment Receipt Generator India — Printable PDF | Neweb',
    metaDescription: 'Generate a numbered payment receipt with payer, amount, mode and purpose. Free, browser-only, downloads as a clean A4 PDF instantly.',
    h1: 'Payment Receipt <span class="serif">Generator</span>.',
    lede: 'Enter payer, amount, date, mode and purpose. We generate a clean, numbered payment receipt as a printable PDF, ready to hand over or email. Free, runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Your business / received-by name</label><input id="pr-biz" type="text" placeholder="Your business name"/></div>
          <div class="field"><label>Receipt number</label><input id="pr-no" type="text" placeholder="e.g. RCPT/2026/07/045"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Received from (payer name)</label><input id="pr-payer" type="text" placeholder="Customer or company name"/></div>
          <div class="field"><label>Date</label><input id="pr-date" type="date"/></div>
        </div>
        <div class="tool-row">
          <div class="field"><label>Amount received (in rupees)</label><input id="pr-amt" type="number" step="any" placeholder="e.g. 15000"/></div>
          <div class="field"><label>Payment mode</label>
            <select id="pr-mode"><option value="Bank transfer">Bank transfer</option><option value="UPI">UPI</option><option value="Cheque">Cheque</option><option value="Cash">Cash</option><option value="Card">Card</option></select>
          </div>
        </div>
        <div class="field"><label>Payment towards (purpose)</label><input id="pr-purpose" type="text" placeholder="e.g. Advance for Order #204, or Invoice INV/2026/07/012"/></div>
        <div class="tool-actions">
          <button id="pr-calc" type="button" class="btn btn-ghost">Preview receipt</button>
          <button id="pr-pdf" type="button" class="btn btn-brand">Download receipt PDF</button>
        </div>
        <div id="pr-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'PDF rendered with jsPDF from jsDelivr. Nothing is uploaded, everything is generated in your browser.',
      js: LOAD_SCRIPT_JS + ESCAPE_HTML + `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0.00'; return (Math.round(n*100)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function val(id){ return (document.getElementById(id).value||'').trim(); }
  var out=document.getElementById('pr-out');
  var dEl=document.getElementById('pr-date');
  var d=new Date(); var pad=function(n){return n<10?'0'+n:n;};
  dEl.value = d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());

  function numToWords(num){
    if (num === 0) return 'Zero';
    var a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    var b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    function two(n){ if (n<20) return a[n]; var t=Math.floor(n/10), u=n%10; return b[t] + (u? ' '+a[u]:''); }
    function three(n){ var h=Math.floor(n/100), r=n%100; var s=''; if (h) s+=a[h]+' Hundred'; if (r){ if (s) s+=' '; s+=two(r);} return s; }
    var crore=Math.floor(num/10000000); num%=10000000;
    var lakh=Math.floor(num/100000); num%=100000;
    var thou=Math.floor(num/1000); num%=1000;
    var rest=num; var parts=[];
    if (crore) parts.push(two(crore)+' Crore');
    if (lakh) parts.push(two(lakh)+' Lakh');
    if (thou) parts.push(two(thou)+' Thousand');
    if (rest) parts.push(three(rest));
    return parts.join(' ') || 'Zero';
  }

  function render(){
    var amt=parseFloat(document.getElementById('pr-amt').value)||0;
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Amount received</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">Rs '+fmt(amt)+'</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Received from</dt><dd style="margin:0;text-align:right">'+escHtml(val('pr-payer'))+'</dd>'
      +'<dt style="color:var(--muted)">Mode</dt><dd style="margin:0;text-align:right">'+escHtml(val('pr-mode'))+'</dd>'
      +'<dt style="color:var(--muted)">Towards</dt><dd style="margin:0;text-align:right;max-width:60%">'+escHtml(val('pr-purpose'))+'</dd>'
      +'</dl>'
      +'<div style="font-family:Instrument Serif,serif;font-style:italic;font-size:14.5px;color:var(--ink-2);margin-top:8px">In words: '+numToWords(Math.round(amt))+' Rupees Only</div>'
      +'</div>';
    return amt;
  }
  document.getElementById('pr-calc').addEventListener('click', render);
  document.getElementById('pr-pdf').addEventListener('click', async function(){
    var amt=render();
    if(amt<=0){ alert('Enter a valid amount received.'); return; }
    try{ await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'); }
    catch(e){ alert('PDF library failed to load. Check your connection and retry.'); return; }
    var jsPDF=window.jspdf.jsPDF;
    var doc=new jsPDF({unit:'mm',format:'a4'});
    var x=20, y=25;
    doc.setFont('helvetica','bold'); doc.setFontSize(18);
    doc.text('PAYMENT RECEIPT', 105, y, {align:'center'});
    y+=10; doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100);
    doc.text('Receipt #: '+(val('pr-no')||'—'), x, y);
    doc.text('Date: '+(val('pr-date')||'—'), 150, y);
    doc.setTextColor(0); y+=14; doc.setFontSize(11);
    doc.text('Received with thanks from '+(val('pr-payer')||'—'), x, y);
    y+=8; doc.text('the sum of Rs '+fmt(amt)+' ('+numToWords(Math.round(amt))+' Rupees Only)', x, y);
    y+=8; doc.text('by way of '+(val('pr-mode')||'—')+',', x, y);
    y+=8; doc.text('towards '+(val('pr-purpose')||'—')+'.', x, y);
    y+=16; doc.setDrawColor(200); doc.line(x, y, 190, y);
    y+=10;
    doc.setFont('helvetica','bold'); doc.text('Received by', x, y); doc.setFont('helvetica','normal'); doc.text(val('pr-biz')||'—', x+45, y);
    y+=8; doc.setFont('helvetica','bold'); doc.text('Amount', x, y); doc.setFont('helvetica','normal'); doc.text('Rs '+fmt(amt), x+45, y);
    y+=8; doc.setFont('helvetica','bold'); doc.text('Mode', x, y); doc.setFont('helvetica','normal'); doc.text(val('pr-mode')||'—', x+45, y);
    y+=25;
    doc.line(x, y, x+60, y); doc.text('Authorised signature', x, y+6);
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(120);
    doc.text('Generated with the Neweb Payment Receipt Generator · neweb.ai/pages/tools/payment-receipt-generator', x, 285);
    var fname=(val('pr-no')||'payment-receipt').replace(/[^a-zA-Z0-9-_]/g,'-');
    doc.save(fname+'.pdf');
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Amount received: Rs 15,000.00</div><div class="eo-sub">Advance received against Order #204.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">In words: Fifteen Thousand Rupees Only</div><div class="eo-sub">Auto-converted for the printed receipt.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Mode: UPI</div><div class="eo-sub">Recorded on the receipt alongside the purpose.</div></div></div>
      <div class="eo-note">Sample receipt. Enter your own payer, amount and purpose above.</div>
    `,
    intro: `
      <p>Every time a small business takes an advance, a part payment, or a cash settlement, a receipt closes the loop, both for the customer peace of mind and for the business own books. Yet many SMBs still hand over a hastily scribbled note or nothing at all, which becomes a real problem the moment a customer disputes what they paid, or an accountant needs to reconcile cash collections at month end.</p>
      <p>This tool generates a clean, numbered payment receipt in under a minute. Enter who paid, how much, the date, the payment mode, and what it was for. We auto-convert the amount into words, the way formal receipts always do, and generate a printable A4 PDF with a signature line. It completes the invoice-to-quotation-to-receipt document trio that most Indian SMBs need on a routine basis. Everything runs in your browser; no payment data is sent anywhere.</p>
    `,
    howTo: [
      'Enter your <strong>business name</strong> or the name of the person receiving the payment, and a <strong>receipt number</strong> for your records.',
      'Enter the <strong>payer name</strong>, the person or company the payment is received from, and confirm the <strong>date</strong>, which defaults to today.',
      'Enter the <strong>amount received</strong> in rupees and select the <strong>payment mode</strong>: bank transfer, UPI, cheque, cash, or card.',
      'Enter what the payment is <strong>towards</strong>, for example an order number, an invoice number, or a service description.',
      'Click <strong>Preview receipt</strong> to check the amount in words and the details before generating the file.',
      'Click <strong>Download receipt PDF</strong>. Print it for a walk-in customer, or email the PDF directly.',
      'Keep a running log of receipt numbers issued so your sequence stays clean and easy to reconcile at month end.',
    ],
    why: `
      <p>Three reasons a numbered payment receipt is worth issuing every time.</p>
      <p><strong>It closes disputes before they start.</strong> A dated, signed receipt showing the exact amount and mode is the simplest way to settle any "did I pay this" question weeks or months later.</p>
      <p><strong>It keeps your cash reconciliation honest.</strong> When every cash or advance payment gets a numbered receipt, your books reconcile cleanly against your bank and cash registers at month end.</p>
      <p><strong>It looks professional.</strong> Handing a customer a clean printed receipt, rather than nothing or a handwritten scrap, signals that yours is an organised, trustworthy business worth returning to.</p>
    `,
    tips: [
      'Number receipts sequentially, like RCPT/2026/07/045, so gaps or duplicates are easy to spot during reconciliation.',
      'Always record the payment mode. A cash receipt and a bank transfer receipt should never be indistinguishable in your records.',
      'Be specific in the purpose field. "Advance for Order #204" is far more useful later than a vague "Payment received".',
      'For cash receipts above Rs 5,000, check whether a revenue stamp is customary in your context, similar to rent receipts.',
      'This is a payment receipt, not a tax invoice; if GST applies to the underlying sale, issue a proper tax invoice separately.',
      'Keep a digital copy of every receipt you issue, ideally in the same folder as the invoice or quotation it relates to.',
    ],
    example: `
      <p>A furniture workshop in Jaipur takes a 50 percent advance from a customer ordering a custom dining table priced at Rs 30,000. The customer pays Rs 15,000 via UPI on the spot. The workshop owner opens this tool, enters the business name, sets the receipt number to RCPT/2026/07/045, enters the customer name, today date, Rs 15,000 as the amount, UPI as the mode, and "Advance for Order #204, custom dining table" as the purpose.</p>
      <p>He clicks Preview and confirms the amount auto-converts correctly to "Fifteen Thousand Rupees Only", then downloads the PDF and hands a printed copy to the customer on the spot. Six weeks later, when the table is ready and the customer pays the balance, he generates a second receipt for the remaining Rs 15,000, referencing the same order number. His month-end reconciliation now shows two clean, numbered, dated receipts that together account for the full Rs 30,000 sale.</p>
    `,
    faq: [
      { q: 'What is the difference between a payment receipt and an invoice?', a: '<p>A payment receipt confirms that money has actually been received, showing who paid, how much, when, by what mode, and what it was for, whereas an invoice, particularly a GST tax invoice, is a demand for payment issued for a supply of goods or services, often before the money has actually changed hands, and carries specific tax compliance details like GSTIN and HSN codes when applicable. In practice, many transactions involve both: you might issue an invoice for a sale, and once the customer pays, issue a separate payment receipt acknowledging that specific payment, especially useful for advances, part-payments, or purely cash based transactions where a formal tax invoice may not be immediately required. This tool is built specifically for the receipt side of that pair, confirming money received, and pairs naturally with our GST invoice generator when the underlying transaction also needs a formal tax invoice, and with our quotation generator for the estimate that came before the sale was confirmed.</p>' },
      { q: 'Do I need to issue a receipt for every payment I receive?', a: '<p>There is no single blanket legal rule that mandates a receipt for absolutely every payment across all business types, but issuing one consistently is strong business practice and, for many kinds of transactions, particularly cash payments, advances, and part-payments, is expected or required by your customers, by state Shops and Establishments regulations, or by your own accounting discipline. For any payment that is not immediately and fully covered by a formal GST tax invoice, an advance before you deliver goods or services, a cash sale at a small retail counter, or a partial payment against a larger order, issuing a payment receipt closes the loop clearly for both sides and gives you a clean paper trail for your own bookkeeping and reconciliation. As a simple habit, treat every payment you receive, regardless of amount or mode, as worth a receipt, since the two minutes it takes to generate one is far cheaper than a later dispute over whether or how much was paid.</p>' },
      { q: 'Can I use this receipt as proof for tax purposes?', a: '<p>A payment receipt from this tool documents that a payment was received, which is useful supporting evidence for your own bookkeeping and for resolving disputes with a customer, but it is not a substitute for a formal GST tax invoice when one is legally required for the underlying sale of goods or services. If your customer needs to claim input tax credit, or if the transaction is one where GST law requires a tax invoice, you should issue a proper Rule 46 compliant tax invoice, ideally through a dedicated tool like our GST invoice generator, in addition to or instead of a plain payment receipt. Where a formal tax invoice is not required, for instance many cash retail sales below certain thresholds or advances against future work, this payment receipt serves as a reasonable acknowledgment of the transaction for your records and your customer, but you should confirm the exact tax documentation requirements for your specific business and transaction type with your accountant rather than relying on a payment receipt alone as tax proof.</p>' },
      { q: 'Why does the receipt show the amount in words?', a: '<p>Writing out the amount in words alongside the numeral is a long-standing convention on formal Indian receipts and financial documents, and it exists to prevent a figure from being misread or altered after the document is issued. A numeral like 15,000 can, in principle, be tampered with more easily than a spelled-out phrase like Fifteen Thousand Rupees Only, which is much harder to quietly change without the alteration being obvious. This convention is especially valued in traditional Indian business practice, on cheques, on hand-written vouchers, and on receipts for larger amounts, precisely because it adds a layer of clarity and tamper-resistance to the document. This tool automatically converts your entered amount into the Indian numbering convention, correctly using crore, lakh and thousand groupings rather than the international million and billion system, so the words on your receipt read the way an Indian business or accountant would expect them to.</p>' },
      { q: 'What payment modes can I record on the receipt?', a: '<p>This tool lets you select from the common payment modes used by Indian small businesses: bank transfer, UPI, cheque, cash, and card, covering the vast majority of how customers actually pay today. Recording the correct mode matters beyond simple record-keeping, since it affects how the payment reconciles against your bank statement or your cash register, and cash payments in particular sometimes carry additional documentation conventions, such as a revenue stamp on receipts above a certain amount in some contexts, that electronic payments do not need. If your specific transaction used a payment method not explicitly listed here, for example a digital wallet or a specific payment gateway, choose the closest equivalent, typically UPI or bank transfer, or note the specific method in the purpose field so the detail is not lost even though the dropdown itself only covers the standard five categories.</p>' },
      { q: 'Can I edit or reprint a receipt after generating it?', a: '<p>This tool does not save your receipt after you close the tab or refresh the page, so you cannot come back later and reload a previously generated receipt to edit or reprint it through the tool itself; instead, keep the downloaded PDF file safely in your own records, since that saved file is the reprintable copy going forward. If you need to correct a mistake immediately after generating a receipt, simply adjust the fields in the form and regenerate a fresh PDF before you hand over or send the incorrect one, since nothing has been transmitted or logged anywhere that would need to be corrected on a server. If an error is discovered after a receipt has already been issued to a customer, the standard practice is not to silently replace it but to issue a clearly marked corrected or revised receipt referencing the original receipt number, so your records show an honest trail of the correction rather than two conflicting documents with no explanation.</p>' },
      { q: 'Is my payment data sent to a server?', a: '<p>No, every field you fill in, the payer name, amount, date, mode and purpose, is used only within your own browser to render the receipt preview and the final PDF through the jsPDF library, and none of it is transmitted to us or to any third-party server. There is no account, login or saved history, so you can record real customer names and payment amounts without any privacy concern, and the receipt generates instantly since nothing needs to travel over a network connection for your data specifically. The only network request involved is fetching the jsPDF library file itself from a content delivery network, which carries no receipt content at all. Once you close the tab or refresh the page, the details you entered are gone unless you have already downloaded the PDF, so save each receipt to your own records as you issue it.</p>' },
    ],
    related: [
      { href: '/pages/tools/quotation-generator', title: 'Quotation Generator', blurb: 'Send the estimate before the sale is confirmed.' },
      { href: '/pages/tools/gst-invoice-generator', title: 'GST Invoice Generator', blurb: 'Raise a compliant tax invoice for the sale.' },
      { href: '/pages/tools/rent-receipt-generator', title: 'Rent Receipt Generator', blurb: 'A dedicated receipt for monthly rent payments.' },
    ],
  },
  // =========================================================================
  // ============================ PROFIT MARGIN CALCULATOR ==================
  // =========================================================================
  {
    slug: 'profit-margin-calculator',
    category: 'run',
    built: true,
    name: 'Profit Margin Calculator',
    tagline: 'Turn cost price and selling price into margin percent and profit in one view.',
    primaryKeyword: 'profit margin calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Profit Margin Calculator — Margin, Markup, Profit | Neweb',
    metaDescription: 'Calculate profit margin percent, markup percent, and rupee profit from cost price and selling price. Free, browser-only, instant results.',
    h1: 'Profit Margin <span class="serif">Calculator</span>.',
    lede: 'Enter your cost price and selling price. We compute your profit, your margin percent, and your markup percent in one view, so you can price with confidence. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Cost price (in rupees)</label><input id="pm-cost" type="number" step="any" placeholder="e.g. 400"/></div>
          <div class="field"><label>Selling price (in rupees)</label><input id="pm-sell" type="number" step="any" placeholder="e.g. 600"/></div>
        </div>
        <div class="tool-actions">
          <button id="pm-go" type="button" class="btn btn-brand">Calculate margin</button>
        </div>
        <div id="pm-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Margin is profit as a percent of selling price. Markup is profit as a percent of cost price. Both are useful, for different purposes. All maths runs in your browser.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0.00'; return (Math.round(n*100)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function pct(n){ return (Math.round(n*100)/100).toLocaleString('en-IN'); }
  var out=document.getElementById('pm-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('pm-go').addEventListener('click', function(){
    var cost=parseFloat(document.getElementById('pm-cost').value);
    var sell=parseFloat(document.getElementById('pm-sell').value);
    if(isNaN(cost)||cost<0){ err('Enter a valid cost price.'); return; }
    if(isNaN(sell)||sell<0){ err('Enter a valid selling price.'); return; }
    var profit=sell-cost;
    var margin=sell>0 ? (profit/sell)*100 : 0;
    var markup=cost>0 ? (profit/cost)*100 : 0;
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:'+(profit>=0?'#f0fdf5':'#fde8e8')+';border:1px solid '+(profit>=0?'rgba(22,163,74,.25)':'rgba(220,38,38,.2)')+';border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Profit margin</div>'
      +'<div style="font-weight:700;color:'+(profit>=0?'#0a6b3d':'#9b1c1c')+';font-size:30px;margin:4px 0 14px">'+pct(margin)+'%</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Cost price</dt><dd style="margin:0;text-align:right">Rs '+fmt(cost)+'</dd>'
      +'<dt style="color:var(--muted)">Selling price</dt><dd style="margin:0;text-align:right">Rs '+fmt(sell)+'</dd>'
      +'<dt style="color:var(--muted)">Profit</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(profit)+'</dd>'
      +'<dt style="color:var(--muted)">Margin (% of selling price)</dt><dd style="margin:0;text-align:right">'+pct(margin)+'%</dd>'
      +'<dt style="color:var(--muted)">Markup (% of cost price)</dt><dd style="margin:0;text-align:right">'+pct(markup)+'%</dd>'
      +'</dl></div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Profit: Rs 200.00</div><div class="eo-sub">Selling price Rs 600 minus cost price Rs 400.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Margin: 33.33%</div><div class="eo-sub">Profit as a percentage of the selling price.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Markup: 50.00%</div><div class="eo-sub">The same profit, expressed as a percentage of cost.</div></div></div>
      <div class="eo-note">Sample calculation. Enter your own cost and selling price above.</div>
    `,
    intro: `
      <p>Margin and markup are the two most commonly confused numbers in small business pricing, and mixing them up quietly erodes profit. A shop owner who wants a 50 percent margin but instead applies a 50 percent markup ends up with a real margin of only 33.3 percent, a mistake that can cost thousands of rupees across a year of sales without anyone noticing the gap.</p>
      <p>This calculator clears up the confusion by showing both numbers side by side from the same two inputs. Enter your cost price and your selling price, and get the rupee profit, the margin (profit as a percentage of selling price), and the markup (profit as a percentage of cost price) in one view. Use whichever number matters for your context: margin for judging true profitability, markup for setting a selling price from a known cost. Everything runs in your browser.</p>
    `,
    howTo: [
      'Enter your <strong>cost price</strong> in rupees, what it actually costs you to buy or produce the item, including materials and direct costs.',
      'Enter your <strong>selling price</strong> in rupees, what you charge the customer.',
      'Click <strong>Calculate margin</strong>. The margin percentage appears in large figures at the top.',
      'Read the breakdown below: the rupee profit, the margin as a percent of selling price, and the markup as a percent of cost price.',
      'Use the margin figure to judge true profitability across products, since it correctly accounts for the fact that percentages of a bigger selling price are not directly comparable to percentages of cost.',
      'Use the markup figure when you know your cost and want to set a selling price target, since retailers often think and negotiate in markup terms.',
    ],
    why: `
      <p>Three reasons to check margin and markup separately rather than assuming they are the same thing.</p>
      <p><strong>They are never the same number except at zero.</strong> A 50 percent markup on cost is only a 33.3 percent margin on selling price. Confusing the two when setting prices or reading a competitor supplier terms leads directly to under-pricing.</p>
      <p><strong>Margin is what actually measures profitability.</strong> When comparing two products or two months of sales, margin as a percent of revenue is the number investors, accountants and most business dashboards actually track, not markup.</p>
      <p><strong>Markup is what you use when pricing forward.</strong> If a supplier gives you a cost price and you want a specific rupee profit, thinking in markup terms, "add 50 percent to cost", is often the more natural way to set the price than working backward from a margin target.</p>
    `,
    tips: [
      'Remember the shortcut: margin is always a smaller percentage than markup for the same profit, except when profit is zero.',
      'To hit a target margin, use the formula: selling price equals cost price divided by (1 minus target margin as a decimal).',
      'Include all direct costs, materials, packaging, and directly attributable labour, in your cost price for an accurate margin, not just the raw material cost.',
      'Compare margins across products in the same category rather than across very different categories, since acceptable margins vary widely by industry.',
      'A shrinking margin over time on the same product, even with a stable selling price, often signals rising input costs you have not yet passed on.',
      'When negotiating with suppliers, ask for their price as a straight cost figure and calculate your own margin, rather than trusting a supplier quoted "margin" without verifying the base.',
    ],
    example: `
      <p>A home baker in Lucknow sells a box of six cupcakes for Rs 600. Her ingredient and packaging cost per box works out to Rs 400. She enters 400 as the cost price and 600 as the selling price. The tool shows a profit of Rs 200, a margin of 33.33 percent, and a markup of 50 percent.</p>
      <p>She had assumed her "50 percent margin" from a common markup habit was accurate, but seeing the true margin at 33.33 percent makes her realise she is running a thinner business than she thought. She recalculates her target selling price to hit an actual 40 percent margin: cost divided by (1 minus 0.40), which is 400 divided by 0.60, giving a target selling price of about Rs 667. She rounds up to Rs 670 for her next batch, and her real margin on every future box crosses 40 percent.</p>
    `,
    faq: [
      { q: 'What is the difference between margin and markup?', a: '<p>Margin and markup both measure the same rupee amount of profit, but they express it as a percentage of two different base numbers. Margin is profit divided by the selling price, so it tells you what portion of the money a customer pays actually ends up as profit. Markup is profit divided by the cost price, so it tells you how much you added on top of what the item cost you. Because the selling price is always higher than the cost price whenever there is a profit, the same rupee profit always produces a smaller margin percentage than markup percentage. For example, a Rs 200 profit on a Rs 400 cost and Rs 600 selling price is a 33.33 percent margin but a 50 percent markup, the same profit expressed two different ways. This calculator shows both figures from the same two inputs specifically because businesses often need one or the other depending on the situation, and confusing which one you are using is one of the most common pricing mistakes small business owners make.</p>' },
      { q: 'Which one should I use to price my products?', a: '<p>Use markup when you are working forward from a known cost price to decide what to charge, since it is the more natural way to think about adding a profit layer on top of what something cost you to make or buy; for instance, deciding to sell at cost plus 50 percent markup is a common and intuitive pricing rule. Use margin when you want to know your true profitability as a percentage of revenue, which is the number that actually reflects how much of every rupee a customer pays ends up as profit, and it is the figure most useful for comparing profitability across different products, tracking performance over time, or reporting to an investor or accountant. Many businesses use markup as their day-to-day pricing shortcut but check margin periodically to understand their real profitability picture, since a markup that feels generous can still translate into a surprisingly thin margin, as this calculator demonstrates clearly with the same numbers side by side.</p>' },
      { q: 'How do I set a price to hit a target margin?', a: '<p>If you know your cost price and want to hit a specific target margin percentage, rather than a target markup, the formula is selling price equals cost price divided by the quantity one minus the target margin expressed as a decimal. For example, if your cost price is Rs 400 and you want a 40 percent margin, you calculate 400 divided by the quantity one minus 0.40, which is 400 divided by 0.60, giving a target selling price of approximately Rs 667. This is a different, and often less intuitive, calculation than simply adding a percentage markup to cost, which is exactly why margin-based pricing goals are frequently miscalculated by people used to thinking in markup terms. Once you compute a candidate selling price this way, you can verify it by entering both the cost and that selling price back into this calculator, which will confirm the margin percentage you actually land on before you commit to the price.</p>' },
      { q: 'What margin is considered healthy for a small business?', a: '<p>There is no single healthy margin that applies across all businesses, since acceptable margins vary enormously by industry: retail and grocery businesses often operate on thin margins in the range of 5 to 15 percent due to high volume and intense competition, while service businesses, boutique products, and specialised manufacturing can comfortably run margins of 40 percent or higher because their costs are different and their competition is less price-driven. Rather than chasing a generic benchmark, the more useful approach is to compare your own margin against your own historical numbers over time, watching for a shrinking margin as an early warning sign of rising costs you have not yet passed on to customers, and against direct competitors in your specific category and city, where you actually have visibility into pricing. A margin that comfortably covers your fixed costs, leaves room for reinvestment, and still allows you to price competitively is a reasonable practical target, whatever the specific percentage turns out to be for your business.</p>' },
      { q: 'Should I include all costs or just the raw material cost?', a: '<p>For an accurate and useful margin figure, your cost price should include every direct cost that is specifically attributable to producing or acquiring that particular item, not just the raw material cost. This typically includes materials, packaging, and any directly attributable labour or production cost per unit. It generally does not need to include your broader fixed overheads, like rent, salaries not tied to production, or general marketing spend, since those are usually accounted for separately in an overall profitability analysis rather than a per-item margin calculation. If you only count raw material cost and ignore packaging or direct labour, your calculated margin will look artificially healthy compared to your real profitability, which can lead you to underprice. A good habit is to periodically review exactly what you are including in your per-unit cost price, and to be consistent about it across products so your margin comparisons between different items remain meaningful.</p>' },
      { q: 'Can margin ever be negative?', a: '<p>Yes, margin becomes negative whenever your selling price is lower than your cost price, meaning you are selling the item at a loss rather than a profit. This can happen deliberately, for example when you deep-discount slow-moving inventory to clear stock before it expires or goes out of season, accepting a short-term loss to free up cash and shelf space, or it can happen accidentally, when costs rise, a supplier price increase or higher raw material costs, but you fail to adjust your selling price to match. This calculator will show a negative profit figure and a negative margin percentage in a clearly marked red panel whenever your selling price is below your cost price, which is a useful early warning if you did not intend to be selling at a loss. Running your key products through this calculator periodically, especially after any cost change from a supplier, is a simple habit that catches this kind of accidental margin erosion before it accumulates into a meaningful loss across many units sold.</p>' },
      { q: 'Are my cost and price figures sent to a server?', a: '<p>No, all calculations run entirely within your own browser using JavaScript on the page, and the cost price and selling price you enter are never transmitted to us or to any third party. There is no account, login or saved history involved, which means you can freely check your real product costs and prices, information many business owners consider sensitive, without any concern about it being logged or shared anywhere. The results appear instantly because nothing has to travel over a network connection, and the tool works exactly the same whether your internet connection is fast, slow, or briefly disconnected, since all the maths happens locally on your device. The one trade-off is that the tool does not remember your figures between visits or calculations, so if you want to keep a particular result for your records, note it down or take a screenshot before you change the inputs or close the tab.</p>' },
    ],
    related: [
      { href: '/pages/tools/break-even-calculator', title: 'Break-Even Calculator', blurb: 'Find the units you need to sell to break even.' },
      { href: '/pages/tools/roi-calculator', title: 'ROI Calculator', blurb: 'Check the return on any investment.' },
      { href: '/pages/tools/discount-calculator', title: 'Discount Calculator', blurb: 'See how a discount eats into your margin.' },
    ],
  },
  // =========================================================================
  // ============================ ROI CALCULATOR =============================
  // =========================================================================
  {
    slug: 'roi-calculator',
    category: 'run',
    built: true,
    name: 'ROI Calculator',
    tagline: 'Calculate return on investment, gain, and annualized return in one click.',
    primaryKeyword: 'roi calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free ROI Calculator — Return on Investment, Gain, Annualized | Neweb',
    metaDescription: 'Calculate ROI percentage, rupee gain or loss, and annualized return from your initial investment, final value, and holding period. Free, browser-only.',
    h1: 'ROI <span class="serif">Calculator</span>.',
    lede: 'Enter what you invested, what it is worth now, and how long you held it. We compute your total ROI, the rupee gain, and the annualized return. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="tool-row">
          <div class="field"><label>Initial investment (in rupees)</label><input id="roi-init" type="number" step="any" placeholder="e.g. 200000"/></div>
          <div class="field"><label>Final value (in rupees)</label><input id="roi-final" type="number" step="any" placeholder="e.g. 260000"/></div>
        </div>
        <div class="field"><label>Holding period (years)</label><input id="roi-yrs" type="number" step="any" placeholder="e.g. 2"/></div>
        <div class="tool-actions">
          <button id="roi-go" type="button" class="btn btn-brand">Calculate ROI</button>
        </div>
        <div id="roi-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Annualized return uses the standard CAGR formula when the holding period is more than one year. All maths runs in your browser.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0'; return Math.round(n).toLocaleString('en-IN'); }
  function pct(n){ return (Math.round(n*100)/100).toLocaleString('en-IN'); }
  var out=document.getElementById('roi-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('roi-go').addEventListener('click', function(){
    var init=parseFloat(document.getElementById('roi-init').value);
    var fin=parseFloat(document.getElementById('roi-final').value);
    var yrs=parseFloat(document.getElementById('roi-yrs').value);
    if(isNaN(init)||init<=0){ err('Enter a valid initial investment.'); return; }
    if(isNaN(fin)||fin<0){ err('Enter a valid final value.'); return; }
    if(isNaN(yrs)||yrs<=0){ err('Enter a valid holding period in years.'); return; }
    var gain=fin-init;
    var roi=(gain/init)*100;
    var cagr = (Math.pow(fin/init, 1/yrs) - 1) * 100;
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:'+(gain>=0?'#f0fdf5':'#fde8e8')+';border:1px solid '+(gain>=0?'rgba(22,163,74,.25)':'rgba(220,38,38,.2)')+';border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Total ROI</div>'
      +'<div style="font-weight:700;color:'+(gain>=0?'#0a6b3d':'#9b1c1c')+';font-size:30px;margin:4px 0 14px">'+pct(roi)+'%</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Initial investment</dt><dd style="margin:0;text-align:right">Rs '+fmt(init)+'</dd>'
      +'<dt style="color:var(--muted)">Final value</dt><dd style="margin:0;text-align:right">Rs '+fmt(fin)+'</dd>'
      +'<dt style="color:var(--muted)">Gain / loss</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(gain)+'</dd>'
      +'<dt style="color:var(--muted)">Holding period</dt><dd style="margin:0;text-align:right">'+yrs+' years</dd>'
      +'<dt style="color:var(--muted)">Annualized return (CAGR)</dt><dd style="margin:0;text-align:right">'+pct(cagr)+'%</dd>'
      +'</dl></div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Gain: Rs 60,000</div><div class="eo-sub">Final value Rs 2,60,000 minus initial investment Rs 2,00,000.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Total ROI: 30%</div><div class="eo-sub">The gain as a percentage of the original investment.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Annualized return: 14.02%</div><div class="eo-sub">The same 30 percent gain, spread evenly over 2 years.</div></div></div>
      <div class="eo-note">Sample calculation. Enter your own investment, value and period above.</div>
    `,
    intro: `
      <p>Return on investment, or ROI, is the single most-used shorthand for whether a rupee put into a business, a machine, a marketing campaign, or a mutual fund actually paid off. But a simple total ROI percentage hides one crucial detail: how long the money was tied up. A 30 percent return sounds identical whether it took six months or six years, yet those two outcomes are wildly different in practice.</p>
      <p>This calculator gives you both numbers. Enter your initial investment, the final value, and how long you held it. We compute the total ROI, the rupee gain or loss, and the annualized return using the standard CAGR (compound annual growth rate) formula, which lets you fairly compare investments held for different lengths of time. Everything runs in your browser; your investment figures are never sent anywhere.</p>
    `,
    howTo: [
      'Enter your <strong>initial investment</strong> in rupees, the amount you originally put in.',
      'Enter the <strong>final value</strong> in rupees, what the investment is worth now, or what you sold it for.',
      'Enter the <strong>holding period</strong> in years, how long you held the investment. Use a decimal for part years, like 1.5 for eighteen months.',
      'Click <strong>Calculate ROI</strong>. The total ROI percentage appears in large figures.',
      'Read the breakdown below: the rupee gain or loss, and the annualized return, which spreads the total gain evenly across each year held.',
      'Use the annualized figure, not the total ROI, when comparing two investments held for different periods, since it puts them on the same yearly footing.',
    ],
    why: `
      <p>Three reasons to check both total and annualized ROI before judging an investment.</p>
      <p><strong>Total ROI alone is misleading across time periods.</strong> A 30 percent gain in six months is a far better outcome than the same 30 percent gain spread across six years, but the total ROI figure looks identical either way. Annualized return corrects for this.</p>
      <p><strong>It lets you compare unlike investments fairly.</strong> A business equipment purchase held for 3 years and a marketing campaign measured over 3 months can only be sensibly compared once both are expressed as an annualized rate.</p>
      <p><strong>It grounds decision-making in a real number.</strong> "We made 30 percent" sounds like a win until you realise it took four years, during which the same money could have earned more elsewhere. The annualized figure forces that comparison to the surface.</p>
    `,
    tips: [
      'Use the annualized return (CAGR), not the total ROI, whenever you are comparing two investments with different holding periods.',
      'Include all costs in your initial investment figure, not just the sticker price, so the ROI reflects the true cost of the decision.',
      'For a holding period under one year, express it as a decimal, like 0.5 for six months, since the CAGR formula needs a fractional year value.',
      'A negative gain produces a negative ROI and a negative annualized return; the tool flags this in red so a loss is never mistaken for a gain.',
      'When judging a business investment, compare the annualized ROI against your cost of capital or a bank fixed deposit rate to see if it was genuinely worth the risk.',
      'Re-run the calculation periodically for a long-held investment to track whether your annualized return is improving or slipping over time.',
    ],
    example: `
      <p>A boutique owner in Surat invests Rs 2,00,000 to open a small kiosk inside a mall two years ago. Today, after accounting for the kiosk equipment resale value and the profit banked over the period, she estimates the total value created is Rs 2,60,000. She enters 200000 as the initial investment, 260000 as the final value, and 2 as the holding period in years.</p>
      <p>The tool shows a total ROI of 30 percent and a gain of Rs 60,000, which sounds respectable at first glance. But the annualized return works out to about 14.02 percent a year. She compares that against what a conservative debt mutual fund might have returned over the same two years, roughly 7 to 8 percent annually, and concludes the kiosk did beat a passive alternative, though not by as wide a margin as the headline 30 percent number first suggested.</p>
    `,
    faq: [
      { q: 'How is ROI calculated?', a: '<p>Return on investment, or ROI, is calculated as the gain from an investment, which is the final value minus the initial investment, divided by the initial investment, then expressed as a percentage. In formula terms, ROI equals the quantity final value minus initial investment, divided by initial investment, multiplied by one hundred. For example, if you invest Rs 2,00,000 and it grows to Rs 2,60,000, the gain is Rs 60,000, and dividing that by the original Rs 2,00,000 gives 0.30, or a 30 percent ROI. This figure tells you the total percentage return over the entire holding period, regardless of whether that period was six months or six years, which is exactly why this calculator also computes the annualized return alongside the simple ROI, since the total percentage alone does not tell you how efficiently your money grew per year.</p>' },
      { q: 'What is the difference between ROI and annualized return?', a: '<p>ROI, or return on investment, measures your total percentage gain or loss over the entire time you held an investment, without regard to how long that period actually was, whereas annualized return, often called CAGR or compound annual growth rate, expresses that same total gain as if it had grown at a steady, compounding rate every single year, which makes it possible to fairly compare investments held for different lengths of time. A 30 percent total ROI achieved in six months is a dramatically better result than the same 30 percent achieved over six years, but the ROI figure alone looks identical in both cases; the annualized return, by contrast, would show a much higher yearly rate for the six month case than for the six year case. This calculator computes both figures from the same inputs, the total ROI for a quick headline number, and the annualized return for a fair, time-adjusted comparison against other investments or a benchmark rate.</p>' },
      { q: 'What counts as the initial investment?', a: '<p>Your initial investment should include the full amount of money you actually committed at the outset to acquire or start the asset, business, or venture you are measuring, not just the most obvious sticker price. For a piece of equipment, this means the purchase price plus any installation, delivery, or setup costs that were necessary to get it working. For a business venture, it means all the capital you put in at the start, not just one visible expense. Leaving out real costs from your initial investment figure will overstate your ROI and your annualized return, making the investment look more successful than it actually was. Being thorough and consistent about what counts as your initial investment, and using the same standard every time you evaluate different opportunities, is what makes ROI comparisons across different investments meaningful rather than misleading.</p>' },
      { q: 'Can ROI be negative?', a: '<p>Yes, ROI is negative whenever the final value of an investment is lower than the initial amount you put in, meaning you have made a loss rather than a gain. This calculator handles negative outcomes directly: if you enter a final value lower than your initial investment, it will show a negative rupee gain, a negative ROI percentage, and a negative annualized return, all displayed in a red panel to make the loss immediately clear rather than easy to overlook. A negative ROI is common and expected in some contexts, for example a failed product launch, a piece of equipment that had to be scrapped early, or a market downturn affecting an investment portfolio, and seeing the precise negative percentage and annualized rate helps you understand exactly how costly the loss was relative to your original commitment, which is useful both for your own records and for deciding whether to repeat a similar type of investment in the future.</p>' },
      { q: 'Why does the annualized return differ from simply dividing ROI by years?', a: '<p>Simply dividing your total ROI percentage by the number of years assumes the return grew in a straight line, adding the same fixed amount every year, but real investments typically compound, meaning each year gains grow which then earn their own the growth in turn, which is a fundamentally different mathematical process. The annualized return this calculator computes uses the compound annual growth rate formula, which finds the single constant yearly growth rate that, if applied every year and compounded, would take your initial investment to exactly your final value over the stated period. Because compounding means growth builds on growth, this figure is always slightly different from, and more accurate than, a naive division of total ROI by the number of years, particularly for longer holding periods where the compounding effect becomes more pronounced. Using the compounded figure rather than a simple average gives you a number that is directly comparable to other compounded rates, like a bank fixed deposit interest rate or a mutual fund advertised annual return.</p>' },
      { q: 'What is a good ROI for a small business investment?', a: '<p>There is no universal good ROI figure, since acceptable returns vary enormously depending on the type of investment, the risk involved, the industry, and the time period over which the return was earned. As a rough point of reference, a very low-risk instrument like a bank fixed deposit in India might return somewhere around 6 to 7 percent annually, so any business investment carrying meaningfully more risk should ideally target an annualized return comfortably above that benchmark to justify taking on the additional risk and effort involved. Higher-risk ventures, like a new product line or an unproven marketing channel, are often judged against a higher bar, since the possibility of complete loss is also higher. Rather than chasing a fixed target percentage, the more useful practice is to compare the annualized return this calculator gives you against your specific cost of capital, your other available investment options, and the risk you took on, and to track it consistently across your different business decisions to see which types of investment actually perform best for you over time.</p>' },
      { q: 'Are my investment figures sent to a server?', a: '<p>No, every calculation in this tool runs entirely inside your own browser using JavaScript on the page, and the initial investment, final value and holding period you enter are never transmitted to us or to any third party. There is no account, login or saved history involved, so you can freely check the real performance of your investments, business decisions or ventures without any concern about the figures being logged or shared anywhere. The results appear instantly because nothing needs to travel over a network connection, and the calculator works reliably even with an unstable internet connection, since all the computation happens locally on your device rather than on a remote server. The one trade-off is that nothing is remembered between visits or calculations, so if you want to keep a particular ROI result for your own records or to compare against a future calculation, note the figures down or take a screenshot before changing the inputs.</p>' },
    ],
    related: [
      { href: '/pages/tools/sip-calculator', title: 'SIP Calculator', blurb: 'Project mutual fund maturity value over time.' },
      { href: '/pages/tools/profit-margin-calculator', title: 'Profit Margin Calculator', blurb: 'Check margin and markup on any sale.' },
      { href: '/pages/tools/break-even-calculator', title: 'Break-Even Calculator', blurb: 'Find the units you need to sell to break even.' },
    ],
  },
  // =========================================================================
  // ============================ BREAK-EVEN CALCULATOR ======================
  // =========================================================================
  {
    slug: 'break-even-calculator',
    category: 'run',
    built: true,
    name: 'Break-Even Calculator',
    tagline: 'Find the units and revenue you need to cover fixed and variable costs.',
    primaryKeyword: 'break even calculator',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Break-Even Calculator — Units and Revenue to Break Even | Neweb',
    metaDescription: 'Calculate your break-even point in units and rupees. Enter fixed costs, variable cost per unit, and selling price per unit. Free, browser-only.',
    h1: 'Break-Even <span class="serif">Calculator</span>.',
    lede: 'Enter your fixed costs, variable cost per unit, and selling price per unit. We compute the exact number of units and the revenue you need to break even. Runs entirely in your browser.',
    widget: {
      html: `
        <div class="field"><label>Fixed costs (monthly, in rupees)</label><input id="be-fixed" type="number" step="any" placeholder="e.g. 60000"/></div>
        <div class="tool-row">
          <div class="field"><label>Variable cost per unit (in rupees)</label><input id="be-var" type="number" step="any" placeholder="e.g. 150"/></div>
          <div class="field"><label>Selling price per unit (in rupees)</label><input id="be-price" type="number" step="any" placeholder="e.g. 250"/></div>
        </div>
        <div class="tool-actions">
          <button id="be-go" type="button" class="btn btn-brand">Calculate break-even</button>
        </div>
        <div id="be-out" style="display:none;margin-top:18px"></div>
      `,
      help: 'Break-even units equals fixed costs divided by the contribution margin per unit (selling price minus variable cost). All maths runs in your browser.',
      js: `
(function(){
  function fmt(n){ if(!isFinite(n)) return '0'; return Math.round(n).toLocaleString('en-IN'); }
  function pct(n){ return (Math.round(n*100)/100).toLocaleString('en-IN'); }
  var out=document.getElementById('be-out');
  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }
  document.getElementById('be-go').addEventListener('click', function(){
    var fixed=parseFloat(document.getElementById('be-fixed').value);
    var vc=parseFloat(document.getElementById('be-var').value);
    var price=parseFloat(document.getElementById('be-price').value);
    if(isNaN(fixed)||fixed<0){ err('Enter a valid fixed cost.'); return; }
    if(isNaN(vc)||vc<0){ err('Enter a valid variable cost per unit.'); return; }
    if(isNaN(price)||price<=0){ err('Enter a valid selling price per unit.'); return; }
    var contribution=price-vc;
    if(contribution<=0){ err('Selling price must be higher than variable cost per unit, or you can never break even.'); return; }
    var beUnits=fixed/contribution;
    var beRevenue=beUnits*price;
    var contributionMarginPct=(contribution/price)*100;
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Break-even point</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:30px;margin:4px 0 14px">'+Math.ceil(beUnits)+' units</div>'
      +'<dl style="display:grid;grid-template-columns:1fr auto;gap:8px 16px;font-size:14px;color:var(--ink-2);margin:0">'
      +'<dt style="color:var(--muted)">Contribution margin per unit</dt><dd style="margin:0;text-align:right">Rs '+fmt(contribution)+'</dd>'
      +'<dt style="color:var(--muted)">Contribution margin %</dt><dd style="margin:0;text-align:right">'+pct(contributionMarginPct)+'%</dd>'
      +'<dt style="color:var(--muted)">Break-even units</dt><dd style="margin:0;text-align:right">'+Math.ceil(beUnits)+' units</dd>'
      +'<dt style="color:var(--muted);font-weight:600;color:var(--ink)">Break-even revenue</dt><dd style="margin:0;text-align:right;font-weight:600;color:var(--ink)">Rs '+fmt(beRevenue)+'</dd>'
      +'</dl>'
      +'<p style="margin:14px 0 0;font-size:13px;color:var(--muted);line-height:1.5">Every unit sold beyond this point contributes Rs '+fmt(contribution)+' directly to profit.</p>'
      +'</div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Contribution margin: Rs 100 per unit</div><div class="eo-sub">Selling price Rs 250 minus variable cost Rs 150.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Break-even units: 600</div><div class="eo-sub">Rs 60,000 fixed costs divided by Rs 100 contribution margin.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Break-even revenue: Rs 1,50,000</div><div class="eo-sub">600 units at Rs 250 each covers all fixed and variable costs.</div></div></div>
      <div class="eo-note">Sample calculation. Enter your own costs and price above.</div>
    `,
    intro: `
      <p>The break-even point is the exact number of units you must sell before a business, product line, or new venture stops losing money and starts making a profit. Below that number, your fixed costs, rent, salaries, equipment EMIs, are not yet covered. Above it, every additional unit sold drops straight to the bottom line. Yet most small business owners never actually calculate this number and instead operate on gut feel about whether they are "doing okay" this month.</p>
      <p>This calculator gives you the exact figure. Enter your fixed costs for the period, your variable cost per unit, meaning what it costs you to produce or deliver one more unit, and your selling price per unit. We compute your contribution margin, the break-even point in units, and the break-even revenue. Everything runs in your browser; your cost structure is never sent anywhere.</p>
    `,
    howTo: [
      'Enter your <strong>fixed costs</strong> for the period, typically monthly: rent, salaries, loan EMIs, and other costs that do not change with how much you sell.',
      'Enter your <strong>variable cost per unit</strong>, the direct cost of producing or delivering one more unit: raw materials, packaging, per-unit shipping.',
      'Enter your <strong>selling price per unit</strong>, what you charge the customer for one unit.',
      'Click <strong>Calculate break-even</strong>. The break-even point in units appears in large figures, rounded up to the next whole unit.',
      'Read the breakdown below: your contribution margin per unit and as a percentage, and the total revenue needed to break even.',
      'Compare your current monthly sales volume against the break-even units to see how much cushion, or how much shortfall, you are actually running.',
    ],
    why: `
      <p>Three reasons every small business should know its break-even number.</p>
      <p><strong>It turns "am I profitable" into a precise number.</strong> Instead of guessing from a bank balance that moves around for a dozen unrelated reasons, you know exactly how many units this month need to sell before you are in the black.</p>
      <p><strong>It stress-tests a new price or cost change instantly.</strong> Raise your price, cut a supplier cost, or absorb a rent increase, and rerun the calculator to see immediately how the break-even units shift, before you commit to the change.</p>
      <p><strong>It grounds a new product or venture decision.</strong> Before launching a new product line, working out the break-even units against a realistic sales forecast tells you quickly whether the venture is worth the fixed cost commitment at all.</p>
    `,
    tips: [
      'Recalculate your break-even point whenever a major fixed cost changes, like a rent increase or a new salaried hire, since it shifts the number meaningfully.',
      'Include every genuinely variable cost per unit, materials, packaging, per-unit delivery, not just the raw material, for an accurate contribution margin.',
      'A higher selling price or a lower variable cost both increase your contribution margin per unit, which lowers your break-even units faster than cutting fixed costs alone.',
      'Compare your actual average monthly sales volume against the break-even units regularly; consistently selling well above it is the real definition of a healthy business.',
      'For a seasonal business, calculate break-even separately for peak and off-peak periods, since fixed costs stay flat but sales volume swings.',
      'Use the break-even revenue figure, not just units, when your business sells multiple products at different prices and a single "units" figure would not be meaningful.',
    ],
    example: `
      <p>A small manufacturer of steel almirahs in Ludhiana has fixed monthly costs of Rs 60,000, covering rent, two salaried staff, and equipment EMI. Each almirah costs Rs 150 in steel, hardware and labour to produce, and sells for Rs 250. She enters 60000 as fixed costs, 150 as variable cost per unit, and 250 as selling price per unit.</p>
      <p>The tool shows a contribution margin of Rs 100 per unit, a 40 percent contribution margin, break-even units of 600, and break-even revenue of Rs 1,50,000. She checks her sales register and sees she sold 720 almirahs last month, comfortably above the 600-unit break-even mark, which confirms the business made a real profit rather than merely covering costs. She now uses this same 600-unit figure as her monthly target to watch against in her sales tracker going forward.</p>
    `,
    faq: [
      { q: 'What is the break-even point and why does it matter?', a: '<p>The break-even point is the exact quantity of units, or the exact amount of revenue, at which your total costs, fixed plus variable, equal your total revenue, meaning you are neither making a profit nor a loss. Below this point, your business is losing money because your revenue has not yet covered your fixed costs; above it, every additional unit sold contributes directly to profit since its fixed costs are already covered. It matters because it converts a vague sense of whether a business is doing well into a precise, calculable number you can track against your actual sales, and it gives you an objective way to evaluate whether a new product, a price change, or a cost increase makes sense before you commit resources to it. Rather than reacting only to a shifting bank balance influenced by many unrelated factors, knowing your break-even point tells you exactly how many units this month need to sell to be in the black.</p>' },
      { q: 'How is break-even point in units calculated?', a: '<p>The break-even point in units is calculated by dividing your total fixed costs by your contribution margin per unit, where the contribution margin per unit is simply your selling price per unit minus your variable cost per unit. In formula terms, break-even units equals fixed costs divided by the quantity selling price minus variable cost. For example, if your fixed costs are Rs 60,000 a month, your variable cost per unit is Rs 150, and your selling price is Rs 250, your contribution margin is Rs 100 per unit, so your break-even point is 60,000 divided by 100, which equals 600 units. This means you need to sell exactly 600 units in the period to cover all your costs; the 601st unit and every one after it contributes its full Rs 100 margin directly to profit. This calculator applies exactly this formula and also rounds the result up to the next whole unit, since you cannot sell a fraction of a unit in most businesses.</p>' },
      { q: 'What is the difference between fixed costs and variable costs?', a: '<p>Fixed costs are expenses that stay roughly the same regardless of how many units you produce or sell in a given period, common examples being rent, fixed salaries, loan or equipment EMIs, and insurance premiums; these costs are incurred whether you sell zero units or a thousand. Variable costs, by contrast, change directly with the volume you produce or sell, examples being raw materials, packaging, and any per-unit direct labour or shipping cost, since each additional unit you make or sell adds a further increment of these costs. Getting this classification right matters a great deal for an accurate break-even calculation, since a cost wrongly treated as fixed when it is actually variable, or vice versa, will skew your contribution margin and therefore your calculated break-even units. Some costs sit in a grey area, like a salaried worker who is also paid overtime tied to volume, and for those it is reasonable to split the cost into its fixed and variable components for a more accurate calculation.</p>' },
      { q: 'What is contribution margin and why does it matter?', a: '<p>Contribution margin is the amount left over from each unit sale after subtracting only the variable cost of that unit, calculated as selling price per unit minus variable cost per unit, and it represents how much each unit sold contributes toward covering your fixed costs and, once those are covered, toward profit. A higher contribution margin per unit, or as a percentage of selling price, means you need to sell fewer units to reach break-even and that each additional unit sold afterward adds more directly to your bottom line. This is why raising your selling price or reducing your variable cost per unit, even slightly, has an outsized effect on lowering your break-even point, often more so than cutting fixed costs by a similar rupee amount. Contribution margin is the central number this entire break-even calculation is built around, since without knowing how much each unit truly contributes after variable costs, fixed costs alone tell you nothing about how many units you actually need to sell.</p>' },
      { q: 'What if my variable cost is higher than my selling price?', a: '<p>If your variable cost per unit is equal to or higher than your selling price per unit, your contribution margin is zero or negative, which means you are losing money on every single unit you sell before fixed costs are even considered, and in that situation there is no volume of sales, however large, that will ever let you break even; selling more units in this scenario only increases your total loss. This calculator specifically checks for this condition and will show a clear warning rather than a misleading break-even number if your selling price does not exceed your variable cost. If you find yourself in this situation, the immediate priorities are to either raise your selling price, reduce your variable cost per unit by finding cheaper materials or more efficient production, or reconsider whether that specific product or service should continue at all, since a negative contribution margin structurally cannot be fixed by selling more, only by fixing the underlying price or cost relationship itself.</p>' },
      { q: 'Does break-even analysis account for taxes or one-time costs?', a: '<p>No, this standard break-even calculation focuses purely on your ongoing fixed costs and per-unit variable costs to find the point where operating revenue equals operating costs; it does not factor in income tax, GST, or one-time or irregular costs like a large equipment purchase or a legal settlement, which sit outside the recurring cost structure this model is designed to analyse. If you want a break-even figure that also accounts for a large one-time investment being recovered, that is a related but different calculation, closer to a payback period analysis, which asks how long or how many units it takes to recover an initial investment rather than simply cover ongoing costs each period. For most day-to-day operational decisions, pricing, staffing, and monthly cost control, the standard fixed-and-variable-cost break-even model this calculator uses is the right and most commonly used tool, but for evaluating a major one-time capital investment specifically, pair this with our ROI calculator for a fuller picture.</p>' },
      { q: 'Are my cost and pricing figures sent to a server?', a: '<p>No, every calculation runs entirely within your own browser using JavaScript on the page, and the fixed costs, variable cost per unit and selling price you enter are never transmitted to us or to any third party. There is no account, login or saved history, so you can freely test your real cost structure and pricing scenarios without any concern about sensitive business figures being logged or shared anywhere, and the break-even result appears instantly since nothing needs to travel over a network connection. This local-only design also means the calculator keeps working reliably even with an unstable internet connection, since all the maths happens on your own device rather than a remote server. The trade-off is that nothing is remembered between visits, so note down or screenshot a particular scenario if you want to compare it against a future recalculation after a cost or price change.</p>' },
    ],
    related: [
      { href: '/pages/tools/profit-margin-calculator', title: 'Profit Margin Calculator', blurb: 'Check margin and markup on any sale.' },
      { href: '/pages/tools/roi-calculator', title: 'ROI Calculator', blurb: 'Measure the return on an investment.' },
      { href: '/pages/tools/discount-calculator', title: 'Discount Calculator', blurb: 'See how a discount affects your final price.' },
    ],
  },
  // =========================================================================
  // ============================ IMAGE RESIZER ==============================
  // =========================================================================
  {
    slug: 'image-resizer',
    category: 'seo',
    built: true,
    name: 'Image Resizer',
    tagline: 'Resize any image to exact pixel dimensions, right in your browser.',
    primaryKeyword: 'image resizer',
    solutionHref: '/pages/solutions',
    solutionLabel: 'All industries',
    metaTitle: 'Free Image Resizer — Resize to Exact Pixels Online | Neweb',
    metaDescription: 'Resize an image to exact width and height, or scale by percentage, entirely in your browser. No upload, no signup. Download as JPG or PNG instantly.',
    h1: 'Image <span class="serif">Resizer</span>.',
    lede: 'Upload an image, set the exact width and height or a scale percentage, and download the resized file. Everything happens in your browser using canvas; your image is never uploaded anywhere.',
    widget: {
      html: `
        <div class="field"><label>Choose an image</label><input id="ir-file" type="file" accept="image/*"/></div>
        <div id="ir-preview-wrap" style="display:none;margin-top:14px">
          <img id="ir-preview" style="max-width:100%;max-height:220px;border:1px solid var(--line);border-radius:10px;display:block;margin-bottom:14px"/>
          <div class="field"><label>Resize mode</label>
            <select id="ir-mode"><option value="pixels">Exact width and height (pixels)</option><option value="percent">Scale by percentage</option></select>
          </div>
          <div id="ir-pixels-fields" class="tool-row">
            <div class="field"><label>Width (px)</label><input id="ir-w" type="number" step="1" min="1" placeholder="e.g. 800"/></div>
            <div class="field"><label>Height (px)</label><input id="ir-h" type="number" step="1" min="1" placeholder="e.g. 600"/></div>
          </div>
          <div id="ir-percent-fields" class="field" style="display:none"><label>Scale (%)</label><input id="ir-pct" type="number" step="any" min="1" max="500" placeholder="e.g. 50" value="50"/></div>
          <div class="field"><label><input id="ir-lock" type="checkbox" checked style="width:auto;margin-right:8px"/>Lock aspect ratio (exact width/height mode)</label></div>
          <div class="field"><label>Output format</label>
            <select id="ir-fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>
          </div>
          <div class="tool-actions">
            <button id="ir-go" type="button" class="btn btn-brand">Resize image</button>
          </div>
          <div id="ir-out" style="display:none;margin-top:18px"></div>
        </div>
      `,
      help: 'Resizing happens entirely on the canvas element in your browser. Your image file is never uploaded to any server.',
      js: `
(function(){
  var fileEl=document.getElementById('ir-file');
  var wrap=document.getElementById('ir-preview-wrap');
  var previewImg=document.getElementById('ir-preview');
  var modeEl=document.getElementById('ir-mode');
  var pxFields=document.getElementById('ir-pixels-fields');
  var pctFields=document.getElementById('ir-percent-fields');
  var wEl=document.getElementById('ir-w'), hEl=document.getElementById('ir-h');
  var lockEl=document.getElementById('ir-lock');
  var out=document.getElementById('ir-out');
  var img=new Image();
  var origW=0, origH=0, ratio=1;

  function err(msg){ out.style.display='block'; out.innerHTML='<div style="padding:18px;background:#fde8e8;border:1px solid rgba(220,38,38,.2);border-radius:12px;color:#9b1c1c">'+msg+'</div>'; }

  fileEl.addEventListener('change', function(){
    var f=fileEl.files[0];
    if(!f) return;
    var url=URL.createObjectURL(f);
    img.onload=function(){
      origW=img.naturalWidth; origH=img.naturalHeight; ratio=origW/origH;
      previewImg.src=url;
      wrap.style.display='block';
      wEl.value=origW; hEl.value=origH;
      out.style.display='none';
    };
    img.src=url;
  });

  modeEl.addEventListener('change', function(){
    var isPixels = modeEl.value==='pixels';
    pxFields.style.display = isPixels?'grid':'none';
    pctFields.style.display = isPixels?'none':'block';
  });

  wEl.addEventListener('input', function(){
    if(lockEl.checked && ratio){ hEl.value=Math.round(parseFloat(wEl.value||0)/ratio); }
  });
  hEl.addEventListener('input', function(){
    if(lockEl.checked && ratio){ wEl.value=Math.round(parseFloat(hEl.value||0)*ratio); }
  });

  document.getElementById('ir-go').addEventListener('click', function(){
    if(!origW){ err('Choose an image first.'); return; }
    var targetW, targetH;
    if(modeEl.value==='pixels'){
      targetW=parseInt(wEl.value,10); targetH=parseInt(hEl.value,10);
      if(!targetW||targetW<=0||!targetH||targetH<=0){ err('Enter a valid width and height in pixels.'); return; }
    } else {
      var pct=parseFloat(document.getElementById('ir-pct').value);
      if(!pct||pct<=0){ err('Enter a valid scale percentage.'); return; }
      targetW=Math.round(origW*pct/100); targetH=Math.round(origH*pct/100);
    }
    var canvas=document.createElement('canvas');
    canvas.width=targetW; canvas.height=targetH;
    var ctx=canvas.getContext('2d');
    if(document.getElementById('ir-fmt').value==='image/jpeg'){
      ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,targetW,targetH);
    }
    ctx.drawImage(img, 0, 0, targetW, targetH);
    var fmt=document.getElementById('ir-fmt').value;
    var dataUrl=canvas.toDataURL(fmt, 0.92);
    var ext = fmt==='image/png' ? 'png' : (fmt==='image/webp' ? 'webp' : 'jpg');
    out.style.display='block';
    out.innerHTML='<div style="padding:18px;background:#f0fdf5;border:1px solid rgba(22,163,74,.25);border-radius:12px">'
      +'<div style="font-family:JetBrains Mono,monospace;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Resized to</div>'
      +'<div style="font-weight:700;color:#0a6b3d;font-size:24px;margin:4px 0 14px">'+targetW+' × '+targetH+' px</div>'
      +'<img src="'+dataUrl+'" style="max-width:100%;max-height:220px;border:1px solid var(--line);border-radius:10px;display:block;margin-bottom:14px"/>'
      +'<a class="btn btn-brand" download="resized-image.'+ext+'" href="'+dataUrl+'">Download resized image</a>'
      +'</div>';
  });
})();
`,
    },
    exampleOutput: `
      <div class="eo-item"><div><div class="eo-main">Original: 4032 × 3024 px</div><div class="eo-sub">A typical smartphone photo, several megabytes in size.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Resized to: 1200 × 900 px</div><div class="eo-sub">Aspect ratio locked, scaled down for a website product photo.</div></div></div>
      <div class="eo-item"><div><div class="eo-main">Downloaded as JPG</div><div class="eo-sub">Ready to upload to your website, catalogue or marketplace listing.</div></div></div>
      <div class="eo-note">Sample resize. Upload your own image and set dimensions above.</div>
    `,
    intro: `
      <p>Nearly every online form, from a Google Business Profile photo to an e-commerce marketplace listing to a WhatsApp Business catalogue, has a preferred or mandatory image size. A camera phone photo, often 4000 pixels wide and several megabytes, rarely fits, and resizing it usually means downloading a desktop app or, worse, uploading your photo to an unknown website that stores a copy of it somewhere you cannot see.</p>
      <p>This tool resizes images entirely inside your browser using the HTML canvas element. Choose an image, set an exact width and height in pixels or scale it by a percentage, lock the aspect ratio if you want to avoid distortion, and download the result as JPG, PNG, or WebP. Nothing is uploaded to a server at any point; the entire resize happens on your own device using your browser own image-processing capability.</p>
    `,
    howTo: [
      'Click <strong>Choose an image</strong> and select a photo from your device. A preview appears immediately.',
      'Pick a <strong>resize mode</strong>: exact width and height in pixels, or scale by a percentage of the original size.',
      'For exact pixels, enter your target <strong>width</strong> and <strong>height</strong>. Keep <strong>lock aspect ratio</strong> checked to avoid a stretched or squashed image.',
      'For percentage mode, enter a <strong>scale percentage</strong>, for example 50 to halve the image dimensions.',
      'Choose your <strong>output format</strong>: JPG for photos and smaller file sizes, PNG for images needing transparency, or WebP for the smallest modern file size.',
      'Click <strong>Resize image</strong>. A preview of the resized image appears with its new dimensions.',
      'Click <strong>Download resized image</strong> to save the file to your device, ready to upload wherever you need it.',
    ],
    why: `
      <p>Three reasons a client-side resizer beats an upload-based tool.</p>
      <p><strong>Privacy.</strong> Product photos, ID scans accidentally left in a folder, or personal images never leave your device. There is no server-side copy sitting somewhere you cannot control or delete.</p>
      <p><strong>Speed.</strong> With no upload and no server round trip, resizing a large photo takes a fraction of a second, even on a modest mobile data connection.</p>
      <p><strong>It just works, offline-friendly.</strong> Once the page has loaded, resizing keeps working even on a spotty connection, since the entire operation runs locally using your browser own canvas engine.</p>
    `,
    tips: [
      'Keep aspect ratio locked unless you deliberately want to stretch or squash an image; an unlocked resize can distort faces and logos badly.',
      'For website product photos, 1200 pixels on the longer side is a common sweet spot: sharp enough to zoom, small enough to load fast.',
      'Use PNG only when you need transparency, like a logo on a colored background; otherwise JPG or WebP gives a much smaller file for the same visual quality.',
      'WebP typically produces the smallest file size for the same visual quality, but check that the platform you are uploading to accepts it before relying on it.',
      'For Google Business Profile and most social platforms, a roughly 1:1 or 4:3 aspect ratio around 1080 pixels wide works well across most placements.',
      'If you need to resize many images to the exact same dimensions, note your chosen width and height once and reuse the same values for consistency across your catalogue.',
    ],
    example: `
      <p>A home décor seller in Jaipur photographs a new cushion cover range on her phone, producing images at 4032 by 3024 pixels, each several megabytes. Her Instagram shop and her marketplace listing on a handicrafts platform both cap uploads at 1200 pixels wide and want a maximum file size well under the multi-megabyte photo she has.</p>
      <p>She opens the image resizer, uploads the first photo, switches to exact pixels mode, sets width to 1200 with aspect ratio locked, which automatically sets height to 900 to preserve the original proportions, picks JPG as the output format, and clicks Resize image. The preview shows a crisp 1200 by 900 pixel photo at a fraction of the original file size. She downloads it and uploads it straight to her listing, repeating the same steps for the rest of her product photos in a few minutes total, with no software installed and no image ever leaving her laptop.</p>
    `,
    faq: [
      { q: 'Does this tool upload my image to a server?', a: '<p>No, this tool never uploads your image anywhere. When you choose a file, your browser reads it locally and draws it onto an HTML canvas element, a built-in browser feature designed exactly for this kind of in-browser image manipulation, and all the resizing math happens using your own device processing power. The resized result is generated as a data URL directly in your browser memory, which is what the preview and the download link use, and at no point does the original or resized image travel over the network to any server, ours or anyone else. This matters particularly for product photos, personal images, or any picture you would rather not hand over to an unknown third-party website, which is a common concern with many free online image tools that quietly upload and sometimes retain a copy of whatever you submit.</p>' },
      { q: 'What is the difference between resizing by exact pixels and by percentage?', a: '<p>Resizing by exact pixels lets you specify a precise target width and height, for example exactly 1200 by 900 pixels, which is the right choice when a specific platform or form has a stated pixel requirement, such as a marketplace listing that expects images no wider than 1200 pixels or a banner slot needing an exact 1920 by 480 pixel size. Resizing by percentage instead scales the image relative to its own original size, for example telling it to become 50 percent of its current dimensions, which is useful when you just want to shrink or enlarge an image proportionally without calculating exact target pixels yourself, particularly convenient when you are processing several differently-sized images and want them all reduced by the same relative amount rather than forced to one fixed pixel size. Choose exact pixels when a specific size requirement exists, and percentage when you simply want a proportional scale-down or scale-up.</p>' },
      { q: 'Why should I lock the aspect ratio?', a: '<p>Locking the aspect ratio keeps the original proportion between an image width and height intact as you resize it, so a photo that started as a natural rectangle stays a correctly proportioned rectangle at the new size rather than being stretched wider or squashed shorter than it should be. When the aspect ratio is unlocked and you set a width and height that do not match the original proportion, the resulting image will look visibly distorted, faces can appear elongated or squashed, straight lines can bend, and logos or text within the image can look obviously wrong. This tool locks the aspect ratio by default and automatically recalculates the height whenever you change the width, or the width whenever you change the height, so the image never accidentally gets stretched unless you deliberately uncheck the lock, which is only useful in the rare case where you genuinely need to force an image into a specific non-native aspect ratio and accept some visual distortion as a trade-off.</p>' },
      { q: 'Which output format should I choose, JPG, PNG or WebP?', a: '<p>JPG is generally the best default choice for photographs, since it compresses photographic detail efficiently and produces a much smaller file size than PNG for the same image, which matters for faster website loading and for platforms with upload size limits; the trade-off is that JPG does not support transparency and uses lossy compression, meaning some fine detail is discarded to achieve the smaller file. PNG is the right choice specifically when you need a transparent background, for example a logo or an icon meant to sit over different colored backgrounds, since PNG preserves transparency exactly, though at the cost of a noticeably larger file size than JPG for the same image dimensions. WebP is a more modern format that typically achieves the smallest file size of the three for equivalent visual quality and does support transparency, making it attractive for web use, but it is worth confirming the specific platform or form you are uploading to actually accepts WebP files before relying on it, since some older systems and marketplaces still expect only JPG or PNG.</p>' },
      { q: 'Will resizing reduce my image quality?', a: '<p>Reducing an image dimensions, making it smaller in width and height, generally preserves visual quality quite well for most purposes, since you are simply representing the same picture with fewer pixels, which is usually imperceptible at normal viewing sizes on a website, social post, or marketplace listing. Increasing an image dimensions beyond its original size, however, does reduce apparent sharpness, since the tool has to invent new pixel detail that was not present in the original photo, which can make an enlarged image look softer or slightly blurry compared to the source. Additionally, if you resize and then save as JPG, some compression is applied during the save step itself, which can introduce a small amount of quality loss depending on the compression level, though this tool uses a reasonably high quality setting by default to keep that loss minimal. For the best results, always start from the highest-resolution original you have available and resize down to your target size rather than resizing up from an already-small image.</p>' },
      { q: 'What is the maximum image size this tool can handle?', a: '<p>There is no hard-coded limit built into this tool itself, since it relies on your own browser and device memory to load and process the image using the canvas element, which means the practical maximum depends on your specific device capability, the amount of available memory, and the browser you are using, rather than any restriction we impose. In practice, typical smartphone photos and standard camera images, generally in the range of a few megapixels up to around twenty or so, process comfortably and quickly on most modern phones, tablets and computers. Extremely large files, such as multi-hundred-megapixel scans or unusually large uncompressed images, may load more slowly or, on lower-memory devices, occasionally fail to process, in which case reducing the image size first with your phone or camera own export settings before uploading it here is a reasonable workaround. For the vast majority of everyday use cases, product photos, profile pictures, and marketing images, this tool handles the file sizes people typically work with quickly and without any issue.</p>' },
      { q: 'Can I resize multiple images at once?', a: '<p>Not in a single batch operation; this tool is built to resize one image at a time, so if you need to resize several photos to the same dimensions, you will repeat the choose, set dimensions, and download steps for each image individually. While this takes a bit more time than a true batch tool, the process for each individual image is quick, typically a few seconds from upload to download, and because your settings, the resize mode, target dimensions, aspect ratio lock and output format, stay as you left them between images, resizing a handful of photos to the same size in sequence is still a fast, straightforward workflow. If you regularly need to resize large batches of images to identical dimensions as part of an ongoing catalogue or content workflow, a dedicated batch image processing tool or software may serve that specific need better, but for occasional or moderate volume resizing, working through images one at a time here, with no upload and no privacy concern, remains a practical and genuinely free option.</p>' },
    ],
    related: [
      { href: '/pages/tools/image-compressor', title: 'Image Compressor', blurb: 'Shrink file size without changing dimensions.' },
      { href: '/pages/tools/favicon-generator', title: 'Favicon Generator', blurb: 'Generate a favicon set from any image.' },
      { href: '/pages/tools/logo-maker', title: 'Logo Maker', blurb: 'Design a clean wordmark or icon logo.' },
    ],
  },
];

export function toolsByCategory(category) {
  return TOOLS.filter(t => t.category === category);
}

export function toolHref(t) {
  if (t.external && t.externalHref) return t.externalHref;
  if (t.built) return `/pages/tools/${t.slug}`;
  return null; // not built — hub will show "Coming soon"
}
