import React from 'react';
import { Tag, PackageCheck } from 'lucide-react';

function ReductionCard() {
    return (
        <div className="flex justify-between items-center bg-pink-50 border border-pink-100 rounded-lg mt-4 p-4 text-center text-sm">
            <div className="flex-1">
                <Tag size={16} className="mx-auto text-center"/>
                <p className="font-bold text-sm">SHEIN CLUB</p>
                <p className="text-gray-600 text-xs">5% de réduction</p>
            </div>
            <div className="border-l border-gray-300 mx-2 h-10"></div>
            <div className="flex-1">
                <PackageCheck size={16} className="mx-auto text-center"/>
                <p className="font-bold text-sm">Livraison Gratuite</p>
                <p className="text-gray-600 text-xs">1ère commande</p>
            </div>
        </div>
    );
}

export default ReductionCard;