'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

interface SmoothScrollProps {
    children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    return (
        <ReactLenis root options={{ lerp: 0.05, duration: 1.5, syncTouch: true }}>
            {children}
        </ReactLenis>
    );
}
