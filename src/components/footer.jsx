import React from "react";
import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import './footer.css'; // Importando o CSS do Footer

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-icons">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
            </div>
            <p className="direitos">© 2025 CafeConnect. Todos os direitos reservados.</p>
        </footer>
    );
};

export default Footer;