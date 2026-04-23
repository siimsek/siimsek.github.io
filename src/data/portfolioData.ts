// Portfolio content extracted from cvtr.pdf
// Primary language content is English.

export const portfolioData = {
  personal: {
    name: "MUHAMMED ALI SIMSEK",
    title: "ELECTRICAL AND ELECTRONICS ENGINEERING STUDENT",
    subtitle: "Hardware R&D | Embedded Systems | Electronics Integration",
    location: "Antalya, Turkiye",
    email: "malisimsek17@gmail.com",
    phone: "+90 542 767 48 16",
    linkedin: "https://www.linkedin.com/in/siimsek/",
    github: "https://github.com/siimsek",
    website: "https://siimsek.github.io",
    birthYear: 2004,
    age: 22,
  },

  about: {
    id: "about",
    componentType: "MCU",
    label: "U1 MCU - About",
    title: "ABOUT",
    summary:
      "3rd year Electrical and Electronics Engineering student at Akdeniz University. Hardware-oriented developer focused on electronic design, hardware R&D, and embedded system integration.",
    details: [
      "University: Akdeniz University",
      "Year: 3/4",
      "Expected Graduation: 2027",
      "Role: Electronics and Embedded Systems Engineer",
    ],
    focusAreas: [
      "Electronic design and hardware R&D",
      "Embedded software and low-level control",
      "Power electronics and RF/IoT exploration",
      "Autonomous systems electronics",
    ],
    learningStyle: [
      "Own the full cycle from circuit design to field testing",
      "Build -> test -> debug -> iterate continuously",
      "Convert theory into working, measurable systems",
    ],
    languages: [
      { name: "Turkish", level: "Native" },
      { name: "English", level: "B1/B2" },
      { name: "German", level: "A1/A2" },
    ],
    careerGoals: [
      "Deepen expertise in power electronics, RF/IoT, and autonomous system electronics",
      "Work in hardware-focused R&D roles in defense and electronics industries",
      "Build end-to-end embedded architectures from board-level design to deployed system validation",
    ],
  },

  skills: {
    id: "skills",
    componentType: "VRM",
    label: "VRM - Skills",
    title: "SKILLS",
    categories: [
      {
        name: "Programming",
        items: ["C", "C++", "Python", "JavaScript"],
        level: "advanced",
      },
      {
        name: "Embedded Platforms",
        items: ["STM32", "ESP32", "Raspberry Pi", "Arduino"],
        level: "advanced",
      },
      {
        name: "Electronics & Hardware",
        items: [
          "Circuit prototyping",
          "Power distribution",
          "Sensor and actuator integration",
          "PCB bring-up",
        ],
        level: "advanced",
      },
      {
        name: "Embedded Software",
        items: [
          "Firmware development",
          "Low-level driver integration",
          "State machine design",
          "PWM control",
          "Real-time system design",
        ],
        level: "advanced",
      },
      {
        name: "Communication Protocols",
        items: ["UART", "I2C", "SPI", "CAN", "GPIO", "PWM", "MAVLink"],
        level: "advanced",
      },
      {
        name: "Robotics & Autonomous Systems",
        items: [
          "Pixhawk (ArduPilot / PX4)",
          "ROS",
          "Sensor fusion",
          "Autonomous mission flow",
        ],
        level: "intermediate",
      },
      {
        name: "Testing & Validation",
        items: [
          "Field testing",
          "System troubleshooting",
          "Log analysis",
          "Iterative tuning",
          "Oscilloscope signal verification",
        ],
        level: "intermediate",
      },
      {
        name: "Tools",
        items: ["Git", "Linux", "Docker"],
        level: "intermediate",
      },
    ],
  },

  education: {
    id: "education",
    componentType: "OSC",
    label: "Y1 OSC - Education",
    title: "EDUCATION",
    institution: "AKDENIZ UNIVERSITY",
    degree: "Electrical and Electronics Engineering",
    period: "2022 - Present",
    year: "3/4",
    expectedGraduation: "2027",
    details: [
      "Strong academic performance in engineering core courses",
      "Hands-on lab work and practical system development focus",
      "Consistent performance in programming and integration-heavy courses",
    ],
  },

  experience: {
    id: "experience",
    componentType: "COM",
    label: "U2 COM - Experience",
    title: "EXPERIENCE",
    items: [
      {
        name: "Akdeniz University Project and Engineering Society",
        role: "Founding Member and Vice President",
        period: "May 2025 - Present",
        description:
          "Took an active role in the founding team, helped define the society vision, and supported official university processes. Built technical project teams, coordinated members, and tracked project milestones.",
        achievements: [
          "Established and organized technical project teams",
          "Coordinated members and monitored project progress",
          "Organized workshops, trainings, and project-oriented events",
        ],
      },
      {
        name: "Celebiler Team",
        role: "Head of Software and Electronics Department",
        period: "May 2025 - Present",
        description:
          "Planned development workflows, supported module integration, and coordinated field tests for electronics and software deliverables.",
        achievements: [
          "Planned cross-discipline development processes",
          "Supported module-level integration activities",
          "Coordinated system validation during field testing",
        ],
      },
    ],
  },

  projects: {
    id: "projects",
    componentType: "MEM",
    label: "U3 MEM - Projects",
    title: "PROJECTS",
    items: [
      {
        name: "Electric Vehicle Project (Efficiency Challenge)",
        role: "Electronics and Software Team Captain",
        period: "May 2025 - Present",
        tech: ["STM32", "ESP32", "Raspberry Pi", "C/C++", "Python", "ROS"],
        description:
          "Led architecture and integration milestones across electronics/software and other teams. Built sensor/actuator integration with telemetry and diagnostics workflows, then validated reliability with iterative field tests and debugging.",
      },
      {
        name: "Unmanned Surface Vehicle (USV) Project",
        role: "Electronics and Software Team Captain",
        period: "May 2025 - Present",
        tech: ["Pixhawk", "STM32", "Raspberry Pi", "ROS", "C/C++", "Python", "Docker"],
        description:
          "Implemented Pixhawk-based control architecture and autonomous mission flow. Developed STM32 low-level control and integrated Raspberry Pi + ROS components to establish a working autonomy pipeline validated in field trials.",
      },
      {
        name: "TEKNOFEST AI in Aviation Project",
        role: "Team Lead and Lead Software Developer",
        period: "2026 - Present",
        tech: ["PyTorch", "YOLOv8 (Ultralytics)", "OpenCV", "CUDA", "ROS", "Docker"],
        description:
          "Developed real-time object detection with YOLOv8 and built GPS-independent visual odometry using Lucas-Kanade optical flow. Implemented feature-based reference object detection with ORB/SIFT and integrated the image processing pipeline into a modular ROS architecture.",
      },
      {
        name: "Personal Portfolio Website",
        role: "Developer",
        period: "2025 - Present",
        tech: ["React", "TypeScript", "Three.js", "Tailwind CSS"],
        description:
          "Designed and published an open-source portfolio website and continuously updated it as a public showcase for technical projects and engineering work.",
        link: "https://siimsek.github.io",
      },
      {
        name: "Codelly (Node.js Module)",
        role: "Developer",
        period: "2024 - Present",
        tech: ["Node.js", "Compiler orchestration", "npm"],
        description:
          "Built a multi-language compile/run infrastructure for web execution (C, C++, Java, Python, C#) and published an API-ready package for education and engineering workflows.",
        link: "https://www.npmjs.com/package/codelly",
      },
    ],
  },

  workflow: {
    id: "workflow",
    componentType: "CAP",
    label: "C1-C4 CAP - Workflow",
    title: "WORKFLOW",
    principles: [
      {
        name: "Design",
        description: "Define architecture, interfaces, and integration requirements",
      },
      {
        name: "Build",
        description: "Implement hardware and software modules in parallel",
      },
      {
        name: "Validate",
        description: "Run field and bench tests with measurable criteria",
      },
      {
        name: "Iterate",
        description: "Tune and stabilize based on test evidence",
      },
    ],
    approach:
      "Use a disciplined build-test-debug loop and verify behavior with practical instrumentation and logging.",
  },

  contact: {
    id: "contact",
    componentType: "UART",
    label: "P1 UART - Contact",
    title: "CONTACT",
    email: "malisimsek17@gmail.com",
    location: "Antalya, Turkiye",
    links: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/siimsek/",
      },
      {
        label: "GitHub",
        url: "https://github.com/siimsek",
      },
    ],
  },
};

export type ComponentType =
  | "MCU" // Main Controller - About
  | "LED" // LED package - Skills
  | "CAPACITOR" // Electrolytic capacitor - Education
  | "EEPROM" // Memory IC - Experience
  | "MICROSD" // MicroSD slot - Projects
  | "CONNECTOR" // Pin connector - Contact
  | "CAP"; // Legacy placeholder

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

// PCB component placement:
// - MCU at center
// - Remaining components distributed around edges
export const pcbComponents: PCBComponent[] = [
  {
    id: "mcu",
    type: "MCU",
    label: "U1 MCU - About",
    position: [0, 0.01, 0],
    rotation: [0, 0, 0],
    scale: [3.75, 1.5, 3.75],
    color: "#2d2d2d",
    dataKey: "about",
  },
  {
    id: "led",
    type: "LED",
    label: "VRM - Skills",
    position: [-4.5, 0.01, -4],
    rotation: [0, 0, 0],
    scale: [2.25, 2.25, 2.25],
    color: "#ff4444",
    dataKey: "skills",
  },
  {
    id: "connector",
    type: "CONNECTOR",
    label: "P1 UART - Contact",
    position: [4.5, 0.01, -4],
    rotation: [0, 0, 0],
    scale: [2.25, 1.5, 2.25],
    color: "#1a1a1a",
    dataKey: "contact",
  },
  {
    id: "eeprom",
    type: "EEPROM",
    label: "U2 COM - Experience",
    position: [-4.5, 0.01, 0],
    rotation: [0, 0, 0],
    scale: [2.25, 1.5, 2.25],
    color: "#1a1a1a",
    dataKey: "experience",
  },
  {
    id: "capacitor",
    type: "CAPACITOR",
    label: "Y1 OSC - Education",
    position: [4.5, 0.01, 0],
    rotation: [0, 0, 0],
    scale: [2.25, 2.25, 2.25],
    color: "#3a5f8a",
    dataKey: "education",
  },
  {
    id: "microsd",
    type: "MICROSD",
    label: "U3 MEM - Projects",
    position: [0, 0.01, 4.5],
    rotation: [0, 0, 0],
    scale: [2.7, 1.5, 2.7],
    color: "#2d2d2d",
    dataKey: "projects",
  },
];

export default portfolioData;
