import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
  ];

  const footerLinks = {
    company: [
      { name: 'Über uns', href: '#' },
      { name: 'Team', href: '#' },
      { name: 'Karriere', href: '#' },
      { name: 'Presse', href: '#' },
    ],
    services: [
      { name: 'Eventplanung', href: '#services' },
      { name: 'Konferenzen', href: '#services' },
      { name: 'Gala-Events', href: '#services' },
      { name: 'Live-Marketing', href: '#services' },
    ],
    legal: [
      { name: 'Impressum', href: '#' },
      { name: 'Datenschutz', href: '#' },
      { name: 'AGB', href: '#' },
      { name: 'Cookies', href: '#' },
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
              <span className="text-xl font-bold">NION Eventmanagement</span>
            </div>
            
            <p className="text-body text-muted-foreground max-w-md">
              Wir verwandeln Ihre Visionen in unvergessliche Events. 
              Professionell, kreativ und mit Leidenschaft für Details.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mr-3" />
                info@nion-events.de
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mr-3" />
                +49 (0) 123 456 789
              </div>
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

          {/* Services Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Leistungen</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
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

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Rechtliches</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
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
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 NION Eventmanagement. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center space-x-6">
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Sitemap
              </a>
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Newsletter
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;