import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SizeOption } from '../../models/size-option';
import { FrameOptionsByValue } from '../../shared/constants';
import { SizeOptionsComponent } from '../size-options/size-options.component';
import { MatOptionsComponent } from '../mat-options/mat-options.component';

type FitMode = 'cover' | 'contain';

@Component({
  selector: 'app-product-preview',
  imports: [CommonModule, FormsModule, SizeOptionsComponent, MatOptionsComponent],
  templateUrl: './product-preview.component.html',
  styleUrl: './product-preview.component.scss',
})
export class ProductPreviewComponent {
  // Inputs
  isOpen = input.required<boolean>();
  imageUrl = input.required<string>();
  sizes = input.required<SizeOption[]>();
  selectedSize = model.required<SizeOption>();
  frameName = input<string | null>(null);
  isMatIncluded = model<boolean>(false);
  paperName = input<string>('');

  // Outputs
  onClose = output<void>();

  // Refs
  viewportRef = viewChild<ElementRef<HTMLDivElement>>('viewport');

  // State
  translateX = signal(0);
  translateY = signal(0);
  scale = signal(1);
  fitMode = signal<FitMode>('contain');
  isLandscape = signal(false);
  isDragging = signal(false);
  showGhost = signal(false);

  // More sizes dropdown
  showMoreSizes = signal(false);
  readonly moreSizes: SizeOption[] = [
    { id: 'more-1', name: '10x15', val1: 10, val2: 15 },
    { id: 'more-2', name: '15x20', val1: 15, val2: 20 },
    { id: 'more-3', name: '18x24', val1: 18, val2: 24 },
    { id: 'more-4', name: '20x25', val1: 20, val2: 25 },
    { id: 'more-5', name: '20x30', val1: 20, val2: 30 },
    { id: 'more-6', name: '24x30', val1: 24, val2: 30 },
    { id: 'more-7', name: '25x35', val1: 25, val2: 35 },
    { id: 'more-8', name: '28x35', val1: 28, val2: 35 },
    { id: 'more-9', name: '30x30', val1: 30, val2: 30 },
    { id: 'more-10', name: '30x45', val1: 30, val2: 45 },
    { id: 'more-11', name: '35x50', val1: 35, val2: 50 },
    { id: 'more-12', name: '40x40', val1: 40, val2: 40 },
    { id: 'more-13', name: '40x50', val1: 40, val2: 50 },
    { id: 'more-14', name: '45x60', val1: 45, val2: 60 },
    { id: 'more-15', name: '50x50', val1: 50, val2: 50 },
    { id: 'more-16', name: '50x75', val1: 50, val2: 75 },
    { id: 'more-17', name: '60x60', val1: 60, val2: 60 },
    { id: 'more-18', name: '60x80', val1: 60, val2: 80 },
    { id: 'more-19', name: '70x100', val1: 70, val2: 100 },
    { id: 'more-20', name: '80x120', val1: 80, val2: 120 },
  ];

  // Custom size
  customWidth = signal(0);
  customHeight = signal(0);

  // Drag state
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartTx = 0;
  private dragStartTy = 0;
  private pointerId: number | null = null;

  // Pinch state
  private pinchStartDist = 0;
  private pinchStartScale = 1;
  private activeTouches: PointerEvent[] = [];

  // Computed: effective size (accounts for landscape toggle)
  effectiveSize = computed(() => {
    const size = this.selectedSize();
    if (this.isLandscape()) {
      return { ...size, val1: size.val2, val2: size.val1 };
    }
    return size;
  });

  artboardRatioNum = computed(() => {
    const s = this.effectiveSize();
    return s.val1 / s.val2;
  });

  artboardRatio = computed(() => {
    const s = this.effectiveSize();
    return `${s.val1} / ${s.val2}`;
  });

  hasFrame = computed(() => !!this.frameName());

  frameMaskUrl = computed(() => {
    const name = this.frameName();
    if (!name) return null;
    const frame = FrameOptionsByValue[name];
    if (!frame) return null;
    return frame.maskWithoutMat;
  });

  // Mat padding: when frame + mat → extra space for the matt texture to show
  imagePaddingPercent = computed(() => {
    if (!this.hasFrame()) return 0;
    return this.isMatIncluded() ? 10 : 3;
  });

  clampedScale = computed(() => Math.max(0.7, Math.min(2, this.scale())));

  zoomPercent = computed(() => Math.round(this.clampedScale() * 100));

  imageTransform = computed(() => {
    const tx = this.translateX();
    const ty = this.translateY();
    const s = this.clampedScale();
    return `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
  });

  objectFit = computed(() => (this.fitMode() === 'cover' ? 'cover' : 'contain'));

  // Body scroll lock
  private scrollLockEffect = effect(() => {
    if (this.isOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Reset view on size change
  private sizeChangeEffect = effect(
    () => {
      this.selectedSize();
      this.scale.set(1);
      this.translateX.set(0);
      this.translateY.set(0);
    },
    { allowSignalWrites: true },
  );

  // Sync custom inputs from selected preset
  private syncCustomSize = effect(
    () => {
      const size = this.selectedSize();
      if (size.id !== 'custom') {
        this.customWidth.set(size.val1);
        this.customHeight.set(size.val2);
      }
    },
    { allowSignalWrites: true },
  );

  close() {
    document.body.style.overflow = '';
    this.onClose.emit();
  }

  // Fit mode
  setFitMode(mode: FitMode) {
    this.fitMode.set(mode);
    this.translateX.set(0);
    this.translateY.set(0);
    this.scale.set(1);
  }

  // Rotate 90° (swap orientation)
  toggleLandscape() {
    this.isLandscape.update((v) => !v);
    this.translateX.set(0);
    this.translateY.set(0);
  }

  // Center after drag
  centerImage() {
    this.translateX.set(0);
    this.translateY.set(0);
  }

  // Zoom
  zoomIn() {
    this.scale.update((s) => Math.min(2, s + 0.1));
  }

  zoomOut() {
    this.scale.update((s) => Math.max(0.7, s - 0.1));
  }

  resetZoom() {
    this.scale.set(1);
    this.translateX.set(0);
    this.translateY.set(0);
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    this.scale.update((s) => Math.max(0.7, Math.min(2, s + delta)));
  }

  selectMoreSize(size: SizeOption) {
    this.selectedSize.set({
      id: 'custom',
      name: size.name,
      val1: size.val1,
      val2: size.val2,
    });
    this.showMoreSizes.set(false);
  }

  // Custom size
  applyCustomSize() {
    const w = this.customWidth();
    const h = this.customHeight();
    if (w > 0 && h > 0) {
      this.selectedSize.set({
        id: 'custom',
        name: `${w}x${h}`,
        val1: w,
        val2: h,
      });
    }
  }

  // Drag / Pan
  onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    this.isDragging.set(true);
    this.pointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartTx = this.translateX();
    this.dragStartTy = this.translateY();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isDragging() || event.pointerId !== this.pointerId) return;
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    let newTx = this.dragStartTx + dx;
    let newTy = this.dragStartTy + dy;

    if (this.fitMode() === 'cover') {
      const clamped = this.clampTranslation(newTx, newTy);
      newTx = clamped.x;
      newTy = clamped.y;
    }

    this.translateX.set(newTx);
    this.translateY.set(newTy);
  }

  onPointerUp(event: PointerEvent) {
    if (event.pointerId !== this.pointerId) return;
    this.isDragging.set(false);
    this.pointerId = null;
  }

  // Touch pinch zoom
  onMultiPointerDown(event: PointerEvent) {
    this.activeTouches.push(event);
    if (this.activeTouches.length === 2) {
      this.pinchStartDist = this.getTouchDist();
      this.pinchStartScale = this.scale();
    }
  }

  onMultiPointerMove(event: PointerEvent) {
    const idx = this.activeTouches.findIndex(
      (t) => t.pointerId === event.pointerId,
    );
    if (idx >= 0) this.activeTouches[idx] = event;
    if (this.activeTouches.length === 2) {
      const dist = this.getTouchDist();
      const newScale = this.pinchStartScale * (dist / this.pinchStartDist);
      this.scale.set(Math.max(0.7, Math.min(2, newScale)));
    }
  }

  onMultiPointerUp(event: PointerEvent) {
    this.activeTouches = this.activeTouches.filter(
      (t) => t.pointerId !== event.pointerId,
    );
  }

  private getTouchDist(): number {
    if (this.activeTouches.length < 2) return 0;
    const [a, b] = this.activeTouches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  private clampTranslation(tx: number, ty: number) {
    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport) return { x: tx, y: ty };
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const s = this.clampedScale();
    const overflowX = Math.max(0, (vw * s - vw) / 2);
    const overflowY = Math.max(0, (vh * s - vh) / 2);
    return {
      x: Math.max(-overflowX, Math.min(overflowX, tx)),
      y: Math.max(-overflowY, Math.min(overflowY, ty)),
    };
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen()) return;
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    )
      return;

    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case '+':
      case '=':
        event.preventDefault();
        this.zoomIn();
        break;
      case '-':
        event.preventDefault();
        this.zoomOut();
        break;
      case 'r':
      case 'R':
        this.toggleLandscape();
        break;
      case 'c':
      case 'C':
        this.centerImage();
        break;
      case '0':
        this.resetZoom();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.translateX.update((x) => x - 10);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.translateX.update((x) => x + 10);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.translateY.update((y) => y - 10);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.translateY.update((y) => y + 10);
        break;
    }
  }
}
