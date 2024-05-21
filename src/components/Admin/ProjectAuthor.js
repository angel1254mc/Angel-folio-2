import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react'

const ProjectAuthor = ({ field, index, register, remove }) => {

    const debouncedRetrievePicture = useRef(null);
    const [pictureURL, setPictureURL] = useState(null);

    const retrievePicture = async (username) => {
        // Retrieve whether the username exists in GitHub.
        // If not keep placeholder image
        try {
            const response = await fetch(`https://api.github.com/users/${username}`);
            if (response?.status == 200) {
                const data = await response.json();
                if (data) {
                    console.log(data);
                    setPictureURL(data.avatar_url);
                } else {
                    setPictureURL(null);
                }
            } else {
                // Assume a 404 or bad response
                // no profile picture :(
                setPictureURL(null);
            }
        } catch(err) {
            console.log(err);
            setPictureURL(null);
        }
   };

   //  Lodash debounce by default gets recomputed every render, we want to save a reference once for proper
   // debouncing functionality.
   useEffect(() => {

    if (!debouncedRetrievePicture.current) {
        debouncedRetrievePicture.current = debounce(retrievePicture, 500);
    }
   }, [])
  return (
            <div
              key={field.name}
              className='flex flex-col w-full bg-[#101010] rounded-lg border-gray-900'
             >
              <div className='w-full flex flex-row justify-between'>
                 <div className='w-auto flex flex-row gap-x-2'>
                    <div className='w-auto h-full justify-start px-4 py-4'>
                       <Image
                          src={pictureURL ?? '/profile-placeholder.webp'}
                          height={100}
                          width={100}
                          alt={"Author Github"}
                          className='min-w-10 min-h-10 max-w-10 max-h-10 object-cover rounded-full'
                       ></Image>
                    </div>
                    <div className='flex flex-row gap-x-2 items-center justify-end'>
                       <input
                          placeholder='Joe Mama'
                          className='py-1 mt-1 px-2 bg-transparent border-gray-700 border-b-[1px] text-xl font-semibold'
                          {...register(`authors.${index}.name`)}
                       />
                    </div>
                 </div>
                 <div className='flex h-full pr-4 items-center'>
                    <button
                       onClick={() => remove(index)}
                       className='group flex justify-center items-center h-8 w-8 transition-all duration-150 hover:bg-red-400 bg-white rounded-md'
                       type='button'
                    >
                       <FontAwesomeIcon
                          icon={faX}
                          height={15}
                          width={15}
                          className='text-black group-hover:text-white transition-all duration-150'
                       />
                    </button>
                 </div>
              </div>
              <div className='w-full flex'>
                 <div className='flex pl-4 w-full lg:w-1/2 flex-col gap-x-2 py-4'>
                    <label
                       htmlFor='url2'
                       className='text-base font-light mt-2'
                    >
                       GitHub Username
                    </label>
                    <p className='text-xs font-light text-transparent'>
                       oooo invisible
                    </p>
                    <input
                       placeholder='CookieClicker1234'
                       className='py-1 mt-2 px-2 bg-transparent border-gray-700 border-b-[1px] text-base'
                       {...register(`authors.${index}.github`, {
                          onChange: (e) => debouncedRetrievePicture.current(e.target.value),
                       })}
                    />
                 </div>
                 <div className='flex pl-4 w-full lg:w-1/2 flex-col gap-x-2 py-4'>
                    <label
                       htmlFor='url2'
                       className='text-base font-light mt-2'
                    >
                       Responsibilities
                    </label>
                    <p className='text-xs font-light text-gray-400'>
                       As a comma-separated list!
                    </p>
                    <input
                       placeholder='Scrum Master, Agile Guru'
                       className='py-1 mt-2 px-2 bg-transparent border-gray-700 border-b-[1px] text-base'
                       {...register(`authors.${index}.responsibilities`)}
                    />
                 </div>
              </div>
            </div>
  )
}

export default ProjectAuthor