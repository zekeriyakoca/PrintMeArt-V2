import { Component, computed, effect, ElementRef, HostListener, inject, input, model, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SizeOption } from '../../models/size-option';
import { ProductMetadata } from '../../models/product';
import { AllPapers, FrameOptionsByValue, Paper } from '../../shared/constants';
import { SizeOptionsComponent } from '../size-options/size-options.component';
import { MatOptionsComponent } from '../mat-options/mat-options.component';
import { CommonApiService } from '../../services/api/common-api.service';

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
  metadata = input<ProductMetadata | null>(null);

  // Outputs
  onClose = output<void>();
  onDesignSaved = output<string>();

  // Services
  private commonApi = inject(CommonApiService);

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
  showGuides = signal(false);
  showGuideInfo = signal(true);
  isSaving = signal(false);

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

  frameInfo = computed(() => {
    const name = this.frameName();
    if (!name) return null;
    return FrameOptionsByValue[name] ?? null;
  });

  frameMaskUrl = computed(() => this.frameInfo()?.maskWithoutMat ?? null);

  paperInfo = computed<Paper | null>(() => {
    const name = this.paperName();
    if (!name) return null;
    return AllPapers.find((p) => p.name === name) ?? null;
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

  // Smart init when preview opens
  private prevOpen = false;
  private initEffect = effect(
    () => {
      const open = this.isOpen();
      if (open && !this.prevOpen) {
        this.smartInit();
      }
      this.prevOpen = open;
    },
    { allowSignalWrites: true },
  );

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

  private smartInit() {
    const meta = this.metadata();
    const size = this.selectedSize();

    // Always contain + overflow visible
    this.fitMode.set('contain');
    this.showGhost.set(true);
    this.translateX.set(0);
    this.translateY.set(0);

    // Detect image orientation from metadata
    if (meta) {
      const imgW = parseFloat(meta.OriginalImageWidth) || 1;
      const imgH = parseFloat(meta.OriginalImageHeight) || 1;
      const imageIsLandscape = imgW > imgH;
      const sizeIsLandscape = size.val1 > size.val2;
      // Toggle landscape if image and size orientation don't match
      this.isLandscape.set(imageIsLandscape !== sizeIsLandscape);
    } else {
      this.isLandscape.set(false);
    }

    // Set zoom: if mat, zoom out slightly to show mat border; otherwise fit
    if (this.isMatIncluded() && this.hasFrame()) {
      this.scale.set(0.92);
    } else {
      this.scale.set(1);
    }
  }

  saveDesign() {
    if (this.isSaving()) return;

    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport) return;

    // Read actual DOM content area (img element fills this)
    // clientWidth/Height includes padding; subtract it to get content box
    const vpStyle = getComputedStyle(viewport);
    const domPadL = parseFloat(vpStyle.paddingLeft) || 0;
    const domPadR = parseFloat(vpStyle.paddingRight) || 0;
    const domPadT = parseFloat(vpStyle.paddingTop) || 0;
    const domPadB = parseFloat(vpStyle.paddingBottom) || 0;
    const domContentW = viewport.clientWidth - domPadL - domPadR;
    const domContentH = viewport.clientHeight - domPadT - domPadB;

    this.isSaving.set(true);

    // Snapshot user transforms
    const tx = this.translateX();
    const ty = this.translateY();
    const userScale = this.clampedScale();
    const fitMode = this.fitMode();
    const hasFrame = this.hasFrame();
    const padPercent = this.imagePaddingPercent();

    const frameMaskUrl = this.frameMaskUrl();
    const loads: Promise<HTMLImageElement>[] = [this.loadImage(this.imageUrl())];
    if (frameMaskUrl) loads.push(this.loadImage(frameMaskUrl));

    Promise.all(loads)
      .then(([img, frameImg]) => {
        const size = this.effectiveSize();
        const canvasW = 1200;
        const canvasH = Math.round(canvasW * (size.val2 / size.val1));

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d')!;

        // White background (artboard)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);

        // 1. Viewport rect in canvas — matches .paper-behind-frame margins
        //    CSS % margin resolves against containing block WIDTH
        let cvpX = 0, cvpY = 0, cvpW = canvasW, cvpH = canvasH;
        if (hasFrame) {
          const mLR = 0.04 * canvasW;
          const mTB = 0.02 * canvasW;
          cvpX = mLR;
          cvpY = mTB;
          cvpW = canvasW - 2 * mLR;
          cvpH = canvasH - 2 * mTB;
        }

        // 2. Content rect in canvas — matches CSS padding on .image-viewport
        //    CSS % padding resolves against containing block WIDTH (= artboard width)
        const padPx = (padPercent / 100) * canvasW;
        const cntX = cvpX + padPx;
        const cntY = cvpY + padPx;
        const cntW = cvpW - 2 * padPx;
        const cntH = cvpH - 2 * padPx;

        // 3. Clip to viewport (overflow: hidden clips to padding box)
        ctx.save();
        ctx.beginPath();
        ctx.rect(cvpX, cvpY, cvpW, cvpH);
        ctx.clip();

        // 4. Base image size from object-fit within content area
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const cntRatio = cntW / cntH;
        let baseW: number, baseH: number;

        if (fitMode === 'cover') {
          if (imgRatio > cntRatio) {
            baseH = cntH;
            baseW = cntH * imgRatio;
          } else {
            baseW = cntW;
            baseH = cntW / imgRatio;
          }
        } else {
          if (imgRatio > cntRatio) {
            baseW = cntW;
            baseH = cntW / imgRatio;
          } else {
            baseH = cntH;
            baseW = cntH * imgRatio;
          }
        }

        // 5. Map user translate from DOM content pixels → canvas content pixels
        const ratioX = cntW / domContentW;
        const ratioY = cntH / domContentH;
        const canvasTx = tx * ratioX;
        const canvasTy = ty * ratioY;

        // 6. Draw: CSS transform = translate(tx,ty) scale(s) with origin at center
        //    Center of content area = where img element center is
        const cx = cntX + cntW / 2;
        const cy = cntY + cntH / 2;
        const finalW = baseW * userScale;
        const finalH = baseH * userScale;
        const dx = cx + canvasTx - finalW / 2;
        const dy = cy + canvasTy - finalH / 2;

        ctx.drawImage(img, dx, dy, finalW, finalH);
        ctx.restore();

        // 7. Frame overlay on top (covers full artboard, above clip)
        if (frameImg) {
          ctx.drawImage(frameImg, 0, 0, canvasW, canvasH);
        }

        canvas.toBlob((blob) => {
          if (!blob) {
            this.isSaving.set(false);
            return;
          }
          const file = new File([blob], 'preview-design.png', { type: 'image/png' });
          this.commonApi.uploadImage(file).subscribe({
            next: (url) => {
              this.onDesignSaved.emit(url);
              this.isSaving.set(false);
              this.close();
            },
            error: () => this.isSaving.set(false),
          });
        }, 'image/png');
      })
      .catch(() => this.isSaving.set(false));
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load: ' + url));
      const sep = url.includes('?') ? '&' : '?';
      img.src = url + sep + '_t=' + Date.now();
    });
  }

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
    const idx = this.activeTouches.findIndex((t) => t.pointerId === event.pointerId);
    if (idx >= 0) this.activeTouches[idx] = event;
    if (this.activeTouches.length === 2) {
      const dist = this.getTouchDist();
      const newScale = this.pinchStartScale * (dist / this.pinchStartDist);
      this.scale.set(Math.max(0.7, Math.min(2, newScale)));
    }
  }

  onMultiPointerUp(event: PointerEvent) {
    this.activeTouches = this.activeTouches.filter((t) => t.pointerId !== event.pointerId);
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
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

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
