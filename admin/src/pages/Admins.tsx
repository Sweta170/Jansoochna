import { useAdmin } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const MOCK_ADMINS = [
  { id: '1', name: 'Super Admin', email: 'superadmin@jansoochna.in', role: 'superadmin', state: 'All', district: 'All', status: 'active' },
  { id: '2', name: 'Ramesh Singh', email: 'ramesh.s@punjab.gov.in', role: 'state_admin', state: 'Punjab', district: 'All', status: 'active' },
  { id: '3', name: 'Sita Verma', email: 'sita.v@punjab.gov.in', role: 'district_admin', state: 'Punjab', district: 'Ludhiana', status: 'active' },
];

export default function Admins() {
  const { can } = useAdmin();

  // Route guard for superadmin functionality
  if (!can('admins.view')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrators</h1>
          <p className="text-muted-foreground text-sm">Manage access for state and district officials</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm">
          <Plus size={18} /> Add Admin
        </button>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                {['Name', 'Email', 'Role', 'Jurisdiction', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ADMINS.map((a, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${a.role === 'superadmin' ? 'bg-saffron' : a.role === 'state_admin' ? 'bg-blue' : 'bg-jade'}`}>
                      {a.name[0]}
                    </div>
                    {a.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-secondary text-foreground text-xs rounded border border-border capitalize font-semibold">
                      {a.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.state} {a.district !== 'All' ? `> ${a.district}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-jade-lt text-jade">
                      {a.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.role !== 'superadmin' && (
                      <button className="text-xs font-semibold text-destructive hover:underline">Deactivate</button>
                    )}
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
