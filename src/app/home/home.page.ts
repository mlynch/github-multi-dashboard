import { Component } from '@angular/core';
import { GitHubService } from '../git-hub.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public github: GitHubService) {
  }
}
