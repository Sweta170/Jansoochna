import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-jan-surface px-6 text-center max-w-md mx-auto shadow-2xl border-x border-jan-border">
      <div className="text-7xl mb-4">🔍</div>
      <h1 className="text-3xl font-extrabold text-jan-green-dk font-mukta mb-2">
        Page Nahi Mila (404)
      </h1>
      <p className="text-sm text-jan-muted leading-relaxed mb-8">
        Maaf kijiye, jis page par aap jaane ki koshish kar rahe hain woh abhi available nahi hai. 
        Kripya check karein ki URL sahi hai ya nahi.
      </p>

      <Link
        to="/app"
        className="flex items-center gap-2 bg-jan-green hover:bg-jan-green-dk text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all active:scale-95"
      >
        <Home size={18} />
        <span>Ghar (Board) par jayein</span>
      </Link>
    </div>
  )
}

export default NotFound
