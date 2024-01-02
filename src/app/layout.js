import { Inter } from 'next/font/google';
import './globals.css';
import './prism-a11y-dark.css';
import '@/components/Projects/ProjectList.css';
import FaroContextProvider from '@/context/FaroContextProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
   title: 'AngelFolio',
   description: 'Website and portfolio',
};

export default function RootLayout({ children }) {
   return (
      <html lang='en'>
         <body className={inter.className}>
            <FaroContextProvider>{children}</FaroContextProvider>
         </body>
      </html>
   );
}
