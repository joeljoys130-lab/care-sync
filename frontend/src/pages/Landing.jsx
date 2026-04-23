import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiShield, FiClock, FiStar } from 'react-icons/fi';
import { MdLocalHospital, MdVideoCall, MdPeople } from 'react-icons/md';

const FEATURES = [
  { icon: FiClock, title: 'Instant Booking', desc: 'Book same-day appointments with top specialists in just a few clicks.', color: 'bg-blue-50 text-blue-600' },
  { icon: FiShield, title: 'Secure & Private', desc: 'Your health data is protected with enterprise-grade encryption.', color: 'bg-green-50 text-green-600' },
  { icon: MdVideoCall, title: 'Video Consultations', desc: 'Connect with your doctor face-to-face from the comfort of home.', color: 'bg-purple-50 text-purple-600' },
  { icon: MdPeople, title: '500+ Specialists', desc: 'Access verified doctors across 30+ medical specializations.', color: 'bg-amber-50 text-amber-600' },
];

const SPECIALIZATIONS = ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Ophthalmology', 'General'];

const STATS = [
  { value: '50K+', label: 'Patients Served' },
  { value: '500+', label: 'Verified Doctors' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ─── Navbar ────────────────────────────────────────── */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-600 dark:bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 dark:shadow-cyan-500/20">
              <MdLocalHospital className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">CareSync</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-cyan-400 transition">Sign In</Link>
            <Link to="/register" className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold shadow-xl shadow-primary-500/25 dark:shadow-cyan-500/25">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="hero-gradient text-white py-24 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Trusted by 50,000+ patients
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-balance">
            Healthcare at Your <span className="text-primary-200">Fingertips</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10">
            Book appointments with top verified doctors, manage your health records, and consult from anywhere — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-blue-50 btn-lg font-semibold shadow-lg">
              Find a Doctor <FiArrowRight />
            </Link>
            <Link to="/register?role=doctor" className="btn border-2 border-white/50 text-white hover:bg-white/10 btn-lg">
              Join as Doctor
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-blue-100">
            {['No registration fee', 'HIPAA Compliant', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <FiCheckCircle className="text-green-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 py-12 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-cyan-400">{stat.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section className="py-24 px-4 bg-surface-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Why Choose CareSync?</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-xl mx-auto text-lg">
              We're reimagining healthcare delivery with technology that puts patients first.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-8 text-center hover:-translate-y-1 transition-transform bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                <div className={`w-16 h-16 rounded-2xl ${f.color} dark:bg-slate-800/50 dark:text-cyan-400 flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner`}>
                  <f.icon />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Specializations ────────────────────────────────── */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Browse by Specialization</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-12 text-lg">Find the right specialist for your health needs</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SPECIALIZATIONS.map((s) => (
              <Link
                key={s}
                to={`/register`}
                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-primary-400 dark:hover:border-cyan-400 hover:text-primary-600 dark:hover:text-cyan-400 hover:bg-primary-50 dark:hover:bg-cyan-500/5 transition shadow-sm"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-primary-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Join thousands of patients who trust CareSync for their healthcare needs.
        </p>
        <Link to="/register" className="btn bg-white text-primary-700 hover:bg-blue-50 btn-lg font-semibold shadow-lg">
          Create Free Account <FiArrowRight />
        </Link>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-800 text-slate-400 py-8 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MdLocalHospital className="text-primary-400 text-xl" />
          <span className="text-white font-semibold">CareSync</span>
        </div>
        <p>© {new Date().getFullYear()} CareSync Health. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
