import React from 'react';
import { ExternalLink, Headphones, Disc3, Play, Pause, Sparkles } from 'lucide-react';
import { Track } from '../types';
import { DISCOGRAPHY_TRACKS } from '../utils/playerUtils';
import { VinylAlbumCard21st } from './ui21/VinylAlbumCard21st';

export { DISCOGRAPHY_TRACKS };

interface StreamingLinksProps {
  currentTrackId?: string;
  isPlaying?: boolean;
  onSelectTrack?: (track: Track) => void;
  uiEdition?: '21st' | 'classic';
}

export const STREAMING_PLATFORMS_DATA = [
  {
    name: 'Яндекс Музыка',
    format: 'FLAC Lossless',
    url: 'https://music.yandex.ru/artist/besik_raev',
    color: '#FFCC00',
    description: 'Официальная карточка артиста и чарты',
  },
  {
    name: 'VK Музыка',
    format: 'Стерео 320 kbps',
    url: 'https://vk.com/artist/besikraev',
    color: '#0077FF',
    description: 'Плейлисты и сообщество слушателей',
  },
  {
    name: 'Apple Music',
    format: 'Spatial Audio / ALAC',
    url: 'https://music.apple.com/artist/besik-raev',
    color: '#FA243C',
    description: 'Студийный мастер Apple Digital Master',
  },
  {
    name: 'Spotify',
    format: 'Original Mix',
    url: 'https://open.spotify.com/artist/besikraev',
    color: '#1DB954',
    description: 'Международные релизы и Discover Weekly',
  },
  {
    name: 'YouTube Music',
    format: 'Live Video & Audio',
    url: 'https://music.youtube.com/channel/besikraev',
    color: '#FF0000',
    description: 'Концертные видео и клипы',
  },
  {
    name: 'Звук (Zvuk)',
    format: 'Hi-Fi 24-bit',
    url: 'https://zvuk.com/artist/besikraev',
    color: '#00E5FF',
    description: 'Hi-Fi стриминг без сжатия',
  },
];

export const StreamingLinks: React.FC<StreamingLinksProps> = ({
  currentTrackId = 'ostansya_muzyka',
  isPlaying = false,
  onSelectTrack,
  uiEdition = '21st',
}) => {
  return (
    <section id="release" className="space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A22] border border-[#F2A900]/30 text-xs text-[#F2A900] font-semibold">
          <Disc3 className="w-3.5 h-3.5" />
          <span>
            {uiEdition === '21st'
              ? '21st.dev • Great UI Vinyl Album Cards #23320'
              : 'Дискография & Стриминги'}
          </span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F5E6CC]">
          Слушайте Беслана на всех платформах
        </h2>
        <p className="text-sm text-[#8E8E9F] leading-relaxed">
          {uiEdition === '21st'
            ? 'Наведите курсор на конверт пластинки или включите трек — виниловый диск с обложкой на яблоке плавно выедет из конверта.'
            : 'Добавьте ключевой релиз «Останься музыка» и другие синглы в свои плейлисты. Слушайте в Hi-Fi качестве без потерь.'}
        </p>
      </div>

      {/* Discography Track Switcher */}
      {uiEdition === '21st' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-6xl mx-auto">
          {DISCOGRAPHY_TRACKS.map((track) => (
            <VinylAlbumCard21st
              key={track.id}
              track={track}
              isCurrent={track.id === currentTrackId}
              isPlaying={isPlaying}
              onSelectTrack={onSelectTrack}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {DISCOGRAPHY_TRACKS.map((track) => {
            const isCurrent = track.id === currentTrackId;

            return (
              <div
                key={track.id}
                className={`glass-panel rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between gap-4 group ${
                  isCurrent
                    ? 'border-[#F2A900] bg-gradient-to-b from-[#1A1A22] to-[#121217] shadow-xl shadow-[#F2A900]/10'
                    : 'border-[#F5E6CC]/10 hover:border-[#F2A900]/50 hover:bg-[#1A1A22]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#F2A900]/30 shadow">
                    <img
                      src={track.coverSrc}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-[#0B0B0E]/60 flex items-center justify-center">
                        <span className="flex items-end gap-0.5 h-4">
                          <span className="w-1 h-3 bg-[#F2A900] animate-bounce" />
                          <span className="w-1 h-4 bg-[#FF7700] animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1 h-2 bg-[#F2A900] animate-bounce [animation-delay:0.3s]" />
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#F2A900] font-bold">
                        {track.year}
                      </span>
                      {track.isPreview ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#1A1A22] border border-[#F5E6CC]/20 text-[10px] text-[#F5E6CC]/70 font-medium">
                          {track.badgeText || 'Превью-фрагмент'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#F2A900]/20 border border-[#F2A900]/40 text-[10px] text-[#F2A900] font-bold">
                          {track.badgeText || 'Хит'}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF7700]/20 text-[10px] text-[#FF7700] font-bold">
                          В плеере
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-base text-[#F5E6CC] truncate mt-0.5">
                      {track.title}
                    </h3>
                    <p className="text-xs text-[#8E8E9F] truncate">{track.genre}</p>
                    {track.isPreview && (
                      <p className="text-[11px] text-[#8E8E9F] italic flex items-center gap-1 mt-1">
                        <Sparkles className="w-3 h-3 text-[#F2A900]/70 flex-shrink-0" />
                        <span>Демо-фрагмент. Полный трек на стримингах</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {onSelectTrack && (
                  <button
                    type="button"
                    onClick={() => onSelectTrack(track)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] shadow-md shadow-[#F2A900]/20'
                        : 'bg-[#1A1A22] text-[#F5E6CC] hover:bg-[#F2A900] hover:text-[#0B0B0E]'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Пауза</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>
                          {isCurrent
                            ? 'Продолжить'
                            : track.isPreview
                            ? 'Слушать демо-фрагмент'
                            : 'Включить в плеере'}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Discography Clarification Banner */}
      <div className="max-w-3xl mx-auto bg-[#1A1A22]/60 border border-[#F5E6CC]/10 rounded-2xl p-4 text-center text-xs text-[#8E8E9F] leading-relaxed shadow-lg">
        <span className="text-[#F2A900] font-semibold">💡 О дискографии в веб-плеере:</span> В аналоговом виниловом плеере представлен полный релиз «Останься музыка» и ознакомительные фрагменты синглов. Для прослушивания полных версий «Макъ» и «Тенджыз» в студийном Hi-Fi качестве перейдите в ваш стриминговый сервис ниже.
      </div>

      {/* Streaming Platform Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto pt-4">
        {STREAMING_PLATFORMS_DATA.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-[#F5E6CC]/10 hover:border-[#F2A900]/60 hover:bg-[#1A1A22] transition-all group shadow-md hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/10 flex items-center justify-center group-hover:border-[#F2A900]/40 transition-colors">
              <Headphones className="w-5 h-5 text-[#F2A900] group-hover:text-[#FF7700] transition-colors" />
            </div>

            <span className="font-bold text-xs sm:text-sm text-[#F5E6CC] mt-1 group-hover:text-[#F2A900] transition-colors">
              {platform.name}
            </span>

            <span className="text-[10px] text-[#8E8E9F] font-mono tracking-wider">
              {platform.format}
            </span>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-[#F2A900] font-semibold mt-1">
              <span>Слушать</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
