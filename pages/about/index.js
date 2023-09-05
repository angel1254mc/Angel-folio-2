import Head from 'next/head';
import path from "path";
import fs from "fs";
import matter from 'gray-matter';
import Footer from '../../components/Footer.js'
import React from 'react'
import AboutHero from '../../components/AboutHero';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Home.module.css';
import {serialize} from 'next-mdx-remote/serialize';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrism from 'rehype-prism';

const index = ({source}) => {
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
        <main className={"flex flex-col pt-2 px-6 max-w-[50rem] align-center m-auto min-h-[600px] w-full"}>
          <Navbar/>
          <Header title={"About"}/>
          <AboutHero content={source}/>
          <Footer/>
        </main>
        </>
    )
}

export async function getStaticProps() {
  const ABOUT_PATH = path.join(process.cwd(), "content/about.mdx");
  const source = fs.readFileSync(ABOUT_PATH);
  const {content, data} = matter(source);
  console.log(content);
  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, {behavior: 'wrap'}],
        rehypePrism
      ]
    }
  });
  console.log(mdxSource);

  return {
    props: {
      source: mdxSource
    },
    revalidate: 10
  }
}

export default index;
