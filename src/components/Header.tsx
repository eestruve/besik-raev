import React, { useState } from 'react';
import { Volume2, VolumeX, Menu, X, Calendar, Sparkles, Disc3 } from 'lucide-react';

interface HeaderProps {
  isPlaying?: boolean;
  isMuted?: boolean;
  onToggleSound?: () => void;
  uiEdition?: '21st' | 'classic';
  onChangeEdition?: (edition: '21st' | 'classic') => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPlaying = false,
  isMuted = false,
  onToggleSound,
  uiEdition = '21st',
  onChangeEdition,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Сцена', href: '#hero' },
    { label: 'Релизы', href: '#release' },
    { label: 'Концерты', href: '#concerts' },
    { label: 'Букинг', href: '#booking' },
    { label: 'Пасхалка', href: '#besroll' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="glass-panel rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between border border-[#F5E6CC]/10 shadow-2xl backdrop-blur-xl bg-[#0B0B0E]/85">
          {/* Logo */}
          <a
            href="#hero"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#F2A900] rounded-lg p-1"
          >
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#F2A900] to-[#FF7700] p-[2px] flex items-center justify-center shadow-lg shadow-[#F2A900]/20">
              <div className="w-full h-full rounded-full bg-[#0B0B0E] flex items-center justify-center overflow-hidden">
                <img
                  src="./assets/beslan_avatar.jpg"
                  alt="Besik Raev"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF7700] rounded-full border-2 border-[#0B0B0E] animate-ping" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-gradient-gold">
                BESIK RAEV
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#8E8E9F] font-semibold flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F2A900] animate-pulse" />
                Останься музыка
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#F5E6CC]/80 hover:text-[#F2A900] transition-colors duration-200 relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#F2A900] to-[#FF7700] group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          {/* Right Action Bar + Version Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Version Switcher Pill (V2 21st.dev vs V1 Classic) */}
            {onChangeEdition && (
              <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-[#14141B] border border-[#F2A900]/35">
                <button
                  type="button"
                  onClick={() => onChangeEdition('21st')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all ${
                    uiEdition === '21st'
                      ? 'bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] shadow'
                      : 'text-[#8E8E9F] hover:text-[#F5E6CC]'
                  }`}
                  title="Версия с компонентами 21st.dev MCP"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden xs:inline sm:inline">21st.dev </span>
                  <span>V2</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeEdition('classic')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all ${
                    uiEdition === 'classic'
                      ? 'bg-[#F5E6CC] text-[#0B0B0E] shadow'
                      : 'text-[#8E8E9F] hover:text-[#F5E6CC]'
                  }`}
                  title="Классическая версия V1"
                >
                  <Disc3 className="w-3 h-3" />
                  <span>V1</span>
                </button>
              </div>
            )}

            {/* Live Audio Indicator & Toggle */}
            {onToggleSound && (
              <button
                type="button"
                onClick={onToggleSound}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/10 text-xs font-medium text-[#F5E6CC] hover:border-[#F2A900]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#F2A900]"
                aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
                title={isMuted ? 'Включить звук' : 'Звук включен'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-[#8E8E9F]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#F2A900]" />
                )}
                <span className="hidden xl:inline">
                  {isMuted ? 'Без звука' : 'Живой звук'}
                </span>
                {isPlaying && !isMuted && (
                  <span className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="w-0.5 h-2 bg-[#F2A900] animate-bounce" />
                    <span className="w-0.5 h-3 bg-[#FF7700] animate-bounce [animation-delay:0.15s]" />
                    <span className="w-0.5 h-1.5 bg-[#F2A900] animate-bounce [animation-delay:0.3s]" />
                  </span>
                )}
              </button>
            )}

            {/* Booking CTA Button */}
            <a
              href="#booking"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-bold text-xs uppercase tracking-wider hover:opacity-95 hover:shadow-lg hover:shadow-[#F2A900]/25 transition-all duration-300"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Букинг</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#1A1A22] text-[#F5E6CC] hover:text-[#F2A900] focus:outline-none focus:ring-2 focus:ring-[#F2A900]"
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4">
          <div className="glass-panel-gold rounded-2xl p-4 flex flex-col gap-3 border border-[#F2A900]/30 shadow-2xl animate-in fade-in duration-200">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-[#F5E6CC] hover:bg-[#F2A900]/10 hover:text-[#F2A900] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-[#F5E6CC]/10 flex flex-col gap-2">
              <a
                href="#booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-bold text-sm uppercase tracking-wider shadow-md"
              >
                Забронировать выступление
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
