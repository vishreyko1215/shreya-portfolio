
import { Link, useLocation, useNavigate } from "react-router-dom"

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleSectionClick = (section) => (event) => {
    event.preventDefault()

    if (location.pathname === "/") {
      document.getElementById(section)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })

      window.history.replaceState(null, "", `/#${section}`)
    } else {
      navigate(`/#${section}`)
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link
          to="/"
          className="logo"
          onClick={(event) => {
            event.preventDefault()

            if (location.pathname === "/") {
              window.history.replaceState(null, "", "/")
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            } else {
              window.location.href = "/"
            }
          }}
        >
          SHREYA
        </Link>

        <Link to="/admin" className="admin-login-link">
          ADMIN
        </Link>
      </div>

      <div className="nav-links">
        <a href="/#work" onClick={handleSectionClick("work")}>
          WORK
        </a>

        <a href="/#about" onClick={handleSectionClick("about")}>
          ABOUT
        </a>

        <a href="/#resume" onClick={handleSectionClick("resume")}>
          RESUME
        </a>

        <a href="/#contact" onClick={handleSectionClick("contact")}>
          CONTACT
        </a>
      </div>
    </nav>
  )
}

export default Navbar
