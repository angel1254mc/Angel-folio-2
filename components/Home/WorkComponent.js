import { faAngleDoubleDown, faAngleDoubleRight, faCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import Sheen from '../typography/Sheen';
import { animated } from "react-spring";
import Image from 'next/image';
import Link from 'next/link';

const WorkComponent = () => {

    const [expanded, setExpanded] = useState(false);
    
  return (
    <div className={`w-full rounded-md flex flex-col absolute hover:scale-[103%] hover:border-white bg-[#101010] h-full transition-all duration-150 overflow-y-hidden max-h-[24rem] border-2 z-10 ${!expanded ? 'md:max-h-[11.5rem] 2xl:max-h-[13.5rem] md:border-2 md:border-transparent ' : 'md:max-h-[24rem] 2xl:max-h-[28rem] border-2'}`}>
        <div className="w-full text-xl 2xl:text-2xl font-bold pt-3 px-3 flex justify-between items-center">
            <h1>Where I&apos;ve Worked</h1>
            <button onClick={() => setExpanded(state => !state)}>
                <FontAwesomeIcon className={`transition-all duration-150 text-xl 2xl:text-2xl md:flex hidden text-gray-500 ${expanded ? "rotate-180" : ""}`} icon={faAngleDoubleDown} />
            </button>
        </div>
        <div className="w-full flex flex-col h-full justify-between">
            <div className="flex flex-col w-full h-full gap-x-1 pt-1">
                <div className="w-full flex gap-x-3 h-auto items-start">
                    <FontAwesomeIcon className="text-[0.50rem] pt-[0.75rem] 2xl:pt-[1rem] pl-4" icon={faCircle}/>
                    <div className="flex flex-col pt-1 flex-wrap gap-y-1">
                        <h1 className="text-base 2xl:text-xl font-semibold">Grafana Labs Inc.</h1>
                        <p className="text-xs 2xl:text-sm">Software Engineering Intern in the #infra-O11y squad</p>
                        <p className="text-xs 2xl:text-sm">May 2023 - Aug. 2023</p>
                        <div className="flex gap-x-4 items-center">
                            <Link href="/about" className="py-1 mt-2 px-4 border-[1px] rounded-sm border-white">
                                Read More <FontAwesomeIcon className="text-xs 2xl:text-sm" icon={faAngleDoubleRight}/>
                            </Link>
                            <Image className="w-7 h-7" width="92" height="72" loading="eager" src="/grafana-logo.png" />
                        </div>
                    </div>
                </div>

                <div className={`w-full pt-3 flex gap-x-3 h-auto items-start duration-150 ${expanded ? "md:opacity-1" : "md:opacity-0" }`}>
                    <FontAwesomeIcon className="text-[0.50rem] pt-[0.75rem] 2xl:pt-[1rem] pl-4" icon={faCircle}/>
                    <div className="flex flex-col pt-1 flex-wrap gap-y-1">
                        <h1 className="text-base 2xl:text-xl font-semibold">Emerging Tech LLC</h1>
                        <p className="text-xs 2xl:text-sm">Associate Software Engineer</p>
                        <p className="text-xs 2xl:text-sm">May 2023 - Present</p>
                        <div className="flex gap-x-4 items-center">
                            <Link href="/about" className=" py-1 mt-2 px-4 border-[1px] rounded-sm border-white">
                                Read More <FontAwesomeIcon className="text-xs 2xl:text-sm" icon={faAngleDoubleRight}/>
                            </Link>
                            <Image className="w-10 h-5" width="92" height="72" loading="eager" src="/et-logo.png" />
                        </div>
                    </div>
                </div>
            </div>
            <div className={`flex pb-8 text-sm 2xl:text-base px-4 h-auto items-start transition-all duration-150 ${ expanded ? "md:opacity-1" : "md:opacity-0" }`}>
                <p>For more info on my past work experience, check out my <Sheen>LinkedIn</Sheen> or my <Sheen>About</Sheen> page!</p>
            </div>
            
        </div>
    </div>
  )
}

export default WorkComponent