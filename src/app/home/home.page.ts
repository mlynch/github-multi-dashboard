import { Component } from '@angular/core';
import { GitHubService } from '../git-hub.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  data: any;

  allComments = [];

  constructor(public github: GitHubService) {
    github.queryAllRepos().subscribe((data) => {
      this.data = data;
      console.log('Loaded repo data', data);
      for (let d of data) {
        this.allComments = [...this.allComments, ...d.data.repository.issues.edges];
      }
    });
  }
}
