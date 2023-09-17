import Image from 'next/image'
import React from 'react'
import SSDark from '../../public/ssd-dark.webp'
import Sheen from '../typography/Sheen'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
const SSDComponent = () => {
  return (
    <div className="w-full h-full flex flex-col transition-all duration-150 gap-y-2 hover:scale-105 border-[1px] px-3 py-3 border-transparent hover:border-white rounded-md">
        <div className="flex justify-between items-start">
          <Image className="w-14 h-14" src={SSDark} loading="eager" width={"50"} height={"50"} />
          <a
          className="text-lg transition-all duration-300 hover:rotate-[360deg] hover:text-blue-300"
          target="_blank"
          rel="noreferrer"
          href="https://discord.gg/5SyB3yx"
          >
            <FontAwesomeIcon icon={faDiscord} />
          </a>
        </div>
        <Sheen className="font-bold text-sm">UF Society of Software Developers</Sheen>
        <p className="text-xs text-gray-400">Join the best CS Club at UF!</p>
    </div>
  )
}

export default SSDComponent