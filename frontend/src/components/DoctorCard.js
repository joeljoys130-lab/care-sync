import { Link } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <img src={doctor.avatar} alt={doctor.name} />
        <div>
          <h3>{doctor.name}</h3>
          <p>{doctor.title}</p>
        </div>
      </div>

      <div className="doctor-card-body">
        <span className="tag">{doctor.hospital}</span>
        <p className="specialty">{doctor.specialization}</p>
        <div className="doctor-stats">
          <span>{doctor.experience} yrs exp</span>
          <span>₹ {doctor.fee}</span>
        </div>
        <p className="availability">{doctor.availability}</p>
      </div>

      <div className="doctor-card-actions">
        <Link to={`/doctor/${doctor.id}`} className="ghost">
          View Full Profile
        </Link>
        <Link to="/appointments" className="primary">
          Book Appointment
        </Link
        </Link>
        <Link to="/appointments" className="primary">
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
