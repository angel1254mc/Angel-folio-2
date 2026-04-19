import React from 'react';

interface Props {
   url: string;
   x: number;
   y: number;
   width: number;
   height: number;
   children: React.ReactNode;
}

export const BrowserChrome: React.FC<Props> = ({
   url,
   x,
   y,
   width,
   height,
   children,
}) => {
   const chromeHeight = 44;
   return (
      <div
         style={{
            position: 'absolute',
            left: x,
            top: y,
            width,
            height,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow:
               '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
            background: '#121214',
            display: 'flex',
            flexDirection: 'column',
         }}
      >
         <div
            style={{
               height: chromeHeight,
               background: 'linear-gradient(180deg,#1f1f22,#17171a)',
               display: 'flex',
               alignItems: 'center',
               padding: '0 14px',
               gap: 12,
               borderBottom: '1px solid rgba(255,255,255,0.05)',
               flexShrink: 0,
            }}
         >
            <div style={{ display: 'flex', gap: 8 }}>
               <div
                  style={{
                     width: 12,
                     height: 12,
                     borderRadius: 6,
                     background: '#ff5f57',
                  }}
               />
               <div
                  style={{
                     width: 12,
                     height: 12,
                     borderRadius: 6,
                     background: '#febc2e',
                  }}
               />
               <div
                  style={{
                     width: 12,
                     height: 12,
                     borderRadius: 6,
                     background: '#28c840',
                  }}
               />
            </div>
            <div
               style={{
                  flex: 1,
                  height: 28,
                  margin: '0 80px 0 20px',
                  background: '#0c0c0d',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  fontSize: 13,
                  color: '#9a9aa0',
                  letterSpacing: 0.2,
               }}
            >
               <span style={{ marginRight: 8, fontSize: 11 }}>🔒</span>
               {url}
            </div>
         </div>
         <div
            style={{
               flex: 1,
               position: 'relative',
               overflow: 'hidden',
               background: '#000',
            }}
         >
            {children}
         </div>
      </div>
   );
};
