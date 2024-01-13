'use client';
import React from 'react';

const PostEdit = ({ defaultPost }) => {
   return (
      <div className='w-full px-8 pb-6 flex justify-center'>
         <div className='w-full max-w-[50rem] gap-x-2 2xl:max-w-[64rem] h-auto flex flex-col lg:flex-row gap-y-4'>
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
                  
               </div>
            </div>
         </div>
      </div>
   );
};

export default PostEdit;
