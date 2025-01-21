import { Component, OnInit } from '@angular/core';
import { StudentsService } from './students.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Student } from './student.model';  // Import the Student interface
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
  standalone: true,
  imports: [
    FormsModule,    // Import FormsModule for ngModel two-way binding
    CommonModule,   // Import CommonModule for ngIf, ngFor etc.
    HttpClientModule, // Import HttpClientModule for HTTP calls
  ],
  providers: [StudentsService]
})
export class StudentsComponent implements OnInit {
  showForm = false;
  student: Student = {
    id: '',
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    description: '',
    marksheetUrl: '',
    certificateUrl: '',
    marksheetName: '',
    certificateName: '',
    profileImage: ''  // Initialize profileImage
  };

  imagePreview: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  marksheet: File | null = null;
  certificate: File | null = null;  // Add certificate property

  students: Student[] = [];  // Array to hold student data
  errorMessage: string | null = null;

  constructor(private studentsService: StudentsService) {}

  ngOnInit() {
    this.loadStudents();  // Fetch students when component initializes
  }

  loadStudents() {
    this.studentsService.getStudents().subscribe(
      (data: Student[]) => {
        console.log('Fetched students:', data); // Log the response
        this.students = data.map((student: Student) => ({
          ...student,
          profileImage: `http://localhost:3000/uploads/${student.profileImage}` // Use the correct URL
        }));
        console.log('Students with image URLs:', this.students); // Log the processed data
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching students:', error);
      }
    );
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.imageFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload a valid image file.');
      }
    }
  }

  onMarksChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.marksheet = file;
      } else {
        alert('Please upload a valid marksheet file (PDF, DOC, DOCX).');
      }
    }
  }

  onCertificateChange(event: Event) {  // Add onCertificateChange method
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.certificate = file;
      } else {
        alert('Please upload a valid certificate file (PDF, DOC, DOCX).');
      }
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.student.name);
    formData.append('description', this.student.description);  // Add description to form data
  
    // Make sure these field names match what the backend expects
    if (this.imageFile) {
      formData.append('photo', this.imageFile);  // Make sure the field name is 'photo'
    }
    if (this.marksheet) {
      formData.append('marksheet', this.marksheet);  // Make sure the field name is 'marksheet'
    }
    if (this.certificate) {  // Add certificate to form data
      formData.append('certificate', this.certificate);
    }
  
    // Submit the form data to the backend
    this.studentsService.submitStudentData(formData).subscribe(
      (response: Student) => {
        console.log('Student data submitted successfully:', response);
        alert('Student data submitted successfully!');
        this.loadStudents();  // Refresh the student list after successful submission
        this.resetForm();
      },
      (error: HttpErrorResponse) => {
        console.error('Error submitting student data:', error);
        if (error.status === 0) {
          this.errorMessage = 'Network error - please check if the backend server is running.';
        } else {
          this.errorMessage = error.error?.message || 'An error occurred while submitting the student data.';
        }
        alert(this.errorMessage);
      }
    );
  }
    
  resetForm() {
    this.student = {
      id: '',
      name: '',
      email: '',
      phone: '',
      dob: '',
      address: '',
      description: '',
      marksheetUrl: '',
      certificateUrl: '',
      marksheetName: '',
      certificateName: '',
      profileImage: ''  // Reset profileImage
    };
    this.imagePreview = null;
    this.marksheet = null;
    this.certificate = null;  // Reset certificate
    this.imageFile = null;
  }
}