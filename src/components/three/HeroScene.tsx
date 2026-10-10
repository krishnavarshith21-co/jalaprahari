import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export interface ScenePalette {
  limestonePlinth: string;
  limestoneWallA: string;
  limestoneWallB: string;
  limestoneWallC: string;
  parapetCap: string;
  windowGlazing: string;
  asphaltRoad: string;
  roadMarking: string;
  curbStone: string;
  sidewalkPaver: string;
  castIronGrate: string;
  subsurfacePit: string;
  waterFilm: string;
  brassAccent: string;
  terracottaRisk: string;
  subgradeBase: string;
  vergeGreen: string;
  gutterInvert: string;
  paverGroove: string;
  curbThroat: string;
  grateBars: string;
  pipeSection: string;
  streetLight: string;
  waterFlowLine: string;
}

const LIGHT_PALETTE: ScenePalette = {
  limestonePlinth: '#BFB9AB',
  limestoneWallA: '#D6D0C2',
  limestoneWallB: '#C8C2B3',
  limestoneWallC: '#E0DAD0',
  parapetCap: '#A39C8D',
  windowGlazing: '#313830',
  asphaltRoad: '#3A3F37',
  roadMarking: '#EBE5D8',
  curbStone: '#BDB7A8',
  sidewalkPaver: '#C7C1B2',
  castIronGrate: '#1A1E18',
  subsurfacePit: '#242921',
  waterFilm: '#6B857A',
  brassAccent: '#AD8B56',
  terracottaRisk: '#B9654B',
  subgradeBase: '#E0DAD0',
  vergeGreen: '#687361',
  gutterInvert: '#2F332C',
  paverGroove: '#A39D8E',
  curbThroat: '#21251E',
  grateBars: '#161914',
  pipeSection: '#505A4A',
  streetLight: '#2E342B',
  waterFlowLine: '#5C756B',
};

const DARK_PALETTE: ScenePalette = {
  limestonePlinth: '#1E2820',
  limestoneWallA: '#253328',
  limestoneWallB: '#202C22',
  limestoneWallC: '#2A382D',
  parapetCap: '#37473A',
  windowGlazing: '#162018',
  asphaltRoad: '#141A14',
  roadMarking: '#9DAA97',
  curbStone: '#29372C',
  sidewalkPaver: '#233026',
  castIronGrate: '#0D110D',
  subsurfacePit: '#090D09',
  waterFilm: '#53664D',
  brassAccent: '#D0B27A',
  terracottaRisk: '#C4775D', // muted copper
  subgradeBase: '#151C16',
  vergeGreen: '#3C4D3A',
  gutterInvert: '#111711',
  paverGroove: '#1A241C',
  curbThroat: '#0F150F',
  grateBars: '#0D110D',
  pipeSection: '#354333',
  streetLight: '#1B241C',
  waterFlowLine: '#7A9184',
};

// ── Realistic Urban Ground & Drainage Topography ──
function UrbanInfrastructure({ palette }: { palette: ScenePalette }) {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Geological Base / Subgrade Slab */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[11.5, 0.8, 9.5]} />
        <meshStandardMaterial color={palette.subgradeBase} roughness={0.9} />
      </mesh>

      {/* Roadway Asphalt Surface with Gutter Slope */}
      <mesh position={[1.4, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.4, 9.2]} />
        <meshStandardMaterial color={palette.asphaltRoad} roughness={0.88} metalness={0.12} />
      </mesh>

      {/* Road Centerline Dashed Stripes */}
      {[-3.2, -1.6, 0, 1.6, 3.2].map((z, i) => (
        <mesh key={i} position={[2.8, 0.016, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.75]} />
          <meshStandardMaterial color={palette.roadMarking} roughness={0.9} />
        </mesh>
      ))}

      {/* Solid White Gutter Edge Stripe */}
      <mesh position={[-0.45, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 9.0]} />
        <meshStandardMaterial color={palette.roadMarking} roughness={0.9} />
      </mesh>

      {/* Gutter Invert (lower trough collecting runoff before curb) */}
      <mesh position={[-0.62, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.24, 9.2]} />
        <meshStandardMaterial color={palette.gutterInvert} roughness={0.8} />
      </mesh>

      {/* Left Sidewalk Curb Stone */}
      <mesh position={[-0.8, 0.065, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.16, 0.13, 9.2]} />
        <meshStandardMaterial color={palette.curbStone} roughness={0.7} />
      </mesh>

      {/* Left Sidewalk Slab */}
      <mesh position={[-2.45, 0.13, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.15, 0.13, 9.2]} />
        <meshStandardMaterial color={palette.sidewalkPaver} roughness={0.75} />
      </mesh>

      {/* Sidewalk Transverse Paver Joint Grooves */}
      {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((z, i) => (
        <mesh key={i} position={[-2.45, 0.196, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.1, 0.03]} />
          <meshBasicMaterial color={palette.paverGroove} />
        </mesh>
      ))}

      {/* Right Curb & Sidewalk Verge */}
      <mesh position={[3.65, 0.065, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.16, 0.13, 9.2]} />
        <meshStandardMaterial color={palette.curbStone} roughness={0.7} />
      </mesh>
      <mesh position={[4.6, 0.13, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.75, 0.13, 9.2]} />
        <meshStandardMaterial color={palette.vergeGreen} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── Realistic Stormwater Curb Inlet with Metal Grate & Sump ──
function StormwaterInletAssembly({ palette }: { palette: ScenePalette }) {
  return (
    <group position={[-0.72, -0.58, 0.8]}>
      {/* Subsurface Catch Basin Pit */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.44, 0.16, 0.95]} />
        <meshStandardMaterial color={palette.subsurfacePit} roughness={0.9} />
      </mesh>

      {/* Recessed Curb Hood Throat Opening */}
      <mesh position={[-0.14, 0.04, 0]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.85]} />
        <meshStandardMaterial color={palette.curbThroat} roughness={0.9} />
      </mesh>

      {/* Cast Iron Grate Rim Frame */}
      <mesh position={[0.06, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.34, 0.84]} />
        <meshStandardMaterial color={palette.castIronGrate} roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Slotted Cast Iron Grate Bars */}
      <group position={[0.06, 0.014, 0]}>
        {[-0.32, -0.22, -0.12, -0.02, 0.08, 0.18, 0.28].map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <boxGeometry args={[0.26, 0.015, 0.035]} />
            <meshStandardMaterial color={palette.grateBars} roughness={0.35} metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Subsurface Outflow Pipe Section */}
      <mesh position={[-0.45, -0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.7, 16]} />
        <meshStandardMaterial color={palette.pipeSection} roughness={0.7} transparent opacity={0.65} />
      </mesh>

      {/* Illustrative Drainage Outfall Beacon & Reticle Ring */}
      <group position={[0.06, 0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.3, 32]} />
          <meshBasicMaterial color={palette.terracottaRisk} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.38, 0.42, 32]} />
          <meshBasicMaterial color={palette.brassAccent} side={THREE.DoubleSide} transparent opacity={0.45} />
        </mesh>
        {/* Survey Beacon Stem */}
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.72, 8]} />
          <meshStandardMaterial color={palette.brassAccent} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Beacon Node Sphere */}
        <mesh position={[0, 0.74, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={palette.terracottaRisk} roughness={0.2} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// ── Nuanced Architectural Buildings with Recessed Windows ──
function ArchitecturalStreetWall({ palette }: { palette: ScenePalette }) {
  return (
    <group position={[0, -0.6, 0]}>
      {/* ── Building 1: 4-Storey Commercial Corner ── */}
      <group position={[-3.3, 0, -2.4]}>
        {/* Ground Floor Plinth */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.8, 2.6]} />
          <meshStandardMaterial color={palette.limestonePlinth} roughness={0.8} />
        </mesh>
        {/* Upper Storeys Body */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 1.2, 2.6]} />
          <meshStandardMaterial color={palette.limestoneWallA} roughness={0.85} />
        </mesh>
        {/* Recessed Horizontal Fenestration Bands */}
        <mesh position={[0.98, 1.4, 0]}>
          <boxGeometry args={[0.16, 0.35, 2.3]} />
          <meshStandardMaterial color={palette.windowGlazing} roughness={0.25} metalness={0.6} />
        </mesh>
        <mesh position={[0.98, 0.9, 0]}>
          <boxGeometry args={[0.16, 0.35, 2.3]} />
          <meshStandardMaterial color={palette.windowGlazing} roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Roof Parapet Coping */}
        <mesh position={[0, 2.05, 0]}>
          <boxGeometry args={[2.16, 0.1, 2.66]} />
          <meshStandardMaterial color={palette.parapetCap} roughness={0.7} />
        </mesh>
      </group>

      {/* ── Building 2: Stepped Office Block ── */}
      <group position={[-3.35, 0, 1.5]}>
        {/* Lower Main Body */}
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.2, 2.8]} />
          <meshStandardMaterial color={palette.limestoneWallB} roughness={0.85} />
        </mesh>
        {/* Recessed Glazing Bands */}
        <mesh position={[0.94, 0.8, 0]}>
          <boxGeometry args={[0.15, 0.32, 2.4]} />
          <meshStandardMaterial color={palette.windowGlazing} roughness={0.25} metalness={0.6} />
        </mesh>
        <mesh position={[0.94, 1.4, 0]}>
          <boxGeometry args={[0.15, 0.32, 2.4]} />
          <meshStandardMaterial color={palette.windowGlazing} roughness={0.25} metalness={0.6} />
        </mesh>
        <mesh position={[0.94, 1.9, 0]}>
          <boxGeometry args={[0.15, 0.32, 2.4]} />
          <meshStandardMaterial color={palette.windowGlazing} roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Parapet Band */}
        <mesh position={[0, 2.24, 0]}>
          <boxGeometry args={[2.06, 0.08, 2.86]} />
          <meshStandardMaterial color={palette.parapetCap} roughness={0.7} />
        </mesh>
        {/* Stepped Rooftop Mechanical Pavilion */}
        <mesh position={[-0.1, 2.5, 0]} castShadow>
          <boxGeometry args={[1.3, 0.5, 1.6]} />
          <meshStandardMaterial color={palette.limestoneWallC} roughness={0.9} />
        </mesh>
      </group>

      {/* ── Building 3: Low-Rise Urban Infill (Far Left) ── */}
      <group position={[-3.5, 0, -4.1]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.4, 1.7]} />
          <meshStandardMaterial color={palette.limestoneWallC} roughness={0.9} />
        </mesh>
        <mesh position={[0.82, 0.75, 0]}>
          <boxGeometry args={[0.16, 0.4, 1.3]} />
          <meshStandardMaterial color={palette.windowGlazing} roughness={0.25} metalness={0.6} />
        </mesh>
        <mesh position={[0, 1.44, 0]}>
          <boxGeometry args={[1.86, 0.08, 1.76]} />
          <meshStandardMaterial color={palette.parapetCap} roughness={0.7} />
        </mesh>
      </group>

      {/* ── Right Street Wall Background Buildings ── */}
      <group position={[4.5, 0, -2.1]}>
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.6, 2.7]} />
          <meshStandardMaterial color={palette.limestoneWallC} roughness={0.85} />
        </mesh>
        <mesh position={[-0.7, 0.8, 0]}>
          <boxGeometry args={[0.12, 0.35, 2.3]} />
          <meshStandardMaterial color={palette.windowGlazing} roughness={0.25} metalness={0.6} />
        </mesh>
      </group>
      <group position={[4.5, 0, 1.9]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 2.2, 2.5]} />
          <meshStandardMaterial color={palette.limestoneWallA} roughness={0.85} />
        </mesh>
        <mesh position={[-0.7, 1.1, 0]}>
          <boxGeometry args={[0.12, 0.35, 2.1]} />
          <meshStandardMaterial color={palette.windowGlazing} roughness={0.25} metalness={0.6} />
        </mesh>
      </group>

      {/* Refined Municipal Streetlight Post */}
      <group position={[-0.85, 0, -2.2]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.024, 1.4, 8]} />
          <meshStandardMaterial color={palette.streetLight} roughness={0.5} />
        </mesh>
        <mesh position={[0.14, 1.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.28, 0.018, 0.025]} />
          <meshStandardMaterial color={palette.streetLight} roughness={0.5} />
        </mesh>
        <mesh position={[0.25, 1.33, 0]}>
          <boxGeometry args={[0.07, 0.025, 0.05]} />
          <meshStandardMaterial color={palette.brassAccent} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// ── Realistic Small-Scale Plastic Litter & Illustrative Flow Path ──
interface DebrisParticle {
  id: number;
  initialPos: [number, number, number];
  type: 'bottle' | 'bag' | 'wrapper' | 'cup';
  color: string;
  rotation: [number, number, number];
  scale: number;
  flowDelay: number;
}

function PlasticLitterAndRunoffFlow({ palette }: { palette: ScenePalette }) {
  const waterFlowRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);

  // Proportionate, realistically scaled plastic litter items nestled in gutter
  const debrisData: DebrisParticle[] = useMemo(() => {
    const types: ('bottle' | 'bag' | 'wrapper' | 'cup')[] = ['bottle', 'bag', 'wrapper', 'cup', 'bottle', 'bag'];
    const litterColors = [
      '#BD6750', // Terracotta-tinted bottle cap/container
      '#C7AA64', // Snack foil wrapper
      '#7F8E73', // Olive polyethylene packaging
      '#4A5661', // Dark film polymer
      '#C8C2B3', // Translucent white polypropylene
      '#AA543D', // Reddish beverage cap
    ];

    const list: DebrisParticle[] = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const p1 = (Math.sin(i * 87.12) + 1) / 2;
      const p2 = (Math.cos(i * 43.67) + 1) / 2;
      
      // Realistically clustered in gutter (-0.68 to -0.52)
      const x = -0.66 + (p1 * 0.16);
      const z = -3.6 + (i * 0.35) + (p2 * 0.15);

      list.push({
        id: i,
        initialPos: [x, -0.585, z],
        type: types[i % types.length],
        color: litterColors[i % litterColors.length],
        rotation: [p1 * Math.PI, p2 * Math.PI * 2, p1 * 0.4],
        scale: 0.035 + p2 * 0.02, // Small, proportionate scale
        flowDelay: (i / count) * 4.5,
      });
    }
    return list;
  }, []);

  // Streamlines guiding towards inlet at z = 0.8
  const streamlines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 5; i++) {
      const offset = (i - 2) * 0.045;
      const pts = [
        new THREE.Vector3(-0.62 + offset, -0.588, -3.8),
        new THREE.Vector3(-0.64 + offset * 0.8, -0.588, -1.8),
        new THREE.Vector3(-0.66 + offset * 0.6, -0.588, 0.1),
        new THREE.Vector3(-0.70 + offset * 0.3, -0.588, 0.72),
        new THREE.Vector3(-0.72, -0.61, 0.8), // Enters inlet throat
      ];
      lines.push(new THREE.CatmullRomCurve3(pts));
    }
    return lines;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Subtle breathing opacity on hydraulic lines
    if (waterFlowRef.current) {
      waterFlowRef.current.children.forEach((child, i) => {
        const line = child as THREE.Line;
        const mat = line.material as THREE.LineBasicMaterial;
        if (mat) {
          mat.opacity = 0.22 + Math.sin(t * 1.5 + i) * 0.08;
        }
      });
    }

    // Controlled, illustrative flow translation into inlet
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, idx) => {
        const item = debrisData[idx];
        if (!item) return;

        const cycle = ((t * 0.38) + item.flowDelay) % 6; // 6-second educational cycle
        const mesh = child as THREE.Group;

        // Illustrative wash-off mobilization phase
        if (cycle > 2.2 && cycle < 5.2) {
          const progress = (cycle - 2.2) / 3.0;
          const targetZ = item.initialPos[2] + (0.8 - item.initialPos[2]) * Math.min(progress * 1.15, 1);
          mesh.position.z = targetZ;
          mesh.position.x = item.initialPos[0] + (-0.69 - item.initialPos[0]) * progress;
          mesh.rotation.y = item.rotation[1] + t * 0.5;
          mesh.scale.setScalar(item.scale * (1 - Math.max(0, (progress - 0.9) * 10)));
        } else {
          mesh.position.set(item.initialPos[0], item.initialPos[1], item.initialPos[2]);
          mesh.scale.setScalar(item.scale);
        }
      });
    }
  });

  return (
    <group>
      {/* Restrained Gutter Runoff Water Film */}
      <mesh position={[-0.64, -0.584, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.26, 6.0]} />
        <meshStandardMaterial
          color={palette.waterFilm}
          transparent
          opacity={0.28}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Hydraulic Flow Vector Streamlines */}
      <group ref={waterFlowRef}>
        {streamlines.map((curve, idx) => {
          const geom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
          return (
            <primitive
              key={idx}
              object={
                new THREE.Line(
                  geom,
                  new THREE.LineBasicMaterial({
                    color: palette.waterFlowLine,
                    transparent: true,
                    opacity: 0.25,
                    linewidth: 1,
                  })
                )
              }
            />
          );
        })}
      </group>

      {/* Realistic Plastic Debris Geometries */}
      <group ref={particlesRef}>
        {debrisData.map((d) => (
          <group key={d.id} position={d.initialPos} rotation={d.rotation} scale={d.scale}>
            {d.type === 'bottle' ? (
              <group castShadow>
                {/* Bottle body */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.3, 0.35, 1.1, 8]} />
                  <meshStandardMaterial color={d.color} roughness={0.3} transparent opacity={0.85} />
                </mesh>
                {/* Bottle cap */}
                <mesh position={[0, 0.68, 0]}>
                  <cylinderGeometry args={[0.14, 0.18, 0.25, 8]} />
                  <meshStandardMaterial color={palette.terracottaRisk} roughness={0.4} />
                </mesh>
              </group>
            ) : d.type === 'bag' ? (
              /* Folded thin pouch / film */
              <mesh castShadow>
                <dodecahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color={d.color} roughness={0.65} />
              </mesh>
            ) : d.type === 'cup' ? (
              /* Tapered cup */
              <mesh castShadow>
                <cylinderGeometry args={[0.4, 0.28, 0.65, 8]} />
                <meshStandardMaterial color={d.color} roughness={0.5} />
              </mesh>
            ) : (
              /* Crisp food wrapper piece */
              <mesh castShadow>
                <boxGeometry args={[0.65, 0.08, 0.4]} />
                <meshStandardMaterial color={d.color} roughness={0.6} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}

// ── Master Scene Assembly ──
function MasterCatchmentScene({ palette }: { palette: ScenePalette }) {
  const rootGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rootGroupRef.current) return;
    // Organic gentle oscillation within 1.5 degrees
    const t = state.clock.elapsedTime;
    rootGroupRef.current.rotation.y = -0.12 + Math.sin(t * 0.07) * 0.03;
  });

  return (
    <group ref={rootGroupRef}>
      <UrbanInfrastructure palette={palette} />
      <ArchitecturalStreetWall palette={palette} />
      <StormwaterInletAssembly palette={palette} />
      <PlasticLitterAndRunoffFlow palette={palette} />
    </group>
  );
}

// ── Controlled 3/4 Architectural Camera & Restrained Orbit ──
export default function HeroScene() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [5.8, 4.6, 6.2], fov: 34, near: 0.1, far: 45 }}
        shadows
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isDark ? 1.15 : 1.05,
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* Soft Environmental Atmosphere Fog */}
        <color attach="background" args={[isDark ? '#111711' : '#EBE6DC']} />
        <fog attach="fog" args={[isDark ? '#111711' : '#EBE6DC', 10, 22]} />

        {/* Natural Sun / Moon & Street Lighting */}
        <ambientLight intensity={isDark ? 0.6 : 0.7} color={isDark ? '#2B3C2D' : '#F7F3EA'} />
        <directionalLight
          position={[6, 9, 4]}
          intensity={isDark ? 1.05 : 1.35}
          color={isDark ? '#D8CCA8' : '#FFFFFF'}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0003}
          shadow-camera-near={0.5}
          shadow-camera-far={22}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        {/* Sky Fill & Diffuse Ground Bounce */}
        <directionalLight position={[-4, 5, -3]} intensity={isDark ? 0.25 : 0.35} color={isDark ? '#1D2A20' : '#D7D2C4'} />
        <hemisphereLight args={[isDark ? '#273629' : '#F5F2EB', isDark ? '#111711' : '#D0CAC0', isDark ? 0.4 : 0.45]} />

        <MasterCatchmentScene palette={palette} />

        {/* Bounded OrbitControls: architectural angle inspection without disorienting */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.25}
          minPolarAngle={Math.PI / 4.2} // ~43 deg
          maxPolarAngle={Math.PI / 2.4} // ~75 deg
          minAzimuthAngle={-Math.PI / 3.5}
          maxAzimuthAngle={Math.PI / 4.5}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
