import { Component } from '@angular/core';

import { LoadingController, Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { GitHubService } from './github.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
  ];

  private loading: HTMLIonLoadingElement;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private alertController: AlertController,
    public github: GitHubService) {
    this.initializeApp();

    this.buildAppPages();

    github.repoEntriesChange$.subscribe((entries) => {
      this.buildAppPages();
    })
  }

  buildAppPages() {
    this.appPages = this.github.getRepos().map(repoEntry => {
      return {
        title: repoEntry,
        url: `/repo/${repoEntry}`
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  async addRepo() {
    const alert = await this.alertController.create({
      header: 'Add repo',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Repo name (ex: ionic-team/ionic)'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Create',
          handler: (data) => {
            this.github.addRepoEntry(data.name);
          }
        }
      ]
    });
    await alert.present();
  }
}
