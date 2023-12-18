/**
 * 简易的轨道控制器
 */

import { Matrix4, PositionalAudio, Vector3, Vector4 } from "three";

export default class OrbitControl {
  constructor(dom, camera) {
    this.dom = dom;
    this.camera = camera;
    this.target = new Vector3(0, 0, 0);
    this.scale = 1;

    const store = {
      preLocation: { x: null, y: null },
      type: undefined // left | right
    };

    dom.addEventListener("contextmenu", event => event.preventDefault());

    dom.addEventListener("mousedown", event => {
      store.preLocation = { x: event.clientX, y: event.clientY };
      if (event.button === 0) {
        // left or main button
        store.type = "left";
      }
      if (event.button === 2) {
        store.type = "right";
      }
    });
    dom.addEventListener("mousemove", event => {
      const deltaX = event.clientX - store.preLocation.x;
      const deltaY = event.clientY - store.preLocation.y;
      // TODO 可以加个 scale 因子
      store.type === "left" && this.rotate.call(this, -deltaY / 200 * Math.PI, -deltaX / 200 * Math.PI);
      store.type === "right" && this.translation.call(this, deltaX, deltaY);
      //   store.type === "right" && this.translation.call(this);
      store.preLocation = { x: event.clientX, y: event.clientY };
    });
    dom.addEventListener("wheel", event => {
      const scale = 1 + event.deltaY * -0.001;
      this.zoom(scale);
    });
    dom.addEventListener("mouseup", event => {
      store.preLocation = { x: null, y: null };
      store.type = undefined;
    });
  }

  // 旋转
  rotate(deltaBeta, deltaAlpha) {
    let position = new Vector4(this.camera.position.x, this.camera.position.y, this.camera.position.z, 1);
    const { x, y, z } = this.target;
    // 将 target 移动回原点 m1 ，后再进行角度等换算 ，换算完再逆矩阵 m1'
    const m1 = new Matrix4().set(1, 0, 0, -x, 0, 1, 0, -y, 0, 0, 1, -z, 0, 0, 0, 1);
    position.applyMatrix4(m1);

    // TODO 用旋转矩阵来进行
    const distance = new Vector3(position.x, position.y, position.z).distanceTo(new Vector3(0, 0, 0));
    // https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/202312181119460.awebp
    let beta = Math.acos((position.y) / distance) + deltaBeta;
    const alpha = Math.atan2(position.x, position.z) + deltaAlpha;
    // 由于轨道控制器始终保持 y 的相对方向是向上的，所以 beta 变化范围是 0.0001 -> Math.PI/2 - 0.0001
    beta = beta > Math.PI - Math.PI / 180 ? Math.PI - Math.PI / 180 : beta < Math.PI / 180 ? Math.PI / 180 : beta;
    position.set(distance * Math.sin(beta) * Math.sin(alpha), distance * Math.cos(beta),
      distance * Math.sin(beta) * Math.cos(alpha), 1);
    position.applyMatrix4(m1.invert());

    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(this.target);
  }

  zoom(scale) {
    this.scale *= scale;
    const { x, y, z } = this.camera.position;

    // target 平移到原点的矩阵 M1 ，缩放矩阵 M2 ，M1 逆矩阵 M3
    // 最终结果就是 = M3M2M1
    const m1 = new Matrix4().set(1, 0, 0, -this.target.x, 0, 1, 0, -this.target.y, 0, 0, 1, -this.target.z, 0, 0, 0, 1);
    const m2 = new Matrix4().set(scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1);
    const m3 = new Matrix4().copy(m1).invert();
    const location = new Vector4(x, y, z, 1);
    const finalPosition = location.applyMatrix4(m1).applyMatrix4(m2).applyMatrix4(m3);
    this.camera.position.set(finalPosition.x, finalPosition.y, finalPosition.z);
    this.camera.lookAt(this.target);
  }

  translation(offsetX = 1, offsetY = 1) {
    // https://typora-1300781048.cos.ap-beijing.myqcloud.com/img/202312181153290.webp
    // 摄像机坐标系
    const nAxis = new Vector3().subVectors(this.target, this.camera.position).normalize();
    const uAxis = new Vector3().crossVectors(this.camera.up, nAxis).normalize();
    const vAxis = new Vector3().crossVectors(nAxis, uAxis).normalize();

    // 修改 camera.position 以及 target 位置

    // 平移到原点的矩阵 M1 ，U 方向平移矩阵 M2 ， V 方向平移矩阵 M3 ，M1 逆矩阵 M4
    // 最终结果就是 M3M2M1

    const { x, y, z } = this.camera.position;
    const m1 = new Matrix4().set(1, 0, 0, offsetX * uAxis.x, 0, 1, 0, offsetX * uAxis.y, 0, 0, 1, offsetX * uAxis.z, 0,
      0, 0, 1);
    const m2 = new Matrix4().set(1, 0, 0, offsetY * vAxis.x, 0, 1, 0, offsetY * vAxis.y, 0, 0, 1, offsetY * vAxis.z, 0,
      0, 0, 1);
    // const m4 = new Matrix4().copy(m1).invert();
    const translationMatrix = new Matrix4().copy(m1).multiply(m2);

    const cameraPosition = new Vector4(x, y, z, 1).applyMatrix4(translationMatrix);
    const targetPosition = new Vector4(this.target.x, this.target.y, this.target.z, 1).applyMatrix4(translationMatrix);
    this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    this.target = new Vector3().set(targetPosition.x, targetPosition.y, targetPosition.z);
    this.camera.lookAt(this.target);
  }
}
