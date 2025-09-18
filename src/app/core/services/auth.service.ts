import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TOKEN_KEY, REMEMBER_ME_KEY, REMEMBERED_EMAIL_KEY } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUserValue: any;
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

  getRoleId(): number | null {
  const payload = this.getDecodedToken();
  return payload?.roleId ? parseInt(payload.roleId) : null;
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

getDecodedToken(): any {
  const token = this.getToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(payloadJson);
    //console.log('Decoded JWT Token:', decoded); 
    return decoded;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
}


getCurrentShopId(): number | null {
  const payload = this.getDecodedToken();
  return payload?.shopId ? parseInt(payload.shopId) : null;
}

  //  Role getter
  getCurrentUserRole(): string | null {
    const payload = this.getDecodedToken();

    // Microsoft claim se role nikaalna
    return (
      payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload?.role ||
      null
    );
  }

  //  Role check helper
  hasRole(role: string): boolean {
    const currentRole = this.getCurrentUserRole();
    return currentRole?.toLowerCase() === role.toLowerCase();
  }



getUserName(): string | null {
  const payload = this.getDecodedToken();
  return payload?.name || null;
}


}