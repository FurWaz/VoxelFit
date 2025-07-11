<template>
  <div class="flex grow min-w-0 min-h-0 max-h-full max-w-full w-full h-full">
    <canvas id="canvas" class="flex grow min-w-0 min-h-0 max-h-full max-w-full" />
  </div>
</template>

<script lang="ts" setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import type { Store } from 'pinia';

type StoreScene = Store<"scene", {size:{x:number, y:number, z:number},blocks:any[],index:(x:number,y:number,z:number)=>number}>;

const props = defineProps<{
  scene: StoreScene
}>();

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

let gridLines = null as THREE.LineSegments|null;

function setBoundingSize(x: number, y: number, z: number) {
  if (!scene) return;
  if (gridLines) scene.remove(gridLines);

  const points: THREE.Vector3[] = [];
  // x faces, y lines
  for (let i = -y/2-0.5; i < y/2+0.5; i++) {
    points.push(new THREE.Vector3(-x/2, i+0.5, z/2), new THREE.Vector3(-x/2, i+0.5, -z/2)); // + size
    points.push(new THREE.Vector3( x/2, i+0.5, z/2), new THREE.Vector3( x/2, i+0.5, -z/2)); // - size
  }
  // x faces, z lines
  for (let i = -z/2-0.5; i < z/2+0.5; i++) {
    points.push(new THREE.Vector3(-x/2, y/2, i+0.5), new THREE.Vector3(-x/2, -y/2, i+0.5)); // + size
    points.push(new THREE.Vector3( x/2, y/2, i+0.5), new THREE.Vector3( x/2, -y/2, i+0.5)); // - size
  }
  // y faces, x lines
  for (let i = -x/2-0.5; i < x/2+0.5; i++) {
    points.push(new THREE.Vector3(i+0.5, -y/2, z/2), new THREE.Vector3(i+0.5, -y/2, -z/2)); // + size
    points.push(new THREE.Vector3(i+0.5,  y/2, z/2), new THREE.Vector3(i+0.5,  y/2, -z/2)); // - size
  }
  // y faces, z lines
  for (let i = -z/2-0.5; i < z/2+0.5; i++) {
    points.push(new THREE.Vector3(x/2, -y/2, i+0.5), new THREE.Vector3(-x/2, -y/2, i+0.5)); // + size
    points.push(new THREE.Vector3(x/2,  y/2, i+0.5), new THREE.Vector3(-x/2,  y/2, i+0.5)); // - size
  }
  // z faces, x lines
  for (let i = -x/2-0.5; i < x/2+0.5; i++) {
    points.push(new THREE.Vector3(i+0.5, y/2, -z/2), new THREE.Vector3(i+0.5, -y/2, -z/2)); // + size
    points.push(new THREE.Vector3(i+0.5, y/2,  z/2), new THREE.Vector3(i+0.5, -y/2,  z/2)); // - size
  }
  // z faces, y lines
  for (let i = -y/2-0.5; i < y/2+0.5; i++) {
    points.push(new THREE.Vector3(x/2, i+0.5, -z/2), new THREE.Vector3(-x/2, i+0.5, -z/2)); // + size
    points.push(new THREE.Vector3(x/2, i+0.5,  z/2), new THREE.Vector3(-x/2, i+0.5,  z/2)); // - size
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x888888, opacity: 0.2, transparent: true });
  const line = new THREE.LineSegments(geometry, material);
  gridLines = line;
  scene.add(line);
}

const sceneBlocks: THREE.Object3D[] = [];
function updateBlocks(size: {x:number,y:number,z:number}, blocks:any[], index:(x:number,y:number,z:number)=>number) {
  console.log('updating BLOCKS, size is ', size.x, size.y, size.z);
  sceneBlocks.forEach(obj => {
    if(scene && obj) scene.remove(obj);
  });

  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      for (let z = 0; z < size.z; z++) {
        const i = index(x, y, z);
        if (!blocks[i]) continue;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: blocks[i] });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x - size.x / 2 + 0.5, y - size.y / 2 + 0.5, z - size.z / 2 + 0.5);
        scene.add(cube);
        sceneBlocks[i] = cube;
      }
    }
  }
}

props.scene.$subscribe((mutation, state) => {
  setBoundingSize(state.size.x, state.size.y, state.size.z);
  updateBlocks(state.size, state.blocks, props.scene.index);
});

onMounted(() => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  window.addEventListener('resize', ev => {
    if (!canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    canvas.style.width = rect.width+'px';
    canvas.style.height = rect.height+'px';

    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  })

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  camera.position.z = 5;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});
</script>

<style>

</style>