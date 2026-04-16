import { Component, Output, EventEmitter, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SharingService } from '../../../../../core/services/sharing-service/sharing.service';
import { UserSearchResult } from '../../../../../shared/models/project-models';

interface CollabEntry {
  user: UserSearchResult;
  role: 'viewer' | 'contributor';
}

@Component({
  selector: 'app-step3-collaboration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="mb-2 text-xl font-semibold">Collaboration</h2>
      <p class="mb-6 text-sm text-gray-600">
        Add people who can view or contribute to this project (optional)
      </p>

      <form (ngSubmit)="onSubmit()">
        <div class="mb-6">
          <label class="mb-1 block text-sm font-medium">Add collaborators</label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                type="text"
                [ngModel]="searchQuery"
                (ngModelChange)="onSearchInput($event)"
                name="searchQuery"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Search by name or email..."
                autocomplete="off"
              />
              @if (searchResults.length > 0) {
                <div
                  class="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                  @for (result of searchResults; track result.email) {
                    <button
                      type="button"
                      (click)="selectUser(result)"
                      class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {{ result.first_name }} {{ result.last_name }}
                      <span class="text-gray-400">({{ result.email }})</span>
                    </button>
                  }
                </div>
              }
            </div>
            <select
              [(ngModel)]="pendingRole"
              name="pendingRole"
              class="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none"
            >
              <option value="viewer">Viewer</option>
              <option value="contributor">Contributor</option>
            </select>
            <button
              type="button"
              (click)="addPending()"
              [disabled]="!selectedUser"
              class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              Add
            </button>
          </div>

          @if (selectedUser) {
            <div
              class="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800"
            >
              <span
                >{{ selectedUser.first_name }} {{ selectedUser.last_name }} ({{
                  selectedUser.email
                }})</span
              >
              <button
                type="button"
                (click)="clearSelected()"
                class="ml-auto text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          }
        </div>

        @if (entries.length > 0) {
          <div class="mb-6 space-y-2">
            <p class="text-sm font-medium text-gray-700">Added collaborators</p>
            @for (entry of entries; track entry.user.email) {
              <div
                class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <span
                  >{{ entry.user.first_name }} {{ entry.user.last_name }} ({{
                    entry.user.email
                  }})</span
                >
                <div class="flex items-center gap-3">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs capitalize"
                    [class.bg-blue-100]="entry.role === 'viewer'"
                    [class.text-blue-800]="entry.role === 'viewer'"
                    [class.bg-green-100]="entry.role === 'contributor'"
                    [class.text-green-800]="entry.role === 'contributor'"
                    >{{ entry.role }}</span
                  >
                  <button
                    type="button"
                    (click)="removeEntry(entry.user.email)"
                    class="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <div class="flex justify-between">
          <button
            type="button"
            (click)="onBack()"
            class="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back
          </button>

          <div class="space-x-3">
            <button
              type="button"
              (click)="onSkip()"
              class="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              type="submit"
              class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class Step3CollaborationComponent implements OnInit, OnDestroy {
  @Input() initialData: { viewers: string[]; contributors: string[] } = {
    viewers: [],
    contributors: [],
  };
  @Output() complete = new EventEmitter<{ viewers: string[]; contributors: string[] }>();
  @Output() skip = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  private sharingService = inject(SharingService);
  private searchInput$ = new Subject<string>();
  private sub!: Subscription;

  searchQuery = '';
  searchResults: UserSearchResult[] = [];
  selectedUser: UserSearchResult | null = null;
  pendingRole: 'viewer' | 'contributor' = 'viewer';
  entries: CollabEntry[] = [];

  ngOnInit() {
    this.sub = this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => (q.length >= 2 ? this.sharingService.searchUsers(q) : []))
      )
      .subscribe((results) => {
        const added = this.entries.map((e) => e.user.email);
        this.searchResults = results.filter((r) => !added.includes(r.email));
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onSearchInput(q: string) {
    this.searchQuery = q;
    this.selectedUser = null;
    if (!q) this.searchResults = [];
    this.searchInput$.next(q);
  }

  selectUser(user: UserSearchResult) {
    this.selectedUser = user;
    this.searchQuery = `${user.first_name} ${user.last_name} (${user.email})`;
    this.searchResults = [];
  }

  clearSelected() {
    this.selectedUser = null;
    this.searchQuery = '';
  }

  addPending() {
    if (!this.selectedUser) return;
    if (!this.entries.find((e) => e.user.email === this.selectedUser!.email)) {
      this.entries.push({ user: this.selectedUser, role: this.pendingRole });
    }
    this.clearSelected();
  }

  removeEntry(email: string) {
    this.entries = this.entries.filter((e) => e.user.email !== email);
  }

  onSubmit() {
    this.complete.emit({
      viewers: this.entries.filter((e) => e.role === 'viewer').map((e) => e.user.email),
      contributors: this.entries.filter((e) => e.role === 'contributor').map((e) => e.user.email),
    });
  }

  onSkip() {
    this.skip.emit();
  }

  onBack() {
    this.back.emit();
  }
}
