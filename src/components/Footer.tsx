import { Facebook, Instagram, Mail, Phone, Cookie } from 'lucide-react';

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
      { name: 'Unternehmen', href: '#unternehmen' },
      { name: 'Team', href: '#' },
    ],
    services: [
      { name: 'Eventplanung', href: '#services' },
      { name: 'Konferenzen', href: '#services' },
      { name: 'Gala-Events', href: '#services' },
      { name: 'Live-Marketing', href: '#services' },
    ],
    legal: [
      { name: 'Cookies', href: '#', isButton: true },
      { name: 'Impressum', href: '/impressum' },
      { name: 'Datenschutz', href: '/datenschutz' },
      { name: 'AGB', href: '/agb' },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold">NION Events</span>
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
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services List */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Leistungen</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                DJ & Musik
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                Eventplanung
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                Hochzeiten & Feiern
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                Corporate Events
              </li>
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
                      <Cookie className="w-4 h-4 mr-2" />
                      {link.name}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
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