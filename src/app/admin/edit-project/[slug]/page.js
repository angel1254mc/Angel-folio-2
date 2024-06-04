import { getProjectById } from '@/app/api';
import ProjectEdit from '@/components/Admin/ProjectEdit'
import React from 'react'

export const revalidate = 0;

const formatAuthors = (authors) => {
    if (authors?.length > 0)
       return authors.map(author => ({
             ...author,
             responsibilities: author.responsibilities.join(", "),
          })
       )
    return [];
 }

const page = async ({ params }) => {

  const slug = params.slug;
  // Check if project with given ID exists. I'd use slugs but slugs can technically be changed (not primary key
  // in database), so I'll opt in for IDs instead.
  let project = await getProjectById(slug);
  if (project) {
    project.authors = formatAuthors(project.authors);
    project.tools = project.tools.join(", ");
    project.github.isPublic = project.github.isPublic ? "True" : "False";
    return (
        <ProjectEdit defaultProject={project} />
    )
  }

  return (
    <div>
        Sorryyyyyyyy ID seems to not exist :&apos;(
    </div>
  )
}

export default page