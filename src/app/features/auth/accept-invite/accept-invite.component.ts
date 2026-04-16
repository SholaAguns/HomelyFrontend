import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { SharingService } from '../../../core/services/sharing-service/sharing.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import { InvitePreview } from '../../../shared/models/project-models';

const PENDING_INVITE_KEY = 'pending_invite_token';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div
        class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        @if (loading()) {
          <div class="flex flex-col items-center gap-4">
            <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p class="text-gray-500">Loading invitation...</p>
          </div>
        }

        @if (!loading() && errorCode()) {
          <div class="text-center">
            <div class="mb-4 flex justify-center">
              <svg
                class="h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {{ errorTitle() }}
            </h2>
            <p class="mb-6 text-sm text-gray-500">{{ errorMessage() }}</p>
            <button
              (click)="router.navigate(['/projects'])"
              class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Go to Projects
            </button>
          </div>
        }

        @if (!loading() && !errorCode() && preview()) {
          <div class="text-center">
            <div class="mb-4 flex justify-center">
              <div
                class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
              >
                <svg
                  class="h-7 w-7 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            <h2 class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
              You've been invited!
            </h2>
            <p class="mb-6 text-sm text-gray-500">
              <strong>{{ preview()!.invited_by_name }}</strong> has invited you to join
              <strong>{{ preview()!.project_title }}</strong> as a
              <span
                class="font-medium capitalize"
                [class.text-blue-600]="preview()!.role === 'viewer'"
                [class.text-green-600]="preview()!.role === 'contributor'"
              >
                {{ preview()!.role }} </span
              >.
            </p>

            <div class="mb-6 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm dark:bg-gray-700">
              <div class="mb-1 flex justify-between">
                <span class="text-gray-500">Project</span>
                <span class="font-medium text-gray-900 dark:text-white">{{
                  preview()!.project_title
                }}</span>
              </div>
              <div class="mb-1 flex justify-between">
                <span class="text-gray-500">Role</span>
                <span class="font-medium text-gray-900 capitalize dark:text-white">{{
                  preview()!.role
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Expires</span>
                <span class="text-gray-900 dark:text-white">{{
                  formatDate(preview()!.expires_at)
                }}</span>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                (click)="decline()"
                [disabled]="acting()"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
              >
                Decline
              </button>
              <button
                (click)="accept()"
                [disabled]="acting()"
                class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                @if (acting()) {
                  Accepting...
                } @else {
                  Accept
                }
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AcceptInviteComponent implements OnInit {
  protected readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private authStore = inject(AuthStore);
  private sharingService = inject(SharingService);
  private notificationService = inject(NotificationService);

  loading = signal(true);
  acting = signal(false);
  preview = signal<InvitePreview | null>(null);
  errorCode = signal<string | null>(null);
  errorTitle = signal('');
  errorMessage = signal('');

  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.setError('missing_token', 'Invalid link', 'This invite link is missing a token.');
      return;
    }

    if (!this.authStore.isAuthenticated()) {
      localStorage.setItem(PENDING_INVITE_KEY, this.token);
      this.router.navigate(['/login']);
      return;
    }

    this.sharingService.previewInvite(this.token).subscribe({
      next: (preview) => {
        this.preview.set(preview);
        this.loading.set(false);
      },
      error: (err) => {
        const code = err?.error?.error || 'unknown';
        if (code === 'invitation_already_used') {
          this.setError(
            code,
            'Invitation already used',
            'This invitation has already been accepted, declined, or revoked.'
          );
        } else {
          this.setError(
            code,
            'Invite link expired',
            'This invite link is no longer valid. Ask the project owner to send a new one.'
          );
        }
      },
    });
  }

  accept(): void {
    this.acting.set(true);
    this.sharingService.acceptInvite(this.token).subscribe({
      next: (res) => {
        this.notificationService.success('You have joined the project!');
        this.router.navigate(['/projects', res.project_uuid]);
      },
      error: (err) => {
        this.acting.set(false);
        const code = err?.error?.error || 'unknown';
        if (code === 'email_mismatch') {
          this.notificationService.error('This invitation was sent to a different email address.');
        } else {
          this.notificationService.error('Failed to accept invitation. Please try again.');
        }
      },
    });
  }

  decline(): void {
    this.acting.set(true);
    this.sharingService.declineInvite(this.token).subscribe({
      next: () => {
        this.notificationService.info('Invitation declined.');
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.acting.set(false);
        this.notificationService.error('Failed to decline invitation.');
      },
    });
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  private setError(code: string, title: string, message: string): void {
    this.errorCode.set(code);
    this.errorTitle.set(title);
    this.errorMessage.set(message);
    this.loading.set(false);
  }
}
