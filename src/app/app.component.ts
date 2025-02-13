import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { MainComponent } from './main/main.component';
import { HeaderComponent } from './header/header.component'; // Import HeaderComponent

// Import Capacitor's Filesystem Plugin
import { Filesystem, Directory } from '@capacitor/filesystem';

// Import Capacitor's Core for platform check
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LeftSidebarComponent, MainComponent, HeaderComponent], // Include HeaderComponent
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  screenWidth = signal<number>(window.innerWidth);
  showSidebar = signal<boolean>(true);
  showHeader = signal<boolean>(true); // Signal to manage header visibility
  pageTitle = signal<string>(''); // Signal to manage dynamic page titles

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
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

    // Request permission on Android for file access
    if (Capacitor.isNativePlatform()) {
      this.requestStoragePermission();
    }
  }

  // Request storage permission for Android/iOS devices
  async requestStoragePermission() {
    if (Capacitor.isNativePlatform()) {
      try {
        const permissionStatus = await Filesystem.requestPermissions();
        
        if (permissionStatus.publicStorage === 'granted') {
          console.log('Storage permission granted');
        } else {
          alert('Storage permission is required to download the PDF.');
        }
      } catch (error) {
        console.error('Permission request failed', error);
      }
    }
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
    this.pageTitle.set(routeTitles[route] || 'Page Title'); // Default to 'Page Title' if route not found
  }
}
