import React, { useState, useRef, useEffect } from "react"
import { MapPin, Upload, X, AlertTriangle, Video, ImageIcon, Crosshair, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Field, FieldLabel, FieldError, FieldGroup } from "./ui/field"
import { cn } from "../lib/utils"
import { auth, db, storage } from "../lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { indianDistricts } from "../lib/districts"
import { analyzeReport } from "../lib/aiService"

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

type Severity = "high" | "medium" | "low"
type ReportStatus = "pending" | "approved" | "rejected"

interface FormErrors {
  incidentType?: string
  severity?: string
  location?: string
  description?: string
  images?: string
  name?: string
  phone?: string
}

interface MarkerPosition {
  lat: number
  lng: number
}

interface Report {
  id: string
  incidentType: string
  severity: Severity
  location: MarkerPosition | null
  status: ReportStatus
  createdAt: Date
}

const incidentTypes = [
  "Flood",
  "Fire",
  "Earthquake",
  "Landslide",
  "Storm/Cyclone",
  "Building Collapse",
  "Road Accident",
  "Gas Leak",
  "Power Outage",
  "Other Emergency",
]

const incidentTypeLabels: Record<string, string> = {
  "flood": "Flood",
  "fire": "Fire",
  "earthquake": "Earthquake",
  "landslide": "Landslide",
  "storm-cyclone": "Storm/Cyclone",
  "building-collapse": "Building Collapse",
  "road-accident": "Road Accident",
  "gas-leak": "Gas Leak",
  "power-outage": "Power Outage",
  "other-emergency": "Other Emergency",
}

// Default position (New Delhi, India)
const DEFAULT_POSITION: MarkerPosition = { lat: 28.6139, lng: 77.209 }

// Fix Leaflet default marker icon issue in bundlers
const customIcon = L.divIcon({
  html: `<div class="relative">
    <div class="absolute -top-8 -left-3 w-6 h-8">
      <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="#dc2626"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    </div>
  </div>`,
  className: "",
  iconSize: [24, 36],
  iconAnchor: [12, 36],
})

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const config = {
    pending: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: Clock,
      label: "Pending",
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: CheckCircle2,
      label: "Approved",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: XCircle,
      label: "Rejected",
    },
  }

  const { bg, text, icon: Icon, label } = config[status]

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", bg, text)}>
      <Icon className="size-3" />
      {label}
    </span>
  )
}

function DisasterReportForm() {
  const [incidentType, setIncidentType] = useState<string>("")
  const [severity, setSeverity] = useState<Severity>("medium")
  const [markerPosition, setMarkerPosition] = useState<MarkerPosition>(DEFAULT_POSITION)
  const [locationSelected, setLocationSelected] = useState(false)
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Report tracking state
  const [reports, setReports] = useState<Report[]>([])
  const [latestSubmittedReport, setLatestSubmittedReport] = useState<Report | null>(null)
  const [showStatusPanel, setShowStatusPanel] = useState(false)

  // District state for Firestore
  const [district, setDistrict] = useState<string>("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Process AI analysis for the report
  async function processAI(reportId: string, imageFile: File, desc: string) {
    try {
      const result = await analyzeReport(imageFile, desc)

      // Update Firestore document with AI results
      const reportRef = doc(db, "reports", reportId)
      await updateDoc(reportRef, {
        ai: result,
        aiStatus: "completed"
      })

      console.log(`AI processing completed for report: ${reportId}`)
    } catch (error) {
      console.error("AI processing failed:", error)

      // Mark AI as failed in Firestore
      try {
        const reportRef = doc(db, "reports", reportId)
        await updateDoc(reportRef, {
          aiStatus: "failed"
        })
      } catch (updateError) {
        console.error("Failed to update AI status:", updateError)
      }
    }
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    const map = L.map(mapRef.current, {
      center: [DEFAULT_POSITION.lat, DEFAULT_POSITION.lng],
      zoom: 13,
      zoomControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const marker = L.marker([DEFAULT_POSITION.lat, DEFAULT_POSITION.lng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map)

    // Handle marker drag
    marker.on("dragend", () => {
      const pos = marker.getLatLng()
      setMarkerPosition({ lat: pos.lat, lng: pos.lng })
      setLocationSelected(true)
      setErrors((prev) => ({ ...prev, location: undefined }))
    })

    // Handle map click to move marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      setMarkerPosition({ lat, lng })
      setLocationSelected(true)
      setErrors((prev) => ({ ...prev, location: undefined }))
    })

    leafletMapRef.current = map
    markerRef.current = marker
    setMapLoaded(true)

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Auto-approve latest report after 5-8 seconds
  useEffect(() => {
    if (!latestSubmittedReport || latestSubmittedReport.status !== "pending") return

    const delay = 5000 + Math.random() * 3000 // 5-8 seconds
    const timer = setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === latestSubmittedReport.id ? { ...r, status: "approved" as ReportStatus } : r
        )
      )
      setLatestSubmittedReport((prev) =>
        prev ? { ...prev, status: "approved" as ReportStatus } : null
      )
    }, delay)

    return () => clearTimeout(timer)
  }, [latestSubmittedReport])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files])
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newPreviews])
      setErrors((prev) => ({ ...prev, images: undefined }))
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideo(file)
    }
  }

  const removeVideo = () => {
    setVideo(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const detectedPosition = { lat, lng };

        setMarkerPosition(detectedPosition);
        setLocationSelected(true);
        setErrors((prev) => ({ ...prev, location: undefined }));

        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.flyTo([lat, lng], 15, {
            duration: 1,
          });
          markerRef.current.setLatLng([lat, lng]);
        }

        setIsDetectingLocation(false);
      },
      (error) => {
        console.log(error);
        alert("Unable to fetch location");
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
      }
    );
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!incidentType) {
      newErrors.incidentType = "Please select an incident type"
    }
    if (!locationSelected) {
      newErrors.location = "Please select a location on the map"
    }
    if (!description.trim()) {
      newErrors.description = "Please describe the incident"
    }
    if (images.length === 0) {
      newErrors.images = "Please upload at least one image"
    }
    if (!name.trim()) {
      newErrors.name = "Please enter your name"
    }
    if (!phone.trim()) {
      newErrors.phone = "Please enter your phone number"
    } else if (!/^[+]?[\d\s-]{10,}$/.test(phone.trim())) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      let imageUrl = ""

      // 1. Upload first image to Firebase Storage
      if (images.length > 0) {
        const imageFile = images[0]
        const storageRef = ref(storage, `reports/${Date.now()}_${imageFile.name}`)
        const snapshot = await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(snapshot.ref)
      }

      // 2. Save report to Firestore
      const reportData = {
        userId: auth.currentUser?.uid || null,
        description: description,
        imageUrl: imageUrl,
        district: district || "Unknown",
        incidentType: incidentType,
        severity: severity,
        location: locationSelected ? { lat: markerPosition.lat, lng: markerPosition.lng } : null,
        status: "pending",
        aiStatus: "processing",
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "reports"), reportData)

      // 3. Call AI processing
      if (images.length > 0) {
        processAI(docRef.id, images[0], description)
      }

      // Create new report for UI
      const newReport: Report = {
        id: docRef.id,
        incidentType,
        severity,
        location: locationSelected ? markerPosition : null,
        status: "pending",
        createdAt: new Date(),
      }

      // Add to reports list (latest first)
      setReports((prev) => [newReport, ...prev])
      setLatestSubmittedReport(newReport)
      setShowStatusPanel(true)

      // Reset form
      setIncidentType("")
      setSeverity("medium")
      setMarkerPosition(DEFAULT_POSITION)
      setLocationSelected(false)
      setDescription("")
      setImages([])
      setImagePreviews([])
      setVideo(null)
      setName("")
      setPhone("")
      setDistrict("")
      setErrors({})

      // Reset map position
      if (leafletMapRef.current && markerRef.current) {
        leafletMapRef.current.setView([DEFAULT_POSITION.lat, DEFAULT_POSITION.lng], 13)
        markerRef.current.setLatLng([DEFAULT_POSITION.lat, DEFAULT_POSITION.lng])
      }
    } catch (error: any) {
      console.error("Submit error:", error)
      setSubmitError(error.message || "Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {/* Main Form Card */}
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Report an Incident</CardTitle>
          <CardDescription className="text-base">
            Help authorities respond quickly
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/* Incident Type */}
              <Field data-invalid={!!errors.incidentType}>
                <FieldLabel>
                  Incident Type <span className="text-red-500">*</span>
                </FieldLabel>
                <Select value={incidentType} onValueChange={(value) => {
                  setIncidentType(value)
                  setErrors((prev) => ({ ...prev, incidentType: undefined }))
                }}>
                  <SelectTrigger 
                    className={cn(
                      "w-full transition-all duration-200",
                      errors.incidentType && "border-red-500 ring-2 ring-red-100"
                    )}
                  >
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "-").replace("/", "-")}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.incidentType && <FieldError>{errors.incidentType}</FieldError>}
              </Field>

              {/* Severity Selector */}
              <Field>
                <FieldLabel>
                  Severity Level <span className="text-red-500">*</span>
                </FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSeverity("high")}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                      severity === "high"
                        ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-200"
                        : "border-red-200 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100 hover:shadow-md"
                    )}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("medium")}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                      severity === "medium"
                        ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-200"
                        : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100 hover:shadow-md"
                    )}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity("low")}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                      severity === "low"
                        ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-200"
                        : "border-green-200 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100 hover:shadow-md"
                    )}
                  >
                    Low
                  </button>
                </div>
              </Field>

              {/* District Select */}
              <Field>
                <FieldLabel>
                  District <span className="text-red-500">*</span>
                </FieldLabel>
                <Select value={district} onValueChange={(value) => {
                  setDistrict(value)
                }}>
                  <SelectTrigger className="w-full transition-all duration-200">
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianDistricts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Interactive Map Section */}
              <Field data-invalid={!!errors.location}>
                <FieldLabel>
                  Select Location <span className="text-red-500">*</span>
                </FieldLabel>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 transition-all duration-200",
                    locationSelected ? "border-green-400" : "border-muted-foreground/25",
                    errors.location && "border-red-400 ring-2 ring-red-100"
                  )}
                >
                  {/* Map Container */}
                  <div 
                    ref={mapRef} 
                    className="h-[280px] w-full bg-muted/30"
                    style={{ zIndex: 1 }}
                  />
                  
                  {/* Map Loading Overlay */}
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-8 animate-spin rounded-full border-4 border-muted-foreground/25 border-t-blue-500" />
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                      </div>
                    </div>
                  )}

                  {/* Location Info Bar */}
                  <div className="flex items-center justify-between border-t bg-background/95 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className={cn(
                        "size-4 transition-colors",
                        locationSelected ? "text-green-600" : "text-muted-foreground"
                      )} />
                      {locationSelected ? (
                        <span className="text-sm">
                          <span className="font-medium text-green-700">Location set: </span>
                          <span className="text-muted-foreground">
                            {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Click on map or detect your location
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLocation}
                      disabled={isDetectingLocation}
                      className="transition-all duration-200 hover:shadow-sm"
                    >
                      {isDetectingLocation ? (
                        <>
                          <span className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Crosshair className="mr-2 size-3" />
                          Detect Location
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {errors.location && <FieldError>{errors.location}</FieldError>}
              </Field>

              {/* Description */}
              <Field data-invalid={!!errors.description}>
                <FieldLabel>
                  Description <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  placeholder="Describe the incident in detail - what happened, current situation, any immediate dangers..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setErrors((prev) => ({ ...prev, description: undefined }))
                  }}
                  className={cn(
                    "min-h-[120px] resize-none transition-all duration-200",
                    errors.description && "border-red-500 ring-2 ring-red-100"
                  )}
                />
                {errors.description && <FieldError>{errors.description}</FieldError>}
              </Field>

              {/* Image Upload */}
              <Field data-invalid={!!errors.images}>
                <FieldLabel>
                  Upload Images <span className="text-red-500">*</span>
                </FieldLabel>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className={cn(
                    "flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm",
                    errors.images ? "border-red-400 bg-red-50 ring-2 ring-red-100" : "border-muted-foreground/25"
                  )}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <ImageIcon className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Click to upload images</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                {/* Image Preview Grid */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {imagePreviews.map((preview, index) => (
                      <div 
                        key={index} 
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index)
                          }}
                          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-all duration-200 hover:bg-red-600 group-hover:opacity-100"
                        >
                          <X className="size-3.5" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-xs text-white">
                            {images[index]?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.images && <FieldError>{errors.images}</FieldError>}
              </Field>

              {/* Video Upload (Optional) */}
              <Field>
                <FieldLabel>
                  Upload Video <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                {video ? (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 shadow-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                        <Video className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{video.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(video.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={removeVideo}
                      className="transition-colors hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm"
                  >
                    <Upload className="size-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload video</span>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </Field>

              {/* Contact Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.name}>
                  <FieldLabel>
                    Name <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setErrors((prev) => ({ ...prev, name: undefined }))
                    }}
                    className={cn(
                      "transition-all duration-200",
                      errors.name && "border-red-500 ring-2 ring-red-100"
                    )}
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.phone}>
                  <FieldLabel>
                    Phone <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setErrors((prev) => ({ ...prev, phone: undefined }))
                    }}
                    className={cn(
                      "transition-all duration-200",
                      errors.phone && "border-red-500 ring-2 ring-red-100"
                    )}
                  />
                  {errors.phone && <FieldError>{errors.phone}</FieldError>}
                </Field>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full bg-blue-600 text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting Report...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Submission Status Panel */}
      {showStatusPanel && latestSubmittedReport && (
        <Card className="w-full animate-in fade-in slide-in-from-bottom-4 rounded-xl shadow-lg duration-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Report Submitted Successfully</CardTitle>
                <CardDescription>Your report is being processed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 rounded-lg bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Incident Type</span>
                <span className="text-sm font-medium">
                  {incidentTypeLabels[latestSubmittedReport.incidentType] || latestSubmittedReport.incidentType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severity Level</span>
                <span className={cn(
                  "text-sm font-medium capitalize",
                  latestSubmittedReport.severity === "high" && "text-red-600",
                  latestSubmittedReport.severity === "medium" && "text-amber-600",
                  latestSubmittedReport.severity === "low" && "text-green-600"
                )}>
                  {latestSubmittedReport.severity}
                </span>
              </div>
              {latestSubmittedReport.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm font-medium">
                    {latestSubmittedReport.location.lat.toFixed(4)}, {latestSubmittedReport.location.lng.toFixed(4)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={latestSubmittedReport.status} />
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {latestSubmittedReport.status === "pending" 
                ? "Your report is under review by authorities."
                : latestSubmittedReport.status === "approved"
                ? "Your report has been verified and authorities have been notified."
                : "Your report could not be verified. Please try again."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      {reports.length > 0 && (
        <Card className="w-full rounded-xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Reports</CardTitle>
            <CardDescription>Track the status of your submitted reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border bg-background p-4 transition-all duration-200 hover:shadow-sm",
                    latestSubmittedReport?.id === report.id && "ring-2 ring-blue-200"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {incidentTypeLabels[report.incidentType] || report.incidentType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DisasterReportForm
