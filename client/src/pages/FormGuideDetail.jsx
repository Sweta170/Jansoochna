import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import FormGuideWizard from '../components/FormGuideWizard'
import { ArrowLeft } from 'lucide-react'

const FormGuideDetail = () => {
  const { id } = useParams()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await api.get(`/form-guide/${id}`)
        setEntry(response.data)
      } catch (err) {
        console.error(err)
        setError('Guide data load karne mein problem hui. Kripya check karein.')
      } finally {
        setLoading(false)
      }
    }
    fetchEntry()
  }, [id])

  return (
    <div className="p-4 space-y-4">
      {/* Header Back button */}
      <div className="flex items-center gap-2">
        <Link
          to="/forms"
          className="p-2 hover:bg-gray-100 rounded-full text-jan-muted hover:text-jan-green-dk transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-xs font-bold text-jan-muted uppercase tracking-wider">
          Back to Guide List
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-jan-border p-6 shadow-sm animate-pulse space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-jan-red-lt text-jan-red p-4 rounded-2xl border border-jan-red border-opacity-20 text-center text-sm font-semibold">
          {error}
        </div>
      ) : entry ? (
        <FormGuideWizard entry={entry} />
      ) : null}
    </div>
  )
}

export default FormGuideDetail
