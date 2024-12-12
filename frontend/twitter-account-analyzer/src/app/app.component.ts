import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgApexchartsModule } from "ng-apexcharts";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule, NgApexchartsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  title = 'twitter-account-analyzer';

  home(): void {
    this.router.navigate(['/']);
  }
  about(): void {
    this.router.navigate(['/about']);
  }
}
