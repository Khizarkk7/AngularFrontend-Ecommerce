import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
//import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-pass',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-pass.component.html',
  styleUrl: './forgot-pass.component.css'
})
export class ForgotPassComponent {
  forgotForm: FormGroup;
  isLoading = false;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    //private toastr: ToastrService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

onSubmit() {
  this.isSubmitted = true;

  if (this.forgotForm.valid) {
    // Show loading alert
    Swal.fire({
      title: 'Sending...',
      text: 'Please wait while we send the reset link.',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      showConfirmButton: false
    });

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res: any) => {
        Swal.close(); // Close loading spinner

        Swal.fire({
          icon: 'success',
          title: 'Link Sent!',
          text: 'Password reset link has been sent to your email.',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.close(); // Close loading spinner

        const errorMessage = err.error?.message || 'Error sending reset link. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: errorMessage,
          confirmButtonColor: '#d33'
        });
      }
    });

  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Validation Error',
      text: 'Please enter a valid email address.',
      confirmButtonColor: '#f59e0b'
    });
  }
}


  hasDisplayError(controlName: string): boolean {
    const control = this.forgotForm.get(controlName);
    return !!(control?.invalid && (this.isSubmitted || control?.touched || control?.dirty));
  }
}