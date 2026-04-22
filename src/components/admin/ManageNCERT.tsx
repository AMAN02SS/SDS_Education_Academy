import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Edit2, Trash2, Plus, X, Save, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CLASSES } from '../../constants';

export const ManageNCERT: React.FC = () => {
  const [ncertData, setNcertData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: CLASSES[0],
    pdfUrl: '',
    solutions: [] as any[]
  });

  const fetchNCERT = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'ncert'), orderBy('grade'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNcertData(data);
    } catch (error) {
      console.error("Error fetching NCERT solutions:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNCERT();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        author: 'Admin',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      if (editingId) {
        await updateDoc(doc(db, 'ncert', editingId), payload);
      } else {
        await addDoc(collection(db, 'ncert'), payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', subject: '', grade: CLASSES[0], pdfUrl: '', solutions: [] });
      fetchNCERT();
    } catch (error) {
      console.error("Error saving NCERT solutions:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete these solutions?')) {
      try {
        await deleteDoc(doc(db, 'ncert', id));
        fetchNCERT();
      } catch (error) {
        console.error("Error deleting NCERT solutions:", error);
      }
    }
  };

  const handleEdit = (ncert: any) => {
    setEditingId(ncert.id);
    setFormData({
      title: ncert.title,
      subject: ncert.subject || '',
      grade: ncert.grade || CLASSES[0],
      pdfUrl: ncert.pdfUrl || '',
      solutions: ncert.solutions || []
    });
    setIsModalOpen(true);
  };

  const addSolution = () => {
    setFormData({
      ...formData,
      solutions: [...formData.solutions, { question: '', answer: '' }]
    });
  };

  const updateSolution = (idx: number, field: string, value: string) => {
    const newSolutions = [...formData.solutions];
    newSolutions[idx] = { ...newSolutions[idx], [field]: value };
    setFormData({ ...formData, solutions: newSolutions });
  };

  const removeSolution = (idx: number) => {
    const newSolutions = formData.solutions.filter((_, i) => i !== idx);
    setFormData({ ...formData, solutions: newSolutions });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-secondary">Manage NCERT Solutions</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ title: '', subject: '', grade: CLASSES[0], pdfUrl: '', solutions: [] }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
        >
          <Plus size={18} /> Add Solution Set
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading solutions...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Title</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Class</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Type</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ncertData.map((ncert) => (
                <tr key={ncert.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                        <BookOpen size={20} />
                      </div>
                      <p className="font-bold text-secondary">{ncert.title}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-slate-500">{ncert.subject}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-slate-500">{ncert.grade}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-slate-500">
                      {ncert.pdfUrl ? 'PDF Document' : `${ncert.solutions?.length || 0} Q&A`}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(ncert)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(ncert.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
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
                  {editingId ? 'Edit Solution Set' : 'Add Solution Set'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Chapter Title</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Chapter 1: Real Numbers"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject</label>
                    <input 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Class/Grade</label>
                    <select
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                    >
                      {CLASSES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">PDF URL (Optional)</label>
                  <input 
                    value={formData.pdfUrl}
                    onChange={e => setFormData({...formData, pdfUrl: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. https://example.com/ncert.pdf"
                  />
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Solutions (Q&A)</label>
                      <p className="text-xs text-slate-400 mt-1">If PDF URL is provided, Q&A will be ignored in the frontend.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={addSolution}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Solution
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {formData.solutions.map((sol, idx) => (
                      <div key={idx} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 relative group/s">
                        <button 
                          type="button"
                          onClick={() => removeSolution(idx)}
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md text-red-500 flex items-center justify-center opacity-0 group-hover/s:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <div className="space-y-4">
                          <textarea 
                            placeholder="Question"
                            value={sol.question}
                            onChange={e => updateSolution(idx, 'question', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold h-20"
                          />
                          <textarea 
                            placeholder="Detailed Solution"
                            value={sol.answer}
                            onChange={e => updateSolution(idx, 'answer', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32"
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
