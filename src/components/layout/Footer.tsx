import React from 'react';
import { Mail, Phone, MapPin, Facebook, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">SORECO-1</h3>
            <p className="text-sm leading-relaxed">
              Sorsogon I Electric Cooperative, Inc. (SORECO-1) is dedicated to providing reliable and affordable electric service to the people of Sorsogon.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Bulan, Sorsogon, Philippines
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                (056) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                info@soreco1.com.ph
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Globe className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} SORECO-1 Consumer Service Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
