import { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard,
  Calculator,
  ArrowRightLeft,
  Coins,
  Receipt,
  Tag,
  Palette,
  Image as ImageIcon,
  Cake,
  CheckSquare,
  Menu,
  X,
  Trash2,
  CheckCircle,
  Upload,
  Download,
  Copy,
  ChevronRight,
  ChevronDown,
  Gauge,
  Landmark,
  Activity,
  Lock,
  Binary,
  FileJson,
  RefreshCw,
  AlertCircle,
  QrCode,
  Search,
  Type,
  FileText,
  GitCompare,
  Sparkles,
  AlignLeft,
  Database,
  Fingerprint,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  BarChart,
  Wallet,
  Flag,
  Calendar,
  History,
  AlarmClock,
  TrendingUp,
  Hourglass,
  Monitor,
  Wifi,
  Globe,
  Smartphone,
  Maximize,

} from 'lucide-react';

// --- UTILS ---

const getCurrencySymbol = () => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') {
      return '₹';
    }
    return '$';
  } catch (e) {
    return '$';
  }
};

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// --- SHARED COMPONENTS ---

const ToolCard = ({ title, desc, icon: Icon, onClick, colorClass }) => (
  <div onClick={onClick} className="relative overflow-hidden bg-slate-900 p-6 rounded-2xl border border-slate-800/60 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/30 transition-all duration-300 group h-full">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass.replace('text-', 'from-').replace('500', '500/10')} to-transparent rounded-bl-full -mr-8 -mt-8 transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none`} />
    <div className={`w-12 h-12 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner`}>
      <Icon size={24} strokeWidth={2} />
    </div>
    <h3 className="text-lg font-bold text-white mb-1 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-400 font-medium">{desc}</p>
  </div>
);

const Toast = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-primary-500/30 text-white px-6 py-3 rounded-xl shadow-2xl shadow-primary-500/20 flex items-center gap-3 transition-all duration-300 z-50 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="bg-primary-500/20 p-1 rounded-full text-primary-400"><CheckCircle size={16} /></div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

const BalanceChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => Math.abs(d.amount)), 10);

  return (
    <div className="space-y-4 py-2">
      {data.map(d => {
        const isPositive = d.amount >= 0;
        const widthPct = (Math.abs(d.amount) / maxVal) * 100;
        return (
          <div key={d.name} className="flex items-center text-xs">
            <div className="w-20 text-right pr-3 text-slate-400 font-medium truncate">{d.name}</div>
            <div className="flex-1 h-8 bg-slate-950/50 rounded-lg relative flex items-center overflow-hidden border border-slate-800/50">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800"></div>
              <div
                className={`h-full transition-all duration-700 ease-out ${isPositive ? 'bg-emerald-500/20 border-r-2 border-emerald-500' : 'bg-rose-500/20 border-l-2 border-rose-500'}`}
                style={{
                  width: `${widthPct / 2}%`,
                  left: isPositive ? '50%' : `calc(50% - ${widthPct / 2}%)`
                }}
              ></div>
              <span className={`absolute ${isPositive ? 'left-[calc(50%+8px)]' : 'right-[calc(50%+8px)]'} ${isPositive ? 'text-emerald-400' : 'text-rose-400'} font-mono font-bold`}>
                {d.amount > 0 ? '+' : ''}{Math.round(d.amount)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
};

// --- TOOLS ---

const TextTools = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [text, setText] = useState('');
  const [text2, setText2] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const noSpace = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const readTime = Math.ceil(words / 200); // ~200 wpm

    return { words, chars, lines, noSpace, sentences, readTime };
  }, [text]);

  const handleTransform = (type) => {
    let newText = text;
    switch (type) {
      case 'upper': newText = text.toUpperCase(); break;
      case 'lower': newText = text.toLowerCase(); break;
      case 'title': newText = text.toLowerCase().replace(/(?:^|\s)\w/g, match => match.toUpperCase()); break;
      case 'sentence': newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()); break;
      case 'dedup': newText = [...new Set(text.split('\n'))].join('\n'); break;
      case 'trim': newText = text.replace(/\s+/g, ' ').trim(); break;
      case 'unique-words': newText = [...new Set(text.trim().split(/\s+/))].join(' '); break;
      default: break;
    }
    setText(newText);
  };

  const generateText = (type, count = 1, unit = 'paragraphs') => {
    if (type === 'lorem') {
      const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

      if (unit === 'paragraphs') {
        setText(Array(count).fill(lorem).join('\n\n'));
      } else if (unit === 'sentences') {
        const sentences = lorem.split('. ');
        let res = [];
        for (let i = 0; i < count; i++) res.push(sentences[i % sentences.length]);
        setText(res.join('. ') + '.');
      } else if (unit === 'words') {
        const words = lorem.split(' ');
        let res = [];
        for (let i = 0; i < count; i++) res.push(words[i % words.length]);
        setText(res.join(' '));
      }
    } else if (type === 'random') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let res = '';
      for (let i = 0; i < count * 100; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      setText(res);
    }
  };

  const copy = (txt) => {
    navigator.clipboard.writeText(txt);
    showToast('Copied!');
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Text Studio</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-[700px] shadow-2xl">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          {[
            { id: 'editor', label: 'Editor & Stats', icon: Type },
            { id: 'diff', label: 'Diff Checker', icon: GitCompare },
            { id: 'generate', label: 'Generators', icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-hidden flex flex-col bg-slate-900/30">
          {activeTab === 'editor' && (
            <div className="flex-1 flex flex-col gap-6 h-full">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-3 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
                  <button onClick={() => handleTransform('upper')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">UPPER</button>
                  <button onClick={() => handleTransform('lower')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">lower</button>
                  <button onClick={() => handleTransform('title')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Title Case</button>
                  <button onClick={() => handleTransform('sentence')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Sentence case</button>
                </div>

                <div className="w-px bg-slate-800 my-1"></div>

                <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
                  <button onClick={() => handleTransform('trim')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Trim</button>
                  <button onClick={() => handleTransform('dedup')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Unique Lines</button>
                  <button onClick={() => handleTransform('unique-words')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Unique Words</button>
                </div>

                <div className="ml-auto flex gap-2">
                  <button onClick={() => setText('')} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Clear"><Trash2 size={18} /></button>
                  <button onClick={() => copy(text)} className="p-2 text-primary-400 hover:text-white hover:bg-primary-500 rounded-lg transition-colors" title="Copy"><Copy size={18} /></button>
                </div>
              </div>

              {/* Editor */}
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-300 font-mono text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none leading-relaxed custom-scrollbar"
                placeholder="Type or paste content here..."
              ></textarea>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { label: 'Words', val: stats.words },
                  { label: 'Characters', val: stats.chars },
                  { label: 'Sentences', val: stats.sentences },
                  { label: 'Lines', val: stats.lines },
                  { label: 'No Spaces', val: stats.noSpace },
                  { label: 'Read Time', val: `~${stats.readTime} min` }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-white">{stat.val}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'diff' && (
            <div className="flex-1 flex flex-col gap-6 h-full">
              <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Original Text</span>
                  <textarea value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 outline-none custom-scrollbar" placeholder="Paste original text..."></textarea>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Modified Text</span>
                  <textarea value={text2} onChange={e => setText2(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 outline-none custom-scrollbar" placeholder="Paste modified text..."></textarea>
                </div>
              </div>

              <div className="h-48 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto custom-scrollbar font-mono text-xs">
                {(() => {
                  const lines1 = text.split('\n');
                  const lines2 = text2.split('\n');
                  const max = Math.max(lines1.length, lines2.length);
                  const output = [];
                  let hasDiff = false;

                  for (let i = 0; i < max; i++) {
                    const l1 = lines1[i] || '';
                    const l2 = lines2[i] || '';
                    if (l1 !== l2) {
                      hasDiff = true;
                      output.push(
                        <div key={i} className="grid grid-cols-2 gap-6 border-b border-slate-800/50 py-2 hover:bg-slate-900/50 transition-colors">
                          <div className="text-red-400 bg-red-500/10 px-2 py-1 rounded break-all border-l-2 border-red-500">- {l1 || <span className="italic opacity-30">empty</span>}</div>
                          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded break-all border-l-2 border-emerald-500">+ {l2 || <span className="italic opacity-30">empty</span>}</div>
                        </div>
                      );
                    }
                  }
                  return hasDiff ? output : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <CheckCircle size={32} className="mb-2 text-emerald-500" />
                      <p className="font-medium">Texts are identical</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="text-center space-y-3">
                <div className="p-5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl inline-block shadow-lg shadow-primary-500/20">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Content Generators</h3>
                <p className="text-slate-400 max-w-md mx-auto">Generate placeholder text for your designs and layouts instantly.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                <button
                  onClick={() => { generateText('lorem', 3); setActiveTab('editor'); }}
                  className="p-8 bg-slate-950 hover:bg-slate-900 rounded-[2rem] border border-slate-800 hover:border-primary-500/50 transition-all group text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlignLeft size={64} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
                      <AlignLeft size={24} className="text-primary-400" /> Lorem Ipsum
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">Generate 3 paragraphs of standard Latin placeholder text.</p>
                  </div>
                </button>

                <button
                  onClick={() => { generateText('random', 5); setActiveTab('editor'); }}
                  className="p-8 bg-slate-950 hover:bg-slate-900 rounded-[2rem] border border-slate-800 hover:border-primary-500/50 transition-all group text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Binary size={64} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
                      <Binary size={24} className="text-purple-400" /> Random String
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">Generate 500 characters of alphanumeric chaos for testing.</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalculatorTool = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleInput = (val) => {
    setDisplay(prev => prev === '0' || prev === 'Error' ? val : prev + val);
  };

  const clear = () => setDisplay('0');

  const calculate = () => {
    try {
      if (/[^0-9+\-*/.()]/.test(display)) throw new Error('Invalid');
      // eslint-disable-next-line no-new-func
      let res = new Function('return ' + display)();
      if (!isFinite(res) || isNaN(res)) throw new Error('Error');
      res = parseFloat(res.toPrecision(12));
      let displayVal = res.toString();
      if (Math.abs(res) > 1e9 || (Math.abs(res) < 1e-6 && res !== 0)) {
        displayVal = res.toExponential(4);
      }
      setHistory(prev => [{ eq: display, res: displayVal }, ...prev].slice(0, 20));
      setDisplay(displayVal);
    } catch (e) {
      setDisplay('Error');
    }
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-lg mx-auto relative">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Calculator</h2>

      <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="absolute top-6 left-6 p-2 text-slate-500 hover:text-white transition-colors z-10"
        >
          <History size={20} />
        </button>

        {/* Display */}
        <div className="mb-6 px-4 py-8 bg-slate-950 rounded-2xl text-right relative overflow-hidden mt-8">
          <div className="text-slate-500 text-sm h-6 mb-1 font-mono overflow-hidden text-ellipsis whitespace-nowrap">{history.length > 0 ? `${history[0].eq} =` : ''}</div>
          <input type="text" readOnly value={display} className="w-full bg-transparent text-5xl font-light text-white focus:outline-none overflow-x-auto text-right" />
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          <button onClick={clear} className="aspect-square rounded-full bg-slate-700 text-red-400 font-bold text-xl hover:bg-slate-600 active:scale-95 transition-all">AC</button>
          <button onClick={() => handleInput('(')} className="aspect-square rounded-full bg-slate-800 text-primary-400 font-bold text-xl hover:bg-slate-700 active:scale-95 transition-all">(</button>
          <button onClick={() => handleInput(')')} className="aspect-square rounded-full bg-slate-800 text-primary-400 font-bold text-xl hover:bg-slate-700 active:scale-95 transition-all">)</button>
          <button onClick={() => handleInput('/')} className="aspect-square rounded-full bg-amber-500 text-white font-bold text-2xl hover:bg-amber-400 active:scale-95 transition-all">÷</button>

          {['7', '8', '9'].map(n => <button key={n} onClick={() => handleInput(n)} className="aspect-square rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all">{n}</button>)}
          <button onClick={() => handleInput('*')} className="aspect-square rounded-full bg-amber-500 text-white font-bold text-2xl hover:bg-amber-400 active:scale-95 transition-all">×</button>

          {['4', '5', '6'].map(n => <button key={n} onClick={() => handleInput(n)} className="aspect-square rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all">{n}</button>)}
          <button onClick={() => handleInput('-')} className="aspect-square rounded-full bg-amber-500 text-white font-bold text-2xl hover:bg-amber-400 active:scale-95 transition-all">−</button>

          {['1', '2', '3'].map(n => <button key={n} onClick={() => handleInput(n)} className="aspect-square rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all">{n}</button>)}
          <button onClick={() => handleInput('+')} className="aspect-square rounded-full bg-amber-500 text-white font-bold text-2xl hover:bg-amber-400 active:scale-95 transition-all">+</button>

          <button onClick={() => handleInput('0')} className="col-span-2 aspect-[2/1] rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all flex items-center pl-8">0</button>
          <button onClick={() => handleInput('.')} className="aspect-square rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all">.</button>
          <button onClick={calculate} className="aspect-square rounded-full bg-primary-600 text-white font-bold text-2xl hover:bg-primary-500 active:scale-95 transition-all shadow-lg shadow-primary-600/30">=</button>
        </div>

        {/* History Overlay */}
        {showHistory && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><History size={18} /> History</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {history.length === 0 ? (
                <div className="text-center text-slate-500 mt-10 italic">No calculations yet</div>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-slate-400 text-sm text-right mb-1">{item.eq}</div>
                    <div className="text-emerald-400 text-xl font-bold text-right">= {item.res}</div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setHistory([])} className="mt-4 w-full py-3 bg-slate-800 text-red-400 rounded-xl font-bold hover:bg-slate-700 transition-colors">Clear History</button>
          </div>
        )}
      </div>
    </div>
  );
};

const SplitWise = () => {
  const currency = getCurrencySymbol();

  // Persistent State Initialization
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('omni-splitwise');
      return saved ? JSON.parse(saved) : { members: ['Alice', 'Bob'], expenses: [] };
    } catch (e) {
      return { members: ['Alice', 'Bob'], expenses: [] };
    }
  });

  const { members, expenses } = data;
  const [newMember, setNewMember] = useState('');
  const [newExp, setNewExp] = useState({ payer: members[0] || '', amount: '', desc: '' });

  useEffect(() => {
    localStorage.setItem('omni-splitwise', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (members.length > 0 && !members.includes(newExp.payer)) {
      setNewExp(prev => ({ ...prev, payer: members[0] }));
    }
  }, [members, newExp.payer]);

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setData(prev => ({ ...prev, members: [...prev.members, newMember.trim()] }));
      setNewMember('');
    }
  };

  const removeMember = (member) => {
    const isPayer = expenses.some(e => e.payer === member);
    if (isPayer) {
      alert(`Cannot remove ${member} because they have paid for expenses. Delete those expenses first.`);
      return;
    }
    setData(prev => ({ ...prev, members: prev.members.filter(m => m !== member) }));
  };

  const addExpense = () => {
    if (newExp.amount && newExp.desc && newExp.payer) {
      const expense = {
        ...newExp,
        id: Date.now(),
        amount: parseFloat(newExp.amount),
        date: new Date().toISOString()
      };
      setData(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
      setNewExp({ ...newExp, amount: '', desc: '' });
    }
  };

  const removeExpense = (id) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setData({ members: ['Alice', 'Bob'], expenses: [] });
    }
  };

  const stats = useMemo(() => {
    const balances = {};
    members.forEach(m => balances[m] = 0);
    let totalSpent = 0;

    expenses.forEach(e => {
      totalSpent += e.amount;
      const splitAmount = e.amount / members.length;
      if (balances[e.payer] !== undefined) balances[e.payer] += e.amount;
      members.forEach(m => {
        if (balances[m] !== undefined) balances[m] -= splitAmount;
      });
    });

    const memberBalances = Object.entries(balances).map(([name, amount]) => ({ name, amount }));

    const debtors = memberBalances.filter(m => m.amount < -0.01).sort((a, b) => a.amount - b.amount);
    const creditors = memberBalances.filter(m => m.amount > 0.01).sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let i = 0; let j = 0;

    const dCalc = debtors.map(d => ({ ...d }));
    const cCalc = creditors.map(c => ({ ...c }));

    while (i < dCalc.length && j < cCalc.length) {
      const debtor = dCalc[i];
      const creditor = cCalc[j];
      const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      transactions.push({ from: debtor.name, to: creditor.name, amount });
      debtor.amount += amount;
      creditor.amount -= amount;
      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return { totalSpent, balances: memberBalances, transactions };
  }, [expenses, members]);

  const exportData = () => {
    const header = ["Date", "Description", "Payer", "Amount", "Currency"];
    const rows = expenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      `"${e.desc}"`,
      e.payer,
      e.amount,
      currency
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `splitwise_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">SplitWise <span className="text-emerald-500">Pro</span></h2>
        <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition">Reset All Data</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full"></div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase font-bold tracking-wider mb-2"><Activity size={14} /> Total Group Spend</div>
          <div className="text-3xl font-black text-white tracking-tight mb-3">{currency}{stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Per Person</span>
              <span className="text-sm font-bold text-slate-300">{currency}{(members.length > 0 ? stats.totalSpent / members.length : 0).toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Share</span>
              <span className="text-sm font-bold text-slate-300">{(members.length > 0 ? 100 / members.length : 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs uppercase font-bold tracking-wider"><Users size={14} /> Members ({members.length})</div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3 max-h-20 overflow-y-auto custom-scrollbar">
            {members.map(m => (
              <span key={m} className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 group relative pr-6 transition-colors hover:border-slate-600">
                {m}
                <button onClick={() => removeMember(m)} className="absolute right-1 text-slate-500 hover:text-red-400 transition-colors"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="text" value={newMember} onChange={e => setNewMember(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition-colors" placeholder="New member name..." />
            <button onClick={addMember} className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-500 transition-transform active:scale-95"><Plus size={14} /></button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-center shadow-lg">
          <button onClick={exportData} className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-white transition-colors group">
            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-slate-700 group-hover:scale-110 transition-all"><Download size={24} className="text-emerald-500" /></div>
            <span className="text-xs font-bold uppercase tracking-wider">Export to CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2 uppercase tracking-wider"><Receipt size={16} className="text-emerald-400" /> Add New Expense</h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors">Description</span>
                  <input type="text" value={newExp.desc} onChange={e => setNewExp({ ...newExp, desc: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-3 pr-3 pt-7 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="Dinner, Uber, etc." />
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors">Amount</span>
                  <span className="absolute left-3 top-7 text-slate-400 text-sm">{currency}</span>
                  <input type="number" value={newExp.amount} onChange={e => setNewExp({ ...newExp, amount: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-7 pr-3 pt-7 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="0.00" />
                </div>
              </div>
              <div className="flex gap-3 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase pl-1">Paid by</span>
                <div className="flex-1 relative">
                  <select value={newExp.payer} onChange={e => setNewExp({ ...newExp, payer: e.target.value })} className="w-full appearance-none bg-transparent text-sm text-white outline-none cursor-pointer font-medium pl-2 py-1">
                    {members.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1.5 text-slate-500 pointer-events-none" />
                </div>
                <button onClick={addExpense} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">Add Expense</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
              <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{expenses.length} records</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {expenses.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                  <Receipt className="mx-auto text-slate-700 mb-3" size={32} />
                  <p className="text-slate-500 text-sm font-medium">No expenses recorded yet.</p>
                  <p className="text-slate-600 text-xs mt-1">Add your first expense above to get started.</p>
                </div>
              )}
              {[...expenses].reverse().map(e => (
                <div key={e.id} className="group flex justify-between items-center bg-slate-900 hover:bg-slate-800 p-4 rounded-xl border border-slate-800 transition-all hover:shadow-lg hover:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-300 font-bold text-sm border border-slate-700 shadow-inner">{e.payer.charAt(0)}</div>
                    <div>
                      <div className="text-sm text-white font-bold">{e.desc}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                        <span>{new Date(e.date).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="text-emerald-400">{e.payer} paid {currency}{e.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeExpense(e.id)} className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all bg-slate-800/50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2 uppercase tracking-wider"><BarChart size={16} className="text-blue-400" /> Net Balances</h3>
            <BalanceChart data={stats.balances} />
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-4 px-2 uppercase tracking-wider border-t border-slate-800 pt-3">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> Owes</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Gets Back</span>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
            <h3 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2 uppercase tracking-wider"><CheckCircle size={16} className="text-emerald-400" /> Settlement Plan</h3>
            {stats.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                <CheckCircle size={32} className="text-slate-700" />
                <p className="text-xs font-medium">All settled up!</p>
              </div>
            ) : (
              <div className="space-y-3 relative z-10">
                {stats.transactions.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white font-bold bg-slate-800 px-2 py-1 rounded-md">{d.from}</span>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Pays</span>
                        <ArrowRight size={12} className="text-slate-600" />
                      </div>
                      <span className="text-xs text-white font-bold bg-slate-800 px-2 py-1 rounded-md">{d.to}</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-400">{currency}{d.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge, group: 'main', description: 'Overview of all tools', keywords: 'home, start, index', colorClass: 'bg-slate-100 text-slate-500' },
  { id: 'splitwise', label: 'SplitWise', icon: Wallet, group: 'main', description: 'Track group expenses and balances', keywords: 'bill, share, cost, friend', colorClass: 'bg-emerald-100 text-emerald-500' },
  { id: 'calculator', label: 'Calculator', icon: Calculator, group: 'util', description: 'Standard & Scientific calculator', keywords: 'math, add, subtract, multiply, divide, sin, cos, tan', colorClass: 'bg-blue-100 text-blue-500' },
  { id: 'unit-converter', label: 'Unit Converter', icon: ArrowRightLeft, group: 'util', description: 'Convert length, weight, temperature', keywords: 'metric, imperial, cm, inch, kg, lbs, celsius, fahrenheit', colorClass: 'bg-indigo-100 text-indigo-500' },
  { id: 'currency', label: 'Currency', icon: Coins, group: 'util', description: 'Real-time exchange rates', keywords: 'money, forex, usd, eur, inr, convert', colorClass: 'bg-yellow-100 text-yellow-500' },
  { id: 'time-suite', label: 'Time Suite', icon: Clock, group: 'util', description: 'Stopwatch, Timer, Pomodoro', keywords: 'alarm, focus, unix, date, epoch', colorClass: 'bg-sky-100 text-sky-500' },
  { id: 'text-tools', label: 'Text Studio', icon: FileText, group: 'util', description: 'Manipulate and analyze text', keywords: 'word count, character count, case, lorem ipsum, diff', colorClass: 'bg-indigo-100 text-indigo-400' },
  { id: 'finance-suite', label: 'Finance', icon: Briefcase, group: 'util', description: 'GST, Discount, Tax, SIP', keywords: 'money, invest, loan, profit, margin, salary', colorClass: 'bg-green-100 text-green-600' },
  { id: 'split-bill', label: 'Quick Split', icon: Receipt, group: 'life', description: 'Simple bill splitter with tip', keywords: 'restaurant, tip, share', colorClass: 'bg-orange-100 text-orange-500' },
  { id: 'rate-calc', label: 'Rate Calc', icon: Tag, group: 'life', description: 'Calculate item rates and totals', keywords: 'price, quantity, unit', colorClass: 'bg-pink-100 text-pink-500' },
  { id: 'emi-calc', label: 'EMI Calc', icon: Landmark, group: 'life', description: 'Loan EMI calculator', keywords: 'loan, interest, bank, mortgage', colorClass: 'bg-teal-100 text-teal-500' },
  { id: 'health', label: 'Health', icon: Activity, group: 'life', description: 'BMI & BMR Calculator', keywords: 'fitness, weight, height, calories, diet', colorClass: 'bg-rose-100 text-rose-500' },
  { id: 'password', label: 'Password', icon: Lock, group: 'tech', description: 'Secure password generator', keywords: 'security, random, strong', colorClass: 'bg-indigo-100 text-indigo-500' },
  { id: 'regex', label: 'Regex Builder', icon: Search, group: 'tech', description: 'Visual Regular Expression builder', keywords: 'pattern, match, find, replace', colorClass: 'bg-pink-100 text-pink-600' },
  { id: 'devtools', label: 'Dev Tools', icon: Binary, group: 'tech', description: 'Base64, URL, Hash utilities', keywords: 'encode, decode, sha, md5, developer', colorClass: 'bg-violet-100 text-violet-500' },
  { id: 'json', label: 'JSON', icon: FileJson, group: 'tech', description: 'Formatter and Validator', keywords: 'pretty, lint, debug, object', colorClass: 'bg-amber-100 text-amber-500' },
  { id: 'yaml', label: 'YAML', icon: Database, group: 'tech', description: 'YAML to JSON converter', keywords: 'config, convert, data', colorClass: 'bg-fuchsia-100 text-fuchsia-500' },
  { id: 'uuid', label: 'UUID', icon: Fingerprint, group: 'tech', description: 'Generate UUIDs', keywords: 'guid, id, random, unique', colorClass: 'bg-slate-100 text-slate-400' },
  { id: 'qr', label: 'QR Gen', icon: QrCode, group: 'tech', description: 'Create QR Codes', keywords: 'barcode, scan, link, share', colorClass: 'bg-indigo-100 text-indigo-500' },
  { id: 'color-studio', label: 'Color Studio', icon: Palette, group: 'media', description: 'Color picker and palettes', keywords: 'hex, rgb, hsl, design, contrast', colorClass: 'bg-cyan-100 text-cyan-500' },
  { id: 'image-resizer', label: 'Image Resizer', icon: ImageIcon, group: 'media', description: 'Resize and compress images', keywords: 'photo, picture, scale, dimension', colorClass: 'bg-purple-100 text-purple-500' },
  { id: 'age-calc', label: 'Age Calc', icon: Cake, group: 'life', description: 'Calculate exact age', keywords: 'birthday, date, years, months', colorClass: 'bg-red-100 text-red-500' },
  { id: 'todo', label: 'To-Do', icon: CheckSquare, group: 'life', description: 'Task manager', keywords: 'list, task, done, check', colorClass: 'bg-lime-100 text-lime-500' },
  { id: 'aspect-ratio', label: 'Aspect Ratio', icon: Maximize, group: 'media', description: 'Calculate screen dimensions', keywords: 'width, height, resolution, screen', colorClass: 'bg-fuchsia-100 text-fuchsia-500' },
  { id: 'network', label: 'Network Info', icon: Wifi, group: 'tech', description: 'IP and System details', keywords: 'ip address, user agent, browser, connection', colorClass: 'bg-cyan-100 text-cyan-500' },
  { id: 'markdown', label: 'Markdown', icon: FileText, group: 'tech', description: 'Live Markdown Preview', keywords: 'editor, preview, md, text', colorClass: 'bg-rose-100 text-rose-500' },
];

const Dashboard = ({ changeTool }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = menuItems.filter(item => {
    if (item.id === 'dashboard') return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.label.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.keywords.toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-fade-in p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-10 relative">
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Welcome Back</h2>
        <p className="text-slate-400 text-lg max-w-2xl mb-8">Your all-in-one developer and lifestyle utility suite. Select a tool to get started.</p>

        {/* Search Bar */}
        <div className="relative max-w-xl group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Search className="text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tools (e.g., 'base64', 'bmi', 'tax')..."
            className="w-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-slate-500 outline-none focus:border-primary-500/50 focus:bg-slate-900 transition-all shadow-lg"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 mb-4">
            <Search className="text-slate-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No tools found</h3>
          <p className="text-slate-500">Try searching for something else like "calculator" or "color".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              title={tool.label}
              desc={tool.description}
              icon={tool.icon}
              onClick={() => changeTool(tool.id)}
              colorClass={tool.colorClass}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const UNIT_DATA = {
  length: { m: 'm', km: 'km', cm: 'cm', mm: 'mm', ft: 'ft', inch: 'in', mi: 'mi' },
  weight: { kg: 'kg', g: 'g', mg: 'mg', lb: 'lb', oz: 'oz' },
  temp: { c: '°C', f: '°F', k: 'K' },
  data: { b: 'B', kb: 'KB', mb: 'MB', gb: 'GB' }
};

const UNIT_FACTORS = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, inch: 0.0254, mi: 1609.34 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 },
  data: { b: 1, kb: 1024, mb: 1048576, gb: 1073741824 }
};

const UnitConverter = () => {
  const [category, setCategory] = useState('length');
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [result, setResult] = useState(0);

  useEffect(() => {
    const keys = Object.keys(UNIT_DATA[category]);
    if (keys.length > 0) {
      setFromUnit(keys[0]);
      setToUnit(keys[1] || keys[0]);
    }
  }, [category]);

  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) { setResult(0); return; }
    let res = 0;
    if (category === 'temp') {
      if (fromUnit === toUnit) res = val;
      else if (fromUnit === 'c' && toUnit === 'f') res = (val * 9 / 5) + 32;
      else if (fromUnit === 'c' && toUnit === 'k') res = val + 273.15;
      else if (fromUnit === 'f' && toUnit === 'c') res = (val - 32) * 5 / 9;
      else if (fromUnit === 'f' && toUnit === 'k') res = (val - 32) * 5 / 9 + 273.15;
      else if (fromUnit === 'k' && toUnit === 'c') res = val - 273.15;
      else if (fromUnit === 'k' && toUnit === 'f') res = (val - 273.15) * 9 / 5 + 32;
    } else {
      const factors = UNIT_FACTORS[category];
      if (factors && factors[fromUnit] !== undefined && factors[toUnit] !== undefined) {
        const factorFrom = factors[fromUnit];
        const factorTo = factors[toUnit];
        const inBase = val * factorFrom;
        res = inBase / factorTo;
      } else { res = 0; }
    }
    setResult((!isFinite(res) || isNaN(res)) ? 0 : (Number.isInteger(res) ? res : parseFloat(res.toFixed(4))));
  }, [amount, fromUnit, toUnit, category]);

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Unit Converter</h2>

      {/* Category Selector */}
      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {Object.keys(UNIT_DATA).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all transform active:scale-95 ${category === cat ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* From Section */}
          <div className="flex-1 w-full space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">From</label>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 focus-within:border-primary-500 transition-colors group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-4xl font-light text-white outline-none mb-2"
                placeholder="0"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-slate-800 text-slate-400 text-sm font-medium outline-none cursor-pointer hover:text-white transition-colors"
              >
                {UNIT_DATA[category] && Object.entries(UNIT_DATA[category]).map(([key, label]) => <option key={key} value={key} className="bg-slate-800 text-white">{key} ({label})</option>)}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={() => { setFromUnit(toUnit); setToUnit(fromUnit); }}
            className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 hover:border-primary-500 hover:bg-slate-700 text-slate-400 hover:text-primary-400 flex items-center justify-center transition-all transform hover:rotate-180 shadow-lg z-10"
          >
            <ArrowRightLeft size={24} />
          </button>

          {/* To Section */}
          <div className="flex-1 w-full space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">To</label>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 group">
              <div className="w-full bg-transparent text-4xl font-light text-emerald-400 mb-2 overflow-hidden text-ellipsis">
                {result}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-slate-800 text-slate-400 text-sm font-medium outline-none cursor-pointer hover:text-white transition-colors"
              >
                {UNIT_DATA[category] && Object.entries(UNIT_DATA[category]).map(([key, label]) => <option key={key} value={key} className="bg-slate-800 text-white">{key} ({label})</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SplitBill = () => {
  const [total, setTotal] = useState('');
  const [tip, setTip] = useState(15);
  const [people, setPeople] = useState(2);
  const currency = getCurrencySymbol();

  const tipAmount = (parseFloat(total) || 0) * (tip / 100);
  const totalWithTip = (parseFloat(total) || 0) + tipAmount;
  const perPerson = totalWithTip / (people || 1);

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Split Bill</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] space-y-8 shadow-xl">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Total Bill</label>
            <div className="relative group">
              <span className="absolute left-4 top-4 text-slate-500 text-xl font-medium group-focus-within:text-primary-500 transition-colors">{currency}</span>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-10 pr-4 text-2xl text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">Tip Percentage</label>
              <span className="text-xl font-bold text-primary-400 bg-primary-400/10 px-3 py-1 rounded-lg">{tip}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={tip}
              onChange={(e) => setTip(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400 transition-all"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2 font-medium">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Number of People</label>
            <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-2xl border border-slate-800">
              <button
                onClick={() => setPeople(Math.max(1, people - 1))}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xl font-bold transition-all active:scale-95"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-white">{people}</span>
                <span className="text-xs text-slate-500 block font-medium uppercase">People</span>
              </div>
              <button
                onClick={() => setPeople(people + 1)}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xl font-bold transition-all active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] flex flex-col justify-between shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 mb-8 opacity-50">
              <Receipt size={24} />
              <span className="font-bold tracking-widest uppercase text-sm">Bill Receipt</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-400 font-medium">
                <span>Bill Amount</span>
                <span className="font-bold text-white">{currency}{(parseFloat(total) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 font-medium">
                <span>Total Tip ({tip}%)</span>
                <span className="font-bold text-emerald-400">+{currency}{tipAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-800 my-4"></div>
              <div className="flex justify-between items-center text-xl font-bold text-white">
                <span>Total Pay</span>
                <span>{currency}{totalWithTip.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-slate-950 text-white p-6 rounded-2xl text-center relative overflow-hidden border border-slate-800">
            <div className="relative z-10">
              <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Amount Per Person</div>
              <div className="text-5xl font-black tracking-tight">{currency}{perPerson.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinanceSuite = () => {
  const [tab, setTab] = useState('gst');
  const currency = getCurrencySymbol();

  // GST
  const [gstPrice, setGstPrice] = useState(1000);
  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] = useState('exclusive'); // exclusive or inclusive

  const calculateGst = () => {
    const price = parseFloat(gstPrice) || 0;
    const rate = parseFloat(gstRate) || 0;

    if (gstType === 'exclusive') {
      const tax = price * (rate / 100);
      return { net: price, tax: tax, total: price + tax };
    } else {
      const tax = price - (price * (100 / (100 + rate)));
      return { net: price - tax, tax: tax, total: price };
    }
  };

  const gstResult = calculateGst();

  // Discount
  const [discPrice, setDiscPrice] = useState(5000);
  const [discRate, setDiscRate] = useState(20);
  const discAmt = discPrice * (discRate / 100);
  const finalPrice = discPrice - discAmt;

  // SIP
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  const calculateSip = () => {
    const monthlyRate = sipRate / 12 / 100;
    const months = sipYears * 12;
    const invested = sipAmount * months;

    if (sipRate === 0) return { invested, returns: 0, total: invested };

    const total = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const returns = total - invested;

    return { invested, returns, total };
  };

  const sipResult = calculateSip();

  const setSipTemplate = (type) => {
    switch (type) {
      case 'fd': setSipRate(7); break;
      case 'gold': setSipRate(10); break;
      case 'nifty': setSipRate(12); break;
      case 'high': setSipRate(15); break;
      default: break;
    }
  };

  // Income Tax
  const [salary, setSalary] = useState(1200000);
  const [regime, setRegime] = useState('new'); // 'new' or 'old'
  const [deductions, setDeductions] = useState(0); // 80C etc for Old

  // Profit & Margin
  const [profitMode, setProfitMode] = useState('find_margin'); // find_margin, find_sp, find_cp
  const [cp, setCp] = useState(100);
  const [sp, setSp] = useState(125);
  const [margin, setMargin] = useState(20);

  const calculateProfit = () => {
    let resCp = parseFloat(cp) || 0;
    let resSp = parseFloat(sp) || 0;
    let resMargin = parseFloat(margin) || 0;
    let profit = 0;
    let markup = 0;

    if (profitMode === 'find_margin') {
      profit = resSp - resCp;
      resMargin = resSp !== 0 ? (profit / resSp) * 100 : 0;
      markup = resCp !== 0 ? (profit / resCp) * 100 : 0;
    } else if (profitMode === 'find_sp') {
      // SP = CP / (1 - Margin%)
      resSp = resCp / (1 - (resMargin / 100));
      profit = resSp - resCp;
      markup = resCp !== 0 ? (profit / resCp) * 100 : 0;
    } else if (profitMode === 'find_cp') {
      // CP = SP * (1 - Margin%)
      resCp = resSp * (1 - (resMargin / 100));
      profit = resSp - resCp;
      markup = resCp !== 0 ? (profit / resCp) * 100 : 0;
    }

    return { cp: resCp, sp: resSp, margin: resMargin, profit, markup };
  };

  const profitRes = calculateProfit();

  const calculateTax = () => {
    const stdDed = regime === 'new' ? 75000 : 50000;
    let taxable = Math.max(0, salary - stdDed - (regime === 'old' ? deductions : 0));

    let tax = 0;
    const breakdown = [];

    if (regime === 'new') {
      // New Regime FY 24-25
      if (taxable <= 300000) {
        breakdown.push({ range: '0 - 3L', rate: '0%', amt: 0 });
      } else {
        breakdown.push({ range: '0 - 3L', rate: '0%', amt: 0 });

        if (taxable > 300000) {
          const slab = Math.min(taxable, 700000) - 300000;
          const t = slab * 0.05;
          tax += t;
          breakdown.push({ range: '3L - 7L', rate: '5%', amt: t });
        }
        if (taxable > 700000) {
          const slab = Math.min(taxable, 1000000) - 700000;
          const t = slab * 0.10;
          tax += t;
          breakdown.push({ range: '7L - 10L', rate: '10%', amt: t });
        }
        if (taxable > 1000000) {
          const slab = Math.min(taxable, 1200000) - 1000000;
          const t = slab * 0.15;
          tax += t;
          breakdown.push({ range: '10L - 12L', rate: '15%', amt: t });
        }
        if (taxable > 1200000) {
          const slab = Math.min(taxable, 1500000) - 1200000;
          const t = slab * 0.20;
          tax += t;
          breakdown.push({ range: '12L - 15L', rate: '20%', amt: t });
        }
        if (taxable > 1500000) {
          const slab = taxable - 1500000;
          const t = slab * 0.30;
          tax += t;
          breakdown.push({ range: '15L+', rate: '30%', amt: t });
        }
      }
      // Rebate 87A for New Regime (Income up to 7L)
      if (taxable <= 700000) tax = 0;

    } else {
      // Old Regime (Approx)
      if (taxable <= 250000) {
        breakdown.push({ range: '0 - 2.5L', rate: '0%', amt: 0 });
      } else {
        breakdown.push({ range: '0 - 2.5L', rate: '0%', amt: 0 });

        if (taxable > 250000) {
          const slab = Math.min(taxable, 500000) - 250000;
          const t = slab * 0.05;
          tax += t;
          breakdown.push({ range: '2.5L - 5L', rate: '5%', amt: t });
        }
        if (taxable > 500000) {
          const slab = Math.min(taxable, 1000000) - 500000;
          const t = slab * 0.20;
          tax += t;
          breakdown.push({ range: '5L - 10L', rate: '20%', amt: t });
        }
        if (taxable > 1000000) {
          const slab = taxable - 1000000;
          const t = slab * 0.30;
          tax += t;
          breakdown.push({ range: '> 10L', rate: '30%', amt: t });
        }
      }
      // Rebate 87A for Old Regime (Income up to 5L)
      if (taxable <= 500000) tax = 0;
    }

    const cess = tax * 0.04;
    return { taxable, tax, cess, total: tax + cess, breakdown, stdDed };
  };

  const taxRes = calculateTax();

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Finance Suite</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2 overflow-x-auto">
          {[
            { id: 'gst', label: 'GST Calculator', icon: Receipt },
            { id: 'discount', label: 'Discount', icon: Tag },
            { id: 'profit', label: 'Profit & Margin', icon: TrendingUp },
            { id: 'sip', label: 'SIP Calculator', icon: TrendingUp },
            { id: 'tax', label: 'Income Tax', icon: Landmark }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${tab === t.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-8 bg-slate-900/30 min-h-[400px]">
          {tab === 'gst' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                    <input
                      type="number"
                      value={gstPrice}
                      onChange={e => setGstPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GST Rate ({gstRate}%)</label>
                  <div className="flex gap-2 mb-4">
                    {[5, 12, 18, 28].map(r => (
                      <button
                        key={r}
                        onClick={() => setGstRate(r)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${gstRate === r ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                  <input type="range" min="0" max="50" value={gstRate} onChange={e => setGstRate(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                </div>

                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button onClick={() => setGstType('exclusive')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gstType === 'exclusive' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Exclusive (Add Tax)</button>
                  <button onClick={() => setGstType('inclusive')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gstType === 'inclusive' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Inclusive (Remove Tax)</button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                    <span className="text-slate-400 font-medium">Net Amount</span>
                    <span className="text-xl text-white font-mono">{currency}{gstResult.net.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                    <span className="text-slate-400 font-medium">GST ({gstRate}%)</span>
                    <span className="text-xl text-red-400 font-mono">+{currency}{gstResult.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-300 font-bold text-lg">Total Amount</span>
                    <span className="text-4xl text-emerald-400 font-bold font-mono">{currency}{gstResult.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'discount' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Original Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                    <input
                      type="number"
                      value={discPrice}
                      onChange={e => setDiscPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Discount ({discRate}%)</label>
                  <div className="flex gap-2 mb-4">
                    {[10, 20, 30, 50, 70].map(r => (
                      <button
                        key={r}
                        onClick={() => setDiscRate(r)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${discRate === r ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                  <input type="range" min="0" max="100" value={discRate} onChange={e => setDiscRate(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="relative z-10 text-white">
                    <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">You Pay</div>
                    <div className="text-5xl font-bold mb-2">{currency}{finalPrice.toFixed(2)}</div>
                    <div className="text-sm opacity-90">After {discRate}% discount</div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
                  <span className="text-slate-400 font-medium">You Save</span>
                  <span className="text-2xl font-bold text-emerald-400">{currency}{discAmt.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'sip' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monthly Investment</label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                    <input
                      type="number"
                      value={sipAmount}
                      onChange={e => setSipAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Expected Return Rate (p.a)</label>
                  <div className="flex gap-2 mb-4">
                    {[
                      { l: 'FD', v: 7, k: 'fd' },
                      { l: 'Gold', v: 10, k: 'gold' },
                      { l: 'Nifty', v: 12, k: 'nifty' },
                      { l: 'High', v: 15, k: 'high' }
                    ].map(t => (
                      <button
                        key={t.k}
                        onClick={() => setSipTemplate(t.k)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${sipRate === t.v ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        {t.l} ({t.v}%)
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="range" min="1" max="30" value={sipRate} onChange={e => setSipRate(e.target.value)} className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                    <span className="text-white font-mono font-bold w-12 text-right">{sipRate}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time Period</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="1" max="40" value={sipYears} onChange={e => setSipYears(e.target.value)} className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                    <span className="text-white font-mono font-bold w-16 text-right">{sipYears} Yr</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8">
                  <div className="text-center mb-6">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total Value</div>
                    <div className="text-4xl font-bold text-emerald-400 font-mono">{currency}{Math.round(sipResult.total).toLocaleString()}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                      <span className="text-sm text-slate-400">Invested Amount</span>
                      <span className="text-white font-mono font-bold">{currency}{Math.round(sipResult.invested).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                      <span className="text-sm text-slate-400">Est. Returns</span>
                      <span className="text-emerald-400 font-mono font-bold">+{currency}{Math.round(sipResult.returns).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'tax' && (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button onClick={() => setRegime('new')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${regime === 'new' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>New Regime (FY 24-25)</button>
                <button onClick={() => setRegime('old')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${regime === 'old' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Old Regime</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual Gross Salary</label>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                      <input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                    </div>
                  </div>

                  {regime === 'old' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Deductions (80C, etc.)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                        <input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Standard Deduction</span>
                      <span className="text-white font-mono">{currency}{taxRes.stdDed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-sm font-bold text-white">Taxable Income</span>
                      <span className="text-white font-mono font-bold">{currency}{taxRes.taxable.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-500 uppercase">Tax Breakdown</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                      {taxRes.breakdown.map((b, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-slate-400">{b.range} <span className="text-slate-600">(@{b.rate})</span></span>
                          <span className="text-slate-300 font-mono">{currency}{Math.round(b.amt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Income Tax</span>
                      <span className="text-white font-mono">{currency}{Math.round(taxRes.tax).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Cess (4%)</span>
                      <span className="text-white font-mono">{currency}{Math.round(taxRes.cess).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <span className="font-bold text-white">Total Tax</span>
                      <span className="font-bold text-red-400 text-2xl font-mono">{currency}{Math.round(taxRes.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'profit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
              <div className="space-y-8">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                  <button onClick={() => setProfitMode('find_margin')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${profitMode === 'find_margin' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Find Margin</button>
                  <button onClick={() => setProfitMode('find_sp')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${profitMode === 'find_sp' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Find Selling Price</button>
                  <button onClick={() => setProfitMode('find_cp')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${profitMode === 'find_cp' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Find Cost Price</button>
                </div>

                <div className="space-y-4">
                  {profitMode !== 'find_cp' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cost Price (CP)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                        <input type="number" value={cp} onChange={e => setCp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                      </div>
                    </div>
                  )}

                  {profitMode !== 'find_sp' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selling Price (SP)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                        <input type="number" value={sp} onChange={e => setSp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                      </div>
                    </div>
                  )}

                  {profitMode !== 'find_margin' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Desired Margin (%)</label>
                      <input type="number" value={margin} onChange={e => setMargin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className={`rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden ${profitRes.profit >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="relative z-10 text-white">
                    <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">{profitRes.profit >= 0 ? 'Net Profit' : 'Net Loss'}</div>
                    <div className="text-5xl font-bold mb-2">{currency}{Math.abs(profitRes.profit).toFixed(2)}</div>
                    <div className="text-sm opacity-90">{profitRes.margin.toFixed(2)}% Margin</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Markup</div>
                    <div className="text-xl font-bold text-white font-mono">{profitRes.markup.toFixed(2)}%</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">{profitMode === 'find_sp' ? 'Selling Price' : (profitMode === 'find_cp' ? 'Cost Price' : 'Return')}</div>
                    <div className="text-xl font-bold text-white font-mono">{currency}{profitMode === 'find_sp' ? profitRes.sp.toFixed(2) : (profitMode === 'find_cp' ? profitRes.cp.toFixed(2) : profitRes.sp.toFixed(2))}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RateCalculator = () => {
  const [basePrice, setBasePrice] = useState(100);
  const [baseQty, setBaseQty] = useState(1);
  const [baseUnit, setBaseUnit] = useState('kg');
  const [mode, setMode] = useState('price');
  const [targetQty, setTargetQty] = useState(800);
  const [targetUnit, setTargetUnit] = useState('g');
  const [budget, setBudget] = useState(50);
  const currency = getCurrencySymbol();

  const getMultiplier = (unit) => (unit === 'kg' || unit === 'l') ? 1000 : 1;

  const calculate = () => {
    const baseGrams = parseFloat(baseQty) * getMultiplier(baseUnit);
    const pricePerGram = parseFloat(basePrice) / baseGrams;
    if (!pricePerGram || !isFinite(pricePerGram)) return { price: 0, qty: 0 };
    if (mode === 'price') {
      const targetGrams = parseFloat(targetQty) * getMultiplier(targetUnit);
      return { price: (pricePerGram * targetGrams).toFixed(2) };
    } else {
      const grams = parseFloat(budget) / pricePerGram;
      return { qty: grams >= 1000 ? `${(grams / 1000).toFixed(3)} kg` : `${grams.toFixed(0)} g` };
    }
  };
  const result = calculate();

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Rate Calculator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Define Base Rate */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500"><Tag size={20} /></div>
            <h3 className="text-lg font-bold text-white">Base Rate</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">If Price is</label>
              <div className="relative group">
                <span className="absolute left-4 top-3.5 text-slate-500 font-medium group-focus-within:text-pink-500 transition-colors">{currency}</span>
                <input
                  type="number"
                  value={basePrice}
                  onChange={e => setBasePrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-pink-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">For Quantity</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={baseQty}
                  onChange={e => setBaseQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none transition-all"
                />
                <select
                  value={baseUnit}
                  onChange={e => setBaseUnit(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="kg" className="bg-slate-800 text-white">kg</option>
                  <option value="g" className="bg-slate-800 text-white">g</option>
                  <option value="l" className="bg-slate-800 text-white">L</option>
                  <option value="ml" className="bg-slate-800 text-white">ml</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Calculate Target */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400"><Calculator size={20} /></div>
            <h3 className="text-lg font-bold text-white">Calculate</h3>
          </div>

          <div className="bg-slate-950 p-1.5 rounded-xl flex mb-8 border border-slate-800">
            <button
              onClick={() => setMode('price')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'price' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Find Price
            </button>
            <button
              onClick={() => setMode('qty')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'qty' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Find Quantity
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {mode === 'price' ? (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cost for Quantity</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={targetQty}
                      onChange={e => setTargetQty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-primary-500 outline-none transition-all"
                    />
                    <select
                      value={targetUnit}
                      onChange={e => setTargetUnit(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-primary-500 cursor-pointer"
                    >
                      <option value="kg" className="bg-slate-800 text-white">kg</option>
                      <option value="g" className="bg-slate-800 text-white">g</option>
                      <option value="l" className="bg-slate-800 text-white">L</option>
                      <option value="ml" className="bg-slate-800 text-white">ml</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400 font-medium">You Pay</span>
                  <span className="text-3xl font-bold text-emerald-400">{currency}{result.price}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Quantity for Budget</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-3.5 text-slate-500 font-medium group-focus-within:text-primary-500 transition-colors">{currency}</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400 font-medium">You Get</span>
                  <span className="text-3xl font-bold text-primary-400">{result.qty}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CurrencyConverter = () => {
  const [rates, setRates] = useState({});
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Expanded currency list with symbols
  const CURRENCIES = {
    USD: { name: 'United States Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'British Pound', symbol: '£' },
    JPY: { name: 'Japanese Yen', symbol: '¥' },
    INR: { name: 'Indian Rupee', symbol: '₹' },
    AUD: { name: 'Australian Dollar', symbol: 'A$' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$' },
    CHF: { name: 'Swiss Franc', symbol: 'Fr' },
    CNY: { name: 'Chinese Yuan', symbol: '¥' },
    NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
    SGD: { name: 'Singapore Dollar', symbol: 'S$' },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
    SEK: { name: 'Swedish Krona', symbol: 'kr' },
    KRW: { name: 'South Korean Won', symbol: '₩' },
    BRL: { name: 'Brazilian Real', symbol: 'R$' },
    RUB: { name: 'Russian Ruble', symbol: '₽' },
    ZAR: { name: 'South African Rand', symbol: 'R' },
    MXN: { name: 'Mexican Peso', symbol: 'Mex$' },
    AED: { name: 'UAE Dirham', symbol: 'د.إ' },
    THB: { name: 'Thai Baht', symbol: '฿' },
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        setRates(data.rates);
        setLastUpdated(new Date(data.date).toLocaleDateString());
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch rates", e);
        // Fallback rates if API fails
        setRates({ USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.5, INR: 83.3, AUD: 1.52, CAD: 1.36 });
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const getRate = (currency) => rates[currency] || 1;
  const conversionRate = getRate(to) / getRate(from);
  const result = (amount * conversionRate).toFixed(2);

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Currency Converter</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-yellow-500 via-orange-500 to-red-500"></div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl mb-8 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Coins size={18} />
            <span className="font-medium">
              {loading ? 'Fetching live rates...' : `Live rates from open API${lastUpdated ? ` (Updated: ${lastUpdated})` : ''}`}
            </span>
          </div>
          {loading && <RefreshCw size={14} className="animate-spin" />}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* From Section */}
          <div className="flex-1 w-full space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount</label>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 focus-within:border-yellow-500 transition-colors group relative">
              <span className="absolute right-4 top-4 text-slate-600 font-bold text-xl pointer-events-none">
                {CURRENCIES[from]?.symbol || ''}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-4xl font-light text-white outline-none mb-2 pr-8"
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-slate-800 text-slate-400 text-sm font-medium outline-none cursor-pointer hover:text-white transition-colors p-2 rounded-lg"
              >
                {Object.keys(CURRENCIES).map(c => (
                  <option key={c} value={c} className="bg-slate-800 text-white">
                    {c} - {CURRENCIES[c].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rate Display */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="bg-slate-800 p-2 rounded-full border border-slate-700 shadow-lg">
              <ArrowRightLeft size={20} className="text-slate-400" />
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500 font-bold">1 {from} =</span>
              <span className="text-xs text-yellow-500 font-bold">{conversionRate.toFixed(4)}</span>
              <span className="text-xs text-slate-500 font-bold">{to}</span>
            </div>
          </div>

          {/* To Section */}
          <div className="flex-1 w-full space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Converted</label>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 group relative">
              <span className="absolute right-4 top-4 text-emerald-500/50 font-bold text-xl pointer-events-none">
                {CURRENCIES[to]?.symbol || ''}
              </span>
              <div className="w-full bg-transparent text-4xl font-light text-emerald-400 mb-2 overflow-hidden text-ellipsis pr-8">
                {result}
              </div>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-slate-800 text-slate-400 text-sm font-medium outline-none cursor-pointer hover:text-white transition-colors p-2 rounded-lg"
              >
                {Object.keys(CURRENCIES).map(c => (
                  <option key={c} value={c} className="bg-slate-800 text-white">
                    {c} - {CURRENCIES[c].name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorStudio = ({ showToast }) => {
  const [color, setColor] = useState('#6366f1');
  const [rgb, setRgb] = useState('rgb(99, 102, 241)');
  const [hsl, setHsl] = useState('hsl(239, 84%, 67%)');

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const handleColorChange = (e) => {
    const hex = e.target.value;
    setColor(hex);
    const rgbVal = hexToRgb(hex);
    if (rgbVal) {
      setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
      let r = rgbVal.r / 255, g = rgbVal.g / 255, b = rgbVal.b / 255;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: break;
        }
        h /= 6;
      }
      setHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied!');
  };

  const PaletteBlock = ({ index, baseColor }) => {
    // Generate monochromatic palette
    const rgbVal = hexToRgb(baseColor);
    if (!rgbVal) return null;

    // Simple lightness variation
    const opacity = 0.2 + (index * 0.15);
    const rgba = `rgba(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b}, ${opacity.toFixed(2)})`;

    return (
      <div
        onClick={() => copy(rgba)}
        className="flex-1 h-full cursor-pointer hover:flex-[1.5] transition-all duration-300 flex items-end justify-center pb-4 group relative first:rounded-l-2xl last:rounded-r-2xl"
        style={{ backgroundColor: baseColor, opacity: opacity }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Copy size={20} className="text-white drop-shadow-md" />
        </div>
        <span className="text-xs font-mono bg-black/40 backdrop-blur text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-8">
          {Math.round(opacity * 100)}%
        </span>
      </div>
    );
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Color Studio</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Picker & Values */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pick Color</label>
            <div className="relative w-full h-32 rounded-2xl overflow-hidden cursor-pointer shadow-inner border border-slate-700 group">
              <input
                type="color"
                value={color}
                onChange={handleColorChange}
                className="absolute -top-4 -left-4 w-[120%] h-[150%] cursor-pointer p-0 border-0"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                <span className="bg-black/30 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Click to Change</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {[{ label: 'HEX', val: color }, { label: 'RGB', val: rgb }, { label: 'HSL', val: hsl }].map((item) => (
              <div
                key={item.label}
                onClick={() => copy(item.val)}
                className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-primary-500 cursor-pointer group transition-all hover:shadow-lg hover:shadow-primary-500/10"
              >
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider w-12">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-mono text-lg">{item.val}</span>
                  <button className="p-2 bg-slate-900 rounded-lg text-slate-500 group-hover:text-primary-400 transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Palette & Preview */}
        <div className="space-y-8">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Palette size={20} className="text-primary-400" />
              Generated Palette
            </h3>

            <div className="flex-1 flex h-40 rounded-2xl overflow-hidden mb-6 shadow-lg">
              {[1, 2, 3, 4, 5].map(i => <PaletteBlock key={i} index={i} baseColor={color} />)}
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-sm text-slate-400">
                This palette is generated using opacity variations of your selected color.
                Click any block to copy its <span className="text-white font-mono">rgba()</span> value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageResizer = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const canvasRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setWidth(img.width);
          setHeight(img.height);
          setPreview(img.src);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDimChange = (dim, val) => {
    const newVal = parseInt(val) || 0;
    if (dim === 'w') {
      setWidth(newVal);
      if (maintainRatio && image) setHeight(Math.round(newVal / (image.width / image.height)));
    } else {
      setHeight(newVal);
      if (maintainRatio && image) setWidth(Math.round(newVal * (image.width / image.height)));
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
    const link = document.createElement('a');
    link.download = 'resized-image.jpg';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Image Resizer</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
        {!image ? (
          <div className="border-3 border-dashed border-slate-700 rounded-3xl p-20 text-center hover:bg-slate-800/50 hover:border-primary-500/50 transition-all cursor-pointer relative group">
            <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Upload size={32} className="text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload an Image</h3>
            <p className="text-slate-400">Drag & drop or click to browse</p>
            <p className="text-xs text-slate-500 mt-4 bg-slate-900 inline-block px-3 py-1 rounded-full border border-slate-800">JPG, PNG, WEBP</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preview */}
            <div className="lg:col-span-2 bg-slate-950 p-8 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[400px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
              <img src={preview} alt="Preview" className="max-w-full max-h-[500px] object-contain shadow-2xl rounded-lg relative z-10" />
            </div>

            {/* Controls */}
            <div className="space-y-8">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <Settings size={18} className="text-primary-400" />
                  Dimensions
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Width</label>
                    <div className="relative">
                      <input type="number" value={width} onChange={(e) => handleDimChange('w', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none transition-colors" />
                      <span className="absolute right-3 top-3 text-xs text-slate-500">px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Height</label>
                    <div className="relative">
                      <input type="number" value={height} onChange={(e) => handleDimChange('h', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none transition-colors" />
                      <span className="absolute right-3 top-3 text-xs text-slate-500">px</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${maintainRatio ? 'bg-primary-500 border-primary-500' : 'bg-slate-950 border-slate-600'}`}>
                    {maintainRatio && <CheckSquare size={12} className="text-white" />}
                  </div>
                  <input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} className="hidden" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Maintain Aspect Ratio</span>
                </label>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <ImageIcon size={18} className="text-primary-400" />
                  Quality
                </h3>

                <div className="mb-2 flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500 uppercase">Compression</span>
                  <span className="text-primary-400 font-bold">{quality}%</span>
                </div>
                <input type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 mb-6" />

                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500">Original Size</span>
                  <span className="text-sm font-mono text-white">{(originalSize / 1024).toFixed(2)} KB</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={download} className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                  <Download size={20} /> Download
                </button>
                <button onClick={() => setImage(null)} className="px-5 py-4 bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent rounded-xl font-bold transition-all active:scale-95">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

const AgeCalculator = () => {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (today > nextBday) nextBday.setFullYear(today.getFullYear() + 1);
    const diffTime = Math.abs(nextBday - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate total days/weeks/hours for fun stats
    const totalDiff = Math.abs(today - birthDate);
    const totalDays = Math.floor(totalDiff / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(totalDiff / (1000 * 60 * 60));

    setResult({
      age: { years, months, days },
      next: diffDays,
      stats: { totalDays, totalWeeks, totalHours }
    });
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Age Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col justify-center">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white text-lg outline-none focus:border-primary-500 transition-colors scheme-dark mb-6"
          />
          <button
            onClick={calculate}
            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95 text-lg"
          >
            Calculate Age
          </button>
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main Age Card */}
              <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-8 rounded-[2rem] shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                <div className="relative z-10">
                  <div className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">You are currently</div>
                  <div className="flex justify-center items-baseline gap-2 mb-2">
                    <span className="text-6xl font-bold text-white">{result.age.years}</span>
                    <span className="text-xl text-white/80">years</span>
                  </div>
                  <div className="flex justify-center gap-4 text-white/90 font-medium">
                    <span>{result.age.months} months</span>
                    <span>•</span>
                    <span>{result.age.days} days</span>
                  </div>
                </div>
              </div>

              {/* Next Birthday & Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-2xl text-center">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Next Birthday</div>
                  <div className="text-2xl font-bold text-emerald-400">{result.next}</div>
                  <div className="text-xs text-slate-400">days to go</div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-2xl text-center">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Weeks</div>
                  <div className="text-2xl font-bold text-blue-400">{result.stats.totalWeeks.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">weeks lived</div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <Cake size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Enter your birth date to see detailed age stats and countdowns.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TodoList = () => {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('omni-todos-react');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => { localStorage.setItem('omni-todos-react', JSON.stringify(todos)); }, [todos]);

  const add = () => {
    if (!input.trim()) return;
    setTodos([...todos, { text: input, done: false, priority, id: Date.now() }]);
    setInput('');
  };

  const toggle = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const remove = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.done));
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">To-Do List</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
        {/* Input Area */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="What needs to be done?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-5 text-white outline-none focus:border-primary-500 transition-colors shadow-inner"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 text-sm font-bold text-slate-400 outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button
              onClick={add}
              className="bg-primary-600 hover:bg-primary-500 text-white px-6 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* List */}
        <ul className="space-y-3 mb-6">
          {todos.map((t) => (
            <li
              key={t.id}
              className={`flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800/50 group transition-all hover:bg-slate-800 hover:border-slate-700 ${t.done ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => toggle(t.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${t.done ? 'bg-primary-500 border-primary-500' : 'border-slate-600 hover:border-primary-500'}`}
              >
                {t.done && <CheckSquare size={14} className="text-white" />}
              </button>

              <div className={`w-2 h-2 rounded-full ${getPriorityColor(t.priority)}`}></div>

              <span className={`flex-1 text-base ${t.done ? 'line-through text-slate-500' : 'text-white'}`}>
                {t.text}
              </span>

              <button
                onClick={() => remove(t.id)}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}

          {todos.length === 0 && (
            <li className="text-center py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
              <CheckSquare size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-400">All caught up!</p>
              <p className="text-sm">Add a task to get started.</p>
            </li>
          )}
        </ul>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>{todos.filter(t => !t.done).length} active tasks</span>
            <button
              onClick={clearCompleted}
              className="text-red-400 hover:text-red-300 transition-colors hover:underline"
            >
              Clear Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const JsonNode = ({ name, value, depth = 0, isLast }) => {
  const [expanded, setExpanded] = useState(true);
  const bracketColors = ['text-yellow-400', 'text-purple-400', 'text-blue-400'];
  const bracketClass = bracketColors[depth % bracketColors.length];

  if (value === null) return <div className="pl-4"><span className="text-blue-300">{name && `"${name}": `}</span><span className="text-slate-500">null</span>{!isLast && ','}</div>;

  if (typeof value === 'object') {
    const isArray = Array.isArray(value);
    const isEmpty = Object.keys(value).length === 0;
    const open = isArray ? '[' : '{';
    const close = isArray ? ']' : '}';

    if (isEmpty) return <div className="pl-4"><span className="text-blue-300">{name && `"${name}": `}</span><span className={bracketClass}>{open}{close}</span>{!isLast && ','}</div>;

    return (
      <div className="pl-4">
        <div className="flex items-start">
          <button onClick={() => setExpanded(!expanded)} className="mr-1 mt-1 text-slate-500 hover:text-white">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          <div>
            <span className="text-blue-300">{name && `"${name}": `}</span>
            <span className={bracketClass}>{open}</span>
            {!expanded && <span className="text-slate-600 text-xs mx-1 select-none">...</span>}
          </div>
        </div>
        {expanded && (
          <div className="border-l border-slate-800 ml-2.5">
            {Object.entries(value).map(([key, val], idx, arr) => (
              <JsonNode key={key} name={isArray ? null : key} value={val} depth={depth + 1} isLast={idx === arr.length - 1} />
            ))}
          </div>
        )}
        <div className="pl-6"><span className={bracketClass}>{close}</span>{!isLast && ','}</div>
      </div>
    );
  }

  let valColor = 'text-emerald-400';
  if (typeof value === 'number') valColor = 'text-orange-400';
  if (typeof value === 'boolean') valColor = 'text-red-400';
  const displayValue = typeof value === 'string' ? `"${value}"` : String(value);

  return (
    <div className="pl-4 flex"><span className="text-blue-300 mr-1">{name && `"${name}":`}</span><span className={`${valColor}`}>{displayValue}</span><span>{!isLast && ','}</span></div>
  );
};

const JsonFormatter = ({ showToast }) => {
  const [input, setInput] = useState('{"name":"OmniTools","version":3,"features":["Tools","Colors"],"active":true,"nested":{"a":1,"b":null}}');
  const [error, setError] = useState(null);
  const [view, setView] = useState('tree');
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    try {
      if (!input) { setParsedData(null); return; }
      const parsed = JSON.parse(input);
      setParsedData(parsed);
      setError(null);
    } catch (e) {
      setError(e.message);
      setParsedData(null);
    }
  }, [input]);

  const format = (minify = false) => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied!');
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">JSON Formatter</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[750px]">
        {/* Input Section */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400"><FileJson size={20} /></div>
              <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Input JSON</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => format(false)} className="px-4 py-2 bg-slate-800 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"><AlignLeft size={14} /> PRETTIFY</button>
              <button onClick={() => format(true)} className="px-4 py-2 bg-slate-800 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"><Database size={14} /> MINIFY</button>
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className={`w-full h-full bg-slate-950 border ${error ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl p-5 text-slate-300 font-mono text-xs focus:outline-none resize-none custom-scrollbar leading-relaxed`}
              placeholder="Paste JSON here..."
              spellCheck="false"
            ></textarea>
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-mono flex items-center gap-3 backdrop-blur-md animate-fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <span className="truncate">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] flex flex-col shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button onClick={() => setView('tree')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'tree' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>TREE VIEW</button>
              <button onClick={() => setView('raw')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'raw' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>RAW DATA</button>
            </div>
            <button onClick={() => copy(input)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy size={20} /></button>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 overflow-auto custom-scrollbar">
            {parsedData ? (
              view === 'tree' ? (
                <div className="font-mono text-sm leading-relaxed">
                  <JsonNode value={parsedData} isLast={true} />
                </div>
              ) : (
                <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{JSON.stringify(parsedData, null, 2)}</pre>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                <FileJson size={48} className="opacity-20" />
                <span className="text-sm italic">{error ? 'Fix errors to view tree' : 'Waiting for valid JSON...'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QrGenerator = () => {
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(200);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000&margin=10`;

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">QR Generator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col h-full">
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Content (URL or Text)</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white focus:border-primary-500 outline-none resize-none transition-all placeholder:text-slate-700"
                placeholder="Enter text to encode..."
              ></textarea>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">
                <span>Size</span>
                <span className="text-white">{size}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={size}
                onChange={e => setSize(e.target.value)}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col items-center justify-center h-full">
          <div className="bg-white p-4 rounded-2xl shadow-2xl mb-8">
            {text ? (
              <img
                src={qrUrl}
                alt="QR Code"
                className="object-contain"
                style={{ width: size, height: size, maxWidth: '100%' }}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-sm font-medium italic bg-slate-50 rounded-xl">
                Enter text to generate
              </div>
            )}
          </div>
          <a
            href={qrUrl}
            download="qrcode.png"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all shadow-lg flex items-center gap-2"
          >
            <Download size={20} /> Download PNG
          </a>
        </div>
      </div>
    </div>
  );
};

const YamlConverter = ({ showToast }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('json2yaml');
  const [error, setError] = useState('');

  useEffect(() => {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js')
      .catch(() => setError('Failed to load YAML library'));
  }, []);

  const convert = () => {
    setError('');
    try {
      if (!window.jsyaml) throw new Error('Library loading...');
      if (mode === 'json2yaml') {
        const obj = JSON.parse(input);
        setOutput(window.jsyaml.dump(obj));
      } else {
        const obj = window.jsyaml.load(input);
        setOutput(JSON.stringify(obj, null, 2));
      }
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    showToast('Copied!');
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">YAML ↔ JSON</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl h-[750px] flex flex-col">
        <div className="flex justify-center mb-8">
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-lg">
            <button onClick={() => setMode('json2yaml')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'json2yaml' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
              <FileJson size={16} /> JSON <ArrowRight size={14} /> <Database size={16} /> YAML
            </button>
            <button onClick={() => setMode('yaml2json')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'yaml2json' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
              <Database size={16} /> YAML <ArrowRight size={14} /> <FileJson size={16} /> JSON
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
          <div className="flex flex-col h-full">
            <label className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              {mode === 'json2yaml' ? <FileJson size={14} /> : <Database size={14} />}
              {mode === 'json2yaml' ? 'JSON Input' : 'YAML Input'}
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none custom-scrollbar leading-relaxed transition-all placeholder:text-slate-700"
              placeholder="Paste content here..."
              spellCheck="false"
            ></textarea>
          </div>

          <div className="flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                {mode === 'json2yaml' ? <Database size={14} /> : <FileJson size={14} />}
                {mode === 'json2yaml' ? 'YAML Output' : 'JSON Output'}
              </label>
              <button onClick={copy} className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"><Copy size={12} /> COPY</button>
            </div>
            <textarea
              readOnly
              value={output}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-emerald-400 font-mono text-xs resize-none focus:outline-none custom-scrollbar leading-relaxed"
              placeholder="Result..."
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-red-400 text-xs font-mono flex items-center gap-2">
            {error && <><AlertCircle size={14} /> {error}</>}
          </div>
          <button onClick={convert} className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95">
            Convert
          </button>
        </div>
      </div>
    </div>
  );
};

const UuidGenerator = ({ showToast }) => {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => crypto.randomUUID());
    setUuids(newUuids);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    showToast('Copied all!');
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">UUID Generator</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <div className="flex-1 w-full">
            <div className="flex justify-between text-sm text-slate-400 mb-3 font-bold uppercase tracking-wider">
              <span>Quantity</span>
              <span className="text-white">{count}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>
          <button
            onClick={generate}
            className="w-full md:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> Generate
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-h-[500px] overflow-y-auto custom-scrollbar space-y-3">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 group hover:border-primary-500/50 transition-colors">
              <span className="font-mono text-slate-300 text-sm">{uuid}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(uuid); showToast('Copied'); }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white p-2 bg-slate-800 rounded-lg transition-all"
                title="Copy"
              >
                <Copy size={16} />
              </button>
            </div>
          ))}
        </div>

        {uuids.length > 0 && (
          <button
            onClick={copyAll}
            className="mt-6 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <Copy size={18} /> Copy All UUIDs
          </button>
        )}
      </div>
    </div>
  );
};

const RegexBuilder = () => {
  const [parts, setParts] = useState([]);
  const [testString, setTestString] = useState('');

  const addPart = (type) => setParts([...parts, { type, value: '' }]);
  const removePart = (index) => { const newParts = [...parts]; newParts.splice(index, 1); setParts(newParts); };
  const updatePart = (index, val) => { const newParts = [...parts]; newParts[index].value = val; setParts(newParts); };

  const constructRegex = () => {
    let pattern = '';
    parts.forEach(p => {
      if (p.type === 'start') pattern += '^';
      if (p.type === 'end') pattern += '$';
      if (p.type === 'word') pattern += '\\w+';
      if (p.type === 'digit') pattern += '\\d+';
      if (p.type === 'text') pattern += p.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (p.type === 'any') pattern += '.';
      if (p.type === 'whitespace') pattern += '\\s';
    });
    return pattern;
  };

  const regexString = constructRegex();
  let isMatch = false;
  try { if (regexString && testString) { isMatch = new RegExp(regexString).test(testString); } } catch (e) { }

  const blockColors = {
    start: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    end: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    text: 'bg-slate-700 text-white border-slate-600',
    word: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    digit: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    whitespace: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    any: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Guided Regex Builder</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Builder Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Construction Blocks</label>
            <div className="flex flex-wrap gap-3">
              {['start', 'text', 'word', 'digit', 'whitespace', 'any', 'end'].map(t => (
                <button
                  key={t}
                  onClick={() => addPart(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all hover:scale-105 active:scale-95 ${blockColors[t] || 'bg-slate-800 text-white border-slate-700'}`}
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl min-h-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Your Pattern</label>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-wrap gap-3 items-center min-h-[120px]">
              {parts.length === 0 && (
                <div className="w-full text-center text-slate-600 italic text-sm py-8">
                  Click blocks above to start building your regex...
                </div>
              )}
              {parts.map((p, i) => (
                <div key={i} className={`flex items-center rounded-xl px-3 py-2 border ${blockColors[p.type]} animate-fade-in`}>
                  <span className="text-xs font-bold uppercase mr-2">{p.type}</span>
                  {p.type === 'text' && (
                    <input
                      type="text"
                      value={p.value}
                      onChange={e => updatePart(i, e.target.value)}
                      className="bg-slate-900/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white w-20 outline-none focus:border-primary-500 transition-colors"
                      placeholder="value..."
                      autoFocus
                    />
                  )}
                  <button onClick={() => removePart(i)} className="ml-2 text-white/50 hover:text-white transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Section */}
        <div className="space-y-8">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Generated Regex</label>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-sm break-all shadow-inner">
              /{regexString}/
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Test String</label>
            <div className="relative">
              <input
                type="text"
                value={testString}
                onChange={e => setTestString(e.target.value)}
                className={`w-full bg-slate-950 border-2 ${isMatch ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-slate-800 focus:border-slate-600'} rounded-xl p-4 text-white outline-none pr-12 transition-all`}
                placeholder="Type to test match..."
              />
              {testString && (
                <div className={`absolute right-4 top-4 ${isMatch ? 'text-emerald-500' : 'text-red-500'} animate-fade-in`}>
                  {isMatch ? <CheckCircle size={24} /> : <X size={24} />}
                </div>
              )}
            </div>
            {testString && (
              <div className={`mt-4 text-center text-sm font-bold ${isMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                {isMatch ? 'Match Found!' : 'No Match'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeSuite = () => {
  const [tab, setTab] = useState('stopwatch');

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    let interval;
    if (swRunning) {
      const startTime = Date.now() - swTime;
      interval = setInterval(() => {
        setSwTime(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  const toggleSw = () => setSwRunning(!swRunning);
  const resetSw = () => { setSwRunning(false); setSwTime(0); setLaps([]); };
  const addLap = () => {
    setLaps(prev => [{ time: swTime, split: swTime - (prev[0]?.time || 0) }, ...prev]);
  };

  // Timer State
  const [cdRunning, setCdRunning] = useState(false);
  const [cdTotal, setCdTotal] = useState(300000); // 5 min default
  const [cdLeft, setCdLeft] = useState(300000);

  useEffect(() => {
    let interval;
    if (cdRunning && cdLeft > 0) {
      const endTime = Date.now() + cdLeft;
      interval = setInterval(() => {
        const left = endTime - Date.now();
        if (left <= 0) {
          setCdLeft(0);
          setCdRunning(false);
          // Optional: Play sound or show notification
        } else {
          setCdLeft(left);
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [cdRunning]);

  const startTimer = (ms) => {
    setCdTotal(ms);
    setCdLeft(ms);
    setCdRunning(true);
  };

  const toggleCd = () => {
    if (cdLeft <= 0) {
      startTimer(cdTotal); // Restart
    } else {
      setCdRunning(!cdRunning);
    }
  };

  // Unix State
  const [unixTs, setUnixTs] = useState(Math.floor(Date.now() / 1000));
  const [liveUnix, setLiveUnix] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => setLiveUnix(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  // Date Calc State
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [addDays, setAddDays] = useState(0);

  // Pomodoro State
  const [pomoMode, setPomoMode] = useState('focus'); // focus, break
  const [pomoTime, setPomoTime] = useState(25 * 60 * 1000);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoTotal, setPomoTotal] = useState(25 * 60 * 1000);

  useEffect(() => {
    let interval;
    if (pomoRunning && pomoTime > 0) {
      interval = setInterval(() => {
        setPomoTime(prev => {
          if (prev <= 1000) {
            setPomoRunning(false);
            // Auto switch mode logic could go here
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoTime]);

  const startPomo = (mode) => {
    const time = mode === 'focus' ? 25 * 60 * 1000 : 5 * 60 * 1000;
    setPomoMode(mode);
    setPomoTotal(time);
    setPomoTime(time);
    setPomoRunning(true);
  };

  const togglePomo = () => {
    if (pomoTime === 0) {
      startPomo(pomoMode);
    } else {
      setPomoRunning(!pomoRunning);
    }
  };

  const formatMs = (ms) => {
    const m = Math.floor(ms / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${m}:${s}.${cs}`;
  };

  const formatTime = (ms) => {
    const totalSec = Math.ceil(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    return days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`;
  };

  const getFutureDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(addDays || 0));
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Circular Progress Component
  const CircleProgress = ({ progress, colorClass, children }) => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90 w-64 h-64 md:w-72 md:h-72" viewBox="0 0 288 288">
          <circle cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
          <circle cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${colorClass} transition-all duration-300 ease-linear`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Time & Date Suite</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Navigation */}
        <div className="md:w-64 bg-slate-900 border-r border-slate-800 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          {[
            { id: 'stopwatch', icon: Clock, label: 'Stopwatch' },
            { id: 'timer', icon: AlarmClock, label: 'Timer' },
            { id: 'pomodoro', icon: Hourglass, label: 'Pomodoro' },
            { id: 'unix', icon: Database, label: 'Unix Time' },
            { id: 'date', icon: Calendar, label: 'Date Calc' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 md:flex-none flex items-center gap-3 p-4 text-sm font-medium transition-all border-b-2 md:border-b-0 md:border-l-2 whitespace-nowrap ${tab === item.id ? 'bg-slate-800 border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <item.icon size={18} className={tab === item.id ? 'text-primary-400' : ''} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 flex flex-col">

          {/* STOPWATCH */}
          {tab === 'stopwatch' && (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
              <CircleProgress progress={(swTime % 60000) / 600} colorClass="text-emerald-500">
                <div className="text-5xl font-mono font-bold text-white tabular-nums tracking-tighter">
                  {formatMs(swTime)}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Stopwatch</div>
              </CircleProgress>

              <div className="flex gap-4 mt-8">
                <button onClick={resetSw} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all" title="Reset"><RotateCcw size={18} /></button>
                <button onClick={toggleSw} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg active:scale-95 ${swRunning ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 shadow-red-500/10' : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20'}`}>
                  {swRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={addLap} disabled={!swRunning && swTime === 0} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed" title="Lap"><Flag size={18} /></button>
              </div>

              {laps.length > 0 && (
                <div className="w-full max-w-md mt-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex-1 max-h-48 flex flex-col">
                  <div className="flex justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase">
                    <span>Lap</span>
                    <span>Split</span>
                    <span>Total</span>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {laps.map((lap, i) => (
                      <div key={i} className="flex justify-between px-3 py-2 rounded hover:bg-slate-900 text-sm font-mono text-slate-300">
                        <span className="text-slate-500 w-8">#{laps.length - i}</span>
                        <span className="text-emerald-400">+{formatMs(lap.split)}</span>
                        <span>{formatMs(lap.time)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TIMER */}
          {tab === 'timer' && (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
              <CircleProgress progress={cdTotal > 0 ? (cdLeft / cdTotal) * 100 : 0} colorClass={cdLeft === 0 ? 'text-red-500' : 'text-blue-500'}>
                <div className={`text-6xl font-mono font-bold tabular-nums tracking-tighter ${cdLeft === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {formatTime(cdLeft)}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{cdRunning ? 'Running' : (cdLeft === 0 ? "Time's Up" : 'Timer')}</div>
              </CircleProgress>

              <div className="flex gap-4 mt-8 mb-8">
                <button onClick={() => { setCdRunning(false); setCdLeft(cdTotal); }} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all" title="Reset"><RotateCcw size={18} /></button>
                <button onClick={toggleCd} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg active:scale-95 ${cdRunning ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 shadow-amber-500/10' : 'bg-blue-500 text-white hover:bg-blue-400 shadow-blue-500/20'}`}>
                  {cdRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 w-full max-w-md">
                {[1, 5, 10, 30].map(m => (
                  <button key={m} onClick={() => startTimer(m * 60 * 1000)} className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors border border-slate-700 hover:border-slate-600">
                    {m}m
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <input type="number" placeholder="Custom min" className="bg-transparent text-white text-sm px-3 py-1 outline-none w-24 text-center" onKeyDown={(e) => { if (e.key === 'Enter') startTimer(parseInt(e.target.value) * 60 * 1000) }} />
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold uppercase" onClick={(e) => startTimer(parseInt(e.target.previousSibling.value) * 60 * 1000)}>Set</button>
              </div>
            </div>
          )}

          {/* POMODORO */}
          {tab === 'pomodoro' && (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
              <CircleProgress progress={(pomoTime / pomoTotal) * 100} colorClass={pomoMode === 'focus' ? 'text-rose-500' : 'text-emerald-500'}>
                <div className="text-6xl font-mono font-bold text-white tabular-nums tracking-tighter">
                  {formatTime(pomoTime)}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{pomoMode}</div>
              </CircleProgress>

              <div className="flex gap-4 mt-8 mb-8">
                <button onClick={() => { setPomoRunning(false); setPomoTime(pomoTotal); }} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all" title="Reset"><RotateCcw size={18} /></button>
                <button onClick={togglePomo} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg active:scale-95 ${pomoRunning ? (pomoMode === 'focus' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500') : (pomoMode === 'focus' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white')}`}>
                  {pomoRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                </button>
              </div>

              <div className="flex gap-4 w-full max-w-xs">
                <button onClick={() => startPomo('focus')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${pomoMode === 'focus' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  Focus (25m)
                </button>
                <button onClick={() => startPomo('break')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${pomoMode === 'break' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  Break (5m)
                </button>
              </div>
            </div>
          )}

          {/* UNIX */}
          {tab === 'unix' && (
            <div className="flex-1 space-y-8 animate-fade-in max-w-2xl mx-auto w-full">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center relative group">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Current Unix Timestamp</div>
                <div className="text-4xl md:text-6xl font-mono font-bold text-emerald-400 tracking-tight">{liveUnix}</div>
                <button onClick={() => { navigator.clipboard.writeText(liveUnix); }} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={16} /></button>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-white flex items-center gap-2"><ArrowRightLeft size={18} className="text-blue-400" /> Converter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Unix Timestamp</label>
                    <input type="number" value={unixTs} onChange={e => setUnixTs(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Human Date</label>
                    <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 font-medium min-h-[58px] flex items-center">
                      {unixTs ? new Date(unixTs * 1000).toLocaleString() : 'Invalid Date'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DATE CALC */}
          {tab === 'date' && (
            <div className="flex-1 space-y-8 animate-fade-in max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-4">Select Date</label>
                  <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white scheme-dark mb-6 focus:border-primary-500 outline-none" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-500 text-sm">Day of Week</span>
                      <span className="text-white font-bold">{dateInput ? new Date(dateInput).toLocaleDateString('en-US', { weekday: 'long' }) : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-500 text-sm">Relative</span>
                      <span className="text-primary-400 font-bold">{getRelativeTime(dateInput)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-4">Add/Subtract Days</label>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-slate-300 text-sm">Today +</span>
                    <input type="number" value={addDays} onChange={e => setAddDays(e.target.value)} className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-white outline-none focus:border-primary-500" />
                    <span className="text-slate-300 text-sm">days</span>
                  </div>
                  <div className="mt-auto bg-slate-950 p-4 rounded-xl text-center border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Result Date</div>
                    <div className="text-xl font-bold text-white">{getFutureDate()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



const AspectRatioCalculator = () => {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [ratio, setRatio] = useState('16:9');

  const calculateRatio = (w, h) => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(w, h);
    return `${w / divisor}:${h / divisor}`;
  };

  useEffect(() => {
    if (width && height) {
      setRatio(calculateRatio(width, height));
    }
  }, [width, height]);

  const setPreset = (w, h) => {
    setWidth(w);
    setHeight(h);
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Aspect Ratio Calculator</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dimensions (px)</label>
              <div className="flex gap-4 items-center">
                <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" placeholder="Width" />
                <span className="text-slate-500 font-bold">x</span>
                <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" placeholder="Height" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Common Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPreset(1920, 1080)} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">HD (16:9)</button>
                <button onClick={() => setPreset(1080, 1080)} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">Square (1:1)</button>
                <button onClick={() => setPreset(1080, 1350)} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">Instagram (4:5)</button>
                <button onClick={() => setPreset(1080, 1920)} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">Story (9:16)</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-2xl aspect-square relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div style={{ aspectRatio: `${width}/${height}`, width: '80%', maxHeight: '80%' }} className="border-4 border-primary-500 rounded-lg"></div>
            </div>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-2">{ratio}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Aspect Ratio</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NetworkInfo = () => {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        setIpData(data);
      } catch (e) {
        setIpData({ ip: 'Unavailable' });
      } finally {
        setLoading(false);
      }
    };
    fetchIp();
  }, []);

  const sysInfo = [
    { label: 'Screen Resolution', value: `${window.screen.width} x ${window.screen.height}` },
    { label: 'Window Size', value: `${window.innerWidth} x ${window.innerHeight}` },
    { label: 'Color Depth', value: `${window.screen.colorDepth}-bit` },
    { label: 'Language', value: navigator.language },
    { label: 'Platform', value: navigator.platform },
    { label: 'Cores', value: navigator.hardwareConcurrency || 'Unknown' },
  ];

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Network & System Info</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-500">
            <Globe size={32} />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Public IP Address</div>
          {loading ? (
            <div className="h-8 w-32 bg-slate-800 rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-mono font-bold text-white">{ipData?.ip}</div>
          )}
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-500">
            <Monitor size={32} />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">User Agent</div>
          <div className="text-xs text-slate-400 font-mono break-all">{navigator.userAgent}</div>
        </div>
      </div>

      <div className="mt-6 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Smartphone size={20} className="text-emerald-500" /> System Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sysInfo.map((info, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">{info.label}</div>
              <div className="text-white font-mono font-medium">{info.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MarkdownPreviewer = () => {
  const [markdown, setMarkdown] = useState('# Hello World\n\nThis is a **live** markdown preview.\n\n- Item 1\n- Item 2\n\n## Subheader\n\n> Blockquote example');

  const parseMarkdown = (md) => {
    let html = md
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-white">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 text-white">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 text-white">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="text-primary-400">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="text-emerald-400">$1</em>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4">$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>')
      .replace(/\n/gim, '<br />');
    return { __html: html };
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-white text-center">Markdown Previewer</h2>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2">Markdown Input</label>
          <textarea
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-300 font-mono text-sm focus:border-primary-500 outline-none resize-none transition-colors custom-scrollbar"
            placeholder="Type markdown here..."
          ></textarea>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-emerald-500 uppercase mb-2">Live Preview</label>
          <div
            className="flex-1 w-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 overflow-y-auto custom-scrollbar prose prose-invert max-w-none"
            dangerouslySetInnerHTML={parseMarkdown(markdown)}
          ></div>
        </div>
      </div>
    </div>
  );
};

const EmiCalculator = () => {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);
  const currency = getCurrencySymbol();

  const r = rate / 12 / 100;
  const n = years * 12;

  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalAmount = emi * n;
  const totalInterest = totalAmount - principal;

  const principalPct = (principal / totalAmount) * 100;
  const interestPct = 100 - principalPct;

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">EMI Calculator</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Loan Amount: <span className="text-white font-mono">{currency}{principal.toLocaleString()}</span></label>
            <input type="range" min="10000" max="10000000" step="10000" value={principal} onChange={(e) => setPrincipal(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Interest Rate (%): <span className="text-white font-mono">{rate}%</span></label>
            <input type="range" min="1" max="30" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Tenure (Years): <span className="text-white font-mono">{years} Yr</span></label>
            <input type="range" min="1" max="30" step="1" value={years} onChange={(e) => setYears(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Breakdown</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Monthly EMI</div>
                <div className="text-xl font-bold text-emerald-400">{currency}{Math.round(emi).toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Total Interest</div>
                <div className="text-xl font-bold text-pink-500">{currency}{Math.round(totalInterest).toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Total Payable</div>
                <div className="text-xl font-bold text-white">{currency}{Math.round(totalAmount).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 rounded-full mb-6" style={{ background: `conic-gradient(#6366f1 0% ${principalPct}%, #ec4899 ${principalPct}% 100%)` }}>
            <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center flex-col">
              <span className="text-xs text-slate-500">Total</span>
              <span className="text-sm font-bold text-white">{currency}{(totalAmount / 100000).toFixed(2)}L</span>
            </div>
          </div>
          <div className="w-full space-y-3">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Principal</span>
              <span className="text-white">{Math.round(principalPct)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-500"></span> Interest</span>
              <span className="text-white">{Math.round(interestPct)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthCalculator = () => {
  const [mode, setMode] = useState('bmi');
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState(1.2);

  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
  let bmiStatus = 'Normal';
  let bmiColor = 'text-emerald-400';
  let bmiPercent = 50; // For gauge

  if (bmi < 18.5) { bmiStatus = 'Underweight'; bmiColor = 'text-blue-400'; bmiPercent = 20; }
  else if (bmi >= 25 && bmi < 30) { bmiStatus = 'Overweight'; bmiColor = 'text-yellow-400'; bmiPercent = 80; }
  else if (bmi >= 30) { bmiStatus = 'Obese'; bmiColor = 'text-red-400'; bmiPercent = 95; }

  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = Math.round(bmr * activity);

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Health Station</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-lg">
            <button onClick={() => setMode('bmi')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'bmi' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>BMI Calculator</button>
            <button onClick={() => setMode('bmr')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'bmr' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Calories (BMR)</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Inputs */}
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                <span>Height</span>
                <span className="text-white">{height} cm</span>
              </div>
              <input
                type="range"
                min="100"
                max="250"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                <span>Weight</span>
                <span className="text-white">{weight} kg</span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                value={weight}
                onChange={e => setWeight(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {mode === 'bmr' && (
              <>
                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    <span>Age</span>
                    <span className="text-white">{age} years</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={age}
                    onChange={e => setAge(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setGender('male')}
                    className={`p-4 rounded-xl border transition-all font-bold text-sm flex items-center justify-center gap-2 ${gender === 'male' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`p-4 rounded-xl border transition-all font-bold text-sm flex items-center justify-center gap-2 ${gender === 'female' ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    Female
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Activity Level</label>
                  <select
                    value={activity}
                    onChange={e => setActivity(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-primary-500 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="1.2">Sedentary (Office job)</option>
                    <option value="1.375">Light Exercise (1-2 days)</option>
                    <option value="1.55">Moderate Exercise (3-5 days)</option>
                    <option value="1.725">Heavy Exercise (6-7 days)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Results */}
          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {mode === 'bmi' ? (
              <div className="text-center w-full relative z-10">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Your BMI Score</div>

                <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                  {/* Gauge Background */}
                  <div className="absolute inset-0 rounded-full border-[12px] border-slate-800"></div>
                  {/* Gauge Value (Simplified visual) */}
                  <div
                    className={`absolute inset-0 rounded-full border-[12px] border-transparent border-t-${bmiColor.split('-')[1]} border-r-${bmiColor.split('-')[1]} transition-all duration-1000`}
                    style={{ transform: `rotate(${bmiPercent * 1.8}deg)` }}
                  ></div>

                  <div className="text-6xl font-bold text-white">{bmi}</div>
                </div>

                <div className={`text-2xl font-bold ${bmiColor} mb-2`}>{bmiStatus}</div>
                <div className="text-xs text-slate-500">Healthy range: 18.5 - 25.0</div>
              </div>
            ) : (
              <div className="w-full relative z-10">
                <div className="text-center mb-8">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Daily Calorie Needs</div>
                  <div className="text-5xl font-bold text-white mb-1">{tdee}</div>
                  <div className="text-sm text-slate-400">kcal / day</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-sm font-bold text-red-400">Lose Weight</span>
                    <span className="text-lg font-bold text-white">{tdee - 500} <span className="text-xs font-normal text-slate-500">kcal</span></span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-sm font-bold text-emerald-400">Maintain</span>
                    <span className="text-lg font-bold text-white">{tdee} <span className="text-xs font-normal text-slate-500">kcal</span></span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-sm font-bold text-blue-400">Gain Weight</span>
                    <span className="text-lg font-bold text-white">{tdee + 500} <span className="text-xs font-normal text-slate-500">kcal</span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordGenerator = ({ showToast }) => {
  const [length, setLength] = useState(12);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);

  const generate = () => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = lower;
    if (includeUpper) chars += upper;
    if (includeNumbers) chars += nums;
    if (includeSymbols) chars += syms;

    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    calcStrength(pass);
  };

  const calcStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrength(score); // Max 5
  };

  useEffect(() => { generate(); }, []);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied!');
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Password Vault</h2>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl space-y-8">
        {/* Display Section */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-purple-500"></div>
          <span className="font-mono text-2xl md:text-3xl text-white break-all tracking-wider mr-4">{password}</span>
          <div className="flex gap-2 shrink-0">
            <button onClick={generate} className="p-3 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all" title="Regenerate"><RefreshCw size={20} /></button>
            <button onClick={() => copy(password)} className="p-3 text-primary-400 hover:text-white bg-primary-500/10 hover:bg-primary-500 rounded-xl transition-all" title="Copy"><Copy size={20} /></button>
          </div>
        </div>

        {/* Strength Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Strength</span>
            <span className={`${strength > 0 ? strengthColors[strength - 1].replace('bg-', 'text-') : 'text-slate-500'}`}>{strengthLabels[Math.min(strength, 4)]}</span>
          </div>
          <div className="flex gap-1.5 h-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-500 ${i < strength ? strengthColors[Math.min(strength - 1, 4)] : 'bg-slate-800'}`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
          <div>
            <div className="flex justify-between text-sm text-slate-400 mb-3 font-bold uppercase tracking-wider">
              <span>Length</span>
              <span className="text-white">{length}</span>
            </div>
            <input
              type="range"
              min="6"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl cursor-pointer border border-slate-800 hover:border-primary-500/50 transition-all group">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${includeUpper ? 'bg-primary-500 border-primary-500' : 'bg-slate-900 border-slate-700'}`}>
                {includeUpper && <CheckSquare size={14} className="text-white" />}
              </div>
              <input type="checkbox" checked={includeUpper} onChange={e => setIncludeUpper(e.target.checked)} className="hidden" />
              <span className="text-sm font-bold text-slate-300 group-hover:text-white">Uppercase</span>
            </label>

            <label className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl cursor-pointer border border-slate-800 hover:border-primary-500/50 transition-all group">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${includeNumbers ? 'bg-primary-500 border-primary-500' : 'bg-slate-900 border-slate-700'}`}>
                {includeNumbers && <CheckSquare size={14} className="text-white" />}
              </div>
              <input type="checkbox" checked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)} className="hidden" />
              <span className="text-sm font-bold text-slate-300 group-hover:text-white">Numbers</span>
            </label>

            <label className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl cursor-pointer border border-slate-800 hover:border-primary-500/50 transition-all group">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${includeSymbols ? 'bg-primary-500 border-primary-500' : 'bg-slate-900 border-slate-700'}`}>
                {includeSymbols && <CheckSquare size={14} className="text-white" />}
              </div>
              <input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} className="hidden" />
              <span className="text-sm font-bold text-slate-300 group-hover:text-white">Symbols</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeveloperTools = ({ showToast }) => {
  const [mode, setMode] = useState('base64');
  const [base64Mode, setBase64Mode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const process = async () => {
      if (!input) { setOutput(''); return; }
      try {
        if (mode === 'base64') {
          if (base64Mode === 'encode') {
            setOutput(btoa(input));
          } else {
            try {
              setOutput(atob(input));
            } catch (e) {
              setOutput('Invalid Base64 string');
            }
          }
        } else if (mode === 'url') {
          setOutput(encodeURIComponent(input));
        } else if (mode === 'hash') {
          const msgBuffer = new TextEncoder().encode(input);
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          setOutput(hashHex);
        }
      } catch (e) {
        setOutput('Error processing input');
      }
    };
    process();
  }, [input, mode, base64Mode]);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied!');
  };

  const clear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Developer Tools</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {['base64', 'url', 'hash'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-between group ${mode === m ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="uppercase tracking-wider text-sm">
                {m === 'hash' ? 'SHA-256' : m}
              </span>
              <ChevronRight size={16} className={`transition-transform ${mode === m ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 min-h-[400px] flex flex-col">
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Input</label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:border-primary-500 outline-none transition-colors resize-none"
                  placeholder="Type or paste content here..."
                ></textarea>
              </div>

              {mode === 'base64' && (
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
                  <button onClick={() => setBase64Mode('encode')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${base64Mode === 'encode' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500 hover:text-slate-300'}`}>Encode</button>
                  <button onClick={() => setBase64Mode('decode')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${base64Mode === 'decode' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500 hover:text-slate-300'}`}>Decode</button>
                </div>
              )}

              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Output</label>
                <div className="relative h-full min-h-[120px]">
                  <textarea
                    readOnly
                    value={output}
                    className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 font-mono text-sm outline-none resize-none"
                    placeholder="Result will appear here..."
                  ></textarea>
                  {output && (
                    <button onClick={() => copy(output)} className="absolute top-2 right-2 p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-800">
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeTool, setActiveTool] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };



  const renderTool = () => {
    switch (activeTool) {
      case 'dashboard': return <Dashboard changeTool={setActiveTool} />;
      case 'splitwise': return <SplitWise />;
      case 'text-tools': return <TextTools showToast={showToast} />;
      case 'calculator': return <CalculatorTool />;
      case 'unit-converter': return <UnitConverter />;
      case 'split-bill': return <SplitBill />;
      case 'rate-calc': return <RateCalculator />;
      case 'currency': return <CurrencyConverter />;
      case 'color-studio': return <ColorStudio showToast={showToast} />;
      case 'image-resizer': return <ImageResizer />;
      case 'age-calc': return <AgeCalculator />;
      case 'todo': return <TodoList />;
      case 'emi-calc': return <EmiCalculator />;
      case 'health': return <HealthCalculator />;
      case 'password': return <PasswordGenerator showToast={showToast} />;
      case 'devtools': return <DeveloperTools showToast={showToast} />;
      case 'json': return <JsonFormatter showToast={showToast} />;
      case 'regex': return <RegexBuilder />;
      case 'qr': return <QrGenerator />;
      case 'aspect-ratio': return <AspectRatioCalculator />;
      case 'network': return <NetworkInfo />;
      case 'markdown': return <MarkdownPreviewer />;
      case 'yaml': return <YamlConverter showToast={showToast} />;
      case 'uuid': return <UuidGenerator showToast={showToast} />;
      case 'time-suite': return <TimeSuite />;
      case 'finance-suite': return <FinanceSuite />;
      default: return <Dashboard changeTool={setActiveTool} />;
    }
  };

  const NavButton = ({ item, mobile = false }) => (
    <button
      onClick={() => { setActiveTool(item.id); if (mobile) setMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTool === item.id
        ? 'text-primary-400 bg-primary-500/10 font-medium'
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
        } ${mobile ? 'flex-col justify-center py-4 border border-slate-800 bg-slate-900' : ''}`}
    >
      <item.icon size={mobile ? 24 : 20} className={mobile ? 'mb-2' : ''} />
      <span className={mobile ? 'text-xs' : 'text-sm'}>{item.label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-primary-500 selection:text-white overflow-hidden">

      {/* Toast */}
      <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ ...toast, show: false })} />

      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <LayoutDashboard className="text-white" size={16} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">OmniTools Pro</h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          <NavButton item={menuItems[0]} />
          <NavButton item={menuItems[1]} /> {/* SplitWise in main section */}

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">Utilities <div className="h-px bg-slate-800 flex-1" /></div>
          {menuItems.filter(i => i.group === 'util').map(item => <NavButton key={item.id} item={item} />)}

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">Life & Health <div className="h-px bg-slate-800 flex-1" /></div>
          {menuItems.filter(i => i.group === 'life').map(item => <NavButton key={item.id} item={item} />)}

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">Tech & Dev <div className="h-px bg-slate-800 flex-1" /></div>
          {menuItems.filter(i => i.group === 'tech').map(item => <NavButton key={item.id} item={item} />)}

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">Media <div className="h-px bg-slate-800 flex-1" /></div>
          {menuItems.filter(i => i.group === 'media').map(item => <NavButton key={item.id} item={item} />)}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 text-center">v4.2.0 &copy; Aasif</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-50 flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary-500 flex items-center justify-center">
            <LayoutDashboard className="text-white" size={14} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">OmniTools Pro</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950 z-40 pt-20 px-4 pb-4 overflow-y-auto md:hidden animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {menuItems.map(item => <NavButton key={item.id} item={item} mobile={true} />)}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-slate-950 relative overflow-y-auto pt-16 md:pt-0">
        {renderTool()}
      </main>
    </div>
  );
}