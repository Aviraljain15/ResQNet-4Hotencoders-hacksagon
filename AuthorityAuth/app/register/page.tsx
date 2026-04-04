"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mail,
  Building2,
  Phone,
  Lock,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  MapPin,
  ChevronDown,
  Search,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { indianDistricts } from "@/lib/districts"

// Simulated registered users
const registeredEmails = ["admin@gov.in", "authority@nic.in", "disaster@gov.in"]

type Step = 1 | 2 | 3

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)

  // Step 1: Email verification
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpExpiry, setOtpExpiry] = useState(120)

  // Step 2: Authority details
  const [orgName, setOrgName] = useState("")
  const [district, setDistrict] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Loading and errors
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    if (!debouncedSearch) return indianDistricts.slice(0, 50) // Show first 50 by default
    const query = debouncedSearch.toLowerCase()
    return indianDistricts.filter(d =>
      d.toLowerCase().includes(query)
    ).slice(0, 50)
  }, [debouncedSearch])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredDistricts])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsDropdownOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(i => Math.min(i + 1, filteredDistricts.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(i => Math.max(i - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (filteredDistricts[highlightedIndex]) {
          setDistrict(filteredDistricts[highlightedIndex])
          setIsDropdownOpen(false)
          setSearchQuery("")
        }
        break
      case "Escape":
        setIsDropdownOpen(false)
        break
    }
  }, [isDropdownOpen, filteredDistricts, highlightedIndex])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // OTP Expiry timer
  useEffect(() => {
    if (otpSent && !isEmailVerified && otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(otpExpiry - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpSent, isEmailVerified, otpExpiry])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Validations
  const validateEmail = (email: string) => {
    if (!email) return "Email is required"
    if (!email.endsWith("@gov.in") && !email.endsWith("@nic.in")) {
      return "Only @gov.in or @nic.in email addresses are allowed"
    }
    return null
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!orgName || orgName.length < 3) {
      newErrors.orgName = "Organization name must be at least 3 characters"
    }
    if (!district) {
      newErrors.district = "Please select a district"
    }
    if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
      newErrors.contactNumber = "Please enter a valid 10-digit contact number"
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    return newErrors
  }

  // Handlers
  const handleSendOtp = async () => {
    const emailError = validateEmail(email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }

    // Check if email already registered
    if (registeredEmails.includes(email.toLowerCase())) {
      setErrors({ email: "This email is already registered. Please login instead." })
      return
    }

    setIsLoading(true)
    setErrors({})
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setOtpSent(true)
    setResendCooldown(30)
    setOtpExpiry(120)
  }

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
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (otp === "123456") {
      setIsEmailVerified(true)
      setCurrentStep(2)
    } else {
      setErrors({ otp: "Invalid OTP. Please try again." })
    }
    setIsLoading(false)
  }

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

  const handleStep2Submit = async () => {
    const validationErrors = validateStep2()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setCurrentStep(3)
  }

  const steps = [
    { number: 1, label: "Email Verification" },
    { number: 2, label: "Authority Details" },
    { number: 3, label: "Complete" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--border)_1px,_transparent_1px),_linear-gradient(to_bottom,_var(--border)_1px,_transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

      <Card className="w-full max-w-lg relative backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Authority Registration</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Register as a disaster management authority
            </CardDescription>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    currentStep > step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.number
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2 transition-colors duration-300",
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {steps.find(s => s.number === currentStep)?.label}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Email Verification */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Government Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="example@gov.in"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setErrors({})
                        }}
                        className={cn(
                          "pl-10 h-11 bg-input/50 border-border/50 focus:border-primary transition-colors",
                          errors.email && "border-destructive focus:border-destructive"
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full h-11 gap-2 font-medium"
                    onClick={handleSendOtp}
                    disabled={!email || !!validateEmail(email) || isLoading}
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
                </>
              ) : (
                <div className="space-y-6">
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

                  <div className="flex flex-col items-center gap-4">
                    <label className="text-sm font-medium text-foreground">Enter 6-digit OTP</label>
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value)
                        setErrors({})
                      }}
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

                  <p className="text-xs text-center text-muted-foreground">
                    Demo: Use OTP <span className="font-mono bg-muted px-1.5 py-0.5 rounded">123456</span>
                  </p>

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
                        Verify & Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

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

                  <Button
                    variant="link"
                    className="w-full text-muted-foreground"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp("")
                      setErrors({})
                    }}
                  >
                    ← Change email
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Authority Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Verified email badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{email}</span>
                <span className="text-xs text-primary ml-auto">Verified</span>
              </div>

              {/* Organization Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="District Disaster Management Authority"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value)
                      setErrors({ ...errors, orgName: "" })
                    }}
                    className={cn(
                      "pl-10 h-11 bg-input/50 border-border/50 focus:border-primary transition-colors",
                      errors.orgName && "border-destructive focus:border-destructive"
                    )}
                  />
                </div>
                {errors.orgName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.orgName}
                  </p>
                )}
              </div>

              {/* District Dropdown */}
              <div className="space-y-2" ref={dropdownRef}>
                <label className="text-sm font-medium text-foreground">District</label>
                <div className="relative">
                  <div
                    className={cn(
                      "flex items-center h-11 w-full rounded-md border bg-input/50 border-border/50 px-3 cursor-pointer transition-colors",
                      isDropdownOpen && "border-primary ring-2 ring-primary/20",
                      errors.district && "border-destructive"
                    )}
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen)
                      setTimeout(() => searchInputRef.current?.focus(), 0)
                    }}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="combobox"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="listbox"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className={cn("flex-1 text-sm", !district && "text-muted-foreground")}>
                      {district || "Select your district"}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isDropdownOpen && "rotate-180")} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
                      {/* Search Input */}
                      <div className="p-2 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            ref={searchInputRef}
                            placeholder="Search districts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pl-9 h-9 bg-input/50"
                          />
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="max-h-60 overflow-y-auto p-1" role="listbox">
                        {filteredDistricts.length > 0 ? (
                          filteredDistricts.map((d, index) => (
                            <div
                              key={d}
                              role="option"
                              aria-selected={district === d}
                              className={cn(
                                "px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                                highlightedIndex === index && "bg-accent",
                                district === d && "bg-primary/10 text-primary"
                              )}
                              onClick={() => {
                                setDistrict(d)
                                setIsDropdownOpen(false)
                                setSearchQuery("")
                                setErrors({ ...errors, district: "" })
                              }}
                              onMouseEnter={() => setHighlightedIndex(index)}
                            >
                              {d}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No districts found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.district && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.district}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={contactNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                      setContactNumber(value)
                      setErrors({ ...errors, contactNumber: "" })
                    }}
                    className={cn(
                      "pl-10 h-11 bg-input/50 border-border/50 focus:border-primary transition-colors",
                      errors.contactNumber && "border-destructive focus:border-destructive"
                    )}
                  />
                </div>
                {errors.contactNumber && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors({ ...errors, password: "" })
                    }}
                    className={cn(
                      "pl-10 h-11 bg-input/50 border-border/50 focus:border-primary transition-colors",
                      errors.password && "border-destructive focus:border-destructive"
                    )}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setErrors({ ...errors, confirmPassword: "" })
                    }}
                    className={cn(
                      "pl-10 h-11 bg-input/50 border-border/50 focus:border-primary transition-colors",
                      errors.confirmPassword && "border-destructive focus:border-destructive"
                    )}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11 gap-2"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-11 gap-2 font-medium"
                  onClick={handleStep2Submit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <div className="text-center space-y-6 py-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Registration Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your authority account has been created successfully.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 text-left space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{email}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Organization:</span> <span className="font-medium">{orgName}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">District:</span> <span className="font-medium">{district}</span></p>
              </div>

              <Button
                className="w-full h-11 gap-2 font-medium"
                onClick={() => router.push("/login")}
              >
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Login Link */}
          {currentStep !== 3 && (
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Login here
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
