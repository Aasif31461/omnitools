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
  Wallet
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
                  width: `${widthPct/2}%`, 
                  left: isPositive ? '50%' : `calc(50% - ${widthPct/2}%)`
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
    return {
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      chars: text.length,
      lines: text ? text.split(/\r\n|\r|\n/).length : 0,
      noSpace: text.replace(/\s/g, '').length
    };
  }, [text]);

  const handleTransform = (type) => {
    let newText = text;
    switch (type) {
      case 'upper': newText = text.toUpperCase(); break;
      case 'lower': newText = text.toLowerCase(); break;
      case 'title': newText = text.toLowerCase().replace(/(?:^|\s)\w/g, match => match.toUpperCase()); break;
      case 'dedup': newText = [...new Set(text.split('\n'))].join('\n'); break;
      case 'trim': newText = text.replace(/\s+/g, ' ').trim(); break;
      case 'unique-words': newText = [...new Set(text.trim().split(/\s+/))].join(' '); break;
      default: break;
    }
    setText(newText);
  };

  const generateText = (type) => {
    if (type === 'lorem') {
      setText("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.");
    } else if (type === 'random') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let res = '';
      for (let i = 0; i < 500; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      setText(res);
    }
  };

  const copy = (txt) => {
    navigator.clipboard.writeText(txt);
    showToast('Copied!');
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Text Studio</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[650px]">
        <div className="flex border-b border-slate-800 bg-slate-900/50">
           <button onClick={() => setActiveTab('editor')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'editor' ? 'border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}><Type size={16} /> Editor & Stats</button>
           <button onClick={() => setActiveTab('diff')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'diff' ? 'border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}><GitCompare size={16} /> Diff Checker</button>
           <button onClick={() => setActiveTab('generate')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'generate' ? 'border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}><Sparkles size={16} /> Generators</button>
        </div>
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          {activeTab === 'editor' && (
            <div className="flex-1 flex flex-col gap-4">
               <div className="flex flex-wrap gap-2">
                  <div className="flex bg-slate-800 rounded-lg p-1">
                    <button onClick={() => handleTransform('upper')} className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">UPPER</button>
                    <button onClick={() => handleTransform('lower')} className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">lower</button>
                    <button onClick={() => handleTransform('title')} className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">Title Case</button>
                  </div>
                  <div className="flex bg-slate-800 rounded-lg p-1">
                    <button onClick={() => handleTransform('dedup')} className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">Unique Lines</button>
                    <button onClick={() => handleTransform('unique-words')} className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">Unique Words</button>
                    <button onClick={() => handleTransform('trim')} className="px-3 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">Trim Space</button>
                  </div>
                  <button onClick={() => setText('')} className="ml-auto text-slate-400 hover:text-red-400 transition"><Trash2 size={18}/></button>
                  <button onClick={() => copy(text)} className="text-slate-400 hover:text-white transition"><Copy size={18}/></button>
               </div>
               <textarea value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-primary-500 resize-none" placeholder="Type or paste content here..."></textarea>
               <div className="flex gap-4 text-xs text-slate-400 bg-slate-800 p-3 rounded-lg justify-between md:justify-start"><span><strong className="text-white">{stats.words}</strong> Words</span><span><strong className="text-white">{stats.chars}</strong> Characters</span><span><strong className="text-white">{stats.noSpace}</strong> w/o Spaces</span><span><strong className="text-white">{stats.lines}</strong> Lines</span></div>
            </div>
          )}
          {activeTab === 'diff' && (
            <div className="flex-1 flex flex-col gap-4 h-full">
               <div className="text-xs text-slate-400 text-center">Paste two texts to compare differences line-by-line.</div>
               <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                  <div className="flex flex-col gap-2"><span className="text-xs font-bold text-slate-500">Original Text</span><textarea value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 outline-none custom-scrollbar" placeholder="Text A"></textarea></div>
                  <div className="flex flex-col gap-2"><span className="text-xs font-bold text-slate-500">Modified Text</span><textarea value={text2} onChange={e => setText2(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 outline-none custom-scrollbar" placeholder="Text B"></textarea></div>
               </div>
               <div className="h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-y-auto custom-scrollbar">
                  {(() => {
                     const lines1 = text.split('\n'); const lines2 = text2.split('\n'); const max = Math.max(lines1.length, lines2.length); const output = []; let hasDiff = false;
                     for(let i=0; i<max; i++) { const l1 = lines1[i] || ''; const l2 = lines2[i] || ''; if(l1 !== l2) { hasDiff = true; output.push(<div key={i} className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-slate-800/50 py-1 hover:bg-slate-900"><div className="text-red-400 bg-red-500/5 px-1 break-all">- {l1 || <span className="italic opacity-50">empty</span>}</div><div className="text-emerald-400 bg-emerald-500/5 px-1 break-all">+ {l2 || <span className="italic opacity-50">empty</span>}</div></div>); } }
                     return hasDiff ? output : <div className="text-center text-slate-500 text-sm py-8 flex flex-col items-center"><CheckCircle className="mb-2 text-emerald-500"/> Texts are identical</div>;
                  })()}
               </div>
            </div>
          )}
          {activeTab === 'generate' && (
             <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="text-center space-y-2"><div className="p-4 bg-slate-800 rounded-full inline-block mb-2 text-primary-400"><Sparkles size={32}/></div><h3 className="text-xl font-bold text-white">Quick Generators</h3><p className="text-slate-400 text-sm">Need placeholder content fast? We got you.</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                   <button onClick={() => { generateText('lorem'); setActiveTab('editor'); }} className="p-6 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all group text-left"><div className="flex items-center gap-2 mb-2 text-white font-semibold"><AlignLeft size={18}/> Lorem Ipsum</div><p className="text-xs text-slate-400">Standard Latin placeholder text for layouts.</p></button>
                   <button onClick={() => { generateText('random'); setActiveTab('editor'); }} className="p-6 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all group text-left"><div className="flex items-center gap-2 mb-2 text-white font-semibold"><Binary size={18}/> Random String</div><p className="text-xs text-slate-400">500 characters of alphanumeric chaos.</p></button>
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
      setHistory(prev => [{ eq: display, res: displayVal }, ...prev].slice(0, 10));
      setDisplay(displayVal);
    } catch (e) {
      setDisplay('Error');
    }
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
          <input type="text" readOnly value={display} className="w-full bg-transparent text-right text-4xl font-mono mb-6 text-white focus:outline-none overflow-x-auto" />
          <div className="grid grid-cols-4 gap-3">
            <button onClick={clear} className="p-4 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition">AC</button>
            {['(', ')', '/'].map(btn => <button key={btn} onClick={() => handleInput(btn)} className="p-4 rounded-xl bg-slate-800 text-primary-400 hover:bg-slate-700 transition">{btn}</button>)}
            {['7', '8', '9', '*'].map(btn => <button key={btn} onClick={() => handleInput(btn)} className={`p-4 rounded-xl ${isNaN(btn) ? 'bg-slate-800 text-primary-400' : 'bg-slate-800 text-white'} hover:bg-slate-700 transition`}>{btn === '*' ? '×' : btn}</button>)}
            {['4', '5', '6', '-'].map(btn => <button key={btn} onClick={() => handleInput(btn)} className={`p-4 rounded-xl ${isNaN(btn) ? 'bg-slate-800 text-primary-400' : 'bg-slate-800 text-white'} hover:bg-slate-700 transition`}>{btn}</button>)}
            {['1', '2', '3', '+'].map(btn => <button key={btn} onClick={() => handleInput(btn)} className={`p-4 rounded-xl ${isNaN(btn) ? 'bg-slate-800 text-primary-400' : 'bg-slate-800 text-white'} hover:bg-slate-700 transition`}>{btn}</button>)}
            <button onClick={() => handleInput('0')} className="col-span-2 p-4 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition">0</button>
            <button onClick={() => handleInput('.')} className="p-4 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition">.</button>
            <button onClick={calculate} className="p-4 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 shadow-lg shadow-primary-600/30 transition">=</button>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-2xl flex flex-col max-h-[500px]">
          <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">History</h3>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm text-slate-300 custom-scrollbar pr-2">
            {history.map((item, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-800 pb-1">
                <span className="opacity-60">{item.eq}</span>
                <span className="text-white font-bold">= {item.res}</span>
              </div>
            ))}
            {history.length === 0 && <p className="text-slate-600 text-center italic mt-4">No history yet</p>}
          </div>
        </div>
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
    } catch(e) {
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
    if(window.confirm("Are you sure you want to clear all data?")) {
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
    
    const dCalc = debtors.map(d => ({...d}));
    const cCalc = creditors.map(c => ({...c}));

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
                <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase font-bold tracking-wider mb-2"><Activity size={14}/> Total Group Spend</div>
                <div className="text-3xl font-black text-white tracking-tight">{currency}{stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-blue-400 text-xs uppercase font-bold tracking-wider"><Users size={14}/> Members ({members.length})</div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3 max-h-20 overflow-y-auto custom-scrollbar">
                    {members.map(m => (
                        <span key={m} className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 group relative pr-6 transition-colors hover:border-slate-600">
                            {m}
                            <button onClick={() => removeMember(m)} className="absolute right-1 text-slate-500 hover:text-red-400 transition-colors"><X size={12}/></button>
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="text" value={newMember} onChange={e => setNewMember(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition-colors" placeholder="New member name..." />
                    <button onClick={addMember} className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-500 transition-transform active:scale-95"><Plus size={14}/></button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-center shadow-lg">
                <button onClick={exportData} className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-white transition-colors group">
                    <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-slate-700 group-hover:scale-110 transition-all"><Download size={24} className="text-emerald-500"/></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Export to CSV</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2 uppercase tracking-wider"><Receipt size={16} className="text-emerald-400"/> Add New Expense</h3>
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative group">
                                <span className="absolute left-3 top-2.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors">Description</span>
                                <input type="text" value={newExp.desc} onChange={e => setNewExp({...newExp, desc: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-3 pr-3 pt-7 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="Dinner, Uber, etc." />
                            </div>
                            <div className="relative group">
                                <span className="absolute left-3 top-2.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors">Amount</span>
                                <span className="absolute left-3 top-7 text-slate-400 text-sm">{currency}</span>
                                <input type="number" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-7 pr-3 pt-7 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="flex gap-3 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-xs font-bold text-slate-500 uppercase pl-1">Paid by</span>
                            <div className="flex-1 relative">
                                <select value={newExp.payer} onChange={e => setNewExp({...newExp, payer: e.target.value})} className="w-full appearance-none bg-transparent text-sm text-white outline-none cursor-pointer font-medium pl-2 py-1">
                                    {members.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-0 top-1.5 text-slate-500 pointer-events-none"/>
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
                                <Receipt className="mx-auto text-slate-700 mb-3" size={32}/>
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
                                <button onClick={() => removeExpense(e.id)} className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all bg-slate-800/50 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2 uppercase tracking-wider"><BarChart size={16} className="text-blue-400"/> Net Balances</h3>
                    <BalanceChart data={stats.balances} />
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-4 px-2 uppercase tracking-wider border-t border-slate-800 pt-3">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> Owes</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Gets Back</span>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                    <h3 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2 uppercase tracking-wider"><CheckCircle size={16} className="text-emerald-400"/> Settlement Plan</h3>
                    {stats.transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                            <CheckCircle size={32} className="text-slate-700"/>
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
                                            <ArrowRight size={12} className="text-slate-600"/>
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

const Dashboard = ({ changeTool }) => (
  <div className="animate-fade-in p-6 md:p-10 max-w-7xl mx-auto">
    <div className="mb-10 relative">
      <div className="absolute -left-10 -top-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Welcome Back</h2>
      <p className="text-slate-400 text-lg max-w-2xl">Your all-in-one developer and lifestyle utility suite. Select a tool to get started.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
      <ToolCard title="Dev Tools" desc="Base64, Hashing, URL." icon={Binary} onClick={() => changeTool('devtools')} colorClass="bg-violet-100 text-violet-500" />
      <ToolCard title="SplitWise" desc="Group expenses & debts." icon={Wallet} onClick={() => changeTool('splitwise')} colorClass="bg-emerald-100 text-emerald-500" />
      <ToolCard title="Calculator" desc="Math with history." icon={Calculator} onClick={() => changeTool('calculator')} colorClass="bg-blue-100 text-blue-500" />
      <ToolCard title="Unit Converter" desc="Length, Weight, etc." icon={ArrowRightLeft} onClick={() => changeTool('unit-converter')} colorClass="bg-indigo-100 text-indigo-500" />
      <ToolCard title="Quick Split" desc="Simple bill splitting." icon={Receipt} onClick={() => changeTool('split-bill')} colorClass="bg-orange-100 text-orange-500" />
      <ToolCard title="Rate Calculator" desc="Price-to-Weight calc." icon={Tag} onClick={() => changeTool('rate-calc')} colorClass="bg-pink-100 text-pink-500" />
      <ToolCard title="Currency" desc="Live estimates." icon={Coins} onClick={() => changeTool('currency')} colorClass="bg-yellow-100 text-yellow-500" />
      <ToolCard title="EMI Calculator" desc="Loan breakdowns." icon={Landmark} onClick={() => changeTool('emi-calc')} colorClass="bg-teal-100 text-teal-500" />
      <ToolCard title="Health Station" desc="BMI, BMR & Calories." icon={Activity} onClick={() => changeTool('health')} colorClass="bg-rose-100 text-rose-500" />
      <ToolCard title="Text Studio" desc="Manipulate & generate." icon={FileText} onClick={() => changeTool('text-tools')} colorClass="bg-indigo-100 text-indigo-400" />
      <ToolCard title="Finance Suite" desc="Tax & Discounts." icon={Briefcase} onClick={() => changeTool('finance-suite')} colorClass="bg-green-100 text-green-600" />
      <ToolCard title="Time Suite" desc="Stopwatch & Unix." icon={Clock} onClick={() => changeTool('time-suite')} colorClass="bg-sky-100 text-sky-500" />
      <ToolCard title="Password Vault" desc="Secure generator." icon={Lock} onClick={() => changeTool('password')} colorClass="bg-indigo-100 text-indigo-500" />
      <ToolCard title="JSON Formatter" desc="Validate & Minify." icon={FileJson} onClick={() => changeTool('json')} colorClass="bg-amber-100 text-amber-500" />
      <ToolCard title="YAML ↔ JSON" desc="Convert formats." icon={Database} onClick={() => changeTool('yaml')} colorClass="bg-fuchsia-100 text-fuchsia-500" />
      <ToolCard title="Regex Builder" desc="Visual construction." icon={Search} onClick={() => changeTool('regex')} colorClass="bg-pink-100 text-pink-600" />
      <ToolCard title="UUID Gen" desc="Unique identifiers." icon={Fingerprint} onClick={() => changeTool('uuid')} colorClass="bg-slate-100 text-slate-400" />
      <ToolCard title="QR Generator" desc="Text to QR code." icon={QrCode} onClick={() => changeTool('qr')} colorClass="bg-slate-100 text-slate-200" />
      <ToolCard title="Color Studio" desc="Palettes & Converters." icon={Palette} onClick={() => changeTool('color-studio')} colorClass="bg-cyan-100 text-cyan-500" />
      <ToolCard title="Image Resizer" desc="Compress & Resize." icon={ImageIcon} onClick={() => changeTool('image-resizer')} colorClass="bg-purple-100 text-purple-500" />
      <ToolCard title="Age Calc" desc="Exact age details." icon={Cake} onClick={() => changeTool('age-calc')} colorClass="bg-red-100 text-red-500" />
      <ToolCard title="To-Do" desc="Persistent tasks." icon={CheckSquare} onClick={() => changeTool('todo')} colorClass="bg-lime-100 text-lime-500" />
    </div>
  </div>
);

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
      else if (fromUnit === 'c' && toUnit === 'f') res = (val * 9/5) + 32;
      else if (fromUnit === 'c' && toUnit === 'k') res = val + 273.15;
      else if (fromUnit === 'f' && toUnit === 'c') res = (val - 32) * 5/9;
      else if (fromUnit === 'f' && toUnit === 'k') res = (val - 32) * 5/9 + 273.15;
      else if (fromUnit === 'k' && toUnit === 'c') res = val - 273.15;
      else if (fromUnit === 'k' && toUnit === 'f') res = (val - 273.15) * 9/5 + 32;
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
    <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Unit Converter</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          {Object.keys(UNIT_DATA).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${category === cat ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-primary-500'}`}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <label className="text-xs text-slate-500 uppercase font-bold">From</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-2xl font-mono text-white py-2 outline-none" />
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full bg-slate-800 text-slate-300 text-sm rounded p-2 outline-none border border-slate-700">
              {UNIT_DATA[category] && Object.entries(UNIT_DATA[category]).map(([key, label]) => <option key={key} value={key}>{label} ({key})</option>)}
            </select>
          </div>
          <div className="flex justify-center"><button onClick={() => { setFromUnit(toUnit); setToUnit(fromUnit); }} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-primary-400 transition-transform hover:rotate-180"><ArrowRightLeft size={16} /></button></div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <label className="text-xs text-slate-500 uppercase font-bold">To</label>
            <div className="w-full bg-transparent text-2xl font-mono text-emerald-400 py-2 overflow-hidden text-ellipsis">{result}</div>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full bg-slate-800 text-slate-300 text-sm rounded p-2 outline-none border border-slate-700">
              {UNIT_DATA[category] && Object.entries(UNIT_DATA[category]).map(([key, label]) => <option key={key} value={key}>{label} ({key})</option>)}
            </select>
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
    <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Split Bill</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Total Bill</label>
            <div className="flex relative">
              <span className="absolute left-3 top-2.5 text-slate-500">{currency}</span>
              <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-8 pr-4 text-white focus:ring-1 focus:ring-primary-500 outline-none" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Tip: <span className="text-white font-bold">{tip}%</span></label>
            <input type="range" min="0" max="50" value={tip} onChange={(e) => setTip(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>0%</span><span>25%</span><span>50%</span></div>
          </div>
          <div>
             <label className="block text-sm text-slate-400 mb-1">People</label>
             <div className="flex items-center gap-3">
                 <button onClick={() => setPeople(Math.max(1, people - 1))} className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center">-</button>
                 <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-2 text-center text-white">{people}</div>
                 <button onClick={() => setPeople(people + 1)} className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center">+</button>
             </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 flex flex-col justify-center space-y-6 border border-slate-800">
           <div className="flex justify-between items-center pb-4 border-b border-slate-800"><span className="text-slate-400">Total Tip</span><span className="text-xl font-semibold text-emerald-400">{currency}{tipAmount.toFixed(2)}</span></div>
           <div className="flex justify-between items-center pb-4 border-b border-slate-800"><span className="text-slate-400">Total + Tip</span><span className="text-xl font-semibold text-white">{currency}{totalWithTip.toFixed(2)}</span></div>
           <div className="flex justify-between items-center pt-2"><div className="flex flex-col"><span className="text-slate-400 text-sm">Per Person</span><span className="text-xs text-slate-500">Bill + Tip</span></div><span className="text-4xl font-bold text-primary-400">{currency}{perPerson.toFixed(2)}</span></div>
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
      return { qty: grams >= 1000 ? `${(grams/1000).toFixed(3)} kg` : `${grams.toFixed(0)} g` };
    }
  };
  const result = calculate();

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Rate Calculator</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 md:p-8 rounded-2xl space-y-8">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Tag size={18} className="text-pink-500"/> Step 1: Base Rate</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full"><label className="block text-xs text-slate-400 mb-1">Price</label><div className="relative"><span className="absolute left-3 top-2 text-slate-500">{currency}</span><input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-white focus:border-pink-500 outline-none" /></div></div>
            <div className="flex-1 w-full"><label className="block text-xs text-slate-400 mb-1">For Quantity</label><div className="flex gap-2"><input type="number" value={baseQty} onChange={e => setBaseQty(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:border-pink-500 outline-none" /><select value={baseUnit} onChange={e => setBaseUnit(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-2 text-white outline-none"><option value="kg">kg</option><option value="g">g</option><option value="l">L</option><option value="ml">ml</option></select></div></div>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Calculator size={18} className="text-primary-400"/> Step 2: Calculate</h3>
          <div className="flex bg-slate-800 p-1 rounded-lg mb-6 w-full md:w-fit">
             <button onClick={() => setMode('price')} className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'price' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Find Price</button>
             <button onClick={() => setMode('qty')} className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'qty' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Find Quantity</button>
          </div>
          {mode === 'price' ? (
             <div className="space-y-4">
                <p className="text-sm text-slate-400">Cost for <span className="text-white font-bold">X quantity</span>?</p>
                <div className="flex gap-4 items-end">
                   <div className="flex-1"><div className="flex gap-2"><input type="number" value={targetQty} onChange={e => setTargetQty(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" /><select value={targetUnit} onChange={e => setTargetUnit(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-2 text-white outline-none"><option value="kg">kg</option><option value="g">g</option><option value="l">L</option><option value="ml">ml</option></select></div></div>
                </div>
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center"><span className="text-slate-400">You Pay:</span><span className="text-2xl font-bold text-emerald-400">{currency}{result.price}</span></div>
             </div>
          ) : (
            <div className="space-y-4">
                <p className="text-sm text-slate-400">Qty for <span className="text-white font-bold">X budget</span>?</p>
                <div className="relative"><span className="absolute left-3 top-2 text-slate-500">{currency}</span><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-white outline-none" /></div>
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center"><span className="text-slate-400">You Get:</span><span className="text-2xl font-bold text-primary-400">{result.qty}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CurrencyConverter = () => {
    const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.5, INR: 83.3, AUD: 1.52, CAD: 1.36 };
    const [amount, setAmount] = useState(1);
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('INR');
    const [customRate, setCustomRate] = useState(null);

    useEffect(() => {
        const defaultRate = rates[to] / rates[from];
        setCustomRate(defaultRate.toFixed(4));
    }, [from, to]);

    const result = (amount * (parseFloat(customRate) || 0)).toFixed(2);

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Currency Converter</h2>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                    <Coins size={16} /> Note: Rates are approximate. Edit rate below for custom precision.
                </div>
                <div className="mb-6 bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center justify-center text-sm gap-2">
                    <span className="text-slate-400">1 {from} =</span>
                    <input type="number" value={customRate || ''} onChange={(e) => setCustomRate(e.target.value)} className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-center focus:border-yellow-500 outline-none"/>
                    <span className="text-slate-400">{to}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400">Amount</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-xl outline-none" />
                        <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 outline-none">
                            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-center pt-6"><ArrowRightLeft className="text-slate-500" /></div>
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400">Converted</label>
                        <input type="text" readOnly value={result} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-emerald-400 font-bold text-xl outline-none" />
                        <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 outline-none">
                            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
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
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); showToast('Copied!'); } catch (err) { console.error('Copy failed', err); }
    document.body.removeChild(textArea);
  };

  const PaletteBlock = ({ index }) => {
      const rgbVal = hexToRgb(color);
      const rgba = rgbVal ? `rgba(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b}, ${(index * 0.2).toFixed(1)})` : color;
      return (
        <div onClick={() => copy(rgba)} className="flex-1 h-full cursor-pointer hover:flex-[1.5] transition-all flex items-end justify-center pb-2 group relative" style={{ backgroundColor: color, opacity: index * 0.2 }}>
          <span className="text-[10px] bg-black/50 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-8">Copy</span>
          <span className="text-[10px] bg-black/50 text-white px-1 rounded">{Math.round(index*20)}%</span>
        </div>
      );
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
       <h2 className="text-2xl font-bold mb-6 text-white">Color Studio</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
             <div className="mb-4"><label className="block text-sm text-slate-400 mb-2">Pick Color</label><div className="relative w-full h-24 rounded-xl overflow-hidden cursor-pointer"><input type="color" value={color} onChange={handleColorChange} className="absolute -top-2 -left-2 w-[110%] h-[120%] cursor-pointer p-0 border-0" /></div></div>
             <div className="space-y-3">
                 {[{ label: 'HEX', val: color }, { label: 'RGB', val: rgb }, { label: 'HSL', val: hsl }].map((item) => (
                   <div key={item.label} onClick={() => copy(item.val)} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700 hover:border-primary-500 cursor-pointer group transition-colors"><span className="text-slate-400 text-sm font-mono">{item.label}</span><div className="flex items-center gap-2"><span className="text-white font-mono">{item.val}</span><Copy size={12} className="text-slate-600 group-hover:text-primary-400" /></div></div>
                 ))}
             </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl"><h3 className="text-lg font-semibold mb-4 text-white">Generated Palette</h3><div className="flex h-32 rounded-xl overflow-hidden mb-4 bg-slate-800">{[1,2,3,4,5].map(i => <PaletteBlock key={i} index={i} opacity={i} />)}</div><p className="text-xs text-slate-400">Click any shade to copy RGBA code.</p></div>
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
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Image Resizer</h2>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
                {!image ? (
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:bg-slate-800/50 transition-colors relative cursor-pointer"><input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><Upload size={48} className="mx-auto text-slate-500 mb-4" /><p className="text-white font-medium">Click or Drag image here</p><p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP</p></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-center min-h-[300px]"><img src={preview} alt="Preview" className="max-w-full max-h-[400px] object-contain" /></div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-white mb-4">Settings</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div><label className="text-xs text-slate-400">Width</label><input type="number" value={width} onChange={(e) => handleDimChange('w', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" /></div>
                                    <div><label className="text-xs text-slate-400">Height</label><input type="number" value={height} onChange={(e) => handleDimChange('h', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" /></div>
                                </div>
                                <div className="flex items-center gap-2 mb-6"><input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} className="accent-primary-500 w-4 h-4" /><label className="text-sm text-slate-300">Maintain Aspect Ratio</label></div>
                                <div className="mb-6"><label className="flex justify-between text-sm text-slate-400 mb-2">Quality: <span className="text-white">{quality}%</span></label><input type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" /></div>
                                <div className="mb-4 text-xs text-slate-500">Original: <span className="text-slate-300">{(originalSize / 1024).toFixed(2)} KB</span></div>
                                <div className="flex gap-3"><button onClick={download} className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"><Download size={18} /> Download</button><button onClick={() => setImage(null)} className="px-4 py-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold transition-all"><X size={18} /></button></div>
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
        if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        const nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today > nextBday) nextBday.setFullYear(today.getFullYear() + 1);
        const diffDays = Math.ceil(Math.abs(nextBday - today) / (1000 * 60 * 60 * 24));
        setResult({ age: `${years}y ${months}m ${days}d`, next: diffDays });
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Age Calculator</h2>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><label className="block text-sm text-slate-400 mb-2">Date of Birth</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white scheme-dark" /><button onClick={calculate} className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors">Calculate</button></div>
                <div className="space-y-4"><div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center"><div className="text-xs text-slate-500 uppercase">Exact Age</div><div className="text-2xl font-bold text-white mt-1">{result ? result.age : '--'}</div></div><div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center"><div className="text-xs text-slate-500 uppercase">Next Birthday In</div><div className="text-xl font-bold text-primary-400 mt-1">{result ? `${result.next} days` : '--'}</div></div></div>
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

    useEffect(() => { localStorage.setItem('omni-todos-react', JSON.stringify(todos)); }, [todos]);

    const add = () => { if (!input.trim()) return; setTodos([...todos, { text: input, done: false }]); setInput(''); };
    const toggle = (idx) => { const newTodos = [...todos]; newTodos[idx].done = !newTodos[idx].done; setTodos(newTodos); };
    const remove = (idx) => { setTodos(todos.filter((_, i) => i !== idx)); };
    const clearCompleted = () => { setTodos(todos.filter(t => !t.done)); };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">To-Do List</h2>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
                <div className="flex gap-2 mb-6"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add a new task..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-primary-500 transition-colors" /><button onClick={add} className="bg-primary-600 hover:bg-primary-500 text-white px-6 rounded-lg font-bold transition-colors">+</button></div>
                <ul className="space-y-2 mb-4">{todos.map((t, i) => (<li key={i} className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg group"><input type="checkbox" checked={t.done} onChange={() => toggle(i)} className="w-5 h-5 accent-primary-500 rounded cursor-pointer" /><span className={`flex-1 text-sm ${t.done ? 'line-through text-slate-500' : 'text-white'}`}>{t.text}</span><button onClick={() => remove(i)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button></li>))} {todos.length === 0 && <li className="text-center text-slate-500 text-sm py-4">No tasks yet. Let's get productive!</li>}</ul>
                <div className="pt-4 border-t border-slate-700 flex justify-between text-xs text-slate-500"><span>{todos.filter(t => !t.done).length} active tasks</span><button onClick={clearCompleted} className="text-red-400 hover:text-red-300 transition-colors">Clear Completed</button></div>
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
      if(!input) { setParsedData(null); return; }
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
    <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">JSON Formatter</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
         <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-3">
               <span className="text-xs font-bold text-slate-400 uppercase">Input JSON</span>
               <div className="flex gap-2">
                  <button onClick={() => format(false)} className="px-3 py-1 bg-slate-800 hover:bg-primary-600 text-white text-xs rounded transition">Prettify</button>
                  <button onClick={() => format(true)} className="px-3 py-1 bg-slate-800 hover:bg-primary-600 text-white text-xs rounded transition">Minify</button>
               </div>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)} className={`flex-1 w-full bg-slate-950 border ${error ? 'border-red-500/50' : 'border-slate-800'} rounded-xl p-4 text-slate-300 font-mono text-xs focus:outline-none resize-none`} placeholder="Paste JSON here..." spellCheck="false"></textarea>
            {error && (<div className="mt-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-mono flex items-center gap-2"><AlertCircle size={14} /> {error}</div>)}
         </div>
         <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3">
               <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                  <button onClick={() => setView('tree')} className={`px-3 py-1 rounded text-xs font-medium transition ${view === 'tree' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>Tree View</button>
                  <button onClick={() => setView('raw')} className={`px-3 py-1 rounded text-xs font-medium transition ${view === 'raw' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>Raw Data</button>
               </div>
               <button onClick={() => copy(input)} className="text-slate-400 hover:text-white"><Copy size={16}/></button>
            </div>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto custom-scrollbar">
               {parsedData ? (view === 'tree' ? (<div className="font-mono text-sm leading-relaxed"><JsonNode value={parsedData} isLast={true} /></div>) : (<pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(parsedData, null, 2)}</pre>)) : (<div className="h-full flex items-center justify-center text-slate-600 text-sm italic">{error ? 'Fix errors to view tree' : 'Waiting for valid JSON...'}</div>)}
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
    <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">QR Generator</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row gap-8">
         <div className="flex-1 space-y-6">
            <div>
               <label className="block text-sm text-slate-400 mb-2">Content (URL or Text)</label>
               <textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-primary-500 outline-none resize-none" placeholder="Enter text to encode..."></textarea>
            </div>
            <div>
               <label className="block text-sm text-slate-400 mb-2">Size: {size}px</label>
               <input type="range" min="100" max="500" step="10" value={size} onChange={e => setSize(e.target.value)} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
            </div>
         </div>
         <div className="flex flex-col items-center justify-center bg-white/5 p-8 rounded-xl border border-white/10">
            <div className="bg-white p-2 rounded-lg shadow-lg">
               {text ? (<img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" style={{ width: size/1.5, height: size/1.5, maxWidth: '100%' }} />) : (<div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">Enter text</div>)}
            </div>
            <a href={qrUrl} download="qrcode.png" target="_blank" rel="noreferrer" className="mt-6 flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"><Download size={16} /> Download PNG</a>
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
    <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">YAML ↔ JSON</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl flex flex-col h-[700px]">
        <div className="flex justify-center mb-6">
           <div className="flex bg-slate-800 p-1 rounded-lg">
              <button onClick={() => setMode('json2yaml')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'json2yaml' ? 'bg-primary-600 text-white' : 'text-slate-400'}`}>JSON to YAML</button>
              <button onClick={() => setMode('yaml2json')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'yaml2json' ? 'bg-primary-600 text-white' : 'text-slate-400'}`}>YAML to JSON</button>
           </div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
           <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase">{mode === 'json2yaml' ? 'JSON Input' : 'YAML Input'}</label>
              <textarea value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 outline-none" placeholder="Paste content here..."></textarea>
           </div>
           <div className="flex flex-col relative">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase">{mode === 'json2yaml' ? 'YAML Output' : 'JSON Output'}</label>
              <textarea readOnly value={output} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 font-mono text-xs resize-none focus:outline-none" placeholder="Result..."></textarea>
              <button onClick={copy} className="absolute top-8 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"><Copy size={16}/></button>
           </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
           <div className="text-red-400 text-sm font-mono">{error}</div>
           <button onClick={convert} className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all">Convert</button>
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
    <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">UUID Generator</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
         <div className="flex items-end gap-4 mb-6">
            <div className="flex-1"><label className="block text-sm text-slate-400 mb-2">Quantity: {count}</label><input type="range" min="1" max="50" value={count} onChange={e => setCount(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg accent-primary-500" /></div>
            <button onClick={generate} className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition">Generate</button>
         </div>
         <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-96 overflow-y-auto custom-scrollbar space-y-2">
            {uuids.map((uuid, i) => (
               <div key={i} className="flex justify-between items-center group">
                  <span className="font-mono text-slate-300 text-sm">{uuid}</span>
                  <button onClick={() => { navigator.clipboard.writeText(uuid); showToast('Copied'); }} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white p-1"><Copy size={14}/></button>
               </div>
            ))}
         </div>
         {uuids.length > 1 && (<button onClick={copyAll} className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition">Copy All</button>)}
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
  try { if (regexString && testString) { isMatch = new RegExp(regexString).test(testString); } } catch(e) {}

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Guided Regex Builder</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl space-y-8">
         <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Add Block</label>
            <div className="flex flex-wrap gap-2">
               {['start','text','word','digit','whitespace','end'].map(t => <button key={t} onClick={() => addPart(t)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded border border-slate-700 uppercase">{t}</button>)}
            </div>
         </div>
         <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[100px] flex flex-wrap gap-2 items-center">
            {parts.length === 0 && <span className="text-slate-600 text-sm italic">Click blocks above to build regex...</span>}
            {parts.map((p, i) => (
               <div key={i} className="flex items-center bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
                  <span className="text-xs font-bold text-white mr-2 uppercase">{p.type}</span>
                  {p.type === 'text' && (<input type="text" value={p.value} onChange={e => updatePart(i, e.target.value)} className="bg-slate-900 border border-slate-600 rounded px-2 py-0.5 text-xs text-white w-20 outline-none" placeholder="text..." autoFocus />)}
                  <button onClick={() => removePart(i)} className="ml-2 text-slate-500 hover:text-red-400"><X size={14}/></button>
               </div>
            ))}
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Generated Regex</label><div className="bg-slate-800 p-3 rounded-lg text-white font-mono text-sm break-all">/{regexString}/</div></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Test String</label><div className="relative"><input type="text" value={testString} onChange={e => setTestString(e.target.value)} className={`w-full bg-slate-800 border ${isMatch ? 'border-emerald-500' : 'border-slate-700'} rounded-lg p-3 text-white outline-none pr-10`} placeholder="Type to test..." />{testString && (<div className={`absolute right-3 top-3 ${isMatch ? 'text-emerald-500' : 'text-red-500'}`}>{isMatch ? <CheckCircle size={20}/> : <X size={20}/>}</div>)}</div></div>
         </div>
      </div>
    </div>
  );
};

const TimeSuite = () => {
  const [tab, setTab] = useState('stopwatch');
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  useEffect(() => { let interval; if (swRunning) { interval = setInterval(() => setSwTime(t => t + 10), 10); } return () => clearInterval(interval); }, [swRunning]);

  const [cdRunning, setCdRunning] = useState(false);
  const [cdInput, setCdInput] = useState(5);
  const [cdLeft, setCdLeft] = useState(0);
  useEffect(() => { let interval; if (cdRunning && cdLeft > 0) { interval = setInterval(() => setCdLeft(l => l - 1000), 1000); } else if (cdLeft <= 0) { setCdRunning(false); } return () => clearInterval(interval); }, [cdRunning, cdLeft]);
  const startCd = () => { setCdLeft(cdInput * 60 * 1000); setCdRunning(true); };

  const [dateInput, setDateInput] = useState('');
  const dayOfWeek = dateInput ? new Date(dateInput).toLocaleDateString('en-US', { weekday: 'long' }) : '--';
  const [unixTs, setUnixTs] = useState(Math.floor(Date.now()/1000));

  const formatMs = (ms) => {
    const m = Math.floor(ms / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${m}:${s}.${cs}`;
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Time & Date Suite</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
         <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto no-scrollbar">
            {['stopwatch', 'timer', 'unix', 'day'].map(t => (<button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${tab === t ? 'border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>{t}</button>))}
         </div>
         <div className="p-8">
            {tab === 'stopwatch' && (<div className="text-center"><div className="text-7xl font-mono font-bold text-white mb-8 tabular-nums">{formatMs(swTime)}</div><div className="flex justify-center gap-4"><button onClick={() => setSwRunning(!swRunning)} className={`w-16 h-16 rounded-full flex items-center justify-center text-xl transition ${swRunning ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}>{swRunning ? <Pause /> : <Play />}</button><button onClick={() => { setSwRunning(false); setSwTime(0); }} className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"><RotateCcw /></button></div></div>)}
            {tab === 'timer' && (<div className="text-center">{cdRunning ? (<><div className="text-7xl font-mono font-bold text-white mb-8 tabular-nums">{formatMs(cdLeft).split('.')[0]}</div><button onClick={() => setCdRunning(false)} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold">Stop</button></>) : (<div className="flex flex-col items-center gap-6"><div className="flex items-center gap-4"><input type="number" value={cdInput} onChange={e => setCdInput(e.target.value)} className="w-24 bg-slate-800 border border-slate-700 rounded-xl p-4 text-center text-2xl text-white outline-none" /><span className="text-slate-400">Minutes</span></div><button onClick={startCd} className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold">Start Timer</button></div>)}</div>)}
            {tab === 'unix' && (<div className="space-y-6"><div><label className="block text-xs text-slate-400 uppercase mb-2">Current Unix Timestamp</label><div className="text-3xl font-mono text-emerald-400">{Math.floor(Date.now()/1000)}</div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-xs text-slate-400 uppercase mb-2">Convert Timestamp</label><input type="number" value={unixTs} onChange={e => setUnixTs(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none mb-2" /><div className="text-sm text-white">{new Date(unixTs * 1000).toLocaleString()}</div></div></div></div>)}
            {tab === 'day' && (<div className="max-w-sm mx-auto"><label className="block text-xs text-slate-400 uppercase mb-2">Select Date</label><input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white scheme-dark mb-4" /><div className="bg-slate-950 p-6 rounded-xl text-center border border-slate-800"><div className="text-sm text-slate-500 mb-1">Day of the Week</div><div className="text-2xl font-bold text-primary-400">{dayOfWeek}</div></div></div>)}
         </div>
      </div>
    </div>
  );
};

const FinanceSuite = () => {
  const [tab, setTab] = useState('gst');
  const currency = getCurrencySymbol();
  const [gstPrice, setGstPrice] = useState(1000);
  const [gstRate, setGstRate] = useState(18);
  const gstAmt = gstPrice * (gstRate/100);
  const [discPrice, setDiscPrice] = useState(1000);
  const [discRate, setDiscRate] = useState(20);
  const discAmt = discPrice * (discRate/100);
  const [p, setP] = useState(10000);
  const [r, setR] = useState(5);
  const [t, setT] = useState(5);
  const si = (p*r*t)/100;
  const ci = p * (Math.pow((1 + r/100), t)) - p;
  
  // Tax Logic
  const [salary, setSalary] = useState(1200000);
  const [regime, setRegime] = useState('new'); // 'new' or 'old'
  const [deductions, setDeductions] = useState(0); // 80C etc for Old

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
            breakdown.push({ range: '> 15L', rate: '30%', amt: t });
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
    return { tax, cess, total: tax + cess, breakdown, taxable };
  };

  const taxResult = calculateTax();

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Finance Suite</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
         <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto no-scrollbar">
            {['gst', 'discount', 'interest', 'tax'].map(t => (<button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${tab === t ? 'border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>{t === 'tax' ? 'Salary Tax (IN)' : t}</button>))}
         </div>
         <div className="p-8">
            {tab === 'gst' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><div><label className="block text-xs text-slate-400 mb-1">Amount</label><input type="number" value={gstPrice} onChange={e => setGstPrice(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" /></div><div><label className="block text-xs text-slate-400 mb-1">GST %</label><input type="number" value={gstRate} onChange={e => setGstRate(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" /></div></div><div className="space-y-4"><div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between"><span>GST Amount</span><span className="font-bold text-white">{currency}{gstAmt.toFixed(2)}</span></div><div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between"><span>Total</span><span className="font-bold text-emerald-400 text-xl">{currency}{(gstPrice + gstAmt).toFixed(2)}</span></div></div></div>)}
            {tab === 'discount' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><div><label className="block text-xs text-slate-400 mb-1">Price</label><input type="number" value={discPrice} onChange={e => setDiscPrice(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" /></div><div><label className="block text-xs text-slate-400 mb-1">Discount %</label><input type="number" value={discRate} onChange={e => setDiscRate(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" /></div></div><div className="space-y-4"><div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between"><span>You Save</span><span className="font-bold text-emerald-400">{currency}{discAmt.toFixed(2)}</span></div><div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between"><span>Payable</span><span className="font-bold text-white text-xl">{currency}{(discPrice - discAmt).toFixed(2)}</span></div></div></div>)}
            {tab === 'interest' && (<div className="space-y-6"><div className="grid grid-cols-3 gap-4"><div><label className="block text-xs text-slate-400 mb-1">Principal</label><input type="number" value={p} onChange={e => setP(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" /></div><div><label className="block text-xs text-slate-400 mb-1">Rate (%)</label><input type="number" value={r} onChange={e => setR(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" /></div><div><label className="block text-xs text-slate-400 mb-1">Time (Yrs)</label><input type="number" value={t} onChange={e => setT(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" /></div></div><div className="grid grid-cols-2 gap-6"><div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><div className="text-xs text-slate-500 mb-1">Simple Interest</div><div className="text-2xl font-bold text-white">{currency}{si.toFixed(0)}</div><div className="text-xs text-slate-500 mt-1">Total: {currency}{(p+si).toFixed(0)}</div></div><div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><div className="text-xs text-slate-500 mb-1">Compound Interest</div><div className="text-2xl font-bold text-emerald-400">{currency}{ci.toFixed(0)}</div><div className="text-xs text-slate-500 mt-1">Total: {currency}{(p+ci).toFixed(0)}</div></div></div></div>)}
            {tab === 'tax' && (
               <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
                     <button onClick={() => setRegime('new')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${regime === 'new' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>New Regime (FY24-25)</button>
                     <button onClick={() => setRegime('old')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${regime === 'old' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>Old Regime</button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs text-slate-400 mb-1">Annual Gross Salary</label>
                        <input type="number" value={salary} onChange={e => setSalary(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none" />
                     </div>
                     {regime === 'old' && (
                        <div>
                           <label className="block text-xs text-slate-400 mb-1">Total Deductions (80C, etc.)</label>
                           <input type="number" value={deductions} onChange={e => setDeductions(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none" />
                        </div>
                     )}
                  </div>

                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                     <div className="flex justify-between text-sm text-slate-400 pb-2 border-b border-slate-800">
                        <span>Taxable Income (after Std Ded)</span>
                        <span className="text-white font-mono">{currency}{Math.round(taxResult.taxable).toLocaleString()}</span>
                     </div>
                     <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase">Tax Breakdown</p>
                        {taxResult.breakdown.map((item, i) => (
                           <div key={i} className="flex justify-between text-xs">
                              <span className="text-slate-400">{item.range} <span className="text-slate-600">(@{item.rate})</span></span>
                              <span className="text-slate-300">{currency}{Math.round(item.amt).toLocaleString()}</span>
                           </div>
                        ))}
                     </div>
                     <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                        <div className="text-xs text-slate-500">Includes 4% Cess</div>
                        <div className="text-right">
                           <div className="text-xs text-slate-400 mb-1">Total Annual Tax</div>
                           <div className="text-2xl font-bold text-white">{currency}{Math.round(taxResult.total).toLocaleString()}</div>
                        </div>
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-4">
                     * Estimates based on general slabs. Surcharge not included.
                  </p>
               </div>
            )}
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
                 <span className="text-sm font-bold text-white">{currency}{(totalAmount/100000).toFixed(2)}L</span>
              </div>
           </div>
           <div className="w-full space-y-3">
              <div className="flex justify-between text-sm">
                 <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary-500"></span> Principal</span>
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
  if (bmi < 18.5) { bmiStatus = 'Underweight'; bmiColor = 'text-blue-400'; }
  else if (bmi >= 25 && bmi < 30) { bmiStatus = 'Overweight'; bmiColor = 'text-yellow-400'; }
  else if (bmi >= 30) { bmiStatus = 'Obese'; bmiColor = 'text-red-400'; }

  const bmr = gender === 'male' 
    ? 10 * weight + 6.25 * height - 5 * age + 5 
    : 10 * weight + 6.25 * height - 5 * age - 161;
   
  const tdee = Math.round(bmr * activity);

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Health Station</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
        
        <div className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-lg w-fit">
           <button onClick={() => setMode('bmi')} className={`px-4 py-1.5 rounded-md text-sm transition-all ${mode === 'bmi' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>BMI</button>
           <button onClick={() => setMode('bmr')} className={`px-4 py-1.5 rounded-md text-sm transition-all ${mode === 'bmr' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>Calories (BMR)</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div>
                 <label className="block text-xs text-slate-400 mb-1">Height (cm)</label>
                 <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" />
              </div>
              <div>
                 <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
                 <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" />
              </div>
              {mode === 'bmr' && (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Age</label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none" />
                  </div>
                  <div className="flex gap-4">
                     <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                        <input type="radio" name="gender" checked={gender === 'male'} onChange={() => setGender('male')} className="accent-primary-500" /> Male
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                        <input type="radio" name="gender" checked={gender === 'female'} onChange={() => setGender('female')} className="accent-primary-500" /> Female
                     </label>
                  </div>
                  <div>
                     <label className="block text-xs text-slate-400 mb-1">Activity Level</label>
                     <select value={activity} onChange={e => setActivity(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none text-sm">
                        <option value="1.2">Sedentary (Office job)</option>
                        <option value="1.375">Light Exercise (1-2 days)</option>
                        <option value="1.55">Moderate Exercise (3-5 days)</option>
                        <option value="1.725">Heavy Exercise (6-7 days)</option>
                     </select>
                  </div>
                </>
              )}
           </div>

           <div className="flex items-center justify-center bg-slate-800/50 rounded-xl p-6 border border-slate-800">
              {mode === 'bmi' ? (
                 <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">Your BMI Score</div>
                    <div className="text-5xl font-bold text-white mb-2">{bmi}</div>
                    <div className={`text-lg font-medium ${bmiColor}`}>{bmiStatus}</div>
                 </div>
              ) : (
                 <div className="text-center w-full">
                    <div className="text-sm text-slate-400 mb-4">Daily Calorie Needs</div>
                    <div className="text-4xl font-bold text-white mb-2">{tdee} <span className="text-lg text-slate-500 font-normal">kcal</span></div>
                    <div className="text-xs text-slate-500">Maintenance</div>
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700">
                       <div>
                          <div className="text-xs text-emerald-400">Gain Weight</div>
                          <div className="font-bold text-white">{tdee + 500}</div>
                       </div>
                       <div>
                          <div className="text-xs text-red-400">Lose Weight</div>
                          <div className="font-bold text-white">{tdee - 500}</div>
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
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); showToast('Copied!'); } catch (err) { console.error(err); }
    document.body.removeChild(textArea);
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Password Vault</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl space-y-6">
         <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-mono text-xl text-white break-all mr-4">{password}</span>
            <div className="flex gap-2">
               <button onClick={generate} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"><RefreshCw size={18}/></button>
               <button onClick={() => copy(password)} className="p-2 text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition"><Copy size={18}/></button>
            </div>
         </div>
         <div className="flex gap-1 h-1.5">
            {[...Array(5)].map((_, i) => (
               <div key={i} className={`flex-1 rounded-full transition-colors ${i < strength ? (strength < 3 ? 'bg-red-500' : strength < 5 ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-slate-800'}`} />
            ))}
         </div>
         <div className="space-y-4">
            <div>
               <div className="flex justify-between text-sm text-slate-400 mb-2"><span>Length</span><span>{length}</span></div>
               <input type="range" min="6" max="32" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-750 transition"><input type="checkbox" checked={includeUpper} onChange={e => setIncludeUpper(e.target.checked)} className="w-5 h-5 accent-primary-500 rounded" /><span className="text-sm text-slate-200">Uppercase (A-Z)</span></label>
               <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-750 transition"><input type="checkbox" checked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)} className="w-5 h-5 accent-primary-500 rounded" /><span className="text-sm text-slate-200">Numbers (0-9)</span></label>
               <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-750 transition"><input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} className="w-5 h-5 accent-primary-500 rounded" /><span className="text-sm text-slate-200">Symbols (!@#)</span></label>
            </div>
         </div>
      </div>
    </div>
  );
};

const DevTools = ({ showToast }) => {
  const [mode, setMode] = useState('base64');
  const [base64Mode, setBase64Mode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
     const process = async () => {
       if(!input) { setOutput(''); return; }
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
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); showToast('Copied!'); } catch (err) { console.error(err); }
    document.body.removeChild(textArea);
  };

  return (
    <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Dev Tools</h2>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
         <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {['base64', 'url', 'hash'].map(m => (
               <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wide transition-all whitespace-nowrap ${mode === m ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{m === 'hash' ? 'SHA-256' : m}</button>
            ))}
         </div>
         <div className="space-y-6">
            <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="block text-xs text-slate-400 uppercase">Input</label>
                 {mode === 'base64' && (
                    <div className="flex bg-slate-800 rounded p-0.5">
                       <button onClick={() => setBase64Mode('encode')} className={`px-3 py-0.5 text-xs rounded transition-colors ${base64Mode === 'encode' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>Encode</button>
                       <button onClick={() => setBase64Mode('decode')} className={`px-3 py-0.5 text-xs rounded transition-colors ${base64Mode === 'decode' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>Decode</button>
                    </div>
                 )}
               </div>
               <textarea value={input} onChange={e => setInput(e.target.value)} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:border-primary-500 outline-none resize-none" placeholder="Type or paste content here..."></textarea>
            </div>
            <div className="relative">
               <label className="block text-xs text-emerald-400 mb-2 uppercase">Output</label>
               <textarea readOnly value={output} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 font-mono text-sm focus:outline-none resize-none"></textarea>
               <button onClick={() => copy(output)} className="absolute top-8 right-4 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"><Copy size={16} /></button>
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Gauge, group: 'main' },
    { id: 'splitwise', label: 'SplitWise', icon: Wallet, group: 'main' },
    { id: 'calculator', label: 'Calculator', icon: Calculator, group: 'util' },
    { id: 'unit-converter', label: 'Unit Converter', icon: ArrowRightLeft, group: 'util' },
    { id: 'currency', label: 'Currency', icon: Coins, group: 'util' },
    { id: 'time-suite', label: 'Time Suite', icon: Clock, group: 'util' },
    { id: 'text-tools', label: 'Text Studio', icon: FileText, group: 'util' },
    { id: 'finance-suite', label: 'Finance', icon: Briefcase, group: 'util' },
    { id: 'split-bill', label: 'Quick Split', icon: Receipt, group: 'life' },
    { id: 'rate-calc', label: 'Rate Calc', icon: Tag, group: 'life' },
    { id: 'emi-calc', label: 'EMI Calc', icon: Landmark, group: 'life' },
    { id: 'health', label: 'Health', icon: Activity, group: 'life' },
    { id: 'password', label: 'Password', icon: Lock, group: 'tech' },
    { id: 'regex', label: 'Regex Builder', icon: Search, group: 'tech' },
    { id: 'devtools', label: 'Dev Tools', icon: Binary, group: 'tech' },
    { id: 'json', label: 'JSON', icon: FileJson, group: 'tech' },
    { id: 'yaml', label: 'YAML', icon: Database, group: 'tech' },
    { id: 'uuid', label: 'UUID', icon: Fingerprint, group: 'tech' },
    { id: 'qr', label: 'QR Gen', icon: QrCode, group: 'tech' },
    { id: 'color-studio', label: 'Color Studio', icon: Palette, group: 'media' },
    { id: 'image-resizer', label: 'Image Resizer', icon: ImageIcon, group: 'media' },
    { id: 'age-calc', label: 'Age Calc', icon: Cake, group: 'life' },
    { id: 'todo', label: 'To-Do', icon: CheckSquare, group: 'life' },
  ];

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
      case 'devtools': return <DevTools showToast={showToast} />;
      case 'json': return <JsonFormatter showToast={showToast} />;
      case 'regex': return <RegexBuilder />;
      case 'qr': return <QrGenerator />;
      case 'yaml': return <YamlConverter showToast={showToast} />;
      case 'uuid': return <UuidGenerator showToast={showToast} />;
      case 'time-suite': return <TimeSuite />;
      case 'finance-suite': return <FinanceSuite />;
      default: return <Dashboard changeTool={setActiveTool} />;
    }
  };

  const NavButton = ({ item, mobile = false }) => (
    <button
      onClick={() => { setActiveTool(item.id); if(mobile) setMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        activeTool === item.id 
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
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">OmniTools</h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          <NavButton item={menuItems[0]} />
          <NavButton item={menuItems[1]} /> {/* SplitWise in main section */}
           
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">Utilities <div className="h-px bg-slate-800 flex-1"/></div>
          {menuItems.filter(i => i.group === 'util').map(item => <NavButton key={item.id} item={item} />)}
           
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">Life & Health <div className="h-px bg-slate-800 flex-1"/></div>
          {menuItems.filter(i => i.group === 'life').map(item => <NavButton key={item.id} item={item} />)}

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">Tech & Dev <div className="h-px bg-slate-800 flex-1"/></div>
          {menuItems.filter(i => i.group === 'tech').map(item => <NavButton key={item.id} item={item} />)}

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">Media <div className="h-px bg-slate-800 flex-1"/></div>
          {menuItems.filter(i => i.group === 'media').map(item => <NavButton key={item.id} item={item} />)}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 text-center">v4.2.0 React</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-50 flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded bg-primary-500 flex items-center justify-center">
              <LayoutDashboard className="text-white" size={14} />
           </div>
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">OmniTools</h1>
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