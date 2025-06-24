import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AdminPortalComponent } from "./admin-portal/admin-portal.component";
import { RegistrationComponent } from "./user/registration/registration.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./ui/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [RouterOutlet, FooterComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'My-Store';
}
