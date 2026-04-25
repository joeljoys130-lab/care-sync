import { Link } from "react-router-dom";

const Appointments = () => {
  return (
    <div className="page-shell">
      <div className="detail-panel">
        <h2>Appointment management</h2>
        <p>
          View upcoming consultations, update appointment statuses, and keep your
          patient flow organized.
        </p>
      </div>
      <div className="appointments-grid">
        {[1, 2, 3].map((appointment) => (
          <div key={appointment} className="appointment-card">
            <div>
              <strong>Patient #{appointment}</strong>
              <p>Scheduled for 10:30 AM, May 5</p>
            </div>
            <div className="appointment-actions">
              <button className="ghost">Reschedule</button>
              <button className="primary">Mark Completed</button>
            </div>
          </div>
        ))}
      </div>
      <Link to="/" className="ghost-link">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Appointments;
