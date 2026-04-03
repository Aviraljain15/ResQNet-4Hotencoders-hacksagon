import { useState, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Header } from "@/components/dashboard/Header"
import { LeftSidebar } from "@/components/dashboard/LeftSidebar"
import { MapSection } from "@/components/dashboard/MapSection"
import { BottomPanels } from "@/components/dashboard/BottomPanels"
import { RightSidebar } from "@/components/dashboard/RightSidebar"
import { Spinner } from "@/components/ui/spinner"
import { auth, db } from "../lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from "firebase/firestore"

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [reports, setReports] = useState([])
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  // Real-time listener for reports filtered by user's district
  useEffect(() => {
    if (!userData?.district) return

    const reportsRef = collection(db, "reports")
    const q = query(
      reportsRef,
      where("district", "==", userData.district),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setReports(fetchedReports)
    }, (error) => {
      console.error("Error fetching reports:", error)
    })

    return () => unsubscribe()
  }, [userData?.district])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser(firebaseUser)

        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUser(null)
        setUserData(null)
        navigate("/login")
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1C1B1B]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col text-sm text-gray-300">
      <Header
        onMenuClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        onAlertsClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        userData={userData}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex overflow-hidden relative">
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="fixed inset-0 bg-black/50 z-[1000] lg:hidden"
            onClick={() => {
              setLeftSidebarOpen(false)
              setRightSidebarOpen(false)
            }}
          />
        )}

        <div className={`
          fixed lg:relative inset-y-0 left-0 z-[1001]
          transform transition-transform duration-300 ease-in-out
          ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:block lg:z-auto
        `}>
          <LeftSidebar onClose={() => setLeftSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col border-r border-[#2A2A2A] overflow-hidden min-w-0">
          <MapSection />
          <BottomPanels />
        </div>

        <div className={`
          fixed lg:relative inset-y-0 right-0 z-[1001]
          transform transition-transform duration-300 ease-in-out
          ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          lg:block lg:z-auto
        `}>
          <RightSidebar onClose={() => setRightSidebarOpen(false)} reports={reports} />
        </div>
      </main>
    </div>
  )
}
