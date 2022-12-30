import path from "path";
import fs from "fs";
import { sync } from "glob";
import matter from "gray-matter";
import {Projects} from '../../content/content'
import { Octokit } from "octokit";
const POSTS_PATH = path.join(process.cwd(), "content/posts");
const octokit = new Octokit({
    auth: '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'
})

export const getSlugs = () => {
    // Grabs all the paths to mdx files, then maps each path to its slug by removing
    // the path data and extension sections
    const paths = sync(path.join(POSTS_PATH, '*.mdx').replace(/\\/g, '/'));
    return paths.map((path) => {
        const parts = path.split('/');
        const fileName = parts[parts.length-1];
        const [slug, _ext] = fileName.split('.');
        return slug;
    })
}
export const getProjectSlugs = () => {
    const proj = Projects;
    return proj.map(project => project.slug);
}
export const getProjectFromSlug = async (slug) => {
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
export const getAllPosts = (project = null) => {
    if (project) {
        // Get all posts
        let posts = getSlugs().map((slug) => getPostFromSlug(slug)).sort((a, b) => {
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
    else
        return getSlugs().map((slug) => getPostFromSlug(slug)).sort((a, b) => {
            if (a.meta.date > b.meta.date) return 1;
            if (a.meta.date < b.meta.date) return -1;
            return 0;
          })
          .reverse();
}

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
/**
 * @interface Post
 * @param content
 * @param meta = {excerpt, slug, title, tags, date}
 * 
 */
export const getPostFromSlug = (slug) => {

    const postPath = path.join(POSTS_PATH, `${slug}.mdx`);
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