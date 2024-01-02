import { Octokit } from 'octokit';
import { createClient } from '@supabase/supabase-js';
const octokit = new Octokit({
   auth: process.env.GITHUB_AUTH,
});

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const getSlugsSupa = async () => {
   // get slugs from supabase and return
   let { data: slugs } = await supabase.from('posts').select('slug');
   // Return the slugs
   let slugStrings = [];
   slugs.forEach((slug) => slugStrings.push(slug.slug));
   // For some reason slugs.map(slugObj => slugObj.slug) was not working? so i did a forEach instead
   return slugStrings;
};
/**
 * @function getProjectSlugsSupa
 * @returns returns an array of slug strings
 */
export const getProjectSlugsSupa = async () => {
   // Get projects from supabase
   const { data: projects } = await supabase.from('projects').select('*');
   // Map these projects to their slugs and return the slugs
   return projects.map((project) => project.slug);
};
export const getProjectFromSlugSupa = async (slug) => {
   // Grab project that matches slug from supabase
   const {
      data: [project],
   } = await supabase.from('projects').select('*').eq('slug', slug);
   // Additionally parse the github info for this project

   for (let i = 0; i < project.authors.length; i++) {
      const user = await octokit.request('GET /users/{username}', {
         username: project.authors[i].github,
      });
      const url = user.data.avatar_url;
      project.authors[i].image = url ? url : 'epic';
   }
   return project;
};

export const getAllPostsSupa = async (project = null) => {
   if (project) {
      // Get all post slugs
      let slugs = await getSlugsSupa();
      // Map each slug and get the post for that given slug
      let projectPosts = await Promise.all(
         slugs.map((slug) => getPostFromSlugSupa(slug))
      );

      projectPosts.sort((a, b) => {
         if (a.meta.date > b.meta.date) return 1;
         if (a.meta.date < b.meta.date) return -1;
         return 0;
      });
      projectPosts.reverse();
      // Filter those belonging to the project
      let filteredPosts = projectPosts.filter(
         (post) => post?.meta?.project == project
      );
      // Return posts related to project
      return filteredPosts;
   } else {
      let posts = await getSlugsSupa();
      const allPosts = await Promise.all(
         posts.map(async (slug) => await getPostFromSlugSupa(slug))
      );
      allPosts
         .sort((a, b) => {
            if (new Date(a.meta.date) > new Date(b.meta.date)) return 1;
            if (new Date(a.meta.date) < new Date(b.meta.date)) return -1;
            return 0;
         })
         .reverse();
      return allPosts;
   }
};

export const getAllProjectsSupa = async () => {
   // First, get all projects, then get all image URLS for the users
   let { data: projects } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

   let proj = await Promise.all(
      projects.map(async (project) => {
         // Get github image url for each author
         for (let i = 0; i < project.authors.length; i++) {
            const user = await octokit.request('GET /users/{username}', {
               username: project.authors[i].github,
            });
            const url = user.data.avatar_url;
            project.authors[i].image = url ? url : 'epic';
         }
         return project;
      })
   );
   return proj;
};
/**
 * @interface Post
 * @param content
 * @param meta = {excerpt, slug, title, tags, date}
 *
 */

export const getPostFromSlugSupa = async (slug) => {
   // No need for frontmatter or data parsing, we just grab from supabase
   // Destructuring since there should only be one post for any given slug
   const {
      data: [post],
   } = await supabase.from('posts').select('*').eq('slug', slug);
   // Also nab tags from supabase by getting the 'tag' field from PostTag objects belonging to post with id post.id
   const { data: tags } = await supabase
      .from('PostTag')
      .select('tag')
      .eq('post', post.id);
   // Whip out the tag "string" from the tag object
   let stringTags = [];
   tags.forEach((tag) => stringTags.push(tag.tag));

   return {
      content: post.content,
      meta: {
         slug: post.slug,
         excerpt: post.excerpt,
         title: post.title ?? slug,
         tags: (stringTags ?? []).sort(), // Nullish Coalesscing
         date: new Date(post.created_at).toString(),
         project:
            post.project && post.project.length > 1 ? post.project : 'None',
         imageURI: post.imageURI ?? '',
         emoji: post.emoji ?? '🗒️',
      },
   };
};

export const getLastStarredRepo = async () => {
   let lastStarredRepo = await octokit.request(
      'GET /users/{username}/starred?per_page=1',
      {
         username: 'angel1254mc',
      }
   );

   return lastStarredRepo;
};
