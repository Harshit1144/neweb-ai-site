#!/usr/bin/env node
// Pulls the latest commit from github.com/Harshit1144/neweb-ai-site and deploys
// changed files to the live cPanel site. This exists because the cloud routines
// (Neweb Daily Blog Post, Neweb Weekly SEO Audit and Fixes) run in a sandbox whose
// network egress cannot reach the cPanel host at all (confirmed: 403 on the CONNECT
// tunnel itself, not a port issue) — they write and push content to GitHub, but this
// script does the actual last-mile deploy from a machine with normal internet access.
//
// Usage: node scripts/deploy-from-github.mjs
// Requires .env in the project root with CPANEL_HOST / CPANEL_USER / CPANEL_TOKEN.
// Tracks the last-deployed commit SHA in .last-deployed-sha (gitignored) so repeat
// runs only deploy what actually changed.

import { execSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_DIR = path.resolve(__dirname, '..');
const SHA_FILE = path.join(REPO_DIR, '.last-deployed-sha');
const REMOTE_BASE = 'public_html/neweb.ai';
const INDEXNOW_KEY = '740126b001ee5a9a6990750984305a4e';

function loadEnv() {
  const envPath = path.join(REPO_DIR, '.env');
  const text = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^export\s+([A-Z_]+)=(.*)$/) || line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  if (!env.CPANEL_HOST || !env.CPANEL_USER || !env.CPANEL_TOKEN) {
    throw new Error('Missing CPANEL_HOST / CPANEL_USER / CPANEL_TOKEN in .env');
  }
  return env;
}

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: REPO_DIR, encoding: 'utf8', ...opts }).trim();
}

function run(cmd) {
  return execSync(cmd, { cwd: REPO_DIR, encoding: 'utf8' });
}

async function cpanelUpload(env, relPath) {
  const localPath = path.join(REPO_DIR, relPath);
  const data = fs.readFileSync(localPath);
  const remoteDir = path.posix.join(REMOTE_BASE, path.posix.dirname(relPath) === '.' ? '' : path.posix.dirname(relPath));
  const fileName = path.basename(relPath);
  const boundary = '----NewebDeploy' + Math.random().toString(16).slice(2);

  const preamble =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="dir"\r\n\r\n${remoteDir}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="overwrite"\r\n\r\n1\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file-1"; filename="${fileName}"\r\n` +
    `Content-Type: application/octet-stream\r\n\r\n`;
  const epilogue = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(preamble, 'utf8'), data, Buffer.from(epilogue, 'utf8')]);

  const url = `https://${env.CPANEL_HOST}:2083/execute/Fileman/upload_files`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `cpanel ${env.CPANEL_USER}:${env.CPANEL_TOKEN}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });
  const json = await res.json().catch(() => null);
  const ok = json && json.status === 1 && (!json.errors || json.errors.length === 0);
  return { ok, json };
}

function ping(url) {
  return fetch(url, { method: 'HEAD', redirect: 'follow' }).then(r => r.status).catch(() => 0);
}

async function pingIndexNow(urls) {
  if (!urls.length) return;
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'neweb.ai',
        key: INDEXNOW_KEY,
        keyLocation: `https://neweb.ai/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    console.log(`IndexNow ping: HTTP ${res.status}`);
  } catch (e) {
    console.log(`IndexNow ping failed (non-fatal): ${e.message}`);
  }
}

function urlPathFor(relPath) {
  return 'https://neweb.ai/' + relPath.replace(/\.html$/, '');
}

async function main() {
  const env = loadEnv();

  console.log('Fetching origin...');
  git(['fetch', 'origin', '--quiet']);

  const remoteSha = git(['rev-parse', 'origin/main']);
  const lastDeployed = fs.existsSync(SHA_FILE) ? fs.readFileSync(SHA_FILE, 'utf8').trim() : null;

  if (remoteSha === lastDeployed) {
    console.log('No new commits since last deploy. Nothing to do.');
    return;
  }

  console.log(`New commit(s) detected: ${lastDeployed ? lastDeployed.slice(0, 7) : '(none)'} -> ${remoteSha.slice(0, 7)}`);

  // Bring the local checkout to match origin/main exactly.
  const localSha = git(['rev-parse', 'HEAD']);
  if (localSha !== remoteSha) {
    console.log('Updating local checkout to match origin/main...');
    git(['checkout', 'main']);
    git(['reset', '--hard', 'origin/main']);
  }

  // Diff since the last SHA we actually deployed (or the whole tree on first run).
  const diffRange = lastDeployed ? `${lastDeployed}..${remoteSha}` : remoteSha;
  const diffOutput = lastDeployed
    ? git(['diff', '--name-only', '--diff-filter=ACMR', lastDeployed, remoteSha])
    : git(['ls-tree', '-r', '--name-only', remoteSha]);

  const changed = diffOutput.split('\n').filter(Boolean).filter(f => {
    // Only deploy files that actually serve the live site.
    return (
      f === 'sitemap.xml' ||
      f === 'robots.txt' ||
      f === 'index.html' ||
      f === '.htaccess' ||
      f === 'llms.txt' ||
      f === 'llms-full.txt' ||
      (f.startsWith('pages/') && f.endsWith('.html')) ||
      (f.startsWith('assets/') )
    );
  });

  if (!changed.length) {
    console.log('New commit(s) contained no deployable files (e.g. only data/ or docs). Updating marker and exiting.');
    fs.writeFileSync(SHA_FILE, remoteSha + '\n');
    return;
  }

  console.log(`Deploying ${changed.length} file(s):`);
  changed.forEach(f => console.log(`  ${f}`));

  let ok = 0, fail = 0;
  const failures = [];
  for (const rel of changed) {
    if (!fs.existsSync(path.join(REPO_DIR, rel))) {
      console.log(`SKIP (deleted upstream, not auto-removing live): ${rel}`);
      continue;
    }
    const result = await cpanelUpload(env, rel);
    if (result.ok) {
      console.log(`OK   ${rel}`);
      ok++;
    } else {
      console.log(`FAIL ${rel} -> ${JSON.stringify(result.json)}`);
      fail++;
      failures.push(rel);
    }
  }

  console.log(`\nUploaded ${ok}/${ok + fail}`);

  if (fail > 0) {
    console.error(`\n${fail} file(s) failed to deploy. NOT updating the deployed-SHA marker, so the next run retries everything in this range.`);
    console.error('Failed files:', failures.join(', '));
    process.exitCode = 1;
    return;
  }

  // Live verification on a small sample (html pages only, cap at 5 to keep this fast).
  const htmlFiles = changed.filter(f => f.endsWith('.html')).slice(0, 5);
  console.log('\nLive verification:');
  let liveFail = 0;
  for (const f of htmlFiles) {
    const url = urlPathFor(f);
    const status = await ping(url);
    console.log(`  ${status === 200 ? 'OK' : 'WARN'} ${status || 'ERR'}  ${url}`);
    if (status !== 200) liveFail++;
  }

  if (liveFail > 0) {
    console.error(`\n${liveFail} URL(s) did not return 200 on verification. Files were uploaded, but check manually. Not blocking the SHA marker update since upload itself succeeded.`);
  }

  // Ping IndexNow for changed blog/tool/page URLs (skip assets, robots.txt, sitemap itself).
  const indexNowUrls = changed
    .filter(f => f.startsWith('pages/') && f.endsWith('.html'))
    .map(urlPathFor);
  await pingIndexNow(indexNowUrls);

  fs.writeFileSync(SHA_FILE, remoteSha + '\n');
  console.log(`\nDeploy complete. Marker updated to ${remoteSha.slice(0, 7)}.`);
}

main().catch(e => {
  console.error('Deploy script failed:', e);
  process.exitCode = 1;
});
