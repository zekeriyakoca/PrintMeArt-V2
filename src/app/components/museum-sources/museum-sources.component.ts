import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface MuseumSource {
  name: string;
  /** Origin attribute the catalog filters on */
  attributeName: string;
}

@Component({
  selector: 'app-museum-sources',
  imports: [RouterLink],
  templateUrl: './museum-sources.component.html',
  styleUrl: './museum-sources.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MuseumSourcesComponent {
  // Museums we have works from, largest collections and Dutch houses first
  readonly museums: MuseumSource[] = [
    { name: 'Rijksmuseum', attributeName: 'Rijksmuseum' },
    { name: 'Art Institute of Chicago', attributeName: 'Art Institute of Chicago' },
    { name: 'Mauritshuis', attributeName: 'Mauritshuis' },
    { name: 'National Gallery of Art', attributeName: 'National Gallery of Art' },
    { name: 'Van Gogh Museum', attributeName: 'Van Gogh Museum' },
    { name: 'Birmingham Museums', attributeName: 'Birmingham Museums Trust' },
    { name: 'Kröller-Müller', attributeName: 'Kröller-Müller Museum' },
    { name: 'Cleveland Museum of Art', attributeName: 'Cleveland Museum of Art' },
    { name: 'Frans Hals Museum', attributeName: 'Frans Hals Museum' },
    { name: 'The Met', attributeName: 'Metropolitan Museum of Art' },
    { name: 'Noordbrabants Museum', attributeName: 'Noordbrabants Museum' },
    { name: 'Te Papa', attributeName: 'Museum of New Zealand Te Papa Tongarewa' },
    { name: 'Yale Art Gallery', attributeName: 'Yale University Art Gallery' },
    { name: 'KMSKA', attributeName: 'Royal Museum of Fine Arts Antwerp (KMSKA)' },
    { name: 'Barnes Foundation', attributeName: 'Barnes Foundation' },
    { name: 'Tate', attributeName: 'Tate' },
  ];
}
