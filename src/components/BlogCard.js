import React, { useState } from 'react';
import { animated, useSpring } from 'react-spring';
import Image from 'next/image';
import blogCardStyles from '../styles/components/blog/BlogList.module.css';
import Link from 'next/link';
const BlogCard = ({ height, opacity, x, index, post }) => {
   const [isHover, setIsHover] = useState(false);

   const imgStyles = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      minHeight: isHover ? '60px' : '0px',
      boxShadow: isHover
         ? '0px 0px 105px 3px rgba(46,147,255,0.25)'
         : '0px 0px 105px 3px rgba(46,147,255,0.00)',
   });

   const { boxShadow, transform } = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      boxShadow: '0px 0px 105px 3px rgba(46,147,255,0.0)',
      transform: 'scale(1.1)',
   });

   return (
      <Link
         href={`/blog/posts/${post.slug}`}
         style={{
            position: 'relative',
            width: '100%',
            border: '1px solid #101010',
            backgroundColor: '#101010',
            borderRadius: '10px',
         }}
         onMouseEnter={() => setIsHover(true)}
         onMouseLeave={() => setIsHover(false)}
      >
         <animated.div
            style={{
               minHeight: imgStyles.minHeight,
            }}
            className={blogCardStyles.notion_group}
         >
            <div className={blogCardStyles.post_emoji}>{post.emoji}</div>
            <Image fill={true} src={post.imageURI} alt={' image'} />
         </animated.div>
         <div className='mt-6 p-4 text-2xl font-bold'>{post.title}</div>
         <div className='p-4 pt-2 text-lg'>{post.excerpt}</div>
         <div className='p-4 pt-2 text-md flex justify-end'>
            {new Date(post.date).toDateString()}
         </div>
      </Link>
   );
};

export default BlogCard;
