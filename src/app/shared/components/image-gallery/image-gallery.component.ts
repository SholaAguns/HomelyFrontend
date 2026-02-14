import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryImage {
  id: number;
  source_url: string;
  caption?: string;
}

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css',
})
export class ImageGalleryComponent {
  @Input() images: GalleryImage[] = [];
  @Input() initialIndex: number = 0;
  @Output() close = new EventEmitter<void>();

  currentIndex = signal(0);

  currentImage = computed(() => {
    const images = this.images;
    const index = this.currentIndex();
    return images[index] || null;
  });

  ngOnInit() {
    this.currentIndex.set(this.initialIndex);
  }

  nextImage() {
    if (this.currentIndex() < this.images.length - 1) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  previousImage() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  goToImage(index: number) {
    this.currentIndex.set(index);
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
