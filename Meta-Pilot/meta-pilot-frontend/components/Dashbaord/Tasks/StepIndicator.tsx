import { cn } from "@/lib/utils";

// Step indicators
interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex items-center justify-center gap-2 my-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index < currentStep
                            ? "w-8 bg-blue-600 dark:bg-blue-500"
                            : index === currentStep
                                ? "w-6 bg-blue-600 dark:bg-blue-500"
                                : "w-4 bg-slate-200 dark:bg-slate-700"
                    )}
                />
            ))}
        </div>
    );
};