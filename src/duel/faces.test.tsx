import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CardBack, GlyphFace, StoneFace } from './faces';

describe('accessible printed card faces', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('labels stone %i and supplies exactly that many countable pips', value => {
    const html = renderToStaticMarkup(<StoneFace value={value} />);
    expect(html).toContain(`aria-label="Number stone ${value}"`);
    expect(html.match(/data-stone-pip=/g)).toHaveLength(value);
  });
  it.each([['+', 'plus', '+'], ['-', 'minus', '−'], ['*', 'times', '×']] as const)('labels %s and prints its mathematical symbol', (op, word, symbol) => {
    const html = renderToStaticMarkup(<GlyphFace op={op} />);
    expect(html).toContain(`aria-label="Glyph: ${word}"`);
    expect(html).toContain(`>${symbol}</text>`);
  });
  it('labels the card back', () => expect(renderToStaticMarkup(<CardBack />)).toContain('aria-label="Card back"'));
  it('rejects unsupported number stones', () => expect(() => renderToStaticMarkup(<StoneFace value={10} />)).toThrow(RangeError));
  it('gives repeated faces separate pattern ids', () => {
    const html = renderToStaticMarkup(<><StoneFace value={2} /><StoneFace value={2} /><CardBack /><CardBack /></>);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
