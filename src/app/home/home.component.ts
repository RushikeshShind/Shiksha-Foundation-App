import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  features = [
    { icon: 'fal fa-home', title: 'Dashboard', description: 'Monitor and manage activities.' },
    { icon: 'fal fa-user-graduate', title: 'Students', description: 'Track student performance.' },
    { icon: 'fal fa-box-open', title: 'Resources', description: 'Access educational materials.' },
  ];
}
