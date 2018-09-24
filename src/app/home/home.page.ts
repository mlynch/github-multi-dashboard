import { Component } from '@angular/core';
import { GitHubService } from '../git-hub.service';

import timeago from 'timeago.js';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  data: any;

  allIssues = [];

  constructor(public github: GitHubService) {
    github.queryAllRepos().subscribe((data) => {
      this.data = data;
      for (const d of data) {
        this.allIssues = this.sort([...this.allIssues, ...d.data.repository.issues.edges]);
      }
    });
  }

  sort(items) {
    const commentsWeight = 10;
    const reactionsWeight = 10;
    const dateWeight = 0.0000001;
    return items.sort((a, b) => {
      const d1 = +Date.parse(a.node.updatedAt);
      const d2 = +Date.parse(b.node.updatedAt);
      const dateDiff = d1 - d2;
      const numComments1 = a.node.comments.edges.length;
      const numComments2 = b.node.comments.edges.length;
      const commentsDiff = numComments1 - numComments2;
      const numReactions1 = a.node.reactions.edges.length;
      const numReactions2 = a.node.reactions.edges.length;
      const reactionsDiff = numReactions1 - numReactions2;

      console.log('Comparing', d1, numComments1, numReactions1, a.node.url, d2, numComments2, numReactions2, b.node.url);
      return (d2 * dateWeight + numComments2 * commentsWeight + numReactions2 * reactionsWeight) -
             (d1 * dateWeight + numComments1 * commentsWeight + numReactions1 * reactionsWeight);
    });
  }

  openIssue(issue) {
    console.log('Opening issue', issue);
    Object.assign(document.createElement('a'), { target: '_blank', href: issue.node.url}).click();
  }

  getUpdatedAtDate(date) {
    return timeago().format(date);
  }
}
