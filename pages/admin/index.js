import { Auth, ThemeMinimal } from '@supabase/auth-ui-react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import HeadersCustom from '../../components/HeadersCustom'
import styles from '../../styles/Home.module.css'
import Header from '../../components/Header'
import Navbar from '../../components/Navbar'
import { useRouter } from 'next/router'
const LoginPage = () => {
  const supabase = useSupabaseClient()
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email ,setEmail] = useState();

  /** Handles login using magic email link */
  const handleLogin = async (e) => {
    e.preventDefault()
    if (email.length > 0)
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      alert('Check your email for the login link!')
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user)
    return (
      <div className="w-full flex flex-col items-center">
        <HeadersCustom/>
        <main className={styles.main + ' main-body'}>
          <Navbar/>
          <Header title="Admin"/>
          <div className="row flex-center flex">
            <div className="flex flex-col gap-y-2 items-center" aria-live="polite">
              <h1 className="header">Admin Page</h1>
              <p className=" underline underline-offset-4">Uses Supabase for signing in with Magic Links! ✨</p>
              {loading ? (
                'Sending magic link...'
              ) : (
                <form className="flex flex-col gap-y-4" onSubmit={handleLogin}>
                  <div className="flex gap-x-4 pt-8">
                    <label className="text-lg" htmlFor="email">Email:</label>
                    <input
                      id="email"
                      className=" text-white"
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button className="button block" aria-live="polite">
                    Send magic link
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  else router.push('/admin/dashboard');
}

export default LoginPage