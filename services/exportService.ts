// Report Export Service - PDF, Excel, CSV
import { Report, Client, PlatformData } from '../types';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeLogo?: boolean;
  includeCharts?: boolean;
  dateRange?: string;
  customBranding?: {
    logoUrl?: string;
    brandColor?: string;
    companyName?: string;
  };
}

export const ExportService = {
  async exportReport(
    report: Report,
    client: Client,
    platformData: Record<string, PlatformData | null>,
    options: ExportOptions
  ): Promise<Blob> {
    const { format } = options;

    if (format === 'pdf') {
      return this.exportToPDF(report, client, platformData, options);
    } else if (format === 'excel') {
      return this.exportToExcel(report, client, platformData, options);
    } else if (format === 'csv') {
      return this.exportToCSV(report, client, platformData, options);
    }

    throw new Error(`Unsupported export format: ${format}`);
  },

  async exportToPDF(
    report: Report,
    client: Client,
    platformData: Record<string, PlatformData | null>,
    options: ExportOptions
  ): Promise<Blob> {
    // Mock PDF generation - in production use jsPDF or similar
    const content = this.generateHTMLReport(report, client, platformData, options);
    
    // Simulate PDF conversion
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${report.name} - ${client.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${options.customBranding?.brandColor || '#3b82f6'}; padding-bottom: 20px; }
    .header h1 { color: ${options.customBranding?.brandColor || '#3b82f6'}; margin: 0; }
    .header p { color: #666; margin: 5px 0; }
    .logo { max-width: 200px; margin-bottom: 20px; }
    .section { margin: 30px 0; }
    .section h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric-card { padding: 15px; background: #f9fafb; border-left: 4px solid ${options.customBranding?.brandColor || '#3b82f6'}; }
    .metric-card .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .metric-card .value { font-size: 24px; font-weight: bold; margin: 5px 0; }
    .metric-card .change { font-size: 14px; color: #10b981; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  ${content}
  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString()} by ${options.customBranding?.companyName || 'WebProMetrics'}</p>
    <p>Confidential - For ${client.name} Only</p>
  </div>
</body>
</html>
    `;

    return new Blob([htmlContent], { type: 'text/html' });
  },

  generateHTMLReport(
    report: Report,
    client: Client,
    platformData: Record<string, PlatformData | null>,
    options: ExportOptions
  ): string {
    let html = `
      <div class="header">
        ${options.includeLogo && options.customBranding?.logoUrl ? 
          `<img src="${options.customBranding.logoUrl}" alt="Logo" class="logo" />` : ''}
        <h1>${report.name}</h1>
        <p>${client.name} | ${report.date}</p>
        ${options.dateRange ? `<p>Period: ${options.dateRange}</p>` : ''}
      </div>
    `;

    // Add platform sections
    Object.entries(platformData).forEach(([key, data]) => {
      if (data) {
        html += `
          <div class="section">
            <h2>${this.getPlatformTitle(key)}</h2>
            <div class="metrics">
              ${data.metrics.map(m => `
                <div class="metric-card">
                  <div class="label">${m.label}</div>
                  <div class="value">${m.value}</div>
                  <div class="change">${m.change}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    });

    return html;
  },

  async exportToExcel(
    report: Report,
    client: Client,
    platformData: Record<string, PlatformData | null>,
    options: ExportOptions
  ): Promise<Blob> {
    // Mock Excel generation - in production use SheetJS/xlsx
    const csvData = this.generateCSVData(report, client, platformData);
    
    // Simple TSV format (tab-separated) as Excel fallback
    const tsvContent = csvData.replace(/,/g, '\t');
    return new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
  },

  async exportToCSV(
    report: Report,
    client: Client,
    platformData: Record<string, PlatformData | null>,
    options: ExportOptions
  ): Promise<Blob> {
    const csvData = this.generateCSVData(report, client, platformData);
    return new Blob([csvData], { type: 'text/csv' });
  },

  generateCSVData(
    report: Report,
    client: Client,
    platformData: Record<string, PlatformData | null>
  ): string {
    let csv = `Report Name,${report.name}\n`;
    csv += `Client,${client.name}\n`;
    csv += `Date,${report.date}\n\n`;

    Object.entries(platformData).forEach(([key, data]) => {
      if (data) {
        csv += `\n${this.getPlatformTitle(key)}\n`;
        csv += `Metric,Value,Change,Trend\n`;
        data.metrics.forEach(m => {
          csv += `${m.label},${m.value},${m.change},${m.trend}\n`;
        });
      }
    });

    return csv;
  },

  getPlatformTitle(key: string): string {
    const titles: Record<string, string> = {
      google_ads: 'Google Ads Performance',
      ga4: 'Google Analytics 4',
      meta_ads: 'Meta Ads (Facebook/Instagram)',
      search_console: 'Google Search Console',
      linkedin: 'LinkedIn Company Page',
      x_ads: 'X (Twitter) Ads',
      tiktok_ads: 'TikTok Ads',
      shopify: 'Shopify Commerce',
      hubspot_crm: 'HubSpot CRM',
      gmb: 'Google Business Profile'
    };
    return titles[key] || key;
  },

  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
