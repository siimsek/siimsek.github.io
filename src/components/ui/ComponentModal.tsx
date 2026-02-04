import { useEffect, useRef, useCallback } from 'react';
import { X, Linkedin, Github, Globe, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { portfolioData, type PCBComponent } from '@/data/portfolioData';
import translations, { type Language } from '@/data/translations';

interface ComponentModalProps {
  component: PCBComponent | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function ComponentModal({ component, isOpen, onClose, language }: ComponentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const t = translations[language];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !component) return null;

  const data = portfolioData[component.dataKey as keyof typeof portfolioData];
  if (!data) return null;

  const renderContent = () => {
    switch (component.type) {
      case 'MCU':
        return <AboutContent data={data as typeof portfolioData.about} t={t} />;
      case 'VRM':
        return <SkillsContent data={data as typeof portfolioData.skills} t={t} />;
      case 'OSC':
        return <EducationContent data={data as typeof portfolioData.education} t={t} />;
      case 'COM':
        return <ExperienceContent data={data as typeof portfolioData.experience} t={t} />;
      case 'MEM':
        return <ProjectsContent data={data as typeof portfolioData.projects} t={t} />;
      case 'LED':
        return <LanguagesContent data={data as typeof portfolioData.languages} t={t} />;
      case 'SWD':
        return <GoalsContent data={data as typeof portfolioData.goals} t={t} />;
      case 'CAP':
        return <WorkflowContent data={data as typeof portfolioData.workflow} t={t} />;
      case 'UART':
        return <ContactContent data={data as typeof portfolioData.contact} t={t} />;
      default:
        return <div className="text-gray-400">{language === 'en' ? 'Information not found' : 'Bilgi bulunamadi'}</div>;
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d1117] border border-[#b87333] rounded-lg shadow-2xl"
        style={{
          boxShadow: '0 0 40px rgba(184, 115, 51, 0.3), 0 0 80px rgba(0, 255, 136, 0.1)'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0d1117] border-b border-[#2d5a3d] p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#b87333]">{component.label}</span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 hover:bg-[#2d5a3d] rounded transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5 text-[#f0f0f0]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>

        {/* Footer decoration */}
        <div className="h-1 bg-gradient-to-r from-[#b87333] via-[#00ff88] to-[#b87333]" />
      </div>
    </div>
  );
}

// About Content
function AboutContent({ data, t }: { data: typeof portfolioData.about; t: typeof translations.en }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.about}
      </h2>
      
      <p className="text-[#c9d1d9] leading-relaxed">
        {data.summary}
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-pcb p-4 rounded">
          <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.about.details}</h3>
          <ul className="space-y-2">
            {data.details.map((detail, i) => (
              <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                <span className="text-[#b87333] mt-1">›</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-pcb p-4 rounded">
          <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.about.focusAreas}</h3>
          <ul className="space-y-2">
            {data.focusAreas.map((area, i) => (
              <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                <span className="text-[#b87333] mt-1">›</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-pcb p-4 rounded">
        <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.about.learningStyle}</h3>
        <ul className="space-y-2">
          {data.learningStyle.map((style, i) => (
            <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
              <span className="text-[#b87333] mt-1">›</span>
              {style}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Skills Content
function SkillsContent({ data, t }: { data: typeof portfolioData.skills; t: typeof translations.en }) {
  const skillNames: Record<string, string> = {
    'Programming': t.skills.programming,
    'Embedded Platforms': t.skills.embeddedPlatforms,
    'Robotics & Autonomy': t.skills.robotics,
    'Hardware & Integration': t.skills.hardware,
    'Testing & Debug': t.skills.testing
  };

  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.skills}
      </h2>

      <div className="grid gap-4">
        {data.categories.map((category, i) => (
          <div key={i} className="card-pcb p-4 rounded">
            <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">
              {skillNames[category.name] || category.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.items.map((item, j) => (
                <span
                  key={j}
                  className="px-3 py-1.5 bg-[#1a3320] border border-[#2d5a3d] rounded text-sm text-[#c9d1d9] hover:border-[#b87333] transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Education Content
function EducationContent({ data, t }: { data: typeof portfolioData.education; t: typeof translations.en }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.education}
      </h2>

      <div className="card-pcb p-6 rounded">
        <h3 className="text-xl font-bold text-[#00ff88] mb-2 font-display">{data.institution}</h3>
        <p className="text-[#c9d1d9] mb-4">{data.degree}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-xs text-[#4a8c5d] block mb-1">{t.education.period}</span>
            <span className="text-[#f0f0f0] font-mono">{data.period}</span>
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block mb-1">GPA</span>
            <span className="text-[#f0f0f0] font-mono">{data.gpa}</span>
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block mb-1">{t.about.year}</span>
            <span className="text-[#f0f0f0] font-mono">{data.year}</span>
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block mb-1">{t.about.expectedGraduation}</span>
            <span className="text-[#f0f0f0] font-mono">{data.expectedGraduation}</span>
          </div>
        </div>

        <div className="border-t border-[#2d5a3d] pt-4">
          <h4 className="text-sm font-semibold text-[#b87333] mb-2">{t.education.achievements}</h4>
          <ul className="space-y-1">
            {data.details.map((detail, i) => (
              <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                <span className="text-[#00ff88] mt-1">›</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Experience Content
function ExperienceContent({ data, t }: { data: typeof portfolioData.experience; t: typeof translations.en }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.experience}
      </h2>

      <div className="space-y-4">
        {data.items.map((item, i) => (
          <div key={i} className="card-pcb p-5 rounded">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-lg font-bold text-[#00ff88] font-display">{item.name}</h3>
                <p className="text-[#b87333] text-sm">{item.role}</p>
              </div>
              <span className="text-xs font-mono text-[#4a8c5d] bg-[#1a3320] px-2 py-1 rounded">
                {item.period}
              </span>
            </div>
            
            <p className="text-[#c9d1d9] text-sm mb-3">{item.description}</p>
            
            <div className="border-t border-[#2d5a3d] pt-3">
              <h4 className="text-xs font-semibold text-[#4a8c5d] mb-2">{t.experience.achievements}</h4>
              <ul className="space-y-1">
                {item.achievements.map((achievement, j) => (
                  <li key={j} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                    <span className="text-[#00ff88] mt-1">›</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Projects Content
function ProjectsContent({ data, t }: { data: typeof portfolioData.projects; t: typeof translations.en }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.projects}
      </h2>

      <div className="space-y-4">
        {data.items.map((project, i) => (
          <div key={i} className="card-pcb p-5 rounded">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <h3 className="text-lg font-bold text-[#00ff88] font-display">{project.name}</h3>
              <span className="text-xs font-mono text-[#4a8c5d] bg-[#1a3320] px-2 py-1 rounded">
                {project.period}
              </span>
            </div>
            
            <p className="text-[#b87333] text-sm mb-2">{project.role}</p>
            <p className="text-[#c9d1d9] text-sm mb-3">{project.description}</p>
            
            {project.tech && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.tech.map((tech, j) => (
                  <span
                    key={j}
                    className="px-2 py-0.5 bg-[#1a3320] border border-[#2d5a3d] rounded text-xs text-[#4a8c5d]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#00ff88] hover:text-[#b87333] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t.projects.viewProject}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Languages Content
function LanguagesContent({ data, t }: { data: typeof portfolioData.languages; t: typeof translations.en }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.languages}
      </h2>

      <div className="space-y-4">
        {data.items.map((lang, i) => (
          <div key={i} className="card-pcb p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ 
                    backgroundColor: lang.color,
                    boxShadow: `0 0 10px ${lang.color}, 0 0 20px ${lang.color}`
                  }}
                />
                <span className="text-lg font-semibold text-[#f0f0f0]">{lang.name}</span>
              </div>
              <span className="text-sm text-[#4a8c5d] font-mono">{lang.level}</span>
            </div>
            
            <div className="h-2 bg-[#1a3320] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${lang.proficiency}%`,
                  backgroundColor: lang.color,
                  boxShadow: `0 0 10px ${lang.color}`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Goals Content
function GoalsContent({ data, t }: { data: typeof portfolioData.goals; t: typeof translations.en }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.goals}
      </h2>

      <p className="text-[#c9d1d9] leading-relaxed">
        {data.content}
      </p>

      <div className="card-pcb p-4 rounded">
        <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.goals.careerGoals}</h3>
        <ul className="space-y-2">
          {data.careerGoals.map((goal, i) => (
            <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
              <span className="text-[#00ff88] mt-1">›</span>
              {goal}
            </li>
          ))}
        </ul>
      </div>

      <div className="card-pcb p-4 rounded border-l-4 border-l-[#ff6b6b]">
        <h3 className="text-lg font-semibold text-[#ff6b6b] mb-3 font-display">{t.goals.avoidedPaths}</h3>
        <ul className="space-y-2">
          {data.avoidedPaths.map((path, i) => (
            <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
              <span className="text-[#ff6b6b] mt-1">×</span>
              {path}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Workflow Content
function WorkflowContent({ data, t }: { data: typeof portfolioData.workflow; t: typeof translations.en }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.workflow}
      </h2>

      <p className="text-[#c9d1d9] leading-relaxed">
        {data.approach}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.principles.map((principle, i) => (
          <div key={i} className="card-pcb p-4 rounded text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1a3320] border border-[#b87333] flex items-center justify-center">
              <span className="text-xl font-bold text-[#00ff88]">{i + 1}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#f0f0f0] mb-1">{principle.name}</h3>
            <p className="text-xs text-[#4a8c5d]">{principle.description}</p>
          </div>
        ))}
      </div>

      <div className="card-pcb p-4 rounded">
        <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.workflow.principles}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-[#b87333] mb-2">{t.workflow.preferred}</h4>
            <ul className="space-y-1 text-sm text-[#c9d1d9]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ff88]">✓</span>
                Project-based learning
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ff88]">✓</span>
                Iterative development
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ff88]">✓</span>
                Seeing tangible results
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#b87333] mb-2">{t.workflow.tools}</h4>
            <ul className="space-y-1 text-sm text-[#c9d1d9]">
              <li className="flex items-start gap-2">
                <span className="text-[#00ff88]">›</span>
                Multimeter
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ff88]">›</span>
                Logic Analyzers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00ff88]">›</span>
                Code debugging
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contact Content
function ContactContent({ data, t }: { data: typeof portfolioData.contact; t: typeof translations.en }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.contact}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <a
          href={`mailto:${data.email}`}
          className="card-pcb p-4 rounded flex items-center gap-4 hover:border-[#b87333] transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-[#1a3320] flex items-center justify-center group-hover:bg-[#2d5a3d] transition-colors">
            <Mail className="w-6 h-6 text-[#00ff88]" />
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block">{t.contact.email}</span>
            <span className="text-[#f0f0f0] text-sm">{data.email}</span>
          </div>
        </a>

        <a
          href={`tel:${data.phone.replace(/\s/g, '')}`}
          className="card-pcb p-4 rounded flex items-center gap-4 hover:border-[#b87333] transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-[#1a3320] flex items-center justify-center group-hover:bg-[#2d5a3d] transition-colors">
            <Phone className="w-6 h-6 text-[#00ff88]" />
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block">{t.contact.phone}</span>
            <span className="text-[#f0f0f0] text-sm">{data.phone}</span>
          </div>
        </a>

        <div className="card-pcb p-4 rounded flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1a3320] flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#00ff88]" />
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block">{t.contact.location}</span>
            <span className="text-[#f0f0f0] text-sm">{data.location}</span>
          </div>
        </div>

        {data.links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-pcb p-4 rounded flex items-center gap-4 hover:border-[#b87333] transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-[#1a3320] flex items-center justify-center group-hover:bg-[#2d5a3d] transition-colors">
              {link.label === 'LinkedIn' && <Linkedin className="w-6 h-6 text-[#00ff88]" />}
              {link.label === 'GitHub' && <Github className="w-6 h-6 text-[#00ff88]" />}
              {(link.label === 'Website' || link.label === 'Web Sitesi') && <Globe className="w-6 h-6 text-[#00ff88]" />}
            </div>
            <div>
              <span className="text-xs text-[#4a8c5d] block">{link.label}</span>
              <span className="text-[#f0f0f0] text-sm flex items-center gap-1">
                {link.url.replace(/^https:\/\//, '')}
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="card-pcb p-4 rounded text-center">
        <p className="text-[#4a8c5d] text-sm">
          {t.contact.message}
        </p>
      </div>
    </div>
  );
}
