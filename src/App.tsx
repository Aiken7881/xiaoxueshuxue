/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Home, 
  ChevronRight, 
  Search, 
  Menu, 
  X, 
  Download,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { parseKnowledgePoints, usePersistence } from './data/utils';
import { MAIN_CATEGORIES, KnowledgePoint } from './data/constants';

// --- Sub-components ---

const CategoryCard = ({ 
  title, 
  learned, 
  total, 
  icon,
  borderColor,
  onClick 
}: { 
  title: string; 
  learned: number; 
  total: number; 
  icon: string;
  borderColor: string;
  onClick: () => void;
}) => {
  const progress = (learned / total) * 100;
  
  const colorMap: Record<string, { bg: string, text: string, bar: string }> = {
    'border-green-500': { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-500' },
    'border-blue-500': { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500' },
    'border-orange-500': { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-500' },
    'border-purple-500': { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-500' }
  };
  const colors = colorMap[borderColor] || { bg: 'bg-slate-50', text: 'text-slate-600', bar: 'bg-slate-500' };

  return (
    <motion.button
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white p-6 rounded-3xl shadow-sm flex flex-col justify-between text-left border-b-4 ${borderColor} transition-all h-48`}
    >
      <div className="flex justify-between items-start w-full">
        <div className={`p-3 rounded-2xl text-xl ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${colors.bg} ${colors.text}`}>
          {learned}/{total}
        </span>
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-800">{title}</h4>
        <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
          <motion.div 
            className={colors.bar}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </motion.button>
  );
};

// --- Main Views ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'learning'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<KnowledgePoint | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [expandedSubCats, setExpandedSubCats] = useState<Record<string, boolean>>({});
  
  const knowledgePoints = useMemo(() => parseKnowledgePoints(), []);
  const { progress, togglePoint } = usePersistence();

  const totalPoints = knowledgePoints.length;
  const learnedCount = Object.values(progress).filter(Boolean).length;
  const overallProgress = (learnedCount / totalPoints) * 100;

  const categoryStats = useMemo(() => {
    const stats: Record<string, { learned: number; total: number }> = {};
    MAIN_CATEGORIES.forEach(cat => stats[cat] = { learned: 0, total: 0 });
    
    knowledgePoints.forEach(p => {
      if (stats[p.category]) {
        stats[p.category].total++;
        if (progress[p.id]) stats[p.category].learned++;
      }
    });
    return stats;
  }, [knowledgePoints, progress]);

  const filteredPoints = useMemo(() => {
    if (!searchQuery) return knowledgePoints;
    return knowledgePoints.filter(p => 
      p.name.includes(searchQuery) || 
      p.subcategory.includes(searchQuery) ||
      p.category.includes(searchQuery)
    );
  }, [knowledgePoints, searchQuery]);

  const groupedData = useMemo(() => {
    const grouped: any = {};
    filteredPoints.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = {};
      if (!grouped[p.category][p.subcategory]) grouped[p.category][p.subcategory] = [];
      grouped[p.category][p.subcategory].push(p);
    });
    return grouped;
  }, [filteredPoints]);

  const exportCSV = () => {
    const unlearned = knowledgePoints.filter(p => !progress[p.id]);
    const headers = "分类,子分类,知识点,年级\n";
    const rows = unlearned.map(p => `${p.category},${p.subcategory},${p.name},${p.grade}`).join('\n');
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "自学课程表.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleSubCat = (sub: string) => {
    setExpandedSubCats(prev => ({ ...prev, [sub]: !prev[sub] }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col p-6 items-center max-w-5xl mx-auto w-full"
          >
            {/* Top Bar for Dashboard */}
            <header className="w-full flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm mb-8">
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20">
                  <svg width="80" height="80" className="-rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                    <motion.circle 
                      cx="40" cy="40" r="34" fill="none" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray="213.6"
                      initial={{ strokeDashoffset: 213.6 }}
                      animate={{ strokeDashoffset: 213.6 - (213.6 * (overallProgress / 100)) }}
                      transition={{ duration: 1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold leading-none">{Math.round(overallProgress)}%</span>
                    <span className="text-[10px] text-slate-400">已完成</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">你好, 学习伙伴!</h2>
                  <p className="text-slate-500 text-sm">今天准备学习哪些新知识？加油！</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">全书进度</p>
                <p className="text-lg font-bold text-slate-800">{learnedCount} / {totalPoints}</p>
              </div>
            </header>

            {/* Hero Section */}
            <div className="w-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg flex justify-between items-center mb-8">
              <div className="relative z-10 max-w-lg">
                <h3 className="text-3xl font-bold mb-4">开启今日挑战</h3>
                <p className="opacity-90 mb-8 text-lg">
                  点击下方按钮进入提前学目录，自由探索数学奥秘。系统会实时同步你的学习进度。
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('learning')}
                  className="bg-white text-blue-600 font-bold px-10 py-4 text-lg rounded-2xl shadow-none"
                >
                  进入提前学目录
                </motion.button>
              </div>
              <div className="hidden lg:block">
                <div className="w-48 h-48 bg-white opacity-10 rounded-full absolute -right-10 -bottom-10"></div>
                <div className="w-32 h-32 bg-white opacity-5 rounded-full absolute right-20 top-5"></div>
              </div>
            </div>

            {/* Core Modules Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
              {[
                { name: '数与代数', icon: '🔢', border: 'border-green-500' },
                { name: '图形与几何', icon: '📐', border: 'border-blue-500' },
                { name: '统计与概率', icon: '📊', border: 'border-orange-500' },
                { name: '综合与实践', icon: '💡', border: 'border-purple-500' }
              ].map(cat => (
                <CategoryCard
                  key={cat.name}
                  title={cat.name}
                  icon={cat.icon}
                  borderColor={cat.border}
                  learned={categoryStats[cat.name].learned}
                  total={categoryStats[cat.name].total}
                  onClick={() => {
                    setView('learning');
                    setExpandedCats({ [cat.name]: true });
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="learning"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col h-screen overflow-hidden"
          >
            {/* Header */}
            <nav className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                  {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div 
                  className="flex items-center gap-2 font-bold text-primary cursor-pointer hover:opacity-80"
                  onClick={() => setView('dashboard')}
                >
                  <Home size={20} />
                  <span>主页仪表盘</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                  <span>已完成:</span>
                  <span className="text-primary font-bold">{learnedCount}/{totalPoints}</span>
                </div>
              </div>
            </nav>

            <div className="flex flex-1 overflow-hidden relative">
              {/* Sidebar drawer overlay for mobile */}
              {isSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              {/* Sidebar */}
              <motion.aside
                initial={false}
                animate={{ 
                  width: isSidebarOpen ? (window.innerWidth < 768 ? '85%' : 320) : 0,
                  opacity: isSidebarOpen ? 1 : 0 
                }}
                className={`bg-white border-r overflow-hidden flex flex-col shrink-0 z-40 fixed md:relative h-[calc(100vh-64px)] md:h-auto shadow-2xl md:shadow-none`}
              >
                <div className="p-6 shrink-0">
                  <div className="mb-4">
                    <h1 className="text-xl font-bold text-slate-800">小学数学提前学</h1>
                    <p className="text-xs text-slate-500">{totalPoints} 核心知识点</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="搜索知识点..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F1F5F9] rounded-2xl py-3 pl-10 pr-4 outline-none transition-all placeholder:text-slate-400 text-sm"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-12 custom-scrollbar">
                  {Object.keys(groupedData).map(cat => (
                    <div key={cat} className="mb-4">
                      <button
                        onClick={() => toggleCat(cat)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold text-sm text-slate-800 text-left ${expandedCats[cat] ? 'bg-primary-light text-primary' : 'hover:bg-slate-50'}`}
                      >
                        <span className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${expandedCats[cat] ? 'bg-primary' : 'bg-slate-300'}`} />
                          {cat}
                        </span>
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform duration-200 ${expandedCats[cat] ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      <AnimatePresence>
                        {expandedCats[cat] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-4 pl-4 border-l-2 border-gray-100 mt-1"
                          >
                            {Object.keys(groupedData[cat]).map(sub => (
                              <div key={sub} className="mb-2">
                                <button
                                  onClick={() => toggleSubCat(sub)}
                                  className="w-full text-sm font-semibold text-gray-500 py-2 flex items-center justify-between hover:text-primary"
                                >
                                  {sub}
                                  <ChevronRight size={14} className={expandedSubCats[sub] ? 'rotate-90' : ''} />
                                </button>
                                
                                {expandedSubCats[sub] && (
                                  <div className="space-y-1 mt-1">
                                    {groupedData[cat][sub].map((p: KnowledgePoint) => (
                                      <div 
                                        key={p.id}
                                        className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${selectedPoint?.id === p.id ? 'bg-[#DCFCE7] text-[#166534] font-semibold' : 'hover:bg-[#F0FDF4] text-slate-600'}`}
                                        onClick={() => {
                                          setSelectedPoint(p);
                                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={!!progress[p.id]}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            togglePoint(p.id);
                                          }}
                                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm truncate flex-1">{p.name}</span>
                                        {progress[p.id] && <CheckCircle2 size={14} className="text-primary" />}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t shrink-0">
                  <button 
                    onClick={exportCSV}
                    className="w-full bg-slate-100 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Download size={16} />
                    <span>导出未学课程表</span>
                  </button>
                </div>
              </motion.aside>

              {/* Content Area */}
              <main className="flex-1 bg-gray-50 flex flex-col">
                {selectedPoint ? (
                  <div className="flex-1 flex flex-col p-4 sm:p-8">
                    <div className="bg-white rounded-3xl shadow-lg flex-1 flex flex-col overflow-hidden">
                      <div className="p-6 border-b shrink-0 flex items-center justify-between bg-white">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">
                            <span>{selectedPoint.category}</span>
                            <span>/</span>
                            <span>{selectedPoint.subcategory}</span>
                          </div>
                          <h2 className="text-2xl font-black text-gray-800">{selectedPoint.name}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer bg-primary/10 text-primary px-4 py-2 rounded-2xl font-bold hover:bg-primary/20 transition-colors">
                            <input
                              type="checkbox"
                              checked={!!progress[selectedPoint.id]}
                              onChange={() => togglePoint(selectedPoint.id)}
                              className="w-5 h-5 rounded border-primary text-primary focus:ring-primary"
                            />
                            {progress[selectedPoint.id] ? '已学会' : '标记已学'}
                          </label>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-100 relative">
                        <iframe 
                          src={`./knowledge/${encodeURIComponent(selectedPoint.name)}.html`}
                          className="w-full h-full border-none"
                          title={selectedPoint.name}
                          onError={(e) => {
                            // Note: Since these files likely don't exist yet, we show a friendly placeholder
                            console.log('Iframe failed to load, probably missing static file.');
                          }}
                        />
                        {/* Fallback for missing files */}
                        <div className="absolute inset-0 flex items-center justify-center p-12 text-center pointer-events-none opacity-20">
                          <div className="space-y-4">
                            <BookOpen size={64} className="mx-auto" />
                            <p className="text-xl font-bold">正在加载学习内容...</p>
                            <p className="text-sm italic">(内容文件: ./knowledge/{selectedPoint.name}.html)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-400">
                    <div className="max-w-md space-y-6">
                      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <BookOpen size={48} className="text-gray-200" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-800">开始你的学习之旅</h3>
                        <p>请点击左侧目录，选择一个你想学习的数学知识点吧！</p>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
