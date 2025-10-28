"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Button } from "@/components/ui/lovable/button";
import { Badge } from "@/components/ui/lovable/badge";
import { Progress } from "@/components/ui/lovable/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/lovable/dialog";
import { Check, ChevronRight, ChevronLeft, X, Sparkles, Target, Zap, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function OnboardingTutorials() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const totalSteps = 4;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Welcome to Your Dashboard!
              </CardTitle>
              <CardDescription className="text-base">
                Let's get you started with a quick tour of the key features
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={33} className="h-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">1 of 3 steps completed</span>
            <Button onClick={() => setShowTutorial(true)}>
              Start Tour
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Checklist</CardTitle>
          <CardDescription>Complete these steps to get the most out of your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: "Complete your profile", done: true, points: 10 },
              { title: "Connect your first integration", done: true, points: 20 },
              { title: "Invite team members", done: false, points: 15 },
              { title: "Create your first project", done: false, points: 25 },
              { title: "Set up notifications", done: false, points: 10 }
            ].map((task, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    task.done ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}>
                    {task.done && <Check className="h-4 w-4 text-primary-foreground" />}
                  </div>
                  <div>
                    <p className={`font-medium ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {!task.done && (
                      <p className="text-sm text-muted-foreground">Earn {task.points} points</p>
                    )}
                  </div>
                </div>
                {!task.done && (
                  <Button size="sm" variant="ghost">
                    Start
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Progress: 40%</p>
                <p className="text-sm text-muted-foreground">45 points earned</p>
              </div>
              <Badge variant="secondary" className="text-sm">2/5 Complete</Badge>
            </div>
            <Progress value={40} className="mt-3 h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Target,
            title: "Set Goals",
            description: "Define and track your objectives",
            color: "text-blue-500"
          },
          {
            icon: Zap,
            title: "Automate Tasks",
            description: "Save time with smart automation",
            color: "text-yellow-500"
          },
          {
            icon: Sparkles,
            title: "AI Assistant",
            description: "Get help from our AI copilot",
            color: "text-purple-500"
          }
        ].map((feature, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <feature.icon className={`h-10 w-10 ${feature.color} mb-2`} />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="p-0">
                Learn more
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Product Tour</DialogTitle>
            <DialogDescription>
              Step {currentStep + 1} of {totalSteps}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Tutorial content */}
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {['Welcome!', 'Dashboard Overview', 'Quick Actions', 'You\'re All Set!'][currentStep]}
                </h3>
                <p className="text-muted-foreground">
                  {[
                    'Let us show you around and help you get started',
                    'This is your main dashboard where you can see all your activity',
                    'Use the sidebar to navigate between different sections',
                    'You\'re ready to go! Start exploring the platform'
                  ][currentStep]}
                </p>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowTutorial(false)}
              >
                Skip tour
              </Button>
              {currentStep < totalSteps - 1 ? (
                <Button onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setShowTutorial(false)}>
                  Finish
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tooltip/Hint Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary">Tip</Badge>
              Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + K</kbd> to open command palette
            </p>
            <Button variant="outline" size="sm">View all shortcuts</Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary">Help</Badge>
              Need Assistance?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team is here to help you 24/7
            </p>
            <Button variant="outline" size="sm">Contact Support</Button>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Notes */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-sm">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-muted-foreground">
          <p>• Use localStorage to track completion of onboarding steps</p>
          <p>• Consider using libraries like react-joyride for interactive tours</p>
          <p>• Track onboarding completion analytics to improve flow</p>
          <p>• Allow users to restart or skip onboarding from settings</p>
          <p>• Use tooltips (from tooltip.tsx) for contextual hints</p>
        </CardContent>
      </Card>
    </div>
  );
}
