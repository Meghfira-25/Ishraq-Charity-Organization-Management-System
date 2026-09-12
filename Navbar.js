import React, {useEffect, useState} from "react";
import "./Navbar.css";

function Navbar() {
    const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>

      <div className="logo">
         <div className="logo-icon">✦</div>
         <div className="logo-text">
          <h2>ISHRAQ</h2>
          <p>Charity Organization</p>
         </div>
      </div>

      <nav className="nav-links">
        <a href="#" className="active"> Home</a>
        <a href="#"> About</a>
        <a href="#"> Programs</a>
        <a href="#" >Events & News</a>
        <a href="#"> Success Stories </a>
        <a href="#"> Gallery</a>
        <a href="#"> Contact</a>
      </nav>


      <div className="nav-actions">
        <button className="donate-button">Donate Now</button>
        <button className="login-button">Login</button>
      </div>

    </header>
  );
}

export default Navbar;