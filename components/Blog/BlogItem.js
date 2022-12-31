import { config, useSpring, animated } from '@react-spring/web';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import styles from '../../styles/components/blog/BlogList.module.css'
import Header from '../Header';
const BlogItem = ({post, empty}) => {

    const [isHover, setIsHover] = useState(false)
    const imgStyles = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      minHeight: isHover ? '90px' : '0px',
      boxShadow:  isHover ? '0px 0px 105px 3px rgba(46,147,255,0.25)' : '0px 0px 105px 3px rgba(46,147,255,0.00)',
    });


  if (empty) 
    return (
        <animated.div 
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className={styles.post_container}
            style={{
                boxShadow: imgStyles.boxShadow,
        }}>
            <div className={styles.content_container}>
                <div className="flex flex-col items-center justify-center">
                <Header style={{marginTop: '10px'}} title={'No Posts? O.O'} size={'2.5rem'} interval={1000}></Header>
                    <div>No Blog posts match this tag and/or project! . . . <b>yet</b></div>
                </div>
            </div>
        </animated.div>
    )
  const {title, excerpt, tags, project, date, slug, imageURI, emoji} = post;
  return (
    <animated.div 
    onMouseEnter={() => setIsHover(true)}
    onMouseLeave={() => setIsHover(false)}
    className={project && project != 'None' ? `${styles.unique} ${styles.post_container}` : styles.post_container}
    style={{
        boxShadow: imgStyles.boxShadow,
    }}>
        <animated.div 
        style={{
            minHeight: imgStyles.minHeight
        }}
        className={styles.notion_group}>
            <div className={styles.post_emoji}>{emoji}</div>
            <Image fill={true} src={imageURI} alt={project + ' image'}/>
        </animated.div>
        <div className={styles.content_container}>
            <div className={styles.post_top_group}>
                <div className={styles.post_title}>
                    {title}
                </div>
                <div className={styles.post_date}>
                    {(new Date(date)).toLocaleDateString()}
                </div>
            </div>
            <div className={styles.post_excerpt}>{excerpt}</div>
            <div className={`project-element-tools ${styles.bottom_margin}`}>
                {(project && project != 'None') ? <Link className={'unique project-element-tool'} href={`/projects/${project}`}>{project}</Link> : <></>}
                {tags.map((tag) => {
                    return <Link className={'project-element-tool'} key={tag} href={`/blog/tags/${tag}`}>{tag}</Link>
                })}
            </div>
            <div className={styles.post_bottom_group}>
                <Link href={`/blog/posts/${slug}`}className="project-see-more" >
                    <p>Read More . . .</p>
                </Link>
            </div>
        </div>
    </animated.div>
  )
}

export default BlogItem