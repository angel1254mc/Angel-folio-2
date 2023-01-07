import Head from 'next/head';
import React from 'react'
import BlogList from '../../components/Blog/BlogList';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Home.module.css';
import Image from 'next/image';
import { getAllPostsSupa } from '../api';
import Footer from '../../components/Footer';
import HeadersCustom from '../../components/HeadersCustom';

const index = ({ posts }) => {
    return (
        <>
       <HeadersCustom title={'Posts by Tag'}/>
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
  
  const posts = (await getAllPostsSupa()).map(post => post.meta);
  // Now we can pass our information to the component
  return {
    props: {posts},
    revalidate: 10
  }
}

export default index;

