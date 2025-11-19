'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Users, 
  Zap, 
  BarChart3, 
  Clock, 
  Shield,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Smart Task Manager</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[50%] top-0 ml-[-400px] h-[400px] w-[800px] rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-3xl" />
          <div className="absolute right-[10%] top-[20%] h-[300px] w-[600px] rounded-full bg-gradient-to-bl from-accent/20 via-accent/5 to-transparent blur-3xl" />
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Intelligent Task Management Platform</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-balance mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Manage Tasks Smarter,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Not Harder
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance mb-10 leading-relaxed">
            Transform your team's productivity with intelligent task distribution, real-time collaboration, 
            and powerful analytics. Built for modern teams who value efficiency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-lg hover:shadow-xl transition-shadow">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-lg hover:shadow-xl transition-shadow">
                    Start Free Today
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Free forever • Setup in 2 minutes
            </p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg bg-card border border-border/50">
            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
            <p className="text-sm text-muted-foreground">Tasks Managed</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border/50">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <p className="text-sm text-muted-foreground">Active Teams</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border/50">
            <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
            <p className="text-sm text-muted-foreground">Uptime SLA</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Why Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Everything You Need to
            <span className="text-primary"> Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your workflow and boost team productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Team Management</h3>
            <p className="text-muted-foreground leading-relaxed">
              Create and manage teams effortlessly. Assign members, track performance, and collaborate in real-time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Task Distribution</h3>
            <p className="text-muted-foreground leading-relaxed">
              AI-powered workload balancing automatically redistributes tasks for optimal team efficiency.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <BarChart3 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Analytics & Insights</h3>
            <p className="text-muted-foreground leading-relaxed">
              Track progress with real-time dashboards and comprehensive activity logs for data-driven decisions.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Project Planning</h3>
            <p className="text-muted-foreground leading-relaxed">
              Organize work into projects, set priorities, track deadlines, and ensure timely delivery.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
            <p className="text-muted-foreground leading-relaxed">
              Enterprise-grade security with encrypted data storage and reliable backup systems.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group p-8 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Collaboration</h3>
            <p className="text-muted-foreground leading-relaxed">
              Work together seamlessly with instant updates, activity tracking, and team notifications.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Get Started in <span className="text-primary">3 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start managing your tasks efficiently in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-4 border-primary/20">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Create Your Account</h3>
            <p className="text-muted-foreground">
              Sign up for free in seconds. No credit card required.
            </p>
          </div>

          <div className="relative text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-4 border-primary/20">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Set Up Your Team</h3>
            <p className="text-muted-foreground">
              Invite team members and create your first project.
            </p>
          </div>

          <div className="relative text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-4 border-primary/20">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Start Managing Tasks</h3>
            <p className="text-muted-foreground">
              Create tasks, assign them, and watch productivity soar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
        <div className="relative rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-accent/5 to-background p-8 sm:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-l from-primary/10 to-transparent" />
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of teams already using Smart Task Manager to streamline their work, 
            boost productivity, and achieve their goals faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-lg hover:shadow-xl transition-shadow">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-lg hover:shadow-xl transition-shadow">
                    Start Free Today
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-6">
              ✓ Free forever plan • ✓ No credit card required • ✓ Cancel anytime
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-12 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Smart Task Manager</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Empowering teams to work smarter with intelligent task management and seamless collaboration.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Smart Task Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
