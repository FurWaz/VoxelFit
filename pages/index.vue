<template>
  <div class="flex flex-col grow">
    <header class="h-fit border-b-2 border-gray-200 dark:border-gray-700 p-2">
      VoxelFit
    </header>
    <div class="flex grow">
      <div class="w-1/2">
        <CodeEditor width="100%" height="100%" :theme="darkMode? 'atom-one-dark': 'atom-one-light'"
          v-model="code_content" :display-language="false" :copy-code="false" :languages="[['lua']]">

        </CodeEditor>
      </div>
      <div class="flex flex-col w-1/2">
        <div class="flex justify-evenly">
          <UFormField label="Size X" class="flex space-x-4 items-center">
            <UInputNumber v-model="size_x" class="w-26" />
          </UFormField>
          <UFormField label="Size Y" class="flex space-x-4 items-center">
            <UInputNumber v-model="size_y" class="w-26" />
          </UFormField>
          <UFormField label="Size Z" class="flex space-x-4 items-center">
            <UInputNumber v-model="size_z" class="w-26" />
          </UFormField>
        </div>
        <!-- <div class="h-1/2">

        </div> -->
        <div class="h-full">
          <SceneView :scene="(scene as any)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import CodeEditor from "simple-code-editor";
import * as luainjs from 'lua-in-js'
const colorMode = useColorMode();

const darkMode = computed(() => colorMode.value == 'dark');
const scene = useScene();

const size_x = ref(1);
watch(size_x, (val, old) => scene.size.x = val);
const size_y = ref(1);
watch(size_y, (val, old) => scene.size.y = val);
const size_z = ref(1);
watch(size_z, (val, old) => scene.size.z = val);

function updateBlocks(code: string) {
    const createLua = (code: string, x: number, y: number, z: number) => `function color(x, z, y)
      ${code}
    end
    return color(${x}, ${y}, ${z})`;
    
    const luaEnv = luainjs.createEnv();
    luaEnv.loadLib('x', new luainjs.Table({x: 9}));
    scene.$patch(state => {
      const tmp = [] as any[];
      for (let x = 0; x < state.size.x; x++) {
        for (let y = 0; y < state.size.y; y++) {
          for (let z = 0; z < state.size.z; z++) {
            const result = luaEnv.parse(createLua(code, x, y, z)).exec();
            if (result) tmp[scene.index(x, y, z)] = parseInt(result.toString());
            else tmp[scene.index(x, y, z)] = undefined;
          }
        }
      }
      scene.blocks = tmp;
    });
  }

let compileTimeout = null as NodeJS.Timeout|null
const code_content = ref(`if (x-y > z) then
  return 0xff6900
end
if (z == 0) then
  return 0x2b7fff
end
if (math.abs(x-4) < y-5 and z < y-4) then
  return 0x00c951
end`);

watch(code_content, (val, old) => {
  if (compileTimeout) clearTimeout(compileTimeout);
  compileTimeout = setTimeout(() => updateBlocks(val), 500);
});

setTimeout(() => {
  scene.$patch({});
  updateBlocks(code_content.value);
}, 100);

</script>

<style>

</style>