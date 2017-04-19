import Store from './store'

export default class ManagerContext {
  openContext(x, y, type, i) {
    let items = [];
    switch (type) {
      case 'config': {
        items = [
          { title: 'Duplicate', handler: this.duplicateConfig.bind(this, i) },
          { title: 'Delete', handler: this.deleteConfig.bind(this, i) }
        ]
        break;
      }
      case 'pose': {
        items = [
          { title: 'Duplicate', handler: this.duplicatePose.bind(this, i) },
          { title: 'Delete', handler: this.deletePose.bind(this, i) }
        ]
        break;
      }
      case 'pattern': {
        items = [
          { title: 'Delete', handler: this.deletePattern.bind(this, i) }
        ]
        break;
      }
    }
    Store.context = {
      ...Store.context,
      open: true,
      type,
      selected: i,
      x, y,
      items
    }
  }
  clearContext() {
    Store.context = {
      ...Store.context,
      open: false,
      type: '',
      selected: -1,
      items: []
    }
  }
}
