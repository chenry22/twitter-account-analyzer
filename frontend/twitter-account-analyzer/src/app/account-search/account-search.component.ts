import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-account-search',
  imports: [MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './account-search.component.html',
  styleUrl: './account-search.component.css'
})
export class AccountSearchComponent {

}
