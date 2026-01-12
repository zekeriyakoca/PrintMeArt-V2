import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';
import { AppInsightsService } from '../../services/telemetry/app-insights.service';
import { CommonApiService } from '../../services/api/common-api.service';

export interface CustomImageUploadResult {
  /** Local blob URL for preview */
  previewUrl: string;
  /** Permanent URL from backend storage (null while uploading) */
  uploadedUrl: string | null;
}

@Component({
  selector: 'app-custom-design-upload',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './custom-design-upload.component.html',
  styleUrl: './custom-design-upload.component.scss',
})
export class CustomDesignUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** Emits local blob URL for immediate preview */
  @Output() imageUrlSelected = new EventEmitter<string | null>();
  /** Emits the permanent uploaded URL when upload completes */
  @Output() imageUploaded = new EventEmitter<string>();
  /** Emits upload error if upload fails */
  @Output() uploadError = new EventEmitter<string>();

  selectedFile = signal<File | null>(null);
  isDragging = signal(false);
  isUploading = signal(false);

  constructor(
    private telemetry: AppInsightsService,
    private commonApiService: CommonApiService,
  ) {}

  openFileDialog(): void {
    this.fileInput?.nativeElement?.click();
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.processFile(file);
      } else {
        this.telemetry.trackEvent('custom_upload_rejected', {
          reason: 'not_image',
          mimeType: file.type,
        });
      }
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  reset(): void {
    this.selectedFile.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private processFile(file: File): void {
    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      this.telemetry.trackEvent('custom_upload_rejected', {
        reason: 'too_large',
        sizeMb: Math.round((file.size / (1024 * 1024)) * 100) / 100,
        mimeType: file.type,
      });
      alert('File size must be less than 50MB');
      return;
    }

    this.telemetry.trackEvent('custom_upload_selected', {
      sizeMb: Math.round((file.size / (1024 * 1024)) * 100) / 100,
      mimeType: file.type,
    });

    this.selectedFile.set(file);

    // Emit local blob URL immediately for preview
    const objectUrl = URL.createObjectURL(file);
    this.imageUrlSelected.emit(objectUrl);

    // Upload to backend to get permanent URL
    this.uploadToBackend(file);
  }

  private uploadToBackend(file: File): void {
    this.isUploading.set(true);

    this.commonApiService.uploadImage(file).subscribe({
      next: (uploadedUrl) => {
        this.isUploading.set(false);
        this.telemetry.trackEvent('custom_upload_success', {
          uploadedUrl,
          sizeMb: Math.round((file.size / (1024 * 1024)) * 100) / 100,
        });
        this.imageUploaded.emit(uploadedUrl);
      },
      error: (error) => {
        this.isUploading.set(false);
        this.telemetry.trackException(error, {
          operation: 'uploadCustomImage',
          sizeMb: Math.round((file.size / (1024 * 1024)) * 100) / 100,
        });
        this.uploadError.emit('Failed to upload image. Please try again.');
      },
    });
  }
}
