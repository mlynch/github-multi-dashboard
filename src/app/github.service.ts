import { Injectable, Output } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription, forkJoin, merge, Observable, Subject } from 'rxjs';

import { ConfigService } from './config.service';

import { Storage } from '@ionic/storage';

const RepoQuery = gql`
  query RepositoryForOwnerAndName($owner: String!, $name: String!) {
    repository(owner:$owner, name:$name) {
      name
      nameWithOwner
      url
      owner {
        id
      }
      issues(first:100, orderBy: { field: UPDATED_AT, direction: DESC }) {
        edges {
          node {
            title
            number
            createdAt
            updatedAt
            url
            state
            labels(first:100) {
              nodes {
                name
                color
              }
            }
            repository {
              nameWithOwner
            }
            comments(first:100) {
              edges {
                node {
                  id
                }
              }
            }
            reactions(first:100) {
              edges {
                node {
                  id
                  content
                }
              }
            }
            id
          }
        }
      }
    }
  }
`;

export interface GitHubEdge<T> {
  node: T;
}

export interface GitHubNode<T> {
  node: T;
}

export interface GitHubEdges<T> {
  edges: GitHubNode<T>[];
}

export type GitHubNodes<T> = GitHubNode<T>[];

export interface GitHubResponse {
  data: {
    repository: Repository;
  }
}

export interface Issue extends GitHubNode<Issue> {
  id: string;
  title: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  url: string;
  state: string;
  labels: GitHubNodes<Label>;
  reactions: GitHubEdges<Reaction>;
}

export interface Reaction extends GitHubNode<Reaction> {
  content: string;
}

export interface Label extends GitHubNode<Label> {
  name: string;
  color: string;
}

export interface Repository extends GitHubNode<Repository> {
  name: string;
  nameWithOwner: string;
  url: string;
  owner: {
    id: string;
  }
  issues: GitHubEdges<Issue>;
}


export interface RepoEntry {
  owner: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private _repoEntriesChange = new Subject<string[]>();
  repoEntriesChange$ = this._repoEntriesChange.asObservable();

  private _issueChange = new Subject<Issue>();
  issueChange$ = this._issueChange.asObservable();

  private repos: string[];

  private starred: string[];

  constructor(public apollo: Apollo,
              public config: ConfigService,
              public storage: Storage
              ) {
    this.repos = config.getRepos();

    this.init();
  }

  async init() {
    this.starred = await this.getStarredIssues();
  }

  addRepoEntry(name: string) {
    this.repos.push(name);
    this._repoEntriesChange.next(this.repos);
  }

  getRepos(): string[] {
    return this.repos;
  }

  queryAllRepos() {
    const repoMaps = this.repos.map(r => {
      const s = r.split('/');
      return {
        owner: s[0],
        name: s[1]
      };
    });

    const queries = [];
    for (const repo of repoMaps) {
      queries.push(this.queryRepo(repo.owner, repo.name));
    }

    return forkJoin(queries);
  }

  queryRepo(repoOwnerName: string, repoName: string) {
    return this.apollo.query<any>({
      query: RepoQuery,
      variables: {
        owner: repoOwnerName,
        name: repoName
      }
    });
  }

  async starIssue(issue: Issue) {
    let starred = await this.storage.get('starred') || [];
    const id = issue.id;

    if (starred.indexOf(id) >= 0) {
      // Remove it if found
      starred = starred.filter(i => i !== id);
    } else {
      starred.push(issue.id);
    }

    await this.storage.set('starred', starred);

    this.starred = starred;

    this._issueChange.next(issue);
  }

  async getStarredIssues() {
    return await this.storage.get('starred') || [];
  }

  isStarred(issue: Issue) {
    return this.starred.indexOf(issue.id) >= 0;
  }
}
