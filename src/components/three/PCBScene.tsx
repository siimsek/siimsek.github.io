import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { pcbComponents, type PCBComponent, type ComponentType } from '@/data/portfolioData';

// Via component - small plated through-hole
function Via({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.06, 12]} />
        <meshStandardMaterial color="#b87333" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

// Manhattan-style PCB traces with proper net routing
function ConnectionTraces() {
  const tracesRef = useRef<THREE.Group>(null);

  // Define nets with proper Manhattan routing (90-degree turns)
  // Component Positions (New Layout):
  // MCU: [0, 0]
  // VRM: [-5, -4] (Power Source)
  // OSC: [3, -1.5]
  // MEM: [4, 2]
  // COM: [-4, 1]
  // UART: [5, -4]
  const traces = useMemo(() => {
    const t = [];

    // Net: VCC (Power from VRM to MCU) - Red
    // Path: VRM -> up -> right -> MCU
    t.push(
      {
        points: [[-5, -4], [-5, -1], [-1, -1], [-1, 0], [0, 0]],
        color: '#ff6b6b', width: 3, net: 'VCC'
      }
    );

    // Net: CLK (Clock from OSC to MCU) - Green
    // Path: OSC -> left -> up -> MCU
    t.push(
      {
        points: [[3, -1.5], [3, -0.8], [0.8, -0.8], [0.8, 0], [0, 0]],
        color: '#00ff88', width: 2, net: 'CLK'
      }
    );

    // Net: DATA (Data bus MCU to MEM) - Blue
    // Path: MCU -> up -> right -> MEM
    t.push(
      {
        points: [[0, 0], [0, 1], [2, 1], [2, 2], [4, 2]],
        color: '#00ccff', width: 2, net: 'DATA0'
      }
    );

    // Net: UART (MCU to UART) - Orange
    // Path: MCU -> down -> right -> UART
    t.push(
      {
        points: [[0, 0], [0.5, 0], [0.5, -3], [5, -3], [5, -4]],
        color: '#ffaa00', width: 2, net: 'UART'
      }
    );

    // Net: COM (MCU to COM) - Gray
    // Path: MCU -> left -> up -> COM
    t.push(
      {
        points: [[0, 0], [-2, 0], [-2, 1], [-4, 1]],
        color: '#4a4a4a', width: 4, net: 'COM'
      }
    );

    return t;
  }, []);

  // Animated signal travel effect
  useFrame(({ clock }) => {
    if (!tracesRef.current) return;
    const time = clock.getElapsedTime();

    tracesRef.current.children.forEach((child) => {
      if (child.userData.isSignal) {
        const trace = traces[child.userData.traceIndex];
        if (!trace) return;

        const speed = 0.8;
        const progress = (time * speed + child.userData.offset) % 1;
        const points = trace.points;

        // Find position along the path
        const totalSegments = points.length - 1;
        const segmentProgress = progress * totalSegments;
        const segmentIndex = Math.floor(segmentProgress);
        const localProgress = segmentProgress - segmentIndex;

        if (segmentIndex < points.length - 1) {
          const p1 = points[segmentIndex];
          const p2 = points[segmentIndex + 1];
          const x = p1[0] + (p2[0] - p1[0]) * localProgress;
          const z = p1[1] + (p2[1] - p1[1]) * localProgress;
          child.position.set(x, 0.04, z);
        }
      }
    });
  });

  return (
    <group ref={tracesRef}>
      {/* Static trace lines */}
      {traces.map((trace, i) => {
        const points = trace.points.map(p => new THREE.Vector3(p[0], 0.02, p[1]));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive
            key={`trace-${i}`}
            object={new THREE.Line(
              geometry,
              new THREE.LineBasicMaterial({
                color: trace.color,
                transparent: true,
                opacity: 0.7,
                linewidth: trace.width
              })
            )}
          />
        );
      })}

      {/* Signal travel dots */}
      {traces.filter(t => ['CLK', 'DATA0', 'UART'].includes(t.net)).map((trace, idx) => (
        <mesh
          key={`signal-${idx}`}
          position={[trace.points[0][0], 0.04, trace.points[0][1]]}
          userData={{ isSignal: true, traceIndex: traces.indexOf(trace), offset: idx * 0.3 }}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Vias at key junctions */}
      <Via position={[-1, 0, -1]} />
      <Via position={[0.8, 0, -0.8]} />
      <Via position={[0.5, 0, -3]} />
      <Via position={[-2, 0, 1]} />
    </group>
  );
}

// PCB Board with improved texture and visibility
function PCBBoard() {
  const boardRef = useRef<THREE.Mesh>(null);

  const pcbTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // Base PCB color - lighter for better visibility
    ctx.fillStyle = '#1a3d28';
    ctx.fillRect(0, 0, 2048, 2048);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(74, 140, 93, 0.15)'; // Reduced opacity
    ctx.lineWidth = 1;
    for (let i = 0; i <= 2048; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 2048);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(2048, i);
      ctx.stroke();
    }

    // Copper pour areas (Very subtle background copper)
    ctx.fillStyle = 'rgba(184, 115, 51, 0.02)'; // Nearly transparent
    ctx.fillRect(100, 100, 1848, 1848);

    // Main copper traces - Much thinner and subtler
    ctx.strokeStyle = '#8c7352'; // Darker, less "gold"
    ctx.lineWidth = 2; // Thinner
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.3; // Low opacity

    // Horizontal power rails
    for (let i = 0; i < 8; i++) {
      const y = 300 + i * 200;
      ctx.beginPath();
      ctx.moveTo(150, y);
      ctx.lineTo(1898, y);
      ctx.stroke();
    }

    // Vertical signal traces
    ctx.strokeStyle = '#7a6245';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const x = 300 + i * 200;
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x, 1898);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0; // Reset opacity

    // Solder pads at intersections
    ctx.fillStyle = '#bfa382';
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const x = 300 + i * 200;
        const y = 300 + j * 200;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2); // Smaller pads
        ctx.fill();
      }
    }

    // Silkscreen labels for components
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Component silkscreen outlines
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
    ctx.lineWidth = 2;

    // MCU outline (center)
    ctx.strokeRect(924, 924, 200, 200);
    ctx.fillText('U1', 1024, 1024);

    // VRM outline
    ctx.strokeRect(300, 300, 200, 150);
    ctx.fillText('VRM', 400, 375);

    // OSC outline  
    ctx.strokeRect(1548, 348, 100, 100);
    ctx.fillText('Y1', 1598, 398);

    // MEM outline
    ctx.strokeRect(1548, 1548, 200, 150);
    ctx.fillText('U3', 1648, 1623);

    // UART outline
    ctx.strokeRect(1698, 698, 100, 80);
    ctx.fillText('P1', 1748, 738);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Rounded Rect Geometry Logic
  const boardGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 14;
    const h = 14;
    const r = 1.0; // Corner radius
    const depth = 0.2;

    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      curveSegments: 16
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Rotate to lie flat (Extrude assumes z-axis extrusion from xy plane)
    geometry.rotateX(Math.PI / 2);
    // Center it vertically
    geometry.translate(0, -depth / 2, 0);

    return geometry;
  }, []);

  return (
    <group>
      {/* Main board */}
      <mesh
        ref={boardRef}
        geometry={boardGeometry}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          map={pcbTexture}
          roughness={0.5}
          metalness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Mounting holes - Adjusted position slightly if needed, but keeping simple for now */}
      {[[-6.5, -6.5], [6.5, -6.5], [-6.5, 6.5], [6.5, 6.5]].map(([x, z], i) => (
        <group key={i}>
          {/* Copper ring */}
          <mesh position={[x, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.25, 20]} />
            <meshStandardMaterial color="#d4a574" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Drill hole - simple black circle since we can't easily boolean subtract from extrude geometry in r3f without CSG */}
          <mesh position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 20]} />
            <meshStandardMaterial color="#0a0f0a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Component geometries
function ComponentMesh({
  type,
  isHovered,
  onPointerOver,
  onPointerOut,
  onClick
}: {
  type: ComponentType;
  color: string;
  isHovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetY = isHovered ? 0.2 : 0;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.12);
  });

  const renderComponent = () => {
    switch (type) {
      case 'MCU':
        return (
          <group>
            {/* Main chip body */}
            <mesh castShadow>
              <boxGeometry args={[1.4, 0.15, 1.4]} />
              <meshStandardMaterial
                color="#2a2a2a" /* Lighter black */
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>
            {/* Pin 1 dot */}
            <mesh position={[-0.6, 0.08, -0.6]}>
              <circleGeometry args={[0.06, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Pins */}
            {Array.from({ length: 32 }, (_, i) => {
              const side = Math.floor(i / 8);
              const pos = (i % 8) * 0.16 - 0.56;
              let x = 0, z = 0, rotY = 0;
              switch (side) {
                case 0: x = -0.75; z = pos; rotY = 0; break;
                case 1: x = pos; z = -0.75; rotY = Math.PI / 2; break;
                case 2: x = 0.75; z = pos; rotY = Math.PI; break;
                case 3: x = pos; z = 0.75; rotY = -Math.PI / 2; break;
              }
              return (
                <mesh key={i} position={[x, -0.02, z]} rotation={[0, rotY, 0]}>
                  <boxGeometry args={[0.06, 0.06, 0.02]} />
                  <meshStandardMaterial color="#e6b87d" metalness={0.95} roughness={0.1} />
                </mesh>
              );
            })}
            {/* Hover glow */}
            {isHovered && (
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1.6, 0.02, 1.6]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.5} />
              </mesh>
            )}
          </group>
        );

      case 'VRM':
        return (
          <group>
            {/* Controller IC */}
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.15, 0.6]} />
              <meshStandardMaterial color="#2d2d3f" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* Inductors */}
            <mesh position={[-0.4, 0.15, 0.2]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 20]} />
              <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0.4, 0.15, 0.2]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 20]} />
              <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Output capacitors */}
            <mesh position={[-0.3, 0.1, -0.3]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.3} />
            </mesh>
            <mesh position={[0.3, 0.1, -0.3]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.3} />
            </mesh>
            {isHovered && (
              <mesh position={[0, 0.35, 0]}>
                <boxGeometry args={[1.1, 0.02, 0.9]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );

      case 'OSC':
        return (
          <group>
            {/* Metal can */}
            <mesh castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.3, 24]} />
              <meshStandardMaterial
                color="#d0d0d0"
                roughness={0.15}
                metalness={0.95}
              />
            </mesh>
            {/* Frequency text area */}
            <mesh position={[0, 0.16, 0]}>
              <circleGeometry args={[0.15, 24]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Pins */}
            <mesh position={[-0.2, -0.12, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
              <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.2, -0.12, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
              <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
            </mesh>
            {isHovered && (
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.02, 24]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.5} />
              </mesh>
            )}
          </group>
        );

      case 'COM':
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.15, 1]} />
              {/* Brighter material */}
              <meshStandardMaterial color="#2d3f2d" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* Pins */}
            {Array.from({ length: 12 }, (_, i) => {
              const side = Math.floor(i / 3);
              const pos = (i % 3) * 0.28 - 0.28;
              let x = 0, z = 0;
              switch (side) {
                case 0: x = -0.45; z = pos; break;
                case 1: x = pos; z = -0.55; break;
                case 2: x = 0.45; z = pos; break;
                case 3: x = pos; z = 0.55; break;
              }
              return (
                <mesh key={i} position={[x, -0.02, z]}>
                  <boxGeometry args={[0.05, 0.06, 0.05]} />
                  <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
                </mesh>
              );
            })}
            {isHovered && (
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[1, 0.02, 1.2]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );

      case 'MEM':
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[1.3, 0.12, 0.8]} />
              {/* Brighter material */}
              <meshStandardMaterial color="#3d3d2a" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* Notch */}
            <mesh position={[-0.55, 0, 0]}>
              <boxGeometry args={[0.12, 0.13, 0.2]} />
              <meshStandardMaterial color="#2a4d38" />
            </mesh>
            {/* Pins */}
            {Array.from({ length: 20 }, (_, i) => {
              const x = (i - 9.5) * 0.1;
              return (
                <group key={i}>
                  <mesh position={[x, -0.02, -0.45]}>
                    <boxGeometry args={[0.03, 0.05, 0.1]} />
                    <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
                  </mesh>
                  <mesh position={[x, -0.02, 0.45]}>
                    <boxGeometry args={[0.03, 0.05, 0.1]} />
                    <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
                  </mesh>
                </group>
              );
            })}
            {isHovered && (
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1.5, 0.02, 1]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );

      case 'UART':
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.3, 0.25]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
            </mesh>
            {/* Pin header */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.4, 0.12, 0.15]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Gold pins */}
            {Array.from({ length: 4 }, (_, i) => (
              <mesh key={i} position={[(i - 1.5) * 0.1, 0.3, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
                <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
              </mesh>
            ))}
            {isHovered && (
              <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[0.6, 0.02, 0.35]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );

      case 'CAP':
        return (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.35, 18]} />
              <meshStandardMaterial
                color="#2a2a2a"
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>
            {/* Top marking */}
            <mesh position={[0, 0.18, 0]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color="#a00000" />
            </mesh>
            {/* Stripe */}
            <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <planeGeometry args={[0.3, 0.05]} />
              <meshBasicMaterial color="#d0d0d0" />
            </mesh>
            {/* Leads */}
            <mesh position={[-0.06, -0.2, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
              <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.06, -0.2, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
              <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
            </mesh>
            {isHovered && (
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.02, 18]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );

      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.15, 0.4]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      {renderComponent()}
    </group>
  );
}

// Individual PCB Component
function PCBComponentObject({
  component,
  isHovered,
  onHover,
  onClick,
}: {
  component: PCBComponent;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (component: PCBComponent) => void;
}) {
  const handlePointerOver = useCallback(() => {
    onHover(component.id);
    document.body.style.cursor = 'pointer';
  }, [component.id, onHover]);

  const handlePointerOut = useCallback(() => {
    onHover(null);
    document.body.style.cursor = 'auto';
  }, [onHover]);

  const handleClick = useCallback(() => {
    onClick(component);
  }, [component, onClick]);

  return (
    <group
      position={component.position}
      rotation={component.rotation}
      scale={component.scale}
    >
      <ComponentMesh
        type={component.type}
        color={component.color}
        isHovered={isHovered}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {/* Tooltip */}
      {isHovered && (
        <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-[#0d1117]/95 border border-[#b87333] px-3 py-1.5 rounded text-xs font-mono text-[#00ff88] whitespace-nowrap pointer-events-none"
            style={{ boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)' }}>
            {component.label}
          </div>
          {/* Vertical line connecting label to component */}
          <div className="h-8 w-px bg-[#00ff88] mx-auto opacity-50 absolute left-1/2 -bottom-8 -translate-x-1/2" />
        </Html>
      )}
    </group>
  );
}

// Main scene content
function SceneContent({
  onComponentClick,
  hoveredComponent,
  onHover
}: {
  onComponentClick: (component: PCBComponent) => void;
  hoveredComponent: string | null;
  onHover: (id: string | null) => void;
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.set(0, 11, 13);
    camera.lookAt(0, 0, 0);

    // Output encoding for proper colors
    // eslint-disable-next-line react-hooks/immutability
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
  }, [camera, gl]);

  return (
    <>
      {/* Lighting Setup - Three-point lighting */}

      {/* Key light - main illumination */}
      <directionalLight
        position={[6, 12, 6]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
        color="#fff8f0"
      />

      {/* Fill light - softer, from opposite side */}
      <directionalLight
        position={[-8, 8, -6]}
        intensity={1.5}
        color="#e8f4ff"
      />

      {/* Rim light - highlights edges */}
      <directionalLight
        position={[0, 4, -10]}
        intensity={0.25}
        color="#a0ffc0"
      />

      {/* Ambient light - base level */}
      <ambientLight intensity={1.2} color="#d0e0d8" />

      {/* Point lights for copper warmth */}
      <pointLight position={[-4, 5, -4]} intensity={1.0} color="#ffcc80" distance={12} decay={2} />
      <pointLight position={[4, 5, 4]} intensity={0.8} color="#80ffcc" distance={12} decay={2} />

      {/* PCB Board */}
      <PCBBoard />

      {/* Connection traces */}
      <ConnectionTraces />

      {/* Components */}
      {pcbComponents.map((component) => (
        <PCBComponentObject
          key={component.id}
          component={component}
          isHovered={hoveredComponent === component.id}
          onHover={onHover}
          onClick={onComponentClick}
        />
      ))}

      {/* Subtle floor grid */}
      <Grid
        position={[0, -0.1, 0]}
        args={[24, 24]}
        cellSize={2}
        cellThickness={0.2}
        cellColor="#1a3d28"
        sectionSize={4}
        sectionThickness={0.3}
        sectionColor="#2d5a3d"
        fadeDistance={25}
        fadeStrength={2}
        infiniteGrid
      />

      {/* Orbit controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={7}
        maxDistance={22}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0, 0]}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

// Decorative Component (Non-interactive)
function DecorComponent({ type, position, rotation = [0, 0, 0] }: { type: 'CHIP_SMALL' | 'RESISTOR_ARRAY' | 'CAP_SMD'; position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {type === 'CHIP_SMALL' && (
        <group>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.1, 0.4]} />
            <meshStandardMaterial color="#222" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Pins */}
          {Array.from({ length: 4 }, (_, i) => (
            <group key={i}>
              <mesh position={[(i - 1.5) * 0.12, -0.02, 0.22]}>
                <boxGeometry args={[0.04, 0.04, 0.1]} />
                <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[(i - 1.5) * 0.12, -0.02, -0.22]}>
                <boxGeometry args={[0.04, 0.04, 0.1]} />
                <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      {type === 'RESISTOR_ARRAY' && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.08, 0.3]} />
            <meshStandardMaterial color="#111" roughness={0.5} />
          </mesh>
          {/* Resistor segments */}
          {Array.from({ length: 4 }, (_, i) => (
            <mesh key={i} position={[(i - 1.5) * 0.18, 0.041, 0]}>
              <boxGeometry args={[0.1, 0.01, 0.2]} />
              <meshStandardMaterial color="#ddd" />
            </mesh>
          ))}
        </group>
      )}
      {type === 'CAP_SMD' && (
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.15, 0.15]} />
          <meshStandardMaterial color="#8e6d48" roughness={0.3} />
          {/* End caps */}
          <mesh position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.06, 0.155, 0.155]} />
            <meshStandardMaterial color="#ccc" metalness={0.6} />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <boxGeometry args={[0.06, 0.155, 0.155]} />
            <meshStandardMaterial color="#ccc" metalness={0.6} />
          </mesh>
        </mesh>
      )}
    </group>
  );
}

// Fake Oscilloscope Component
function Oscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const draw = () => {
      time += 0.02;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with slight fade for persistence effect
      ctx.fillStyle = 'rgba(13, 17, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 20) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y < height; y += 20) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();

      // Waveform
      ctx.beginPath();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;

      for (let x = 0; x < width; x++) {
        // Complex wave: Sine + Noise + Moving Phase
        const y = height / 2 +
          Math.sin(x * 0.05 + time) * 20 +
          Math.sin(x * 0.1 - time * 2) * 10 +
          (Math.random() - 0.5) * 5; // Noise

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Scan line
      const scanX = (time * 100) % width;
      ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
      ctx.fillRect(scanX, 0, 2, height);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative w-48 h-24 border border-[#b87333] bg-[#0d1117] rounded-lg overflow-hidden hidden md:block"
      style={{ boxShadow: '0 0 10px rgba(0, 255, 136, 0.2)' }}>
      <canvas ref={canvasRef} width={192} height={96} className="w-full h-full" />
      <div className="absolute top-1 left-2 text-[8px] font-mono text-[#00ff88] opacity-70">
        CH1: 2V/div 5ms
      </div>
    </div>
  );
}

// Main PCB Scene component
interface PCBSceneProps {
  onComponentClick: (component: PCBComponent) => void;
  language: 'en' | 'tr';
}

export default function PCBScene({ onComponentClick, language }: PCBSceneProps) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const t = language === 'en' ? {
    rotate: "[Left Click + Drag] Rotate",
    pan: "[Right Click + Drag] Pan",
    zoom: "[Scroll] Zoom In/Out",
    click: "[Click Component] View Details",
    active: "System Active",
    version: "v1.0.0",
    name: "MUHAMMED ALI SIMSEK",
    title: "ELECTRICAL AND ELECTRONICS ENGINEER",
    subtitle: "Embedded Systems | Hardware | Embedded Software"
  } : {
    rotate: "[Sol Tik + Surukle] Dondur",
    pan: "[Sag Tik + Surukle] Kaydir",
    zoom: "[Kaydirma] Yaklastir/Uzaklastir",
    click: "[Bilesen Tikla] Detaylari Gor",
    active: "Sistem Aktif",
    version: "v1.0.0",
    name: "MUHAMMED ALI SIMSEK",
    title: "ELEKTRIK VE ELEKTRONIK MUHENDISI",
    subtitle: "Gomulu Sistemler | Donanim | Gomulu Yazilim"
  };

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [0, 11, 13], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        shadows
      >
        <SceneContent
          onComponentClick={onComponentClick}
          hoveredComponent={hoveredComponent}
          onHover={setHoveredComponent}
        />
      </Canvas>

      {/* Instructions overlay - Removed */}

      {/* Decorative / Filler Components */}
      <DecorComponent type="CHIP_SMALL" position={[-2, 0.08, -5]} rotation={[0, 0.5, 0]} />
      <DecorComponent type="CHIP_SMALL" position={[-1, 0.08, -5.5]} />
      <DecorComponent type="RESISTOR_ARRAY" position={[1.5, 0.05, -3]} />
      <DecorComponent type="RESISTOR_ARRAY" position={[1.5, 0.05, -3.5]} />
      <DecorComponent type="CAP_SMD" position={[-5.5, 0.08, 0]} rotation={[0, Math.PI / 2, 0]} />
      <DecorComponent type="CAP_SMD" position={[-5.8, 0.08, 0]} rotation={[0, Math.PI / 2, 0]} />
      <DecorComponent type="CAP_SMD" position={[-5.5, 0.08, 0.5]} rotation={[0, Math.PI / 2, 0]} />
      <DecorComponent type="CHIP_SMALL" position={[5.5, 0.08, 1]} rotation={[0, Math.PI / 4, 0]} />
      <DecorComponent type="RESISTOR_ARRAY" position={[0, 0.05, 5.5]} />
      <DecorComponent type="CAP_SMD" position={[-0.5, 0.08, 5.5]} />
      <DecorComponent type="CAP_SMD" position={[0.5, 0.08, 5.5]} />


      {/* Title overlay - responsive, consistent spacing */}
      <div className="absolute top-6 left-6 pointer-events-none z-10 max-w-[calc(100%-180px)] flex flex-col gap-2">
        <h1 className="text-[clamp(1.25rem,3vw,2.5rem)] font-bold text-[#f0f0f0] font-display tracking-wide whitespace-nowrap leading-none"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {t.name}
        </h1>
        <p className="text-[clamp(0.75rem,1.5vw,1rem)] text-[#4a8c5d] font-mono whitespace-nowrap leading-none">
          {t.title}
        </p>
        <p className="text-[clamp(0.625rem,1vw,0.875rem)] text-[#b87333] font-mono whitespace-nowrap leading-none">
          {t.subtitle}
        </p>
      </div>

      {/* Status indicators - Removed */}

      {/* Fake Oscilloscope - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-10">
        <Oscilloscope />
      </div>
    </div>
  );
}

export type { PCBComponent };
