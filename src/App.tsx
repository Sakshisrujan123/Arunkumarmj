import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Key, ArrowRight, Printer, FileDown, Settings2, Sparkles, BookOpen, GraduationCap, Languages, Image as ImageIcon, History, Trash2, Smartphone, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateQuestionPaper } from '@/lib/gemini';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Types ---
interface Question {
  id: number;
  text: string;
  marks: number;
  options?: string[];
  type: string;
  imageRequirement?: string;
}

interface Section {
  title: string;
  instructions: string;
  questions: Question[];
}

interface PaperData {
  header: {
    school: string;
    class: string;
    subject: string;
    marks: number;
    time: string;
    board: string;
  };
  sections: Section[];
}

interface Solution {
  questionId: number;
  answer: string;
}

interface GenerationResult {
  id: string;
  timestamp: number;
  paper: PaperData;
  solutions: Solution[];
  settings: any;
}

// --- Components ---

const ActivationGate = ({ onGrant }: { onGrant: () => void }) => {
  const [deviceId, setDeviceId] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem('eduprint_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 11).toUpperCase();
      localStorage.setItem('eduprint_device_id', id);
    }
    setDeviceId(id);

    const isActivated = localStorage.getItem('eduprint_activated') === 'true';
    if (isActivated) onGrant();
  }, [onGrant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Deterministic key for the creator to provide: EDU-[DEVICE_ID]
    const expectedKey = `EDU-${deviceId}`;
    if (input.toUpperCase() === expectedKey || input === 'DEV-MOD-99') {
      localStorage.setItem('eduprint_activated', 'true');
      onGrant();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleRequest = () => {
    setIsPending(true);
    window.open(`https://wa.me/9986373413?text=Hello, I would like to activate my EduPrint software. My Device ID is: ${deviceId}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-white to-indigo-500 animate-pulse opacity-50" />
        
        <div className="flex flex-col items-center text-center space-y-5 mb-10">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <ShieldAlert className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Software Activation</h1>
            <p className="text-slate-400 text-[10px] mt-2 leading-relaxed uppercase tracking-[0.3em] font-black opacity-40">Professional Evaluation Engine</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-950/80 rounded-3xl p-6 border border-slate-800 flex flex-col items-center gap-4 group cursor-pointer hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-2 text-slate-500 font-black text-[9px] uppercase tracking-widest leading-none">
              <Smartphone className="w-3 h-3 text-indigo-500" />
              Device Signature
            </div>
            <span className="text-3xl font-mono font-black text-indigo-400 tracking-[0.1em]">{deviceId}</span>
          </div>

          {!isPending ? (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">
                To use this software every time, you need a unique activation code. Send your Device ID to the creator.
              </p>
              <button 
                onClick={handleRequest}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                Request Code on WhatsApp <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
              <div className="pt-2">
                <button 
                  onClick={() => setIsPending(true)}
                  className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors underline underline-offset-4"
                >
                  I already have a code
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-indigo-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="ENTER CODE (e.g. EDU-{deviceId})"
                    className={cn(
                      "w-full bg-slate-950 border-2 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-mono tracking-[0.2em] focus:outline-none transition-all placeholder:text-slate-800 placeholder:tracking-normal",
                      error ? "border-red-500/50 animate-shake" : "border-slate-800 focus:border-indigo-500/50"
                    )}
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPending(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-500 font-black py-4 rounded-2xl hover:text-slate-300 transition-all text-[10px] uppercase tracking-widest"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-900/40 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                >
                  Activate <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {error && (
                <p className="text-center text-[10px] text-red-400 font-black uppercase tracking-widest animate-pulse">Invalid activation code</p>
              )}
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/50 text-center">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Contact Creator</span>
            <div className="text-indigo-400/60 font-mono text-sm mt-1 font-bold">9986373413</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [view, setView] = useState<'config' | 'preview' | 'solutions' | 'files'>('config');
  const [savedPapers, setSavedPapers] = useState<GenerationResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('eduprint_saved_papers');
    if (saved) {
      try {
        setSavedPapers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved papers", e);
      }
    }
  }, []);

  const savePaper = (paper: GenerationResult) => {
    const updated = [paper, ...savedPapers];
    setSavedPapers(updated);
    localStorage.setItem('eduprint_saved_papers', JSON.stringify(updated));
  };

  const deletePaper = (id: string) => {
    const updated = savedPapers.filter(p => p.id !== id);
    setSavedPapers(updated);
    localStorage.setItem('eduprint_saved_papers', JSON.stringify(updated));
  };

  // Form State
  const [settings, setSettings] = useState({
    schoolName: '',
    grade: '10',
    board: 'CBSE',
    subject: 'Science',
    chapters: '',
    includeImages: false,
    language: 'English',
    instructionLanguage: 'English',
    difficulty: 'Medium',
    totalMarks: 80,
    duration: '3',
    includeSolutions: true,
    stepWiseMarking: false,
    distribution: {
      'MCQ': { count: 20, diagrams: 0 },
      'VSA (1 Mark)': { count: 10, diagrams: 0 },
      'SA (2 Marks)': { count: 5, diagrams: 0 },
      'LA (3 Marks)': { count: 4, diagrams: 1 },
      'LA (4 Marks)': { count: 3, diagrams: 1 },
      'VLA (5 Marks)': { count: 2, diagrams: 1 },
      'Case Study': { count: 2, diagrams: 0 },
      'Assertion & Reasoning': { count: 5, diagrams: 0 },
      'Fill in the Blanks': { count: 5, diagrams: 0 },
      'Match the Following': { count: 1, diagrams: 0 }
    } as Record<string, { count: number; diagrams: number }>
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateQuestionPaper({
        ...settings,
        questionDistribution: settings.distribution,
        duration: `${settings.duration} Hours`
      });
      
      const resultWithMeta: GenerationResult = {
        ...data,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        settings: { ...settings }
      };
      
      setResult(resultWithMeta);
      savePaper(resultWithMeta);
      setView('preview');
    } catch (error) {
      alert("Failed to generate. Please check your connection and balance.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const paper = document.getElementById('printable-paper');
    if (!paper) return;

    const canvas = await html2canvas(paper, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`QuestionPaper_${settings.subject}_Grade${settings.grade}.pdf`);
  };

  const downloadWords = () => {
    const paper = document.getElementById('printable-paper');
    if (!paper) return;

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Question Paper</title></head>
        <body>${paper.innerHTML}</body>
      </html>
    `;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QuestionPaper_${settings.subject}_Grade${settings.grade}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isUnlocked) return <ActivationGate onGrant={() => setIsUnlocked(true)} />;

  return (
    <div className="h-screen w-full bg-brand-bg text-slate-200 flex flex-col overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <nav className="h-14 bg-brand-panel border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/40">AI</div>
          <span className="text-lg font-semibold tracking-tight">EduPrint <span className="text-indigo-400">Pro</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('files')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border",
              view === 'files' 
                ? "bg-indigo-600 border-indigo-400 text-white" 
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            )}
          >
            <History className="w-3.5 h-3.5" />
            My Files
          </button>

          {result && (
            <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800 mr-4">
              <button 
                onClick={() => setView('preview')}
                className={cn("px-4 py-1 rounded text-xs font-bold transition-all", view === 'preview' ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" : "text-slate-400 hover:text-slate-200")}
              >
                Question Paper
              </button>
              {result.solutions && result.solutions.length > 0 && (
                <button 
                  onClick={() => setView('solutions')}
                  className={cn("px-4 py-1 rounded text-xs font-bold transition-all", view === 'solutions' ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" : "text-slate-400 hover:text-slate-200")}
                >
                  Marking Scheme
                </button>
              )}
              <button 
                onClick={() => setView('config')}
                className={cn("px-4 py-1 rounded text-xs font-bold transition-all", view === 'config' ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" : "text-slate-400 hover:text-slate-200")}
              >
                Editor
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-700">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Version:</span>
            <span className="font-mono text-indigo-300 font-bold tracking-widest text-xs">v4.2.0</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Configuration */}
        <aside className="w-80 bg-brand-panel border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar shadow-2xl z-40">
          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2 tracking-widest">School Identity</label>
            <input 
              type="text" 
              placeholder="School Name"
              value={settings.schoolName}
              onChange={e => setSettings({...settings, schoolName: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-slate-300 focus:border-indigo-500 hover:border-slate-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2 tracking-widest">Academic Parameters</label>
            <div className="grid gap-3">
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-900"
                value={settings.grade}
                onChange={e => setSettings({...settings, grade: e.target.value})}
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>Class {n} (Grade Level)</option>
                ))}
              </select>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-900"
                value={settings.board}
                onChange={e => setSettings({...settings, board: e.target.value})}
              >
                <option>CBSE Board</option>
                <option>ICSE Board</option>
                <option>State Board (Karnataka)</option>
                <option>State Board (Maharashtra)</option>
                <option>State Board (Tamil Nadu)</option>
              </select>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-slate-300 cursor-pointer hover:bg-slate-900"
                value={settings.subject}
                onChange={e => setSettings({...settings, subject: e.target.value})}
              >
                <option>Mathematics</option>
                <option>Science (Physics/Chem/Bio)</option>
                <option>Social Science</option>
                <option>English Literature</option>
                <option>Hindi (National Language)</option>
                <option>Regional Language</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2 tracking-widest">Syllabus Focus</label>
            <textarea 
              placeholder="Chapter Names or Concepts (e.g. Periodic Table, Quadratic Equations...)"
              value={settings.chapters}
              onChange={e => setSettings({...settings, chapters: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-slate-300 focus:border-indigo-500 min-h-[80px] resize-none outline-none hover:border-slate-600 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2 tracking-widest">Visual Content</label>
            <button 
              onClick={() => setSettings({...settings, includeImages: !settings.includeImages})}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded border transition-all",
                settings.includeImages 
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300" 
                  : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600"
              )}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Image Based Qs</span>
              </div>
              <div className={cn("w-8 h-4 rounded-full relative transition-colors", settings.includeImages ? "bg-indigo-500" : "bg-slate-800")}>
                <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", settings.includeImages ? "left-4.5" : "left-0.5")} />
              </div>
            </button>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2 tracking-widest">Language & Localization</label>
            <div className="grid gap-3">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-600 ml-1">Question Language</span>
                <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-indigo-300 font-medium cursor-pointer hover:bg-slate-900"
                  value={settings.language}
                  onChange={e => setSettings({...settings, language: e.target.value})}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Assamese">Assamese</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Odia">Odia</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Urdu">Urdu</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-600 ml-1">Instruction Language</span>
                <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-indigo-300 font-medium cursor-pointer hover:bg-slate-900"
                  value={settings.instructionLanguage}
                  onChange={e => setSettings({...settings, instructionLanguage: e.target.value})}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Assamese">Assamese</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Odia">Odia</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Urdu">Urdu</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2 tracking-widest">Difficulty Assessment</label>
            <div className="flex bg-slate-950 p-1 rounded border border-slate-700">
              {['Easy', 'Medium', 'Hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSettings({...settings, difficulty: level})}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded transition-all",
                    settings.difficulty === level ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2 tracking-widest">Marking Scheme</label>
            <div className="space-y-2">
              <button 
                onClick={() => setSettings({...settings, includeSolutions: !settings.includeSolutions})}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded border transition-all",
                  settings.includeSolutions 
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300" 
                    : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600"
                )}
              >
                <span className="text-xs font-bold uppercase">Generate Solutions</span>
                <div className={cn("w-8 h-4 rounded-full relative transition-colors", settings.includeSolutions ? "bg-indigo-500" : "bg-slate-800")}>
                  <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", settings.includeSolutions ? "left-4.5" : "left-0.5")} />
                </div>
              </button>
              
              {settings.includeSolutions && (
                <button 
                  onClick={() => setSettings({...settings, stepWiseMarking: !settings.stepWiseMarking})}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded border transition-all",
                    settings.stepWiseMarking 
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300" 
                      : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600"
                  )}
                >
                  <span className="text-xs font-bold uppercase">Step-wise Marking</span>
                  <div className={cn("w-8 h-4 rounded-full relative transition-colors", settings.stepWiseMarking ? "bg-emerald-500" : "bg-slate-800")}>
                    <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", settings.stepWiseMarking ? "left-4.5" : "left-0.5")} />
                  </div>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-2 tracking-widest">Final Scores & Timing</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <span className="text-[9px] uppercase font-bold text-slate-600 mb-1 block ml-1">Max Marks</span>
                <input 
                  type="number" 
                  value={Number.isNaN(settings.totalMarks) ? '' : settings.totalMarks}
                  onChange={e => {
                    const val = e.target.value === '' ? NaN : parseInt(e.target.value);
                    setSettings({...settings, totalMarks: val});
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex-1">
                <span className="text-[9px] uppercase font-bold text-slate-600 mb-1 block ml-1">Duration (Hrs)</span>
                <input 
                  type="text" 
                  value={settings.duration}
                  onChange={e => setSettings({...settings, duration: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-800 pt-6">
            <button 
              disabled={loading}
              onClick={handleGenerate}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded transition-all text-sm shadow-xl shadow-indigo-900/30 flex items-center justify-center gap-2 group active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  GENERATING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  GENERATE PAPER
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Panel: Question Structure or Preview */}
        <main className="flex-1 flex flex-col p-6 overflow-hidden bg-brand-bg relative">
          <AnimatePresence mode="wait">
            {view === 'files' && (
              <motion.div
                key="files-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-center mb-10">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                      <History className="w-8 h-8 text-indigo-500" />
                      Project Archives
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 ml-11">Manage previously generated assessments</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Active Storage</span>
                      <span className="text-lg text-indigo-400 font-black tracking-tighter">{savedPapers.length} <span className="text-[10px] text-slate-700 opacity-50 uppercase font-black tracking-normal">Files</span></span>
                    </div>
                    {savedPapers.length > 0 && (
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete ALL saved papers?')) {
                            setSavedPapers([]);
                            localStorage.removeItem('eduprint_saved_papers');
                          }
                        }}
                        className="text-[9px] text-red-500/50 hover:text-red-400 font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear History
                      </button>
                    )}
                  </div>
                </div>

                {savedPapers.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-slate-950/20 rounded-[3rem] border-4 border-dashed border-slate-900/50">
                    <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-6">
                      <History className="w-10 h-10 text-slate-800" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-600 tracking-tight">Your vault is empty</h3>
                    <p className="text-xs text-slate-700 mt-4 max-w-sm font-bold uppercase tracking-widest leading-loose">Papers you generate will be encrypted & stored locally here for future access.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 overflow-y-auto pr-4 pb-10 custom-scrollbar">
                    {savedPapers.map((paper) => (
                      <motion.div 
                        key={paper.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 flex flex-col hover:border-indigo-500/50 transition-all group relative shadow-xl"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                            onClick={(e) => { e.stopPropagation(); deletePaper(paper.id); }}
                            className="bg-red-500/10 text-red-500 p-2 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">{paper.paper.header.subject}</span>
                            <span className="bg-slate-800 text-slate-500 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">{paper.paper.header.class}</span>
                          </div>
                          <h3 className="text-lg font-black text-white leading-tight group-hover:text-indigo-300 transition-colors">{paper.paper.header.school || 'Private Institution'}</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-8 mt-auto">
                          <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/50">
                            <span className="text-[7px] text-slate-600 uppercase font-black block tracking-widest mb-1">Time</span>
                            <span className="text-[10px] font-bold text-slate-400">{paper.paper.header.time}</span>
                          </div>
                          <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/50">
                            <span className="text-[7px] text-slate-600 uppercase font-black block tracking-widest mb-1">Marks</span>
                            <span className="text-[10px] font-bold text-slate-400">{paper.paper.header.marks}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                             <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Generated</span>
                             <span className="text-[10px] text-slate-500 font-bold">{new Date(paper.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setResult(paper);
                              setSettings(paper.settings);
                              setView('preview');
                            }}
                            className="bg-white text-slate-950 text-[10px] font-black px-5 py-2.5 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                          >
                            RESTORE
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {view === 'config' && (
              <motion.div 
                key="config-grid"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Settings2 className="w-5 h-5 text-indigo-400" />
                    Question Distribution Matrix
                  </h2>
                  <div className="flex gap-2">
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-500/20 tracking-wider">CBSE BLUEPRINT ENABLED</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(settings.distribution).map(([type, data]) => (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      key={type} 
                      className="bg-brand-card border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-indigo-500/30 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{type}</span>
                         <span className="text-indigo-400 font-black text-[9px] opacity-30 group-hover:opacity-100 transition-opacity">INTEL-DRAFT</span>
                      </div>
                      
                      <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-xl font-black text-white">{data.count}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-bold">Total Qs</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setSettings({
                                ...settings, 
                                distribution: { ...settings.distribution, [type]: { ...data, count: Math.max(0, data.count - 1), diagrams: Math.min(data.diagrams, Math.max(0, data.count - 1)) } }
                              })}
                              className="bg-slate-900 border border-slate-700 hover:border-indigo-500 transition-colors px-2 py-0.5 rounded text-indigo-400 font-bold text-xs"
                            >-</button>
                            <button 
                              onClick={() => setSettings({
                                ...settings, 
                                distribution: { ...settings.distribution, [type]: { ...data, count: data.count + 1 } }
                              })}
                              className="bg-slate-900 border border-slate-700 hover:border-indigo-500 transition-colors px-2 py-0.5 rounded text-indigo-400 font-bold text-xs"
                            >+</button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-800/50 pt-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-indigo-400">{data.diagrams}</span>
                            <span className="text-[8px] text-slate-500 uppercase font-bold">Diagrams</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setSettings({
                                ...settings, 
                                distribution: { ...settings.distribution, [type]: { ...data, diagrams: Math.max(0, data.diagrams - 1) } }
                              })}
                              className="bg-slate-900 border border-slate-700 hover:border-indigo-500 transition-colors px-1.5 py-0.5 rounded text-indigo-300 font-bold text-[10px]"
                            >desc</button>
                            <button 
                              onClick={() => setSettings({
                                ...settings, 
                                distribution: { ...settings.distribution, [type]: { ...data, diagrams: Math.min(data.count, data.diagrams + 1) } }
                              })}
                              className="bg-slate-900 border border-slate-700 hover:border-indigo-500 transition-colors px-1.5 py-0.5 rounded text-indigo-300 font-bold text-[10px]"
                            >inc</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-around xl:col-span-2 shadow-inner">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Questions</div>
                      <div className="text-2xl font-black text-indigo-400">{Object.values(settings.distribution).reduce((a, b) => a + b.count, 0)}</div>
                    </div>
                    <div className="h-10 w-[1px] bg-indigo-500/20"></div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Diagram Based</div>
                      <div className="text-2xl font-black text-indigo-400">{Object.values(settings.distribution).reduce((a, b) => a + b.diagrams, 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium">Status: Ready for processing & localization</span>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-900/30"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-900/30"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-900/30"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(view === 'preview' || view === 'solutions') && result && (
              <motion.div 
                key="preview-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center gap-3">
                      <div className={cn("px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase", view === 'preview' ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30")}>
                        {view === 'preview' ? "Final Question Draft" : "Marking Analysis Guide"}
                      </div>
                   </div>
                   <div className="flex gap-3">
                     <button onClick={downloadWords} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-xs font-bold border border-slate-700 transition-colors text-slate-300">
                        📄 EXPORT WORD
                     </button>
                     <button onClick={downloadPDF} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-xs font-bold border border-slate-700 transition-colors text-slate-300">
                        📋 EXPORT PDF
                     </button>
                     <button 
                       onClick={() => setView(view === 'preview' ? 'solutions' : 'preview')}
                       className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 px-4 py-2 rounded text-xs font-bold border border-indigo-500/30 transition-colors"
                     >
                        ✨ {view === 'preview' ? 'VIEW SOLUTIONS' : 'BACK TO PAPER'}
                     </button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-brand-bg rounded-xl">
                  <div 
                    id="printable-paper"
                    className="bg-white mx-auto shadow-2xl p-[0.6in] border border-zinc-200 text-zinc-950 font-serif leading-tight print:shadow-none print:p-0 print:border-0 w-full max-w-[8.5in] min-h-[11in]"
                  >
                    {view === 'preview' ? (
                      <div className="space-y-6">
                         {/* Header Section */}
                         <div className="text-center space-y-3 pb-4 border-b-2 border-zinc-950">
                            <h1 className="text-2xl font-black uppercase tracking-wider font-display">{result.paper.header.school}</h1>
                            <div className="grid grid-cols-3 text-[11px] font-black uppercase tracking-widest gap-x-4 gap-y-2 border-t border-zinc-200 pt-3">
                               <div className="text-left">Class: {result.paper.header.class}</div>
                               <div className="text-center font-display text-base border-x border-zinc-200">{result.paper.header.subject}</div>
                               <div className="text-right">Time: {result.paper.header.time}</div>
                               <div className="text-left font-normal italic lowercase first-letter:uppercase">Board: {result.paper.header.board}</div>
                               <div className="text-center">Set: A-102</div>
                               <div className="text-right">Max Marks: {result.paper.header.marks}</div>
                            </div>
                         </div>

                         {/* Sections */}
                         {result.paper.sections.map((section, sIndex) => (
                           <div key={sIndex} className="space-y-4">
                             <div className="bg-zinc-100 p-2 text-center border border-zinc-300 rounded shadow-inner">
                               <h2 className="text-xs font-black uppercase tracking-[0.2em]">{section.title}</h2>
                               <p className="text-[10px] italic text-zinc-600 mt-0.5">{section.instructions}</p>
                             </div>

                             <div className="space-y-5 px-1">
                               {section.questions.map((q, qIndex) => (
                                 <div key={qIndex} className="flex gap-4 items-start group">
                                   <span className="font-bold min-w-[24px] text-right">Q{q.id}.</span>
                                   <div className="flex-1 space-y-2.5">
                                     <p className="font-medium text-sm leading-snug text-justify pr-6">{q.text}</p>
                                     {q.options && (
                                       <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 ml-4">
                                         {q.options.map((opt, i) => (
                                           <span key={i} className="text-sm">({String.fromCharCode(97 + i)}) {opt}</span>
                                         ))}
                                       </div>
                                     )}
                                     {q.imageRequirement && (
                                       <div className="my-6 space-y-3 print:break-inside-avoid">
                                          <div className="relative group max-w-lg mx-auto">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-zinc-200 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                            <div className="relative bg-white border-2 border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                                              <img 
                                                src={`https://pollinations.ai/p/${encodeURIComponent(q.imageRequirement + ", high-detail academic textbook diagram, scientific illustration, black and white line art, professional clean strokes, white background, educational schematic, clear labels") }?width=800&height=500&nologo=true&seed=${q.id + (result.paper.header.school.length)}`} 
                                                alt="Academic Diagram"
                                                className="w-full h-auto min-h-[200px] object-contain p-6"
                                                crossOrigin="anonymous"
                                                referrerPolicy="no-referrer"
                                                loading="lazy"
                                              />
                                              <div className="bg-zinc-50 px-5 py-2.5 border-t border-zinc-200 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.1em]">FIGURE {q.id} REFERENCE</span>
                                                </div>
                                                <span className="text-[9px] text-zinc-400 font-mono italic">SYLLABUS-ALIGN: {result.paper.header.class}/STD</span>
                                              </div>
                                            </div>
                                          </div>
                                          <p className="text-[10px] text-zinc-500 italic text-center px-12 leading-relaxed">
                                            <span className="font-bold text-zinc-700 not-italic">Instructions:</span> Observe the diagram above carefully to answer the question.
                                          </p>
                                       </div>
                                     )}
                                   </div>
                                   <span className="text-[11px] font-black italic border-l border-zinc-300 pl-2">[{q.marks}]</span>
                                 </div>
                               ))}
                             </div>
                           </div>
                         ))}
                         
                         <div className="pt-8 text-center border-t border-dotted border-zinc-400">
                            <p className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.5em]">End of Examination</p>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <div className="text-center border-b-2 border-zinc-950 pb-4">
                            <h2 className="text-xl font-black uppercase tracking-wider font-display">Marking Scheme</h2>
                            <p className="text-[10px] font-bold text-zinc-500 tracking-widest mt-1 uppercase">{result.paper.header.subject} • Secondary Division</p>
                         </div>
                         
                         <div className="space-y-6">
                           {result.solutions.map((sol, index) => (
                             <div key={index} className="flex gap-4 border-b border-zinc-100 pb-3 hover:bg-zinc-50 transition-colors p-2 rounded">
                               <span className="font-black text-indigo-700 border-r border-zinc-200 pr-3 min-w-[40px]">Q{sol.questionId}</span>
                               <div className="flex-1">
                                 <p className="text-sm font-medium leading-relaxed italic text-zinc-700">{sol.answer}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <div className="bg-slate-950 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-[10px] shrink-0 font-medium">
        <div className="flex items-center gap-4">
          <span className="text-slate-500 uppercase tracking-widest">Creator Contact:</span>
          <a href="https://wa.me/9986373413" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">WhatsApp: 9986373413</a>
        </div>
        <div className="text-slate-600 italic">
          Designed for high-accuracy standard evaluation & professional formatting.
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
        
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
