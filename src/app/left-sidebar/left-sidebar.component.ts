import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener, TrackByFunction } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.css'],
})
export class LeftSidebarComponent {
  @Input() isLeftSidebarCollapsed: boolean = false;
  @Output() changeIsLeftSidebarCollapsed = new EventEmitter<boolean>();

  isMobile: boolean = false;
  activeRoute: string = '';

  items = [
    { routeLink: 'home', icon: 'fal fa-home', label: 'Home' },
    { routeLink: 'students', icon: 'fal fa-user-graduate', label: 'Students' },
    { routeLink: 'volunteers', icon: 'fal fa-hands-helping', label: 'Volunteers' },
    { routeLink: 'bill', icon: 'fal fa-file-invoice-dollar', label: 'Bill' },
  ];

  trackByFn(index: number, item: { routeLink: string; icon: string; label: string }) {
    return item.routeLink; // Track by the routeLink or any unique identifier
  }

  constructor(private router: Router) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkMobile();
  }

  ngOnInit(): void {
    this.checkMobile();
    this.activeRoute = this.router.url; // Get initial active route

    // Listen for route changes
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url;
    });
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed);
  }

  closeSidenav(): void {
    if (this.isMobile) {
      this.changeIsLeftSidebarCollapsed.emit(true);  // Close sidebar on mobile after clicking a link
    }
  }

  isActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }
}
