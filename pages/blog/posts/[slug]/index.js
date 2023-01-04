import React from 'react'
import { getPostFromSlug } from '../../../api';
import { MDXRemoteSerializeResult, MDXRemote } from 'next-mdx-remote';
import {serialize} from 'next-mdx-remote/serialize';
import { getSlugs } from '../../../api';
import Head from 'next/head';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import styles from '../../../../styles/Home.module.css';
import Navbar from '../../../../components/Navbar';
import Header from '../../../../components/Header';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import * as components from '../../../../content/components/ProjectCard.js'
import Utils from '../../../../content/components/Utils.js'
import Footer from '../../../../components/Footer';
const PostPage = ({post}) => {
  
  return (
    <>
    <Head>
      <title>{post.meta.title}</title>
      <meta name="description" content={post.excerpt}/>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="image" content='https://www.angel1254.com/link-image.png'/>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main className={styles.main + ' blog-body'}>
      <Navbar/>
      <div style={{marginTop: '20px', width: '100%', height: '90px', backgroundPosition: 'cover', position: 'relative'}} className="">
        <div className='' style={
          {
            position: 'absolute',
            left: '10%',
            bottom: '-35px',
            fontSize: '70px',
            zIndex: 10,
            }}>{post.meta.emoji}</div>
        <Image alt={'Post Cover Image'} src={post.meta.imageURI} fill={true} style={{objectFit: 'cover'}}></Image>
      </div>
      <div className="blog-header">
        <Header title={post.meta.title} size={null}/>
      </div>
      <div className="blog-body">
        <MDXRemote {...post.source} components={{components, Utils}}/>
      </div>
    </main>
    <Footer/>
    </>
  )
}

export const getStaticProps = async ({params}) => {
  const {slug} = params;
  const {content, meta} = getPostFromSlug(slug);
  // Take the content and convert it into html/css/js
  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, {behavior: 'wrap'}],
        rehypePrism
      ]
    }
  });
  // mdxSource literally returns epic html version
  return {
    props: {
      post: {source: mdxSource, meta}
    }
  }
}

export const getStaticPaths = async () => {
  const paths = getSlugs().map(slug => ({params: {slug}}));
  return (
    {
      paths,
      fallback: false
    }
  )
}


export default PostPage;