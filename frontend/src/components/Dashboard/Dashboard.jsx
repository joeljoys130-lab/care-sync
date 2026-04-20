import React from "react";
import "./dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          CareSync
        </div>

        <nav className="nav">
          <button className="nav-link">Hospitals</button>
          <button className="nav-link">Specialities</button>
          <button className="nav-link">Centre of Excellence</button>
          <button className="nav-link">Media Centre</button>
          <button className="nav-link">Medical Services</button>
          <button className="nav-link">Patient Corner</button>
        </nav>

        <div className="header-right">
          <button className="login-btn">Login</button>
        </div>
      </header>

      {/* ACTION BAR */}
      <div className="action-bar">
        <button>📞 Request a Callback</button>
        <button className="primary">📅 Book Appointment</button>
        <button>🩺 Get Health Checkup</button>
      </div>

      {/* HERO SECTION */}
      <section className="hero">
        <h1>
          Healthcare for Good <br />
          Today. Tomorrow. Always
        </h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search for Doctors, Specialities and Hospitals"
          />
          <button>🔍</button>
        </div>
      </section>

      {/* CARDS */}
      <section className="cards">
        <div className="card green">
          <h3>Book Appointment</h3>
          <p>With country's leading experts</p>
        </div>

        <div className="card blue">
          <h3>Hospitals</h3>
          <p>Health needs under one roof</p>
        </div>

        <div className="card white">
          <h3>Help/Support</h3>
          <p>Find doctors and services</p>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;