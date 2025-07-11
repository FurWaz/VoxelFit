<template>
  <div class="flex grow min-w-0 min-h-0 max-h-full max-w-full">
    <canvas id="canvas" class="flex grow min-w-0 min-h-0 max-h-full max-w-full" />
  </div>
</template>

<script lang="ts" setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import type { Store } from 'pinia';

const props = defineProps<{
  scene: Store<"scene", {size:{x:number, y:number, z:number}}>
}>();

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

const gridLines = null;

function setBoundingSize(x: number, y: number, z: number) {
  if (!scene) return;
  if (gridLines) scene.remove(gridLines);

  // TODO : construct points for bounding box
  const points = [];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const line = new THREE.LineSegments(geometry, material);
  scene.add(line);
}

props.scene.$subscribe((mutation, state) => {
  setBoundingSize(state.size.x, state.size.y, state.size.z);
});

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
});
</script>

<style>

</style>