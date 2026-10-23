import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ContactService,
  ComplianceFormData,
} from '../../services/contact/contact.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-compliance-form',
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: './compliance-form.component.html',
  styleUrl: './compliance-form.component.scss',
})
export class ComplianceFormComponent {
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);

  // Form model
  formData = signal<ComplianceFormData>({
    name: '',
    email: '',
    issueType: 'Copyright',
    details: '',
    reportedUrl: '',
    productId: '',
  });

  // Form state
  isSubmitting = signal(false);
  submitted = signal(false);

  // Validation errors
  errors = signal<Partial<Record<keyof ComplianceFormData, string>>>({});

  // Issue type options
  readonly issueTypeOptions: {
    value: ComplianceFormData['issueType'];
    label: string;
    description: string;
  }[] = [
    {
      value: 'Copyright',
      label: 'report.copyright',
      description: 'report.copyrightText',
    },
    {
      value: 'Trademark',
      label: 'report.trademark',
      description: 'report.trademarkText',
    },
    {
      value: 'Privacy',
      label: 'report.privacy',
      description: 'report.privacyText',
    },
    {
      value: 'Other',
      label: 'report.other',
      description: 'report.otherText',
    },
  ];

  updateField<K extends keyof ComplianceFormData>(
    field: K,
    value: ComplianceFormData[K],
  ): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
    this.errors.update((errs) => ({ ...errs, [field]: undefined }));
  }

  private validate(): boolean {
    const data = this.formData();
    const newErrors: Partial<Record<keyof ComplianceFormData, string>> = {};

    if (!data.name.trim()) {
      newErrors.name = 'forms.nameRequired';
    }

    if (!data.email.trim()) {
      newErrors.email = 'forms.emailRequired';
    } else if (!this.isValidEmail(data.email)) {
      newErrors.email = 'forms.emailInvalid';
    }

    if (!data.issueType) {
      newErrors.issueType = 'forms.issueRequired';
    }

    if (!data.details.trim()) {
      newErrors.details = 'forms.detailsRequired';
    } else if (data.details.trim().length < 20) {
      newErrors.details = 'forms.detailsShort';
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

    this.contactService.submitComplianceReport(this.formData()).subscribe({
      next: () => {
        this.submitted.set(true);
        this.isSubmitting.set(false);
        this.toastService.success(
          'report.sentToast',
        );
        this.resetForm();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Compliance form submission error:', err);
        this.toastService.error(
          'report.errorToast',
        );
      },
    });
  }

  private resetForm(): void {
    this.formData.set({
      name: '',
      email: '',
      issueType: 'Copyright',
      details: '',
      reportedUrl: '',
      productId: '',
    });
    this.errors.set({});
  }

  resetSubmitted(): void {
    this.submitted.set(false);
  }
}
