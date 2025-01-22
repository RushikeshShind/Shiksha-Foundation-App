import { Injectable } from '@angular/core';
import { VolunteersService, Volunteer } from './volunteers/volunteers.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private role: string | null = null;
  private currentUser: Volunteer | null = null;

  // Admin credentials
  private users: Record<string, { password: string, role: string }> = {
    'admin': { password: '123', role: 'admin' }, // Admin credentials
  };

  constructor(private volunteersService: VolunteersService) {}

  // Login logic for admin and volunteer
  login(username: string, password: string): Observable<boolean> {
    console.log('Attempting login with:', username, password);
  
    // Check if the username exists in the predefined users list (admin)
    if (this.users[username] && this.users[username].password === password) {
      this.loggedIn = true;
      this.role = this.users[username].role;
      localStorage.setItem('userRole', this.role); // Save role in localStorage
      console.log('Admin login successful, role assigned:', this.role);
      return of(true);
    }
  
    // If not admin, check if it's a volunteer
    return this.volunteersService.getVolunteerByName(username).pipe(
      map((volunteer: Volunteer) => {
        if (volunteer && volunteer.phone_number === password) {
          this.loggedIn = true;
          this.role = 'subadmin';
          this.currentUser = volunteer;
          localStorage.setItem('userRole', this.role); // Save role
          localStorage.setItem('currentUser', JSON.stringify(volunteer)); // Save user details
          console.log('Volunteer login successful, role assigned:', this.role);
          return true;
        } else {
          console.log('Login failed:', username);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error fetching volunteer data:', error);
        return of(false);
      })
    );
  }
  
  getRole(): string | null {
    if (!this.role) {
      this.role = localStorage.getItem('userRole'); // Retrieve role from localStorage
    }
    return this.role;
  }
  
  isLoggedIn(): boolean {
    return this.loggedIn;
  }
  
  logout(): void {
    this.loggedIn = false;
    this.role = null;
    this.currentUser = null;
    localStorage.removeItem('userRole'); // Clear role
    localStorage.removeItem('currentUser'); // Clear user details
  }
  
  // Optional: Placeholder method to create volunteer credentials (for logging)
  createVolunteerCredentials(name: string, phoneNumber: string): void {
    console.log(`Credentials created for Volunteer: Name - ${name}, Phone Number - ${phoneNumber}`);
  }
}
