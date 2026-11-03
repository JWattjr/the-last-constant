import { useId } from 'react';
import './faces.css';

const PAPER = '#F6F1E7';
const BLUE = '#3D5588';
const PINK = '#FF48B0';
const TEAL = '#00838A';
const YELLOW = '#FFE800';
const STONES = [
  'M40 103Q24 66 55 48Q86 27 121 47Q163 46 165 92Q181 133 146 156Q109 179 62 157Q29 145 40 103Z',
  'M34 95Q32 54 75 45Q105 30 136 56Q175 66 162 105Q172 146 132 162Q91 178 55 151Q26 136 34 95Z',
  'M43 73Q55 37 96 44Q130 31 155 66Q179 95 158 130Q150 169 107 164Q65 176 40 139Q22 106 43 73Z',
  'M38 79Q36 43 78 43L125 45Q161 49 162 87L166 127Q163 161 122 163L73 164Q34 161 34 125Z',
  'M34 106Q25 77 51 58Q73 32 109 43Q145 37 162 73Q180 106 154 137Q136 174 95 163Q53 169 39 139Z',
  'M44 62Q75 34 107 45Q150 37 161 80Q178 116 152 148Q129 177 93 163Q51 172 39 131Q24 91 44 62Z',
  'M38 83Q40 48 76 46Q109 27 143 54Q173 72 160 111Q169 147 131 161Q94 181 60 155Q25 135 38 83Z',
  'M45 65Q61 36 100 45Q142 32 158 70Q175 96 163 130Q155 168 111 163Q71 176 45 147Q25 120 34 92Z',
  'M34 87Q28 51 67 45Q107 31 139 51Q174 61 165 102Q180 138 144 155Q107 177 69 162Q30 153 34 119Z',
];
const INKS = [YELLOW, PINK, TEAL, YELLOW, TEAL, PINK, YELLOW, PINK, TEAL];
const PIPS = [[55, 31], [100, 25], [145, 31], [25, 93], [175, 93], [30, 153], [170, 153], [70, 184], [130, 184]];

/** Presentational faces: the parent owns card dimensions, interaction and focus. */
export function StoneFace({ value }: { value: number }) {
  const id = `stone-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  if (!Number.isInteger(value) || value < 1 || value > 9) throw new RangeError('Number stones must be integers from 1 to 9.');
  return <svg className="lc-card-face lc-stone-face" viewBox="0 0 200 300" role="img" aria-label={`Number stone ${value}`}>
    <defs><pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill={BLUE} /></pattern></defs>
    <rect width="200" height="300" fill={PAPER} />
    <g transform="translate(0 34)" aria-hidden="true">
      <path d={STONES[value - 1]} transform="translate(5 7)" fill={`url(#${id})`} />
      <path d={STONES[value - 1]} fill={INKS[value - 1]} stroke={BLUE} strokeWidth="3" strokeLinejoin="round" />
      <path d={STONES[value - 1]} fill={`url(#${id})`} opacity=".2" />
      <path d="M60 72Q53 82 54 92" fill="none" stroke={PAPER} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="100" cy="105" rx="34" ry="44" fill={PAPER} />
      <text x="103" y="134" fill={PINK} className="lc-face-number">{value}</text>
      <text x="100" y="132" fill={BLUE} className="lc-face-number">{value}</text>
      {PIPS.slice(0, value).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={BLUE} data-stone-pip="" />)}
    </g>
    <path d="M72 267H128" stroke={TEAL} strokeWidth="4" aria-hidden="true" />
  </svg>;
}

export function GlyphFace({ op }: { op: '+' | '-' | '*' }) {
  const symbol = { '+': '+', '-': '−', '*': '×' }[op];
  const word = { '+': 'plus', '-': 'minus', '*': 'times' }[op];
  return <svg className="lc-card-face lc-glyph-face" viewBox="0 0 200 300" role="img" aria-label={`Glyph: ${word}`}>
    <rect width="200" height="300" fill={PAPER} />
    <g aria-hidden="true" fill="none" strokeWidth="3">
      <circle cx="103" cy="147" r="72" stroke={PINK} />
      <circle cx="100" cy="150" r="72" stroke={BLUE} />
      <circle cx="100" cy="150" r="61" stroke={TEAL} strokeDasharray="3 7" />
      <path d="M100 60V88M100 212V240M10 150H38M162 150H190M45 95 57 107M143 193 155 205M45 205 57 193M143 107 155 95" stroke={BLUE} />
      <path d="m100 33 8 12-8 12-8-12Zm0 210 8 12-8 12-8-12Z" fill={YELLOW} stroke={BLUE} />
    </g>
    <text x="104" y="185" className="lc-face-operator" fill={PINK} aria-hidden="true">{symbol}</text>
    <text x="100" y="182" className="lc-face-operator" fill={BLUE} aria-hidden="true">{symbol}</text>
  </svg>;
}

export function CardBack() {
  const id = `back-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return <svg className="lc-card-face lc-card-back" viewBox="0 0 200 300" role="img" aria-label="Card back">
    <defs>
      <pattern id={`${id}-dots`} width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2.2" fill={PINK} /></pattern>
      <pattern id={`${id}-glyphs`} width="72" height="90" patternUnits="userSpaceOnUse"><g fill="none" stroke={TEAL} strokeWidth="3"><path d="m20 7 13 23H7Z" /><circle cx="53" cy="55" r="12" /><path d="M8 62H28V82H8Z" /></g></pattern>
    </defs>
    <rect x="5" y="5" width="190" height="290" rx="10" fill={PAPER} stroke={BLUE} strokeWidth="10" />
    <g aria-hidden="true"><rect x="15" y="15" width="170" height="270" fill={`url(#${id}-dots)`} />
      <rect x="18" y="13" width="164" height="274" fill={`url(#${id}-glyphs)`} className="lc-face-overprint" />
      <path d="M23 23H177V277H23Z" fill="none" stroke={BLUE} strokeWidth="2" /></g>
  </svg>;
}
