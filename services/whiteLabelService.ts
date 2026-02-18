// White-Label Branding Service

export interface BrandConfig {
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain?: string;
  emailFromName?: string;
  emailFromAddress?: string;
  footerText?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface WhiteLabelTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    unit: number; // base spacing unit in px
  };
}

const DEFAULT_BRAND: BrandConfig = {
  companyName: 'WebProMetrics',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  accentColor: '#f59e0b',
  footerText: 'Powered by WebProMetrics',
  supportEmail: 'support@webprometrics.com'
};

const STORAGE_KEY = 'wpm_brand_config';

export const WhiteLabelService = {
  getBrandConfig(): BrandConfig {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_BRAND;
  },

  saveBrandConfig(config: Partial<BrandConfig>): BrandConfig {
    const current = this.getBrandConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    this.applyBranding(updated);
    return updated;
  },

  applyBranding(config: BrandConfig) {
    // Update CSS variables
    document.documentElement.style.setProperty('--brand-primary', config.primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', config.secondaryColor);
    document.documentElement.style.setProperty('--brand-accent', config.accentColor);

    // Update page title
    document.title = `${config.companyName} - Marketing Reporting Platform`;

    // Update favicon if provided
    if (config.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = config.faviconUrl;
    }

    // Update meta tags
    this.updateMetaTags(config);
  },

  updateMetaTags(config: BrandConfig) {
    const updateOrCreateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateOrCreateMeta('application-name', config.companyName);
    updateOrCreateMeta('theme-color', config.primaryColor);
  },

  generateTheme(config: BrandConfig): WhiteLabelTheme {
    return {
      colors: {
        primary: config.primaryColor,
        secondary: config.secondaryColor,
        accent: config.accentColor,
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#ffffff',
        text: '#1f2937'
      },
      fonts: {
        heading: 'system-ui, -apple-system, sans-serif',
        body: 'system-ui, -apple-system, sans-serif'
      },
      spacing: {
        unit: 4
      }
    };
  },

  // Generate custom CSS for reports/exports
  generateCustomCSS(config: BrandConfig): string {
    return `
      :root {
        --brand-primary: ${config.primaryColor};
        --brand-secondary: ${config.secondaryColor};
        --brand-accent: ${config.accentColor};
      }
      
      .brand-header {
        background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
      }
      
      .brand-button-primary {
        background-color: ${config.primaryColor};
        border-color: ${config.primaryColor};
      }
      
      .brand-button-primary:hover {
        background-color: ${this.darkenColor(config.primaryColor, 10)};
      }
      
      .brand-link {
        color: ${config.primaryColor};
      }
      
      .brand-accent {
        color: ${config.accentColor};
      }
    `;
  },

  darkenColor(color: string, percent: number): string {
    // Simple color darkening - in production use color manipulation library
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.applyBranding(DEFAULT_BRAND);
    return DEFAULT_BRAND;
  },

  // Email template branding
  generateEmailTemplate(config: BrandConfig, content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${config.primaryColor}; color: white; padding: 20px; text-align: center; }
    .header img { max-height: 60px; }
    .content { padding: 30px 20px; background: #f9fafb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    .button { background: ${config.accentColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${config.logoUrl ? `<img src="${config.logoUrl}" alt="${config.companyName}" />` : `<h1>${config.companyName}</h1>`}
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>${config.footerText || ''}</p>
      ${config.supportEmail ? `<p>Questions? Contact us at <a href="mailto:${config.supportEmail}">${config.supportEmail}</a></p>` : ''}
    </div>
  </div>
</body>
</html>
    `;
  }
};

// Initialize branding on load
if (typeof window !== 'undefined') {
  WhiteLabelService.applyBranding(WhiteLabelService.getBrandConfig());
}
