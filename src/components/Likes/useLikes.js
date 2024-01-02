import { useState } from 'react';
import useSWR from 'swr';

const API_URL = '/api/likes';

/**
 * @function getLikes // Originally created by Delba Oliveira
 * @param {string} slug slug for the post for which we are fetching
 * @returns a json response including currentLikes on the post
 */
async function getLikes(slug) {
   // Fetching likes through the nextjs api route
   const res = await fetch(API_URL + `/${slug}`);
   if (!res.ok) {
      throw new Error('There was an error fetching post likes.');
   }
   return res.json();
}

/**
 * @function updateLikes // Originally created by Delba Oliveira
 * @param {string} slug slug for the post we are updating
 * @returns a response with status code to denote whether the request was successful or unsuccessful
 */
async function updateLikes(slug) {
   const res = await fetch(API_URL + `/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
   });

   if (!res.ok) {
      console.log(res);
      throw new Error('Something went wrong while posting the data.');
   }

   return res.json();
}

/** Here comes the custom hooooooooook */

export const useLikes = (slug, config) => {
   const { data, error, mutate } = useSWR(
      // Concatenates API_URL and slug
      [API_URL, slug],
      // Callback "fetcher" function that swr uses
      () => getLikes(slug),
      {
         dedupingInterval: 60000, // Ensures that requests with same key (multiple calls of this hook) don't result in getlikes getting called again and again
      }
   );
   const [likes, setCurrLikes] = useState(0);

   const increment = () => {
      // You can only like when the swr finishes retreaving data, and you can't like if you already
      if (!data || data.currentUserLikes >= 3) {
         return;
      }
      updateLikes(slug);
      // I'll use mutate to keep a cache in the swr cache, like Delba does on her website.
      // Most of my other projects follow Optimistic UI pattern so I might as well.
      mutate(
         {
            likes: data.likes + 1,
            currentUserLikes: data.currentUserLikes + 1,
         },
         false
      );

      setCurrLikes(likes + 1);
   };

   return {
      currentUserLikes: data?.currentUserLikes,
      likes: data?.likes,
      isLoading: !error && !data,
      isError: !!error,
      increment,
   };
};
