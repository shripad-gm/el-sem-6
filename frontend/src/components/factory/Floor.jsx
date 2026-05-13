import { MeshReflectorMaterial, Grid } from '@react-three/drei';

export const Floor = () => {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Main Grid */}
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        fadeStrength={5} 
        sectionSize={5} 
        cellSize={1} 
        sectionThickness={1.5}
        sectionColor="#00f2ff"
        cellColor="#333"
        cellThickness={0.5}
      />
      
      {/* Reflective Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
        />
      </mesh>

      {/* Decorative Lights */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.02} />
      </mesh>
    </group>
  );
};
