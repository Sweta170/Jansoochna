import React, { Component } from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-jan-surface px-6 text-center max-w-md mx-auto shadow-2xl border-x border-jan-border">
          <AlertOctagon size={48} className="text-jan-red animate-bounce" />
          <h1 className="text-2xl font-extrabold text-jan-green-dk font-mukta mt-4 mb-2">
            Kuch Galat Ho Gaya!
          </h1>
          <p className="text-xs text-jan-muted leading-relaxed mb-6">
            Aapka device offline ho sakta hai ya page load karne mein koi internal error aayi hai.
            Kripya dobara try karein.
          </p>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 bg-jan-green hover:bg-jan-green-dk text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all active:scale-95 text-sm"
          >
            <RotateCcw size={16} />
            <span>Dobara load karein</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
