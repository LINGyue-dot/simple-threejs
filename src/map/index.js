import { AmbientLight, AxesHelper, BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene,
  WebGLRenderer } from "three";
import OrbitControl from "./orbitControl";

const width = window.innerWidth - 50;
const height = window.innerHeight - 50;

const renderer = new WebGLRenderer({});
renderer.setSize(width, height);
renderer.setClearColor(0xcccccc);

document.body.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera(45, width / height, 0.1, 100000);
camera.position.set(500, 500, 500);
camera.lookAt(0, 0, 0);
scene.add(camera);

const axisHelper = new AxesHelper(10000);
scene.add(axisHelper);

const light = new AmbientLight(0xffffff);
scene.add(light);

// for test
const geometry = new BoxGeometry(50, 50, 50);
const material = new MeshBasicMaterial({ color: 0x000000 });
const cube = new Mesh(geometry, material);

scene.add(cube);

new OrbitControl(renderer.domElement, camera);

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
