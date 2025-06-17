import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TOKEN_KEY, REMEMBER_ME_KEY, REMEMBERED_EMAIL_KEY } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }
  baseURL = 'https://localhost:7058/api';

  createUser(formData: any) {
    return this.http.post(this.baseURL + '/Login/register', formData);
  }

  getRoles() {
    return this.http.get(`${this.baseURL}/Role`);
  }

  getShops() {
    return this.http.get(`${this.baseURL}/Shop`);
  }

  signin(formData: any) {
    return this.http.post(this.baseURL + '/Login/login', formData);
  }

  // Updated login check (checks both storage locations)
  isLogedIn(): boolean {
    return !!(localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY));
  }

  // Updated token deletion
  deleteToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }

  // Token storage with remember me option
  saveToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }

  // Remember email functionality
  saveRememberedEmail(email: string): void {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
  }

  getRememberedEmail(): string | null {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY);
  }

  clearRememberedEmail(): void {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.baseURL}/forgot-password`, { email });
  }

  // New: Get current token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }
}