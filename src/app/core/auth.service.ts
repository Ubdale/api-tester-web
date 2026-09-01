import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface Workspace { id: string; name: string; role: string; }
export interface CurrentUser { id: string; email: string; name?: string; workspaces: Workspace[]; }

const TOKEN_KEY = 'probe_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<CurrentUser | null>(null);
  activeWorkspaceId = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  async signup(email: string, password: string, name?: string, workspaceName?: string) {
    const res: any = await firstValueFrom(
      this.http.post(`${environment.apiUrl}/auth/signup`, { email, password, name, workspaceName })
    );
    this.setToken(res.token);
    await this.loadMe();
  }

  async login(email: string, password: string) {
    const res: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/login`, { email, password }));
    this.setToken(res.token);
    await this.loadMe();
  }

  async loadMe() {
    const me: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/auth/me`));
    this.user.set(me);
    if (me.workspaces?.length && !this.activeWorkspaceId()) this.activeWorkspaceId.set(me.workspaces[0].id);
  }

  async tryRestoreSession(): Promise<boolean> {
    if (!this.getToken()) return false;
    try {
      await this.loadMe();
      return true;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.user.set(null);
    this.activeWorkspaceId.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
