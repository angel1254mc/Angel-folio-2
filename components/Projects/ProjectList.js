import React, { useTransition } from 'react'
import { Projects } from '../../content/content'
import ProjectElement from './ProjectElement'
import { useTrail, useSpring, animated, useGesture } from 'react-spring'

const ProjectList = ({projects}) => {
    const trail = useTrail(projects.length, {
        from: { opacity: 0, x: 20, maxHeight: 0, transform: 'translateY(10px)' },
        to: {
            opacity: 1,
            x: 0,
            transform: 'translateY(0px)'
        },
      })
    
  return (
    <div className={"projects_container"}>
        {
            trail.map(({ opacity, x, transform }, index) => {
                return <ProjectElement transform={transform} opacity={opacity} x={x} key={projects[index].name} project={projects[index]}/>
            })
        }
    </div>
  )
}

export default ProjectList