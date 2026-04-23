import { X, Linkedin, Github, Mail, MapPin, ExternalLink } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { portfolioData, type PCBComponent } from '@/data/portfolioData';
import translations, { type Language } from '@/data/translations';
import { cn } from '@/lib/utils';

interface ComponentModalProps {
  component: PCBComponent | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

type TranslationPack = typeof translations.en;

const listBullet = '>';

function getComponentLabel(component: PCBComponent, t: TranslationPack): string {
  const map: Record<string, string> = {
    about: t.components.about,
    skills: t.components.skills,
    education: t.components.education,
    experience: t.components.experience,
    projects: t.components.projects,
    contact: t.components.contact,
  };
  return map[component.dataKey] ?? component.label;
}

function getAboutLocalization(language: Language) {
  if (language === 'tr') {
    return {
      summary:
        'Akdeniz Universitesi Elektrik-Elektronik Muhendisligi 3. sinif ogrencisiyim. Elektronik tasarim, donanim Ar-Ge ve gomulu sistem entegrasyonu odakli calisiyorum.',
      details: [
        'Universite: Akdeniz Universitesi',
        'Sinif: 3/4',
        'Beklenen Mezuniyet: 2027',
        'Rol: Elektronik ve Gomulu Sistemler',
      ],
      focusAreas: [
        'Elektronik tasarim ve donanim Ar-Ge',
        'Gomulu yazilim ve dusuk seviye kontrol',
        'Guc elektronigi ve RF/IoT alanlarinda derinlesme',
        'Otonom sistem elektronigi',
      ],
      learningStyle: [
        'Devre tasarimindan saha testine kadar uctan uca sahiplenme',
        'Build -> test -> debug -> iterate dongusu',
        'Teoriyi olculebilir calisan sistemlere cevirme',
      ],
      careerGoals: [
        'Guc elektronigi, RF/IoT ve otonom sistem elektroniginde uzmanlasmak',
        'Savunma ve elektronik sektorlerinde donanim odakli Ar-Ge rollerinde calismak',
        'Kart seviyesinden saha dogrulamasina kadar tam gomulu sistem mimarileri gelistirmek',
      ],
    };
  }

  return {
    summary: portfolioData.about.summary,
    details: portfolioData.about.details,
    focusAreas: portfolioData.about.focusAreas,
    learningStyle: portfolioData.about.learningStyle,
    careerGoals: portfolioData.about.careerGoals,
  };
}

function getEducationLocalization(language: Language, data: typeof portfolioData.education) {
  if (language === 'tr') {
    return {
      ...data,
      degree: 'Elektrik ve Elektronik Muhendisligi',
      details: [
        'Muhendislik temel derslerinde guclu akademik performans',
        'Laboratuvar ve pratik sistem gelistirme odakli ilerleme',
        'Programlama ve entegrasyon agirlikli derslerde istikrarli basari',
      ],
    };
  }
  return data;
}

function getExperienceLocalization(language: Language, data: typeof portfolioData.experience) {
  if (language === 'tr') {
    const trItems = [
      {
        name: 'Akdeniz Universitesi Proje ve Muhendislik Toplulugu',
        role: 'Kurucu Uye ve Baskan Yardimcisi',
        description:
          'Kurucu ekipte aktif rol aldim, topluluk vizyonunu belirleme surecine katkida bulundum ve resmi universite sureclerine destek verdim. Teknik proje ekiplerini kurup ekip koordinasyonu ve kilometre tasi takibini yonettim.',
        achievements: [
          'Teknik proje ekiplerini olusturma ve organizasyon',
          'Uye koordinasyonu ve proje ilerleyis takibi',
          'Atolye, egitim ve proje odakli etkinlik organizasyonu',
        ],
      },
      {
        name: 'Celebiler Takimi',
        role: 'Yazilim ve Elektronik Departman Baskani',
        description:
          'Elektronik ve yazilim teslimleri icin gelistirme akislarini planladim, modul entegrasyonunu destekledim ve saha testlerini koordine ettim.',
        achievements: [
          'Disiplinler arasi gelistirme sureclerini planlama',
          'Modul seviyesinde entegrasyon destegi',
          'Saha testlerinde sistem dogrulama koordinasyonu',
        ],
      },
    ];

    return {
      ...data,
      items: data.items.map((item, index) => ({
        ...item,
        ...trItems[index],
      })),
    };
  }

  return data;
}

function getProjectsLocalization(language: Language, data: typeof portfolioData.projects) {
  if (language === 'tr') {
    const trItems = [
      {
        name: 'Elektrikli Arac Projesi (Efficiency Challenge)',
        role: 'Elektronik ve Yazilim Takim Kaptani',
        description:
          'Elektronik/yazilim tarafinda mimari ve entegrasyon kilometre taslarini yonettim. Sensor-aktuator entegrasyonu ile telemetri ve diagnostik akislarini kurup saha testleri ile guvenilirligi artirdim.',
      },
      {
        name: 'Insansiz Deniz Araci (IDA) Projesi',
        role: 'Elektronik ve Yazilim Takim Kaptani',
        description:
          'Pixhawk tabanli kontrol mimarisi ve otonom gorev akislarini uyguladim. STM32 dusuk seviye kontrol ile Raspberry Pi + ROS entegrasyonu yaparak saha testleriyle dogrulanmis bir otonomi hatti kurdum.',
      },
      {
        name: 'TEKNOFEST Havacilikta Yapay Zeka Projesi',
        role: 'Takim Lideri ve Ana Yazilim Gelistirici',
        description:
          'YOLOv8 tabanli gercek zamanli nesne tespiti ve Lucas-Kanade optik akisla GPS bagimsiz goruntu odometrisi gelistirdim. ORB/SIFT tabanli referans obje tespitiyle pipelinei moduler ROS mimarisine entegre ettim.',
      },
      {
        name: 'Kisisel Portfolyo Websitesi',
        role: 'Gelistirici',
        description:
          'Acik kaynak portfolyo websitesini tasarlayip yayina aldim ve teknik calismalarin kamusal vitrini olarak surekli guncelledim.',
      },
      {
        name: 'Codelly (Node.js Modulu)',
        role: 'Gelistirici',
        description:
          'Web uzerinde coklu dilde calistirma altyapisi (C, C++, Java, Python, C#) kurup egitim ve muhendislik akislarina uygun API hazir bir npm paketi olarak yayinladim.',
      },
    ];

    return {
      ...data,
      items: data.items.map((item, index) => ({
        ...item,
        ...trItems[index],
      })),
    };
  }

  return data;
}

export default function ComponentModal({ component, isOpen, onClose, language }: ComponentModalProps) {
  const t = translations[language];

  if (!component) return null;

  const data = portfolioData[component.dataKey as keyof typeof portfolioData];
  if (!data) return null;

  const headerLabel = getComponentLabel(component, t);

  const renderContent = () => {
    switch (component.type) {
      case 'MCU':
        return <AboutContent data={data as typeof portfolioData.about} t={t} language={language} />;
      case 'LED':
        return <SkillsContent data={data as typeof portfolioData.skills} t={t} />;
      case 'CAPACITOR':
        return <EducationContent data={data as typeof portfolioData.education} t={t} language={language} />;
      case 'EEPROM':
        return <ExperienceContent data={data as typeof portfolioData.experience} t={t} language={language} />;
      case 'MICROSD':
        return <ProjectsContent data={data as typeof portfolioData.projects} t={t} language={language} />;
      case 'CAP':
        return <WorkflowContent data={data as typeof portfolioData.workflow} t={t} />;
      case 'CONNECTOR':
        return <ContactContent data={data as typeof portfolioData.contact} t={t} language={language} />;
      default:
        return <div className="text-gray-400">{language === 'en' ? 'Information not found' : 'Bilgi bulunamadi'}</div>;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#020503]/72 backdrop-blur-[2px] modal-overlay-smooth" />

        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-4xl translate-x-[-50%] translate-y-[-50%]',
            'bg-[#0b1210]/90 border border-[#2f5b45]/80',
            'shadow-2xl duration-300 rounded-2xl max-h-[88vh] overflow-hidden flex flex-col',
            'modal-panel-smooth'
          )}
          style={{ boxShadow: '0 0 36px rgba(0, 0, 0, 0.45), 0 0 64px rgba(0, 255, 136, 0.08)' }}
        >
          <div className="modal-chrome-item flex items-center justify-between p-3.5 md:p-4 border-b border-[#2f5b45]/70 bg-[#0a1713]/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
              <span className="text-sm font-mono text-[#dbece2] tracking-wide uppercase truncate">{headerLabel}</span>
            </div>
            <Dialog.Close className="rounded-full p-1.5 opacity-80 transition-all hover:opacity-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#00ff88]">
              <X className="h-4 w-4 text-white" />
              <span className="sr-only">{t.close}</span>
            </Dialog.Close>
          </div>

          <div className="modal-chrome-item overflow-y-auto p-5 md:p-7 custom-scrollbar">{renderContent()}</div>

          <div className="modal-chrome-item h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4a574]/60 to-transparent opacity-70" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AboutContent({
  data,
  t,
  language,
}: {
  data: typeof portfolioData.about;
  t: TranslationPack;
  language: Language;
}) {
  const localized = getAboutLocalization(language);

  const languageRows =
    language === 'tr'
      ? [
          { name: 'Turkce', level: 'Ana Dil' },
          { name: 'Ingilizce', level: 'B1/B2' },
          { name: 'Almanca', level: 'A1/A2' },
        ]
      : data.languages;

  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="modal-section text-3xl font-bold text-[#f0f0f0] font-display" style={{ animationDelay: '30ms' }}>
        {t.modalTitles.about}
      </h2>

      <p className="modal-section text-[#c9d1d9] leading-relaxed" style={{ animationDelay: '80ms' }}>{localized.summary}</p>

      <div className="grid md:grid-cols-2 gap-4 modal-section" style={{ animationDelay: '130ms' }}>
        <div className="card-pcb p-4 rounded-md">
          <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.about.details}</h3>
          <ul className="space-y-2">
            {localized.details.map((detail, i) => (
              <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                <span className="text-[#d4a574] leading-none pt-[1px]">{listBullet}</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-pcb p-4 rounded-md">
          <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.about.focusAreas}</h3>
          <ul className="space-y-2">
            {localized.focusAreas.map((area, i) => (
              <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                <span className="text-[#d4a574] leading-none pt-[1px]">{listBullet}</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-pcb p-4 rounded-md modal-section" style={{ animationDelay: '180ms' }}>
        <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.about.learningStyle}</h3>
        <ul className="space-y-2">
          {localized.learningStyle.map((style, i) => (
            <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
              <span className="text-[#d4a574] leading-none pt-[1px]">{listBullet}</span>
              {style}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-4 modal-section" style={{ animationDelay: '230ms' }}>
        <div className="card-pcb p-4 rounded-md">
          <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.about.languages}</h3>
          <ul className="space-y-2">
            {languageRows.map((item, i) => (
              <li key={i} className="text-sm text-[#c9d1d9] flex items-center justify-between gap-4 border-b border-[#2d5a3d]/40 pb-1">
                <span>{item.name}</span>
                <span className="text-[#d4a574] font-mono">{item.level}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-pcb p-4 rounded-md">
          <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">{t.about.careerGoals}</h3>
          <ul className="space-y-2">
            {localized.careerGoals.map((goal, i) => (
              <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                <span className="text-[#d4a574] leading-none pt-[1px]">{listBullet}</span>
                {goal}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SkillsContent({ data, t }: { data: typeof portfolioData.skills; t: TranslationPack }) {
  const skillNames: Record<string, string> = {
    Programming: t.skills.programming,
    'Embedded Platforms': t.skills.embeddedPlatforms,
    'Electronics & Hardware': t.skills.electronicsHardware,
    'Embedded Software': t.skills.embeddedSoftware,
    'Communication Protocols': t.skills.protocols,
    'Robotics & Autonomous Systems': t.skills.roboticsAutonomy,
    'Testing & Validation': t.skills.testingValidation,
    Tools: t.skills.tools,
  };

  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.skills}
      </h2>

      <div className="grid gap-4">
        {data.categories.map((category, i) => (
          <div key={i} className="card-pcb p-4 rounded-md">
            <h3 className="text-lg font-semibold text-[#00ff88] mb-3 font-display">
              {skillNames[category.name] ?? category.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.items.map((item, j) => (
                <span
                  key={j}
                  className="px-3 py-1.5 bg-[#1a3320] border border-[#2d5a3d] rounded text-sm text-[#c9d1d9] hover:border-[#d4a574] transition-colors"
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

function EducationContent({
  data,
  t,
  language,
}: {
  data: typeof portfolioData.education;
  t: TranslationPack;
  language: Language;
}) {
  const localized = getEducationLocalization(language, data);

  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.education}
      </h2>

      <div className="card-pcb p-6 rounded-md">
        <h3 className="text-xl font-bold text-[#00ff88] mb-2 font-display">{localized.institution}</h3>
        <p className="text-[#c9d1d9] mb-4">{localized.degree}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-xs text-[#4a8c5d] block mb-1">{t.education.period}</span>
            <span className="text-[#f0f0f0] font-mono">{localized.period}</span>
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block mb-1">{t.about.year}</span>
            <span className="text-[#f0f0f0] font-mono">{localized.year}</span>
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block mb-1">{t.about.expectedGraduation}</span>
            <span className="text-[#f0f0f0] font-mono">{localized.expectedGraduation}</span>
          </div>
        </div>

        <div className="border-t border-[#2d5a3d] pt-4">
          <h4 className="text-sm font-semibold text-[#d4a574] mb-2">{t.education.achievements}</h4>
          <ul className="space-y-1">
            {localized.details.map((detail, i) => (
              <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                <span className="text-[#00ff88] leading-none pt-[1px]">{listBullet}</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ExperienceContent({
  data,
  t,
  language,
}: {
  data: typeof portfolioData.experience;
  t: TranslationPack;
  language: Language;
}) {
  const localized = getExperienceLocalization(language, data);

  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.experience}
      </h2>

      <div className="space-y-4">
        {localized.items.map((item, i) => (
          <div key={i} className="card-pcb p-5 rounded-md">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-lg font-bold text-[#00ff88] font-display">{item.name}</h3>
                <p className="text-[#d4a574] text-sm">{item.role}</p>
              </div>
              <span className="text-xs font-mono text-[#4a8c5d] bg-[#1a3320] px-2 py-1 rounded">{item.period}</span>
            </div>

            <p className="text-[#c9d1d9] text-sm mb-3">{item.description}</p>

            <div className="border-t border-[#2d5a3d] pt-3">
              <h4 className="text-xs font-semibold text-[#4a8c5d] mb-2">{t.experience.achievements}</h4>
              <ul className="space-y-1">
                {item.achievements.map((achievement, j) => (
                  <li key={j} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                    <span className="text-[#00ff88] leading-none pt-[1px]">{listBullet}</span>
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

function ProjectsContent({
  data,
  t,
  language,
}: {
  data: typeof portfolioData.projects;
  t: TranslationPack;
  language: Language;
}) {
  const localized = getProjectsLocalization(language, data);

  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="modal-section text-3xl font-bold text-[#f0f0f0] font-display" style={{ animationDelay: '30ms' }}>
        {t.modalTitles.projects}
      </h2>

      <div className="space-y-4">
        {localized.items.map((project, i) => (
          <div key={i} className="card-pcb p-5 rounded-md modal-section" style={{ animationDelay: `${90 + i * 55}ms` }}>
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <h3 className="text-lg font-bold text-[#00ff88] font-display">{project.name}</h3>
              <span className="text-xs font-mono text-[#4a8c5d] bg-[#1a3320] px-2 py-1 rounded">{project.period}</span>
            </div>

            <p className="text-[#d4a574] text-sm mb-2">{project.role}</p>
            <p className="text-[#c9d1d9] text-sm mb-3">{project.description}</p>

            {project.tech && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.tech.map((tech, j) => (
                  <span
                    key={j}
                    className="px-2 py-0.5 bg-[#1a3320] border border-[#2d5a3d] rounded text-xs text-[#8fb8a0]"
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
                className="inline-flex items-center gap-1 text-sm text-[#00ff88] hover:text-[#d4a574] transition-colors"
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

function WorkflowContent({ data, t }: { data: typeof portfolioData.workflow; t: TranslationPack }) {
  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.workflow}
      </h2>

      <p className="text-[#c9d1d9] leading-relaxed">{data.approach}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.principles.map((principle, i) => (
          <div key={i} className="card-pcb p-4 rounded-md text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1a3320] border border-[#d4a574] flex items-center justify-center">
              <span className="text-xl font-bold text-[#00ff88]">{i + 1}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#f0f0f0] mb-1">{principle.name}</h3>
            <p className="text-xs text-[#4a8c5d]">{principle.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactContent({
  data,
  t,
  language,
}: {
  data: typeof portfolioData.contact;
  t: TranslationPack;
  language: Language;
}) {
  const linkLabelMap: Record<string, string> =
    language === 'tr'
      ? { LinkedIn: 'LinkedIn', GitHub: 'GitHub' }
      : { LinkedIn: 'LinkedIn', GitHub: 'GitHub' };

  return (
    <div className="space-y-6">
      <h2 id="modal-title" className="text-3xl font-bold text-[#f0f0f0] font-display">
        {t.modalTitles.contact}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <a
          href={`mailto:${data.email}`}
          className="card-pcb p-4 rounded-md flex items-center gap-4 hover:border-[#d4a574] transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-[#1a3320] flex items-center justify-center group-hover:bg-[#2d5a3d] transition-colors">
            <Mail className="w-6 h-6 text-[#00ff88]" />
          </div>
          <div>
            <span className="text-xs text-[#4a8c5d] block">{t.contact.email}</span>
            <span className="text-[#f0f0f0] text-sm">{data.email}</span>
          </div>
        </a>

        <div className="card-pcb p-4 rounded-md flex items-center gap-4">
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
            className="card-pcb p-4 rounded-md flex items-center gap-4 hover:border-[#d4a574] transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-[#1a3320] flex items-center justify-center group-hover:bg-[#2d5a3d] transition-colors">
              {link.label === 'LinkedIn' && <Linkedin className="w-6 h-6 text-[#00ff88]" />}
              {link.label === 'GitHub' && <Github className="w-6 h-6 text-[#00ff88]" />}
            </div>
            <div>
              <span className="text-xs text-[#4a8c5d] block">{linkLabelMap[link.label] ?? link.label}</span>
              <span className="text-[#f0f0f0] text-sm flex items-center gap-1">
                {link.url.replace(/^https:\/\//, '')}
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="card-pcb p-4 rounded-md text-center">
        <p className="text-[#8fb8a0] text-sm">{t.contact.message}</p>
      </div>
    </div>
  );
}
