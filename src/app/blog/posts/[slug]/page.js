import React from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import Image from 'next/image';
import { getPostFromSlugSupa, getSlugsSupa } from '@/app/api';
import Navbar from '@/components/NavBar/Navbar';
import Header from '@/components/Header/Header.js';
import Utils from '@/components/Utils.js';
import Footer from '@/components/Footer/Footer.js';
import HeadersCustom from '@/components/HeadersCustom.js';
import LikeButton from '@/components/Likes/LikeButton.js';
import ClientMDXWrapper from '@/components/MDX/ClientMDXWrapper';

export const dynamicParams = true;

const PostPage = async ({ params }) => {
   const { slug } = params;
   const { content, meta } = await getPostFromSlugSupa(slug);
   // Take the content and convert it into html/css/js
   const mdxSource = await serialize(content, {
      mdxOptions: {
         rehypePlugins: [rehypeSlug, rehypePrism],
      },
   });

   const post = {
      source: mdxSource,
      meta,
   };

   return (
      <>
         <HeadersCustom
            title={post.meta.title}
            description={post.meta.excerpt}
            imageURL={post.meta.imageURI}
         />
         <main
            className={
               'flex flex-col pt-2 px-6 max-w-[50rem] align-center m-auto min-h-[600px] w-full'
            }
         >
            <div className='w-full flex px-6'>
               <Navbar />
            </div>

            <div
               style={{
                  marginTop: '20px',
                  width: '100%',
                  height: '90px',
                  backgroundPosition: 'cover',
                  position: 'relative',
               }}
               className=''
            >
               <div
                  className=''
                  style={{
                     position: 'absolute',
                     left: '10%',
                     bottom: '-35px',
                     fontSize: '70px',
                     zIndex: 10,
                  }}
               >
                  {post.meta.emoji}
               </div>
               <Image
                  alt={'Post Cover Image'}
                  src={post.meta.imageURI}
                  fill={true}
                  style={{ objectFit: 'cover' }}
               ></Image>
            </div>
            <div className='blog-header'>
               <Header title={post.meta.title} size={null} />
            </div>
            <div className='blog-body mb-2'>
               <LikeButton slug={post.meta.slug}></LikeButton>
            </div>
            <div className='blog-body prose prose-invert'>
               <ClientMDXWrapper {...{ post, Utils }} />
            </div>
         </main>
         <Footer />
      </>
   );
};

export const getStaticPaths = async () => {
   const paths = (await getSlugsSupa()).map((slug) => ({ params: { slug } }));
   return {
      paths,
      fallback: 'blocking',
   };
};

export default PostPage;
