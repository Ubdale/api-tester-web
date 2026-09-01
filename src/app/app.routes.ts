import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: '', loadComponent: () => import('./pages/workspace/workspace.component').then(m => m.WorkspaceComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
