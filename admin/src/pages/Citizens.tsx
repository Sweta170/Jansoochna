import { Search, Ban, BellRing, MoreVertical } from 'lucide-react';

const MOCK_CITIZENS = Array.from({ length: 15 }).map((_, i) => ({
  id: `USR${i}98`,
  name: `Citizen ${i}`,
  phone: 'XXXXX' + Math.floor(10000 + Math.random() * 90000),
  location: 'Ludhiana, PB',
  points: Math.floor(Math.random() * 500),
  badge: ['Sewak', 'Jan Nayak', 'Pratinidhi'][i % 3],
  issuesCount: Math.floor(Math.random() * 10),
  status: i % 7 === 0 ? 'blocked' : 'active',
  joinedAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
}));

export default function Citizens() {
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
              {MOCK_CITIZENS.map((c, i) => (
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
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.status === 'active' ? 'bg-jade-lt text-jade' : 'bg-crimson-lt text-crimson'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button className="p-1 hover:text-primary transition-colors" title="Send Notification"><BellRing size={16} /></button>
                      <button className={`p-1 transition-colors ${c.status === 'blocked' ? 'text-jade hover:text-jade/80' : 'hover:text-destructive'}`} title={c.status === 'blocked' ? 'Unblock' : 'Block'}>
                        <Ban size={16} />
                      </button>
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
