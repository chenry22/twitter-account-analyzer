import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Account, AccountAnalysis } from './account-data';

@Injectable({
  providedIn: 'root'
})
export class AccountDataService {
  constructor(private http: HttpClient) { }

  getAccountData(username: string): Observable<Account> {
    return this.http.get('http://127.0.0.1:8000/api/v1/accountSummary/' + username) as Observable<Account>;
  }

  getAccountAnalysis(username: string): Observable<AccountAnalysis> {
    return this.http.get('http://127.0.0.1:8000/api/v1/accountAnalysis/' + username) as Observable<AccountAnalysis>;
  }
}
