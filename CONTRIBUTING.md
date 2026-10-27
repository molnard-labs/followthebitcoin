# Contributing to Follow the Bitcoin

Small, reviewable changes and evidence matter more than affiliation. This is an
independent educational project, not an official Bitcoin project or endorsement.

1. Discuss substantial changes in an issue before implementation. Include the
   learning goal, audience, sources and privacy impact. Never post a seed phrase,
   private wallet data, access logs or someone else's personal details.
2. Fork, branch and submit a focused pull request. Explain the concrete problem,
   resulting behaviour, tradeoffs and relevant validation. Keep unrelated cleanup
   separate. Commit messages should describe why the change is needed.
3. Another contributor should review code and content before merge. Configure
   protected `main`, required CI, one approval and resolved conversations when the
   repository is published. Do not bypass these rules for sponsors or maintainers.
4. Run `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`,
   and `npm run check:release`. Use Node 24 LTS. The lockfile is committed.
5. Tag reviewed releases. Publish an archive and SHA-256 checksums; sign tags when
   maintainers have a published signing key. Keep deployment credentials outside
   the repository. Publish the matching source revision with every release.

## Quest review

Specify the observer, their available information, the question, plausible
answers, the explanation and the action a player can try after switching roles.
Distinguish visible transaction links from inferred ownership. Use integer
satoshis and conserve value including fees. A wrong first guess must never
disqualify a player from the completion badge. New quests get stable IDs and
their own badges; do not change existing IDs to recycle an unrelated story.

For real cases, link primary records, record the date checked and case status,
distinguish allegations from established findings, and list simplifications.
Avoid unnecessary identifying information. Names alone must not become a game
mechanic or a reason to accuse someone. The first quest uses fictional data.

## Privacy and independence

The Pages deployment uses Cloudflare Web Analytics, disclosed in the UI. Avoid
additional analytics, third-party embeds, remote fonts, tracking links, wallet
connections and external calls on page load. New data collection requires an
explicit design discussion and accurate UI documentation before merge.
Sponsors cannot buy factual conclusions, badge eligibility or hidden rankings.
Potential wallet listings must use consistent public criteria and disclose paid
placement. Conflicts of interest in a contribution should be declared.

Contributions are licensed under the project's MIT license. Use a pseudonym and
a GitHub no-reply commit email if desired; inspect commit author metadata before
publishing. GitHub itself processes account and connection data.
