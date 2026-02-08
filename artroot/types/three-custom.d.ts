export { };

declare module '*.glb' {
    const content: string;
    export default content;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module 'meshline' {
    import { BufferGeometry, Material, ShaderMaterial, Vector3, Color } from 'three';

    export class MeshLineGeometry extends BufferGeometry {
        constructor();
        setPoints(points: Vector3[] | Float32Array): void;
    }

    export class MeshLineMaterial extends ShaderMaterial {
        constructor(parameters?: {
            useMap?: boolean;
            map?: any;
            color?: Color | string | number;
            opacity?: number;
            resolution?: [number, number]; // Vector2
            sizeAttenuation?: boolean;
            lineWidth?: number;
            near?: number;
            far?: number;
            depthWrite?: boolean;
            depthTest?: boolean;
            alphaTest?: number;
            transparent?: boolean;
            side?: number;
            [key: string]: any;
        });
    }
}
