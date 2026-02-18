import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Collection {
  name: string;
  tagline: string;
  imageUrl: string;
  queryParams: Record<string, string>;
  badge?: string;
}

@Component({
  selector: 'app-collections',
  imports: [RouterLink],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent {
  readonly featured: Collection[] = [
    {
      name: 'Dutch Masters',
      tagline: 'Rembrandt, Vermeer and their contemporaries — the golden age of Dutch painting, 1600–1700.',
      imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1400&q=80',
      queryParams: { attributeName: 'Dutch Masters' },
      badge: 'Collection',
    },
    {
      name: 'Impressionism',
      tagline: 'Light, colour and the fleeting moment — Paris, 1870s.',
      imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&q=80',
      queryParams: { attributeName: 'Impressionism' },
      badge: 'Movement',
    },
    {
      name: 'Van Gogh Collection',
      tagline: 'Post-Impressionist fire — bold strokes, vivid colour, unmatched emotion.',
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
      queryParams: { attributeName: 'Vincent van Gogh' },
      badge: 'Painter',
    },
  ];

  readonly starters: Collection[] = [
    {
      name: "Editor's Picks",
      tagline: 'Our favourite finds, chosen by the team',
      imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80',
      queryParams: { categoryName: "Editor's Picks" },
      badge: 'Staff Pick',
    },
    {
      name: 'In the Spotlight',
      tagline: 'The prints everyone is looking at',
      imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
      queryParams: { categoryName: 'In the Spotlight' },
      badge: 'Trending',
    },
    {
      name: 'Timeless Classics',
      tagline: 'Art that never goes out of style',
      imageUrl: 'https://images.unsplash.com/photo-1529154691942-2e4bfdc0a5c5?w=800&q=80',
      queryParams: { categoryName: 'Timeless Classics' },
    },
    {
      name: 'Dutch Masters',
      tagline: 'The golden era of Dutch painting',
      imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80',
      queryParams: { attributeName: 'Dutch Masters' },
      badge: 'Collection',
    },
    {
      name: 'Van Gogh Collection',
      tagline: 'Bold strokes, vivid colour',
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
      queryParams: { attributeName: 'Vincent van Gogh' },
      badge: 'Fan Favourite',
    },
  ];

  readonly museums: Collection[] = [
    {
      name: 'Rijksmuseum Highlights',
      tagline: 'Dutch golden age masterpieces',
      imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
      queryParams: { attributeName: 'Rijksmuseum' },
      badge: 'Amsterdam',
    },
    {
      name: 'The Met Collection',
      tagline: '5,000 years of art history',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
      queryParams: { attributeName: 'Metropolitan Museum of Art' },
      badge: 'New York',
    },
    {
      name: 'National Gallery Picks',
      tagline: 'European masters since 1824',
      imageUrl: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800&q=80',
      queryParams: { attributeName: 'National Gallery' },
      badge: 'London',
    },
    {
      name: 'British Museum',
      tagline: 'Two million years of history',
      imageUrl: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&q=80',
      queryParams: { attributeName: 'British Museum' },
      badge: 'London',
    },
    {
      name: "Musée d'Orsay Corner",
      tagline: 'The home of Impressionism',
      imageUrl: 'https://images.unsplash.com/photo-1578926288207-a90a5366d4f4?w=800&q=80',
      queryParams: { attributeName: "Musée d'Orsay" },
      badge: 'Paris',
    },
    {
      name: 'Yale Art Collection',
      tagline: 'Three centuries of American art',
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
      queryParams: { attributeName: 'Yale University Art Gallery' },
      badge: 'New Haven',
    },
  ];

  readonly scenes: Collection[] = [
    {
      name: 'Alpine Peaks & Valleys',
      tagline: 'Where the air is crisp and clear',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      queryParams: { categoryName: 'Alpine Peaks & Valleys' },
    },
    {
      name: 'Landscapes',
      tagline: 'Wide horizons and open skies',
      imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
      queryParams: { categoryName: 'Landscapes' },
    },
    {
      name: 'Forest & Countryside',
      tagline: 'Quiet paths and dappled light',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
      queryParams: { categoryName: 'Forest & Countryside' },
    },
    {
      name: 'Winter Scenes',
      tagline: 'Frost, snow and still moments',
      imageUrl: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800&q=80',
      queryParams: { categoryName: 'Winter Scenes' },
    },
    {
      name: 'Cities in Art',
      tagline: 'Urban life captured in paint',
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
      queryParams: { categoryName: 'Cities in Art' },
    },
    {
      name: 'Garden Blooms',
      tagline: 'Colour, life and quiet beauty',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      queryParams: { categoryName: 'Garden Blooms' },
    },
  ];

  readonly styles: Collection[] = [
    {
      name: 'Renaissance',
      tagline: 'The rebirth of art and humanism',
      imageUrl: 'https://images.unsplash.com/photo-1529154691942-2e4bfdc0a5c5?w=800&q=80',
      queryParams: { attributeName: 'Renaissance' },
      badge: 'c. 1400s',
    },
    {
      name: 'Romanticism',
      tagline: 'Emotion, nature and sublime drama',
      imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
      queryParams: { attributeName: 'Romanticism' },
      badge: 'c. 1800',
    },
    {
      name: 'Impressionism',
      tagline: 'Light, colour and the fleeting moment',
      imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&q=80',
      queryParams: { attributeName: 'Impressionism' },
      badge: 'c. 1870s',
    },
    {
      name: 'Post-Impressionism',
      tagline: 'Beyond the visible — into the felt',
      imageUrl: 'https://images.unsplash.com/photo-1543499776-e57e0e3e7e50?w=800&q=80',
      queryParams: { attributeName: 'Post-Impressionism' },
      badge: 'c. 1880s',
    },
    {
      name: 'Realism',
      tagline: 'Life as it truly is — without pretence',
      imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80',
      queryParams: { attributeName: 'Realism' },
      badge: 'c. 1850s',
    },
    {
      name: 'Art Nouveau',
      tagline: "Nature's curves in art and design",
      imageUrl: 'https://images.unsplash.com/photo-1519326882449-4b4e1ccde5e9?w=800&q=80',
      queryParams: { attributeName: 'Art Nouveau' },
      badge: 'c. 1890s',
    },
    {
      name: 'Baroque',
      tagline: 'Drama, shadow and divine grandeur',
      imageUrl: 'https://images.unsplash.com/photo-1578926288207-a90a5366d4f4?w=800&q=80',
      queryParams: { attributeName: 'Baroque' },
      badge: 'c. 1620s',
    },
    {
      name: 'Neoclassicism',
      tagline: 'Order, reason and ancient beauty',
      imageUrl: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800&q=80',
      queryParams: { attributeName: 'Neoclassicism' },
      badge: 'c. 1780s',
    },
  ];

  readonly painters: Collection[] = [
    {
      name: 'Claude Monet',
      tagline: 'Father of Impressionism',
      imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&q=80',
      queryParams: { attributeName: 'Claude Monet' },
      badge: '1840 – 1926',
    },
    {
      name: 'Vincent van Gogh',
      tagline: 'Post-Impressionist visionary',
      imageUrl: 'https://images.unsplash.com/photo-1543499776-e57e0e3e7e50?w=600&q=80',
      queryParams: { attributeName: 'Vincent van Gogh' },
      badge: '1853 – 1890',
    },
    {
      name: 'Camille Pissarro',
      tagline: 'Gentle giant of Impressionism',
      imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80',
      queryParams: { attributeName: 'Camille Pissarro' },
      badge: '1830 – 1903',
    },
    {
      name: 'Alfred Sisley',
      tagline: 'The quiet Impressionist',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
      queryParams: { attributeName: 'Alfred Sisley' },
      badge: '1839 – 1899',
    },
    {
      name: 'Pierre-Auguste Renoir',
      tagline: 'Joy and beauty in every stroke',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
      queryParams: { attributeName: 'Pierre-Auguste Renoir' },
      badge: '1841 – 1919',
    },
    {
      name: 'J.M.W. Turner',
      tagline: 'The painter of light',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
      queryParams: { attributeName: 'J.M.W. Turner' },
      badge: '1775 – 1851',
    },
    {
      name: 'John Singer Sargent',
      tagline: 'The greatest portrait painter',
      imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&q=80',
      queryParams: { attributeName: 'John Singer Sargent' },
      badge: '1856 – 1925',
    },
  ];
}
