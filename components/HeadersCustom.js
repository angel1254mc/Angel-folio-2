import Head from 'next/head'
import React from 'react'

const HeadersCustom = ({title = "AngelFolio", description="Angel's portfolio site and blog. Come check it out!"}) => {
  return (
    <Head>
        <title>AngelFolio</title>
        <meta name="title" content={title}/>
        <meta name="description" content={description}/>

        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://www.angel1254.com/"/>
        <meta property="og:title" content={title}/>
        <meta property="og:description" content={description}/>
        <meta property="og:image" content="https://www.angel1254.com/link-image.png"/>

        <meta property="twitter:card" content="summary_large_image"/>
        <meta property="twitter:url" content="https://www.angel1254.com/"/>
        <meta property="twitter:title" content={title}/>
        <meta property="twitter:description" content={description}/>
        <meta property="twitter:image" content="https://www.angel1254.com/link-image.png"/>
    </Head>
  )
}

export default HeadersCustom