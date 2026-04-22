import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { 
  MessageCircle, 
  Send,
  User,
  Heart,
  Eye,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  onSnapshot,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface VideoPlayerProps {
  url: string;
  contentId: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, contentId, title }) => {
  const { user, profile } = useAuth();
  const Player = ReactPlayer as any;
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize YouTube URL
  const getNormalizedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    // Handle embed URLs
    if (rawUrl.includes('youtube.com/embed/')) {
      const id = rawUrl.split('embed/')[1]?.split('?')[0];
      return `https://www.youtube.com/watch?v=${id}`;
    }
    // Handle youtu.be URLs
    if (rawUrl.includes('youtu.be/')) {
      const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/watch?v=${id}`;
    }
    return rawUrl;
  };

  const normalizedUrl = getNormalizedUrl(url);
  const isYouTube = normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be');
  const youtubeEmbedUrl = isYouTube ? normalizedUrl.replace('watch?v=', 'embed/') : '';
  const finalSrc = isYouTube ? `${youtubeEmbedUrl}${youtubeEmbedUrl.includes('?') ? '&' : '?'}rel=0&modestbranding=1&autoplay=0` : '';

  useEffect(() => {
    if (isYouTube) {
      console.log("YouTube Video Source:", finalSrc);
    }
  }, [finalSrc, isYouTube]);

  // Likes & Comments State
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  const triggerLoginWarning = () => {
    setShowLoginWarning(true);
    setTimeout(() => setShowLoginWarning(false), 3000);
  };

  useEffect(() => {
    console.log("VideoPlayer mounted with contentId:", contentId);
    if (!contentId) return;

    // Listen for likes
    const likesQuery = query(collection(db, 'likes'), where('contentId', '==', contentId));
    const unsubscribeLikes = onSnapshot(likesQuery, (snapshot) => {
      const likesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLikes(likesData);
      setIsLiked(likesData.some((l: any) => l.userId === user?.uid));
    }, (error) => {
      console.error("Error listening for likes:", error);
    });

    // Listen for comments - Removed orderBy to avoid composite index requirement
    const commentsQuery = query(
      collection(db, 'comments'), 
      where('contentId', '==', contentId)
    );
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side instead
      const sortedComments = commentsData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setComments(sortedComments);
    }, (error) => {
      console.error("Error listening for comments:", error);
    });

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, [contentId, user]);

  const handleLike = async () => {
    if (!user) {
      console.warn("User must be logged in to like a video.");
      triggerLoginWarning();
      return;
    }
    if (!contentId) {
      console.warn("Cannot like content without an ID.");
      return;
    }

    // Optimistic UI update
    const previousIsLiked = isLiked;
    const previousLikes = [...likes];
    
    try {
      if (isLiked) {
        setIsLiked(false);
        setLikes(likes.filter((l: any) => l.userId !== user.uid));
        
        const userLike = previousLikes.find((l: any) => l.userId === user.uid);
        if (userLike) {
          await deleteDoc(doc(db, 'likes', userLike.id));
        }
      } else {
        setIsLiked(true);
        // Temporary optimistic like object
        const tempLike = { id: 'temp_' + Date.now(), userId: user.uid, contentId };
        setLikes([...likes, tempLike]);
        
        await addDoc(collection(db, 'likes'), {
          userId: user.uid,
          contentId,
          createdAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      alert(`Error toggling like: ${error.message || 'Unknown error'}`);
      // Revert optimistic update on failure
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.warn("User must be logged in to comment.");
      triggerLoginWarning();
      return;
    }
    if (!contentId) {
      console.warn("Cannot comment on content without an ID.");
      return;
    }
    if (!newComment.trim()) return;
    
    try {
      await addDoc(collection(db, 'comments'), {
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'Anonymous',
        userPhoto: profile?.photoURL || user.photoURL || '',
        contentId,
        text: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error: any) {
      console.error("Error adding comment:", error);
      alert(`Error adding comment: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-8">
      {!contentId && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle size={18} />
          Interaction features are limited for this content (Missing ID).
        </div>
      )}
      {/* Video Player Container */}
      <div 
        ref={containerRef}
        className="relative aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl group"
      >
        {isYouTube ? (
          <iframe
            width="100%"
            height="100%"
            src={finalSrc}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        ) : (
          <Player
            ref={playerRef}
            url={normalizedUrl}
            width="100%"
            height="100%"
            controls={true}
          />
        )}
      </div>

      {/* Like & Interaction Bar */}
      <div className="flex items-center justify-between py-4 border-b border-slate-100 relative">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isLiked ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            {likes.length} Likes
          </button>
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <MessageCircle size={20} />
            {comments.length} Comments
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <Eye size={16} />
          Shared Learning
        </div>
        
        <AnimatePresence>
          {showLoginWarning && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 -top-12 bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-xl z-10 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-amber-400" />
              Please sign in to interact
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comments Section */}
      <div className="space-y-8">
        <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
          Discussion <span className="text-sm font-normal text-slate-400">({comments.length})</span>
        </h3>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-full w-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="flex-1 relative">
            <input 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={comment.id} 
              className="flex gap-4"
            >
              <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {comment.userPhoto ? (
                  <img src={comment.userPhoto} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-secondary text-sm">{comment.userName}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {comment.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{comment.text}</p>
              </div>
            </motion.div>
          ))}
          {comments.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic">
              No comments yet. Be the first to start the discussion!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
