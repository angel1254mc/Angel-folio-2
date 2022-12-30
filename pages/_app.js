import { PageTransitionContextProvider } from '../components/Context/PageTransitionContext'
import '../styles/globals.css'
import '../styles/prism.css';
import '../styles/ProjectList.css';

export default function App({ Component, pageProps }) {
  return (
      <Component {...pageProps} />
  )
}
