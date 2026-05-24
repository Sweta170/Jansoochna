import { useState } from 'react';
import { ShieldAlert, Trash2, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MOCK_POSTS = Array.from({ length: 8 }).map((_, i) => ({
  id: `PST${i}89`,
  body: ['Sunday market is closed today due to rain.', 'Please do not throw garbage near block C park.', 'Found a lost dog near the main gate.'][i % 3],
  author: `User ${i} (XXXXX1234)`,
  type: ['notice', 'emergency', 'market'][i % 3],
  pincode: '141001',
  reports: i % 4 === 0 ? Math.floor(Math.random() * 10) + 3 : 0,
  postedAt: new Date(Date.now() - Math.random() * 10000000),
}));

export default function Posts() {
  const [tab, setTab] = useState<'all' | 'reported'>('reported');

  const posts = tab === 'reported' ? MOCK_POSTS.filter(p => p.reports > 0) : MOCK_POSTS;

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mohalla Posts Moderation</h1>
          <p className="text-muted-foreground text-sm">Review community posts and manage reported content</p>
        </div>
      </div>

      <div className="flex bg-secondary p-1 rounded-lg border border-border w-fit mb-6 shadow-sm">
        <button 
          onClick={() => setTab('reported')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${tab === 'reported' ? 'bg-card text-destructive shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Reported Posts <span className="ml-1 bg-destructive/10 px-1.5 py-0.5 rounded-full text-[10px]">{MOCK_POSTS.filter(p => p.reports > 0).length}</span>
        </button>
        <button 
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${tab === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          All Posts
        </button>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className={`bg-card border rounded-xl p-5 shadow-sm transition-colors ${post.reports > 3 ? 'border-destructive/30 bg-destructive/5' : 'border-border'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-secondary text-foreground text-xs font-bold rounded uppercase border border-border">
                  {post.type}
                </span>
                <span className="text-sm font-medium text-muted-foreground">📍 {post.pincode}</span>
                <span className="text-xs text-muted-foreground">• {formatDistanceToNow(post.postedAt, { addSuffix: true })}</span>
              </div>
              {post.reports > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                  <ShieldAlert size={14} /> {post.reports} Reports
                </div>
              )}
            </div>
            
            <p className="text-foreground text-base mb-4 leading-relaxed">{post.body}</p>
            
            <div className="flex justify-between items-center border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {post.author[0]}
                </div>
                <span className="text-sm font-medium text-foreground">{post.author}</span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors border border-transparent hover:border-border">
                  <EyeOff size={14} /> Hide
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center p-12 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground font-medium">No posts to review in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
