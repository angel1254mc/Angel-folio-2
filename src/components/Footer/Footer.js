import Link from 'next/link';
import React from 'react';
import Utils from '../Utils';
import styles from './Footer.module.css';
const Footer = () => {
   return (
      <footer className={styles.footer_group}>
         <div className={styles.footer_top_group}>
            Made with <Utils href={'https://mdxjs.com/'}>MDX</Utils>,{' '}
            <Utils href={'https://nextjs.org/'}>NextJS</Utils>,{' '}
            <Utils href={'https://tailwindcss.com/'}>Tailwind</Utils>,{' '}
            <Utils href={'https://www.react-spring.dev/'}>react-spring</Utils>{' '}
            and Love 💖 <></> View Source on{' '}
            <Utils href={'https://github.com/angel1254mc'}>Github</Utils>
         </div>
         <hr
            style={{
               border: '1px solid grey',
               maxWidth: `800px`,
               width: '100%',
            }}
         ></hr>
         <div className={styles.footer_bottom_group}>
            According to leading scientists in the field, you have reached the
            footer of this website
         </div>
      </footer>
   );
};

export default Footer;
