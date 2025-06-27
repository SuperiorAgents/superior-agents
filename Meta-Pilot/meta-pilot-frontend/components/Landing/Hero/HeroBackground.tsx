"use client";

import React from "react";

const HeroBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Abstract blockchain/circuit connections */}
            <div className="absolute inset-0">
                <svg width="100%" height="100%" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        {/* Glowing effect for nodes */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>

                        {/* Tech-style gradients */}
                        <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.4" />
                        </linearGradient>

                        <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#DB2777" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>

                    {/* Main decorative feature - circular data structure */}
                    <g opacity="0.15">
                        {/* Outer circle */}
                        <circle cx="250" cy="400" r="220" fill="none" stroke="#3B82F6" strokeWidth="0.5" />

                        {/* Inner circles */}
                        <circle cx="250" cy="400" r="160" fill="none" stroke="#4F46E5" strokeWidth="0.5" />
                        <circle cx="250" cy="400" r="100" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                        <circle cx="250" cy="400" r="50" fill="none" stroke="#4F46E5" strokeWidth="0.5" />

                        {/* Intersecting lines through circles */}
                        <line x1="30" y1="400" x2="470" y2="400" stroke="#3B82F6" strokeWidth="0.5" />
                        <line x1="250" y1="180" x2="250" y2="620" stroke="#3B82F6" strokeWidth="0.5" />
                        <line x1="80" y1="230" x2="420" y2="570" stroke="#3B82F6" strokeWidth="0.5" />
                        <line x1="80" y1="570" x2="420" y2="230" stroke="#3B82F6" strokeWidth="0.5" />
                    </g>

                    {/* Right side decorative blockchain structure */}
                    <g opacity="0.15" transform="translate(1150, 400)">
                        <polygon points="0,0 65,-35 130,0 130,65 65,100 0,65" fill="none" stroke="#4F46E5" strokeWidth="0.5" />
                        <polygon points="0,0 -65,-35 -130,0 -130,65 -65,100 0,65" fill="none" stroke="#4F46E5" strokeWidth="0.5" />
                        <polygon points="0,0 0,-65 65,-100 130,-65 130,0 65,-35" fill="none" stroke="#4F46E5" strokeWidth="0.5" />
                        <polygon points="0,0 0,-65 -65,-100 -130,-65 -130,0 -65,-35" fill="none" stroke="#4F46E5" strokeWidth="0.5" />
                        <polygon points="0,65 0,130 65,165 130,130 130,65 65,100" fill="none" stroke="#4F46E5" strokeWidth="0.5" />
                        <polygon points="0,65 0,130 -65,165 -130,130 -130,65 -65,100" fill="none" stroke="#4F46E5" strokeWidth="0.5" />
                    </g>

                    {/* Orange/Pink elements - secondary brand elements */}
                    <g opacity="0.15" transform="translate(700, 200)">
                        <circle cx="0" cy="0" r="80" fill="none" stroke="#F97316" strokeWidth="0.5" />
                        <circle cx="0" cy="0" r="40" fill="none" stroke="#F97316" strokeWidth="0.5" />
                    </g>

                    <g opacity="0.15" transform="translate(900, 600)">
                        <circle cx="0" cy="0" r="60" fill="none" stroke="#DB2777" strokeWidth="0.5" />
                        <circle cx="0" cy="0" r="30" fill="none" stroke="#DB2777" strokeWidth="0.5" />
                    </g>

                    {/* Data connection lines */}
                    <g opacity="0.2">
                        {/* Connection from left circle structure to center */}
                        <path
                            d="M 450,400 C 550,420 650,380 750,400"
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="1"
                            strokeDasharray="1,12"
                        />

                        {/* Connection from right hex structure to center */}
                        <path
                            d="M 1030,400 C 930,420 830,380 750,400"
                            fill="none"
                            stroke="#4F46E5"
                            strokeWidth="1"
                            strokeDasharray="1,12"
                        />

                        {/* Orange/pink connections */}
                        <path
                            d="M 700,280 C 720,320 735,350 750,400"
                            fill="none"
                            stroke="#F97316"
                            strokeWidth="1"
                            strokeDasharray="1,12"
                            opacity="0.2"
                        />

                        <path
                            d="M 900,540 C 850,500 800,450 750,400"
                            fill="none"
                            stroke="#DB2777"
                            strokeWidth="1"
                            strokeDasharray="1,12"
                            opacity="0.2"
                        />
                    </g>

                    {/* Data nodes with glow */}
                    <g filter="url(#glow)">
                        {/* Distributed data nodes - Left structure */}
                        <circle cx="250" cy="400" r="3" fill="#3B82F6" />
                        <circle cx="350" cy="400" r="2" fill="#3B82F6" />
                        <circle cx="250" cy="300" r="2" fill="#3B82F6" />
                        <circle cx="250" cy="500" r="2" fill="#3B82F6" />
                        <circle cx="150" cy="400" r="2" fill="#3B82F6" />
                        <circle cx="320" cy="330" r="2" fill="#3B82F6" />
                        <circle cx="320" cy="470" r="2" fill="#3B82F6" />
                        <circle cx="180" cy="330" r="2" fill="#3B82F6" />
                        <circle cx="180" cy="470" r="2" fill="#3B82F6" />

                        {/* Nodes along connection paths */}
                        <circle cx="450" cy="400" r="3" fill="#3B82F6" />
                        <circle cx="550" cy="410" r="2" fill="#3B82F6" />
                        <circle cx="650" cy="390" r="2" fill="#3B82F6" />
                        <circle cx="750" cy="400" r="4" fill="#6366F1" />
                        <circle cx="850" cy="390" r="2" fill="#4F46E5" />
                        <circle cx="950" cy="410" r="2" fill="#4F46E5" />
                        <circle cx="1030" cy="400" r="3" fill="#4F46E5" />

                        {/* Blockchain structure nodes - Right */}
                        <circle cx="1150" cy="400" r="3" fill="#4F46E5" />
                        <circle cx="1150" cy="340" r="2" fill="#4F46E5" />
                        <circle cx="1150" cy="460" r="2" fill="#4F46E5" />
                        <circle cx="1210" cy="370" r="2" fill="#4F46E5" />
                        <circle cx="1210" cy="430" r="2" fill="#4F46E5" />
                        <circle cx="1090" cy="370" r="2" fill="#4F46E5" />
                        <circle cx="1090" cy="430" r="2" fill="#4F46E5" />

                        {/* Orange/Pink nodes */}
                        <circle cx="700" cy="200" r="3" fill="#F97316" />
                        <circle cx="700" cy="280" r="2" fill="#F97316" />
                        <circle cx="900" cy="600" r="3" fill="#DB2777" />
                        <circle cx="900" cy="540" r="2" fill="#DB2777" />
                    </g>

                    {/* Animated pulse rings (visual only, animation in CSS) */}
                    <circle cx="750" cy="400" r="25" fill="none" stroke="#6366F1" strokeWidth="0.5" className="pulse-ring" />
                    <circle cx="750" cy="400" r="45" fill="none" stroke="#6366F1" strokeWidth="0.3" className="pulse-ring delay-;delay-1" />
                    <circle cx="750" cy="400" r="65" fill="none" stroke="#6366F1" strokeWidth="0.2" className="pulse-ring delay-2" />

                    {/* Orange/Pink pulse rings */}
                    <circle cx="700" cy="200" r="15" fill="none" stroke="#F97316" strokeWidth="0.3" className="pulse-ring delay-3" />
                    <circle cx="900" cy="600" r="15" fill="none" stroke="#DB2777" strokeWidth="0.3" className="pulse-ring delay-4" />
                </svg>
            </div>

            {/* Bottom technology wave */}
            <div className="absolute bottom-0 left-0 right-0 h-64 opacity-15">
                <svg width="100%" height="100%" viewBox="0 0 1440 200" preserveAspectRatio="none">
                    <path
                        d="M0,100 C240,160 480,180 720,130 C960,80 1200,140 1440,160 L1440,200 L0,200 Z"
                        fill="url(#techGradient)"
                    />

                    {/* Secondary wave with orange/pink gradient */}
                    <path
                        d="M0,140 C320,110 640,150 960,120 C1120,105 1280,125 1440,140 L1440,200 L0,200 Z"
                        fill="url(#secondaryGradient)"
                        opacity="0.5"
                    />

                    {/* Data dots along wave */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <circle
                            key={`wave-dot-${i}`}
                            cx={50 + (i * 70)}
                            cy={130 + (Math.sin(i * 0.5) * 25)}
                            r={1 + (i % 3) * 0.5}
                            fill="#FFF"
                            opacity={0.5 + (i % 5) * 0.1}
                        />
                    ))}
                </svg>
            </div>

            {/* CSS for animated elements */}
            <style jsx>{`
                .pulse-ring {
                    animation: pulse 4s infinite;
                    transform-origin: center;
                    opacity: 0.3;
                }
                
                .delay-1 {
                    animation-delay: 1s;
                }
                
                .delay-2 {
                    animation-delay: 2s;
                }
                
                .delay-3 {
                    animation-delay: 0.5s;
                }
                
                .delay-4 {
                    animation-delay: 1.5s;
                }
                
                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.3; }
                    50% { transform: scale(1.2); opacity: 0.1; }
                    100% { transform: scale(0.8); opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default HeroBackground;


