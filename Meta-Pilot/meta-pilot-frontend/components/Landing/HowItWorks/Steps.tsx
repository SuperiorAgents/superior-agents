import React from 'react';
import { Button } from "@/components/ui/button";
import { Step } from './HowItWorksSection';

interface StepsProps {
    steps: Step[];
    activeStep: number;
    handleStepClick: (index: number) => void;
}

export const Steps: React.FC<StepsProps> = ({
    steps,
    activeStep,
    handleStepClick
}) => {
    return (
        <div className="flex flex-col space-y-1">
            {steps.map((step, index) => (
                <Button
                    key={step.id}
                    variant="ghost"
                    className={`flex items-start p-3 h-auto rounded-md transition-all justify-start ${activeStep === index
                        ? 'bg-[#1F2937]/30 border-l-4 border-[#3B82F6]'
                        : 'hover:bg-[#1F2937]/20 border-l-4 border-transparent'
                        }`}
                    onClick={() => handleStepClick(index)}
                >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${activeStep === index
                        ? 'bg-[#3B82F6] text-white'
                        : 'bg-[#1F2937]/40 text-[#9CA3AF]'
                        }`}>
                        {step.icon}
                    </div>
                    <div className="ml-3 text-left flex-1 min-w-0">
                        <h3 className={`font-medium ${activeStep === index
                            ? 'text-white'
                            : 'text-[#9CA3AF]'
                            }`}>
                            {step.title}
                        </h3>
                        <p className="text-sm text-[#9CA3AF] mt-0.5 truncate overflow-hidden text-ellipsis w-full">
                            {step.description}
                        </p>
                    </div>
                    {/* <div className="ml-3 text-left">
                        <h3 className={`font-medium ${activeStep === index
                                ? 'text-white'
                                : 'text-[#9CA3AF]'
                            }`}>
                            {step.title}
                        </h3>
                        <p className="text-sm text-[#9CA3AF] mt-0.5 line-clamp-1">
                            {step.description}
                        </p>
                    </div> */}
                </Button>
            ))}
        </div>
    );
};