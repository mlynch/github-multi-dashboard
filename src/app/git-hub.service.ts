import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';

const RepoQuery = gql`
  query RepositoryForOwnerAndName($owner: String!, $name: String!) {
    repository(owner:$owner, name:$name) {
      name
      url
      owner {
        id
      }
      issues(first:100) {
        edges {
          node {
            title
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
  private querySubscription: Subscription;

  constructor(public apollo: Apollo) {
    this.querySubscription = this.apollo.watchQuery<any>({
      query: RepoQuery,
      variables: {
        owner: 'ionic-team',
        name: 'ionic'
      }
    })
      .valueChanges
      .subscribe(({ data, loading }) => {
        console.log('Repo query result!', data, loading);
      });
  }
}
