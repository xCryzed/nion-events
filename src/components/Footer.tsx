import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  Cookie,
  FileText,
  Shield,
  ScrollText,
  Building2,
  Users,
  Disc3,
  Lightbulb,
  Calendar,
  Home,
  Briefcase, Star,
  CheckCircle,
  Camera
} from 'lucide-react';
import nionLogo from '@/assets/nion-logo-white.svg';

const openCookieSettings = () => {
  // Trigger cookie banner to show again
  localStorage.removeItem('cookieConsent');
  window.dispatchEvent(new Event('cookieSettingsOpen'));
};

const Footer = () => {
  const socialLinks = [
    {name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/nion.official'},
    {name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/officialnion'},
    {
      name: 'TikTok', icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ), href: 'https://www.tiktok.com/@official.nion'
    },
    {
      name: 'Soundcloud', icon: () => (
        <svg className="w-5 h-5" fill="#ffffff" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
             viewBox="-271 345.8 256 111.2" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier"> <g> <path
            d="M-238.4,398.1c-0.8,0-1.4,0.6-1.5,1.5l-2.3,28l2.3,27.1c0.1,0.8,0.7,1.5,1.5,1.5c0.8,0,1.4-0.6,1.5-1.5l2.6-27.1l-2.6-28 C-237,398.7-237.7,398.1-238.4,398.1z"></path>
            <path
              d="M-228.2,399.9c-0.9,0-1.7,0.7-1.7,1.7l-2.1,26l2.1,27.3c0.1,1,0.8,1.7,1.7,1.7c0.9,0,1.6-0.7,1.7-1.7l2.4-27.3l-2.4-26 C-226.6,400.6-227.3,399.9-228.2,399.9z"></path>
            <path
              d="M-258.6,403.5c-0.5,0-1,0.4-1.1,1l-2.5,23l2.5,22.5c0.1,0.6,0.5,1,1.1,1c0.5,0,1-0.4,1.1-1l2.9-22.5l-2.9-23 C-257.7,404-258.1,403.5-258.6,403.5z"></path>
            <path
              d="M-268.1,412.3c-0.5,0-1,0.4-1,1l-1.9,14.3l1.9,14c0.1,0.6,0.5,1,1,1s0.9-0.4,1-1l2.2-14l-2.2-14.2 C-267.2,412.8-267.6,412.3-268.1,412.3z"></path>
            <path
              d="M-207.5,373.5c-1.2,0-2.1,0.9-2.2,2.1l-1.9,52l1.9,27.2c0.1,1.2,1,2.1,2.2,2.1s2.1-0.9,2.2-2.1l2.1-27.2l-2.1-52 C-205.4,374.4-206.4,373.5-207.5,373.5z"></path>
            <path
              d="M-248.6,399c-0.7,0-1.2,0.5-1.3,1.3l-2.4,27.3l2.4,26.3c0.1,0.7,0.6,1.3,1.3,1.3c0.7,0,1.2-0.5,1.3-1.2l2.7-26.3l-2.7-27.3 C-247.4,399.6-247.9,399-248.6,399z"></path>
            <path
              d="M-217.9,383.4c-1,0-1.9,0.8-1.9,1.9l-2,42.3l2,27.3c0.1,1.1,0.9,1.9,1.9,1.9s1.9-0.8,1.9-1.9l2.3-27.3l-2.3-42.3 C-216,384.2-216.9,383.4-217.9,383.4z"></path>
            <path
              d="M-154.4,359.3c-1.8,0-3.2,1.4-3.2,3.2l-1.2,65l1.2,26.1c0,1.8,1.5,3.2,3.2,3.2c1.8,0,3.2-1.5,3.2-3.2l1.4-26.1l-1.4-65 C-151.1,360.8-152.6,359.3-154.4,359.3z"></path>
            <path
              d="M-197.1,368.9c-1.3,0-2.3,1-2.4,2.4l-1.8,56.3l1.8,26.9c0,1.3,1.1,2.3,2.4,2.3s2.3-1,2.4-2.4l2-26.9l-2-56.3 C-194.7,370-195.8,368.9-197.1,368.9z"></path>
            <path
              d="M-46.5,394c-4.3,0-8.4,0.9-12.2,2.4C-61.2,368-85,345.8-114,345.8c-7.1,0-14,1.4-20.1,3.8c-2.4,0.9-3,1.9-3,3.7v99.9 c0,1.9,1.5,3.5,3.4,3.7c0.1,0,86.7,0,87.3,0c17.4,0,31.5-14.1,31.5-31.5C-15,408.1-29.1,394-46.5,394z"></path>
            <path
              d="M-143.6,353.2c-1.9,0-3.4,1.6-3.5,3.5l-1.4,70.9l1.4,25.7c0,1.9,1.6,3.4,3.5,3.4c1.9,0,3.4-1.6,3.5-3.5l1.5-25.8l-1.5-70.9 C-140.2,354.8-141.7,353.2-143.6,353.2z"></path>
            <path
              d="M-186.5,366.8c-1.4,0-2.5,1.1-2.6,2.6l-1.6,58.2l1.6,26.7c0,1.4,1.2,2.6,2.6,2.6s2.5-1.1,2.6-2.6l1.8-26.7l-1.8-58.2 C-184,367.9-185.1,366.8-186.5,366.8z"></path>
            <path
              d="M-175.9,368.1c-1.5,0-2.8,1.2-2.8,2.8l-1.5,56.7l1.5,26.5c0,1.6,1.3,2.8,2.8,2.8s2.8-1.2,2.8-2.8l1.7-26.5l-1.7-56.7 C-173.1,369.3-174.3,368.1-175.9,368.1z"></path>
            <path
              d="M-165.2,369.9c-1.7,0-3,1.3-3,3l-1.4,54.7l1.4,26.3c0,1.7,1.4,3,3,3c1.7,0,3-1.3,3-3l1.5-26.3l-1.5-54.7 C-162.2,371.3-163.5,369.9-165.2,369.9z"></path> </g> </g></svg>
      ), href: 'https://soundcloud.com/officialnion'
    },
  ];

  const footerLinks = {
    company: [
      {name: 'Unternehmen', href: '#unternehmen', icon: Building2},
      {name: 'Team', href: '#', icon: Users},
    ],
    legal: [
      {name: 'Cookies', href: '#', isButton: true, icon: Cookie},
      {name: 'Impressum', href: '/impressum', icon: FileText},
      {name: 'Datenschutz', href: '/datenschutz', icon: Shield},
      {name: 'AGB', href: '/agb', icon: ScrollText},
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center">
              <img src={nionLogo} alt="NION Events Logo" className="h-16 w-auto"/>
            </div>

            <p className="text-body text-muted-foreground max-w-md">
              Wir verwandeln Ihre Visionen in unvergessliche Events.
              Professionell, kreativ und mit Leidenschaft für Details.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:info@nion-events.de"
                 className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                info@nion-events.de
              </a>
              <a href="tel:+4915752046096"
                 className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                +49 1575 2046096
              </a>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-secondary hover:bg-primary hover:shadow-glow rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label={social.name}
                  target="_blank"
                >
                  <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors"/>
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Unternehmen</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    <link.icon className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Rechtliches</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  {link.isButton ? (
                    <button
                      onClick={openCookieSettings}
                      className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      <link.icon className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                      {link.name}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      <link.icon className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services List */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Leistungen</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-muted-foreground">
                <Disc3 className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                Professioneller DJ-Service
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Lightbulb className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                Licht-, Ton und Technik
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Camera className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                Foto- und Videoproduktion
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                Konzeption & Eventplanung
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Home className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                Private Events
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                Business-Events
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Star className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                Spezialformate
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0"/>
                Full-Service
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NION Events. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;