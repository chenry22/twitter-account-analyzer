import { Component, OnInit } from '@angular/core';
import { AccountDataService } from '../account-data.service';
import { Account } from '../account-data';
import { ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-account-data',
  imports: [MatToolbarModule],
  templateUrl: './account-data.component.html',
  styleUrl: './account-data.component.css'
})
export class AccountDataComponent implements OnInit {
  constructor(private route: ActivatedRoute, private accountDataService: AccountDataService) { }
  username: string = "-";
  pfpLarge: string = "";
  accountData: Account|null = null;

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username') || '';
    // TODO: unlock this, just for testing so i dont make any accidental API calls...
    if(["lisco_2000", "mobilebosco"].indexOf(this.username) > -1){
      // don't send invalid requests...
      this.getAccountData();
    } else {
      console.log("invalid username request")
    }
  }

  getAccountData() {
    this.accountDataService.getAccountData(this.username).subscribe({
      next: (data) => {
        this.accountData = data
        this.pfpLarge = data?.pfpURL.replace("_normal", "_400x400");
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
}
