import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private router: Router) {}

  ngOnInit() {
    const modals = document.querySelectorAll('.modal');
    const spans = document.querySelectorAll('.close');

    // Open the modal
    document.querySelectorAll('.card').forEach((card, index) => {
      card.addEventListener('click', () => {
        const modal = document.getElementById(`modal${index + 1}`) as HTMLElement;
        if (modal) {
          modal.style.display = "block";
        }
      });
    });

    // Close the modal
    spans.forEach((span, index) => {
      span.addEventListener('click', () => {
        const modal = document.getElementById(`modal${index + 1}`) as HTMLElement;
        if (modal) {
          modal.style.display = "none";
        }
      });
    });

    // Close the modal when clicking outside of it
    window.onclick = function(event) {
      modals.forEach(modal => {
        if (event.target === modal) {
          (modal as HTMLElement).style.display = "none";
        }
      });
    }
  }

  navigateToBill() {
    this.router.navigate(['/bill']); // Navigates to the bill page
  }
}
