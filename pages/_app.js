import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import '../styles/globals.css'
import '../styles/prism.css';
import '../styles/ProjectList.css';
import { Analytics } from '@vercel/analytics/react';
import FaroContext from '../init/FaroContextProvider';
// Add the following code snippet to your application before any other JavaScript/TypeScript code!
// For example put the code in your root index.[ts|js] file, right before you initialize your SPA / App.

export default function App({ Component, pageProps }) {

  const [supabaseClient] = useState(() => createBrowserSupabaseClient())
  

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <FaroContext>
        <Component {...pageProps} />
      </FaroContext>
      <Analytics />
    </SessionContextProvider>

  )
}
