import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

const splitCommaList = (toolsStr) => {
   if (toolsStr?.length > 0)
      return toolsStr.split(',').map((word) => word.trim());
   return [];
};

const getNextAddedNum = async () => {
  const num = await supabase
  .from('projects')
  .select("added")
  .order('added', { ascending: false })
  .limit(1);

  return num.added;
}

const formatAuthors = (authors) => {
   if (authors?.length > 0)
      return authors.map(author => ({
            ...author,
            responsibilities: splitCommaList(author.responsibilities),
         })
      )
   return [];
}
// api route passes through middleware, only authenticated users may perform this action
export async function POST(request) {
   const requestUrl = new URL(request.url);
   const project = await request.json();
   // Need to format project in a way that can be ingested by supabase

   if (project && project.slug && project.name) {
      const addedNum = await getNextAddedNum();
      const authors = formatAuthors(project.authors);
      const { error } = await supabase.from('projects').upsert({
         // If project ID was sent along with request, we are editing, not creating
         // a new project
         ...(project.id && { id: project.id }),
         created_at: project.created_at ?? new Date().toISOString().toLocaleString(),
         name: project.name,
         tools: splitCommaList(project.tools),
         slug: project.slug,
         summary: project.summary ?? "",
         desc: project.desc ?? "",
         github: project.github ?? {"url":"https://github.com/angel1254mc","urls":[],"isPublic":false},
         authors: authors,
         lessons: project.lessons ?? [],
         date: project.date ?? "N/A",
         added: project.added ?? addedNum,
      });

      if (error) {
        return NextResponse.json({
          timestamp: Date.now(),
          status: 500,
          error: "Error inserting new project into 'projects' table",
          rawError: error,
          path: "/api/admin/projects",
        }, {status: 500})
      }
      return NextResponse.json({
         message: 'Project Creation was successful!',
         link: request.nextUrl.origin.includes('localhost')
            ? `${request.nextUrl.origin}:3000/projects/${project.slug}`
            : process.env`${request.nextUrl.origin}/projects/${project.slug}`,
      }, {
        status: 200
      });
   }

   return NextResponse.redirect(`${requestUrl.origin}/admin`, {
      status: 301,
   });
}
