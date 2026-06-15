import { useEffect, useState } from 'react';

// Fetches an audio URL, decodes it with the Web Audio API, and returns
// normalized peak heights (0..1) plus the true duration.
export default function useWaveform(audioUrl, barCount = 64) {
   const [state, setState] = useState({
      peaks: [],
      duration: 0,
      loading: true,
      error: null,
   });

   useEffect(() => {
      if (!audioUrl) return;
      let cancelled = false;
      let ctx;
      setState({ peaks: [], duration: 0, loading: true, error: null });

      (async () => {
         try {
            const res = await fetch(audioUrl);
            if (!res.ok) throw new Error('Failed to load audio');
            const raw = await res.arrayBuffer();
            const Ctx = window.AudioContext || window.webkitAudioContext;
            ctx = new Ctx();
            const audioBuf = await ctx.decodeAudioData(raw);
            const data = audioBuf.getChannelData(0);
            const block = Math.max(1, Math.floor(data.length / barCount));
            const peaks = [];
            for (let i = 0; i < barCount; i++) {
               let sum = 0;
               for (let j = 0; j < block; j++) {
                  sum += Math.abs(data[i * block + j] || 0);
               }
               peaks.push(sum / block);
            }
            const max = Math.max(...peaks, 0.0001);
            const normalized = peaks.map((p) => p / max);
            if (!cancelled) {
               setState({
                  peaks: normalized,
                  duration: audioBuf.duration,
                  loading: false,
                  error: null,
               });
            }
         } catch (err) {
            if (!cancelled) {
               setState({
                  peaks: [],
                  duration: 0,
                  loading: false,
                  error: err.message || 'Could not analyze audio',
               });
            }
         } finally {
            if (ctx) ctx.close().catch(() => {});
         }
      })();

      return () => {
         cancelled = true;
      };
   }, [audioUrl, barCount]);

   return state;
}
