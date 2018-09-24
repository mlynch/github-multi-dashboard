import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription, forkJoin, merge } from 'rxjs';

const RepoQuery = gql`
  query RepositoryForOwnerAndName($owner: String!, $name: String!) {
    repository(owner:$owner, name:$name) {
      name
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

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private repoSubs: { [name: string]: Subscription } = {};

  private repoResults: { [name: string]: any } = {};

  private REPOS = ['ionic-team/ionic', 'ionic-team/ionic-native',
                  'ionic-team/cordova-plugin-ionic-keyboard', 'ionic-team/cordova-plugin-ionic-webview'];

  constructor(public apollo: Apollo) {
  }

  queryAllRepos() {
    const repoMaps = this.REPOS.map(r => {
      const s = r.split('/');
      return {
        owner: s[0],
        name: s[1]
      };
    });

    const queries = [];
    for (const repo of repoMaps) {
      queries.push(this.apollo.query<any>({
        query: RepoQuery,
        variables: {
          owner: repo.owner,
          name: repo.name
        }
      }));
        /*
        .subscribe(({ data, loading }) => {
          console.log('Repo query result!', repo, data, loading);
          this.repoResults[repo.owner + '/' + repo.name] = data;
        }));
        */
    }

    return forkJoin(queries);
  }
}
