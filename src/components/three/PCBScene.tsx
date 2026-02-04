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
  const traces = useMemo(() => {
    const t = [];

    // Net: VCC (Power from VRM to MCU and other components)
    t.push(
      { points: [[-4, -2.5], [-2, -2.5], [-2, 0], [0, 0]], color: '#ff6b6b', width: 3, net: 'VCC' },
      { points: [[-2, -2.5], [-2, -4.5], [-2.5, -4.5]], color: '#ff6b6b', width: 2, net: 'VCC' },
      { points: [[-2, 0], [-2, 2.5], [-3.5, 2.5]], color: '#ff6b6b', width: 2, net: 'VCC' }
    );

    // Net: GND (Ground plane connections)
    t.push(
      { points: [[-4.5, 0], [-3.5, 0], [-3.5, -2.5]], color: '#4a4a4a', width: 3, net: 'GND' },
      { points: [[4.5, 0], [3.5, 0], [3.5, 2.5]], color: '#4a4a4a', width: 2, net: 'GND' },
      { points: [[0, 4.5], [0, 2, 0], [0, 0]], color: '#4a4a4a', width: 2, net: 'GND' }
    );

    // Net: CLK (Clock from OSC to MCU)
    t.push(
      { points: [[3.5, -2.5], [2, -2.5], [2, -1], [1, -1], [1, 0]], color: '#00ff88', width: 2, net: 'CLK' }
    );

    // Net: DATA0 (Data bus MCU to MEM)
    t.push(
      { points: [[0, 0], [1.5, 0], [1.5, 2.5], [3.5, 2.5]], color: '#00ccff', width: 2, net: 'DATA0' }
    );

    // Net: UART_TX (Serial from MCU to UART connector)
    t.push(
      { points: [[0, 0], [2, 0], [2, -3], [4.5, -3], [4.5, -4.5]], color: '#ffaa00', width: 2, net: 'UART' }
    );

    // Net: SWD (Debug from MCU to SWD port)
    t.push(
      { points: [[0, 0], [0, 2], [0, 4.5]], color: '#ff6b6b', width: 2, net: 'SWD' }
    );

    // Net: LED_CTRL (MCU to LEDs)
    t.push(
      { points: [[0, 0], [-1, 0], [-1, -3], [-2.5, -3], [-2.5, -4.5]], color: '#00ff88', width: 2, net: 'LED' }
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

      {/* Vias at trace junctions */}
      <Via position={[-2, 0, -2.5]} />
      <Via position={[-2, 0, 0]} />
      <Via position={[1.5, 0, 0]} />
      <Via position={[2, 0, -3]} />
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
    ctx.strokeStyle = 'rgba(74, 140, 93, 0.25)';
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

    // Copper pour areas (subtle background copper)
    ctx.fillStyle = 'rgba(184, 115, 51, 0.05)';
    ctx.fillRect(100, 100, 1848, 1848);

    // Main copper traces - brighter for visibility
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Horizontal power rails
    for (let i = 0; i < 8; i++) {
      const y = 300 + i * 200;
      ctx.beginPath();
      ctx.moveTo(150, y);
      ctx.lineTo(1898, y);
      ctx.stroke();
    }

    // Vertical signal traces
    ctx.strokeStyle = '#c9955e';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const x = 300 + i * 200;
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x, 1898);
      ctx.stroke();
    }

    // Solder pads at intersections
    ctx.fillStyle = '#e8c9a0';
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const x = 300 + i * 200;
        const y = 300 + j * 200;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Silkscreen labels for components
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Component silkscreen outlines
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
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

    // SWD outline
    ctx.strokeRect(974, 1698, 100, 80);
    ctx.fillText('J1', 1024, 1738);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <group>
      {/* Main board */}
      <mesh ref={boardRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial
          map={pcbTexture}
          roughness={0.5}
          metalness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Board edge - crisp outline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[14.1, 14.1]} />
        <meshStandardMaterial color="#0d1a12" />
      </mesh>

      {/* Mounting holes with copper rings - clearly visible */}
      {[[-6.5, -6.5], [6.5, -6.5], [-6.5, 6.5], [6.5, 6.5]].map(([x, z], i) => (
        <group key={i}>
          {/* Copper ring */}
          <mesh position={[x, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.25, 20]} />
            <meshStandardMaterial color="#d4a574" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Drill hole */}
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
                color="#1a1a1a"
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
                  <meshStandardMaterial color="#d4a574" metalness={0.95} roughness={0.1} />
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
              <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* Inductors */}
            <mesh position={[-0.4, 0.15, 0.2]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 20]} />
              <meshStandardMaterial color="#4a4a4a" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0.4, 0.15, 0.2]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 20]} />
              <meshStandardMaterial color="#4a4a4a" roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Output capacitors */}
            <mesh position={[-0.3, 0.1, -0.3]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
            </mesh>
            <mesh position={[0.3, 0.1, -0.3]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
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
                color="#c0c0c0"
                roughness={0.15}
                metalness={0.95}
              />
            </mesh>
            {/* Frequency text area */}
            <mesh position={[0, 0.16, 0]}>
              <circleGeometry args={[0.15, 24]} />
              <meshBasicMaterial color="#f0f0f0" />
            </mesh>
            {/* Pins */}
            <mesh position={[-0.2, -0.12, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
              <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.2, -0.12, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
              <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
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
              <meshStandardMaterial color="#1a2d1a" roughness={0.4} metalness={0.4} />
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
                  <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
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
              <meshStandardMaterial color="#2d2d1a" roughness={0.4} metalness={0.4} />
            </mesh>
            {/* Notch */}
            <mesh position={[-0.55, 0, 0]}>
              <boxGeometry args={[0.12, 0.13, 0.2]} />
              <meshStandardMaterial color="#1a3d28" />
            </mesh>
            {/* Pins */}
            {Array.from({ length: 20 }, (_, i) => {
              const x = (i - 9.5) * 0.1;
              return (
                <group key={i}>
                  <mesh position={[x, -0.02, -0.45]}>
                    <boxGeometry args={[0.03, 0.05, 0.1]} />
                    <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
                  </mesh>
                  <mesh position={[x, -0.02, 0.45]}>
                    <boxGeometry args={[0.03, 0.05, 0.1]} />
                    <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
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

      case 'LED':
        return (
          <group>
            {/* LED 1 - Turkish */}
            <mesh position={[-0.25, 0.06, 0]} castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color="#00ff88"
                emissive="#00ff88"
                emissiveIntensity={isHovered ? 1.2 : 0.5}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[-0.25, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
              <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* LED 2 - English */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color="#00ccff"
                emissive="#00ccff"
                emissiveIntensity={isHovered ? 1.2 : 0.5}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
              <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* LED 3 - German */}
            <mesh position={[0.25, 0.06, 0]} castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color="#ffaa00"
                emissive="#ffaa00"
                emissiveIntensity={isHovered ? 1.2 : 0.5}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0.25, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
              <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );

      case 'UART':
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.3, 0.25]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
            </mesh>
            {/* Pin header */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.4, 0.12, 0.15]} />
              <meshStandardMaterial color="#0a0a0a" />
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

      case 'SWD':
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.12, 0.18]} />
              <meshStandardMaterial color="#2d1a2d" roughness={0.4} />
            </mesh>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} position={[(i - 2) * 0.07, 0.07, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.03, 8]} />
                <meshBasicMaterial color="#0a0a0a" />
              </mesh>
            ))}
            {isHovered && (
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[0.5, 0.02, 0.25]} />
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
                color="#1a1a1a"
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>
            {/* Top marking */}
            <mesh position={[0, 0.18, 0]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color="#8b0000" />
            </mesh>
            {/* Stripe */}
            <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <planeGeometry args={[0.3, 0.05]} />
              <meshBasicMaterial color="#c0c0c0" />
            </mesh>
            {/* Leads */}
            <mesh position={[-0.06, -0.2, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
              <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.06, -0.2, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
              <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
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
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-[#0d1117]/95 border border-[#b87333] px-3 py-1.5 rounded text-xs font-mono text-[#00ff88] whitespace-nowrap pointer-events-none"
            style={{ boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)' }}>
            {component.label}
          </div>
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
        intensity={1.0}
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
        intensity={0.35}
        color="#e8f4ff"
      />

      {/* Rim light - highlights edges */}
      <directionalLight
        position={[0, 4, -10]}
        intensity={0.25}
        color="#a0ffc0"
      />

      {/* Ambient light - base level */}
      <ambientLight intensity={0.4} color="#d0e0d8" />

      {/* Point lights for copper warmth */}
      <pointLight position={[-4, 5, -4]} intensity={0.4} color="#ffcc80" distance={12} decay={2} />
      <pointLight position={[4, 5, 4]} intensity={0.3} color="#80ffcc" distance={12} decay={2} />

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

      {/* Instructions overlay */}
      <div className="absolute bottom-6 left-6 text-xs text-[#4a8c5d] font-mono pointer-events-none select-none space-y-1 z-10">
        <p>{t.rotate}</p>
        <p>{t.pan}</p>
        <p>{t.zoom}</p>
        <p className="text-[#00ff88]">{t.click}</p>
      </div>

      {/* Title overlay - responsive, no clipping */}
      <div className="absolute top-6 left-6 pointer-events-none z-10 max-w-[calc(100%-180px)]">
        <h1 className="text-[clamp(1.25rem,3vw,2.5rem)] font-bold text-[#f0f0f0] font-display tracking-wide whitespace-nowrap"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {t.name}
        </h1>
        <p className="text-[clamp(0.75rem,1.5vw,1rem)] text-[#4a8c5d] font-mono mt-1 whitespace-nowrap">
          {t.title}
        </p>
        <p className="text-[clamp(0.625rem,1vw,0.875rem)] text-[#b87333] font-mono mt-0.5 whitespace-nowrap">
          {t.subtitle}
        </p>
      </div>

      {/* Status indicators */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4 text-xs font-mono text-[#4a8c5d] z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span>{t.active}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#b87333]" />
          <span>{t.version}</span>
        </div>
      </div>
    </div>
  );
}

export type { PCBComponent };
