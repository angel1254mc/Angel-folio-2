import { faGithub, faInstagram, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useEffect } from 'react'
import styles from '../styles/components/Socials.module.css'
export const Socials = ({openTrigger = true, delay = 0, id}) => {
  
    useEffect(() => {
        if (openTrigger)
            setTimeout(() => {
                document.getElementById(id).style.animationName = "popInRow";
                let children = [...document.getElementById(id).children];
                children.forEach((element, index) => {
                    setTimeout(() => {
                        element.style.animationName = "fadeIn";
                    }, 100 * index)
                })
            }, delay)
    }, [openTrigger])

    return (
        <div id={id} className={styles.socials_container}>
            <Link href="https://github.com/angel1254mc" className={styles.social_container}>
                <FontAwesomeIcon className={styles.icon_size} icon={faGithub}/>
            </Link>
            <Link href="https://www.linkedin.com/in/angel1254/" className={styles.social_container}>
                <FontAwesomeIcon className={styles.icon_size} icon={faLinkedin}/>
            </Link>
            <Link href="https://www.instagram.com/angel1254/" className={styles.social_container}>
                <FontAwesomeIcon className={styles.icon_size} icon={faInstagram}/>
            </Link>
            <Link href="https://www.youtube.com/channel/UC-kEszCPZTbWdRjt9RhVsYA" className={styles.social_container}>
                <FontAwesomeIcon className={styles.icon_size} icon={faYoutube}/>
            </Link>
        </div>
    )
}
