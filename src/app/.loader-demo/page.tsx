'use client';

import React from 'react';
import { Loader } from '@/components/ui/Loader';
import { PixelHeader } from '@/components/PixelDecor';

export default function LoaderDemo() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <PixelHeader className="mb-12 justify-center">
                    Loader Showcase
                </PixelHeader>

                {/* Spinner Variant */}
                <div className="space-y-4">
                    <h2 className="text-xl font-head uppercase tracking-wider">Pixel Spinner</h2>
                    <div className="p-8 bg-card border-3 border-black dark:border-foreground shadow-lg flex items-center justify-center">
                        <Loader variant="spinner" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Rotating pixel blocks with a pulsing center - perfect for general loading states
                    </p>
                </div>

                {/* Blocks Variant */}
                <div className="space-y-4">
                    <h2 className="text-xl font-head uppercase tracking-wider">Bouncing Blocks</h2>
                    <div className="p-8 bg-card border-3 border-black dark:border-foreground shadow-lg flex items-center justify-center">
                        <Loader variant="blocks" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Neo-brutal bouncing squares with vibrant colors and bold shadows
                    </p>
                </div>

                {/* Bar Variant */}
                <div className="space-y-4">
                    <h2 className="text-xl font-head uppercase tracking-wider">Loading Bar</h2>
                    <div className="p-8 bg-card border-3 border-black dark:border-foreground shadow-lg flex items-center justify-center">
                        <Loader variant="bar" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Retro progress bar with gradient animation and pixel overlay
                    </p>
                </div>

                {/* Pulse Variant */}
                <div className="space-y-4">
                    <h2 className="text-xl font-head uppercase tracking-wider">Pulsing Pixels</h2>
                    <div className="p-8 bg-card border-3 border-black dark:border-foreground shadow-lg flex items-center justify-center">
                        <Loader variant="pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Sequential pulsing squares in vibrant retro colors
                    </p>
                </div>

                {/* Glitch Variant */}
                <div className="space-y-4">
                    <h2 className="text-xl font-head uppercase tracking-wider">Glitch Effect</h2>
                    <div className="p-8 bg-card border-3 border-black dark:border-foreground shadow-lg flex items-center justify-center">
                        <Loader variant="glitch" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Glitchy text loader with chromatic aberration effect
                    </p>
                </div>

                {/* Usage Examples */}
                <div className="space-y-4 mt-16">
                    <h2 className="text-xl font-head uppercase tracking-wider">Usage</h2>
                    <div className="p-6 bg-muted border-3 border-black dark:border-foreground">
                        <pre className="text-xs overflow-x-auto">
                            <code>{`// Default spinner
<Loader />

// Bouncing blocks
<Loader variant="blocks" />

// Loading bar
<Loader variant="bar" />

// Pulsing pixels
<Loader variant="pulse" />

// Glitch effect
<Loader variant="glitch" />`}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
