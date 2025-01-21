import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Import Router and RouterModule

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.css'],
  standalone: true,
  imports: [RouterModule] // Include RouterModule in the imports array
})
export class SplashScreenComponent implements OnInit {
  constructor(private router: Router) {} // Router is injected here

  ngOnInit(): void {
    setTimeout(() => {
      const backgroundCircle = document.querySelector('.background-circle') as HTMLElement;
      const extraCircle = document.querySelector('.extra-circle') as HTMLElement;

      // Trigger the merge and blast animation
      backgroundCircle.style.animation = 'mergeAndBlast 2s ease-in-out forwards';
      extraCircle.style.animation = 'mergeAndBlast 2s ease-in-out forwards';

      // Add the final color effect animation
      setTimeout(() => {
        backgroundCircle.classList.add('final-effect');
        extraCircle.classList.add('final-effect');
      }, 5500); // Trigger the color effect 1.5 seconds before the transition

      // Navigate to the next page
      setTimeout(() => {
        this.router.navigate(['/login']); // Change '/dashboard' to your desired route
      }, 2000); // Allow time for the animations to complete
    }, 4400); // Start animations after 4.4 seconds
  }
}
