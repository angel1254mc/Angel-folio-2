import Header from '@/components/Header/Header';
import { LoginErrorListener } from '@/components/Login/LoginErrorListener';

export default function Login() {
   return (
      <div className='w-full flex flex-col justify-center items-center h-[100vh] py-8 px-16 text-white bg-black'>
         <div className='w-full max-w-[800px] flex flex-col py-2'>
            <Header title='Login' />
         </div>
         <form
            className='max-w-[800px] gap-y-2 w-full flex flex-col'
            action='api/auth/login'
            method='post'
         >
            <label className='w-full text-xl font-bold' htmlFor='email'>
               Email
            </label>
            <input
               className='bg-black py-2 px-4 border-[#1A1A1A] border-2 rounded-md'
               name='email'
            />
            <label className='w-full text-xl mt-4 font-bold' htmlFor='password'>
               Password
            </label>
            <input
               className='bg-black py-2 px-4 border-[#1A1A1A] border-2 rounded-md'
               type='password'
               name='password'
            />
            <button
               className='w-full mt-8 transition-all duration-75 active:translate-y-1 border-gray-600 bg-[#1A1A1A] py-2 text-center font-bold text-white'
               formAction='/api/auth/login'
            >
               Login
            </button>
         </form>
         <LoginErrorListener />
      </div>
   );
}
