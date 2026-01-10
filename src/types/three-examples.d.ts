// Минимальная декларация для OrbitControls из three/examples/jsm/controls/OrbitControls
// Помогает TypeScript при импорте примеров three.
// Сохраните файл: src/types/three-examples.d.ts

import { Camera, Event, MOUSE, TOUCH, Vector3 } from 'three';

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, Event, Vector3 } from 'three';
  export class OrbitControls {
    constructor(object: Camera, domElement?: HTMLElement);
    enabled: boolean;
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    zoomSpeed: number;
    rotateSpeed: number;
    panSpeed: number;
    keys: string[];
    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };
    touches: { ONE: TOUCH; TWO: TOUCH };
    update(): void;
    dispose(): void;
    addEventListener(type: string, listener: (event?: Event) => void): void;
    removeEventListener(type: string, listener: (event?: Event) => void): void;
  }
  export default OrbitControls;
}
