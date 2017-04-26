import ManagerMain from './managerMain'
import ManagerUtils from './managerUtils'
import ManagerNotifications from './managerNotifications'
import ManagerConfigs from './managerConfigs'
import ManagerPoses from './managerPoses'
import ManagerContext from './managerContext'

class Manager {
  constructor() {
    const mixin = [
      ManagerMain,
      ManagerUtils,
      ManagerConfigs,
      ManagerPoses,
      ManagerContext,
      ManagerNotifications
    ]
    mixin.forEach((s) => {
      s = s.prototype;
      Object.getOwnPropertyNames(s).forEach((prop) => {
        if (prop !== 'constructor') {
          Object.defineProperty(this, prop, Object.getOwnPropertyDescriptor(s, prop));
        }
      })
    })
  }
}

export default new Manager();
