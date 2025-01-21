import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

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

  items = [
    { routeLink: 'dashboard', icon: 'fal fa-home', label: 'Dashboard' },
    { routeLink: 'home', icon: 'fal fa-box-open', label: 'Home' },
    { routeLink: 'students', icon: 'fal fa-user-graduate', label: 'Students' },
    { routeLink: 'volunteers', icon: 'fal fa-hands-helping', label: 'Volunteers' },
    { routeLink: 'bill', icon: 'fal fa-file-invoice-dollar', label: 'Bill' },
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkMobile();
  }

  ngOnInit(): void {
    this.checkMobile();
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed);
  }

  closeSidenav(): void {
    this.changeIsLeftSidebarCollapsed.emit(true);
  }

  trackByFn(index: number, item: any): number {
    return index; // or item.id if you have unique ids
  }
}
