import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import grassVertexShader from "../shaders/vertex.glsl";
import grassFragmentShader from "../shaders/fragment.glsl";

export const InstancedGrass = () => {

  const instanceRef = useRef();
  const { clock } = useThree();
  const COUNT = 4000;
  const GRASSWIDTH = 10;
  const GRASSLENGTH = 10;
    const halfWidth = 0.06;

  // Grass blade geometry
  const geometry = useMemo(() => {
    const segments = 7;
    const height = 1;

    const taper = 0.005;
    const positions = [];

    for (let i = 0; i < segments - 1; i++) {
      const y0 = (i / segments) * height;
      const y1 = ((i + 1) / segments) * height;

      positions.push(
        -halfWidth + taper * i, y0, 0,  // bottom left
        halfWidth - taper * i, y0, 0, // bottom right
        -halfWidth + taper * (i + 1), y1, 0, // top left

        -halfWidth + taper * (i + 1), y1, 0, // top left
        halfWidth - taper * i, y0, 0, // bottom right
        halfWidth - taper * (i + 1), y1, 0 // top right
      );
    }

    // top traingle
    positions.push(
      -halfWidth + taper * (segments - 1), ((segments - 1) / segments) * height, 0,
      halfWidth - taper * (segments - 1), ((segments - 1) / segments) * height, 0,
      0, height, 0
    );

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    // create normals
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Grass blade material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: grassVertexShader,
      fragmentShader: grassFragmentShader,
      uniforms: {
        uFrequency: { value: new THREE.Vector2(5, 5) },
        uTime: { value: 0 },
        uSpeed: { value: 3 },
        uTipColor: { value: new THREE.Color('#f9ffa2') },
        uBaseColor: { value: new THREE.Color('#acb932') },
        uHalfWidth: { value: halfWidth },
      },
      side: THREE.DoubleSide,
    });
  }, []);

  // Animate uTime
  useFrame(() => {
  material.uniforms.uTime.value = clock.getElapsedTime();

});


  // 🌱 Setup the 10x10 grass blades after the instancedMesh is mounted
  useEffect(() => {
  if (!instanceRef.current) return;

  const dummy = new THREE.Object3D();
  let index = 0;

  for (let i = 0; i < COUNT; i++) {
    // Randomly position within -5 to +5 in x and z (centered around origin)
    const x = (2 * Math.random() - 1) * GRASSLENGTH/2;
    const z = (2 * Math.random() - 1) * GRASSWIDTH/2;
    dummy.position.set(x, 0, z);

    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.updateMatrix();

    instanceRef.current.setMatrixAt(index++, dummy.matrix);
  }

  instanceRef.current.instanceMatrix.needsUpdate = true;
}, []);

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const planeGeometry = new THREE.PlaneGeometry(1, 1);
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);



  return (
    <instancedMesh
      ref={instanceRef}
      args={[geometry, material, COUNT]}
      castShadow
      receiveShadow
    />
  );
};
