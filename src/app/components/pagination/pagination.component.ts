import {
  Component,
  effect,
  input,
  Input,
  model,
  OnInit,
  output,
} from '@angular/core';


@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
  className = input<string>('');
  totalPages = input<number>(1);

  pageSize = model<number>(10);
  pageIndex = model<number>(0);
  paginationChanged = output<void>();

  private _initialized = false;

  constructor() {
    effect(() => {
      this.pageIndex();
      this.pageSize();

      if (!this._initialized) {
        this._initialized = true;
        return; // skip initial run
      }

      this.paginationChanged.emit();
    });
  }
  ngOnInit() {}

  setPageIndex(index: number) {
    this.pageIndex.set(index);
  }

  getVisiblePages(): number[] {
    return Array.from(
      { length: this.totalPages() },
      (_, index) => index,
    ).filter(
      (index) => index >= this.pageIndex() - 4 && index <= this.pageIndex() + 4,
    );
  }

  isFirstButtonDisabled(): boolean {
    return this.pageIndex() <= 0;
  }

  isLastButtonDisabled(): boolean {
    return this.totalPages() <= this.pageIndex() + 1;
  }

  goToFirstPage() {
    this.setPageIndex(0);
  }

  goToLastPage() {
    this.setPageIndex(this.totalPages() - 1);
  }

  isCurrentPage(index: number): boolean {
    return index === this.pageIndex();
  }
}
