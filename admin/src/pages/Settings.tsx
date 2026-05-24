import { useAdmin } from '../context/AuthContext';

export default function Settings() {
  const { admin } = useAdmin();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your admin preferences and profile</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-1">Name</label>
            <input type="text" disabled value={admin?.name || ''} className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground opacity-70" />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-1">Email</label>
            <input type="text" disabled value={admin?.email || ''} className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground opacity-70" />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-1">Role & Jurisdiction</label>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-primary/10 text-primary font-bold text-sm rounded border border-primary/20 uppercase">{admin?.role.replace('_', ' ')}</span>
              <span className="px-3 py-1.5 bg-secondary text-muted-foreground font-semibold text-sm rounded border border-border">{admin?.state} {admin?.district !== 'All' ? `> ${admin?.district}` : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div>
              <p className="font-semibold text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive daily summaries of unresolved issues.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-foreground">Sound Alerts</p>
              <p className="text-sm text-muted-foreground">Play a sound when a new urgent issue is reported.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}
