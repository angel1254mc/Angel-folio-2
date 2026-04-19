import {
   DemoMeta,
   TargetRect,
   OriginSpec,
   CameraKeyframe,
   NormalizedOrigin,
} from './types';
import { interpolateKeyframes } from './timing';

export function resolveOrigin(
   origin: OriginSpec,
   meta: DemoMeta
): NormalizedOrigin {
   if (Array.isArray(origin)) return origin;
   if (typeof origin === 'string' && origin.startsWith('target:')) {
      const name = origin.slice('target:'.length);
      const rect = meta.targets[name];
      if (!rect) {
         return [0.5, 0.5];
      }
      const cx = (rect.x + rect.w / 2) / meta.windowRect.w;
      const cy = (rect.y + rect.h / 2) / meta.windowRect.h;
      return [cx, cy];
   }
   return [0.5, 0.5];
}

export interface CameraState {
   scale: number;
   originX: number;
   originY: number;
}

export function resolveCameraAt(
   frameInScene: number,
   keyframes: CameraKeyframe[] | undefined,
   meta: DemoMeta
): CameraState {
   if (!keyframes || keyframes.length === 0) {
      return { scale: 1, originX: 0.5, originY: 0.5 };
   }
   const scaleKfs = keyframes.map((k) => ({ at: k.at, value: k.scale }));
   const originXs = keyframes.map((k) => ({
      at: k.at,
      value: resolveOrigin(k.origin, meta)[0],
   }));
   const originYs = keyframes.map((k) => ({
      at: k.at,
      value: resolveOrigin(k.origin, meta)[1],
   }));
   return {
      scale: interpolateKeyframes(frameInScene, scaleKfs),
      originX: interpolateKeyframes(frameInScene, originXs),
      originY: interpolateKeyframes(frameInScene, originYs),
   };
}

export function projectTargetToCanvas(
   target: TargetRect,
   meta: DemoMeta,
   camera: CameraState,
   footageRect: { x: number; y: number; w: number; h: number }
): { x: number; y: number; w: number; h: number } {
   const tcx = (target.x + target.w / 2) / meta.windowRect.w;
   const tcy = (target.y + target.h / 2) / meta.windowRect.h;
   const tw = target.w / meta.windowRect.w;
   const th = target.h / meta.windowRect.h;

   const screenCx =
      footageRect.x +
      footageRect.w *
         (camera.originX + (tcx - camera.originX) * camera.scale);
   const screenCy =
      footageRect.y +
      footageRect.h *
         (camera.originY + (tcy - camera.originY) * camera.scale);
   const screenW = footageRect.w * tw * camera.scale;
   const screenH = footageRect.h * th * camera.scale;

   return {
      x: screenCx - screenW / 2,
      y: screenCy - screenH / 2,
      w: screenW,
      h: screenH,
   };
}

export function targetCenter(
   target: TargetRect,
   meta: DemoMeta,
   camera: CameraState,
   footageRect: { x: number; y: number; w: number; h: number }
): { x: number; y: number } {
   const projected = projectTargetToCanvas(target, meta, camera, footageRect);
   return {
      x: projected.x + projected.w / 2,
      y: projected.y + projected.h / 2,
   };
}
