// AI-Powered Insights Service
import { PlatformData } from '../types';

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'opportunity' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  platform: string;
  metric?: string;
  recommendation?: string;
  createdAt: string;
}

export const AIInsightsService = {
  generateInsights(platformData: Record<string, PlatformData | null>): Insight[] {
    const insights: Insight[] = [];
    let idCounter = 1;

    Object.entries(platformData).forEach(([platform, data]) => {
      if (!data) return;

      data.metrics.forEach(metric => {
        const change = this.parseChange(metric.change);
        
        // High growth detection
        if (change > 20) {
          insights.push({
            id: `insight_${idCounter++}`,
            type: 'success',
            title: `Strong ${metric.label} Growth`,
            description: `Your ${metric.label} increased by ${metric.change} on ${this.getPlatformName(platform)}. This indicates effective campaign performance.`,
            impact: 'high',
            platform,
            metric: metric.label,
            recommendation: `Continue current strategy and consider scaling budget by 15-20% to capitalize on momentum.`,
            createdAt: new Date().toISOString()
          });
        }

        // Declining metric alert
        if (change < -10) {
          insights.push({
            id: `insight_${idCounter++}`,
            type: 'alert',
            title: `${metric.label} Decline Detected`,
            description: `${metric.label} dropped by ${Math.abs(change)}% on ${this.getPlatformName(platform)}. Immediate attention recommended.`,
            impact: 'high',
            platform,
            metric: metric.label,
            recommendation: `Review recent changes in targeting, ad creative, or bidding strategy. Consider A/B testing new approaches.`,
            createdAt: new Date().toISOString()
          });
        }

        // Moderate growth opportunity
        if (change > 5 && change <= 20) {
          insights.push({
            id: `insight_${idCounter++}`,
            type: 'opportunity',
            title: `Growth Opportunity in ${metric.label}`,
            description: `${metric.label} is up ${metric.change} on ${this.getPlatformName(platform)}. Room for optimization exists.`,
            impact: 'medium',
            platform,
            metric: metric.label,
            recommendation: `Test new ad variations or expand to similar audiences to accelerate growth.`,
            createdAt: new Date().toISOString()
          });
        }

        // Stagnation warning
        if (Math.abs(change) < 2) {
          insights.push({
            id: `insight_${idCounter++}`,
            type: 'warning',
            title: `${metric.label} Stagnating`,
            description: `${metric.label} on ${this.getPlatformName(platform)} has remained flat (${metric.change}). Consider refreshing strategy.`,
            impact: 'medium',
            platform,
            metric: metric.label,
            recommendation: `Experiment with new channels, creative formats, or audience segments to reignite growth.`,
            createdAt: new Date().toISOString()
          });
        }
      });
    });

    // Cross-platform insights
    insights.push(...this.generateCrossPlatformInsights(platformData, idCounter));

    // Sort by impact and limit to top insights
    return insights
      .sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      })
      .slice(0, 12);
  },

  generateCrossPlatformInsights(platformData: Record<string, PlatformData | null>, startId: number): Insight[] {
    const insights: Insight[] = [];
    const activePlatforms = Object.entries(platformData).filter(([_, data]) => data !== null);

    if (activePlatforms.length >= 3) {
      insights.push({
        id: `insight_${startId++}`,
        type: 'success',
        title: 'Multi-Platform Coverage Active',
        description: `You're leveraging ${activePlatforms.length} platforms for comprehensive reach. Cross-platform synergy is boosting overall performance.`,
        impact: 'high',
        platform: 'cross-platform',
        recommendation: `Maintain consistent messaging across all channels and track customer journey touchpoints for better attribution.`,
        createdAt: new Date().toISOString()
      });
    }

    // Channel mix recommendation
    const hasSearch = platformData.search_console || platformData.google_ads;
    const hasSocial = platformData.meta_ads || platformData.linkedin || platformData.x_ads;
    
    if (hasSearch && !hasSocial) {
      insights.push({
        id: `insight_${idCounter++}`,
        type: 'opportunity',
        title: 'Expand to Social Channels',
        description: 'Your strategy is search-heavy. Adding social platforms could unlock new audience segments.',
        impact: 'high',
        platform: 'strategy',
        recommendation: 'Consider adding Meta Ads or LinkedIn to reach audiences earlier in the funnel.',
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  },

  parseChange(changeStr: string): number {
    const match = changeStr.match(/-?\d+/);
    return match ? parseInt(match[0]) : 0;
  },

  getPlatformName(key: string): string {
    const names: Record<string, string> = {
      google_ads: 'Google Ads',
      ga4: 'Google Analytics',
      meta_ads: 'Meta Ads',
      search_console: 'Search Console',
      linkedin: 'LinkedIn',
      x_ads: 'X (Twitter)',
      tiktok_ads: 'TikTok',
      shopify: 'Shopify',
      hubspot_crm: 'HubSpot CRM',
      gmb: 'Google Business'
    };
    return names[key] || key;
  },

  // AI-powered metric forecasting (mock)
  async forecastMetric(platform: string, metric: string, historicalData: number[]): Promise<number[]> {
    // Mock AI forecast - in production use ML model
    const avg = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
    const trend = (historicalData[historicalData.length - 1] - historicalData[0]) / historicalData.length;
    
    return Array.from({ length: 7 }, (_, i) => 
      Math.max(0, Math.round(avg + trend * (historicalData.length + i) + (Math.random() - 0.5) * avg * 0.1))
    );
  },

  // Anomaly detection
  detectAnomalies(data: number[], threshold: number = 2): number[] {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length);
    
    return data.map((val, idx) => 
      Math.abs(val - mean) > threshold * stdDev ? idx : -1
    ).filter(idx => idx !== -1);
  }
};

let idCounter = 1;
