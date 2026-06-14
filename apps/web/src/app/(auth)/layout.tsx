import { redirect } from 'next/navigation';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">M</span>
            </div>
            <span className="text-2xl font-bold">MinIMills</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Project management
            <br />
            <span className="text-white/80">that just works.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Organize your work, collaborate with your team, and ship faster with MinIMills — the flexible project management platform built for modern teams.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: '⚡', text: 'Real-time collaboration with your team' },
            { icon: '🤖', text: 'Powerful automation to save hours' },
            { icon: '📊', text: 'Insights and analytics to track progress' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-white/80">
              <span className="text-xl">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-primary">MinIMills</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
