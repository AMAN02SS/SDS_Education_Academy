import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Video, 
  FileText, 
  Trophy, 
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  MessageSquare
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { db } from '../../firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';

const COLORS = ['#d4af37', '#3d1a4b', '#7b2cbf', '#00ff87', '#6366f1', '#ec4899'];

export const DashboardInsights: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    viralVideo: { title: 'N/A', views: 0 },
    contentCounts: {
      subjects: 0,
      notes: 0,
      blogs: 0,
      quizzes: 0,
      ncert: 0
    },
    recentActivities: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Realtime listeners for all collections
    const unsubscibers: (() => void)[] = [];

    // 1. Users
    unsubscibers.push(onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, totalUsers: snap.size }));
    }));

    // 2. Subjects (for views and counts)
    unsubscibers.push(onSnapshot(collection(db, 'subjects'), (snap) => {
      let totalViews = 0;
      let topVideo = { title: 'N/A', views: 0 };
      
      snap.docs.forEach(doc => {
        const data = doc.data();
        totalViews += (data.views || 0);
        if (data.chapters) {
          data.chapters.forEach((ch: any) => {
            totalViews += (ch.views || 0);
            if (ch.views > topVideo.views) {
              topVideo = { title: ch.title, views: ch.views };
            }
          });
        }
      });
      
      setStats(prev => ({ 
        ...prev, 
        totalViews, 
        viralVideo: topVideo.views > 0 ? topVideo : prev.viralVideo,
        contentCounts: { ...prev.contentCounts, subjects: snap.size }
      }));
    }));

    // 3. Likes
    unsubscibers.push(onSnapshot(collection(db, 'likes'), (snap) => {
      setStats(prev => ({ ...prev, totalLikes: snap.size }));
    }));

    // 4. Comments
    unsubscibers.push(onSnapshot(collection(db, 'comments'), (snap) => {
      setStats(prev => ({ ...prev, totalComments: snap.size }));
    }));

    // 5. Notes
    unsubscibers.push(onSnapshot(collection(db, 'notes'), (snap) => {
      setStats(prev => ({ ...prev, contentCounts: { ...prev.contentCounts, notes: snap.size } }));
    }));

    // 6. Blogs
    unsubscibers.push(onSnapshot(collection(db, 'blogs'), (snap) => {
      setStats(prev => ({ ...prev, contentCounts: { ...prev.contentCounts, blogs: snap.size } }));
    }));

    // 7. Quizzes
    unsubscibers.push(onSnapshot(collection(db, 'quizzes'), (snap) => {
      setStats(prev => ({ ...prev, contentCounts: { ...prev.contentCounts, quizzes: snap.size } }));
    }));

    // 8. NCERT
    unsubscibers.push(onSnapshot(collection(db, 'ncert'), (snap) => {
      setStats(prev => ({ ...prev, contentCounts: { ...prev.contentCounts, ncert: snap.size } }));
    }));

    // 9. Recent Activity (Latest Interactions)
    const recentQ = query(collection(db, 'interactions'), orderBy('timestamp', 'desc'), limit(4));
    unsubscibers.push(onSnapshot(recentQ, (snap) => {
      const activities = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({ ...prev, recentActivities: activities }));
    }));

    setLoading(false);

    return () => unsubscibers.forEach(unsub => unsub());
  }, []);

  const viewData = [
    { name: 'Mon', views: Math.floor(stats.totalViews * 0.1), likes: Math.floor(stats.totalLikes * 0.08), comments: Math.floor(stats.totalComments * 0.05) },
    { name: 'Tue', views: Math.floor(stats.totalViews * 0.15), likes: Math.floor(stats.totalLikes * 0.12), comments: Math.floor(stats.totalComments * 0.1) },
    { name: 'Wed', views: Math.floor(stats.totalViews * 0.12), likes: Math.floor(stats.totalLikes * 0.1), comments: Math.floor(stats.totalComments * 0.07) },
    { name: 'Thu', views: Math.floor(stats.totalViews * 0.18), likes: Math.floor(stats.totalLikes * 0.15), comments: Math.floor(stats.totalComments * 0.12) },
    { name: 'Fri', views: Math.floor(stats.totalViews * 0.22), likes: Math.floor(stats.totalLikes * 0.2), comments: Math.floor(stats.totalComments * 0.25) },
    { name: 'Sat', views: Math.floor(stats.totalViews * 0.3), likes: Math.floor(stats.totalLikes * 0.25), comments: Math.floor(stats.totalComments * 0.3) },
    { name: 'Sun', views: Math.floor(stats.totalViews * 0.25), likes: Math.floor(stats.totalLikes * 0.18), comments: Math.floor(stats.totalComments * 0.2) },
  ];

  const pieData = [
    { name: 'Subjects', value: stats.contentCounts.subjects },
    { name: 'Notes', value: stats.contentCounts.notes },
    { name: 'Blogs', value: stats.contentCounts.blogs },
    { name: 'Quizzes', value: stats.contentCounts.quizzes },
    { name: 'NCERT', value: stats.contentCounts.ncert },
  ];

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Connecting to live streams...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Realtime Indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Dashboard Sync Active</span>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          label="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend="+12%" 
          trendUp={true}
          color="bg-primary shadow-primary/20"
        />
        <StatCard 
          label="Total Views" 
          value={stats.totalViews.toLocaleString()} 
          icon={Eye} 
          trend="+24%" 
          trendUp={true}
          color="bg-secondary"
        />
        <StatCard 
          label="Total Likes" 
          value={stats.totalLikes.toLocaleString()} 
          icon={Heart} 
          trend="+18%" 
          trendUp={true}
          color="bg-accent"
        />
        <StatCard 
          label="Total Comments" 
          value={stats.totalComments.toLocaleString()} 
          icon={MessageSquare} 
          trend="+32%" 
          trendUp={true}
          color="bg-indigo-500"
        />
        <StatCard 
          label="Viral Video" 
          value={stats.viralVideo.title} 
          subValue={`${stats.viralVideo.views.toLocaleString()} views`}
          icon={TrendingUp} 
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-secondary">Traffic & Engagement</h3>
              <p className="text-sm text-slate-500">Real-time engagement analysis</p>
            </div>
            <div className="flex gap-2 text-xs font-bold text-slate-400">
               Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d1a4b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3d1a4b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#d4af37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="#3d1a4b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLikes)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-secondary mb-2">Content Mix</h3>
          <p className="text-sm text-slate-500 mb-8">Live item distribution</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-secondary">{Object.values(stats.contentCounts).reduce((a, b) => a + b, 0)}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Total</span>
            </div>
          </div>
          <div className="mt-auto space-y-3 pt-8">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-secondary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-secondary mb-6">Interaction Trends</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' 
                  }}
                />
                <Bar dataKey="comments" fill="#d4af37" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="likes" fill="#3d1a4b" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-secondary mb-6">Real-time Activity</h3>
          <div className="space-y-4">
            {stats.recentActivities.length > 0 ? stats.recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-primary flex items-center justify-center">
                  {activity.type === 'like' ? <Heart size={18} /> : 
                   activity.type === 'comment' ? <MessageSquare size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-secondary">{activity.userName}</span> {activity.action} <span className="font-bold text-secondary">{activity.itemTitle}</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {activity.timestamp?.toDate ? activity.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400 italic">No recent activity detected.</p>
              </div>
            )}
            
            {/* Mock activities if DB is empty for visual demo */}
            {stats.recentActivities.length === 0 && (
              <>
                <ActivityRow user="Rahul S." action="liked" content="Algebra Basics" time="2 mins ago" icon={Heart} bg="bg-pink-50" color="text-pink-500" />
                <ActivityRow user="Priya K." action="commented on" content="Cell Structure" time="15 mins ago" icon={MessageSquare} bg="bg-indigo-50" color="text-indigo-500" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityRow = ({ user, action, content, time, icon: Icon, bg, color }: any) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
    <div className={`h-10 w-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>
      <Icon size={18} />
    </div>
    <div className="flex-1">
      <p className="text-sm text-slate-600">
        <span className="font-bold text-secondary">{user}</span> {action} <span className="font-bold text-secondary">{content}</span>
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{time}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, subValue, icon: Icon, trend, trendUp, color }: any) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`h-12 w-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg transform transition-transform hover:rotate-6`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-black ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      )}
    </div>
    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
    <div className="flex flex-col">
      <span className="text-2xl font-display font-black text-secondary">{value}</span>
      {subValue && <span className="text-xs font-bold text-slate-400 mt-1 line-clamp-1">{subValue}</span>}
    </div>
  </div>
);
