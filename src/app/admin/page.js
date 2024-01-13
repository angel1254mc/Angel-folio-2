import Header from '@/components/Header/Header';
import Navbar from '@/components/NavBar/Navbar';
import { createClient } from '@supabase/supabase-js';
import React from 'react'
import { getAllPostsSupa } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const page = async ({ params }) => {
  
  
  const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  const posts = await getAllPostsSupa();

  return (
    <>
      <main className='w-full flex flex-col items-center '>
          <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] flex flex-col justify-start py-2 px-6'>
             <Navbar />
             <Header title={'Dashboard'} />
          </div>
       </main>
       <div className='w-full px-8 pb-6 flex justify-center'>
          <div className='w-full max-w-[50rem] gap-x-2 2xl:max-w-[64rem] h-auto flex flex-col lg:flex-row gap-y-4'>
              <div className="w-full lg:w-1/2 flex flex-col">
                <div className="flex justify-between border-b-2 pb-2 text-white w-full">
                  <h2 className="text-2xl font-bold ">Projects</h2>
                  <Link href="/admin/new-project" className="px-2 py-1 border-white border-[1px] rounded-md flex justify-center gap-x-2 font-semibold items-center text-sm text-white">Add Project <FontAwesomeIcon className="text-lg" height={20} width={20} icon={faPlus} /> </Link>
                </div>
                  <div className="w-full px-2 py-2">
                      {
                        projects.map((project) => (
                          <Link href={`/admin/edit-project/${project.id}`} key={project.id} className="w-full flex flex-col py-2 border-b-[1px] border-dashed border-white ">
                            <h3 className="font-semibold">{project.name}</h3>
                            <p className="text-xs font-light">{project.desc}</p>
                            <div className="w-full flex text-xs flex-wrap py-1 gap-x-2 gap-y-2">
                              {project.tools.map((tool) => (
                                <div className="project-element-tool" key={tool}>
                                  {tool}
                                </div>
                              ))}
                            </div>
                          </Link>
                        ))
                      }
                  </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col">
                <div className="flex flex-row-reverse lg:flex-row justify-between border-b-2 pb-2 text-white w-full">
                  <Link href="/admin/new-post" className="px-2 py-1 border-white border-[1px] rounded-md flex justify-center gap-x-2 font-semibold items-center text-sm text-white">Add Post <FontAwesomeIcon className="text-lg" height={20} width={20} icon={faPlus} /> </Link>
                  <h2 className="text-2xl font-bold lg:text-right">Posts</h2>
                </div>
                  <div className="w-full px-2 py-2">
                      {
                        posts.map((post) => (
                          <div key={post.meta.title} className="w-full flex flex-col py-2 border-b-[1px] border-dashed border-white ">
                            <h3 className="font-semibold">{post.meta.emoji + " " + post.meta.title}</h3>
                            <p className="text-xs font-light">{post.meta.excerpt}</p>
                            <div className="w-full flex text-xs flex-wrap py-1 gap-x-2 gap-y-2">
                              {post.meta.tags.map((tag) => (
                                <div className="project-element-tool" key={tag}>
                                  {tag}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      }
                  </div>
              </div>
          </div>
      </div>
      </>
  )
}

export default page