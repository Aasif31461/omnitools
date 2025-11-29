import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

// Data
import { menuItems } from './data/menuItems';

// Components
import Dashboard from './components/Dashboard';
import SplitWise from './components/SplitWise';
import TextTools from './components/TextTools';
import CalculatorTool from './components/CalculatorTool';
import UnitConverter from './components/UnitConverter';
import SplitBill from './components/SplitBill';
import RateCalc from './components/RateCalc';
import CurrencyConverter from './components/CurrencyConverter';
import ColorStudio from './components/ColorStudio';
import ImageResizer from './components/ImageResizer';
import AgeCalc from './components/AgeCalc';
import Todo from './components/Todo';
import EmiCalc from './components/EmiCalc';
import Health from './components/Health';
import PasswordGenerator from './components/PasswordGenerator';
import DeveloperTools from './components/DeveloperTools';
import JsonFormatter from './components/JsonFormatter';
import RegexBuilder from './components/RegexBuilder';
import QrGenerator from './components/QrGenerator';
import AspectRatio from './components/AspectRatio';
import NetworkInfo from './components/NetworkInfo';
import MarkdownPreview from './components/MarkdownPreview';
import YamlConverter from './components/YamlConverter';
import UuidGenerator from './components/UuidGenerator';
import TimeSuite from './components/TimeSuite';
import FinanceSuite from './components/FinanceSuite';
import SmartUtilities from './components/SmartUtilities';
import Toast from './components/Toast';

export default function App() {
  const [activeTool, setActiveTool] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // Scroll to top when tool changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTool]);

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
      case 'rate-calc': return <RateCalc />;
      case 'currency': return <CurrencyConverter />;
      case 'color-studio': return <ColorStudio showToast={showToast} />;
      case 'image-resizer': return <ImageResizer />;
      case 'age-calc': return <AgeCalc />;
      case 'todo': return <Todo />;
      case 'emi-calc': return <EmiCalc />;
      case 'health': return <Health />;
      case 'password': return <PasswordGenerator showToast={showToast} />;
      case 'devtools': return <DeveloperTools showToast={showToast} />;
      case 'json': return <JsonFormatter showToast={showToast} />;
      case 'regex': return <RegexBuilder />;
      case 'qr': return <QrGenerator />;
      case 'aspect-ratio': return <AspectRatio />;
      case 'network': return <NetworkInfo />;
      case 'markdown': return <MarkdownPreview />;
      case 'yaml': return <YamlConverter showToast={showToast} />;
      case 'uuid': return <UuidGenerator showToast={showToast} />;
      case 'time-suite': return <TimeSuite />;
      case 'finance-suite': return <FinanceSuite />;
      case 'smart-utilities':
        return <SmartUtilities showToast={showToast} />;
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