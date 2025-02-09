import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './student.model';  // Import the Student interface

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private apiUrl = 'https://shiksha-backend.onrender.com/api/students';  // Updated URL to fetch students
  private postUrl = 'https://shiksha-backend.onrender.com/api/student';  // Updated URL to submit new student data

  constructor(private http: HttpClient) {}

  // Fetch all students (GET request)
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);  // Returns an Observable with student data
  }

  // Submit student data (POST request)
  submitStudentData(formData: FormData): Observable<Student> {
    return this.http.post<Student>(this.postUrl, formData);  // Sending form data including files
  }

  // Get student image URL
  getStudentImageUrl(studentId: string): string {
    return `${this.apiUrl}/${studentId}/image`;  // Adjust the URL pattern as needed
  }

  // Get student PDF URL
  getStudentPdfUrl(studentId: string): string {
    return `${this.apiUrl}/${studentId}/pdf`;  // Adjust the URL pattern as needed for PDFs
  }

  // Delete a student (DELETE request)
  deleteStudent(studentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${studentId}`);
  }
}
