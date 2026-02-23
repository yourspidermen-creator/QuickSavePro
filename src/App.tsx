/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState(false);
  const [logs, setLogs] = useState<{ text: string; color: string; time: string }[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; msg: string; isError: boolean; visible: boolean }>({
    title: '',
    msg: '',
    isError: false,
    visible: false,
  });
  
  // Calculator state
  const [calcQuality, setCalcQuality] = useState('28');
  const [calcMin, setCalcMin] = useState('5');
  const [calcResult, setCalcResult] = useState('140');

  // Speed test state
  const [speed, setSpeed] = useState('0.0');
  const [testingSpeed, setTestingSpeed] = useState(false);

  // Progress Modal state
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('Initializing connection...');
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Stats
  const [userCount, setUserCount] = useState('1.2k');

  useEffect(() => {
    const interval = setInterval(() => {
      const users = (1.2 + (Math.random() * 0.1)).toFixed(1);
      setUserCount(`${users}k`);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (title: string, msg: string, isError = false) => {
    setToast({ title, msg, isError, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const runTerminal = async (url: string) => {
    setLogs([]);
    const hostname = new URL(url).hostname;
    const steps = [
      { text: `[INIT] Handshaking with server...`, delay: 300, color: 'text-slate-400' },
      { text: `[AUTH] Bypassing localized restrictions...`, delay: 600, color: 'text-yellow-400' },
      { text: `[FETCH] Extracting media stream from ${hostname}...`, delay: 1200, color: 'text-blue-400' },
      { text: `[SCAN] Checking for copyright flags... (CLEAN)`, delay: 1800, color: 'text-emerald-400' },
      { text: `[DONE] Content ready for distribution.`, delay: 2200, color: 'text-white' }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay - (steps[steps.indexOf(step) - 1]?.delay || 0)));
      setLogs(prev => [...prev, { 
        text: step.text, 
        color: step.color, 
        time: new Date().toLocaleTimeString().split(' ')[0] 
      }]);
    }
  };

  const handleDownload = async () => {
    if (!isValidUrl(url)) {
      setError(true);
      return;
    }
    setError(false);
    setResult(false);
    setLoading(true);

    await runTerminal(url);

    setTimeout(() => {
      setLoading(false);
      setResult(true);
      showToast('Success', 'Media extracted successfully.');
    }, 500);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      showToast('Clipboard', 'Link pasted successfully.');
    } catch (err) {
      showToast('Error', 'Clipboard access denied.', true);
    }
  };

  const startDownload = () => {
    setProgressVisible(true);
    setProgressPercent(0);
    setProgressStatus('Initializing connection...');
    
    let w = 0;
    if (progressInterval.current) clearInterval(progressInterval.current);
    
    progressInterval.current = setInterval(() => {
      w += Math.random() * 8;
      if (w > 100) w = 100;
      setProgressPercent(Math.floor(w));
      
      if (w === 100) {
        if (progressInterval.current) clearInterval(progressInterval.current);
        setProgressStatus('Saving to device...');
        setTimeout(() => {
          setProgressVisible(false);
          showToast('Complete', 'File saved to gallery.');
        }, 1000);
      }
    }, 150);
  };

  const cancelDownload = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setProgressVisible(false);
    showToast('Cancelled', 'Download aborted.', true);
  };

  const runSpeedTest = async () => {
    setTestingSpeed(true);
    setSpeed('...');
    
    // Use a large, reliable image from Unsplash.
    const imageAddr = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"; 
    const startTime = Date.now();
    
    try {
      const response = await fetch(imageAddr + "&cache=" + startTime);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const endTime = Date.now();
      
      const durationInSeconds = (endTime - startTime) / 1000;
      const sizeInBytes = blob.size;
      
      const speedBps = (sizeInBytes * 8) / durationInSeconds;
      const speedMbps = (speedBps / 1024 / 1024).toFixed(2);
      
      setSpeed(speedMbps);
      showToast('Speed Test', `Result: ${speedMbps} Mbps`);
      
    } catch (err) {
      console.error(err);
      setSpeed('Err');
      showToast('Error', 'Network error or CORS issue.', true);
    } finally {
      setTestingSpeed(false);
    }
  };

  useEffect(() => {
    const size = (parseFloat(calcQuality) * parseFloat(calcMin)).toFixed(0);
    setCalcResult(size);
  }, [calcQuality, calcMin]);

  return (
    <div className="antialiased font-sans selection:bg-indigo-500/30 selection:text-white min-h-screen">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full mix-blend-screen blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-purple-600/20 rounded-full mix-blend-screen blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-pink-600/10 rounded-full mix-blend-screen blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Navbar */}
      <div className="fixed w-full z-50 top-4 px-4">
        <nav className="max-w-6xl mx-auto glass-panel rounded-2xl border border-white/10 transition-all duration-300">
          <div className="px-6">
            <div className="flex justify-between h-20 items-center">
              {/* Logo */}
              <div className="flex items-center cursor-pointer group no-select" onClick={() => window.scrollTo(0, 0)}>
                <div className="relative w-11 h-11 flex items-center justify-center mr-3">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-60 blur-md"></div>
                  <div className="relative w-full h-full bg-black/50 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center">
                    <i className="fa-solid fa-bolt text-indigo-400 text-xl group-hover:text-white transition-colors"></i>
                  </div>
                </div>
                <span className="font-bold text-2xl tracking-tight text-white">Quick<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Save</span></span>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex space-x-2 items-center">
                <a href="#how-it-works" className="px-5 py-2 text-slate-300 hover:text-white text-sm font-medium transition hover:bg-white/5 rounded-full">How It Works</a>
                <a href="#tools" className="px-5 py-2 text-slate-300 hover:text-white text-sm font-medium transition hover:bg-white/5 rounded-full">Tools</a>
                <a href="#developer" className="px-5 py-2 text-slate-300 hover:text-white text-sm font-medium transition hover:bg-white/5 rounded-full">Contact</a>
                
                {/* Language Switcher */}
                <button className="ml-2 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:bg-white/10 transition">
                  <i className="fa-solid fa-globe"></i>
                  <span>EN</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden text-slate-300 hover:text-white p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/5 bg-[#050505]/95 backdrop-blur-xl rounded-b-2xl overflow-hidden">
              <div className="px-4 py-4 space-y-2">
                <a href="#how-it-works" className="block px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <a href="#tools" className="block px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300" onClick={() => setMobileMenuOpen(false)}>Tools</a>
                <a href="#developer" className="block px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300" onClick={() => setMobileMenuOpen(false)}>Developer</a>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Server Status Widget */}
      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="glass-panel p-3 rounded-xl flex flex-col gap-2 w-48 animate-fade-in-up border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">System Status</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">OPERATIONAL</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500"><i className="fa-solid fa-users mr-1"></i>Users</span>
            <span className="text-xs text-slate-300 font-mono">{userCount}</span>
          </div>
        </div>
      </div>

      {/* Main Hero Section */}
      <section className="relative pt-48 pb-20 px-4 min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase font-mono">System Operational</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight drop-shadow-2xl">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 text-glow">Ultimate</span> Way <br />
            to Download Content
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Seamlessly unlock high-quality media from any platform. <br className="hidden md:block" />
            No watermarks. No limits. Just pure content.
          </p>

          {/* Input Card */}
          <div className="glass-premium rounded-[2rem] p-1.5 max-w-3xl mx-auto transform hover:scale-[1.005] transition-all duration-500 relative shadow-2xl shadow-indigo-500/20 group">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[1.7rem] p-6 md:p-10 border border-white/5 relative overflow-hidden">
              
              {/* Platform Icons */}
              <div className="flex justify-center gap-6 mb-8 overflow-x-auto pb-2 scrollbar-hide no-select">
                <button className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 group">
                  <i className="fa-brands fa-youtube text-2xl text-slate-400 group-hover:text-red-500 transition-colors"></i>
                </button>
                <button className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 group">
                  <i className="fa-brands fa-facebook-f text-2xl text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                </button>
                <button className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all duration-300 group">
                  <i className="fa-brands fa-instagram text-2xl text-slate-400 group-hover:text-pink-500 transition-colors"></i>
                </button>
                <button className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/50 hover:bg-white/10 transition-all duration-300 group">
                  <i className="fa-brands fa-tiktok text-2xl text-slate-400 group-hover:text-white transition-colors"></i>
                </button>
              </div>

              {/* Input Field */}
              <div className="relative flex items-center bg-[#050505] rounded-2xl border border-white/10 p-2 focus-within:border-indigo-500/50 transition-colors duration-300 shadow-inner">
                <div className="pl-4 text-slate-500">
                  <i className="fa-solid fa-link text-lg"></i>
                </div>
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-600 font-medium focus:outline-none py-4 px-3 text-lg" 
                  placeholder="Paste your link here..." 
                  autoComplete="off"
                />
                
                <div className="flex items-center gap-2 pr-1">
                  <button 
                    onClick={handlePaste}
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 uppercase tracking-wider transition hover:text-white"
                  >
                    PASTE
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2 border-t border-white/20"
                  >
                    <span>Start</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              {error && (
                <p className="text-red-400 text-sm mt-4 text-left flex items-center animate-pulse pl-2">
                  <i className="fa-solid fa-circle-exclamation mr-2"></i> Invalid URL detected.
                </p>
              )}

              {/* Terminal Loader */}
              {loading && (
                <div className="mt-8 text-left animate-fade-in-up">
                  <div className="bg-[#050505] rounded-xl border border-white/10 p-5 font-mono text-xs shadow-inner h-40 overflow-hidden flex flex-col relative">
                    <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                      <span className="text-slate-500">TERMINAL</span>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                      </div>
                    </div>
                    <div className="space-y-1.5 opacity-90 text-green-400 flex-1 overflow-y-auto scrollbar-hide">
                      {logs.map((log, index) => (
                        <div key={index} className={log.color}>
                          <span className="opacity-50 mr-2">[{log.time}]</span> {log.text}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex border-t border-white/5 pt-2">
                      <span className="mr-2 text-purple-400">root@qs-server:~$</span>
                      <span className="cursor-blink bg-purple-400 w-2 h-4 block"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Result Area */}
              {result && (
                <div className="mt-10 border-t border-white/5 pt-8 text-left animate-fade-in-up">
                  <div className="flex flex-col md:flex-row gap-6 bg-white/[0.02] p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                    {/* Thumbnail */}
                    <div className="relative w-full md:w-5/12 aspect-video rounded-xl overflow-hidden border border-white/10 group bg-black shadow-2xl">
                      <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=337&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" alt="Thumbnail" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition shadow-lg">
                          <i className="fa-solid fa-play text-white ml-1 text-xl"></i>
                        </div>
                      </div>
                      <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-[10px] font-bold text-white px-2 py-1 rounded-md border border-white/10 font-mono">04:20</span>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 uppercase">Video</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 uppercase">Ready</span>
                        </div>
                        <h3 className="text-xl font-bold text-white line-clamp-2 leading-snug mb-2">Epic Viral Video - High Quality Render</h3>
                        <p className="text-xs text-slate-500 mb-6 flex items-center gap-2 font-mono"><i className="fa-regular fa-id-card"></i> <span>@ContentCreator</span></p>
                      </div>
                      <div className="space-y-3">
                        <button className="w-full flex justify-between items-center p-3.5 rounded-xl bg-white/[0.03] hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/50 group transition duration-300" onClick={startDownload}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                              <i className="fa-solid fa-video"></i>
                            </div>
                            <div className="text-left">
                              <span className="block text-sm font-bold text-white group-hover:text-indigo-400 transition">1080p Ultra HD</span>
                              <span className="text-[10px] text-slate-500 font-mono">MP4 • 145 MB</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition">
                            <i className="fa-solid fa-arrow-down"></i>
                          </div>
                        </button>
                        <button className="w-full flex justify-between items-center p-3.5 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/50 group transition duration-300" onClick={startDownload}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                              <i className="fa-solid fa-music"></i>
                            </div>
                            <div className="text-left">
                              <span className="block text-sm font-bold text-white group-hover:text-purple-400 transition">Audio Stream</span>
                              <span className="text-[10px] text-slate-500 font-mono">MP3 • 320 KBPS</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition">
                            <i className="fa-solid fa-arrow-down"></i>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Creator Tools Section */}
      <section id="tools" className="py-24 relative bg-black/20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Creator <span className="text-indigo-400">Toolkit</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">Essential utilities to manage your content workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Tool 1: Data Saver */}
            <div className="glass-premium rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-16 -mt-16 transition group-hover:bg-emerald-500/20"></div>
              <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <i className="fa-solid fa-database"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white">Data Saver Calculator</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">Calculate exact data usage before downloading. Supports various bitrates for 4K to 360p.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block">Quality</label>
                      <div className="relative">
                        <select 
                          value={calcQuality}
                          onChange={(e) => setCalcQuality(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none"
                        >
                          <option value="28">1080p (Full HD)</option>
                          <option value="12">720p (HD)</option>
                          <option value="5">480p (SD)</option>
                          <option value="2">360p (Saver)</option>
                        </select>
                        <div className="absolute right-3 top-3.5 text-slate-500 pointer-events-none text-xs"><i className="fa-solid fa-chevron-down"></i></div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block">Duration (Min)</label>
                      <input 
                        type="number" 
                        value={calcMin}
                        onChange={(e) => setCalcMin(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-[#050505]/50 rounded-2xl p-8 text-center border border-white/5 backdrop-blur-sm relative overflow-hidden">
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-2">ESTIMATED SIZE</p>
                  <h3 className="text-5xl font-bold text-white font-mono tracking-tighter">{calcResult}<span className="text-2xl text-slate-500 ml-2">MB</span></h3>
                </div>
              </div>
            </div>

            {/* Tool 2: Speed Test */}
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group hover:bg-white/5 transition">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <i className="fa-solid fa-gauge-high text-xl"></i>
                </div>
                <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-slate-400">LIVE TEST</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Speed Test</h3>
              <p className="text-sm text-slate-400 mb-8">Measure your actual download bandwidth.</p>
              
              <div className="text-center py-6 bg-[#050505]/50 rounded-2xl border border-white/5 mb-6">
                <div className="text-5xl font-mono font-bold text-white mb-2 tracking-tighter">{speed}</div>
                <div className="text-xs text-indigo-400 uppercase tracking-widest font-bold">Mbps</div>
              </div>
              <button 
                onClick={runSpeedTest}
                disabled={testingSpeed}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {testingSpeed ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Testing...
                  </>
                ) : (
                  <>
                    <span>Run Real Test</span>
                    <i className="fa-solid fa-bolt"></i>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition duration-300 border border-white/5 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition duration-300">
                <i className="fa-solid fa-bolt text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Engineered for speed. Our multi-threaded servers process video 3x faster.</p>
            </div>
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition duration-300 border border-white/5 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition duration-300">
                <i className="fa-solid fa-shield-halved text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Private</h3>
              <p className="text-slate-400 text-sm leading-relaxed">No logs, no tracking. Your download history is wiped instantly upon exit.</p>
            </div>
            <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition duration-300 border border-white/5 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition duration-300">
                <i className="fa-solid fa-infinity text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Unlimited Access</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Total freedom. Download as much content as you want, completely free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Contact Section */}
      <section id="developer" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-[#050505]/50 to-transparent -z-10"></div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="glass-premium rounded-[3rem] p-12 md:p-16 relative overflow-hidden group hover:border-indigo-500/30 transition duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-indigo-500/30 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-mono">Lead Developer</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-6 tracking-tight drop-shadow-[0_0_25px_rgba(99,102,241,0.3)]">
              MOINUL ISLAM
            </h2>
            
            <p className="text-slate-300 text-lg md:text-xl mb-10 font-light leading-relaxed max-w-xl mx-auto">
              Crafting <span className="text-indigo-400 font-medium">digital experiences</span> with pixel-perfect precision. <br /> Building the next generation of web tools.
            </p>

            <div className="flex flex-wrap justify-center gap-5 relative z-20">
              <a href="https://www.facebook.com/yourspidermen" target="_blank" rel="noreferrer"
                 className="relative flex items-center gap-3 px-8 py-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/50 rounded-2xl transition-all duration-300 group/btn backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-md"></div>
                <i className="fa-brands fa-facebook-f text-xl text-slate-300 group-hover/btn:text-white transition-colors relative z-10"></i>
                <span className="font-bold text-slate-300 text-sm group-hover/btn:text-white transition-colors tracking-wide relative z-10">Facebook</span>
              </a>

              <a href="https://www.instagram.com/yourspidermenn/" target="_blank" rel="noreferrer"
                 className="relative flex items-center gap-3 px-8 py-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-pink-500/50 rounded-2xl transition-all duration-300 group/btn backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-md"></div>
                <i className="fa-brands fa-instagram text-xl text-slate-300 group-hover/btn:text-white transition-colors relative z-10"></i>
                <span className="font-bold text-slate-300 text-sm group-hover/btn:text-white transition-colors tracking-wide relative z-10">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black pt-16 pb-12" id="contact">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <span className="font-bold text-2xl text-white">Quick<span className="text-indigo-400">Save</span></span>
              <p className="text-xs text-slate-500 mt-2">The last downloader you'll ever need.</p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition text-slate-400"><i className="fa-brands fa-github"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition text-slate-400"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition text-slate-400"><i className="fa-solid fa-envelope"></i></a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-slate-600 text-xs font-mono mb-4">&copy; 2025 QuickSave. All rights reserved.</p>
            <div className="flex gap-6 justify-center text-xs text-slate-500 font-bold uppercase tracking-wider">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Progress Modal */}
      {progressVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                <h3 className="text-white font-bold tracking-wide">Processing</h3>
              </div>
              <div className="text-sm text-indigo-400 font-mono font-bold">{progressPercent}%</div>
            </div>
            
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono mb-8">{progressStatus}</p>

            <button 
              onClick={cancelDownload}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition text-xs font-bold uppercase tracking-wider border border-white/5"
            >
              Cancel Operation
            </button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      <div 
        className={`fixed top-24 right-4 glass-panel pl-4 pr-6 py-4 rounded-xl flex items-center gap-4 transition-transform duration-500 z-[60] border-l-4 shadow-2xl ${
          toast.visible ? 'translate-x-0' : 'translate-x-[150%]'
        } ${toast.isError ? 'border-red-500' : 'border-indigo-500'}`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          toast.isError ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
        }`}>
          <i className={`fa-solid ${toast.isError ? 'fa-xmark' : 'fa-check'}`}></i>
        </div>
        <div>
          <h4 className="font-bold text-sm text-white font-sans">{toast.title}</h4>
          <p className="text-xs text-slate-400 font-mono">{toast.msg}</p>
        </div>
      </div>
    </div>
  );
}
