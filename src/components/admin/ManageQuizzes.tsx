import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Edit2, Trash2, Plus, X, Save, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CLASSES } from '../../constants';

export const ManageQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: CLASSES[0],
    questions: [] as any[]
  });

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'quizzes'), orderBy('grade'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
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
        await updateDoc(doc(db, 'quizzes', editingId), payload);
      } else {
        await addDoc(collection(db, 'quizzes'), payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', subject: '', grade: CLASSES[0], questions: [] });
      fetchQuizzes();
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteDoc(doc(db, 'quizzes', id));
        fetchQuizzes();
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const handleEdit = (quiz: any) => {
    setEditingId(quiz.id);
    setFormData({
      title: quiz.title,
      subject: quiz.subject || '',
      grade: quiz.grade || CLASSES[0],
      questions: quiz.questions || []
    });
    setIsModalOpen(true);
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], answer: 0 }]
    });
  };

  const updateQuestion = (qIdx: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIdx] = { ...newQuestions[qIdx], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const newQuestions = [...formData.questions];
    const newOptions = [...newQuestions[qIdx].options];
    newOptions[oIdx] = value;
    newQuestions[qIdx] = { ...newQuestions[qIdx], options: newOptions };
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (idx: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== idx);
    setFormData({ ...formData, questions: newQuestions });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-secondary">Manage Concept Quizzes</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ title: '', subject: '', grade: CLASSES[0], questions: [] }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
        >
          <Plus size={18} /> Add Quiz
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading quizzes...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Quiz Title</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Class</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Questions</th>
                <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
                        <Trophy size={20} />
                      </div>
                      <p className="font-bold text-secondary">{quiz.title}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-slate-500">{quiz.subject}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-slate-500">{quiz.grade}</span>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-slate-500">{quiz.questions?.length || 0} Questions</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(quiz)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(quiz.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
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
                  {editingId ? 'Edit Quiz' : 'Add New Quiz'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quiz Title</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. Chapter 1: Real Numbers Basics"
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

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Questions</label>
                    <button 
                      type="button" 
                      onClick={addQuestion}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {formData.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 relative group/q">
                        <button 
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md text-red-500 flex items-center justify-center opacity-0 group-hover/q:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <div className="space-y-4">
                          <input 
                            placeholder="Question text"
                            value={q.question}
                            onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                          />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name={`correct-${qIdx}`}
                                  checked={q.answer === oIdx}
                                  onChange={() => updateQuestion(qIdx, 'answer', oIdx)}
                                  className="accent-primary"
                                />
                                <input 
                                  placeholder={`Option ${oIdx + 1}`}
                                  value={opt}
                                  onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                  className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                              </div>
                            ))}
                          </div>
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
