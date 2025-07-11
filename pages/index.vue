<template>
  <div class="flex flex-col grow">
    <header class="h-12 border-b-2 border-zinc-300 dark:border-zinc-700">
      
    </header>
    <div class="flex grow">
      <div class="w-1/2">

      </div>
      <div class="flex flex-col w-1/2">
        <div class="h-1/2">

        </div>
        <div class="h-1/2">
          <SceneView :scene="scene" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const scene = useScene();
console.log(scene);

setTimeout(() => {
  scene.setSize(1, 1, 1);
}, 1000);

</script>

<style>

</style>