import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { env } from '../environment/env';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  

  login(username: string, password: string) {
    return this.http.post<{ username: string }>(`${env.apiUrl}/login`, { username, password });
  }

  register(username: string, password: string) {
    return this.http.post(`${env.apiUrl}/register`, { username, password });
  }

  me() {
    return this.http.get<{ username: string }>(`${env.apiUrl}/auth/me`);
  }

  logout() {
    return this.http.post(`${env.apiUrl}/logout`, {});
  }
}