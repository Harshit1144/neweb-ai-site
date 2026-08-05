#!/usr/bin/env node
// Google Indexing API — bulk URL submission
// Setup: https://developers.google.com/search/apis/indexing-api/v3/quickstart
// 1. Create a Google Cloud project
// 2. Enable Indexing API
// 3. Create a Service Account, download JSON key
// 4. Add service account as owner in GSC (Search Console → Settings → Users)
// 5. Set GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
// 6. npm install googleapis && node request-indexing.js

const { google } = require('googleapis');

const URLS = [
  // Compare pages — high priority, fast to rank
  'https://neweb.ai/pages/compare/godaddy',
  'https://neweb.ai/pages/compare/shopify',
  'https://neweb.ai/pages/compare/wordpress',
  'https://neweb.ai/pages/compare/weebly',
  'https://neweb.ai/pages/compare/jimdo',
  'https://neweb.ai/pages/compare/bigrock',
  'https://neweb.ai/pages/compare/hostinger',
  'https://neweb.ai/pages/compare/webflow',
  // City pages — hyperlocal, low competition
  'https://neweb.ai/pages/cities/ahmedabad',
  'https://neweb.ai/pages/cities/mumbai',
  'https://neweb.ai/pages/cities/delhi',
  'https://neweb.ai/pages/cities/bangalore',
  'https://neweb.ai/pages/cities/pune',
  'https://neweb.ai/pages/cities/surat',
  'https://neweb.ai/pages/cities/jaipur',
  'https://neweb.ai/pages/cities/hyderabad',
  'https://neweb.ai/pages/cities/chennai',
  'https://neweb.ai/pages/cities/kolkata',
  // Guide pages
  'https://neweb.ai/pages/guides/how-to-make-restaurant-website',
  'https://neweb.ai/pages/guides/how-to-get-google-business-listing',
  'https://neweb.ai/pages/guides/how-to-make-clinic-website',
  'https://neweb.ai/pages/guides/how-to-do-local-seo-india',
  'https://neweb.ai/pages/guides/how-to-make-jewellery-website',
  'https://neweb.ai/pages/guides/how-to-make-tutoring-website',
  'https://neweb.ai/pages/guides/how-to-make-salon-website',
  'https://neweb.ai/pages/guides/how-to-accept-upi-payments-website',
  'https://neweb.ai/pages/guides/how-to-make-hotel-website-india',
  'https://neweb.ai/pages/guides/how-to-make-shop-website-india',
  // Solutions pages (updated)
  'https://neweb.ai/pages/solutions/restaurants',
  'https://neweb.ai/pages/solutions/clinics',
  'https://neweb.ai/pages/solutions/jewellers',
  'https://neweb.ai/pages/solutions/tutoring',
  // Core pages
  'https://neweb.ai/pages/pricing',
  'https://neweb.ai/pages/templates',
  'https://neweb.ai/sitemap.xml',
];

async function submitUrls() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();
  const indexing = google.indexing({ version: 'v3', auth: client });

  let success = 0, fail = 0;
  for (const url of URLS) {
    try {
      await indexing.urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' },
      });
      console.log(`✓  ${url}`);
      success++;
      // Rate limit: 200 URLs/day, burst limit is low — wait 500ms between calls
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`✗  ${url}  →  ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone: ${success} submitted, ${fail} failed`);
}

submitUrls().catch(console.error);
