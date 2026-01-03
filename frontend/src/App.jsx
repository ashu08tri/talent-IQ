import { SignInButton, SignedIn, SignedOut, SignOutButton, UserButton } from '@clerk/clerk-react'

function App() {
  

  return (
    <>
     <h1>Welcome to Talent-IQ</h1>
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

export default App
