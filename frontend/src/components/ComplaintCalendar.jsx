import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ComplaintCalendar({ complaints = [], onDateSelect, selectedDate }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

    // Build a map: "YYYY-MM-DD" -> count
    const countMap = useMemo(() => {
        const map = {};
        complaints.forEach(c => {
            if (!c.createdAt) return;
            const d = new Date(c.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            map[key] = (map[key] || 0) + 1;
        });
        return map;
    }, [complaints]);

    const maxCount = Math.max(1, ...Object.values(countMap));

    // Navigate months
    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Build calendar grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    // Leading blanks
    for (let i = 0; i < firstDay; i++) cells.push(null);
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const getKey = (day) => {
        if (!day) return null;
        return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getHeatColor = (count) => {
        if (!count) return 'var(--surface-2)';
        const intensity = count / maxCount;
        if (intensity > 0.75) return '#1D4ED8';
        if (intensity > 0.50) return '#2563EB';
        if (intensity > 0.25) return '#60A5FA';
        return '#BFDBFE';
    };

    const handleDayClick = (day) => {
        if (!day) return;
        const key = getKey(day);
        if (selectedDate === key) {
            onDateSelect(null); // deselect
        } else {
            onDateSelect(key);
        }
    };

    const isToday = (day) => {
        if (!day) return false;
        return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    };

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button
                    onClick={prevMonth}
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.target.style.background = 'var(--primary)'; e.target.style.color = 'white'; e.target.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { e.target.style.background = 'var(--surface-2)'; e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border)'; }}
                ><ChevronLeft size={18} /></button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                        {MONTHS[viewMonth]} {viewYear}
                    </div>
                </div>

                <button
                    onClick={nextMonth}
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.target.style.background = 'var(--primary)'; e.target.style.color = 'white'; e.target.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { e.target.style.background = 'var(--surface-2)'; e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--border)'; }}
                ><ChevronRight size={18} /></button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                {DAYS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 0' }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                {cells.map((day, idx) => {
                    const key = getKey(day);
                    const count = key ? (countMap[key] || 0) : 0;
                    const isSelected = key && selectedDate === key;
                    const todayDay = isToday(day);

                    return (
                        <div
                            key={idx}
                            onClick={() => handleDayClick(day)}
                            title={day && count ? `${count} complaint${count > 1 ? 's' : ''} on ${key}` : (day ? 'No complaints' : '')}
                            style={{
                                aspectRatio: '1',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: day ? 'pointer' : 'default',
                                background: isSelected
                                    ? 'var(--primary)'
                                    : day
                                        ? count > 0 ? getHeatColor(count) : 'var(--surface-2)'
                                        : 'transparent',
                                border: todayDay && !isSelected
                                    ? '2px solid var(--primary)'
                                    : '2px solid transparent',
                                transition: 'all 0.15s ease',
                                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                            }}
                        >
                            {day && (
                                <>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: todayDay || isSelected ? 800 : 500,
                                        color: isSelected
                                            ? 'white'
                                            : count > 0
                                                ? (count / maxCount > 0.5 ? '#1E3A8A' : '#1E40AF')
                                                : 'var(--text-muted)',
                                        lineHeight: 1,
                                    }}>
                                        {day}
                                    </span>
                                    {count > 0 && (
                                        <span style={{
                                            fontSize: '0.55rem',
                                            fontWeight: 700,
                                            color: isSelected ? 'rgba(255,255,255,0.85)' : '#1E40AF',
                                            lineHeight: 1,
                                            marginTop: '1px',
                                        }}>
                                            {count}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVITY:</span>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {['var(--surface-2)', '#BFDBFE', '#60A5FA', '#2563EB', '#1D4ED8'].map((c, i) => (
                        <div key={i} style={{ width: '14px', height: '14px', borderRadius: '4px', background: c, border: '1px solid rgba(0,0,0,0.06)' }} />
                    ))}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>None → High</span>
                {selectedDate && (
                    <button
                        onClick={() => onDateSelect(null)}
                        style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <X size={12} /> Clear filter
                    </button>
                )}
            </div>

            {/* Selected date info */}
            {selectedDate && (
                <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.8rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> Showing complaints for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {countMap[selectedDate] || 0} found
                    </span>
                </div>
            )}
        </div>
    );
}
