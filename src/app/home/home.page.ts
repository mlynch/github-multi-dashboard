import { Component } from '@angular/core';
import { GitHubService, GitHubResponse, Issue, GitHubEdge, GitHubNode, GitHubEdges, Reaction } from '../github.service';

// import * as timeago from 'timeago.js';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';

interface ComputedIssue extends GitHubNode<Issue> {
  emoji: string;
  isStarred: boolean;
  reactionGroups: ReactionGroup[];
}

interface ReactionGroup {
  content: string;
  emoji: string;
  count: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  data: any;

  allIssues: ComputedIssue[] = [];

  loading: HTMLIonLoadingElement;

  repoOrgName: string;
  repoName: string;
  filter: string;

  starred: string[];

  now: number;

  constructor(public github: GitHubService,
              private loadingCtrl: LoadingController,
              private route: ActivatedRoute) {
    
    this.now = +new Date;
  }

  async ionViewWillEnter() {
    this.filter = this.route.snapshot.paramMap.get('filter');
    this.repoOrgName = this.route.snapshot.paramMap.get('repoOrgName');
    this.repoName = this.route.snapshot.paramMap.get('repoName');

    const loading = await this.loadingCtrl.create({
      message: 'Loading issues'
    });
    this.loading = loading;
    await loading.present();

    this.github.issueChange$.subscribe((issue) => {
      console.log('Issue changed', issue);
      this.allIssues = this.allIssues.map(issueEdge => {
        if (issueEdge.node.id === issue.id) {
          return {
            ...issueEdge,
            isStarred: this.isStarred(issue)
          }
        }
        return issueEdge;
      });
      
      if (!this.github.isStarred(issue) && this.filter === 'starred') {
        this.allIssues = this.allIssues.filter(issueEdge => {
          if (issueEdge.node.id === issue.id) {
            return false;
          }
          return true;
        });
      }
    });

    this.github.repoEntriesChange$.subscribe((entries) => {
      this.doQuery();
    });

    this.doQuery();
  }

  doQuery() {
    if (!this.repoOrgName) {
      this.github.queryAllRepos().subscribe(this.handleQueryResponse.bind(this));
    } else {
      this.github.queryRepo(this.repoOrgName, this.repoName).subscribe(this.handleQueryResponse.bind(this));
    }
  }

  handleQueryResponse(data: GitHubResponse[] | GitHubResponse) {
    setTimeout(() => {
      this.loading && this.loading.dismiss();
    }, 200);

    console.log('Got query response', data);
    this.data = data;

    let dataEntries: GitHubResponse[] = ((data as any).length) ? data as GitHubResponse[] : [ data as GitHubResponse ];
    let allIssues: GitHubNode<Issue>[] = [];
    for (const d of dataEntries) {
      let dEntries;
      if (this.filter === 'starred') {
        dEntries = d.data.repository.issues.edges.filter(issue => this.isStarred(issue.node));
      } else {
        dEntries = d.data.repository.issues.edges;
      }

      allIssues = allIssues.concat(dEntries);
    }

    this.allIssues = this.sort(this.processIssues([...this.allIssues, ...allIssues]));
  }

  processIssues(issues: GitHubNode<Issue>[]) {
    return issues.map((issue: GitHubNode<Issue>) => {
      return {
        ...issue,
        isStarred: this.isStarred(issue.node),
        reactionGroups: this.getReactionsGrouped(issue.node.reactions)
      }
    });
  }

  // Weighted sort for different metrics
  sort(items) {
    return items.sort((a, b) => {
      const aScore = this.getScore(a);
      const bScore = this.getScore(b);
      return bScore - aScore;
    });
  }

  getScore(a) {
    const commentsWeight = 10;
    const reactionsWeight = 20;
    const dateWeight = 0.00000001;
    const now = +new Date;
    const d1 = now - +Date.parse(a.node.updatedAt);
    const numComments1 = a.node.comments.edges.length;
    const numReactions1 = a.node.reactions.edges.length;
    return (d1 * dateWeight + numComments1 * commentsWeight + numReactions1 * reactionsWeight);
  }

  openIssue(issue: Issue) {
    window.open(issue.node.url, '_blank');
  }

  starIssue(issue: Issue) {
    this.github.starIssue(issue);
  }

  isStarred(issue: Issue) {
    return this.github.isStarred(issue);
  }

  getReactionsGrouped(reactions: GitHubEdges<Reaction>) {
    const reactionGroups = [];
    const reactionsMapped = reactions.edges.reduce((prev, current) => {
      // console.log(prev, current);
      const content = current.node.content;
      if(!(content in prev)) {
        prev[content] = 0;
      }
      prev[content]++;
      return prev;
    }, {});

    for (let key in reactionsMapped) {
      reactionGroups.push({
        content: key,
        emoji: this.getEmojiForContent(key),
        count: reactionsMapped[key]
      });
    }
    return reactionGroups;
  }

  getEmojiForContent(content: string) {
    console.log('Emjoi content', content);
    switch (content) {
      case 'CONFUSED': return '😕';
      case 'HEART': return '❤️';
      case 'HOORAY': return '🎉';
      case 'LAUGH': return '😄';
      case 'THUMBS_DOWN': return '👎';
      case 'THUMBS_UP': return '👍';
      case 'ROCKET': return '🚀';
      case 'EYES': return '👀';
    }
    return '';
  }
}
