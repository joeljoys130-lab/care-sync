import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="topbar">
      <div className="brand">CareSync</div>
      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/availability">Availability</NavLink>
        <NavLink to="/appointments">Appointments</NavLink>
      </nav>
      <div className="user-chip">Dr. Kavish</div>
    </header>
  );
};

export default Navbar;
