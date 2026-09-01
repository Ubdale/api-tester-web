import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

type JsonKind = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

@Component({
  selector: 'app-json-tree',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="tnode">
      <div class="tline">
        <mat-icon class="ttoggle" *ngIf="isContainer" (click)="collapsed = !collapsed">
          {{ collapsed ? 'chevron_right' : 'expand_more' }}
        </mat-icon>
        <span class="ttoggle" *ngIf="!isContainer">&nbsp;</span>
        <span class="jk" *ngIf="keyLabel !== null">"{{ keyLabel }}": </span>

        <ng-container *ngIf="isContainer; else leaf">
          <span class="tbracket">{{ openChar }}</span>
          <span class="tsummary" *ngIf="collapsed"> {{ entries.length }} {{ kind === 'array' ? 'items' : 'keys' }} {{ closeChar }}</span>
        </ng-container>
        <ng-template #leaf>
          <span [ngClass]="leafClass">{{ leafText }}</span>
        </ng-template>
      </div>

      <div class="tchildren" *ngIf="isContainer && !collapsed">
        <app-json-tree
          *ngFor="let e of entries"
          [keyLabel]="kind === 'array' ? null : e[0]"
          [value]="e[1]">
        </app-json-tree>
      </div>
      <div class="tclose" *ngIf="isContainer && !collapsed">{{ closeChar }}</div>
    </div>
  `,
  styles: [`
    .tline{ white-space:pre-wrap; word-break:break-word; font-family:var(--mono); font-size:12.5px; line-height:1.7; }
    .ttoggle{ display:inline-block; width:16px; height:16px; font-size:16px; vertical-align:-3px; color:var(--text-faint); cursor:pointer; user-select:none; }
    .tbracket{ color:var(--text-dim); }
    .tsummary{ color:var(--text-faint); font-style:italic; }
    .tclose{ color:var(--text-dim); font-family:var(--mono); font-size:12.5px; }
    .tchildren{ border-left:1px solid var(--border-soft); margin-left:6px; padding-left:6px; }
    .jk{ color:var(--blue); font-family:var(--mono); font-size:12.5px; }
    .js{ color:var(--green); }
    .jn{ color:var(--amber); }
    .jb{ color:var(--purple); }
    .jnull{ color:var(--text-faint); }
  `]
})
export class JsonTreeComponent {
  @Input() keyLabel: string | number | null = null;
  @Input() value: any;
  collapsed = false;

  get kind(): JsonKind {
    if (this.value === null) return 'null';
    if (Array.isArray(this.value)) return 'array';
    return typeof this.value as JsonKind;
  }
  get isContainer(): boolean {
    return this.kind === 'object' || this.kind === 'array';
  }
  get openChar(): string { return this.kind === 'array' ? '[' : '{'; }
  get closeChar(): string { return this.kind === 'array' ? ']' : '}'; }
  get entries(): [string | number, any][] {
    if (this.kind === 'array') return (this.value as any[]).map((v, i) => [i, v]);
    if (this.kind === 'object') return Object.entries(this.value);
    return [];
  }
  get leafClass(): string {
    const classes: Partial<Record<JsonKind, string>> = { string: 'js', number: 'jn', boolean: 'jb', null: 'jnull' };
    return classes[this.kind] || 'jn';
  }
  get leafText(): string {
    if (this.kind === 'string') return JSON.stringify(this.value);
    if (this.kind === 'null') return 'null';
    return String(this.value);
  }
}
