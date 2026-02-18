import React from 'react';
import { Button } from './Button';

interface HeroProps {
  onNavigateToSignup: () => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigateToSignup }) => {
  const trustBadges = [
    'ISO-ready security',
    'GDPR-friendly data handling',
    '99.9% API uptime',
    'SOC2 controls underway'
  ];

  const marqueeLogos = ['Safaricom', 'Equity Bank', 'Kenya Airways', 'Britam', 'Nation Media', 'KCB Group'];

  return (
    <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-sm font-semibold mb-4">
              All channels. One report. Zero chaos.
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Modern reporting for agencies that move fast
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
              Ship client-ready, branded dashboards in minutes. Aggregate 50+ data sources, automate delivery, and keep every stakeholder in the loop without slide decks or late-night exports.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <Button variant="accent" size="lg" onClick={onNavigateToSignup} className="w-full sm:w-auto font-bold shadow-lg shadow-accent-200 text-brand-950 hover:shadow-xl hover:scale-105 transition-all">
                🚀 Start free 14-day trial
              </Button>
              <p className="text-sm text-gray-600 font-medium">No card needed • Full feature access</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {trustBadges.map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-white/70 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-green-600">✓</span>
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual: Live metrics board */}
          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="relative rounded-2xl shadow-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">This week</p>
                  <h3 className="text-2xl font-bold">Executive Performance Board</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">Live</div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6">
                {[{
                  label: 'Cross-channel ROI', value: '412%', delta: '+32% WoW'
                }, {
                  label: 'Accounts reported', value: '148', delta: '+12 new'
                }, {
                  label: 'Avg. client CSAT', value: '4.9/5', delta: 'NPS 68'
                }, {
                  label: 'Reports auto-sent', value: '1,240', delta: '98% on time'
                }].map((card) => (
                  <div key={card.label} className="rounded-xl bg-white/10 border border-white/10 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-white/70 font-semibold">{card.label}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-bold">{card.value}</span>
                    </div>
                    <p className="text-xs text-emerald-200 mt-2">{card.delta}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-white/10 bg-white/5">
                <p className="text-sm text-white/80 mb-3 font-semibold">Auditable delivery log</p>
                <div className="grid grid-cols-3 gap-3 text-sm text-white/80">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Email & Slack</p>
                    <p className="font-semibold">Scheduled drops</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Brand-ready</p>
                    <p className="font-semibold">Client portals</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Single source</p>
                    <p className="font-semibold">Audit trail</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-gray-500 font-semibold">Trusted by teams at</span>
              {marqueeLogos.map((logo) => (
                <span key={logo} className="px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 font-semibold text-xs uppercase tracking-wide">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
