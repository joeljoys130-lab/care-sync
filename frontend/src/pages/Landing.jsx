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
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ────────────────────────────────────────── */}
      <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <MdLocalHospital className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-slate-800">CareSync</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white py-24 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-12 relative z-10">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Trusted by 50,000+ patients
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-balance tracking-tight">
              Healthcare at Your <span className="text-primary-300">Fingertips</span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 max-w-xl">
              Book appointments with top verified doctors, manage your health records, and consult from anywhere — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn bg-primary-500 text-white hover:bg-primary-400 btn-lg font-semibold shadow-lg shadow-primary-500/30 transition-all border border-primary-400">
                Find a Doctor <FiArrowRight />
              </Link>
              <Link to="/register?role=doctor" className="btn bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 btn-lg transition-all">
                Join as Doctor
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-12 text-sm text-slate-300">
              {['No registration fee', 'HIPAA Compliant', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 font-medium">
                  <FiCheckCircle className="text-green-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden md:block relative animate-fade-in">
             <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full transform scale-90"></div>
             <img 
               src="/hero_illustration.png" 
               alt="Digital Healthcare Interface" 
               className="relative z-10 w-full h-auto drop-shadow-2xl object-cover rounded-3xl animate-float"
             />
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────── */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-surface-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Why Choose CareSync?</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              We're reimagining healthcare delivery with technology that puts patients first.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card text-center hover:shadow-card-hover transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mx-auto mb-4 text-2xl`}>
                  <f.icon />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Specializations ────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Browse by Specialization</h2>
          <p className="text-slate-500 mb-10">Find the right specialist for your health needs</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SPECIALIZATIONS.map((s) => (
              <Link
                key={s}
                to={`/register`}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition"
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
