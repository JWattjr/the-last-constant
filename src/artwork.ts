declare const __ARTWORK__: string[];

// Optional local artwork only: absent files never produce failed image requests. Optimized .webp wins over the source .png.
export function artworkUrl(name: string): string | undefined {
  const file = [`${name}.webp`, `${name}.png`].find(candidate => __ARTWORK__.includes(candidate));
  return file && `/assets/${file}`;
}
