import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Download, Calendar, Users, Award, Image, Eye, ExternalLink, Music, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

import nionPortrait from '@/assets/artists/nion-portrait.jpg';
import deePortrait from '@/assets/artists/dee-portrait.jpg';
import nionLive from '@/assets/artists/nion-live.jpg';
import deeLive from '@/assets/artists/dee-live.jpg';

const Presse = () => {
  const [selectedArtist, setSelectedArtist] = useState('NION');

  const artists = {
    NION: {
      name: "NION",
      genre: "Electronic / Progressive House",
      description: "NION ist ein innovativer Electronic Music Producer, der für seine atmosphärischen Soundscapes und energiegeladenen Live-Performances bekannt ist. Seine Musik vereint Progressive House mit cineastischen Elementen.",
      image: nionPortrait,
      liveImage: nionLive,
      stats: {
        tracks: "50+",
        streams: "2.5M+",
        events: "100+",
        labels: "15+"
      },
      pressKit: [
        {
          title: "Artist Portrait (High-Res)",
          format: "JPG",
          size: "3.2 MB",
          resolution: "1024x1024"
        },
        {
          title: "Live Performance Photos",
          format: "JPG",
          size: "5.8 MB",
          resolution: "1920x1080"
        },
        {
          title: "Artist Biography",
          format: "PDF",
          size: "1.2 MB",
          resolution: "A4"
        },
        {
          title: "Technical Rider",
          format: "PDF",
          size: "0.8 MB",
          resolution: "A4"
        }
      ],
      socialLinks: {
        spotify: "#",
        soundcloud: "#",
        instagram: "#",
        youtube: "#"
      }
    },
    DEE: {
      name: "DEE",
      genre: "Tech House / Minimal",
      description: "DEE bringt mit ihrem unverwechselbaren Tech House Sound die Clubs zum Kochen. Ihre Sets sind eine perfekte Mischung aus hypnotischen Rhythmen und kraftvollen Basslines.",
      image: deePortrait,
      liveImage: deeLive,
      stats: {
        tracks: "35+",
        streams: "1.8M+",
        events: "80+",
        labels: "12+"
      },
      pressKit: [
        {
          title: "Artist Portrait (High-Res)",
          format: "JPG",
          size: "2.9 MB",
          resolution: "1024x1024"
        },
        {
          title: "Live Performance Photos",
          format: "JPG",
          size: "4.7 MB",
          resolution: "1920x1080"
        },
        {
          title: "Artist Biography",
          format: "PDF",
          size: "1.1 MB",
          resolution: "A4"
        },
        {
          title: "Technical Rider",
          format: "PDF",
          size: "0.7 MB",
          resolution: "A4"
        }
      ],
      socialLinks: {
        spotify: "#",
        soundcloud: "#",
        instagram: "#",
        youtube: "#"
      }
    }
  };

  const currentArtist = artists[selectedArtist as keyof typeof artists];

  return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Artist Press Center</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Pressmaterial, Bilder und Informationen zu unseren Artists für Medien und Veranstalter.
              </p>
            </div>

            {/* Artist Selection */}
            <section className="mb-16">
              <div className="flex justify-center">
                <div className="glass-card p-2 rounded-2xl">
                  <div className="flex gap-2">
                    {Object.keys(artists).map((artistKey) => (
                        <button
                            key={artistKey}
                            onClick={() => setSelectedArtist(artistKey)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                selectedArtist === artistKey
                                    ? 'bg-gradient-primary text-white shadow-glow'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            }`}
                        >
                          {artistKey}
                        </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Selected Artist Profile */}
            <section className="mb-16">
              <div className="glass-card overflow-hidden rounded-3xl max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Artist Image & Info */}
                  <div className="relative">
                    <div className="aspect-square lg:aspect-auto lg:h-full overflow-hidden">
                      <img
                          src={currentArtist.image}
                          alt={currentArtist.name}
                          className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-3xl font-bold text-white mb-2">{currentArtist.name}</h2>
                        <p className="text-primary-glow font-medium">{currentArtist.genre}</p>
                      </div>
                    </div>
                  </div>

                  {/* Artist Details */}
                  <div className="p-8 lg:p-12">
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Artist Info</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {currentArtist.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-secondary/30 rounded-xl">
                          <div className="text-2xl font-bold text-primary">{currentArtist.stats.tracks}</div>
                          <div className="text-sm text-muted-foreground">Tracks</div>
                        </div>
                        <div className="text-center p-4 bg-secondary/30 rounded-xl">
                          <div className="text-2xl font-bold text-primary">{currentArtist.stats.streams}</div>
                          <div className="text-sm text-muted-foreground">Streams</div>
                        </div>
                        <div className="text-center p-4 bg-secondary/30 rounded-xl">
                          <div className="text-2xl font-bold text-primary">{currentArtist.stats.events}</div>
                          <div className="text-sm text-muted-foreground">Events</div>
                        </div>
                        <div className="text-center p-4 bg-secondary/30 rounded-xl">
                          <div className="text-2xl font-bold text-primary">{currentArtist.stats.labels}</div>
                          <div className="text-sm text-muted-foreground">Labels</div>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm">
                          <Music className="h-4 w-4 mr-2" />
                          Spotify
                        </Button>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          SoundCloud
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Instagram
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Performance Gallery */}
            <section className="mb-16">
              <h2 className="text-3xl font-semibold mb-8 text-center">Live Performance</h2>
              <div className="max-w-4xl mx-auto">
                <div className="glass-card overflow-hidden rounded-2xl hover-lift group">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                        src={currentArtist.liveImage}
                        alt={`${currentArtist.name} Live Performance`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="secondary" className="bg-black/50 text-white border-white/20 hover:bg-black/70">
                        <Download className="h-4 w-4 mr-2" />
                        Download HD
                      </Button>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-xl font-bold text-white mb-2">{currentArtist.name} Live</h3>
                      <p className="text-white/80">High-resolution performance photography • 1920x1080</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Press Kit Downloads */}
            <section>
              <h2 className="text-3xl font-semibold mb-8 text-center">Press Kit Downloads</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {currentArtist.pressKit.map((item, index) => (
                    <div key={index} className="glass-card p-6 rounded-2xl text-center hover-lift">
                      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Download className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{item.format}</p>
                      <p className="text-xs text-muted-foreground mb-1">{item.size}</p>
                      <p className="text-xs text-muted-foreground mb-4">{item.resolution}</p>
                      <Button className="btn-hero w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                ))}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
  );
};

export default Presse;