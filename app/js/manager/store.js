import { observable, computed } from 'mobx'
import { ipcRenderer } from 'electron'

class Store {
  @observable isLoaded = false;
  @observable configs = [];
  @observable currentConfig = -1;
  @observable currentPose = -1;
  @observable projectPath = ipcRenderer.sendSync('getDefaultPath');
  @observable context = {
    open: false,
    type: '',
    selected: -1,
    x: 0, y: 0,
    items: []
  }
  @observable notifications = [];
  @computed get config() {
    if (this.currentConfig === -1) return null;
    return this.configs[this.currentConfig];
  }
  @computed get pose() {
    if (this.currentConfig === -1) return null;
    if (this.currentPose === -1) return null;
    return this.config.poses[this.currentPose];
  }
}

export default new Store();
