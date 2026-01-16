import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  amount: number;
  payment: {
    method: string;
    status: string;
    transactionId: string;
  };
  status: string;
  date: Date;
  products: {
    name: string;
    sku: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

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
){
  
}

   userName: string = '';
   userRole: string = '';
   //isRefreshing: boolean;

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

