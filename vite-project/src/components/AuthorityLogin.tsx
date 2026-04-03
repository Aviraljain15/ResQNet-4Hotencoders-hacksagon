import { useState } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { Mail, Lock, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { auth, db } from "../lib/firebase"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export default function AuthorityLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const showVerifyMessage = searchParams.get("verify") === "true"

  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password"
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later."
      case "auth/network-request-failed":
        return "Network error. Please check your connection."
      case "auth/invalid-email":
        return "Invalid email address."
      default:
        return "Login failed. Please try again."
    }
  }

  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string; general?: string } = {}
    if (!email) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // 1. Sign in with email + password
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. Check if email is verified
      if (!user.emailVerified) {
        await signOut(auth)
        setErrors({ general: "Please verify your email before logging in. Check your inbox." })
        setIsLoading(false)
        return
      }

      // 3. Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        await signOut(auth)
        setErrors({ general: "User data not found. Please register again." })
        setIsLoading(false)
        return
      }

      const userData = userDoc.data()

      // 4. Check role
      if (userData.role === "authority") {
        navigate("/dashboard")
      } else {
        await signOut(auth)
        setErrors({ general: "Not authorized. Only authorities can access this system." })
      }
    } catch (error: any) {
      setErrors({ general: getFirebaseErrorMessage(error.code) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--border)_1px,_transparent_1px),_linear-gradient(to_bottom,_var(--border)_1px,_transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Authority Login</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Only authorized disaster management authorities allowed
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Verify Email Message */}
            {showVerifyMessage && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Account created. Please verify your email before logging in.
                </p>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="example@gov.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: undefined, general: undefined })
                  }}
                  className={cn(
                    "pl-10 h-11 bg-input/50 border-border/50 focus:border-primary transition-colors",
                    errors.email && "border-destructive focus:border-destructive",
                  )}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors({ ...errors, password: undefined, general: undefined })
                  }}
                  className={cn(
                    "pl-10 h-11 bg-input/50 border-border/50 focus:border-primary transition-colors",
                    errors.password && "border-destructive focus:border-destructive",
                  )}
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              className="w-full h-11 gap-2 font-medium"
              onClick={handleLogin}
              disabled={!email || !password || isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              New Authority?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
