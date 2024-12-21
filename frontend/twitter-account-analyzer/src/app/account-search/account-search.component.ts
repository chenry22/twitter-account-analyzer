import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatError, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-account-search',
  imports: [MatInputModule, MatIconModule, MatButtonModule, MatError,
    CommonModule, FormsModule],
  templateUrl: './account-search.component.html',
  styleUrl: './account-search.component.css'
})
export class AccountSearchComponent {
  username: string = '';
  constructor(private router: Router){ }

  onKeydown(event: KeyboardEvent): void {
    if (!/^[a-zA-Z0-9_]*$/.test(event.key)) {
      event.preventDefault();
    }
  }
  validHandle(handle: string): boolean {
    return /^[a-zA-Z0-9_]{3,15}$/.test(handle.trim())
  }

  onSearch(form: any): void {
    if (form.valid && this.validHandle(this.username)) {
      this.router.navigate(['/account/' + this.username.toLowerCase()]);
    }
  }
}
