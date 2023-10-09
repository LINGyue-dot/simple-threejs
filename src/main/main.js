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

const axesHelper = new three.AxesHelper(5);
scene.add(axesHelper);

function render(timer) {
  // 1s 转 PI
  cube.rotation.x = (Math.PI * timer) / 1000;
  // 使用渲染器通过相机渲染场景
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener("resize", function () {
  // 摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新投影矩阵
  camera.updateProjectionMatrix();

  renderer.setSize(this.window.innerWidth, this.window.innerHeight);
  // devicePixelRatio 返回物理像素分辨率/CSS 像素分辨率，即告诉浏览器使用多少屏幕实际像素绘制单个 CSS 像素
  renderer.setPixelRatio(this.window.devicePixelRatio);
});
