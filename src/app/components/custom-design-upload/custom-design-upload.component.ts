import {
  Component,
  ElementRef,
  output,
  ViewChild,
  signal,
  inject,
} from '@angular/core';
import { IconComponent } from '../shared/icon/icon.component';
import { AppInsightsService } from '../../services/telemetry/app-insights.service';
import { CommonApiService } from '../../services/api/common-api.service';

@Component({
  selector: 'app-custom-design-upload',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './custom-design-upload.component.html',
  styleUrl: './custom-design-upload.component.scss',
})
export class CustomDesignUploadComponent {
  private readonly telemetry = inject(AppInsightsService);
  private readonly commonApiService = inject(CommonApiService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** Emits local blob URL for immediate preview */
  imageUrlSelected = output<string | null>();
  /** Emits the permanent uploaded URL when upload completes */
  imageUploaded = output<string>();
  /** Emits upload error message if upload fails */
  uploadError = output<string>();

  selectedFile = signal<File | null>(null);
  isDragging = signal(false);
  isUploading = signal(false);

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
    const sizeMb = file.size / (1024 * 1024);

    if (sizeMb > 50) {
      this.telemetry.trackEvent('custom_upload_rejected', {
        reason: 'too_large',
        sizeMb,
        mimeType: file.type,
      });
      alert('File size must be less than 50MB');
      return;
    }

    this.telemetry.trackEvent('custom_upload_selected', {
      sizeMb,
      mimeType: file.type,
    });

    this.selectedFile.set(file);
    this.imageUrlSelected.emit(URL.createObjectURL(file));
    this.uploadToBackend(file, sizeMb);
  }

  private uploadToBackend(file: File, sizeMb: number): void {
    this.isUploading.set(true);

    this.commonApiService.uploadImage(file).subscribe({
      next: (uploadedUrl) => {
        this.isUploading.set(false);
        this.telemetry.trackEvent('custom_upload_success', {
          uploadedUrl,
          sizeMb,
        });
        this.imageUploaded.emit(uploadedUrl);
      },
      error: (error) => {
        this.isUploading.set(false);
        this.telemetry.trackException(error, {
          operation: 'uploadCustomImage',
          sizeMb,
        });
        this.uploadError.emit('Failed to upload image. Please try again.');
      },
    });
  }
}
