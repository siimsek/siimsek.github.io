import { X, Linkedin, Github, Globe, Mail, MapPin, ExternalLink } from 'lucide-react';
import * as Dialog from "@radix-ui/react-dialog";
import { portfolioData, type PCBComponent } from '@/data/portfolioData';
import translations, { type Language } from '@/data/translations';
import { cn } from "@/lib/utils";

interface ComponentModalProps {
  component: PCBComponent | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function ComponentModal({ component, isOpen, onClose, language }: ComponentModalProps) {
  const t = translations[language];

  if (!component) return null;

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
      case 'CAP':
        return <WorkflowContent data={data as typeof portfolioData.workflow} t={t} />;
      case 'UART':
        return <ContactContent data={data as typeof portfolioData.contact} t={t} />;
      default:
        return <div className="text-gray-400">{language === 'en' ? 'Information not found' : 'Bilgi bulunamadi'}</div>;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop - Blur & Fade */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content - Glassmorphism, Rounded, Scale Animation */}
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4",
            "bg-[#0d1117]/30 backdrop-blur-2xl border border-white/10",
            "p-0 shadow-2xl duration-500",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "rounded-3xl max-h-[85vh] overflow-hidden flex flex-col"
          )}
          style={{
            boxShadow: '0 0 60px rgba(0, 0, 0, 0.5), 0 0 120px rgba(0, 255, 136, 0.1)',
            transitionTimingFunction: 'cubic-bezier(0.32, 0.725, 0, 1)'
          }}
        >
          {/* Header - Transparent Glass */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
              <span className="text-sm font-mono text-[#00ff88]/80 tracking-widest uppercase">{component.label}</span>
            </div>
            <Dialog.Close className="rounded-full p-2 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-5 w-5 text-white" />
              <span className="sr-only">{t.close}</span>
            </Dialog.Close>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {renderContent()}
          </div>

          {/* Footer Gradient Line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent opacity-50" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
