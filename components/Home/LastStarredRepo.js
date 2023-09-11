import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';

const LastStarredRepo = () => {
    const [lastStarred, setLastStarred] = useState(null)


    const removeEmojiColon = (str) => {
        // regex is meant to replace emojis in colon notation (from GitHub)
        const reg = /:[^:\s]*(?:::[^:\s]*)*:/;

        return str.replace(reg,  "");
    }

    const clampWords = (str) => {
        return (str.split(" ", 14).join(" ") + "...");
    }
    useEffect(() => {
        fetch("/api/get-last-starred-repo")
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            setLastStarred(json)
        }).catch(err => {
            console.log("There was an error retrieving the last starred repo!")
        })
    }, [])

  return (
    <div className={`w-full h-full bg-black border-[1px] border-gray-300 ${ lastStarred ? "" : "animate-pulse" } rounded-md py-4 px-2 flex flex-col`}>
        <div className="flex text-sm flex-wrap gap-x-2 gap-y-1 items-start">
            <FontAwesomeIcon icon={faStar} className=" text-purple-400 h-4 w-4"/> 
            <h1 className="font-bold text-white">Last Starred Repo</h1>
        </div>
        <Link className="flex flex-col px-2 gap-y-1" href={lastStarred?.url ? lastStarred.url : "/"}>
            <h1 className="text-base font-light text-white underline">
                {lastStarred?.full_name ? lastStarred.full_name : ""}
            </h1>
            <p className="text-xs text-gray-200 font-light text-overflow overflow-hidden max-h-[5rem]">
                {
                    lastStarred?.description ? clampWords(removeEmojiColon(lastStarred.description)) : ""
                }
            </p>
        </Link>
    </div>
  )
}

export default LastStarredRepo