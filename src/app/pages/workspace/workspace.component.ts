import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { ApiService, ProxyResult, KV } from '../../core/api.service';
import { JsonTreeComponent } from '../../components/json-tree/json-tree.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSidenavModule, MatToolbarModule, MatListModule,
    MatTabsModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatTooltipModule, MatSnackBarModule, JsonTreeComponent
  ],
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {
  method = 'GET';
  url = '';
  params: KV[] = [];
  headers: KV[] = [];
  bodyType: 'none' | 'json' | 'text' | 'form' = 'none';
  bodyText = '';
  authType: 'none' | 'bearer' | 'basic' = 'none';
  bearerToken = '';
  basicUser = '';
  basicPass = '';

  sending = false;
  result: ProxyResult | null = null;
  errorMsg = '';
  parsedJson: any = undefined;
  history: any[] = [];

  constructor(public auth: AuthService, private api: ApiService, private snack: MatSnackBar) {}

  async ngOnInit() {
    await this.loadHistory();
  }

  async switchWorkspace(id: string) {
    this.auth.activeWorkspaceId.set(id);
    await this.loadHistory();
  }

  async loadHistory() {
    const wsId = this.auth.activeWorkspaceId();
    if (!wsId) return;
    try { this.history = await this.api.history(wsId); } catch { this.history = []; }
  }

  addParam() { this.params.push({ key: '', value: '', enabled: true }); }
  removeParam(i: number) { this.params.splice(i, 1); }
  addHeader() { this.headers.push({ key: '', value: '', enabled: true }); }
  removeHeader(i: number) { this.headers.splice(i, 1); }

  formatJson() {
    try { this.bodyText = JSON.stringify(JSON.parse(this.bodyText), null, 2); } catch {}
  }

  private buildUrl(): string {
    let full = this.url;
    if (!/^https?:\/\//i.test(full)) full = 'https://' + full;
    const [base] = full.split('?');
    const active = this.params.filter(p => p.enabled !== false && p.key);
    if (!active.length) return base;
    const qs = new URLSearchParams();
    active.forEach(p => qs.append(p.key, p.value));
    return base + '?' + qs.toString();
  }

  private buildHeaders(): Record<string, string> {
    const h: Record<string, string> = {};
    this.headers.filter(x => x.enabled !== false && x.key).forEach(x => h[x.key] = x.value);
    if (this.authType === 'bearer' && this.bearerToken) h['Authorization'] = 'Bearer ' + this.bearerToken;
    if (this.authType === 'basic' && this.basicUser) h['Authorization'] = 'Basic ' + btoa(`${this.basicUser}:${this.basicPass}`);
    if (this.bodyType === 'json' && !h['Content-Type']) h['Content-Type'] = 'application/json';
    if (this.bodyType === 'form' && !h['Content-Type']) h['Content-Type'] = 'application/x-www-form-urlencoded';
    return h;
  }

  copyAsCurl() {
    const full = this.buildUrl();
    let cmd = `curl -X ${this.method} '${full.replace(/'/g, "'\\''")}'`;
    const h = this.buildHeaders();
    Object.entries(h).forEach(([k, v]) => { cmd += ` \\\n  -H '${k}: ${v.replace(/'/g, "'\\''")}'`; });
    if (!['GET', 'HEAD'].includes(this.method) && this.bodyType !== 'none' && this.bodyText.trim()) {
      cmd += ` \\\n  -d '${this.bodyText.replace(/'/g, "'\\''")}'`;
    }
    navigator.clipboard.writeText(cmd).then(() => this.snack.open('cURL command copied', undefined, { duration: 1800 }));
  }

  copyResponse() {
    if (!this.result) return;
    const payload = this.parsedJson !== undefined ? JSON.stringify(this.parsedJson, null, 2) : (this.result.bodyText || '');
    navigator.clipboard.writeText(payload).then(() => this.snack.open('Response copied', undefined, { duration: 1800 }));
  }

  async send() {
    if (!this.url) return;
    this.sending = true;
    this.errorMsg = '';
    this.result = null;
    this.parsedJson = undefined;
    const full = this.buildUrl();
    const headers = this.buildHeaders();
    const body = (this.bodyType === 'none' || ['GET', 'HEAD'].includes(this.method)) ? undefined : this.bodyText;

    try {
      const res = await this.api.send({ method: this.method, url: full, headers, body });
      this.result = res;
      if (res.bodyText) {
        try { this.parsedJson = JSON.parse(res.bodyText); } catch { this.parsedJson = undefined; }
      }
      const wsId = this.auth.activeWorkspaceId();
      if (wsId) {
        await this.api.logHistory(wsId, { method: this.method, url: full, status: res.status, durationMs: res.timeMs });
        await this.loadHistory();
      }
    } catch (e: any) {
      this.errorMsg = e?.error?.message || e?.message || 'Something went wrong';
      const wsId = this.auth.activeWorkspaceId();
      if (wsId) {
        await this.api.logHistory(wsId, { method: this.method, url: full });
        await this.loadHistory();
      }
    } finally {
      this.sending = false;
    }
  }

  statusLabel(): string {
    if (this.errorMsg) return 'failed';
    if (this.result) return `${this.result.status} ${this.result.statusText}`;
    return '—';
  }
  statusColorClass(): string {
    if (this.errorMsg) return 'text-accent-red';
    if (!this.result) return 'text-text-faint';
    return this.result.status < 300 ? 'text-accent-green' : this.result.status < 400 ? 'text-amber' : 'text-accent-red';
  }
  methodBadgeClass(method: string): string {
    const map: Record<string, string> = {
      GET: 'bg-accent-blue/15 text-accent-blue',
      POST: 'bg-accent-green/15 text-accent-green',
      PUT: 'bg-amber/15 text-amber',
      PATCH: 'bg-accent-purple/15 text-accent-purple',
      DELETE: 'bg-accent-red/15 text-accent-red'
    };
    return map[method] || 'bg-raised text-text-dim';
  }
  statusDotClass(status: number | null): string {
    if (status == null) return 'bg-text-faint';
    if (status < 300) return 'bg-accent-green';
    if (status < 400) return 'bg-amber';
    return 'bg-accent-red';
  }
  humanSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }
}
