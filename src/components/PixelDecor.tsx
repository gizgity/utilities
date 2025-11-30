import React from 'react';

interface PixelDecorProps {
    variant?: 'corner' | 'divider' | 'dot-pattern';
    className?: string;
}

export const PixelDecor: React.FC<PixelDecorProps> = ({
    variant = 'corner',
    className = ''
}) => {
    if (variant === 'corner') {
        return (
            <div className={`inline-block ${className}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="0" y="0" width="4" height="4" />
                    <rect x="4" y="4" width="4" height="4" />
                    <rect x="8" y="8" width="4" height="4" />
                    <rect x="12" y="12" width="4" height="4" />
                </svg>
            </div>
        );
    }

    if (variant === 'divider') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="w-2 h-2 bg-current"></div>
                <div className="w-2 h-2 bg-current"></div>
                <div className="w-2 h-2 bg-current"></div>
            </div>
        );
    }

    if (variant === 'dot-pattern') {
        return (
            <div className={`grid grid-cols-4 gap-1 ${className}`}>
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-current"></div>
                ))}
            </div>
        );
    }

    return null;
};

interface PixelHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const PixelHeader: React.FC<PixelHeaderProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <PixelDecor variant="corner" className="text-primary" />
            <h1 className="text-2xl font-head uppercase tracking-wider">{children}</h1>
            <PixelDecor variant="corner" className="text-primary rotate-90" />
        </div>
    );
};
