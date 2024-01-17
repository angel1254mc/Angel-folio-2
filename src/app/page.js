import React from 'react';
import Home from './Home';
import { getAllPostsSupa, getAllProjectsSupa } from '@/app/api';

// Force revalidation of home page EVERY refresh 👿
export const revalidate = 0

const HomePage = async ({ children }) => {
   const projects = await getAllProjectsSupa();
   const posts = await getAllPostsSupa();
   return <Home {...{ posts, projects }} />;
};

export default HomePage;
