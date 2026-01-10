// Добавьте этот файл в проект (src/types/three-examples.d.ts)
// Он объявляет минимальные типы для OrbitControls из three/examples/jsm,
// чтобы TypeScript не жаловался при импорте.
import { Camera, Vector3 } from 'three';

declare module 'three/examples/jsm/controls/OrbitControls' {
  export class OrbitControls {
    constructor(camera: Camera, domElement?: HTMLElement);
    update(): void;
    dispose(): void;
    enableDamping: boolean;
    dampingFactor: number;
    minDistance: number;
    maxDistance: number;
    target: Vector3;
  }
}
