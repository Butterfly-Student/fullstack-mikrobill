import { Link } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { auth } = useAuthStore()

  // Helper to get user's display name
  const getDisplayName = () => {
    const user = auth.user
    if (!user) return 'User'

    // Priority: displayUsername > name > username > email
    return user.name ||
      user.username ||
      user.email?.split('@')[0] ||
      'User'
  }

  // Helper to get user's initials for avatar fallback
  const getUserInitials = () => {
    const user = auth.user
    if (!user) return 'U'

    const displayName = getDisplayName()

    // If we have first_name and last_name, use those
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }

    // If display name has spaces, use first letter of first two words
    const nameParts = displayName.split(' ')
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }

    // Otherwise, use first two letters of display name
    return displayName.substring(0, 2).toUpperCase()
  }

  // Helper to get user's subtitle (email or role)
  const getUserSubtitle = () => {
    const user = auth.user
    if (!user) return ''

    // Show email if available
    if (user.email) return user.email

    // Show primary role if no email
    if (user.roles && user.roles.length > 0) {
      const primaryRole = user.roles[0]
      return `Role: ${primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)}`
    }

    return 'User'
  }

  // If user is not authenticated, don't render
  if (!auth.user) return null

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={auth.user.image}
                alt={`@${auth.user.username || getDisplayName()}`}
              />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>
                {getDisplayName()}
              </p>
              <p className='text-muted-foreground text-xs leading-none'>
                {getUserSubtitle()}
              </p>
              {/* Show account number if available */}
              {auth.user.accountNo && auth.user.accountNo !== auth.user.id && (
                <p className='text-muted-foreground text-xs leading-none opacity-75'>
                  Account: {auth.user.accountNo}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Billing
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>

            {/* Show admin menu if user has admin role */}
            {auth.user.roles?.includes('admin') && (
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  Admin Panel
                  <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            )}

            {/* Show manager menu if user has manager role */}
            {auth.user.roles?.includes('manager') && (
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  Management
                  <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpen(true)}>
            Sign out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}