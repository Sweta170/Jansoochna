import { useState, useEffect } from 'react';
import { Search, Ban, BellRing, MoreVertical, Lock, Unlock } from 'lucide-react';
import { api } from '../services/api';

export default function Citizens() {
  const [citizens, setCitizens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      const mapped = res.data.map((user: any) => ({
        id: user._id,
        name: user.name || 'Nagarik',
        phone: user.phone || 'N/A',
        location: user.location?.city ? `${user.location.city}, ${user.location.state || 'PB'}` : (user.pincode || 'N/A'),
        points: user.points || 0,
        badge: user.badge || 'Nagarik',
        issuesCount: 0, // Mock count as it is not directly computed on user schema
        status: user.isBlocked ? 'blocked' : (user.otpLockedUntil && new Date(user.otpLockedUntil) > new Date() ? 'locked' : 'active'),
        joinedAt: new Date(user.createdAt).toLocaleDateString(),
      }));
      setCitizens(mapped);
    } catch (err) {
      console.error('Failed to fetch citizens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  const handleUnlock = async (id: string, name: string) => {
    try {
      const res = await api.patch(`/admin/users/${id}/unlock`);
      alert(res.data.message || `Unlocked ${name}`);
      setCitizens(prev =>
        prev.map(c => c.id === id ? { ...c, status: 'active' } : c)
      );
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to unlock citizen');
    }
  };

  const handleToggleBlock = async (id: string, currentStatus: string) => {
    try {
      const res = await api.patch(`/admin/users/${id}/block`);
      const isBlockedNow = res.data.isBlocked;
      alert(`${isBlockedNow ? 'Blocked' : 'Unblocked'} user successfully`);
      setCitizens(prev =>
        prev.map(c => c.id === id ? { ...c, status: isBlockedNow ? 'blocked' : 'active' } : c)
      );
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to block/unblock citizen');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Citizens Management</h1>
          <p className="text-muted-foreground text-sm">View user activity and manage access</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, phone, or ID..." 
            className="bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                {['Name', 'Phone', 'Location', 'Points', 'Badge', 'Issues', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citizens.map((c, i) => (
                <tr key={i} className={`border-b border-border/50 hover:bg-secondary/60 transition-colors ${c.status === 'blocked' ? 'bg-destructive/5' : ''}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.location}</td>
                  <td className="px-4 py-3 font-bold text-primary">{c.points}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-secondary text-foreground text-xs rounded-full border border-border">{c.badge}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.issuesCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.joinedAt}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-fit ${
                      c.status === 'active' 
                        ? 'bg-jade-lt text-jade' 
                        : (c.status === 'locked' ? 'bg-amber-lt text-amber border border-amber/15' : 'bg-crimson-lt text-crimson')
                    }`}>
                      {c.status === 'locked' && <Lock size={12} />}
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button className="p-1 hover:text-primary transition-colors" title="Send Notification"><BellRing size={16} /></button>
                      
                      {c.status === 'locked' ? (
                        <button 
                          onClick={() => handleUnlock(c.id, c.name)}
                          className="p-1 text-amber hover:text-amber/80 transition-colors" 
                          title="Unlock User"
                        >
                          <Unlock size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleBlock(c.id, c.status)}
                          className={`p-1 transition-colors ${c.status === 'blocked' ? 'text-jade hover:text-jade/80' : 'hover:text-destructive'}`} 
                          title={c.status === 'blocked' ? 'Unblock' : 'Block'}
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      
                      <button className="p-1 hover:text-foreground transition-colors"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
