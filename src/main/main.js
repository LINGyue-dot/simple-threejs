import * as three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new three.Scene();

const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1, 1, 10);
scene.add(camera);

const textureLoader = new three.TextureLoader();
const doorTexture = textureLoader.load("https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/202310102246827.jpg");
const doorAlphaTexture = textureLoader.load(
  "https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/202310102246046.jpg"
);
const aoDoorTexture = textureLoader.load(
  "https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/202310102312369.jpg"
);
const displaceDoortexture = textureLoader.load(
  "https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/202310112243613.jpg"
);

// 增加 xyz 都添加上 200 个点
const cubeGeometry = new three.BoxGeometry(2, 2, 2, 200, 200, 200);
const cubeMaterial = new three.MeshStandardMaterial({
  color: 0xffffff,
  map: doorTexture,
  alphaMap: doorAlphaTexture,
  //  alphaMap 对应的黑色区域变为透明
  transparent: true,
  // aoMap 用黑色表示环境光遮挡效果，越靠近黑色遮挡效果越明显
  aoMap: aoDoorTexture,
  displacementMap: displaceDoortexture,
  displacementScale: 0.2
});
cubeGeometry.setAttribute("uv2", new three.BufferAttribute(cubeGeometry.attributes.uv.array, 2));

const cube = new three.Mesh(cubeGeometry, cubeMaterial);
cube.rotateY(Math.PI / 4);
cube.rotateX(Math.PI / 4);

const light = new three.DirectionalLight(0xffffff);
light.position.set(10, 0, 0);
scene.add(light);

scene.add(cube);

const renderer = new three.WebGL1Renderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new three.AxesHelper(5);
scene.add(axesHelper);

function render(timer) {
  // 使用渲染器通过相机渲染场景
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener("resize", function() {
  // 摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新投影矩阵
  camera.updateProjectionMatrix();

  renderer.setSize(this.window.innerWidth, this.window.innerHeight);
  // devicePixelRatio 返回物理像素分辨率/CSS 像素分辨率，即告诉浏览器使用多少屏幕实际像素绘制单个 CSS 像素
  renderer.setPixelRatio(this.window.devicePixelRatio);
});
