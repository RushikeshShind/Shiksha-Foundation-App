import { Component, OnInit } from '@angular/core';
import { VolunteersService } from './volunteers.service';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';



@Component({
  selector: 'app-volunteers',
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.css'],
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule], 
  providers: [VolunteersService, AuthService]
})
export class VolunteersComponent implements OnInit {
  showCard = false;
  name = '';
  phoneNumber = '';
  profileImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  volunteers: Volunteer[] = [];
  errorMessage: string | null = null;
  isAdmin = false;  // Initialize the flag for Admin
  isSubAdmin = false;

  constructor(private volunteersService: VolunteersService, private authService: AuthService ,  private router: Router) {}

  ngOnInit(): void {
    // Ensure the login status and role are properly checked and set
    this.checkLoginStatus();
  }

  // Check if the user is logged in and set the role
  checkLoginStatus(): void {
    const role = this.authService.getRole();
    console.log('Logged-in user role:', role);
  
    if (role === 'admin' || role === 'subadmin') {
      this.isAdmin = role === 'admin';
      this.isSubAdmin = role === 'subadmin';
      this.getVolunteers(); // Fetch volunteers
    } else {
      alert('You do not have permission to access this data.');
      if (this.router) {
        this.router.navigate(['/login']);
      }
       // Redirect unauthorized users
    }
  }
  

  // Fetch volunteers from the service
  getVolunteers(): void {
    this.volunteersService.getVolunteers().subscribe(
      (data: Volunteer[]) => {
        console.log('Volunteers fetched successfully:', data);
        this.volunteers = data;
      },
      (error) => {
        console.error('Error fetching volunteer data:', error);
      }
    );
  }

  toggleCard(): void {
    if (this.isAdmin) {
      this.showCard = !this.showCard;  // Allow only admins to toggle the form
    } else {
      alert('Only admins have permission to create a volunteer.');
    }
  }

  onSubmit(): void {
    if (!this.isAdmin) {
      alert('Only admins can add volunteers.');
      return;
    }
  
    if (this.name && this.phoneNumber) {
      const formData = new FormData();
      formData.append('name', this.name);
      formData.append('phone_number', this.phoneNumber);
  
      if (this.profileImage) {
        formData.append('profileImage', this.profileImage, this.profileImage.name);
      }
  
      // Debug FormData values
      for (let pair of formData as any) {
        console.log(pair[0] + ':', pair[1]);
      }
  
      this.volunteersService.submitVolunteerData(formData).subscribe(
        (response: Volunteer) => {
          console.log('Volunteer added successfully:', response);
          this.authService.createVolunteerCredentials(this.name, this.phoneNumber);
          this.resetForm();
          this.getVolunteers();
          this.showCard = false;
        },
        (error) => {
          console.error('Error Response:', error);
          this.errorMessage = 'An error occurred while submitting the volunteer data.';
        }
      );
    } else {
      alert('Please fill out all required fields');
    }
  }
  
  
  


  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.profileImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      console.log('File selected:', file.name);
    } else {
      console.log('No file selected');
    }
  }

  resetForm(): void {
    this.name = '';
    this.phoneNumber = '';
    this.profileImage = null;
    this.imagePreview = null;
    this.errorMessage = null;
  }

  // Admin-only delete functionality
  deleteVolunteer(volunteerId: string): void {
    if (!this.isAdmin) {
      alert('Only admins can delete volunteers.');
      return;
    }

    if (confirm('Are you sure you want to delete this volunteer?')) {
      this.volunteersService.deleteVolunteer(volunteerId).subscribe(
        () => {
          console.log('Volunteer deleted successfully:', volunteerId);
          this.getVolunteers(); // Refresh the list after deletion
        },
        (error) => {
          console.error('Error deleting volunteer:', error);
        }
      );
    }
  }
}

// Volunteer interface (as before)
export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_number: string; 
  address: string;
  profileImage?: string;
}
