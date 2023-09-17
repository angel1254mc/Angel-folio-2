import { faTwitch } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Sheen from '../typography/Sheen'
import { faLink } from '@fortawesome/free-solid-svg-icons'

const TwitchComponent = () => {
  return (
    <div className="w-full h-full flex flex-col items-start transition-all duration-150 gap-y-2 hover:scale-105 border-[1px] px-3 py-3 border-transparent hover:border-white rounded-md">
        <div className="w-full flex justify-between">
          <FontAwesomeIcon className="text-4xl w-12 h-12 pt-1" icon={faTwitch} />
          <a
          className="text-lg h-auto"
          target="_blank"
          rel="noreferrer"
          href="https://www.twitch.tv/angel1254mc"
          >
            <FontAwesomeIcon className="transition-all h-6 w-6 duration-300 hover:rotate-[360deg] hover:text-purple-300" icon={faLink}/>
          </a>
        </div>
        <Sheen className="text-sm">I (try to) stream on Twitch!</Sheen>
        <p className="text-xs text-gray-400">I mostly lose at rocket league, program, and yap.</p>
    </div>
  )
}

export default TwitchComponent