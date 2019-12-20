import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full'
  },
  {
    path: 'all',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'all/:filter',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'repo/:repoOrgName/:repoName',
    loadChildren: './home/home.module#HomePageModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
