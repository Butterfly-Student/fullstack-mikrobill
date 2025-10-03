// sign-in.tsx - Tidak perlu diubah, sudah sempurna!
import { useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Route } from '@/routes/(auth)/sign-in';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '../auth-layout';
import { UserAuthForm } from './components/user-auth-form'


export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const search = Route.useSearch()
  const redirectTo = search.redirect || '/'

  // Debug logging
  useEffect(() => {
    const checkAuth = async () => {
      console.log('=== Sign In Page Debug ===')
      console.log('Access Token:', !!auth.accessToken)
      console.log('User:', auth.user)
      console.log('Is Authenticated:', auth.isAuthenticated())
      console.log('Token Expired:', auth.isTokenExpired())
      console.log('Redirect URL:', redirect)

      // Jika sudah login, redirect ke dashboard atau URL yang diminta
      if (auth.isAuthenticated() && !auth.isTokenExpired()) {
        console.log('✅ Already authenticated, redirecting...')
        navigate({
          to: redirectTo,
          replace: true,
        })
      }
    }

    checkAuth()
  }, [auth.accessToken, auth.user, redirect, navigate])

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Sign in</CardTitle>
          <CardDescription>
            Enter your email and password below to <br />
            log into your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking sign in, you agree to our{' '}
            <a
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}