import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page">
      <h1>404 — Page Not Found</h1>
      <Link to="/" className="back-link">
        ← Back home
      </Link>
    </div>
  );
}
