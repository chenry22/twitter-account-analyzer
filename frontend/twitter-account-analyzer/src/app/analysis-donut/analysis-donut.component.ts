import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ApexOptions, ChartComponent, NgApexchartsModule } from "ng-apexcharts";
import { EmotionAnalysis, HateAnalysis, IronyAnalysis, OffensiveAnalysis, SentimentAnalysis, TopicAnalysis  } from '../account-data';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

const MIN_PERCENT_THRESHOLD = 0.02 // cutoff for showing in donut

@Component({
  selector: 'analysis-donut',
  imports: [MatIconModule, MatCardModule, NgApexchartsModule],
  templateUrl: './analysis-donut.component.html',
  styleUrl: './analysis-donut.component.css'
})
export class AnalysisDonutComponent implements OnChanges{
  hexColor: {[key: string]: string} = {
    "red" : "#FF2C4D", "gray" : "#b6b2bd", "green" : "#29d038",
    "purple" : "#7e3994", "light-green" : "#69ff74", "blue" : "#4b53da",
    "dark-blue" : "#272b6b", "light-blue" : "#a6bcfb", "orange" : "#ffa438",
    "gold" : "#e4cb0e", "yellow" : "#f3eb21", "pink" : "#fb89dd",
    "maroon" : "#4c1c73", "brown" : "#bf6121", "dark-red" : "#901120",
    "light-red" : "#fd4d5d", "teal" : "#3ccebe", "light-purple" : "#d397fb",
    "dark-green" : "#2b5832"
  }
  labelToIcon: {[key: string]: string} = {
    "Negative" : "sentiment_dissatisfied", "Neutral" : "sentiment_neutral", "Positive" : "sentiment_satisfied",
    "Fear" : "running_with_errors", "Anger" : "local_fire_department", "Disgust" : "sick", "Sadness" : "sentiment_dissatisfied", "Pessimism" : "umbrella", "Anticipation" : "gpp_maybe",
      "Trust" : "self_improvement", "Surprise" : "celebration", "Optimism" : "wb_sunny", "Joy" : "wb_sunny", "Love" : "favorite",
    "Hate" : "warning", "Not Hate" : "task_alt",
    "Irony" : "iron" , "Non-Irony" : "sentiment_neutral",
    "Offensive" : "warning", "Non-Offensive" : "task_alt",
    "Arts" : "brush", "Business" : "savings", "Celebrity/Pop Culture" : "hotel_class",
      "Personal Life" : "book", "Family" : "diversity_3", "Fashion/Style" : "diamond",
      "Film/Video" : "videocam", "Fitness/Health" : "fitness_center", "Food" : "restaurant",
      "Gaming" : "sports_esports", "Education" : "school", "Music" : "music_note",
      "News/Social Concern" : "newspaper", "Other" : "inventory_2", "Relationships" : "diversity_1",
      "Science" : "biotech", "Sports" : "sports_basketball", "Travel" : "flight_takeoff", "Youth/Student Life" : "backpack"
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
  label: string = "-"

  @ViewChild("chart")chart!: ChartComponent;
  public chartOptions: ApexOptions = {
    chart: { type: "donut", width: "100%" },
    series: [], labels: [], colors: [],
    legend: { show: false },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { show: false }
      }
    }]
  };

  setAnalysis(analysis: any) {
    var data: number[] = [];
    var labels: string[] = [];
    var colors: string[] = [];
    if(this.isSentimentAnalysis(analysis)){
      this.title = "Sentiment"
      data = [analysis.negative, analysis.neutral, analysis.positive]
      labels = ["Negative", "Neutral", "Positive"]
      colors = [this.hexColor["red"], this.hexColor["gray"], this.hexColor["green"]]
    } else if (this.isEmotionAnalysis(analysis)){
      this.title = "Emotion"
      data = [
        analysis.fear, analysis.anger, analysis.disgust, analysis.sadness,
        analysis.pessimism, analysis.anticipation, analysis.trust, analysis.surprise,
        analysis.optimism, analysis.joy, analysis.love,
      ];
      labels = ["Fear", "Anger", "Disgust", "Sadness", "Pessimism", "Anticipation",
        "Trust", "Surprise", "Optimism", "Joy", "Love"];
      colors = [this.hexColor["purple"], this.hexColor["red"], this.hexColor["green"],
        this.hexColor["blue"], this.hexColor["dark-blue"], this.hexColor["light-blue"],
        this.hexColor["light-green"], this.hexColor["orange"], this.hexColor["gold"],
        this.hexColor["yellow"], this.hexColor["pink"]];
    } else if(this.isHateAnalysis(analysis)){
      this.title = "Hateful Content"
      data = [analysis.hate, analysis.not_hate]
      labels = ["Hate", "Not Hate"]
      colors = [this.hexColor["red"], this.hexColor["green"]]
    } else if(this.isIronyAnalysis(analysis)){
      this.title = "Irony"
      data = [analysis.irony, analysis.non_irony]
      labels = ["Irony", "Non-Irony"]
      colors = [this.hexColor["blue"], this.hexColor["light-blue"]]
    } else if(this.isOffensiveAnalysis(analysis)){
      this.title = "Offensive Content"
      data  = [analysis.offensive, analysis['non-offensive']]
      labels = ["Offensive", "Non-Offensive"]
      colors = [this.hexColor["red"], this.hexColor["green"]]
    } else if(this.isTopicAnalysis(analysis)){
      this.title = "Topics"
      data = [
        analysis['arts_&_culture'], analysis['business_&_entrepreneurs'], analysis['celebrity_&_pop_culture'],
        analysis['diaries_&_daily_life'], analysis.family, analysis['fashion_&_style'], 
        analysis['film_tv_&_video'], analysis['fitness_&_health'], analysis['food_&_dining'],
        analysis.gaming, analysis['learning_&_educational'], analysis.music,
        analysis['news_&_social_concern'], analysis.relationships, analysis['science_&_technology'],
        analysis.sports, analysis['travel_&_adventure'], analysis['youth_&_student_life']
      ]
      labels = [
        "Arts", "Business", "Celebrity/Pop Culture",
        "Personal Life", "Family", "Fashion/Style",
        "Film/Video", "Fitness/Health", "Food",
        "Gaming", "Education", "Music",
        "News/Social Concern", "Relationships", "Science",
        "Sports", "Travel", "Youth/Student Life"
      ]
      colors = [
        this.hexColor["red"], this.hexColor["gold"], this.hexColor["yellow"], 
        this.hexColor["pink"], this.hexColor["light-blue"], this.hexColor["maroon"],
        this.hexColor["dark-blue"], this.hexColor["green"], this.hexColor["brown"], 
        this.hexColor["blue"], this.hexColor["dark-red"], this.hexColor["light-green"],
        this.hexColor["light-red"], this.hexColor["gold"], this.hexColor["dark-green"],
        this.hexColor["orange"], this.hexColor["teal"], this.hexColor["light-purple"]
      ]

      var other = analysis.other_hobbies
      for(var i = 0; i < data.length; i++){
        if( data[i] < MIN_PERCENT_THRESHOLD){
          other += data[i];
          data.splice(i, 1);
          labels.splice(i, 1);
          colors.splice(i, 1);
          i--;
        }
      }
      const sortedIndices = data.map((val, i) => ({ val, i })).sort((a, b) => a.val - b.val).map(item => item.i);
      data = sortedIndices.map(i => data[i])
      labels = sortedIndices.map(i => labels[i])
      colors = sortedIndices.map(i => colors[i])
      data.unshift(other)
      labels.unshift("Other")
      colors.unshift(this.hexColor["gray"])
    } else {
      console.error("Unrecognized input in analysis-donut...")
      return;
    }

    this.label = labels[data.indexOf(Math.max(...data))]
    this.icon = this.labelToIcon[this.label]
    this.chartOptions = {
      chart: {
        type: "donut",
        width: "100%"
      },
      series: data, labels: labels, colors: colors,
      legend: { show: false },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: {
            show: true,
            position: "bottom"
          }
        }
      }]
    };
  }
}