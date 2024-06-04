'use client';
import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { debounce } from 'lodash';
import { MDXRemote } from 'next-mdx-remote';
import rehypeSlug from 'rehype-slug';
import rehypePrism from 'rehype-prism-plus';
import Utils from '../Utils';
import { serialize } from 'next-mdx-remote/serialize';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { postSchema } from '@/schema/schemas';
import { useRouter } from 'next/navigation';

const PostEdit = ({ defaultPost }) => {
   const [error, setError] = useState(null);
   const [code, setCode] = useState('');
   const [mdxSource, setMdxSource] = useState(null);
   const router = useRouter();

   const {
      register,
      handleSubmit,
      watch,
      control,
      formState: { errors },
   } = useForm({
      resolver: yupResolver(postSchema),
      ...(defaultPost && {defaultValues: defaultPost})
   });

   const onSubmit = async (post) => {
      console.log(post);
      const response = await fetch("/api/admin/posts", {
         method: "POST",
         body: JSON.stringify(post),
      })

      if (response.status == 200) {
         console.log("post insertion was successful!");
         // Do whatever needs to be done like reroute to admin page or smth
         router.push("/admin");
      } else {
         if (response.status == 500) {
            const body = await response.json();
            console.log(body);
         }
      }
   }

   const updateMDXSource = async (code) => {
      try {
         const source = await serialize(code, {
            mdxOptions: {
               rehypePlugins: [rehypeSlug, rehypePrism],
               development: process.env.NODE_ENV === 'development',
            },
         });
         setMdxSource(source);
         setError(null);
      } catch (err) {
         console.log(err);
         setError(err);
      }
   };

   const debounceRef = useRef(null);

   useEffect(() => {
      if (!debounceRef.current) {
         debounceRef.current = debounce((val) => setCode(val), 300);
      }
   }, []);

   useEffect(() => {
      if (code && code.length > 1) {
         updateMDXSource(code);
      }
   }, [code]);

   return (
      <form onSubmit={handleSubmit(onSubmit)} className='w-full px-8 pb-6 flex justify-center'>
         <div className='w-full max-w-[80rem] gap-x-2 2xl:max-w-[100rem] h-auto flex flex-col lg:flex-row gap-y-4'>
            <div className='w-full flex flex-col'>
               <div className='flex flex-col gap-y-4 border-b-2 pb-14 text-white w-full'>
                  <div className='flex flex-col'>
                     <label htmlFor='title' className='text-base font-light '>
                        Post Title
                     </label>
                     <input
                        placeholder='Title Here'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('title')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='excerpt' className='text-base font-light '>
                        Excerpt
                     </label>
                     <input
                        placeholder='A sentence encompassing the main topic of the post'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('excerpt')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='emoji' className='text-base font-light '>
                        Emoji(s) 👁️👅👁️
                     </label>
                     <input
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('emoji')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='imageURI' className='text-base font-light '>
                        Image URL
                     </label>
                     <input
                        placeholder='Preferably something from Unsplash or Imgur 🥺'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('imageURI')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='tags' className='text-base font-light '>
                        Post Tags
                     </label>
                     <input
                        placeholder='Rant, React, TypeScript, Random'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('tags')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='project' className='text-base font-light '>
                        Project Slug
                     </label>
                     <input
                        placeholder='my-project-slug'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('project')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='slug' className='text-base font-light '>
                        Post Slug
                     </label>
                     <input
                        placeholder='my-fancy-shmancy-post-slug'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('slug')}
                     />
                  </div>
                  <div className='w-full flex flex-col lg:flex-row'>
                     <div className='w-full lg:w-1/2 flex flex-col gap-y-2'>
                        <label className='text-xl' htmlFor="content">Edit Here</label>
                        <p className='text-sm text-gray-300'>
                           This editor technically takes Markdown but pretend
                           that it knows what MDX is
                        </p>
                        <Controller
                           name='content'
                           control={control}
                           render={({ field: { onChange, onBlur } }) => (
                              <Editor
                                 defaultValue={defaultPost?.content? defaultPost.content : ""}
                                 className='mt-2 border-[#101010] border-2'
                                 height='38rem'
                                 width={`100%`}
                                 language={'markdown'}
                                 value={code}
                                 theme={'vs-dark'}
                                 onBlur={onBlur}
                                 onChange={(val) => {
                                    onChange(val);
                                    debounceRef.current(val);
                                 }}
                              />
                           )}
                        />
                     </div>
                     <div className='w-full lg:w-1/2 flex flex-col gap-y-2'>
                        <label className='text-xl'>Preview Here</label>
                        <p className='text-sm opacity-0'>OOoooooo hidden</p>
                        <div className='h-[38rem] w-full overflow-auto border-2 border-[#101010]'>
                           {error && (
                              <div className='w-auto m-4 fadeIn h-full px-4 py-4 border-red-600 border-2 rounded-lg'>
                                 <h2 className='font-bold text-2xl mb-4'>
                                    Error Compiling MDX
                                 </h2>
                                 <p className='mb-8 text-white text-sm pb-2 border-b-2'>
                                    See below message for more details
                                 </p>

                                 <p className='text-sm px-4 py-4 border-red-900 bg-red-950 border-[1px] shadow-[#101010] shadow-xl'>
                                    {error.toString()}
                                 </p>
                              </div>
                           )}
                           {mdxSource && !error && (
                              <div className='blog-body prose prose-invert h-full'>
                                 <MDXRemote
                                    {...mdxSource}
                                    components={{ Utils }}
                                 />
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
               <button className='w-full flex justify-center items-center px-4 py-2 font-semibold border-[#101010] bg-[#101010] border-[1px] rounded-md mt-6 hover:border-white transition-all duration-150 text-white'>
                  Save Post
               </button>
            </div>
         </div>
      </form>
   );
};

export default PostEdit;
