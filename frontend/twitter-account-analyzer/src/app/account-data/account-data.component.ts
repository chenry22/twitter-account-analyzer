import { Component, OnInit } from '@angular/core';
import { AccountDataService } from '../account-data.service';
import { Account, Analysis, EmotionAnalysis, HateAnalysis } from '../account-data';
import { ActivatedRoute, Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AnalysisDonutComponent } from '../analysis-donut/analysis-donut.component';

@Component({
  selector: 'app-account-data',
  imports: [MatIconModule, MatButtonModule, 
    MatCardModule, AnalysisDonutComponent],
  templateUrl: './account-data.component.html',
  styleUrl: './account-data.component.css'
})
export class AccountDataComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private accountDataService: AccountDataService) { }
  username: string = "-";
  pfpLarge: string = "";
  accountData: Account|null = null;
  analysis: Analysis | null = null;

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username') || '';
    // TODO: unlock this, just for testing so i dont make any accidental API calls...
    if(["lisco_2000", "mobilebosco"].indexOf(this.username) > -1){
      // don't send invalid requests...
      this.getAccountAnalysis();
    } else {
      console.log("invalid username request")
      alert("That user does not exist...")
      this.backToMain()
    }
  }

  backToMain(): void {
    this.router.navigate(['/'])
  }

  getAccountAnalysis() {
    this.accountDataService.getAccountAnalysis(this.username).subscribe({
      next: (data) => {
        this.accountData = data.profile

        this.pfpLarge = this.accountData.pfpURL.replace("_normal", "_400x400");
        var date = new Date(Date.parse(this.accountData.created));
        this.accountData.created = date.toLocaleString('default', { day: "numeric", month: "long", year: "numeric" });
        if(this.accountData.location== ""){
          this.accountData.location = "None"
        }

        // TODO: this default values thing is stupid but I think its actually the simplest solution unfortunately
        var emotions = { ...{anger: 0, anticipation: 0, disgust: 0, fear: 0, joy: 0,
          love: 0, optimism: 0, pessimism: 0, sadness: 0, surprise: 0, trust: 0}, ...data.analysis.emotions }
        var hates = {...{hate: 0, not_hate: 0}, ...data.analysis.hate}
        var irony = {...{irony: 0, non_irony: 0}, ...data.analysis.irony}
        var offensive = {...{offensive: 0, 'non-offensive': 0}, ...data.analysis.offensive}
        var sentiment = {...{negative: 0, neutral: 0, positive: 0}, ...data.analysis.sentiment}
        var topics = {...{'arts_&_culture': 0, 'fashion_&_style': 0, 'learning_&_educational': 0, 'science_&_technology': 0,
          'business_&_entrepreneurs': 0, 'film_tv_&_video': 0, music: 0, sports: 0, 'celebrity_&_pop_culture': 0,
          'fitness_&_health': 0, 'news_&_social_concern': 0, 'travel_&_adventure': 0, 'diaries_&_daily_life': 0, 'food_&_dining': 0,
          'other_hobbies': 0, 'youth_&_student_life': 0, family: 0, gaming: 0, relationships: 0}, ...data.analysis.topics}

        this.analysis = {
          emotions: emotions,
          hate: hates,
          irony: irony,
          offensive: offensive,
          sentiment: sentiment,
          topics: topics
        }
      }, 
      error: (error) => {
        console.log(error);
      }
    })
  }
}
