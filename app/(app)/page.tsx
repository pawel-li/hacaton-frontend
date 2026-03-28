"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Circle, CheckCircle2, Copy, Check, PlayCircle, BookOpen, Terminal, Download, MessageSquare } from "lucide-react"

export default function Page() {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    { 
      id: 1, 
      title: 'Create API Key', 
      description: 'Generate an API key to authenticate your requests. This key is used for all API calls.', 
      actionLabel: 'Create API Key', 
      action: () => alert('Navigate to Settings (Mock)') 
    },
    { 
      id: 2, 
      title: 'Install ruleWorker SDK', 
      description: 'Install the Python package to interact with the ruleWorker system from your environment.', 
      snippet: 'pip install ruleworker-sdk',
      actionLabel: 'Download Jupyter Notebook', 
      action: () => alert('Downloading Jupyter Notebook... (Mock)'),
      actionIcon: <Download className="w-4 h-4 mr-2" />
    },
    { 
      id: 3, 
      title: 'Create Your First Project', 
      description: 'Define an area of interest (city or tile), choose an alert threshold, and provide a webhook URL.', 
      actionLabel: 'New Project', 
      action: () => alert('Navigate to /projects?new=true (Mock)') 
    },
    { 
      id: 4, 
      title: 'Train a Rule Model', 
      description: 'Trigger the training pipeline to learn RIPPER rules from historical data.', 
      actionLabel: 'Start Training', 
      action: () => alert('Training job started (Mock)') 
    },
    { 
      id: 5, 
      title: 'Set Up Monitoring & Alerts', 
      description: 'Enable continuous monitoring and receive webhook alerts when rules are satisfied.', 
      actionLabel: 'Enable Monitoring', 
      action: () => alert('Monitoring enabled (Mock)') 
    },
    { 
      id: 6, 
      title: 'Explore the Dashboard', 
      description: 'View your projects, inspect rules, and see alert history.', 
      actionLabel: 'Go to Dashboard', 
      action: () => alert('Navigate to /projects (Mock)'),
      variant: 'secondary' as const
    },
  ];

  return (
    <div className="flex min-h-svh w-full flex-col p-6 lg:p-10 items-center">
      <div className="flex w-full max-w-4xl flex-col gap-12">
        
        {/* 1. Hero / Header */}
        <section className="flex flex-col gap-6 text-center md:text-left md:flex-row md:items-center md:justify-between bg-card text-card-foreground border rounded-xl p-8 shadow-sm">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">ruleWorker</h1>
              <h2 className="text-xl text-muted-foreground font-medium mt-1">Rule-Based Alerting for Hydrological Data</h2>
            </div>
            <p className="text-base leading-relaxed text-card-foreground/80">
              ruleWorker lets you generate robust datasets, train sophisticated RIPPER rules, and receive real-time alerts via webhooks. By leveraging Sentinel-2 and IMGW data, you can build monitoring solutions for any Polish city or geographical tile with ease.
            </p>
            <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
              <Button onClick={() => alert('Playing Demo... (Mock)')} className="gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* 2. Interactive Checklist */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold tracking-tight">Getting Started Checklist</h3>
            <p className="text-muted-foreground mt-1">Follow these steps to configure your workspace and launch your first model.</p>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <Card key={step.id} className="relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted" />
                <div className="flex flex-col md:flex-row gap-6 p-6 items-start md:items-center">
                  <div className="flex-shrink-0 mt-1 md:mt-0 text-muted-foreground">
                    <Circle className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-lg font-semibold leading-none">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    
                    {step.snippet && (
                      <div className="mt-2 flex items-center justify-between bg-muted/50 rounded-md p-3 font-mono text-sm border">
                        <span className="select-all">{step.snippet}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleCopy(step.snippet!)}
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    <Button 
                      variant={step.variant || 'default'} 
                      onClick={step.action}
                      className="w-full md:w-auto"
                    >
                      {step.actionIcon}
                      {step.actionLabel}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. Additional Resources */}
        <section className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold tracking-tight">Additional Resources</h3>
            <p className="text-muted-foreground mt-1">Explore our documentation and community resources to get the most out of ruleWorker.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => alert('Navigate to Docs (Mock)')}>
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Documentation</CardTitle>
                  <CardDescription>Comprehensive guides and tutorials</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => alert('Navigate to API Reference (Mock)')}>
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">API Reference</CardTitle>
                  <CardDescription>Detailed endpoint specifications</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => alert('Download Sample Notebook (Mock)')}>
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Sample Jupyter Notebook</CardTitle>
                  <CardDescription>Interactive examples for training</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => alert('Navigate to Community Support (Mock)')}>
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Community & Support</CardTitle>
                  <CardDescription>Join the discussion on GitHub</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </section>

      </div>
    </div>
  )
}
