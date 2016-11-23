export default class {
  static listeners = {};
  static state = {
    loaded: false,
    json: {},
    config: '',
    pose: '',
    toolpath: '',
    filePath: ''
  };
  static on(action, callback) {
    if (!this.listeners[action]) {
      this.listeners[action] = [];
    }
    if (typeof callback === "function") {
      this.listeners[action].push(callback);
    }
  }
  static remove(action, callback) {
    if (!this.listeners[action]) return;
    let i = this.listeners[action].indexOf(callback);
    if (i >= 0) {
      this.listeners[action].splice(i, 1);
    }
  }
  static emit(action, ...args) {
    if (this.listeners[action]) {
      this.listeners[action].forEach(callback => {
        callback(...args)
      })
    }
  }
  static setToolPath(path) {
    this.state.toolpath = path;
    this.emit('UPDATE_TOOLPATH', path);
    if (path === 'poseSettings') {
      this.emit('SET_ANIMATED_ALPHA', 1);
    } else {
      this.emit('SET_ANIMATED_ALPHA', 0);
    }
  }
  static setConfig(config) {
    this.state.config = config;
    this.emit('UPDATE_CONFIGNAME', config);
  }
  static setPose(pose) {
    this.state.pose = pose;
    this.emit('UPDATE_POSENAME', pose);
  }
  static startNew() {
    this.state.json = {};
    this.start();
  }
  static loadJson(json) {
    if (this.validJson(json)) {
      this.state.json = json;
      this.start();
      return true;
    }
    return false;
  }
  static validJson(json) {
    let valid = true;
    for (let prop in json) {
      if (!json.hasOwnProperty(prop)) continue;
      let elem = json[prop];
      if (!elem || !elem.cols || !elem.rows || !elem.poses) {
        valid = false;
        break;
      }
    }
    return valid;
  }
  static start() {
    this.state.loaded = true;
    this.setToolPath('configList');
    this.setConfig('');
    this.setPose('');
    this.emit('LOADED');
    this.emit('UPDATE_JSON', this.state.json);
  }
  static getJson() {
    let json = {...this.state.json};
    return JSON.stringify(json, null, '  ');
  }
  static addContext(items, x, y) {
    this.emit('SET_CONTEXT_ITEMS', items);
    this.emit('SET_CONTEXT_POS', y, x);
    this.emit('SET_CONTEXT_VISIBLE', true);
  }
  static addNewConfig() {
    let id;
    let i = 0;
    while (true) {
      id = "Config" + i;
      if (this.state.json.hasOwnProperty(id)) {
        i++;
      } else {
        break;
      }
    }
    this.state.json[id] = {
      cols: 1,
      rows: 1,
      anchorX: 0.5,
      anchorY: 1,
      sampleImg: '',
      poses: {}
    }
    this.emit('UPDATE_JSON', this.state.json);
  }
  static getCurrentConfig() {
    return {
      name: this.state.config,
      ...this.state.json[this.state.config]
    };
  }
  static duplicateConfig(name) {
    let id;
    let i = 0;
    while (true) {
      id = `${name}_duplicate${i}`;
      if (this.state.json.hasOwnProperty(id)) {
        i++;
      } else {
        break;
      }
    }
    this.state.json[id] = { ...this.state.json[name] };
    this.emit('UPDATE_JSON', this.state.json);
  }
  static deleteConfig(name) {
    delete this.state.json[name];
    this.emit('UPDATE_JSON', this.state.json);
  }
  static changeConfigName(name) {
    let valid = name !== '';
    if (valid) {
      let data = this.state.json[this.state.config];
      if (!this.state.json.hasOwnProperty(name)) {
        this.state.json[name] = data;
        delete this.state.json[this.state.config];
        this.setConfig(name);
      } else if (this.state.config !== name) {
        alert(`Error: A configuration with the name ${name} already exists.`);
        valid = false
      }
    }
    this.emit('UPDATE_CONFIG', this.getCurrentConfig());
    return valid;
  }
  static changeConfigSampleImg(path) {
    this.state.json[this.state.config].sampleImg = path;
    this.emit('UPDATE_CONFIG', this.getCurrentConfig());
  }
  static changeConfigCol(cols, emit = false) {
    const valid = /^[0-9]+$/.test(cols);
    if (valid) {
      this.state.json[this.state.config].cols = Number(cols);
    }
    if (valid || emit) {
      this.emit('UPDATE_CONFIG', this.getCurrentConfig());
    }
    return valid;
  }
  static changeConfigRow(rows, emit = false) {
    const valid = /^[0-9]+$/.test(rows);
    if (valid) {
      this.state.json[this.state.config].rows = Number(rows);
    }
    if (valid || emit) {
      this.emit('UPDATE_CONFIG', this.getCurrentConfig());
    }
    return valid;
  }
  static changeConfigAnchorX(anchorX, emit = false) {
    const valid = /^[0-9-]*(.[0-9]+)?$/.test(anchorX);
    if (valid) {
      this.state.json[this.state.config].anchorX = Number(anchorX);
    }
    if (valid || emit) {
      this.emit('UPDATE_CONFIG', this.getCurrentConfig());
    }
    return valid;
  }
  static changeConfigAnchorY(anchorY, emit = false) {
    const valid = /^[0-9-]*(.[0-9]+)?$/.test(anchorY);
    if (valid) {
      this.state.json[this.state.config].anchorY = Number(anchorY);
    }
    if (valid || emit) {
      this.emit('UPDATE_CONFIG', this.getCurrentConfig());
    }
    return valid;
  }
  static addNewPose() {
    let i = 0;
    let id;
    let current = this.getCurrentConfig();
    while (true) {
      id = "Pose" + i;
      if (current.poses.hasOwnProperty(id)) {
        i++;
      } else {
        break;
      }
    }
    this.state.json[this.state.config].poses[id] = {
      speed: 15,
      adjust: false,
      pattern: []
    }
    this.emit('UPDATE_POSELIST', this.state.json[this.state.config].poses);
  }
  static getCurrentPose() {
    let poseSettings = this.state.json[this.state.config].poses[this.state.pose];
    return {
      name: this.state.pose,
      ...poseSettings,
      pattern: poseSettings.pattern.join(',')
    };
  }
  static duplicatePose(name) {
    let id;
    let i = 0;
    let poses = this.state.json[this.state.config].poses
    while (true) {
      id = `${name}_duplicate${i}`;
      if (poses.hasOwnProperty(id)) {
        i++;
      } else {
        break;
      }
    }
    poses[id] = { ...poses[name] };
    this.emit('UPDATE_POSELIST', poses);
  }
  static deletePose(name) {
    let poses = this.state.json[this.state.config].poses
    delete poses[name];
    this.emit('UPDATE_POSELIST', poses);
  }
  static changePoseName(name) {
    let valid = name !== '';
    if (valid) {
      let poses = this.state.json[this.state.config].poses
      let data = poses[this.state.pose];
      if (!poses.hasOwnProperty(name)) {
        poses[name] = data;
        delete poses[this.state.pose];
        this.setPose(name);
      } else if (this.state.pose !== name) {
        alert(`Error: A configuration with the name ${name} already exists.`);
        valid = false
      }
    }
    this.emit('UPDATE_POSE', this.getCurrentPose());
    return valid;
  }
  static changePoseSpeed(speed, emit) {
    const valid = !isNaN(speed) && speed !== '';
    if (valid) {
      let pose = this.state.json[this.state.config].poses[this.state.pose];
      pose.speed = Number(speed);
    }
    if (valid || emit) {
      this.emit('UPDATE_POSE', this.getCurrentPose());
    }
    return valid;
  }
  static changePoseAdjust(bool) {
    let pose = this.state.json[this.state.config].poses[this.state.pose];
    pose.adjust = bool;
    this.emit('UPDATE_POSE', this.getCurrentPose());
  }
  static changePosePattern(pattern, emit) {
    const valid = this.validPattern(pattern);
    if (valid) {
      let pose = this.state.json[this.state.config].poses[this.state.pose];
      let match = /^([0-9]+)-([0-9]+)$/.exec(pattern);
      if (match) {
        pose.pattern = [];
        for (let i = Number(match[1]); i <= Number(match[2]); i++) {
          pose.pattern.push(i);
        }
      } else {
        pose.pattern = pattern.split(',').map(Number)
      }
      this.emit('SET_ANIMATED_PATTERN', pose.pattern);
    }
    if (valid || emit) {
      this.emit('UPDATE_POSE', this.getCurrentPose());
    }
    return valid;
  }
  static validPattern(pattern) {
    let match1 = /^([0-9]+)-([0-9]+)$/.exec(pattern);
    let match2 = /^([0-9]+(,[0-9])*)$/.test(pattern);
    let {cols, rows} = this.getCurrentConfig();
    let maxI = cols * rows;
    if (match1) {
      return Number(match1[1]) >= 0 && Number(match1[2]) < maxI;
    } else if (match2) {
      let list = pattern.split(',');
      for (let i = 0; i < list.length; i++) {
        let v = Number(list[i]);
        if (v < 0 || v >= maxI) return false;
      }
      return true;
    }
    return false;
  }
}
