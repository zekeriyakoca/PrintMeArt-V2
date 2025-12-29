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

@Component({
  selector: 'app-custom-design-upload',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './custom-design-upload.component.html',
  styleUrl: './custom-design-upload.component.scss',
})
export class CustomDesignUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Output() imageUrlSelected = new EventEmitter<string | null>();

  selectedFile = signal<File | null>(null);
  isDragging = signal(false);

  constructor(private telemetry: AppInsightsService) {}

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

    const objectUrl = URL.createObjectURL(file);
    this.imageUrlSelected.emit(objectUrl);
  }
}
