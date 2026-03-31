import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectStore } from '../../store/project.store';
import {
  ProgressIndicatorComponent,
  WizardStep,
} from '../../../../shared/components/progress-indicator/progress-indicator.component';
import { Step1BasicInfoComponent } from './steps/step1-basic-info.component';
import { Step2ContextOptionsComponent } from './steps/step2-context-options.component';
import { Step3CollaborationComponent } from './steps/step3-collaboration.component';
import {
  CreateProjectDto,
  CreateContextOptionsDto,
} from '../../../../shared/models/project-models';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [
    CommonModule,
    ProgressIndicatorComponent,
    Step1BasicInfoComponent,
    Step2ContextOptionsComponent,
    Step3CollaborationComponent,
  ],
  templateUrl: './project-create.component.html',
  styleUrl: './project-create.component.css',
})
export class ProjectCreateComponent {
  private router = inject(Router);
  private store = inject(ProjectStore);

  currentStep = signal(0);
  submitting = signal(false);
  error = signal<string | null>(null);

  projectData = signal<CreateProjectDto>({
    title: '',
    description: '',
    viewers: [],
    contributors: [],
  });

  contextOptionsData = signal<CreateContextOptionsDto | null>(null);

  steps: WizardStep[] = [
    { label: 'Basic Info', completed: false },
    { label: 'Context Options', completed: false },
    { label: 'Collaboration', completed: false },
  ];

  onStep1Complete(data: { title: string; description: string }) {
    this.projectData.update((current) => ({ ...current, ...data }));
    this.steps[0].completed = true;
    this.currentStep.set(1);
  }

  onStep2Complete(data: CreateContextOptionsDto | null) {
    this.contextOptionsData.set(data);
    this.steps[1].completed = true;
    this.currentStep.set(2);
  }

  onStep2Skip() {
    this.contextOptionsData.set(null);
    this.steps[1].completed = true;
    this.currentStep.set(2);
  }

  onStep3Complete(data: { viewers: string[]; contributors: string[] }) {
    this.projectData.update((current) => ({ ...current, ...data }));
    this.steps[2].completed = true;
    this.submit();
  }

  onStep3Skip() {
    this.steps[2].completed = true;
    this.submit();
  }

  back() {
    if (this.currentStep() > 0) {
      this.currentStep.update((step) => step - 1);
    }
  }

  submit() {
    this.submitting.set(true);
    this.error.set(null);

    this.store.create(this.projectData());

    const checkCreation = setInterval(() => {
      if (!this.store.loading()) {
        clearInterval(checkCreation);

        if (this.store.error()) {
          this.submitting.set(false);
          this.error.set(this.store.error());
        } else {
          const createdProject = this.store.all().find((p) => p.title === this.projectData().title);

          if (createdProject) {
            if (this.contextOptionsData()) {
              this.store.setContextOptions({
                uuid: createdProject.uuid,
                data: this.contextOptionsData()!,
              });

              const checkContextOptions = setInterval(() => {
                if (!this.store.loading()) {
                  clearInterval(checkContextOptions);
                  this.submitting.set(false);
                  this.router.navigate(['/projects', createdProject.uuid]);
                }
              }, 100);
            } else {
              this.submitting.set(false);
              this.router.navigate(['/projects', createdProject.uuid]);
            }
          }
        }
      }
    }, 100);
  }
}
