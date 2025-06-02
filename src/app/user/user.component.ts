import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet,RouterLink, RouterModule } from '@angular/router';


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterOutlet,CommonModule,RouterModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

}
