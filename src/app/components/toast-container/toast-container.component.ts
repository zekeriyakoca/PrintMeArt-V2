import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../services/toast/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div
      class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto relative overflow-hidden rounded-2xl shadow-2xl animate-slide-in"
          [class]="getToastClasses(toast)"
          role="alert"
        >
          <!-- Progress bar -->
          <div
            class="absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-progress"
            [class]="getProgressClass(toast)"
          ></div>

          <div class="flex items-start gap-3 p-4 pl-8">
            <!-- Message content -->
            <div class="flex-1 pt-1">
              <p class="text-sm font-semibold" [class]="getTitleClass(toast)">
                {{ getTitle(toast) }}
              </p>
              <p class="text-sm opacity-90 mt-0.5">{{ toast.message }}</p>
            </div>

            <!-- Dismiss button -->
            <button
              type="button"
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 transition-all"
              (click)="dismiss(toast.id)"
              aria-label="Dismiss"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateX(100%) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      @keyframes progress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }

      .animate-slide-in {
        animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .animate-progress {
        animation: progress 5s linear forwards;
      }
    `,
  ],
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  getToastClasses(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 text-emerald-900';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 text-red-900';
      case 'warning':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 text-amber-900';
      default:
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 text-blue-900';
    }
  }

  getIconBgClass(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-100 text-emerald-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  }

  getProgressClass(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  }

  getTitleClass(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'text-emerald-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-amber-800';
      default:
        return 'text-blue-800';
    }
  }

  getTitle(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Oops!';
      case 'warning':
        return 'Warning';
      default:
        return 'Info';
    }
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
