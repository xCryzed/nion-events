import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode | React.ComponentType;
  isValid?: boolean;
}

interface PersonalDataStepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  isNextDisabled?: boolean;
  isCompleting?: boolean;
}

export const PersonalDataStepper: React.FC<PersonalDataStepperProps> = ({
                                                                          steps,
                                                                          currentStep,
                                                                          onStepChange,
                                                                          onNext,
                                                                          onPrevious,
                                                                          onComplete,
                                                                          isNextDisabled = false,
                                                                          isCompleting = false,
                                                                        }) => {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Schritt {currentStep + 1} von {steps.length}</span>
          <span>{Math.round(progress)}% abgeschlossen</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigator */}
      <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepChange(index)}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
              index < currentStep
                ? "bg-primary border-primary text-primary-foreground"
                : index === currentStep
                  ? "border-primary text-primary bg-primary/10"
                  : "border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50"
            )}
          >
            {index < currentStep ? (
              <Check className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </button>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]?.title}</CardTitle>
          <CardDescription>{steps[currentStep]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const Comp = steps[currentStep]?.component as any;
            return typeof Comp === 'function' ? <Comp /> : Comp;
          })()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          type="button"
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Zurück
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={onComplete}
            disabled={isNextDisabled || isCompleting}
            className="flex items-center gap-2"
          >
            {isCompleting ? 'Speichere...' : 'Abschließen'}
            <Check className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className="flex items-center gap-2"
          >
            Weiter
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};