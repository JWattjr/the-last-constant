import type { GuideHint } from '../game/guidance';
import { Icon } from './Art';

export function GuidedOpening({ hint, onLocate, onDismiss, busy }: { hint: GuideHint; onLocate: () => void; onDismiss: () => void; busy: boolean }) {
  return <div className="guided-opening">
    <h2>{hint.title}</h2><p>{hint.text}</p>
    <div className="guide-actions">
      {hint.focus !== 'tactics' && <button disabled={busy} onClick={onLocate}>Find this control <Icon name="arrow" size={14} /></button>}
      <button onClick={onDismiss}>{hint.complete ? 'Finish guidance' : 'Hide hints'}</button>
      <span>You control every move.</span>
    </div>
    <SafeRoute />
  </div>;
}

export function SafeRoute() {
  return <details className="safe-route"><summary>Need a reliable route? Show one way to win</summary>
      <p>From a fresh trial, use <b>Triangle and x = 2</b> for every spell. Any starter formula works. Save your Ink for casting; extra draws cost 1 Ink.</p>
      <ol>
        <li><b>Turn 1:</b> Copper twice, then Ivory once. End turn.</li>
        <li><b>Turn 2:</b> Ivory twice, then Veyra once. End turn.</li>
        <li><b>Turn 3:</b> Veyra three times while she is exposed. End turn.</li>
        <li><b>Turn 4:</b> Veyra twice. Your last spell wins the trial.</li>
      </ol><p>Copper’s guard is gone, Ivory never lands its charge, and the exposed turn rewards your focus. This is one route; Circle and Square support other approaches.</p>
    </details>;
}
