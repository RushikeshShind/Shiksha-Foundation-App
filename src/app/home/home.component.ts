import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular'; // Import Platform from Ionic (optional)
declare const cordova: any; // Declare cordova for TypeScript

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private platform: Platform) {}

  ngOnInit() {
    this.checkAndRequestStoragePermission();

    // Existing modal logic
    const modals = document.querySelectorAll('.modal');
    const spans = document.querySelectorAll('.close');

    // Open the modal
    document.querySelectorAll('.card').forEach((card, index) => {
      card.addEventListener('click', () => {
        const modal = document.getElementById(`modal${index + 1}`) as HTMLElement;
        if (modal) {
          modal.style.display = 'block';
        }
      });
    });

    // Close the modal
    spans.forEach((span, index) => {
      span.addEventListener('click', () => {
        const modal = document.getElementById(`modal${index + 1}`) as HTMLElement;
        if (modal) {
          modal.style.display = 'none';
        }
      });
    });

    // Close the modal when clicking outside of it
    window.onclick = function (event) {
      modals.forEach((modal) => {
        if (event.target === modal) {
          (modal as HTMLElement).style.display = 'none';
        }
      });
    };
  }

  checkAndRequestStoragePermission() {
    if (this.platform.is('android')) {
      // Check if the plugin is available
      if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.permissions) {
        const permissions = cordova.plugins.permissions;

        // Check if the permission is already granted
        permissions.checkPermission(permissions.WRITE_EXTERNAL_STORAGE, (status: any) => {
          if (!status.hasPermission) {
            // Request the permission
            permissions.requestPermission(
              permissions.WRITE_EXTERNAL_STORAGE,
              (requestStatus: any) => {
                if (requestStatus.hasPermission) {
                  console.log('Storage permission granted');
                } else {
                  console.error('Storage permission denied');
                }
              },
              (error: any) => {
                console.error('Error requesting storage permission:', error);
              }
            );
          } else {
            console.log('Storage permission already granted');
          }
        });
      } else {
        console.error('Cordova permissions plugin not available');
      }
    } else {
      console.log('Storage permission not required on this platform');
    }
  }

  navigateToBill() {
    this.router.navigate(['/bill']); // Navigates to the bill page
  }
}