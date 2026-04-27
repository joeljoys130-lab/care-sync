import { Link, useParams } from "react-router-dom";
import doctors from "../data/doctors";

const DoctorProfile = () => {
  const { id } = useParams();
  const doctor = doctors.find((item) => item.id.toString() === id);

  if (!doctor) {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <h2>Doctor not found</h2>
          <p>Please return to the listings and select a valid doctor.</p>
          <Link to="/" className="ghost-link">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell doctor-profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <img src={doctor.avatar} alt={doctor.name} />
          <div>
            <h2>{doctor.name}</h2>
            <p>{doctor.title}</p>
            <span className="tag">{doctor.hospital}</span>
          </div>
        </div>
        <div className="profile-meta">
          <div>
            <span>Specialization</span>
            <strong>{doctor.specialization}</strong>
          </div>
          <div>
            <span>Experience</span>
            <strong>{doctor.experience} years</strong>
          </div>
          <div>
            <span>Consultation</span>
            <strong>₹ {doctor.fee}</strong>
          </div>
          <div>
            <span>Availability</span>
            <strong>{doctor.availability}</strong>
          </div>
        </div>
        <div className="profile-actions">
          <Link to="/appointments" className="primary">
            Book Appointment
          </Link>
          <Link to="/availability" className="ghost">
            Manage Availability
          </Link>
        </div>
      </div>
      <div className="profile-details">
        <div className="detail-panel">
          <h3>Professional summary</h3>
          <p>
            {doctor.name} is a leading specialist with deep expertise in advanced
            care and patient-centered treatment. The doctor combines next-gen
            medical tools with modern workflows for exceptional clinical outcomes.
          </p>
        </div>
        <div className="detail-panel">
          <h3>Patient care focus</h3>
          <ul>
            <li>Personalized diagnosis and treatment planning</li>
            <li>Optimized appointment follow-up</li>
            <li>Realtime availability monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
