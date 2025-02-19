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

  login(username: string, password: string): Observable<boolean> {
    console.log('Attempting login with:', username, password);
  
    // Check if the username exists in the predefined users list (admin)
    if (this.users[username] && this.users[username].password === password) {
      this.loggedIn = true;
      this.role = this.users[username].role;
      localStorage.setItem('userRole', this.role);
      localStorage.setItem('currentUser', JSON.stringify({ name: username, role: this.role }));
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
          localStorage.setItem('userRole', this.role);
          localStorage.setItem('currentUser', JSON.stringify(volunteer));
          console.log('Volunteer login successful, role assigned:', this.role);
          return true;
        } else {
          console.log('Login failed: Invalid credentials for volunteer', username);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error fetching volunteer data:', error);
        if (error.status === 404) {
          console.log('Volunteer not found:', username);
        } else {
          console.error('Unexpected error:', error);
        }
        return of(false);
      })
    );
  }

  // ✅ Get logged-in user details (for auto-filling forms)
  getLoggedInUser(): Volunteer | null {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }
  getCurrentUser(): any {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) return null;
    
    try {
      const user = JSON.parse(storedUser);
      return {
        name: user?.name || '',
        role: user?.role || 'volunteer'
      };
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  // ✅ Get role of the logged-in user
  getRole(): string {
    const user = this.getCurrentUser();
    return user?.role?.toLowerCase() || '';
  }
  getUserName(): string {
    const user = this.getCurrentUser();
    return user?.name?.trim() || '';
  }


  // ✅ Check if user is logged in
  isLoggedIn(): boolean {
    return this.loggedIn || localStorage.getItem('currentUser') !== null;
  }

  // ✅ Logout user and clear session
  logout(): void {
    this.loggedIn = false;
    this.role = null;
    this.currentUser = null;
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    console.log('User logged out successfully');
  }

  // ✅ Placeholder method to create volunteer credentials (for logging)
  createVolunteerCredentials(name: string, phoneNumber: string): void {
    console.log(`Credentials created for Volunteer: Name - ${name}, Phone Number - ${phoneNumber}`);
  }
}
