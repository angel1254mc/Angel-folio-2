import React from 'react'
import Header from './Header'
import styles from '../styles/About.module.css'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote'
import Utils from '../content/components/Utils'
import profile from '../public/profile_picture.jpg';
const AboutHero = ({content}) => {


  return (
    <div className={styles.about_hero_container}>
        <div className={styles.about_header}>
            Angel Andres Lopez Pol
        </div>
        <Image alt={"About Us Profile Picture"} className={styles.about_image} quality={90} priority={true} src={profile} width={250} height={250}/>
        <div className="blog-body">
        <MDXRemote {...content} components={{Utils}}/>
        </div>
    </div>
  )
}

export default AboutHero