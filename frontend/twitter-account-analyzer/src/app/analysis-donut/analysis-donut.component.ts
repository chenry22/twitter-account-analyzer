import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ApexNonAxisChartSeries, ApexResponsive, ApexChart, ChartComponent, NgApexchartsModule } from "ng-apexcharts";
import { EmotionAnalysis, HateAnalysis, IronyAnalysis, OffensiveAnalysis, SentimentAnalysis, TopicAnalysis  } from '../account-data';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'analysis-donut',
  imports: [MatIconModule, MatCardModule, NgApexchartsModule],
  templateUrl: './analysis-donut.component.html',
  styleUrl: './analysis-donut.component.css'
})
export class AnalysisDonutComponent implements OnChanges{
  labelToIcon: {[key: string]: string} = {
    "Negative" : "sentiment_dissatisfied", "Neutral" : "sentiment_neutral", "Positive" : "sentiment_satisfied",
    "Fear" : "sentiment_stressed", "Anger" : "sentiment_extremely_dissatisfied", "Disgust" : "sick", "Sadness" : "sentiment_dissatisfied", "Pessimism" : "sentiment_sad", "Anticipation" : "sentiment_worried",
      "Trust" : "sentiment_content", "Surprise" : "celebration", "Optimism" : "sentiment_satisfied", "Joy" : "sentiment_excited", "Love" : "favorite",
    "Hate" : "sentiment_extremely_dissatisfied", "Not Hate" : "sentiment_calm",
    "Irony" : "psychology_alt" , "Non-Irony" : "block",
    "Offensive" : "priority_high", "Non-Offensive" : "task_alt",
    "Arts" : "brush", "Business" : "savings", "Celebrity/Pop Culture" : "hotel_class",
      "Personal Life" : "book", "Family" : "diversity_3", "Fashion/Style" : "apparel",
      "Film/Video" : "videocam", "Fitness/Health" : "body_system", "Food" : "restaurant",
      "Gaming" : "sports_esports", "Education" : "school", "Music" : "music_note",
      "News/Social Concern" : "newsmode", "Other" : "inventory_2", "Relationships" : "diversity_1",
      "Science" : "biotech", "Sports" : "sports_basketball", "Travel" : "flight_takeoff", "Youth/Student Life" : "personal_bag"
  }

  // there's probably a better way to do this, I'm not aware of it though :(
  isSentimentAnalysis(value: SentimentAnalysis): value is SentimentAnalysis  { return value.positive != null; }
  isEmotionAnalysis(value: EmotionAnalysis): value is EmotionAnalysis  { return value.anger != null; }
  isHateAnalysis(value: HateAnalysis): value is HateAnalysis  { return value.hate != null; }
  isIronyAnalysis(value: IronyAnalysis): value is IronyAnalysis  { return value.irony != null; }
  isOffensiveAnalysis(value: OffensiveAnalysis): value is OffensiveAnalysis  { return value.offensive != null; }
  isTopicAnalysis(value: TopicAnalysis): value is TopicAnalysis  { return value['arts_&_culture'] != null; }

  @Input() analysis: any;
  ngOnChanges(changes: SimpleChanges): void {
      if(changes['analysis'].currentValue){
        this.setAnalysis(changes['analysis'].currentValue)
      }
  }

  icon: string = "question_mark";
  title: string = "---"

  @ViewChild("chart")chart!: ChartComponent;
  public chartOptions: ChartOptions = {
    series: [],
    chart: { type: "donut" },
    labels: [],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: "bottom" }
      }
    }]
  };

  setAnalysis(analysis: any) {
    var data: number[] = [];
    var labels: string[] = [];
    if(this.isSentimentAnalysis(analysis)){
      this.title = "Sentiment"
      data = [analysis.negative, analysis.neutral, analysis.positive]
      labels = ["Negative", "Neutral", "Positive"]
    } else if (this.isEmotionAnalysis(analysis)){
      this.title = "Emotion"
      data = [
        analysis.fear, analysis.anger, analysis.disgust, analysis.sadness,
        analysis.pessimism, analysis.anticipation, analysis.trust, analysis.surprise,
        analysis.optimism, analysis.joy, analysis.love,
      ];
      labels = [ "Fear", "Anger", "Disgust", "Sadness", "Pessimism", "Anticipation",
        "Trust", "Surprise", "Optimism", "Joy", "Love" ];
    } else if(this.isHateAnalysis(analysis)){
      this.title = "Hateful Content"
      data = [analysis.hate, analysis.not_hate]
      labels = ["Hate", "Not Hate"]
    } else if(this.isIronyAnalysis(analysis)){
      this.title = "Irony"
      data = [analysis.irony, analysis.non_irony]
      labels = ["Irony", "Non-Irony"]
    } else if(this.isOffensiveAnalysis(analysis)){
      this.title = "Offensive Content"
      data  = [analysis.offensive, analysis['non-offensive']]
      labels = ["Offensive", "Non-Offensive"]
    } else if(this.isTopicAnalysis(analysis)){
      this.title = "Topics"
      data = [
        analysis['arts_&_culture'], analysis['business_&_entrepreneurs'], analysis['celebrity_&_pop_culture'],
        analysis['diaries_&_daily_life'], analysis.family, analysis['fashion_&_style'], 
        analysis['film_tv_&_video'], analysis['fitness_&_health'], analysis['food_&_dining'],
        analysis.gaming, analysis['learning_&_educational'], analysis.music,
        analysis['news_&_social_concern'], analysis.other_hobbies, analysis.relationships,
        analysis['science_&_technology'], analysis.sports, analysis['travel_&_adventure'],
        analysis['youth_&_student_life']
      ]
      labels = [
        "Arts", "Business", "Celebrity/Pop Culture",
        "Personal Life", "Family", "Fashion/Style",
        "Film/Video", "Fitness/Health", "Food",
        "Gaming", "Education", "Music",
        "News/Social Concern", "Other", "Relationships",
        "Science", "Sports", "Travel", "Youth/Student Life"
      ]
    } else {
      console.error("Unrecognized input in analysis-donut...")
      return;
    }

    this.icon = this.labelToIcon[labels[data.indexOf(Math.max(...data))]]
    this.chartOptions = {
      series: data,
      chart: { type: "donut" },
      labels: labels,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: "bottom" }
        }
      }]
    };
  }
}