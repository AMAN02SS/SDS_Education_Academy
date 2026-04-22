import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Trash2, Search, MessageCircle } from 'lucide-react';

export const ManageComments: React.FC = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Fallback if index is missing
      try {
        const querySnapshot = await getDocs(collection(db, 'comments'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedData = data.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });
        setComments(sortedData);
      } catch (innerError) {
        console.error("Fallback fetch failed:", innerError);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'comments', id));
      setComments(comments.filter(c => c.id !== id));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      // alert is blocked in iframe, just log and reset
      setDeletingId(null);
    }
  };

  const filteredComments = comments.filter(c => 
    c.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading comments...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search comments by text, user, or content ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <div key={comment.id} className="flex items-start justify-between p-6 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                {comment.userPhoto ? (
                  <img src={comment.userPhoto} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <MessageCircle size={20} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-secondary">{comment.userName || 'Anonymous'}</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-2">{comment.text}</p>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Content ID: {comment.contentId}
                </div>
              </div>
            </div>
            {deletingId === comment.id ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setDeletingId(comment.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Comment"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}

        {filteredComments.length === 0 && (
          <div className="text-center py-12 text-slate-400 italic">
            No comments found.
          </div>
        )}
      </div>
    </div>
  );
};
