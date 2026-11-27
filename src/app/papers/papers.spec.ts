import nl from '../i18n/nl.json';
import { defaultPaperChoice, PAPER_PAGES, PAPER_TIERS, paperBySlug, paperChoiceName, paperName, papersOfTier } from './papers';

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

  it('opens Your design on fine art with the studio picking the paper', () => {
    expect(defaultPaperChoice(true)).toEqual({ tier: tier('cotton'), paper: null });
  });

  it('opens a catalog print on FineArt Baryta', () => {
    const choice = defaultPaperChoice(false);
    expect(choice.tier).toBe(tier('cotton'));
    expect(paperChoiceName(choice)).toBe('Hahnemühle FineArt Baryta');
  });

  it('names the order after the paper, or says the studio picks it', () => {
    const baryta = paperBySlug('hahnemuhle-fineart-baryta')!;
    expect(paperChoiceName({ tier: tier('cotton'), paper: baryta })).toBe('Hahnemühle FineArt Baryta');
    expect(paperChoiceName({ tier: tier('cotton'), paper: null })).toBe("Studio's choice: Fine Art (Hahnemühle)");
    expect(paperChoiceName({ tier: tier('poster'), paper: null })).toBe("Studio's choice: Premium Poster (Fujifilm)");
  });

  it('sells the studio\'s pick as the tier\'s own option, so it costs what the tier costs', () => {
    // The backend's paper options: Home and Museum. 'Studio' and 'Gallery' are other options with their own price
    expect(PAPER_TIERS.map((t) => t.grade)).toEqual(['Home', 'Museum']);
  });

  it('names the studio\'s pick so the backend and the Dutch pages recognise it', () => {
    const names = nl.name as Record<string, string>;
    for (const t of PAPER_TIERS) {
      // The backend's customer emails find it by this prefix (eCommBone Shared/Email/OrderOptionText.cs)
      expect(t.studioChoiceName.startsWith("Studio's choice: ")).toBeTrue();
      expect(names[t.studioChoiceName]).toBe(`Keuze van de studio: ${t.studioChoiceName.slice("Studio's choice: ".length)}`);
    }
  });
});
