import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy, Routes } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService } from './config.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: ConfigService,
      useFactory: ConfigServiceFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function ConfigServiceFactory() {
  // Set the repos you want to track below
  return new ConfigService({
    repos: [
      'ionic-team/ionic',
      'ionic-team/ionic-cli',
      'ionic-team/ionic-native',
      'ionic-team/cordova-plugin-ionic-keyboard',
      'ionic-team/cordova-plugin-ionic-webview',
      'ionic-team/cordova-plugin-ionic',
      'ionic-team/ionic-storage',
      'ionic-team/capacitor'
    ]
  })
}
