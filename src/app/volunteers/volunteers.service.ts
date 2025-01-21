import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap operator

@Injectable({
  providedIn: 'root'
})
export class VolunteersService {
  private apiUrl = 'http://localhost:3000/api/volunteers'; // URL for GET requests to fetch volunteers
  private postUrl = 'http://localhost:3000/api/volunteer'; // URL for POST request to submit a new volunteer

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
}

// Export the Volunteer interface
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