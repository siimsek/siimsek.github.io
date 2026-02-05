import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { pcbComponents, type PCBComponent, type ComponentType } from '@/data/portfolioData';



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

    // Secondary traces for realism
    // GND net: VRM corner to board edge
    t.push(
      {
        points: [[-5, -4.5], [-5, -6], [-6.5, -6]],
        color: '#3a3a3a', width: 3, net: 'GND'
      }
    );

    // AUX1: Bypass cap to MEM
    t.push(
      {
        points: [[3, 5], [3, 3], [4, 3], [4, 2.5]],
        color: '#555555', width: 1.5, net: 'AUX1'
      }
    );

    // AUX2: Decor chip to edge (decorative)
    t.push(
      {
        points: [[-2, -5], [-2, -6], [0, -6], [0, -6.5]],
        color: '#444444', width: 1.5, net: 'AUX2'
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

  return null; // Traces removed - clean PCB board
}

// PCB Board with improved texture and visibility
function PCBBoard() {
  const boardRef = useRef<THREE.Mesh>(null);

  const pcbTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // Pure green PCB - clean look
    ctx.fillStyle = '#1a3d28';
    ctx.fillRect(0, 0, 2048, 2048);

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

      {/* Mounting holes - Gold plated rings with black centers */}
      {[[-6.5, -6.5], [6.5, -6.5], [-6.5, 6.5], [6.5, 6.5]].map(([x, z], i) => (
        <group key={i}>
          {/* Copper/Gold ring - flush with board */}
          <mesh position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.3, 32]} />
            <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Drill hole - simple black circle to simulate hole */}
          <mesh position={[x, 0.001, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.15, 32]} />
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

  const getHitBoxSize = () => {
    // Returns [width, height, depth] for the hitbox
    // Sizes are approx 0.4 - 0.5 larger than visual mesh to add ~10-20px buffer
    switch (type) {
      case 'MCU': return [1.8, 0.5, 1.8];
      case 'LED': return [0.6, 0.5, 0.6];
      case 'CAPACITOR': return [0.6, 0.7, 0.6];
      case 'EEPROM': return [0.9, 0.4, 0.7];
      case 'MICROSD': return [1.1, 0.4, 1.0];
      case 'CONNECTOR': return [1.0, 0.6, 0.7];
      case 'CAP': return [0.5, 0.6, 0.5];
      default: return [0.8, 0.5, 0.8];
    }
  };

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

      case 'LED':
        return (
          <group>
            {/* LED Dome - translucent red */}
            <mesh castShadow position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.13, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color="#ff2222"
                transparent
                opacity={0.85}
                emissive="#ff0000"
                emissiveIntensity={isHovered ? 0.8 : 0.3}
                roughness={0.2}
                metalness={0.1}
              />
            </mesh>
            {/* LED Base/Rim */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.14, 0.16, 0.04, 24]} />
              <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Cathode Lead (-) */}
            <mesh position={[-0.08, -0.1, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
              <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Anode Lead (+) - slightly longer */}
            <mesh position={[0.08, -0.12, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.24, 8]} />
              <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Glow effect when hovered */}
            {isHovered && (
              <mesh position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.18, 16, 12]} />
                <meshBasicMaterial color="#ff4444" transparent opacity={0.3} />
              </mesh>
            )}
          </group>
        );

      case 'CAPACITOR':
        return (
          <group>
            {/* Cylindrical electrolytic capacitor body */}
            <mesh castShadow>
              <cylinderGeometry args={[0.18, 0.18, 0.4, 24]} />
              <meshStandardMaterial
                color="#3a5f8a"
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
            {/* Top marking */}
            <mesh position={[0, 0.21, 0]}>
              <circleGeometry args={[0.14, 24]} />
              <meshBasicMaterial color="#2a4a6a" />
            </mesh>
            {/* Polarity stripe (negative side) */}
            <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <planeGeometry args={[0.35, 0.06]} />
              <meshBasicMaterial color="#e0e0e0" />
            </mesh>
            {/* Negative Lead */}
            <mesh position={[-0.09, -0.25, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
              <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Positive Lead */}
            <mesh position={[0.09, -0.25, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
              <meshStandardMaterial color="#e6b87d" metalness={0.9} roughness={0.2} />
            </mesh>
            {isHovered && (
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );

      case 'EEPROM':
        return (
          <group>
            {/* EEPROM IC body (small 8-pin SOIC) */}
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.12, 0.35]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Pin 1 dot indicator */}
            <mesh position={[-0.18, 0.07, -0.12]}>
              <circleGeometry args={[0.03, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* IC Pins (8-pin DIP style) */}
            {Array.from({ length: 8 }, (_, i) => {
              const side = i < 4 ? -1 : 1;
              const idx = i % 4;
              const z = (idx - 1.5) * 0.1;
              return (
                <mesh key={i} position={[side * 0.28, -0.02, z]}>
                  <boxGeometry args={[0.06, 0.05, 0.03]} />
                  <meshStandardMaterial color="#d4a574" metalness={0.9} roughness={0.2} />
                </mesh>
              );
            })}
            {isHovered && (
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.7, 0.02, 0.5]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );

      case 'MICROSD':
        return (
          <group>
            {/* MicroSD card slot base */}
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.08, 0.6]} />
              <meshStandardMaterial color="#2d2d2d" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Card insertion opening */}
            <mesh position={[0, 0.08, 0.25]}>
              <boxGeometry args={[0.4, 0.06, 0.1]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Card detect switch */}
            <mesh position={[-0.3, 0.06, 0.2]} castShadow>
              <boxGeometry args={[0.08, 0.04, 0.08]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
            {/* Metal shield sides */}
            <mesh position={[-0.38, 0.04, 0]} castShadow>
              <boxGeometry args={[0.06, 0.12, 0.6]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.38, 0.04, 0]} castShadow>
              <boxGeometry args={[0.06, 0.12, 0.6]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Contact pins (8 pins) */}
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i} position={[(i - 3.5) * 0.08, -0.02, -0.15]}>
                <boxGeometry args={[0.03, 0.04, 0.08]} />
                <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
              </mesh>
            ))}
            {isHovered && (
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.9, 0.02, 0.75]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );

      case 'CONNECTOR':
        return (
          <group>
            {/* Connector housing (black plastic) */}
            <mesh castShadow>
              <boxGeometry args={[0.6, 0.25, 0.35]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
            </mesh>
            {/* Pin header base */}
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.5, 0.1, 0.25]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            {/* Gold contact pins (6 pins) */}
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} position={[(i - 2.5) * 0.09, 0.27, 0]}>
                <boxGeometry args={[0.03, 0.08, 0.06]} />
                <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
              </mesh>
            ))}
            {/* Mounting tabs */}
            <mesh position={[-0.35, -0.02, 0]}>
              <boxGeometry args={[0.1, 0.06, 0.4]} />
              <meshStandardMaterial color="#888888" metalness={0.8} />
            </mesh>
            <mesh position={[0.35, -0.02, 0]}>
              <boxGeometry args={[0.1, 0.06, 0.4]} />
              <meshStandardMaterial color="#888888" metalness={0.8} />
            </mesh>
            {isHovered && (
              <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.75, 0.02, 0.5]} />
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
      {/* Invisible HitBox for easier interaction (adds tolerance) */}
      <mesh position={[0, 0.05, 0]}>
        {/* @ts-ignore - BufferGeometry types are compatible */}
        <boxGeometry args={getHitBoxSize()} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} color="pink" />
      </mesh>
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
  hideLabel = false
}: {
  component: PCBComponent;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (component: PCBComponent) => void;
  hideLabel?: boolean;
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

      {/* Permanent Label - Hide when modal is open */}
      {!hideLabel && (
        <Html position={[0, 0.75, 0]} center zIndexRange={[100, 0]} sprite>
          {/* Label is now clickable and has pointer-events enabled */}
          <div
            className="bg-[#0d1117]/90 border border-[#2d5a3d] px-2 py-1 rounded text-[11px] font-mono text-[#00ff88] whitespace-nowrap select-none cursor-pointer md:text-[12px]"
            onClick={handleClick}
            style={{
              boxShadow: isHovered ? '0 0 12px rgba(0, 255, 136, 0.5)' : '0 0 6px rgba(0, 255, 136, 0.2)',
              borderColor: isHovered ? '#b87333' : '#2d5a3d',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto' // Explicitly enable pointer events
            }}>
            {component.type === 'MCU' && 'About Me'}
            {component.type === 'LED' && 'Skills'}
            {component.type === 'CAPACITOR' && 'Education'}
            {component.type === 'EEPROM' && 'Experience'}
            {component.type === 'MICROSD' && 'Projects'}
            {component.type === 'CONNECTOR' && 'Contact'}
            {component.type === 'CAP' && 'Workflow'}
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
  onHover,
  isModalOpen
}: {
  onComponentClick: (component: PCBComponent) => void;
  hoveredComponent: string | null;
  onHover: (id: string | null) => void;
  isModalOpen: boolean;
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

      {/* Connection traces - disabled for performance (component returns null) */}
      {/* <ConnectionTraces /> */}

      {/* Components */}
      {pcbComponents.map((component) => (
        <PCBComponentObject
          key={component.id}
          component={component}
          isHovered={hoveredComponent === component.id}
          onHover={onHover}
          onClick={onComponentClick}
          hideLabel={isModalOpen}
        />
      ))}






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
  isModalOpen?: boolean;
}

export default function PCBScene({ onComponentClick, language, isModalOpen = false }: PCBSceneProps) {
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
    subtitle: "Circuit Design | PCB Development | Digital Electronics"
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
          isModalOpen={isModalOpen}
        />
      </Canvas>

      {/* Instructions overlay - Removed */}



      {/* Title overlay - responsive, consistent spacing */}
      <div className="absolute top-6 left-6 pointer-events-none z-10 max-w-[calc(100%-180px)] flex flex-col gap-2">
        <h1 className="text-[clamp(1.25rem,3vw,2.5rem)] font-bold text-[#f0f0f0] font-display tracking-wide whitespace-nowrap leading-none"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {t.name}
        </h1>
        <p className="text-[clamp(0.75rem,1.5vw,1rem)] font-mono whitespace-nowrap leading-none electric-text">
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
