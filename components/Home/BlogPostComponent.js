import React from "react";
import { useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const BlogPostComponent = ({ latest = {} }) => {
    const post = latest.meta;

    return (
        <Link
            className="transition-all relative border-[1px] rounded-md border-[#101010] w-full duration-300 hover:scale-105 hover:shadow-[0px_0px_105px_3px_rgba(192,77,246,0.25)]"
            href={`/blog/posts/${post.slug}`}
        >
            <Image fill={true} src={post.imageURI} alt={" image"} />
            <div className="absolute flex flex-col justify-between h-full px-4 py-4 bg-[#101010] hover:shadow-inner shadow-2xl hover:bg-[rgba(16,16,16,0.7)] duration-300 transition-all z-50 w-full">
                <div className="flex flex-col gap-y-2">
                    <h1 className="text-xl font-bold">{post.title}</h1>
                    <p className="text-sm font-light">{post.excerpt}</p>
                </div>
                <div className="flex justify-between text-sm">
                    <p className="text-sm font-bold">
                        {new Date(post.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm flex gap-x-2 items-center py-1 px-2 font-semibold">
                        See More <FontAwesomeIcon icon={faArrowRight} />
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default BlogPostComponent;
