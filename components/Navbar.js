import { useRouter } from 'next/router';
import React, { useContext } from 'react'
import styles from '../styles/components/Navbar.module.css';
import { PageTransitionContext } from './Context/PageTransitionContext';
function Navbar() {
    //const {navigateAway} = useContext(PageTransitionContext);
    const router = useRouter()
  return (
    <nav className={styles.navbar}>
        <div className={styles.navlink} onClick={ () => router.push('/')}>
            Home
        </div>
        <div className={styles.navlink} onClick={ () => router.push('/blog')}>
            Blog
        </div>
        <div className={styles.navlink} onClick={ () => router.push('/projects')}>
            Projects
        </div>
        <div className={styles.navlink} onClick={ () => router.push('/resume')}>
            Resume
        </div>
    </nav>
  )
}

export default Navbar