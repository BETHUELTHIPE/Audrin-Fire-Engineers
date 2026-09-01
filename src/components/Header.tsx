import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { COMPANY_DETAILS } from '../data/initialData';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  FilePlus,
  Menu,
  X,
  User,
  Shield,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Wrench,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setIsRequestModalOpen,
    setPreselectedServiceForModal,
    setIsEmergencyModalOpen,
    currentUser,
    switchRole,
    logout
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const handleNavClick = (viewName: string) => {
    setActiveView(viewName);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRequestService = (serviceSlug?: string) => {
    setPreselectedServiceForModal(serviceSlug || null);
    setIsRequestModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const openEmergencyFault = () => {
    setIsEmergencyModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', view: 'home' },
    { name: 'About Us', view: 'about' },
    { name: 'Services', view: 'services' },
    { name: 'How We Work', view: 'how-we-work' },
    { name: 'Gallery', view: 'gallery' },
    { name: 'Contact Us', view: 'contact' }
  ];

  return (
    <>
      {/* Top Engineering Contact & Managing Director Direct Desk Bar in Dark Navy */}
      <div className="bg-[#071322] text-slate-300 text-xs font-mono py-2 px-4 sm:px-6 border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-2.5">
          
          {/* Managing Director & High-Priority Direct Channels */}
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 sm:gap-3">
            {/* Bethuel Managing Director Indicator Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#0D213F] text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-sm text-[11px] font-bold tracking-tight">
              <span className="w-2 h-2 rounded-full bg-[#CC0000] animate-pulse shrink-0"></span>
              <span className="text-slate-400 font-normal">Direct Contact:</span>
              <span className="text-white font-bold">Bethuel Moukangwe</span>
              <span className="text-[10px] uppercase tracking-wider text-[#FFB703] font-semibold bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded-xs">
                Managing Director
              </span>
            </div>

            {/* Direct Phone */}
            <a
              href={`tel:${COMPANY_DETAILS.telephone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-3 py-1 rounded-sm font-bold text-xs tracking-wide transition-all shadow-xs group cursor-pointer"
              title="Call Bethuel Moukangwe (Managing Director)"
            >
              <Phone className="w-3.5 h-3.5 text-white shrink-0 group-hover:scale-110 transition-transform" />
              <span>{COMPANY_DETAILS.telephone}</span>
            </a>

            {/* Direct Email */}
            <a
              href={`mailto:${COMPANY_DETAILS.email}`}
              className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-700 px-3 py-1 rounded-sm text-xs font-medium transition-all group cursor-pointer"
              title="Email Bethuel Moukangwe (Managing Director)"
            >
              <Mail className="w-3.5 h-3.5 text-[#FFB703] shrink-0 group-hover:text-amber-300" />
              <span className="hidden sm:inline font-mono">{COMPANY_DETAILS.email}</span>
              <span className="sm:hidden font-mono">Email Managing Director</span>
            </a>
          </div>

          {/* Right: Physical Address, Operating Hours & Role Switcher */}
          <div className="flex items-center flex-wrap justify-center gap-2.5 sm:gap-4 text-[11px]">
            {/* Address with Google Maps */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_DETAILS.physicalAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors group"
              title="27 Tshivhase Street, Pretoria West - Open in Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
              <span className="hidden 2xl:inline">{COMPANY_DETAILS.physicalAddress}</span>
              <span className="2xl:hidden">27 Tshivhase St, Pretoria West</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-red-400" />
            </a>

            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-[#FFB703]" />
              <span>07:00–20:00 (Mon–Sun)</span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <div className="hidden sm:inline-block text-slate-400 text-[10px]">
              <span>Reg No: <strong className="text-slate-200 font-mono">{COMPANY_DETAILS.registrationNumber}</strong></span>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer border border-slate-700"
                title="Switch test persona to explore Customer Portal, Staff, or Super Admin CMS"
              >
                <Shield className="w-3 h-3 text-[#FFB703]" />
                <span className="capitalize">{currentUser?.role || 'Guest'}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {isRoleSwitcherOpen && (
                <div
                  className="absolute right-0 mt-1 w-56 bg-[#0A192F] border border-slate-700 rounded-sm shadow-xl py-1 z-50 text-xs text-white"
                  onClick={() => setIsRoleSwitcherOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-800">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => switchRole('customer')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold">Customer User</div>
                      <div className="text-[10px] text-slate-400">Marcus (Tshwane Logistics)</div>
                    </div>
                    {currentUser?.role === 'customer' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => switchRole('staff')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold">Field Staff Engineer</div>
                      <div className="text-[10px] text-slate-400">Thabo Mokoena (Lead Tech)</div>
                    </div>
                    {currentUser?.role === 'staff' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => switchRole('superadmin')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold">Super Administrator</div>
                      <div className="text-[10px] text-slate-400">Bethuel Moukangwe (Managing Director)</div>
                    </div>
                    {currentUser?.role === 'superadmin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Security & Compliance Banner */}
      <div className="bg-[#CC0000] text-white text-[10px] sm:text-[11px] py-1 px-4 sm:px-6 font-bold tracking-wider border-b border-red-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>SANS 10139 COMPLIANT COMMERCIAL FIRE DETECTION SOLUTIONS</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-semibold">
            <span className="opacity-90">RAPID RESPONSE: TSHWANE &amp; GREATER GAUTENG</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <BrandLogo size="md" variant="dark" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-500">
            {navLinks.map((link) => {
              const isActive = activeView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`py-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#0A192F] border-b-2 border-[#CC0000] pb-1'
                      : 'hover:text-[#0A192F]'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Fault Support Pill */}
            <button
              onClick={openEmergencyFault}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#CC0000] hover:bg-red-50 border border-[#CC0000] px-3.5 py-2 rounded-sm transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#CC0000]" />
              <span>Fault Support</span>
            </button>

            {/* Request a Fire-Detection Service CTA */}
            <button
              onClick={() => openRequestService()}
              className="inline-flex items-center gap-2 bg-[#0A192F] hover:bg-slate-800 active:bg-slate-900 text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4 text-[#CC0000]" />
              <span>Request Service</span>
            </button>

            {/* Portal / Account Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-[#0A192F] px-3 py-2 rounded-sm text-xs font-bold border border-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-sm bg-[#0A192F] text-white flex items-center justify-center text-xs font-black">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate hidden md:inline-block">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-sm shadow-xl py-2 z-50 text-[#0A192F]"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="font-bold text-sm text-[#0A192F]">{currentUser.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-gray-100 text-[#0A192F]">
                        Role: {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('customer-portal')}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 flex items-center gap-2 text-[#0A192F]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-500" />
                      <span>Customer Portal</span>
                    </button>

                    {(currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.role === 'staff') && (
                      <button
                        onClick={() => handleNavClick('admin-portal')}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 flex items-center gap-2 text-[#CC0000]"
                      >
                        <Shield className="w-4 h-4 text-[#CC0000]" />
                        <span>Operations & Django CMS</span>
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-red-50 text-[#CC0000] flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('auth')}
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-[#0A192F] hover:bg-gray-50 rounded-sm transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick('auth')}
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-widest bg-[#0A192F] text-white hover:bg-slate-800 rounded-sm shadow-sm transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => openRequestService()}
              className="sm:hidden bg-[#0A192F] text-white p-2 rounded-sm text-xs font-bold"
              title="Request Service"
            >
              <FilePlus className="w-4 h-4 text-[#CC0000]" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-sm text-[#0A192F] hover:bg-gray-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 shadow-xl">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = activeView === link.view;
                return (
                  <button
                    key={link.view}
                    onClick={() => handleNavClick(link.view)}
                    className={`w-full text-left px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-gray-100 text-[#0A192F] border-l-4 border-[#CC0000]'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#CC0000]"></div>}
                  </button>
                );
              })}
            </div>

            {/* Mobile Direct Contact Card for Managing Director */}
            <div className="mt-3 p-3 bg-slate-900 text-white rounded-md border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Always Contact</span>
                <span className="text-[10px] uppercase font-bold text-[#FFB703] bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/50">
                  Managing Director
                </span>
              </div>
              <div className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#CC0000]" />
                <span>Bethuel Moukangwe</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <a
                  href={`tel:${COMPANY_DETAILS.telephone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#CC0000] hover:bg-red-700 text-white py-2 px-2 rounded-sm font-bold text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {COMPANY_DETAILS.telephone}</span>
                </a>
                <a
                  href={`mailto:${COMPANY_DETAILS.email}`}
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-2 rounded-sm font-medium border border-slate-700 text-center text-[11px]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => openRequestService()}
                className="w-full py-3 bg-[#0A192F] hover:bg-slate-800 text-white rounded-sm font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md"
              >
                <FilePlus className="w-4 h-4 text-[#CC0000]" />
                <span>Request a Fire-Detection Service</span>
              </button>

              <button
                onClick={openEmergencyFault}
                className="w-full py-2.5 bg-white text-[#CC0000] hover:bg-red-50 border-2 border-[#CC0000] rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-[#CC0000]" />
                <span>Report Fire-Alarm Fault</span>
              </button>

              <div className="pt-2">
                {currentUser ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavClick('customer-portal')}
                      className="w-full text-left px-4 py-2.5 text-xs bg-gray-100 rounded-sm font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Customer Portal ({currentUser.fullName})</span>
                    </button>
                    {(currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.role === 'staff') && (
                      <button
                        onClick={() => handleNavClick('admin-portal')}
                        className="w-full text-left px-4 py-2.5 text-xs bg-[#0A192F] text-white rounded-sm font-bold uppercase tracking-wider flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-[#CC0000]" />
                        <span>Operations & Django CMS</span>
                      </button>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-[#CC0000]"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavClick('auth')}
                    className="w-full py-2.5 border-2 border-[#0A192F] text-[#0A192F] font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-gray-50"
                  >
                    Customer Login / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
