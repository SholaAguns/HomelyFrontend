import { Component, inject, OnInit, AfterViewInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ProjectStore } from '../../store/project.store';
import { ProjectStats } from '../../../../shared/models/project-models';

Chart.register(...registerables);

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.css',
})
export class ProjectDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly projectStore = inject(ProjectStore);

  projectUuid = '';
  charts: Chart[] = [];
  chartsInitialized = signal(false);

  ngOnInit(): void {
    this.projectUuid = this.route.snapshot.paramMap.get('uuid') || '';
    if (this.projectUuid) {
      this.projectStore.loadDetail(this.projectUuid);
      this.projectStore.loadStats(this.projectUuid);
    }
  }

  ngAfterViewInit(): void {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      effect(() => {
        const stats = this.projectStore.selectedStats();
        if (stats && !this.chartsInitialized()) {
          this.renderCharts(stats);
          this.chartsInitialized.set(true);
        }
      });
    }, 100);
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  goBack(): void {
    this.router.navigate(['/projects', this.projectUuid]);
  }

  private renderCharts(stats: ProjectStats): void {
    this.destroyCharts();

    // Price Distribution Chart
    const priceDistCtx = document.getElementById('priceDistChart') as HTMLCanvasElement;
    if (priceDistCtx && stats.price_distribution && stats.price_distribution.length > 0) {
      this.charts.push(
        new Chart(priceDistCtx, {
          type: 'bar',
          data: {
            labels: stats.price_distribution.map((d) => d.range),
            datasets: [
              {
                label: 'Properties',
                data: stats.price_distribution.map((d) => d.count),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Price Distribution',
                font: {
                  size: 16,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        })
      );
    }

    // Area Properties Chart
    const areaPropsCtx = document.getElementById('areaPropsChart') as HTMLCanvasElement;
    if (areaPropsCtx && stats.by_area && stats.by_area.length > 0) {
      this.charts.push(
        new Chart(areaPropsCtx, {
          type: 'bar',
          data: {
            labels: stats.by_area.map((a) => a.name),
            datasets: [
              {
                label: 'Properties',
                data: stats.by_area.map((a) => a.property_count),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Properties by Area',
                font: {
                  size: 16,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        })
      );
    }

    // Area Average Price Chart
    const areaPriceCtx = document.getElementById('areaPriceChart') as HTMLCanvasElement;
    if (areaPriceCtx && stats.by_area && stats.by_area.length > 0) {
      this.charts.push(
        new Chart(areaPriceCtx, {
          type: 'bar',
          data: {
            labels: stats.by_area.map((a) => a.name),
            datasets: [
              {
                label: 'Avg Price (£)',
                data: stats.by_area.map((a) => a.avg_price),
                backgroundColor: 'rgba(251, 146, 60, 0.8)',
                borderColor: 'rgba(251, 146, 60, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Average Price by Area',
                font: {
                  size: 16,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.parsed.y;
                    return value !== null ? `£${value.toLocaleString()}` : 'N/A';
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `£${Number(value).toLocaleString()}`,
                },
              },
            },
          },
        })
      );
    }

    // Property Types Pie Chart
    const propTypesCtx = document.getElementById('propTypesChart') as HTMLCanvasElement;
    if (propTypesCtx && stats.property_types && stats.property_types.length > 0) {
      this.charts.push(
        new Chart(propTypesCtx, {
          type: 'pie',
          data: {
            labels: stats.property_types.map((t) => t.type || 'Unknown'),
            datasets: [
              {
                data: stats.property_types.map((t) => t.count),
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(251, 146, 60, 0.8)',
                  'rgba(168, 85, 247, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                ],
                borderColor: [
                  'rgba(59, 130, 246, 1)',
                  'rgba(16, 185, 129, 1)',
                  'rgba(251, 146, 60, 1)',
                  'rgba(168, 85, 247, 1)',
                  'rgba(236, 72, 153, 1)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              title: {
                display: true,
                text: 'Property Types',
                font: {
                  size: 16,
                },
              },
            },
          },
        })
      );
    }

    // Ratings Distribution Chart
    const ratingsDistCtx = document.getElementById('ratingsDistChart') as HTMLCanvasElement;
    if (
      ratingsDistCtx &&
      stats.ratings?.rating_distribution &&
      stats.ratings.rating_distribution.length > 0
    ) {
      this.charts.push(
        new Chart(ratingsDistCtx, {
          type: 'bar',
          data: {
            labels: stats.ratings.rating_distribution.map((r) => r.range),
            datasets: [
              {
                label: 'Properties',
                data: stats.ratings.rating_distribution.map((r) => r.count),
                backgroundColor: 'rgba(168, 85, 247, 0.8)',
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: `Ratings Distribution (Avg: ${stats.ratings.avg_rating?.toFixed(1) || 'N/A'}, Total: ${stats.ratings.total_rated})`,
                font: {
                  size: 16,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        })
      );
    }
  }

  private destroyCharts(): void {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
  }
}
