import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { WoprChat } from './wopr-chat/wopr-chat';

@Component({
  selector: 'app-root',
  imports: [CommonModule, WoprChat],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
