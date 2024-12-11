import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-account-search',
  imports: [MatInputModule, MatIconModule, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './account-search.component.html',
  styleUrl: './account-search.component.css'
})
export class AccountSearchComponent {
  username: string = '';
  constructor(private router: Router){ }

  onSearch(form: any): void {
    if (form.valid) {
      this.router.navigate(['/account/' + this.username]);
    } else {
      console.log('Form is invalid');
    }
  }
}
