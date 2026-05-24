import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AuthContext';
import { Plus, X } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function Admins() {
  const { can } = useAdmin();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for new admin
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('district_admin');
  const [stateName, setStateName] = useState('Punjab');
  const [district, setDistrict] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/auth/list');
      setAdmins(res.data);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (can('admins.view')) {
      fetchAdmins();
    }
  }, []);

  if (!can('admins.view')) {
    return <Navigate to="/" replace />;
  }

  const handleToggleStatus = async (id: string, name: string) => {
    try {
      const res = await api.patch(`/admin/auth/${id}/toggle-status`);
      const active = res.data.isActive;
      toast.success(`${name} is now ${active ? 'Active' : 'Inactive'}`);
      setAdmins(prev =>
        prev.map(a => a._id === id ? { ...a, isActive: active } : a)
      );
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to toggle admin status');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/admin/auth/create-admin', {
        name,
        email,
        password,
        role,
        state: role === 'superadmin' ? 'All' : stateName,
        district: (role === 'superadmin' || role === 'state_admin') ? 'All' : district || 'All',
      });
      toast.success('Administrator created successfully');
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setDistrict('');
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrators</h1>
          <p className="text-muted-foreground text-sm">Manage access for state and district officials</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={18} /> Add Admin
        </button>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse font-semibold">
              Loading administrators...
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  {['Name', 'Email', 'Role', 'Jurisdiction', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr key={a._id || i} className="border-b border-border/50 hover:bg-secondary/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${a.role === 'superadmin' ? 'bg-saffron' : a.role === 'state_admin' ? 'bg-blue' : 'bg-jade'}`}>
                        {(a.name || 'A')[0]}
                      </div>
                      {a.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-secondary text-foreground text-xs rounded border border-border capitalize font-semibold">
                        {a.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.state || 'All'} {a.district && a.district !== 'All' ? `> ${a.district}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${a.isActive ? 'bg-jade-lt text-jade' : 'bg-crimson-lt text-crimson'}`}>
                        {a.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.role !== 'superadmin' && (
                        <button 
                          onClick={() => handleToggleStatus(a._id, a.name)}
                          className={`text-xs font-semibold hover:underline ${a.isActive ? 'text-destructive' : 'text-primary'}`}
                        >
                          {a.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Admin Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/35 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          
          {/* Form */}
          <div className="bg-card border border-border rounded-xl shadow-2xl z-10 w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-foreground mb-4">Add Official Account</h3>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Singh"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. official@punjab.gov.in"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="district_admin">District Admin</option>
                    <option value="state_admin">State Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                {role !== 'superadmin' && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">State Jurisdiction</label>
                    <input 
                      type="text" 
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      required
                    />
                  </div>
                )}
              </div>

              {role === 'district_admin' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">District Jurisdiction</label>
                  <input 
                    type="text" 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Ludhiana"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    required
                  />
                </div>
              )}

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity mt-2"
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
