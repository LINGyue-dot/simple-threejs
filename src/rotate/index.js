/**
 * 实现鼠标拖动视角，本质上是一个包围球
 * 左键是旋转视角（更改相机在球体上的位置），右键是平移（平移包围球），滚轮是放大缩小（修改包围球的半径）
 * x = distance * sin(beta) * sin(alpha)
 * y = distance * cos(beta)
 * z = distance * sin(beta) * cos(alpha)
 * 1. 左键旋转视角暂时还有问题，上下只能支持 180 旋转，不能 360 ---> OrbitControl 也是如此
 * 2.
 * 写完看下 potreejs 是怎么搞的？
 */
import * as THREE from "three";

const width = window.innerWidth - 20;
const height = window.innerHeight - 20;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setClearColor(0xcccccc);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 10000);
camera.position.set(500, 500, 0);
camera.lookAt(0, 0, 0);
scene.add(camera);

const light = new THREE.AmbientLight(0xffffff, 2);
scene.add(light);

const geometry = new THREE.CylinderGeometry(5, 50, 100, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cylinder = new THREE.Mesh(geometry, material);
scene.add(cylinder);

const axis = new THREE.AxesHelper(10000);
scene.add(axis);

// 1. 左键
const dom = renderer.domElement;
const store = { type: null, preLocation: {}, target: new THREE.Vector3(0, 0, 0), scale: 1 };
dom.addEventListener("mousedown", function(event) {
  event.preventDefault();
  store.preLocation = { x: event.clientX, y: event.clientY };
  switch (event.button) {
    case 0:
      // 鼠标左键
      store.type = "left";
      break;
    case 1:
      store.type = "middle";
      break;

    case 2:
      store.type = "right";
      break;
  }
});

dom.addEventListener("mousemove", function(event) {
  if (!store.type) return;
  const offsetX = event.clientX - store.preLocation.x;
  const offsetY = event.clientY - store.preLocation.y;
  store.preLocation = { x: event.clientX, y: event.clientY };
  store.type === "left" && handleLeftDrag(offsetX, offsetY);
  store.type === "right" && handleRightDrag(offsetX, offsetY);
});

dom.addEventListener("mouseup", function() {
  store.type = null;
  store.preLocation = {};
});

dom.addEventListener("wheel", function(event) {
  // 向下为负 --> 放大
  scale(1 - event.deltaY / 5 * 0.01);
});

// 左键拖拽行为
function handleLeftDrag(offsetX, offsetY) {
  const spherical = new THREE.Spherical();
  spherical.setFromVector3(camera.position);
  const deltaPhi = -offsetY / 200 * 2 * Math.PI;
  const deltaTheta = -offsetX / 200 * 2 * Math.PI;
  // 限制在 [1,179] 之间
  // 因为 phi = 0 or phi = Math.PI 时候，会使得 x y 突然复原
  const tempPhi = deltaPhi + spherical.phi;
  const finalPhi = tempPhi >= Math.PI ? Math.PI * 179 / 180 : tempPhi <= 0 ? 1 / 180 * Math.PI : tempPhi;

  spherical.set(spherical.radius, finalPhi, spherical.theta + deltaTheta);
  const location = new THREE.Vector3().setFromSpherical(spherical);
  camera.position.copy(location);
  camera.lookAt(store.target);
}

// 中间缩放功能
// x = target.x + distance * sin(beta) * sin(alpha) * scale
// y = target.y + distance * cos(beta) * scale
// z = target.z + distance * sin(beta) * cos(alpha) * scale
function scale(ration = 0.9) {
  store.scale *= ration;
  const distance = camera.position.distanceTo(store.target);
  const beta = Math.acos(camera.position.y / distance);
  const alpha = Math.atan2(camera.position.x, camera.position.z) + 2 * Math.PI;
  camera.position.set(store.target.x + distance * Math.sin(beta) * Math.sin(alpha) * ration,
    store.target.y + distance * Math.cos(beta) * ration,
    store.target.z + distance * Math.sin(beta) * Math.cos(alpha) * ration);
  camera.lookAt(store.target);
}

// 右键移动功能
// 计算摄像机坐标系 uvw
// 平移就是相对 uvw 坐标系进行移动，例如左移就是 u 变大，上移就是 v 变小
// 通过相对矩阵计算出，xyz 的变化
function handleRightDrag(offsetX, offsetY) {
  const N = new THREE.Vector3().subVectors(store.target, camera.position).normalize();
  const up = camera.up;
  const U = new THREE.Vector3().crossVectors(up, N).normalize();
  const V = new THREE.Vector3().crossVectors(N, U).normalize();

  // 向左移动 p ，那么此时需要投影到 xyz 上
  const deltaXByHor = new THREE.Vector3().copy(U).projectOnVector(new THREE.Vector3(1, 0, 0)).multiplyScalar(offsetX);
  const deltaYByHor = new THREE.Vector3().copy(U).projectOnVector(new THREE.Vector3(0, 1, 0)).multiplyScalar(offsetX);
  const deltaZByHor = new THREE.Vector3().copy(U).projectOnVector(new THREE.Vector3(0, 0, 1)).multiplyScalar(offsetX);
  const deltaXByVect = new THREE.Vector3().copy(V).projectOnVector(new THREE.Vector3(1, 0, 0)).multiplyScalar(offsetY);
  const deltaYByVect = new THREE.Vector3().copy(V).projectOnVector(new THREE.Vector3(0, 1, 0)).multiplyScalar(offsetY);
  const deltaZByVect = new THREE.Vector3().copy(V).projectOnVector(new THREE.Vector3(0, 0, 1)).multiplyScalar(offsetY);
  const deltaX = deltaXByHor.add(deltaXByVect);
  const deltaY = deltaYByHor.add(deltaYByVect);
  const deltaZ = deltaZByHor.add(deltaZByVect);
  const delta = deltaX.add(deltaY).add(deltaZ);

  camera.position.add(delta);

  store.target.add(delta);
  camera.lookAt(store.target);
}

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

document.oncontextmenu = function() {
  return false;
};
