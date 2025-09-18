import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  @Input() className: string = '';

  // You'll need to inject your filter service or pass these as inputs
  pageIndex: number = 0;
  totalPages: number = 10; // Replace with actual value from service

  ngOnInit() {
    // Initialize pagination state from your service
  }

  setPageIndex(index: number) {
    this.pageIndex = index;
    // Update your filter service here
    // this.filterService.setPageIndex(index);
  }

  getVisiblePages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index).filter(
      (index) => index >= this.pageIndex - 4 && index <= this.pageIndex + 4,
    );
  }

  isFirstButtonDisabled(): boolean {
    return this.pageIndex <= 0;
  }

  isLastButtonDisabled(): boolean {
    return this.totalPages <= this.pageIndex + 1;
  }

  goToFirstPage() {
    this.setPageIndex(0);
  }

  goToLastPage() {
    this.setPageIndex(this.totalPages - 1);
  }

  isCurrentPage(index: number): boolean {
    return index === this.pageIndex;
  }
}
