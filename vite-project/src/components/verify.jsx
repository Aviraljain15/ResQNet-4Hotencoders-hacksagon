import { auth } from "../lib/firebase"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"

const Verify = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {

          let email = localStorage.getItem("emailForSignIn")

          if (!email) {
            email = prompt("Please enter your email for confirmation")
          }

          await signInWithEmailLink(auth, email, window.location.href)

          localStorage.removeItem("emailForSignIn")

          console.log("Email verified successfully")

          navigate("/register?step=3")

        } else {
          console.log("Invalid email link")
        }

      } catch (err) {
        console.error("Verification error:", err)
      }
    }

    run()
  }, [])

  return (
    <div className="text-white text-center mt-20">
      Verifying your email...
    </div>
  )
}

export default Verify