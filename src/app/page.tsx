import Link from 'next/link';
import { Mic, PawPrint, Sparkles, User, Clock } from 'lucide-react';
import Image from 'next/image';

const ANIMALS = [
  { name: "Dog", emoji: "🐕", image: "/dog.jpg", desc: "Bark & Woof Decoder", gradient: "from-cyan-500 to-blue-600", ring: "ring-cyan-500/30", shadow: "hover:shadow-cyan-500/20" },
  { name: "Cat", emoji: "🐈", image: "/cat.jpg", desc: "Meow Interpreter", gradient: "from-fuchsia-500 to-purple-600", ring: "ring-fuchsia-500/30", shadow: "hover:shadow-fuchsia-500/20" },
  { name: "Cow", emoji: "🐄", image: "/cow.jpg", desc: "Moo Translator", gradient: "from-amber-400 to-orange-600", ring: "ring-amber-500/30", shadow: "hover:shadow-amber-500/20" },
  { name: "Bird", emoji: "🐦", image: "/bird.jpg", desc: "Chirp Analyzer", gradient: "from-emerald-400 to-teal-600", ring: "ring-emerald-500/30", shadow: "hover:shadow-emerald-500/20" },
  { name: "Horse", emoji: "🐎", image: "/horse.jpg", desc: "Neigh Reader", gradient: "from-violet-500 to-indigo-600", ring: "ring-violet-500/30", shadow: "hover:shadow-violet-500/20" },
  { name: "Parrot", emoji: "🦜", image: "/parrot.jpg", desc: "Squawk Decoder", gradient: "from-rose-500 to-red-600", ring: "ring-rose-500/30", shadow: "hover:shadow-rose-500/20" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      {/* Background glowing effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] sm:w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] sm:w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[80px] sm:blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[40%] sm:w-[30%] h-[30%] rounded-full bg-fuchsia-600/10 blur-[60px] sm:blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center rounded-full overflow-hidden bg-white/5 ring-2 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Image src="/animal.png" alt="Pet Translator Logo" width={56} height={56} className="w-full h-full object-cover" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            Pet Translator
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/history" className="text-gray-400 hover:text-white transition-colors" title="History">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <Link href="/profile" className="text-gray-400 hover:text-white transition-colors" title="Profile">
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center px-4 sm:px-6 pb-6 text-center max-w-5xl mx-auto w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 sm:mb-8 mt-4 sm:mt-8">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
          <span className="text-xs sm:text-sm font-medium text-gray-300">Next-Gen AI Animal Translation</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-tight">
          Understand Your Pet&#39;s <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
            True Emotions
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-8 sm:mb-12 max-w-xl px-2">
          Select an animal below and let our AI decode their sounds into human language.
        </p>

        {/* Animal Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full mb-10 sm:mb-16">
          {ANIMALS.map((animal) => (
            <Link key={animal.name} href={`/translate?animal=${animal.name.toLowerCase()}`}>
              <div className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.04] hover:shadow-2xl active:scale-[0.97] ${animal.shadow}`}>
                {/* Card Background with gradient border — pointer-events-none so they never block clicks */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl sm:rounded-3xl pointer-events-none" />
                <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-[#0a0a0f] pointer-events-none" />
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${animal.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 rounded-2xl sm:rounded-3xl pointer-events-none`} />

                {/* Content */}
                <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col items-center text-center gap-2 sm:gap-4">
                  {/* Emoji or Image with glow ring */}
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-white/[0.04] ring-1 ${animal.ring} group-hover:ring-2 transition-all duration-500 group-hover:bg-white/[0.08] overflow-hidden shadow-lg group-hover:shadow-xl`}>
                    {animal.image ? (
                      <Image 
                        src={animal.image} 
                        alt={animal.name} 
                        width={96}
                        height={96}
                        quality={90}
                        priority
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <span className="text-3xl sm:text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-500">{animal.emoji}</span>
                    )}
                  </div>

                  {/* Animal Name */}
                  <h3 className={`text-base sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${animal.gradient}`}>
                    {animal.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium">{animal.desc}</p>

                  {/* Translate pill — hidden until hover on all screens */}
                  <div className={`mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r ${animal.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0`}>
                    <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    <span className="text-white text-[10px] sm:text-xs font-semibold">Translate</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-6 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center rounded-full overflow-hidden bg-white/5 ring-2 ring-indigo-500/20">
                  <Image src="/animal.png" alt="Pet Translator Logo" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <span className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  Pet Translator
                </span>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                AI-powered animal sound translator. Understand what your pet is really feeling.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4">Product</h4>
              <ul className="space-y-2 sm:space-y-2.5">
                <li><Link href="/" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">Home</Link></li>
                <li><Link href="/translate?animal=dog" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">Translator</Link></li>
                <li><Link href="/history" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">History</Link></li>
                <li><span className="text-gray-600 text-xs sm:text-sm">API (Coming Soon)</span></li>
              </ul>
            </div>

            {/* Animals */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4">Animals</h4>
              <ul className="space-y-2 sm:space-y-2.5">
                <li><Link href="/translate?animal=dog" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">🐕 Dog</Link></li>
                <li><Link href="/translate?animal=cat" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">🐈 Cat</Link></li>
                <li><Link href="/translate?animal=bird" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">🐦 Bird</Link></li>
                <li><Link href="/translate?animal=cow" className="text-gray-500 hover:text-white text-xs sm:text-sm transition-colors">🐄 Cow</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-2 sm:space-y-2.5">
                <li><span className="text-gray-500 text-xs sm:text-sm">About Us</span></li>
                <li><span className="text-gray-500 text-xs sm:text-sm">Privacy Policy</span></li>
                <li><span className="text-gray-500 text-xs sm:text-sm">Terms of Service</span></li>
                <li><span className="text-gray-500 text-xs sm:text-sm">Contact</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-gray-600 text-[10px] sm:text-xs">&copy; 2026 Pet Translator. All rights reserved.</p>
            <div className="flex items-center gap-4 sm:gap-5">
              <a href="#" className="text-gray-600 hover:text-white transition-colors" title="Twitter">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-white transition-colors" title="Instagram">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-white transition-colors" title="YouTube">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-white transition-colors" title="GitHub">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
