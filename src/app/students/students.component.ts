import { Component, OnInit } from '@angular/core';
import { StudentsService } from './students.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Student } from './student.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
  ],
  providers: [StudentsService]
})
export class StudentsComponent implements OnInit {
  showForm = false;
  showPopup = false;
  selectedStudent: Student | null = null;
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
    profileImage: ''
  };

  imagePreview: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  marksheet: File | null = null;
  certificate: File | null = null;

  students: Student[] = [];
  errorMessage: string | null = null;

  constructor(private studentsService: StudentsService) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.studentsService.getStudents().subscribe(
      (data: Student[]) => {
        console.log('Fetched students:', data);
        this.students = data.map((student: Student) => ({
          ...student,
          profileImage: student.photo ? `http://localhost:3000/uploads/${student.photo}` : '',
          marksheetUrl: student.marksheet ? `http://localhost:3000/uploads/${student.marksheet}` : '',
          certificateUrl: student.certificate ? `http://localhost:3000/uploads/${student.certificate}` : ''
        }));
        console.log('Students with image URLs:', this.students);
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

  onCertificateChange(event: Event) {
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
    formData.append('description', this.student.description);

    if (this.imageFile) {
      formData.append('photo', this.imageFile);
    }
    if (this.marksheet) {
      formData.append('marksheet', this.marksheet);
    }
    if (this.certificate) {
      formData.append('certificate', this.certificate);
    }

    this.studentsService.submitStudentData(formData).subscribe(
      (response: Student) => {
        console.log('Student data submitted successfully:', response);
        alert('Student data submitted successfully!');
        this.loadStudents();
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
      profileImage: ''
    };
    this.imagePreview = null;
    this.marksheet = null;
    this.certificate = null;
    this.imageFile = null;
  }

  openPopup(student: Student) {
    console.log('Opening popup for student:', student); // Debugging
    this.selectedStudent = student;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedStudent = null;
  }

  viewPdf(url: string) {
    window.open(url, '_blank');
  }

  // editStudent(student: Student) {
  //   console.log('Editing student:', student); // Debugging
  //   this.student = { ...student };
  //   this.imagePreview = student.profileImage || null;
  //   this.showForm = true;
  // }
  
  // deleteStudent(studentId: string) {
  //   if (confirm('Are you sure you want to delete this student?')) {
  //     this.studentsService.deleteStudent(studentId).subscribe(
  //       () => {
  //         console.log('Student soft deleted successfully');
  //         this.loadStudents(); // Refresh the student list
  //       },
  //       (error: HttpErrorResponse) => {
  //         console.error('Error soft deleting student:', error);
  //         alert('Failed to soft delete student. Please try again.');
  //       }
  //     );
  //   }
  // }

}