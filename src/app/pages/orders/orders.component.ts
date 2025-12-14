import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import {
  OrdersService,
  Order,
  OrderStatus,
} from '../../services/orders/orders.service';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  private readonly auth = inject(AuthenticationService);
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  selectedOrder = signal<Order | null>(null);
  activeFilter = signal<'all' | OrderStatus>('all');

  readonly filterOptions: ('all' | OrderStatus)[] = [
    'all',
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading.set(true);
    this.ordersService.getOrders().subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: 'all' | OrderStatus): void {
    this.activeFilter.set(filter);
  }

  filteredOrders(): Order[] {
    const filter = this.activeFilter();
    if (filter === 'all') return this.orders();
    return this.orders().filter((o) => o.status === filter);
  }

  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetail(): void {
    this.selectedOrder.set(null);
  }

  cancelOrder(orderId: string): void {
    this.ordersService.cancelOrder(orderId).subscribe(() => {
      this.orders.update((list) =>
        list.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o,
        ),
      );
      this.closeOrderDetail();
    });
  }

  reorder(orderId: string): void {
    this.ordersService.reorder(orderId).subscribe(() => {
      this.router.navigate(['/cart']);
    });
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-slate-100 text-slate-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}
