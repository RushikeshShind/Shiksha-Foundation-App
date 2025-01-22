import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { Observable } from 'rxjs'; // Import Observable

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule], // Use HttpClientModule here
})
export class LoginComponent {
  username = '';
  password = '';
  showSuccessMessage = false;
  showSparks = false;

  constructor(
    private authService: AuthService, 
    @Inject(Router) private router: Router  // Use @Inject here if necessary
  ) {}

  login(): void {
    this.authService.login(this.username, this.password).subscribe(
      (success: boolean) => {
        if (success) {
          console.log('Login successful. User role:', this.authService.getRole());
          this.showSparks = true;
          setTimeout(() => {
            this.showSparks = false;
            this.router.navigate(['/home']); // Navigate to home
          }, 2000);
        } else {
          alert('Invalid credentials');
        }
      },
      (error) => {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
      }
    );
  }
  
  closeNotification(): void {
    this.showSuccessMessage = false;
  }
}