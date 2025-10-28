"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/lovable/card";
import { Button } from "@/components/ui/lovable/button";
import { useState } from "react";
import { ArrowRight, Bell, CheckCircle, Loader2, Star, Zap } from "lucide-react";

export default function AnimationTransitions() {
  const [showFade, setShowFade] = useState(false);
  const [showSlide, setShowSlide] = useState(false);
  const [showScale, setShowScale] = useState(false);
  const [showStagger, setShowStagger] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Animation & Transitions</h2>
        <p className="text-muted-foreground">
          Smooth animations and transitions to enhance user experience
        </p>
      </div>

      {/* Fade Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Fade Animations</CardTitle>
          <CardDescription>Smooth opacity transitions for revealing content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={() => setShowFade(!showFade)}>Toggle Fade</Button>
            {showFade && (
              <div className="animate-in fade-in duration-500">
                <Card className="w-64">
                  <CardHeader>
                    <CardTitle className="text-lg">Faded In</CardTitle>
                    <CardDescription>This card faded into view</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">animate-in fade-in duration-500</code>
          </div>
        </CardContent>
      </Card>

      {/* Slide Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Slide Animations</CardTitle>
          <CardDescription>Directional entrance and exit animations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={() => setShowSlide(!showSlide)}>Toggle Slide</Button>
            {showSlide && (
              <div className="flex gap-2">
                <div className="animate-in slide-in-from-left duration-500">
                  <Card className="w-48 bg-primary/10">
                    <CardHeader>
                      <CardTitle className="text-sm">From Left</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
                <div className="animate-in slide-in-from-right duration-500">
                  <Card className="w-48 bg-secondary/10">
                    <CardHeader>
                      <CardTitle className="text-sm">From Right</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">slide-in-from-left</code>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">slide-in-from-right</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scale Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Scale Animations</CardTitle>
          <CardDescription>Grow and shrink effects for emphasis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={() => setShowScale(!showScale)}>Toggle Scale</Button>
            {showScale && (
              <div className="animate-in zoom-in duration-500">
                <Card className="w-64 border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="fill-primary text-primary" />
                      Scaled In
                    </CardTitle>
                    <CardDescription>This card zoomed into view</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">animate-in zoom-in duration-500</code>
          </div>
        </CardContent>
      </Card>

      {/* Stagger Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Stagger Animations</CardTitle>
          <CardDescription>Sequential animations for lists and grids</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={() => setShowStagger(!showStagger)}>Toggle Stagger</Button>
          </div>
          
          {showStagger && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-in fade-in slide-in-from-bottom duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Item {i}</CardTitle>
                      <CardDescription>Staggered by {i * 100}ms</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">style=&#123;&#123; animationDelay: `$&#123;i * 100&#125;ms` &#125;&#125;</code>
          </div>
        </CardContent>
      </Card>

      {/* Hover Effects */}
      <Card>
        <CardHeader>
          <CardTitle>Hover Effects</CardTitle>
          <CardDescription>Interactive animations triggered by user hover</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="transition-transform hover:scale-110 duration-200">
              Scale Up
            </Button>
            <Button className="transition-all hover:-translate-y-1 hover:shadow-lg duration-200">
              Lift Up
            </Button>
            <Button className="transition-all hover:gap-4 duration-200">
              Expand <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">hover:scale-110</code>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">hover:-translate-y-1</code>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">hover:gap-4</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Animations</CardTitle>
          <CardDescription>Spinners and pulse effects for loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-8 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-primary" />
              <span className="text-sm">Spinner</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse" />
              <span className="text-sm">Pulse</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-2 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-sm">Bars</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">animate-spin</code>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">animate-pulse</code>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">animationDelay</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micro-interactions */}
      <Card>
        <CardHeader>
          <CardTitle>Micro-interactions</CardTitle>
          <CardDescription>Small animations that provide feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button 
              variant="outline" 
              className="group"
            >
              <Bell className="transition-transform group-hover:rotate-12 duration-200" />
              Notification
            </Button>
            
            <Button 
              variant="outline"
              className="group"
            >
              <CheckCircle className="transition-all group-hover:scale-125 group-hover:text-success duration-200" />
              Confirm
            </Button>

            <Button 
              variant="outline"
              className="group"
            >
              <Zap className="transition-all group-hover:text-warning group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] duration-200" />
              Action
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm">group-hover:rotate-12, group-hover:scale-125, group-hover:drop-shadow</code>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Keep animations between 200-500ms for most interactions</li>
            <li>• Use ease-in-out for natural feeling transitions</li>
            <li>• Avoid animating too many elements simultaneously</li>
            <li>• Respect prefers-reduced-motion for accessibility</li>
            <li>• Use transforms (translate, scale, rotate) over position changes</li>
            <li>• Test animations on slower devices</li>
            <li>• Stagger list animations for better visual hierarchy</li>
            <li>• Use loading animations for operations taking longer than 1 second</li>
          </ul>
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Tailwind Animate Plugin</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Most animations use the tailwindcss-animate plugin which provides utility classes:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• animate-in / animate-out - Base animation classes</li>
              <li>• fade-in / fade-out - Opacity transitions</li>
              <li>• slide-in-from-[direction] - Directional slides</li>
              <li>• zoom-in / zoom-out - Scale transitions</li>
              <li>• spin - Continuous rotation</li>
              <li>• pulse - Opacity pulsing</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Custom Animations</h4>
            <p className="text-sm text-muted-foreground">
              For custom animations, extend your tailwind.config.ts with keyframes and animation definitions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
