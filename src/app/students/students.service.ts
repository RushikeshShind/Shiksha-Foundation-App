import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './student.model';  // Import the Student interface

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private apiUrl = 'http://localhost:3000/api/students';  // URL to fetch students
  private postUrl = 'http://localhost:3000/api/student';  // URL to submit new student data

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

  deleteStudent(studentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${studentId}`);
  }
}