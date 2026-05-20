import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { env } from '../environment/env';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = env.apiUrl;

  login(username, password) {
    return this.http.post(`${env.apiUrl}/login`, {
      username,
      password,
    });
  }

  register(username, password) {
    return this.http.post(`${env.apiUrl}/register`, {
      username,
      password,
    });
  }

  logout() {
    localStorage.removeItem('token');
  }
}
