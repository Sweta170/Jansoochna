import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  body: string;
  type: string;
  pincode: string;
  reports: number;
  postedAt: Date;
  author: string;
  hidden: boolean;
}

export default function Posts() {
  const [tab, setTab] = useState<'all' | 'reported'>('reported');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const endpoint = tab === 'reported' ? '/admin/posts/reported' : '/admin/posts';
      const res = await api.get(endpoint);
      
      const mapped = res.data.map((p: any) => {
        const authorName = p.author?.name || 'Nagarik';
        let authorPhone = '';
        if (p.author?.phone) {
          const phone = p.author.phone;
          authorPhone = phone.length > 4 ? ` (XXXXX${phone.slice(-4)})` : ` (${phone})`;
        }
        
        return {
          id: p._id,
          body: p.body,
          type: p.type || 'notice',
          pincode: p.pincode || 'N/A',
          reports: p.reported || 0,
          postedAt: new Date(p.createdAt),
          author: `${authorName}${authorPhone}`,
          hidden: p.hidden || false,
        };
      });

      setPosts(mapped);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [tab]);

  const handleHide = async (id: string) => {
    try {
      await api.patch(`/admin/posts/${id}/hide`);
      toast.success('Post hidden successfully');
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to hide post:', err);
      toast.error('Failed to hide post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success('Post deleted successfully');
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post');
    }
  };

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
          Reported Posts <span className="ml-1 bg-destructive/10 px-1.5 py-0.5 rounded-full text-[10px]">{posts.filter(p => p.reports > 0).length}</span>
        </button>
        <button 
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${tab === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          All Posts
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="ml-2 font-medium">Loading posts...</span>
          </div>
        </div>
      ) : (
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
                    {post.author[0] || 'N'}
                  </div>
                  <span className="text-sm font-medium text-foreground">{post.author}</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleHide(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors border border-transparent hover:border-border"
                  >
                    <EyeOff size={14} /> Hide
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                  >
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
      )}
    </div>
  );
}
