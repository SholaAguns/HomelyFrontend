import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {
  ProjectMembers,
  ProjectInvitation,
  InvitePreview,
  CreateInviteDto,
  AcceptInviteResponse,
  UserSearchResult,
} from '../../../shared/models/project-models';

@Injectable({ providedIn: 'root' })
export class SharingService {
  private api = inject(ApiService);

  getMembers(projectUuid: string): Observable<ProjectMembers> {
    return this.api.get<ProjectMembers>(`property/projects/${projectUuid}/members/`);
  }

  getInvitations(projectUuid: string): Observable<ProjectInvitation[]> {
    return this.api.get<ProjectInvitation[]>(`property/projects/${projectUuid}/invitations/`);
  }

  createInvite(projectUuid: string, dto: CreateInviteDto): Observable<ProjectInvitation> {
    return this.api.post<ProjectInvitation>(`property/projects/${projectUuid}/invite/`, dto);
  }

  revokeInvite(projectUuid: string, invitationUuid: string): Observable<void> {
    return this.api.delete<void>(`property/projects/${projectUuid}/invitations/${invitationUuid}/`);
  }

  removeMember(projectUuid: string, memberEmail: string): Observable<void> {
    return this.api.delete<void>(
      `property/projects/${projectUuid}/members/${encodeURIComponent(memberEmail)}/`
    );
  }

  leaveProject(projectUuid: string): Observable<void> {
    return this.api.post<void>(`property/projects/${projectUuid}/leave/`, {});
  }

  previewInvite(token: string): Observable<InvitePreview> {
    return this.api.get<InvitePreview>(
      `property/projects/preview-invite/?token=${encodeURIComponent(token)}`
    );
  }

  acceptInvite(token: string): Observable<AcceptInviteResponse> {
    return this.api.post<AcceptInviteResponse>('property/projects/accept-invite/', { token });
  }

  declineInvite(token: string): Observable<void> {
    return this.api.post<void>('property/projects/decline-invite/', { token });
  }

  getMyInviteToken(projectUuid: string): Observable<{ token: string }> {
    return this.api.get<{ token: string }>(
      `property/projects/my-invite/?project_uuid=${projectUuid}`
    );
  }

  searchUsers(q: string): Observable<UserSearchResult[]> {
    return this.api.get<UserSearchResult[]>(`accounts/users/search/?q=${encodeURIComponent(q)}`);
  }
}
