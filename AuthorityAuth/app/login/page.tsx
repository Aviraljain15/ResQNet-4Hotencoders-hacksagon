"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, ShieldCheck, AlertCircle, ArrowRight, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

// Simulated registered users (for demo purposes)
const registeredUsers = ["admin@gov.in", "authority@nic.in", "disaster@gov.in"]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    otp?: string
    general?: string
  }>({})
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpExpiry, setOtpExpiry] = useState(120) // 2 minutes

  // Email validation
  const validateEmail = (email: string) => {
    if (!email) return "Email is required"
    if (!email.endsWith("@gov.in") && !email.endsWith("@nic.in")) {
      return "Only @gov.in or @nic.in email addresses are allowed"
    }
    return null
  }

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 characters"
    return null
  }

  // Check if form is valid
  const isCredentialsValid = !validateEmail(email) && !validatePassword(password)

  // Handle OTP Send
  const handleSendOtp = async () => {
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError || passwordError) {
      setErrors({ email: emailError || undefined, password: passwordError || undefined })
      return
    }

    // Check if user is registered (simulated)
    if (!registeredUsers.includes(email.toLowerCase())) {
      setErrors({ general: "Please register first. This email is not registered." })
      return
    }

    setIsLoading(true)
    setErrors({})

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsLoading(false)
    setStep("otp")
    setResendCooldown(30)
    setOtpExpiry(120)
  }

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" })
      return
    }

    if (otpExpiry <= 0) {
      setErrors({ otp: "OTP has expired. Please resend." })
      return
    }

    setIsLoading(true)
    setErrors({})

    // Simulate verification (accept "123456" as valid OTP for demo)
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (otp === "123456") {
      login(email)
      router.push("/dashboard")
    } else {
      setIsLoading(false)
      setErrors({ otp: "Invalid OTP. Please try again." })
    }
  }

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setResendCooldown(30)
    setOtpExpiry(120)
    setOtp("")
    setErrors({})
  }

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // OTP Expiry timer
  useEffect(() => {
    if (step === "otp" && otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(otpExpiry - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [step, otpExpiry])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Subtle grid pattern */}
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
          {step === "credentials" ? (
            <div className="space-y-4">
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
                      errors.email && "border-destructive focus:border-destructive"
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
                      errors.password && "border-destructive focus:border-destructive"
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

              {/* General Error */}
              {errors.general && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.general}
                </div>
              )}

              {/* Send OTP Button */}
              <Button
                className="w-full h-11 gap-2 font-medium"
                onClick={handleSendOtp}
                disabled={!isCredentialsValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* OTP Sent Message */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  OTP sent to <span className="text-foreground font-medium">{email}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {otpExpiry > 0 ? (
                    <>Expires in <span className="text-primary font-medium">{formatTime(otpExpiry)}</span></>
                  ) : (
                    <span className="text-destructive">OTP expired. Please resend.</span>
                  )}
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex flex-col items-center gap-4">
                <label className="text-sm font-medium text-foreground">Enter 6-digit OTP</label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value)
                    setErrors({ ...errors, otp: undefined })
                  }}
                  className="gap-2"
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-11 h-12 text-lg rounded-lg bg-input/50 border-border/50"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {errors.otp && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.otp}
                  </p>
                )}
              </div>

              {/* Demo hint */}
              <p className="text-xs text-center text-muted-foreground">
                Demo: Use OTP <span className="font-mono bg-muted px-1.5 py-0.5 rounded">123456</span>
              </p>

              {/* Verify OTP Button */}
              <Button
                className="w-full h-11 gap-2 font-medium"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isLoading || otpExpiry <= 0}
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Resend OTP */}
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={cn("w-4 h-4", resendCooldown > 0 && "animate-spin")} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </Button>
              </div>

              {/* Back to credentials */}
              <Button
                variant="link"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setStep("credentials")
                  setOtp("")
                  setErrors({})
                }}
              >
                ← Back to login
              </Button>
            </div>
          )}

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              New Authority?{" "}
              <Link
                href="/register"
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
