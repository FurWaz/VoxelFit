import { defineStore } from 'pinia'

export const useScene = () => {
  return defineStore('scene', {
    state: () => ({
      size: {
        x: 0,
        y: 0,
        z: 0
      },
      blocks: []
    }),
    actions: {
      setSize(x: number, y: number, z: number) {
        this.size.x = x;
        this.size.y = y;
        this.size.z = z;
      }
    }
  })();
}
