import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="h-screen flex items-center justify-center bg-ink">
      <div class="w-[360px] bg-panel border border-border rounded-xl p-7 flex flex-col gap-1">
        <div class="flex items-center gap-2 mb-1">
          <mat-icon class="text-amber">bolt</mat-icon>
          <h1 class="text-[17px] font-medium m-0">Probe</h1>
        </div>
        <p class="text-[12.5px] text-text-dim mb-3">
          {{ mode === 'login' ? 'Sign in to your workspace' : 'Create your account' }}
        </p>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="email" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Password</mat-label>
          <input matInput type="password" [(ngModel)]="password" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full" *ngIf="mode === 'signup'">
          <mat-label>Name (optional)</mat-label>
          <input matInput type="text" [(ngModel)]="name" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full" *ngIf="mode === 'signup'">
          <mat-label>Workspace name (optional)</mat-label>
          <input matInput type="text" [(ngModel)]="workspaceName" />
        </mat-form-field>

        <div class="text-accent-red text-[12px] mb-1" *ngIf="error">{{ error }}</div>

        <button mat-flat-button color="primary" class="w-full !mt-1" (click)="submit()" [disabled]="loading">
          <mat-spinner *ngIf="loading" diameter="18" class="inline-block mr-2"></mat-spinner>
          {{ mode === 'login' ? 'Sign in' : 'Create account' }}
        </button>
        <button mat-button class="w-full text-text-dim" (click)="mode = mode === 'login' ? 'signup' : 'login'; error=''">
          {{ mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in' }}
        </button>
      </div>
    </div>
  `
})
export class LoginComponent {
  mode: 'login' | 'signup' = 'login';
  email = ''; password = ''; name = ''; workspaceName = '';
  error = ''; loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = '';
    if (!this.email || !this.password) { this.error = 'Email and password are required'; return; }
    this.loading = true;
    try {
      if (this.mode === 'login') await this.auth.login(this.email, this.password);
      else await this.auth.signup(this.email, this.password, this.name, this.workspaceName);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error = e?.error?.error || 'Something went wrong';
    } finally {
      this.loading = false;
    }
  }
}
