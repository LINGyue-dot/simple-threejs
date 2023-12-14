/**
 * 简单的地图编辑器
 * 0. 给平面画个 grid 格
 * 1. 俯视，以及切换时候的动画
 * 2. 俯视锁定，移动视角
 * 3. 画点
 * 4. 画线
 * 5. 编辑状态下可以拖动
 */
// y 向上
/**
 * 暂留的问题
 * 1. 俯视如何实现的？
 * 2. cos sin JS 计算并不准确，那如何准确 ？
 * 3. 旋转时候只是围绕 X Y Z 某两个轴进行转动吗？
 */

import * as THREE from "three";
import { bindEventCallback } from "../domHelper";
import { cos, sin } from "../mathHelper";
import { OrbitControls } from "../three_orbit";

const width = window.innerWidth - 50;
const height = window.innerHeight - 50;
export default class DemoScene {
  renderer;
  scene;
  camera;
  target = new THREE.Vector3(0, 0, 0);

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xcccccc);
    this.renderer.setSize(width, height);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.gridHelper = new THREE.GridHelper(10000, 100);
    // this.scene.add(this.gridHelper);

    this.camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 10000);
    this.camera.position.set(500, 500, 500);
    this.camera.lookAt(this.target);
    this.scene.add(this.camera);

    this.addTest();
    this.render();
  }

  addTest() {
    const light = new THREE.AmbientLight(0xffffff, 10);
    this.scene.add(light);

    const axesHelper = new THREE.AxesHelper(1000);
    this.scene.add(axesHelper);

    // const control = new OrbitControls(this.camera, this.renderer.domElement);
    // control.autoRotate = true;

    // temp just for test
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }

  render(timer) {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  bindEvent() {
    bindEventCallback("");
  }

  // https://juejin.cn/post/7280747833384665143
  // x = OA * sin beta * sin alpha
  // y = OA * cos beta
  // z = OA * sin beta * cos alpha

  // 所以当水平旋转时候是 alpha 发生变化，offsetX > 0 时候 offsetAlpha > 0 , beta 不变 ，假设变化角度为 n
  // x = OA *  sin (beta) * sin (alpha +n)
  // y = OA * cos beta
  // z = OA * sin beta * cos (alpha +n)
  // 水平旋转
  rotateHorizaontal(angle = Math.PI / 4) {
    angle = -angle;
    const length = this.camera.position.distanceTo(this.target);
    const beta = Math.acos(this.camera.position.y / length);
    const alpha = Math.atan2(this.camera.position.x, this.camera.position.z);
    this.camera.position.set(length * Math.sin(beta) * Math.sin(alpha + angle), length * Math.cos(beta),
      length * Math.sin(beta) * Math.cos(alpha + angle));
    this.camera.lookAt(this.target);
  }

  // 垂直旋转时候
  // x = OA * sin(beta+n) * sin(alpha)
  // y = OA * cos(beta+n)
  // z = OA * sin(beta+n) * cos(alpha)
  rotateVertical(angle = Math.PI / 4) {
    angle = -angle;
    const length = this.camera.position.distanceTo(this.target);
    const beta = Math.acos(this.camera.position.y / length);
    const alpha = Math.atan2(this.camera.position.x, this.camera.position.z);
    console.log(angle, Math.cos(beta + angle) === Math.cos(beta), Math.cos(beta + angle),
      length * Math.cos(beta + angle), this.camera.position.y);
    // console.log(angle, beta, beta + angle, length * Math.cos(beta + angle), Math.cos(beta + angle));

    this.camera.position.set(length * Math.sin(beta + angle) * Math.sin(alpha), length * Math.cos(beta + angle),
      length * Math.sin(beta + angle) * Math.cos(alpha));
    this.camera.lookAt(this.target);
  }
}
