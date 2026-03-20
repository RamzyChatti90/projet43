import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MainComponent } from './layouts/main/main.component';

// Import the CarnivalWidgetComponent
import { CarnivalWidgetComponent } from '../carnival-widget/carnival-widget.component';

@Component({
  standalone: true,
  selector: 'jhi-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    NgbModule,
    MainComponent,
    // Add CarnivalWidgetComponent to the imports array to make it available in the template
    CarnivalWidgetComponent,
  ],
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Application-wide initialization logic can go here
  }
}