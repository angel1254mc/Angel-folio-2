import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import React from 'react'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrism from 'rehype-prism'
import rehypeSlug from 'rehype-slug'
import Utils from '../../../content/components/Utils'
import dashboardStyles from '../../../styles/Dashboard.module.css'
const index = ({post = {}, user, userData}) => {

  return (
        <div className={dashboardStyles.main}>
          <div className={dashboardStyles.nav}>
            <div className={dashboardStyles.nav_header}>Dashboard</div>
            <div className={dashboardStyles.nav_links}>
              <div className={dashboardStyles.nav_link}>Projects</div>
              <div className={dashboardStyles.nav_link}>Blog</div>
              <div className={dashboardStyles.nav_link}>About</div>
            </div>
          </div>
          <div className={dashboardStyles.hero}>Hello {userData.firstName}👋</div>
          <div className={dashboardStyles.projects_container}>
            <div className={dashboardStyles.projects_container_header}>Projects: </div>
            <div className={dashboardStyles.projects_container_body}>
              
            </div>
          </div>
        </div>
    )
}

export const getServerSideProps = async (ctx) => {
    // Create authenticated Supabase Client
    const supabase = createServerSupabaseClient(ctx)
    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session)
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    
      try {
      
        const post = await supabase.from('posts').select('*');
        const {data: user} = await supabase.from('Users').select('*');

        const mdxSource = await serialize(post.data[0].content, {
            mdxOptions: {
              rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, {behavior: 'wrap'}],
                rehypePrism
              ]
            }
          });
        
        return {
          props: {
            initialSession: session,
            user: session.user,
            userData: user[0],
            post: {source: mdxSource},
          },
        }
      } catch (err) {
        console.log(err);
        return {
          props: {
            user: session.user,
            userData: user[0],
            post: {source: ""}
          }
        }
      }
  }
export default index