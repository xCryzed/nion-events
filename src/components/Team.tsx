import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Crown, Music, Camera, Wrench, Headphones } from 'lucide-react';
import nino from '@/assets/team/nino.webp';
import dogan from '@/assets/team/dogan.webp';
import ben from '@/assets/team/ben.webp';
import steven from '@/assets/team/steven.webp';
import devin from '@/assets/team/devin.webp';
import alex from '@/assets/team/alex.webp';
import rene from '@/assets/team/rene.webp';
import robin from '@/assets/team/robin.webp';

interface TeamMember {
  name: string;
  role: string;
  position: string;
  description: string;
  badges: string[];
  icon: React.ReactNode;
  image?: string;
}

const Team = () => {
  const teamMembers: TeamMember[] = [
    {
      name: 'Nino',
      role: 'DJ',
      position: 'CEO & DJ',
      description: 'Kreiert Mashups und einzigartige Song-Variationen, die Klassiker neu erfinden und die Crowd überraschen.',
      badges: ['Open Format DJ', 'Event Planner'],
      icon: <Crown className="w-6 h-6" />,
      image: nino
    },
    {
      name: 'Dogan',
      role: 'DJ',
      position: 'DJ Specialist',
      description: 'Setzt den Standard für Hip-Hop-DJing – energiegeladen, präzise und mit tiefem Gespür für die Kultur.',
      badges: ['Hip-Hop DJ', 'Content Creator'],
      icon: <Music className="w-6 h-6" />,
      image: dogan
    },
    {
      name: 'Steven',
      role: 'DJ',
      position: 'DJ Specialist',
      description: 'Vereint authentischen Hip-Hop mit pulsierenden Latin-Rhythmen – stilistisch sicher und musikalisch grenzenlos.',
      badges: ['Hip-Hop DJ', 'Open Format DJ'],
      icon: <Music className="w-6 h-6" />,
      image: steven
    },
    {
      name: 'Ben',
      role: 'DJ',
      position: 'DJ Specialist',
      description: 'Bringt höchste technische Finesse und musikalische Vielseitigkeit mit – ein DJ, der jedes Publikum punktgenau abholt.',
      badges: ['Open Format DJ', 'Hip-Hop DJ'],
      icon: <Headphones className="w-6 h-6" />,
      image: ben
    },
    {
      name: 'Alex',
      role: 'Foto- & Videograf',
      position: 'Visual Creator',
      description: 'Setzt die größten Festivals Deutschlands mit seinen Aftermovies atmosphärisch und stilbewusst in Szene.',
      badges: ['Photographer', 'Videographer', 'Content Creator'],
      icon: <Camera className="w-6 h-6" />,
      image: alex
    },
    {
      name: 'Rene',
      role: 'Techniker',
      position: 'Technical Expert',
      description: 'Technikprofi mit umfassendem Know-how und jahrelanger Erfahrung für perfekte Bühnen- und Veranstaltungstechnik.',
      badges: ['Lighting Expert', 'Sound Engineer'],
      icon: <Wrench className="w-6 h-6" />,
      image: rene
    },
    {
      name: 'Devin',
      role: 'Techniker',
      position: 'Technical Expert',
      description: 'Sorgt mit präziser Licht- und Tontechnik für ein beeindruckendes Event-Ambiente und unvergessliche Momente.',
      badges: ['Lighting Expert', 'Sound Engineer'],
      icon: <Wrench className="w-6 h-6" />,
      image: devin
    },
    {
      name: 'Robin',
      role: 'Techniker',
      position: 'Technical Expert',
      description: 'Von der ersten Verkabelung bis zum letzten Feinschliff – er liefert Technik, die beeindruckt und funktioniert.',
      badges: ['Lighting Expert', 'Sound Engineer'],
      icon: <Wrench className="w-6 h-6" />,
      image: robin
    }
  ];

  const getBadgeVariant = (badge: string) => {
    const variants: Record<string, string> = {
      'Event Planner': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none',
      'Photographer': 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none',
      'Open Format DJ': 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none',
      'Content Creator': 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-none',
      'Hip-Hop DJ': 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none',
      'Videographer': 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none',
      'Sound Engineer': 'bg-gradient-to-r from-slate-600 to-zinc-600 text-white border-none',
      'Lighting Expert': 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white border-none',
      'Visual Artist': 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-none'
    };
    return variants[badge] || 'bg-secondary text-secondary-foreground';
  };

  return (
    <section id="team" className="section-padding relative overflow-hidden">
      {/* Background with gradient and floating elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background"></div>
      <div className="absolute top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[800px] h-[200px] sm:h-[400px] bg-gradient-to-r from-primary/3 via-transparent to-accent/3 rounded-full blur-3xl"></div>

      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="container relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-display mb-6">
            <span className="text-foreground">Das </span><span className="text-gradient">Team</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto mb-8"></div>
          <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
            Lernen Sie das kreative Powerhouse hinter NION Events kennen.
            Jeder bringt einzigartige Talente und Leidenschaft mit, um Ihre Vision zum Leben zu erwecken.
          </p>
        </div>

        {/* Team Grid - All members including Nino */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={member.name}
                className="glass-card hover-lift p-6 text-center group animate-fade-in bg-gradient-to-br from-card to-card/30 relative"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="relative mb-6">
                  {member.image ? (
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-all duration-300 group-hover:shadow-glow">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center border transition-all duration-300 group-hover:shadow-glow bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 group-hover:border-primary/60">
                      <div className="transition-colors duration-300 text-primary group-hover:text-accent">
                        {member.icon}
                      </div>
                    </div>
                  )}
                </div>

                <h4 className="text-xl font-bold mb-2 group-hover:text-gradient transition-all duration-300">
                  {member.name}
                </h4>
                <p className="text-accent font-semibold mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {member.description}
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  {member.badges.map((badge, badgeIndex) => (
                    <Badge
                      key={badgeIndex}
                      className={getBadgeVariant(badge)}
                      variant="outline"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-title text-gradient mb-4">
              Bereit für Ihr nächstes Event?
            </h3>
            <p className="text-muted-foreground mb-6">
              Unser erfahrenes Team steht bereit, um Ihre Vision in die Realität umzusetzen.
            </p>
            <a href="#contact">
              <button className="btn-hero">
                Jetzt kontaktieren
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;