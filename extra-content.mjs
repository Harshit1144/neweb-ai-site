// Long-form bodies + structured design extras for solution / guide / compare /
// hub pages. The build emits these wrapped in a designed layout via
// richProse(): numbered sections, stat strips, quote callouts, dark callouts.

// Per-page chrome (eyebrow label, stat strip, customer quote).
export const PAGE_EXTRAS = {
  // ----- solutions
  restaurants: {
    eyebrow: 'Restaurants playbook',
    stats: [
      { n: 'Sub-1s', l: 'Mobile load on 3G' },
      { n: '14 langs', l: 'For dish + city queries' },
      { n: '92+', l: 'Lighthouse mobile score' },
      { n: '20+', l: 'Photos auto-routed weekly' },
    ],
    quote: { text: 'We switched off Zomato as primary inbox. Every weekend booking now arrives in our own WhatsApp with the dish list already typed.', who: 'Copper Oven', role: 'Bakery, Pune' },
  },
  jewellers: {
    eyebrow: 'Jewellers playbook',
    stats: [
      { n: 'CSV', l: 'Catalogue import' },
      { n: '14 langs', l: 'Tamil to Marathi' },
      { n: '3+', l: 'Showroom locations on one dashboard' },
      { n: 'Editorial', l: 'Default visual language' },
    ],
    quote: { text: 'Our website finally looks like the showroom feels. Buyers walk in already knowing which three pieces they want to try.', who: 'Sundari Designs', role: 'Jeweller, Chennai' },
  },
  clinics: {
    eyebrow: 'Clinics playbook',
    stats: [
      { n: 'DPDP', l: 'India-ready defaults' },
      { n: '< 1s', l: 'Mobile first load' },
      { n: '40%', l: 'Drop in no-shows with SMS reminders' },
      { n: '120+', l: 'Avg reviews in year 1' },
    ],
    quote: { text: 'Patients pick the doctor who speaks their language. Putting "Hindi, Marathi, English" on each profile lifted our bookings instantly.', who: 'Sukoon Paediatrics', role: 'Clinic, Hyderabad' },
  },
  tutoring: {
    eyebrow: 'Coaching playbook',
    stats: [
      { n: '14 langs', l: 'Including Hindi, Marathi, Tamil' },
      { n: '8-12', l: 'Touchpoints in parent journey' },
      { n: 'WhatsApp', l: 'Primary enquiry channel' },
      { n: 'Free', l: 'Replaces a Salesforce-style CRM' },
    ],
    quote: { text: 'Three weeks after we launched the results gallery, demo-class bookings doubled. The toppers do the selling for us.', who: 'Shiksha Coaching', role: 'JEE coaching, Patna' },
  },
  // ----- guides
  'online-presence': {
    eyebrow: 'Foundations guide',
    stats: [
      { n: '10 min', l: 'Per step, spread over a weekend' },
      { n: '4', l: 'Core surfaces to set up' },
      { n: '₹0', l: 'Tool budget needed for the basics' },
      { n: 'Month 3', l: 'When compounding kicks in' },
    ],
    quote: { text: 'I followed the four steps in order over one Saturday. By Monday I had a domain, a website, a verified Google Business, and my first 12 newsletter subscribers.', who: 'Aaji Achaar', role: 'Founder, Pune' },
  },
  'google-business': {
    eyebrow: 'GBP guide',
    stats: [
      { n: '70%', l: 'Of local searches stop at the Map Pack' },
      { n: '7-14 days', l: 'Postcard verification window' },
      { n: '20+', l: 'Photos to upload on day one' },
      { n: '< 48 h', l: 'Target review response time' },
    ],
    quote: { text: 'We claimed our GBP, added 20 photos, set the right primary category, and within six weeks we were in the local pack for our category. Zero ad spend.', who: 'Indu Beauty Studio', role: 'Salon, Indore' },
  },
  'local-seo': {
    eyebrow: 'Local SEO guide',
    stats: [
      { n: '5 layers', l: 'That compound together' },
      { n: '14 langs', l: 'Lower competition in regional queries' },
      { n: '20-40%', l: 'Typical 90-day organic lift with schema' },
      { n: 'Weekly', l: 'Photo + review cadence target' },
    ],
    quote: { text: 'The biggest single move was adding LocalBusiness schema and translating our service pages to Marathi. Bookings from Pune doubled in a quarter.', who: 'Sahaj Books', role: 'Bookkeeping, Surat' },
  },
  'picking-a-domain': {
    eyebrow: 'Domain guide',
    stats: [
      { n: '≤ 14', l: 'Target character length' },
      { n: '.com / .in', l: 'Default TLDs for India' },
      { n: '5 min', l: 'Trademark + MCA search' },
      { n: 'Forever', l: 'A clean domain compounds' },
    ],
    quote: { text: 'We almost registered a hyphenated three-word domain. The three-second test killed it in one call. The single-word .in we picked instead is still serving us four years later.', who: 'Tatva Studio', role: 'Founder, Bengaluru' },
  },
  // ----- compare sub-pages
  wix: {
    eyebrow: 'Neweb vs Wix',
    stats: [
      { n: 'Rs 249', l: 'Neweb starting price / month' },
      { n: '~Rs 1,350', l: 'Wix Combo equivalent' },
      { n: 'Every year', l: 'Free domain on Neweb' },
      { n: 'IST', l: 'Support hours' },
    ],
    quote: { text: 'We were paying close to Rs 25,000 a year on Wix plus add-ons. Neweb does what we need for under Rs 3,000 a year, with Google Business done for us.', who: 'Saffron Cafe', role: 'Owner, Mumbai' },
  },
  squarespace: {
    eyebrow: 'Neweb vs Squarespace',
    stats: [
      { n: 'Rs 249', l: 'Neweb starting price / month' },
      { n: '~Rs 1,900', l: 'Squarespace Business equivalent' },
      { n: '14 langs', l: 'Multilingual built in' },
      { n: '< 20 min', l: 'IST support response on Growth' },
    ],
    quote: { text: 'Squarespace looked great. Neweb shipped Google Business, regional language SEO, and weekly tunes that Squarespace asked us to set up ourselves.', who: 'Aakar Architects', role: 'Studio, Ahmedabad' },
  },
};

// Long-form bodies. Designed via richProse() at build time.

// ============================================================
//   SOLUTION SUB-PAGES
// ============================================================

export const INDUSTRY_BODIES = {

restaurants: `
  <h2>The website is no longer the menu. The menu is everywhere.</h2>
  <p>A restaurant in 2026 is not a single venue with a printed menu. It is a small media operation. Customers find you through Google Maps, Instagram reels, Zomato listings, a friend forwarding your WhatsApp link, and a search for "best biryani near me" at 11 pm. Each of those surfaces shows a different version of you. The website is the one place all of them point back to. Its job is to confirm what they read on the other surface, give them one clear way to act, and leave with the right expectation.</p>
  <p>What changes for restaurants on Neweb is that the website stops being the only thing the team has to maintain. The site is one source of truth. The same menu update flows into Google Business, the printable PDF, the table QR code, and the weekend newsletter. The team uploads one set of photos and Neweb places them across surfaces with the right crop, compression, and alt text. The result is consistency, which is what diners read as trust.</p>

  <h2>Local SEO for food is its own discipline</h2>
  <p>Searches for restaurants follow patterns that are different from any other vertical. Customers search by dish, by mood, by neighbourhood, by time of day, and by occasion. "Sourdough Pune", "rainy day cafe Bandra", "cheap thali Andheri", "cake delivery Indore tomorrow". Each of those is a different intent and rewards a different page on your site. Neweb builds your homepage, your menu page, your delivery page, and your location pages on a single template, but tunes the meta titles, schema, and content of each for its query.</p>
  <p>Two technical pieces compound for restaurants. The first is structured data. Schema.org Restaurant markup tells Google your cuisine type, your price range, your accepted payments, your delivery and dine-in availability, and your menu items with prices. With it, Google can show your restaurant in rich results with a star rating, hours, and a link to call. Without it, Google shows a plain blue link. The second piece is photography. Restaurant search results are visual. Google rewards profiles and pages with photos that load fast, have descriptive alt text, and refresh monthly.</p>

  <h2>Reservations and takeaway: the right friction</h2>
  <p>The single biggest reason a diner who landed on your site does not become a booking is friction. Long forms. Calendar widgets that need three taps to select today. Required login. Pop-ups asking for an email before they have seen the menu. Neweb defaults to a different pattern: a one-question booking form (date, time, party size) for dine-in, a WhatsApp deep-link with a pre-filled message for takeaway, and an optional integration with OpenTable, ReserveIndia, or DotPe for restaurants that need the queue management.</p>
  <p>The WhatsApp pattern works disproportionately well in India. Customers prefer to message rather than fill a form. A pre-filled wa.me link with a structured prompt ("Hi, I would like to book Sunday brunch for 4 at 1 pm") arrives in your inbox as a qualified, structured lead. Your staff replies, confirms, and the booking is logged without a single form. Multiply this across the weekend rush and the savings in staff time and missed bookings are substantial.</p>

  <h2>Weekend traffic, weekly photo refresh, monthly review push</h2>
  <p>The restaurant playbook on Neweb is rhythmic. Every Sunday the site auto-publishes the weekend specials, which also go to Google Business posts and the weekly newsletter. Every Monday the team uploads ten new phone photos from the weekend. Neweb compresses, crops, and routes each photo to the right place: the gallery, the GBP photo wall, the Instagram cross-post queue, the takeaway-bag QR landing page. Every month the team runs a review push: a printed receipt insert asking for a Google review, an SMS for delivery customers, a Maps link in the WhatsApp follow-up. Reviews compound. Photos compound. Local SEO compounds. Neweb takes the operational discipline off the team and lets it run as a system.</p>
  <p>For multi-location chains, the same pattern scales. One dashboard manages the website, the Google Business profile, and the social content per outlet. Updates can be local (this branch is closed for renovation) or chain-wide (Diwali menu drop) with a single toggle. For a five-outlet chain in Pune or Bengaluru, the time savings alone justify the Neweb subscription several times over.</p>

  <h2>Delivery, dine-in, takeaway: each gets its own page</h2>
  <p>The three modes of consumption need three different conversion paths. Dine-in customers want hours, ambience photos, the menu, and the reservation link. Delivery customers want the area pin-code map, the menu with prices, and the order link routing to Swiggy, Zomato, or your own WhatsApp. Takeaway customers want the menu and a one-tap order button. Neweb ships separate landing pages for each mode tuned for the specific search intent. A search for "Italian delivery Indore" lands the customer on the delivery page, not the generic homepage. A search for "Sunday brunch Pune" lands on the dine-in reservations page. Each page indexes separately, with its own meta tags, schema, and call to action that matches the intent the visitor arrived with.</p>
`,

jewellers: `
  <h2>A jewellery website has to look like the showroom feels</h2>
  <p>Selling jewellery online is not selling lipstick. The product is high-consideration, the price band is wide, and the customer almost never decides on the first visit. The website is part catalogue, part lookbook, part credentials page, and part appointment booking. Get any one of those wrong and the visitor leaves to look at competitors who do them better. Neweb ships templates that respect this multi-purpose nature with editorial layouts, large photography, and structured catalogue blocks built specifically for jewellery SKUs.</p>
  <p>The visual default we ship leans editorial: large photographs with calm typography, italic serif callouts for the craftsmanship details that matter (24K gold, 0.50 carat VS1 solitaire, 18K rose gold setting), and generous whitespace between sections. This is not because minimalism is trendy. It is because a busy layout reads as cheap to a buyer who is about to spend two lakh rupees. The visual signals of premium are quietness, restraint, and intentional pacing.</p>

  <h2>Catalogue that respects how Indian jewellers really sell</h2>
  <p>Most jewellery sites in India are either too rigid (a fixed ecommerce-style catalogue that does not match how the showroom actually presents pieces) or too freeform (a photo gallery without prices, weights, or SKU codes that customers can refer to). Neweb takes the middle path: a structured CSV import for SKUs with photo, weight, making charges, current gold rate calculation, and gemstone notes, but rendered as an editorial gallery, not a grid of identical thumbnails.</p>
  <p>Prices are configurable per piece. Show the full price, hide the price (request quote), show only the making charges, or show a price range. Many jewellers prefer to hide prices to drive enquiry. Many others prefer to show prices to build trust. Neweb supports both, per SKU. Currency display can swap between Indian Rupees with lakhs and crores formatting (standard for Indian buyers) and international format with commas every three digits (standard for NRI buyers). For showrooms with global customer bases, this matters.</p>

  <h2>Appointments are how trust gets built</h2>
  <p>Walk-in is still the dominant path in jewellery, but the path to the walk-in starts online. The visitor browses your lookbook, shortlists three or four designs, then walks in to see them physically. The bridge between online browsing and showroom visit is the appointment booking. Neweb embeds a clean booking widget on every product page and on the homepage. The customer picks a date, a time, and notes which designs they want to see. The booking lands in your team inbox, syncs to Google Calendar, and triggers a WhatsApp confirmation to the customer.</p>
  <p>For higher-value pieces, home viewing is increasingly common. The booking widget supports a "home viewing" option that asks for address, preferred time, and the SKU list. The team confirms via WhatsApp. This pattern, which the showroom team used to manage with paper diaries, now lives in a clean dashboard with reminders and follow-ups built in.</p>

  <h2>Festival cycles and the multilingual reach</h2>
  <p>The jewellery sales calendar in India is built around festivals: Akshaya Tritiya, Dhanteras, Diwali, Wedding season, Onam, Pongal, Eid. Each has its own peak, its own SKU mix, its own marketing window. Neweb sites ship with a festival calendar plugin that lets the team pre-plan campaigns: a homepage banner switch, a featured collection block, a press release for the local media, and a Hindi/Marathi/Tamil/Malayalam translation of the campaign copy.</p>
  <p>The multilingual layer is not a luxury. A jeweller in Coimbatore who runs only an English website misses the dominant Tamil-speaking customer base. A Mumbai jeweller who runs only English misses the Marathi and Gujarati buyer. Neweb publishes in 14 languages with one click and indexes each version separately for SEO, so a customer searching in Tamil finds the Tamil page and reads in the language they think in. Conversion lifts on properly translated pages are typically 30 to 60 percent over the English-only baseline.</p>

  <h2>Multi-showroom presence, one dashboard</h2>
  <p>For jewellers with three or more showrooms, the day-to-day burden of managing five separate websites, five Google Business profiles, five Instagram accounts, and five Maps pins is what eats most of the marketing team time. Neweb consolidates this. One dashboard manages all of it. Changes can be chain-wide (new collection launch) or per-showroom (Friday holiday for a specific outlet). The result is the same brand voice across every customer touchpoint, with the operational efficiency of running it from one place.</p>

  <h2>Catalogue meets WhatsApp: the live shortlist</h2>
  <p>The most common path a high-intent jewellery buyer follows in 2026 is: browse the website catalogue, save three or four SKU codes, walk into the showroom asking for those specific pieces. Neweb makes this path frictionless. Every product card has a "Save to WhatsApp shortlist" button that opens wa.me with the SKU code, the photo, and a structured "Hi, I would like to see these in person" message pre-filled. The shortlist arrives in the showroom team WhatsApp Business inbox, the team prepares the pieces, and the buyer walks into a tailored viewing. The friction between online browsing and the high-trust offline buying moment is reduced by an order of magnitude. Showroom sales teams that adopt this workflow report a meaningful lift in conversion from website visitor to closed sale within two months.</p>

  <h2>Trust signals that justify the price tag</h2>
  <p>A 30-second visit to a luxury jewellery website is mostly a trust evaluation. The visitor is asking: are these people who they say they are? Will they back the piece if something is wrong? Will the pricing be honest? Neweb jewellery templates ship with structured trust blocks that answer these questions concretely. BIS hallmark callouts, certification numbers, lifetime warranty terms, exchange and buyback policies, the number of years in business, the list of family members in the showroom, the credit lines that allow EMI. These elements are not decoration. They are the answer to the question the buyer is silently asking. Sites that surface them prominently convert at materially higher rates than sites that hide them in a Privacy Policy footer.</p>
`,

clinics: `
  <h2>A clinic website is a handshake before the first appointment</h2>
  <p>Patients are anxious by default. The first time a parent looks for a paediatrician for their unwell child, the first time someone looks for a dentist after a tooth ache, the first time anyone looks for a clinic in a new city — the search is loaded with quiet stress. The website that loads in under a second, shows a smiling photo of the doctor, lists credentials honestly, and gives a one-tap path to book is the website that wins that visit. Neweb ships clinic templates designed around this single emotional reality: reduce anxiety, build trust, make the next step obvious.</p>
  <p>The technical baseline matters because patients are often on slow connections at home or in transit. Page weight is kept under 800 KB. Photos are compressed. Web fonts are subset. The homepage is structured so the doctor names, the contact phone, the address, the hours, and the appointment booking are all above the fold. Hospital-style design tropes (oversized navigation, busy headlines, stock photos of stethoscopes) are deliberately avoided in favour of restraint.</p>

  <h2>Doctor profiles do the heavy lifting</h2>
  <p>For multi-doctor practices, each doctor needs a dedicated page with credentials, specialties, languages spoken, years of experience, hospital affiliations, and a sample of patient reviews. The page is what shows up when someone searches the doctor name. Neweb generates these pages from a structured CSV import, complete with schema.org Physician markup so Google can show the doctor in rich results. The page also doubles as the doctor own marketing surface that they can share with referring doctors and patients.</p>
  <p>The language field deserves attention. In a tier-2 Indian city, having "speaks Hindi, Marathi, English" on a doctor profile lifts conversion against the same profile without the language field. Patients pick the doctor who can speak comfortably with their elderly parents, with their children, with their own discomfort. Neweb makes this a first-class field, not a footnote.</p>

  <h2>Bookings, reminders, teleconsults</h2>
  <p>The booking flow is the conversion event for a clinic website. Most clinic websites in India today route bookings through Practo, which charges a commission and intermediates the patient relationship. Neweb supports both: an embedded direct booking widget that owns the patient relationship (no commission, all data stays with the clinic) and a Practo or Zocdoc integration for clinics that already use those platforms. The choice is per-clinic.</p>
  <p>Direct booking lets the clinic capture name, phone, reason for visit, and preferred slot. The team confirms via SMS or WhatsApp. Automated reminders fire 24 hours and 2 hours before the appointment, reducing no-show rates by typically 30 to 40 percent. For teleconsults, Neweb integrates with Jitsi, Zoom, or Google Meet and emails the patient the join link an hour before the slot.</p>

  <h2>Compliance is not optional</h2>
  <p>India Digital Personal Data Protection Act 2023 (DPDP) makes patient data handling a legal obligation, not a best practice. Neweb sites for clinics ship with DPDP-aware defaults: SSL everywhere, encrypted form submissions, no third-party analytics by default, no Facebook pixel by default, and a privacy policy that explicitly covers health data. Patient consent for data processing is collected at the booking form. Right to access, correction, and deletion are supported through the clinic dashboard with an audit log.</p>
  <p>For clinics serving international patients (medical tourism, NRI patients, expatriate communities), HIPAA-friendly defaults are also available. These include encrypted data at rest, signed business associate agreements where applicable, and the option to host on a US or EU data centre instead of India. The default for India-only clinics stays Indian data residency, which is also the regulatory direction the DPDP framework is heading.</p>

  <h2>Reviews, photos, and the quiet compounding</h2>
  <p>Reviews and photos on Google Business compound for clinics in a way they do not for any other vertical. A clinic with 200 recent reviews from local patients ranks above clinics with 10 older reviews, even when the latter has better doctors. Neweb runs a built-in review campaign system: after every confirmed visit, a SMS goes out with a one-tap Google review link. Replies to reviews (positive and negative) are templated, with the clinic team approving before they go live. Over twelve months, the review velocity adds up. A new clinic that opens with the Neweb playbook typically has 80 to 120 fresh reviews by the end of year one.</p>
  <p>Photo posting works the same way. Doctors and staff upload phone photos of the clinic, the lab, the team, the equipment. Neweb compresses and posts to Google Business with weekly cadence. Patients searching for the clinic see fresh, real, recent photos rather than stock or outdated images. Trust signals add up.</p>

  <h2>Multilingual matters more in healthcare than anywhere else</h2>
  <p>A patient in distress switches to their first language. A Hindi-speaking parent looking for a paediatrician at 11 pm searches in Hindi. A Marathi-speaking grandfather looking for a cardiologist asks his children to search in Marathi. A Tamil-speaking expat in Bengaluru searches for "dentist who speaks Tamil". Neweb publishes clinic websites in 14 Indian and international languages. Each language version indexes separately in Google with the right hreflang attribute, so a Hindi search returns the Hindi page, not the English homepage. The conversion lift on properly translated pages is typically 30 to 60 percent in tier-2 cities. For multi-clinic chains, this is a quietly enormous untapped market.</p>

  <h2>Referral routing and the doctor-network compounder</h2>
  <p>A meaningful share of patient visits in India come through doctor referrals, not Google search. A GP in Pune refers a patient to a specialist in the same city. A paediatrician refers a child to a paediatric dentist. These referral relationships compound over years. Neweb sites support doctor referral codes (a unique URL parameter or QR per referring doctor) that route the patient to the booking widget while attributing the source. The clinic team sees in the dashboard which doctors are referring how many patients, which speciality is gaining traction, and where the relationships need investment. Most clinics manage this on paper today and lose the data within months.</p>
`,

tutoring: `
  <h2>Results sell tutoring. The site has to show them.</h2>
  <p>Tutoring and coaching centres compete on one currency: results. A parent picking between three NEET coaching centres looks at the AIIMS conversion rate. A student picking between two JEE programmes looks at the IIT rank distribution. A parent of a school child looks at the topper photos and their CBSE marks. Neweb tutoring templates put results front and centre, with the structure to make them scannable, credible, and shareable.</p>
  <p>The results block is the single highest-converting section on a tutoring page when done well. The format that works: large photos of recent toppers with their name, the exam, the rank, and the year. Below that, a distribution chart showing how many students scored in each band. Below that, alumni testimonials with LinkedIn or college links so parents can verify the claim. Neweb ships this as a structured block. Inputs go into a form, the layout is consistent, and the result is a page that builds credibility immediately.</p>

  <h2>The parent decision journey is multi-touch</h2>
  <p>A typical parent decision to enroll a child in a coaching centre involves 8 to 12 touchpoints over 2 to 4 weeks. Website visit. Phone call. Demo class. WhatsApp message. Walk-in. Second walk-in with the child. Final decision call. Each touchpoint is a chance to lose the parent. Neweb sites are built around making each transition frictionless. Every page has a WhatsApp button, a call button, and a demo booking form. Every form submission triggers an automated SMS confirmation and an alert to the admissions team.</p>
  <p>The admissions team workflow lives in the same Neweb dashboard. Every enquiry is logged with source (homepage form, call button, WhatsApp), status (new, contacted, demo booked, enrolled, lost), and follow-up reminders. Conversion rates are tracked by source so the team knows which channels are working. Most tutoring centres in India still run admissions on Excel sheets. Neweb upgrades this to a real CRM without the cost or complexity of Salesforce.</p>

  <h2>Course pages, batch calendars, fee structures</h2>
  <p>A coaching centre with twenty courses and six batches needs structured pages that customers can actually navigate. Neweb course pages are template-driven: course name, target exam, duration, syllabus, fee, batch schedule, demo availability. Parents can filter by exam (NEET, JEE, CAT, CLAT, UPSC, board), by stream (medical, engineering, commerce), and by language of instruction (English, Hindi, Marathi). Each course page has its own meta title, description, and schema, so a search for "JEE coaching in Kota" returns the right course page, not a generic homepage.</p>
  <p>Batch calendars are dynamic. As batches fill, capacity updates. As new batches launch, they appear on the parent landing pages. Fee structures are configurable per batch. EMI options are supported with a clear breakdown. The whole structure scales from a small after-school centre with 4 courses to a chain like Aakash or Allen with hundreds of courses and dozens of branches.</p>

  <h2>WhatsApp is the dominant admissions channel</h2>
  <p>Indian parents prefer WhatsApp for almost everything. Booking demos, asking about syllabi, asking about fees, asking about results — all of it tends to flow through WhatsApp because the parent can do it on their own time and have a record of the conversation. Neweb tutoring templates default to WhatsApp-first conversion. Every page has a wa.me button with a pre-filled message specific to that page ("Hi, I would like to enquire about the JEE Mains 2027 batch"). Submissions go to the admissions team WhatsApp Business inbox.</p>
  <p>The admissions team can use WhatsApp Business labels to track stages: new enquiry, demo scheduled, follow up needed, enrolled. Templates and quick replies handle common questions instantly. Broadcast lists handle batch updates, exam date changes, and result announcements. The cost: zero. The compared cost of a SalesForce-style CRM: tens of thousands of rupees per year. The reach in tier-2 cities: noticeably better, because parents trust WhatsApp.</p>

  <h2>Multilingual content compounds</h2>
  <p>For tutoring centres in tier-2 and tier-3 cities, publishing in the local language is a quiet superpower. A coaching centre in Patna that publishes course pages in Hindi alongside English ranks for queries that the English-only competitors do not even see. A Karnataka centre that publishes in Kannada captures parents who would otherwise default to a Bengaluru chain. Neweb publishes in 14 languages including Hindi, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi, and Urdu. Each language version is indexed separately, with separate meta tags and schema, so SEO benefits compound across languages.</p>

  <h2>Online classes, recorded content, and the hybrid model</h2>
  <p>Post-pandemic, almost every Indian coaching centre runs some hybrid model: in-person classes during the week, online classes on weekends, recorded content for missed sessions, doubt-clearing groups on WhatsApp. The website has to support this without becoming a learning management system. Neweb tutoring templates expose course pages with a clean toggle between in-person, online, and hybrid modes. Recorded videos can be linked from YouTube unlisted URLs or hosted on Vimeo for paid courses. Live class join links are emailed to enrolled students an hour before each session. The team focuses on teaching; the system handles the logistics around access, reminders, and recordings.</p>

  <h2>Results sharing and the parent WhatsApp network</h2>
  <p>The strongest growth lever for a coaching centre is the parent WhatsApp network. When one parent shares your topper announcement in their school WhatsApp group, you reach 50 other parents instantly. Neweb tutoring templates make this share-by-default. Every result post, every topper announcement, every batch launch has a built-in "share to WhatsApp" button that opens a pre-formatted message with the headline, the photo, and a link back to the relevant page on your site. The link carries a referral parameter so you can see in your dashboard which existing parents are driving the most new enquiries. Coaching centres that put this share loop at the centre of their growth strategy add 20 to 40 percent of new enrollments through referrals alone, with zero paid marketing.</p>
`,

};

// ============================================================
//   GUIDE SUB-PAGES
// ============================================================

export const GUIDE_BODIES = {

'online-presence': `
  <h2>Why this guide exists</h2>
  <p>Most Indian small businesses do not have a structured way to "be online". They have an Instagram account, a WhatsApp Business number, maybe a Google Business listing they forgot to verify, and a half-finished website built two years ago by a friend. The result is a fragmented presence that confuses customers and ranks for nothing. This guide walks through the four steps that take a small business from zero to a coherent online presence in roughly ten minutes of work spread over one weekend.</p>
  <p>The order matters. Domain first because every other surface points to it. Website second because the domain needs to land somewhere credible. Google Business third because it drives walk-ins for local businesses. Newsletter fourth because owned audiences compound over time. Doing these in a different order leaves gaps that cost months to close later.</p>

  <h2>Step one in depth: the domain decision</h2>
  <p>The domain is the only piece of your online presence that you actually own. Social handles can be taken away. Listings can be moved. Hosting can change. The domain stays with you as long as you renew it. This is why we put it first. Spend 20 minutes on the choice. Use our <a href="/pages/tools/business-name-generator">business name generator</a> if you do not have a brand yet, then our <a href="/pages/tools/domain-name-generator">domain name generator</a> to find a clean .com or .in variant.</p>
  <p>The minimum bar: short, memorable, easy to say over the phone, no hyphens, no numbers, no clever misspellings. Test it by asking three friends to spell it after hearing it once. If two get it wrong, pick a different one. Register in your own name with WHOIS privacy. On Neweb the first year is included free with every paid plan, and we register in your name with a clean handover document, so you never lose access.</p>

  <h2>Step two in depth: the website</h2>
  <p>The website does five jobs. It tells customers what you do. It shows where you are. It explains your offer. It captures enquiries. It builds the credibility that lets all the other surfaces work. Five jobs, five clear sections on the homepage. Anything more is decorative; anything less is incomplete.</p>
  <p>Speed is non-negotiable. Page weight under 1.5 MB, full load under 2.5 seconds on mobile, Lighthouse score above 85. Most templated builders ship sites at 4-6 MB and 6 second loads, which silently bleeds traffic and conversion. Neweb tunes every site against Core Web Vitals automatically, with LiteSpeed hosting and edge caching. Use our <a href="/pages/tools/website-speed-test">website speed test</a> to measure where you stand.</p>
  <p>Mobile-first is not optional. 75 to 90 percent of your visitors are on a phone, often on patchy 4G. The site has to render fast and tap-target clean on a 5.5 inch screen. Buttons need to be 44 pixels tall. Phone numbers and addresses need to be tap-to-call and tap-to-map. Forms need to autofocus into the first field. These details are what convert a curious browser into a paying customer.</p>

  <h2>Step three in depth: Google Business Profile</h2>
  <p>For any business that has a physical location or serves customers in a defined area, Google Business is the single highest-leverage marketing surface. The local pack at the top of Google search results shows three businesses. If you are not in those three for "your business type near me" queries, you are losing most of your potential traffic. Our <a href="/pages/guides/google-business">full Google Business guide</a> covers the claiming and optimisation process in depth.</p>
  <p>The minimum work: claim the listing, verify (postcard takes 7-14 days; phone and email are faster if available), pick the most specific primary category, write a 700-character description using our <a href="/pages/tools/google-business-description-generator">GBP description generator</a>, upload 20 photos (exterior, interior, team, products, signage), and add your full hours including holidays and special hours.</p>

  <h2>Step four in depth: the newsletter</h2>
  <p>The newsletter is the only marketing channel where you fully own the audience. Instagram changes its algorithm and your reach drops 30 percent overnight. Facebook removes a feature and your campaigns break. WhatsApp tightens broadcast limits and your blasts stop landing. Email keeps working, decade after decade, with predictable deliverability and direct access to your customers inboxes.</p>
  <p>The minimum work: add a signup form to your website footer and one other high-visibility spot. Pick a tool that lets you send (Neweb includes this; MailerLite and Beehiiv are good standalone choices). Commit to a sending cadence, weekly or bi-weekly, and stick to it for three months before judging the results. The compounding usually kicks in around month three: subscribers who joined in month one start ordering, referring, and sharing in month three.</p>

  <h2>Common mistakes to avoid</h2>
  <p>The most common pattern we see in Indian SMBs is doing each of these four things to 30 percent. A half-built website. An unverified Google Business listing. A Mailchimp account with 12 subscribers and no campaigns sent. A domain registered under the agency name that the business never fully controls. Each piece is started, none is finished. The fix is to do each one fully before starting the next.</p>
  <p>The second common mistake is over-investing in social media before the foundation is solid. Instagram followers, Facebook page likes, YouTube subscribers are all rented audiences. The platforms can take them away at any time. Build the website, Google Business, and newsletter first. Use social to drive people to those owned surfaces. The reverse rarely works.</p>
`,

'google-business': `
  <h2>Why Google Business is the highest-ROI hour of marketing work</h2>
  <p>For any business with a physical location or a defined service area, an hour spent setting up Google Business properly returns more visible value than almost any other hour of marketing work. Local pack results show three businesses at the top of search. Map searches surface profile photos and reviews. "Near me" queries route directly to claimed profiles. The traffic, the call clicks, the direction requests are all free and they compound monthly as your review count and photo count grow.</p>
  <p>Despite this, most Indian small businesses either skip Google Business entirely (no listing), have an unclaimed listing (showing up but with no control), or have a claimed but minimal listing (basic info, no description, few photos, no posts). Each level up is a step-function improvement in visibility. This guide walks through the work to move from any starting state to a fully optimised profile in a few focused hours.</p>

  <h2>Claiming: the actual process</h2>
  <p>Open business.google.com on a desktop browser. Sign in with the Gmail account that should own the profile long-term (do not use a personal Gmail of someone who might leave the team). Search for your business name. If a listing exists and is unclaimed, click "Own this business?" and follow the verification flow. If no listing exists, click "Create a profile" and fill in name, category, address, service area, phone, and website.</p>
  <p>Verification has three modes. Postcard is the most universal: Google mails you a code at the business address within 7 to 14 days, you enter the code to verify. Phone is faster if Google can place an automated call to your business landline. Email is fastest if your business email domain matches your website. For new listings, postcard is the default; for claiming existing listings, all three may be available. Pick whichever lands fastest.</p>

  <h2>Category selection moves the needle most</h2>
  <p>The single biggest ranking lever on Google Business is your primary category. Google uses it to decide which "near me" searches you appear for. "Restaurant" is too broad; "Italian restaurant" or "Vegetarian restaurant" or "Pizza restaurant" or "Cafe" each surface for different queries. Pick the most specific primary category that accurately describes your business. You can add up to 9 secondary categories; use them for sub-services.</p>
  <p>The category catalogue is large but not infinite. Browse it before you commit. A bakery has options like Bakery, Pastry shop, Cake shop, Coffee shop, Donut shop, Cupcake shop. Pick the one that captures your primary revenue. If your sourdough is 60 percent of revenue but you also serve coffee, "Bakery" with secondary "Coffee shop" is the right pairing. If coffee is 60 percent and bread is 40 percent, flip the primary and secondary.</p>

  <h2>The description, the services, the photos</h2>
  <p>The 750-character description is one of the few places you control free-form copy. Use our <a href="/pages/tools/google-business-description-generator">GBP description generator</a> to write one that covers what you do, who you serve, and what makes you different. Avoid emojis, phone numbers, and URLs (Google strips them). Refresh once a year as your offer evolves.</p>
  <p>Services let you list what you actually do as discrete items with their own descriptions. This is underused. A clinic should list each speciality. A salon should list each treatment. A jeweller should list custom design, valuations, and repairs. Each service becomes its own ranking signal.</p>
  <p>Photos are where most profiles fall short. Google rewards profiles with 20+ photos refreshed monthly. Upload exterior shots (so people recognise the storefront when they arrive), interior shots (so they know what to expect), team shots (so they trust the people), product shots, signage shots, and customer experience shots. Use our <a href="/pages/tools/image-compressor">image compressor</a> to keep file sizes lean.</p>

  <h2>Reviews and the recency principle</h2>
  <p>Review velocity matters more than review count. A profile with 50 reviews from the last three months ranks above a profile with 200 reviews from three years ago. This is because Google uses recency as a freshness signal. Three actions compound: ask every satisfied customer to leave a review on the day of the visit, respond to every review (positive and negative) within 48 hours, and never buy fake reviews (Google detects them and penalises the profile).</p>
  <p>The right ask is specific and frictionless. A printed receipt insert with a QR linking to your Google review URL. An SMS the next day with the same link. A wa.me message after delivery with the link. Whichever channel matches how the customer interacted with you. The bar to ask is "the customer was happy"; this is a generous bar that captures more reviews than the cautious "only if they explicitly said something nice".</p>

  <h2>Posts, Q&A, and the underused features</h2>
  <p>Google Business Posts are like Instagram posts but inside your search profile. New product, special offer, event, holiday hours, announcement. Each post stays live for 7 days. Use them weekly. The visibility is modest individually but compounds as a signal that the profile is active.</p>
  <p>Q&A lets customers ask questions on your profile. Most businesses do not realise the section exists and never respond. The first response is often from a stranger giving wrong information. Beat this by seeding three or four FAQ-style questions yourself (using a personal Gmail account, then answering from the business account), and by monitoring weekly for new questions.</p>
  <p>Insights gives you the data on what people search to find you, what actions they take, and how you trend against competitors. Review monthly. Use the search terms to inform the description, the services, and the next round of content on your website.</p>
`,

'local-seo': `
  <h2>Local SEO is a stack of compounds, not a single trick</h2>
  <p>Local SEO is the practice of ranking for searches that have geographic intent. "Bakery near me", "Pune dentist", "best biryani in Indore". Unlike content SEO, where one viral post can move the needle, local SEO is a stack of smaller compounds: structured data, on-page signals, Google Business, citations, reviews, photos. Each compound returns 5 to 15 percent on its own. Stacked, they routinely double or triple traffic over six months. This guide walks through each layer with concrete actions you can take today.</p>
  <p>The Indian local SEO landscape has some specific quirks. Hindi and regional language queries get less competition than English equivalents, but more volume in tier-2 and tier-3 cities. Voice search through Google Assistant on Android phones now drives 15 to 30 percent of local searches in many categories. JustDial, Sulekha, and IndiaMart citations matter more than they should because they have huge domain authority. WhatsApp Business listing in the regional language matters more for tier-2 city customers than the Maps profile in English.</p>

  <h2>Layer one: structured data and on-page basics</h2>
  <p>Every local business page should have LocalBusiness JSON-LD structured data with the specific subtype that fits (Restaurant, MedicalClinic, JewelryStore, EducationalOrganization). The schema tells Google your name, address, phone, geo coordinates, hours, accepted payments, and price range. With it, Google can show rich results. Without it, Google guesses from page content, often wrong. Use our <a href="/pages/tools/localbusiness-schema-generator">LocalBusiness Schema Generator</a> to build the JSON-LD in one click.</p>
  <p>On-page basics: the business name, address, and phone (NAP) should appear on every page in plain text (not in an image). The homepage H1 should include the primary keyword and the city ("Sourdough bakery in Pune"). Meta title and description should follow the same pattern (use our <a href="/pages/tools/meta-title-description-generator">meta tags generator</a>). The page URL should be short and readable; the body content should mention the city, neighbourhood, and category naturally.</p>

  <h2>Layer two: Google Business optimisation</h2>
  <p>Most local SEO leverage in India runs through Google Business. Categories, services, photos, reviews, posts, and Q&A all affect ranking. Our <a href="/pages/guides/google-business">complete Google Business guide</a> covers the work in depth. The headline is that the profile needs to be claimed, verified, populated with all available fields, and refreshed weekly with photos and posts. Without this, no amount of website work moves your local ranking meaningfully.</p>
  <p>Two underused Google Business levers worth highlighting: Services (list each service with its own description; each becomes a ranking signal), and Q&A (seed three FAQ-style questions and answer them yourself, then monitor weekly for new questions).</p>

  <h2>Layer three: citation consistency across Indian directories</h2>
  <p>A citation is a mention of your business name, address, and phone (NAP) on a third-party site. Each consistent citation is a small ranking signal. Each inconsistent citation (different format of the phone, slightly different address, abbreviated name) hurts. The Indian citation landscape has its own canonical sources: JustDial, Sulekha, IndiaMart, Facebook, Instagram, Bing Places, Apple Maps, Yelp (less relevant in India but still indexed), and category-specific directories like Practo for clinics, Zomato for restaurants, BookMyShow for venues.</p>
  <p>Audit your top 10 citations once a quarter. The exact NAP format on your Google Business profile should match the format on every other directory. "Sahaj Books, 123 ABC Road, Surat 395001, 9876543210" is a single canonical format. "Sahaj Books LLP, 123 ABC Road, Surat 395001, +91 98765 43210" is a different format. Inconsistent citations confuse Google about which is canonical and quietly dilute ranking.</p>

  <h2>Layer four: regional language content</h2>
  <p>Publishing in regional languages is one of the highest-leverage tactics in Indian local SEO because the competition is much lower. A page in Tamil about "South Indian breakfast in Coimbatore" has 1/10th the competition of the English equivalent. Conversion rates are typically higher because customers read in the language they think in. Neweb publishes in 14 languages with one click. Each language version is indexed as a separate page in Google with its own meta tags, schema, and hreflang attributes, so Google routes the right language to the right searcher.</p>
  <p>The order to publish: Hindi first for North India and most of the country, then the relevant regional language for your state (Marathi for Maharashtra, Kannada for Karnataka, Tamil for Tamil Nadu, Telugu for Andhra/Telangana, Bengali for West Bengal, Gujarati for Gujarat, Malayalam for Kerala, Punjabi for Punjab). For multi-state businesses, prioritise by share of revenue.</p>

  <h2>Online classes, recorded content, and the hybrid model</h2>
  <p>Post-pandemic, almost every Indian coaching centre runs some hybrid model: in-person classes during the week, online classes on weekends, recorded content for missed sessions, doubt-clearing groups on WhatsApp. The website has to support this without becoming a learning management system. Neweb tutoring templates expose course pages with a clean toggle between in-person, online, and hybrid modes. Recorded videos can be linked from YouTube unlisted URLs or hosted on Vimeo for paid courses. Live class join links are emailed to enrolled students an hour before each session. The team focuses on teaching; the system handles the logistics.</p>

  <h2>Government exam centres versus private school tuitions</h2>
  <p>The two big categories of tutoring in India compete differently. Government exam coaching centres (UPSC, SSC, banking, defence) win on faculty credibility, results, and price. Private school tuition centres compete on convenience, personalisation, and parent communication. Neweb tutoring templates support both with different default layouts: government exam centres get a faculty-led hero with topper results below; private school tutoring centres get a class-list-first layout with batch timings and convenience messaging. The same dashboard, the same SEO, the same Google Business workflow, but the website front-end is tuned for the specific category your centre operates in.</p>

  <h2>Layer five: reviews, photos, freshness</h2>
  <p>Recent reviews and recent photos signal to Google that your business is active. A clinic, restaurant, or salon that posts a new photo to Google Business every week and gets a new review every month ranks above an otherwise identical competitor that does neither. This is the slowest-paying but most compounding part of local SEO. Build a system: weekly photo upload day (Mondays work well for restaurants reviewing the weekend), monthly review push (printed receipt insert, SMS, WhatsApp follow-up). Track review count and photo count in the Neweb dashboard. Over twelve months the difference is dramatic.</p>

  <h2>The 90-day local SEO ramp-up plan</h2>
  <p>If you are starting from a cold position (unclaimed GBP, no schema, no citations, no review velocity), the realistic ramp-up to meaningful organic traffic is 90 days. Week one: claim and verify Google Business, write the description, upload 20 photos, add LocalBusiness schema to the homepage. Weeks two and three: audit and clean up the top 10 Indian directory citations to match the canonical NAP. Weeks four to six: publish two regional language versions of the homepage. Weeks six to twelve: weekly photo cadence on GBP, weekly review push to recent customers, monthly content addition (a blog post about a local query). By the end of 90 days, you have moved from invisible to ranking on page one for at least your category-plus-city query.</p>

  <h2>Measuring what worked: Search Console and GBP insights</h2>
  <p>Local SEO has two free measurement tools that most small businesses underuse. Google Search Console shows the actual queries that surface your site, the impression counts, and the click-through rates. Filter by country and city to see local queries specifically. GBP Insights shows the searches that found your profile, the actions taken (calls, directions, website clicks), and the trend over time. Both panels update daily and are free. Review weekly during the first 90 days, then monthly once growth is established. The data tells you what is working, where the next opportunity is, and which content investments are paying back.</p>
`,

'picking-a-domain': `
  <h2>The domain is the only permanent asset</h2>
  <p>Of everything you build online — the website, the Instagram, the YouTube channel, the Google Business profile, the WhatsApp Business listing, the email list — the domain is the only one that is fully yours. The platforms can change rules, ban accounts, deprecate features. The domain stays as long as you renew it. This is why we treat the domain decision as the most important early choice. Get it right and every other surface compounds value back into the domain. Get it wrong and you carry the cost of rebranding through every future quarter.</p>
  <p>The cost of changing a domain is non-trivial. Reprinting signboards, business cards, packaging. Updating every directory listing. Setting up redirects so old SEO does not vanish. Notifying customers across every channel. Founders who change domains in year two and three universally regret not having spent two more hours getting it right at the start. The advice in this guide is the advice we wish every new founder followed.</p>

  <h2>The three-second test, expanded</h2>
  <p>Say the domain out loud over a phone call. "Our website is yourdomain dot com." Can the listener type it correctly after hearing it once? If the answer is "what was that again?" or "how do you spell it?", the domain is wrong. This sounds simple but eliminates most candidates. Words with silent letters fail. Compound words with unusual splits fail. Foreign-language inspired words that need spelling instructions fail.</p>
  <p>The test extends to family. Read the domain to your parents. Read it to your kids. Read it to a friend who is not in your industry. The domain that survives all three audiences is the one you want. Domains that work only when the listener already knows your brand are domains that will never grow past your existing customers.</p>

  <h2>TLD selection in the Indian context</h2>
  <p>The .com versus .in decision is the most common question. For a business that serves only India, .in is a strong signal of localness and is fully acceptable. Big Indian brands like Flipkart, Zomato, and PolicyBazaar are on .com because they aspire globally, but most local businesses do not need that signal. For a tier-2 city bakery, jeweller, or clinic, .in is fine and often the better choice when .com is taken.</p>
  <p>Avoid .info, .biz, .website, .online, .site, and other generic new TLDs. They pattern-match as spam in many users minds and reduce trust. .org is reserved historically for non-profits; using it for a commercial business confuses the signal. .co (Colombia country code but marketed as company) is acceptable but less universally recognised. .shop is fine for ecommerce. .in.net and .co.in are workable but feel like consolation prizes; if the .in is taken, try a different name before going .co.in.</p>

  <h2>Length, spelling, and the future-proof test</h2>
  <p>Aim for 14 characters or less. Shorter is better but secondary to clarity. "copperoven" at 10 characters beats "the-copper-oven-bakery-pune" at 25 characters even though the longer one is more descriptive. Customers will type the shorter one correctly more often. The longer one also looks cluttered in URLs, in print, and in social handles.</p>
  <p>Skip hyphens. They survive on a screen but break on the phone ("dash" or "hyphen" is a third syllable customers have to remember). Skip numbers unless they are part of the brand. Skip clever misspellings like "lyft" or "tumblr" unless you have the marketing budget to teach the spelling.</p>
  <p>The future-proof test: will this name still describe your business in five years? If you sell only sweets today but might add savouries, catering, or gift hampers later, do not name yourself "Sweet Co". Name yourself something brandable that allows the category to expand. "Apte Chivda" boxes you in. "Apte Foods" stretches. "Apte" alone stretches further. Almost every founder regrets the boxed-in name; almost no one regrets the brandable one.</p>

  <h2>The trademark and MCA search before you register</h2>
  <p>Before you spend 800 rupees to register a domain, spend five minutes searching the IP India trademark database (ipindiaonline.gov.in) and the MCA company name search (mca.gov.in). The trademark search shows whether a similar name is already registered in your class of goods or services. If yes, you cannot trademark it later and you risk a notice if you grow large enough. The MCA search shows whether a similar company is already registered. If yes, you cannot register a company with the same or confusingly similar name.</p>
  <p>These two searches are free, take five minutes, and eliminate domains that would otherwise cost you tens of thousands of rupees in legal fees and rebranding later. Skip them and you take an avoidable risk. Run them and you save your future self from a foreseeable problem.</p>

  <h2>Ownership, registrars, and the boring part</h2>
  <p>Register the domain in your own legal name (or your company name if registered). Never register under a friend, an agency, or a developer. If they vanish, your business does too. This sounds paranoid until you talk to founders whose first domain disappeared because the agency that bought it ghosted. Neweb registers every domain in the customer name with WHOIS privacy enabled, with free SSL, with free DNS, and with a clean handover document. You can transfer out after the 60-day ICANN lock if you want to use a different registrar later.</p>
  <p>Enable WHOIS privacy. Without it, your phone number and email get scraped by spammers within hours of registration. Enable two-factor authentication on the registrar account. Enable auto-renewal so you do not lose the domain to forgetfulness. Set a calendar reminder one month before the expiry as a backup. Most domain horror stories start with a forgotten renewal.</p>
`,

};

// ============================================================
//   COMPARE SUB-PAGES
// ============================================================

export const COMPARE_BODIES = {

wix: `
  <h2>Wix is a website builder. Neweb is a business presence manager.</h2>
  <p>Wix has been a category leader in website building since 2006. Hundreds of thousands of small businesses worldwide run their websites on Wix. The product is well-engineered, the templates are professional, and the editor is genuinely intuitive. For pure website-building, Wix is a competent choice. The question is whether website-building is what your small business actually needs in 2026, or whether you need something broader.</p>
  <p>Neweb does not compete on website-building features. Neweb competes on the surface area beyond the website: domain, Google Business, SEO, multilingual content, newsletter, Maps presence, and the daily operational work of keeping all of them in sync. For a small business in India where Google Business drives more walk-in traffic than the website, where regional language content matters, where UPI and WhatsApp are dominant channels, the broader product wins on outcomes even when the website-builder features are simpler.</p>

  <h2>The pricing comparison</h2>
  <p>Wix starts at $16 per month (about Rs 1,350) for the Light plan, which removes Wix ads but does not include a free domain after the first year. Combo at $22 is the entry tier with the website you actually want. Pro and Business plans range from $27 to $59 for ecommerce features and more storage. Annual pricing reduces this slightly but the monthly equivalent is still 4 to 10 times higher than Neweb.</p>
  <p>Neweb starts at Rs 249 per month with the free domain included every year (not just the first year), with Google Business setup included, with weekly SEO tunes included, with 14-language publishing included, with newsletter included. The combined price difference adds up to Rs 12,000 to Rs 40,000 per year for the average small business. For an Indian SMB, that is a meaningful budget that can fund another month of inventory, another month of salary, or another marketing campaign.</p>

  <h2>What Wix does that Neweb does not</h2>
  <p>Wix has a more visual drag-and-drop editor with finer pixel control. If your business depends on bespoke visual design and you have an in-house designer, Wix will give that designer more freedom than Neweb. Wix also has a larger app marketplace with 300-plus third-party integrations covering everything from inventory management to dropshipping. If you need a specific niche integration, the chance Wix has it is higher than Neweb.</p>
  <p>Wix also has stronger brand recognition outside India. For businesses that explicitly want to signal "we use a global, well-known platform", Wix has the edge. For most Indian SMBs, the customer never knows or cares what platform the website runs on, so this is a marginal factor.</p>

  <h2>What Neweb does that Wix does not</h2>
  <p>Neweb claims and syncs Google Business automatically. Wix requires manual GBP setup. Neweb runs weekly SEO tunes. Wix asks you to install an SEO app and run it manually. Neweb publishes in 14 Indian and international languages with one click and indexes each separately for SEO. Wix supports multilingual content but charges extra and requires manual setup per language. Neweb ships with WhatsApp Business deep-linking, UPI QR generation, and GST invoice generation built into the dashboard. Wix supports these through third-party apps that cost extra.</p>
  <p>Neweb support runs in IST business hours with under 20 minute response on the Growth plan. Wix support is global and asynchronous, with response times measured in hours, not minutes. For a Mumbai jeweller who needs a fix on a Saturday before the festival rush, the difference is operational.</p>

  <h2>The migration question</h2>
  <p>Migrating from Wix to Neweb is straightforward. Export your content as JSON or via the Wix content API. Import the pages and posts into Neweb. Point your existing domain at Neweb DNS. Keep your old Wix site live for a transition month to catch any redirect issues. The migration usually takes 4 to 8 hours of focused work for a typical small business site, including DNS propagation. We help with this on the Growth plan; on Starter, the founder usually does it themselves with our written guide.</p>
  <p>The most common reason small businesses migrate off Wix to Neweb is the recurring cost. The next most common reason is that Wix sites trail in mobile speed scores and the founder cannot easily fix it. The third reason is the lack of multilingual SEO that Wix charges separately for but Neweb includes.</p>

  <h2>Indian context: what Wix does not have</h2>
  <p>Wix is a global product built primarily for Western SMBs. Indian-specific features have either lagged or never been built. UPI payment acceptance through Razorpay requires a third-party app and manual setup. Hindi and regional language SEO is supported as multilingual but charged extra and not auto-indexed for hreflang correctly. Google Business automation does not exist. JustDial, Sulekha, and IndiaMart citation management is manual. GST invoice generation, GSTIN validation, and the operational tools Indian SMBs use weekly are not native. The cumulative friction adds up. Indian founders who migrate to Neweb consistently mention that the small things that used to require a workaround on Wix now just work.</p>

  <h2>Performance: where Wix sites quietly lose</h2>
  <p>Wix sites are not slow, but they are not fast either. Median Lighthouse mobile scores for Wix sites sit in the 60s. The Wix editor produces clean HTML, but the JavaScript bundle is heavy by default, which hits Core Web Vitals on lower-end Android phones. Wix has been improving this over the past two years, but the architectural choices (full-featured client-side editor that ships with every site) cap how fast a Wix site can ever be. Neweb sites ship with LiteSpeed hosting, edge caching, and a stripped-down client bundle. Median Lighthouse mobile scores sit in the 90s. For an Indian audience on patchy 4G, the difference shows up in bounce rate and conversion.</p>

  <h2>The support difference, in concrete numbers</h2>
  <p>Wix runs a global support queue with average first-response times measured in hours. For a typical issue (broken booking form, payment integration failing, a page that suddenly will not save), the cycle is: submit a ticket, wait for first response, explain the issue, wait for follow-up, sometimes get escalated. From start to resolution on a non-urgent issue, plan for 24 to 72 hours. Neweb runs IST-hours support with chat response under 20 minutes on the Growth plan, and under 2 hours on the Starter plan. For a Saturday issue an hour before the festival weekend rush, this difference is not nice-to-have; it is operational. The total time saved across a year of support tickets often exceeds the savings on the monthly subscription.</p>
`,

squarespace: `
  <h2>Squarespace is design-forward. Neweb is operations-forward.</h2>
  <p>Squarespace ships some of the most beautiful website templates available anywhere. The product appeals to creative professionals, photographers, restaurants, boutique brands, and businesses that prioritise visual polish. The editor is opinionated, which is a feature for non-designers (it is harder to make ugly mistakes) and a constraint for designers (you cannot break out of the template grid). The product has matured into a serious competitor in the higher-end SMB market.</p>
  <p>Neweb does not compete with Squarespace on visual templates. Many of our templates look excellent, but Squarespace probably has more variety at the high end. Neweb competes on the operational work that happens after the website is live. Google Business sync, multilingual publishing, weekly SEO tunes, Indian payment integration, newsletter, GST invoice and UPI QR tools, the domain itself. The total presence cost is lower, the time to value is faster, and the recurring monthly work the team has to do is smaller.</p>

  <h2>The pricing comparison</h2>
  <p>Squarespace pricing starts at $16 per month (Personal) and rises to $23 (Business), $39 (Commerce Basic), and $65 (Commerce Advanced). Annual billing reduces the rate slightly. The Personal plan does not include commerce features. The Business plan adds basic ecommerce. The Commerce plans add inventory, abandoned cart recovery, and gift cards. Add the domain renewal after year one ($20 to $30) and you are at $200 to $300 per month for the average business plan.</p>
  <p>Neweb is Rs 249 per month with the free domain included every year, Google Business setup included, weekly SEO tunes included, multilingual publishing included, newsletter included, and a dedicated support response in IST business hours. The price difference is 5 to 15 times for the same outcomes for an Indian SMB.</p>

  <h2>Where Squarespace genuinely wins</h2>
  <p>If your business depends on visual storytelling, photography, portfolio presentation, or restaurant ambience marketing, Squarespace templates are genuinely better than what Neweb offers today. Wedding photographers, designers, boutique hotels, and high-end restaurants often pick Squarespace because the visual polish matters to their conversion. We would not push them to Neweb until our high-end template library catches up.</p>
  <p>Squarespace also has stronger ecommerce features at the Commerce tier: better inventory management, native abandoned cart, robust digital downloads, and a cleaner checkout. For businesses that are primarily online stores with thousands of SKUs, Squarespace Commerce or Shopify make more sense than Neweb.</p>

  <h2>Where Neweb wins for Indian SMBs</h2>
  <p>Neweb is built for the Indian small business reality, where the website is one of many surfaces and the team has limited time to maintain them. Google Business gets claimed and synced automatically. Multilingual publishing is one click per language. WhatsApp Business deep links work natively across the site. UPI QR generation, GST invoice generation, and the other operational tools live in the same dashboard. Support runs in IST business hours.</p>
  <p>For a clinic, a jeweller, a coaching centre, a restaurant, or a service business in India, the operational unification is a bigger productivity gain than the visual polish gap. We are honest about the trade-off: a Squarespace site might look 10 percent better, but the Neweb operational workflow saves the team several hours per week that they would otherwise spend keeping Google Business, the website, and the social channels in sync.</p>

  <h2>The migration question</h2>
  <p>Moving from Squarespace to Neweb takes 6 to 12 hours of focused work, slightly more than the Wix migration because Squarespace structured content (especially the blog and ecommerce data) exports in a less clean format. We have a guide and a paid migration service for the Growth and Enterprise plans. Most founders on Starter do it themselves over a weekend.</p>
  <p>The most common reason businesses migrate from Squarespace to Neweb is the recurring cost. The second is the lack of Google Business automation. The third, increasingly, is the multilingual SEO that Indian businesses are starting to realise compounds revenue once it is set up.</p>

  <h2>Ecommerce: the honest comparison</h2>
  <p>If your business is primarily an online store with hundreds or thousands of SKUs, abandoned-cart recovery campaigns, complex inventory management, and a large repeat-purchase customer base, Squarespace Commerce or Shopify make more sense than Neweb today. We are honest about this. Our commerce features are tuned for low-SKU service businesses, single-product brands, and catalogue-style storefronts where the conversion is not always an online checkout. If your monthly e-commerce revenue is above five lakh rupees and growing, evaluate Shopify alongside Neweb. If your revenue is below that or you have a service business with light ecommerce on the side, Neweb is the simpler choice.</p>

  <h2>Indian payment and trust signals</h2>
  <p>Squarespace supports Stripe and PayPal as primary payment processors. Razorpay support is available but requires a third-party integration. UPI as a payment method (the dominant rail in India today) is supported indirectly through Razorpay. Indian credit card 3DS flow, Indian wallets like Paytm and PhonePe wallet, and Indian BNPL options (Simpl, LazyPay) are all manual setups. Neweb supports the Indian payment stack natively, with one-click Razorpay enablement, UPI deep-linking, and the full Indian wallet and BNPL menu. For an Indian customer at checkout, the difference shows up as fewer dropped carts and higher first-time conversion.</p>

  <h2>Multilingual: the Squarespace pattern is laborious</h2>
  <p>Squarespace supports multilingual sites through a paid third-party tool (Weglot is the most common) and manual hreflang setup. For each new language, the team duplicates the site, translates the content, sets up the language switcher, and configures the redirect rules. The work is real and recurring. Updating one English page requires updating it in every language. Neweb publishes in 14 languages from a single source page with one click per language. Updates propagate automatically. The hreflang attributes are emitted correctly, the language switcher renders consistently, and the SEO benefits compound across languages without manual intervention. For Indian businesses that want to reach regional language customers, the difference is the difference between actually doing multilingual and intending to do multilingual for years without getting around to it.</p>

  <h2>The honest summary</h2>
  <p>Squarespace is a beautiful product for businesses where visual design is the differentiator and where the team has time to handle operational unification themselves. Neweb is a different shape of product: less visually adventurous in some templates, more operationally unified, much cheaper for the Indian SMB use case. For most Indian small businesses we work with, the trade-off favours Neweb on real outcomes. For a creative boutique or a photographer who cares more about the cover photo treatment than about Google Business sync, Squarespace remains the right pick. Both products are good. The choice is about which trade-offs match your business.</p>
`,

};

// ============================================================
//   HUB PAGES (solutions, guides, compare)
// ============================================================

export const SOLUTIONS_HUB_BODY = `
  <h2>Why industry-specific tuning matters</h2>
  <p>A bakery website and a clinic website both need to load fast, look professional, and convert visitors. But the tactical details that drive conversion are completely different between them. A bakery converts on photos of food, on weekend specials, on Google Business presence in food-near-me searches. A clinic converts on doctor credentials, on the booking widget, on patient reviews and HIPAA-style trust signals. A jeweller converts on editorial photography, on the catalogue, on the showroom appointment. A coaching centre converts on results, on alumni proof, on the WhatsApp lead capture.</p>
  <p>Neweb ships industry-specific defaults for each of these verticals. The template structure, the schema markup, the meta-tag templates, the block library, the recommended page sections, and the Google Business category mappings are all tuned per vertical. This is the difference between a generic website builder asking you to make every decision yourself and a presence manager that pre-makes the decisions that should not vary by business.</p>

  <h2>Signals that you need a vertical solution</h2>
  <p>You should pick a vertical solution if your business has any of these traits. Customers search for your services by specific category names ("paediatric dentist", "vegetarian thali restaurant", "kids tuition centre") rather than by general categories. Your industry has structured data conventions that Google rewards (LocalBusiness schema subtypes). Your customers expect specific features (online booking for clinics, catalogue browse for jewellers, batch calendar for tutoring). Your competitors all run similar setups (which is the market saying this is the table-stakes pattern).</p>
  <p>You can skip the vertical solution and use a generic template if your business is unusual enough that none of the vertical defaults fit. Most small businesses fit at least loosely into one of our verticals or a sibling vertical we cover (salons, hotels, retail, services). When in doubt, talk to us and we will help you decide.</p>

  <h2>How vertical tuning translates into traffic</h2>
  <p>Industry-tuned schema, meta tags, and content typically lifts organic traffic 20 to 40 percent in the first 90 days compared to a generic template. Google rewards specificity. A page that says "paediatric clinic in Hyderabad with Saturday hours" outranks a page that says "we provide healthcare services" for the same business in the same city. The vertical defaults bake this specificity in without the founder having to write it from scratch.</p>
  <p>The same logic applies to Google Business. The right primary category, the right services list, the right photo categories all compound. A vertical-tuned setup typically generates 30 to 60 percent more profile views in the first 90 days than a generic GBP setup for the same business. These are the compounds that justify the vertical product even when the underlying website builder is similar.</p>

  <h2>Where we are still growing</h2>
  <p>We do not yet have explicit verticals for legal services, accounting practices, hotels, salons, and several other categories that small businesses run. For these, the generic template plus the cross-link to the most relevant solution page works. We are adding verticals quarterly based on customer demand. If you run a business in a category we have not yet shipped, ask us through the contact page and we will tell you when we plan to add it.</p>

  <h2>Onboarding: from sign-up to live in 90 minutes</h2>
  <p>Picking a vertical solution does not mean a longer setup. The Neweb onboarding for a vertical-tuned site takes between 30 and 90 minutes for most small businesses. You answer four questions (industry, audience, offerings, style). We register your free domain, generate the website with the vertical-specific template, claim your Google Business Profile, draft your first social posts, and surface the operational dashboard. Customisation comes after, in your own time, once you can see the working baseline. Most founders who sign up on a Friday have a live site, a verified GBP, and the first newsletter sign-ups by Monday.</p>

  <h2>How we tune the verticals over time</h2>
  <p>Each vertical solution improves based on usage data. We watch which schema fields actually rank in Google, which block layouts convert best by industry, which page sections customers add or remove, which CTA wording produces the most bookings or enquiries. These insights flow back into the template defaults every quarter. The vertical solution you sign up for today is a better version of the one another founder signed up for a year ago, with the same simple onboarding and a richer set of defaults that have been tested against real customer behaviour across hundreds of businesses in the same vertical.</p>

  <h2>Migration from a generic template to a vertical solution</h2>
  <p>If you started with a generic Neweb template and later realise a vertical solution would fit better, the switch is one click in the dashboard. We preserve all your existing content, your domain, your Google Business connection, your newsletter subscribers, and your customer data. The layout, the meta tags, the schema, and the block library swap to the vertical-tuned versions. The whole transition typically takes 5 to 10 minutes of admin work. There is no downtime, no need to re-verify Google Business, and no SEO penalty as long as the URLs stay consistent.</p>

  <h2>When NOT to pick a vertical solution</h2>
  <p>Vertical solutions are a fit when your business cleanly maps to one of our supported categories and you want the conventions to do the heavy lifting. They are not a fit when your business deliberately breaks the category conventions to differentiate. A restaurant that exclusively does immersive multi-course dining experiences with no walk-ins, no delivery, and no traditional menu would do better on a generic template than the restaurants vertical. A jeweller selling exclusively to international buyers through a wholesale catalogue with no showroom and no Indian customers might also fit the generic template better. When in doubt, ask us and we will give you an honest opinion.</p>

  <h2>How the verticals share the same engine</h2>
  <p>Every vertical sits on the same underlying engine. The hosting, the speed tuning, the security, the SEO autopilot, the multilingual publishing, the Google Business sync, the newsletter, the analytics dashboard, the customer support are all identical across verticals. What changes is the template, the schema, the block library, the recommended page sections, and the operational defaults. This matters because as your business grows you can change vertical without changing platforms. A restaurant that expands into catering and event venues can keep the same Neweb subscription and switch the layout focus over a weekend.</p>

  <h2>How we decide which verticals to ship next</h2>
  <p>We pick the next vertical based on three signals: the number of incoming customer requests for that category, the size of the underserved opportunity in India (small businesses who would benefit but are not well served by existing platforms), and how distinct the vertical pattern is from what we already support. Salons, hotels, and legal services are the three categories most likely to ship in the next two quarters. If you run a business in one of those categories and want early access to the vertical solution, write to us and we will add you to the design partner list.</p>
`;

export const GUIDES_HUB_BODY = `
  <h2>How to use this guide library</h2>
  <p>The Neweb guides are written for the small business founder doing the work themselves, not for the agency or the consultant. Each guide assumes you have between 30 minutes and 4 hours, a phone or laptop, and a willingness to read carefully and follow steps. There is no fluff, no buzzword-driven theory, no aspirational case studies of US tech startups. Every guide is grounded in what Indian SMBs actually need to do this quarter to grow.</p>
  <p>The four guides we ship today cover the absolute foundations: building an online presence from scratch, claiming and optimising Google Business, local SEO that works in the Indian context, and picking a domain name. These are the four areas where the most number of founders ask us the same questions. Future guides will cover newsletter strategy, WhatsApp Business setup, Instagram for service businesses, content writing without a budget, and review management.</p>

  <h2>What makes a guide useful versus useless</h2>
  <p>Most online business advice is written either by people who have never run a small business, or by people who are trying to sell you a course at the end. The first group writes theoretical advice that does not survive the first week of real implementation. The second group writes content that sets up the problem and then withholds the solution unless you pay. Neweb guides try to do the opposite: every guide gives you the full solution, including the boring operational steps, with concrete actions you can take today.</p>
  <p>We also try to make the trade-offs explicit. There is no single right way to claim Google Business; there are tactical choices that depend on whether you have a postal address, whether you can answer a phone during business hours, whether your business email matches your website. The guides walk through the choices and tell you the considerations for each option.</p>

  <h2>Read in order, or read by problem</h2>
  <p>If you are starting from scratch, read in this order: picking a domain, then online presence overall, then Google Business, then local SEO. Each guide builds on the previous one. If you have an existing business with a partial online presence, scan all four headings and read the one that addresses your current biggest gap. Most founders we work with have a half-built website and an unclaimed Google Business listing; if that is you, start with the Google Business guide.</p>

  <h2>Where to ask if a guide does not cover your question</h2>
  <p>Email us at support@neweb.ai or use the contact form. We typically reply within a business day. If your question comes up multiple times, we add it to the guide as a new section. The guide library improves based on what real founders are asking, not what we think they should be asking.</p>

  <h2>How long each guide takes to apply</h2>
  <p>The four guides we ship today have different time profiles. Picking a domain is the shortest: 30 to 60 minutes for the decision, plus 5 minutes for the actual registration. Building an online presence from zero is the longest: 6 to 10 hours of focused work spread across a weekend, broken into the four steps. Claiming Google Business is 1 to 2 hours for the active work, plus 7 to 14 days for the postcard verification. Local SEO is an ongoing 90-day project with 2 to 3 hours of work in the first week and ongoing hour-per-week maintenance after. Plan the time before you start so the work does not stall halfway.</p>

  <h2>What we deliberately leave out</h2>
  <p>The guides skip topics that are over-covered elsewhere on the open web. There is no detailed treatment of Facebook Ads strategy because the platforms own documentation is better than anything we could write. There is no deep dive into Instagram growth hacks because they age out within months. There is no broad treatment of email marketing tools beyond the basic setup because that is a category we cover in the product documentation, not the guide library. We focus on the foundational work that compounds slowly and rewards patience: domain, website, Google Business, local SEO, newsletter. These are the unsexy fundamentals that most founders skip and most successful businesses get right.</p>

  <h2>Reading the guides on mobile, sharing with your team</h2>
  <p>Most founders read these guides on their phone. Each guide is structured to be scannable in 10 minutes and re-readable in 30. The headings are descriptive so you can jump to the section you need without reading from the top. Share the URL with your team. Print the page if you want a physical reference. Bookmark the guide hub if you plan to return. The content is permissively reusable: copy it into your internal training documents, your client onboarding kit, or your team handbook. We do not require attribution for internal use.</p>

  <h2>When to ask for help versus follow the guide</h2>
  <p>The guides are written for the founder doing the work themselves. If you have the time and the patience, you can do everything in them and pay nothing beyond your existing Neweb subscription. If you do not have the time, our Growth and Enterprise plans include a launch coach who runs through the same four steps with you in a 60-minute Zoom session, then handles the operational setup so you can focus on the rest of the business. The choice is yours; either path leads to the same end state.</p>

  <h2>The guides we are writing next</h2>
  <p>The four guides shipped today are the foundational ones. The next batch in production: newsletter strategy for small businesses (cadence, opening lines, growth tactics), WhatsApp Business setup and operations (labels, quick replies, broadcast lists, catalogue), Instagram for service businesses (posts, reels, bio, the 8-cell grid), content writing without a budget (the brief, the structure, the edit), review management (the ask, the response template, the recovery), and seasonal campaign playbooks for Indian festivals. Each will land at the same depth and honesty as the foundations. If a specific topic matters to you and is not on this list, write to us and we will move it up.</p>

  <h2>How we keep the guides updated</h2>
  <p>The platforms change. Google updates its algorithm. WhatsApp tightens broadcast limits. Instagram shifts ranking factors. The guides need to reflect the current reality, not the reality from 18 months ago. We review each guide quarterly. Outdated tactics get removed. New tactics that have proven their case get added. The last-updated date at the top of each guide tells you when the most recent review happened. Guides that have not been reviewed in over six months should be read with a small grain of salt, and we mark them in the index when this happens.</p>
`;

export const COMPARE_HUB_BODY = `
  <h2>How to choose a website platform in 2026</h2>
  <p>The website platform market has matured. Five years ago the choice was WordPress versus Wix versus Squarespace versus a custom-built site by a freelance developer. Today the meaningful choices for an Indian small business are between Neweb (the operations-focused presence manager), Wix and Squarespace (design-focused website builders), Shopify (commerce-focused for stores), and WordPress (the flexible open-source option with all the responsibilities of self-management). Each has a real fit zone where it is the best choice; outside that fit zone, it imposes costs the buyer does not always anticipate.</p>
  <p>The right way to choose is to start from what your business actually needs over the next 12 to 24 months, not from features or pricing in isolation. A clinic that needs Google Business automation, regional language SEO, and operational tools chooses differently from a photographer who needs portfolio polish, from a Shopify store with 500 SKUs, from a startup founder who wants total custom control. Match the platform to the next year of work, not to the most impressive feature list.</p>

  <h2>The five dimensions worth comparing</h2>
  <p>Total cost of ownership beats sticker price. Sticker price is what you pay monthly. Total cost includes the domain, the SSL, the email, the third-party apps to fill feature gaps, the time you spend keeping everything in sync, the cost of fixing problems when something breaks. Neweb optimises for low TCO by including most of the supporting pieces in the subscription.</p>
  <p>Time-to-value is the second dimension. How fast can a non-technical founder get from signup to a live website with a working Google Business listing and a functioning contact form. Some platforms ship this in 30 minutes (Neweb, Squarespace), some take days or weeks (custom WordPress builds), and some land somewhere in the middle (Wix).</p>
  <p>Operational unification is the third. How much of your business presence (website, GBP, social, newsletter, payments) lives in one dashboard versus how much you have to manage across separate tools. The unification benefit is invisible until you scale; it shows up as time savings every week.</p>
  <p>Lock-in is the fourth. Can you export your content and move to a different platform if you outgrow this one? Neweb exports to WordPress in one click. Most platforms make this harder than it should be. Verify the export path before you commit.</p>
  <p>Support quality and timezone is the fifth, often underweighted. A response in 2 hours during IST business hours from a person who understands Indian SMB context is functionally different from a 24-hour async response from a global support queue. For a small business that needs the website fixed before the festival rush, this is the difference between operational and broken.</p>

  <h2>Common pitfalls in the comparison process</h2>
  <p>Founders frequently over-index on visual templates and under-index on the rest of the platform. The website looks great in the demo and then the founder discovers six months later that Google Business does not sync, that the multilingual is paid add-on, that the support takes 48 hours to respond. The visual was the easy thing to evaluate before committing; the operational realities only show up after.</p>
  <p>The other common pitfall is choosing based on what large brands use. Big global brands run on Adobe Experience Manager or Sitecore. Big Indian brands run on AEM, Bloomreach, or custom Drupal builds. None of these tell you anything useful about what a small business should pick. The relevant reference is what businesses your size, in your industry, in your country have settled on.</p>

  <h2>The honest case for each platform</h2>
  <p>Wix is the right choice if you need maximum visual control with no developer help, you are comfortable with a higher monthly cost, and your business is heavy on bespoke design rather than operational tooling. Squarespace is the right choice if visual polish is your differentiator, you sell photography or design services, or you run a higher-end boutique brand. Shopify is the right choice if you are primarily an online store with growing SKU count and recurring customers. WordPress is the right choice if you want maximum flexibility and have access to a developer or are willing to learn. Neweb is the right choice if you are an Indian SMB who wants the operational pieces unified, the cost low, and the support quick.</p>

  <h2>The migration question, made simple</h2>
  <p>Every platform comparison eventually reaches the question of how hard it is to leave. The honest answer for most platforms: harder than the marketing suggests, easier than the horror stories make it sound. The two practical levers are URL structure (keep URLs consistent so SEO survives the move) and content export format (cleaner export means cleaner import). Neweb exports your entire site to WordPress in one click with the URLs preserved. Wix exports content but not the layout. Squarespace exports the content but the format requires conversion. Shopify exports the products and orders but not the storefront design. Plan the migration honestly, budget two to three days of focused work, and most founders find the move surprisingly manageable.</p>

  <h2>Pricing reality check across plans</h2>
  <p>The headline monthly price never tells the whole story. Wix Light at $16 looks competitive but does not give you a custom domain after year one. Squarespace Personal at $16 does not include commerce. Shopify Basic at $29 charges 2 percent on every transaction in addition. Add the domain renewal, the email, the SSL, the third-party apps you will need to fill gaps, and the real annual cost for the average small business is 1.5 to 3 times the headline. Neweb at Rs 249 per month includes the domain renewal, the email, the SSL, the Google Business sync, the multilingual support, the newsletter, and the operational tools. The annual TCO comparison usually surprises founders who have not modelled it carefully.</p>

  <h2>What we will not do</h2>
  <p>We will not tell you Neweb is the right choice for every business. For high-end ecommerce, pick Shopify. For maximum design flexibility with a designer in-house, consider Webflow. For a content-heavy publication, WordPress remains hard to beat. For a regulated industry with specific compliance requirements that we have not yet shipped, evaluate carefully. We have a clear view of where we add the most value (Indian SMBs running a real-world business with multiple online surfaces) and where other platforms genuinely win. The point of an honest comparison is to help you decide, not to convince you of the predetermined answer.</p>

  <h2>A short note on switching platforms a year in</h2>
  <p>Many founders pick a platform, regret the choice six to twelve months later, and stay anyway because switching feels expensive. This is usually a mistake. The cost of switching is real but bounded (two to three days of focused work, a few weeks of SEO recovery, some customer confusion). The cost of staying on the wrong platform is an annual tax that compounds: every weekend you spend fixing things the platform should have done for you, every customer you lose because the site is slow, every payment that drops because the checkout is friction-heavy. If you are six months into a platform you do not enjoy using, do the comparison honestly and budget the migration time. Most founders who make the move wonder why they did not do it three months earlier.</p>
`;
