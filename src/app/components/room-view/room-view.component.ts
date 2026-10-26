import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SizeOption } from '../../models/size-option';
import { FrameOptionsByValue, frameMasksFor } from '../../shared/constants';
import { DESIGN_WIDTH_PX, DesignLayout, composeDesign, designToFile, loadCorsImage } from '../../shared/design-composer';
import { CommonApiService } from '../../services/api/common-api.service';
import { ROOM_SCENES, RoomScene } from './rooms';
import { RoomRenderer } from './room-renderer';

@Component({
  imports: [TranslatePipe],
  selector: 'app-room-view',
  standalone: true,
  templateUrl: './room-view.component.html',
  styleUrl: './room-view.component.scss',
})
export class RoomViewComponent {
  title = input('');
  imageUrl = input.required<string>();
  /** Frame option name as chosen on the product page; null for an unframed print */
  frameName = input<string | null>(null);
  matIncluded = input(false);
  /** Crop / zoom / pan from Preview & Design */
  layout = input.required<DesignLayout>();
  sizes = input<SizeOption[]>([]);
  selectedSize = model<SizeOption | null>(null);
  close = output<void>();
  editDesign = output<void>();
  designSaved = output<string>();

  readonly rooms = ROOM_SCENES;
  room = signal<RoomScene>(ROOM_SCENES[0]);

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('stage');
  private readonly renderer = new RoomRenderer();
  private readonly roomImages = new Map<string, HTMLImageElement>();
  private loadedRoom = signal<string | null>(null);
  private art = signal<HTMLImageElement | null>(null);
  private frameMask = signal<HTMLImageElement | null>(null);
  private readonly commonApi = inject(CommonApiService);
  /** The print as last composed for the room; this is what Save my design uploads */
  private design: HTMLCanvasElement | null = null;
  isSaving = signal(false);

  frameMaskUrl = computed(() => {
    const frame = FrameOptionsByValue[this.frameName() ?? ''];
    const size = this.selectedSize();
    return frame ? frameMasksFor(frame, size?.val1 ?? 0, size?.val2 ?? 0).maskWithoutMat : null;
  });

  /** Print size in cm, turned to match the artwork's orientation */
  printSize = computed(() => {
    const size = this.selectedSize();
    const art = this.art();
    if (!size || !art) return null;
    const landscape = art.naturalWidth > art.naturalHeight;
    return landscape ? { width: size.val2, height: size.val1 } : { width: size.val1, height: size.val2 };
  });

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
      if (!url) this.frameMask.set(null);
      else loadCorsImage(url).then((image) => this.frameMask.set(image));
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
      const frame = this.frameMaskUrl() ? this.frameMask() : null;
      this.loadedRoom();
      const roomImage = this.roomImages.get(room.id);
      if (!canvas || !art || !size || !roomImage || (this.frameMaskUrl() && !frame)) return;

      const design = composeDesign(
        DESIGN_WIDTH_PX,
        { image: art, frame, width: size.width, height: size.height, matIncluded: this.matIncluded() },
        this.layout(),
      );
      this.design = design;
      this.renderer.render(canvas, room, roomImage, { design, widthCm: size.width, heightCm: size.height, framed: !!frame });
    });
  }

  saveDesign() {
    if (!this.design || this.isSaving()) return;
    this.isSaving.set(true);
    designToFile(this.design)
      .then((file) =>
        this.commonApi.uploadImage(file).subscribe({
          next: (url) => {
            this.isSaving.set(false);
            this.designSaved.emit(url);
            this.close.emit();
          },
          error: () => this.isSaving.set(false),
        }),
      )
      .catch(() => this.isSaving.set(false));
  }
}
