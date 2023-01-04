import Head from 'next/head';
import React from 'react'
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import ProjectList from '../../components/Projects/ProjectList';
import styles from '../../styles/Home.module.css';
import { getAllPosts, getAllProjects } from '../api';

const index = ({ projects }) => {
    return (
        <>
        <Head>
          <title>AngelFolio | About</title>
          <meta name="description" content="Angel's Portfolio and Blog about tech, development, and more!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="image" content='https://www.angel1254.com/link-image.png'/>
          <meta property="og:image" content='https://www.angel1254.com/link-image.png'/>
          <meta name="twitter:card" content="summary_large_image"></meta>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main + ' main-body'}>
          <Navbar/>
          <Header title={"Projects"}/>
          <ProjectList projects={projects}/>
        </main>
        <Footer></Footer>
        </>
    )
}

export async function getStaticProps() {
  const projects = await getAllProjects();
  return {
    props: {projects}
  }
}

export default index;
