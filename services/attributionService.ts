// Multi-Touch Attribution Service
import { PlatformData } from '../types';

export interface TouchPoint {
  id: string;
  platform: string;
  touchType: 'impression' | 'click' | 'engagement' | 'conversion';
  timestamp: string;
  value: number;
}

export interface AttributionModel {
  id: string;
  name: string;
  description: string;
}

export interface AttributionResult {
  platform: string;
  contribution: number; // Percentage
  revenue: number;
  conversions: number;
}

export const ATTRIBUTION_MODELS: AttributionModel[] = [
  {
    id: 'last_click',
    name: 'Last Click',
    description: 'Gives 100% credit to the last touchpoint before conversion'
  },
  {
    id: 'first_click',
    name: 'First Click',
    description: 'Gives 100% credit to the first touchpoint in the customer journey'
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Distributes credit equally across all touchpoints'
  },
  {
    id: 'time_decay',
    name: 'Time Decay',
    description: 'Gives more credit to touchpoints closer to conversion'
  },
  {
    id: 'position_based',
    name: 'Position-Based (U-Shaped)',
    description: 'Gives 40% each to first and last touch, 20% to middle touches'
  },
  {
    id: 'data_driven',
    name: 'Data-Driven (AI)',
    description: 'Uses machine learning to assign credit based on actual impact'
  }
];

export const AttributionService = {
  calculateAttribution(
    touchPoints: TouchPoint[],
    modelId: string,
    totalRevenue: number,
    totalConversions: number
  ): AttributionResult[] {
    if (touchPoints.length === 0) return [];

    switch (modelId) {
      case 'last_click':
        return this.lastClickAttribution(touchPoints, totalRevenue, totalConversions);
      case 'first_click':
        return this.firstClickAttribution(touchPoints, totalRevenue, totalConversions);
      case 'linear':
        return this.linearAttribution(touchPoints, totalRevenue, totalConversions);
      case 'time_decay':
        return this.timeDecayAttribution(touchPoints, totalRevenue, totalConversions);
      case 'position_based':
        return this.positionBasedAttribution(touchPoints, totalRevenue, totalConversions);
      case 'data_driven':
        return this.dataD rivenAttribution(touchPoints, totalRevenue, totalConversions);
      default:
        return this.linearAttribution(touchPoints, totalRevenue, totalConversions);
    }
  },

  lastClickAttribution(touchPoints: TouchPoint[], revenue: number, conversions: number): AttributionResult[] {
    const lastTouch = touchPoints[touchPoints.length - 1];
    const platformCounts = this.groupByPlatform(touchPoints);
    
    return Object.keys(platformCounts).map(platform => ({
      platform,
      contribution: platform === lastTouch.platform ? 100 : 0,
      revenue: platform === lastTouch.platform ? revenue : 0,
      conversions: platform === lastTouch.platform ? conversions : 0
    }));
  },

  firstClickAttribution(touchPoints: TouchPoint[], revenue: number, conversions: number): AttributionResult[] {
    const firstTouch = touchPoints[0];
    const platformCounts = this.groupByPlatform(touchPoints);
    
    return Object.keys(platformCounts).map(platform => ({
      platform,
      contribution: platform === firstTouch.platform ? 100 : 0,
      revenue: platform === firstTouch.platform ? revenue : 0,
      conversions: platform === firstTouch.platform ? conversions : 0
    }));
  },

  linearAttribution(touchPoints: TouchPoint[], revenue: number, conversions: number): AttributionResult[] {
    const platformCounts = this.groupByPlatform(touchPoints);
    const totalTouches = touchPoints.length;
    
    return Object.entries(platformCounts).map(([platform, count]) => {
      const contribution = (count / totalTouches) * 100;
      return {
        platform,
        contribution,
        revenue: (revenue * contribution) / 100,
        conversions: (conversions * contribution) / 100
      };
    });
  },

  timeDecayAttribution(touchPoints: TouchPoint[], revenue: number, conversions: number): AttributionResult[] {
    const halfLife = 7; // days
    const now = new Date(touchPoints[touchPoints.length - 1].timestamp);
    
    // Calculate decay weights
    const weights = touchPoints.map(tp => {
      const touchDate = new Date(tp.timestamp);
      const daysDiff = (now.getTime() - touchDate.getTime()) / (1000 * 60 * 60 * 24);
      return Math.exp(-daysDiff * Math.log(2) / halfLife);
    });
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const platformWeights: Record<string, number> = {};
    
    touchPoints.forEach((tp, idx) => {
      platformWeights[tp.platform] = (platformWeights[tp.platform] || 0) + weights[idx];
    });
    
    return Object.entries(platformWeights).map(([platform, weight]) => {
      const contribution = (weight / totalWeight) * 100;
      return {
        platform,
        contribution,
        revenue: (revenue * contribution) / 100,
        conversions: (conversions * contribution) / 100
      };
    });
  },

  positionBasedAttribution(touchPoints: TouchPoint[], revenue: number, conversions: number): AttributionResult[] {
    if (touchPoints.length === 1) {
      return [{
        platform: touchPoints[0].platform,
        contribution: 100,
        revenue,
        conversions
      }];
    }

    const first = touchPoints[0];
    const last = touchPoints[touchPoints.length - 1];
    const middle = touchPoints.slice(1, -1);
    
    const weights: Record<string, number> = {};
    
    // 40% to first
    weights[first.platform] = (weights[first.platform] || 0) + 0.4;
    
    // 40% to last
    weights[last.platform] = (weights[last.platform] || 0) + 0.4;
    
    // 20% split among middle
    if (middle.length > 0) {
      const middleWeight = 0.2 / middle.length;
      middle.forEach(tp => {
        weights[tp.platform] = (weights[tp.platform] || 0) + middleWeight;
      });
    }
    
    return Object.entries(weights).map(([platform, weight]) => {
      const contribution = weight * 100;
      return {
        platform,
        contribution,
        revenue: (revenue * weight),
        conversions: (conversions * weight)
      };
    });
  },

  dataD rivenAttribution(touchPoints: TouchPoint[], revenue: number, conversions: number): AttributionResult[] {
    // Mock ML-based attribution - in production use actual ML model
    // This simulates a data-driven approach by considering engagement quality
    const platformScores: Record<string, number> = {};
    
    touchPoints.forEach(tp => {
      let score = 1;
      
      // Weight by touch type
      if (tp.touchType === 'conversion') score *= 3;
      else if (tp.touchType === 'engagement') score *= 2;
      else if (tp.touchType === 'click') score *= 1.5;
      
      // Weight by value
      score *= (1 + tp.value / 100);
      
      platformScores[tp.platform] = (platformScores[tp.platform] || 0) + score;
    });
    
    const totalScore = Object.values(platformScores).reduce((a, b) => a + b, 0);
    
    return Object.entries(platformScores).map(([platform, score]) => {
      const contribution = (score / totalScore) * 100;
      return {
        platform,
        contribution,
        revenue: (revenue * contribution) / 100,
        conversions: (conversions * contribution) / 100
      };
    });
  },

  groupByPlatform(touchPoints: TouchPoint[]): Record<string, number> {
    return touchPoints.reduce((acc, tp) => {
      acc[tp.platform] = (acc[tp.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },

  // Generate mock customer journey
  generateMockJourney(platforms: string[]): TouchPoint[] {
    const journey: TouchPoint[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    
    // First touch (awareness)
    journey.push({
      id: `tp_1`,
      platform: platforms[0] || 'google_ads',
      touchType: 'impression',
      timestamp: startDate.toISOString(),
      value: 10
    });
    
    // Middle touches
    for (let i = 0; i < 3; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (i + 1) * 3);
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      
      journey.push({
        id: `tp_${i + 2}`,
        platform,
        touchType: i % 2 === 0 ? 'click' : 'engagement',
        timestamp: date.toISOString(),
        value: 20 + Math.random() * 30
      });
    }
    
    // Last touch (conversion)
    const convDate = new Date();
    journey.push({
      id: `tp_${journey.length + 1}`,
      platform: platforms[platforms.length - 1] || 'meta_ads',
      touchType: 'conversion',
      timestamp: convDate.toISOString(),
      value: 100
    });
    
    return journey;
  }
};
