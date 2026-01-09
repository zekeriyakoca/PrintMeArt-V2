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
  imports: [FormsModule],
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
      label: 'Copyright Infringement',
      description: 'Unauthorized use of copyrighted content',
    },
    {
      value: 'Trademark',
      label: 'Trademark Violation',
      description: 'Unauthorized use of trademarks or logos',
    },
    {
      value: 'Privacy',
      label: 'Privacy Concern',
      description: 'Personal information or privacy issues',
    },
    {
      value: 'Other',
      label: 'Other Legal Issue',
      description: 'Other compliance or legal matters',
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
      newErrors.name = 'Name is required';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!this.isValidEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.issueType) {
      newErrors.issueType = 'Please select an issue type';
    }

    if (!data.details.trim()) {
      newErrors.details = 'Please describe the issue';
    } else if (data.details.trim().length < 20) {
      newErrors.details = 'Please provide more detail (at least 20 characters)';
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
        'Please fill in all required fields correctly.',
      );
      return;
    }

    this.isSubmitting.set(true);

    this.contactService.submitComplianceReport(this.formData()).subscribe({
      next: () => {
        this.submitted.set(true);
        this.isSubmitting.set(false);
        this.toastService.success(
          "Your report has been submitted. We'll review it promptly.",
        );
        this.resetForm();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Compliance form submission error:', err);
        this.toastService.error(
          'Something went wrong. Please try again or email us at legal@printmeart.nl',
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
