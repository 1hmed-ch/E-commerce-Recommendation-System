//Footer.jsx
import React from 'react';
import {
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Apple,
    Shield,
    Play
} from 'lucide-react';
import {
  FaXTwitter,
  FaPinterest,
  FaSnapchat,
  FaApple,
  FaAndroid,
  FaLinkedin,
  FaTiktok
} from "react-icons/fa6";
import Newsletter from './Newsletter';
import FooterSection from './FooterSection';
import PaymentIcons from './PaymentIcons';

function Footer() {
    // Data for sections
    const sections = [
        {
            title: "SHOP INFO",
            links: [
                "About Us",
                "Social Responsibility",
                "Careers",
                "Student Discount",
                "Press Room",
                "Product Environmental Sheet",
                "Digital Services Regulation",
                "File a Complaint"
            ]
        },
        {
            title: "HELP",
            links: [
                "Shipping",
                "Returns",
                "Refunds",
                "Ordering",
                "Order Status",
                "Size Guide",
                "SHOP CLUB",
                "SHOP VIP",
                "Review Guide",
                "SHOP Affiliate Program",
                "How to Report Illegal Content",
                "Ranking Policy"
            ]
        },
        {
            title: "CONTACT & PAYMENT",
            links: [
                "Contact Us",
                "Payment & Taxes",
                "Bonus Points",
                "FAQs"
            ]
        }
    ];

    // Payment methods
    const paymentMethods = [
        "Visa", "MasterCard", "PayPal", "Apple Pay", "Google Pay", "American Express"
    ];

    // Bottom footer links
    const bottomLinks = [
        "Privacy Center",
        "Privacy Policy & Cookies",
        "Manage Cookies",
        "Terms & Conditions",
        "Marketplace IP Rules",
        "Intellectual Property Notice",
        "Company Information",
        "Ad Choices",
        "Recommendation System & Custom Settings"
    ];

    return (
        <footer className="bg-gray-50 border-t border-gray-200 text-xs">
            {/* Top Section - Links and Newsletter */}
            <div className="mx-auto px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left side - 3 columns of links */}
                    <div className="grid grid-cols-3 gap-8">
                        {sections.map((section, index) => (
                            <div key={index} className="min-w-0">
                                <FooterSection title={section.title} links={section.links} />
                            </div>
                        ))}
                    </div>
                    
                    {/* Right side - Social, Apps, Newsletter, Payment */}
                    <div>
                        {/* Social Icons and Apps */}
                        <div className='grid grid-cols-2 gap-10 mb-6'>
                            <div>
                                <h3 className="mb-3 uppercase tracking-wide font-bold text-gray-800">
                                    Find Us On
                                </h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <a href="https://www.facebook.com/SHEINMaroc/" className="text-gray-600 hover:text-black">
                                        <Facebook size={20} className="text-black hover:text-blue-600" />
                                    </a>
                                    <a href="https://www.instagram.com/sheinfrance_/" className="text-black hover:text-pink-600">
                                        <Instagram size={20} />
                                    </a>
                                    <a href="https://x.com/SHEIN_News" className="text-black hover:text-black">
                                        <FaXTwitter size={20} />
                                    </a>
                                    <a href="https://www.youtube.com/user/sheinsidevideo" className="text-black hover:text-red-600">
                                        <Youtube size={20} />
                                    </a>
                                    <a href="https://www.pinterest.com/SHEINofficial/" className="text-black hover:text-pink-800">
                                        <FaPinterest size={20} />
                                    </a>
                                    <a href="https://www.snapchat.com/@sheinofficial" className="text-black hover:text-yellow-600">
                                        <FaSnapchat size={20} />
                                    </a>
                                    <a href="https://www.tiktok.com/@sheinfrance_?" className="text-black hover:text-purple-900">
                                        <FaTiktok size={20} />
                                    </a>
                                    <a href="https://www.linkedin.com/company/shein" className="text-black hover:text-blue-800">
                                        <FaLinkedin size={20} />
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-2 uppercase tracking-wide font-bold text-gray-800">
                                    APP
                                </h3>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <a href="https://apps.apple.com/fr/app/shein-achat-en-ligne/id878577184" className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 w-full sm:w-auto justify-center">
                                        <FaApple size={16} />
                                        <div className="text-xs">
                                            <div>Download on the</div>
                                            <div className="font-bold">App Store</div>
                                        </div>
                                    </a>
                                    <a href="https://play.google.com/store/apps/details?id=com.zzkko&hl=en" className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 w-full sm:w-auto justify-center">
                                        <Play size={16} />
                                        <div className="text-xs">
                                            <div>Get it on</div>
                                            <div className="font-bold">Google Play</div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Newsletter */}
                        <div className="mb-6">
                            <Newsletter />
                        </div>

                        {/* Payment Methods Section */}
                        <div className="bg-gray-50 py-5 px-4 rounded-lg">
                            <div>
                                <h3 className="mb-2 uppercase tracking-wide font-bold text-gray-800">
                                    WE ACCEPT
                                </h3>
                                <div>
                                    <PaymentIcons />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                    
            {/* Bottom Section */}
            <div className="mx-auto px-6 lg:px-8 py-4">
                {/* First row: Copyright, Location */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-3">
                    {/* Copyright */}
                    <div className="text-gray-600">
                        ©2009-2026 SHOP All Rights Reserved
                        <span className="ml-3 text-gray-500">Morocco</span>
                    </div>
                </div>
                    
                {/* Separator */}
                <hr className="border-gray-300 my-3" />
                    
                {/* Second row: Legal links */}
                <div className="mb-4">
                    <div className="flex flex-wrap justify-center items-center gap-x-1.5 gap-y-2">
                        {bottomLinks.map((link, index) => (
                            <div key={index} className="flex items-center">
                                <a href="#" className="text-gray-600 hover:text-gray-900 whitespace-nowrap px-1.5">
                                    {link}
                                </a>
                                {index < bottomLinks.length - 1 && (
                                    <span className="text-gray-400 mx-1">|</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;