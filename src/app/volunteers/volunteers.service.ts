import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap operator

@Injectable({
  providedIn: 'root'
})
export class VolunteersService {
  private apiUrl = 'http://localhost:3000/api/volunteers'; // URL for GET requests to fetch volunteers
  private postUrl = 'http://localhost:3000/api/volunteer'; // URL for POST requests to submit a new volunteer
  private deleteUrl = 'http://localhost:3000/api/volunteer'; // URL for DELETE requests
  private updateUrl = 'http://localhost:3000/api/volunteer'; // URL for PUT requests

  constructor(private http: HttpClient) {}

  // Fetch all volunteers
  getVolunteers(): Observable<Volunteer[]> {
    return this.http.get<Volunteer[]>(this.apiUrl);
  }

  // Fetch a single volunteer by name
  getVolunteerByName(name: string): Observable<Volunteer> {
    console.log(`Fetching volunteer with name: ${name}`);
    return this.http.get<Volunteer>(`${this.apiUrl}/${name}`).pipe(
      tap((volunteer: Volunteer) => console.log('Fetched volunteer:', volunteer))
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
