import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AdminPortalComponent } from "./admin-portal/admin-portal.component";
import { RegistrationComponent } from "./cardentials/registration/registration.component";


@Component({
  selector: 'app-root',
  standalone: true,

  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'My-Store';
}
