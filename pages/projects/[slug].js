import Head from 'next/head'
import React, { useState, useRef } from 'react'
import Header from '../../components/Header'
import Navbar from '../../components/Navbar'
import { getAllPosts, getProjectFromSlug, getProjectSlugs } from '../api'
import styles from '../../styles/Home.module.css';
import projectStyles from '../../styles/Project.module.css'
import { animated, useSpring, useChain, useTrail, config } from 'react-spring'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import BlogList from '../../components/Blog/BlogList'
import Footer from '../../components/Footer'

const index = ({project, projectPosts}) => {
  project = JSON.parse(project);
  return (
   <>
    <Head>
      <title>{`Angel - ${project.name}`}</title>
      <meta name="description" content="Angel's Portfolio and Blog about tech, development, and more!" />
      <meta name="image" content='https://www.angel1254.com/link-image.png'/>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:image" content='https://www.angel1254.com/link-image.png'/>
      <meta name="twitter:card" content="summary_large_image"></meta>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main className={styles.main + ' main-body'}>
      <Navbar/>
      <Header title={`Projects/${project.slug}`} size={'3rem'}/>
      {project?.accomplishments ? <MainAccomplishments accomplishments={project.accomplishments}/> : <></>}
      <div className="three-two-split">
        <ProjectSummaryComponent project={project}/>
        <CollaboratorsList authors={project.authors}/>
      </div>
      <div className={project.blog_list}>
        <Header title={`Related Blog Posts`} size={'3rem'}/>
        <BlogList posts={projectPosts} />
      </div>
    </main>
    <Footer></Footer>
   </>
  )
}


export default index

export const getStaticProps = async ({params}) => {
    const {slug} = params;
    const project = JSON.stringify(await getProjectFromSlug(slug));
    // Above function returns the project object, metadata for any related blog posts, and {tentatively} a 'content' var
    // that basically has a mini blog post description of the project
    const projectPosts = getAllPosts('et-crm-for-et').map(post => post.meta);
    return {
      props: {
        project,
        projectPosts,
      }
    }
  }
  
  export const getStaticPaths = async () => {
    const paths = (getProjectSlugs()).map(slug => ({params: {slug}}));
    return (
      {
        paths,
        fallback: false
      }
    )
  }


  const MainAccomplishments = ({accomplishments}) => {
    return (
      <div className={projectStyles.accomplishments}>
        
        <ul className={projectStyles.accomplishments_list}> 
          {
            accomplishments.map((accomplishment, index) => {
              return (<li key={`accomplishment-${index}`}>{accomplishment}</li>);
            })
          }
        </ul>
      </div>
    )
  }
  const ProjectSummaryComponent = ({project}) => {
    return (
      <div className={projectStyles.left_container}>
        <div className={projectStyles.project_name}>
          Name: {project.name}
        </div>
        <div className={projectStyles.project_summary}>
          <div className={projectStyles.header}>
            Summary
          </div>
          <div className={projectStyles.body}>
            {project.summary}
          </div>
        </div>
        <div className={projectStyles.project_githubs}>
          <div className={projectStyles.header}>
            Github(s)
          </div>
          <div className={projectStyles.githubs_body}>
            {project.github.isPublic ? (
              project.github.urls.map((urlObj) => {
                return (
                  <Link href={urlObj.url} className={projectStyles.github_link} key={urlObj.title}>
                      <FontAwesomeIcon icon={faLink}/>
                      <div className={projectStyles.link_title}>
                        {urlObj.title}
                      </div>
                  </Link>
                )
              })
            ) : <div>Repository not public for this project</div>
            }
          </div>
        </div>
        <div className={projectStyles.tech_stack}>
          <div className={projectStyles.header}>
            Tech Stack
          </div>
          <div className={projectStyles.tech_body}>
            {
                project.tools.map((tool) => {
                    return (
                    <div key={tool} className="project-element-tool">
                        {tool}
                    </div>
                    )
                })
            }
          </div>
        </div>
        <div className={projectStyles.lessons_learned}>
          <div className={projectStyles.header}>
            Main Lessons Learned
          </div>
          <ul className={projectStyles.lessons_learned_body}>
            {
              project?.lessons?.map((lesson, index) => {
                return <li key={index}>{lesson}</li>
              })
            }
          </ul>
        </div>
      </div>
    )
  }

  const CollaboratorsList = ({authors}) => {

    const trail = useTrail(authors.length, {
      from: { opacity: 0, x: 20, maxHeight: 0, transform: 'translateY(10px)' },
      to: {
          opacity: 1,
          x: 0,
          transform: 'translateY(0px)'
      },
    })
    return (
      <div className={projectStyles.right_container}>
        <div className={projectStyles.collaborators_header}>
          Collaborators
        </div>
        <div className={projectStyles.collaborators_body}>
          {
            trail.map(({ opacity, x, transform }, index) => {
              if (index == 0)
                return <Collaborator isMe={true} key={authors[index].name} author={authors[index]} opacity={opacity} transform={transform}/>
              return <Collaborator key={authors[index].name} author={authors[index]} opacity={opacity} transform={transform}/>
            })
          }
        </div>
      </div>
    )
  }

  const Collaborator = ({author, opacity, transform, isMe = false}) => {
    const [isHover, setIsHover] = useState(false);
    const styles = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      transform: isHover ? 'translateY(5px) scale(1.05)' : 'translateY(0px) scale(1.0)',
    })
    return (
      <animated.div 
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{opacity: opacity, transform: styles.transform}} 
      className={isMe ? projectStyles.collaborator_component_me : projectStyles.collaborator_component}>
        <Link href={`https://github.com/${author.github}/`} className={projectStyles.collaborator_top}>
          <div className={projectStyles.collaborator_name}>
            <>{author.name.split(' ')[0]}</>
            <FontAwesomeIcon icon={faGithub} className={projectStyles.tiny_github}/>
          </div>
          <Image alt={'Profile Image'} src={author.image} key={author.name} height={30} width={30}/>
        </Link>
        <ul className={projectStyles.collaborator_body}>
          {
            author?.responsibilities ? author?.responsibilities.map((responsibility, index) => {
              return <li key={`responsibility-${index}`}>{responsibility}</li>
            }) : <></>
          }
        </ul>
      </animated.div>
    )
  }
