import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COMPANY_DETAILS } from '../data/initialData';
import { GoogleMapView } from '../components/GoogleMapView';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Navigation,
  ExternalLink,
  Building,
  Truck
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const { submitContactEnquiry } = useApp();

  const [fullName, setFullName] = useState('');
  const [companyOrOrganisation, setCompanyOrOrganisation] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'email' | 'phone' | 'either'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isEmergencyFault, setIsEmergencyFault] = useState(false);
  const [popiaConsent, setPopiaConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popiaConsent) {
      alert('Please agree to the POPIA compliance terms to submit your enquiry.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await submitContactEnquiry({
        fullName,
        companyOrOrganisation,
        email,
        telephone,
        preferredContactMethod,
        subject: subject || 'General Fire-Detection Consultation',
        message,
        isEmergencyFault,
        popiaConsentAccepted: true
      });

      setSubmittedRef(created.referenceNumber);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      
      {/* Header */}
      <section className="bg-slate-950 text-white py-14 sm:py-18 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-medium">
              <Phone className="w-4 h-4 text-red-500" />
              <span>Direct Engineering Desk & Headquarters</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Contact Audrin Fire Engineers
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Reach out to our Pretoria West operations desk for service enquiries, technical consultations, site surveys, or rapid fault diagnostics.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Info + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Official Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
                Verified Business Details
              </h3>

              <div className="space-y-5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Direct Telephone:</span>
                    <a
                      href={`tel:${COMPANY_DETAILS.telephone.replace(/\s+/g, '')}`}
                      className="font-bold text-slate-900 hover:text-red-600 text-base transition-colors"
                    >
                      {COMPANY_DETAILS.telephone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Direct Email:</span>
                    <a
                      href={`mailto:${COMPANY_DETAILS.email}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-sm break-all transition-colors"
                    >
                      {COMPANY_DETAILS.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Physical & Postal Address:</span>
                    <p className="font-bold text-slate-900 leading-relaxed text-sm">
                      {COMPANY_DETAILS.physicalAddress}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_DETAILS.physicalAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold mt-1 transition-colors"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Operating Hours:</span>
                    <p className="font-bold text-slate-900">
                      {COMPANY_DETAILS.operatingHours}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-1 font-mono">
                <p><strong className="text-slate-800">Entity:</strong> {COMPANY_DETAILS.legalName}</p>
                <p><strong className="text-slate-800">Registration:</strong> {COMPANY_DETAILS.registrationNumber}</p>
                <p><strong className="text-slate-800">Standard:</strong> SANS 10139 Fire Detection</p>
              </div>
            </div>

            {/* Pretoria West Interactive Location Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  Operational Hub
                </span>
                <span className="text-[11px] font-mono text-slate-400">Pretoria West</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Headquartered at <strong>27 Tshivhase Street, Pretoria West</strong>, our mobile field engineering teams service commercial buildings across Tshwane, Johannesburg, Ekurhuleni, and surrounding industrial corridors.
              </p>
              <div className="pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(COMPANY_DETAILS.physicalAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-red-400" />
                  <span>Get Turn-by-Turn Directions</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              {submittedRef ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Enquiry Registered</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you, <strong>{fullName}</strong>. Your message has been logged under reference:
                  </p>
                  <div className="inline-block bg-slate-900 text-white px-5 py-2.5 rounded-xl font-mono font-bold text-base shadow">
                    {submittedRef}
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    An automated confirmation email has been dispatched to <strong>{email}</strong>. Our engineering desk will review and reply.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSubmittedRef(null);
                        setSubject('');
                        setMessage('');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Send a Technical Enquiry
                    </h3>
                    <p className="text-slate-500 text-xs">
                      All submissions receive an instant automated tracking acknowledgement with next-stage guidance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sipho Sithole"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company / Organisation</label>
                      <input
                        type="text"
                        value={companyOrOrganisation}
                        onChange={(e) => setCompanyOrOrganisation(e.target.value)}
                        placeholder="e.g. Pretoria Commercial Properties"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. sipho@pcproperties.co.za"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Direct Telephone *</label>
                      <input
                        type="tel"
                        required
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="e.g. 072 123 4567"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject / Area of Interest</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. SANS 10139 Site Survey for Office Block"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Message / Requirements *</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your commercial fire-alarm requirements, building location, or specific questions..."
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Fault Checkbox */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="isFault"
                      checked={isEmergencyFault}
                      onChange={(e) => setIsEmergencyFault(e.target.checked)}
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="isFault" className="text-xs text-red-900 font-semibold cursor-pointer">
                      This is an urgent fire-alarm fault report (prioritize for diagnostic triage)
                    </label>
                  </div>

                  {/* POPIA Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="popia"
                      checked={popiaConsent}
                      onChange={(e) => setPopiaConsent(e.target.checked)}
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="popia" className="text-[11px] text-slate-600 cursor-pointer">
                      I consent to Audrin Fire Engineers processing my contact details for the sole purpose of responding to this engineering enquiry under the Protection of Personal Information Act (POPIA).
                    </label>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Transmitting Enquiry...' : 'Submit Official Enquiry'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Google Map Section: 27 Tshivhase Street, Pretoria West */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600">
                Interactive Headquarters Map
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Find Us in Pretoria West
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Address: <strong className="text-slate-800">27 Tshivhase Street, Pretoria West, Pretoria, 0008</strong>
            </div>
          </div>

          {/* Interactive Google Map Component */}
          <GoogleMapView
            title="Audrin Fire Engineers Head Office & Logistics Depot"
            heightClass="h-[400px] sm:h-[480px]"
            showInfoCard={true}
          />
        </div>
      </section>

    </div>
  );
};
