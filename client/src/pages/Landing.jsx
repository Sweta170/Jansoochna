import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

/* ======================================================
   JanSoochna — Animated Landing Page (React Component)
   "Warm Civic Monumentalism"
   ====================================================== */

const COLORS = {
  forest: '#0A3D24', jade: '#1D9E75', mint: '#5DC9A1', mintLt: '#E1F5EE',
  saffron: '#E07B2A', saffronLt: '#FDF0E6', turmeric: '#C9A227', crimson: '#C0392B',
  parchment: '#F5F0E8', paper: '#FDFAF4', ink: '#0D1B12', charcoal: '#2D3A32',
  slate: '#607068', cloud: '#E8EDEA',
}

/* ---- Diya SVG ---- */
const DiyaSVG = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <ellipse cx="30" cy="48" rx="14" ry="5" fill={COLORS.turmeric}/>
    <rect x="25" y="39" width="10" height="10" rx="2" fill={COLORS.turmeric}/>
    <path d="M30 10C30 10 23 22 23 29C23 33 26 37 30 37C34 37 37 33 37 29C37 22 30 10 30 10Z" fill={COLORS.saffron}/>
  </svg>
)

/* ---- useInView hook ---- */
function useInView(opts = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.unobserve(el) }
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px', ...opts })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

/* ---- Counter Animation ---- */
function useCounter(target, trigger, duration = 2200) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!trigger || started.current) return
    started.current = true
    const start = performance.now()
    const update = (time) => {
      const elapsed = time - start
      const p = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(eased * target))
      if (p < 1) requestAnimationFrame(update)
      else setVal(target)
    }
    requestAnimationFrame(update)
  }, [trigger, target])
  return val.toLocaleString('en-IN')
}

/* ====== PRELOADER ====== */
function Preloader({ onDone }) {
  const [phase, setPhase] = useState(0) // 0=show, 1=fade, 2=gone
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200)
    const t2 = setTimeout(() => { setPhase(2); onDone() }, 1700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  if (phase === 2) return null
  return (
    <div style={{
      position:'fixed',inset:0,zIndex:10000,background:COLORS.forest,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      transition:'opacity 0.5s ease', opacity: phase === 1 ? 0 : 1, pointerEvents: phase === 1 ? 'none' : 'auto'
    }}>
      <div style={{ animation: 'diyaIn 0.4s 0.1s ease forwards', opacity: 0 }}>
        <svg width={60} height={60} viewBox="0 0 60 60" fill="none">
          <ellipse cx="30" cy="48" rx="16" ry="6" fill={COLORS.turmeric}/>
          <rect x="24" y="38" width="12" height="12" rx="3" fill={COLORS.turmeric}/>
          <path d="M30 8C30 8 22 22 22 30C22 34.4 25.6 38 30 38C34.4 38 38 34.4 38 30C38 22 30 8 30 8Z"
            fill={COLORS.saffron} style={{ filter:`drop-shadow(0 0 14px rgba(224,123,42,0.6))`, animation:'flameFlicker 0.8s 0.3s ease-in-out infinite' }}/>
        </svg>
      </div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:36, color:'#fff',
        opacity:0, transform:'translateY(20px)', animation:'preloaderTextIn 0.5s 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}>
        JanSoochna
      </div>
      <div style={{ fontFamily:"'Mukta',sans-serif", fontWeight:700, fontSize:18, color:COLORS.saffron,
        opacity:0, animation:'fadeIn 0.4s 0.8s ease forwards', marginTop:4 }}>
        जन की आवाज़
      </div>
    </div>
  )
}

/* ====== NAVBAR ====== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > window.innerHeight * 0.7)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setMenuOpen(false) }
  return (
    <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo" onClick={() => scrollTo('hero')} style={{ cursor:'pointer' }}>
        <DiyaSVG size={28}/><span>JanSoochna</span>
      </div>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <a onClick={() => scrollTo('features')}>Features</a>
        <a onClick={() => scrollTo('how')}>कैसे काम करे</a>
        <a onClick={() => scrollTo('download')}>Download</a>
        <Link to="/signin">Citizen Login</Link>
        <a onClick={() => scrollTo('gov')}>Admin</a>
        <button className="nav-cta" onClick={() => scrollTo('download')}>Download App</button>
      </div>
      <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        <span/><span/><span/>
      </button>
    </nav>
  )
}

/* ====== HERO ====== */
function Hero({ loaded }) {
  const navigate = useNavigate()
  const [animate, setAnimate] = useState(false)
  useEffect(() => { if (loaded) setTimeout(() => setAnimate(true), 100) }, [loaded])
  const words = ['अपने','शहर','की']
  const words2 = ['आवाज़','बनो']
  const subtitle = 'Be the voice of your city'
  return (
    <section className="landing-hero" id="hero">
      <div className="hero-deco-circle"/>
      <div className="hero-deco-line"/>
      <div className="container hero-inner">
        <div className="hero-content">
          <h1 className="hero-headline">
            {words.map((w,i) => (
              <span className="word" key={i}><span className={`word-inner ${animate?'animate':''}`} style={{ animationDelay:`${i*130}ms` }}>{w}</span></span>
            ))}<br/>
            {words2.map((w,i) => (
              <span className="word" key={i+3}><span className={`word-inner ${animate?'animate':''}`} style={{ animationDelay:`${(i+3)*130}ms` }}>{w}</span></span>
            ))}
          </h1>
          <p className="hero-subtitle">
            <span className="word"><span className={`word-inner ${animate?'animate':''}`} style={{ animationDelay:'780ms' }}>{subtitle}</span></span>
          </p>
          <p className={`hero-tagline ${animate?'animate':''}`}>देश का पहला AI-powered नागरिक मंच — Report issues, get form guides, track your neta</p>
          <div className={`hero-ctas ${animate?'animate':''}`}>
            <button className="btn-primary" onClick={() => document.getElementById('download')?.scrollIntoView({behavior:'smooth'})}>App Download करें <span>→</span></button>
            <button className="btn-secondary" onClick={() => navigate('/signin')}>Citizen Login (Web) <span>➔</span></button>
            <button className="btn-secondary" onClick={() => document.getElementById('problems')?.scrollIntoView({behavior:'smooth'})}>और जानें ↓</button>
          </div>
        </div>
        <div className="hero-phone">
          <div className="phone-mockup">
            <div className="phone-notch"/>
            <div className="phone-screen" style={{ padding:14 }}>
              <div className="phone-card"><div className="phone-card-sm pc1"/><div className="phone-card-sm pc2"/></div>
              <div className="phone-card"><div className="phone-card-sm pc3"/><div className="phone-card-sm pc1"/></div>
              <div className="phone-map">
                <div className="phone-map-dot" style={{ top:'20%',left:'30%' }}/>
                <div className="phone-map-dot" style={{ top:'50%',left:'60%' }}/>
                <div className="phone-map-dot" style={{ top:'70%',left:'25%' }}/>
                <div className="phone-map-dot" style={{ top:'35%',left:'75%' }}/>
              </div>
              <div className="phone-btn">+ Issue Report करें</div>
            </div>
          </div>
        </div>
      </div>
      <Ticker/>
    </section>
  )
}

/* ====== TICKER ====== */
function Ticker() {
  const items = ['1,247 issues resolved this week','Ludhiana','Mumbai','Delhi','Patna','Pune','Jaipur','Chandigarh','28 states covered','50,000+ issues reported']
  const doubled = [...items, ...items]
  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((t,i) => <span className="ticker-item" key={i}><span className="ticker-dot"/>{t}</span>)}
      </div>
    </div>
  )
}

/* ====== PROBLEMS ====== */
function Problems() {
  const [ref, inView] = useInView({ threshold: 0.2 })
  const [ctaRef, ctaInView] = useInView()
  const problems = [
    { num:'01', text:'सड़क टूटी है, शिकायत करने की जगह नहीं।', en:'No place to report broken roads — WhatsApp forwards don\'t fix potholes.' },
    { num:'02', text:'सरकारी काम के लिए दलाल को पैसे देने पड़ते हैं।', en:'Have to pay middlemen for government paperwork that should be free.' },
    { num:'03', text:'नेता ने वादे किए, पर हिसाब कौन मांगेगा?', en:'Politicians made promises — but who\'s tracking accountability?' },
  ]
  return (
    <section className="problems-section" id="problems">
      <div className="container">
        <Reveal><h2 className="problems-headline">"Yeh toh aap bhi jaante hain..."</h2></Reveal>
        <div className="problem-cards" ref={ref}>
          {problems.map((p,i) => (
            <div key={i} className={`problem-card ${inView?'visible':''}`} style={{ transitionDelay:`${i*0.15}s` }}>
              <div className="problem-num">{p.num}</div>
              <p className="problem-text">{p.text}<br/><em style={{ color:'rgba(255,255,255,0.5)', fontSize:15 }}>{p.en}</em></p>
            </div>
          ))}
        </div>
        <p ref={ctaRef} className={`problems-cta ${ctaInView?'visible':''}`}>JanSoochna इन सबका हल है →</p>
      </div>
    </section>
  )
}

/* ====== REVEAL WRAPPER ====== */
function Reveal({ children, delay = 0 }) {
  const [ref, inView] = useInView()
  return <div ref={ref} className={`reveal ${inView?'revealed':''}`} style={{ transitionDelay:`${delay}s` }}>{children}</div>
}

/* ====== FEATURES ====== */
function Features() {
  const features = [
    { num:'01', title:'मोहल्ला बोर्ड', sub:'Your neighbourhood\'s real-time notice board', desc:'बिजली कटौती, सड़क बंद, बाज़ार की खबर — सब एक जगह। Real-time updates without WhatsApp forwards.',
      icon: <svg width={48} height={48} viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="32" rx="4" stroke={COLORS.jade} strokeWidth="2.5"/><circle cx="16" cy="18" r="3" fill={COLORS.saffron}/><circle cx="16" cy="30" r="3" fill={COLORS.jade}/><line x1="24" y1="18" x2="38" y2="18" stroke={COLORS.forest} strokeWidth="2" strokeLinecap="round"/><line x1="24" y1="30" x2="38" y2="30" stroke={COLORS.forest} strokeWidth="2" strokeLinecap="round"/></svg> },
    { num:'02', title:'सरकारी फॉर्म गाइड', sub:'GPS for government paperwork', desc:'जाति प्रमाण पत्र से लेकर राशन कार्ड तक — सही कागज़, सही दफ्तर, पहली बार में। दलाल की ज़रूरत नहीं।',
      icon: <svg width={48} height={48} viewBox="0 0 48 48" fill="none"><rect x="10" y="4" width="28" height="40" rx="3" stroke={COLORS.jade} strokeWidth="2.5"/><line x1="16" y1="14" x2="32" y2="14" stroke={COLORS.forest} strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="22" x2="28" y2="22" stroke={COLORS.slate} strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="30" x2="30" y2="30" stroke={COLORS.slate} strokeWidth="2" strokeLinecap="round"/></svg> },
    { num:'03', title:'JanBot — AI सहायक', sub:'Ask in Hindi, Punjabi, or English', desc:'बात करो Hindi में, जवाब मिलेगा instant। सरकारी योजनाएं, शिकायत दर्ज करना, बिल समझना — JanBot सब जानता है।',
      icon: <svg width={48} height={48} viewBox="0 0 48 48" fill="none"><path d="M8 34V18C8 14 11 11 15 11H33C37 11 40 14 40 18V28C40 32 37 35 33 35H18L12 41V35H15" stroke={COLORS.jade} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="23" r="2" fill={COLORS.saffron}/><circle cx="26" cy="23" r="2" fill={COLORS.saffron}/><circle cx="34" cy="23" r="2" fill={COLORS.saffron}/></svg> },
    { num:'04', title:'नेता का हिसाब', sub:'Politician accountability tracker', desc:'आपके वार्ड councillor की attendance, fund utilization, और वादे — सब public record में। Elections से पहले सच जानो।',
      icon: <svg width={48} height={48} viewBox="0 0 48 48" fill="none"><line x1="24" y1="8" x2="24" y2="40" stroke={COLORS.jade} strokeWidth="2.5" strokeLinecap="round"/><line x1="12" y1="24" x2="36" y2="24" stroke={COLORS.jade} strokeWidth="2.5" strokeLinecap="round"/><circle cx="16" cy="16" r="6" fill="none" stroke={COLORS.saffron} strokeWidth="2"/><circle cx="32" cy="32" r="6" fill="none" stroke={COLORS.forest} strokeWidth="2"/></svg> },
  ]
  return (
    <section className="features-section" id="features">
      <div className="container">
        <Reveal><p className="features-label">FEATURES — क्या करता है JanSoochna?</p></Reveal>
        <div className="feature-grid">
          {features.map((f,i) => (
            <Reveal key={i} delay={i*0.12}>
              <div className="feature-block">
                <div className="feature-num">{f.num}</div>
                {f.icon}
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-sub">{f.sub}</p>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ====== STATS ====== */
function Stats() {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const stats = [
    { target:28, suffix:'+', label:'States covered' },
    { target:50000, suffix:'+', label:'Issues reported' },
    { target:120000, suffix:'+', label:'Citizens registered' },
    { target:94, suffix:'%', label:'User satisfaction' },
  ]
  return (
    <section className="stats-section" id="stats" ref={ref}>
      <div className="container">
        <div className="stats-grid">
          {stats.map((s,i) => {
            const val = useCounter(s.target, inView)
            return (
              <Reveal key={i} delay={i*0.12}>
                <div className="stat-item">
                  <div className="stat-number">{val}</div>
                  <span className={`stat-suffix ${inView?'show':''}`}>{s.suffix}</span>
                  <div className="stat-label">{s.label}</div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ====== HOW IT WORKS ====== */
function HowItWorks() {
  const [ref, inView] = useInView()
  const steps = [
    { num:'1', cls:'step-circle-1', title:'App Download करें', sub:'Android और iOS — bilkul free',
      icon: <svg width={64} height={64} viewBox="0 0 64 64" fill="none"><rect x="18" y="6" width="28" height="52" rx="6" stroke={COLORS.jade} strokeWidth="2.5"/><path d="M32 44L26 38M32 44L38 38M32 44V28" stroke={COLORS.saffron} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { num:'2', cls:'step-circle-2', title:'Email se Register करें', sub:'30 second mein account tayyar',
      icon: <svg width={64} height={64} viewBox="0 0 64 64" fill="none"><rect x="10" y="16" width="44" height="32" rx="4" stroke={COLORS.saffron} strokeWidth="2.5"/><path d="M10 24L32 38L54 24" stroke={COLORS.saffron} strokeWidth="2.5" strokeLinecap="round"/></svg> },
    { num:'3', cls:'step-circle-3', title:'Apni Awaaz Uthao', sub:'Issue report karo, Form guide lo, JanBot se poocho',
      icon: <svg width={64} height={64} viewBox="0 0 64 64" fill="none"><path d="M14 40L14 24C14 20 17 17 21 17H32L36 12H44C48 12 51 15 51 19V36C51 40 48 43 44 43H24L18 49V43" stroke={COLORS.forest} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="28" cy="30" r="2.5" fill={COLORS.jade}/><circle cx="36" cy="30" r="2.5" fill={COLORS.jade}/><circle cx="44" cy="30" r="2.5" fill={COLORS.jade}/></svg> },
  ]
  return (
    <section className="how-section" id="how">
      <div className="container">
        <Reveal><h2 className="how-headline">3 कदम में शुरू करें</h2></Reveal>
        <div className="how-steps" ref={ref}>
          {steps.map((s,i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className={`connector ${inView?'visible':''}`}/>}
              <Reveal delay={i*0.2}>
                <div className="how-step">
                  <div className={`step-circle ${s.cls}`}>{s.num}</div>
                  <div className="step-icon">{s.icon}</div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-sub">{s.sub}</p>
                </div>
              </Reveal>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ====== TESTIMONIALS ====== */
function Testimonials() {
  const [current, setCurrent] = useState(0)
  const testimonials = [
    { quote:'JanSoochna ki wajah se mera ration card 15 din mein ban gaya. Pehle dalal ko ₹500 dene padte the. Ab sab free aur transparent hai.', name:'Ramesh Kumar', loc:'Ward 42, Ludhiana' },
    { quote:'Hamari gali mein naali band thi 6 mahine se. JanSoochna pe report kiya, 10 din mein saaf ho gayi. Pehle kisi ki sunwai nahi hoti thi.', name:'Sita Devi', loc:'Mohalla 3, Patna' },
    { quote:'JanBot ne mujhe bataya ki income certificate ke liye kya documents chahiye. Ek hi baar mein kaam ho gaya — kisi dalal ki zaroorat nahi padi.', name:'Priya Sharma', loc:'Sector 15, Chandigarh' },
  ]
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c+1) % testimonials.length), 4500)
    return () => clearInterval(t)
  }, [])
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <Reveal><h2 className="testimonials-headline">Logon ne kya kaha?</h2></Reveal>
        <div className="testimonial-wrapper">
          {testimonials.map((t,i) => (
            <div key={i} className={`testimonial-card ${i===current?'active':''}`}>
              <div className="test-quote-mark">"</div>
              <p className="test-quote">{t.quote}</p>
              <div>
                <div className="test-author">{t.name}</div>
                <div className="test-location">{t.loc}</div>
                <div className="test-stars">★★★★★</div>
              </div>
            </div>
          ))}
        </div>
        <div className="test-dots">
          {testimonials.map((_,i) => <div key={i} className={`test-dot ${i===current?'active':''}`} onClick={() => setCurrent(i)}/>)}
        </div>
      </div>
    </section>
  )
}

/* ====== DOWNLOAD ====== */
function Download() {
  return (
    <section className="download-section" id="download">
      <div className="download-deco"/>
      <div className="container download-inner">
        <Reveal>
          <div className="download-text">
            <h2 className="download-title">अभी Download करें</h2>
            <p className="download-sub">Android और iOS दोनों पर available — बिल्कुल free</p>
            <div className="store-buttons">
              <button className="store-btn">
                <svg viewBox="0 0 24 24" fill="white" width={28} height={28}><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.707l2.302 1.307-2.302 1.307-1.838-1.307 1.838-1.307zM5.864 3.469L16.8 9.802l-2.302 2.302-8.634-8.635z"/></svg>
                <div><span className="store-btn-label">GET IT ON</span><span className="store-btn-name">Google Play</span></div>
              </button>
              <button className="store-btn">
                <svg viewBox="0 0 24 24" fill="white" width={28} height={28}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div><span className="store-btn-label">Download on the</span><span className="store-btn-name">App Store</span></div>
              </button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="download-phone">
            <div className="phone-mockup" style={{ width:260 }}>
              <div className="phone-notch"/>
              <div className="phone-screen" style={{ padding:14 }}>
                <div className="phone-card"><div className="phone-card-sm pc1"/><div className="phone-card-sm pc2"/><div className="phone-card-sm pc3"/></div>
                <div className="phone-card"><div className="phone-card-sm pc3"/><div className="phone-card-sm pc1"/></div>
                <div className="phone-map">
                  <div className="phone-map-dot" style={{ top:'25%',left:'35%' }}/>
                  <div className="phone-map-dot" style={{ top:'55%',left:'65%' }}/>
                  <div className="phone-map-dot" style={{ top:'70%',left:'20%' }}/>
                </div>
                <div className="phone-btn">🤖 JanBot से पूछें</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ====== FOR GOVERNMENT ====== */
function Government() {
  return (
    <section className="gov-section" id="gov">
      <div className="container gov-inner">
        <Reveal>
          <div className="gov-text">
            <h2 className="gov-headline">Sarkar ke liye bhi</h2>
            <p className="gov-sub">Admin Dashboard — real-time civic intelligence</p>
            <p style={{ color:'rgba(255,255,255,0.65)',fontSize:16,marginBottom:28,lineHeight:1.7 }}>
              District admins, state officials, and municipal bodies get a powerful dashboard to:
            </p>
            <ul className="gov-list">
              <li><span className="gov-check">✅</span>Track and resolve citizen issues in real-time</li>
              <li><span className="gov-check">✅</span>View issue heatmaps across districts</li>
              <li><span className="gov-check">✅</span>Assign issues to officers with accountability</li>
              <li><span className="gov-check">✅</span>Generate reports and analytics</li>
            </ul>
            <button className="gov-cta" onClick={() => window.location.href = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'}>Admin Access Request करें →</button>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="gov-dashboard">
            <div className="dash-card">
              <div className="dash-header">
                <span>JanSoochna Admin</span>
                <div className="dash-header-dots">
                  <span style={{ width:8,height:8,borderRadius:'50%',background:COLORS.crimson,display:'inline-block' }}/>
                  <span style={{ width:8,height:8,borderRadius:'50%',background:COLORS.turmeric,display:'inline-block' }}/>
                  <span style={{ width:8,height:8,borderRadius:'50%',background:COLORS.jade,display:'inline-block' }}/>
                </div>
              </div>
              <div className="dash-stats-row">
                <div className="dash-stat"><div className="dash-stat-num">1,247</div><div className="dash-stat-lbl">Open Issues</div></div>
                <div className="dash-stat"><div className="dash-stat-num">89%</div><div className="dash-stat-lbl">Resolved</div></div>
                <div className="dash-stat"><div className="dash-stat-num">42</div><div className="dash-stat-lbl">Officers</div></div>
              </div>
              <div className="dash-bars">
                {[45,70,55,85,60,40,75].map((h,i) => <div key={i} className="dash-bar" style={{ height:`${h}%` }}/>)}
              </div>
              <div className="dash-table">
                <div className="dash-table-row"><div className="dash-table-status" style={{ background:COLORS.mint }}/><span style={{ flex:1 }}>Broken road — Ward 12</span><span style={{ color:COLORS.mint,fontSize:11 }}>Resolved</span></div>
                <div className="dash-table-row"><div className="dash-table-status" style={{ background:COLORS.saffron }}/><span style={{ flex:1 }}>Water supply — Mohalla 6</span><span style={{ color:COLORS.saffron,fontSize:11 }}>In Progress</span></div>
                <div className="dash-table-row"><div className="dash-table-status" style={{ background:COLORS.crimson }}/><span style={{ flex:1 }}>Garbage dump — Sector 8</span><span style={{ color:COLORS.crimson,fontSize:11 }}>Pending</span></div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ====== FOOTER ====== */
function Footer() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="f-logo"><DiyaSVG size={28}/><span>JanSoochna</span></div>
            <p className="f-tagline">जन की आवाज़</p>
            <p className="f-desc">भारत का नागरिक मंच — built with ❤️ for every Indian</p>
          </div>
          <div className="footer-links">
            <h4>Links</h4>
            <a href="#">होम</a><a href="#features">Features</a><a href="#how">Form Guide</a>
            <a href="#download">Download App</a>
            <Link to="/signin">Citizen Login (Web)</Link>
            <a href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'}>Admin Login</a>
            <a href="#">Privacy Policy</a><a href="#">Terms of Service</a>
          </div>
          <div className="footer-contact">
            <h4>संपर्क</h4>
            <p>सवाल है? लिखें:</p>
            <p><a href="mailto:hello@jansoochna.in" style={{ color:COLORS.jade }}>hello@jansoochna.in</a></p>
            <p style={{ marginTop:24,fontSize:20 }}>Made in India 🇮🇳</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom"><div className="container">© 2025 JanSoochna. Sab haq surakshit hain.</div></div>
    </footer>
  )
}

/* ====== MAIN LANDING PAGE ====== */
export default function Landing() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Enable scroll on landing page mount
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    
    // Allow root element to expand and scroll normally
    const rootEl = document.getElementById('root')
    if (rootEl) {
      rootEl.style.overflow = 'visible'
      rootEl.style.height = 'auto'
    }
    
    return () => {
      // Restore default overflow styles when navigating away
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      if (rootEl) {
        rootEl.style.overflow = ''
        rootEl.style.height = ''
      }
    }
  }, [])

  return (
    <>
      <Preloader onDone={() => setLoaded(true)}/>
      <Navbar/>
      <Hero loaded={loaded}/>
      <Problems/>
      <Features/>
      <Stats/>
      <HowItWorks/>
      <Testimonials/>
      <Download/>
      <Government/>
      <Footer/>
    </>
  )
}
