import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-custom-design-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-design-upload.component.html',
  styleUrl: './custom-design-upload.component.scss',
})
export class CustomDesignUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Output() imageUrlSelected = new EventEmitter<string | null>();

  selectedFile = signal<File | null>(null);
  isDragging = signal(false);

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
      alert('File size must be less than 50MB');
      return;
    }

    this.selectedFile.set(file);

    const objectUrl = URL.createObjectURL(file);
    this.imageUrlSelected.emit(objectUrl);
  }
}
