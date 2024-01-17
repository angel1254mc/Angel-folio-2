import HeadersCustom from '@/components/HeadersCustom'
import React from 'react'

const layout = ({children}) => {


  return (
    <div className='w-full flex flex-col items-center'>
         <HeadersCustom  
            title="Admin Dashboard"
            description="Modify stuff here"
         />
         {children}
    </div>
  )
}

export default layout