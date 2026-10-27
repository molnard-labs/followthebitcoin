import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  inlineScriptHashes,
  contentSecurityPolicy,
  pagesHeaders,
  validateDestinations,
  auditStaticRelease,
} from '../scripts/pages-release.mjs';
import { createSiteServer } from '../server/serve.mjs';

test('Pages CSP authorizes exact scripts and the local server stays same-origin', async () => {
  const source = 'window.test="árvíztűrő";\n';
  const html = `<html>Follow the Bitcoin · First Clue<noscript>Reading edition</noscript><script>${source}</script><script src="/app.js"></script></html>`;
  const hash = `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
  assert.deepEqual(inlineScriptHashes(html), [hash]);
  assert.notEqual(
    inlineScriptHashes(html.replace(source, source + ' '))[0],
    hash,
  );
  const headers = pagesHeaders(html);
  assert(
    headers.includes(
      `  Content-Security-Policy: ${contentSecurityPolicy(html)}\n`,
    ),
  );
  assert(headers.split('\n').every((line) => line.length <= 2000));
  assert.doesNotMatch(
    contentSecurityPolicy(html).split(';')[1],
    /unsafe-inline|unsafe-eval/,
  );
  assert.match(contentSecurityPolicy(html), /script-src 'self' https:\/\/static\.cloudflareinsights\.com/);
  assert.match(contentSecurityPolicy(html), /connect-src 'self' https:\/\/cloudflareinsights\.com/);
  assert(headers.includes('Referrer-Policy: no-referrer'));
  const root = await mkdtemp(join(tmpdir(), 'follow-pages-csp-'));
  let app;
  try {
    await writeFile(join(root, 'index.html'), html);
    app = await createSiteServer({ directory: root });
    await new Promise((done) => app.server.listen(0, '127.0.0.1', done));
    const response = await fetch(
      `http://127.0.0.1:${app.server.address().port}`,
    );
    const localCsp = response.headers.get('content-security-policy');
    assert.match(localCsp, /sha256-/);
    assert.doesNotMatch(localCsp, /cloudflareinsights\.com/);
    await response.text();
  } finally {
    if (app) await app.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('release rejects a CSP too long for Cloudflare instead of silently weakening it', () => {
  const html = Array.from(
    { length: 40 },
    (_, i) => `<script>window.part=${i}</script>`,
  ).join('');
  assert.throws(() => pagesHeaders(html), /2,000/);
});

test('public release requires HTTPS and source code while chat and onion remain optional', () => {
  const config = {
    publicOrigin: 'https://followthebitcoin.pages.dev',
    repositoryUrl: 'https://github.com/molnard-labs/followthebitcoin',
    communityUrl: null,
    onionUrl: null,
  };
  assert.doesNotThrow(() => validateDestinations(config));
  assert.throws(
    () => validateDestinations({ ...config, publicOrigin: null }),
    /publicOrigin/,
  );
  assert.throws(
    () =>
      validateDestinations({
        ...config,
        publicOrigin: 'http://insecure.example',
      }),
    /HTTPS/,
  );
  assert.throws(
    () =>
      validateDestinations({
        ...config,
        communityUrl: 'https://user:secret@example.org/',
      }),
    /credentials/,
  );
  assert.throws(
    () => validateDestinations({ ...config, onionUrl: 'http://short.onion/' }),
    /v3/,
  );
});

test('artifact audit detects stale hashes, external executable assets and private build files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'follow-pages-export-'));
  const html =
    '<html>Follow the Bitcoin · First Clue<noscript>Reading edition</noscript><script>window.a=1;</script><script src="/app.js"></script></html>';
  try {
    await writeFile(join(root, 'index.html'), html);
    await writeFile(join(root, 'app.js'), 'void 0;');
    await writeFile(join(root, '_headers'), pagesHeaders(html));
    await auditStaticRelease(root);
    await writeFile(
      join(root, 'index.html'),
      html.replace('window.a=1;', 'window.a=2;'),
    );
    await assert.rejects(auditStaticRelease(root), /exact current export/);
    const external = html.replace('/app.js', 'https://example.org/tracker.js');
    await writeFile(join(root, 'index.html'), external);
    await writeFile(join(root, '_headers'), pagesHeaders(external));
    await assert.rejects(auditStaticRelease(root), /same-origin/);
    await writeFile(join(root, 'index.html'), html);
    await writeFile(join(root, '_headers'), pagesHeaders(html));
    await writeFile(join(root, '.env'), 'SECRET=must-not-publish');
    await assert.rejects(auditStaticRelease(root), /hidden files/);
    await rm(join(root, '.env'));
    await writeFile(join(root, '_worker.js'), 'export default {}');
    await assert.rejects(auditStaticRelease(root), /stay static/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
