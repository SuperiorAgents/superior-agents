import React from 'react';
import { WalletConnectionDemo } from './demos/WalletConnectionDemo';
import { TaskCreationDemo } from './demos/TaskCreationDemo';
import { AIMonitoringDemo } from './demos/AIMonitoringDemo';
import { ExecutionDemo } from './demos/ExecutionDemo';
import { AnalyticsDemo } from './demos/AnalyticsDemo';

interface StepDemoProps {
    activeStep: number;
}

export const StepDemo: React.FC<StepDemoProps> = ({ activeStep }) => {
    // Render the appropriate demo component based on the active step
    return (
        <>
            {activeStep === 0 && <WalletConnectionDemo />}
            {activeStep === 1 && <TaskCreationDemo />}
            {activeStep === 2 && <AIMonitoringDemo />}
            {activeStep === 3 && <ExecutionDemo />}
            {activeStep === 4 && <AnalyticsDemo />}
        </>
    );
};