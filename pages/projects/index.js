import Head from 'next/head';
import React from 'react'
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import HeadersCustom from '../../components/HeadersCustom';
import Navbar from '../../components/Navbar';
import ProjectList from '../../components/Projects/ProjectList';
import styles from '../../styles/Home.module.css';
import { getAllProjectsSupa } from '../api';

const index = ({ projects }) => {
    return (
        <>
        <HeadersCustom title={"AngelFolio | Projects"} description={"Some of my Projects"}/>
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
  const projects = await getAllProjectsSupa();
  return {
    props: {projects},
    revalidate: 10, // Revalidate pagee every 10 seconds
  }
}

export default index;
