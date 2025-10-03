import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
// ← Tambahkan import ini
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Please enter your email or username')
    .refine(
      (value) => {
        // If it contains @, validate as email
        if (value.includes('@')) {
          return z.string().email().safeParse(value).success
        }
        // If no @, validate as username (minimum 3 characters, alphanumeric + underscore)
        return /^[a-zA-Z0-9_]{3,}$/.test(value)
      },
      {
        message:
          'Please enter a valid email or username (min 3 characters, alphanumeric)',
      }
    ),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
  rememberMe: z.boolean().default(false), // ← Tambahkan ini
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: false, // ← Tambahkan default value
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // ↓ Pass rememberMe sebagai parameter ketiga
      const result = await auth.login(
        data.emailOrUsername,
        data.password,
        data.rememberMe
      )

      if (result.success) {
        const userIdentifier = data.emailOrUsername.includes('@')
          ? data.emailOrUsername
          : `@${data.emailOrUsername}`

        // ↓ Update toast message berdasarkan Remember Me
        const sessionInfo = data.rememberMe
          ? 'You will stay signed in for 30 days.'
          : 'Session will expire when browser closes.'

        toast.success(`Welcome back, ${userIdentifier}!`, {
          description: sessionInfo,
        })

        console.log('🔐 Login successful with:', {
          user: userIdentifier,
          rememberMe: data.rememberMe,
          sessionType: data.rememberMe
            ? 'Persistent (30 days)'
            : 'Session only',
        })

        // Redirect to target path
        const targetPath = redirectTo || '/'
        navigate({ to: targetPath, replace: true })
      } else {
        toast.error(result.message || 'Login failed')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='emailOrUsername'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Username</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com or username' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />

        {/* ============================================ */}
        {/* 🎯 REMEMBER ME CHECKBOX - BAGIAN BARU       */}
        {/* ============================================ */}
        <FormField
          control={form.control}
          name='rememberMe'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-y-0 space-x-1'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className='leading-none'>
                <FormLabel className='cursor-pointer text-sm font-medium'>
                  Remember me
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        {/* ============================================ */}

        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
