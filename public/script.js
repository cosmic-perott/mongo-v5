const firebaseConfig = {
          apiKey: [FIREBASE_API_KEY],
          authDomain: [FIREBASE_URL],
          projectId: [FIREBASE_URL],
          storageBucket: [FIREBASE_URL],
          messagingSenderId: [FIREBASE_URL_ID],
          appId: [FIREBASE_APP_ID],
          measurementId: [FIREBASE_MEASUREMENT_ID]
        };

        firebase.initializeApp(firebaseConfig);
        const provider = new firebase.auth.GoogleAuthProvider();

        const { useState, useEffect } = React;

        function MinimalCurator() {
            const [userEmail, setUserEmail] = useState(null);
            const [showAuthModal, setShowAuthModal] = useState(true);

            const [university, setUniversity] = useState('');
            const [major, setMajor] = useState('');
            const [hobby, setHobby] = useState('');
            const [currentStep, setCurrentStep] = useState('idle'); 
            const [statusText, setStatusText] = useState('');
            const [roadmap, setRoadmap] = useState(null);

            const executionPhases = [
                "Scraping historical successful university profiles...",
                "Running verification algorithms on baseline ideas...",
                "Filtering out overdone bullshit concepts...",
                "Synthesizing high-impact custom project mutations..."
            ];

            useEffect(() => {
                const savedToken = localStorage.getItem('authToken');
                const savedEmail = localStorage.getItem('userEmail');
                if (savedToken && savedEmail) {
                    setUserEmail(savedEmail);
                    setShowAuthModal(false);
                } else {
                    setShowAuthModal(true);
                }
            }, []);

            useEffect(() => {
                if (currentStep !== 'processing') return;

                let phaseIndex = 0;
                setStatusText(executionPhases[0]);

                const interval = setInterval(() => {
                    phaseIndex++;
                    if (phaseIndex < executionPhases.length) {
                        setStatusText(executionPhases[phaseIndex]);
                    }
                }, 1300);

                return () => clearInterval(interval);
            }, [currentStep]);

            const handleGoogleLogin = async () => {
                try {
                    const result = await firebase.auth().signInWithPopup(provider);
                    const user = result.user;
                    
                    const response = await fetch('http://localhost:5000/api/signup', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: user.email, password: `OAuth_Google_${user.uid}` }) 
                    });

                    let tokenData;
                    if (!response.ok) {
                       const loginResponse = await fetch('http://localhost:5000/api/login', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ email: user.email, password: `OAuth_Google_${user.uid}` })
                       });
                       tokenData = await loginResponse.json();
                    } else {
                       const loginResponse = await fetch('http://localhost:5000/api/login', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ email: user.email, password: `OAuth_Google_${user.uid}` })
                       });
                       tokenData = await loginResponse.json();
                    }

                    localStorage.setItem('authToken', tokenData.token);
                    localStorage.setItem('userEmail', user.email);
                    setUserEmail(user.email);
                    setShowAuthModal(false);

                } catch (error) {
                    alert("Google authentication failed: " + error.message);
                }
            };

            const handleLogout = () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                setUserEmail(null);
                setRoadmap(null);
                setCurrentStep('idle');
                setUniversity('');
                setMajor('');
                setHobby('');
                setShowAuthModal(true);
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!university.trim() || !major.trim() || !hobby.trim()) return;

                setCurrentStep('processing');
                const combinedTopic = `University: ${university} | Major: ${major} | Focus/Obsession: ${hobby}`;

                try {
                    const response = await fetch(`http://localhost:5000/api/curriculum?topic=${encodeURIComponent(combinedTopic)}`);
                    const data = await response.json();

                    if (data.error) {
                        alert("Engine Error: " + data.error);
                        setCurrentStep('idle');
                        return;
                    }

                    setRoadmap(data);
                    setCurrentStep('complete');

                } catch (err) {
                    setCurrentStep('idle');
                    alert("Could not reach the backend. Is server running?");
                }
            };

            return (
                <div className="min-h-screen flex flex-col justify-between p-6 bg-[#fafafa]">
                    
                    {showAuthModal && (
                        <div className="auth-overlay">
                          <div className="auth-modal-content animate-reveal">
                            <h2>Welcome to IceBerg</h2>
                            <p>Sign in to access the Premium College Admissions Spike Engine & Strategy Architecture Suite.</p>
                            <button type="button" id="googleAuthBtn" onClick={handleGoogleLogin}>
                              <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/web-24dp/copy_of_24dp.png" alt="Google Logo" />
                              Continue with Google
                            </button>
                          </div>
                        </div>
                    )}

                    {/* 🔥 THE INDEX BAR ISLAND (Floating Header Structure) */}
                    <div className="w-full max-w-5xl mx-auto fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4">
                        <header className="w-full bg-white/80 backdrop-blur-md border border-neutral-200/60 shadow-[0_2px_20px_rgba(0,0,0,0.02)] rounded-2xl px-6 py-3.5 flex justify-between items-center">
                            <div className="flex items-center gap-3 select-none">
                                <span className="font-extrabold tracking-tight text-neutral-900 text-base">IceBerg</span>
                                <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Spike V2
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                {userEmail && (
                                    <div className="flex items-center gap-3 border-r border-neutral-200 pr-6">
                                        <div className="flex flex-col text-right">
                                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Operator</span>
                                            <span className="text-xs font-semibold text-neutral-700">{userEmail}</span>
                                        </div>
                                        <button 
                                            onClick={handleLogout}
                                            className="text-[10px] font-bold bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-red-600 hover:border-red-200 px-2.5 py-1 rounded-lg transition-all duration-150"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                                <div className="text-[11px] font-bold tracking-wide text-neutral-400 uppercase font-mono">
                                    Admissions Intelligence Layer
                                </div>
                            </div>
                        </header>
                    </div>

                    {/* MAIN GENERATOR FRAME CONTAINER */}
                    <main className="flex-1 flex flex-col items-center justify-center max-w-xl w-full mx-auto pt-24 pb-12">
                        
                        {currentStep === 'idle' && (
                            <div className="w-full text-center animate-reveal">
                                <h1 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">Architect Your Admissions Spike</h1>
                                <p className="text-sm text-neutral-400 mb-6 font-medium">Mutate real admissions patterns into elite technical innovations.</p>
                                
                                <form onSubmit={handleSubmit} className="w-full text-left space-y-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Target University</label>
                                        <input
                                            type="text"
                                            value={university}
                                            onChange={(e) => setUniversity(e.target.value)}
                                            placeholder="e.g., Stanford University"
                                            className="w-full bg-white text-neutral-800 text-sm border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-600 transition-colors font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Intended Major</label>
                                        <input
                                            type="text"
                                            value={major}
                                            onChange={(e) => setMajor(e.target.value)}
                                            placeholder="e.g., Computer Science"
                                            className="w-full bg-white text-neutral-800 text-sm border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-600 transition-colors font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">Personal Hobby / Tech Constraint (e.g., Virtual Reality)</label>
                                        <input
                                            type="text"
                                            value={hobby}
                                            onChange={(e) => setHobby(e.target.value)}
                                            placeholder="e.g., Virtual Reality"
                                            className="w-full bg-white text-neutral-800 text-sm border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-600 transition-colors font-medium"
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={!university.trim() || !major.trim() || !hobby.trim()}
                                        className="w-full mt-2 bg-blue-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                                    >
                                        Extract & Mutate Project Pathways
                                    </button>
                                </form>
                            </div>
                        )}

                        {currentStep === 'processing' && (
                            <div className="w-full text-center py-12 animate-reveal">
                                <div className="inline-block relative w-12 h-12 mb-6">
                                    <div className="absolute inset-0 border-2 border-neutral-100 rounded-full" />
                                    <div className="absolute inset-0 border-2 border-t-blue-600 rounded-full animate-spin" />
                                </div>
                                <p className="text-neutral-700 font-mono text-xs tracking-wider uppercase font-bold">
                                    {statusText}
                                </p>
                            </div>
                        )}

                        {currentStep === 'complete' && roadmap && (
                            <div className="w-full space-y-6 max-w-xl animate-reveal">
                                
                                <div className="border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm">
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 font-mono">
                                        Admissions Archetype Synthesized
                                    </div>
                                    <h2 className="text-xl font-bold text-neutral-800 tracking-tight">
                                        The Filtered Strategy
                                    </h2>
                                    <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                                        {roadmap.summary}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono px-1">
                                        Vetted Structural Projects
                                    </p>
                                    
                                    {roadmap.milestones && roadmap.milestones.map((milestone, idx) => (
                                        <div 
                                            key={idx} 
                                            className="border border-neutral-200 rounded-2xl p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-blue-400 transition-colors duration-200 group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-6 h-6 rounded-md bg-neutral-50 border border-neutral-200 flex items-center justify-center text-xs font-mono font-bold text-neutral-500 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {milestone.phase || idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-neutral-800 text-sm tracking-tight mb-2">
                                                        {milestone.title}
                                                    </h3>
                                                    <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-xs text-neutral-600 mb-3 space-y-1">
                                                        {milestone.core_concept}
                                                    </div>
                                                    <div className="pt-2.5 border-t border-dashed border-neutral-200 flex flex-col gap-2">
                                                        <span className="text-[9px] w-max font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                            Execution Blueprint & Build Guidelines
                                                        </span>
                                                        <p className="text-xs text-neutral-600 leading-relaxed">
                                                            {milestone.action_item}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border border-neutral-200 rounded-2xl p-6 bg-slate-900 text-white flex items-center justify-between gap-4 shadow-md">
                                    <div>
                                        <span className="text-[9px] text-blue-400 font-mono uppercase tracking-wider block font-bold">Faculty Audit Suite</span>
                                        <span className="text-xs font-semibold text-slate-200">Locked: Match Project with 3 Active Research Professors</span>
                                    </div>
                                    <button 
                                        onClick={() => alert("Launching Stripe billing layout...")}
                                        className="bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Upgrade to Premium
                                    </button>
                                </div>

                                <div className="flex justify-center pt-2">
                                    <button 
                                        onClick={() => { setUniversity(''); setMajor(''); setHobby(''); setRoadmap(null); setCurrentStep('idle'); }}
                                        className="text-neutral-400 hover:text-neutral-800 text-xs transition-colors font-medium"
                                    >
                                        ← Clear Context & Reset Form
                                    </button>
                                </div>
                            </div>
                        )}

                    </main>

                    <footer className="max-w-6xl w-full mx-auto text-center text-[11px] text-neutral-400 font-semibold tracking-wide uppercase select-none">
                        Built By Project IceBerg
                    </footer>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<MinimalCurator />);
