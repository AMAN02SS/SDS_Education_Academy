import React from 'react';
import { motion } from 'motion/react';
import { History, Award, BookOpen, ShieldCheck, Heart, Flag } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh pt-32 pb-24 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-premium mb-8">
            <Flag size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-secondary mb-6 leading-tight">
            Testimonial – <span className="text-gradient">SDS Education Academy</span>
          </h1>
          <p className="text-2xl font-bold tracking-widest text-primary uppercase italic">
            Education For All
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 shadow-premium border border-white"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold text-secondary">Our Vision & Legacy</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                SDS Education Academy stands as a shining symbol of dedication, legacy, and excellence in education. Established with a strong vision to provide quality education from nursery to Class 12, the academy has consistently worked toward shaping bright futures and nurturing young minds with care, discipline, and innovation.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                  <img
                    src="/image2.png"
                    alt="University Campus"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                  <img
                    src="/image1.png"
                    alt="Student Learning"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 shadow-premium border border-white"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <History size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold text-secondary">Historical Foundation</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                The foundation of SDS Education Academy was proudly laid on 1st August 2020, carrying forward a rich educational heritage that dates back to 1989, when SDS School first began its journey in Gwalior, Madhya Pradesh. This long-standing tradition reflects a deep commitment to academic excellence and character building across generations.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-secondary text-white rounded-[3rem] p-8 md:p-12 shadow-premium relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-0" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 text-primary flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-display font-bold">The Meaning Behind SDS</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-lg text-slate-300 leading-relaxed italic">
                    The name SDS Education Academy holds a special and honorable meaning. It is dedicated to the memory of our respected grandfather, <span className="text-primary font-bold">Shri Shiv Dan Singh</span>, a distinguished Police Officer in Gwalior, Madhya Pradesh.
                  </p>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    His life was a reflection of discipline, integrity, and service to society. Belonging to the prestigious royal family of Belon, his values continue to inspire the foundation and vision of the academy. SDS is not just a name—it is a legacy of honor, strength, and responsibility.
                  </p>
                </div>
                <div className="mt-10 flex justify-center">
                  <div className="flex flex-col items-center text-center">

                    {/* Image Circle with Glow */}
                    <div className="relative group h-40 w-40 flex items-center justify-center">

                      {/* Glow (ONLY around image) */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary-dark blur-lg opacity-40 group-hover:opacity-60 transition duration-500"></div>

                      {/* Image */}
                      <div className="relative h-full w-full rounded-full border-4 border-primary overflow-hidden shadow-2xl bg-secondary p-2 z-10">
                        <div className="h-full w-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                          <img
                            src="/ShriShivDanSingh.png"
                            alt="Shri Shiv Dan Singh"
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Text */}
                    <p className="mt-4 font-display font-bold text-primary tracking-widest uppercase text-xs">
                      Shri Shiv Dan Singh
                    </p>

                    <p className="mt-1 font-display font-bold text-primary tracking-widest uppercase text-xs">
                      Town Inspector (TI), MP Police
                    </p>

                    <p className="mt-1 font-display font-bold text-primary tracking-widest uppercase text-xs">
                      Royal Family of Princely States Belon, Bulandshahr (U.P.)
                    </p>

                  </div>

                  {/* <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary-dark rounded-full blur opacity-40 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative h-40 w-40 rounded-full border-4 border-primary overflow-hidden shadow-2xl bg-secondary p-2">
                       <div className="h-full w-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                          <img 
                            src="/ShriShivDanSingh.png" 
                            alt="Shri Shiv Dan Singh" 
                            className="h-full w-full object-cover items-center justify-around flex"
                          />
                       </div>
                    </div>
                    <p className="mt-4 text-center font-display font-bold text-primary tracking-widest uppercase text-xs">Shri Shiv Dan Singh</p>
                   <p className="mt-1 text-center font-display font-bold text-primary tracking-widest uppercase text-xs">Town Inspector, MP Police</p>
                    
                  </div> */}
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 shadow-premium border border-white"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold text-secondary">Our Philosophy</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                At SDS Education Academy, we believe education is not just about books, but about building confidence, leadership, and moral values. With experienced educators, a student-focused approach, and a commitment to excellence, the academy provides a supportive environment where every child can grow, learn, and succeed.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-primary pl-6">
                Today, SDS Education Academy proudly stands as a trusted platform for holistic education—empowering students to achieve their dreams and become responsible citizens of tomorrow. With its glorious past and promising future, SDS continues to illuminate the path of knowledge and success for every learner.
              </p>
            </motion.section>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 sticky top-32 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary rounded-[2.5rem] p-8 shadow-xl text-white text-center"
            >
              <Heart className="mx-auto mb-6 h-12 w-12 text-secondary" />
              <h3 className="text-2xl font-display font-black mb-4">Values First</h3>
              <p className="text-sm font-medium leading-relaxed mb-8 opacity-90">
                Building confidence, leadership, and moral values in every student at SDS Academy.
              </p>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 text-sm font-bold border border-white/20">Legacy of Honor</div>
                <div className="bg-white/10 rounded-2xl p-4 text-sm font-bold border border-white/20">Excellence in Care</div>
                <div className="bg-white/10 rounded-2xl p-4 text-sm font-bold border border-white/20">Future Empowerment</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100 text-center"
            >
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop"
                alt="Library"
                className="w-full h-40 object-cover rounded-3xl mb-6 shadow-lg"
              />
              <h4 className="text-secondary font-display font-bold text-lg mb-2">Join Our Academy</h4>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Become a part of Gwalior's most trusted educational family legacy.
              </p>
              <button className="w-full py-4 rounded-2xl bg-secondary text-white font-bold shadow-xl shadow-secondary/20 hover:scale-105 transition-all">
                Contact Us
              </button>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 text-center"
        >
          <div className="h-0.5 w-full bg-linear-to-r from-transparent via-slate-200 to-transparent mb-12" />
          <h2 className="text-xl md:text-2xl font-display font-black text-secondary tracking-widest uppercase">
            SDS Education Academy – <span className="text-primary italic">Education For All</span>
          </h2>
          <p className="text-slate-400 text-xs font-bold mt-4 uppercase tracking-[0.3em]">Established 2020 | Legacy since 1989</p>
        </motion.div>
      </div >
    </div >
  );
};
