import type { Metadata } from 'next';
import './globals.css';
import './quest.css';
import './case-board.css';
import './locked-fortune.css';
import './fake-giveaway.css';
import { scenarios } from '@/lib/scenarios';
import { caseSources, caseStages } from '@/lib/locked-fortune';
import { giveawaySources, giveawayStages } from '@/lib/fake-giveaway';
import { siteConfig } from '@/lib/site-config';

const description =
  'Investigate everyday payments, a Bitcoin heist and a fake giveaway. Free, open-source privacy quests for beginners, each with a shareable badge.';
const socialImage = {
  url: '/brand/social-card.png',
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: 'Follow the Bitcoin white rabbit logo',
};

export const metadata: Metadata = {
  title: 'Follow the Bitcoin — Privacy Quests',
  description,
  metadataBase: siteConfig.publicOrigin
    ? new URL(siteConfig.publicOrigin)
    : undefined,
  alternates: siteConfig.publicOrigin ? { canonical: '/' } : undefined,
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/brand/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: siteConfig.name,
    title: 'Follow the Bitcoin — Privacy Quests',
    description,
    images: [socialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Follow the Bitcoin — Privacy Quests',
    description,
    images: [{ url: socialImage.url, alt: socialImage.alt }],
  },
  referrer: 'no-referrer',
  robots: {
    index: Boolean(siteConfig.publicOrigin),
    follow: Boolean(siteConfig.publicOrigin),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <noscript>
          <div className="reading-edition">
            {/* Static export also works with JavaScript disabled. */}
            {/* oxlint-disable-next-line next/no-img-element */}
            <img
              className="reading-brand"
              src="/brand/white-rabbit.svg"
              alt=""
              aria-hidden="true"
              width={56}
              height={56}
            />
            <h1>Follow the Bitcoin · reading edition</h1>
            <p>
              JavaScript is off. You can still explore every clue here,
              including in Tor Browser’s Safest mode. The interactive maps and
              PNG badge export need JavaScript.
            </p>
            <h2>Quest 01 · First Clue</h2>
            {scenarios.map((s, index) => (
              <section key={s.id}>
                <h2>
                  {index + 1}. {s.title.replace('\n', ' ')}
                </h2>
                <p>{s.story}</p>
                <p>
                  <strong>{s.observer} knows:</strong> {s.knowledge}
                </p>
                <h3>{s.question}</h3>
                <ul>
                  {s.answers.map((a) => (
                    <li key={a.id}>{a.text}</li>
                  ))}
                </ul>
                <details>
                  <summary>Reveal the clue and switch roles</summary>
                  <p>{s.explanation}</p>
                  <p>
                    <strong>Your next move:</strong> {s.takeaway}
                  </p>
                  <a href={s.source} rel="noreferrer noopener">
                    Read the source
                  </a>
                </details>
              </section>
            ))}
            <h2>Quest 02 · The Locked Fortune</h2>
            <p>
              Almost 120,000 BTC was stolen from Bitfinex in 2016. This
              reconstruction simplifies the investigation into three evidence
              files. Labels and routes are illustrative; the real case involved
              years of work and many more transactions.
            </p>
            {caseStages.map((stage, index) => (
              <section key={stage.id}>
                <h3>
                  {index + 1}. {stage.title.replace('\n', ' ')}
                </h3>
                <p>{stage.story}</p>
                <p>
                  <strong>{stage.newWord}:</strong> {stage.definition}
                </p>
                <h3>{stage.question}</h3>
                <ul>
                  {stage.answers.map((answer) => (
                    <li key={answer.id}>{answer.text}</li>
                  ))}
                </ul>
                <details>
                  <summary>Open the explanation</summary>
                  <p>{stage.explanation}</p>
                  <p>
                    <strong>Takeaway:</strong> {stage.takeaway}
                  </p>
                  <p>{stage.sourceNote}</p>
                  <a
                    href={caseSources[stage.source].url}
                    rel="noreferrer noopener"
                  >
                    Inspect the primary source
                    {stage.source === 'affidavit' && ' (PDF)'}
                  </a>
                </details>
              </section>
            ))}
            <p>
              In 2023, Ilya Lichtenstein and Heather Morgan pleaded guilty to
              money laundering conspiracy. In November 2024, Lichtenstein was
              sentenced to five years. See the{' '}
              <a href={caseSources.pleas.url} rel="noreferrer noopener">
                DOJ plea announcement
              </a>{' '}
              and{' '}
              <a href={caseSources.sentence.url} rel="noreferrer noopener">
                sentencing announcement
              </a>
              .
            </p>
            <h2>Quest 03 · The Fake Giveaway</h2>
            <p>
              On July 15, 2020, compromised Twitter accounts promoted a fake
              bitcoin giveaway. Compare invented posts and payment records to
              discover what they reveal. The final receipt exercise is a
              fictional what-if, not an event claimed to have occurred in the
              investigation. No real names, addresses or payments are needed.
            </p>
            {giveawayStages.map((stage, index) => (
              <section key={stage.id}>
                <h3>
                  {index + 1}. {stage.title.replace('\n', ' ')}
                </h3>
                <p>{stage.story}</p>
                <p>
                  <strong>What you know:</strong> {stage.knowledge}
                </p>
                <p>
                  <strong>{stage.newWord}:</strong> {stage.definition}
                </p>
                {index === 2 && (
                  <p>
                    Compare the choices: keeping a receipt private adds no
                    public profile link through that receipt. Publishing it
                    beside your public profile gives readers a link to the
                    referenced transaction. The underlying transaction remains
                    public in both versions; neither choice proves ownership of
                    an entire wallet.
                  </p>
                )}
                <h3>{stage.question}</h3>
                <ul>
                  {stage.answers.map((answer) => (
                    <li key={answer.id}>{answer.text}</li>
                  ))}
                </ul>
                <details>
                  <summary>Reveal the supported conclusion</summary>
                  <p>{stage.explanation}</p>
                  <p>
                    <strong>Takeaway:</strong> {stage.takeaway}
                  </p>
                  <p>{stage.sourceNote}</p>
                  <a
                    href={giveawaySources[stage.source].url}
                    rel="noreferrer noopener"
                  >
                    Inspect the primary source
                  </a>
                </details>
              </section>
            ))}
            <p>
              Joseph James O’Connor pleaded guilty on May 9, 2023, and was
              sentenced on June 23, 2023, to five years for multiple cybercrime
              offenses, including his role in the Twitter hack. The sentence
              covered more than the giveaway. See the{' '}
              <a href={giveawaySources.sentence.url} rel="noreferrer noopener">
                DOJ sentencing announcement
              </a>
              .
            </p>
            <p>
              No account, answers or wallet data are collected. This static
              edition uses Cloudflare Web Analytics for visits, page views and
              performance. Cloudflare serves the files and can process connection
              metadata. Optional community conversations
              use GitHub; posting there requires a GitHub account. There is no
              onion address yet.
            </p>
            <p>
              {siteConfig.repositoryUrl && (
                <a href={siteConfig.repositoryUrl} rel="noreferrer noopener">
                  Read the open-source code on GitHub
                </a>
              )}
              {siteConfig.communityUrl && (
                <>
                  {' · '}
                  <a href={siteConfig.communityUrl} rel="noreferrer noopener">
                    Visit the optional community
                  </a>
                </>
              )}
            </p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
