import { faArrowRight, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react'

const ProjectCardComponent = ({project = {}}) => {

  console.log(project);
  return (
    <div className="rounded-md border-[1px] transition-all duration-150 hover:scale-105 hover:shadow-[0px_0px_105px_3px_rgba(192,77,246,0.25)] hover:border-white px-4 py-4 flex flex-col justify-between gap-y-2 bg-[#090808] border-[#101010] w-full h-full">
      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between items-start">
          <h1 className='w-full text-xl font-bold'>{project.name}</h1>
          <a
          target="_blank"
          rel="noreferrer"
          href={project.github.url}
          className="text-gray-500 hover:text-gray-100 transition-all duration-300 cursor-pointer">
            <FontAwesomeIcon icon={faLink} className="text-xl"/>
          </a>
        </div>
        <p className="text-sm font-light w-full pr-2">{project.desc}</p>
      </div>
      <div className="flex justify-between">
        <p className="text-sm font-bold">{project.date}</p>
        <Link
        href={`/projects/${project.slug}`} 
        className="text-sm flex gap-x-2 items-center border-[1px] transition-all duration-150 rounded-sm border-transparent hover:border-white py-1 px-2 font-semibold">
            See More <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
    </div>
  )
}

export default ProjectCardComponent