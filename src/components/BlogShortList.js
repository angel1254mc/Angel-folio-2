import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/components/BlogShortList.module.css';
import { useTrail, useSpring, animated, useGesture } from 'react-spring';
import BlogCard from './BlogCard';
const BlogShortList = ({ dynamic = false, open = false, innerRef, posts }) => {
   const isDynamic = useRef(dynamic);
   const parallax = useRef(0);
   const [stayOpen, setStayOpen] = useState(false);
   const trail = useTrail(posts.length < 3 ? posts.length : 3, {
      config: { mass: 5, tension: 2000, friction: 200 },
      opacity: stayOpen ? 1 : 0,
      x: stayOpen ? 0 : -20,
      height: stayOpen ? 110 : 0,
      from: { opacity: 0, x: 20, height: 0 },
   });
   useEffect(() => {
      if (open) setStayOpen(true);
   }, [open]);
   return (
      <div ref={innerRef} className={styles.blog_short_list}>
         {trail.map(({ height, opacity, x }, index) => (
            <BlogCard
               key={posts[index].title}
               height={height}
               opacity={opacity}
               x={x}
               index={index}
               post={posts[index]}
            />
         ))}
      </div>
   );
};

export default BlogShortList;
