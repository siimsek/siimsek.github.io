import { useState, useCallback, Suspense, lazy } from 'react';
import { Globe } from 'lucide-react';
import type { PCBComponent } from '@/data/portfolioData';
import type { Language } from '@/data/translations';
import { CornerBracket } from '@/components/ui/CornerBracket';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

// Lazy load the 3D scene for better performance
const PCBScene = lazy(() => import('@/components/three/PCBScene'));
const ComponentModal = lazy(() => import('@/components/ui/ComponentModal'));

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

      {/* Language Selector - Positioned to avoid overlapping with CornerBracket */}
      <div className="absolute top-8 right-24 md:top-10 md:right-32 z-20">
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
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[#1a3320] transition-colors ${language === 'en' ? 'text-[#00ff88]' : 'text-[#f0f0f0]'
                  }`}
              >
                English
              </button>
              <button
                onClick={() => toggleLanguage('tr')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[#1a3320] transition-colors ${language === 'tr' ? 'text-[#00ff88]' : 'text-[#f0f0f0]'
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
