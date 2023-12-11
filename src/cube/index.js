// 模仿 https://wenzhe.one/I-cannot-deal-with-Rubiks-cube/
// 1. 12-11 先把六个面弄下，以及旋转函数弄下（暂不处理用户行为）

// left problems or key point
// 1. 圆角立方体是如何实现的

// materials 数据的位置数据映射，以 y 轴负方向作为基准方向
const faceToIndex = ["right", "left", "top", "bottom", "front", "back"].reduce((pre, val, index) => {
  pre[val] = index;
  return pre;
}, {});

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const width = window.innerWidth - 100;
const height = window.innerHeight - 100;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0xcccccc);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
camera.position.set(500, 500, 500);
camera.lookAt(scene.position);
scene.add(camera);

const light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

const axesHelper = new THREE.AxesHelper(1000);
axesHelper.position.set(0, 0, 0);
scene.add(axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;

function createCube(position, colorMap) {
  const geometry = new THREE.BoxGeometry(100, 100, 100);
  const material = new THREE.MeshPhysicalMaterial({ color: 0x000000 });

  const materials = Array.from({ length: 6 }).fill(material);
  if (colorMap) {
    for (const [face, color] of Object.entries(colorMap)) {
      const texture = new THREE.CanvasTexture(createRoundedRectangle(color));
      materials[faceToIndex[face]] = new THREE.MeshBasicMaterial({ map: texture });
    }
  }

  const cube = new THREE.Mesh(geometry, materials);
  if (position) cube.position.set(...position);
  scene.add(cube);
}

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

// 圆角矩形
// FIXME replace 20 80 hard code with argument
function createRoundedRectangle(color = "blue") {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 100;
  canvas.height = 100;
  const cornerRadius = 20;

  context.beginPath();
  context.moveTo(80, 0);
  context.arcTo(canvas.width, 0, canvas.width, 20, cornerRadius);
  context.lineTo(canvas.width, 80);
  context.arcTo(canvas.width, canvas.height, 80, canvas.height, cornerRadius);

  context.lineTo(20, canvas.height);
  context.arcTo(0, canvas.height, 0, 80, cornerRadius);

  context.lineTo(0, 20);
  context.arcTo(0, 0, 20, 0, cornerRadius);
  context.closePath();

  context.fillStyle = color;
  context.fill();

  return canvas;
}

function createRubiksCube() {
  // 正面层开始绘制 y 轴投影
  // 左到右上到下

  createCube([-100, 100, 100], { "front": "white", "left": "orange", "top": "blue" });

  // canvasTexture 设置分辨率

  createCube();
}

createRubiksCube();
