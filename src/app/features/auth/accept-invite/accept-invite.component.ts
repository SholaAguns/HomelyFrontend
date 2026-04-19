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
  templateUrl: './accept-invite.component.html',
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
