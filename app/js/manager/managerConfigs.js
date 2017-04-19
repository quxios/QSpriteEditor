import Store from './store'
import ConfigJSON from './JSONConfig'

export default class ManagerConfigs {
  addConfig() {
    const i = Store.configs.length;
    const name = this.getUniqName(Store.configs, 'name', 'Config', i);
    Store.configs.push({
      ...ConfigJSON,
      name
    })
    this.selectConfig(Store.configs.length - 1);
  }
  moveConfig(data) {
    const {
      oldIndex,
      newIndex
    } = data;
    this.arrMove(Store.configs, oldIndex, newIndex);
  }
  selectConfig(index, clear) {
    if (clear && Store.currentConfig === index && Store.currentPose === -1) {
      index = -1;
    }
    Store.currentConfig = Number(index);
    Store.currentPose = -1;
  }
  duplicateConfig(index) {
    const config = Store.configs[index];
    if (!config) return;
    const name = this.getUniqName(Store.configs, 'name', `${config.name}-duplicate`, 0);
    Store.configs.push({
      ...JSON.parse(JSON.stringify(config)),
      name
    })
    this.selectConfig(Store.configs.length - 1);
  }
  deleteConfig(index) {
    Store.configs.splice(index, 1);
    if (Store.currentConfig === index) {
      this.selectConfig(-1);
    } else if (Store.currentConfig > index) {
      this.selectConfig(Store.currentConfig - 1);
    }
  }
}
