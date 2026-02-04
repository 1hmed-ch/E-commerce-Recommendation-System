//PaymentIcons.jsx
import React from 'react';
import { 
    SiVisa, 
    SiMastercard, 
    SiKlarna,
    SiPaypal, 
    SiApplepay,
    SiGooglepay,
    SiAmericanexpress
} from 'react-icons/si';

function PaymentIcons() {
    const payments = [
        { 
            component: <SiVisa className="text-blue-900" size={40} />, 
            name: 'Visa'
        },
        { 
            component: <SiMastercard className="text-red-600" size={33} />, 
            name: 'Mastercard'
        },
        { 
            component: <SiPaypal className="text-blue-500" size={33} />, 
            name: 'PayPal'
        },
        { 
            component: <SiKlarna className="text-blue-500" size={33} />, 
            name: 'Klarna'
        },
        { 
            component: <SiApplepay className="text-black" size={33} />, 
            name: 'Apple Pay'
        },
        { 
            component: <SiGooglepay className="text-black" size={33} />, 
            name: 'Google Pay'
        },
        { 
            component: <SiAmericanexpress className="text-blue-600" size={33} />, 
            name: 'Amex'
        },
    ];

    return (
        <div className="flex gap-4 items-center">
            {payments.map((payment, index) => (
                <div 
                    key={index} 
                    className={`flex flex-col items-center justify-center p-2  transition-shadow duration-300 cursor-default`}
                    title={payment.name}
                >
                    <div className="mb-2">{payment.component}</div>
                </div>
            ))}
        </div>
    );
}

export default PaymentIcons;