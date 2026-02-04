// Portfolio content extracted from PDFs
// Primary language: English

export interface SectionData {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  details?: string[];
  items?: {
    name: string;
    description?: string;
    tech?: string[];
    period?: string;
    link?: string;
  }[];
  links?: {
    label: string;
    url: string;
  }[];
}

export const portfolioData = {
  personal: {
    name: "MUHAMMED ALI SIMSEK",
    title: "ELECTRICAL AND ELECTRONICS ENGINEER",
    subtitle: "Embedded Systems | Hardware | Embedded Software",
    location: "Antalya, Turkiye",
    email: "malisimsek17@gmail.com",
    phone: "+90 542 767 48 16",
    linkedin: "https://www.linkedin.com/in/muhammed-ali-simsek/",
    github: "https://github.com/siimsek",
    website: "https://siimsek.github.io",
    birthYear: 2004,
    age: 21,
  },

  about: {
    id: "about",
    componentType: "MCU",
    label: "U1 MCU — About Me",
    title: "ABOUT ME",
    summary: "3rd year Electrical and Electronics Engineering student. Experienced in embedded systems, sensor/actuator integration, and system bring-up.",
    details: [
      "University: Akdeniz University",
      "Year: 3/4",
      "GPA: 3.10/4.00",
      "Expected Graduation: 2027",
      "Role: Electronics & Embedded Systems Engineer",
      "Identity: Hardware-focused developer specializing in the intersection of electronics design and low-level software control"
    ],
    focusAreas: [
      "General Electronics & Hardware Development",
      "Embedded Software & Algorithms",
      "Robotics & Autonomous Systems",
      "ROS (Robot Operating System)"
    ],
    learningStyle: [
      "Project-Based Growth: Learning new technologies by implementing them in tangible projects",
      "Iterative Development: 'Design-test-debug' cycle",
      "Concept Application: Using theoretical knowledge to solve real-world engineering problems"
    ]
  },

  skills: {
    id: "skills",
    componentType: "VRM",
    label: "VRM — Skills",
    title: "SKILLS",
    categories: [
      {
        name: "Programming",
        items: ["C/C++", "Python", "HTML/CSS"],
        level: "advanced"
      },
      {
        name: "Embedded Platforms",
        items: ["STM32", "ESP32", "Raspberry Pi"],
        level: "advanced"
      },
      {
        name: "Robotics & Autonomy",
        items: ["Pixhawk control architecture", "ROS (nodes/integration)", "Mission flow validation"],
        level: "intermediate"
      },
      {
        name: "Hardware & Integration",
        items: ["System integration", "Sensor/module integration", "Prototyping", "Wiring/power distribution bring-up"],
        level: "advanced"
      },
      {
        name: "Testing & Debug",
        items: ["Troubleshooting", "Field testing", "Iterative tuning", "Diagnostic tooling"],
        level: "intermediate"
      }
    ]
  },

  education: {
    id: "education",
    componentType: "OSC",
    label: "Y1 OSC — Education",
    title: "EDUCATION",
    institution: "AKDENIZ UNIVERSITY",
    degree: "Electrical and Electronics Engineering",
    period: "2022 – Present",
    gpa: "3.10/4.00",
    year: "3/4",
    expectedGraduation: "2027",
    details: [
      "High performance in Logic Circuits & Laboratory courses",
      "Strong performance in Computer Programming courses",
      "'Builder' mindset in practical and programming-heavy courses"
    ]
  },

  experience: {
    id: "experience",
    componentType: "COM",
    label: "U2 COM — Experience",
    title: "EXPERIENCE",
    items: [
      {
        name: "Akdeniz University Project and Engineering Society",
        role: "Founding Member & Vice President",
        period: "May 2025 – Present",
        description: "Active role in founding team, defining society's vision and supporting official university processes. Established technical project teams, coordinated members, and tracked project progress. Organized workshops, trainings, and project-focused events.",
        achievements: [
          "Active role in founding team",
          "Established technical project teams",
          "Organized workshops and trainings"
        ]
      },
      {
        name: "Celebiler Team",
        role: "Head of Software and Electronics Department",
        period: "May 2025 – Present",
        description: "Planned development processes, supported module integration, and coordinated field testing.",
        achievements: [
          "Planned development processes",
          "Module integration support",
          "Coordinated field testing"
        ]
      }
    ]
  },

  projects: {
    id: "projects",
    componentType: "MEM",
    label: "U3 MEM — Projects",
    title: "PROJECTS",
    items: [
      {
        name: "Electric Vehicle Project (TUBITAK Efficiency Challenge)",
        role: "Electronics and Software Team Captain",
        period: "May 2025 – Present",
        tech: ["STM32", "ESP32", "Raspberry Pi", "C/C++", "Python", "ROS"],
        description: "Led electronics/software architecture and integration milestones across teams (mechanical, powertrain, etc.). Built sensor/actuator integration and telemetry/diagnostics workflow; developed control and test utilities in C/C++ and Python. Executed bring-up for power distribution and wiring integration; validated through field tests and debugging to improve reliability and repeatability."
      },
      {
        name: "Unmanned Surface Vehicle (USV) Project",
        role: "Electronics and Software Team Captain",
        period: "May 2025 – Present",
        tech: ["Pixhawk", "STM32", "Raspberry Pi", "ROS", "C/C++", "Python", "Docker"],
        description: "Implemented Pixhawk-based control architecture and autonomous mission flow; performed end-to-end mission validation in field trials. Developed STM32 low-level control for actuator/sensor interfacing; improved stability/response through iterative on-water testing. Integrated Raspberry Pi high-level components and ROS nodes; enabled subsystem communication for a working autonomy pipeline."
      },
      {
        name: "Personal Portfolio Website",
        role: "Developer",
        period: "2025 – Present",
        tech: ["HTML/CSS"],
        description: "Designed and published an open-source portfolio website; maintained as a public showcase of projects and technical work.",
        link: "https://siimsek.github.io"
      },
      {
        name: "Codelly (Node.js Module)",
        role: "Developer",
        period: "2024 – Present",
        tech: ["Node.js", "API packaging", "npm"],
        description: "Developed a multi-language compile/run infrastructure for web-based execution (C, C++, Java, Python, C#). Packaged and published an API-ready workflow on npm for engineering/education use cases.",
        link: "https://www.npmjs.com/package/codelly"
      }
    ]
  },

  languages: {
    id: "languages",
    componentType: "LED",
    label: "D1-D3 LED — Languages",
    title: "LANGUAGES",
    items: [
      {
        name: "Turkish",
        level: "Native",
        proficiency: 100,
        color: "#00ff88"
      },
      {
        name: "English",
        level: "B1-B2",
        proficiency: 75,
        color: "#00ccff"
      },
      {
        name: "German",
        level: "A1-A2",
        proficiency: 40,
        color: "#ffaa00"
      }
    ]
  },

  goals: {
    id: "goals",
    componentType: "SWD",
    label: "J1 SWD — Goals",
    title: "GOALS",
    content: "Continuous self-improvement in electronics engineering, aiming to master system architecture where software directly drives hardware components.",
    careerGoals: [
      "Technical environment for R&D work",
      "Exposure to new electronic technologies",
      "Advanced embedded systems and complex engineering challenges",
      "Seeing code turn into physical action (motor movement, data reading, system automation)"
    ],
    avoidedPaths: [
      "Pure Web/Frontend Design: Browser-based visuals with no connection to physical electronics",
      "'Hardware-less' Desk Jobs: Administrative, documentation-heavy, or simulation-only roles without access to real development boards",
      "Non-Technical Commercial Roles: Sales, marketing, or pure procurement roles",
      "Stagnant Roles: Positions that do not offer a learning curve or technical skill development"
    ]
  },

  workflow: {
    id: "workflow",
    componentType: "CAP",
    label: "C1-C4 CAP — Workflow",
    title: "WORKFLOW",
    principles: [
      {
        name: "Design",
        description: "Analyze system requirements and architectural design"
      },
      {
        name: "Test",
        description: "Comprehensive testing in field and desktop environments"
      },
      {
        name: "Debug",
        description: "Hardware troubleshooting with multimeters and logic analyzers"
      },
      {
        name: "Iterate",
        description: "Iterative development alongside code debugging"
      }
    ],
    approach: "Adopting a design-test-debug cycle; proficient in hardware troubleshooting at the desk using multimeters or logic analyzers alongside code debugging."
  },

  contact: {
    id: "contact",
    componentType: "UART",
    label: "P1 UART — Contact",
    title: "CONTACT",
    email: "malisimsek17@gmail.com",
    location: "Antalya, Turkiye",
    links: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/muhammed-ali-simsek/"
      },
      {
        label: "GitHub",
        url: "https://github.com/siimsek"
      }
    ]
  }
};

export type ComponentType =
  | "MCU"      // Main Controller - About Me
  | "VRM"      // Voltage Regulator - Skills
  | "OSC"      // Oscillator - Education
  | "COM"      // Communication IC - Experience
  | "MEM"      // Memory Chip - Projects
  | "UART"     // Connector - Contact
  | "CAP";     // Capacitors - Workflow

export interface PCBComponent {
  id: string;
  type: ComponentType;
  label: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  dataKey: string;
}

// Realistic PCB component placement
// - MCU at center
// - Oscillator near MCU (clock source)
// - Memory near MCU (data bus)
// - VRM at power input corner
// - Connectors at board edges
// - Caps distributed for decoupling
export const pcbComponents: PCBComponent[] = [
  {
    id: "mcu",
    type: "MCU",
    label: "U1 MCU — About Me",
    position: [0, 0.08, 0],
    rotation: [0, 0, 0],
    scale: [2.5, 1, 2.5],
    color: "#2d2d2d",
    dataKey: "about"
  },
  {
    id: "osc",
    type: "OSC",
    label: "Y1 OSC — Education",
    position: [3, 0.08, -1.5],
    rotation: [0, 0, 0],
    scale: [1.5, 1.5, 1.5],
    color: "#2d1a1a",
    dataKey: "education"
  },
  {
    id: "mem",
    type: "MEM",
    label: "U3 MEM — Projects",
    position: [4, 0.06, 2],
    rotation: [0, 0, 0],
    scale: [2.2, 1, 2.2],
    color: "#2d2d1a",
    dataKey: "projects"
  },
  {
    id: "com",
    type: "COM",
    label: "U2 COM — Experience",
    position: [-4, 0.08, 1],
    rotation: [0, 0, 0],
    scale: [1.8, 1, 2.0],
    color: "#1a2d1a",
    dataKey: "experience"
  },
  {
    id: "vrm",
    type: "VRM",
    label: "VRM — Skills",
    position: [-5, 0.1, -4],
    rotation: [0, 0, 0],
    scale: [1.8, 1, 1.5],
    color: "#1a1a2e",
    dataKey: "skills"
  },
  {
    id: "uart",
    type: "UART",
    label: "P1 UART — Contact",
    position: [5, 0.12, -4],
    rotation: [0, 0, 0],
    scale: [1.5, 1, 1.5],
    color: "#1a1a1a",
    dataKey: "contact"
  },
  {
    id: "cap1",
    type: "CAP",
    label: "C1-C4 CAP — Workflow",
    position: [-3, 0.1, 4],
    rotation: [0, 0, 0],
    scale: [1.2, 1, 1.2],
    color: "#1a1a1a",
    dataKey: "workflow"
  },
  {
    id: "cap2",
    type: "CAP",
    label: "C2",
    position: [3, 0.1, 5],
    rotation: [0, 0, 0],
    scale: [1.2, 1, 1.2],
    color: "#1a1a1a",
    dataKey: "workflow"
  }
];

export default portfolioData;
