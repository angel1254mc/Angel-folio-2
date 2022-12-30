import Head from 'next/head';
import React from 'react'
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Home.module.css';

const index = () => {
    return (
        <>
        <Head>
          <title>Angel Blog</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main + ' main-body'}>
          <Navbar/>
          <Header title={"About"}/>
          <div className='mt-20 text-xl flex justify-center'>Coming Soon!</div>
        </main>
        </>
    )
}

export default index;
