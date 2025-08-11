import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

constructor(
  private authService: AuthService,
){}

   userName: string = '';
   userRole: string = '';

    ngOnInit(): void {
    
    //h1 heading binding name
    const decoded = this.authService.getDecodedToken();
    if (decoded) {
      this.userName = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
       this.userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }
    console.log(this.userName)
  }
}
