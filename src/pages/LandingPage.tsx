import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/src/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Zap, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  UserPlus,
  FileEdit,
  Activity,
  Megaphone,
  Calendar,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const LandingPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await api.announcements.list();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements for landing:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Announcements Section */}
      <section id="announcements" className="py-24 bg-white relative border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4"
            >
              <Megaphone className="h-3 w-3" /> Latest Updates
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Public Announcements</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Stay informed about maintenance schedules, policy updates, and cooperative news.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {announcements.slice(0, 3).map((ann, i) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-slate-50 border border-slate-100 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
                  onClick={() => setSelectedAnnouncement(ann)}
                >
                  <div className="flex items-center gap-2 text-primary mb-4">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">{ann.title}</h3>
                  <p className="text-slate-600 line-clamp-3 mb-6 text-sm leading-relaxed">{ann.content}</p>
                  <div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest gap-2">
                    <Eye className="h-4 w-4" /> Read Full Details
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {announcements.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed text-slate-400">
                No active announcements at this time.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
            >
              <Zap className="h-3 w-3 text-primary" />
              Digital Consumer Portal
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[0.95]"
            >
              Manage Your <span className="text-primary italic">SORECO-1</span> <br/> Account Online
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              The official integrated digital gateway for Sorsogon I Electric Cooperative. 
              Submit disputes, request reconnections, and track service status in real-time.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 py-7 text-lg rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 px-10 py-7 text-lg rounded-2xl hover:bg-slate-50 transition-all">
                  Log In to Account
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-slate-50/50 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold uppercase tracking-widest text-xs mb-4"
              >
                Features
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Why Use the Portal?</h2>
            </div>
            <p className="text-slate-500 max-w-md text-lg">
              We've built a modern digital gateway to make our services more accessible and transparent for every consumer.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-10 w-10 text-primary" />,
                title: "Smart Billing Disputes",
                desc: "Formally lodge billing errors with evidence photos. No more waiting in long lines at the office.",
                color: "bg-blue-500/5"
              },
              {
                icon: <Zap className="h-10 w-10 text-primary" />,
                title: "Fast Reconnections",
                desc: "Submit proof of payment and request reconnection instantly. Our team will be notified immediately.",
                color: "bg-orange-500/5"
              },
              {
                icon: <Clock className="h-10 w-10 text-primary" />,
                title: "Real-Time Tracking",
                desc: "Watch your request move from submission to resolution with our visual service tracker.",
                color: "bg-green-500/5"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group"
              >
                <div className={`mb-8 w-20 h-20 rounded-3xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4"
            >
              Process
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Simple 4-Step Process</h2>
            <p className="text-lg text-slate-600">Getting your issues resolved is easier than ever with our streamlined digital workflow.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { 
                step: "01", 
                title: "Register", 
                desc: "Create an account using your utility number and verify your identity.",
                icon: <UserPlus className="h-6 w-6" />
              },
              { 
                step: "02", 
                title: "Submit Request", 
                desc: "Fill out the form, upload photos, and provide necessary details.",
                icon: <FileEdit className="h-6 w-6" />
              },
              { 
                step: "03", 
                title: "Track Progress", 
                desc: "Monitor the status in real-time on your personalized dashboard.",
                icon: <Activity className="h-6 w-6" />
              },
              { 
                step: "04", 
                title: "Resolved", 
                desc: "Get notified once the crew completes the task and confirm resolution.",
                icon: <CheckCircle2 className="h-6 w-6" />
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="relative z-10 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:border-primary/20 transition-all duration-500">
                  <div className="absolute -top-6 -right-6 text-8xl font-black text-slate-50 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    {item.step}
                  </div>
                  
                  <div className="h-14 w-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0 shadow-inner">
                    {item.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                    <span className="text-xs font-mono text-primary/40">Step {item.step}</span>
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                </div>
                
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-[2px] bg-gradient-to-r from-slate-100 to-transparent z-0"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Megaphone className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">SORECO-1 Announcement</span>
            </div>
            <DialogTitle className="text-2xl font-bold">{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Published on {selectedAnnouncement?.createdAt && new Date(selectedAnnouncement.createdAt).toLocaleString(undefined, { 
                dateStyle: 'long', 
                timeStyle: 'short' 
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedAnnouncement?.content}</p>
          </div>
          <div className="pt-6">
            <Button onClick={() => setSelectedAnnouncement(null)} className="w-full h-12 rounded-xl text-white font-bold">Close Notice</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
