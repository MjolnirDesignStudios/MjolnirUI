'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ShimmerButton from '@/components/Buttons/ShimmerButton'

export default function SignIn() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async (provider: string) => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900/60 backdrop-blur border border-white/10 rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Sign In to MjolnirUI</h1>

        <div className="space-y-4">
          <ShimmerButton
            title="Continue with Google"
            variant="silver"
            handleClick={() => handleSignIn('google')}
            otherClasses="w-full"
          />

          <ShimmerButton
            title="Continue with GitHub"
            variant="primary"
            handleClick={() => handleSignIn('github')}
            otherClasses="w-full"
          />
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
