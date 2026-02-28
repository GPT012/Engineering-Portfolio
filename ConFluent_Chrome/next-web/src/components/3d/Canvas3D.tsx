/* eslint-disable react-hooks/purity */
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Particles() {
    const ref = useRef<THREE.Points>(null);

    // Generate 5000 random particles in a sphere
    const positions = useMemo(() => {
        const count = 5000;
        const array = new Float32Array(count * 3);
        // eslint-disable-next-line react-hooks/purity
        for (let i = 0; i < count; i++) {
            const radius = 10 * Math.random();
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            array[i * 3] = x;
            array[i * 3 + 1] = y;
            array[i * 3 + 2] = z;
        }
        return array;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#ffffff"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                />
            </Points>
        </group>
    );
}

export function Canvas3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8] }}>
                <Particles />
            </Canvas>
        </div>
    );
}
