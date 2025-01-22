import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() screenWidth = signal<number>(window.innerWidth);
  @Input() pageTitle = signal<string>(''); // Page title passed from parent

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateBack(): void {
    this.router.navigate(['/home']); // Default navigation for the back button
  }

  openProfile(): void {
    this.router.navigate(['/profile']); // Navigate to the profile page
  }
}
