import { Component, OnInit } from '@angular/core';
import { VolunteersService } from './volunteers.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-volunteers',
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], 
  providers: [VolunteersService, AuthService]
})
export class VolunteersComponent implements OnInit {
  showCard = false;
  name = '';
  phoneNumber = '';
  profileImage: File | null = null;
  volunteers: Volunteer[] = [];
  errorMessage: string | null = null;
  isAdmin = false;
  isSubAdmin = false;

  constructor(private volunteersService: VolunteersService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const role = this.authService.getRole();
    if (role === 'admin' || role === 'subadmin') {
      this.isAdmin = role === 'admin';
      this.isSubAdmin = role === 'subadmin';
      this.getVolunteers();
    } else {
      alert('You do not have permission to access this data.');
      this.router.navigate(['/login']);
    }
  }

  getVolunteers(): void {
    this.volunteersService.getVolunteers().subscribe(
      (data: Volunteer[]) => {
        this.volunteers = data;
      },
      (error) => {
        console.error('Error fetching volunteer data:', error);
      }
    );
  }

  toggleCard(): void {
    if (this.isAdmin) {
      this.showCard = !this.showCard;
    } else {
      alert('Only admins can add volunteers.');
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
  
      this.volunteersService.submitVolunteerData(formData).subscribe(
        (response: Volunteer) => {
          this.resetForm();
          this.getVolunteers();
          this.showCard = false;
        },
        (error) => {
          console.error('Error:', error);
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
    }
  }

  resetForm(): void {
    this.name = '';
    this.phoneNumber = '';
    this.profileImage = null;
    this.errorMessage = null;
  }
}

// Volunteer Interface
export interface Volunteer {
  id: string;
  name: string;
  phone_number: string;
  profileImage?: string;
}
