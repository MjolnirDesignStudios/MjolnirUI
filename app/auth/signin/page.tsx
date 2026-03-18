'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import ShimmerButton from '@/components/Buttons/ShimmerButton'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/blocks/dashboard'

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/blocks/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async (provider: string) => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (err) {
      console.error('Sign in error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900/60 backdrop-blur border border-white/10 rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Sign In to MjolnirUI</h1>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error === 'OAuthCallback' && 'Authentication failed. Please try again.'}
            {error === 'OAuthAccountNotLinked' && 'This email is already linked to another provider.'}
            {error === 'AccessDenied' && 'Access denied. Please contact support.'}
            {!['OAuthCallback', 'OAuthAccountNotLinked', 'AccessDenied'].includes(error) && `Sign-in error: ${error}`}
          </div>
        )}

        <div className="space-y-4">
          <ShimmerButton
            title={loading ? "Redirecting..." : "Continue with Google"}
            variant="silver"
            handleClick={() => handleSignIn('google')}
            otherClasses="w-full"
          />

          <ShimmerButton
            title={loading ? "Redirecting..." : "Continue with GitHub"}
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

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><div className="animate-pulse text-gray-500">Loading...</div></div>}>
      <SignInContent />
    </Suspense>
  )
}
