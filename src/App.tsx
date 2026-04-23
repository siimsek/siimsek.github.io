import { useState, useEffect, useCallback, Suspense, lazy, Component, type ReactNode } from 'react';
import { Globe } from 'lucide-react';
import type { PCBComponent } from '@/data/portfolioData';
import translations, { type Language } from '@/data/translations';
import { CornerBracket } from '@/components/ui/CornerBracket';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Lazy load the 3D scene for better performance
const PCBScene = lazy(() => import('@/components/three/PCBScene'));
const ComponentModal = lazy(() => import('@/components/ui/ComponentModal'));

interface SceneErrorBoundaryProps {
  children: ReactNode;
  onRetry: () => void;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Scene render error:', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-[#2d5a3d] bg-[#0d1117]/95 p-5 text-center shadow-[0_0_24px_rgba(0,0,0,0.55)]">
            <h2 className="font-display text-xl text-[#f0f0f0]">Scene Failed To Load</h2>
            <p className="mt-2 text-sm text-[#8fb8a0]">
              Rendering encountered an error. Retry to re-initialize the 3D scene.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-4 rounded-md border border-[#d4a574] bg-[#1a3320] px-4 py-2 text-sm font-mono text-[#f0f0f0] transition-colors hover:bg-[#244b31]"
            >
              Retry Scene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<PCBComponent | null>(null);

  useEffect(() => {
    // Network Data Transmission/Stream animation 📡
    const intervalId = setInterval(() => {
      // Toggle transmit (TX) and receive (RX) indicators
      const tx = Math.random() > 0.4 ? "▲" : "△";
      const rx = Math.random() > 0.4 ? "▼" : "▽";
      
      // Generate a random 8-bit binary string (e.g., 10110101)
      const bin = Array.from({length: 8}, () => Math.round(Math.random())).join('');
      
      // Generate a random hex memory address (e.g., 0xFA3C)
      const hex = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');

      // Update the document title to look like an active data link
      document.title = `[${tx}${rx}] DATA: ${bin} (0x${hex})`;
    }, 150); // Very fast updates to look like streaming data

    return () => clearInterval(intervalId);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [sceneResetKey, setSceneResetKey] = useState(0);
  const t = translations[language];

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
    <>
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      <div className="relative w-full h-[100dvh]" style={{ overflow: 'clip' }}>
        {/* All 4 Corner Brackets */}
        <CornerBracket position="tl" />
        <CornerBracket position="tr" />
        <CornerBracket position="bl" />
        <CornerBracket position="br" />

        {/* Version Signature - Bottom Left */}
        <div className="absolute bottom-4 left-6 md:bottom-6 md:left-8 z-20 pointer-events-none select-none">
          <span className="text-xs font-mono text-[#4a8c5d]/70 tracking-wider">
            siimsek | {t.status.version}
          </span>
        </div>

        {/* Language Selector - Positioned to avoid overlapping with CornerBracket */}
        <div className="absolute top-4 right-6 md:top-6 md:right-8 z-20">
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
                  Turkce
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PCB 3D Scene */}
        <SceneErrorBoundary onRetry={() => setSceneResetKey((prev) => prev + 1)}>
          <Suspense fallback={<LoadingFallback />}>
            <PCBScene
              key={`${language}-${sceneResetKey}`}
              onComponentClick={handleComponentClick}
              language={language}
              isModalOpen={isModalOpen}
            />
          </Suspense>
        </SceneErrorBoundary>

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
    </>
  );
}

export default App;

