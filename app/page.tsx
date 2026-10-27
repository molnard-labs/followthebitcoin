'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Award,
  Check,
  Eye,
  Fingerprint,
  GitBranch,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Search,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { scenarios, gradeAnswer } from '@/lib/scenarios';
import { gameReducer, initialGame, type Comparison } from '@/lib/game';
import { useGameTools } from '@/lib/use-game-tools';
import { siteConfig } from '@/lib/site-config';
import {
  AddressGraph,
  CoinjoinGraph,
  SpendGraph,
  type CoinjoinMode,
} from './graphs';
import { BadgeCard } from './badge-card';
import { WebBonus } from './web-bonus';
import { LockedFortune } from './locked-fortune';
import { CaseTeaser } from './case-board';
import { caseReducer, initialCase, caseStages } from '@/lib/locked-fortune';
import { FakeGiveaway, GiveawayTeaser } from './fake-giveaway';
import {
  giveawayReducer,
  initialGiveaway,
  giveawayStages,
} from '@/lib/fake-giveaway';

type View =
  | 'quests'
  | 'quest/first-clue'
  | 'quest/locked-fortune'
  | 'quest/fake-giveaway'
  | 'privacy'
  | 'community'
  | 'source'
  | 'bonus';
const views: View[] = [
  'quests',
  'quest/first-clue',
  'quest/locked-fortune',
  'quest/fake-giveaway',
  'privacy',
  'community',
  'source',
  'bonus',
];
const glossary = [
  [
    'Receiving address',
    'A destination you share to receive bitcoin. One wallet can create many addresses.',
  ],
  [
    'Coin & change',
    'A coin is an amount received earlier that a wallet can spend. A payment can use one or several coins. Any amount left over returns to the payer as change; a small part pays the network fee.',
  ],
  [
    'CoinJoin',
    'A transaction made together by several people. Inputs are the coins going in; outputs are the new coins coming out. Here, equal outputs allow several possible ownership matches.',
  ],
];
const roleStories = [
  'You are Client B. A designer gives you an address for your payment. You look at the public payment map. What else can you learn?',
  'You work at a bitcoin exchange, where people buy and sell bitcoin. You know who withdrew 0.06 BTC. Later, you see it spent together with a second coin.',
  'You are a merchant. You know one earlier input belongs to a particular person, but you do not know who is paying you now. Can the payment map reveal the match?',
];
const protectStories = [
  'Now you are the designer. Change the address you give the next client, and watch the connection change.',
  'Now you are paying. The 0.06 BTC coin alone covers the 0.02 BTC purchase and the fee. Try leaving your freelance coin out.',
  'Now you are spending after CoinJoin. Compare a direct payment with CoinJoin, then see what happens if you later combine the output with another coin linked to your identity.',
];

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className="resource-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
      <ArrowUpRight size={16} />
    </a>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('quests');
  const [game, dispatch] = useReducer(gameReducer, initialGame);
  const [caseGame, caseDispatch] = useReducer(caseReducer, initialCase);
  const [giveawayGame, giveawayDispatch] = useReducer(
    giveawayReducer,
    initialGiveaway,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const paymentMap = useRef<HTMLElement>(null);
  const s = scenarios[game.index];
  const revealed = game.phase !== 'investigate';
  const changed = game.comparison === 'alternative';
  const completed = game.phase === 'complete';
  const mapDescription =
    game.index === 0
      ? changed
        ? 'The second payment now uses a separate address. The first payment remains public.'
        : 'The earlier 0.08 BTC payment and the 0.04 BTC payment both reach the same address.'
      : game.index === 1
        ? changed
          ? 'Only 0.06 BTC is spent: 0.02 BTC to the shop, 0.0399 BTC change, and a 0.0001 BTC fee.'
          : 'The 0.06 BTC and 0.04 BTC coins pay the shop 0.02 BTC. Change: 0.0799 BTC. Fee: 0.0001 BTC.'
        : game.comparison === 'direct'
          ? 'A known 0.10 BTC coin pays the merchant 0.02 BTC. Change: 0.0799 BTC. Fee: 0.0001 BTC.'
          : game.comparison === 'relink'
            ? 'A 0.10 BTC CoinJoin output and another known 0.01 BTC coin fund a 0.02 BTC payment. Change: 0.0899 BTC. Fee: 0.0001 BTC.'
            : 'Three people each add 0.1001 BTC. Three equal 0.10 BTC outputs remain after a total 0.0003 BTC fee.';
  useEffect(() => {
    const read = () => {
      const route = window.location.hash.slice(1) as View;
      setView(views.includes(route) ? route : 'quests');
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: false });
  }, [view, game.index, completed]);
  useEffect(() => {
    if (game.phase === 'reveal' || game.phase === 'protect')
      feedback.current?.focus({ preventScroll: true });
  }, [game.phase]);
  function navigate(next: View) {
    window.location.hash = next;
    setView(next);
  }
  function start() {
    dispatch({ type: 'reset' });
    navigate('quest/first-clue');
  }
  function startCase() {
    caseDispatch({ type: 'reset' });
    navigate('quest/locked-fortune');
  }
  function startGiveaway() {
    giveawayDispatch({ type: 'reset' });
    navigate('quest/fake-giveaway');
  }
  function openFirstClue() {
    if (game.phase !== 'complete' && game.answers.length > 0)
      navigate('quest/first-clue');
    else start();
  }
  function openCase() {
    if (caseGame.phase !== 'briefing' && caseGame.phase !== 'complete')
      navigate('quest/locked-fortune');
    else startCase();
  }
  function openGiveaway() {
    if (giveawayGame.phase !== 'briefing' && giveawayGame.phase !== 'complete')
      navigate('quest/fake-giveaway');
    else startGiveaway();
  }
  const activeCase = view === 'quest/locked-fortune';
  const activeGiveaway = view === 'quest/fake-giveaway';
  const caseStage = caseStages[caseGame.index];
  const giveawayStage = giveawayStages[giveawayGame.index];
  useGameTools({
    snapshot: activeGiveaway
      ? {
          screen: view,
          quest: 'fake-giveaway',
          situation: giveawayStage.id,
          phase: giveawayGame.phase,
          question: giveawayStage.question,
          options: giveawayStage.answers,
          evidenceOpened: giveawayGame.opened,
          receiptShared: giveawayGame.receiptShared,
          explored: giveawayGame.explored,
          revealed:
            giveawayGame.phase === 'reveal' ||
            giveawayGame.phase === 'complete',
        }
      : activeCase
        ? {
            screen: view,
            quest: 'locked-fortune',
            situation: caseStage.id,
            phase: caseGame.phase,
            question: caseStage.question,
            options: caseStage.answers,
            evidenceOpened: caseGame.opened,
            revealed:
              caseGame.phase === 'reveal' || caseGame.phase === 'complete',
          }
        : {
            screen: view,
            quest: 'first-clue',
            situation: s.id,
            phase: game.phase,
            question: s.question,
            options: s.answers,
            revealed,
            explored: game.explored,
            comparison: game.comparison,
          },
    answer(id) {
      if (activeGiveaway) {
        if (
          giveawayGame.phase !== 'investigate' ||
          !giveawayGame.opened ||
          (giveawayGame.index === 2 && !giveawayGame.explored)
        )
          throw new Error(
            'Open the clue and try the receipt comparison before answering',
          );
        giveawayDispatch({ type: 'answer', id });
        return;
      }
      if (activeCase) {
        if (caseGame.phase !== 'investigate' || !caseGame.opened)
          throw new Error('Open the evidence package before answering');
        caseDispatch({ type: 'answer', id });
        return;
      }
      if (view !== 'quest/first-clue' || game.phase !== 'investigate')
        throw new Error('No unanswered question is open');
      dispatch({ type: 'answer', id });
    },
    compare(choice) {
      if (activeGiveaway) {
        if (giveawayGame.phase !== 'investigate')
          throw new Error('Open an unanswered clue first');
        if (choice === 'evidence' && !giveawayGame.opened) {
          giveawayDispatch({ type: 'open' });
          return;
        }
        if (
          giveawayGame.index === 2 &&
          giveawayGame.opened &&
          (choice === 'public-receipt' || choice === 'private-receipt')
        ) {
          giveawayDispatch({
            type: 'compare',
            shared: choice === 'public-receipt',
          });
          return;
        }
        throw new Error(
          'Choose evidence, public-receipt or private-receipt when available',
        );
      }
      if (activeCase) {
        if (
          choice !== 'evidence' ||
          caseGame.phase !== 'investigate' ||
          caseGame.opened
        )
          throw new Error('Choose evidence to open an unopened case package');
        caseDispatch({ type: 'open' });
        return;
      }
      if (view !== 'quest/first-clue' || game.phase !== 'protect')
        throw new Error('Switch roles before comparing');
      const action = { type: 'compare' as const, choice: choice as Comparison };
      if (gameReducer(game, action) === game)
        throw new Error('Choose an available, different comparison');
      dispatch(action);
    },
    next() {
      if (activeGiveaway) {
        if (giveawayGame.phase === 'briefing')
          giveawayDispatch({ type: 'begin' });
        else if (giveawayGame.phase === 'reveal')
          giveawayDispatch({ type: 'next' });
        else throw new Error('Inspect the clue and answer before continuing');
        return;
      }
      if (activeCase) {
        if (caseGame.phase === 'briefing') caseDispatch({ type: 'begin' });
        else if (caseGame.phase === 'reveal') caseDispatch({ type: 'next' });
        else
          throw new Error(
            'Open the evidence package and answer before continuing',
          );
        return;
      }
      if (view !== 'quest/first-clue') throw new Error('Open the quest first');
      if (game.phase === 'reveal') dispatch({ type: 'switch-role' });
      else if (game.phase === 'protect' && game.explored)
        dispatch({ type: 'next' });
      else
        throw new Error('Answer, switch roles and compare before continuing');
    },
    reset: activeGiveaway ? startGiveaway : activeCase ? startCase : start,
  });

  return (
    <div className="site-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById('main-content');
          main?.setAttribute('tabindex', '-1');
          main?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a
          href="#quests"
          className="wordmark"
          aria-label="Follow the Bitcoin — quests"
        >
          {/* Small static mark; no runtime image optimizer is needed. */}
          {/* oxlint-disable-next-line next/no-img-element */}
          <img
            className="brand-symbol"
            src="/brand/white-rabbit.svg"
            alt=""
            aria-hidden="true"
            width={42}
            height={42}
          />
          <span className="brand-text">
            follow the
            <strong>
              bitcoin<span className="brand-slash">.</span>
            </strong>
          </span>
        </a>
        <nav className="header-right" aria-label="Main navigation">
          <a
            href="#quests"
            aria-current={view === 'quests' ? 'page' : undefined}
          >
            Quests
          </a>
          <a
            href="#community"
            aria-current={view === 'community' ? 'page' : undefined}
          >
            Community
          </a>
          <a
            href="#privacy"
            aria-current={view === 'privacy' ? 'page' : undefined}
          >
            <ShieldCheck size={16} />
            <span>Privacy</span>
          </a>
        </nav>
      </header>

      {view === 'quests' && (
        <main id="main-content" className="quest-hub">
          <div className="hub-heading">
            <div>
              <span className="eyebrow">FOLLOW THE MONEY. FIND THE STORY.</span>
              <h1 ref={heading} tabIndex={-1}>
                Every payment
                <br />
                <span>leaves a clue.</span>
              </h1>
            </div>
            <p>
              Step into someone else’s shoes. Follow a bitcoin payment. Discover
              what it reveals — then learn to share less.
            </p>
          </div>
          <section className="quest-cover" aria-labelledby="first-clue-title">
            <div className="quest-cover-copy">
              <div className="quest-meta">
                <span>QUEST 01</span>
                <span>BEGINNER</span>
                <span>3–5 MIN</span>
              </div>
              <h2 id="first-clue-title">First Clue</h2>
              <p>
                A new client. A small purchase. A trail with more than one
                explanation. Can you spot the connections?
              </p>
              <ol className="quest-checklist">
                <li>
                  <Search size={18} />
                  Find a clue in three payment maps
                </li>
                <li>
                  <RotateCcw size={18} />
                  Switch sides and change a decision
                </li>
                <li>
                  <Award size={18} />
                  Earn your First Clue badge
                </li>
              </ol>
              <Button className="primary-action" onClick={openFirstClue}>
                {game.phase !== 'complete' && game.answers.length > 0
                  ? 'Continue quest'
                  : 'Start the quest'}
                <ArrowRight size={19} />
              </Button>
              <p className="start-note">
                No Bitcoin experience needed. No account. No real funds.
              </p>
            </div>
            <div className="quest-cover-map" aria-hidden="true">
              <div className="map-title">
                <span className="mono-label">YOUR FIRST CASE FILE</span>
                <span className="case-number">01 / 03</span>
              </div>
              <AddressGraph changed={false} revealed={false} />
              <div className="clue-label">
                <Fingerprint size={20} />
                <span>
                  Two payments.
                  <br />
                  <strong>What connects them?</strong>
                </span>
              </div>
            </div>
          </section>
          <section
            className="quest-cover case-cover"
            aria-labelledby="locked-fortune-title"
          >
            <div className="quest-cover-copy">
              <div className="quest-meta">
                <span>QUEST 02</span>
                <span>REAL CASE</span>
                <span>4–6 MIN</span>
              </div>
              <h2 id="locked-fortune-title">The Locked Fortune</h2>
              <p>
                Almost 120,000 bitcoin stolen. A trail without a name. Can you
                connect the evidence in the Bitfinex investigation?
              </p>
              <ol className="quest-checklist">
                <li>
                  <Search size={18} />
                  Open three evidence packages
                </li>
                <li>
                  <Lightbulb size={18} />
                  Separate a lead from a conclusion
                </li>
                <li>
                  <Award size={18} />
                  Earn your Evidence Detective badge
                </li>
              </ol>
              <Button className="primary-action" onClick={openCase}>
                {caseGame.phase !== 'briefing' && caseGame.phase !== 'complete'
                  ? 'Continue investigation'
                  : 'Explore the real case'}
                <ArrowRight size={19} />
              </Button>
              <p className="start-note">
                Beginner friendly. Play in any order. Based on primary sources.
              </p>
            </div>
            <div className="quest-cover-map">
              <CaseTeaser />
            </div>
          </section>
          <section
            className="quest-cover giveaway-cover"
            aria-labelledby="fake-giveaway-title"
          >
            <div className="quest-cover-copy">
              <div className="quest-meta">
                <span>QUEST 03</span>
                <span>REAL CASE</span>
                <span>4–6 MIN</span>
              </div>
              <h2 id="fake-giveaway-title">The Fake Giveaway</h2>
              <p>
                Famous accounts. An impossible promise. Your friend is about to
                send bitcoin. Can you spot the clues in the 2020 Twitter hack?
              </p>
              <ol className="quest-checklist">
                <li>
                  <Eye size={18} />
                  Look behind two convincing posts
                </li>
                <li>
                  <Search size={18} />
                  Find what the payment trail really proves
                </li>
                <li>
                  <Award size={18} />
                  Earn your Signal Sleuth badge
                </li>
              </ol>
              <Button className="primary-action" onClick={openGiveaway}>
                {giveawayGame.phase !== 'briefing' &&
                giveawayGame.phase !== 'complete'
                  ? 'Continue the case'
                  : 'Investigate the giveaway'}
                <ArrowRight size={19} />
              </Button>
              <p className="start-note">
                No Bitcoin knowledge needed. Try a privacy choice yourself.
              </p>
            </div>
            <div className="quest-cover-map">
              <GiveawayTeaser />
            </div>
          </section>
          <div className="hub-bottom">
            <p>
              <LockKeyhole size={17} />
              Your guesses stay in this tab.
            </p>
            <a href="#source">
              <GitBranch size={17} />
              Built in the open
            </a>
            <a href="#bonus">
              Bonus: what can a website see?
              <ArrowRight size={16} />
            </a>
          </div>
          <section className="next-quests">
            <span className="eyebrow">MORE CASES, MORE PERSPECTIVES</span>
            <p>
              Start with everyday payments or open a real investigation. Every
              quest has its own badge. More cases will follow.
            </p>
          </section>
        </main>
      )}

      {view === 'quest/locked-fortune' && (
        <LockedFortune
          game={caseGame}
          dispatch={caseDispatch}
          onFirstClue={openFirstClue}
          onNextQuest={openGiveaway}
        />
      )}

      {view === 'quest/fake-giveaway' && (
        <FakeGiveaway
          game={giveawayGame}
          dispatch={giveawayDispatch}
          onFirstClue={openFirstClue}
        />
      )}

      {view === 'quest/first-clue' && game.phase !== 'complete' && (
        <main id="main-content" className="game-main">
          <div className="intro-line">
            <a className="quiet-link" href="#quests">
              <ArrowLeft size={15} />
              All quests
            </a>
            <span className="eyebrow">FIRST CLUE · {game.index + 1} OF 3</span>
          </div>
          <div className="round-heading">
            <h1 ref={heading} tabIndex={-1}>
              {s.title.split('\n')[0]}
              <br />
              <span>{s.title.split('\n')[1]}</span>
            </h1>
            <p className="round-story">
              {game.phase === 'protect'
                ? protectStories[game.index]
                : roleStories[game.index]}
            </p>
          </div>
          <ol className="steps" aria-label="Quest progress">
            {scenarios.map((sc, i) => (
              <li
                key={sc.id}
                className={
                  i === game.index
                    ? 'current'
                    : i < game.index
                      ? 'complete'
                      : ''
                }
                aria-current={i === game.index ? 'step' : undefined}
              >
                <span className="step-number">
                  {i < game.index ? <Check size={16} /> : `0${i + 1}`}
                </span>
                <span>{sc.name}</span>
                <span className="step-line" />
              </li>
            ))}
          </ol>
          <div className="game-grid">
            <section
              className="scene-card"
              aria-label="Payment map"
              ref={paymentMap}
              tabIndex={-1}
            >
              <div className="scene-toolbar">
                <span className="mono-label">THE PAYMENT MAP</span>
                <span className="fiction-label">FICTIONAL DATA</span>
              </div>
              <div className="map-area">
                {game.index === 0 ? (
                  <AddressGraph changed={changed} revealed={revealed} />
                ) : game.index === 1 ? (
                  <SpendGraph changed={changed} revealed={revealed} />
                ) : (
                  <CoinjoinGraph mode={game.comparison as CoinjoinMode} />
                )}
              </div>
              <div className="map-caption">
                <span className="legend">
                  <i />
                  Public transaction link
                </span>
                <span className="legend">
                  <i className="legend-dashed" />
                  Possible ownership link
                </span>
              </div>
              <div className="map-description">{mapDescription}</div>
              <details className="glossary">
                <summary>New word: {glossary[game.index][0]}</summary>
                <p>{glossary[game.index][1]}</p>
              </details>
              {game.phase === 'protect' && (
                <button
                  type="button"
                  className="map-jump"
                  onClick={() => feedback.current?.focus()}
                >
                  Back to your choices <ArrowRight size={16} />
                </button>
              )}
            </section>
            <section className="question-card" aria-labelledby="question-title">
              <ol className="phase-trail" aria-label="Steps in this clue">
                {['Investigate', 'Reveal', 'Try a change'].map((label, i) => (
                  <li
                    key={label}
                    aria-current={
                      ['investigate', 'reveal', 'protect'][i] === game.phase
                        ? 'step'
                        : undefined
                    }
                  >
                    <span>{i + 1}</span>
                    {label}
                  </li>
                ))}
              </ol>
              <div className="observer">
                <span className="observer-icon">
                  {game.phase === 'protect' ? (
                    <Fingerprint size={21} />
                  ) : (
                    <Eye size={21} />
                  )}
                </span>
                <div>
                  <span className="eyebrow">
                    {game.phase === 'protect'
                      ? 'ROLE SWITCH · YOUR TURN'
                      : 'YOU ARE THE INVESTIGATOR'}
                  </span>
                  <strong>
                    {game.phase === 'protect'
                      ? [
                          'The designer',
                          'The person paying',
                          'A CoinJoin participant',
                        ][game.index]
                      : s.observer}
                  </strong>
                </div>
              </div>
              <p className="observer-knowledge">
                {game.phase === 'protect'
                  ? 'Try another choice on the same fictional payment. You are changing this example, not deleting its history.'
                  : s.knowledge}
              </p>
              <div className="question-divider" />
              <h2 id="question-title">
                {game.phase === 'protect'
                  ? [
                      'Give each payment its own address.',
                      'Can you leave one coin out?',
                      'Which choices preserve the uncertainty?',
                    ][game.index]
                  : s.question}
              </h2>
              {game.phase === 'investigate' && (
                <>
                  <fieldset
                    className="answer-options"
                    aria-labelledby="question-title"
                  >
                    {s.answers.map((answer, i) => (
                      <button
                        className="answer-option"
                        type="button"
                        key={answer.id}
                        onClick={() =>
                          dispatch({ type: 'answer', id: answer.id })
                        }
                      >
                        <span className="answer-letter">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{answer.text}</span>
                        <ArrowRight size={17} aria-hidden="true" />
                      </button>
                    ))}
                  </fieldset>
                  <p className="under-button">
                    Choose a theory. Every guess reveals something.
                  </p>
                </>
              )}
              {game.phase === 'reveal' && (
                <div className="answer-reveal" ref={feedback} tabIndex={-1}>
                  <div className="verdict">
                    <Lightbulb size={21} />
                    <strong>
                      {gradeAnswer(game.index, game.answers[game.index])
                        ? 'You spotted the clue.'
                        : 'Here is the missing clue.'}
                    </strong>
                  </div>
                  <p className="explanation">{s.explanation}</p>
                  <div className="theory-recap">
                    <span>Your theory</span>
                    <p>
                      {
                        s.answers.find(
                          (answer) => answer.id === game.answers[game.index],
                        )?.text
                      }
                    </p>
                    {!gradeAnswer(game.index, game.answers[game.index]) && (
                      <>
                        <span>The supported conclusion</span>
                        <p>
                          {
                            s.answers.find((answer) => answer.id === s.correct)
                              ?.text
                          }
                        </p>
                      </>
                    )}
                  </div>
                  <a
                    className="source-link"
                    href={s.source}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Read the source
                    <ArrowUpRight size={14} />
                  </a>
                  <Button
                    className="primary-action"
                    onClick={() => dispatch({ type: 'switch-role' })}
                  >
                    Switch roles
                    <RotateCcw size={18} />
                  </Button>
                  <p className="under-button">Now see what you can change.</p>
                </div>
              )}
              {game.phase === 'protect' && (
                <div
                  ref={feedback}
                  tabIndex={-1}
                  className="protection-controls"
                >
                  {game.index < 2 ? (
                    <>
                      <p className="explanation">
                        {protectStories[game.index]}
                      </p>
                      <Button
                        className="experiment-button"
                        variant="outline"
                        onClick={() =>
                          dispatch({
                            type: 'compare',
                            choice: changed ? 'original' : 'alternative',
                          })
                        }
                      >
                        {changed ? (
                          <>
                            <RotateCcw size={17} />
                            Compare original
                          </>
                        ) : (
                          <>
                            {game.index === 0
                              ? 'Try a fresh address'
                              : 'Use just one coin'}
                            <ArrowRight size={17} />
                          </>
                        )}
                      </Button>
                      {game.explored && (
                        <output className="change-explanation">
                          {changed
                            ? s.takeaway
                            : 'The original connection is visible again. You can switch back to compare.'}
                        </output>
                      )}
                    </>
                  ) : (
                    <Tabs
                      value={game.comparison}
                      onValueChange={(choice) =>
                        dispatch({
                          type: 'compare',
                          choice: choice as Comparison,
                        })
                      }
                    >
                      <TabsList
                        className="mode-tabs"
                        aria-label="Compare payment choices"
                      >
                        <TabsTrigger value="direct">Direct payment</TabsTrigger>
                        <TabsTrigger value="coinjoin">
                          After CoinJoin
                        </TabsTrigger>
                        <TabsTrigger value="relink">Link it again</TabsTrigger>
                      </TabsList>
                      <TabsContent value="direct">
                        A direct transaction path connects the known coin to the
                        payment. Fee: 0.0001 BTC.
                      </TabsContent>
                      <TabsContent value="coinjoin">
                        Several possible ownership matches fit the same public
                        transaction. That uncertainty is the benefit.
                      </TabsContent>
                      <TabsContent value="relink">
                        Combining the output with another identity-linked coin
                        gives the observer a new clue about common ownership.
                      </TabsContent>
                    </Tabs>
                  )}
                  {game.explored && (
                    <button
                      type="button"
                      className="map-jump"
                      onClick={() => paymentMap.current?.focus()}
                    >
                      See what changed on the map <ArrowRight size={16} />
                    </button>
                  )}
                  <Button
                    className="primary-action"
                    disabled={!game.explored}
                    onClick={() => dispatch({ type: 'next' })}
                  >
                    {game.index === 2
                      ? 'Claim your First Clue badge'
                      : 'Open the next clue'}
                    <ArrowRight size={18} />
                  </Button>
                  {!game.explored && (
                    <p className="under-button nudge">
                      Try a different choice to continue.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
          <div className="bottom-note">
            <span>
              <LockKeyhole size={15} />
              Your answers stay in this tab.
            </span>
            <span>Real ideas. Fictional bitcoin.</span>
          </div>
        </main>
      )}

      {view === 'quest/first-clue' && game.phase === 'complete' && (
        <main id="main-content" className="summary-main">
          <span className="eyebrow">CASE CLOSED · QUEST 01</span>
          <h1 ref={heading} tabIndex={-1}>
            You followed the bitcoin.
            <br />
            <span>Now leave fewer clues.</span>
          </h1>
          <BadgeCard />
          <div className="takeaways">
            {scenarios.map((sc, i) => (
              <article key={sc.id}>
                <span className="takeaway-number">0{i + 1}</span>
                <h2>
                  {
                    [
                      'A fresh address.',
                      'A deliberate choice.',
                      'More possible stories.',
                    ][i]
                  }
                </h2>
                <p>{sc.takeaway}</p>
              </article>
            ))}
          </div>
          <div className="completion-links">
            <Button onClick={openCase}>
              <Search size={17} />
              Open The Locked Fortune
            </Button>
            <Button onClick={openGiveaway}>
              <Eye size={17} />
              Investigate The Fake Giveaway
            </Button>
            <Button onClick={() => navigate('bonus')}>
              <Compass size={17} />
              Explore the web privacy bonus
            </Button>
            <Button variant="outline" onClick={() => navigate('community')}>
              <MessageCircle size={17} />
              Meet other investigators
            </Button>
            <Button variant="ghost" onClick={start}>
              <RotateCcw size={17} />
              Play again
            </Button>
          </div>
        </main>
      )}

      {view === 'privacy' && (
        <main id="main-content" className="info-main">
          <span className="eyebrow">A SMALLER DATA FOOTPRINT</span>
          <h1 ref={heading} tabIndex={-1}>
            Play the game.
            <br />
            <span>Keep your own story.</span>
          </h1>
          <div className="info-grid">
            <article>
              <LockKeyhole size={26} />
              <h2>Nothing to sign up for</h2>
              <p>
                No account, email address, wallet connection or real transaction
                is needed. First Clue uses fictional payments. The Locked
                Fortune and The Fake Giveaway use clearly labelled illustrations
                based on documented cases.
              </p>
            </article>
            <article>
              <Fingerprint size={26} />
              <h2>Your device does the work</h2>
              <p>
                Answers, progress and badges are handled in this tab. There are
                no tracking cookies, local storage, fingerprinting or answer
                uploads. Reloading clears progress; a badge you download stays
                in your files.
              </p>
            </article>
            <article>
              <Eye size={26} />
              <h2>Site analytics</h2>
              <p>
                This Pages edition uses Cloudflare Web Analytics to measure
                visits, page views and performance. A Cloudflare script runs in
                your browser and sends measurement data to Cloudflare. It does
                not receive your quest answers. Cloudflare also handles hosting
                requests under its privacy policy.
              </p>
              <ExternalLink href="https://www.cloudflare.com/privacypolicy/">
                Cloudflare privacy policy
              </ExternalLink>
            </article>
            <article>
              <ShieldCheck size={26} />
              <h2>The connection still matters</h2>
              <p>
                Serving a page requires handling connection information. Hosting
                and network providers may process it independently. Tor Browser
                can reach the HTTPS site; an onion mirror avoids a Tor exit
                relay.
              </p>
              {siteConfig.onionUrl ? (
                <ExternalLink href={siteConfig.onionUrl}>
                  Open the onion mirror
                </ExternalLink>
              ) : (
                <p className="availability-note">
                  An onion address has not been published yet. We will show the
                  verified address here when it is live.
                </p>
              )}
            </article>
          </div>
          <section className="info-callout">
            <h2>You choose when to leave</h2>
            <p>
              Fonts, icons, scripts and badge images are served here or
              generated on your device. Community, GitHub and source links
              contact other services only when you follow them. Those services
              have their own data practices.
            </p>
            <p>
              For Tor Browser’s Safest mode, the no-JavaScript reading version
              below the page includes every lesson.
            </p>
            <a href="#bonus" className="resource-link">
              Explore the connection in the bonus
              <ArrowRight size={17} />
            </a>
          </section>
        </main>
      )}
      {view === 'community' && (
        <main id="main-content" className="info-main">
          <span className="eyebrow">COMPARE NOTES, KEEP YOUR PRIVACY</span>
          <h1 ref={heading} tabIndex={-1}>
            Better questions.
            <br />
            <span>Shared discoveries.</span>
          </h1>
          <section className="community-panel">
            <MessageCircle size={40} strokeWidth={1.4} />
            <h2>The investigators’ room</h2>
            <p>
              Talk through a clue, suggest a new quest, or share what surprised
              you. Use a nickname and keep real wallet addresses, balances and
              private details out of the conversation.
            </p>
            {siteConfig.communityUrl ? (
              <>
                <ExternalLink href={siteConfig.communityUrl}>
                  Join on {siteConfig.communityProvider}
                </ExternalLink>
                <p className="fine-print">
                  This opens a public GitHub discussion. Reading is open;
                  posting requires a GitHub account. Use a separate nickname if
                  you prefer. Posts and your GitHub profile are visible to
                  others. The game receives no chat history or account details.
                </p>
              </>
            ) : (
              <div className="availability-note">
                <strong>The room is not open yet.</strong>
                <p>
                  A moderator-owned invitation will appear here once the
                  community is ready. You can play every quest without joining.
                </p>
              </div>
            )}
            <details className="glossary">
              <summary>Why a separate community?</summary>
              <p>
                The game works without a community account. Discussions live
                alongside the open-source project so you can ask questions,
                propose cases and inspect the code in one place. GitHub applies
                its own account and data policies. Treat every post as public;
                keep wallet details and identifying information to yourself.
              </p>
              <ExternalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                GitHub privacy policy
              </ExternalLink>
            </details>
          </section>
          <section className="info-callout">
            <h2>A few ground rules</h2>
            <p>
              Be helpful. Mark spoilers. Challenge claims with evidence. No
              harassment, doxxing, scams, seed phrases or requests for funds.
              Report harmful content to the group moderators.
            </p>
          </section>
        </main>
      )}
      {view === 'source' && (
        <main id="main-content" className="info-main">
          <span className="eyebrow">OPEN SOURCE · MIT LICENSE</span>
          <h1 ref={heading} tabIndex={-1}>
            Check the work.
            <br />
            <span>Make it better.</span>
          </h1>
          <section className="info-callout">
            <GitBranch size={30} />
            <h2>Small changes. Public review.</h2>
            <p>
              The game is designed to be read, forked and self-hosted. New
              quests need clear learning goals, reproducible examples and
              sources. Claims about real cases must separate documented facts
              from the game’s simplifications.
            </p>
            {siteConfig.repositoryUrl ? (
              <ExternalLink href={siteConfig.repositoryUrl}>
                Source, issues and contributions on GitHub
              </ExternalLink>
            ) : (
              <p className="availability-note">
                The source is prepared for release under the MIT license. The
                project’s public GitHub repository has not been published yet.
              </p>
            )}
            <p>
              Contributions go through issues and pull requests with tests and
              review. Neither wallet sponsorship nor affiliation determines a
              quest’s conclusions. The first release has no wallet promotion.
            </p>
          </section>
        </main>
      )}
      {view === 'bonus' && (
        <WebBonus
          back={() =>
            navigate(game.phase === 'complete' ? 'quest/first-clue' : 'quests')
          }
          headingRef={heading}
        />
      )}
      <footer className="site-footer">
        <span className="footer-brand">
          {/* oxlint-disable-next-line next/no-img-element */}
          <img
            src="/brand/white-rabbit.svg"
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
          />
          Follow the Bitcoin
        </span>
        <div className="footer-links">
          <a href="#source">Open source</a>
          <a href="#privacy">Privacy & Tor</a>
          <a href="#community">Community</a>
        </div>
      </footer>
    </div>
  );
}
