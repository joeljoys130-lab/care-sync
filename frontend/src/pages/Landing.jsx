import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiShield, FiClock, FiStar, FiCalendar, FiUser, FiHeart, FiPhoneCall } from 'react-icons/fi';
import { MdLocalHospital, MdVideoCall, MdPeople, MdVerified } from 'react-icons/md';

const FEATURES = [
  { icon: FiClock,     title: 'Instant Booking',      desc: 'Book same-day appointments with top specialists in just a few clicks.',         color: 'from-blue-500 to-cyan-400' },
  { icon: FiShield,   title: 'Secure & Private',      desc: 'Your health data is protected with enterprise-grade encryption.',               color: 'from-emerald-500 to-green-400' },
  { icon: MdVideoCall,title: 'Video Consultations',   desc: 'Connect with your doctor face-to-face from the comfort of home.',              color: 'from-purple-500 to-violet-400' },
  { icon: MdPeople,   title: '500+ Specialists',      desc: 'Access verified doctors across 30+ medical specializations.',                  color: 'from-amber-500 to-orange-400' },
];

const STEPS = [
  { step: '01', icon: FiUser,     title: 'Create Your Account',    desc: 'Sign up for free in under 2 minutes. No credit card required.' },
  { step: '02', icon: FiCalendar, title: 'Find & Book a Doctor',   desc: 'Search by specialty, city, or doctor name and book your slot instantly.' },
  { step: '03', icon: FiHeart,    title: 'Get Expert Care',        desc: 'Attend in-person or video consultations and receive top-quality care.' },
];

const SPECIALIZATIONS = [
  { name: 'Cardiology',    emoji: '❤️' },
  { name: 'Dermatology',   emoji: '🧴' },
  { name: 'Neurology',     emoji: '🧠' },
  { name: 'Orthopedics',   emoji: '🦴' },
  { name: 'Pediatrics',    emoji: '👶' },
  { name: 'Psychiatry',    emoji: '💬' },
  { name: 'Ophthalmology', emoji: '👁️' },
  { name: 'General',       emoji: '🩺' },
];

const STATS = [
  { value: '50K+',  label: 'Patients Served',   icon: FiUser },
  { value: '500+',  label: 'Verified Doctors',   icon: MdVerified },
  { value: '98%',   label: 'Satisfaction Rate',  icon: FiStar },
  { value: '24/7',  label: 'Support Available',  icon: FiPhoneCall },
];

const TESTIMONIALS = [
  { name: 'Riya Sharma',   role: 'Patient',          text: 'Booked a cardiologist in 5 minutes. CareSync saved me hours of calling clinics.',       avatar: 'RS' },
  { name: 'Dr. Arjun Nair',role: 'Cardiologist',     text: 'My schedule is always full and payments are seamless. Best platform for doctors.',        avatar: 'AN' },
  { name: 'Mehul Patel',   role: 'Patient',          text: 'The video consultation feature is incredible. Got diagnosed without leaving my home.',   avatar: 'MP' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">

      {/* ─── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <MdLocalHospital className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">CareSync</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features"  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">Features</a>
            <a href="#how"       className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">How it Works</a>
            <a href="#specializations" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">Specializations</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/login"    className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition px-3 py-1.5">Sign In</Link>
            <Link to="/register" className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 text-white overflow-hidden py-28 px-4">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Trusted by 50,000+ patients across India
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Healthcare at Your<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Fingertips</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Book appointments with top verified doctors, manage your health records, and consult from anywhere — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-base font-semibold px-8 py-4 rounded-2xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200">
              Find a Doctor <FiArrowRight />
            </Link>
            <Link to="/register?role=doctor"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white text-base font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200">
              <MdLocalHospital className="text-xl" /> Join as a Doctor
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 text-slate-300 border border-slate-600 text-base font-semibold px-8 py-4 rounded-2xl hover:border-slate-400 hover:text-white transition-all duration-200">
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            {['No registration fee', 'HIPAA Compliant', 'Cancel anytime', '256-bit SSL secured'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <FiCheckCircle className="text-green-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ───────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center group">
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-1">{s.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">Why CareSync</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mt-2">Everything you need,<br />in one platform</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-8 text-center hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-5 text-white text-2xl shadow-lg`}>
                  <f.icon />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mt-2">Get started in 3 easy steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-cyan-200 via-blue-200 to-cyan-200 dark:from-cyan-900 dark:via-blue-900 dark:to-cyan-900" />

            {STEPS.map((s, i) => (
              <div key={s.step} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-cyan-500/20 mb-6 z-10">
                  <s.icon />
                </div>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase mb-1">Step {s.step}</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-cyan-500/25 hover:scale-105 hover:shadow-cyan-500/40 transition-all duration-200">
              Get Started Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Specializations ─────────────────────────────────────────────────── */}
      <section id="specializations" className="py-24 px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-sm font-semibold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">Our Specialists</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mt-2 mb-4">Browse by Specialization</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-12 text-base">Find the right specialist for your health needs</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SPECIALIZATIONS.map((s) => (
              <Link key={s.name} to="/register"
                className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                <span className="text-xl">{s.emoji}</span>
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mt-2">What our users say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <FiStar key={i} className="text-amber-400 fill-amber-400 text-sm" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Doctor CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you a Doctor?</h2>
          <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-base leading-relaxed">
            Join our network of 500+ verified specialists. Manage your schedule, grow your practice, and earn more — all through CareSync.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=doctor"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl shadow-cyan-500/30 hover:scale-105 hover:shadow-cyan-500/50 transition-all duration-200">
              <MdLocalHospital className="text-xl" /> Join as a Doctor <FiArrowRight />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200">
              Already a member? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to take control of your health?</h2>
        <p className="text-cyan-100 mb-8 max-w-xl mx-auto text-base">
          Join thousands of patients who trust CareSync for their healthcare needs. It's free to get started.
        </p>
        <Link to="/register"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-200">
          Create Free Account <FiArrowRight />
        </Link>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MdLocalHospital className="text-white text-xl" />
              </div>
              <span className="text-white font-bold text-xl">CareSync</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link to="/login"           className="hover:text-cyan-400 transition">Sign In</Link>
              <Link to="/register"        className="hover:text-cyan-400 transition">Register as Patient</Link>
              <Link to="/register?role=doctor" className="hover:text-cyan-400 transition">Register as Doctor</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© {new Date().getFullYear()} CareSync Health. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs">
              <FiShield className="text-green-400" /> HIPAA Compliant &nbsp;|&nbsp; 256-bit SSL Encrypted
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
