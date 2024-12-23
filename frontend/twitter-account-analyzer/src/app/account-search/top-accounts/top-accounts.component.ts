import { Component } from '@angular/core';
import { Database } from '@angular/fire/database';

export interface TopAccounts {

}

// @Injectable({providedIn: 'root'})
// export class AccountDataService {
//   constructor(private db: Database) {}

//   async getTopAccounts() : Promise<TopAccounts | null> {

//   }
// }

@Component({
  selector: 'top-accounts',
  imports: [],
  templateUrl: './top-accounts.component.html',
  styleUrl: './top-accounts.component.css'
})
export class TopAccountsComponent {

}
