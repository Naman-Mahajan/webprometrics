// Automated Report Scheduling Service
import { Report } from '../types';

export interface ScheduledReport {
  id: string;
  reportId?: string;
  clientId: string;
  clientName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  recipients: string[];
  templateId?: string;
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
}

const STORAGE_KEY = 'wpm_scheduled_reports';

export const SchedulerService = {
  getScheduledReports(): ScheduledReport[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addSchedule(schedule: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>): ScheduledReport {
    const schedules = this.getScheduledReports();
    const newSchedule: ScheduledReport = {
      ...schedule,
      id: `sched_${Date.now()}`,
      createdAt: new Date().toISOString(),
      nextRun: this.calculateNextRun(schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth, schedule.time)
    };
    schedules.push(newSchedule);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    return newSchedule;
  },

  updateSchedule(id: string, updates: Partial<ScheduledReport>): ScheduledReport[] {
    const schedules = this.getScheduledReports();
    const updated = schedules.map(s => {
      if (s.id === id) {
        const modified = { ...s, ...updates };
        // Recalculate nextRun if frequency/time changed
        if (updates.frequency || updates.dayOfWeek !== undefined || updates.dayOfMonth !== undefined || updates.time) {
          modified.nextRun = this.calculateNextRun(
            modified.frequency,
            modified.dayOfWeek,
            modified.dayOfMonth,
            modified.time
          );
        }
        return modified;
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteSchedule(id: string): ScheduledReport[] {
    const schedules = this.getScheduledReports();
    const filtered = schedules.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  },

  toggleSchedule(id: string): ScheduledReport[] {
    const schedules = this.getScheduledReports();
    const updated = schedules.map(s =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  calculateNextRun(
    frequency: 'daily' | 'weekly' | 'monthly',
    dayOfWeek?: number,
    dayOfMonth?: number,
    time: string = '09:00'
  ): string {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    let next = new Date();
    next.setHours(hours, minutes, 0, 0);

    if (frequency === 'daily') {
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    } else if (frequency === 'weekly' && dayOfWeek !== undefined) {
      const currentDay = next.getDay();
      let daysToAdd = dayOfWeek - currentDay;
      if (daysToAdd < 0 || (daysToAdd === 0 && next <= now)) {
        daysToAdd += 7;
      }
      next.setDate(next.getDate() + daysToAdd);
    } else if (frequency === 'monthly' && dayOfMonth !== undefined) {
      next.setDate(dayOfMonth);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      // Handle month-end edge cases
      if (next.getDate() !== dayOfMonth) {
        next.setDate(0); // Last day of previous month
      }
    }

    return next.toISOString();
  },

  // Mock execution - in real implementation would trigger backend job
  async executeSchedule(scheduleId: string): Promise<boolean> {
    const schedules = this.getScheduledReports();
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (!schedule || !schedule.isActive) return false;

    // Mock: Update lastRun and nextRun
    this.updateSchedule(scheduleId, {
      lastRun: new Date().toISOString(),
      nextRun: this.calculateNextRun(schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth, schedule.time)
    });

    console.log(`[SchedulerService] Executed schedule ${scheduleId} for ${schedule.clientName}`);
    return true;
  },

  // Check for due schedules
  getDueSchedules(): ScheduledReport[] {
    const schedules = this.getScheduledReports();
    const now = new Date();
    return schedules.filter(s => 
      s.isActive && new Date(s.nextRun) <= now
    );
  }
};
