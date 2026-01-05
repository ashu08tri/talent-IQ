import { SignInButton, SignedIn, SignedOut, SignOutButton, UserButton } from '@clerk/clerk-react'

function HomePage() {
  return (
    <>
    <h1 className='text-3xl text-red-300'>Welcome to Talent-IQ</h1>
     <SignedOut>
      <SignInButton mode="modal">
      <button>
        Please Sign In!
        </button>  
      </SignInButton>
     </SignedOut>

     <SignedIn>
      <SignOutButton />
     </SignedIn>

     <UserButton />
    </>
  )
}

export default HomePage;