import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SizeOption } from '../../models/size-option';
import { frameMaskFor } from '../../shared/constants';
import { DESIGN_WIDTH_PX, DesignLayout, composeDesign, loadCorsImage } from '../../shared/design-composer';
import { ROOM_SCENES, RoomScene } from './rooms';
import { Framing, RoomRenderer } from './room-renderer';
import { PreparingStateComponent } from '../shared/preparing-state/preparing-state.component';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';

@Component({
  imports: [TranslatePipe, PreparingStateComponent, UnsavedChangesDialogComponent],
  selector: 'app-room-view',
  standalone: true,
  templateUrl: './room-view.component.html',
  styleUrl: './room-view.component.scss',
})
export class RoomViewComponent {
  title = input('');
  imageUrl = input.required<string>();
  /** Frame option name as chosen on the product page; null for a rolled-up print, which shows in the frame we sell */
  frameName = input<string | null>(null);
  matIncluded = input(false);
  /** Crop / zoom / pan from Preview & Design */
  layout = input.required<DesignLayout>();
  /** Size chosen in Preview & Design */
  selectedSize = input<SizeOption | null>(null);
  close = output<void>();
  editDesign = output<void>();
  /** Asks to save the edited design before the room view closes */
  showDiscardConfirm = input(false);
  saving = input(false);
  saveDesign = output<void>();
  keepEditing = output<void>();
  discardDesign = output<void>();

  /** Phones get a crop around the print in its own orientation, and half the rooms */
  private readonly phone = typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;
  readonly rooms = this.phone ? ROOM_SCENES.slice(0, Math.ceil(ROOM_SCENES.length / 2)) : ROOM_SCENES;
  room = signal<RoomScene>(ROOM_SCENES[0]);
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  /** Shows the new room from the top, where the picture is */
  selectRoom(scene: RoomScene) {
    this.room.set(scene);
    this.body()?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('stage');
  private readonly renderer = new RoomRenderer();
  private readonly roomImages = new Map<string, HTMLImageElement>();
  private loadedRoom = signal<string | null>(null);
  private art = signal<HTMLImageElement | null>(null);
  private frameMask = signal<HTMLImageElement | null>(null);
  /** Room the stage last finished drawing; until it matches, the preparing state shows */
  private renderedRoom = signal<string | null>(null);
  ready = computed(() => this.renderedRoom() === this.room().id);

  /** Print size in cm, turned to match the artwork's orientation */
  printSize = computed(() => {
    const size = this.selectedSize();
    const art = this.art();
    if (!size || !art) return null;
    const landscape = art.naturalWidth > art.naturalHeight;
    return landscape ? { width: size.val2, height: size.val1 } : { width: size.val1, height: size.val2 };
  });

  /** Same frame as Preview & Design, for the print as it hangs (portrait or landscape) */
  frameMaskUrl = computed(() => {
    const size = this.printSize();
    return size ? frameMaskFor(this.frameName(), size.width, size.height) : null;
  });

  /** On phones a tall print gets a tall crop of the room and a wide one a square crop, so the print and the wall around it both fit */
  private phoneFraming(widthCm: number, heightCm: number): Framing | undefined {
    if (!this.phone) return undefined;
    return heightCm > widthCm
      ? { widthPx: 1600, aspect: 3 / 4, printShare: 0.5, printY: 0.45 }
      : { widthPx: 1600, aspect: 1, printShare: 0.62, printY: 0.45 };
  }

  constructor() {
    // Render at body level: the product page wraps the sidebar in its own stacking context,
    // which would keep a fixed overlay underneath the sticky header.
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const body = inject(DOCUMENT).body;
    afterNextRender(() => body.appendChild(host));
    inject(DestroyRef).onDestroy(() => host.remove());

    effect(() => {
      loadCorsImage(this.imageUrl()).then((image) => this.art.set(image));
    });

    effect(() => {
      const url = this.frameMaskUrl();
      this.frameMask.set(null);
      if (url) loadCorsImage(url).then((image) => this.frameMask.set(image));
    });

    effect(() => {
      const room = this.room();
      if (this.roomImages.has(room.id)) return;
      const image = new Image();
      // Served from blob storage: CORS keeps the canvas readable for the light map and Save my design
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        this.roomImages.set(room.id, image);
        this.loadedRoom.set(room.id);
      };
      image.src = room.image;
    });

    effect(() => {
      const canvas = this.canvas()?.nativeElement;
      const room = this.room();
      const art = this.art();
      const size = this.printSize();
      const frame = this.frameMask();
      this.loadedRoom();
      const roomImage = this.roomImages.get(room.id);
      if (!canvas || !art || !size || !roomImage || !frame) return;

      const design = composeDesign(
        DESIGN_WIDTH_PX,
        { image: art, frame, width: size.width, height: size.height, matIncluded: this.matIncluded() },
        this.layout(),
      );
      this.renderer.render(canvas, room, roomImage, { design, widthCm: size.width, heightCm: size.height }, this.phoneFraming(size.width, size.height));
      this.renderedRoom.set(room.id);
    });
  }
}
