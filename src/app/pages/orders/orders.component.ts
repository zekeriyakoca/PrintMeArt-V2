import {
  Component,
  inject,
  signal,
  OnInit,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import {
  OrdersService,
  OrderDto,
  OrderStatusGroup,
  BackendOrderStatus,
  CanCancelResponse,
} from '../../services/orders/orders.service';
import { ToastService } from '../../services/toast/toast.service';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

interface TabConfig {
  key: OrderStatusGroup;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, IconComponent, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  private readonly auth = inject(AuthenticationService);
  private readonly ordersService = inject(OrdersService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  // State
  orders = signal<OrderDto[]>([]);
  isLoading = signal(true);
  activeTab = signal<OrderStatusGroup>('all');
  searchTerm = signal('');

  // Pagination
  pageIndex = signal(0);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);

  // Order detail modal
  selectedOrder = signal<OrderDto | null>(null);
  isLoadingDetail = signal(false);
  canCancelInfo = signal<CanCancelResponse | null>(null);

  // Cancel modal
  showCancelModal = signal(false);
  cancelReason = signal('');
  isCancelling = signal(false);

  // Search debounce
  private searchSubject = new Subject<string>();

  readonly tabs: TabConfig[] = [
    { key: 'all', label: 'All Orders', icon: 'order' },
    { key: 'pending', label: 'Pending', icon: 'clock' },
    { key: 'processing', label: 'Processing', icon: 'refresh' },
    { key: 'shipped', label: 'Shipped', icon: 'truck' },
    { key: 'delivered', label: 'Delivered', icon: 'check' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close' },
  ];

  // Computed
  hasOrders = computed(() => this.orders().length > 0);
  hasPrevPage = computed(() => this.pageIndex() > 0);
  hasNextPage = computed(() => this.pageIndex() < this.totalPages() - 1);
  showPagination = computed(() => this.totalPages() > 1);

  currentPageRange = computed(() => {
    const start = this.pageIndex() * this.pageSize() + 1;
    const end = Math.min(
      (this.pageIndex() + 1) * this.pageSize(),
      this.totalCount(),
    );
    return `${start}-${end} of ${this.totalCount()}`;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check authentication
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/orders' },
      });
      return;
    }

    // Setup search debounce
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.pageIndex.set(0);
        this.loadOrders();
      });

    // Read initial tab from query params
    const statusParam = this.route.snapshot.queryParamMap.get('status');
    if (statusParam && this.isValidTab(statusParam)) {
      this.activeTab.set(statusParam as OrderStatusGroup);
    }

    this.loadOrders();
  }

  private isValidTab(tab: string): boolean {
    return this.tabs.some((t) => t.key === tab);
  }

  loadOrders(): void {
    this.isLoading.set(true);

    this.ordersService
      .getOrders({
        status: this.activeTab(),
        pageIndex: this.pageIndex(),
        pageSize: this.pageSize(),
        searchTerm: this.searchTerm() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.orders.set(response.data);
          this.totalCount.set(response.totalCount);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load orders:', err);
          this.toastService.error('Failed to load orders. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  setTab(tab: OrderStatusGroup): void {
    if (this.activeTab() === tab) return;

    this.activeTab.set(tab);
    this.pageIndex.set(0);

    // Update URL without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: tab === 'all' ? {} : { status: tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    this.loadOrders();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.pageIndex.set(0);
    this.loadOrders();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.pageIndex.set(page);
    this.loadOrders();
  }

  prevPage(): void {
    this.goToPage(this.pageIndex() - 1);
  }

  nextPage(): void {
    this.goToPage(this.pageIndex() + 1);
  }

  // Order Detail
  viewOrder(order: OrderDto): void {
    this.selectedOrder.set(order);
    this.isLoadingDetail.set(true);
    this.canCancelInfo.set(null);

    // Load full order details and cancel eligibility
    this.ordersService.getOrder(order.id).subscribe({
      next: (fullOrder) => {
        this.selectedOrder.set(fullOrder);
        this.isLoadingDetail.set(false);

        // Check if cancellable
        if (this.ordersService.isCancellable(fullOrder.status)) {
          this.ordersService.canCancelOrder(fullOrder.id).subscribe({
            next: (canCancel) => this.canCancelInfo.set(canCancel),
            error: () => this.canCancelInfo.set({ canCancel: false }),
          });
        }
      },
      error: () => {
        this.isLoadingDetail.set(false);
        this.toastService.error('Failed to load order details.');
      },
    });
  }

  closeOrderDetail(): void {
    this.selectedOrder.set(null);
    this.canCancelInfo.set(null);
  }

  // Cancel flow
  openCancelModal(): void {
    this.showCancelModal.set(true);
    this.cancelReason.set('');
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.cancelReason.set('');
  }

  confirmCancel(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.isCancelling.set(true);

    this.ordersService
      .cancelOrder(order.id, this.cancelReason() || undefined)
      .subscribe({
        next: () => {
          this.toastService.success('Order cancelled successfully.');
          this.isCancelling.set(false);
          this.closeCancelModal();
          this.closeOrderDetail();
          this.loadOrders(); // Refresh the list
        },
        error: (err) => {
          console.error('Cancel failed:', err);
          this.toastService.error('Failed to cancel order. Please try again.');
          this.isCancelling.set(false);
        },
      });
  }

  // Helpers
  getStatusColor(status: BackendOrderStatus): string {
    return this.ordersService.getStatusColor(status);
  }

  formatStatus(status: BackendOrderStatus): string {
    return this.ordersService.formatStatusDisplay(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  getTabCount(tab: OrderStatusGroup): number {
    // This could be enhanced to show counts from the API
    return 0;
  }

  canShowCancelButton(): boolean {
    const order = this.selectedOrder();
    if (!order) return false;
    return this.ordersService.isCancellable(order.status);
  }

  canCancelOrder(): boolean {
    return this.canCancelInfo()?.canCancel ?? false;
  }
}
