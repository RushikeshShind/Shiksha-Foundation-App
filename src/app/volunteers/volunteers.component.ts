import { Component, OnInit } from '@angular/core';
import { VolunteersService } from './volunteers.service';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-volunteers',
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.css'],
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule],  // Add FormsModule and CommonModule
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
  isAdmin = false;
  isSubAdmin = false;

  constructor(private volunteersService: VolunteersService, private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.isAdmin = role === 'admin';
    this.isSubAdmin = role === 'subadmin';
    this.getVolunteers();
  }

  getVolunteers(): void {
    this.volunteersService.getVolunteers().subscribe(
      (data: Volunteer[]) => {
        console.log('Volunteers fetched successfully:', data);
        this.volunteers = data;
        this.volunteers.forEach(volunteer => {
          this.authService.createVolunteerCredentials(volunteer.name, volunteer.phone_number);
          console.log('Volunteer credentials created:', volunteer.name, volunteer.phone_number); // Log credentials creation
        });
      },
      (error) => {
        console.error('Error fetching volunteer data:', error);
      }
    );
  }

  toggleCard(): void {
    if (this.isAdmin || this.isSubAdmin) {
      this.showCard = !this.showCard;
    } else {
      alert('You do not have permission to create a volunteer.');
    }
  }

  onSubmit(): void {
    if (this.name && this.phoneNumber && this.profileImage) {
      const formData = new FormData();
      formData.append('name', this.name);
      formData.append('phone_number', this.phoneNumber);
      formData.append('profileImage', this.profileImage, this.profileImage.name);

      console.log('Form data:', formData);

      this.volunteersService.submitVolunteerData(formData).subscribe(
        (response: Volunteer) => {
          console.log('Volunteer data submitted successfully:', response);
          this.authService.createVolunteerCredentials(this.name, this.phoneNumber);
          console.log('Volunteer credentials created:', this.name, this.phoneNumber);
          this.resetForm();
          this.getVolunteers();
          this.showCard = false;
        },
        (error) => {
          console.error('Error submitting volunteer data:', error);
          this.errorMessage = 'An error occurred while submitting the volunteer data.';
        }
      );
    } else {
      console.log('Please fill out all fields');
      alert('Please fill out all fields');
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
}

// Define the Volunteer interface
export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_number: string; // Use phone_number here
  address: string;
  profileImage?: string; // Optional field for profile image
}