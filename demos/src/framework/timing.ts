import { interpolate } from 'remotion';

export const ease = {
   linear: (t: number) => t,
   inOutCubic: (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
   outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
   outExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
   inOutQuint: (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
};

export type Easing = keyof typeof ease;

export interface Keyframe<T> {
   at: number;
   value: T;
}

export function interpolateKeyframes(
   frame: number,
   keyframes: Keyframe<number>[],
   easing: Easing = 'inOutCubic'
): number {
   if (keyframes.length === 0) return 0;
   if (frame <= keyframes[0].at) return keyframes[0].value;
   if (frame >= keyframes[keyframes.length - 1].at)
      return keyframes[keyframes.length - 1].value;

   for (let i = 0; i < keyframes.length - 1; i++) {
      const a = keyframes[i];
      const b = keyframes[i + 1];
      if (frame >= a.at && frame <= b.at) {
         const t = (frame - a.at) / (b.at - a.at);
         const eased = ease[easing](t);
         return a.value + (b.value - a.value) * eased;
      }
   }
   return keyframes[keyframes.length - 1].value;
}

export function springInterpolate(
   frame: number,
   from: number,
   to: number,
   startFrame: number,
   durationFrames: number
): number {
   if (frame <= startFrame) return from;
   if (frame >= startFrame + durationFrames) return to;
   const t = (frame - startFrame) / durationFrames;
   const eased = 1 - Math.pow(1 - t, 4);
   return interpolate(eased, [0, 1], [from, to]);
}
