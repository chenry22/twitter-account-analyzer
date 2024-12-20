import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FrequencyAnalysis } from '../account-data'
import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";

@Component({
  selector: 'frequency-analysis',
  imports: [NgApexchartsModule],
  templateUrl: './frequency-analysis.component.html',
  styleUrl: './frequency-analysis.component.css'
})
export class FrequencyAnalysisComponent implements OnChanges {
  @Input() wordFreqs: FrequencyAnalysis | undefined
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['wordFreqs'].currentValue){
      this.setFrequency(changes['wordFreqs'].currentValue)
    }
  }

  public freqChartOptions: ApexOptions = {
    chart: { type: "treemap", width: "430px", height: "300px" },
    title: { text: "Words" },
    series: [],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 }
      }
    }]
  };
  public bigramChartOptions: ApexOptions = {
    chart: { type: "treemap", width: "430px", height: "300px" },
    title: { text: "Phrases" },
    series: [],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 }
      }
    }]
  };

  setFrequency(wordFreqs: FrequencyAnalysis){
    this.freqChartOptions.series = [{
      data : Array.from(wordFreqs.words.values()).map(val => ({
        'x' : val.word,
        'y' : val.abs_freq
      }))
    }]
    this.bigramChartOptions.series = [{
      data : Array.from(wordFreqs.bigrams.values()).map(val => ({
        'x' : val.word,
        'y' : val.abs_freq
      }))
    }]
  }

}
