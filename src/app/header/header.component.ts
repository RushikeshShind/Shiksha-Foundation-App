import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
toggleDropdown() {
throw new Error('Method not implemented.');
}
  @Input() screenWidth = signal<number>(window.innerWidth);
  @Input() pageTitle = signal<string>(''); // Page title passed from parent

  dropdownOpen = signal<boolean>(false); // Dropdown visibility state

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateBack(): void {
    this.router.navigate(['/home']); // Navigate back to home
  }

  openProfile(): void {
    this.dropdownOpen.set(!this.dropdownOpen()); // Toggle dropdown
  }

  logout(): void {
    localStorage.clear(); // Clear stored authentication data
    this.router.navigate(['/login']); // Redirect to login page
  }
}
