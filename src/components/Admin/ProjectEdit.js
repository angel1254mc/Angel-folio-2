'use client';
import React from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import GitHubURLs from './GitHubURLs';
import ProjectAuthors from './ProjectAuthors';
import LessonsLearned from './LessonsLearned';
import { useRouter } from 'next/navigation';

const ProjectEdit = ({ defaultProject }) => {

   const router = useRouter();
   const schema = yup.object({
      id: yup.number(),
      date: yup.string().required(),
      created_at: yup.string(),
      name: yup.string().required(),
      tools: yup.string().required(),
      slug: yup.string().required(),
      summary: yup.string().required(),
      desc: yup.string().required(),
      github: yup.object({
         url: yup.string(),
         urls: yup.array().of(yup.object({})),
         isPublic: yup.bool().required(),
      }),
      authors: yup.array().of(
         yup.object({
            name: yup.string(),
            github: yup.string(),
            responsibilities: yup.string(),
         })
      ),
      lessons: yup.array().of(yup.string()),
   });

   const {
      register,
      handleSubmit,
      watch,
      control,
      formState: { errors },
   } = useForm({
      resolver: yupResolver(schema),
      ...(defaultProject && {defaultValues: defaultProject})
   });

   const state = watch();

   const onSubmit = async (project) => {
      console.log(project);
      const response = await fetch("/api/admin/projects", {
         method: "POST",
         body: JSON.stringify(project),
      })

      if (response.status == 200) {
         console.log("Project insertion was successful!");
         // Do whatever needs to be done like reroute to admin page or smth
         router.push("/admin");
      } else {
         if (response.status == 500) {
            const body = await response.json();
            console.log(body);
         }
      }
   }

   console.log(errors);

   return (
      <form onSubmit={handleSubmit(onSubmit)} className='w-full px-8 pb-6 flex justify-center'>
         <div className='w-full max-w-[50rem] gap-x-2 2xl:max-w-[64rem] h-auto flex flex-col lg:flex-row gap-y-4'>
            <div className='w-full flex flex-col'>
               <div className='flex flex-col gap-y-4 border-b-2 pb-14 text-white w-full'>
                  <div className='flex flex-col'>
                     <label htmlFor='name' className='text-base font-light '>
                        Project Title
                     </label>
                     <input
                        placeholder='Title Here'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base font-semibold'
                        {...register('name')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='name' className='text-base font-light '>
                        Date (From - To)
                     </label>
                     <input
                        placeholder='May 2023 - Present'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('date')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='slug' className='text-base font-light '>
                        Slug (for URL)
                     </label>
                     <input
                        placeholder='my-project'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('slug')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='desc' className='text-base font-light '>
                        Description (Short)
                     </label>
                     <input
                        placeholder='Brief and catchy description of your project'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('desc')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='summary' className='text-base font-light '>
                        Summary (Long)
                     </label>
                     <textarea
                        placeholder="Provide a detailed summary of your project. What is it about? What problem does it solve? How did you build it? Share your project's story here. (Thank you ChatGPT)"
                        className='w-full mt-2 min-h-[6lh] py-1 px-2 bg-transparent border-gray-700 rounded-md border-2 text-base '
                        {...register('summary')}
                     />
                  </div>
                  <div className='flex flex-col'>
                     <label htmlFor='tools' className='text-base font-light '>
                        Tools
                     </label>
                     <p className='text-xs font-light text-gray-400'>
                        As a comma-separated list!
                     </p>
                     <input
                        placeholder='React, Tanstack, TipTap, etc.'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('tools')}
                     />
                  </div>
                  <h3 className='text-xl font-bold w-full border-b-[2px] border-gray-700 pb-2'>
                     GitHub
                  </h3>
                  <div className='flex flex-col'>
                     <label htmlFor='url' className='text-base font-light '>
                        Primary URL
                     </label>
                     <input
                        id='url'
                        placeholder='https://github.com/me/my-project'
                        className='w-full mt-2 py-1 px-2 bg-transparent border-gray-700 border-b-2 text-base'
                        {...register('github.url')}
                     />
                     <div className='flex flex-col mt-2'>
                        <label
                           htmlFor='isPublic'
                           className='text-base font-light'
                        >
                           Public Repo?
                        </label>
                        <div className='flex gap-x-2 text-sm mt-1'>
                           <input
                              type='radio'
                              value='True'
                              className='py-1 mt-1 px-2 bg-transparent border-gray-700 rounded-md border-b-2 text-base'
                              {...register('github.isPublic')}
                           />
                           <p className=' w-16'>Yes! 😄</p>
                        </div>
                        <div className=' flex gap-x-2 text-sm'>
                           <input
                              type='radio'
                              value='False'
                              className='py-1 mt-1 px-2 bg-transparent border-gray-700 rounded-md border-b-2 text-base'
                              {...register('github.isPublic')}
                           />
                           <p className=' w-16'>No! 🥹</p>
                        </div>
                     </div>
                  </div>
                  <GitHubURLs {...{control, register}}/>
                  <ProjectAuthors {...{control, register }} /> 
                  <LessonsLearned {...{control, register}} />
               </div>
               <button className='w-full flex justify-center items-center px-4 py-2 font-semibold border-[#101010] bg-[#101010] border-[1px] rounded-md mt-6 hover:border-white transition-all duration-150 text-white'>
                  Save Project
               </button>
            </div>
         </div>
      </form>
   );
};

export default ProjectEdit;
