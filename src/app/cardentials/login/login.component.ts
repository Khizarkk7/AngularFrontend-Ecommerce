import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { __values } from 'tslib';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  isSubmitted: boolean = false;

  constructor(public formBuilder: FormBuilder,
    private service: AuthService,
    private router: Router
  ) {

    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    if (this.service.isLogedIn()) {
      this.router.navigateByUrl('/app-admin')
    }
    //remember email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.form.patchValue({ email: rememberedEmail });
    }
  }

  hasDisplayError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && (this.isSubmitted || control?.touched || control?.dirty));
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.form.valid) {
      // Show loading alert
      Swal.fire({
        title: 'Sending...',
        text: 'Please wait while we are fetching your data.',
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        showConfirmButton: false
      });

      const { email, password, rememberMe } = this.form.value;
      this.service.signin(this.form.value).subscribe({
        next: (res: any) => {
          this.service.saveToken(res.token, rememberMe);
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }

          localStorage.setItem('role', res.role);
          localStorage.setItem('username', res.username);

          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: `Welcome, ${res.username}!`,
            timer: 2000,
            showConfirmButton: false
          });

          if (res.role?.toLowerCase() === 'shopadmin'|| 'systemadmin') {
            const shopId = res.shopId;
            const shopNameSlug = res.shopName?.replace(/\s+/g, '-').toLowerCase() || 'shop';
            // Store for future use (guard redirects)
            localStorage.setItem('shopId', shopId);
            localStorage.setItem('shopName', res.shopName || 'shop');
            //this.router.navigate([`/shop/${shopNameSlug}/${shopId}`]);
            this.router.navigateByUrl('/app-admin');
          } else {
            this.router.navigateByUrl('/app-admin');
          }
        },

        error: (err) => {
          if (err.status === 400) {
            Swal.fire({
              icon: 'warning',
              title: 'Login Failed',
              text: 'Please provide valid login details.'
            });
          } else if (err.status === 401) {
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: 'Incorrect email or password.'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Unexpected Error',
              text: 'An unexpected error occurred. Please try again later.'
            });
            console.error('Error during login:', err);
          }
        }
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Validation Error',
        text: 'Please fill out the form correctly.'
      });
    }
  }

}
