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
   at?: number;             // scene-relative frame when this clip begins
   startAt?: number;        // offset into the media file to begin playback
   durationInFrames?: number;
   volume?: number;
   fadeInFrames?: number;
   fadeOutFrames?: number;
}

export interface OutroSpec {
   url: string;
   fadeInFrames: number;
   holdFrames: number;
   fadeOutFrames: number;
}

export interface KeycapSpec {
   at: number;
   text: string;           // e.g. 'playmusic'
   perKeyFrames: number;   // 7 at 60fps for 120ms per-key
   position?: 'top-center' | 'bottom-center';
}

export interface BrandOutroSpec {
   at: number;              // frame (scene-relative) when slide starts
   slideFrames: number;     // 42 for ~700ms at 60fps
   holdFrames: number;      // 180 for 3s tagline hold
   fadeOutFrames: number;   // 36 for 600ms audio fade
   brand: string;           // 'AngelFolio'
   url: string;             // 'angellopez.dev'
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
   audios?: AudioSpec[];    // multiple concurrent/sequential audio clips
   outro?: OutroSpec;
   keycap?: KeycapSpec;
   brandOutro?: BrandOutroSpec;
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
