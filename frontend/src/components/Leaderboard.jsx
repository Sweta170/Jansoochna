import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star, Eye, ThumbsUp, FileText, ChevronRight, Activity, Zap, Shield, Heart } from 'lucide-react';
import api from '../services/api';

const ImpactDNACard = ({ icon: Icon, label, value, color }) => (
    <div style={{
        background: 'var(--surface-2)',
        padding: '0.75rem 1rem',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        border: '1px solid var(--border)',
        flex: 1,
        minWidth: '100px'
    }}>
        <div style={{ color }}>
            <Icon size={16} />
        </div>
        <div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
        </div>
    </div>
);

const Badge = ({ icon: Icon, color, label, tooltip }) => (
    <div
        title={tooltip}
        style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'help',
            border: `1px solid ${color}30`,
            transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.background = `${color}25` }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = `${color}15` }}
    >
        <Icon size={16} />
    </div>
);

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await api.get('gamification/leaderboard');
                setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-pulse" style={{ textAlign: 'center' }}>
                <Trophy size={48} color="#EAB308" style={{ margin: '0 auto 1.5rem' }} />
                <div style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Curating the Hall of Fame...</div>
            </div>
        </div>
    );

    const top3 = users.slice(0, 3);
    const others = users.slice(3);
    const me = users.find(u => u.id === currentUser?.id);
    const myRank = users.findIndex(u => u.id === currentUser?.id) + 1;

    // Badge Logic (Mock for demonstration)
    const getBadges = (u) => {
        const badges = [];
        if (u.report_count > 5) badges.push({ icon: Shield, color: '#3B82F6', label: 'Guardian', tip: 'Filed 5+ Reports' });
        if (u.verification_count > 2) badges.push({ icon: Eye, color: '#10B981', label: 'Eagle Eye', tip: 'Verified 2+ Fixes' });
        if (u.upvote_count > 10) badges.push({ icon: Heart, color: '#EF4444', label: 'Beloved', tip: '10+ Community Upvotes' });
        if (u.points > 100) badges.push({ icon: Zap, color: '#F59E0B', label: 'High Voltage', tip: 'Reached 100+ Points' });
        return badges;
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '6rem', maxWidth: '1100px', margin: '0 auto' }}>

            {/* 🌌 PRESTIGE HERO */}
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div className="badge-modern" style={{ marginBottom: '1.25rem' }}>
                    <span className="dot" />
                    BATTLE OF IMPACT • SEASON_6
                </div>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.25rem',
                    fontWeight: 1000
                }}>
                    Citizen <span className="tricolor-text">Leaderboard</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0.75rem auto 0', lineHeight: 1.5 }}>
                    Real impact isn't invisible. We celebrate the professionals driving the digital evolution of Bharat's smart infrastructure.
                </p>
            </div>

            {/* 📊 PERSONAL ACTIVITY SUMMARY */}
            {me && (
                <div style={{
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                    borderRadius: '24px',
                    padding: '1.75rem',
                    color: 'white',
                    marginBottom: '3rem',
                    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6, marginBottom: '0.25rem' }}>Your Progress</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <h2 style={{ fontFamily: 'Outfit, sans-serif', margin: 0, fontSize: '2rem', fontWeight: 900 }}>Rank #{myRank}</h2>
                                    <div style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>{me.rank}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 1000, lineHeight: 1, color: 'var(--primary)' }}>{me.points}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.1em' }}>My Overall Score</div>
                            </div>
                        </div>

                        {/* Activity Breakdown */}
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <ImpactDNACard icon={FileText} label="Reports" value={me.report_count} color="#3B82F6" />
                            <ImpactDNACard icon={ThumbsUp} label="Upvotes" value={me.upvote_count} color="#EF4444" />
                            <ImpactDNACard icon={Eye} label="Verifications" value={me.verification_count} color="#10B981" />
                            <div style={{ flex: 1.5, background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>
                                    <span>To Next Level: Urban Legend</span>
                                    <span>70%</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: '70%', height: '100%', background: 'var(--primary)', borderRadius: '10px', boxShadow: '0 0 15px var(--primary)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'var(--primary)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-20px', left: '20%', width: '150px', height: '150px', background: '#EF4444', opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%' }}></div>
                </div>
            )}

            {/* 🏆 THE PODIUM (Visual Excellence) */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: '2rem',
                marginBottom: '6rem',
                padding: '0 1rem'
            }}>
                {/* 🥈 Silver - Rank 2 */}
                {top3[1] && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '24px', background: 'var(--surface-2)', border: '3px solid #94A3B8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 1000, color: '#94A3B8',
                                boxShadow: '0 12px 25px rgba(148, 163, 184, 0.2)'
                            }}>{top3[1].name.charAt(0)}</div>
                            <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '28px', height: '28px', borderRadius: '10px', background: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '3px solid var(--background)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '0.8rem' }}>🥈</div>
                        </div>
                        <div style={{
                            width: '100%', padding: '1.5rem 1.25rem', background: 'var(--surface)', borderRadius: '20px 20px 12px 12px', border: '1.5px solid var(--border)', borderBottom: '4px solid #94A3B8', textAlign: 'center'
                        }}>
                            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>{top3[1].name}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{top3[1].rank}</div>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '1rem' }}>
                                {getBadges(top3[1]).map((b, i) => <Badge key={i} {...b} />)}
                            </div>
                            <div style={{ color: 'var(--primary)', fontWeight: 1000, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{top3[1].points} <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>PTS</span></div>
                        </div>
                    </div>
                )}

                {/* 🥇 Gold - Rank 1 */}
                {top3[0] && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.2, position: 'relative', top: '-15px' }}>
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '96px', height: '96px', borderRadius: '32px', background: 'var(--surface-2)', border: '5px solid #FACC15',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.75rem', fontWeight: 1000, color: '#FACC15',
                                boxShadow: '0 20px 40px rgba(250, 204, 21, 0.3)'
                            }}>{top3[0].name.charAt(0)}</div>
                            <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '36px', height: '36px', borderRadius: '14px', background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '4px solid var(--background)', boxShadow: '0 6px 15px rgba(250, 204, 21, 0.4)', fontSize: '1rem' }}>👑</div>
                        </div>
                        <div style={{
                            width: '100%', padding: '2rem 1.5rem', background: 'var(--surface)', borderRadius: '24px 24px 12px 12px', border: '1.5px solid #FACC15', borderBottom: '6px solid #FACC15', textAlign: 'center', boxShadow: '0 15px 30px rgba(250, 204, 21, 0.1)'
                        }}>
                            <div style={{ fontWeight: 1000, fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px' }}>{top3[0].name}</div>
                            <div style={{ color: '#EAB308', fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>The Legend</div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                {getBadges(top3[0]).map((b, i) => <Badge key={i} {...b} />)}
                            </div>
                            <div style={{ color: '#EAB308', fontWeight: 1000, fontSize: '1.75rem', letterSpacing: '-0.04em' }}>{top3[0].points} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PTS</span></div>
                        </div>
                    </div>
                )}

                {/* 🥉 Bronze - Rank 3 */}
                {top3[2] && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '24px', background: 'var(--surface-2)', border: '3px solid #D97706',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 1000, color: '#D97706',
                                boxShadow: '0 12px 25px rgba(217, 119, 6, 0.2)'
                            }}>{top3[2].name.charAt(0)}</div>
                            <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '28px', height: '28px', borderRadius: '10px', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '3px solid var(--background)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '0.8rem' }}>🥉</div>
                        </div>
                        <div style={{
                            width: '100%', padding: '1.5rem 1.25rem', background: 'var(--surface)', borderRadius: '20px 20px 12px 12px', border: '1.5px solid var(--border)', borderBottom: '4px solid #D97706', textAlign: 'center'
                        }}>
                            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>{top3[2].name}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{top3[2].rank}</div>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '1rem' }}>
                                {getBadges(top3[2]).map((b, i) => <Badge key={i} {...b} />)}
                            </div>
                            <div style={{ color: 'var(--primary)', fontWeight: 1000, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{top3[2].points} <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>PTS</span></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 📋 THE HALL LIST (Interactive & Detailed) */}
            <div className="glass-panel" style={{
                borderRadius: '40px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border)'
            }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1.5px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--surface-2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '8px' }}><Activity size={16} /></div>
                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 1000, margin: 0 }}>Community Rankings</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--surface)', padding: '6px 14px', borderRadius: '100px', border: '1px solid var(--border)' }}>All Time</div>
                    </div>
                </div>

                <div style={{ padding: '0 1rem' }}>
                    {others.map((u, i) => {
                        const isSelf = u.id === currentUser?.id;
                        const userBadges = getBadges(u);
                        return (
                            <div key={u.id} style={{
                                display: 'flex', alignItems: 'center', padding: '1rem 1.5rem',
                                borderBottom: i === others.length - 1 ? 'none' : '1px solid var(--border)',
                                background: isSelf ? 'var(--primary)05' : 'transparent',
                                borderRadius: '16px',
                                margin: '0.25rem 0',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.background = 'var(--surface-2)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.background = isSelf ? 'var(--primary)05' : 'transparent';
                                }}
                            >
                                <span style={{ width: '40px', fontWeight: 1000, color: 'var(--text-muted)', fontSize: '1.25rem' }}>{i + 4}</span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1.5 }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px', background: 'var(--surface-2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 1000, color: 'var(--primary)', border: '1.5px solid var(--border)'
                                    }}>{u.name.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontWeight: 1000, color: 'var(--text-main)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {u.name}
                                            {isSelf && <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--primary)', color: 'white', fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase' }}>You</span>}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{u.rank}</div>
                                    </div>
                                </div>

                                {/* Impact DNA Sparklines Replacement */}
                                <div style={{ flex: 2, display: 'flex', gap: '1rem', alignItems: 'center', padding: '0 2rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            <span>My Activity</span>
                                            <span style={{ color: 'var(--primary)' }}>{u.report_count + u.verification_count} Contributions</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--surface-2)', borderRadius: '10px', display: 'flex', overflow: 'hidden' }}>
                                            <div style={{ width: `${(u.report_count / (u.report_count + u.verification_count + 1)) * 100}%`, background: '#3B82F6' }}></div>
                                            <div style={{ width: `${(u.verification_count / (u.report_count + u.verification_count + 1)) * 100}%`, background: '#10B981' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {userBadges.slice(0, 2).map((b, idx) => <Badge key={idx} {...b} />)}
                                        {userBadges.length > 2 && <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', padding: '8px' }}>+{userBadges.length - 2}</div>}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                    <div style={{ fontWeight: 1000, color: 'var(--text-main)', fontSize: '1.1rem', letterSpacing: '-0.03em' }}>{u.points}</div>
                                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Points</div>
                                </div>

                                <div style={{ marginLeft: '2rem', opacity: 0.3 }}><ChevronRight size={20} /></div>
                            </div>
                        );
                    })}

                    {others.length === 0 && (
                        <div style={{ padding: '6rem', textAlign: 'center' }}>
                            <Trophy size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                            <h4 style={{ fontWeight: 800, color: 'var(--text-main)' }}>The arena is waiting</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first to join the legend ranks this season.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🛡️ SECURITY FOOTER */}
            <div style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    ANTI-GRAVITY CRYPTO-VERIFIED RANKINGS &bull; EST. 2026
                </p>
            </div>
        </div>
    );
}
