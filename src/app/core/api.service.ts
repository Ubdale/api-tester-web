import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface KV { key: string; value: string; enabled: boolean; }

export interface ProxyResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  bodyText: string | null;
  bodyBase64: string | null;
  sizeBytes: number;
  timeMs: number;
  tlsWarning?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  send(payload: { method: string; url: string; headers?: Record<string,string>; body?: string; insecureSkipTlsVerify?: boolean }) {
    return firstValueFrom(this.http.post<ProxyResult>(`${environment.apiUrl}/proxy`, payload));
  }

  collections(wsId: string) {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/workspaces/${wsId}/collections`));
  }

  createCollection(wsId: string, name: string) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/workspaces/${wsId}/collections`, { name }));
  }

  history(wsId: string) {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/workspaces/${wsId}/history`));
  }

  logHistory(wsId: string, entry: { method: string; url: string; status?: number; durationMs?: number }) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/workspaces/${wsId}/history`, entry));
  }

  members(wsId: string) {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/workspaces/${wsId}/members`));
  }

  invite(wsId: string, email: string, role: string) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/workspaces/${wsId}/invite`, { email, role }));
  }
}
