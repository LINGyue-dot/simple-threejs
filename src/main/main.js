import * as three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new three.Scene();

const camera = new three.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);
scene.add(camera);

const cubeGeometry = new three.BoxGeometry(1, 1, 1);
const cubeMaterial = new three.MeshBasicMaterial({ color: 0xffffff });

const cube = new three.Mesh(cubeGeometry, cubeMaterial);

scene.add(cube);

const renderer = new three.WebGL1Renderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

function render() {
  // 使用渲染器通过相机渲染场景
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
