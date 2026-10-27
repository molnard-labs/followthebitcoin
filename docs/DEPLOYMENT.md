# Free Cloudflare Pages deployment

Production: `https://followthebitcoin.pages.dev/`.
Source: `https://github.com/molnard-labs/followthebitcoin`.
The site uses Cloudflare Pages' native GitHub integration. Only static browser
assets are published: no Pages Functions, database, paid Worker or Node server.
No purchased domain is needed.

## Native Git build settings

Authorize the Cloudflare GitHub application for the selected repository only.
For the existing project, open **Settings → Build → Git repository → Connect**.
In **Connect to a repository**, choose the repository and use these settings:

| Setting | Value |
| --- | --- |
| Project name | `followthebitcoin` |
| Repository | `molnard-labs/followthebitcoin` |
| Production branch | `main` |
| Automatic production deployments | Enabled |
| Preview deployments | None |
| Pull-request comments | Disabled |
| Framework preset | None |
| Root directory | Repository root (`/`, or leave blank) |
| Build output directory | `dist/client` |
| Build image | v3 |
| `NODE_VERSION` | `24.15.0` |
| `SKIP_DEPENDENCY_INSTALL` | `1` |
| Runtime bindings / build secrets | None |

Set the two plain environment variables for production. No Cloudflare API token
is needed in GitHub Actions or the Pages build: Cloudflare's GitHub application
authenticates the native connection. Keep preview builds disabled; if they are
deliberately enabled later, review their access and apply the same build settings.

Use this complete build command:

```sh
npm ci --include=dev && npm run lint && npx --no-install tsc --noEmit && npm test && npm run build && npm run check:release
```

Cloudflare sets up Node before executing the command. The committed `.nvmrc`
contains the same version. Do not rely on `package.json`'s `engines` range to
select Node: the v3 image does not detect runtime/package-manager versions from
that field. npm comes with the selected Node release (Node 24.15.0 bundles npm
11.12.1); leave `NPM_VERSION` unset rather than relying on an undocumented v3
override. Check the reported Node/npm versions in the first native build log.
`SKIP_DEPENDENCY_INSTALL=1` avoids an extra provider-managed install; `npm ci`
uses the committed lockfile, and `--include=dev` retains the build/check tools.

`npm run build` automatically runs the postbuild step. It removes known build
metadata, generates `_headers` from the exact emitted script bytes and audits
the export. The final release check must succeed before Cloudflare uploads the
output. Keep root Wrangler configuration absent so Vinext does not select a
Workers build path. Preserve the static-export framework and Sites plugin setup.

Sources: [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/),
[build image and version selection](https://developers.cloudflare.com/pages/configuration/build-image/),
[Node 24.15.0 release](https://nodejs.org/en/blog/release/v24.15.0),
[branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/),
[response headers](https://developers.cloudflare.com/pages/configuration/headers/).

## Review and automatic publication

The GitHub `Review checks` workflow retains the required `check` job. Pull
requests and `main` pushes lint, type-check, test, build and audit without
Cloudflare credentials. The checked `dist/client/` folder remains available as
an immutable artifact for seven days, with an attempt-specific name. It is a
review/recovery artifact; GitHub Actions does not publish it. Manual workflow
dispatch reruns review checks only.

Protect `main` with required CI, review and resolved conversations. When a
reviewed change reaches `main`, native Cloudflare integration builds that source
revision using the full command above. Cloudflare performs its own gated build;
it does not wait for or download the GitHub Actions artifact. Failed checks or
builds prevent that Pages build from publishing. Always inspect the Pages
deployment outcome and source SHA before declaring an update live.

For this existing project, use **Settings → Build → Git repository → Connect**.
The official **Connect to a repository** dialog links the selected GitHub
repository in place. Select `molnard-labs/followthebitcoin`, apply the native
build settings above, and verify the resulting deployment on the existing
`followthebitcoin.pages.dev` address. Keep the current project; deletion and
recreation are unnecessary for this flow. Preserve the checked release and
settings, finish or cancel old Actions publishing runs, and confirm the project
identity, hostname and deployment history after connecting. Remove the legacy
Actions deployment job only once the native deployment has been verified.
After migration, delete obsolete GitHub
`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets and revoke the old API
token. The native GitHub application connection stays in use.

## Verification and recovery

The public directory is **only** `dist/client/`. Never upload the source archive,
`.git`, `.env`, `node_modules`, `dist/server/`, source maps, onion keys or aggregate
data. The audit checks private artifacts, same-origin assets, exact HTML/CSP hash
agreement and Cloudflare's 2,000-character header-line limit. Rebuild instead of
copying CSP hashes from an older release.

For each native deployment:

1. Confirm Pages reports success for the intended `main` commit and that HTTPS
   serves `https://followthebitcoin.pages.dev/` successfully.
2. Inspect `Content-Security-Policy`, `Referrer-Policy: no-referrer`,
   `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`. The script hashes
   must match that deployment's HTML.
3. Check both quests, wrong answers, evidence/role transitions, resume/reset,
   distinct badge downloads and copied quest links. Check a narrow viewport,
   keyboard navigation and the JavaScript-disabled reading edition.
4. Inspect requests and console errors. Confirm the Cloudflare Web Analytics
   beacon loads and reports, and no wallet connection or progress storage is added.
5. Record the live source revision. Test Tor Browser separately before making
   claims about its accessibility on this hosting account.

Retry a failed native build from its **Pages deployment** screen after resolving
the cause, or push a reviewed fix to `main`. Rerunning GitHub Actions alone does
not request a Cloudflare deployment. A failed update normally leaves the previous
successful Pages release available. Use Pages rollback for a bad published
release, then fix the source through the usual review process.

For exceptional manual recovery, a separately authenticated maintainer can
deploy a reviewed, built and audited export to an existing Git-integrated project:

```sh
npx --no-install wrangler pages deploy dist/client --project-name followthebitcoin --branch main
```

Use a clean checkout and separate operator authentication (Wrangler login or an
appropriately scoped temporary Pages token), outside the GitHub workflow. There
is no active GitHub Cloudflare deployment token. Pass the directory directly:
Pages rejects a custom `--config` path. A stale ignored `.wrangler/deploy/` redirect
from earlier local development can affect config discovery, so inspect local
state before manual upload. Coordinate recovery with automatic deployments to
avoid publishing conflicting revisions. Git-integrated projects do not support
the dashboard drag-and-drop upload flow.

[Direct Upload and existing Git projects](https://developers.cloudflare.com/pages/get-started/direct-upload/),
[Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).

## Privacy and hosting

Cloudflare Pages injects the Web Analytics beacon. The CSP permits its script
and reporting endpoint; keep Zaraz, Rocket Loader and other injection disabled.
Cloudflare can process hosting connection metadata independently. No project
daily counter or `.onion` service is active.

The configuration requires no paid option. Provider quotas and terms still
apply; check current limits before enabling Functions or changing architecture.
[Free-tier limits](https://developers.cloudflare.com/pages/platform/limits/),
[static asset pricing](https://developers.cloudflare.com/pages/functions/pricing/).

## Community and source settings

`lib/site-config.ts` holds public destinations only. The current community uses
GitHub Discussions in the source repository. Posting requires a GitHub account;
reading or playing does not. Keep public posts moderated and private vulnerability
reporting enabled. Do not embed GitHub or load it on the player's behalf.

A SimpleX group can be added later if a moderator supplies and verifies its
invitation. Update configuration and privacy copy together; do not promise
messages disappear from other members' devices.

## Optional later self-hosting and Tor

Tor Browser can visit HTTPS. A v3 onion address requires a running Tor service;
Cloudflare Pages alone does not provide it. A separate Linux host can serve the
same export using the zero-dependency Node server and examples in `deploy/` for
Caddy, systemd and Tor. The server binds to loopback by default.

Install supported services from official sources, validate configuration and
verify the actual generated v3 hostname in Tor Browser. Set `onionUrl` and
`ONION_URL` only to that verified address. Keep private onion keys outside the
public root, avoid clearnet redirects during onion play, patch services and
disable request-level reverse-proxy logging.
[Tor setup](https://community.torproject.org/onion-services/setup/).

The optional Node counter is enabled only by setting `COUNT_FILE` to a private
path outside the export. It stores daily totals for 30 UTC days, respects DNT/GPC
and includes reloads/bots. It is not a unique-human metric and has no public
endpoint. Omit `COUNT_FILE` to disable it. This feature does not run on Pages.
