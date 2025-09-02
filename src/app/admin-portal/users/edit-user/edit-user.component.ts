import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  editForm!: FormGroup;
  userId!: number;
  isSubmitting = false;
  successMessage: string | null = null;

  roles: any[] = [];
  shops: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group(
      {
        userName: ['', [Validators.required, Validators.minLength(3)]],
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        roleId: ['', Validators.required],
        shopId: ['', Validators.required],
        status: [{ value: '',}, Validators.required],
        newPassword: ['', [Validators.minLength(8)]],
        confirmPassword: ['']
      },
      { validators: this.passwordMatchValidator }
    );

    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    // Fetch dropdown data
    this.authService.getRoles().subscribe((res: any) => (this.roles = res));
    this.authService.getShops().subscribe((res: any) => (this.shops = res));

    // Fetch user data
    this.userService.getUserById(this.userId).subscribe({
      next: (data) => {
        console.log('API data:', data);
        this.editForm.patchValue({
          userName: data.username,
          email: data.email,
          roleId: data.roleId,
          shopId: data.shopId,
          status: data.isActive ? 'active' : 'inactive'
        });
      },
      error: () => Swal.fire('Error', 'Failed to fetch user details', 'error')
    });
  }

  // custom password match validator
  passwordMatchValidator(group: AbstractControl) {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
  }

  hasFieldError(field: string): boolean {
    const control = this.editForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.editForm.invalid) {
      Swal.fire('Invalid', 'Please fix validation errors.', 'warning');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      username: this.editForm.get('userName')?.value,
      password: this.editForm.get('newPassword')?.value,
      roleId: this.editForm.get('roleId')?.value,
      shopId: this.editForm.get('shopId')?.value,
      isActive: this.editForm.get('status')?.value === 'active' ? 1 : 0
    };

    this.userService.updateUser(this.userId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'User updated successfully!';
        Swal.fire('Success', 'User updated successfully!', 'success').then(() => {
          this.router.navigate(['/app-admin/users/all']);
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire('Error', 'Failed to update user.', 'error');
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/app-admin/users/all']);
  }
}
