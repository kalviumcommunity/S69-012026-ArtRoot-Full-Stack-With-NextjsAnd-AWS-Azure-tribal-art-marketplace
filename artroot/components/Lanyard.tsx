'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment, Lightformer, Text, Image, RoundedBox } from '@react-three/drei';
import {
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody,
    useRopeJoint,
    useSphericalJoint
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

// Extend Three.js with MeshLine
extend({ MeshLineGeometry, MeshLineMaterial });

interface LanyardProps {
    position?: [number, number, number];
    gravity?: [number, number, number];
    fov?: number;
    transparent?: boolean;
    imageUrl?: string;
    name?: string;
    subtext?: string;
}

export default function Lanyard({
    position = [0, 0, 30],
    gravity = [0, -40, 0],
    fov = 20,
    transparent = true,
    imageUrl,
    name = 'Artist',
    subtext = 'Master'
}: LanyardProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative z-0 w-full h-full min-h-[500px] flex justify-center items-center pointer-events-none">
            <Canvas
                className="pointer-events-auto"
                camera={{ position, fov }}
                gl={{ alpha: transparent, antialias: true }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={Math.PI * 0.5} />
                <Physics gravity={gravity} timeStep={1 / 60}>
                    <Band isMobile={isMobile} imageUrl={imageUrl} name={name} subtext={subtext} />
                </Physics>
                <Environment blur={0.75}>
                    <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                    <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                    <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                    <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
                </Environment>
            </Canvas>
        </div>
    );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, imageUrl, name, subtext }: { maxSpeed?: number, minSpeed?: number, isMobile?: boolean, imageUrl?: string, name: string, subtext: string }) {
    const band = useRef<any>(null);
    const fixed = useRef<any>(null);
    const j1 = useRef<any>(null);
    const j2 = useRef<any>(null);
    const j3 = useRef<any>(null);
    const card = useRef<any>(null);
    const vec = new THREE.Vector3();
    const ang = new THREE.Vector3();
    const rot = new THREE.Vector3();
    const dir = new THREE.Vector3();

    const { width, height } = useThree((state) => state.size);
    const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
    const [dragged, drag] = useState<THREE.Vector3 | false>(false);
    const [hovered, hover] = useState(false);

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
    useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

    useEffect(() => {
        if (hovered) {
            document.body.style.cursor = dragged ? 'grabbing' : 'grab';
            return () => { document.body.style.cursor = 'auto'; };
        }
    }, [hovered, dragged]);

    useFrame((state, delta) => {
        if (dragged) {
            vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
            dir.copy(vec).sub(state.camera.position).normalize();
            vec.add(dir.multiplyScalar(state.camera.position.length()));
            [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
            card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
        }
        if (fixed.current) {
            [j1, j2].forEach((ref) => {
                if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
                const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
                ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
            });

            // Catmull curve calculation
            curve.points[0].copy(j3.current.translation());
            curve.points[1].copy(j2.current.lerped);
            curve.points[2].copy(j1.current.lerped);
            curve.points[3].copy(fixed.current.translation());
            band.current.geometry.setPoints(curve.getPoints(32));

            // Physics drift correction
            ang.copy(card.current.angvel());
            rot.copy(card.current.rotation());
            card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
        }
    });

    const segmentProps: any = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 };
    curve.curveType = 'chordal';

    return (
        <>
            <group position={[0, 4, 0]}>
                <RigidBody ref={fixed} type="fixed" {...segmentProps} colliders={false} />
                <RigidBody position={[0.5, 0, 0]} ref={j1} type="dynamic" {...segmentProps} colliders={false}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1, 0, 0]} ref={j2} type="dynamic" {...segmentProps} colliders={false}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={j3} type="dynamic" {...segmentProps} colliders={false}>
                    <BallCollider args={[0.1]} />
                </RigidBody>

                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    type={dragged ? 'kinematicPosition' : 'dynamic'}
                    {...segmentProps}
                    colliders={false}
                >
                    <CuboidCollider args={[0.8, 1.125, 0.01]} />
                    <group
                        scale={2.25}
                        position={[0, -1.2, -0.05]}
                        onPointerOver={() => hover(true)}
                        onPointerOut={() => hover(false)}
                        onPointerUp={(e: any) => {
                            (e.target as Element).releasePointerCapture(e.pointerId);
                            drag(false);
                        }}
                        onPointerDown={(e: any) => {
                            (e.target as Element).setPointerCapture(e.pointerId);
                            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
                        }}
                    >
                        {/* 1. The Card Body (white, rounded) */}
                        <RoundedBox args={[0.92, 1.35, 0.02]} radius={0.06} smoothness={8}>
                            <meshPhysicalMaterial
                                color="#ffffff"
                                clearcoat={0.8}
                                clearcoatRoughness={0.15}
                                roughness={0.2}
                                metalness={0.05}
                            />
                        </RoundedBox>

                        {/* 2. The Clip Mechanism (Metallic) */}
                        {/* Top Loop */}
                        <mesh position={[0, 0.69, 0]}>
                            <torusGeometry args={[0.06, 0.015, 16, 32]} />
                            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.3} />
                        </mesh>
                        {/* Clamp */}
                        <mesh position={[0, 0.63, 0.01]}>
                            <boxGeometry args={[0.2, 0.08, 0.04]} />
                            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0.63, -0.01]}>
                            <boxGeometry args={[0.2, 0.08, 0.04]} />
                            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.3} />
                        </mesh>

                        {/* 3. Card Content */}
                        <group position={[0, 0, 0.011]}>
                            {/* Profile Image - Large and central */}
                            {imageUrl && (
                                <Image
                                    url={imageUrl}
                                    scale={[0.65, 0.65]}
                                    position={[0, 0.22, 0]}
                                />
                            )}

                            {/* Artist Name */}
                            <Text
                                position={[0, -0.28, 0]}
                                fontSize={0.075}
                                color="#1a1a1a"
                                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                                anchorX="center"
                                anchorY="middle"
                                fontWeight="extra-bold"
                                maxWidth={0.85}
                            >
                                {name}
                            </Text>

                            {/* Tribe / Title */}
                            <Text
                                position={[0, -0.38, 0]}
                                fontSize={0.045}
                                color="#D2691E"
                                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                                anchorX="center"
                                anchorY="middle"
                                maxWidth={0.85}
                                letterSpacing={0.1}
                            >
                                {subtext.toUpperCase()}
                            </Text>

                            {/* QR Code / Decor */}
                            <mesh position={[0.3, -0.55, 0]}>
                                <planeGeometry args={[0.15, 0.15]} />
                                <meshBasicMaterial color="#000000" />
                            </mesh>
                            <Text
                                position={[0.28, -0.55, 0.001]}
                                fontSize={0.02}
                                color="white"
                                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                            >
                                SCAN
                            </Text>
                        </group>

                    </group>
                </RigidBody>
            </group>

            {/* 4. The Strap (Black MeshLine) */}
            <mesh ref={band}>
                {/* @ts-ignore */}
                <meshLineGeometry />
                {/* @ts-ignore */}
                <meshLineMaterial
                    color="#1a1a1a"
                    depthTest={false}
                    resolution={[width * 2, height * 2]}
                    lineWidth={20}
                    opacity={1}
                />
            </mesh>
        </>
    );
}
