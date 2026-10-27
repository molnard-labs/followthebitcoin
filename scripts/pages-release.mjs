import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

// Hash the exact emitted bytes; never authorize all inline script with unsafe-inline.
export function inlineScriptHashes(html) {
  return [
    ...new Set(
      [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
        .filter((match) => match[1])
        .map(
          (match) =>
            `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`,
        ),
    ),
  ];
}

export function contentSecurityPolicy(html) {
  const hashes = inlineScriptHashes(html);
  return `default-src 'none'; script-src 'self' https://static.cloudflareinsights.com${hashes.length ? ` ${hashes.join(' ')}` : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://cloudflareinsights.com; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'`;
}

export function pagesHeaders(html) {
  const value = [
    '/*',
    `  Content-Security-Policy: ${contentSecurityPolicy(html)}`,
    '  Referrer-Policy: no-referrer',
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: DENY',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()',
    '  Strict-Transport-Security: max-age=31536000',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
  ].join('\n');
  for (const line of value.split('\n'))
    assert(
      line.length <= 2000,
      'Cloudflare _headers line exceeds 2,000 characters; reduce inline bootstrap scripts before release',
    );
  return value;
}

export function validateDestinations(config, { local = false } = {}) {
  if (!local) {
    assert(
      config.publicOrigin,
      'Public launch is not ready: publicOrigin is unset',
    );
    assert(
      config.repositoryUrl,
      'Public launch is not ready: repositoryUrl is unset',
    );
  }
  if (config.publicOrigin)
    assert.match(
      config.publicOrigin,
      /^https:\/\/[a-z0-9.-]+$/,
      'Expected an HTTPS origin without path',
    );
  if (config.repositoryUrl)
    assert.match(
      config.repositoryUrl,
      /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
      'Expected a GitHub repository URL',
    );
  if (config.communityUrl) {
    const community = new URL(config.communityUrl);
    assert.equal(
      community.protocol,
      'https:',
      'Community invitations must use HTTPS',
    );
    assert(
      !community.username && !community.password,
      'No credentials in community URL',
    );
  }
  if (config.onionUrl)
    assert.match(
      config.onionUrl,
      /^http:\/\/[a-z2-7]{56}\.onion\/$/,
      'Expected a verified v3 onion URL',
    );
}

export async function auditStaticRelease(directory) {
  const root = resolve(directory);
  const html = await readFile(join(root, 'index.html'), 'utf8');
  assert.match(html, /Follow the Bitcoin/);
  assert.match(html, /First Clue/);
  assert.match(html, /<noscript>/);
  assert.doesNotMatch(
    html,
    /Ginger|fonts\.google|googletagmanager|google-analytics|connect\.facebook|cloudflareinsights\.com/i,
  );
  assert.doesNotMatch(
    html,
    /\son\w+\s*=/i,
    'Inline event handlers are not supported by the release CSP',
  );
  assert.doesNotMatch(html, /(?:src|href)\s*=\s*["']\s*javascript:/i);

  // Human-followed source links can be external. Automatically loaded resources cannot.
  for (const tag of html.matchAll(
    /<(?:script|link|img|iframe|audio|video|source)\b[^>]*>/gi,
  )) {
    if (
      /^<link\b/i.test(tag[0]) &&
      !/\brel="[^"]*(?:stylesheet|preload|prefetch|icon|manifest)/i.test(tag[0])
    )
      continue;
    for (const [, asset] of tag[0].matchAll(/(?:src|href)="([^"]+)"/gi)) {
      assert(
        asset.startsWith('/') && !asset.startsWith('//'),
        'Automatically loaded assets must be same-origin absolute paths',
      );
      const pathname = decodeURIComponent(asset.split(/[?#]/)[0]);
      const file = resolve(root, `.${pathname}`);
      assert(
        file.startsWith(root + sep),
        'Asset reference must stay in public export',
      );
      assert((await stat(file)).isFile(), `Missing public asset: ${pathname}`);
    }
  }
  const permitted = new Set([
    '.html',
    '.js',
    '.css',
    '.json',
    '.svg',
    '.png',
    '.ico',
    '.woff2',
    '.txt',
    '.rsc',
    '.xml',
  ]);
  async function auditFiles(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      assert(!entry.isSymbolicLink(), 'No symlinks in public export');
      assert(
        !entry.name.startsWith('.') && !entry.name.endsWith('.map'),
        'No hidden files or source maps in public export',
      );
      assert(
        !['_worker.js', '_routes.json', 'counts.json'].includes(entry.name),
        'This release must stay static and exclude operator data',
      );
      if (entry.isDirectory()) await auditFiles(join(dir, entry.name));
      else
        assert(
          entry.name === '_headers' || permitted.has(extname(entry.name)),
          `Unexpected public file: ${entry.name}`,
        );
    }
  }
  await auditFiles(root);
  const headers = await readFile(join(root, '_headers'), 'utf8');
  assert.equal(
    headers,
    pagesHeaders(html),
    'Generated _headers must match the exact current export',
  );
  return { html, headers, inlineScriptCount: inlineScriptHashes(html).length };
}
