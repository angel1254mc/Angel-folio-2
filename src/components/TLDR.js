import Link from 'next/link';
import React, { useEffect } from 'react';
import styles from '../styles/components/TLDR.module.css';
/**
 * TLDR component takes in a string of content, parses it into an array of strings, then fades in each
 * part of the string sequentially
 * @param {*} param0
 * @returns
 */
export const TLDR = ({ content, delay, id, triggerImage }) => {
   useEffect(() => {
      let currDelay = delay;
      let childArr = [...document.getElementById(id).children];
      childArr.forEach((element, index) => {
         setTimeout(() => {
            element.classList.add('fadeIn');
            if (index == childArr.length - 1) triggerImage(true);
         }, currDelay);
         // Increment the delay more if it follows a special element
         currDelay +=
            element.classList.contains('link') ||
            element.classList.contains('emphasis')
               ? 5 * delay
               : delay;
      });
   });
   return (
      <div id={id} className={styles.TLDR_container}>
         {content.map((block, index) => {
            switch (block.type) {
               case 'text':
                  return block.content.split(' ').map((word, jndex) => {
                     return (
                        <div key={`${word}-${jndex}`} className={styles.word}>
                           {word}
                        </div>
                     );
                  });
               case 'emphasis':
                  return (
                     <div
                        key={`${block.content}-${index}`}
                        className='emphasis'
                     >
                        {block.content}
                     </div>
                  );
               case 'link':
                  return (
                     <Link
                        key={`${block.content}-${index}`}
                        className='link'
                        href={block.link}
                     >
                        {block.content}
                     </Link>
                  );
            }
         })}
      </div>
   );
};
