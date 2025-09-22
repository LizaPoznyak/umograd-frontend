import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // тот же логотип, что и в Navbar
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-left">
                <img src={logo} alt="Umograd" className="footer-logo" />
            </div>

            <div className="footer-center">
                <Link to="/about" className="footer-link">О проекте</Link>
                <Link to="/contacts" className="footer-link">Контакты</Link>
                <Link to="/privacy" className="footer-link">Политика</Link>
            </div>

            <div className="footer-right">
                <span className="footer-copy">© {new Date().getFullYear()} Умоград</span>
            </div>
        </footer>
    );
}
