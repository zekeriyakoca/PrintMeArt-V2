import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, DestroyRef, ElementRef, PLATFORM_ID, Signal, afterNextRender, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SizeOption } from '../../models/size-option';
import { frameMaskFor } from '../../shared/constants';
import { DESIGN_WIDTH_PX, DesignLayout, composeDesign, loadCorsImage } from '../../shared/design-composer';
import { ROOM_SCENES, RoomScene } from './rooms';
import { RoomCrop, RoomRenderer } from './room-renderer';
import { PreparingStateComponent } from '../shared/preparing-state/preparing-state.component';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { ScrollLockService } from '../../services/scroll-lock/scroll-lock.service';

/** Phones get the room view stacked: picture on top, options below */
const PHONE_QUERY = '(max-width: 900px)';

/** Shows the design from Preview & Design hanging in a room, at real scale */
@Component({
  imports: [TranslatePipe, PreparingStateComponent, UnsavedChangesDialogComponent],
  selector: 'app-room-view',
  standalone: true,
  templateUrl: './room-view.component.html',
  styleUrl: './room-view.component.scss',
})
export class RoomViewComponent {
  // The print, as designed in Preview & Design
  title = input('');
  imageUrl = input.required<string>();
  /** Frame option name as chosen on the product page; null for a rolled-up print, which shows in the frame we sell */
  frameName = input<string | null>(null);
  matIncluded = input(false);
  /** Crop / zoom / pan from Preview & Design */
  layout = input.required<DesignLayout>();
  /** Size chosen in Preview & Design */
  selectedSize = input<SizeOption | null>(null);

  // Closing with an unsaved design: the parent decides and saves, this view only asks
  showDiscardConfirm = input(false);
  saving = input(false);

  close = output<void>();
  editDesign = output<void>();
  saveDesign = output<void>();
  keepEditing = output<void>();
  discardDesign = output<void>();

  private readonly phone = isPlatformBrowser(inject(PLATFORM_ID)) && window.matchMedia(PHONE_QUERY).matches;

  /** Phones offer half the rooms, so the picker stays short */
  readonly rooms = this.phone ? ROOM_SCENES.slice(0, Math.ceil(ROOM_SCENES.length / 2)) : ROOM_SCENES;
  readonly room = signal<RoomScene>(this.rooms[0]);

  private readonly art = loaded(() => loadCorsImage(this.imageUrl()));
  /** Print size in cm, turned to match the artwork's orientation */
  readonly printSize = computed(() => {
    const size = this.selectedSize();
    const art = this.art();
    if (!size || !art) return null;
    const landscape = art.naturalWidth > art.naturalHeight;
    return landscape ? { width: size.val2, height: size.val1 } : { width: size.val1, height: size.val2 };
  });
  /** Same frame as Preview & Design, for the print as it hangs (portrait or landscape) */
  private readonly frameMask = loaded(() => {
    const size = this.printSize();
    return size ? loadCorsImage(frameMaskFor(this.frameName(), size.width, size.height)) : null;
  });
  private readonly roomPhotos = new Map<string, Promise<HTMLImageElement>>();
  private readonly roomPhoto = loaded(() => this.photoOf(this.room()));

  /** Room the stage last finished drawing; until it matches, the preparing state shows */
  private readonly renderedRoom = signal<string | null>(null);
  readonly ready = computed(() => this.renderedRoom() === this.room().id);

  private readonly stage = viewChild<ElementRef<HTMLCanvasElement>>('stage');
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');
  private readonly renderer = new RoomRenderer();

  constructor() {
    // Render at body level: the product page wraps the sidebar in its own stacking context,
    // which would keep a fixed overlay underneath the sticky header.
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const body = inject(DOCUMENT).body;
    afterNextRender(() => body.appendChild(host));
    // The page behind stays still while the room view is open
    const scrollLock = inject(ScrollLockService);
    scrollLock.lock(this);
    inject(DestroyRef).onDestroy(() => {
      host.remove();
      scrollLock.unlock(this);
    });

    effect(() => {
      const canvas = this.stage()?.nativeElement;
      const art = this.art();
      const frame = this.frameMask();
      const photo = this.roomPhoto();
      const size = this.printSize();
      if (!canvas || !art || !frame || !photo || !size) return;

      const room = this.room();
      const design = composeDesign(
        DESIGN_WIDTH_PX,
        { image: art, frame, width: size.width, height: size.height, matIncluded: this.matIncluded() },
        this.layout(),
      );
      this.renderer.render(canvas, room, photo, { design, widthCm: size.width, heightCm: size.height }, this.crop(size));
      this.renderedRoom.set(room.id);
    });
  }

  selectRoom(scene: RoomScene) {
    this.room.set(scene);
    // On phones the picker sits under the picture: bring the new room into view
    this.body()?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Phones are tall: show a tall piece of the room for a tall print and a square one for a wide print, rather than a thin strip */
  private crop(size: { width: number; height: number }): RoomCrop {
    if (!this.phone) return {};
    return { aspect: size.height > size.width ? 4 / 5 : 1 };
  }

  /** Room photos are large; each is fetched once and kept while the view is open */
  private photoOf(room: RoomScene): Promise<HTMLImageElement> {
    let photo = this.roomPhotos.get(room.id);
    if (!photo) {
      photo = new Promise((resolve, reject) => {
        const image = new Image();
        // Served from blob storage: CORS keeps the canvas readable for the light map
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Room photo failed to load: ${room.id}`));
        image.src = room.image;
      });
      this.roomPhotos.set(room.id, photo);
    }
    return photo;
  }
}

/** The image a loader resolves to, as a signal; null while it loads, and again whenever the loader's inputs change */
function loaded(load: () => Promise<HTMLImageElement> | null): Signal<HTMLImageElement | null> {
  const image = signal<HTMLImageElement | null>(null);
  let latest: Promise<HTMLImageElement> | null = null;
  effect(() => {
    image.set(null);
    const pending = (latest = load());
    pending?.then(
      // A newer load may have started meanwhile; only the latest one counts
      (result) => latest === pending && image.set(result),
      () => {},
    );
  });
  return image.asReadonly();
}
