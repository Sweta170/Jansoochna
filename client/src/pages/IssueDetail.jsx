import React, { useState, useEffect } from 'react'
import { useParams as getParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { timeAgoHindi } from '../utils/timeAgoHindi'
import SewakBadge from '../components/SewakBadge'
import { ArrowLeft, MapPin, ThumbsUp, Calendar, FileText, Share2, HelpCircle, Loader2 } from 'lucide-react'
import { CATEGORY_TAGS, STATUS_TAGS } from '../components/IssueCard'

const IssueDetail = () => {
  const { id } = getParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [voting, setVoting] = useState(false)
  const [downloadingPetition, setDownloadingPetition] = useState(false)

  const fetchIssueDetail = async () => {
    try {
      const response = await api.get(`/issues/${id}`)
      setIssue(response.data)
    } catch (err) {
      console.error(err)
      setError('Issue data load karne mein problem aayi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssueDetail()
  }, [id])

  const handleVote = async () => {
    if (voting || !issue) return

    // Optimistic UI update
    const previousVoteCount = issue.voteCount
    const previousHasVoted = issue.userHasVoted

    const nextHasVoted = !issue.userHasVoted
    const nextVoteCount = nextHasVoted ? issue.voteCount + 1 : Math.max(0, issue.voteCount - 1)

    setIssue(prev => prev ? { ...prev, voteCount: nextVoteCount, userHasVoted: nextHasVoted } : null)
    setVoting(true)

    try {
      const response = await api.post(`/issues/${issue._id}/vote`)
      setIssue(prev => prev ? { ...prev, voteCount: response.data.voteCount, userHasVoted: response.data.userHasVoted } : null)
    } catch (err) {
      console.error(err)
      setIssue(prev => prev ? { ...prev, voteCount: previousVoteCount, userHasVoted: previousHasVoted } : null)
    } finally {
      setVoting(false)
    }
  }

  const handlePetitionGenerate = async () => {
    if (!issue || downloadingPetition) return
    
    setDownloadingPetition(true)
    try {
      const response = await api.get(`/petition/${issue._id}`)
      if (response.data.petitionUrl) {
        window.open(response.data.petitionUrl, '_blank')
        // Refresh details to load saved URL
        fetchIssueDetail()
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Petition file generate karne mein error aayi.')
    } finally {
      setDownloadingPetition(false)
    }
  }

  const handleSendToCouncillor = () => {
    if (!issue || !issue.petitionUrl) return

    const msg = `Namaskar Councillor ji,\n\n` +
      `Humare mohalle mein ek samasya hai: *${issue.title}*.\n` +
      `Is samasya se pareshan hokar hum 50+ nagarikon ne signature petition generate kiya hai.\n\n` +
      `Kripya is petition patra ko dekh kar is par karyavahi karein:\n` +
      `${issue.petitionUrl}\n\n` +
      `JanSoochna Portal.`

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`)
  }

  if (loading) {
    return (
      <div className="p-4 flex flex-col justify-center items-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-jan-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-jan-muted mt-2 font-medium">Issue details loading...</p>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="p-4 space-y-4">
        <RouterLink to="/app/issues" className="flex items-center gap-1 text-xs text-jan-green font-bold">
          <ArrowLeft size={16} /> <span>Back to Issues</span>
        </RouterLink>
        <div className="bg-jan-red-lt text-jan-red p-4 rounded-xl border border-jan-red border-opacity-20 text-center text-sm font-semibold">
          {error || 'Issue not found'}
        </div>
      </div>
    )
  }

  const catConfig = CATEGORY_TAGS[issue.category] || CATEGORY_TAGS.other
  const statusConfig = STATUS_TAGS[issue.status] || STATUS_TAGS.open

  return (
    <div className="p-4 space-y-4">
      {/* Header back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/issues')}
          className="flex items-center gap-1 text-xs text-jan-muted hover:text-jan-green font-bold uppercase transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Issues Board</span>
        </button>

        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${statusConfig.color}`}>
          Status: {statusConfig.label}
        </span>
      </div>

      {/* Main Card details */}
      <div className="bg-white rounded-3xl border border-jan-border p-5 shadow-sm space-y-4">
        <div className="space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catConfig.color}`}>
            {catConfig.label}
          </span>
          <h1 className="text-xl font-bold text-jan-green-dk font-mukta leading-snug">
            {issue.title}
          </h1>
        </div>

        {issue.photoUrl && (
          <div className="w-full h-48 rounded-2xl overflow-hidden border border-jan-border bg-jan-surface shadow-sm">
            <img src={issue.photoUrl} alt={issue.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-xs font-bold text-jan-muted uppercase">Description (सविस्तार जानकारी):</h3>
          <p className="text-sm text-jan-text leading-relaxed font-normal whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>

        {/* Location metadata */}
        <div className="bg-jan-surface p-3.5 rounded-2xl border border-jan-border space-y-2 text-xs text-jan-muted font-medium">
          <div className="flex items-start gap-1.5">
            <MapPin size={14} className="text-jan-green mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-jan-text block">Location address:</span>
              <span className="leading-tight text-jan-muted">{issue.location?.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-jan-border border-dashed">
            <Calendar size={14} />
            <span>Report date: {new Date(issue.createdAt).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Action votes */}
        <div className="flex items-center justify-between pt-3 border-t border-jan-border border-dashed">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-jan-muted uppercase leading-none">Citizens Support</span>
            <span className="text-xl font-extrabold text-jan-green-dk font-mukta">{issue.voteCount} Votes</span>
          </div>

          <button
            onClick={handleVote}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-xs font-bold vote-pop ${
              issue.userHasVoted
                ? 'bg-jan-green text-white border-jan-green shadow-md'
                : 'bg-white text-jan-green border-jan-green hover:bg-jan-green-lt'
            }`}
          >
            <ThumbsUp size={14} strokeWidth={issue.userHasVoted ? 3 : 2} />
            <span>{issue.userHasVoted ? 'Maine bhi support kiya' : 'Main bhi support karu'}</span>
          </button>
        </div>

        {/* Author box */}
        <div className="flex items-center gap-1.5 pt-2 text-[10px] text-jan-muted font-semibold">
          <span>Reported by:</span>
          <span className="text-jan-text">{issue.author?.name || 'Nagarik'}</span>
          {issue.author?.badge && <SewakBadge badge={issue.author.badge} />}
        </div>
      </div>

      {/* Petition section for 50+ votes */}
      {issue.voteCount >= 50 && (
        <div className="bg-jan-amber-lt border border-jan-amber border-opacity-20 p-4 rounded-3xl space-y-3">
          <div className="flex items-start gap-2 text-jan-amber">
            <Sparkles size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm font-mukta text-jan-text">Signature Petition Ready!</h3>
              <p className="text-xs text-jan-muted leading-relaxed">
                50 se adhik nagarikon ne is samasya ka samarthan kiya hai. Ek dynamic legal petition generation system ready hai.
              </p>
            </div>
          </div>

          {issue.petitionUrl ? (
            <div className="grid gap-2 pt-1">
              <a
                href={issue.petitionUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-jan-green text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow transition-all active:scale-95"
              >
                <FileText size={14} />
                <span>Petition PDF Download Karein</span>
              </a>
              <button
                onClick={handleSendToCouncillor}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow transition-all active:scale-95"
              >
                <Share2 size={14} />
                <span>WhatsApp par councillor ko bhejein</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handlePetitionGenerate}
              disabled={downloadingPetition}
              className="w-full bg-jan-green hover:bg-jan-green-dk text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow transition-all active:scale-95 disabled:opacity-50"
            >
              {downloadingPetition ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Petition compile ho raha hai...</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span>Compile Petition PDF (Signatures verify)</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

    </div>
  )
}

export default IssueDetail
