import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'Cart' },
  { number: 2, label: 'Shipping' },
  { number: 3, label: 'Payment' }
];

const ProgressStepper = ({ currentStep }: ProgressStepperProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                ${step.number < currentStep
                  ? 'bg-green-500 text-white'
                  : step.number === currentStep
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`
                h-0.5 w-12 
                ${step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressStepper;