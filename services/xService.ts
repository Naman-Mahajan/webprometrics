import { PlatformData } from '../types';
import { config } from './config';
import { api } from './api';

class RateLimiter {
    private tokens: number;
    private maxTokens: number;
    private refillRatePerSecond: number;
    private lastRefillTimestamp: number;

    constructor(maxTokens: number, refillRatePerSecond: number) {
        this.maxTokens = maxTokens;
        this.tokens = maxTokens;
        this.refillRatePerSecond = refillRatePerSecond;
        this.lastRefillTimestamp = Date.now();
    }

    async consume(): Promise<void> {
        this.refill();
        if (this.tokens < 1) {
            const waitTime = 1000 / this.refillRatePerSecond;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.consume();
        }
        this.tokens -= 1;
    }

    private refill() {
        const now = Date.now();
        const timePassed = (now - this.lastRefillTimestamp) / 1000;
        const newTokens = timePassed * this.refillRatePerSecond;
        this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
        this.lastRefillTimestamp = now;
    }
}

// X API Limits
const xRateLimiter = new RateLimiter(10, 2);

export const XService = {
    async getOAuthUrl(): Promise<string> {
        const resp = await api.get<{ url: string }>(`/oauth/x/start`);
        return resp.url;
    },

    async isLinked(): Promise<boolean> {
        if (config.USE_MOCK_DATA) return false;
        try {
            const data = await api.get<any>(`/x/user`);
            return !!data;
        } catch {
            return false;
        }
    },

    async getUser(): Promise<any> {
        if (config.USE_MOCK_DATA) return {};
        const data = await api.get<any>(`/x/user`);
        return data;
    },

    async fetchData(accountId: string, dateRange: 'daily' | 'weekly' | 'monthly'): Promise<PlatformData> {
        if (config.USE_MOCK_DATA) {
            return this.executeMockQuery(accountId, dateRange);
        }
        try {
            const qs = new URLSearchParams({ dateRange }).toString();
            const data = await api.get<any>(`/x/metrics?${qs}`);
            const user = data.user?.data || {};
            const publicMetrics = user.public_metrics || {};
            return this.transformLiveResponse(publicMetrics, dateRange);
        } catch (e) {
            return this.executeMockQuery(accountId, dateRange);
        }
    },

    async executeMockQuery(accountId: string, dateRange: 'daily' | 'weekly' | 'monthly'): Promise<PlatformData> {
        try {
            await xRateLimiter.consume();
            await new Promise(resolve => setTimeout(resolve, 350));

            const m = dateRange === 'daily' ? 1 : dateRange === 'weekly' ? 7 : 30;
            const variance = 1 + (Math.random() * 0.2 - 0.1);

            const points = dateRange === 'daily' ? 8 : dateRange === 'weekly' ? 7 : 15;
            const labels = dateRange === 'daily' ? ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] :
                        dateRange === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
                        Array.from({length: 15}, (_, i) => `Day ${i + 1}`);
            
            const chartData = labels.map(label => ({
                name: label,
                value: Math.floor(1200 * m * variance * Math.random() / points)
            }));

            return {
                id: 'x_ads',
                metrics: [
                    { 
                        label: 'Tweet Impressions', 
                        value: (125000 * m * variance).toLocaleString(undefined, {maximumFractionDigits: 0}), 
                        change: '-2%', 
                        trend: 'down' 
                    },
                    { 
                        label: 'Profile Visits', 
                        value: (3400 * m * variance).toLocaleString(undefined, {maximumFractionDigits: 0}), 
                        change: '+5%', 
                        trend: 'up' 
                    },
                    { 
                        label: 'Mentions', 
                        value: Math.floor(450 * m * variance).toLocaleString(), 
                        change: '+12%', 
                        trend: 'up' 
                    },
                    { 
                        label: 'Followers', 
                        value: '10.5K', 
                        change: '+15', 
                        trend: 'neutral' 
                    },
                ],
                chartData
            };
        } catch (error) {
            console.error("X API Error:", error);
            throw error;
        }
    },

    transformLiveResponse(publicMetrics: any, dateRange: string): PlatformData {
        const points = dateRange === 'daily' ? 8 : dateRange === 'weekly' ? 7 : 15;
        const labels = dateRange === 'daily' ? ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] :
                       dateRange === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
                       Array.from({length: 15}, (_, i) => `Day ${i + 1}`);
        const chartData = labels.map(label => ({
            name: label,
            value: Math.floor((publicMetrics.tweet_count || 100) / points * (0.5 + Math.random()))
        }));
        return {
            id: 'x_ads',
            metrics: [
                { label: 'Followers', value: (publicMetrics.followers_count || 0).toLocaleString(), change: '+—', trend: 'neutral' },
                { label: 'Following', value: (publicMetrics.following_count || 0).toLocaleString(), change: '+—', trend: 'neutral' },
                { label: 'Tweets', value: (publicMetrics.tweet_count || 0).toLocaleString(), change: '+—', trend: 'neutral' },
                { label: 'Listed', value: (publicMetrics.listed_count || 0).toLocaleString(), change: '+—', trend: 'neutral' },
            ],
            chartData
        };
    }
};
