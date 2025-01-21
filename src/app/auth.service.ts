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

  login(username: string, password: string): Observable<boolean> {
    console.log('Attempting login with:', username, password);
    return this.volunteersService.getVolunteerByName(username).pipe(
      map((volunteer: Volunteer) => {
        console.log('Fetched volunteer:', volunteer);
        if (volunteer && volunteer.phone_number === password) {
          this.loggedIn = true;
          this.role = 'subadmin';
          this.currentUser = volunteer;
          console.log('Login successful:', username);
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

  createVolunteerCredentials(username: string, password: string): void {
    this.users[username] = { password: password, role: 'subadmin' };
    console.log('Volunteer credentials created:', username, password);
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getRole(): string | null {
    return this.role;
  }

  getCurrentUser(): Volunteer | null {
    return this.currentUser;
  }

  logout(): void {
    this.loggedIn = false;
    this.role = null;
    this.currentUser = null;
  }
}