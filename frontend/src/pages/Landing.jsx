import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="max-w-5xl mx-auto px-4 py-20 md:py-28">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Alumni–Student Portal</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
            Connect students with alumni for mentorship and careers
          </h1>
          <p className="mt-4 text-sm text-zinc-600 max-w-lg leading-relaxed">
            A minimal platform to bridge your university community — find mentors, explore jobs, and join discussions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </section>

        <Separator />

        <section id="about" className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-lg font-semibold mb-3">About</h2>
          <p className="text-sm text-zinc-600 max-w-2xl leading-relaxed">
            AlumniConnect helps current students connect with graduates for career guidance, internship referrals, and professional networking. Alumni can give back by mentoring and posting opportunities.
          </p>
        </section>

        <Separator />

        <section id="how" className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-lg font-semibold mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Sign up as a student or alumni with your university email.' },
              { step: '02', title: 'Connect', desc: 'Students browse mentors and request guidance. Alumni review requests.' },
              { step: '03', title: 'Grow', desc: 'Apply to jobs, join forum discussions, and build your network.' },
            ].map((item) => (
              <div key={item.step}>
                <p className="text-xs text-zinc-400 mb-2">{item.step}</p>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} AlumniConnect</span>
          <div className="flex gap-4">
            <a href="#about" className="hover:text-black">About</a>
            <a href="#how" className="hover:text-black">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
