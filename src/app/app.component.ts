import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { MainComponent } from './main/main.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LeftSidebarComponent, MainComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  screenWidth = signal<number>(window.innerWidth);
  showSidebar = signal<boolean>(true);
  showHeader = signal<boolean>(true);
  pageTitle = signal<string>('');

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const excludedRoutes = ['/login', '/splash'];
        this.showSidebar.set(!excludedRoutes.includes(event.urlAfterRedirects));
        this.showHeader.set(!excludedRoutes.includes(event.urlAfterRedirects));
        this.setPageTitle(event.urlAfterRedirects);
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.screenWidth.set(window.innerWidth);
    if (this.screenWidth() < 768) {
      this.isLeftSidebarCollapsed.set(true);
    }
  }

  ngOnInit(): void {
    this.isLeftSidebarCollapsed.set(this.screenWidth() < 768);

    // ✅ Check if the app is stuck on splash and navigate to the correct page
    setTimeout(() => {
      if (this.router.url === '/splash') {
        this.router.navigate(['/home']); // Change to your default route
      }
    }, 2000); // Adjust timeout as needed
  }

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  private setPageTitle(route: string): void {
    const routeTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/students': 'Students',
      '/profile': 'Profile',
    };
    this.pageTitle.set(routeTitles[route] || 'Page Title');
  }
}
