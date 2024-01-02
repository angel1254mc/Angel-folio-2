'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import styles from './Navbar.module.css';
function Navbar() {
   //const {navigateAway} = useContext(PageTransitionContext);
   const router = useRouter();
   return (
      <nav className={styles.navbar}>
         <div className={styles.navlink} onClick={() => router.push('/')}>
            Home
         </div>
         <div className={styles.navlink} onClick={() => router.push('/blog')}>
            Blog
         </div>
         <div
            className={styles.navlink}
            onClick={() => router.push('/projects')}
         >
            Projects
         </div>
         <div className={styles.navlink} onClick={() => router.push('/resume')}>
            Resume
         </div>
      </nav>
   );
}

export default Navbar;
