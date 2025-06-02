import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { __values } from 'tslib';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
    private toastr: ToastrService,
    private router: Router
  ) {

    this.form = this.formBuilder.group(
      {
        email: [
          '',
          [Validators.required,],
        ],
        password: [
          '',
          [Validators.required,],
        ],
      },

    );
  }

  ngOnInit(): void {
    if(this.service.isLogedIn()){
      this.router.navigateByUrl('/app-admin')
    }
  }   

  hasDisplayError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && (this.isSubmitted || control?.touched || control?.dirty));
  }
  
  onSubmit() {
    this.isSubmitted = true;

    if (this.form.valid) {
      this.service.signin(this.form.value).subscribe({
        next: (res: any) => {
          this.service.saveToken(res.token);
          this.router.navigateByUrl('/app-admin');
        },
        error: (err) => {
          if (err.status === 400) {
            this.toastr.error('Please provide valid login details.', 'Login Failed');
          } else if (err.status === 401) {
            this.toastr.error('Incorrect email or password.', 'Login Failed');
          } else {
            this.toastr.error('An unexpected error occurred. Please try again later.', 'Login Failed');
            console.error('Error during login:', err);
          }
        },
      });
    } else {
      this.toastr.warning('Please fill out the form correctly.', 'Validation Error');
    }
  }


}
