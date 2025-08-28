import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WoprChat } from './wopr-chat/wopr-chat';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WoprChat],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'WOPR - War Operation Plan Response';
}
