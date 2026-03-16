import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createOctokitClient } from '@/lib/octokit';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const PROJECTS_DIR = path.join(process.cwd(), 'src/content/projects');

// ── POSTS ──────────────────────────────────────────────────────────────────

export const getSlugsSupa = () => {
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''));
};

export const getPostFromSlugSupa = (slug) => {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
  const { content, data } = matter(raw);
  return {
    content,
    id: slug,
    meta: {
      slug,
      excerpt: data.excerpt ?? '',
      title: data.title ?? slug,
      tags: (data.tags ?? []).sort(),
      date: new Date(data.date).toString(),
      project: data.project && data.project !== 'None' ? data.project : 'None',
      imageURI: data.imageURI ?? '',
      emoji: data.emoji ?? '🗒️',
    },
  };
};

export const getAllPostsSupa = (project = null) => {
  const slugs = getSlugsSupa();
  let posts = slugs.map(slug => getPostFromSlugSupa(slug));
  posts.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));
  if (project) {
    posts = posts.filter(post => post?.meta?.project === project);
  }
  return posts;
};

export const getPostById = (id) => getPostFromSlugSupa(id);

// ── PROJECTS ───────────────────────────────────────────────────────────────

export const getProjectSlugsSupa = () => {
  return fs.readdirSync(PROJECTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
};

const loadProject = (slug) => {
  const filePath = path.join(PROJECTS_DIR, `${slug}.json`);
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
  return JSON.parse(raw);
};

export const getProjectFromSlugSupa = async (slug) => {
  const project = loadProject(slug);
  if (!project) return null;
  let octokit;
  try {
    octokit = createOctokitClient();
  } catch (err) {
    return project;
  }
  for (let i = 0; i < project.authors.length; i++) {
    try {
      const user = await octokit.request('GET /users/{username}', {
        username: project.authors[i].github,
      });
      project.authors[i].image = user.data.avatar_url ?? '';
    } catch (err) {
      project.authors[i].image = '';
    }
  }
  return project;
};

export const getAllProjectsSupa = async () => {
  const allProjects = getProjectSlugsSupa()
    .map(loadProject)
    .sort((a, b) => (b.added ?? 0) - (a.added ?? 0));

  let octokit;
  try {
    octokit = createOctokitClient();
  } catch (err) {
    return allProjects;
  }

  return Promise.all(
    allProjects.map(async (project) => {
      for (let i = 0; i < project.authors.length; i++) {
        try {
          const user = await octokit.request('GET /users/{username}', {
            username: project.authors[i].github,
          });
          project.authors[i].image = user.data.avatar_url ?? '';
        } catch (err) {
          project.authors[i].image = '';
        }
      }
      return project;
    })
  );
};

export const getProjectById = (id) => loadProject(id);

// ── GITHUB (unchanged) ─────────────────────────────────────────────────────

export const getLastStarredRepo = async () => {
  let octokit;
  try {
    octokit = createOctokitClient();
  } catch (err) {
    return { error: 'Could not fetch last starred repo', data: [] };
  }
  return octokit.request('GET /users/{username}/starred?per_page=1', {
    username: 'angel1254mc',
  });
};
