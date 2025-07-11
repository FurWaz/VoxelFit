import { defineStore } from 'pinia'

export const useScene = () => {
  return defineStore('scene', {
    state: () => ({
      size: {
        x: 1,
        y: 1,
        z: 1
      },
      blocks: [] as any[]
    }),
    actions: {
      setSize(x: number, y: number, z: number) {
        this.size.x = x;
        this.size.y = y;
        this.size.z = z;
      },
      index(x: number, y: number, z: number) {
        return z + y * this.size.z + x * this.size.y * this.size.z;
      }
    }
  })();
}
