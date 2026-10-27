# Follow the Bitcoin

<img src="public/brand/icon-192.png" width="80" height="80" alt="Follow the Bitcoin white rabbit logo">

**Every payment leaves a clue. Can you uncover it?**

A free, MIT-licensed Bitcoin privacy game for beginners. In **First Clue**, you
investigate three fictional payment maps, switch roles and try decisions that
reveal less. Finish all three to earn a **First Clue** badge created on your
device. You can download or share it. Wrong guesses never remove rewards.

In **The Locked Fortune**, open three evidence packages from a simplified
reconstruction of the Bitfinex investigation. Separate a public transaction
trail, provider identity records and recovered signing keys to earn the distinct
**Evidence Detective** badge. In **The Fake Giveaway**, investigate a simplified
version of the July 2020 Twitter hack: compare two posts, distinguish payments
from people, and try a fictional private/public receipt comparison. Complete
the case to earn **Signal Sleuth**, with its own gold signal design.

Play the three quests in any order. All badges are local PNG images with an
optional native share action and a copyable link to their own quest.

Production address: **https://followthebitcoin.pages.dev/**.
Source and reviews: **https://github.com/molnard-labs/followthebitcoin**.
Community: **https://github.com/molnard-labs/followthebitcoin/discussions**.
Playing requires no account; posting in the optional community requires GitHub.

The project is brand-neutral. Quests include fictional scenarios and carefully
sourced reconstructions of real cases, each with its own badge. See the
[quest evidence and contribution guide](docs/QUESTS.md) for sources and deliberate
simplifications in the real-case quests.
This is an independent educational project, not an official Bitcoin project or
wallet endorsement.

The white rabbit is the project's shared logo. Editable artwork and icon/share
variants are included in the repository; see [brand assets](docs/BRANDING.md).

## Run locally

Use Node 24 LTS (`.nvmrc` records the tested version).

```sh
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:4317/**. This serves the production static export with
security headers. After a PC restart, `npm start` is sufficient if the build
already exists. For development, stop the release server and use
`npm run dev -- --hostname 127.0.0.1 --port 4317`.

## Privacy by minimization

- No account, email, wallet connection, real transaction or payment is needed.
- No cookies, localStorage, visitor IDs, fingerprints or answer uploads.
- Progress stays in this tab's memory and clears on reload. Badge files are yours.
- Fonts, icons and gameplay scripts are local. Cloudflare Pages injects a Web
  Analytics beacon to measure visits, page views and performance.
- Cloudflare serves the files and can process connection metadata independently.
- Community is an optional external link. GitHub conversations are public and
  account/provider data is governed by GitHub.
- The reading edition includes every lesson with JavaScript disabled, including
  Tor Browser's Safest mode. A project-owned `.onion` address is not available yet.

See [data handling](docs/PRIVACY.md) for hosting boundaries and the separate,
optional self-hosted daily counter.

## Free Cloudflare Pages deployment

The site uses **Cloudflare Pages' native GitHub integration**, project
`followthebitcoin`, connected to `molnard-labs/followthebitcoin`. Cloudflare
automatically checks, builds and publishes `main`; preview deployments are
disabled. GitHub Actions separately validates pull requests and retains the
checked static export for review. It has no publishing job or Cloudflare token.
No custom domain, Functions, database or paid Worker is required. Cloudflare
Web Analytics is enabled; do not enable Zaraz or other third-party injection.

Native build settings: framework **None**, repository root, output `dist/client`,
Node `24.15.0`, and `SKIP_DEPENDENCY_INSTALL=1`. The build command is:

```sh
npm ci --include=dev && npm run lint && npx --no-install tsc --noEmit && npm test && npm run build && npm run check:release
```

Each export first compacts adjacent, strictly recognized Vinext RSC string-push
scripts, preserving their order, then regenerates `_headers` from the exact
final inline-script bytes. This keeps longer reading editions within Pages'
header limit without allowing arbitrary inline scripts.
The build rejects stale assets, private artifacts, third-party executable assets
and CSP lines beyond Cloudflare's 2,000-character limit. Only `dist/client/` is
uploaded; `dist/server/` and the local Node server are never deployed to Pages.

See [deployment and verification](docs/DEPLOYMENT.md) for the full settings,
release checks and optional later Tor deployment. The free tier still has
provider quotas and terms; no paid service is required by this configuration.

## Checks and contribution workflow

```sh
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run check:release
```

Tests cover all quests' progression, badge eligibility, invalid actions, satoshi
conservation, counter privacy/retention and Pages CSP/artifact safeguards. `--local` relaxes only
the requirement for configured public URLs; it never weakens artifact checks.
Community and onion destinations are optional, and unset links must stay honest.

Use focused pull requests, evidence, independent review, protected branches,
pinned dependencies and reviewed releases. GitHub CI checks pull requests without
deployment credentials. Protected `main` is the source-review gate. Cloudflare
runs the full check/build/audit command before publishing its own static export;
a green GitHub check alone does not confirm a successful Pages deployment.
[Contributing](CONTRIBUTING.md), [security](SECURITY.md),
[dependency review](docs/DEPENDENCIES.md), [third-party licenses](THIRD_PARTY.md).

## Educational model

Observer knowledge is stated explicitly. Public transaction links and inferred
ownership are different. A fresh receiving address does not erase old payments.
The CoinJoin example is a simplified equal-output model, not a real fee quote or
a guarantee of anonymity. Evidence sources are linked in each lesson. Badges
celebrate completion, not verified financial privacy.
