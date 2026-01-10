// src/types/aframe.d.ts
// Декларации типов для A-Frame компонентов в JSX (React + TypeScript)

declare namespace JSX {
  interface IntrinsicElements {
    // Основная сцена
    'a-scene': any;

    // Маркеры
    'a-marker': any;
    'a-marker-camera': any;

    // Примитивы
    'a-box': any;
    'a-sphere': any;
    'a-cylinder': any;
    'a-plane': any;
    'a-circle': any;
    'a-ring': any;
    'a-torus': any;
    'a-cone': any;
    'a-dodecahedron': any;
    'a-octahedron': any;
    'a-tetrahedron': any;
    'a-icosahedron': any;

    // Модели и текстуры
    'a-gltf-model': any;
    'a-obj-model': any;
    'a-image': any;

    // Текст, свет, камера
    'a-text': any;
    'a-light': any;
    'a-camera': any;
    'a-cursor': any;
    'a-sky': any;

    // Анимации и сущности
    'a-entity': any;
    'a-animation': any;

    // Ассеты
    'a-assets': any;
    'a-asset-item': any;
    'a-mixin': any;

    // Дополнительно (часто используются)
    'a-video': any;
    'a-sound': any;
  }
}
