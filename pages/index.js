
import { Inter } from '@next/font/google'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import { useContext, useEffect, useRef, useState } from 'react'
import { getAllPostsSupa, getAllProjectsSupa } from './api'
import SpotifyBubble from '../components/SpotifyBubble'
import Footer from '../components/Footer';
import HeadersCustom from '../components/HeadersCustom'
import { useSpring, useTrail, useTransition } from 'react-spring'
import { animated } from 'react-spring'
import IntroComponent from '../components/Home/IntroComponent'
import WorkComponent from '../components/Home/WorkComponent'
import LastStarredRepo from '../components/Home/LastStarredRepo'
import CoffeeComponent from '../components/Home/CoffeeComponent'
const inter = Inter({ subsets: ['latin'] })

export default function Home({posts, projects}) {

  // TODO (@angel1254mc) change pageState useState to global context
  const [headerSpring, headerApi] = useSpring(() => ({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1
    }
  }))

  const [trails, api] = useTrail(
    13,
    () => ({
      from: { 
        opacity: 0,
        scale: 1.03,
      },
      to: {
        opacity: 1,
        scale: 1,
      },
      config: { mass: 5, tension: 2000, friction: 200 },
      delay: 500,
    })
  )


  return (
    <div className="w-full flex flex-col items-center">
      <HeadersCustom/>
      <main className="w-full flex flex-col items-center ">
        <div className="w-full max-w-[50rem] flex flex-col justify-start py-2 px-6">
          <Navbar/>
          <Header animateStyle={headerSpring} title={"Home"}/>

        </div>
        {
          /**
           * <div className={styles.animate_hero}>
          <ShmoveImages openTrigger={image}/>
          <TLDR id="home-tldr" triggerImage={showImage} content={tldr} delay={100}/>
          <Socials openTrigger={image} delay={500} id={"awesome"}/>
        </div>
           */
        }
      </main>
      <div className="w-full px-8 flex justify-center">
        <div className="w-full max-w-[50rem] h-auto flex flex-col gap-y-4">
          <div className="w-full justify-center flex sm:flex-row flex-col sm:h-auto sm:min-h-[0] min-h-[48rem] gap-x-4 gap-y-4 items-center sm:items-start sm:gap-y-0">
            <animated.div style={trails[0]} className="flex sm:flex-1 w-96 sm:max-w-[24rem] h-96 bg-[#101010] rounded-md">
              <IntroComponent/>
            </animated.div>
            <div className="flex sm:flex-1 w-96 sm:max-w-[24rem] flex-col relative sm:h-96 sm:min-h-0 min-h-[36rem] gap-y-4">
              <animated.div  style={trails[1]}className="flex sm:flex-1 w-full h-96 bg-[#101010] rounded-md"> 
              <WorkComponent/>
              </animated.div>
              <div className="flex h-[12rem] sm:h-auto sm:flex-1 w-full gap-x-4">
                <animated.div style={trails[2]} className="flex flex-1 h-full bg-[#101010] rounded-md">
                  <CoffeeComponent/>
                </animated.div>
                <animated.div style={trails[3]} className="flex flex-1 h-full bg-[#101010] rounded-md">
                  <LastStarredRepo/>
                </animated.div>
              </div>
            </div>
          </div>
          <div className="w-full justify-center flex gap-x-4">
            <div className="flex flex-col gap-y-4 flex-1 max-w-[24rem]">
              <animated.div style={trails[4]} className="flex w-full h-44 bg-[#101010] rounded-md">
                  {/* Spotify Box 👁️🫦👁️ */}
              </animated.div>
              <animated.h1 style={trails[7]} className="text-2xl font-bold">Peep The Rest</animated.h1>
              <div className="flex w-full gap-x-4 h-44">
                <animated.div style={trails[9]}  className="flex flex-1 h-full bg-[#101010] rounded-md">
                  {/* SSD Box / Link to SSDiscord */}
                </animated.div>
                <animated.div style={trails[10]} className="flex flex-1 h-full bg-[#101010] rounded-md">
                  {/* Twitch Box 👁️🫦👁️ */}
                </animated.div>
              </div>
              <animated.div style={trails[12]} className="flex w-full gap-x-4 h-60 bg-[#101010] rounded-md">
              </animated.div>
            </div>
            <div className="flex flex-col gap-y-4 flex-1 max-w-[24rem]">
              <animated.h1 style={trails[5]} className="text-2xl font-bold">Peep The Blog</animated.h1>
              <animated.div style={trails[6]} className="flex w-full h-48 bg-[#101010] rounded-md">
                 {/* Latest Blog Post Box */}
              </animated.div>
              <animated.h1 style={trails[8]} className="text-2xl font-bold">Peep The Projects</animated.h1>
              <animated.div style={trails[11]} className="flex w-full h-48 bg-[#101010] rounded-md">
                {/* Most Relevant Project */}
              </animated.div>
              <animated.div style={trails[13]} className="flex w-full h-48 bg-[#101010] rounded-md">
                {/* Second Most Relevant Project */}
              </animated.div>
            </div>
          </div>
        </div>
      </div>
        {/**
         * 
         * <section className={styles.projects_and_blog}>
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
         * 
         * 
         */}
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