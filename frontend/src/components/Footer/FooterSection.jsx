//FooterSection.jsx
import React from "react";

function FooterSection({ title, links, className="" }) {
    return (
    <div className={`space-y-0.5 ${className}`}>
        <h3
            className="mb-0.5 uppercase tracking-wide text-sm font-bold text-gray-800"
            style={{ fontFamily: 'Arial, sans-serif', lineHeight: '14px' }}
        >
            {title}
        </h3>
        <ul className="space-y-0.5">
            {links.map((link, index) => (
                <li key={index}>
                    <a 
                        href="#" 
                        className="shein-footer-link block py-0.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {link}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);
}
export default FooterSection;