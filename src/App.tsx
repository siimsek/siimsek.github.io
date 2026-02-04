import { useState, useCallback, Suspense, lazy } from 'react';
import { Loader2, Globe } from 'lucide-react';
import type { PCBComponent } from '@/data/portfolioData';
import type { Language } from '@/data/translations';

// Lazy load the 3D scene for better performance
const PCBScene = lazy(() => import('@/components/three/PCBScene'));
const ComponentModal = lazy(() => import('@/components/ui/ComponentModal'));

// Loading fallback
function LoadingFallback() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#010409]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#00ff88] animate-spin mx-auto mb-4" />
        <p className="text-[#4a8c5d] font-mono text-sm">Loading PCB...</p>
      </div>
    </div>
  );
}

// Corner bracket component - reusable for all 4 corners
function CornerBracket({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const baseClasses = "absolute w-24 h-24 md:w-32 md:h-32 pointer-events-none z-10";
  const positionClasses = {
    tl: "top-0 left-0",
    tr: "top-0 right-0",
    bl: "bottom-0 left-0",
    br: "bottom-0 right-0"
  };
  
  // Using explicit transform styles to ensure reliability without relying on specific tailwind config for rotation
  const getRotation = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    switch (pos) {
      case 'tl': return 'rotate(0deg)';
      case 'tr': return 'rotate(90deg)';
      case 'bl': return 'rotate(-90deg)';
      case 'br': return 'rotate(180deg)';
    }
  };

  return (
    <div className={`${baseClasses} ${positionClasses[position]}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full opacity-40 transition-transform duration-300"
        style={{ transform: getRotation(position) }}
      >
        {/* Outer L-bracket */}
        <path
          d="M5 5 L35 5 L35 12 L12 12 L12 35 L5 35 Z"
          fill="none"
          stroke="#b87333"
          strokeWidth="1.5"
        />
        {/* Inner L-bracket */}
        <path
          d="M5 50 L12 50 L12 88 L35 88 L35 95 L5 95 Z"
          fill="none"
          stroke="#b87333"
          strokeWidth="1.5"
        />
        {/* Corner dot */}
        <circle cx="8" cy="8" r="2" fill="#00ff88" opacity="0.6" />
      </svg>
    </div>
  );
}

function App() {
  const [selectedComponent, setSelectedComponent] = useState<PCBComponent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleComponentClick = useCallback((component: PCBComponent) => {
    setSelectedComponent(component);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedComponent(null), 300);
  }, []);

  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#010409]" style={{ overflow: 'clip' }}>
      {/* All 4 Corner Brackets */}
      <CornerBracket position="tl" />
      <CornerBracket position="tr" />
      <CornerBracket position="bl" />
      <CornerBracket position="br" />

      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-[#1a3320]/80 backdrop-blur border border-[#2d5a3d] rounded-lg text-[#f0f0f0] hover:border-[#b87333] transition-colors"
          >
            <Globe className="w-4 h-4 text-[#00ff88]" />
            <span className="text-sm font-mono uppercase">{language}</span>
          </button>
          
          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 bg-[#0d1117]/95 backdrop-blur border border-[#2d5a3d] rounded-lg overflow-hidden shadow-lg"
                 style={{ boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)' }}>
              <button
                onClick={() => toggleLanguage('en')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[#1a3320] transition-colors ${
                  language === 'en' ? 'text-[#00ff88]' : 'text-[#f0f0f0]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => toggleLanguage('tr')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[#1a3320] transition-colors ${
                  language === 'tr' ? 'text-[#00ff88]' : 'text-[#f0f0f0]'
                }`}
              >
                Türkçe
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PCB 3D Scene */}
      <Suspense fallback={<LoadingFallback />}>
        <PCBScene onComponentClick={handleComponentClick} language={language} />
      </Suspense>

      {/* Component Modal */}
      <Suspense fallback={null}>
        <ComponentModal
          component={selectedComponent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          language={language}
        />
      </Suspense>
    </div>
  );
}

export default App;
