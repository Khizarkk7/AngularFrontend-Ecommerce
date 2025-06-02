import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TOKEN_KEY } from '../constants';
import { Token } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
//1 add http client in app,config.ts
export class AuthService {

  constructor(private http: HttpClient) { } //recieve an instance of HttpClient
  baseURL = 'https://localhost:7058/api';//observable handle the delays &  //allows to combine mutiple async operations


  createUser(formData: any) { //formData is an object 
    return this.http.post(this.baseURL + '/Login/register', formData);
  }
  getRoles() {
    return this.http.get(`${this.baseURL}/Role`);
  }

  getShops() {
    return this.http.get(`${this.baseURL}/Shop`);
  }


  signin(formData: any) { //formData is an object 
    return this.http.post(this.baseURL + '/Login/login', formData);
  }

  isLogedIn() {

    return localStorage.getItem(TOKEN_KEY) != null ? true : false

  }
  deleteToken() {
    localStorage.removeItem(TOKEN_KEY);
  }
  saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  forgotPassword(email: string) {
  return this.http.post(`${this.baseURL}/forgot-password`, { email });
}
}
