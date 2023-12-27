import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import '../styles/globals.css'
import '../styles/ProjectList.css';
import '../styles/prism-a11y-dark.css';
import { Analytics } from '@vercel/analytics/react';
import FaroContext from '../init/FaroContextProvider';

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
