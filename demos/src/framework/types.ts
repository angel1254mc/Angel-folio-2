export interface TargetRect {
   x: number;
   y: number;
   w: number;
   h: number;
}

export interface DemoMeta {
   fps: number;
   windowRect: { x: number; y: number; w: number; h: number };
   targets: Record<string, TargetRect>;
   t0Frame: number;
}

export type NormalizedOrigin = [number, number];
export type OriginSpec = NormalizedOrigin | string;

export interface CameraKeyframe {
   at: number;
   scale: number;
   origin: OriginSpec;
}

export interface CursorWaypoint {
   at: number;
   target?: string;
   position?: [number, number];
   anchor?: 'offscreen-right' | 'offscreen-left' | 'center' | 'fade-out';
}

export interface ClickSpec {
   at: number;
   target: string;
}

export interface CalloutSpec {
   at: number;
   until: number;
   target: string;
   label: string;
   side: 'top' | 'right' | 'bottom' | 'left';
}

export interface AudioSpec {
   src: string;
   startAt?: number;
   volume?: number;
   fadeOutFrames?: number;
}

export interface OutroSpec {
   url: string;
   fadeInFrames: number;
   holdFrames: number;
   fadeOutFrames: number;
}

export interface Scene {
   id: string;
   from: number;
   duration: number;
   camera?: CameraKeyframe[];
   cursor?: CursorWaypoint[];
   clicks?: ClickSpec[];
   callouts?: CalloutSpec[];
   audio?: AudioSpec;
   outro?: OutroSpec;
}

export interface DemoScript {
   fps: number;
   durationInFrames: number;
   width: number;
   height: number;
   recording: string;
   meta: string;
   chrome: { url: string };
   scenes: Scene[];
}
