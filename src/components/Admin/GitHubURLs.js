"use client"
import React from 'react';
import { useFieldArray } from 'react-hook-form';

const GitHubURLs = ({ control, register }) => {
   const { fields, append, preprend, remove, swap, move, insert } =
      useFieldArray({
         control,
         name: 'github.urls',
      });
   return (
      <div className='flex flex-col'>
         <label htmlFor='urls' className='text-base font-light '>
            Additional URLs
         </label>
         <div className='w-full flex flex-col  gap-y-4 pl-4 border-l-[1px] border-gray-700 mt-2'>
            {fields.map((field, index) => (
               <div
                  key={`additional-url-${field.title}`}
                  className='flex w-full gap-x-2 group'
               >
                  <div className='w-full flex flex-col border-b-blue-500 pb-4 border-b-2'>
                     <label htmlFor='title' className='text-base font-light '>
                        URL Title
                     </label>
                     <input
                        id='title'
                        placeholder='Title Here'
                        className='w-full py-1 mt-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register(`github.urls.${index}.title`)}
                     />
                     <label
                        htmlFor='url2'
                        className='text-base font-light pt-2'
                     >
                        URL
                     </label>
                     <input
                        id='url2'
                        placeholder='https://example.com'
                        className='w-full py-1 mt-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register(`github.urls.${index}.url`)}
                     />
                  </div>
                  <button
                     onClick={() => remove(index)}
                     className='w-[0] h-full group-hover:w-[10px] rounded-sm transition-all duration-75 bg-red-400'
                  ></button>
               </div>
            ))}
         </div>
         <button
            type="button"
            onClick={() => {
               append({ title: 'fake-title', url: 'fake-url.com' });
            }}
            className='w-full flex justify-center items-center px-4 py-2 font-semibold border-[#101010] bg-[#101010] border-[1px] rounded-md mt-6 hover:border-gray-700 transition-all duration-150 text-white'
         >
            Add More
         </button>
      </div>
   );
};

export default GitHubURLs;
