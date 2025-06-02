import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

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
    private toastr: ToastrService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    
    if (this.forgotForm.valid) {
      this.isLoading = true;
      
      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.toastr.success('Password reset link has been sent to your email', 'Success');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = err.error?.message || 'Error sending reset link. Please try again.';
          this.toastr.error(errorMessage, 'Error');
        }
      });
    }
  }

  hasDisplayError(controlName: string): boolean {
    const control = this.forgotForm.get(controlName);
    return !!(control?.invalid && (this.isSubmitted || control?.touched || control?.dirty));
  }
}