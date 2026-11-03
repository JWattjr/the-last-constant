import { useEffect, useReducer, useRef, useState } from 'react';
import { battleReducer, createBattle, enemyStatus, evaluate, FORMULAS, getSeal, getStance, incomingDamage, isGuardActive, previewCast, solveFor, substitute, tacticalHint } from './game/engine';
import { CHARACTERS } from './game/characters';
import type { Character } from './game/characters';
import type { Card, Geometry, Variable } from './game/engine';
import { CardArt, GeometryIcon, Icon, Portrait, Sigil } from './components/Art';
import { GuidedOpening, SafeRoute } from './components/GuidedOpening';
import { getGuidance } from './game/guidance';
import { eventMessage } from './game/feedback';
import { artworkUrl } from './artwork';

const arenaArt = artworkUrl('academy-battlefield');

const geometries: { id: Geometry; name: string; detail: string }[] = [
  { id: 'triangle', name: 'Triangle', detail: 'Focus · energy + 2 damage; +4 against exposed Veyra' },
  { id: 'circle', name: 'Circle', detail: 'Distribute · ½ energy, rounded up; breaks guard and wards' },
  { id: 'square', name: 'Square', detail: 'Contain · energy + 3 shield' },
];
const lessons = [
  { title: 'The world is written in numbers.', text: 'Once, the great equations held our world together. Now they are unraveling. You are an apprentice at the Academy of the Constant. Today, your first trial begins.', quote: 'Mathematics is the language of magic.' },
  { title: 'Give your formula a form.', text: 'Choose a card, then set x to 1, 2, or 3. A larger variable creates more energy, but costs more Ink. Triangle focuses that energy on one enemy. Circle distributes it. Square turns it into protection.', quote: 'Geometry is its architecture.' },
  { title: 'Read the enemy. Find the opening.', text: 'Copper guards Veyra: break its link with Circle or destroy it. Deal 6 health damage to Ivory during its charge to cancel the strike. Veyra cycles through Warding, Channeling, and Exposed: defend against her heavy attack, then hit the opening. Her seal number rewards solving for x: match it exactly for +4. You have 6 Ink per turn. Defeat Veyra to pass.', quote: 'Equations are its instructions.' },
];

// Pointer tilt and foil position are written straight to CSS variables; no re-render per mouse move.
function tilt(event: React.PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = event.currentTarget.getBoundingClientRect(); const px = (event.clientX - box.left) / box.width; const py = (event.clientY - box.top) / box.height;
  const style = event.currentTarget.style;
  style.setProperty('--rx', `${(0.5 - py) * 16}deg`); style.setProperty('--ry', `${(px - 0.5) * 18}deg`); style.setProperty('--mx', `${px * 100}%`); style.setProperty('--my', `${py * 100}%`);
}
function untilt(event: React.PointerEvent<HTMLElement>) { for (const v of ['--rx', '--ry', '--mx', '--my']) event.currentTarget.style.removeProperty(v); }

function CardFace({ character }: { character: Character }) {
  const formula = FORMULAS[character.formula];
  return <>
    <div className="card-art"><CardArt character={character.id} formula={character.formula} /></div>
    <span className="card-expression">{formula.expression}</span><span className={`rarity-gem ${character.rarity}`} title={character.rarity} />
    <span className="card-title">{character.name}</span>
    <span className="card-description">{character.flavor}</span>
    <span className="card-bottom">{formula.school} · {character.rarity}</span>
  </>;
}

function FormulaCard({ card, selected, disabled, onSelect }: { card: Card; selected: boolean; disabled: boolean; onSelect: () => void }) {
  const character = CHARACTERS[card.character];
  return <button className={`formula-card tcg-card ${card.formula} ${character.rarity} ${selected ? 'selected' : ''}`} onClick={onSelect} onPointerMove={tilt} onPointerLeave={untilt} disabled={disabled} aria-pressed={selected} aria-label={`Select ${character.name}, ${character.rarity} ${FORMULAS[card.formula].name}, ${FORMULAS[card.formula].expression}`}>
    <CardFace character={character} />
    {selected && <span className="selected-tab">INSCRIBED</span>}
  </button>;
}

function Collection() {
  return <div className="collection-grid">{Object.values(CHARACTERS).map(character => <figure key={character.id} className="collection-entry">
    <div className={`formula-card tcg-card ${character.formula} ${character.rarity}`} onPointerMove={tilt} onPointerLeave={untilt}><CardFace character={character} /></div>
    <figcaption><b>{FORMULAS[character.formula].expression}</b>{([1, 2, 3] as const).map(x => ` · x=${x} → ${evaluate(character.formula, x)}`).join('')}<span>2 copies in your deck</span></figcaption>
  </figure>)}</div>;
}

export default function App() {
  const [session, setSession] = useState(0);
  const [nextGuided, setNextGuided] = useState(true);
  return <Trial key={session} skipIntro={session > 0} startGuided={nextGuided} onReplay={withHints => { setNextGuided(withHints); setSession(s => s + 1); }} />;
}

function Trial({ skipIntro, startGuided, onReplay }: { skipIntro: boolean; startGuided: boolean; onReplay: (withHints: boolean) => void }) {
  const [battle, dispatch] = useReducer(battleReducer, undefined, () => createBattle());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geometry, setGeometry] = useState<Geometry>('triangle');
  const [x, setX] = useState<Variable>(2);
  const [targetId, setTargetId] = useState('examiner');
  const [lesson, setLesson] = useState<number | null>(skipIntro ? null : 0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [guided, setGuided] = useState(startGuided);
  const [eventVisible, setEventVisible] = useState(false);
  const [casting, setCasting] = useState(false);
  const [castText, setCastText] = useState('');
  const [castFormula, setCastFormula] = useState('');
  const [castTargets, setCastTargets] = useState<string[]>([]);
  const castTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const helpButton = useRef<HTMLButtonElement>(null);
  const guideToggle = useRef<HTMLButtonElement>(null);
  const selected = battle.hand.find(c => c.id === selectedId);
  const target = battle.enemies.find(e => e.id === targetId && e.hp > 0) || battle.enemies.find(e => e.hp > 0);
  const spell = selected ? previewCast(battle, selected.formula, geometry, x, target?.id ?? '') : null;
  const available = battle.phase === 'player' && !casting && lesson === null && !rulesOpen && !collectionOpen;
  const canCast = available && !!spell && spell.cost <= battle.player.ink;
  const incoming = incomingDamage(battle);
  const hint = tacticalHint(battle);
  const guide = guided ? getGuidance(battle, { cardId: selectedId, geometry, x, targetId: target?.id ?? targetId }) : null;
  const event = eventVisible ? battle.lastEvent : null;
  const cue = event ? eventMessage(event) : null;
  const stance = getStance(battle.turn);
  const seal = getSeal(battle.turn);
  const impact = spell?.impacts[0];
  const spellEffect = !spell ? 'Read the enemy intentions before choosing your spell.'
    : geometry === 'square' ? `After casting: ${Math.max(0, incoming - battle.player.shield - spell.amount)} health at risk this enemy turn.`
    : geometry === 'circle' ? `Shatters enemy wards${spell.breaksGuard ? ' and breaks the guard link this turn' : ''}${spell.resonanceBonus ? ' · Resonance +4 on Veyra' : ''}. ${spell.impacts.map(i => `${battle.enemies.find(e => e.id === i.enemyId)!.name.split(' ')[0]}: −${i.healthDamage} HP`).join(' · ')}${spell.impacts.some(i => i.interrupts) ? ' · Interrupts Ivory!' : ''}`
    : `${spell.guardReduction ? 'Guard −4. ' : ''}${spell.exposedBonus ? 'Exposed +4. ' : ''}${spell.resonanceBonus ? 'Resonance +4. ' : ''}${impact?.blocked ? `Ward absorbs ${impact.blocked}. ` : ''}${impact?.healthDamage ?? 0} health damage.${impact?.interrupts ? ' Interrupts Ivory!' : ''}`;
  const terminal = battle.phase === 'victory' || battle.phase === 'defeat';
  const modalOpen = lesson !== null || rulesOpen || collectionOpen || terminal;

  useEffect(() => {
    if (battle.phase !== 'enemy') return;
    const timer = setTimeout(() => dispatch({ type: 'resolveEnemies' }), 1000);
    return () => clearTimeout(timer);
  }, [battle.phase]);
  useEffect(() => () => { if (castTimer.current) clearTimeout(castTimer.current); }, []);
  useEffect(() => {
    if (!battle.lastEvent) return;
    setEventVisible(true);
    const timer = setTimeout(() => setEventVisible(false), 1900);
    return () => clearTimeout(timer);
  }, [battle.lastEvent?.id]);
  useEffect(() => {
    if (modalOpen) modalRef.current?.focus();
  }, [modalOpen, lesson]);

  function cast() {
    if (!canCast || !selected || !spell || !target) return;
    setCastText(geometry === 'square' ? `+${spell.amount} SHIELD` : geometry === 'triangle' ? `${impact?.healthDamage ?? 0} HEALTH DAMAGE${spell.resonanceBonus ? ' · RESONANCE' : ''}${impact?.interrupts ? ' · INTERRUPTED' : ''}` : `${spell.amount} DAMAGE · WARDS SHATTERED`);
    setCastFormula(FORMULAS[selected.formula].expression);
    setCastTargets(geometry === 'square' ? [] : geometry === 'triangle' ? [target.id] : battle.enemies.filter(e => e.hp > 0).map(e => e.id));
    setCasting(true);
    dispatch({ type: 'cast', cardId: selected.id, geometry, x, targetId: target.id });
    setSelectedId(null);
    castTimer.current = setTimeout(() => setCasting(false), 850);
  }

  function closeHelp() { setRulesOpen(false); setCollectionOpen(false); setTimeout(() => helpButton.current?.focus(), 0); }
  function hideGuide() { setGuided(false); guideToggle.current?.focus(); }
  function locateGuideControl() {
    if (!guide) return;
    const selector = guide.focus === 'target' ? `[data-enemy-id="${guide.targetId}"]` : {
      hand: '.formula-card', geometry: '.geometry-options button', variable: '.variable-options button:nth-child(2)',
      cast: '.cast-button', 'end-turn': '.end-turn', tactics: '.tactical-brief',
    }[guide.focus];
    const control = document.querySelector<HTMLElement>(selector);
    control?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    control?.focus({ preventScroll: true });
  }
  function trapFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && (rulesOpen || collectionOpen)) closeHelp();
    if (event.key !== 'Tab') return;
    const controls = modalRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex="0"]');
    if (!controls?.length) return;
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === modalRef.current)) { event.preventDefault(); first.focus(); }
  }

  return <div className="game-shell">
    <div className="game-content" inert={modalOpen ? true : undefined}>
      <header className="masthead">
        <a className="wordmark" href="#" onClick={e => e.preventDefault()} aria-label="The Last Constant"><GeometryIcon geometry="triangle" size={36} /><span>The Last<br /><b>Constant</b></span></a>
        <div className="chapter-title"><span className="chapter-line" /><h1>The First Trial</h1><span className="chapter-line" /></div>
        <div className="header-actions"><button className="guide-toggle" ref={guideToggle} aria-label="Toggle guided opening" aria-pressed={guided} onClick={() => setGuided(g => !g)}>Hints {guided ? 'on' : 'off'}</button><button className="guide-toggle" onClick={() => setCollectionOpen(true)}>Cards</button><button className="icon-button" ref={helpButton} aria-label="Open spellbook and rules" onClick={() => setRulesOpen(true)}><Icon name="book" /></button></div>
      </header>

      <main data-guide-focus={guide?.focus}>
        <section className={`arena ${battle.phase === 'enemy' ? 'enemy-turn' : ''} ${arenaArt ? 'with-artwork' : ''}`} style={arenaArt ? { backgroundImage: `linear-gradient(0deg,rgba(251,249,243,.7),rgba(251,249,243,.2)),url("${arenaArt}")` } : undefined} aria-label="Enemy battlefield">
          <svg className="academy-architecture" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden="true"><path d="M90 420V160Q90 50 205 20q115 30 115 140v260m110 0V150Q430 20 570-25q140 45 140 175v270m110 0V150Q820 20 960-25q140 45 140 175v270m110 0V160q0-110 115-140 115 30 115 140v260" stroke="currentColor" /><path d="M30 410h1380M90 325h230m110 0h280m110 0h280m110 0h230M205 20v400M570-25v445M960-25v445M1325 20v400" stroke="currentColor" /><circle cx="720" cy="230" r="175" stroke="currentColor" /><circle cx="720" cy="230" r="162" stroke="currentColor" /><path d="m720 35 169 292H551Z" stroke="currentColor" /></svg>
          <div className="arena-caption"><span className="status-dot" /> ACADEMY OF THE CONSTANT <span>Trial chamber · I</span></div>
          {(isGuardActive(battle) || event?.guardBroken !== undefined && event.guardBroken !== 'none') && <div key={`guard-${event?.id ?? 'idle'}`} className={`guard-link ${event && event.guardBroken !== 'none' ? 'snapped' : ''}`} aria-hidden="true"><svg viewBox="0 0 200 30" fill="none"><path className="link-left" d="M0 15h90l10-8" /><path className="link-right" d="m100 23 10-8h90" /><path d="m100 7 8 8-8 8-8-8Z" /></svg></div>}
          {cue && <div key={event!.id} className={`combat-cue ${cue.tone}`} role="status"><strong>{cue.title}</strong><span>{cue.detail}</span></div>}
          <div className="enemy-lineup">
            {battle.enemies.map(enemy => <button key={enemy.id} data-enemy-id={enemy.id} className={`enemy ${guide?.targetId === enemy.id ? 'guide-target' : ''} ${enemy.id === 'examiner' && stance === 'exposed' ? 'exposure-open' : ''} ${enemy.id === 'examiner' ? 'examiner' : 'construct'} ${target?.id === enemy.id && geometry === 'triangle' ? 'targeted' : ''} ${enemy.hp === 0 ? 'vanquished' : ''} ${casting && castTargets.includes(enemy.id) ? 'struck' : ''}`} onClick={() => setTargetId(enemy.id)} disabled={enemy.hp === 0 || !available || geometry !== 'triangle'} aria-pressed={target?.id === enemy.id && geometry === 'triangle'} aria-label={`Target ${enemy.name}, ${enemy.hp} of ${enemy.maxHp} health, ${enemy.shield} shield. Intends ${enemy.intent.kind} ${enemy.intent.value}. ${enemyStatus(battle, enemy)}`}>
              <div className={`enemy-intent ${enemy.intent.kind}`}><Icon name={enemy.intent.kind === 'attack' ? 'attack' : enemy.intent.kind === 'shield' ? 'shield' : 'close'} size={15} /><strong>{enemy.hp === 0 ? '—' : enemy.intent.value}</strong><span>{enemy.hp === 0 ? 'DISPELLED' : enemy.intent.name}</span></div>
              {enemy.id === 'construct-b' && (stance === 'channeling' && enemy.hp > 0 && enemy.intent.kind === 'attack' || event?.chargeCancelled !== undefined && event.chargeCancelled !== 'none') && <div key={`charge-${event?.id ?? 'idle'}`} className={`charge-orbit ${event && event.chargeCancelled !== 'none' ? 'collapsed' : ''}`} aria-hidden="true"><svg viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="53" /><circle cx="60" cy="60" r="44" /><path d="m60 9 44 77H16Z" /><path d="M60 0v15m0 90v15M0 60h15m90 0h15" /></svg></div>}
              {event?.impacts.filter(i => i.enemyId === enemy.id).map(i => <span key={event.id} className={`damage-pop ${i.shattered ? 'shattering' : ''}`} aria-hidden="true">{i.healthDamage ? `−${i.healthDamage}` : 'BLOCKED'}{i.shattered > 0 && <small>WARD SHATTERED</small>}{i.defeated && <small>DISPELLED</small>}</span>)}
              <Portrait who={enemy.id as 'examiner' | 'construct-a' | 'construct-b'} />
              <div className="enemy-plaque">{guide?.targetId === enemy.id && <span className="enemy-coach-badge">HINT TARGET</span>}<span className="enemy-role">{enemy.title}</span><h2>{enemy.name}</h2><div className="health-track"><span style={{ transform: `scaleX(${enemy.hp / enemy.maxHp})` }} /></div><div className="health-numbers"><span>{enemy.hp} / {enemy.maxHp} HP</span>{enemy.shield > 0 && <span><Icon name="shield" size={12} /> {enemy.shield}</span>}<span>{enemy.hp === 0 ? 'Dispelled' : target?.id === enemy.id && geometry === 'triangle' ? 'Selected target' : geometry === 'circle' ? 'Area target' : ' '}</span></div><span className="enemy-mechanic">{enemyStatus(battle, enemy)}</span>{enemy.id === 'examiner' && enemy.hp > 0 && <span className="seal-badge" title="Match this number exactly with your spell's energy for +4 damage to Veyra">SEAL <b>{seal}</b></span>}</div>
            </button>)}
          </div>
          <div className="arena-floor" /><div className="turn-banner">{battle.phase === 'enemy' ? 'The academy responds…' : `Turn ${battle.turn}`}<span>{battle.phase === 'enemy' ? 'ENEMY TURN' : 'YOUR TURN'}</span></div>
        </section>

        <section className={`tactical-brief ${stance} ${guided ? 'with-guide' : ''}`} aria-label="Battle tactics">{guide ? <GuidedOpening hint={guide} onLocate={locateGuideControl} onDismiss={hideGuide} busy={!available} /> : <div><h2>{hint.title}</h2><p>{hint.text}</p></div>}<span className="stance-cycle" aria-label={`Veyra cycle: Warding, Channeling, Exposed. Current: ${stance}`}>{(['warding', 'channeling', 'exposed'] as const).map(s => <span key={s} className={s === stance ? 'current' : ''} aria-current={s === stance ? 'step' : undefined}>{s}</span>)}</span></section>
        <section className="workbench" aria-label="Spell construction">
          <aside className="apprentice-panel">
            {event?.kind === 'enemy-turn' && event.playerDamage > 0 && <span key={event.id} className="player-damage-pop" aria-hidden="true">−{event.playerDamage} HP</span>}
            <div className="apprentice-portrait"><Portrait who="apprentice" /></div>
            <div className="apprentice-stats"><h2>The Apprentice</h2><span className="apprentice-name">Keeper of an unwritten proof</span><div className="player-health"><Icon name="heart" size={16} /><b>{battle.player.hp}</b><span>/ {battle.player.maxHp}</span></div><div className="health-track player-track"><span style={{ transform: `scaleX(${battle.player.hp / battle.player.maxHp})` }} /></div><div className="shield-stat"><Icon name="shield" size={16} /><b>{battle.player.shield}</b> Shield <span>Expires next turn</span></div></div>
            <div className="ink-meter"><Icon name="ink" size={24} /><strong>{battle.player.ink}<small> / 6</small></strong><span>INK REMAINING</span><div className="ink-pips">{Array.from({ length: 6 }, (_, i) => <i key={i} className={i < battle.player.ink ? 'filled' : ''} />)}</div></div>
          </aside>

          <div className="spell-canvas"><div className="sigil-heading"><span />THE INSCRIPTION<span /></div><Sigil geometry={geometry} formula={casting ? castFormula : selected ? FORMULAS[selected.formula].expression : undefined} active={casting} /><p>{casting ? castText : cue && event?.kind === 'cast' ? cue.title : selected ? 'Formula inscribed. Give it a shape.' : 'Select a formula from your hand'}</p></div>

          <div className="spell-controls">
            <fieldset className="geometry-field"><legend>Choose a geometry</legend><div className="geometry-options">{geometries.map(g => <button key={g.id} title={g.detail} onClick={() => setGeometry(g.id)} aria-pressed={geometry === g.id} disabled={!available} className={geometry === g.id ? 'active' : ''}><GeometryIcon geometry={g.id} /><span>{g.name}</span></button>)}</div></fieldset>
            <div className="variable-row"><span>Set the variable <i>x</i></span><div className="variable-options" role="group" aria-label="Variable x">{([1, 2, 3] as const).map(v => <button key={v} onClick={() => setX(v)} aria-pressed={x === v} disabled={!available} className={x === v ? 'active' : ''}>{v}</button>)}</div></div>
            <div className="spell-preview" aria-live="polite"><div><span>{geometry === 'square' ? 'YOUR PROTECTION' : geometry === 'circle' ? 'EACH LIVING ENEMY' : `TARGET · ${target?.name ?? 'None'}`}</span><strong>{spell ? <>{spell.amount} <small>{geometry === 'square' ? 'shield' : 'damage'}</small></> : <small>Awaiting a formula</small>}</strong></div><div className="cost"><Icon name="ink" size={15} /><b>{spell ? spell.cost : '—'}</b><span>INK</span></div></div>
            <div className="calculation">{spell ? <>{substitute(selected!.formula, x)} = {spell.energy} energy · {geometry === 'triangle' ? '+ 2 focus' : geometry === 'square' ? '+ 3 containment' : '÷ 2, rounded up'}{geometry === 'circle' ? ' · +1 Ink' : ''}</> : geometries.find(g => g.id === geometry)!.detail}</div>
            {selected && geometry !== 'square' && <div className={`seal-equation ${spell?.resonant ? 'solved' : ''}`}><span>VEYRA’S SEAL</span><b>{FORMULAS[selected.formula].expression} = {seal}</b><em>{spell?.resonant ? `✓ x = ${x} resonates · +4 to Veyra` : solveFor(selected.formula, seal) === undefined ? `No x from 1–3 makes ${seal}. Try another card.` : `Solve for x. Right now x = ${x} gives ${spell?.energy}.`}</em></div>}
            <p className="spell-effects" aria-live="polite">{spellEffect}</p>
            <button className="cast-button" onClick={cast} disabled={!canCast}><GeometryIcon geometry={geometry} size={20} /><span>{casting ? 'Spell released' : !selected ? 'Inscribe a formula' : spell && spell.cost > battle.player.ink ? `Need ${spell.cost - battle.player.ink} more Ink` : 'Cast spell'}</span><Icon name="arrow" size={20} /></button>
          </div>
        </section>

        <section className="hand-section" aria-label="Your formula cards">
          <div className="hand-heading"><div><h2>Your hand <span>{battle.hand.length} {battle.hand.length === 1 ? 'card' : 'cards'}</span></h2><p>Choose a formula. Shape what comes next.</p></div><div className="deck-actions"><span className="pile-count"><Icon name="book" size={16} />{battle.drawPile.length} deck <span>·</span> {battle.discard.length} discarded</span><button className="draw-button" onClick={() => dispatch({ type: 'draw' })} disabled={!available || battle.extraDrawUsed || battle.player.ink < 1 || battle.hand.length >= 5 || !battle.drawPile.length && !battle.discard.length}>{battle.extraDrawUsed ? 'Draw used this turn' : 'Draw formula'} <span><Icon name="ink" size={12} /> 1</span></button></div></div>
          <div className="hand-and-turn"><div className="hand">{battle.hand.map(card => <FormulaCard key={card.id} card={card} selected={selectedId === card.id} disabled={!available} onSelect={() => setSelectedId(selectedId === card.id ? null : card.id)} />)}{battle.hand.length === 0 && <div className="empty-hand"><Icon name="book" size={30} /><p>Your page is complete.</p><span>Draw a formula or end your turn to refill your hand.</span></div>}</div><div className="turn-controls"><div className="incoming-damage"><Icon name="attack" size={18} /><span>Incoming damage</span><b>{incoming}</b></div><p>{battle.player.shield >= incoming ? 'Your shield covers the next attack.' : `${Math.max(0, incoming - battle.player.shield)} health at risk after shields.`}</p><button className="end-turn" disabled={!available} onClick={() => { setSelectedId(null); dispatch({ type: 'endTurn' }); }}>{battle.phase === 'enemy' ? 'Enemies acting…' : 'End turn'}<Icon name="arrow" size={18} /></button><span className="turn-note">Refill Ink · draw up to 3 cards</span></div></div>
        </section>

        <footer className="battle-footer"><span className="latest-event" role="status">{battle.log[0]}</span><button onClick={() => setLogOpen(!logOpen)} aria-expanded={logOpen}>{logOpen ? 'Close' : 'Open'} battle log <Icon name="book" size={15} /></button></footer>
        {logOpen && <section className="battle-log" aria-label="Battle log"><h2>The record of your trial</h2><ol>{battle.log.map((entry, i) => <li key={`${entry}-${i}`}>{entry}</li>)}</ol></section>}
      </main>
      <div className="page-footer"><span>THE LAST CONSTANT</span><p>Every spell is a proof. Every proof changes the world.</p><span>THE FIRST TRIAL</span></div>
    </div>

    {modalOpen && <div className="modal-backdrop"><div className={`modal ${terminal ? 'result-modal' : ''} ${collectionOpen ? 'collection-modal' : ''}`} ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} onKeyDown={trapFocus}>
      {terminal ? <><div className="result-sigil"><Sigil geometry={battle.phase === 'victory' ? 'triangle' : 'square'} formula={battle.phase === 'victory' ? '∴' : '0'} /></div><h2 id="modal-title">{battle.phase === 'victory' ? 'The proof is yours.' : 'Even a proof can falter.'}</h2><p>{battle.phase === 'victory' ? '“An elegant solution, apprentice.” Veyra lowers her quill. You have earned the first seal of the Academy.' : 'The trial chamber falls quiet. Study the enemy intentions, contain their attacks, and begin again.'}</p><div className="result-stats"><span><b>{battle.turn}</b> turns</span><span><b>{battle.casts}</b> spells cast</span><span><b>{battle.damageDealt}</b> damage dealt</span></div><button className="primary-button" onClick={() => onReplay(guided)}><Icon name="reset" size={18} />Try the trial again</button>{battle.phase === 'defeat' && <><button className="skip-intro" onClick={() => onReplay(true)}>Try with hints</button><div className="defeat-help"><SafeRoute /></div></>}</> : collectionOpen ? <><button className="modal-close icon-button" onClick={closeHelp} aria-label="Close collection"><Icon name="close" /></button><h2 id="modal-title">Your collection</h2><p>Every card is a character whose formula is its spell. Rarer faces share their family’s formula; future sets add new formulas and twists.</p><Collection /><button className="primary-button" onClick={closeHelp}>Return to the trial<Icon name="arrow" size={18} /></button></> : rulesOpen ? <><button className="modal-close icon-button" onClick={closeHelp} aria-label="Close spellbook"><Icon name="close" /></button><h2 id="modal-title">The apprentice’s spellbook</h2><p>Choose a formula card, a geometry, and a value for x. The inscription previews every result before you spend Ink.</p><div className="rules-list">{geometries.map(g => <div key={g.id}><GeometryIcon geometry={g.id} size={30} /><span><b>{g.name}</b>{g.detail}{g.id === 'circle' && ' · costs 1 extra Ink'}</span></div>)}</div><p>You begin each turn with <b>6 Ink</b> and draw up to <b>3 cards</b>. Casting costs x Ink; Circle costs x + 1. Once per turn, spend 1 Ink to draw an extra card. Played cards reshuffle when the deck empties.</p><p><b>Copper (12 HP)</b> blocks 4 damage from each Triangle attack on Veyra. Circle breaks the link until next turn and shatters enemy wards before damage. Defeat Copper to remove the guard permanently.</p><p><b>Ivory (18 HP)</b> charges a 10-damage strike on Channeling turns. Deal 6 total health damage to it during that turn to interrupt. Earlier damage and ward absorption do not count.</p><p><b>Veyra (42 HP)</b> cycles: Warding (gains 5 shield), Channeling (attacks for 12), Exposed (attacks for 4; Triangle deals +4 to her). Copper and uncharged Ivory attack for 3. Shields absorb attacks and your leftover shield expires next turn. Defeat Veyra to win.</p><p><b>Veyra’s seal</b> shows a number each turn. If your spell’s energy equals it <i>exactly</i>, the spell resonates: +4 damage to Veyra. Write the equation (2x = 6) and solve for x.</p><button className="primary-button" onClick={closeHelp}>Return to the trial<Icon name="arrow" size={18} /></button></> : <><div className="intro-emblem"><Sigil geometry={lesson === 1 ? 'circle' : lesson === 2 ? 'square' : 'triangle'} formula={lesson === 0 ? 'x' : lesson === 1 ? 'x²' : '∴'} /></div><h2 id="modal-title">{lessons[lesson!].title}</h2><p>{lessons[lesson!].text}</p><blockquote>{lessons[lesson!].quote}</blockquote><div className="lesson-progress" aria-label={`Introduction step ${lesson! + 1} of 3`}>{lessons.map((_, i) => <i key={i} className={i === lesson ? 'active' : ''} />)}</div><button className="primary-button" onClick={() => { if (lesson === 2) setLesson(null); else setLesson(l => l! + 1); }}>{lesson === 2 ? 'Enter guided trial' : 'Continue'}<Icon name="arrow" size={18} /></button><button className="skip-intro" onClick={() => { setGuided(lesson !== 2); setLesson(null); }}>{lesson === 2 ? 'Play without hints' : 'Start playing with hints'}</button></>}
    </div></div>}
  </div>;
}








