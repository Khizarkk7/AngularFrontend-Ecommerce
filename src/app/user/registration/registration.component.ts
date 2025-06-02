import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, FormBuilder } from '@angular/forms';
import { RouterLink, } from '@angular/router';
import { FirstkeyPipe } from '../../shared/pipes/firstkey.pipe';
import { AuthService } from '../../shared/services/auth.service';
import { subscribeOn } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  form: FormGroup;
  isSubmitted: boolean = false;
  roles: any[] = [];
  shops: any[] = [];
  isLoading: boolean = false;


  constructor(
    public formBuilder: FormBuilder,
    private service: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.formBuilder.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: [
          '',
          [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)],
        ],
        role: ['', Validators.required],
        shop: ['', Validators.required],
        password: [
          '',
          [Validators.required, Validators.maxLength(12), Validators.minLength(6), Validators.pattern(/(?=.*[^a-zA-Z0-9])/)],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    if (this.service.isLogedIn()) {
      this.router.navigateByUrl('/app-admin');
    }
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.isLoading = true;

    //Fetch roles from your service
    this.service.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load roles', 'Error');
        this.isLoading = false;
      }
    });

    // Fetch shops from your service
    this.service.getShops().subscribe({
      next: (res: any) => {
        this.shops = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load shops', 'Error');
        this.isLoading = false;
      }
    });
  }


  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      const payload = {
        username: this.form.value.fullName,
        email: this.form.value.email,
        password: this.form.value.password,
        roleId: this.form.value.role,
        shopId: this.form.value.shop
      };
      this.service.createUser(payload).subscribe({
        next: (res: any) => {
          console.log('API Response:', res);
          if (res.succeeded) {
            this.form.reset();
            this.isSubmitted = false;
            this.toastr.success(res.message, 'Success');
          } else {
            console.log('API Error Response:', res);
            this.toastr.error(res.message, 'Error');
            if (res.errors) {
              res.errors.forEach((err: string) => {
                console.error('Error:', err);
              });
            }
          }
        },
        error: (err) => {
          console.error('HTTP Error:', err);
          this.toastr.error('An error occurred while connecting to the server.(Duplicate Entry)', 'Error');
        },
      });
    }
  }

  hasDisplayError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && (this.isSubmitted || control?.touched || control?.dirty));
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}