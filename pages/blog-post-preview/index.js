import { MDXRemote } from 'next-mdx-remote';
import {serialize} from 'next-mdx-remote/serialize';
import Image from 'next/image';
import React from 'react'
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrism from 'rehype-prism';
import rehypeSlug from 'rehype-slug';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import HeadersCustom from '../../components/HeadersCustom';
import Navbar from '../../components/Navbar';
import Utils from '../../content/components/Utils';
import { getPostFromSlug} from '../api'
import styles from '../../styles/Home.module.css'

const index = ({post}) => {
  return (
    <>
    <HeadersCustom title={post.meta.title} description={post.meta.excerpt}/>
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
        <MDXRemote {...post.source} components={{Utils}}/>
      </div>
    </main>
    <Footer/>
    </>
  )
}

export async function getStaticProps() {
    const {content, meta} = await getPostFromSlug('test');
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
      },
      revalidate: 10, // revalidate every ten seconds
    }
}
export default index