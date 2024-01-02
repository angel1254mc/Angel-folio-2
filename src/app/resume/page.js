import Head from 'next/head';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';
import Footer from '@/components/Footer/Footer.js';
import Header from '@/components/Header/Header.js';
import Navbar from '@/components/NavBar/Navbar';

const index = ({}) => {
   return (
      <>
         <Head>
            <title>AngelFolio | About</title>
            <meta
               name='description'
               content="Angel's Portfolio and Blog about tech, development, and more!"
            />
            <meta
               name='viewport'
               content='width=device-width, initial-scale=1'
            />
            <meta
               name='image'
               content='https://www.angel1254.com/link-image.png'
            />
            <meta
               property='og:image'
               content='https://www.angel1254.com/link-image.png'
            />
            <meta name='twitter:card' content='summary_large_image'></meta>
            <link rel='icon' href='/favicon.ico' />
         </Head>
         <main className='w-full flex flex-col items-center '>
            <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] flex flex-col justify-start py-2 px-6'>
               <Navbar />
               <Header title={'Resume'} />
            </div>
            <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] flex flex-col gap-y-6 justify-start py-2 px-5'>
               <section
                  id='education'
                  className='w-full text-start flex flex-col gap-x-1'
               >
                  <h1 className=' text-lg sm:text-2xl font-semibold text-white pl-3 border-b-2 border-gray-400 pb-2'>
                     EDUCATION
                  </h1>
                  <div className='flex flex-row w-full'>
                     <div className='w-10/12 flex flex-row mt-4'>
                        <div className='h-full flex items-start justify-end pr-2 pt-[10px]'>
                           <FontAwesomeIcon
                              className='w-2 h-2'
                              icon={faCircleDot}
                           />
                        </div>
                        <div className='flex flex-col gap-x-1'>
                           <h3 className='sm:text-lg font-semibold'>
                              University of Florida
                           </h3>
                           <p className='block md:hidden text-sm sm:text-base'>
                              Expected May 2024
                           </p>
                           <p className='text-xs sm:text-sm font-light'>
                              Herbert Wertheim College of Engineering
                           </p>
                           <p className='font-light text-sm sm:text-base'>
                              <b className='text-bold'>GPA:</b> 3.82
                           </p>
                        </div>
                     </div>
                     <div className='flex flex-col text-base font-semibold mt-4'>
                        <p className='text-right hidden md:block'>
                           Expected May 2024
                        </p>
                     </div>
                  </div>
               </section>
               <section
                  id='professional_experience'
                  className='w-full text-start flex flex-col gap-x-1'
               >
                  <h1 className='text-lg sm:text-2xl font-semibold text-white pl-3 border-b-2 border-gray-400 pb-2'>
                     PROFESSIONAL EXPERIENCE
                  </h1>
                  <div className='flex flex-row w-full'>
                     <div className='w-10/12 flex flex-row mt-4'>
                        <div className='h-full flex items-start justify-end pr-2 pt-[10px]'>
                           <FontAwesomeIcon
                              className='w-2 h-2'
                              icon={faCircleDot}
                           />
                        </div>
                        <div className='flex flex-col gap-x-1'>
                           <h3 className='sm:text-lg text-base font-semibold'>
                              Software Engineer Intern - Grafana Labs Inc
                           </h3>
                           <p className='block md:hidden sm:text-base text-sm'>
                              June 2023 - Aug. 2023
                           </p>
                           <p className='sm:text-base text-sm font-extralight italic'>
                              Helped push the new Metrics Endpoint Integration,
                              from scratch to production.
                           </p>

                           <ul className='ml-8 list-disc font-extralight sm:text-base text-sm mt-2'>
                              <li>
                                 Helped bring to fruition a SaaS integration
                                 that began as a Hackathon project.{' '}
                              </li>
                              <li>
                                 Leveraged Jsonnet, Tanka, and K8s for
                                 configuring HPAs, DNS rules, and resource
                                 limits to support the integration across 17
                                 regions worldwide.
                              </li>
                              <li>
                                 Independently implemented user-desired
                                 accessibility improvements across the
                                 connections-console frontend.
                              </li>
                              <li>
                                 Asynchronously collaborated with colleagues
                                 across multiple teams and timezones, making
                                 contributions in all layers of development
                                 (frontend, backend, and platform)
                              </li>
                              <li>
                                 Participated in a company-wide hackathon,
                                 developed a new cloud integration for importing
                                 NextJS Traces, Spans, and Metrics to Grafana
                                 Cloud. Now owned by the OTEL team who is
                                 pushing it to production.
                              </li>
                           </ul>
                        </div>
                     </div>
                     <div className='flex flex-col text-base font-semibold mt-4'>
                        <p className='text-right md:block hidden'>
                           June 2023 - Aug. 2023
                        </p>
                     </div>
                  </div>
                  <div className='flex flex-row w-full'>
                     <div className='w-10/12 flex flex-row mt-4'>
                        <div className='h-full flex items-start justify-end pr-2 pt-[10px]'>
                           <FontAwesomeIcon
                              className='w-2 h-2'
                              icon={faCircleDot}
                           />
                        </div>
                        <div className='flex flex-col gap-x-1'>
                           <h3 className='sm:text-lg text-base font-semibold'>
                              Associate Software Engineer - Emerging Tech LLC
                           </h3>
                           <p className='block md:hidden sm:text-base text-sm'>
                              May 2022 - Present
                           </p>
                           <p className='sm:text-base text-sm font-extralight italic'>
                              Provided Web Development expertise and led
                              development of internal CRM systems.
                           </p>

                           <ul className='ml-8 list-disc font-extralight text-sm sm:text-base mt-2'>
                              <li>
                                 Leading development of an internal Gov.
                                 Contracting Management System for real-time
                                 proposal discovery, procurement, and
                                 management.
                              </li>
                              <li>
                                 Created a scalable contract search microservice
                                 that autonomously discovers over 100 actionable
                                 government contracts every day and persists
                                 concurrent information on over 11,000
                                 government opportunities across several NAICS
                                 codes.
                              </li>
                              <li>
                                 Refactored and redesigned WordPress company
                                 website. Increased Google Lighthouse Score to
                                 90 across all key measurements.
                              </li>
                              <li>
                                 Worked as a consultant developing a website for
                                 another company, Gen Z Consulting LLC.
                                 Delivered according to stakeholder’s needs and
                                 requirements and achieved &gt;= 85 Google
                                 Lighthouse score across all key measurements
                              </li>
                           </ul>
                        </div>
                     </div>
                     <div className='flex flex-col text-base font-semibold mt-4'>
                        <p className='text-right md:block hidden'>
                           May 2022 - Present
                        </p>
                     </div>
                  </div>
               </section>
               <section
                  id='leadership_roles'
                  className='w-full text-start flex flex-col gap-x-1'
               >
                  <h1 className='text-lg sm:text-2xl font-semibold text-white pl-3 border-b-2 border-gray-400 pb-2'>
                     Leadership Roles
                  </h1>
                  <div className='flex flex-row w-full'>
                     <div className='w-10/12 flex flex-row mt-4'>
                        <div className='h-full flex items-start justify-end pr-2 pt-[10px]'>
                           <FontAwesomeIcon
                              className='w-2 h-2'
                              icon={faCircleDot}
                           />
                        </div>
                        <div className='flex flex-col gap-x-1'>
                           <h3 className='text-base sm:text-lg font-semibold'>
                              Society of Software Developers - Outreach Officer
                           </h3>
                           <p className='text-sm sm:text-base font-extralight italic'>
                              Outreach officer for the best comp-sci club on UF
                              😎
                           </p>
                           <ul className='ml-8 list-disc font-extralight text-sm sm:text-base mt-2'>
                              <li>
                                 Developed flyers and announcements for club
                                 workshops, socials, and meetups.
                              </li>
                              <li>
                                 Collaborated with inter-collegiate
                                 engineering-related student organizations
                                 (namely FIU) to increase SSD member
                                 participation in ShellHacks 2023.
                              </li>
                              <li>
                                 Leading a Workshop that serves as an
                                 introduction to infrastructure and application
                                 observability.
                              </li>
                           </ul>
                        </div>
                     </div>
                  </div>
               </section>
            </div>
            <Footer />
         </main>
      </>
   );
};

export default index;
