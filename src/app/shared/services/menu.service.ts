import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private baseUrl = 'https://localhost:7058/api/Menu';

  constructor(private http: HttpClient) {}

  getMenusByRole(roleId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/GetMenusByRole/${roleId}`);
  }
}
