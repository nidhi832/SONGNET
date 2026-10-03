import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { MOCK_ARTISTS, MOCK_ALBUMS } from '../../data/mockData';
import TrackRow from '../common/TrackRow';
import AlbumCard from '../common/AlbumCard';
import ArtistCard from '../common/ArtistCard';
import { Play, UserPlus, UserCheck, Radio, Sparkles, Disc, Flame } from 'lucide-react';

interface ArtistDetailViewProps {
  artistId?: string;
  onSelectAlbum?: (albumId: string) => void;
}

export const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({ artistId, onSelectAlbum }) => {
  const { selectedArtist, playTrack } = usePlayer();

  const artist = (artistId ? MOCK_ARTISTS.find(a => a.id === artistId) : null) || selectedArtist || MOCK_ARTISTS[0];

  const [isFollowing, setIsFollowing] = useState<boolean>(artist.isFollowing || false);

  const handlePlayArtist = () => {
    if (artist.popularTracks && artist.popularTracks.length > 0) {
      playTrack(artist.popularTracks[0], artist.popularTracks);
    }
  };

  const relatedArtists = MOCK_ARTISTS.filter(a => a.id !== artist.id).slice(0, 4);

  return (
    <div className="space-y-10 pb-12 animate-fade-in">
      {/* Artist Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-card/80 via-card/40 to-card/20 p-8 sm:p-12 border border-white/10 flex flex-col md:flex-row items-center md:items-end gap-8 backdrop-blur-xl">
        {/* Banner Background Image */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none bg-cover bg-center blur-md scale-105"
          style={{ backgroundImage: `url(${artist.bannerUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

        {/* Circular Avatar */}
        <div className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl shrink-0 border-4 border-white/10 group">
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Metadata */}
        <div className="relative z-10 flex-1 text-center md:text-left space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Verified Artist
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            {artist.name}
          </h1>

          <p className="text-sm text-text-secondary max-w-xl line-clamp-2">
            {artist.bio}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-text-muted pt-1">
            <span className="text-white font-medium">{artist.monthlyListeners} Monthly Listeners</span>
            <span>•</span>
            <span>{artist.followers} Followers</span>
            <span>•</span>
            <span className="capitalize">{artist.genre}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-4">
            <button
              onClick={handlePlayArtist}
              className="px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" /> Play Popular
            </button>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-5 py-3 rounded-full border text-sm font-semibold flex items-center gap-2 transition-all ${
                isFollowing
                  ? 'bg-accent/15 border-accent/40 text-accent'
                  : 'bg-card hover:bg-card-hover border-white/10 text-white'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" /> Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Follow
                </>
              )}
            </button>
            <button className="p-3 rounded-full bg-card hover:bg-card-hover border border-white/10 text-text-secondary hover:text-white transition-all">
              <Radio className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Tracks */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Popular Tracks</h2>
        </div>

        <div className="space-y-1">
          {artist.popularTracks?.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx + 1}
              playlistContext={artist.popularTracks}
            />
          ))}
        </div>
      </section>

      {/* Discography / Albums */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Discography</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_ALBUMS.filter(a => a.artistId === artist.id || a.artist === artist.name).map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => onSelectAlbum?.(album.id)}
            />
          ))}
        </div>
      </section>

      {/* Fans Also Like */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Fans Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {relatedArtists.map((relArtist) => (
            <ArtistCard key={relArtist.id} artist={relArtist} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArtistDetailView;
