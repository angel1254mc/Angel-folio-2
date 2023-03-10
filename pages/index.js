import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import {tldr, Projects, Skills} from '../content/content.js'
import { TLDR } from '../components/TLDR'
import { ShmoveImages } from '../components/ShmoveImages'
import { useContext, useEffect, useRef, useState } from 'react'
import { Socials } from '../components/Socials'
import HomeProjectsList from '../components/HomeProjectsList'
import useIntersectionObserver from '../components/hooks/useIntersectionObserver'
import { PageTransitionContext } from '../components/Context/PageTransitionContext'
import BlogShortList from '../components/BlogShortList'
import { getAllPostsSupa, getAllProjectsSupa } from './api'
import SpotifyBubble from '../components/SpotifyBubble'
import Footer from '../components/Footer';
import LinkImage from '../public/link-image.png'
import HeadersCustom from '../components/HeadersCustom'
const inter = Inter({ subsets: ['latin'] })

export default function Home({posts, projects}) {
  
  const [image, showImage] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showBlogs, setShowBlogs] = useState(false);
  const projectsRef = useRef(0);
  const blogsRef = useRef(0);
  const dataRef = useIntersectionObserver(projectsRef, {threshold: 0.25});
  const blogRef = useIntersectionObserver(blogsRef, {threshold: 0.10});

  useEffect(() => {
    dataRef?.isIntersecting ? setShowProjects(true) : setShowProjects(false);
    blogRef?.isIntersecting ? setShowBlogs(true): setShowBlogs(false)
  }, [dataRef])
  return (
    <div className="w-full flex flex-col items-center">
      <HeadersCustom/>
      <main className={styles.main + ' main-body'}>
        <Navbar/>
        <div className={styles.animate_hero}>
          <Header title={"Home"}/>
          <ShmoveImages openTrigger={image}/>
          <TLDR id="home-tldr" triggerImage={showImage} content={tldr} delay={100}/>
          <Socials openTrigger={image} delay={500} id={"awesome"}/>
        </div>
      </main>
      <section className={styles.projects_and_blog}>
        <div className={styles.projects_container}>
            <Header title={"Some of My Projects"} size={'2.5rem'}/>
            <HomeProjectsList projects={projects} dynamic={false} innerRef={projectsRef} open={showProjects}/>
        </div>
        <div className={styles.blog_container}>
          <Header title={"Latest Blog Posts"} size={'2.5rem'}/>
          <BlogShortList dynamic={false} innerRef={blogsRef} open={showBlogs} posts={posts.map(post => post.meta)}/>
        </div>
      </section>
      <section className={styles.spotify_container}>
        <Header title={`If I'm listening to something, I'm not dead.`} style={{fontSize: '2.0rem'}} />
        
        <SpotifyBubble trigger={true}></SpotifyBubble>
      </section>
      <Footer></Footer>
    </div>
  )
}

export async function getStaticProps() {
  const projects = await getAllProjectsSupa();
  const posts = await getAllPostsSupa();
  return {
    props: {projects, posts},
    revalidate: 10, // Revalidate page every 10 seconds
  }
}