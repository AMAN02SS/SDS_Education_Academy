import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Edit2, Trash2, Plus, X, Save, Video, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CLASSES } from '../../constants';

export const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: 'Class 10',
    subject: '',
    thumbnail: '',
    views: 0,
    chapters: [] as any[]
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'subjects'), orderBy('grade'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'subjects', editingId), formData);
      } else {
        await addDoc(collection(db, 'subjects'), formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', description: '', grade: 'Class 10', subject: '', thumbnail: '', views: 0, chapters: [] });
      fetchSubjects();
    } catch (error) {
      console.error("Error saving subject:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteDoc(doc(db, 'subjects', id));
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject:", error);
      }
    }
  };

  const handleEdit = (subject: any) => {
    setEditingId(subject.id);
    setFormData({
      title: subject.title,
      description: subject.description,
      grade: subject.grade,
      subject: subject.subject,
      thumbnail: subject.thumbnail,
      views: subject.views || 0,
      chapters: subject.chapters || []
    });
    setIsModalOpen(true);
  };

  const addChapter = () => {
    setFormData({
      ...formData,
      chapters: [...formData.chapters, { id: Date.now().toString(), title: '', videoUrl: '', views: 0 }]
    });
  };

  const updateChapter = (idx: number, field: string, value: string | number) => {
    const newChapters = [...formData.chapters];
    newChapters[idx] = { ...newChapters[idx], [field]: value };
    setFormData({ ...formData, chapters: newChapters });
  };

  const removeChapter = (idx: number) => {
    const newChapters = formData.chapters.filter((_, i) => i !== idx);
    setFormData({ ...formData, chapters: newChapters });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-secondary">Manage Subjects & Videos</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ title: '', description: '', grade: 'Class 10', subject: '', thumbnail: '', views: 0, chapters: [] }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
        >
          <Plus size={18} /> Add Subject
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading subjects...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Grade</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Chapters</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subjects.map((subject) => (
                <tr key={subject.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Video size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-secondary">{subject.title}</p>
                        <p className="text-xs text-slate-400">{subject.subject}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{subject.grade}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-slate-500">{subject.chapters?.length || 0} Chapters</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(subject)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(subject.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-secondary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-2xl font-display font-extrabold text-secondary">
                  {editingId ? 'Edit Subject' : 'Add New Subject'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Display Title</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Mathematics: Algebra & Geometry"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject Name</label>
                    <input 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grade / Class</label>
                    <select 
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Thumbnail URL</label>
                    <input 
                      value={formData.thumbnail}
                      onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Initial Views</label>
                    <input 
                      type="number"
                      value={formData.views}
                      onChange={e => setFormData({...formData, views: parseInt(e.target.value) || 0})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32"
                    placeholder="Brief overview of the subject..."
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Chapters & Videos</label>
                    <button 
                      type="button" 
                      onClick={addChapter}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Chapter
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.chapters.map((chapter, idx) => (
                      <div key={chapter.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative group/chapter">
                        <button 
                          type="button"
                          onClick={() => removeChapter(idx)}
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md text-red-500 flex items-center justify-center opacity-0 group-hover/chapter:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input 
                            placeholder="Chapter Title"
                            value={chapter.title}
                            onChange={e => updateChapter(idx, 'title', e.target.value)}
                            className="px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                          <input 
                            placeholder="YouTube Embed URL"
                            value={chapter.videoUrl}
                            onChange={e => updateChapter(idx, 'videoUrl', e.target.value)}
                            className="px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                          <input 
                            type="number"
                            placeholder="Views"
                            value={chapter.views || 0}
                            onChange={e => updateChapter(idx, 'views', parseInt(e.target.value) || 0)}
                            className="px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
                >
                  <Save size={20} /> Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
