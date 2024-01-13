'use client';
import { faShieldDog, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { useFieldArray } from 'react-hook-form';
import ProjectAuthor from './ProjectAuthor';

const ProjectAuthors = ({ control, register, authors }) => {
   const { fields, append, preprend, remove, swap, move, insert } =
      useFieldArray({
         control,
         name: 'authors',
      });

   return (
      <>
         <h3 className='text-xl font-bold w-full border-b-[1px] border-gray-700 pb-2'>
            Authors
         </h3>
         <div className='flex flex-col w-full'>
            {fields.map((field, index) => (
               <ProjectAuthor {...{field, index, register, remove }} />
            ))}
            <button
               onClick={() => {
                  append({
                     name: '',
                     github: '',
                     responsibilities: '',
                  });
               }}
               type='button'
               className='w-full flex justify-center items-center px-4 py-2 font-semibold border-[#101010] bg-[#101010] border-[1px] rounded-md mt-2 hover:border-gray-700 transition-all duration-150 text-white'
            >
               Add More
            </button>
         </div>
      </>
   );
};

export default ProjectAuthors;
