'use client';
import { MDXRemote } from 'next-mdx-remote';
import * as components from '@/components/MDX/Tools';
import Utils from '../Utils';
const ClientMDXWrapper = ({ post }) => {
   return (
      post && <MDXRemote {...post.source} components={{ components, Utils }} />
   );
};

export default ClientMDXWrapper;
