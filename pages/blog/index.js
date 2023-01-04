import Head from 'next/head';
import React from 'react'
import BlogList from '../../components/Blog/BlogList';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Home.module.css';
import Image from 'next/image';
import { getAllPosts, getSlugs } from '../api';
import Footer from '../../components/Footer';

const index = ({ posts }) => {
    return (
        <>
        <Head>
          <title>AngelFolio | About</title>
          <meta name="description" content="Angel's Portfolio and Blog about tech, development, and more!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="image" content='https://www.angel1254.com/link-image.png'/>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main + ' main-body'}>
          <Navbar/>
          <Header title={"Blog"}/>
          <BlogList posts={posts}/>
        </main>
        <Footer/>
        </>
    )
}
export async function getStaticProps() {
  
  const posts = getAllPosts().map(post => post.meta);
  // Now we can pass our information to the component
  return {
    props: {posts}
  }
}

export default index;

