// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  userId: number;
  username: string;
  email: string;
  password: string;
  roleId: string;
  shopId: number;
  isActive: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7058/api/User'; 

  constructor(private http: HttpClient) {}

  //  Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  //  Get user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  //  Add new user
  addUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/AddUser`, user);
  }

  //  Update user (username + password only)
  updateUser(id: number, user: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/UpdateUser/${id}`, user);
  }

  //  Delete user
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
