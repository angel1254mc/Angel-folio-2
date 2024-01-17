import {
   faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useFieldArray } from 'react-hook-form';

const LessonsLearned = ({ control, register }) => {
   const { fields, append, preprend, remove, swap, move, insert } =
      useFieldArray({
         control,
         name: 'lessons',
      });
   return (
      <div className='flex flex-col gap-y-2'>
         <label htmlFor='lessons' className='text-base font-light '>
            Lessons Learned
         </label>
         {fields.map((field, index) => (
            <div
               key={field}
               className='flex flex-row w-full items-center gap-x-2'
            >
               <button
                  onClick={() => remove(index)}
                  type='button'
                  className='w-6 h-6 bg-white rounded-md flex justify-center items-center text-black font-bold'
               >
                  <FontAwesomeIcon height={10} width={10} icon={faCircle} />
               </button>
               <input
                  id='lessons'
                  placeholder='Life is good'
                  className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                  {...register(`lessons.${index}`)}
               />
            </div>
         ))}
         <button
            onClick={() => append('')}
            type='button'
            className='w-full flex justify-center items-center px-4 py-2 font-semibold border-[#101010] bg-[#101010] border-[1px] rounded-md mt-2 hover:border-gray-700 transition-all duration-150 text-white'
         >
            Add More
         </button>
      </div>
   );
};

export default LessonsLearned;
