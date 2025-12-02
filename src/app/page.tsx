'use client';

import Link from 'next/link';
import { FileText, MessageSquare, Mic, Download } from 'lucide-react';

const utilities = [
  {
    title: 'Message Generator',
    description: 'Generate automated messages for students and parents',
    href: '/message-generator',
    icon: MessageSquare,
    color: 'bg-cyan',
    borderColor: 'border-cyan',
  },
  {
    title: 'Test Paper Formatter',
    description: 'Format test papers with consistent styling',
    href: '/test-paper-formatter',
    icon: FileText,
    color: 'bg-magenta',
    borderColor: 'border-magenta',
  },
  {
    title: 'Text-to-Speech',
    description: 'Convert text to natural-sounding speech',
    href: '/tts',
    icon: Mic,
    color: 'bg-lime',
    borderColor: 'border-lime',
  },
  {
    title: 'YouTube Downloader',
    description: 'Download YouTube videos for educational use',
    href: '/ytdt',
    icon: Download,
    color: 'bg-primary',
    borderColor: 'border-primary',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-12 md:mb-16">
        <div className="bg-card border-4 border-border p-6 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative pixel corners */}
          <div className="absolute top-0 left-0 w-4 h-4 bg-primary"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-cyan"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-magenta"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-lime"></div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl mb-4 text-center animate-pulse">
              TEACHER ASSISTANT
            </h1>
            <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
              Automated paperwork tools to save time and boost productivity
            </p>

            {/* Pixel art divider */}
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-cyan"></div>
              <div className="w-3 h-3 bg-magenta"></div>
              <div className="w-3 h-3 bg-lime"></div>
              <div className="w-3 h-3 bg-primary"></div>
              <div className="w-3 h-3 bg-cyan"></div>
              <div className="w-3 h-3 bg-magenta"></div>
              <div className="w-3 h-3 bg-lime"></div>
            </div>

            <div className="text-center">
              <p className="text-sm md:text-base uppercase tracking-wider">
                🎮 Select a utility below to get started 🎮
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Utilities Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl mb-8 text-center">AVAILABLE TOOLS</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {utilities.map((utility, index) => {
            const Icon = utility.icon;
            return (
              <Link
                key={utility.href}
                href={utility.href}
                className="group block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-full flex flex-col bg-card border-4 ${utility.borderColor} p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:translate-x-1 relative overflow-hidden`}>
                  {/* Animated background pattern */}
                  <div className={`absolute inset-0 ${utility.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                  {/* Icon */}
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${utility.color} border-4 border-border flex items-center justify-center mb-4 group-hover:animate-bounce`}>
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl mb-3 uppercase">
                    {utility.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {utility.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-auto flex items-center gap-2 text-sm uppercase font-head">
                    <span className="group-hover:translate-x-2 transition-transform duration-200">
                      Launch →
                    </span>
                  </div>

                  {/* Pixel corner accent */}
                  <div className={`absolute bottom-2 right-2 w-3 h-3 ${utility.color} opacity-50`}></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-16 text-center">
        <div className="bg-secondary border-4 border-border p-6 shadow-md">
          <p className="text-secondary-foreground text-sm uppercase tracking-wider">
            ⚡ Built with Next.js • Powered by AI ⚡
          </p>
        </div>
      </div>
    </div>
  );
}
