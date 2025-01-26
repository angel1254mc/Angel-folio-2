import React from 'react';
import Home from './Home';
import { getAllPostsSupa, getAllProjectsSupa } from '@/app/api';

// Force revalidation of home page EVERY refresh 👿
export const revalidate = 0;

const HomePage = async ({ children }) => {
   let projects = await getAllProjectsSupa();

   if (!projects || projects.error) {
      // default project information on error.
      projects = [
         {
            name: 'Project N/A 🥹',
            desc: 'Looks like; there was an error retrieving projects. Drop an issue on the github repo if you see this.',
            github: {
               url: 'https://github.com/angel1254mc/Angel-folio-2',
               isPublic: false,
            },
            slug: '/',
         },
      ];
   }
   let posts = await getAllPostsSupa();
   if (!posts || posts.error) {
      // default post information on error.
      posts = [
         {
            meta: {
               title: 'Post N/A 🥹',
               date: 'N/A',
               slug: '/',
               excerpt:
                  'Looks like there was an error retrieving posts. Drop an issue on the github repo if you see this.',
            },
         },
      ];
   }

   return <Home {...{ posts, projects }} />;
};

export default HomePage;
