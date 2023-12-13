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
 * 3.
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

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xcccccc);
    this.renderer.setSize(width, height);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.gridHelper = new THREE.GridHelper(10000, 100);
    this.scene.add(this.gridHelper);

    this.camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 10000);
    this.camera.position.set(500, 500, 500);
    this.camera.lookAt(0, 0, 0);
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

  rotateAroundY(angle = Math.PI / 4) {
    const rotateMatrix = new THREE.Matrix3();
    // 注意由于是投影到 x - z 坐标系（绕 y 轴旋转），所以需要将 y z 互换
    rotateMatrix.set(cos(angle), 0, -sin(angle), 0, 1, 0, sin(angle), 0, cos(angle));

    const newPos = new THREE.Vector3().copy(this.camera.position);
    newPos.applyMatrix3(rotateMatrix);
    // 旋转矩阵
    this.camera.position.set(newPos.x, newPos.y, newPos.z);
    this.camera.lookAt(0, 0, 0);
  }

  rotateAroundX(angle = Math.PI / 4) {
    // x 与 z 互换
    const rotateMatrix = new THREE.Matrix3();
    rotateMatrix.set(1, 0, 0, 0, cos(angle), sin(angle), 0, -sin(angle), cos(angle));
    const newPos = new THREE.Vector3().copy(this.camera.position);

    newPos.applyMatrix3(rotateMatrix);
    this.camera.position.set(newPos.x, newPos.y, newPos.z);
    this.camera.lookAt(0, 0, 0);
  }
}
