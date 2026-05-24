import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Search, Info, HelpCircle } from 'lucide-react'

const CATEGORIES = [
  { id: 'all', name: 'All Services', nameHindi: 'सभी सेवाएं', icon: '📋', color: 'bg-gray-100 text-gray-700' },
  { id: 'identity', name: 'Identity', nameHindi: 'पहचान पत्र', icon: '🆔', color: 'bg-blue-100 text-blue-800' },
  { id: 'income', name: 'Income / Taxes', nameHindi: 'आय / टैक्स', icon: '💰', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'ration', name: 'Ration / Food', nameHindi: 'राशन / राशन कार्ड', icon: '🌾', color: 'bg-amber-100 text-amber-800' },
  { id: 'welfare', name: 'Welfare Schemes', nameHindi: 'सरकारी योजनाएं', icon: '⛺', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'other', name: 'Others', nameHindi: 'अन्य सेवाएं', icon: '🚗', color: 'bg-red-100 text-red-800' }
]

const FormGuide = () => {
  const [guides, setGuides] = useState([])
  const [filteredGuides, setFilteredGuides] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()
  
  const searchTimeoutRef = useRef(null)

  // Fetch initial guide list on mount
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await api.get('/form-guide')
        setGuides(response.data)
        setFilteredGuides(response.data)
      } catch (err) {
        console.error('Error fetching guides:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGuides()
  }, [])

  // Local filtering based on category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredGuides(guides)
    } else {
      setFilteredGuides(guides.filter(g => g.category === selectedCategory))
    }
  }, [selectedCategory, guides])

  // Debounced search querying
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query.trim()) {
      setFilteredGuides(selectedCategory === 'all' ? guides : guides.filter(g => g.category === selectedCategory))
      setSearching(false)
      return
    }

    setSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.get(`/form-guide/search?q=${encodeURIComponent(query)}`)
        if (response.data && response.data.id) {
          // If we found an exact/closest match via search endpoint
          setFilteredGuides([response.data])
        } else {
          setFilteredGuides([])
        }
      } catch (err) {
        console.error('Search error:', err)
        setFilteredGuides([])
      } finally {
        setSearching(false)
      }
    }, 500)
  }

  return (
    <div className="p-4 space-y-6">
      
      {/* Search Bar section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-jan-green-dk font-mukta leading-none">
          Sarkari Form Guide <span className="text-base font-normal text-jan-muted block">सरकारी फॉर्म गाइड</span>
        </h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Kaun sa form banvana hai? (e.g. ration card)"
            className="w-full pl-10 pr-10 py-3 border border-jan-border rounded-2xl focus:outline-none focus:border-jan-green text-sm shadow-sm"
          />
          <Search className="absolute left-3.5 top-3.5 text-jan-muted" size={18} />
          {searching && (
            <div className="absolute right-3.5 top-3.5 w-5 h-5 border-2 border-jan-green border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </div>

      {/* Category Tabs list */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-jan-muted uppercase tracking-wider">Categories</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id)
                setSearchQuery('')
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-jan-green text-white border-jan-green shadow-sm'
                  : 'bg-white text-jan-text border-jan-border hover:border-jan-green'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.nameHindi}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Guides feed */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-jan-muted uppercase tracking-wider">Guides List</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white p-4 rounded-2xl border border-jan-border animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-jan-border p-6 space-y-2">
            <HelpCircle size={40} className="mx-auto text-jan-muted" />
            <p className="font-bold text-jan-green-dk">Guide nahi mila</p>
            <p className="text-xs text-jan-muted">Apne sawal ko kisi dusre naam se likhein ya JanBot AI se madad lein.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredGuides.map(guide => {
              const categoryObj = CATEGORIES.find(c => c.id === guide.category)
              return (
                <Link
                  key={guide.id}
                  to={`/forms/${guide.id}`}
                  className="bg-white hover:bg-jan-surface p-4 rounded-2xl border border-jan-border flex items-center justify-between shadow-sm hover:border-jan-green transition-all transform active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-jan-green-lt rounded-xl">
                      {guide.categoryIcon || '📄'}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-jan-green-dk leading-tight font-mukta">
                        {guide.nameHindi}
                      </h3>
                      <p className="text-xs text-jan-muted font-medium">{guide.name}</p>
                    </div>
                  </div>
                  
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${categoryObj?.color || 'bg-gray-100'}`}>
                    {categoryObj?.nameHindi || 'Service'}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

export default FormGuide
export { CATEGORIES }
