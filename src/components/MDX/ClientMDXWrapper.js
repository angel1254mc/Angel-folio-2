'use client';
import * as components from '@/components/MDX/Tools';
import Utils from '../Utils';
import { MDXRemote } from 'next-mdx-remote';
const ClientMDXWrapper = ({ post }) => {
   return (
      post && <MDXRemote {...post.source} components={{ components, Utils }} />
   );
};

export default ClientMDXWrapper;
