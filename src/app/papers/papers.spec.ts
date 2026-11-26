import { DEFAULT_PAPER_CHOICE, PAPER_PAGES, PAPER_TIERS, paperBySlug, paperChoiceName, paperName, papersOfTier } from './papers';

describe('papers', () => {
  const tier = (id: string) => PAPER_TIERS.find((t) => t.id === id)!;

  it('offers two Fujifilm papers and three Hahnemühle papers', () => {
    expect(papersOfTier(tier('poster')).map(paperName)).toEqual(['Premium Poster', 'Premium Poster Silk']);
    expect(papersOfTier(tier('cotton')).map(paperName)).toEqual([
      'Hahnemühle Photo Rag',
      'Hahnemühle Museum Etching',
      'Hahnemühle FineArt Baryta',
    ]);
  });

  it('keeps the names older carts and orders hold', () => {
    const names = PAPER_PAGES.map(paperName);
    expect(names).toContain('Premium Poster');
    expect(names).toContain('Hahnemühle Photo Rag');
    expect(names).toContain('Hahnemühle Museum Etching');
  });

  it('opens with the cheapest tier and the studio picking the paper', () => {
    expect(DEFAULT_PAPER_CHOICE).toEqual({ tier: tier('poster'), paper: null });
  });

  it('names the order after the paper, or says the studio picks it', () => {
    const baryta = paperBySlug('hahnemuhle-fineart-baryta')!;
    expect(paperChoiceName({ tier: tier('cotton'), paper: baryta })).toBe('Hahnemühle FineArt Baryta');
    expect(paperChoiceName({ tier: tier('cotton'), paper: null })).toBe("Studio's choice: Fine Art (Hahnemühle)");
    expect(paperChoiceName({ tier: tier('poster'), paper: null })).toBe("Studio's choice: Premium Poster (Fujifilm)");
  });
});
