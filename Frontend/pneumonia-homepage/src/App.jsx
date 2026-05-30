import "./App.css";

function App() {
  return (
    <div>

      {/* Navbar */}
      <nav className="navbar">
        <h2>PneumoAI</h2>

        <ul className="nav-links">
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero">

        <div className="hero-text">
          <h1>Chest X-Ray Pneumonia Detection System</h1>

          <p>
            AI-powered deep learning system for detecting pneumonia
            from chest X-ray images.
          </p>

          <button>Get Started</button>
        </div>

      </section>

      {/* About Section */}
      <section className="about">

        <h2>About The Project</h2>

        <p>
          This project uses Artificial Intelligence and Deep Learning
          to detect pneumonia from chest X-ray images.
          The system helps in fast and accurate prediction
          using trained CNN models.
        </p>

      </section>

      {/* Footer */}

      <footer className="footer">

        <p>
          © 2026 PneumoAI | Developed using React
        </p>

      </footer>
    </div>
  );
}

export default App;