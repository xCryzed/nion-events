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
  CheckCircle
} from 'lucide-react';
import nionLogo from '@/assets/NION_Logo_weiß.svg';

const openCookieSettings = () => {
  // Trigger cookie banner to show again
  localStorage.removeItem('cookieConsent');
  window.dispatchEvent(new Event('cookieSettingsOpen'));
};

const Footer = () => {
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/nion.official' },
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/officialnion' },
    { name: 'TikTok', icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ), href: 'https://www.tiktok.com/@official.nion' },
    { name: 'Email', icon: Mail, href: 'mailto:info@nion-events.de' },
  ];

  const footerLinks = {
    company: [
      { name: 'Unternehmen', href: '#unternehmen', icon: Building2 },
      { name: 'Team', href: '#', icon: Users },
    ],
    legal: [
      { name: 'Cookies', href: '#', isButton: true, icon: Cookie },
      { name: 'Impressum', href: '/impressum', icon: FileText },
      { name: 'Datenschutz', href: '/datenschutz', icon: Shield },
      { name: 'AGB', href: '/agb', icon: ScrollText },
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
              <img src={nionLogo} alt="NION Events Logo" className="h-16 w-auto" />
            </div>

            <p className="text-body text-muted-foreground max-w-md">
              Wir verwandeln Ihre Visionen in unvergessliche Events.
              Professionell, kreativ und mit Leidenschaft für Details.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:info@nion-events.de" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4 mr-3" />
                info@nion-events.de
              </a>
              <a href="tel:+4915752046096" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4 mr-3" />
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
                >
                  <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
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
                    <link.icon className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
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
                      <link.icon className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
                      {link.name}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      <link.icon className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
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
                <Disc3 className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
                Professioneller DJ-Service
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Lightbulb className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
                Licht-, Ton und Technik
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
                Konzeption & Eventplanung
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Home className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
                Private Events
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
                Business-Events
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Star className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
                Spezialformate
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0" />
                Full Service
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