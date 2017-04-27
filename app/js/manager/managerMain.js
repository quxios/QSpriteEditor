import Store from './store'
import ConfigJSON from './JSONConfig'
import PoseJSON from './JSONPose'

import { ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

export default class ManagerMain {
  startLoad(fileNames) {
    if (!fileNames) return;
    const projectPath = path.dirname(fileNames[0]);
    const filePath = path.join(projectPath, './data/QSprite.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        this.notify('WARN', `Creating new QSprite.\n${filePath} was not found.`, 3000);
        this.load();
      } else {
        this.load(data);
      }
    });
    ipcRenderer.send('setDefaultPath', projectPath);
    Store.projectPath = projectPath;
  }
  load(data = '[]') {
    let configs = JSON.parse(data);
    if (!Array.isArray(configs)) {
      configs = this.convertToV2(configs);
    }
    Store.isLoaded = true;
    Store.configs = configs;
    Store.currentConfig = -1;
    Store.currentPose = -1;
  }
  save() {
    // Convert to v1 data when saving so I don't need to convert it in mv plugin
    if (this.isSaveOk(Store.configs)) {
      const filePath = path.join(Store.projectPath, './data/QSprite.json');
      const configs = this.convertToV1(Store.configs);
      fs.writeFileSync(filePath, JSON.stringify(configs, null, 2));
      this.notify('SUCCESS', `Saved to:\n${filePath}`, 3000);
    }
  }
  isSaveOk(configs) {
    let valid = true;
    let configNames = [];
    for (let i = 0; i < configs.length; i++) {
      if (configNames.includes(configs[i].name)) {
        this.notify('ERROR', `Duplicate config name: ${configs[i].name}`);
        valid = false;
        break;
      }
      configNames.push(configs[i].name);
      let poses = configs[i].poses;
      let poseNames = [];
      for (let j = 0; j < poses.length; j++) {
        if (poseNames.includes(poses[j].name)) {
          this.notify('ERROR', `Duplicate pose name: ${poseNames[j].pose} in config ${configs[i].name}`);
          valid = false;
          break;
        }
        poseNames.push(poses[j].name);
      }
      if (!valid) break;
    }
    return valid;
  }
  convertToV2(configs) {
    let newConfig = [];
    for (let config in configs) {
      if (!this.isConfig(configs[config])) continue;
      let newPoses = [];
      for (let pose in configs[config].poses) {
        if (!this.isPose(configs[config].poses[pose])) continue;
        newPoses.push({
          ...PoseJSON,
          ...configs[config].poses[pose],
          name: String(pose)
        })
      }
      newConfig.push({
        ...ConfigJSON,
        ...configs[config],
        name: String(config),
        poses: newPoses
      })
    }
    return newConfig;
  }
  convertToV1(configs) {
    let newConfig = {};
    configs.forEach((config) => {
      let newPoses = {};
      config.poses.forEach((pose) => {
        newPoses[pose.name] = {
          ...PoseJSON,
          ...pose,
          name: pose.name
        }
        newPoses[pose.name].speed = Number(newPoses[pose.name].speed) || 0;
      })
      newConfig[config.name] = {
        ...ConfigJSON,
        ...config,
        poses: newPoses,
        name: config.name
      }
      newConfig[config.name].cols = Number(newConfig[config.name].cols) || 1;
      newConfig[config.name].rows = Number(newConfig[config.name].rows) || 1;
      newConfig[config.name].anchorX = Number(newConfig[config.name].anchorX) || 0;
      newConfig[config.name].anchorY = Number(newConfig[config.name].anchorY) || 0;
    });
    return newConfig;
  }
  isConfig(obj) {
    if (!obj) return false;
    // don't want to check for all config props
    // since I may add some later on
    const needs = {
      poses: [],
      cols: 1, rows: 1
    }
    let isOk = true;
    for (let prop in needs) {
      if (!obj.hasOwnProperty(prop)) {
        isOk = false;
        break;
      }
    }
    return isOk;
  }
  isPose(obj) {
    if (!obj) return false;
    const needs = {
      pattern: []
    }
    let isOk = true;
    for (let prop in needs) {
      if (!obj.hasOwnProperty(prop)) {
        isOk = false;
        break;
      }
    }
    return isOk;
  }
}
