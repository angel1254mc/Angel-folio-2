import path from "path";
import fs from "fs";
import { sync } from "glob";
import matter from "gray-matter";
import { Octokit } from "octokit";
import { createClient } from '@supabase/supabase-js'
const POSTS_PATH = path.join(process.cwd(), "content/posts");
const octokit = new Octokit({
    auth: process.env.GITHUB_AUTH
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);



export const getSlugsSupa = async () => {
    // get slugs from supabase and return
    let {data: slugs} = await supabase.from('posts').select('slug');
    // Return the slugs
    let slugStrings = []
    slugs.forEach(slug => slugStrings.push(slug.slug));
    // For some reason slugs.map(slugObj => slugObj.slug) was not working? so i did a forEach instead
    return slugStrings;
}
/**
 * @function getProjectSlugsSupa
 * @returns returns an array of slug strings
 */
export const getProjectSlugsSupa = async () => {
    // Get projects from supabase
    const {data: projects} = await supabase.from('projects').select('*');
    // Map these projects to their slugs and return the slugs
    return projects.map(project => project.slug);
}
export const getProjectFromSlugSupa = async (slug) => {
    // Grab project that matches slug from supabase
    const {data: [project]} = await supabase.from('projects').select('*').eq('slug', slug);
    // Additionally parse the github info for this project
    for (let i = 0; i < project.authors.length; i++) {
        const  user = await octokit.request('GET /users/{username}', {
          username: project.authors[i].github
        })
        const url = user.data.avatar_url
        project.authors[i].image = url ? url : 'epic'
    }
    return project;
}
/**
 * @deprecated used back when projects were stored locally
 * @param {string} slug the slug referring to  that project
 * @returns 
 */
export const getProjectFromSlug = async (slug) => {
    await getProjectFromSlugSupa(slug);
    let proj = {};
    for (let i = 0; i < Projects.length; i++) {
        if (Projects[i].slug == slug)
            proj = Projects[i];
    }
    for (let i = 0; i < proj.authors.length; i++) {
        const  user = await octokit.request('GET /users/{username}', {
          username: proj.authors[i].github
        })
        const url = user.data.avatar_url
        proj.authors[i].image = url ? url : 'epic'
    }
    return proj
}
export const getAllPostsSupa = async (project = null) => {
    if (project) {
        // Get all post slugs
        let slugs = await getSlugsSupa();
        // Map each slug and get the post for that given slug
        let projectPosts = await Promise.all(slugs.map((slug) => getPostFromSlugSupa(slug)));

        projectPosts.sort((a, b) => {
            if (a.meta.date > b.meta.date) return 1;
            if (a.meta.date < b.meta.date) return -1;
            return 0;
        })  ;
        projectPosts.reverse();
        // Filter those belonging to the project
        let filteredPosts = projectPosts.filter((post) => post?.meta?.project == project);
        // Return posts related to project
        return filteredPosts;
    }
    else {
        let posts = await getSlugsSupa();
        const allPosts = await Promise.all((posts).map(async (slug) => 
        await getPostFromSlugSupa(slug)
        ))
        allPosts.sort((a, b) => {
            if ((new Date(a.meta.date)) > (new Date(b.meta.date))) return 1;
            if ((new Date(a.meta.date)) < (new Date(b.meta.date))) return -1;
            return 0;
          })
          .reverse();
        return allPosts;
    }
}

export const getAllProjectsSupa = async () => {

    // First, get all projects, then get all image URLS for the users
    let {data: projects} = await supabase.from('projects').select('*').order('added', {ascending: false});

    let proj = await Promise.all(projects.map(async (project) => {
        // Get github image url for each author
        for (let i = 0; i < project.authors.length; i++) {
            const user = await octokit.request('GET /users/{username}', {
              username: project.authors[i].github
            })
            const url = user.data.avatar_url
            project.authors[i].image = url ? url : 'epic'
        }
        return project;
    }))
    return proj;
}
/**
 * @interface Post
 * @param content
 * @param meta = {excerpt, slug, title, tags, date}
 * 
 */


export const getPostFromSlugSupa = async (slug) => {
    // No need for frontmatter or data parsing, we just grab from supabase
    // Destructuring since there should only be one post for any given slug
    const {data: [post]} = await supabase.from('posts').select('*').eq('slug', slug);
    // Also nab tags from supabase by getting the 'tag' field from PostTag objects belonging to post with id post.id
    const {data: tags} = await supabase.from('PostTag').select('tag').eq('post', post.id);
    // Whip out the tag "string" from the tag object
    let stringTags = [];
    tags.forEach((tag) => stringTags.push(tag.tag))

    return {
        content: post.content,
        meta: {
            slug: post.slug,
            excerpt: post.excerpt,
            title: post.title ?? slug,
            tags: (stringTags??[]).sort(), // Nullish Coalesscing
            date: (new Date(post.created_at)).toString(),
            project: (post.project && post.project.length > 1 ? post.project : 'None'),
            imageURI: (post.imageURI ?? ''),
            emoji: post.emoji ?? '🗒️',
        }
    }

}


/**
 * 
 * @deprecated used back when blog posts were parsed from static files
 * @returns 
 */
export const getSlugs = async () => {
    // Grabs all the paths to mdx files, then maps each path to its slug by removing
    // the path data and extension sections
    return await getSlugsSupa();
    const paths = sync(path.join(POSTS_PATH, '*.mdx').replace(/\\/g, '/'));
    return paths.map((path) => {
        const parts = path.split('/');
        const fileName = parts[parts.length-1];
        const [slug, _ext] = fileName.split('.');
        return slug;
    })
}

/**
 * @deprecated used back when projects were parsed from static files
 * @returns a list of project slugs
 */
export const getProjectSlugs = async () => {
    const proj = Projects;
    return proj.map(project => project.slug);
}

/**
 * @deprecated used back when projects and posts were parsed from static files
 * @param {object} project JSON object representing a project
 * @returns 
 */
export const getAllPosts = async (project = null) => {
    if (project) {
        // Get all post slugs
        let posts = await getSlugsSupa();

        // Map each slug and get the post for that given slug
        posts.map((slug) => getPostFromSlug(slug)).sort((a, b) => {
            if (a.meta.date > b.meta.date) return 1;
            if (a.meta.date < b.meta.date) return -1;
            return 0;
          })
          .reverse();
        // Filter those belonging to the project
        let filteredPosts = posts.filter((post) => post?.meta?.project == project);
        // Return posts related to project
        return filteredPosts;
    }
    else {
        let posts = await getSlugsSupa();
        
        return (await getSlugsSupa()).map((slug) => getPostFromSlug(slug)).sort((a, b) => {
            if ((new Date(a.meta.date)) > (new Date(b.meta.date))) return 1;
            if ((new Date(a.meta.date)) < (new Date(b.meta.date))) return -1;
            return 0;
          })
          .reverse();
    }
}
/**
 * @deprecated no longer used since switching to Supabase
 * @param {*} slug 
 * @returns 
 */
export const getPostFromSlug = (slug) => {

    const TEST_PATH = path.join(process.cwd(), "content");
    const postPath = path.join(TEST_PATH, `${slug}.mdx`);
    // Now that path is figured out, read out the contents
    const source = fs.readFileSync(postPath);
    const {content, data} = matter(source);
    
    return {
        content,
        meta: {
            slug,
            excerpt: data.excerpt,
            title: data.title ?? slug,
            tags: (data.tags??[]).sort(), // Nullish Coalesscing
            date: (data.date ?? new Date()).toString(),
            project: (data.project ?? 'None'),
            imageURI: (data.imageURI ?? ''),
            emoji: data.emoji ?? '🗒️',
        }
    }

}
/**
 * @deprecated used back when projects were still stored locally
 * @returns 
 */
export const getAllProjects = async () => {
    let proj = await Promise.all(Projects.map(async (project) => {
        // Get github image url for each author
        for (let i = 0; i < project.authors.length; i++) {
            const user = await octokit.request('GET /users/{username}', {
              username: project.authors[i].github
            })
            const url = user.data.avatar_url
            project.authors[i].image = url ? url : 'epic'
        }
        return project;
    }))
    return proj;
}