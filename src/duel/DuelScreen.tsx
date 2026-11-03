import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { artworkUrl } from '../artwork';
import { CHARACTERS } from '../game/characters';
import type { CharacterId, Rarity } from '../game/characters';
import type { Formula } from '../game/engine';
import { chooseSpell } from './bot';
import { createDuel, evaluateSpell, FAMILIAR_LABEL, FAMILIAR_PERK, MAX_SPELL, OP_SYMBOL, RESONANCE_DAMAGE, resolveRound, WIN_DAMAGE } from './engine';
import type { Difficulty, DuelCard, DuelState, RoundResult, Rune as RuneData, TrialId } from './types';
import './duel.css';

type Trial = { id: TrialId; numeral: string; name: string; difficulty: Difficulty; teaches: string; example: string; ink: 'yellow' | 'pink' | 'teal' };
const TRIALS: Trial[] = [
  { id: 'sums', numeral: 'I', name: 'Trial of Sums', difficulty: 'easy', teaches: 'Merge number stones to hit the rune.', example: 'Make 11 → 5 + 6', ink: 'yellow' },
  { id: 'products', numeral: 'II', name: 'Trial of Products', difficulty: 'medium', teaches: 'Multiply, use brackets, call familiars.', example: 'Make 12 → (3 + 3) × 2', ink: 'pink' },
  { id: 'unknowns', numeral: 'III', name: 'Trial of Unknowns', difficulty: 'hard', teaches: 'Solve the equation, then make x.', example: '2x + 1 = 13 → x = 6', ink: 'teal' },
];
const TIPS: Record<TrialId, string> = {
  sums: 'Put stones side by side and they merge: 5 and 7 make 5 + 7 = 12. Tobin adds 2 to everything before him.',
  products: '× happens before +: 5, 3, × 2 is 5 + 3 × 2 = 11. A familiar wraps everything before it: 5, 3, Twin Embers is (5 + 3) × 2 = 16. Two or more familiars that hit exactly make a combo.',
  unknowns: 'Undo the equation step by step. 2x + 1 = 13: take away 1 to get 2x = 12, then halve it: x = 6. Then build 6.',
};
const STONE_INKS = ['yellow', 'pink', 'teal'] as const;
const OP_WORD = { '+': 'plus', '-': 'minus', '*': 'times' } as const;
const PORTRAITS = { veyra: artworkUrl('duel-veyra') ?? artworkUrl('examiner'), apprentice: artworkUrl('duel-apprentice') ?? artworkUrl('apprentice') };
const FAMILIAR_IDS = Object.keys(CHARACTERS) as CharacterId[];
const numberOf = (id: CharacterId) => FAMILIAR_IDS.indexOf(id) + 1;

// What may come next: a stone first; a stone after a glyph; otherwise a stone (merges: +), a familiar, or a glyph if its stone still fits.
function canAppend(spell: DuelCard[], card: DuelCard): boolean {
  if (spell.length >= MAX_SPELL) return false;
  const last = spell.at(-1);
  if (!last || last.kind === 'glyph') return card.kind === 'stone';
  return card.kind !== 'glyph' || spell.length <= MAX_SPELL - 2;
}
function whyNot(spell: DuelCard[], card: DuelCard): string {
  const last = spell.at(-1);
  if (spell.length >= MAX_SPELL) return 'A spell holds five cards.';
  if (!last) return 'Start with a number stone.';
  if (last.kind === 'glyph') return `After ${OP_SYMBOL[last.op]}, add a number stone.`;
  return card.kind === 'glyph' ? 'No room left for a glyph and its number.' : 'That card can’t go there.';
}
const merges = (spell: DuelCard[], i: number) => i > 0 && spell[i].kind === 'stone' && spell[i - 1].kind !== 'glyph';
function label(card: DuelCard): string {
  if (card.kind === 'stone') return `Number stone ${card.value}`;
  if (card.kind === 'glyph') return `Glyph: ${OP_WORD[card.op]}`;
  const c = CHARACTERS[card.familiar]; return `${c.name}, ${FAMILIAR_LABEL[c.formula]}${FAMILIAR_PERK[card.familiar] ? `. ${FAMILIAR_PERK[card.familiar]}` : ''}`;
}
function partial(spell: DuelCard[]): string {
  const last = spell.at(-1);
  if (last?.kind !== 'glyph') return evaluateSpell(spell)?.expression ?? '';
  return `${evaluateSpell(spell.slice(0, -1))?.expression ?? ''} ${OP_SYMBOL[last.op]} …`;
}
const said = (expression: string, value: number) => expression === String(value) ? expression : `${expression} = ${value}`;
const promptOf = (rune: RuneData) => rune.equation ? `Solve ${rune.equation}` : `Make ${rune.target}`;
function headline(result: RoundResult): { title: string; tone: string } {
  const { player: me, opponent: them, winner } = result;
  if (winner === 'both') return { title: 'Double Resonance', tone: 'resonance' };
  if (winner === 'player') return me.resonant ? { title: 'Resonance!', tone: 'resonance' } : { title: 'Round won', tone: 'win' };
  if (winner === 'opponent') return them.resonant ? { title: 'Veyra resonates', tone: 'lose' } : { title: 'Round lost', tone: 'lose' };
  return { title: 'Dead even', tone: 'round' };
}

const STARS: Record<Rarity, string> = { common: '★', rare: '★★', legendary: '★★★' };
// Badge text: a lone ² is too small to read, so the square shows what it wraps.
const BADGE: Record<Formula, string> = { linear: '× 2', quadratic: '( )²', additive: '+ 2' };
const FAMILY_SIGN: Record<Formula, string> = { linear: '×', quadratic: '²', additive: '+' };
const FAMILY_RULE: Record<Formula, string> = { linear: 'Doubles everything before it.', quadratic: 'Squares everything before it.', additive: 'Adds 2 to everything before it.' };

function Face({ card }: { card: DuelCard }) {
  if (card.kind === 'stone') return <span className={`face stone ink-${STONE_INKS[card.value % 3]}`}><span className="pebble" /><b>{card.value}</b><span className="pips">{Array.from({ length: card.value }, (_, i) => <i key={i} />)}</span></span>;
  if (card.kind === 'glyph') return <span className="face glyph"><span className="ring" /><b>{OP_SYMBOL[card.op]}</b></span>;
  const c = CHARACTERS[card.familiar]; const art = artworkUrl(`card-${card.familiar}`);
  return <span className={`face familiar ${c.rarity}`}>{art && <img src={art} alt="" />}<b className="op">{BADGE[c.formula]}</b><i className="stars" aria-hidden="true">{STARS[c.rarity]}</i><span className="name">{c.name}</span></span>;
}

// The printed-card layout: art window with operation and rarity, name sticker, family mark, rules box, collector footer.
function FamiliarCard({ id }: { id: CharacterId }) {
  const c = CHARACTERS[id]; const art = artworkUrl(`card-${id}`);
  return <article className={`tcg ${c.rarity}`} aria-label={label({ id, kind: 'familiar', familiar: id })}>
    <div className="tcg-art">{art && <img src={art} alt="" />}
      <b className="tcg-op">{BADGE[c.formula]}</b><span className="tcg-stars">{STARS[c.rarity]}</span>
      <span className="tcg-name">{c.name}</span><span className="tcg-family" aria-hidden="true"><i>{FAMILY_SIGN[c.formula]}</i></span>
    </div>
    <p className="tcg-title">{c.title}</p>
    <div className="tcg-text"><p><b>{FAMILY_RULE[c.formula]}</b></p>{FAMILIAR_PERK[id] && <p>Perk: {FAMILIAR_PERK[id]}</p>}<p className="flavor">{c.flavor}</p></div>
    <footer><span>Familiar · {c.rarity}</span><span>{String(numberOf(id)).padStart(2, '0')}/06</span></footer>
  </article>;
}

const TICKS = Array.from({ length: 24 }, (_, i) => { const a = (i * Math.PI) / 12; const r1 = i % 2 ? 133 : 127; return `M${150 + r1 * Math.cos(a)} ${150 + r1 * Math.sin(a)}L${150 + 143 * Math.cos(a)} ${150 + 143 * Math.sin(a)}`; }).join('');
function RuneLines() { return <><path d={TICKS} /><circle cx="150" cy="150" r="143" /><circle cx="150" cy="150" r="119" strokeDasharray="4 7" /><path d="M150 12 270 220H30Z" /></>; }
// Before a reveal the rune asks; after it, the rune shows what you made against the target.
function Rune({ rune, unknown, outcome }: { rune: RuneData; unknown: boolean; outcome: RoundResult | null }) {
  const me = outcome?.player; const them = outcome?.opponent;
  return <div className={`rune ${me?.resonant ? 'resonant' : ''}`} role="status" aria-live="polite" aria-label={me ? `You made ${me.value}, ${me.resonant ? 'exact' : `${me.distance} away`}` : unknown ? `Solve for x: ${rune.equation}` : `Make ${rune.target}`}>
    <svg viewBox="0 0 300 300" aria-hidden="true"><g className="misreg"><RuneLines /></g><g className="main"><RuneLines /><circle className="disc" cx="150" cy="150" r="96" /></g></svg>
    <div className="rune-text" aria-hidden="true">{me
      ? <><small>{unknown ? <><i className="var">x</i> = {rune.target}</> : <>Make {rune.target}</>}</small><b className="made">{me.value}</b><em className={`stamp ${me.resonant ? 'exact' : ''}`}>{me.resonant ? 'Exact!' : `${me.distance} away`}</em></>
      : unknown ? <><small>Solve for <i className="var">x</i></small><b className="equation">{rune.equation}</b><small>then make <i className="var">x</i></small></>
      : <><small>Make</small><b>{rune.target}</b></>}</div>
    {them && <span className={`their-value ${them.resonant ? 'exact' : ''}`} aria-hidden="true">Veyra <b>{them.value}</b>{them.resonant ? ' ✓' : ''}</span>}
  </div>;
}

function Medallion({ name, title, hp, max, art, hit }: { name: string; title: string; hp: number; max: number; art?: string; hit: number }) {
  return <div className="medallion">
    <span className="portrait">{art && <img src={art} alt="" />}</span>
    <span className="who"><b>{name}</b><small>{title}</small>
      <span className="hp" role="meter" aria-label={`${name} health`} aria-valuenow={hp} aria-valuemin={0} aria-valuemax={max}><i style={{ transform: `scaleX(${hp / max})` }} /></span>
      <span className="hp-text">{hp} / {max}</span></span>
    {hit > 0 && <span className="hit" aria-hidden="true">−{hit}</span>}
  </div>;
}

function Verdict({ result, unknown, last, onNext }: { result: RoundResult; unknown: boolean; last: boolean; onNext: () => void }) {
  const { player: me, opponent: them, winner } = result;
  const line = (who: string, s: RoundResult['player']) => <div><dt>{who}</dt><dd>{s.cards.length ? said(s.expression, s.value) : 'no spell'} <em className={s.resonant ? 'exact' : ''}>{s.resonant ? 'exact' : `${s.distance} away`}</em></dd></div>;
  return <section className={`verdict ${winner}`} aria-live="polite">
    <h2>{headline(result).title}</h2>
    <dl>{line('You', me)}{line('Veyra', them)}</dl>
    {(result.damageToOpponent > 0 || result.damageToPlayer > 0) && <p className="damage">{result.damageToOpponent > 0 && <span>Veyra −{result.damageToOpponent}</span>}{result.damageToPlayer > 0 && <span>You −{result.damageToPlayer}</span>}</p>}
    {unknown && result.rune.working && <p className="working">{result.rune.working.join('  →  ')}</p>}
    {result.solution && <p className="solution">An exact answer was in your hand: <b>{result.solution}</b></p>}
    {result.notes.map(note => <p className="note" key={note}>{note}</p>)}
    <button className="riso-btn" onClick={onNext} autoFocus>{last ? 'See the result' : 'Next rune'} →</button>
  </section>;
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return <div className="d-modal-back" onClick={onClose}><div className={`d-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
    {children}<button className="text-btn" onClick={onClose} autoFocus>Close</button>
  </div></div>;
}

function Rules() {
  return <><h2>How to play</h2><ol className="rules">
    <li><b>Read the rune.</b> It asks for a number: <em>Make 12</em>. In Trial III, solve the equation first to find <i>x</i>.</li>
    <li><b>Build a spell</b> of up to five cards, starting with a number stone.</li>
    <li><b>Stones side by side merge</b> into a sum: 5 and 7 make 5 + 7.</li>
    <li><b>Glyphs × and −</b> go between stones. × happens before + and −.</li>
    <li><b>Familiars wrap everything before them:</b> Twin Embers × 2, Sorrel ( )², Tobin + 2.</li>
    <li><b>Closer than Veyra</b> wins the round for {WIN_DAMAGE} damage. <b>Exact</b> is a Resonance: {RESONANCE_DAMAGE} damage, plus 1 for every extra familiar in the combo.</li>
    <li>First to 0 health loses. After a miss, the game shows you an exact answer from your hand.</li>
  </ol></>;
}

const CONFETTI = Array.from({ length: 44 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 9) * 0.16, ink: ['pink', 'teal', 'yellow', 'blue'][i % 4], spin: (i * 53) % 360, size: 7 + (i % 4) * 3 }));
function Confetti() {
  return <div className="confetti" aria-hidden="true">{CONFETTI.map((c, i) => <i key={i} className={c.ink} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, width: c.size, height: c.size * 1.6, '--spin': `${c.spin}deg` } as CSSProperties} />)}</div>;
}

type Ribbon = { id: number; title: string; sub: string; tone: string };

function Duel({ trial, seed, onExit, onReplay, onNextTrial }: { trial: Trial; seed: number; onExit: () => void; onReplay: () => void; onNextTrial?: () => void }) {
  const [duel, setDuel] = useState(() => createDuel(trial.id, trial.difficulty, seed));
  const [spell, setSpell] = useState<DuelCard[]>([]);
  const [stage, setStage] = useState<'build' | 'inking' | 'reveal' | 'over'>('build');
  const [theirs, setTheirs] = useState<DuelCard[]>([]);
  const [inked, setInked] = useState(0);
  const [pending, setPending] = useState<DuelState | null>(null);
  const [nudge, setNudge] = useState('');
  const [help, setHelp] = useState(false);
  const [ribbon, setRibbon] = useState<Ribbon | null>(null);
  const [stats, setStats] = useState({ resonances: 0, best: '', bestLength: 0 });
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(t => clearTimeout(t)), []);

  // A ribbon sweeps across the stage for round starts and results, then clears itself.
  function flash(title: string, sub: string, tone: string, ms = 1500) {
    const id = Date.now() + Math.random();
    setRibbon({ id, title, sub, tone });
    timers.current.push(window.setTimeout(() => setRibbon(r => (r?.id === id ? null : r)), ms));
  }
  useEffect(() => { flash('Round 1', promptOf(duel.rune), 'round', 1300); }, []);

  const unknown = trial.id === 'unknowns';
  const result = (stage === 'reveal' || stage === 'over') && pending ? pending.lastResult! : null;
  const rune = result?.rune ?? duel.rune;
  const shown = pending ?? duel;
  const hand = duel.player.hand.filter(c => !spell.some(s => s.id === c.id));
  const evaluated = evaluateSpell(spell);
  const ready = stage === 'build' && spell.length > 0 && evaluated !== null;
  const distance = evaluated ? Math.abs(evaluated.value - rune.target) : null;
  const readout = nudge || (!spell.length ? (unknown ? 'Solve the equation, then build x. Start with a number stone.' : 'Start with a number stone.')
    : !evaluated ? `${partial(spell)}  ·  add a number`
    : unknown ? `${said(evaluated.expression, evaluated.value)}   →   x = ${evaluated.value}?`
    : `${said(evaluated.expression, evaluated.value)}  ·  ${distance === 0 ? 'exact!' : `${distance} away`}`);

  function add(card: DuelCard) {
    if (stage !== 'build') return;
    if (!canAppend(spell, card)) { setNudge(whyNot(spell, card)); return; }
    setNudge(''); setSpell([...spell, card]);
  }
  function cut(index: number) { if (stage === 'build') { setNudge(''); setSpell(spell.slice(0, index)); } }
  function cast() {
    if (!ready) return;
    const bot = chooseSpell(duel.opponent.hand, duel.rune.target, duel.difficulty, duel.seed);
    const next = resolveRound(duel, spell, bot);
    const step = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320;
    setTheirs(bot); setInked(0); setStage('inking'); setNudge('');
    bot.forEach((_, i) => timers.current.push(window.setTimeout(() => setInked(i + 1), step * (i + 1))));
    timers.current.push(window.setTimeout(() => {
      const outcome = next.lastResult!; const mine = outcome.player;
      if (mine.resonant) setStats(s => ({ resonances: s.resonances + 1, best: mine.cards.length >= s.bestLength ? said(mine.expression, mine.value) : s.best, bestLength: Math.max(s.bestLength, mine.cards.length) }));
      const { title, tone } = headline(outcome);
      flash(title, `${said(mine.expression, mine.value)}  vs  ${said(outcome.opponent.expression, outcome.opponent.value)}`, tone, 1700);
      setPending(next); setStage('reveal');
    }, step * (bot.length + 2)));
  }
  function proceed() {
    if (stage !== 'reveal' || !pending) return;
    if (pending.phase !== 'build') { setStage('over'); return; }
    flash(`Round ${pending.round}`, promptOf(pending.rune), 'round', 1200);
    setDuel(pending); setPending(null); setSpell([]); setTheirs([]); setInked(0); setStage('build');
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (help || (event.target as HTMLElement).closest('button')) return;
      if (event.key === 'Enter' && stage === 'build' && ready) { event.preventDefault(); cast(); }
      else if (event.key === 'Enter' && stage === 'reveal') { event.preventDefault(); proceed(); }
      else if (event.key === 'Backspace' && stage === 'build' && spell.length) { event.preventDefault(); cut(spell.length - 1); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });

  const revealed = stage === 'reveal' || stage === 'over';
  const victory = pending?.phase === 'victory';
  return <div className="duel-app">
    <div className="duel">
      <header className="d-top">
        <button className="wordmark-btn" onClick={onExit} aria-label="Leave the duel and choose a trial">The Last<b>Constant</b></button>
        <div className="d-trial"><span className={`chip ink-${trial.ink}`}>Trial {trial.numeral}</span>{trial.name}<span className="round">Round {result?.round ?? duel.round}</span></div>
        <div className="d-legend"><span>Closer wins <b>{WIN_DAMAGE}</b></span><span>Exact <b>{RESONANCE_DAMAGE}</b></span><button className="help-btn" onClick={() => setHelp(true)} aria-label="How to play">?</button></div>
      </header>

      <section className="d-row d-opp" aria-label="Magister Veyra">
        <Medallion name="Magister Veyra" title={`Examiner · ${trial.difficulty}`} hp={shown.opponent.hp} max={shown.opponent.maxHp} art={PORTRAITS.veyra} hit={result?.damageToOpponent ?? 0} />
        <div className="slots theirs" aria-label="Veyra's spell">{Array.from({ length: MAX_SPELL }, (_, i) => {
          const card = theirs[i];
          return <span key={i} className={`slot ${card && (revealed || i < inked) ? 'filled' : ''} ${card && revealed && merges(theirs, i) ? 'merge' : ''}`}>{card && revealed ? <span className="d-card small flip"><Face card={card} /></span> : card && i < inked ? <span className="d-card small back drop" aria-label="Face-down card" /> : null}</span>;
        })}</div>
        <p className="d-status">{stage === 'build' ? 'Veyra studies the rune…' : stage === 'inking' ? 'Veyra inks her spell…' : ''}</p>
      </section>

      <section className="d-stage" aria-label="The rune">
        <div className="d-howto">{unknown ? <>Solve the equation for <b>x</b>, then build a spell worth exactly <b>x</b>.</> : <>Build a spell worth exactly <b>{rune.target}</b>. Closer than Veyra wins the round.</>}</div>
        <Rune rune={rune} unknown={unknown} outcome={result} />
        <div className="d-side">{result ? <Verdict result={result} unknown={unknown} last={pending!.phase !== 'build'} onNext={proceed} /> : <p className="d-tip">{TIPS[trial.id]}</p>}</div>
        {ribbon && <div key={ribbon.id} className={`ribbon ${ribbon.tone}`} role="status"><b>{ribbon.title}</b><span>{ribbon.sub}</span></div>}
      </section>

      <section className="d-row d-me" aria-label="Your spell">
        <Medallion name="You" title="Apprentice" hp={shown.player.hp} max={shown.player.maxHp} art={PORTRAITS.apprentice} hit={result?.damageToPlayer ?? 0} />
        <div className="spell-build">
          <div className={`slots mine ${stage === 'inking' ? 'casting' : ''}`}>{Array.from({ length: MAX_SPELL }, (_, i) => {
            const card = spell[i];
            return card ? <button key={card.id} className={`slot filled ${merges(spell, i) ? 'merge' : ''}`} onClick={() => cut(i)} aria-label={`Remove ${label(card)}${i < spell.length - 1 ? ' and the cards after it' : ''}`}><span className="d-card small drop"><Face card={card} /></span></button> : <span key={`empty-${i}`} className="slot" />;
          })}</div>
          <p className={`readout ${nudge ? 'nudge' : distance === 0 && !unknown && evaluated ? 'exact' : ''}`} aria-live="polite">{readout}</p>
        </div>
        <div className="d-actions"><button className="riso-btn cast" onClick={cast} disabled={!ready}>Cast spell</button><button className="text-btn" onClick={() => { setNudge(''); setSpell([]); }} disabled={stage !== 'build' || !spell.length}>Clear</button></div>
      </section>

      <section className="d-hand" aria-label="Your hand">{hand.map((card, i) => {
        const ok = stage === 'build' && canAppend(spell, card);
        const offset = i - (hand.length - 1) / 2;
        return <button key={card.id} className={`d-card ${ok ? '' : 'blocked'}`} style={{ '--tilt': `${offset * 3}deg`, '--arc': `${offset * offset * 3}px` } as CSSProperties} onClick={() => add(card)} disabled={stage !== 'build'} aria-label={label(card)} title={card.kind === 'familiar' ? FAMILIAR_PERK[card.familiar] : undefined}><Face card={card} /></button>;
      })}</section>
    </div>

    {help && <Modal title="How to play" onClose={() => setHelp(false)}><Rules /></Modal>}
    {stage === 'over' && pending && <div className="d-modal-back">{victory && <Confetti />}<div className="d-modal" role="dialog" aria-modal="true" aria-labelledby="duel-end">
      <p className="kicker">{trial.name}</p>
      <h2 id="duel-end" className={victory ? 'victory' : ''}>{victory ? 'Victory' : 'Veyra wins this one'}</h2>
      <p>{victory ? 'Your spells rang true. The Academy grants you its seal.' : 'Every miss showed you an exact answer. The runes change each duel, so try again.'}</p>
      <div className="stats"><span><b>{pending.lastResult!.round}</b>rounds</span><span><b>{stats.resonances}</b>resonances</span></div>
      {stats.best && <p className="best">Best spell: <b>{stats.best}</b></p>}
      <div className="actions">
        {victory && onNextTrial && <button className="riso-btn" onClick={onNextTrial} autoFocus>Next trial →</button>}
        <button className="riso-btn secondary" onClick={onReplay} autoFocus={!victory || !onNextTrial}>Duel again</button>
        <button className="text-btn" onClick={onExit}>Choose a trial</button>
      </div>
    </div></div>}
  </div>;
}

function Title({ onStart, onFamiliars, onRules }: { onStart: () => void; onFamiliars: () => void; onRules: () => void }) {
  return <div className="duel-app"><main className="title-screen">
    <div className="title-copy">
      <p className="kicker">A maths card duel</p>
      <h1 className="riso-title">The Last <span>Constant</span></h1>
      <p className="lede">Duel with spells you write yourself. Merge number stones, call familiars, and hit the rune <b>exactly</b> to Resonate.</p>
      <div className="title-actions"><button className="riso-btn" onClick={onStart}>Start a duel</button><button className="riso-btn secondary" onClick={onFamiliars}>Familiars</button><button className="text-btn" onClick={onRules}>How to play</button></div>
      <p className="ladder" aria-label="Three trials: sums, products, unknowns"><span className="ink-yellow">Sums</span><i>→</i><span className="ink-pink">Products</span><i>→</i><span className="ink-teal">Unknowns</span></p>
    </div>
    <div className="title-fan" aria-hidden="true">{(['sorrel', 'twin-embers', 'quadra'] as const).map((id, i) => <div key={id} className={`fan-card f${i}`}><FamiliarCard id={id} /></div>)}</div>
  </main></div>;
}

function TrialSelect({ onPick, onBack, onRules }: { onPick: (index: number) => void; onBack: () => void; onRules: () => void }) {
  return <div className="duel-app"><main className="menu">
    <header className="screen-head"><button className="text-btn" onClick={onBack}>← Back</button><h1 className="screen-title">Choose your trial</h1><button className="text-btn" onClick={onRules}>How to play</button></header>
    <ol className="steps">
      <li><b>1</b><span>Read the rune: <em>Make 12</em>.</span></li>
      <li><b>2</b><span>Build a spell from your hand: <em>(3 + 3) × 2</em>.</span></li>
      <li><b>3</b><span>Closer than Veyra wins. Exact hits Resonate.</span></li>
    </ol>
    <div className="trials">{TRIALS.map((t, i) => <button key={t.id} className={`trial ink-${t.ink}`} onClick={() => onPick(i)}>
      <span className="numeral">{t.numeral}</span><b>{t.name}</b><span>{t.teaches}</span><code>{t.example}</code><small>Veyra · {t.difficulty}</small>
    </button>)}</div>
    <a className="classic-link" href="?classic">Play the original First Trial</a>
  </main></div>;
}

function Familiars({ onBack }: { onBack: () => void }) {
  const [zoom, setZoom] = useState<CharacterId | null>(null);
  return <div className="duel-app"><main className="menu">
    <header className="screen-head"><button className="text-btn" onClick={onBack}>← Back</button><h1 className="screen-title">Your familiars</h1><span /></header>
    <p className="screen-lede">Each familiar is an operation with a personality. Rarer faces share their family’s operation and add a perk. Click a card to read it.</p>
    <div className="familiar-grid">{FAMILIAR_IDS.map(id => <button key={id} className="zoomable" onClick={() => setZoom(id)} aria-label={`Inspect ${CHARACTERS[id].name}`}><FamiliarCard id={id} /></button>)}</div>
    <section className="fusion-teaser" aria-label="Coming next: fusion">
      <h2>Coming next: fusion</h2>
      <p>Fuse two copies of a familiar into a stronger evolution. Fusion follows real algebra:</p>
      <ul>
        <li><b>× 2</b> fused with <b>× 2</b> becomes <b>× 4</b><em>because 2 · 2x = 4x</em></li>
        <li><b>( )²</b> fused with <b>( )²</b> becomes <b>( )⁴</b><em>because (x²)² = x⁴</em></li>
        <li><b>+ 2</b> fused with <b>+ 2</b> becomes <b>+ 4</b><em>because (x + 2) + 2 = x + 4</em></li>
      </ul>
    </section>
    {zoom && <Modal title={CHARACTERS[zoom].name} onClose={() => setZoom(null)} wide><div className="zoom-card"><FamiliarCard id={zoom} /></div></Modal>}
  </main></div>;
}

type Screen = 'title' | 'trials' | 'familiars';
export default function DuelScreen() {
  const [screen, setScreen] = useState<Screen>('title');
  const [trial, setTrial] = useState<number | null>(null);
  const [rules, setRules] = useState(false);
  // ?seed=123 pins the shuffle, for recording a repeatable clip.
  const [seed, setSeed] = useState(() => Number(new URLSearchParams(location.search).get('seed')) || Date.now() % 1_000_000);
  if (trial !== null) return <Duel key={`${trial}-${seed}`} trial={TRIALS[trial]} seed={seed} onExit={() => { setTrial(null); setScreen('trials'); }} onReplay={() => setSeed(s => s + 1)}
    onNextTrial={trial < TRIALS.length - 1 ? () => { setTrial(trial + 1); setSeed(s => s + 1); } : undefined} />;
  return <>
    {screen === 'title' ? <Title onStart={() => setScreen('trials')} onFamiliars={() => setScreen('familiars')} onRules={() => setRules(true)} />
      : screen === 'trials' ? <TrialSelect onPick={setTrial} onBack={() => setScreen('title')} onRules={() => setRules(true)} />
      : <Familiars onBack={() => setScreen('title')} />}
    {rules && <div className="duel-app-overlay duel-app"><Modal title="How to play" onClose={() => setRules(false)}><Rules /></Modal></div>}
  </>;
}
