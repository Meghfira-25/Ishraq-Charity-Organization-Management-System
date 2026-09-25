import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Music2,
  Send,
} from "lucide-react";

import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid shell">
        <div className="footer-brand">
          <Logo />

          <p>
            Bringing hope, dignity and sustainable
            support to communities through accountable
            charity work.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <Facebook size={18} />
            </a>

            <a href="https://www.instagram.com/ishraqcharity01?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" aria-label="Instagram">
              <Instagram size={18} />
            </a>

            <a href="https://www.tiktok.com/@ishraq_charity?is_from_webapp=1&sender_device=pc" aria-label="TikTok">
              <Music2 size={18} />
            </a>

            <a href="https://t.me/Ishraq_charityorganisation" aria-label="Telegram">
              <Send size={18} />
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>

          <Link to="/about">About Us</Link>
          <Link to="/programs">Programs</Link>
          <Link to="/annual-plans">Annual Plans</Link>
          <Link to="/stories">Success Stories</Link>
          <Link to="/news">Events & News</Link>
        </div>

        <div className="footer-column">
          <h4>Get Involved</h4>

          <Link to="/donate">Donate</Link>

          <Link to="/membership">
            Become a Member
          </Link>

          <Link to="/contact">
            Contact Us
          </Link>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>

          <span>
            <Mail size={17} />
            info@ishraq.org
          </span>

          <span>
            <Phone size={17} />
            +251 945 469 199
          </span>

          <span>
            <MapPin size={17} />
            Lebu OSAC Building, Addis Ababa
          </span>
        </div>
      </div>

      <div className="footer-bottom shell">
        <p>
          © {new Date().getFullYear()} Ishraq Charity
          Organization. All rights reserved.
        </p>

        <div className="footer-bottom-links">
          <Link to="/privacy">
            Privacy Policy
          </Link>

          <Link to="/terms">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}