import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const focusPos = { x: 0, y: 0, z: 0 };
const targetPos = { x: 0, y: 0, z: 0 };

const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xcccccc);

renderer.setSize(width, height);
camera.position.set(500, 500, 500);
camera.lookAt(scene.position);

// 暂时无法生效这是为什么？
const pointLight = new THREE.PointLight(0xffff00, 10000);
pointLight.position.set(40, 100, 60);
scene.add(pointLight);

const axesHelper = new THREE.AxesHelper(1000);
axesHelper.position.set(0, 0, 0);
scene.add(axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;

document.body.appendChild(renderer.domElement);

function createCube(x, z) {
  const geometry = new THREE.BoxGeometry(30, 20, 30);
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = x;
  cube.position.z = z;
  scene.add(cube);
}

function createPlayer() {
  const geometry = new THREE.BoxGeometry(5, 20, 5);
  const material = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const player = new THREE.Mesh(geometry, material);
  player.position.x = 0;
  player.position.y = 20;
  player.position.z = 0;
  scene.add(player);
  return player;
}

function render() {
  moveCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

createCube(0, 0);
createCube(0, -100);
createCube(0, -200);
createCube(0, -300);
createCube(-100, 0);
createCube(-200, 0);
createCube(-300, 0);
var player = createPlayer();
render();

window.addEventListener("click", goToNext);
function goToNext() {
  targetPos.z = focusPos.z - 100;
  player.position.z -= 100;
}

function moveCamera() {
  const { x, z } = focusPos;
  if (x > targetPos.x) {
    camera.position.x -= 2;
    focusPos.x -= 2;
  }
  if (z > targetPos.z) {
    camera.position.z -= 2;
    focusPos.z -= 2;
  }
  camera.lookAt(focusPos.x, focusPos.y, focusPos.z);
}
