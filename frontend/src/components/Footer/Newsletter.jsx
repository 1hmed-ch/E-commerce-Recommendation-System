//Newsletter.jsx
import React, {useState} from 'react';

function Newsletter() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsApp, setWhatsApp] = useState('');
    const [countryCodeSMS, setCountryCodeSMS] = useState('Ma +212');
    const [countryCodeWhatsApp, setCountryCodeWhatsApp] = useState('Ma +212');

    const handleSubmit = (e, type) => {
        e.preventDefault();
        //Logique d'abonnement selon le type
        console.log(`Abonnement ${type}`, { email, phone, whatsApp });
    };

    return (
    <div className="p-0 bg-transparent border-0 rounded-none">
        <h3
            className="mb-4 uppercase tracking-wide text-sm font-bold text-gray-800"
            style={{ fontFamily: 'Arial, sans-serif', lineHeight: '16px' }}
        >
            Subscribe to our newsletter for the latest shop news! (You can unsubscribe anytime)
        </h3>
        
        {/* Email Newsletter */}
        <div className="mb-4">
            <form onSubmit={(e) => handleSubmit(e, 'email')} className="flex">
                <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white flex-1 px-3 py-2 text-sm border border-r-0 border-gray-300 rounded-l focus:outline-none focus:border-pink-500"
                />
                <button 
                    type="submit"
                    className="bg-black text-white px-4 py-2 text-sm font-medium rounded-r hover:bg-gray-800 transition-colors"
                >
                    SUBSCRIBE
                </button>
            </form>
        </div>

        {/* SMS Newsletter */}
        <div className="mb-4">
            <form onSubmit={(e) => handleSubmit(e, 'sms')} className="flex">
                <div className="flex-1 flex">
                    <select 
                        value={countryCodeSMS}
                        onChange={(e) => setCountryCodeSMS(e.target.value)}
                        className="bg-gray-50 px-3 py-2 text-sm border border-r-0 border-gray-300 focus:outline-none"
                    >
                        <option value="MA +212">Ma +212</option>
                        <option value="FR +33">Fr +33</option>
                        <option value="US +1">US +1</option>
                        <option value="UK +44">UK +44</option>
                    </select>
                    <input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white flex-1 px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-pink-500"
                    />
                </div>
                <button 
                    type="submit"
                    className="bg-black text-white px-4 py-2 text-sm font-medium rounded-r hover:bg-gray-800 transition-colors"
                >
                    SUBSCRIBE
                </button>
            </form>
        </div>

        {/* WhatsApp Newsletter */}
        <div className="mb-4">
            <form onSubmit={(e) => handleSubmit(e, 'whatsapp')} className="flex">
                <div className="flex-1 flex">
                    <select 
                        value={countryCodeWhatsApp}
                        onChange={(e) => setCountryCodeWhatsApp(e.target.value)}
                        className="px-3 py-2 text-sm border border-r-0 border-gray-300 focus:outline-none bg-gray-50"
                    >
                        <option value="MA +212">Ma +212</option>
                        <option value="FR +33">Fr +33</option>
                        <option value="US +1">US +1</option>
                        <option value="UK +44">UK +44</option>
                    </select>
                    <input
                        type="tel"
                        placeholder="WhatsApp number"
                        value={whatsApp}
                        onChange={(e) => setWhatsApp(e.target.value)}
                        className="bg-white flex-1 px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-pink-500"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 text-sm font-medium rounded-r hover:bg-gray-800 transition-colors"
                >
                    SUBSCRIBE
                </button>
            </form>
        </div>

        {/* Consent text */}
        <p className="text-xs text-gray-600 leading-relaxed">
            By clicking SUBSCRIBE, you agree to our{' '}
            <a href="#" className="hover:text-gray-900 text-blue-700 underline">Privacy Policy & Cookies</a>.
            To unsubscribe from marketing emails, visit our{' '}
            <a href="#" className="hover:text-gray-900 text-blue-700 underline">Privacy Center</a>.
        </p>
    </div>
);
}

export default Newsletter;