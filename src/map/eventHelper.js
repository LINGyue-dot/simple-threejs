const store = { startLocation: null, endLocation: null, demo: null };
let move = false;

export function onMouseDown(event) {
  move = true;
  store.startLocation = { x: event.clientX, y: event.clientY };
}

export function onMouseMove(event) {
  if (!move) return;
  const offsetX = event.clientX - store.startLocation.x;
  const offsetY = event.clientY - store.startLocation.y;

  // 移动 500px 就 2PI
  store.demo.rotateAroundY(offsetX / 1000 * 2 * Math.PI);
  store.demo.rotateAroundX(offsetY / 1000 * 2 * Math.PI);

  store.startLocation = { x: event.clientX, y: event.clientY };
}

export function onMouseUp(event) {
  store.startLocation = null;
  move = false;
}

export function initEvent(demo) {
  store.demo = demo;
  const dom = demo.renderer.domElement;
  dom.addEventListener("mousedown", onMouseDown);
  dom.addEventListener("mousemove", onMouseMove);
  dom.addEventListener("mouseup", onMouseUp);
}
