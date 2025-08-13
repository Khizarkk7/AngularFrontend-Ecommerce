import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-shop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-shop.component.html',
  styleUrls: ['./add-shop.component.css']
})
export class AddShopComponent implements OnInit {
  shopForm!: FormGroup;
  logoFile!: File | null;
  isSubmitting = false;


  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private authService: AuthService,
              
              ) {}

  ngOnInit(): void {
    this.shopForm = this.fb.group({
      shopName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      contactInfo: ['', [Validators.required]],
      logo: [null, Validators.required]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
    }
  }

  onSubmit() {
    if (this.shopForm.invalid || !this.logoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields and upload a logo.',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    const formData = new FormData();
    formData.append('ShopName', this.shopForm.value.shopName);
    formData.append('Description', this.shopForm.value.description || '');
    formData.append('ContactInfo', this.shopForm.value.contactInfo);
    formData.append('Logo', this.logoFile);
    formData.append('CreatorId', '1'); // This should come from your AuthService

    this.isSubmitting = true;
    Swal.fire({ title: 'Creating Shop...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

    this.http.post('https://yourapi.com/api/Shop/CreateShop', formData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.shopForm.reset();
        this.logoFile = null;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: res.message,
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Something went wrong!',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }
}
