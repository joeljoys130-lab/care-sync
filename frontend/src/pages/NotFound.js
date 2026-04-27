import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="page-shell empty-state">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="primary">
        Back to home
      </Link>
    </div>
  );
};

export default NotFound;
