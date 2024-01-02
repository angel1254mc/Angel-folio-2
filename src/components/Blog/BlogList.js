import Link from 'next/link';
import styles from './BlogList.module.css';
import BlogItem from './BlogItem';
export default function BlogList({ posts, limit = null, innerRef = null }) {
   if (posts.length == 0)
      return (
         <div className={styles.blog_list}>
            <BlogItem empty={true} />
         </div>
      );
   return (
      <div ref={innerRef ?? innerRef} className={styles.blog_list}>
         {posts.map((post) => {
            return <BlogItem key={post.title} post={post} />;
         })}
      </div>
   );
}
