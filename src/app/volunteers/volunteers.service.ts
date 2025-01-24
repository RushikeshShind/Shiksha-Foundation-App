import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap operator
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VolunteersService {
  private apiUrl = 'https://shiksha-backend.onrender.com/api/volunteers'; // Updated URL for GET requests
  private postUrl = 'https://shiksha-backend.onrender.com/api/volunteer'; // Updated URL for POST requests
  private deleteUrl = 'https://shiksha-backend.onrender.com/api/volunteer'; // Updated URL for DELETE requests
  private updateUrl = 'https://shiksha-backend.onrender.com/api/volunteer'; // Updated URL for PUT requests

  constructor(private http: HttpClient) {}

  // Fetch all volunteers
  getVolunteers(): Observable<Volunteer[]> {
    return this.http.get<Volunteer[]>(this.apiUrl).pipe(
      tap(
        (volunteers) => console.log('Fetched volunteers:', volunteers),
        (error) => console.error('Error fetching volunteers:', error)
      )
    );
  }

  // Fetch a single volunteer by name
  getVolunteerByName(name: string): Observable<Volunteer> {
    console.log(`Fetching volunteer with name: ${name}`);
    return this.http.get<Volunteer>(`${this.apiUrl}/${name}`).pipe(
      map((volunteer: Volunteer) => {
        console.log('Volunteer fetched:', volunteer);
        return volunteer;
      }),
      catchError((error: any) => {
        console.error('Error fetching volunteer by name:', error);
        throw error;
      })
    );
  }

  // Submit volunteer data (including profile image)
  submitVolunteerData(formData: FormData): Observable<Volunteer> {
    return this.http.post<Volunteer>(this.postUrl, formData);
  }

  // Delete a volunteer by ID (Admin-only)
  deleteVolunteer(id: string): Observable<void> {
    console.log(`Deleting volunteer with ID: ${id}`);
    return this.http.delete<void>(`${this.deleteUrl}/${id}`).pipe(
      tap(() => console.log(`Volunteer with ID ${id} deleted successfully`))
    );
  }

  // Update volunteer details (Admin-only)
  updateVolunteer(volunteer: Volunteer): Observable<Volunteer> {
    console.log(`Updating volunteer with ID: ${volunteer.id}`);
    return this.http.put<Volunteer>(`${this.updateUrl}/${volunteer.id}`, volunteer).pipe(
      tap((updatedVolunteer: Volunteer) => console.log('Updated volunteer:', updatedVolunteer))
    );
  }
}

// Export the Volunteer interface
export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_number: string; // Use phone_number here
  address: string;
  profileImage?: string; // Optional field for profile image
}