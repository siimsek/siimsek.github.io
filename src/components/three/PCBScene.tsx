import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { pcbComponents, type PCBComponent, type ComponentType } from '@/data/portfolioData';
import translations, { type Language } from '@/data/translations';
import { useIsMobile } from '@/hooks/use-mobile';

type TracePoint = [number, number];

type TraceRoute = {
  componentId: PCBComponent['id'];
  points: TracePoint[];
  baseColor: string;
  glowColor: string;
  baseOpacity: number;
  glowOpacity: number;
  pulseSpeed: number;
  pulseCount: number;
};

type TraceSegment = {
  from: TracePoint;
  to: TracePoint;
  length: number;
  cumulative: number;
};

type TraceRouteRuntime = TraceRoute & {
  segments: TraceSegment[];
  totalLength: number;
};

type TracePulse = {
  routeComponentId: PCBComponent['id'];
  offset: number;
  speed: number;
  color: string;
  radius: number;
};

type RouteValidationResult = {
  valid: boolean;
  errors: string[];
};

const TRACE_BOARD_BOUNDARY = 6.2;
const TRACE_ROUTE_PARTICIPANTS: PCBComponent['id'][] = ['led', 'connector', 'eeprom', 'capacitor', 'microsd'];

function toTraceVectors(points: TracePoint[], y: number) {
  return points.map(([x, z]) => new THREE.Vector3(x, y, z));
}

function buildTraceRuntime(route: TraceRoute): TraceRouteRuntime {
  const segments: TraceSegment[] = [];
  let totalLength = 0;

  for (let i = 0; i < route.points.length - 1; i += 1) {
    const from = route.points[i];
    const to = route.points[i + 1];
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    totalLength += length;
    segments.push({
      from,
      to,
      length,
      cumulative: totalLength,
    });
  }

  return {
    ...route,
    segments,
    totalLength,
  };
}

function getPointOnTrace(route: TraceRouteRuntime, progress: number): [number, number] {
  if (route.points.length < 2 || route.totalLength <= 0) return route.points[0] ?? [0, 0];

  const target = route.totalLength * progress;
  let previousCumulative = 0;

  for (const segment of route.segments) {
    if (segment.cumulative >= target) {
      const distanceInSegment = target - previousCumulative;
      const ratio = segment.length <= 0 ? 0 : distanceInSegment / segment.length;
      return [
        segment.from[0] + (segment.to[0] - segment.from[0]) * ratio,
        segment.from[1] + (segment.to[1] - segment.from[1]) * ratio,
      ];
    }
    previousCumulative = segment.cumulative;
  }

  return route.points[route.points.length - 1];
}

function validateRoutes(routes: TraceRoute[], components: PCBComponent[]): RouteValidationResult {
  const errors: string[] = [];
  const componentIdSet = new Set(components.map((component) => component.id));
  const expectedRouteSet = new Set(TRACE_ROUTE_PARTICIPANTS);

  if (routes.length !== TRACE_ROUTE_PARTICIPANTS.length) {
    errors.push(`Expected ${TRACE_ROUTE_PARTICIPANTS.length} routes, got ${routes.length}.`);
  }

  const componentRouteCounts = new Map<string, number>();

  for (const route of routes) {
    if (!componentIdSet.has(route.componentId)) {
      errors.push(`Route "${route.componentId}" does not map to an existing component.`);
    }
    if (!expectedRouteSet.has(route.componentId)) {
      errors.push(`Route "${route.componentId}" is not an allowed primary participant.`);
    }
    componentRouteCounts.set(route.componentId, (componentRouteCounts.get(route.componentId) ?? 0) + 1);
    for (const [x, z] of route.points) {
      const isFinitePoint = Number.isFinite(x) && Number.isFinite(z);
      const inBounds = Math.abs(x) <= TRACE_BOARD_BOUNDARY && Math.abs(z) <= TRACE_BOARD_BOUNDARY;
      if (!isFinitePoint || !inBounds) {
        errors.push(`Route "${route.componentId}" has an out-of-bounds point (${x}, ${z}).`);
      }
    }
  }

  for (const componentId of TRACE_ROUTE_PARTICIPANTS) {
    const count = componentRouteCounts.get(componentId) ?? 0;
    if (count !== 1) {
      errors.push(`Component "${componentId}" must have exactly 1 route, found ${count}.`);
    }
  }

  const mcuCount = componentRouteCounts.get('mcu') ?? 0;
  if (mcuCount > 0) {
    errors.push(`MCU must not emit a primary outbound route, found ${mcuCount}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function ConnectionTraces({ isMobile }: { isMobile: boolean }) {
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  const routes = useMemo<TraceRoute[]>(() => {
    const baseOpacity = isMobile ? 0.62 : 0.78;
    const glowOpacity = isMobile ? 0.2 : 0.3;
    const baseColor = '#c89353';

    return [
      {
        componentId: 'led',
        points: [[-4.5, -4], [-4.5, -1.3], [-1.2, -1.3], [-1.2, 0], [0, 0]],
        baseColor,
        glowColor: '#2de6b4',
        baseOpacity,
        glowOpacity,
        pulseSpeed: 0.21,
        pulseCount: isMobile ? 1 : 2,
      },
      {
        componentId: 'connector',
        points: [[4.5, -4], [4.5, -1.3], [1.2, -1.3], [1.2, 0], [0, 0]],
        baseColor,
        glowColor: '#74d9ff',
        baseOpacity,
        glowOpacity,
        pulseSpeed: 0.19,
        pulseCount: isMobile ? 1 : 2,
      },
      {
        componentId: 'eeprom',
        points: [[-4.5, 0], [-2.2, 0], [0, 0]],
        baseColor,
        glowColor: '#2de6b4',
        baseOpacity,
        glowOpacity,
        pulseSpeed: 0.24,
        pulseCount: isMobile ? 1 : 2,
      },
      {
        componentId: 'capacitor',
        points: [[4.5, 0], [2.2, 0], [0, 0]],
        baseColor,
        glowColor: '#8bd2ff',
        baseOpacity,
        glowOpacity,
        pulseSpeed: 0.24,
        pulseCount: isMobile ? 1 : 2,
      },
      {
        componentId: 'microsd',
        points: [[0, 4.5], [0, 1.55], [0, 0]],
        baseColor,
        glowColor: '#2de6b4',
        baseOpacity,
        glowOpacity,
        pulseSpeed: 0.18,
        pulseCount: isMobile ? 1 : 2,
      },
    ];
  }, [isMobile]);

  const routeValidation = useMemo(() => validateRoutes(routes, pcbComponents), [routes]);

  const runtimeRoutes = useMemo(
    () =>
      routes.reduce((map, route) => {
        map.set(route.componentId, buildTraceRuntime(route));
        return map;
      }, new Map<string, TraceRouteRuntime>()),
    [routes]
  );

  useEffect(() => {
    if (routeValidation.valid) return;
    console.error('Trace route validation failed:', routeValidation.errors.join(' | '));
  }, [routeValidation.errors, routeValidation.valid]);

  const pulses = useMemo<TracePulse[]>(
    () =>
      routes.flatMap((route) =>
        Array.from({ length: route.pulseCount }, (_, index) => ({
          routeComponentId: route.componentId,
          offset: (index / route.pulseCount + (route.componentId.length % 4) * 0.17) % 1,
          speed: route.pulseSpeed,
          color: route.glowColor,
          radius: isMobile ? 0.04 : 0.05,
        }))
      ),
    [isMobile, routes]
  );

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    pulses.forEach((pulse, index) => {
      const route = runtimeRoutes.get(pulse.routeComponentId);
      const mesh = pulseRefs.current[index];
      if (!route || !mesh) return;

      const progress = (elapsed * pulse.speed + pulse.offset) % 1;
      const [x, z] = getPointOnTrace(route, progress);
      mesh.position.set(x, 0.045, z);
    });
  });

  if (!routeValidation.valid) return null;

  return (
    <group>
      {routes.map((route) => (
        <group key={route.componentId}>
          <Line
            points={toTraceVectors(route.points, 0.016)}
            color={route.baseColor}
            lineWidth={isMobile ? 2.2 : 3.0}
            transparent
            opacity={route.baseOpacity}
          />
          <Line
            points={toTraceVectors(route.points, 0.023)}
            color={route.glowColor}
            lineWidth={isMobile ? 1.2 : 1.8}
            transparent
            opacity={route.glowOpacity}
          />
        </group>
      ))}

      {pulses.map((pulse, index) => (
        <mesh
          key={`${pulse.routeComponentId}-${index}`}
          ref={(ref) => {
            pulseRefs.current[index] = ref;
          }}
          position={[0, 0.045, 0]}
        >
          <sphereGeometry args={[pulse.radius, 12, 12]} />
          <meshStandardMaterial
            color={pulse.color}
            emissive={pulse.color}
            emissiveIntensity={isMobile ? 1.2 : 1.6}
            metalness={0.1}
            roughness={0.25}
          />
        </mesh>
      ))}
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
          roughness={0.46}
          metalness={0.24}
          envMapIntensity={0.62}
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

  const getHitBoxSize = (): [number, number, number] => {
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
  componentLabel,
  isHovered,
  onHover,
  onClick,
  hideLabel = false
}: {
  component: PCBComponent;
  componentLabel: string;
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
            className="bg-[#0d1117]/92 border border-[#3d6d4a] px-2.5 py-1.5 rounded-md text-[11px] font-mono text-[#dbece2] select-none cursor-pointer md:text-[12px] text-center leading-tight whitespace-nowrap"
            onClick={handleClick}
            style={{
              boxShadow: isHovered ? '0 0 18px rgba(0, 255, 136, 0.3)' : '0 0 8px rgba(0, 255, 136, 0.12)',
              borderColor: isHovered ? '#d4a574' : '#3d6d4a',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto' // Explicitly enable pointer events
            }}>
            {componentLabel}
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
  isModalOpen,
  isMobile,
  componentLabels
}: {
  onComponentClick: (component: PCBComponent) => void;
  hoveredComponent: string | null;
  onHover: (id: string | null) => void;
  isModalOpen: boolean;
  isMobile: boolean;
  componentLabels: Record<string, string>;
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.set(0, 13.5, 17);
    camera.lookAt(0, 0, 0);

    // Output encoding for proper colors
    // eslint-disable-next-line react-hooks/immutability
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.22;
  }, [camera, gl]);

  return (
    <>
      {/* Lighting setup tuned to avoid visible light bands. */}
      <directionalLight
        position={[8, 11, 5]}
        intensity={isMobile ? 1.28 : 1.52}
        castShadow
        shadow-mapSize={isMobile ? [1024, 1024] : [1536, 1536]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
        color="#f5faf2"
      />

      <directionalLight
        position={[-7, 6, -8]}
        intensity={isMobile ? 0.52 : 0.68}
        color="#d2e4ff"
      />

      <hemisphereLight
        args={['#dbeadf', '#213229', isMobile ? 0.6 : 0.72]}
      />
      <ambientLight intensity={isMobile ? 0.68 : 0.82} color="#c7d7cd" />

      {/* PCB Board */}
      <PCBBoard />

      {/* Animated connection traces */}
      <ConnectionTraces isMobile={isMobile} />

      {/* Components */}
      {pcbComponents.map((component) => (
        <PCBComponentObject
          key={component.id}
          component={component}
          componentLabel={componentLabels[component.dataKey] ?? component.label}
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
        minDistance={isMobile ? 10.5 : 12}
        maxDistance={isMobile ? 22 : 30}
        minPolarAngle={0.1}
        maxPolarAngle={isMobile ? Math.PI / 2.35 : Math.PI / 2.15}
        target={[0, 0, 0]}
        dampingFactor={isMobile ? 0.1 : 0.08}
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
  language: Language;
  isModalOpen?: boolean;
}

export default function PCBScene({ onComponentClick, language, isModalOpen = false }: PCBSceneProps) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [sceneStatus, setSceneStatus] = useState<'ready' | 'context-lost'>('ready');
  const [sceneKey, setSceneKey] = useState(0);
  const contextCleanupRef = useRef<(() => void) | null>(null);
  const [webglSupported] = useState<boolean>(() => {
    const canvas = document.createElement('canvas');
    const webgl2 = canvas.getContext('webgl2', { powerPreference: 'high-performance' });
    const webgl = webgl2 || canvas.getContext('webgl', { powerPreference: 'high-performance' });
    const experimental = webgl || canvas.getContext('experimental-webgl');
    return Boolean(experimental);
  });
  const isMobile = useIsMobile();
  const t = translations[language];
  const componentLabels = useMemo(
    () => ({
      about: t.components.about,
      skills: t.components.skills,
      education: t.components.education,
      experience: t.components.experience,
      projects: t.components.projects,
      contact: t.components.contact,
    }),
    [t.components]
  );

  const resetScene = useCallback(() => {
    setSceneStatus('ready');
    setSceneKey((prev) => prev + 1);
  }, []);

  const handleCanvasCreated = useCallback((state: RootState) => {
    contextCleanupRef.current?.();

    const canvas = state.gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setSceneStatus('context-lost');
    };
    const handleContextRestored = () => {
      setSceneStatus('ready');
      setSceneKey((prev) => prev + 1);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored as EventListener, false);
    contextCleanupRef.current = () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost as EventListener, false);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored as EventListener, false);
    };
  }, []);

  useEffect(() => {
    if (sceneStatus !== 'context-lost') return;
    contextCleanupRef.current?.();
    contextCleanupRef.current = null;
  }, [sceneStatus]);

  useEffect(
    () => () => {
      contextCleanupRef.current?.();
      contextCleanupRef.current = null;
    },
    []
  );

  if (!webglSupported) {
    return (
      <div className="w-full h-screen relative bg-[#010409] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-[#2d5a3d] bg-[#0d1117]/95 p-5 text-center">
          <h2 className="font-display text-xl text-[#f0f0f0]">3D Scene Unavailable</h2>
          <p className="mt-2 text-sm text-[#8fb8a0]">
            WebGL could not be initialized on this browser/device.
          </p>
          <p className="mt-1 text-xs text-[#4a8c5d]">
            Update graphics drivers or try a different browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      {sceneStatus === 'context-lost' ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-[#2d5a3d] bg-[#0d1117]/95 p-5 text-center shadow-[0_0_24px_rgba(0,0,0,0.55)]">
            <h2 className="font-display text-xl text-[#f0f0f0]">3D Context Lost</h2>
            <p className="mt-2 text-sm text-[#8fb8a0]">
              Graphics context was interrupted. Retry to re-initialize rendering.
            </p>
            <button
              type="button"
              onClick={resetScene}
              className="mt-4 rounded-md border border-[#d4a574] bg-[#1a3320] px-4 py-2 text-sm font-mono text-[#f0f0f0] transition-colors hover:bg-[#244b31]"
            >
              Retry Scene
            </button>
          </div>
        </div>
      ) : (
        <Canvas
          key={sceneKey}
          onCreated={handleCanvasCreated}
          camera={{ position: [0, 13.5, 17], fov: 36 }}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          dpr={isMobile ? [1, 1.25] : [1, 1.8]}
          shadows={!isMobile}
        >
          <SceneContent
            onComponentClick={onComponentClick}
            hoveredComponent={hoveredComponent}
            onHover={setHoveredComponent}
            isModalOpen={isModalOpen}
            isMobile={isMobile}
            componentLabels={componentLabels}
          />
        </Canvas>
      )}

      {/* Instructions overlay - Removed */}



      {/* Title overlay - responsive, consistent spacing */}
      <div className="absolute top-6 left-6 right-6 md:right-auto pointer-events-none z-10 max-w-[min(740px,calc(100%-3rem))] flex flex-col gap-2">
        <h1 className="text-[clamp(1.24rem,3.2vw,2.65rem)] font-bold text-[#f0f0f0] font-display tracking-wide leading-tight"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {t.name}
        </h1>
        <p className="text-[clamp(0.78rem,1.58vw,1.08rem)] font-mono leading-tight electric-text">
          {t.title}
        </p>
        <p className="text-[clamp(0.68rem,1.12vw,0.94rem)] text-[#d4a574] font-mono leading-tight">
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
