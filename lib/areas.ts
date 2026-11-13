// Pune localities with their own landing page at /pune/[slug].
// "about" is a short factual orientation line, not marketing claims.
export const PUNE_AREAS = [
  { slug: "baner", name: "Baner", about: "A residential and business neighbourhood in west Pune, close to Aundh, Balewadi and the Mumbai-Bangalore highway." },
  { slug: "wakad", name: "Wakad", about: "A fast-growing locality in the Pimpri Chinchwad belt, next to Hinjewadi and the Mumbai-Pune expressway." },
  { slug: "hinjewadi", name: "Hinjewadi", about: "Home to Rajiv Gandhi Infotech Park in west Pune, with many apartments aimed at IT professionals." },
  { slug: "kharadi", name: "Kharadi", about: "An east Pune locality around the EON IT park, with easy access to Viman Nagar and the airport." },
  { slug: "hadapsar", name: "Hadapsar", about: "A large east Pune area that includes Magarpatta City, with good rail and road connections." },
  { slug: "viman-nagar", name: "Viman Nagar", about: "A well-established east Pune neighbourhood near Pune airport and Koregaon Park." },
  { slug: "koregaon-park", name: "Koregaon Park", about: "A central Pune neighbourhood known for tree-lined streets, cafes and premium residences." },
  { slug: "wagholi", name: "Wagholi", about: "A suburb on the Pune-Ahmednagar road, popular for larger homes at lower price points." },
  { slug: "ravet", name: "Ravet", about: "A residential locality in Pimpri Chinchwad on the Mumbai-Bangalore highway." },
  { slug: "pimple-saudagar", name: "Pimple Saudagar", about: "A planned residential area in Pimpri Chinchwad close to Wakad and Aundh." },
] as const;

export type PuneArea = (typeof PUNE_AREAS)[number];

export const getArea = (slug: string): PuneArea | undefined =>
  PUNE_AREAS.find((a) => a.slug === slug);
