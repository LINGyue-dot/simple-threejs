import * as THREE from "three";
import OrbitControl from "./orbitControl";
// 模仿 https://wenzhe.one/I-cannot-deal-with-Rubiks-cube/
// 先不考虑 orbitControl 影响
// 1. raycast 来获取鼠标按下的小方块面 face.materialIndex ，对于小方块面来说只有 4 个移动方向，左右上下，求出鼠标移动的向量与这四个方向的单位向量的相近，用点乘来计算出哪个更接近，如 |A * B|>|A * C| 就说明 A 更接近 B ，就认为此时需要向 B 方向进行旋转
// 2. 根据这个方块面以及需要移动的方向获取需要转动的 9 个 cube --> 一个简单的方法就是直接获取他附近 5x5 的附近对象即可
// 3. 旋转函数，包括转动的中心
// 4. 如何转换为魔方公式？--> 当前面的中心方块是固定的，可以创建一个 map 映射回魔方公式

// left problems or key point
// 1. 圆角立方体是如何实现的，如何 anti-aliased
// 2. 如何获取的一层所有方块

// 旋转的是那个面

// materials 数据的位置数据映射，以 y 轴负方向作为基准方向
const faces = ["right", "left", "top", "bottom", "front", "back"];
const faceToIndex = faces.reduce((pre, val, index) => {
  pre[val] = index;
  return pre;
}, {});
// 看的方向是 [-1,-1,-1]
const faceColor = { front: "white", back: "yellow", top: "blue", bottom: "green", right: "red", left: "orange" };

const _z = new THREE.Vector3(0, 0, -1);
const z = new THREE.Vector3(0, 0, 1);
const x = new THREE.Vector3(1, 0, 0);
const _x = new THREE.Vector3(-1, 0, 0);
const y = new THREE.Vector3(0, 1, 0);
const _y = new THREE.Vector3(0, -1, 0);
const faceDirectionMap = { right: [_z, z, _y, y], left: [_z, z, _y, y], front: [x, _x, y, _y], back: [x, _x, y, _y],
  top: [x, _x, z, _z], bottom: [x, _x, z, _z] };

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0xcccccc);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
camera.position.set(500, 1000, 1500);
camera.lookAt(scene.position);
scene.add(camera);

const light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

const axesHelper = new THREE.AxesHelper(1000);
axesHelper.position.set(0, 0, 0);
scene.add(axesHelper);

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

const dom = renderer.domElement;
const raycast = new THREE.Raycaster();
const cubes = createRubiksCube();
const store = { intersection: undefined, startLocation: { x: undefined, y: undefined, z: undefined } };

dom.addEventListener("mousedown", (e) => {
  raycast.setFromCamera({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (-e.clientY / window.innerHeight) * 2 + 1 },
    camera);
  const intersects = raycast.intersectObjects(cubes);
  console.log(intersects[0]);
  if (intersects.length) {
    store.intersection = intersects[0];
    store.startLocation = intersects[0].point;
  }
});

dom.addEventListener("mousemove", (e) => {
  if (!store.intersection) return;
  raycast.setFromCamera({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (-e.clientY / window.innerHeight) * 2 + 1 },
    camera);
  // FIXME 目前不能在 move 过程中将鼠标移出物体
  const intersect = raycast.intersectObjects(cubes)[0];
  const vector = new THREE.Vector3().subVectors(intersect.point, store.startLocation);
  if (vector.length() > 20) {
    rotateByIntersectionAndVector(intersect, vector);
    (store.intersection = undefined), (store.startLocation = { x: undefined, y: undefined, z: undefined });
  }
});

dom.addEventListener("mouseup", (e) => {
  (store.intersection = undefined), (store.startLocation = { x: undefined, y: undefined, z: undefined });
});

new OrbitControl(renderer.domElement, camera, cubes);

function createCube(position, colorfulFaces) {
  const geometry = new THREE.BoxGeometry(100, 100, 100);
  const material = new THREE.MeshPhysicalMaterial({ color: 0x000000 });

  const materials = Array.from({ length: 6 }).fill(material);
  if (colorfulFaces) {
    colorfulFaces.forEach((face) => {
      const color = faceColor[face];
      // 这里能否设置分辨率以提高抗锯齿
      const texture = new THREE.CanvasTexture(createRoundedRectangle(color));
      materials[faceToIndex[face]] = new THREE.MeshBasicMaterial({ map: texture });
    });
  }

  const cube = new THREE.Mesh(geometry, materials);
  if (position) cube.position.set(...position);
  scene.add(cube);
  return cube;
}

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

  const cubes = [
    // 第一层
    createCube([-100, 100, 100], ["front", "left", "top"]),
    createCube([0, 100, 100], ["front", "top"]),
    createCube([100, 100, 100], ["front", "top", "right"]),
    createCube([-100, 0, 100], ["front", "left"]),
    createCube([0, 0, 100], ["front"]),
    createCube([100, 0, 100], ["front", "right"]),
    createCube([-100, -100, 100], ["front", "left", "bottom"]),
    createCube([0, -100, 100], ["front", "bottom"]),
    createCube([100, -100, 100], ["front", "bottom", "right"]),

    // second depth
    createCube([-100, 100, 0], ["top", "left"]),
    createCube([0, 100, 0], ["top"]),
    createCube([100, 100, 0], ["top", "right"]),
    createCube([-100, 0, 0], ["left"]),
    createCube([0, 0, 0]),
    createCube([100, 0, 0], ["right"]),
    createCube([-100, -100, 0], ["left", "bottom"]),
    createCube([0, -100, 0], ["bottom"]),
    createCube([100, -100, 0], ["right", "bottom"]),

    // third depth
    createCube([-100, 100, -100], ["top", "left", "back"]),
    createCube([0, 100, -100], ["top", "back"]),
    createCube([100, 100, -100], ["top", "right", "back"]),
    createCube([-100, 0, -100], ["left", "back"]),
    createCube([0, 0, -100], ["back"]),
    createCube([100, 0, -100], ["right", "back"]),
    createCube([-100, -100, -100], ["left", "bottom", "back"]),
    createCube([0, -100, -100], ["back", "bottom"]),
    createCube([100, -100, -100], ["right", "bottom", "back"])
  ];
  return cubes;
}

function rotateByIntersectionAndVector(intersection, vector) {
  // 先根据 materialIndex 求出四条移动方向的向量
  const unitVector = new THREE.Vector3().copy(vector).normalize();

  const materialIndex = intersection.face.materialIndex;
  const face = faces[materialIndex];
  const directionVectors = faceDirectionMap[face];

  const direction = getClosestDirection(unitVector, directionVectors);
  // 寻找某一范围内的所有元素
  const layerCubs = getRangeCubesByIntersectionAndDirection(intersection, direction);

  const centerPoint = layerCubs.reduce((pre, current) => {
    pre.x += current.position.x;
    pre.y += current.position.y;
    pre.z += current.position.z;
    return pre;
  }, { x: 0, y: 0, z: 0 });
  const centerCube = layerCubs.find(cube =>
    cube.position.x === centerPoint.x / 9 && cube.position.y === centerPoint.y / 9
    && cube.position.z === centerPoint.z / 9
  );
  const isClockWise = [x, y, z].includes(direction);
  rotateLayer(layerCubs, centerCube, isClockWise);
}

function getRangeCubesByIntersectionAndDirection(intersection, direction) {
  const position = intersection.object.position;
  const materialIndex = intersection.face.materialIndex;
  let leftBottomPoint, rightTopPoint;
  // 6 个面 --> 整合为 3 个面情况考虑
  if (materialIndex <= 1) {
    // 左右面
    if ([z, _z].includes(direction)) {
      // 左右旋转，保持 y 一致寻找以 intersection 为中心的 5x5
      leftBottomPoint = new THREE.Vector3(position.x - 200, position.y, position.z - 200);
      rightTopPoint = new THREE.Vector3(position.x + 200, position.y, position.z + 200);
    } else {
      // 上下旋转，z 一致
      leftBottomPoint = new THREE.Vector3(position.x - 200, position.y - 200, position.z);
      rightTopPoint = new THREE.Vector3(position.x + 200, position.y + 200, position.z);
    }
  } else if (materialIndex <= 3) {
    // top bottom z 一致
    if ([x, _x].includes(direction)) {
      leftBottomPoint = new THREE.Vector3(position.x - 200, position.y - 200, position.z);
      rightTopPoint = new THREE.Vector3(position.x + 200, position.y + 200, position.z);
    } else {
      // x 一致
      leftBottomPoint = new THREE.Vector3(position.x, position.y - 200, position.z - 200);
      rightTopPoint = new THREE.Vector3(position.x, position.y + 200, position.z + 200);
    }
  } else {
    // front back
    if ([x, _x].includes(direction)) {
      // 左右移动 y 保持一致
      leftBottomPoint = new THREE.Vector3(position.x - 200, position.y, position.z - 200);
      rightTopPoint = new THREE.Vector3(position.x + 200, position.y, position.z + 200);
    } else {
      // 上下旋转 x 保持一致
      leftBottomPoint = new THREE.Vector3(position.x, position.y - 200, position.z - 200);
      rightTopPoint = new THREE.Vector3(position.x, position.y + 200, position.z + 200);
    }
  }
  return findCubesByRange(leftBottomPoint, rightTopPoint);
}

function findCubesByRange(leftBottomPoint, rightTopPoint) {
  function isInRange(val, min, max) {
    return val <= max && val >= min;
  }

  return cubes.filter(({ position }) =>
    isInRange(position.x, leftBottomPoint.x, rightTopPoint.x)
    && isInRange(position.y, leftBottomPoint.y, rightTopPoint.y)
    && isInRange(position.z, leftBottomPoint.z, rightTopPoint.z)
  );
}

// 旋转一层
function rotateLayer(layerCubs, centerCube, isClockWise = true) {
  // 围绕原点到中心点的向量一点旋转 PI/2
  const point = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), centerCube.position);

}

// 获取 directions 中与 vector 最相近的向量
// directions 中的需要都是单位向量
function getClosestDirection(vector, directions) {
  let similarDirection = undefined, maxVal = Number.MIN_VALUE;
  directions.forEach(direction => {
    const value = new THREE.Vector3().copy(direction).dot(vector);
    if (value > maxVal) {
      similarDirection = direction;
      maxVal = value;
    }
  });
  return similarDirection;
}
