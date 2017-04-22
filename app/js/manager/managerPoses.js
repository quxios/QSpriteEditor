import Store from './store'
import PoseJSON from './JSONPose'

import Stage from './../display/stage'

export default class ManagerPoses {
  addPose() {
    const current = Store.configs[Store.currentConfig];
    if (!current) return;
    const i = current.poses.length;
    const name = this.getUniqName(current.poses, 'name', 'Pose', i);
    current.poses.push({
      ...PoseJSON,
      name
    })
    this.selectPose(current.poses.length - 1);
  }
  movePose(data) {
    const current = Store.configs[Store.currentConfig];
    if (!current) return;
    const {
      oldIndex,
      newIndex
    } = data;
    this.arrMove(current.poses, oldIndex, newIndex);
  }
  selectPose(index, clear) {
    const current = Store.configs[Store.currentConfig];
    if (!current) return;
    if (clear && Store.currentPose === index) {
      index = -1;
    }
    Store.currentPose = Number(index);
  }
  duplicatePose(index) {
    const current = Store.configs[Store.currentConfig];
    if (!current) return;
    const pose = current.poses[index];
    if (!pose) return;
    const name = this.getUniqName(current.poses, 'name', `${pose.name}-duplicate`, 0);
    current.poses.push({
      ...JSON.parse(JSON.stringify(pose)),
      name
    })
    this.selectPose(current.poses.length - 1);
  }
  deletePose(index) {
    const current = Store.configs[Store.currentConfig];
    if (!current) return;
    current.poses.splice(index, 1);
    if (Store.currentPose === index) {
      this.selectPose(-1);
    } else if (Store.currentPose > index) {
      this.selectPose(Store.currentPose - 1);
    }
  }
  addPattern(index) {
    const current = Store.configs[Store.currentConfig];
    if (!current) return;
    const pose = current.poses[Store.currentPose];
    if (!pose) return;
    pose.pattern.push(index);
  }
  movePattern(data) {
    const current = Store.configs[Store.currentConfig];
    if (!current) return;
    const pose = current.poses[Store.currentPose];
    if (!pose) return;
    const {
      oldIndex,
      newIndex
    } = data;
    this.arrMove(pose.pattern, oldIndex, newIndex);
  }
  getPatternClip(i, cb) {
    const clip = Stage.getSlice(i);
    if (!clip) return;
    const data = this.renderer.extract.base64(clip);
    cb(data);
  }
  deletePattern(index) {
    const current = Store.configs[Store.currentConfig];
    if (!current) return;
    const pose = current.poses[Store.currentPose];
    if (!pose) return;
    pose.pattern.splice(index, 1);
  }
}
