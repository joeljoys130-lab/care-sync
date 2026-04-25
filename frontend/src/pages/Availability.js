import { Link } from "react-router-dom";

const Availability = () => {
  return (
    <div className="page-shell">
      <div className="split-grid">
        <div className="detail-panel">
          <h2>Availability management</h2>
          <p>
            Keep your schedule visible, update slots, and let patients book the
            best time for consultation.
          </p>
          <div className="status-card">
            <h3>Next available slot</h3>
            <p>Tomorrow, 10:00 AM - 11:00 AM</p>
          </div>
        </div>
        <div className="detail-panel highlight-panel">
          <h3>Quick actions</h3>
          <ul>
            <li>Set new availability windows</li>
            <li>Review booked appointments</li>
            <li>Disable unavailable dates</li>
          </ul>
          <Link to="/" className="primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Availability;
