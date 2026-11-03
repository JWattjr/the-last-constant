import { useId, useState } from 'react';
import type { Geometry } from '../game/engine';
import { artworkUrl } from '../artwork';

export function Icon({ name, size = 20 }: { name: 'ink' | 'shield' | 'attack' | 'arrow' | 'book' | 'reset' | 'close' | 'heart' | 'volume'; size?: number }) {
  const paths = {
    ink: <><path d="M12 3C10 7 5 12 5 16a7 7 0 0 0 14 0c0-4-5-9-7-13Z" /><path d="M9 16c0 2 1 3 3 3" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" /><path d="M12 7v10M8 12h8" /></>,
    attack: <><path d="m6 18 12-12 2-3-4 1L4 16M4 13l7 7M7 17l-4 4" /></>,
    arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
    book: <><path d="M12 6C8 3 3 4 3 4v15s5-1 9 2c4-3 9-2 9-2V4s-5-1-9 2Zm0 0v15" /></>,
    reset: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    heart: <path d="M12 21 3 12C-2 4 8-1 12 6c4-7 14-2 9 6Z" />,
    volume: <><path d="m11 4-6 5H2v6h3l6 5Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function GeometryIcon({ geometry, size = 24 }: { geometry: Geometry; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{geometry === 'triangle' ? <path d="m16 4 13 23H3Z" /> : geometry === 'circle' ? <circle cx="16" cy="16" r="12" /> : <rect x="5" y="5" width="22" height="22" />}</svg>;
}

export function Sigil({ geometry = 'triangle', formula, active = false }: { geometry?: Geometry; formula?: string; active?: boolean }) {
  const points = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return { x: 150 + 119 * Math.cos(a), y: 150 + 119 * Math.sin(a), x2: 150 + 128 * Math.cos(a), y2: 150 + 128 * Math.sin(a) }; });
  return <div className={`sigil ${active ? 'sigil-active' : ''}`}><svg viewBox="0 0 300 300" fill="none" aria-hidden="true">
    <circle cx="150" cy="150" r="141" stroke="currentColor" strokeWidth=".6" /><circle cx="150" cy="150" r="130" stroke="currentColor" strokeWidth="1.2" /><circle cx="150" cy="150" r="112" stroke="currentColor" strokeWidth=".6" />
    {points.map((p, i) => <g key={i} stroke="currentColor"><path d={`M${p.x} ${p.y}L${p.x2} ${p.y2}`} /><circle cx={p.x2} cy={p.y2} r="2.5" fill="var(--paper)" /></g>)}
    <path d="m150 9 5 9-5 9-5-9Zm0 264 5 9-5 9-5-9ZM9 150l9-5 9 5-9 5Zm264 0 9-5 9 5-9 5Z" fill="currentColor" />
    {geometry === 'triangle' ? <><path d="m150 49 88 152H62Z" stroke="currentColor" strokeWidth="1.8" /><path d="m150 247-85-147h170Z" stroke="currentColor" strokeWidth=".55" /></> : geometry === 'circle' ? <><circle cx="150" cy="150" r="83" stroke="currentColor" strokeWidth="1.8" /><circle cx="150" cy="109" r="41" stroke="currentColor" strokeWidth=".5" /><circle cx="114" cy="170" r="41" stroke="currentColor" strokeWidth=".5" /><circle cx="186" cy="170" r="41" stroke="currentColor" strokeWidth=".5" /></> : <><rect x="77" y="77" width="146" height="146" stroke="currentColor" strokeWidth="1.8" /><path d="m150 47 103 103-103 103L47 150Z" stroke="currentColor" strokeWidth=".55" /></>}
    <circle cx="150" cy="150" r="43" fill="var(--paper)" stroke="currentColor" strokeWidth=".7" />
  </svg><span className="sigil-formula">{formula || '?'}</span></div>;
}

// Original vector stand-ins; named PNG assets replace these automatically when supplied.
export function Portrait({ who }: { who: 'examiner' | 'apprentice' | 'construct-a' | 'construct-b' }) {
  const id = useId().replace(/:/g, ''); const [failed, setFailed] = useState(false);
  const examiner = who === 'examiner'; const human = examiner || who === 'apprentice';
  const hair = examiner ? '#e9e5d5' : '#b66a3e'; const cloth = examiner ? '#1e4846' : '#374a50';
  return <div className={`portrait portrait-${who}`}>
    {!failed && artworkUrl(who) && <img src={artworkUrl(who)} alt="" onError={() => setFailed(true)} />}
    <svg viewBox="0 0 260 300" role="img" aria-label={`${human ? examiner ? 'Magister Veyra' : 'Apprentice' : 'Practice construct'} — original placeholder illustration`} style={{ display: failed || !artworkUrl(who) ? 'block' : 'none' }}>
      <defs><linearGradient id={`${id}robe`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={cloth} /><stop offset="1" stopColor="#102b2e" /></linearGradient></defs>
      {human ? <>
        <path d="M55 300 65 212Q75 186 108 181L151 180Q188 190 201 220l17 80Z" fill={`url(#${id}robe)`} stroke="#b9ad80" strokeWidth="1" />
        <path d="M111 167v28l19 24 24-26-6-33Z" fill="#d6b9a0" /><path d="m109 188 21 31-30 35-19-57Zm43 0-22 31 29 35 20-56Z" fill={examiner ? '#e7dfc8' : '#d1ba8b'} />
        <path d="M85 128q-9-67 41-75 58-7 53 70l-8 58-26 15-46-21Z" fill={hair} stroke="#aaa68d" strokeWidth="1" />
        <path d="M102 105q31-25 56 3l3 44-18 24-24-5-19-25Z" fill="#ead3b6" />
        <path d="m101 121 15-5m24 0 13 5" stroke="#544a41" strokeWidth="2" /><path d="M110 124h7m24 0h7" stroke="#294441" strokeWidth="3" /><path d="m129 126-3 16h6m-9 12 14 1" stroke="#ae8067" strokeWidth="1.2" fill="none" />
        <path d={examiner ? 'M92 123q-12-54 35-60 37-9 49 34l-26-14-18 30-12-19-22 39-6 66-16 20Z' : 'M91 127Q78 72 128 65q39-5 49 40l-26-10-7 17-15-20-9 25-13-10Z'} fill={hair} />
        {examiner && <><path d="M169 102q23 30 0 107l-15-17 6-51Z" fill={hair} /><path d="m89 90 41-58 48 61-47-14Z" fill="#193d3c" stroke="#c9ba88" strokeWidth="1.5" /><path d="m118 65 13-21 17 29" fill="none" stroke="#b9ad80" /><circle cx="132" cy="77" r="4" fill="#d5c385" /></>}
        <path d="m68 225 27 21-8 54m109-77-32 25 12 52M131 221v79" stroke="#b9ad80" strokeWidth="1.5" fill="none" />
        <path d="m130 234 9 15-9 15-9-15Z" fill="#bbaa76" /><path d="m48 256 53-21 34 26 55-10-14 49H64Z" fill="#cfbd91" stroke="#7d6b4a" strokeWidth="2" /><path d="m101 235 10 65m24-39-24 39m9-45 34-2m-36 14 33-4m-62-16 20 14" fill="none" stroke="#8f7e58" />
      </> : <>
        <path d="m101 221-22 65h32l19-54 20 54h32l-24-65Z" fill="#5c7974" stroke="#b9b48f" /><path d="m94 119-37 27-15 77 25 9 23-64m77-49 35 28 18 76-27 10-21-66" fill="#56756f" stroke="#b9b48f" strokeWidth="1.5" />
        <path d="m93 117 37-20 38 20 17 77-55 44-54-44Z" fill={who === 'construct-a' ? '#96794e' : '#c6c8af'} stroke="#dfd0a3" strokeWidth="1.5" /><path d="m130 130 28 36-28 41-28-41Z" fill="#1e4644" stroke="#e0d3a3" /><circle cx="130" cy="166" r="12" fill="#a3cbbb" /><path d="M110 48h40l14 25-10 30-24 13-24-13-10-30Z" fill={who === 'construct-a' ? '#b39361' : '#d6d5bd'} stroke="#e1d6ae" strokeWidth="1.5" /><path d="m106 78 48 0-12 9h-23Z" fill="#214a45" /><path d="m111 77 13 0m11 0h13" stroke="#b9e0ce" strokeWidth="3" /><path d="m130 48 0 21m-30 26 30-4 31 4m-68 28 37 19 38-19m-38 19v95" stroke="#49665e" fill="none" />
      </>}
    </svg>
  </div>;
}

export function CardArt({ character, formula }: { character: string; formula: 'linear' | 'quadratic' | 'additive' }) {
  const [failed, setFailed] = useState(false);
  const src = artworkUrl(`card-${character}`);
  if (src && !failed) return <img className="character-illustration" src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
  return <FormulaArt formula={formula} />;
}

export function FormulaArt({ formula }: { formula: 'linear' | 'quadratic' | 'additive' }) {
  const [failed, setFailed] = useState(false);
  const src = artworkUrl(`formula-${formula}`);
  if (src && !failed) return <img className="formula-illustration" src={src} alt="" onError={() => setFailed(true)} />;
  return <svg viewBox="0 0 200 100" fill="none" aria-hidden="true"><circle cx="100" cy="54" r="40" stroke="currentColor" strokeWidth=".6" /><circle cx="100" cy="54" r="32" stroke="currentColor" strokeWidth=".5" />{formula === 'linear' ? <><path d="m58 75 27-48 27 48Zm32 0 27-48 27 48Z" fill="currentColor" fillOpacity=".15" stroke="currentColor" /><path d="M28 54h26m92 0h26" stroke="currentColor" /></> : formula === 'quadratic' ? <><path d="m100 12 9 29 30 10-30 9-9 30-10-30-30-9 30-10Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" /><path d="m42 18 4 9 10 4-10 4-4 9-4-9-10-4 10-4Zm115 49 4 9 9 3-9 4-4 9-4-9-9-4 9-3Z" fill="currentColor" /></> : <><circle cx="85" cy="54" r="24" stroke="currentColor" /><circle cx="115" cy="54" r="24" stroke="currentColor" /><path d="M100 24v60M70 54h60" stroke="currentColor" strokeWidth=".5" /><path d="m100 36 10 18-10 18-10-18Z" fill="currentColor" fillOpacity=".2" /></>}</svg>;
}
