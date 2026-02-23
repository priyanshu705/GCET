import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-glow"></div>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-2xl font-bold gradient-text">GCET Campus</div>
            <div className="flex gap-4">
              <button className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
                About
              </button>
              <Link href="/auth/signup">
                <button className="px-6 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 rounded-full transition-all hover-glow">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text">Connect Authentically</span>
              <br />
              <span className="text-white">with Fellow Students</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Campus social platform for GCET, GU, and GCOP featuring{' '}
              <span className="text-purple-400 font-semibold">blind dating mechanics</span> and{' '}
              <span className="text-pink-400 font-semibold">friend-finding</span>
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="glass rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-white mb-2">Blind Dating</h3>
              <p className="text-gray-400">
                Progressive profile revelation based on conversation depth
              </p>
            </div>

            <div className="glass rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Find Friends</h3>
              <p className="text-gray-400">
                Connect with students who share your interests and goals
              </p>
            </div>

            <div className="glass rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Join Groups</h3>
              <p className="text-gray-400">
                Study groups, events, and social meetups for campus life
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/auth/signup">
              <button className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all hover-glow hover:scale-105">
                Create Account
              </button>
            </Link>
            <button className="px-8 py-4 text-lg font-semibold glass rounded-full hover:bg-white/10 transition-all">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">3</div>
              <div className="text-sm text-gray-400">Campuses</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">100%</div>
              <div className="text-sm text-gray-400">Verified Students</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">Safe</div>
              <div className="text-sm text-gray-400">& Anonymous</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-gray-500 text-sm">
          <p>Exclusively for GCET, GU, and GCOP students • Campus verification required</p>
        </footer>
      </main>
    </div>
  );
}
