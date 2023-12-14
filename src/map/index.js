import { AxesHelper, ObjectLoader } from "three";
import DemoScene from "./3d";
import { bindEventCallback } from "./domHelper";
import { initEvent } from "./eventHelper";

const demo = new DemoScene();

initEvent(demo);

bindEventCallback("rightRotate", () => demo.rotateAroundY(Math.PI / 18));
bindEventCallback("bottomRotate", () => demo.rotateAroundX(Math.PI / 18));
AxesHelper