import { Injectable } from '@angular/core';

export interface ConfigData {
  repos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  config: ConfigData = { repos: [] };

  constructor(config: ConfigData) {
    this.config = config;
  }

  getRepos() {
    return this.config.repos;
  }
}
