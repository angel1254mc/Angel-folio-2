'use client';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
export const ProjectCard = () => {
   const data = {
      authors: [],
      index: 1,
      bgcolor: 'pink',
      name: 'MeetYourMajor',
      desc: 'Epic MeetYourMajor Description that is long but not too long',
      url: 'https://i.imgur.com/Jj0hEs9.jpg',
      date: 'Spring Semester 2022',
      link: 'https://github.com/juanrodl/cen3031_proj',
   };

   return (
      <div
         id='projectCard'
         className='flex h-40 md:w-full align-center justify-center sm:align-left sm:justify-left relative'
      >
         <div
            className='p-color-overlay w-full h-full absolute'
            style={{ backgroundColor: data.bgcolor }}
         ></div>
         <div
            className='projectCardPicture h-40 w-40 flex-none bg-cover text-center flex justify-center items-center self-center overflow-visible'
            style={{ backgroundImage: `url(\"` + data.url + `\")` }}
            title='project image'
         ></div>
         <div className='projectCardBody md:items-start opacity-0 flex flex-col text-left h-full left-[40%] sm:left-[40%] md:left-[35%] lg:left-[35%] absolute md:overflow-y-auto xl:overflow-hidden justify-center'>
            <div className='hidden md:flex flex-wrap leader-lg text-md sm:text-lg lg:text-xl pt-1'>
               {data.name}
            </div>
            <div className='hidden md:block leader-descriptor-card text-sm sm:text-md text-lg pt-1'>
               {data.desc}
            </div>
            <div className='hidden md:flex flex-wrap leader-lg-card text-xs sm:text-sm text-lg pt-1'>
               {data.date}
            </div>
            <div className='items-center justify-center flex md:flex-wrap flex-col md:flex-row md:items-auto h-full md:items-end md:h-auto w-auto'>
               <Link href={'' + data.link}>
                  <FontAwesomeIcon
                     className=' h-28 md:h-8 my-5 md:mt-0 md:mr-5'
                     icon={faGithub}
                  ></FontAwesomeIcon>
               </Link>
            </div>
         </div>
      </div>
   );
};

let GetAuthors = ({ authorsarray }) => {
   let size = authorsarray.length;
   return (
      <div className='flex w-full flex-wrap'>
         {authorsarray.map((el, index) => {
            return index == size - 1 && index != 0 ? (
               <Author
                  key={el}
                  link={getGithub(el)}
                  classname='mr-4 projlink'
                  id={el}
                  end={1}
               ></Author>
            ) : size == 1 ? (
               <Author
                  key={el}
                  link={getGithub(el)}
                  classname='mr-4 projlink'
                  id={el}
                  end={-1}
               ></Author>
            ) : (
               <Author
                  key={el}
                  link={getGithub(el)}
                  classname='mr-4 projlink'
                  id={el}
                  end={0}
               ></Author>
            );
         })}
      </div>
   );
};

let Author = ({ classname, link, id, end }) => {
   return (
      <h4 className={classname}>
         <Link href={getGithub(id)}>
            <a>
               {end == 1
                  ? 'and ' + id
                  : end == 0
                    ? id + ', '
                    : end == -1
                      ? '' + id
                      : 'nothing!'}
            </a>
         </Link>
      </h4>
   );
};
