import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads-content');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const PRESS_FILE = path.join(DATA_DIR, 'press.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ramban@1144';
const PORT = Number(process.env.PORT) || 8000;

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

const JOB_SEED = [
  { title: 'Senior Platform Engineer', category: 'eng', team: 'Engineering', location: 'Ahmedabad · Hybrid', description: 'Own the domain + hosting pipeline. Go, Cloudflare Workers, ACME, DNS.', applyUrl: '#apply' },
  { title: 'AI Engineer — Content Generation', category: 'eng', team: 'Engineering · AI', location: 'Ahmedabad · Hybrid', description: 'Fine-tune site/copy models. PyTorch, vLLM, eval harnesses. Ship weekly.', applyUrl: '#apply' },
  { title: 'Full-stack Engineer — Editor', category: 'eng', team: 'Engineering', location: 'Ahmedabad · Remote (IN)', description: 'The plain-English edit surface. React, TypeScript, PHP/WP internals.', applyUrl: '#apply' },
  { title: 'Senior Product Designer', category: 'design', team: 'Design', location: 'Ahmedabad · Hybrid', description: 'Own the four-question onboarding. Systems thinker who can also push pixels.', applyUrl: '#apply' },
  { title: 'Brand Designer', category: 'design', team: 'Design · Brand', location: 'Ahmedabad · Remote (IN)', description: 'Shape how Neweb looks and sounds — site, product, emails, ads.', applyUrl: '#apply' },
  { title: 'Growth Marketer — India', category: 'gtm', team: 'Go-to-market', location: 'Ahmedabad · Hybrid', description: 'SEO, paid, partnerships. Own pipeline from ₹249 subscription sign-ups.', applyUrl: '#apply' },
  { title: 'Customer Success Lead', category: 'ops', team: 'Ops', location: 'Ahmedabad · Hybrid', description: 'Own the first 48 hours of a new site. Turn one-time signups into loyalists.', applyUrl: '#apply' },
];

const PRESS_SEED = [
  { date: 'Feb 2026', headline: "How Neweb is putting India's small businesses online — for ₹249 a month.", outlet: 'The Ken', description: 'feature interview with Harshit Rajput', url: '#' },
  { date: 'Jan 2026', headline: "The quiet rise of 'presence management' as a category.", outlet: 'YourStory', description: 'industry analysis', url: '#' },
  { date: 'Nov 2025', headline: 'Neweb crosses 1,000 small-business customers across 22 Indian cities.', outlet: 'Inc42', description: 'milestone coverage', url: '#' },
  { date: 'Aug 2025', headline: 'A four-question form, and your bakery is online.', outlet: 'The Ken', description: 'product deep-dive', url: '#' },
  { date: 'Feb 2025', headline: 'How a bootstrapped Ahmedabad startup is fixing the SMB web, one jeweller at a time.', outlet: 'YourStory', description: 'founder profile', url: '#' },
];

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.mkdir(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME = new Set(['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']);
const EXT_BY_MIME = { 'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp','image/gif':'.gif','image/svg+xml':'.svg' };

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname) || '';
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});
const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_MIME.has(file.mimetype)),
});
async function ensureFile(file, seed = []) {
  try { await fs.access(file); }
  catch {
    const seeded = seed.map((s, i) => ({
      id: uid(),
      ...s,
      published: true,
      order: i,
      createdAt: now(),
      updatedAt: now(),
      publishedAt: now(),
    }));
    await fs.writeFile(file, JSON.stringify(seeded, null, 2));
  }
}
await ensureFile(BLOGS_FILE, []);
await ensureFile(JOBS_FILE, JOB_SEED);
await ensureFile(PRESS_FILE, PRESS_SEED);

async function readJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }
async function writeJson(file, data) { await fs.writeFile(file, JSON.stringify(data, null, 2)); }

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_PASSWORD) return res.status(401).json({ error: 'unauthorized' });
  next();
}

const app = express();
app.use(express.json({ limit: '2mb' }));

// ===== BLOGS =====
app.get('/api/blogs', async (_req, res) => {
  const blogs = await readJson(BLOGS_FILE);
  res.json(
    blogs
      .filter(b => b.published)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .map(({ body, ...rest }) => rest)
  );
});

app.get('/api/blogs/:slug', async (req, res) => {
  const blogs = await readJson(BLOGS_FILE);
  const blog = blogs.find(b => b.slug === req.params.slug && b.published);
  if (!blog) return res.status(404).json({ error: 'not found' });
  res.json(blog);
});

app.get('/api/admin/blogs', requireAuth, async (_req, res) => {
  const blogs = await readJson(BLOGS_FILE);
  res.json(blogs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
});

app.post('/api/admin/blogs', requireAuth, async (req, res) => {
  const { title, excerpt, body, author, tag, cover, published } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });
  const blogs = await readJson(BLOGS_FILE);
  const stamp = now();
  let slug = slugify(title) || crypto.randomBytes(4).toString('hex');
  if (blogs.some(b => b.slug === slug)) slug = `${slug}-${crypto.randomBytes(2).toString('hex')}`;
  const blog = {
    id: uid(), slug,
    title, excerpt: excerpt || '', body,
    author: author || 'Neweb Team',
    tag: tag || 'Product',
    cover: cover || '',
    published: !!published,
    createdAt: stamp, updatedAt: stamp,
    publishedAt: published ? stamp : null,
  };
  blogs.push(blog);
  await writeJson(BLOGS_FILE, blogs);
  res.status(201).json(blog);
});

app.put('/api/admin/blogs/:id', requireAuth, async (req, res) => {
  const blogs = await readJson(BLOGS_FILE);
  const idx = blogs.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const current = blogs[idx];
  const { title, excerpt, body, author, tag, cover, published } = req.body || {};
  const stamp = now();
  const wasPublished = current.published;
  const updated = {
    ...current,
    title: title ?? current.title,
    excerpt: excerpt ?? current.excerpt,
    body: body ?? current.body,
    author: author ?? current.author,
    tag: tag ?? current.tag,
    cover: cover ?? current.cover,
    published: typeof published === 'boolean' ? published : current.published,
    updatedAt: stamp,
  };
  if (updated.published && !wasPublished) updated.publishedAt = stamp;
  if (!updated.published) updated.publishedAt = null;
  blogs[idx] = updated;
  await writeJson(BLOGS_FILE, blogs);
  res.json(updated);
});

app.delete('/api/admin/blogs/:id', requireAuth, async (req, res) => {
  const blogs = await readJson(BLOGS_FILE);
  const next = blogs.filter(b => b.id !== req.params.id);
  if (next.length === blogs.length) return res.status(404).json({ error: 'not found' });
  await writeJson(BLOGS_FILE, next);
  res.status(204).end();
});

// ===== Generic list resource (jobs, press) =====
function mountListResource({ mount, file, publicFields, allowedFields, defaults = {} }) {
  // Public: list published, sort by order asc then updatedAt desc
  app.get(`/api/${mount}`, async (_req, res) => {
    const items = await readJson(file);
    const visible = items
      .filter(i => i.published !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(b.updatedAt) - new Date(a.updatedAt));
    if (publicFields) {
      res.json(visible.map(i => Object.fromEntries(publicFields.map(f => [f, i[f]]))));
    } else {
      res.json(visible);
    }
  });

  // Admin list
  app.get(`/api/admin/${mount}`, requireAuth, async (_req, res) => {
    const items = await readJson(file);
    res.json(items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(b.updatedAt) - new Date(a.updatedAt)));
  });

  // Admin create
  app.post(`/api/admin/${mount}`, requireAuth, async (req, res) => {
    const items = await readJson(file);
    const stamp = now();
    const incoming = req.body || {};
    const picked = Object.fromEntries(allowedFields.map(f => [f, incoming[f] ?? defaults[f] ?? '']));
    const order = typeof incoming.order === 'number' ? incoming.order : items.length;
    const item = {
      id: uid(),
      ...picked,
      order,
      published: typeof incoming.published === 'boolean' ? incoming.published : true,
      createdAt: stamp,
      updatedAt: stamp,
      publishedAt: (typeof incoming.published === 'boolean' ? incoming.published : true) ? stamp : null,
    };
    items.push(item);
    await writeJson(file, items);
    res.status(201).json(item);
  });

  // Admin update
  app.put(`/api/admin/${mount}/:id`, requireAuth, async (req, res) => {
    const items = await readJson(file);
    const idx = items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    const current = items[idx];
    const incoming = req.body || {};
    const stamp = now();
    const patch = {};
    for (const f of allowedFields) if (f in incoming) patch[f] = incoming[f];
    if ('order' in incoming && typeof incoming.order === 'number') patch.order = incoming.order;
    const willPublish = typeof incoming.published === 'boolean' ? incoming.published : current.published;
    const updated = {
      ...current,
      ...patch,
      published: willPublish,
      updatedAt: stamp,
      publishedAt: willPublish ? (current.publishedAt || stamp) : null,
    };
    items[idx] = updated;
    await writeJson(file, items);
    res.json(updated);
  });

  // Admin delete
  app.delete(`/api/admin/${mount}/:id`, requireAuth, async (req, res) => {
    const items = await readJson(file);
    const next = items.filter(i => i.id !== req.params.id);
    if (next.length === items.length) return res.status(404).json({ error: 'not found' });
    await writeJson(file, next);
    res.status(204).end();
  });
}

mountListResource({
  mount: 'jobs',
  file: JOBS_FILE,
  publicFields: ['id', 'title', 'category', 'team', 'location', 'description', 'applyUrl'],
  allowedFields: ['title', 'category', 'team', 'location', 'description', 'applyUrl'],
  defaults: { category: 'eng', applyUrl: '#apply' },
});

mountListResource({
  mount: 'press',
  file: PRESS_FILE,
  publicFields: ['id', 'date', 'headline', 'outlet', 'description', 'url'],
  allowedFields: ['date', 'headline', 'outlet', 'description', 'url'],
  defaults: { url: '#' },
});

// ===== Auth =====
app.post('/api/admin/login', (req, res) => {
  if (req.body?.password === ADMIN_PASSWORD) return res.json({ token: ADMIN_PASSWORD });
  res.status(401).json({ error: 'invalid password' });
});

// ===== Uploads =====
app.post('/api/admin/uploads', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file (allowed: png, jpg, webp, gif, svg; max 8MB)' });
  const url = `/uploads-content/${req.file.filename}`;
  res.status(201).json({ url, filename: req.file.filename, size: req.file.size, mime: req.file.mimetype });
});

// ===== Free tools: Business Name Generator =====
// Calls Anthropic Claude Haiku when ANTHROPIC_API_KEY is set. Falls back to a
// local heuristic so the page always works.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';

function toolSlug(s){ return String(s||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40); }
function cap(s){ s=String(s||''); return s ? s[0].toUpperCase()+s.slice(1).toLowerCase() : ''; }

// Per-tool configs: prompt builder + local fallback. Shared dispatcher below.
const AI_TOOLS = {
  'business-name': {
    fields: ['industry','keywords'],
    system: 'You are a brand-naming assistant for Indian small businesses. Reply ONLY with valid JSON, no prose around it.',
    user: ({industry, keywords}) => `Suggest 12 short, memorable business names for an Indian small business.\n\nIndustry: ${industry}\nKeywords or style cues: ${keywords || '(none)'}\n\nRules:\n- 1 to 3 words each, mostly under 18 characters\n- Mix of English, Hindi and Indian-flavoured names\n- Easy to pronounce, no hyphens, no numbers\n- Avoid generic words like "Solutions" or "Enterprises"\n- Give a one-line reason for each\n\nReturn JSON: { "items": [ { "name": "Example Co", "reason": "Short rationale" } ] }`,
    clean: (it) => ({ name: String(it.name||'').slice(0,60), reason: String(it.reason||'').slice(0,160), slug: toolSlug(it.name) }),
    fallback: ({industry, keywords}) => {
      const sufs = ['Co','Studio','House','Works','Hub','Bazaar','Mart','Foods'];
      const pres = ['The','House of','My','Little','Bright','Tatva','Roop'];
      const kw = (keywords||'').split(/[,\s]+/).filter(Boolean).slice(0,4);
      const seeds = [industry, ...kw].filter(Boolean);
      const out = new Set();
      for (const s of seeds) { for (const suf of sufs.slice(0,6)) out.add(`${cap(s)} ${suf}`); for (const p of pres.slice(0,4)) out.add(`${p} ${cap(s)}`); }
      if (seeds[0] && seeds[1]) out.add(`${cap(seeds[0])}${cap(seeds[1])}`);
      return Array.from(out).slice(0,12).map(name => ({ name, reason: 'A direct, memorable mix of your keywords.', slug: toolSlug(name) }));
    },
  },
  'domain-name': {
    fields: ['business','industry','keywords'],
    system: 'You suggest available-sounding domain names for Indian small businesses. Reply ONLY with valid JSON.',
    user: ({business, industry, keywords}) => `Suggest 12 domain ideas for an Indian small business. Mix .com and .in. Avoid hyphens and digits. Short, brandable, easy to spell.\n\nBusiness: ${business || '(none)'}\nIndustry: ${industry || '(none)'}\nKeywords: ${keywords || '(none)'}\n\nReturn JSON: { "items": [ { "name": "examplebakery", "tld": ".com", "reason": "Short rationale" } ] }`,
    clean: (it) => { const n = String(it.name||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,40); const tld = (String(it.tld||'').match(/\.(com|in|co|shop|store|co\.in)/i)||['.com'])[0].toLowerCase(); return { name: n, tld, reason: String(it.reason||'').slice(0,160), slug: n }; },
    fallback: ({business, industry, keywords}) => {
      const seed = String(business||industry||'shop').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,18);
      const kw = (keywords||'').split(/[,\s]+/).filter(Boolean).map(s => s.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12));
      const sufs = ['shop','store','co','hub','works','foods','crafts','place'];
      const out = [];
      for (const tld of ['.com','.in']) {
        for (const s of sufs.slice(0,5)) out.push({ name: seed+s, tld, reason: 'Direct + descriptive', slug: seed+s });
        for (const k of kw.slice(0,3)) out.push({ name: k+seed, tld, reason: 'Keyword + brand', slug: k+seed });
      }
      return out.slice(0,12);
    },
  },
  'slogan': {
    fields: ['business','industry','tone'],
    system: 'You write punchy, plain-English business slogans. Reply ONLY with valid JSON.',
    user: ({business, industry, tone}) => `Write 10 short business slogans.\n\nBusiness name: ${business || 'unspecified'}\nIndustry: ${industry || 'unspecified'}\nTone: ${tone || 'warm and confident'}\n\nRules:\n- 3 to 7 words each\n- No exclamation marks\n- Easy to read out loud\n- A mix of literal and figurative\n\nReturn JSON: { "items": [ { "text": "Example slogan here", "tone": "warm" } ] }`,
    clean: (it) => ({ text: String(it.text||'').slice(0,80), tone: String(it.tone||'').slice(0,30) }),
    fallback: ({business, industry, tone}) => {
      const b = business || industry || 'your business';
      return [ {text:`Made for ${b}. Made well.`}, {text:`${cap(b)}, every day.`}, {text:`Where ${b} meets care.`}, {text:`Simple, honest ${b}.`}, {text:`${cap(b)}, done right.`}, {text:`Real ${b}, real fast.`}, {text:`Welcome to ${b}.`}, {text:`Your ${b}, your way.`}, {text:`The ${cap(b)} promise.`}, {text:`${cap(b)} that matters.`} ].map(s => ({...s, tone: tone || 'warm'}));
    },
  },
  'instagram-bio': {
    fields: ['business','offer','style'],
    system: 'You write Instagram bios for Indian small businesses. Reply ONLY with valid JSON.',
    user: ({business, offer, style}) => `Write 8 Instagram bios for a small business, each under 150 characters.\n\nBusiness: ${business}\nMain offer: ${offer || '(none)'}\nStyle: ${style || 'friendly'}\n\nRules:\n- Each bio under 150 characters total\n- Include a hook, an offer, and a call to action\n- Use line breaks where useful\n- 1 to 2 emojis per bio at most\n\nReturn JSON: { "items": [ { "text": "Bio here" } ] }`,
    clean: (it) => { const t = String(it.text||'').slice(0,150); return { text: t, length: t.length }; },
    fallback: ({business, offer}) => {
      const b = business || 'your business';
      const o = offer || 'great service';
      return [ {text:`${b}\n${o}\nDM to order →`}, {text:`Made fresh. ${b}.\n${o}.\nOrder on WhatsApp.`}, {text:`${b}\n${o} since day one.\nLink ↓`}, {text:`Family-run ${b}\n${o}\nVisit us today.`}, {text:`${b}\nWe make ${o}.\nTap the link.`}, {text:`India loves ${b}.\n${o}.\nOrder now ↓`}, {text:`${b} | Made in India\n${o}\nDM to know more.`}, {text:`${b}\nTrusted for ${o}.\nLink in bio →`} ].map(s => ({ text: s.text, length: s.text.length }));
    },
  },
  'meta-tags': {
    fields: ['topic','brand','intent'],
    system: 'You write SEO-tight meta titles and descriptions. Reply ONLY with valid JSON.',
    user: ({topic, brand, intent}) => `Write 5 SEO meta title + description pairs.\n\nTopic / page: ${topic}\nBrand: ${brand || '(none)'}\nSearch intent: ${intent || 'informational'}\n\nRules:\n- Title under 60 characters, brand at end after a pipe\n- Description under 158 characters\n- One keyword, one benefit, one differentiator\n- No clickbait\n\nReturn JSON: { "items": [ { "title": "Example title | Brand", "description": "Example description here" } ] }`,
    clean: (it) => { const t = String(it.title||'').slice(0,70); const d = String(it.description||'').slice(0,180); return { title: t, description: d, titleLen: t.length, descLen: d.length }; },
    fallback: ({topic, brand}) => {
      const t = topic || 'topic';
      const b = brand || 'Brand';
      return [
        {title:`${cap(t)} | ${b}`, description:`Everything you need to know about ${t}, plain and simple, from ${b}.`},
        {title:`How to ${t} | ${b}`, description:`A quick, plain guide to ${t}, by the ${b} team.`},
        {title:`Best ${t} services | ${b}`, description:`What you should look for in ${t} services, with examples from ${b}.`},
        {title:`${cap(t)} explained | ${b}`, description:`A short, useful explainer on ${t} for small businesses.`},
        {title:`${cap(t)}, made simple | ${b}`, description:`Plain English answers to your ${t} questions, from ${b}.`},
      ].map(p => ({ ...p, titleLen: p.title.length, descLen: p.description.length }));
    },
  },
  'gbp-description': {
    fields: ['business','category','offerings','area'],
    system: 'You write Google Business Profile descriptions. Reply ONLY with valid JSON.',
    user: ({business, category, offerings, area}) => `Write a 700 to 750 character Google Business Profile description.\n\nBusiness: ${business}\nCategory: ${category || '(general)'}\nOfferings / specialities: ${offerings || '(none)'}\nArea served: ${area || '(none)'}\n\nRules:\n- Plain English\n- Cover what you do, who you serve, what makes you different\n- No emojis, no phone numbers, no URLs\n- 700 to 750 characters\n\nReturn JSON: { "items": [ { "text": "Description here" } ] }`,
    clean: (it) => { const t = String(it.text||'').slice(0,800); return { text: t, length: t.length }; },
    fallback: ({business, category, offerings, area}) => {
      const text = `${business || 'Our business'} is a ${category || 'local'} business in ${area || 'your area'}. We offer ${offerings || 'a friendly, reliable service'} for customers who care about quality and value. We started small and we have stayed close to our customers, which is why most of our growth comes from word of mouth. Every order is handled by a real person on our team. We answer the phone. We respond to messages. We show up when we say we will. We work hard on the basics so the experience feels easy, and we welcome questions, requests and feedback at any time. We hope to see you soon.`.slice(0, 750);
      return [{ text, length: text.length }];
    },
  },
};

async function callAnthropic(systemPrompt, userPrompt) {
  if (!ANTHROPIC_API_KEY) return null;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1100, system: systemPrompt, messages: [{ role:'user', content: userPrompt }] }),
    });
    if (!r.ok) { console.error('anthropic error', r.status, (await r.text()).slice(0,400)); return null; }
    const data = await r.json();
    const text = (data?.content || []).map(c => c?.text || '').join('').trim();
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try { const parsed = JSON.parse(m[0]); return Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed.names) ? parsed.names : null; }
    catch (_) { return null; }
  } catch (e) { console.error('anthropic threw', e?.message || e); return null; }
}

app.post('/api/tools/ai/:tool', express.json(), async (req, res) => {
  const cfg = AI_TOOLS[req.params.tool];
  if (!cfg) return res.status(404).json({ error: 'unknown tool' });
  const body = {};
  for (const f of cfg.fields) body[f] = String(req.body?.[f] || '').trim().slice(0, 200);
  // Require at least one non-empty input
  if (!Object.values(body).some(Boolean)) return res.status(400).json({ error: 'at least one field is required' });

  let items = await callAnthropic(cfg.system, cfg.user(body));
  let source = 'anthropic';
  if (!items || !items.length) { items = cfg.fallback(body); source = ANTHROPIC_API_KEY ? 'local-fallback' : 'local'; }
  items = items.slice(0, 12).map(cfg.clean).filter(Boolean);
  if (!items.length) { items = cfg.fallback(body).slice(0,12).map(cfg.clean); source = 'local-fallback'; }
  res.json({ items, source });
});

// Backwards-compat: keep /api/tools/business-name route alive
app.post('/api/tools/business-name', express.json(), async (req, res) => {
  req.params = { tool: 'business-name' };
  const cfg = AI_TOOLS['business-name'];
  const body = { industry: String(req.body?.industry||'').slice(0,200), keywords: String(req.body?.keywords||'').slice(0,200) };
  if (!body.industry) return res.status(400).json({ error: 'industry is required' });
  let items = await callAnthropic(cfg.system, cfg.user(body));
  let source = 'anthropic';
  if (!items || !items.length) { items = cfg.fallback(body); source = ANTHROPIC_API_KEY ? 'local-fallback' : 'local'; }
  items = items.slice(0,12).map(cfg.clean).filter(Boolean);
  res.json({ names: items, source });
});

// Website Speed Test: server-side fetch with timing, since browser CORS blocks
// fetch() against most third-party sites.
app.get('/api/tools/speed-check', async (req, res) => {
  const raw = String(req.query?.url || '').trim();
  if (!raw) return res.status(400).json({ error: 'url is required' });
  let u;
  try { u = new URL(raw.startsWith('http') ? raw : ('https://' + raw)); }
  catch (_) { return res.status(400).json({ error: 'invalid url' }); }
  if (!/^https?:$/.test(u.protocol)) return res.status(400).json({ error: 'only http/https' });
  const t0 = Date.now();
  let ttfb = null, total = null, status = null, bytes = 0;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(u.toString(), { method: 'GET', signal: ctrl.signal, redirect: 'follow' });
    ttfb = Date.now() - t0;
    status = r.status;
    const buf = await r.arrayBuffer();
    bytes = buf.byteLength;
    total = Date.now() - t0;
    clearTimeout(timer);
  } catch (e) {
    return res.json({ ok:false, url: u.toString(), error: e?.name === 'AbortError' ? 'timeout' : 'fetch failed' });
  }
  res.json({ ok: true, url: u.toString(), status, ttfb, total, bytes, pageSpeedUrl: 'https://pagespeed.web.dev/?url=' + encodeURIComponent(u.toString()) });
});

// Hub URL conflict workaround: /pages/tools and /pages/tools/ both serve the
// hub file, which sits next to the tools/ subdirectory containing per-tool
// pages. (Apache/LiteSpeed in production handles this naturally; Express does
// not, so we wire an explicit route.)
app.get(['/pages/tools', '/pages/tools/'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'tools.html'));
});

app.get('/api/templates', async (_req, res) => {
  try {
    const r = await fetch('https://newebai.com/neweb-builder/dashboard/templates.json');
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'upstream fetch failed' });
  }
});

app.use('/uploads-content', express.static(UPLOADS_DIR, { maxAge: '30d' }));
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/' || !req.path.includes('.')) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});
app.use(express.static(__dirname, { extensions: ['html'], redirect: false }));

app.listen(PORT, () => {
  console.log(`Neweb running at http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/pages/admin.html  (password: ${ADMIN_PASSWORD})`);
});
