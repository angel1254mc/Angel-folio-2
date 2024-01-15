'use client';
import React, { useEffect, useRef, useState } from 'react';
import Editor from "@monaco-editor/react";
import { debounce } from 'lodash';
import { MDXRemote } from 'next-mdx-remote';
import rehypeSlug from 'rehype-slug';
import rehypePrism from 'rehype-prism-plus';
import Utils from '../Utils';
import { serialize } from 'next-mdx-remote/serialize';

const PostEdit = ({ defaultPost }) => {

   const [code, setCode] = useState("");
   const [mdxSource, setMdxSource] = useState(null)

   const onChange = (value) => {
      // Do stuff with the code
      console.log(value);
      setCode(value)
   }

   const updateMDXSource = async (code) => {
      setMdxSource(await  serialize(code, {
         mdxOptions: {
            rehypePlugins: [rehypeSlug, rehypePrism],
            development: process.env.NODE_ENV === 'development',
         },
      }))
   }
   
   const debounceRef = useRef(null);

   useEffect(() => {
      if (!debounceRef.current) {
         debounceRef.current = debounce((val) => onChange(val), 300)
      }
   }, [])

   useEffect(() => {
      if (code && code.length > 1) {
         updateMDXSource(code);
      }
   }, [code])

   const postPreview = {
      source: mdxSource,
      meta: {
         
      }
   };

   console.log(mdxSource);

   return (
      <div className='w-full px-8 pb-6 flex justify-center'>
         <div className='w-full max-w-[80rem] gap-x-2 2xl:max-w-[100rem] h-auto flex flex-col lg:flex-row gap-y-4'>
            <div className='w-full flex flex-col'>
               <div className='flex flex-col gap-y-4 border-b-2 pb-14 text-white w-full'>
                  <div className='flex flex-col'>
                     <label htmlFor='name' className='text-base font-light '>
                        Post Title
                     </label>
                     <input
                        placeholder='Title Here'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='name' className='text-base font-light '>
                        Excerpt
                     </label>
                     <input
                        placeholder='A sentence encompassing the main topic of the post'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='name' className='text-base font-light '>
                        Emoji(s) 👁️👅👁️
                     </label>
                     <input
                        placeholder='🗿😏'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='name' className='text-base font-light '>
                        Project Slug
                     </label>
                     <input
                        placeholder='my-project-slug'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='name' className='text-base font-light '>
                        Post Slug
                     </label>
                     <input
                        placeholder='my-fancy-shmancy-post-slug'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                     />
                  </div>
                  <div className="w-full flex flex-col lg:flex-row">
                     <div className="w-1/2 flex flex-col gap-y-2">
                        <label className="text-xl">Edit Here</label>
                        <p className="text-sm text-gray-300">This editor technically takes Markdown but pretend that it knows what MDX is</p>
                        <Editor
                          className="mt-2 border-[#101010] border-2"
                          height="38rem"
                          width={`100%`}
                          language={"markdown"}
                          value={code}
                          theme={"vs-dark"}
                          defaultValue="// some comment"
                          onChange={(val) => debounceRef.current(val)}
                        />
                     </div>
                     <div className="w-1/2 flex flex-col gap-y-2">
                        <label className="text-xl">Preview Here</label>
                        <p className="text-sm opacity-0">OOoooooo hidden</p>
                        <div className="h-[38rem] overflow-auto blog-body border-2 border-[#101010] prose prose-invert">
                           { mdxSource && <MDXRemote {...postPreview.source} components={{ Utils }} />}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PostEdit;
