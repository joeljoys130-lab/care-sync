import { useMemo, useState } from "react";
import doctors from "../data/doctors";
import DoctorCard from "../components/DoctorCard";

const Home = () => {
  const [query, setQuery] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("All Hospitals");
  const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");

  const hospitals = useMemo(() => ["All Hospitals", ...new Set(doctors.map((d) => d.hospital))], []);
  const specialties = useMemo(() => ["All Specialties", ...new Set(doctors.map((d) => d.specialization.split(" | ")[0]))], []);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesQuery = doctor.name.toLowerCase().includes(query.toLowerCase()) || doctor.specialization.toLowerCase().includes(query.toLowerCase());
    const matchesHospital = hospitalFilter === "All Hospitals" || doctor.hospital === hospitalFilter;
    const matchesSpecialty = specialtyFilter === "All Specialties" || doctor.specialization.includes(specialtyFilter);
    return matchesQuery && matchesHospital && matchesSpecialty;
  });

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div className="hero-content">
          <span className="eyelash">Doctor Connect</span>
          <h1>Futuristic doctor booking made simple</h1>
          <p>
            Explore top specialists, manage availability, and book appointments with a refined modern UI designed for care professionals.
          </p>
          <div className="hero-stats">
            <div>
              <strong>98%</strong>
              <span>Doctor satisfaction</span>
            </div>
            <div>
              <strong>1.2K</strong>
              <span>Confirmed bookings</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Realtime availability</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-badge">Doctor Discovery</div>
          <div className="hero-wave" />
        </div>
      </section>

      <section className="search-panel">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search doctor, specialty or hospital"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button>Search</button>
        </div>
        <div className="filters-row">
          <select value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
            {hospitals.map((hospital) => (
              <option key={hospital} value={hospital}>
                {hospital}
              </option>
            ))}
          </select>
          <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="doctor-list">
        {filteredDoctors.length === 0 ? (
          <div className="empty-state">
            <h2>No specialists found</h2>
            <p>Try adjusting your filters or search terms to locate a doctor.</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))
        )}
      </section>
    </div>
  );
};

export default Home;
