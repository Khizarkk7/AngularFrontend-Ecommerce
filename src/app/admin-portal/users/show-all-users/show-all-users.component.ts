import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-all-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-all-users.component.html',
  styleUrls: ['./show-all-users.component.css']
})
export class ShowAllUsersComponent implements OnInit {

  users: any[] = [];
  paginatedUsers: any[] = [];
  loading = true;
  error = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  private apiUrl = 'https://localhost:7058/api'

  constructor(private http: HttpClient,
              private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/user`)
      .subscribe({
        next: (data) => {
          this.users = data;
          this.totalPages = Math.ceil(this.users.length / this.pageSize);
          this.updatePaginatedData();
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load users.';
          this.loading = false;
        }
      });
  }

  navigateToAddUser(){
    this.router.navigate(['/app-admin/users/add']);

  }

  updatePaginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.users.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  //  Redirect to edit page 
  editUser(user: any) {
    this.router.navigate(['/app-admin/users/edit', user.userId]);
  }


  deleteUser(userId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6C63FF',
      cancelButtonColor: '#FF6B6B',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.apiUrl + `/user/${userId}`)
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The user has been deleted.',
                timer: 1500,
                showConfirmButton: false
              });
              this.loadUsers();
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete user.',
              });
              console.error(err);
            }
          });
      }
    });
  }
}
