import { Component, Injectable, inject, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { Account, Analysis } from '../account-data';
import { Database, ref, get, update } from '@angular/fire/database'
import { ActivatedRoute, Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA,
  MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog'

import { AnalysisDonutComponent } from '../analysis-donut/analysis-donut.component';
import { FrequencyAnalysisComponent } from '../frequency-analysis/frequency-analysis.component';
import { AccountPostsComponent } from '../account-posts/account-posts.component';

// TODO: fix injectable error thing idk might be a bug in the actual AngularFire library as far as I can tell from reading forums
@Injectable({providedIn: 'root'})
export class AccountDataService {
  constructor(private db: Database) {}

  async getAccountData(username: string) : Promise<Account | null> {
    const accountRef = ref(this.db, "Accounts/" + username)
    const snapshot = await get(accountRef);
    if(snapshot.exists()){
      var accountData: Account = snapshot.val()
      var date = new Date(Date.parse(accountData!.created));
      accountData!.created = date.toLocaleString('default', { day: "numeric", month: "long", year: "numeric" });
      if(accountData!.location== ""){
        accountData!.location = "None"
      }
      return accountData
    }
    // if no cached entry, send request to create one
    update(ref(this.db, "Requests/" + username), { requested : Date.now() });
    return null;
  }
  async getAccountAnalysis(username: string, account: Account) : Promise<Analysis | null> {
    const analysisRef = ref(this.db, "Analysis/" + account.accountID)
    const snapshot = await get(analysisRef);
    if(snapshot.exists()){
      const data = snapshot.val()
      // TODO: this default values thing is stupid but I think its actually the simplest solution unfortunately
      var emotions = { ...{anger: 0, anticipation: 0, disgust: 0, fear: 0, joy: 0,
        love: 0, optimism: 0, pessimism: 0, sadness: 0, surprise: 0, trust: 0}, ...data.emotions }
      var hates = {...{hate_age: 0, hate_disability: 0, hate_gender: 0,
        hate_origin: 0, hate_race: 0, hate_religion: 0, hate_sexuality: 0, not_hate: 0}, ...data.hate}
      var irony = {...{irony: 0, non_irony: 0}, ...data.irony}
      var offensive = {...{offensive: 0, 'non-offensive': 0}, ...data.offensive}
      var sentiment = {...{negative: 0, neutral: 0, positive: 0}, ...data.sentiment}
      var topics = {...{'arts_&_culture': 0, 'fashion_&_style': 0, 'learning_&_educational': 0, 'science_&_technology': 0,
        'business_&_entrepreneurs': 0, 'film_tv_&_video': 0, music: 0, sports: 0, 'celebrity_&_pop_culture': 0,
        'fitness_&_health': 0, 'news_&_social_concern': 0, 'travel_&_adventure': 0, 'diaries_&_daily_life': 0, 'food_&_dining': 0,
        'other_hobbies': 0, 'youth_&_student_life': 0, family: 0, gaming: 0, relationships: 0}, ...data.topics}
      return {
        emotions: emotions, hate: hates, irony: irony, offensive: offensive,
        sentiment: sentiment, topics: topics, word_frequencies: data.word_frequencies
      }
    }

    // add request to scrape + analyze account
    update(ref(this.db, "Requests/" + username), { requested : Date.now() });
    return null;
  }
}

@Component({
  selector: 'app-account-data',
  imports: [MatIconModule, MatButtonModule, MatCardModule,
    AnalysisDonutComponent, FrequencyAnalysisComponent, AccountPostsComponent],
  templateUrl: './account-data.component.html',
  styleUrl: './account-data.component.css'
})
export class AccountDataComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private data: AccountDataService) { }
  readonly dialog = inject(MatDialog);

  username: string = "-";
  accountURL: string = "";
  pfpLarge: string = "";
  accountData: Account | null = null;
  analysis: Analysis | null = null;

  async ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username') || '';
    try {
      const account = await this.data.getAccountData(this.username);
      if (account) {
        this.accountData = account;
        this.pfpLarge = this.accountData.pfpURL.replace("_normal", "_400x400");
        this.accountURL = account.url

        const analysis = await this.data.getAccountAnalysis(this.username, this.accountData);
        this.analysis = analysis;
      } else {
        this.showUserMessage()
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  showUserMessage(): void {
    const dialogRef = this.dialog.open(RequestSentDialog, {
      width: '400px',
      data: { username: this.username }
    });
    dialogRef.afterClosed().subscribe(_ => { this.backToMain() })
  }

  backToMain(): void {
    this.router.navigate(['/'])
  }
}

@Component({
  selector: 'request-sent-dialog',
  templateUrl: "request-sent-dialog.html",
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestSentDialog {
  constructor(public dialogRef: MatDialogRef<RequestSentDialog>, 
    @Inject(MAT_DIALOG_DATA) public data: any) { }
}