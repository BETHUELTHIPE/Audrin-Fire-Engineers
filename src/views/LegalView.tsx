import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COMPANY_DETAILS } from '../data/initialData';
import { SANSKnowledgeHub } from '../components/SANSKnowledgeHub';
import { StatutoryFormsVault } from '../components/StatutoryFormsVault';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  CheckCircle2, 
  BookOpen, 
  Scale, 
  Award, 
  AlertTriangle,
  FileCheck,
  Zap,
  Building2,
  Server,
  HeartPulse,
  Volume2,
  ArrowRight,
  User,
  Building,
  Phone,
  Mail,
  LogIn
} from 'lucide-react';

export interface LegalViewProps {
  isEmbedded?: boolean;
}

export const LegalView: React.FC<LegalViewProps> = ({ isEmbedded = false }) => {
  const { currentUser, switchRole, registerUser, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'sans-hub' | 'statutory-forms' | 'saqcc-poe' | 'popia' | 'terms' | 'scope'>('sans-hub');
  
  // Registration form state for unauthenticated users trying to access
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleQuickClientLogin = () => {
    switchRole('customer');
    setActiveView('customer-portal');
  };

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    registerUser(
      fullName.trim(),
      email.trim(),
      organisationName.trim() || 'Commercial Property Partner',
      phone.trim() || '071 415 6665'
    );
    setActiveView('customer-portal');
  };

  // If user is not logged in and not in an embedded portal view, show the restricted client gate
  if (!currentUser && !isEmbedded) {
    return (
      <div className="min-h-[85vh] bg-[#071322] text-white py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-[#0D213F] border-2 border-slate-700 rounded-sm p-6 sm:p-10 shadow-2xl space-y-8">
          
          {/* Header Badge & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-950/80 border-2 border-[#CC0000] text-[#CC0000] mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Registered &amp; Logged-In Clients Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              SANS Statutory Legal Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              In strict accordance with South African National Standards engineering governance (SANS 10139, SANS 10400-T, SANS 322, SANS 246) and SAQCC Commissioner accreditation frameworks, the SANS Legal Hub and engineering calculators are available solely to verified, logged-in commercial clients.
            </p>
          </div>

          {/* Quick Login / Register Tabs */}
          <div className="bg-[#071322] p-1.5 rounded-sm flex border border-slate-700 text-xs font-mono font-bold">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-xs uppercase tracking-wider transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#CC0000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Client Quick Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-xs uppercase tracking-wider transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#CC0000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Client Account
            </button>
          </div>

          {authMode === 'login' ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Client Account (Commercial Partner)</span>
                </div>
                <p className="text-slate-300">
                  Account: <strong className="text-white">Marcus Ndlovu</strong> (Tshwane Logistics Park)
                </p>
                <p className="text-slate-400 text-[11px]">
                  Immediate access to commercial fire safety files, compliance dossiers, and the SANS Legal Hub on your Client Dashboard.
                </p>
              </div>

              <button
                id="btn-login-commercial-client"
                onClick={handleQuickClientLogin}
                className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white font-mono font-bold uppercase text-xs tracking-wider py-3 px-4 rounded-sm transition-all shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In &amp; Open SANS Legal Hub on Client Dashboard</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterClient} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Representative Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Marcus Ndlovu"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-white focus:border-[#CC0000] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Company / Facility Name *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                    placeholder="e.g. Tshwane Logistics Park (Pty) Ltd"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-white focus:border-[#CC0000] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Official Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.co.za"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-white focus:border-[#CC0000] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Direct Phone *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="082 555 1290"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-sm text-white focus:border-[#CC0000] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white font-mono font-bold uppercase text-xs tracking-wider py-3 px-4 rounded-sm transition-all shadow-md cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Register &amp; Access SANS Legal Hub on Client Dashboard</span>
              </button>
            </form>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <button
              onClick={() => setActiveView('home')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Public Website
            </button>
            <div className="text-slate-500 text-[11px]">
              Audrin Fire Engineers • SANS 10139 Statutory Compliance
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 pb-20 ${isEmbedded ? 'pt-2' : 'space-y-12 sm:space-y-16'}`}>
      
      {/* Header */}
      {isEmbedded ? (
        <div className="bg-[#0A192F] text-white p-6 rounded-sm border-2 border-slate-800 shadow-md space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Registered Client Statutory Portal • SANS 10139 / SANS 10400-T / OHS Act</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                <Scale className="w-7 h-7 text-[#FFB703] shrink-0" />
                <span>SANS Legal Standards, POPIA &amp; Governance Hub</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                Official South African National Standards base knowledge, SAQCC Commissioner regulations, NBR Part T compliance, data protection under POPIA (Act 4 of 2013), and statutory engineering terms.
              </p>
            </div>
            <div className="text-left lg:text-right text-xs font-mono text-slate-300 bg-slate-900/90 p-3.5 rounded-sm border border-slate-700/80 shrink-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Authenticated Client:</div>
              <div className="font-bold text-white text-sm">{currentUser?.fullName || 'Registered Commercial Client'}</div>
              <div className="text-emerald-400 text-xs font-semibold">{currentUser?.organisationName || 'Commercial Facility'}</div>
              <div className="text-slate-400 text-[10px] mt-0.5">SANS 10139 Client Clearance: Active</div>
            </div>
          </div>
        </div>
      ) : (
        <section className="bg-slate-950 text-white py-14 sm:py-18 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-medium">
                <Scale className="w-4 h-4 text-[#CC0000]" />
                <span>South African Statutory Engineering Legal Hub (Client Access)</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                SANS Legal Standards, POPIA &amp; Governance
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Official South African National Standards base knowledge, SAQCC Commissioner regulations, NBR Part T compliance, data protection under POPIA (Act 4 of 2013), and statutory engineering terms.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveView('customer-portal')}
                  className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  <span>Go to Client Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Container */}
      <section className={isEmbedded ? 'space-y-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        
        {/* Main Tab Navigation */}
        <div className={`flex border-b border-slate-200 bg-white ${isEmbedded ? 'rounded-t-sm border border-slate-200 shadow-xs' : 'sticky top-20 z-30 shadow-xs'} overflow-x-auto text-xs font-bold`}>
          <button
            onClick={() => setActiveTab('sans-hub')}
            className={`px-5 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'sans-hub'
                ? 'border-[#CC0000] text-[#CC0000] bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#CC0000]" />
            <span>SANS Standards &amp; Calculators</span>
          </button>

          <button
            onClick={() => setActiveTab('statutory-forms')}
            className={`px-5 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'statutory-forms'
                ? 'border-[#CC0000] text-[#CC0000] bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-[#FFB703]" />
            <span>Statutory Forms Vault (4 Books)</span>
          </button>

          <button
            onClick={() => setActiveTab('saqcc-poe')}
            className={`px-5 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'saqcc-poe'
                ? 'border-[#CC0000] text-[#CC0000] bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-[#FFB703]" />
            <span>SAQCC Commissioner POE Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('popia')}
            className={`px-5 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'popia'
                ? 'border-[#CC0000] text-[#CC0000] bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>POPIA Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#CC0000] text-[#CC0000] bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Engineering Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('scope')}
            className={`px-5 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'scope'
                ? 'border-[#CC0000] text-[#CC0000] bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Scope &amp; Exclusions Notice</span>
          </button>
        </div>

        {/* Tab Panes */}
        <div className="pt-8">
          
          {/* TAB 1: SANS Standards & Calculators */}
          {activeTab === 'sans-hub' && (
            <SANSKnowledgeHub />
          )}

          {/* TAB 1.5: Statutory Forms Vault */}
          {activeTab === 'statutory-forms' && (
            <StatutoryFormsVault />
          )}

          {/* TAB 2: SAQCC Commissioner Summative POE Rules */}
          {activeTab === 'saqcc-poe' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
              <div className="border-b border-slate-200 pb-6">
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase mb-2">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>SAQCC Fire / Department of Labour Qualification Base Knowledge</span>
                </div>
                <h3 className="text-2xl font-black text-[#0A192F]">
                  Summative POE Module SANS 10139 – SAQCC Commissioner
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Statutory assessment benchmarks: 80% pass standard (min 64/80 marks) required for certified Fire Detection &amp; Gas Suppression System Commissioners.
                </p>
              </div>

              {/* Grid of Verified Core POE Statutory Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#CC0000]" />
                    <span>Control Panel Fault Indication Thresholds</span>
                  </div>
                  <p className="leading-relaxed">
                    <strong>Detector &amp; MCP Faults:</strong> A fault indication must register at the control equipment within <strong>200 seconds</strong> of a short or open circuit on any detector or manual call point line.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Mains Power Failure:</strong> The electrical disconnection fault indication time for mains failure must register within <strong>30 minutes</strong> of occurrence.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Loop &amp; Sounder Circuit Isolation</span>
                  </div>
                  <p className="leading-relaxed">
                    <strong>1,000 m² Fault Isolation:</strong> A single short or open circuit fault must not disable protection of more than <strong>1,000 m²</strong>.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Sounder Cable Sheaths:</strong> Where two (or more) sounder circuits are installed, the circuits must <strong>NOT</strong> be contained within a common cable sheath. At least two sounders must be installed in every building.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span>PH30 Cabling &amp; Physical Conductor Rules</span>
                  </div>
                  <p className="leading-relaxed">
                    <strong>Conductor Size:</strong> All conductors must have a cross-sectional area of at least <strong>1.0 mm²</strong>, preferably <strong>red in colour</strong>.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Conduit Isolation:</strong> Fire alarm cables must <strong>NOT</strong> be installed in the same conduit as cables of other electrical services. Addressable loops must run as <strong>Class A physical conductor circuits</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <span>Audibility &amp; Manual Call Point Placement</span>
                  </div>
                  <p className="leading-relaxed">
                    <strong>Sound Pressure:</strong> Not less than <strong>65 dB(A)</strong> throughout occupied areas, <strong>75 dB(A)</strong> at the bedhead in sleeping rooms, and not greater than <strong>130 dB(A)</strong> at any accessible point.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Manual Call Points (MCP):</strong> Mounting height <strong>1.4 m from floor level (±0.2 m)</strong>, minimum distance 5 mm from walls, 25 mm to 600 mm below ceilings.
                  </p>
                </div>
              </div>

              {/* Drawing Symbols Guide */}
              <div className="bg-[#0A192F] text-white p-5 rounded-xl space-y-3 font-mono text-xs">
                <div className="font-bold text-[#FFB703] uppercase tracking-wider text-xs">
                  SANS 10139 Drawing Dot Legend Standard
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0"></span>
                    <span>Blue: Smoke Detector</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-black border border-white shrink-0"></span>
                    <span>Black: Heat Detector</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0"></span>
                    <span>Red: Alarm / Siren</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500 shrink-0"></span>
                    <span>Green: Manual Call Point</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POPIA Policy */}
          {activeTab === 'popia' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
              <h3 className="text-xl font-bold text-slate-900">
                Protection of Personal Information Act (POPIA) Policy
              </h3>
              <p>
                <strong>{COMPANY_DETAILS.legalName}</strong> (Registration No: {COMPANY_DETAILS.registrationNumber}) is committed to safeguarding personal and organisational data in compliance with the Protection of Personal Information Act, No 4 of 2013 ("POPIA").
              </p>

              <h4 className="font-bold text-slate-900 pt-2 text-sm">1. Collection of Building &amp; Representative Information</h4>
              <p>
                We collect names, business email addresses, contact telephone numbers, physical premises addresses, and architectural drawings solely to execute fire-detection design, quotation, installation, and maintenance services.
              </p>

              <h4 className="font-bold text-slate-900 pt-2 text-sm">2. Processing &amp; Security</h4>
              <p>
                All technical documents and client records are stored in secure, encrypted cloud environments. Access is restricted strictly to authorized engineering staff.
              </p>

              <h4 className="font-bold text-slate-900 pt-2 text-sm">3. Information Officer Contact</h4>
              <p>
                For inquiries regarding data access or deletion requests, contact our designated office at <strong>{COMPANY_DETAILS.email}</strong> or <strong>{COMPANY_DETAILS.telephone}</strong>.
              </p>
            </div>
          )}

          {/* TAB 4: Standard Commercial Terms */}
          {activeTab === 'terms' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
              <h3 className="text-xl font-bold text-slate-900">
                Standard Commercial Terms of Service
              </h3>
              <p>
                These conditions govern all fire-detection consulting, site surveys, installations, commissioning, and maintenance provided by {COMPANY_DETAILS.legalName}.
              </p>

              <h4 className="font-bold text-slate-900 pt-2 text-sm">1. Alignment with SANS 10139 &amp; SANS 10400-T</h4>
              <p>
                All design schematics, cable layouts, device positioning, audibility testing, and maintenance intervals are executed in alignment with SANS 10139, SANS 322 (hospitals), SANS 246 (server rooms), and SANS 10400-T standards. Any deviations required by building structural constraints are formally documented.
              </p>

              <h4 className="font-bold text-slate-900 pt-2 text-sm">2. Site Access and Safety</h4>
              <p>
                The building owner or designated representative must provide unhindered access to ceiling voids, plant rooms, electrical distribution boards, and riser ducts during agreed inspection windows.
              </p>

              <h4 className="font-bold text-slate-900 pt-2 text-sm">3. Certificate of Compliance (COC) Issuance</h4>
              <p>
                Certificates of Compliance under SANS 10139 / SANS 10400-T are issued only upon successful completion of 100% loop testing, standby battery discharge verification, cause &amp; effect matrix sign-off, and settlement of project milestones.
              </p>
            </div>
          )}

          {/* TAB 5: Scope & Exclusions */}
          {activeTab === 'scope' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
              <h3 className="text-xl font-bold text-slate-900">
                Scope of Work Boundary Notice
              </h3>
              <p>
                Audrin Fire Engineers specializes strictly in electronic commercial fire detection, aspirating smoke detection (ASD), and fire alarm systems.
              </p>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <strong className="block text-slate-900 mb-2 font-bold">Explicitly Excluded Hardware &amp; Services:</strong>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Portable fire extinguishers, fire hose reels, fire hydrants (unless required under SANS 10400-T Table 11 consulting assessments)</li>
                  <li>Fire sprinkler installations, water pumps, water storage tanks (referenced to SANS 10287)</li>
                  <li>Gaseous fire suppression mechanical cylinder filling (electronic interface &amp; coincidence release monitored under SANS 246 / SANS 369)</li>
                  <li>Fire doors, passive fire stopping, intumescent seals</li>
                  <li>Standalone intruder alarms, CCTV cameras, biometric security turnstiles</li>
                </ul>
              </div>
            </div>
          )}

        </div>

      </section>

    </div>
  );
};

export default LegalView;

