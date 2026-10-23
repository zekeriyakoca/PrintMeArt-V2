import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ContactService,
  ContactFormData,
} from '../../services/contact/contact.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);

  // Form model with two-way binding
  formData = signal<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderNumber: '',
  });

  // Form state
  isSubmitting = signal(false);
  submitted = signal(false);

  // Validation errors
  errors = signal<Partial<Record<keyof ContactFormData, string>>>({});

  // Subject options
  readonly subjectOptions = [
    { value: '', label: 'contact.topicSelect' },
    { value: 'Order Question', label: 'contact.topicOrder' },
    { value: 'Product Inquiry', label: 'contact.topicProduct' },
    { value: 'Custom Design', label: 'contact.topicCustom' },
    { value: 'Returns', label: 'contact.topicReturns' },
    { value: 'Shipping', label: 'contact.topicShipping' },
    { value: 'Other', label: 'contact.topicOther' },
  ];

  updateField<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K],
  ): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
    // Clear error when user starts typing
    this.errors.update((errs) => ({ ...errs, [field]: undefined }));
  }

  private validate(): boolean {
    const data = this.formData();
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!data.name.trim()) {
      newErrors.name = 'forms.nameRequired';
    }

    if (!data.email.trim()) {
      newErrors.email = 'forms.emailRequired';
    } else if (!this.isValidEmail(data.email)) {
      newErrors.email = 'forms.emailInvalid';
    }

    if (!data.subject) {
      newErrors.subject = 'forms.topicRequired';
    }

    if (!data.message.trim()) {
      newErrors.message = 'forms.messageRequired';
    } else if (data.message.trim().length < 10) {
      newErrors.message = 'forms.messageShort';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    if (!this.validate()) {
      this.toastService.warning(
        'forms.fillRequired',
      );
      return;
    }

    this.isSubmitting.set(true);

    this.contactService.submitContactForm(this.formData()).subscribe({
      next: () => {
        this.submitted.set(true);
        this.isSubmitting.set(false);
        this.toastService.success(
          'contact.sentToast',
        );
        this.resetForm();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Contact form submission error:', err);
        this.toastService.error(
          'contact.errorToast',
        );
      },
    });
  }

  private resetForm(): void {
    this.formData.set({
      name: '',
      email: '',
      subject: '',
      message: '',
      orderNumber: '',
    });
    this.errors.set({});
  }

  resetSubmitted(): void {
    this.submitted.set(false);
  }
}
