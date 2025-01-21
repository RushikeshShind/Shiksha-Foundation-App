import { Injectable } from '@angular/core';
import { VolunteersService, Volunteer } from './volunteers/volunteers.service'; // Import VolunteersService and Volunteer
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private role: string | null = null;
  private currentUser: Volunteer | null = null;
  private users: Record<string, { password: string, role: string }> = {
    'admin': { password: 'admin', role: 'admin' }
  };

  constructor(private volunteersService: VolunteersService) {}

  // Login method
  login(username: string, password: string): Observable<boolean> {
    console.log('Attempting login with:', username, password);
    if (this.users[username] && this.users[username].password === password) {
      this.loggedIn = true;
      this.role = this.users[username].role;
      this.currentUser = null; // Admin user is not a volunteer
      console.log('Login successful for admin:', username);
      return of(true);
    }

    return this.volunteersService.getVolunteerByName(username).pipe(
      map((volunteer: Volunteer) => {
        console.log('Fetched volunteer:', volunteer);
        if (volunteer && volunteer.phone_number === password) {
          this.loggedIn = true;
          this.role = 'subadmin';
          this.currentUser = volunteer;
          console.log('Login successful for volunteer:', username);
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

  // Method to create volunteer credentials
  createVolunteerCredentials(username: string, password: string): void {
    this.users[username] = { password: password, role: 'subadmin' };
    console.log('Volunteer credentials created:', username, password);
  }

  // Method to update or reset admin credentials
  setAdminCredentials(username: string, password: string): void {
    if (!username || !password) {
      console.error('Admin username or password cannot be empty.');
      return;
    }
    this.users['admin'] = { password, role: 'admin' };
    console.log('Admin credentials updated:', username, password);
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // Get the role of the logged-in user
  getRole(): string | null {
    return this.role;
  }

  // Get the current logged-in volunteer
  getCurrentUser(): Volunteer | null {
    return this.currentUser;
  }

  // Logout the current user
  logout(): void {
    this.loggedIn = false;
    this.role = null;
    this.currentUser = null;
    console.log('User logged out.');
  }
}
