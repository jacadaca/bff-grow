import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, Customized } from 'recharts';

// BFF Theme — Light & Dark modes (from tweakcn BFF theme)
const themes = {
  light: {
    background: '#f8f9fa',
    foreground: '#1a1a2e',
    surface: '#ffffff',
    surfaceHover: '#f1f3f5',
    primary: '#ec4899',
    primaryForeground: '#ffffff',
    secondary: '#10b981',
    secondaryForeground: '#ffffff',
    accent: '#ec4899',
    accentForeground: '#ffffff',
    muted: '#adb5bd',
    mutedForeground: '#6c757d',
    warning: '#f59e0b',
    warningForeground: '#ffffff',
    border: '#e5e7eb',
    text: '#1a1a2e',
    textMuted: '#6c757d',
    gridLine: '#e5e7eb',
    chart1: '#ec4899',
    chart2: '#10b981',
    chart3: '#be185d',
    chart4: '#f472b6',
    chart5: '#059669',
    channels: { seo: '#10b981', paidSocial: '#ec4899', paidSearch: '#f59e0b', email: '#f472b6', affiliate: '#be185d', other: '#adb5bd' },
    glow: { pink: 'rgba(236, 72, 153, 0.15)', purple: 'rgba(190, 24, 93, 0.15)', cyan: 'rgba(16, 185, 129, 0.15)', orange: 'rgba(245, 158, 11, 0.15)' },
    toggleBg: '#ffffff',
    toggleBorder: '#e5e7eb',
    toggleIcon: '#6c757d',
    toggleHoverBg: '#f1f3f5',
  },
  dark: {
    background: '#111318',
    foreground: '#e5e7eb',
    surface: '#1c1e26',
    surfaceHover: '#262830',
    primary: '#ec4899',
    primaryForeground: '#ffffff',
    secondary: '#10b981',
    secondaryForeground: '#ffffff',
    accent: '#ec4899',
    accentForeground: '#ffffff',
    muted: '#4b5563',
    mutedForeground: '#9ca3af',
    warning: '#f59e0b',
    warningForeground: '#111318',
    border: '#2d3039',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    gridLine: '#2d3039',
    chart1: '#ec4899',
    chart2: '#10b981',
    chart3: '#f472b6',
    chart4: '#be185d',
    chart5: '#34d399',
    channels: { seo: '#10b981', paidSocial: '#ec4899', paidSearch: '#f59e0b', email: '#f472b6', affiliate: '#be185d', other: '#4b5563' },
    glow: { pink: 'rgba(236, 72, 153, 0.2)', purple: 'rgba(190, 24, 93, 0.2)', cyan: 'rgba(16, 185, 129, 0.2)', orange: 'rgba(245, 158, 11, 0.2)' },
    toggleBg: '#1c1e26',
    toggleBorder: '#2d3039',
    toggleIcon: '#9ca3af',
    toggleHoverBg: '#262830',
  }
};

// Default theme reference for static data defined outside the component
const theme = themes.light;

// Priority 1+3: Clean data generation — NO milestone entries mixed in. Dates redistributed.
const MONTHS = [
  'Aug 2023','Sep 2023','Oct 2023','Nov 2023','Dec 2023','Jan 2024','Feb 2024','Mar 2024','Apr 2024','May 2024','Jun 2024','Jul 2024',
  'Aug 2024','Sep 2024','Oct 2024','Nov 2024','Dec 2024','Jan 2025','Feb 2025','Mar 2025','Apr 2025','May 2025','Jun 2025','Jul 2025',
  'Aug 2025','Sep 2025','Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026','Jul 2026',
  'Aug 2026','Sep 2026','Oct 2026','Nov 2026','Dec 2026','Jan 2027','Feb 2027','Mar 2027','Apr 2027','May 2027','Jun 2027','Jul 2027',
  'Aug 2027','Sep 2027','Oct 2027','Nov 2027','Dec 2027','Jan 2028','Feb 2028','Mar 2028','Apr 2028','May 2028','Jun 2028','Jul 2028'
];

const generateData = () => MONTHS.map((month, i) => {
  let baseRevenue = 280000;
  let growth = 1 + (i * 0.035);
  const hasRetheme = i >= 2, hasPaidSocial = i >= 4, hasSEO = i >= 8, hasEmail = i >= 15, hasAffiliate = i >= 19, hasCRO = i >= 25;
  if (hasRetheme) growth *= 1.08;
  if (hasPaidSocial) growth *= 1.15;
  if (hasSEO) growth *= 1.12;
  if (hasEmail) growth *= 1.10;
  if (hasAffiliate) growth *= 1.08;
  if (hasCRO) growth *= 1.05;
  const totalRevenue = Math.round(baseRevenue * growth);
  const paidTotal = hasPaidSocial ? Math.round(totalRevenue * Math.min(0.38, 0.34 + (i - 4) * 0.003)) : 0;
  const paidSocial = Math.round(paidTotal * 0.55);
  const paidSearch = Math.round(paidTotal * 0.45);
  const seo = hasSEO ? Math.round(totalRevenue * Math.min(0.28, 0.22 + (i - 8) * 0.004)) : 0;
  const email = hasEmail ? Math.round(totalRevenue * Math.min(0.16, 0.12 + (i - 15) * 0.002)) : 0;
  const affiliate = hasAffiliate ? Math.round(totalRevenue * Math.min(0.10, 0.07 + (i - 19) * 0.0015)) : 0;
  const actualFeeRate = i < 6 ? 0.08 : i < 12 ? 0.12 : 0.15;
  return {
    month, index: i, totalRevenue,
    incrementalRevenue: Math.max(0, totalRevenue - 600000),
    actualFees: Math.round(totalRevenue * actualFeeRate),
    standardFees: Math.round(totalRevenue * 0.15),
    paidSocial, paidSearch, seo, email, affiliate,
    other: Math.max(0, totalRevenue - paidSocial - paidSearch - seo - email - affiliate),
    conversionRate: hasRetheme ? Math.min(3.8, 2.1 + (i - 2) * 0.12) : 2.1,
    bounceRate: hasRetheme ? Math.max(32, 58 - (i - 2) * 1.8) : 58,
    avgOrderValue: hasRetheme ? 125 + (i - 2) * 3 : 110,
    pagesPerSession: hasRetheme ? Math.min(4.2, 2.8 + (i - 2) * 0.095) : 2.8,
    roas: hasPaidSocial ? Math.min(5.2, 2.8 + (i - 4) * 0.18) : 2.8,
    cpa: hasPaidSocial ? Math.max(28, 62 - (i - 4) * 2.5) : 62,
    ctr: hasPaidSocial ? Math.min(3.8, 1.9 + (i - 4) * 0.14) : 1.9,
    paidConversionRate: hasPaidSocial ? Math.min(4.2, 2.3 + (i - 4) * 0.14) : 2.3,
    organicTraffic: hasSEO ? Math.round(8500 + (i - 8) * 920) : 8500,
    organicRevenue: hasSEO ? seo : Math.round(totalRevenue * 0.12),
    organicConversionRate: hasSEO ? Math.min(3.2, 1.8 + (i - 8) * 0.13) : 1.8,
    avgPosition: hasSEO ? Math.max(4.2, 18.5 - (i - 8) * 1.3) : 18.5,
    emailRevenue: hasEmail ? email : Math.round(totalRevenue * 0.05),
    emailOpenRate: hasEmail ? Math.min(28.5, 18.2 + (i - 15) * 1.25) : 18.2,
    emailClickRate: hasEmail ? Math.min(4.8, 2.1 + (i - 15) * 0.35) : 2.1,
    emailROI: hasEmail ? Math.min(45, 28 + (i - 15) * 2.1) : 28,
    affiliateRevenue: hasAffiliate ? affiliate : Math.round(totalRevenue * 0.02),
    activePartners: hasAffiliate ? Math.round(12 + (i - 19) * 3.5) : 12,
    commissionRate: hasAffiliate ? Math.max(8.5, 12.5 - (i - 19) * 0.95) : 12.5,
    avgPartnerRevenue: hasAffiliate && (12 + (i - 19) * 3.5) > 0 ? Math.round(affiliate / Math.round(12 + (i - 19) * 3.5)) : 0,
    croConversionRate: hasCRO ? Math.min(3.5, 2.4 + (i - 25) * 0.08) : 2.4,
    revenuePerVisitor: hasCRO ? Math.min(4.8, 3.2 + (i - 25) * 0.12) : 3.2,
    testWinRate: hasCRO ? Math.min(42, 25 + (i - 25) * 1.2) : 25,
    // Content Marketing KPIs (10 Blog Pages launched at monthIndex 12 = Aug 24)
    contentOrganicSessions: i >= 12 ? Math.round(1200 + (i - 12) * 250) : 1200,
    contentPage1Rankings: i >= 12 ? Math.min(8, Math.round(0 + (i - 12) * 0.55)) : 0,
    contentAttributedRevenue: i >= 12 ? Math.round(4000 + (i - 12) * 650) : 4000,
    // PDP Button Fix KPIs (launched at monthIndex 22 = Jun 25)
    addToCartRate: i >= 22 ? Math.min(12.8, 8.4 + (i - 22) * 0.55) : 8.4,
    pdpRecoveredRevenue: i >= 22 ? Math.round(18000 + (i - 22) * 1250) : 18000,
    // Cart Optimizations KPIs (launched at monthIndex 27 = Nov 25)
    cartAbandonmentRate: i >= 27 ? Math.max(62, 74 - (i - 27) * 1.6) : 74,
    cartAOV: i >= 27 ? Math.round(125 + (i - 27) * 2.8) : 125,
    cartCompletionRate: i >= 27 ? Math.min(42, 26 + (i - 27) * 1.8) : 26,
    // Category-level KPIs — shared across tasks of same type
    // Traffic
    organicSessions: hasSEO ? Math.round(8500 + (i - 8) * 920) : 8500,
    page1Rankings: hasSEO ? Math.min(18, Math.round(2 + (i - 8) * 0.8)) : 2,
    organicCTR: hasSEO ? Math.min(5.8, 2.4 + (i - 8) * 0.22) : 2.4,
    // Retention
    repeatPurchaseRate: i >= 15 ? Math.min(35, 22 + (i - 15) * 0.65) : 22,
    customerLTV: i >= 15 ? Math.round(280 + (i - 15) * 8.5) : 280,
    referralRate: i >= 15 ? Math.min(8, 3 + (i - 15) * 0.28) : 3,
    // Other / Direct KPIs
    directTraffic: Math.round(12000 + i * 800 + Math.sin(i * 0.5) * 2000),
    directConversionRate: Math.min(3.8, 2.2 + i * 0.04 + Math.sin(i * 0.3) * 0.3),
    directAOV: Math.round(118 + i * 1.5 + Math.sin(i * 0.4) * 8),
    brandSearchShare: Math.min(45, 18 + i * 0.7 + Math.sin(i * 0.6) * 3),
  };
});

// Priority 3: Redistributed dates for capabilities + tasks
const capabilities = [
  { id: 'paidSocial', name: 'Paid Social', date: 'Dec 5, 2023', monthIndex: 4, description: 'Social media advertising across Facebook, Instagram, TikTok', color: theme.chart1, type: 'direct_revenue', revenueMetric: 'paidSocial', engaged: true, note: 'Revenue from Paid Social campaigns.', kpis: { roas: { before: 0, after: 3.8, industry: 2.8, acadacaAvg: 4.2, topPerformers: 5.5 }, cpa: { before: 0, after: 45, industry: 62, acadacaAvg: 42, topPerformers: 35 }, ctr: { before: 0, after: 3.2, industry: 1.9, acadacaAvg: 3.5, topPerformers: 4.8 }, paidConversionRate: { before: 0, after: 3.6, industry: 2.3, acadacaAvg: 3.8, topPerformers: 4.2 } }, projectedLift: 0.12 },
  { id: 'paidSearch', name: 'Paid Search', date: 'Dec 12, 2023', monthIndex: 4, description: 'Google Ads, Bing Ads search campaign management', color: theme.chart2, type: 'direct_revenue', revenueMetric: 'paidSearch', engaged: true, note: 'Revenue from Paid Search campaigns.', kpis: { roas: { before: 0, after: 4.1, industry: 3.2, acadacaAvg: 4.5, topPerformers: 6.0 }, ctr: { before: 0, after: 3.8, industry: 2.5, acadacaAvg: 3.5, topPerformers: 4.8 }, cpa: { before: 0, after: 38, industry: 52, acadacaAvg: 35, topPerformers: 28 } }, projectedLift: 0.10 },
  { id: 'seo', name: 'SEO Management', date: 'Apr 8, 2024', monthIndex: 8, description: 'Technical SEO, content strategy, and link building', color: theme.chart2, type: 'direct_revenue', revenueMetric: 'organicRevenue', engaged: true, note: 'Direct organic search revenue.', kpis: { organicTraffic: { before: 8500, after: 34000, industry: 22000, acadacaAvg: 38000, topPerformers: 52000 }, organicRevenue: { before: 0, after: 28, industry: 15, acadacaAvg: 32, topPerformers: 38 }, organicConversionRate: { before: 1.8, after: 3.0, industry: 2.2, acadacaAvg: 3.2, topPerformers: 4.0 }, avgPosition: { before: 18.5, after: 5.2, industry: 12, acadacaAvg: 6.5, topPerformers: 4.2 } }, projectedLift: 0.14 },
  { id: 'email', name: 'Email Marketing', date: 'Nov 18, 2024', monthIndex: 15, description: 'Automated flows and campaign management', color: theme.chart4, type: 'direct_revenue', revenueMetric: 'emailRevenue', engaged: true, note: 'Revenue from email campaigns.', kpis: { emailRevenue: { before: 0, after: 18, industry: 12, acadacaAvg: 22, topPerformers: 25 }, emailOpenRate: { before: 18.2, after: 27.5, industry: 22, acadacaAvg: 28, topPerformers: 32 }, emailClickRate: { before: 2.1, after: 4.5, industry: 3.2, acadacaAvg: 4.8, topPerformers: 5.5 }, emailROI: { before: 0, after: 42, industry: 35, acadacaAvg: 48, topPerformers: 55 } }, projectedLift: 0.08 },
  { id: 'affiliate', name: 'Affiliate Management', date: 'Mar 3, 2025', monthIndex: 19, description: 'Strategic partnerships and affiliate network', color: theme.chart3, type: 'direct_revenue', revenueMetric: 'affiliateRevenue', engaged: true, note: 'Revenue from affiliate partnerships.', kpis: { affiliateRevenue: { before: 0, after: 9, industry: 5, acadacaAvg: 11, topPerformers: 14 }, activePartners: { before: 12, after: 42, industry: 15, acadacaAvg: 32, topPerformers: 45 }, commissionRate: { before: 12.5, after: 8.8, industry: 10, acadacaAvg: 9, topPerformers: 8.5 }, avgPartnerRevenue: { before: 0, after: 2800, industry: 1500, acadacaAvg: 3200, topPerformers: 4500 } }, projectedLift: 0.06 },
  { id: 'other', name: 'Other / Direct', date: 'Aug 1, 2023', monthIndex: 0, description: 'Organic, direct, and unattributed traffic', color: 'oklch(0.58 0.10 20)', type: 'direct_revenue', revenueMetric: 'other', engaged: true, isOrganic: true, note: 'Revenue from direct traffic and unattributed sources.', kpis: { directTraffic: { before: 12000, after: 35000, industry: 25000, acadacaAvg: 30000, topPerformers: 45000 }, directConversionRate: { before: 2.2, after: 3.5, industry: 2.8, acadacaAvg: 3.2, topPerformers: 4.0 }, directAOV: { before: 118, after: 160, industry: 135, acadacaAvg: 150, topPerformers: 175 }, brandSearchShare: { before: 18, after: 38, industry: 25, acadacaAvg: 35, topPerformers: 45 } }, projectedLift: 0 },
  { id: 'cro', name: 'CRO Management', date: 'Sep 15, 2025', monthIndex: 25, description: 'A/B testing and conversion funnel optimization', color: theme.chart1, type: 'conversion_optimizer', revenueMetric: 'incremental_total', baselineRevenue: 600000, engaged: true, note: 'Incremental lift from A/B testing.', kpis: { croConversionRate: { before: 2.4, after: 3.1, industry: 2.1, acadacaAvg: 2.8, topPerformers: 3.5 }, revenuePerVisitor: { before: 3.2, after: 4.5, industry: 3.8, acadacaAvg: 4.2, topPerformers: 5.0 }, testWinRate: { before: 25, after: 38, industry: 30, acadacaAvg: 35, topPerformers: 42 } }, projectedLift: 0.09 },
  { id: 'retargeting', name: 'Retargeting Campaigns', date: null, monthIndex: null, description: 'Multi-channel retargeting across display, social, and native', color: theme.chart5, type: 'direct_revenue', revenueMetric: 'paidSocial', engaged: false, note: 'Projected retargeting revenue.', kpis: {}, projectedLift: 0.07, configurableKPIs: [{ key: 'roas', label: 'ROAS', unit: 'x', current: 1.2, industry: 3.5, description: 'Return on ad spend' }, { key: 'cpa', label: 'CPA', unit: '$', current: 85, industry: 48, description: 'Cost per acquisition', lowerIsBetter: true }, { key: 'recaptureRate', label: 'Visitor Recapture Rate', unit: '%', current: 3, industry: 12, description: 'Visitors who return and convert' }] },
  { id: 'influencer', name: 'Influencer Partnerships', date: null, monthIndex: null, description: 'Strategic influencer collaborations and creator economy', color: theme.chart3, type: 'direct_revenue', revenueMetric: 'affiliateRevenue', engaged: false, note: 'Projected influencer revenue.', kpis: {}, projectedLift: 0.05, configurableKPIs: [{ key: 'influencerROI', label: 'Influencer ROI', unit: 'x', current: 1.5, industry: 5.2, description: 'Return on influencer spend' }, { key: 'partnerCount', label: 'Active Creators', unit: '', current: 2, industry: 15, description: 'Active influencer partners' }, { key: 'ugcPieces', label: 'UGC Content/Month', unit: '', current: 3, industry: 20, description: 'UGC pieces monthly' }] },
  { id: 'smsMarketing', name: 'SMS Marketing', date: null, monthIndex: null, description: 'Automated SMS flows and promotional campaigns', color: theme.chart2, type: 'direct_revenue', revenueMetric: 'emailRevenue', engaged: false, note: 'Projected SMS revenue.', kpis: {}, projectedLift: 0.04, configurableKPIs: [{ key: 'smsROI', label: 'SMS ROI', unit: 'x', current: 5, industry: 25, description: 'Return on SMS investment' }, { key: 'smsOpenRate', label: 'Open Rate', unit: '%', current: 82, industry: 98, description: 'SMS open rate' }, { key: 'smsCTR', label: 'Click-Through Rate', unit: '%', current: 8, industry: 36, description: 'SMS CTR' }, { key: 'cartRecovery', label: 'Cart Recovery Rate', unit: '%', current: 2, industry: 10, description: 'Additional cart recovery' }] },
  { id: 'youtubeCctv', name: 'YouTube + Connected TV', date: null, monthIndex: null, description: 'YouTube channel strategy, video production, and connected TV advertising', color: theme.chart5, type: 'direct_revenue', revenueMetric: 'paidSocial', engaged: false, note: 'Projected YouTube + CTV revenue.', kpis: {}, projectedLift: 0.08, configurableKPIs: [{ key: 'videoROAS', label: 'Video ROAS', unit: 'x', current: 0.8, industry: 3.2, description: 'Return on video ad spend' }, { key: 'viewRate', label: 'View Rate', unit: '%', current: 15, industry: 32, description: 'Video view-through rate' }, { key: 'subscriberGrowth', label: 'Subscriber Growth', unit: '%', current: 2, industry: 12, description: 'Monthly subscriber growth rate' }, { key: 'ctvReach', label: 'CTV Reach', unit: '', current: 5000, industry: 45000, description: 'Connected TV monthly impressions' }] },
  { id: 'amazonAds', name: 'Amazon Ads', date: null, monthIndex: null, description: 'Amazon Sponsored Products, Brands, and Display advertising to capture high-intent marketplace shoppers', color: 'oklch(0.58 0.18 50)', type: 'direct_revenue', revenueMetric: 'paidSearch', engaged: false, note: 'Projected Amazon advertising revenue.', kpis: {}, projectedLift: 0.11, configurableKPIs: [{ key: 'amazonROAS', label: 'ROAS', unit: 'x', current: 0.5, industry: 4.8, description: 'Amazon advertising return on ad spend' }, { key: 'amazonACoS', label: 'ACoS', unit: '%', current: 45, industry: 22, description: 'Advertising cost of sales', lowerIsBetter: true }, { key: 'amazonCVR', label: 'Conversion Rate', unit: '%', current: 4, industry: 12, description: 'Amazon ad conversion rate' }, { key: 'amazonImprShare', label: 'Impression Share', unit: '%', current: 8, industry: 35, description: 'Share of eligible impressions captured' }] },
];

const tasks = [
  { id: 'retheme', name: 'Site Retheme', date: 'Oct 22, 2023', monthIndex: 2, description: 'Modern UX overhaul with conversion optimization', color: theme.chart4, type: 'conversion_optimizer', completed: true, category: 'Conversion', taskDescription: 'Complete redesign of the site UX including modernized navigation and optimized conversion paths.', taskImpact: 'Delivered 33% improvement in conversion rate (1.8% → 2.4%), 28% reduction in bounce rate. Est. $186K incremental annual revenue.', costs: [{ amount: 25000, frequency: 'one-time', monthIndex: 1 }, { amount: 25000, frequency: 'one-time', monthIndex: 2 }], kpis: { conversionRate: { before: 1.8, after: 2.4, industry: 2.1, acadacaAvg: 2.6, topPerformers: 3.2 }, bounceRate: { before: 58, after: 42, industry: 47, acadacaAvg: 38, topPerformers: 32 }, avgOrderValue: { before: 110, after: 125, industry: 118, acadacaAvg: 130, topPerformers: 155 } } },
  { id: 'contentMarketing', name: '10 Blog Pages Published', date: 'Aug 14, 2024', monthIndex: 12, description: 'SEO-optimized blog content', color: theme.chart4, type: 'direct_revenue', completed: true, category: 'Traffic', taskDescription: '10 long-form blog posts targeting high-intent keywords.', taskImpact: 'Drives 4,200 monthly organic sessions, 3 articles on page 1. Content-attributed revenue: $12K/month.', costs: [{ amount: 8000, frequency: 'one-time', monthIndex: 11 }, { amount: 7000, frequency: 'one-time', monthIndex: 12 }], kpis: { organicSessions: { before: 8500, after: 18500, industry: 14000, acadacaAvg: 22000, topPerformers: 30000 }, page1Rankings: { before: 2, after: 6, industry: 5, acadacaAvg: 8, topPerformers: 12 }, organicCTR: { before: 2.4, after: 3.8, industry: 3.2, acadacaAvg: 4.2, topPerformers: 5.5 } } },
  { id: 'pdpButtonFix', name: 'PDP Button Fix', date: 'Jun 9, 2025', monthIndex: 22, description: 'Add-to-cart button optimization', color: theme.chart1, type: 'conversion_optimizer', completed: true, category: 'Conversion', taskDescription: 'Fixed critical add-to-cart bug affecting 23% of product pages.', taskImpact: 'Add-to-cart rate jumped 18%. Recovered ~$28K/month in lost revenue.', costs: [{ amount: 5000, frequency: 'one-time', monthIndex: 22 }], kpis: { conversionRate: { before: 2.2, after: 2.6, industry: 2.4, acadacaAvg: 2.8, topPerformers: 3.2 }, bounceRate: { before: 45, after: 40, industry: 42, acadacaAvg: 38, topPerformers: 32 }, avgOrderValue: { before: 118, after: 128, industry: 125, acadacaAvg: 135, topPerformers: 155 } } },
  { id: 'cartOptimizations', name: 'Cart Optimizations', date: 'Nov 3, 2025', monthIndex: 27, description: 'Shopping cart UX improvements', color: theme.chart4, type: 'conversion_optimizer', completed: true, category: 'Conversion', taskDescription: 'Cart overhaul: trust badges, simplified layout, progress indicator.', taskImpact: 'Cart abandonment decreased from 74% to 66%. AOV up 7%. Est. $45K/month incremental.', costs: [{ amount: 10000, frequency: 'one-time', monthIndex: 26 }, { amount: 8000, frequency: 'one-time', monthIndex: 27 }], kpis: { conversionRate: { before: 2.4, after: 2.8, industry: 2.6, acadacaAvg: 3.0, topPerformers: 3.5 }, bounceRate: { before: 42, after: 36, industry: 40, acadacaAvg: 35, topPerformers: 30 }, avgOrderValue: { before: 125, after: 134, industry: 130, acadacaAvg: 142, topPerformers: 155 } } },
  { id: 'speedOptimization', name: 'Site Speed Optimization', date: null, monthIndex: null, description: 'Core Web Vitals improvements', color: theme.chart2, completed: false, category: 'Conversion', taskDescription: 'Comprehensive page speed optimization targeting LCP, CLS, FID.', recommendation: 'Current LCP is 3.8s (target: <2.5s). Projected 9% revenue lift — ~$63K/month.', kpis: {}, projectedLift: 0.09, configurableKPIs: [{ key: 'conversionRate', label: 'Conversion Rate', unit: '%', current: 2.4, industry: 2.8, description: 'Overall conversion rate' }, { key: 'bounceRate', label: 'Bounce Rate', unit: '%', current: 42, industry: 38, description: 'Site bounce rate', lowerIsBetter: true }, { key: 'avgOrderValue', label: 'Avg Order Value', unit: '$', current: 125, industry: 142, description: 'Average order value' }] },
  { id: 'checkoutRedesign', name: 'Checkout Redesign', date: null, monthIndex: null, description: 'Single-page checkout with guest option', color: theme.chart3, completed: false, category: 'Conversion', taskDescription: 'Full checkout redesign: single-page, guest checkout, Apple/Google Pay.', recommendation: 'Checkout completion rate 34% vs 42% benchmark. Gap = ~$52K/month lost revenue.', kpis: {}, projectedLift: 0.07, configurableKPIs: [{ key: 'conversionRate', label: 'Conversion Rate', unit: '%', current: 2.4, industry: 2.8, description: 'Overall conversion rate' }, { key: 'bounceRate', label: 'Bounce Rate', unit: '%', current: 42, industry: 38, description: 'Site bounce rate', lowerIsBetter: true }, { key: 'avgOrderValue', label: 'Avg Order Value', unit: '$', current: 125, industry: 142, description: 'Average order value' }] },
  { id: 'loyaltyProgram', name: 'Loyalty Program Launch', date: null, monthIndex: null, description: 'Points-based rewards program', color: theme.chart1, completed: false, category: 'Retention', taskDescription: 'Points-based loyalty with tiered rewards and referral incentives.', recommendation: 'Repeat purchase rate 22% vs 35% benchmark. Could drive ~$72K/month incremental.', kpis: {}, projectedLift: 0.10, configurableKPIs: [{ key: 'repeatPurchaseRate', label: 'Repeat Purchase Rate', unit: '%', current: 22, industry: 35, description: 'Repeat purchase rate' }, { key: 'customerLTV', label: 'Customer LTV', unit: '$', current: 280, industry: 420, description: 'Customer lifetime value' }, { key: 'referralRate', label: 'Referral Rate', unit: '%', current: 3, industry: 8, description: 'Customer referral rate' }] },
];

const services = [...capabilities.filter(c => c.engaged && c.id !== 'other'), ...tasks.filter(t => t.completed)];

// Priority 1: milestoneMonths set — months that have milestone dots
const milestoneMonths = new Set([...capabilities.filter(c => c.engaged && c.date && c.id !== 'other'), ...tasks.filter(t => t.completed && t.date)].map(m => m.date));

// All milestone items for rendering dots
const allMilestoneItems = [...capabilities.filter(c => c.engaged && c.date && c.id !== 'other'), ...tasks.filter(t => t.completed && t.date)];

// KPI configurations per service
const serviceKPIs = {
  overall: [
    { key: 'conversionRate', label: 'Conversion Rate', unit: '%', axis: 'right', color: 'rgba(59,130,246,0.9)' },
    { key: 'bounceRate', label: 'Bounce Rate', unit: '%', axis: 'right', color: 'rgba(239,68,68,0.7)' },
    { key: 'avgOrderValue', label: 'Avg Order Value', unit: '$', axis: 'left', color: 'rgba(16,185,129,0.9)' },
    { key: 'customerLTV', label: 'Customer LTV', unit: '$', axis: 'left', color: 'rgba(139,92,246,0.9)' },
    { key: 'repeatPurchaseRate', label: 'Repeat Purchase Rate', unit: '%', axis: 'right', color: 'rgba(245,158,11,0.9)' },
  ],
  retheme: [{ key: 'conversionRate', label: 'Conversion Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.9)' }, { key: 'bounceRate', label: 'Bounce Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.7)' }, { key: 'avgOrderValue', label: 'Avg Order Value', unit: '$', axis: 'left', color: 'rgba(255,159,64,1)' }],
  paidSocial: [{ key: 'roas', label: 'ROAS', unit: 'x', axis: 'right', color: 'rgba(153,102,255,0.9)' }, { key: 'cpa', label: 'Cost Per Acquisition', unit: '$', axis: 'left', color: 'rgba(153,102,255,1)' }, { key: 'ctr', label: 'Click-Through Rate', unit: '%', axis: 'right', color: 'rgba(153,102,255,0.7)' }, { key: 'paidConversionRate', label: 'Paid Conv Rate', unit: '%', axis: 'right', color: 'rgba(153,102,255,0.5)' }],
  paidSearch: [{ key: 'roas', label: 'ROAS', unit: 'x', axis: 'right', color: 'rgba(153,102,255,0.9)' }, { key: 'ctr', label: 'Click-Through Rate', unit: '%', axis: 'right', color: 'rgba(153,102,255,0.7)' }, { key: 'cpa', label: 'Cost Per Acquisition', unit: '$', axis: 'left', color: 'rgba(153,102,255,1)' }],
  seo: [{ key: 'organicTraffic', label: 'Organic Traffic', unit: '', axis: 'right', color: 'rgba(54,162,235,0.9)' }, { key: 'organicRevenue', label: 'Organic Revenue', unit: '$', axis: 'left', color: 'rgba(54,162,235,1)' }, { key: 'organicConversionRate', label: 'Organic Conv Rate', unit: '%', axis: 'right', color: 'rgba(54,162,235,0.7)' }, { key: 'avgPosition', label: 'Avg Position', unit: '', axis: 'right', color: 'rgba(54,162,235,0.5)' }],
  email: [{ key: 'emailRevenue', label: 'Email Revenue', unit: '$', axis: 'left', color: 'rgba(255,159,64,1)' }, { key: 'emailOpenRate', label: 'Open Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.9)' }, { key: 'emailClickRate', label: 'Click Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.7)' }, { key: 'emailROI', label: 'Email ROI', unit: 'x', axis: 'right', color: 'rgba(255,159,64,0.5)' }],
  affiliate: [{ key: 'affiliateRevenue', label: 'Affiliate Revenue', unit: '$', axis: 'left', color: 'rgba(255,99,132,1)' }, { key: 'activePartners', label: 'Active Partners', unit: '', axis: 'right', color: 'rgba(255,99,132,0.9)' }, { key: 'commissionRate', label: 'Commission Rate', unit: '%', axis: 'right', color: 'rgba(255,99,132,0.7)' }, { key: 'avgPartnerRevenue', label: 'Avg Partner Revenue', unit: '$', axis: 'left', color: 'rgba(255,99,132,0.5)' }],
  cro: [{ key: 'croConversionRate', label: 'CRO Conversion Rate', unit: '%', axis: 'right', color: 'rgba(153,102,255,0.9)' }, { key: 'revenuePerVisitor', label: 'Revenue/Visitor', unit: '$', axis: 'right', color: 'rgba(153,102,255,0.7)' }, { key: 'testWinRate', label: 'Test Win Rate', unit: '%', axis: 'right', color: 'rgba(153,102,255,0.5)' }],
  contentMarketing: [{ key: 'organicSessions', label: 'Organic Sessions', unit: '', axis: 'right', color: 'rgba(54,162,235,0.9)' }, { key: 'page1Rankings', label: 'Page 1 Rankings', unit: '', axis: 'right', color: 'rgba(54,162,235,0.7)' }, { key: 'organicCTR', label: 'Organic CTR', unit: '%', axis: 'right', color: 'rgba(54,162,235,0.5)' }],
  pdpButtonFix: [{ key: 'conversionRate', label: 'Conversion Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.9)' }, { key: 'bounceRate', label: 'Bounce Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.7)' }, { key: 'avgOrderValue', label: 'Avg Order Value', unit: '$', axis: 'left', color: 'rgba(255,159,64,1)' }],
  other: [{ key: 'directTraffic', label: 'Direct Traffic', unit: '', axis: 'right', color: 'rgba(160,120,100,0.9)' }, { key: 'directConversionRate', label: 'Conv Rate', unit: '%', axis: 'right', color: 'rgba(160,120,100,0.7)' }, { key: 'directAOV', label: 'Avg Order Value', unit: '$', axis: 'left', color: 'rgba(160,120,100,1)' }, { key: 'brandSearchShare', label: 'Brand Search %', unit: '%', axis: 'right', color: 'rgba(160,120,100,0.5)' }],
  cartOptimizations: [{ key: 'conversionRate', label: 'Conversion Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.9)' }, { key: 'bounceRate', label: 'Bounce Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.7)' }, { key: 'avgOrderValue', label: 'Avg Order Value', unit: '$', axis: 'left', color: 'rgba(255,159,64,1)' }],
};

// Standard KPI sets per task category
const categoryKPIs = {
  Traffic: {
    serviceKPIs: [{ key: 'organicSessions', label: 'Organic Sessions', unit: '', axis: 'right', color: 'rgba(54,162,235,0.9)' }, { key: 'page1Rankings', label: 'Page 1 Rankings', unit: '', axis: 'right', color: 'rgba(54,162,235,0.7)' }, { key: 'organicCTR', label: 'Organic CTR', unit: '%', axis: 'right', color: 'rgba(54,162,235,0.5)' }],
    configurableKPIs: [{ key: 'organicSessions', label: 'Organic Sessions', unit: '', current: 8500, industry: 22000, description: 'Monthly organic sessions' }, { key: 'page1Rankings', label: 'Page 1 Rankings', unit: '', current: 2, industry: 10, description: 'Keywords ranking on page 1' }, { key: 'organicCTR', label: 'Organic CTR', unit: '%', current: 2.4, industry: 4.5, description: 'Organic click-through rate' }],
  },
  Conversion: {
    serviceKPIs: [{ key: 'conversionRate', label: 'Conversion Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.9)' }, { key: 'bounceRate', label: 'Bounce Rate', unit: '%', axis: 'right', color: 'rgba(255,159,64,0.7)' }, { key: 'avgOrderValue', label: 'Avg Order Value', unit: '$', axis: 'left', color: 'rgba(255,159,64,1)' }],
    configurableKPIs: [{ key: 'conversionRate', label: 'Conversion Rate', unit: '%', current: 2.4, industry: 2.8, description: 'Overall conversion rate' }, { key: 'bounceRate', label: 'Bounce Rate', unit: '%', current: 42, industry: 38, description: 'Site bounce rate', lowerIsBetter: true }, { key: 'avgOrderValue', label: 'Avg Order Value', unit: '$', current: 125, industry: 142, description: 'Average order value' }],
  },
  Retention: {
    serviceKPIs: [{ key: 'repeatPurchaseRate', label: 'Repeat Purchase Rate', unit: '%', axis: 'right', color: 'rgba(153,102,255,0.9)' }, { key: 'customerLTV', label: 'Customer LTV', unit: '$', axis: 'left', color: 'rgba(153,102,255,1)' }, { key: 'referralRate', label: 'Referral Rate', unit: '%', axis: 'right', color: 'rgba(153,102,255,0.7)' }],
    configurableKPIs: [{ key: 'repeatPurchaseRate', label: 'Repeat Purchase Rate', unit: '%', current: 22, industry: 35, description: 'Repeat purchase rate' }, { key: 'customerLTV', label: 'Customer LTV', unit: '$', current: 280, industry: 420, description: 'Customer lifetime value' }, { key: 'referralRate', label: 'Referral Rate', unit: '%', current: 3, industry: 8, description: 'Customer referral rate' }],
  },
};

const AcadacaGrowthChart = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const PASSCODE_HASH = '1d58f88c64c0359fdde410d88575d6b006bee416a5457dbbdaa9488bffe5acda';
  const hashPassword = (pwd) => {
    // Simple djb2-style hash won't match SHA-256, so use a direct comparison with an obfuscated check
    let h = 0;
    for (let i = 0; i < pwd.length; i++) { h = ((h << 5) - h + pwd.charCodeAt(i)) | 0; }
    return h;
  };
  const PASSCODE_CHECK = hashPassword(String.fromCharCode(98,102,102,50,54,33));
  const checkPassword = (input) => {
    const trimmed = (input || '').trim();
    if (trimmed.length > 0 && hashPassword(trimmed) === PASSCODE_CHECK) { setAuthenticated(true); setPasswordError(false); }
    else { setPasswordError(true); setPasswordInput(''); }
  };

  const [darkMode, setDarkMode] = useState(false);
  const [themeHover, setThemeHover] = useState(false);
  const theme = darkMode ? themes.dark : themes.light;
  const [showActualFees, setShowActualFees] = useState(true);
  const [showStandardFees, setShowStandardFees] = useState(false);
  const [clickedLineData, setClickedLineData] = useState(null);
  const [showKPIPanel, setShowKPIPanel] = useState(false);
  const [kpiScenarioAdjustments, setKpiScenarioAdjustments] = useState({}); // { kpiKey: targetValue }
  const [kpiPanelMonth, setKpiPanelMonth] = useState(null);
  const [showFeePanel, setShowFeePanel] = useState(false);
  const [revenueDrilldown, setRevenueDrilldown] = useState(false);
  const [feePanelMonth, setFeePanelMonth] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editableServices, setEditableServices] = useState([...services]);
  const [capabilitiesDropdownOpen, setCapabilitiesDropdownOpen] = useState(false);
  const [milestoneDropdownOpen, setMilestoneDropdownOpen] = useState(false);
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);
  const [capabilitySearchFilter, setCapabilitySearchFilter] = useState('');
  const [taskSearchFilter, setTaskSearchFilter] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [selectedCapability, setSelectedCapability] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showRevenue, setShowRevenue] = useState(true);
  const [showMilestoneRevenue, setShowMilestoneRevenue] = useState(false);
  const [showTodayBreakdown, setShowTodayBreakdown] = useState(false);
  const [showChannelBar, setShowChannelBar] = useState(true); // shows channel chips impact bar without chart overlay
  const [breakdownMonthIndex, setBreakdownMonthIndex] = useState(null); // null = current month
  const [selectedBreakdownChannel, setSelectedBreakdownChannel] = useState(null);
  const [compareFromIndex, setCompareFromIndex] = useState(null);
  const [compareToIndex, setCompareToIndex] = useState(null);
  const [compareFromIndex2, setCompareFromIndex2] = useState(null);
  const [compareToIndex2, setCompareToIndex2] = useState(null);
  const [timeGranularity, setTimeGranularity] = useState('M'); // M = Monthly, Q = Quarterly, Y = Yearly
  const [showCompareMode, setShowCompareMode] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryScope, setSummaryScope] = useState('portfolio');
  const [selectedProjectedIdx, setSelectedProjectedIdx] = useState(null);
  const [kpiVersion, setKpiVersion] = useState(0); // 'portfolio' or 'channel'
  const [tags, setTags] = useState([
    { id: 'tag_sample_1', label: 'Black Friday Sale', description: 'Sitewide 30% off drove record traffic and conversion spike', date: 'Nov 24, 2023', rawDate: '2023-11-24', monthIndex: 3, dayOfMonth: 24, daysInMonth: 30, fractionalIndex: 3 + 23/30 },
    { id: 'tag_sample_2', label: 'Influencer TikTok Viral', description: 'Unboxing video hit 2.3M views — organic traffic surged 40% for 2 weeks', date: 'Mar 15, 2024', rawDate: '2024-03-15', monthIndex: 7, dayOfMonth: 15, daysInMonth: 31, fractionalIndex: 7 + 14/31 },
    { id: 'tag_sample_3', label: 'Google Core Update', description: 'March 2024 core update — rankings dipped temporarily before recovering', date: 'Jun 5, 2024', rawDate: '2024-06-05', monthIndex: 10, dayOfMonth: 5, daysInMonth: 30, fractionalIndex: 10 + 4/30 },
    { id: 'tag_sample_4', label: 'New Product Launch', description: 'Premium line launch with dedicated landing page and email blast', date: 'Jan 20, 2025', rawDate: '2025-01-20', monthIndex: 17, dayOfMonth: 20, daysInMonth: 31, fractionalIndex: 17 + 19/31 },
    { id: 'tag_sample_5', label: 'Competitor Price War', description: 'Main competitor ran aggressive 50% off — we held margins but saw traffic dip', date: 'Sep 8, 2025', rawDate: '2025-09-08', monthIndex: 25, dayOfMonth: 8, daysInMonth: 30, fractionalIndex: 25 + 7/30 },
  ]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagSearchFilter, setTagSearchFilter] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [newTagDate, setNewTagDate] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);
  const areaClickGuard = React.useRef(false);

  // ── Goals Panel ──
  const [showGoalsPanel, setShowGoalsPanel] = useState(false);
  const [goalMode, setGoalMode] = useState('total'); // 'total' | 'channel'
  const [goalTotalRevenue, setGoalTotalRevenue] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalChannelValues, setGoalChannelValues] = useState({ paidSocial: '', paidSearch: '', seo: '', email: '', affiliate: '' });
  const [goalPlan, setGoalPlan] = useState(null); // computed plan
  const [goalApplied, setGoalApplied] = useState(false);

  // Channel definitions for Today breakdown — order matters for stacking (bottom to top)
  const breakdownChannels = useMemo(() => [
    { key: 'paidSocial', stackKey: 'stack_paidSocial', name: 'Paid Social', color: 'oklch(0.55 0.22 10)', fill: 'rgba(200, 60, 60, 0.18)', capabilityId: 'paidSocial', industryBenchmark: 22 },
    { key: 'paidSearch', stackKey: 'stack_paidSearch', name: 'Paid Search', color: 'oklch(0.58 0.18 30)', fill: 'rgba(210, 100, 50, 0.18)', capabilityId: 'paidSearch', industryBenchmark: 18 },
    { key: 'seo', stackKey: 'stack_seo', name: 'SEO', color: 'oklch(0.52 0.18 25)', fill: 'rgba(180, 80, 50, 0.18)', capabilityId: 'seo', industryBenchmark: 25 },
    { key: 'email', stackKey: 'stack_email', name: 'Email', color: 'oklch(0.56 0.16 40)', fill: 'rgba(200, 110, 50, 0.18)', capabilityId: 'email', industryBenchmark: 20 },
    { key: 'affiliate', stackKey: 'stack_affiliate', name: 'Affiliate', color: 'oklch(0.50 0.20 355)', fill: 'rgba(170, 50, 80, 0.18)', capabilityId: 'affiliate', industryBenchmark: 10 },
    { key: 'other', stackKey: 'stack_other', name: 'Other / Direct', color: 'oklch(0.58 0.10 20)', fill: 'rgba(160, 120, 100, 0.12)', capabilityId: 'other', industryBenchmark: 5 },
  ], []);
  // Per-client configurable benchmark overrides (key → target %)
  const [channelBenchmarks, setChannelBenchmarks] = useState({
    paidSocial: 22, paidSearch: 18, seo: 25, email: 20, affiliate: 10, other: 5,
  });
  const [showContributionPanel, setShowContributionPanel] = useState(false);
  const [adjustedBenchmarks, setAdjustedBenchmarks] = useState({});
  const [expandedContributionChannel, setExpandedContributionChannel] = useState(null);
  const [tagPositions, setTagPositions] = useState([]); // [{id, x, yTop, label, date, description, tag}] // key → true for channels that have been tweaked
  const [visibleKPIs, setVisibleKPIs] = useState({});
  const [hypotheticalServices, setHypotheticalServices] = useState([]);
  const [configuringService, setConfiguringService] = useState(null);
  const [configuringTask, setConfiguringTask] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [configStartMonth, setConfigStartMonth] = useState('');
  const [configStartDay, setConfigStartDay] = useState('');
  const [configKPIs, setConfigKPIs] = useState({});
  const [configCosts, setConfigCosts] = useState([{ amount: '', frequency: 'one-time' }]);
  const currentMonthIndex = 31;
  const [visibleWindow, setVisibleWindow] = useState(18);
  const [visibleRangeStart, setVisibleRangeStart] = useState(21);
  const [visibleRangeEnd, setVisibleRangeEnd] = useState(38);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRange, setDragStartRange] = useState(0);

  const data = useMemo(() => {
    const raw = generateData();
    // Add completed task costs to actualFees
    const taskCostsByMonth = {};
    [...tasks, ...capabilities].forEach(item => {
      if (item.costs) {
        item.costs.forEach(c => {
          if (c.monthIndex != null) {
            taskCostsByMonth[c.monthIndex] = (taskCostsByMonth[c.monthIndex] || 0) + c.amount;
          }
        });
      }
    });
    if (Object.keys(taskCostsByMonth).length > 0) {
      raw.forEach(d => {
        if (taskCostsByMonth[d.index]) {
          d.actualFees += taskCostsByMonth[d.index];
        }
      });
    }
    return raw;
  }, []);
  const maxMonthIndex = data.length - 1;

  // Priority 4: Zoom
  const zoomIn = () => { const nw = Math.max(6, visibleWindow - 3); setVisibleWindow(nw); const mid = Math.round((visibleRangeStart + visibleRangeEnd) / 2); const ns = Math.max(0, mid - Math.floor(nw / 2)); const ne = Math.min(maxMonthIndex, ns + nw - 1); setVisibleRangeStart(Math.max(0, ne - nw + 1)); setVisibleRangeEnd(ne); };
  const zoomOut = () => { const nw = Math.min(maxMonthIndex + 1, visibleWindow + 6); setVisibleWindow(nw); const mid = Math.round((visibleRangeStart + visibleRangeEnd) / 2); const ns = Math.max(0, mid - Math.floor(nw / 2)); const ne = Math.min(maxMonthIndex, ns + nw - 1); setVisibleRangeStart(Math.max(0, ne - nw + 1)); setVisibleRangeEnd(ne); };

  // Today button — simply centers the chart on today's date
  const goToToday = () => {
    const h = Math.floor(visibleWindow / 2);
    const s = Math.max(0, currentMonthIndex - h);
    setVisibleRangeStart(s);
    setVisibleRangeEnd(Math.min(maxMonthIndex, s + visibleWindow - 1));
    setShowChannelBar(true);
    setShowActualFees(true);
    setShowTodayBreakdown(false);
    setSelectedBreakdownChannel(null);
    setBreakdownMonthIndex(null);
    setShowContributionPanel(false);
    setCompareFromIndex(null); setCompareToIndex(null); setCompareFromIndex2(null); setCompareToIndex2(null);
    setShowCompareMode(false);
    setSelectedCapability(null); setSelectedTask(null);
    setSelectedMilestone(null);
    setSelectedProjectedIdx(null);
    setVisibleKPIs({});
  };

  // Contribution toggle — simple on/off
  const toggleContribution = () => {
    if (!showTodayBreakdown) {
      // Turn on contribution overlay
      setShowTodayBreakdown(true);
      setShowChannelBar(true);
      setSelectedBreakdownChannel(null);
      setSelectedProjectedIdx(null);
      setBreakdownMonthIndex(null);
      setCompareFromIndex(null); setCompareToIndex(null); setCompareFromIndex2(null); setCompareToIndex2(null);
    } else {
      // Turn off contribution overlay
      setShowTodayBreakdown(false);
      setSelectedBreakdownChannel(null);
      setBreakdownMonthIndex(null);
      setCompareFromIndex(null); setCompareToIndex(null); setCompareFromIndex2(null); setCompareToIndex2(null);
      setShowContributionPanel(false);
    }
  };
  const contributionButtonLabel = 'Contributions';
  const activeBreakdownMonth = breakdownMonthIndex ?? currentMonthIndex;

  // Priority 6: Auto-scroll
  const scrollToMonth = (mi) => { if (mi == null) return; const h = Math.floor(visibleWindow / 2); const s = Math.max(0, mi - h); const e = Math.min(maxMonthIndex, s + visibleWindow - 1); setVisibleRangeStart(Math.max(0, e - visibleWindow + 1)); setVisibleRangeEnd(e); };

  const visibleData = useMemo(() => data.filter(d => d.index >= visibleRangeStart && d.index <= visibleRangeEnd), [data, visibleRangeStart, visibleRangeEnd]);

  // Aggregate data by granularity (Q or Y)
  const aggregatedData = useMemo(() => {
    if (timeGranularity === 'M') return null;
    const source = data.filter(d => d.index >= visibleRangeStart && d.index <= visibleRangeEnd);
    if (source.length === 0) return [];
    const buckets = {};
    const numericKeys = ['totalRevenue', 'paidSocial', 'paidSearch', 'seo', 'email', 'affiliate', 'other', 'actualFees', 'standardFees', 'incrementalRevenue'];
    const avgKeys = ['conversionRate', 'bounceRate', 'avgOrderValue', 'pagesPerSession', 'roas', 'cpa', 'ctr', 'paidConversionRate', 'organicConversionRate', 'avgPosition', 'emailOpenRate', 'emailClickRate', 'emailConversionRate', 'affiliateConversionRate', 'affiliateCPA'];
    source.forEach(d => {
      const parts = d.month.split(' ');
      const mon = parts[0]; const yr = parts[1] || '';
      let bucketKey, bucketLabel;
      if (timeGranularity === 'Q') {
        const qMap = { Jan: 'Q1', Feb: 'Q1', Mar: 'Q1', Apr: 'Q2', May: 'Q2', Jun: 'Q2', Jul: 'Q3', Aug: 'Q3', Sep: 'Q3', Oct: 'Q4', Nov: 'Q4', Dec: 'Q4' };
        bucketKey = `${qMap[mon]} ${yr}`;
        bucketLabel = bucketKey;
      } else {
        bucketKey = yr;
        bucketLabel = yr;
      }
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = { month: bucketLabel, _items: [], _firstIndex: d.index };
        numericKeys.forEach(k => { buckets[bucketKey][k] = 0; });
        avgKeys.forEach(k => { buckets[bucketKey]['_sum_' + k] = 0; buckets[bucketKey]['_cnt_' + k] = 0; });
      }
      const b = buckets[bucketKey];
      b._items.push(d);
      b.index = b._firstIndex;
      numericKeys.forEach(k => { b[k] += (d[k] || 0); });
      avgKeys.forEach(k => { if (d[k] != null) { b['_sum_' + k] += d[k]; b['_cnt_' + k]++; } });
    });
    return Object.values(buckets).map(b => {
      avgKeys.forEach(k => { b[k] = b['_cnt_' + k] > 0 ? Math.round((b['_sum_' + k] / b['_cnt_' + k]) * 100) / 100 : null; });
      return b;
    });
  }, [data, visibleRangeStart, visibleRangeEnd, timeGranularity]);

  const displayData = aggregatedData || visibleData;

  // Compute scenario revenue based on KPI adjustments
  const scenarioData = useMemo(() => {
    const adjustKeys = Object.keys(kpiScenarioAdjustments);
    if (adjustKeys.length === 0) return null;
    // Find the month index where the user clicked the KPI dot
    const clickedMonthData = kpiPanelMonth ? data.find(d => d.month === kpiPanelMonth) : null;
    const scenarioStartIdx = clickedMonthData ? clickedMonthData.index : currentMonthIndex;
    // Calculate total lift multiplier from all KPI adjustments
    let totalLiftPct = 0;
    adjustKeys.forEach(kpiKey => {
      const target = kpiScenarioAdjustments[kpiKey];
      const baseData = data[scenarioStartIdx];
      const current = baseData?.[kpiKey];
      if (current == null || current === 0) return;
      const changePct = ((target - current) / Math.abs(current)) * 100;
      const sensitivity = {
        conversionRate: 1.0, bounceRate: -0.4, avgOrderValue: 0.8, customerLTV: 0.3, repeatPurchaseRate: 0.5,
        roas: 0.7, cpa: -0.5, ctr: 0.4, paidConversionRate: 0.8,
        organicTraffic: 0.6, organicConversionRate: 0.8, avgPosition: -0.3,
        emailOpenRate: 0.3, emailClickRate: 0.5, emailROI: 0.4, emailConversionRate: 0.6,
        affiliateRevenue: 0.7, activePartners: 0.4, commissionRate: -0.2,
        croConversionRate: 0.9, revenuePerVisitor: 0.8, testWinRate: 0.3,
        directTraffic: 0.5, directConversionRate: 0.7, directAOV: 0.6, brandSearchShare: 0.3,
      };
      const sens = sensitivity[kpiKey] ?? 0.5;
      totalLiftPct += changePct * sens * 0.01;
    });
    if (Math.abs(totalLiftPct) < 0.001) return null;
    // Show scenario from the clicked month forward, ramping over 3 months to full effect
    return data.map((d, i) => {
      if (i < scenarioStartIdx) return { ...d, scenarioRevenue: null };
      const monthsOut = i - scenarioStartIdx;
      const rampFactor = Math.min(1, monthsOut / 3);
      const liftAtMonth = i === scenarioStartIdx ? 0 : totalLiftPct * rampFactor;
      return { ...d, scenarioRevenue: Math.round(d.totalRevenue * (1 + liftAtMonth)) };
    });
  }, [kpiScenarioAdjustments, data, currentMonthIndex, kpiPanelMonth]);

  // Compute stacked cumulative values for Today breakdown
  const breakdownData = useMemo(() => {
    if (!showTodayBreakdown) return null;
    const sourceData = displayData;
    return sourceData.map(d => {
      // If scenario is active, use scenario revenue as the total
      const scenarioPoint = scenarioData?.find(s => s.index === d.index);
      const effectiveTotal = (scenarioPoint?.scenarioRevenue != null) ? scenarioPoint.scenarioRevenue : d.totalRevenue;
      const rawPs = d.paidSocial || 0;
      const rawPsr = d.paidSearch || 0;
      const rawSe = d.seo || 0;
      const rawEm = d.email || 0;
      const rawAf = d.affiliate || 0;
      const rawOt = d.other || 0;
      const rawTotal = rawPs + rawPsr + rawSe + rawEm + rawAf + rawOt;
      // Normalize so channels sum exactly to effectiveTotal (scenario-adjusted)
      const scale = rawTotal > 0 ? effectiveTotal / rawTotal : 1;
      const ps = Math.round(rawPs * scale);
      const psr = Math.round(rawPsr * scale);
      const se = Math.round(rawSe * scale);
      const em = Math.round(rawEm * scale);
      const af = Math.round(rawAf * scale);
      const ot = d.totalRevenue - ps - psr - se - em - af; // remainder absorbs rounding
      const base = ps + psr + se + em + af + ot;
      // Compute projected lift for this data point
      let projLift = 0;
      let cumulativeProj = base;
      const perProjStacks = {};
      if (hypotheticalServices.length > 0) {
        hypotheticalServices.forEach((h, hIdx) => {
          let lift = 0;
          if (d.index >= (h.startMonthIndex ?? Infinity)) {
            const monthsIn = d.index - h.startMonthIndex;
            const progress = Math.min(1, monthsIn / 12);
            const eased = 1 - Math.pow(1 - progress, 2);
            lift = Math.round(d.totalRevenue * h.projectedLift * eased);
            projLift += lift;
          }
          cumulativeProj += lift;
          perProjStacks[`bd_proj_stack_${hIdx}`] = d.index >= (h.startMonthIndex ?? Infinity) ? cumulativeProj : null;
        });
      }
      return {
        ...d,
        _ps: ps, _psr: psr, _se: se, _em: em, _af: af, _ot: ot,
        stack_paidSocial: ps,
        stack_paidSearch: ps + psr,
        stack_seo: ps + psr + se,
        stack_email: ps + psr + se + em,
        stack_affiliate: ps + psr + se + em + af,
        stack_other: base,
        stack_projected: projLift > 0 ? base + projLift : null,
        _projLift: projLift,
        totalRevenue: effectiveTotal,
        ...perProjStacks,
      };
    });
  }, [displayData, showTodayBreakdown, hypotheticalServices, scenarioData]);

  // When benchmarks are adjusted, compute modified breakdown data showing the modeled mix
  const adjustedBreakdownData = useMemo(() => {
    if (!breakdownData || Object.keys(adjustedBenchmarks).length === 0) return null;
    return breakdownData.map(d => {
      const origTotal = d.totalRevenue || 0;
      if (origTotal <= 0) return d;
      // Compute what each adjusted channel's revenue WOULD be at target %
      const channels = [
        { key: 'paidSocial', raw: '_ps' },
        { key: 'paidSearch', raw: '_psr' },
        { key: 'seo', raw: '_se' },
        { key: 'email', raw: '_em' },
        { key: 'affiliate', raw: '_af' },
        { key: 'other', raw: '_ot' },
      ];
      let newTotal = 0;
      const newVals = {};
      channels.forEach(ch => {
        const origVal = d[ch.raw] || 0;
        if (adjustedBenchmarks[ch.key]) {
          const bch = breakdownChannels.find(c => c.key === ch.key);
          const target = channelBenchmarks[ch.key] ?? (bch?.industryBenchmark || 0);
          const targetVal = Math.round(origTotal * target / 100);
          newVals[ch.raw] = Math.max(origVal, targetVal); // only increase, never decrease
        } else {
          newVals[ch.raw] = origVal;
        }
        newTotal += newVals[ch.raw];
      });
      const ps = newVals._ps, psr = newVals._psr, se = newVals._se, em = newVals._em, af = newVals._af, ot = newVals._ot;
      const base = ps + psr + se + em + af + ot;
      // Recompute projected stacks
      let projLift = d._projLift || 0;
      const perProjStacks = {};
      if (hypotheticalServices.length > 0) {
        let cumulativeProj = base;
        hypotheticalServices.forEach((h, hIdx) => {
          let lift = 0;
          if (d.index >= (h.startMonthIndex ?? Infinity)) {
            const monthsIn = d.index - h.startMonthIndex;
            const progress = Math.min(1, monthsIn / 12);
            const eased = 1 - Math.pow(1 - progress, 2);
            lift = Math.round(newTotal * h.projectedLift * eased);
          }
          cumulativeProj += lift;
          perProjStacks[`bd_proj_stack_${hIdx}`] = d.index >= (h.startMonthIndex ?? Infinity) ? cumulativeProj : null;
        });
      }
      return {
        ...d,
        _ps: ps, _psr: psr, _se: se, _em: em, _af: af, _ot: ot,
        stack_paidSocial: ps,
        stack_paidSearch: ps + psr,
        stack_seo: ps + psr + se,
        stack_email: ps + psr + se + em,
        stack_affiliate: ps + psr + se + em + af,
        stack_other: base,
        adjustedTotalRevenue: base,
        originalTotalRevenue: origTotal,
        stack_projected: projLift > 0 ? base + projLift : null,
        ...perProjStacks,
      };
    });
  }, [breakdownData, adjustedBenchmarks, channelBenchmarks, breakdownChannels, hypotheticalServices]);

  const chartData = useMemo(() => {
    const base = displayData;
    if (!scenarioData) return base;
    return base.map(d => {
      const sd = scenarioData.find(s => s.index === d.index);
      return sd ? { ...d, scenarioRevenue: sd.scenarioRevenue } : d;
    });
  }, [displayData, scenarioData]);
  const availableMonths = useMemo(() => data.filter(d => d.index > currentMonthIndex), [data]);

  const canGoLeft = visibleRangeStart > 0;
  const canGoRight = visibleRangeEnd < maxMonthIndex;
  const panLeft = (m = 6) => { const s = Math.max(0, visibleRangeStart - m); setVisibleRangeStart(s); setVisibleRangeEnd(s + visibleWindow - 1); setClickedLineData(null); };
  const panRight = (m = 6) => { const e = Math.min(maxMonthIndex, visibleRangeEnd + m); setVisibleRangeEnd(e); setVisibleRangeStart(e - visibleWindow + 1); setClickedLineData(null); };

  // Drag-to-pan
  const handleDragStart = (e) => { if (e.button !== 0) return; const tag = e.target.tagName.toLowerCase(); if (tag === 'circle' || tag === 'button' || tag === 'input' || tag === 'select' || e.target.closest('button') || e.target.closest('[data-dropdown-menu]')) return; setIsDragging(true); setDragStartX(e.clientX); setDragStartRange(visibleRangeStart); };
  const handleDragMove = useCallback((e) => { if (!isDragging) return; const dx = e.clientX - dragStartX; const ms = Math.round(dx / 12); let s = dragStartRange + ms; s = Math.max(0, Math.min(maxMonthIndex - visibleWindow + 1, s)); setVisibleRangeStart(s); setVisibleRangeEnd(s + visibleWindow - 1); }, [isDragging, dragStartX, dragStartRange, maxMonthIndex, visibleWindow]);
  const handleDragEnd = useCallback(() => setIsDragging(false), []);
  useEffect(() => { if (isDragging) { window.addEventListener('mousemove', handleDragMove); window.addEventListener('mouseup', handleDragEnd); return () => { window.removeEventListener('mousemove', handleDragMove); window.removeEventListener('mouseup', handleDragEnd); }; } }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => { const h = (e) => { if (!e.target.closest('button') && !e.target.closest('[data-dropdown-menu]')) { setLineDropdownOpen(false); setMilestoneDropdownOpen(false); setCapabilitiesDropdownOpen(false); setConfiguringService(null); setConfiguringTask(null); setCreatingTask(false); setTagDropdownOpen(false); setAddingTag(false); } }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  // Config modal helpers
  const addNewService = () => {
    const ns = { id: `service_${Date.now()}`, name: 'New Milestone', date: 'Jan 2025', monthIndex: 17, description: 'Description', color: theme.chart3, type: 'direct_revenue', revenueMetric: 'paidSocial', baselineRevenue: 0, fees: [{ date: 'Jan 2025', amount: 5000, description: 'Initial fee' }], note: 'Explanatory note.', kpis: {} };
    setEditableServices([...editableServices, ns]); setEditingService(ns);
  };
  const deleteService = (id) => { if (confirm('Delete this event?')) { setEditableServices(editableServices.filter(s => s.id !== id)); setEditingService(null); } };
  const updateService = (id, updates) => { setEditableServices(editableServices.map(s => s.id === id ? { ...s, ...updates } : s)); if (editingService?.id === id) setEditingService({ ...editingService, ...updates }); };
  const addFee = (id) => { const s = editableServices.find(s => s.id === id); updateService(id, { fees: [...(s.fees || []), { date: 'Jan 2025', amount: 0, description: '' }] }); };
  const updateFee = (id, idx, updates) => { const s = editableServices.find(s => s.id === id); updateService(id, { fees: s.fees.map((f, i) => i === idx ? { ...f, ...updates } : f) }); };
  const deleteFee = (id, idx) => { const s = editableServices.find(s => s.id === id); updateService(id, { fees: s.fees.filter((_, i) => i !== idx) }); };
  const addKPI = (id) => { const s = editableServices.find(s => s.id === id); const k = `kpi_${Date.now()}`; const nk = { key: k, label: 'New KPI', unit: '%', axis: 'right', color: s.color }; serviceKPIs[id] = [...(serviceKPIs[id] || []), nk]; updateService(id, {}); };
  const updateKPI = (id, idx, updates) => { serviceKPIs[id] = (serviceKPIs[id] || []).map((k, i) => i === idx ? { ...k, ...updates } : k); updateService(id, {}); };
  const deleteKPI = (id, idx) => { serviceKPIs[id] = (serviceKPIs[id] || []).filter((_, i) => i !== idx); updateService(id, {}); };

  const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  // Tag helpers
  const addTag = () => {
    if (!newTagLabel || !newTagDate) return;
    const dt = new Date(newTagDate + 'T00:00:00');
    const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthLabel = `${ml[dt.getMonth()]} ${dt.getFullYear()}`;
    const monthIdx = data.findIndex(d => d.month === monthLabel);
    if (monthIdx < 0) return;
    const dayOfMonth = dt.getDate();
    const daysInMonth = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
    const displayDate = `${ml[dt.getMonth()]} ${dayOfMonth}, ${dt.getFullYear()}`;
    const tag = {
      id: `tag_${Date.now()}`,
      label: newTagLabel,
      description: newTagDescription,
      date: displayDate,
      rawDate: newTagDate,
      monthIndex: monthIdx,
      dayOfMonth,
      daysInMonth,
      fractionalIndex: monthIdx + (dayOfMonth - 1) / daysInMonth,
    };
    setTags(prev => [...prev, tag]);
    setNewTagLabel(''); setNewTagDescription(''); setNewTagDate(''); setAddingTag(false);
  };
  const deleteTag = (tagId) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    if (selectedTag?.id === tagId) setSelectedTag(null);
  };

  const handleSelectCapability = (cap) => {
    setSelectedCapability(cap); setSelectedMilestone(cap); setSelectedTask(null); setCapabilitiesDropdownOpen(false); setCapabilitySearchFilter(''); setShowStandardFees(false); setShowMilestoneRevenue(true);
    setShowChannelBar(true); setShowContributionPanel(false); setShowCompareMode(false);
    // Set the matching breakdown channel for drilldown
    const ch = breakdownChannels.find(c => c.capabilityId === cap.id) || (cap.revenueMetric ? breakdownChannels.find(c => c.key === cap.revenueMetric) : null);
    if (ch) {
      setSelectedBreakdownChannel(ch.key);
      setCompareFromIndex(cap.monthIndex);
      setCompareToIndex(Math.min((cap.monthIndex ?? 0) + 2, currentMonthIndex));
      setCompareFromIndex2(Math.max(0, currentMonthIndex - 2));
      setCompareToIndex2(currentMonthIndex);
    } else {
      setSelectedBreakdownChannel(null);
    }
    if (serviceKPIs[cap.id]) { const k = {}; serviceKPIs[cap.id].forEach(kpi => { k[kpi.key] = true; }); setVisibleKPIs(k); }
    if (cap.monthIndex != null) scrollToMonth(cap.monthIndex);
  };
  const handleSelectTask = (task) => { setSelectedTask(task); setSelectedMilestone(task); setSelectedCapability(null); setMilestoneDropdownOpen(false); setTaskSearchFilter(''); setShowStandardFees(false); setShowMilestoneRevenue(true); setShowTodayBreakdown(false); setSelectedBreakdownChannel(null); setShowChannelBar(false); if (serviceKPIs[task.id]) { const k = {}; serviceKPIs[task.id].forEach(kpi => { k[kpi.key] = true; }); setVisibleKPIs(k); } if (task.monthIndex != null) scrollToMonth(task.monthIndex); };
  const resetToDefault = () => { setSelectedCapability(null); setSelectedTask(null); setSelectedMilestone(null); setVisibleKPIs({}); setShowActualFees(true); setShowStandardFees(false); setShowMilestoneRevenue(false); setShowTodayBreakdown(false); setSelectedBreakdownChannel(null); setCapabilitiesDropdownOpen(false); setMilestoneDropdownOpen(false); };

  // Projected revenue data for hypothetical services — includes KPI baseline + ramp-up (Req 2.2)
  const projectedData = useMemo(() => {
    if (hypotheticalServices.length === 0) return null;
    const earliestStart = Math.min(...hypotheticalServices.map(h => h.startMonthIndex));
    return visibleData.map(d => {
      let pr = d.totalRevenue;
      let addedCosts = 0;
      const kpiOverrides = {};
      const perServiceLifts = {};
      let cumulativeStack = d.totalRevenue;
      hypotheticalServices.forEach((h, hIdx) => {
        let lift = 0;
        if (d.index >= h.startMonthIndex) {
          const monthsIn = d.index - h.startMonthIndex;
          const rampDuration = 12;
          const progress = Math.min(1, monthsIn / rampDuration);
          const eased = 1 - Math.pow(1 - progress, 2);
          lift = Math.round(d.totalRevenue * h.projectedLift * eased);
          pr += lift;
          // Add costs from this service
          if (h.costs?.length > 0) {
            h.costs.forEach(cost => {
              if (cost.frequency === 'one-time') {
                if (d.index === h.startMonthIndex) addedCosts += cost.amount;
              } else if (cost.frequency === 'monthly') {
                addedCosts += cost.amount;
              }
            });
          }
        }
        cumulativeStack += lift;
        perServiceLifts[`proj_stack_${hIdx}`] = d.index >= h.startMonthIndex ? cumulativeStack : null;
        perServiceLifts[`proj_lift_${hIdx}`] = lift;
        // Inject KPI baseline (current) values across full timeline, ramp toward target after start
        const cfgKPIs = h.configurableKPIs || [];
        cfgKPIs.forEach(kpi => {
          const current = kpi.current ?? 0;
          const target = h.configuredKPIs?.[kpi.key]?.target ?? kpi.industry ?? current;
          if (d.index < (h.startMonthIndex ?? Infinity)) {
            kpiOverrides[kpi.key] = current;
          } else {
            const monthsIn = d.index - h.startMonthIndex;
            const rampDuration = 12;
            const progress = Math.min(1, monthsIn / rampDuration);
            const eased = 1 - Math.pow(1 - progress, 2);
            kpiOverrides[kpi.key] = Math.round((current + (target - current) * eased) * 100) / 100;
          }
        });
      });
      const feeRate = d.totalRevenue > 0 ? d.actualFees / d.totalRevenue : 0.15;
      const projectedFees = d.index >= earliestStart ? Math.round(pr * feeRate) + addedCosts : null;
      return { ...d, projectedRevenue: d.index >= earliestStart ? pr : null, projectedLiftAmount: d.index >= earliestStart ? pr - d.totalRevenue : null, projectedFees, ...perServiceLifts, ...kpiOverrides };
    });
  }, [visibleData, hypotheticalServices]);

  // Stable Y-axis max — computed from all possible data sources so toggling Contribution doesn't rescale
  const stableYMax = useMemo(() => {
    const allSources = [displayData, projectedData, breakdownData, adjustedBreakdownData].filter(Boolean);
    let max = 0;
    allSources.forEach(src => {
      src.forEach(d => {
        const vals = [d.totalRevenue || 0, d.projectedRevenue || 0, d.stack_projected || 0, d.stack_other || 0];
        vals.forEach(v => { if (v > max) max = v; });
      });
    });
    return max > 0 ? Math.ceil(max * 1.08) : 'auto';
  }, [displayData, projectedData, breakdownData, adjustedBreakdownData]);

  // Priority 12: Impact Bar content
  // Priority 12: Impact Bar content — always shows running total when projected items exist
  const [impactBarPage, setImpactBarPage] = useState(0);
  const projectedImpacts = useMemo(() => {
    if (hypotheticalServices.length === 0) return [];
    const tp = data.find(d => d.index === currentMonthIndex) || data[data.length - 1];
    const baseRevenue = tp?.totalRevenue || 0;
    return hypotheticalServices.map(h => ({ item: h, monthlyLift: Math.round(baseRevenue * h.projectedLift), annualLift: Math.round(baseRevenue * h.projectedLift) * 12 }));
  }, [hypotheticalServices, data]);
  const totalMonthlyLift = projectedImpacts.reduce((s, p) => s + p.monthlyLift, 0);
  const totalAnnualLift = totalMonthlyLift * 12;
  useEffect(() => { if (impactBarPage >= projectedImpacts.length) setImpactBarPage(Math.max(0, projectedImpacts.length - 1)); if (selectedProjectedIdx != null && selectedProjectedIdx >= hypotheticalServices.length) { setSelectedProjectedIdx(null); setVisibleKPIs({}); } }, [projectedImpacts.length, hypotheticalServices.length]);

  const impactBarContent = useMemo(() => {
    // Channel bar views (Today button or Contribution toggle) take priority
    const showBar = showTodayBreakdown || showChannelBar;
    if (showBar) {
      const todayData = data.find(d => d.index === currentMonthIndex);
      const prevData = currentMonthIndex > 0 ? data[currentMonthIndex - 1] : null;
      const momChange = (todayData?.totalRevenue && prevData?.totalRevenue) ? ((todayData.totalRevenue - prevData.totalRevenue) / prevData.totalRevenue * 100) : null;
      return { type: 'todaySummary', todayData, prevData, momChange };
    }
    // If there are projected items, show the focused one (paginated)
    if (projectedImpacts.length > 0) {
      const idx = Math.min(impactBarPage, projectedImpacts.length - 1);
      const p = projectedImpacts[idx];
      return { type: 'projected', item: p.item, monthlyLift: p.monthlyLift, annualLift: p.annualLift };
    }
    if (selectedCapability?.engaged) return { type: 'engaged', item: selectedCapability };
    if (selectedTask?.completed) return { type: 'completedTask', item: selectedTask };
    if (selectedTask && !selectedTask.completed) return { type: 'recommendedTask', item: selectedTask };
    if (selectedTag) return { type: 'tag', item: selectedTag };
    return null;
  }, [selectedCapability, selectedTask, selectedTag, projectedImpacts, impactBarPage, showTodayBreakdown, showChannelBar, selectedBreakdownChannel, breakdownChannels, data]);

  const btnStyle = (active, color) => ({ padding: '8px 14px', background: theme.surface, color: theme.text, border: `1px solid ${active ? color : theme.border}`, borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' });
  const ddStyle = { position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: '260px', maxHeight: '420px', overflowY: 'auto', zIndex: 100 };
  const ddItem = (selected, color) => ({ padding: '10px 16px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: selected ? 700 : 400, color: selected ? color : theme.text, display: 'flex', alignItems: 'center', gap: '8px' });

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '360px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <svg width="40" height="46" viewBox="0 0 111 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M56.3966 0L50.8278 14.6226L56.4514 14.783L51.7679 31.3367L65.9317 11.2359L59.8399 11.0622L64.3611 0.226531L56.3947 0H56.3966Z" fill="#FEDB5C"/>
              <path d="M101.012 116.735C97.05 120.915 91.422 123.282 85.791 125.143C76.894 128.054 67.44 129.064 58.028 129.224C51.154 129.325 44.277 129.032 37.498 128.018C28.379 126.538 16.552 123.416 10.156 116.882C6.045 112.822 5.25 107.534 5.044 102.13C4.793 92.566 4.995 82.827 4.938 73.247C5.038 66.426 4.867 58.879 10.288 53.665C14.03 49.856 19.246 47.57 24.467 45.788C33.553 42.701 43.328 41.616 52.986 41.459C59.859 41.359 66.736 41.652 73.515 42.665C84.29 44.438 100.181 48.608 104.37 59.117C105.535 62.043 105.818 65.422 105.975 68.654C106.186 74.591 106.035 80.602 106.079 86.565C106.043 91.715 106.169 96.827 105.979 101.929C105.771 107.289 105.088 112.603 101.044 116.703L101.012 116.737V116.735Z" fill="#51D4D0"/>
              <path d="M68.5 75C68.5 80.799 64.971 85.703 59.983 87.894L63 100H48L51.017 87.894C46.029 85.703 42.5 80.799 42.5 75C42.5 67.268 48.768 61 56.5 61C64.232 61 68.5 67.268 68.5 75Z" fill="white"/>
            </svg>
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#1a1a2e' }}>BFF Performance Visual [DEMO]</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#888' }}>Enter passcode to continue</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') checkPassword(e.target.value);
            }}
            placeholder="Passcode"
            autoFocus
            style={{ width: '100%', padding: '12px 16px', border: `2px solid ${passwordError ? '#ef4444' : '#e0e0e0'}`, borderRadius: '8px', fontSize: '14px', outline: 'none', textAlign: 'center', letterSpacing: '2px', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          />
          {passwordError && <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>Incorrect passcode</p>}
          <button
            onClick={() => checkPassword(passwordInput)}
            style={{ width: '100%', marginTop: '16px', padding: '12px', background: '#51D4D0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px' }}
          >Enter</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: theme.background, minHeight: '100vh', padding: '12px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: theme.text, letterSpacing: '-0.5px' }}>Demo Store Grow</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <svg width="28" height="33" viewBox="0 0 111 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', marginTop: '-12px' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M56.3966 0L50.8278 14.6226L56.4514 14.783L51.7679 31.3367L65.9317 11.2359L59.8399 11.0622L64.3611 0.226531L56.3947 0H56.3966Z" fill="#FEDB5C"/>
              <path d="M101.012 116.735C97.05 120.915 91.422 123.282 85.791 125.143C76.894 128.054 67.44 129.064 58.028 129.224C51.154 129.325 44.277 129.032 37.498 128.018C28.379 126.538 16.552 123.416 10.156 116.882C6.045 112.822 5.25 107.534 5.044 102.13C4.793 92.566 4.995 82.827 4.938 73.247C5.038 66.426 4.867 58.879 10.288 53.665C14.03 49.856 19.246 47.57 24.467 45.788C33.553 42.701 43.328 41.616 52.986 41.459C59.859 41.359 66.736 41.652 73.515 42.665C84.29 44.438 100.181 48.608 104.37 59.117C105.535 62.043 105.818 65.422 105.975 68.654C106.186 74.591 106.035 80.602 106.079 86.565C106.043 91.715 106.169 96.827 105.979 101.929C105.771 107.289 105.088 112.603 101.044 116.703L101.012 116.737V116.735Z" fill="#51D4D0"/>
              <path d="M93.282 108.655C89.953 111.746 85.23 113.497 80.501 114.872C73.032 117.024 65.094 117.771 57.191 117.888C51.421 117.962 45.648 117.747 39.954 116.997C32.298 115.902 22.368 113.594 16.997 108.763C13.545 105.759 12.878 101.852 12.705 97.854C12.493 90.782 12.663 83.582 12.616 76.497C12.701 71.455 12.555 65.875 17.107 62.02C20.248 59.204 24.628 57.512 29.011 56.195C36.639 53.912 44.847 53.11 52.955 52.995C58.726 52.921 64.499 53.136 70.192 53.886C79.24 55.196 92.581 58.281 96.098 66.051C97.076 68.214 97.314 70.713 97.446 73.103C97.623 77.492 97.497 81.938 97.533 86.346C97.503 90.153 97.608 93.935 97.45 97.706C97.274 101.669 96.7 105.597 93.306 108.629L93.28 108.653L93.282 108.655Z" fill="#DFF3F1"/>
              <path d="M47.194 96.406C52.593 103.847 61.428 103.847 66.827 96.406" stroke="#05363C" strokeWidth="3" strokeMiterlimit="10" strokeLinecap="round"/>
              <path d="M40.828 88.33C44.582 88.33 47.624 85.288 47.624 81.534C47.624 77.781 44.582 74.738 40.828 74.738C37.075 74.738 34.033 77.781 34.033 81.534C34.033 85.288 37.075 88.33 40.828 88.33Z" fill="#05363C"/>
              <path d="M42.365 82.542C43.72 82.542 44.819 81.444 44.819 80.088C44.819 78.733 43.72 77.634 42.365 77.634C41.01 77.634 39.911 78.733 39.911 80.088C39.911 81.444 41.01 82.542 42.365 82.542Z" fill="#DFF3F1"/>
              <path d="M72.224 88.33C75.977 88.33 79.02 85.288 79.02 81.534C79.02 77.781 75.977 74.738 72.224 74.738C68.47 74.738 65.428 77.781 65.428 81.534C65.428 85.288 68.47 88.33 72.224 88.33Z" fill="#05363C"/>
              <path d="M73.896 82.525C75.252 82.525 76.35 81.427 76.35 80.071C76.35 78.716 75.252 77.617 73.896 77.617C72.541 77.617 71.442 78.716 71.442 80.071C71.442 81.427 72.541 82.525 73.896 82.525Z" fill="#DFF3F1"/>
              <path d="M66.643 41.991C66.643 44.313 62.079 42.965 56.45 42.965C50.82 42.965 46.256 44.313 46.256 41.991C46.256 39.669 50.82 34.293 56.45 34.293C62.079 34.293 66.643 39.671 66.643 41.991Z" fill="#51D4D0"/>
              <path d="M7.551 93.597H3.776C1.69 93.597 0 92.23 0 90.544V76.26C0 74.574 1.69 73.207 3.776 73.207H7.551V93.595V93.597Z" fill="#51D4D0"/>
              <path d="M103.449 73.209H107.224C109.31 73.209 111 74.576 111 76.262V90.546C111 92.232 109.31 93.599 107.224 93.599H103.449V73.211V73.209Z" fill="#51D4D0"/>
            </svg>
            <p style={{ margin: 0, color: theme.textMuted, fontSize: '12px' }}>Real-time ecommerce performance tracking and projections</p>
          </div>
        </div>

        {/* Config Setup Modal */}
        {configOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setConfigOpen(false)}>
            <div style={{ background: theme.background, border: `2px solid ${theme.border}`, borderRadius: '8px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: `0 0 40px ${theme.glow.pink}` }} onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div style={{ padding: '24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: theme.text, fontSize: '24px', fontWeight: 700 }}>Event Configuration</h2>
                <button onClick={() => setConfigOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.textMuted, padding: 0 }}>×</button>
              </div>
              <div style={{ padding: '24px' }}>
                {!editingService ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <p style={{ color: theme.textMuted, margin: 0, fontSize: '14px' }}>Configure revenue attribution, fee structure, and explanatory notes for each event.</p>
                      <button onClick={addNewService} style={{ padding: '10px 20px', background: theme.primary, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: `0 0 20px ${theme.glow.pink}`, whiteSpace: 'nowrap' }}>+ Add New Event</button>
                    </div>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {editableServices.map((service) => (
                        <div key={service.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = service.color}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
                          onClick={() => setEditingService(service)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ margin: 0, color: service.color, fontSize: '18px', fontWeight: 700 }}>{service.name}</h3>
                              <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>{service.date} • {service.type === 'conversion_optimizer' ? 'Conversion Optimizer' : 'Direct Revenue Generator'}</p>
                            </div>
                            <button style={{ padding: '8px 16px', background: service.color, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Edit Config →</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    {/* Back & Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <button onClick={() => setEditingService(null)} style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', color: theme.text, fontSize: '13px' }}>← Back to Services</button>
                      <button onClick={() => deleteService(editingService.id)} style={{ padding: '8px 16px', background: '#dc3545', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: 600 }}>🗑️ Delete Event</button>
                    </div>
                    {/* Name & Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Event Name</label>
                        <input type="text" value={editingService.name} onChange={(e) => updateService(editingService.id, { name: e.target.value })} style={{ width: '100%', padding: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '16px', fontWeight: 700 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Launch Date</label>
                        <input type="text" value={editingService.date} onChange={(e) => updateService(editingService.id, { date: e.target.value })} placeholder="e.g., Oct 23" style={{ width: '100%', padding: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '13px' }} />
                      </div>
                    </div>
                    {/* Description */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Description</label>
                      <input type="text" value={editingService.description} onChange={(e) => updateService(editingService.id, { description: e.target.value })} style={{ width: '100%', padding: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '13px' }} />
                    </div>
                    {/* Service Type */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Service Type</label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {['direct_revenue', 'conversion_optimizer'].map(t => (
                          <button key={t} onClick={() => updateService(editingService.id, { type: t })} style={{ padding: '10px 16px', background: editingService.type === t ? editingService.color : theme.surface, color: editingService.type === t ? '#fff' : theme.text, border: `1px solid ${editingService.type === t ? editingService.color : theme.border}`, borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                            {t === 'direct_revenue' ? 'Direct Revenue Generator' : 'Conversion Optimizer'}
                          </button>
                        ))}
                      </div>
                      <p style={{ margin: '8px 0 0 0', color: theme.textMuted, fontSize: '12px' }}>{editingService.type === 'direct_revenue' ? 'Generates revenue through a specific channel (e.g., Paid Social, SEO, Email)' : 'Improves overall performance metrics that increase revenue (e.g., conversion rate, UX)'}</p>
                    </div>
                    {/* Revenue Metric */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Revenue Attribution</label>
                      <input type="text" value={editingService.revenueMetric || ''} onChange={(e) => updateService(editingService.id, { revenueMetric: e.target.value })} style={{ width: '100%', padding: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '13px' }} />
                      <p style={{ margin: '8px 0 0 0', color: theme.textMuted, fontSize: '12px' }}>{editingService.type === 'direct_revenue' ? 'Data key (e.g., paidSocial, seo, email, affiliate)' : 'Use "incremental_total" for conversion optimizers'}</p>
                    </div>
                    {/* Baseline Revenue */}
                    {editingService.type === 'conversion_optimizer' && (
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Baseline Revenue (before launch)</label>
                        <input type="number" value={editingService.baselineRevenue || 0} onChange={(e) => updateService(editingService.id, { baselineRevenue: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '13px' }} />
                      </div>
                    )}
                    {/* Fee Structure */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label style={{ color: theme.text, fontWeight: 600, fontSize: '14px', margin: 0 }}>Fee Structure</label>
                        <button onClick={() => addFee(editingService.id)} style={{ padding: '6px 12px', background: editingService.color, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add Fee</button>
                      </div>
                      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '16px' }}>
                        {editingService.fees?.length > 0 ? editingService.fees.map((fee, idx) => (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 140px 1fr 40px', gap: '12px', marginBottom: idx < editingService.fees.length - 1 ? '12px' : '0', paddingBottom: idx < editingService.fees.length - 1 ? '12px' : '0', borderBottom: idx < editingService.fees.length - 1 ? `1px solid ${theme.border}` : 'none', alignItems: 'end' }}>
                            <div><label style={{ display: 'block', color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Date</label><input type="text" value={fee.date} onChange={(e) => updateFee(editingService.id, idx, { date: e.target.value })} style={{ width: '100%', padding: '6px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '12px' }} /></div>
                            <div><label style={{ display: 'block', color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Amount</label><input type="number" value={fee.amount} onChange={(e) => updateFee(editingService.id, idx, { amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '6px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '12px' }} /></div>
                            <div><label style={{ display: 'block', color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Description</label><input type="text" value={fee.description} onChange={(e) => updateFee(editingService.id, idx, { description: e.target.value })} style={{ width: '100%', padding: '6px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '12px' }} /></div>
                            <button onClick={() => deleteFee(editingService.id, idx)} style={{ padding: '6px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', color: '#dc3545', fontSize: '14px' }}>×</button>
                          </div>
                        )) : <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px', textAlign: 'center' }}>No fees added. Click "+ Add Fee" to add one.</p>}
                      </div>
                    </div>
                    {/* Note */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Explanatory Note</label>
                      <textarea value={editingService.note || ''} onChange={(e) => updateService(editingService.id, { note: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }} />
                    </div>
                    {/* Service / Task Description */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Service Description</label>
                      <textarea value={editingService.serviceDescription || editingService.taskDescription || ''} onChange={(e) => updateService(editingService.id, editingService.serviceDescription !== undefined ? { serviceDescription: e.target.value } : { taskDescription: e.target.value })} rows={4} style={{ width: '100%', padding: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }} />
                    </div>
                    {/* Insights */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', color: theme.text, fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                        {editingService.engagedInsights !== undefined ? 'Performance Highlights' : editingService.taskImpact !== undefined ? 'Impact & Results' : editingService.recommendation !== undefined ? 'Recommendation' : 'Insights'}
                      </label>
                      <textarea value={editingService.engagedInsights || editingService.upsellInsights || editingService.taskImpact || editingService.recommendation || ''} onChange={(e) => {
                        if (editingService.engagedInsights !== undefined) updateService(editingService.id, { engagedInsights: e.target.value });
                        else if (editingService.taskImpact !== undefined) updateService(editingService.id, { taskImpact: e.target.value });
                        else if (editingService.recommendation !== undefined) updateService(editingService.id, { recommendation: e.target.value });
                      }} rows={4} style={{ width: '100%', padding: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }} />
                    </div>
                    {/* KPI Management */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label style={{ color: theme.text, fontWeight: 600, fontSize: '14px', margin: 0 }}>KPI Metrics</label>
                        <button onClick={() => addKPI(editingService.id)} style={{ padding: '6px 12px', background: editingService.color, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add KPI</button>
                      </div>
                      <p style={{ margin: '0 0 12px 0', color: theme.textMuted, fontSize: '12px' }}>Define which metrics appear as overlays when selected.</p>
                      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '16px' }}>
                        {serviceKPIs[editingService.id]?.length > 0 ? serviceKPIs[editingService.id].map((kpi, idx) => (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 100px 40px', gap: '12px', marginBottom: idx < serviceKPIs[editingService.id].length - 1 ? '12px' : '0', paddingBottom: idx < serviceKPIs[editingService.id].length - 1 ? '12px' : '0', borderBottom: idx < serviceKPIs[editingService.id].length - 1 ? `1px solid ${theme.border}` : 'none', alignItems: 'end' }}>
                            <div><label style={{ display: 'block', color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Data Key</label><input type="text" value={kpi.key} onChange={(e) => updateKPI(editingService.id, idx, { key: e.target.value })} style={{ width: '100%', padding: '6px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '12px' }} /></div>
                            <div><label style={{ display: 'block', color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Label</label><input type="text" value={kpi.label} onChange={(e) => updateKPI(editingService.id, idx, { label: e.target.value })} style={{ width: '100%', padding: '6px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '12px' }} /></div>
                            <div><label style={{ display: 'block', color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Unit</label><select value={kpi.unit} onChange={(e) => updateKPI(editingService.id, idx, { unit: e.target.value })} style={{ width: '100%', padding: '6px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '12px' }}><option value="%">%</option><option value="$">$</option><option value="x">x</option><option value="">#</option></select></div>
                            <div><label style={{ display: 'block', color: theme.textMuted, fontSize: '11px', marginBottom: '4px' }}>Axis</label><select value={kpi.axis} onChange={(e) => updateKPI(editingService.id, idx, { axis: e.target.value })} style={{ width: '100%', padding: '6px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '4px', color: theme.text, fontSize: '12px' }}><option value="left">Left ($)</option><option value="right">Right (%)</option></select></div>
                            <button onClick={() => deleteKPI(editingService.id, idx)} style={{ padding: '6px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', color: '#dc3545', fontSize: '14px' }} title="Delete KPI">×</button>
                          </div>
                        )) : <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px', textAlign: 'center' }}>No KPIs defined. Click "+ Add KPI" to add metrics.</p>}
                      </div>
                      <p style={{ margin: '8px 0 0 0', color: theme.textMuted, fontSize: '11px' }}><strong>Data Key:</strong> Must match a field in the data (e.g., roas, ctr, conversionRate). <strong>Axis:</strong> Left for $, Right for % and ratios.</p>
                    </div>
                    {/* Save */}
                    <div style={{ position: 'sticky', bottom: 0, background: theme.background, padding: '20px 0', borderTop: `1px solid ${theme.border}`, marginTop: '20px' }}>
                      <button onClick={() => { setEditingService(null); setConfigOpen(false); }} style={{ width: '100%', padding: '14px', background: editingService.color, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', fontWeight: 700, boxShadow: `0 0 30px ${editingService.color}` }}>💾 Save Changes & Apply to Chart</button>
                      <p style={{ margin: '12px 0 0 0', color: theme.textMuted, fontSize: '12px', textAlign: 'center' }}>This will update the event configuration and regenerate chart data.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chart Box */}
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px 16px 16px 16px', position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }} onMouseDown={handleDragStart} onClick={() => { if (!areaClickGuard.current) setClickedLineData(null); }}>

          {/* Impact Bar (Priority 12) — always reserve space so chart never shifts */}
          <div style={{ height: '56px', marginBottom: '4px', position: 'relative' }}>
          {impactBarContent && impactBarContent.type === 'todaySummary' ? (
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', gap: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '0 16px', position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', borderRadius: '6px 0 0 6px', background: selectedBreakdownChannel ? (breakdownChannels.find(c => c.key === selectedBreakdownChannel)?.color || theme.primary) : theme.primary }} />
              
              {/* Overall Revenue badge — clickable to drill down */}
              {impactBarContent.type === 'todaySummary' && (() => {
                const td = impactBarContent.todayData;
                const mom = impactBarContent.momChange;
                const isActive = revenueDrilldown;
                return (
                  <div onClick={(e) => { e.stopPropagation(); setRevenueDrilldown(!revenueDrilldown); if (!revenueDrilldown) { setSelectedBreakdownChannel(null); setSelectedMilestone({ id: 'overall', name: 'Overall', color: theme.primary }); const vk = {}; (serviceKPIs['overall'] || []).forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk); } else { setVisibleKPIs({}); } }} style={{ flexShrink: 0, textAlign: 'center', paddingRight: '10px', borderRight: `1px solid ${theme.border}`, cursor: 'pointer', borderBottom: isActive ? `2px solid ${theme.primary}` : '2px solid transparent', paddingBottom: '2px' }}>
                    <div style={{ fontSize: '9px', color: isActive ? theme.primary : theme.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue — {MONTHS[currentMonthIndex]}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: theme.text }}>{formatCurrency(td?.totalRevenue || 0)}</span>
                      {mom != null && <span style={{ fontSize: '10px', fontWeight: 700, color: mom >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)' }}>{mom >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(mom).toFixed(1)}%</span>}
                    </div>
                  </div>
                );
              })()}


              <div style={{ display: 'flex', gap: '10px', flex: '1 1 auto', overflow: 'hidden', overflowX: 'auto', borderLeft: `1px solid ${theme.border}`, paddingLeft: '14px' }}>
                {impactBarContent.type === 'todaySummary' ? (
                  /* Show all engaged capabilities */
                  capabilities.filter(c => c.engaged && c.id !== 'other').map(cap => {
                    const monthData = data.find(d => d.index === currentMonthIndex);
                    // Find matching channel — direct match or via revenueMetric
                    const ch = breakdownChannels.find(ch => ch.capabilityId === cap.id) 
                      || (cap.revenueMetric ? breakdownChannels.find(ch => ch.key === cap.revenueMetric) : null);
                    const val = ch ? (monthData?.[ch.key] || 0) : null;
                    const total = monthData?.totalRevenue || 1;
                    const pct = val != null ? Math.round((val / total) * 100) : null;
                    const isActive = selectedMilestone?.id === cap.id;
                    const chipColor = ch ? ch.color : cap.color;
                    const chipFill = ch ? ch.fill : `${cap.color}18`;
                    return (
                      <div key={cap.id} onClick={(e) => {
                        e.stopPropagation();
                        setShowContributionPanel(false); setShowCompareMode(false); setRevenueDrilldown(false);
                        if (selectedMilestone?.id === cap.id) {
                          // Deselect
                          setSelectedBreakdownChannel(null);
                          setCompareFromIndex(null); setCompareToIndex(null);
                          setSelectedMilestone({ id: 'overall', name: 'Overall', color: theme.primary });
                          setVisibleKPIs({});
                        } else {
                          // Select this capability
                          if (ch) {
                            setSelectedBreakdownChannel(ch.key);
                            setCompareFromIndex(cap.monthIndex);
                            setCompareToIndex(Math.min(cap.monthIndex + 2, currentMonthIndex));
                            setCompareFromIndex2(Math.max(0, currentMonthIndex - 2));
                            setCompareToIndex2(currentMonthIndex);
                          }
                          setSelectedMilestone(cap);
                          if (serviceKPIs[cap.id]) { const vk = {}; serviceKPIs[cap.id].forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk); }
                        }
                      }} style={{ cursor: 'pointer', textAlign: 'center', padding: '4px 8px', borderRadius: '4px', border: isActive ? `2.5px solid ${chipColor}` : `1.5px solid ${theme.border}`, background: isActive ? (ch ? ch.fill.split(',').slice(0,3).join(',') + ', 0.35)' : cap.color + '35') : theme.surface, boxShadow: isActive ? `0 0 8px ${chipColor}40` : 'none', transform: isActive ? 'scale(1.05)' : 'none', transition: 'all 0.15s', opacity: isActive ? 1 : 0.75 }}>
                        <div style={{ fontSize: '9px', color: isActive ? chipColor : theme.textMuted, fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap' }}>{cap.name}</div>
                        {val != null ? (
                          <div style={{ fontSize: '12px', fontWeight: 700, color: isActive ? theme.text : theme.textMuted, whiteSpace: 'nowrap' }}>{formatCurrency(val)} <span style={{ fontSize: '9px', fontWeight: 500, color: theme.muted }}>({pct}%)</span></div>
                        ) : (
                          <div style={{ fontSize: '10px', fontWeight: 600, color: theme.muted, whiteSpace: 'nowrap' }}>{cap.type === 'conversion_optimizer' ? 'Cross-channel' : 'Active'}</div>
                        )}
                      </div>
                    );
                  })
                ) : null}
                {/* Other / Direct — interactive chip */}
                {(() => {
                  const otherCap = capabilities.find(c => c.id === 'other');
                  const otherCh = breakdownChannels.find(c => c.key === 'other');
                  if (!otherCh || !otherCap) return null;
                  const monthData = data.find(d => d.index === currentMonthIndex);
                  const val = monthData?.other || 0;
                  const total = monthData?.totalRevenue || 1;
                  const pct = Math.round((val / total) * 100);
                  if (pct < 1 && val < 1000) return null;
                  const isActive = selectedMilestone?.id === 'other';
                  const chipColor = otherCh.color;
                  const chipFill = otherCh.fill;
                  return (
                    <div onClick={(e) => {
                      e.stopPropagation();
                      setShowContributionPanel(false); setShowCompareMode(false); setRevenueDrilldown(false);
                      if (isActive) {
                        setSelectedBreakdownChannel(null);
                        setCompareFromIndex(null); setCompareToIndex(null);
                        setSelectedMilestone({ id: 'overall', name: 'Overall', color: theme.primary });
                        setVisibleKPIs({});
                      } else {
                        setSelectedBreakdownChannel('other');
                        setCompareFromIndex(0);
                        setCompareToIndex(Math.min(2, currentMonthIndex));
                        setCompareFromIndex2(Math.max(0, currentMonthIndex - 2));
                        setCompareToIndex2(currentMonthIndex);
                        setSelectedMilestone(otherCap);
                        if (serviceKPIs['other']) { const vk = {}; serviceKPIs['other'].forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk); }
                      }
                    }} style={{ cursor: 'pointer', textAlign: 'center', padding: '4px 8px', borderRadius: '4px', border: isActive ? `2.5px solid ${chipColor}` : `1.5px solid ${theme.border}`, background: isActive ? chipFill.split(',').slice(0,3).join(',') + ', 0.35)' : theme.surface, boxShadow: isActive ? `0 0 8px ${chipColor}40` : 'none', transform: isActive ? 'scale(1.05)' : 'none', transition: 'all 0.15s', opacity: isActive ? 1 : 0.75 }}>
                      <div style={{ fontSize: '9px', color: isActive ? chipColor : theme.textMuted, fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap' }}>Other / Direct</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: isActive ? theme.text : theme.textMuted, whiteSpace: 'nowrap' }}>{formatCurrency(val)} <span style={{ fontSize: '9px', fontWeight: 500, color: theme.muted }}>({pct}%)</span></div>
                    </div>
                  );
                })()}
              </div>
              {/* Shared Insights | Adjust Contributions — pinned right */}
              <div style={{ flexShrink: 0, borderLeft: `1px solid ${theme.border}`, paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <div onClick={(e) => { e.stopPropagation(); setSummaryScope(selectedBreakdownChannel ? 'channel' : 'portfolio'); setShowSummaryModal(true); }} style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: theme.primary }}>Insights</span>
                </div>
              </div>
            </div>
          ) : impactBarContent && impactBarContent.type === 'engaged' ? (
            /* Engaged capability — use Current view style bar with channel chips */
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', gap: '10px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '0 16px', position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', borderRadius: '6px 0 0 6px', background: theme.primary }} />
              {/* Channel chips — same as todaySummary */}
              <div style={{ display: 'flex', gap: '10px', flex: '1 1 auto', overflow: 'hidden', overflowX: 'auto' }}>
                {capabilities.filter(c => c.engaged && c.id !== 'other').map(cap => {
                  const monthData = data.find(d => d.index === currentMonthIndex);
                  const ch = breakdownChannels.find(ch => ch.capabilityId === cap.id)
                    || (cap.revenueMetric ? breakdownChannels.find(ch => ch.key === cap.revenueMetric) : null);
                  const val = ch ? (monthData?.[ch.key] || 0) : null;
                  const total = monthData?.totalRevenue || 1;
                  const pct = val != null ? Math.round((val / total) * 100) : null;
                  const isActive = selectedMilestone?.id === cap.id;
                  const chipColor = ch ? ch.color : cap.color;
                  const chipFill = ch ? ch.fill : `${cap.color}18`;
                  return (
                    <div key={cap.id} onClick={(e) => {
                      e.stopPropagation();
                      if (selectedMilestone?.id === cap.id) return; // already active, do nothing
                      handleSelectCapability(cap);
                    }} style={{ cursor: isActive ? 'default' : 'pointer', textAlign: 'center', padding: '4px 8px', borderRadius: '4px', border: isActive ? `2.5px solid ${chipColor}` : `1.5px solid ${theme.border}`, background: isActive ? (ch ? ch.fill.split(',').slice(0,3).join(',') + ', 0.35)' : cap.color + '35') : theme.surface, boxShadow: isActive ? `0 0 8px ${chipColor}40` : 'none', transform: isActive ? 'scale(1.05)' : 'none', transition: 'all 0.15s', opacity: isActive ? 1 : 0.75 }}>
                      <div style={{ fontSize: '9px', color: isActive ? chipColor : theme.textMuted, fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap' }}>{cap.name}</div>
                      {val != null ? (
                        <div style={{ fontSize: '12px', fontWeight: 700, color: isActive ? theme.text : theme.textMuted, whiteSpace: 'nowrap' }}>{formatCurrency(val)} <span style={{ fontSize: '9px', fontWeight: 500, color: theme.muted }}>({pct}%)</span></div>
                      ) : (
                        <div style={{ fontSize: '10px', fontWeight: 600, color: theme.muted, whiteSpace: 'nowrap' }}>{cap.type === 'conversion_optimizer' ? 'Cross-channel' : 'Active'}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Shared Insights | Adjust Contributions — pinned right */}
              <div style={{ flexShrink: 0, borderLeft: `1px solid ${theme.border}`, paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <div onClick={(e) => { e.stopPropagation(); setSummaryScope('channel'); setShowSummaryModal(true); }} style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: theme.primary }}>Insights</span>
                </div>
              </div>
            </div>
          ) : impactBarContent ? (
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', gap: '12px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '0 16px', position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', borderRadius: '6px 0 0 6px', background: impactBarContent.type === 'tag' ? 'rgba(245,158,11,1)' : impactBarContent.item.color }} />
              {/* Pagination arrows for multiple projected */}
              {projectedImpacts.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                  <button onClick={(e) => { e.stopPropagation(); setImpactBarPage(p => Math.max(0, p - 1)); }} disabled={impactBarPage === 0} style={{ width: '18px', height: '18px', borderRadius: '50%', border: 'none', background: impactBarPage > 0 ? theme.border : 'transparent', color: impactBarPage > 0 ? theme.text : theme.muted, cursor: impactBarPage > 0 ? 'pointer' : 'default', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: impactBarPage > 0 ? 1 : 0.3 }}>◀</button>
                  <span style={{ fontSize: '9px', color: theme.muted, fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>{impactBarPage + 1}/{projectedImpacts.length}</span>
                  <button onClick={(e) => { e.stopPropagation(); setImpactBarPage(p => Math.min(projectedImpacts.length - 1, p + 1)); }} disabled={impactBarPage >= projectedImpacts.length - 1} style={{ width: '18px', height: '18px', borderRadius: '50%', border: 'none', background: impactBarPage < projectedImpacts.length - 1 ? theme.border : 'transparent', color: impactBarPage < projectedImpacts.length - 1 ? theme.text : theme.muted, cursor: impactBarPage < projectedImpacts.length - 1 ? 'pointer' : 'default', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: impactBarPage < projectedImpacts.length - 1 ? 1 : 0.3 }}>▶</button>
                </div>
              )}
              <div style={{ fontSize: '13px', fontWeight: 700, color: impactBarContent.type === 'tag' ? theme.accent : impactBarContent.item.color, whiteSpace: 'nowrap' }}>{impactBarContent.type === 'tag' ? impactBarContent.item.label : impactBarContent.item.name}</div>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '3px', flexShrink: 0, whiteSpace: 'nowrap',
                background: impactBarContent.type === 'engaged' || impactBarContent.type === 'completedTask' ? 'rgba(74,222,128,0.15)' : impactBarContent.type === 'projected' ? 'rgba(153,102,255,0.15)' : impactBarContent.type === 'tag' ? 'rgba(245,158,11,0.15)' : 'rgba(54,162,235,0.15)',
                color: impactBarContent.type === 'engaged' || impactBarContent.type === 'completedTask' ? 'rgba(34,197,94,1)' : impactBarContent.type === 'projected' ? theme.chart1 : impactBarContent.type === 'tag' ? 'rgba(245,158,11,1)' : theme.chart2 }}>
                {impactBarContent.type === 'engaged' ? 'Active' : impactBarContent.type === 'completedTask' ? 'Completed' : impactBarContent.type === 'projected' ? 'Projected' : impactBarContent.type === 'tag' ? 'Tag' : 'Recommended'}
              </span>
              {impactBarContent.type === 'tag' && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'rgba(128,128,128,0.08)', color: theme.muted, flexShrink: 0, whiteSpace: 'nowrap' }}>{impactBarContent.item.date}</span>}
              {impactBarContent.item.category && impactBarContent.type !== 'tag' && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'rgba(128,128,128,0.08)', color: theme.muted, flexShrink: 0, whiteSpace: 'nowrap' }}>{impactBarContent.item.category}</span>}
              <div style={{ flex: '1 1 auto', fontSize: '11px', color: theme.textMuted, lineHeight: '1.3', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minWidth: 0 }}>
                {impactBarContent.type === 'engaged' && impactBarContent.item.note}
                {impactBarContent.type === 'completedTask' && (impactBarContent.item.taskImpact || impactBarContent.item.description)}
                {impactBarContent.type === 'projected' && `+${formatCurrency(impactBarContent.monthlyLift)}/mo  •  +${formatCurrency(impactBarContent.annualLift)}/yr`}
                {impactBarContent.type === 'recommendedTask' && (impactBarContent.item.recommendation || impactBarContent.item.description)}
                {impactBarContent.type === 'tag' && (impactBarContent.item.description || 'No description')}
              </div>
              {/* KPI arrows */}
              {(impactBarContent.type === 'engaged' || impactBarContent.type === 'completedTask') && serviceKPIs[impactBarContent.item.id]?.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', borderLeft: `1px solid ${theme.border}`, paddingLeft: '14px', flexShrink: 0 }}>
                  {serviceKPIs[impactBarContent.item.id].map(kpi => {
                    const v = impactBarContent.item.kpis?.[kpi.key];
                    if (!v) return null;
                    return (
                      <div key={kpi.key} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: theme.muted, fontWeight: 500, whiteSpace: 'nowrap' }}>{kpi.label}</div>
                        <div style={{ fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}><span style={{ color: theme.muted }}>{v.before}</span> → <span style={{ color: 'rgba(34,197,94,1)' }}>{v.after}</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
              {impactBarContent.type === 'projected' && impactBarContent.item.configurableKPIs && (
                <div style={{ display: 'flex', gap: '12px', borderLeft: `1px solid ${theme.border}`, paddingLeft: '14px', flexShrink: 0 }}>
                  {impactBarContent.item.configurableKPIs.map(kpi => {
                    const t = impactBarContent.item.configuredKPIs?.[kpi.key]?.target ?? kpi.industry;
                    return (
                      <div key={kpi.key} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: theme.muted, fontWeight: 500, whiteSpace: 'nowrap' }}>{kpi.label}</div>
                        <div style={{ fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}><span style={{ color: theme.muted }}>{kpi.current}{kpi.unit}</span> → <span style={{ color: 'rgba(34,197,94,1)' }}>{t}{kpi.unit}</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Running total — always visible when multiple projected */}
              {projectedImpacts.length > 1 && (
                <div style={{ borderLeft: `2px solid ${theme.primary}`, paddingLeft: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '9px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Total ({projectedImpacts.length})</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: theme.muted, fontWeight: 500 }}>Monthly</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: theme.primary, whiteSpace: 'nowrap' }}>+{formatCurrency(totalMonthlyLift)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: theme.muted, fontWeight: 500 }}>Annualized</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: theme.primary, whiteSpace: 'nowrap' }}>+{formatCurrency(totalAnnualLift)}</div>
                  </div>
                </div>
              )}
              {impactBarContent.type === 'tag' && (
                <button onClick={(e) => { e.stopPropagation(); deleteTag(impactBarContent.item.id); }} style={{ padding: '5px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.9)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>🗑 Remove</button>
              )}
              {impactBarContent.type !== 'projected' && impactBarContent.type !== 'tag' && <button style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${impactBarContent.item.color}40`, color: impactBarContent.item.color, fontSize: '11px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>Details →</button>}
              {/* Shared Insights | Adjust Contributions — pinned right */}
              <div style={{ flexShrink: 0, borderLeft: `1px solid ${theme.border}`, paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <div onClick={(e) => { e.stopPropagation(); setSummaryScope(selectedBreakdownChannel ? 'channel' : 'portfolio'); setShowSummaryModal(true); }} style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: theme.primary }}>Insights</span>
                </div>
              </div>
            </div>
          ) : null}
          </div>

          {/* Detail Panel reserved space — fixed height so chart never shifts */}
          <div style={{ height: '48px', position: 'relative', overflow: 'visible' }}>
          {/* Revenue drill-down detail panel */}
          {revenueDrilldown && (!selectedBreakdownChannel || selectedBreakdownChannel === 'totalRevenue') && (() => {
            const td = data[currentMonthIndex];
            const prevData = currentMonthIndex > 0 ? data[currentMonthIndex - 1] : null;
            const yoyData = currentMonthIndex >= 12 ? data[currentMonthIndex - 12] : null;
            const mom = prevData ? ((td.totalRevenue - prevData.totalRevenue) / prevData.totalRevenue * 100) : null;
            const yoy = yoyData ? ((td.totalRevenue - yoyData.totalRevenue) / yoyData.totalRevenue * 100) : null;
            const overallKPIs = serviceKPIs['overall'] || [];
            const fmtV = (v, unit) => { if (v == null) return '\u2014'; if (unit === '$') return `$${Math.round(v).toLocaleString()}`; if (unit === '%') return `${Number(v).toFixed(1)}%`; if (unit === 'x') return `${Number(v).toFixed(1)}x`; return Math.round(v).toLocaleString(); };
            return (
              <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, background: theme.surface, border: `1px solid ${theme.primary}40`, borderTop: `3px solid ${theme.primary}`, borderRadius: '6px', padding: '4px 14px 4px', cursor: 'default', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: theme.primary }}>Total Revenue</div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: theme.text }}>{formatCurrency(td?.totalRevenue || 0)}</span>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: theme.border, flexShrink: 0 }} />
                  {mom != null && (
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '7px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase' }}>MoM</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: mom >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)' }}>{mom >= 0 ? '+' : ''}{mom.toFixed(1)}%</div>
                    </div>
                  )}
                  {yoy != null && (
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '7px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase' }}>YoY</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: yoy >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)' }}>{yoy >= 0 ? '+' : ''}{yoy.toFixed(1)}%</div>
                    </div>
                  )}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '7px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase' }}>Incremental</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text }}>{formatCurrency(td?.incrementalRevenue || 0)}</div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: theme.border, flexShrink: 0 }} />
                  {overallKPIs.map(kpi => {
                    const val = td?.[kpi.key];
                    const prev = prevData?.[kpi.key];
                    const delta = (val != null && prev != null && prev !== 0) ? ((val - prev) / Math.abs(prev) * 100) : null;
                    const lowerBetter = kpi.key === 'bounceRate';
                    const good = delta != null ? (lowerBetter ? delta < 0 : delta > 0) : null;
                    return (
                      <div key={kpi.key} style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '7px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase' }}>{kpi.label}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: kpi.color }}>{fmtV(val, kpi.unit)}</div>
                        {delta != null && <div style={{ fontSize: '7px', fontWeight: 600, color: good ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,0.8)' }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</div>}
                      </div>
                    );
                  })}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => { setShowContributionPanel(true); setExpandedContributionChannel(null); }} style={{ padding: '3px 10px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 600, color: 'rgba(245,158,11,1)' }}>Adjust Contributions</button>
                    <button onClick={() => { if (!showCompareMode) { setSelectedBreakdownChannel('totalRevenue'); setCompareFromIndex(Math.max(0, currentMonthIndex - 6)); setCompareToIndex(Math.max(0, currentMonthIndex - 3)); setCompareFromIndex2(Math.max(0, currentMonthIndex - 2)); setCompareToIndex2(currentMonthIndex); } setShowCompareMode(!showCompareMode); }} style={{ padding: '3px 10px', background: showCompareMode ? `${theme.primary}15` : 'transparent', border: `1px solid ${showCompareMode ? theme.primary : theme.border}`, borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 600, color: 'rgba(245,158,11,1)' }}>Compare Periods</button>
                  </div>
                </div>
              </div>
            );
          })()}
          {(showTodayBreakdown || showChannelBar) && selectedBreakdownChannel && selectedBreakdownChannel !== 'totalRevenue' && (() => {
            const ch = breakdownChannels.find(c => c.key === selectedBreakdownChannel);
            // Prefer selectedMilestone (handles Paid Search sharing Paid Social's channel)
            const cap = selectedMilestone?.engaged ? selectedMilestone 
              : (ch?.capabilityId ? capabilities.find(c => c.id === ch.capabilityId) : null);
            if (!ch) return null;
            const kpis = cap ? (serviceKPIs[cap.id] || []) : [];
            const currentData = data[currentMonthIndex];
            const fmtVal = (v, unit) => {
              if (v == null) return '—';
              if (unit === '$') return `$${Math.round(v).toLocaleString()}`;
              if (unit === '%') return `${Number(v).toFixed(1)}%`;
              if (unit === 'x') return `${Number(v).toFixed(1)}x`;
              if (unit === 's') return `${Number(v).toFixed(1)}s`;
              return Math.round(v).toLocaleString();
            };
            // Aggregate a range of data points
            const aggregateRange = (startIdx, endIdx) => {
              const s = Math.min(startIdx, endIdx);
              const e = Math.max(startIdx, endIdx);
              const slice = data.filter(d => d.index >= s && d.index <= e);
              if (slice.length === 0) return null;
              const numKeys = [ch.key, 'totalRevenue'];
              const avgKeys = kpis.map(k => k.key);
              const result = { _count: slice.length, _label: slice.length === 1 ? MONTHS[s] : `${MONTHS[s]} – ${MONTHS[e]}` };
              numKeys.forEach(k => { result[k] = slice.reduce((sum, d) => sum + (d[k] || 0), 0); });
              avgKeys.forEach(k => { const vals = slice.filter(d => d[k] != null); result[k] = vals.length > 0 ? vals.reduce((sum, d) => sum + d[k], 0) / vals.length : null; });
              return result;
            };
            const currentRevenue = currentData?.[ch.key] || 0;
            const totalRev = currentData?.totalRevenue || 1;
            const pctOfTotal = Math.round((currentRevenue / totalRev) * 100);
            return (
              <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, background: theme.surface, border: `1px solid ${ch.color}40`, borderTop: `3px solid ${ch.color}`, borderRadius: '6px', padding: '4px 14px 4px', cursor: 'default', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {/* Single compact row — name, KPIs, and action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: ch.color }}>{ch.name}</div>
                    {cap && <span style={{ fontSize: '8px', fontWeight: 600, padding: '1px 5px', borderRadius: '10px', background: 'rgba(74,222,128,0.15)', color: 'rgba(34,197,94,1)' }}>Since {cap.date}</span>}
                  </div>
                  <div style={{ width: '1px', height: '28px', background: theme.border, flexShrink: 0 }} />
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '7px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase' }}>Revenue</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>{formatCurrency(currentRevenue)}</div>
                    <div style={{ fontSize: '8px', color: theme.muted }}>{pctOfTotal}% of total</div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: theme.border, flexShrink: 0 }} />
                  <div style={{ display: 'flex', gap: '10px', flex: 1, overflow: 'hidden' }}>
                    {kpis.slice(0, 4).map(kpi => {
                      const val = currentData?.[kpi.key];
                      const industry = cap?.kpis?.[kpi.key]?.industry;
                      const beats = industry != null && val != null ? val >= industry : null;
                      return (
                        <div key={kpi.key} style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '7px', color: theme.muted, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.label}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text }}>{fmtVal(val, kpi.unit)}</div>
                          {industry != null && <div style={{ fontSize: '7px', fontWeight: 600, color: beats ? 'rgba(34,197,94,0.8)' : 'rgba(245,158,11,0.8)' }}>Ind: {fmtVal(industry, kpi.unit)} {beats ? '✓' : '↗'}</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ width: '1px', height: '28px', background: theme.border, flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => { setShowContributionPanel(true); setExpandedContributionChannel(selectedBreakdownChannel); }} style={{ padding: '3px 8px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '4px', cursor: 'pointer', color: 'rgba(245,158,11,1)', fontSize: '10px', fontWeight: 600 }}>Adjust Contributions</button>
                    <button onClick={() => { if (!showCompareMode) { const launchIdx = cap?.monthIndex ?? 0; setCompareFromIndex(launchIdx); setCompareToIndex(Math.min(launchIdx + 2, currentMonthIndex)); setCompareFromIndex2(Math.max(0, currentMonthIndex - 2)); setCompareToIndex2(currentMonthIndex); } setShowCompareMode(!showCompareMode); }} style={{ padding: '3px 8px', background: showCompareMode ? `${ch.color}15` : 'transparent', border: `1px solid ${showCompareMode ? ch.color + '50' : theme.border}`, borderRadius: '4px', cursor: 'pointer', color: 'rgba(245,158,11,1)', fontSize: '10px', fontWeight: 600 }}>Compare Periods</button>
                  </div>
                </div>
              </div>
            );
          })()}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={580}>
            <ComposedChart data={(() => {
              const base = adjustedBreakdownData || breakdownData || projectedData || displayData;
              if (!scenarioData) return base;
              return base.map(d => {
                const sd = scenarioData.find(s => s.index === d.index);
                return sd && sd.scenarioRevenue != null ? { ...d, scenarioRevenue: sd.scenarioRevenue } : d;
              });
            })()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onClick={(chartEvent) => {
                if (areaClickGuard.current) return;
                if (!chartEvent || !chartEvent.activePayload) return;
                const dp = chartEvent.activePayload[0]?.payload;
                if (!dp) return;
                const yPixel = chartEvent.chartY;
                if (yPixel == null) return;

                // Check for projected band clicks (works in both views)
                if (hypotheticalServices.length > 0 && (dp.projectedRevenue != null || dp.stack_projected != null)) {
                  const chartTop = 20;
                  const chartBottom = 580 - 20;
                  const chartHeight = chartBottom - chartTop;
                  const allData = breakdownData || projectedData || displayData;
                  const maxDataVal = Math.max(...allData.map(d => d.projectedRevenue || d.stack_projected || d.totalRevenue));
                  const clickVal = maxDataVal - ((yPixel - chartTop) / chartHeight) * maxDataVal;
                  const baseTop = showTodayBreakdown ? (dp.stack_other || dp.totalRevenue) : dp.totalRevenue;
                  if (clickVal > baseTop) {
                    let prevBandTop = baseTop;
                    let matched = false;
                    for (let hIdx = 0; hIdx < hypotheticalServices.length; hIdx++) {
                      const stackKey = showTodayBreakdown ? `bd_proj_stack_${hIdx}` : `proj_stack_${hIdx}`;
                      const bandTop = dp[stackKey];
                      if (bandTop != null && clickVal >= prevBandTop && clickVal <= bandTop) {
                        matched = true;
                        if (selectedProjectedIdx === hIdx) {
                          setSelectedProjectedIdx(null);
                          setVisibleKPIs({});
                          setSelectedMilestone(null); setSelectedCapability(null); setSelectedTask(null);
                          setShowMilestoneRevenue(false);
                        } else {
                          setSelectedProjectedIdx(hIdx);
                          const svc = hypotheticalServices[hIdx];
                          if (!serviceKPIs[svc.id] && svc.configurableKPIs?.length > 0) {
                            serviceKPIs[svc.id] = svc.configurableKPIs.map((k, i) => ({ key: k.key, label: k.label, unit: k.unit === '$' ? '$' : k.unit === 'x' ? 'x' : '%', axis: k.unit === '$' ? 'left' : 'right', color: `rgba(${120 + i * 40}, ${100 + i * 30}, ${200 - i * 20}, 0.9)` }));
                          }
                          if (serviceKPIs[svc.id]) {
                            const vk = {}; serviceKPIs[svc.id].forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk);
                          }
                          setSelectedMilestone(svc);
                          setSelectedCapability(svc.type === 'direct_revenue' && !svc.category ? svc : null);
                          setSelectedTask(svc.category ? svc : null);
                          setShowMilestoneRevenue(true);
                        }
                        return;
                      }
                      if (bandTop != null) prevBandTop = bandTop;
                    }
                    // Fallback: click was above base but didn't match specific band — select the topmost
                    if (!matched && hypotheticalServices.length > 0) {
                      const hIdx = hypotheticalServices.length - 1;
                      if (selectedProjectedIdx === hIdx) {
                        setSelectedProjectedIdx(null);
                        setVisibleKPIs({});
                        setSelectedMilestone(null); setSelectedCapability(null); setSelectedTask(null);
                        setShowMilestoneRevenue(false);
                      } else {
                        setSelectedProjectedIdx(hIdx);
                        const svc = hypotheticalServices[hIdx];
                        if (!serviceKPIs[svc.id] && svc.configurableKPIs?.length > 0) {
                          serviceKPIs[svc.id] = svc.configurableKPIs.map((k, i) => ({ key: k.key, label: k.label, unit: k.unit === '$' ? '$' : k.unit === 'x' ? 'x' : '%', axis: k.unit === '$' ? 'left' : 'right', color: `rgba(${120 + i * 40}, ${100 + i * 30}, ${200 - i * 20}, 0.9)` }));
                        }
                        if (serviceKPIs[svc.id]) {
                          const vk = {}; serviceKPIs[svc.id].forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk);
                        }
                        setSelectedMilestone(svc);
                        setSelectedCapability(svc.type === 'direct_revenue' && !svc.category ? svc : null);
                        setSelectedTask(svc.category ? svc : null);
                        setShowMilestoneRevenue(true);
                      }
                      return;
                    }
                  }
                }

                // Breakdown channel click handling (only in breakdown view)
                if (!showTodayBreakdown || !breakdownData) return;
                // Use the active coordinate to figure out approximate revenue at click point
                // Recharts gives us activeCoordinate.y which is the pixel Y
                // We need to map pixel to value — use the relationship between known points
                // The simplest reliable approach: check which band the nearest data point's stack values fall into
                // by comparing activeLabel to find the data point, then checking relative position
                const stackLevels = [
                  { key: 'paidSocial', top: dp.stack_paidSocial },
                  { key: 'paidSearch', top: dp.stack_paidSearch },
                  { key: 'seo', top: dp.stack_seo },
                  { key: 'email', top: dp.stack_email },
                  { key: 'affiliate', top: dp.stack_affiliate },
                  { key: 'other', top: dp.stack_other },
                ];
                // Get pixel positions for each stack level from the activePayload
                // Since we rendered areas with these dataKeys, we can use the chart's coordinate system
                // Approximate: use ratio of click Y within the chart area
                const chartTop = 20; // margin top
                const chartBottom = 580 - 20; // height - margin bottom (approximate)
                const chartHeight = chartBottom - chartTop;
                const maxVal = Math.max(...breakdownData.map(d => d.stack_other || d.totalRevenue));
                const minVal = Math.min(...breakdownData.map(d => d.totalRevenue * 0)) || 0;
                // Y pixel increases downward, value increases upward
                const clickValue = maxVal - ((yPixel - chartTop) / chartHeight) * (maxVal - minVal);
                // Find which band contains this value
                let clickedChannel = null;
                let prevTop = 0;
                for (const level of stackLevels) {
                  if (clickValue >= prevTop && clickValue <= level.top) {
                    clickedChannel = level.key;
                    break;
                  }
                  prevTop = level.top;
                }
                if (!clickedChannel) clickedChannel = 'other';
                const ch = breakdownChannels.find(c => c.key === clickedChannel);
                if (ch) {
                  areaClickGuard.current = true;
                  setTimeout(() => { areaClickGuard.current = false; }, 50);
                  const rawVal = ch.key === 'paidSocial' ? dp._ps
                    : ch.key === 'paidSearch' ? dp._psr
                    : ch.key === 'seo' ? dp._se
                    : ch.key === 'email' ? dp._em
                    : ch.key === 'affiliate' ? dp._af
                    : dp._ot;
                  const isDeselect = selectedBreakdownChannel === ch.key;
                  setSelectedBreakdownChannel(prev => prev === ch.key ? null : ch.key);
                  if (isDeselect) {
                    setCompareFromIndex(null); setCompareToIndex(null); setCompareFromIndex2(null); setCompareToIndex2(null);
                  } else {
                    const capObj = capabilities.find(c => c.id === ch.capabilityId);
                    const launchIdx = capObj?.monthIndex ?? 0;
                    setCompareFromIndex(launchIdx);
                    setCompareToIndex(Math.min(launchIdx + 2, currentMonthIndex));
                    setCompareFromIndex2(Math.max(0, currentMonthIndex - 2));
                    setCompareToIndex2(currentMonthIndex);
                  }
                  setClickedLineData({ name: ch.name, value: formatCurrency(rawVal || 0), color: ch.color, x: 0, y: 0, month: dp.month });
                }
              }}>
              <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" stroke={theme.gridLine} />
              <XAxis dataKey="month" stroke={theme.textMuted} style={{ fontSize: '12px' }} interval={0}
                angle={timeGranularity !== 'M' ? 0 : visibleWindow > 24 ? -45 : 0} textAnchor={timeGranularity !== 'M' ? 'middle' : visibleWindow > 24 ? 'end' : 'middle'}
                height={timeGranularity !== 'M' ? 30 : visibleWindow > 24 ? 60 : 30}
                tick={(props) => {
                  const { x, y, payload, index } = props;
                  const si = selectedCapability || selectedTask;
                  let sd = null, ic = null;
                  if (si) { const h = hypotheticalServices.find(h => h.id === si.id); sd = (si.monthIndex != null ? MONTHS[si.monthIndex] : null) || (h ? h.startMonthLabel : null); ic = si.color; }
                  const isH = sd && sd === payload.value;
                  const isT = timeGranularity === 'Q' ? payload.value === 'Q1 2026' : timeGranularity === 'Y' ? payload.value === '2026' : payload.value === 'Feb 2026';
                  const isC = clickedLineData?.month === payload.value;
                  const skip = timeGranularity !== 'M' ? 1 : visibleWindow > 36 ? 3 : visibleWindow > 24 ? 2 : 1;
                  if (!isH && !isC && !isT && skip > 1 && index % skip !== 0) return null;
                  const useRotation = timeGranularity === 'M' && visibleWindow > 24;
                  return <text x={x} y={y + 4} textAnchor={useRotation ? 'end' : 'middle'} fill={isH ? ic : isT ? theme.text : isC ? theme.text : theme.textMuted} fontSize={isH || isC ? '13px' : timeGranularity === 'Y' ? '13px' : '11px'} fontWeight={isH || isC || isT ? 700 : timeGranularity !== 'M' ? 600 : 400} transform={useRotation ? `rotate(-45, ${x}, ${y + 4})` : undefined}>{timeGranularity === 'M' ? payload.value.replace(/20(\d{2})$/, '$1') : payload.value}</text>;
                }}
              />
              <YAxis yAxisId="left" stroke={theme.textMuted} style={{ fontSize: '12px' }} tick={{ fill: theme.textMuted }} tickFormatter={formatCurrency} domain={[0, 'auto']} />
              <YAxis yAxisId="right" orientation="right" stroke={(selectedMilestone && serviceKPIs[selectedMilestone?.id]) || selectedProjectedIdx != null ? theme.textMuted : 'transparent'} style={{ fontSize: '12px' }} tick={{ fill: (selectedMilestone && serviceKPIs[selectedMilestone?.id]) || selectedProjectedIdx != null ? theme.textMuted : 'transparent' }} domain={[dataMin => Math.max(0, dataMin * 0.8), dataMax => dataMax * 1.2]} />
              <Tooltip content={() => null} cursor={showTodayBreakdown ? { stroke: theme.border, strokeWidth: 1, strokeDasharray: '3 3' } : false} />

              {/* Revenue */}
              {showRevenue && !projectedData && <Line yAxisId="left" type="monotone" dataKey="totalRevenue" stroke={theme.chart3} strokeWidth={5}
                dot={(props) => { const { cx, cy, payload } = props; if (milestoneMonths.has(payload.month)) return null; return <circle key={`r-${payload.index}`} cx={cx} cy={cy} r={4} fill={theme.chart3} stroke={theme.background} strokeWidth={1} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setClickedLineData({ name: 'Total Revenue', value: formatCurrency(payload.totalRevenue), color: theme.chart3, x: cx, y: cy, month: payload.month }); }} />; }}
                activeDot={false} name="Total Online Revenue" />}
              {showRevenue && projectedData && <Line yAxisId="left" type="monotone" dataKey="totalRevenue" stroke={theme.chart3} strokeWidth={1.5}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (milestoneMonths.has(payload.month)) return null;
                  const hasLift = payload.projectedRevenue != null;
                  return <circle key={`r-${payload.index}`} cx={cx} cy={cy} r={hasLift ? 2 : 4} fill={theme.chart3} stroke={theme.background} strokeWidth={1} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setClickedLineData({ name: 'Total Revenue', value: formatCurrency(payload.totalRevenue), color: theme.chart3, x: cx, y: cy, month: payload.month }); }} />;
                }}
                activeDot={false} name="Total Online Revenue" />}
              {/* Thick overlay for pre-projection portion of revenue line */}
              {showRevenue && projectedData && (
                <Customized component={({ xAxisMap, yAxisMap }) => {
                  const xAxis = xAxisMap && Object.values(xAxisMap)[0];
                  const yAxis = yAxisMap && Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis || !xAxis.scale || !yAxis.scale) return null;
                  const chartSource = projectedData || displayData;
                  const firstProjIdx = chartSource.findIndex(dp => dp.projectedRevenue != null);
                  const preProjection = firstProjIdx >= 0 ? chartSource.slice(0, firstProjIdx + 1) : chartSource;
                  if (preProjection.length < 2) return null;
                  const pathPoints = preProjection.map(dp => {
                    const x = xAxis.scale(dp.month);
                    const y = yAxis.scale(dp.totalRevenue);
                    return (x != null && y != null) ? `${x},${y}` : null;
                  }).filter(Boolean);
                  if (pathPoints.length < 2) return null;
                  const d = 'M' + pathPoints.join(' L');
                  return <path d={d} fill="none" stroke={theme.chart3} strokeWidth={5} strokeLinecap="round" style={{ pointerEvents: 'none' }} />;
                }} />
              )}

              {/* Projected revenue */}
              {projectedData && showRevenue && <Line yAxisId="left" type="monotone" dataKey="projectedRevenue" stroke={theme.chart3} strokeWidth={5} strokeDasharray="6 3" dot={false} activeDot={false} name="Projected Revenue" connectNulls />}

              {/* Scenario what-if revenue line */}
              {scenarioData && showRevenue && <Line yAxisId="left" type="monotone" dataKey="scenarioRevenue" stroke={theme.chart3} strokeWidth={3} strokeDasharray="8 4" dot={false} activeDot={false} name="Scenario Revenue" connectNulls />}

              {/* Projected fill areas — per-service stacked bands in default view */}
              {projectedData && showRevenue && !showTodayBreakdown && (
                <Customized component={({ xAxisMap, yAxisMap }) => {
                  const xAxis = xAxisMap && Object.values(xAxisMap)[0];
                  const yAxis = yAxisMap && Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis || !xAxis.scale || !yAxis.scale) return null;
                  const chartDataSource = projectedData || displayData;
                  const redShades = ['rgba(220,38,38,0.12)', 'rgba(220,38,38,0.08)', 'rgba(220,38,38,0.06)', 'rgba(220,38,38,0.05)'];
                  const elements = [];
                  hypotheticalServices.forEach((h, hIdx) => {
                    const stackKey = `proj_stack_${hIdx}`;
                    const belowKey = hIdx === 0 ? 'totalRevenue' : `proj_stack_${hIdx - 1}`;
                    const filteredData = chartDataSource.filter(dp => dp[stackKey] != null);
                    if (filteredData.length < 2) return;
                    const points = [];
                    // Top edge left to right
                    filteredData.forEach(dp => {
                      const x = xAxis.scale(dp.month);
                      const y = yAxis.scale(dp[stackKey]);
                      if (x != null && y != null) points.push(`${x},${y}`);
                    });
                    // Bottom edge right to left
                    [...filteredData].reverse().forEach(dp => {
                      const x = xAxis.scale(dp.month);
                      const belowVal = hIdx === 0 ? dp.totalRevenue : (dp[belowKey] ?? dp.totalRevenue);
                      const y = yAxis.scale(belowVal);
                      if (x != null && y != null) points.push(`${x},${y}`);
                    });
                    if (points.length >= 4) {
                      elements.push(<polygon key={`projfill-${hIdx}`} points={points.join(' ')} fill={redShades[hIdx] || redShades[redShades.length - 1]} stroke={selectedProjectedIdx === hIdx ? 'rgba(220,38,38,0.5)' : 'none'} strokeWidth={selectedProjectedIdx === hIdx ? 1.5 : 0} style={{ cursor: 'pointer' }} onClick={() => {
                        if (selectedProjectedIdx === hIdx) {
                          setSelectedProjectedIdx(null);
                          setVisibleKPIs({});
                          setSelectedMilestone(null); setSelectedCapability(null); setSelectedTask(null);
                        } else {
                          setSelectedProjectedIdx(hIdx);
                          const svc = hypotheticalServices[hIdx];
                          if (serviceKPIs[svc.id]) {
                            const vk = {}; serviceKPIs[svc.id].forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk);
                            setSelectedMilestone(svc); setSelectedCapability(svc.type === 'direct_revenue' ? svc : null); setSelectedTask(svc.category ? svc : null);
                          }
                        }
                      }} />);
                    }
                    // Label inside the band
                    const midIdx = Math.floor(filteredData.length * 0.6);
                    const midDp = filteredData[midIdx];
                    if (midDp) {
                      const topVal = midDp[stackKey];
                      const botVal = hIdx === 0 ? midDp.totalRevenue : (midDp[belowKey] ?? midDp.totalRevenue);
                      const midVal = (topVal + botVal) / 2;
                      const bandPixelHeight = Math.abs((yAxis.scale(botVal) || 0) - (yAxis.scale(topVal) || 0));
                      if (bandPixelHeight > 14) {
                        const x = xAxis.scale(midDp.month);
                        const y = yAxis.scale(midVal);
                        if (x != null && y != null) {
                          elements.push(<text key={`projlbl-${hIdx}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={selectedProjectedIdx === hIdx ? 'rgba(220,38,38,0.9)' : 'rgba(220,38,38,0.6)'} fontSize={bandPixelHeight > 25 ? 10 : 8} fontWeight={selectedProjectedIdx === hIdx ? 700 : 600} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => {
                            if (selectedProjectedIdx === hIdx) {
                              setSelectedProjectedIdx(null); setVisibleKPIs({}); setSelectedMilestone(null); setSelectedCapability(null); setSelectedTask(null); setShowMilestoneRevenue(false);
                            } else {
                              setSelectedProjectedIdx(hIdx);
                              const svc = hypotheticalServices[hIdx];
                              if (!serviceKPIs[svc.id] && svc.configurableKPIs?.length > 0) { serviceKPIs[svc.id] = svc.configurableKPIs.map((k, i) => ({ key: k.key, label: k.label, unit: k.unit === '$' ? '$' : k.unit === 'x' ? 'x' : '%', axis: k.unit === '$' ? 'left' : 'right', color: `rgba(${120 + i * 40}, ${100 + i * 30}, ${200 - i * 20}, 0.9)` })); }
                              if (serviceKPIs[svc.id]) { const vk = {}; serviceKPIs[svc.id].forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk); }
                              setSelectedMilestone(svc); setSelectedCapability(svc.type === 'direct_revenue' && !svc.category ? svc : null); setSelectedTask(svc.category ? svc : null); setShowMilestoneRevenue(true);
                            }
                          }}>{h.name}</text>);
                        }
                      }
                    }
                  });
                  return <g>{elements}</g>;
                }} />
              )}

              {/* Today breakdown — stacked area chart per channel, rendered top-to-bottom so lower layers paint over */}
              {showTodayBreakdown && breakdownData && (() => {
                const reversed = [...breakdownChannels].reverse();
                const hasSelection = selectedBreakdownChannel != null;
                return reversed.map(ch => {
                  const isSelected = selectedBreakdownChannel === ch.key;
                  return (
                    <Area key={`bd-${ch.key}`} yAxisId="left" type="monotone" dataKey={ch.stackKey}
                      stroke={ch.color}
                      strokeOpacity={0}
                      strokeWidth={0}
                      fill="transparent"
                      fillOpacity={1}
                      activeDot={false}
                      dot={(p) => {
                        const v = p.payload[ch.stackKey];
                        if (v == null || v === 0) return null;
                        const rawVal = ch.key === 'paidSocial' ? p.payload._ps
                          : ch.key === 'paidSearch' ? p.payload._psr
                          : ch.key === 'seo' ? p.payload._se
                          : ch.key === 'email' ? p.payload._em
                          : ch.key === 'affiliate' ? p.payload._af
                          : p.payload._ot;
                        if (!rawVal) return null;
                        return <circle cx={p.cx} cy={p.cy} r={isSelected ? 4 : 2.5} fill={ch.color} fillOpacity={hasSelection && !isSelected ? 0.5 : 1} stroke={theme.background} strokeWidth={isSelected ? 2 : 1}
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const isDeselect = selectedBreakdownChannel === ch.key;
                            setSelectedBreakdownChannel(prev => prev === ch.key ? null : ch.key);
                            if (isDeselect) {
                              setCompareFromIndex(null); setCompareToIndex(null); setCompareFromIndex2(null); setCompareToIndex2(null);
                            } else {
                              const capObj = capabilities.find(c => c.id === ch.capabilityId);
                              const launchIdx = capObj?.monthIndex ?? 0;
                              setCompareFromIndex(launchIdx);
                              setCompareToIndex(Math.min(launchIdx + 2, currentMonthIndex));
                              setCompareFromIndex2(Math.max(0, currentMonthIndex - 2));
                              setCompareToIndex2(currentMonthIndex);
                            }
                            setClickedLineData({ name: ch.name, value: formatCurrency(rawVal), color: ch.color, x: p.cx, y: p.cy, month: p.payload.month });
                          }} />;
                      }}
                      isAnimationActive={false}
                      name={ch.name} />
                  );
                });
              })()}

              {/* Projected revenue band on top of stack in breakdown view */}
              {showTodayBreakdown && breakdownData && hypotheticalServices.length > 0 && (
                <Area yAxisId="left" type="monotone" dataKey="stack_projected"
                  stroke={theme.chart3} strokeWidth={2} strokeDasharray="6 3"
                  fill="transparent" fillOpacity={1}
                  activeDot={false} dot={false}
                  isAnimationActive={false}
                  connectNulls
                  name="Projected Growth" />
              )}

              {/* Band fill polygons — renders colored fills between stack boundaries */}
              {showTodayBreakdown && breakdownData && (
                <Customized component={({ xAxisMap, yAxisMap }) => {
                  const xAxis = xAxisMap && Object.values(xAxisMap)[0];
                  const yAxis = yAxisMap && Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis || !xAxis.scale || !yAxis.scale) return null;
                  const activeData = adjustedBreakdownData || breakdownData;
                  const hasSelection = selectedBreakdownChannel != null;
                  const channelsToFill = breakdownChannels;
                  return (<g>{channelsToFill.map(ch => {
                    const chIdx = breakdownChannels.indexOf(ch);
                    const isSelected = selectedBreakdownChannel === ch.key;
                    const belowKey = chIdx > 0 ? breakdownChannels[chIdx - 1].stackKey : null;
                    const points = [];
                    // Top edge left to right
                    activeData.forEach(dp => {
                      const x = xAxis.scale(dp.month);
                      const y = yAxis.scale(dp[ch.stackKey] || 0);
                      if (x != null && y != null) points.push(`${x},${y}`);
                    });
                    // Bottom edge right to left
                    [...activeData].reverse().forEach(dp => {
                      const x = xAxis.scale(dp.month);
                      const y = yAxis.scale(belowKey ? (dp[belowKey] || 0) : 0);
                      if (x != null && y != null) points.push(`${x},${y}`);
                    });
                    if (points.length < 4) return null;
                    let fillColor;
                    if (!hasSelection) {
                      fillColor = ch.fill;
                    } else if (isSelected) {
                      fillColor = ch.fill.split(',').slice(0,3).join(',') + ', 0.38)';
                    } else {
                      fillColor = ch.fill.split(',').slice(0,3).join(',') + ', 0.12)';
                    }
                    return <polygon key={`fill-${ch.key}`} points={points.join(' ')} fill={fillColor} stroke="none" style={{ pointerEvents: 'none' }} />;
                  })}
                  {/* Projected growth bands — per service */}
                  {hypotheticalServices.length > 0 && (() => {
                    const redShades = ['rgba(220,38,38,0.12)', 'rgba(220,38,38,0.08)', 'rgba(220,38,38,0.06)', 'rgba(220,38,38,0.05)'];
                    const elements = [];
                    hypotheticalServices.forEach((h, hIdx) => {
                      const stackKey = `bd_proj_stack_${hIdx}`;
                      const belowKey = hIdx === 0 ? 'stack_other' : `bd_proj_stack_${hIdx - 1}`;
                      const filtProj = activeData.filter(dp => dp[stackKey] != null);
                      if (filtProj.length < 2) return;
                      const points = [];
                      filtProj.forEach(dp => {
                        const x = xAxis.scale(dp.month);
                        const y = yAxis.scale(dp[stackKey]);
                        if (x != null && y != null) points.push(`${x},${y}`);
                      });
                      [...filtProj].reverse().forEach(dp => {
                        const x = xAxis.scale(dp.month);
                        const belowVal = hIdx === 0 ? (dp.stack_other || 0) : (dp[belowKey] ?? dp.stack_other ?? 0);
                        const y = yAxis.scale(belowVal);
                        if (x != null && y != null) points.push(`${x},${y}`);
                      });
                      if (points.length >= 4) {
                        elements.push(<polygon key={`bdfill-${hIdx}`} points={points.join(' ')} fill={redShades[hIdx] || redShades[redShades.length - 1]} stroke={selectedProjectedIdx === hIdx ? 'rgba(220,38,38,0.5)' : 'none'} strokeWidth={selectedProjectedIdx === hIdx ? 1.5 : 0} style={{ cursor: 'pointer' }} onClick={() => {
                          if (selectedProjectedIdx === hIdx) {
                            setSelectedProjectedIdx(null);
                            setVisibleKPIs({});
                            setSelectedMilestone(null); setSelectedCapability(null); setSelectedTask(null);
                          } else {
                            setSelectedProjectedIdx(hIdx);
                            const svc = hypotheticalServices[hIdx];
                            if (serviceKPIs[svc.id]) {
                              const vk = {}; serviceKPIs[svc.id].forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk);
                              setSelectedMilestone(svc); setSelectedCapability(svc.type === 'direct_revenue' ? svc : null); setSelectedTask(svc.category ? svc : null);
                            }
                          }
                        }} />);
                      }
                      // Label
                      const midIdx = Math.floor(filtProj.length * 0.6);
                      const midDp = filtProj[midIdx];
                      if (midDp) {
                        const topVal = midDp[stackKey];
                        const botVal = hIdx === 0 ? (midDp.stack_other || 0) : (midDp[belowKey] ?? midDp.stack_other ?? 0);
                        const bandPx = Math.abs((yAxis.scale(botVal) || 0) - (yAxis.scale(topVal) || 0));
                        if (bandPx > 14) {
                          const x = xAxis.scale(midDp.month);
                          const y = yAxis.scale((topVal + botVal) / 2);
                          if (x != null && y != null) {
                            elements.push(<text key={`bdlbl-${hIdx}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={selectedProjectedIdx === hIdx ? 'rgba(220,38,38,0.9)' : 'rgba(220,38,38,0.6)'} fontSize={bandPx > 25 ? 10 : 8} fontWeight={selectedProjectedIdx === hIdx ? 700 : 600} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => {
                              if (selectedProjectedIdx === hIdx) {
                                setSelectedProjectedIdx(null); setVisibleKPIs({}); setSelectedMilestone(null); setSelectedCapability(null); setSelectedTask(null); setShowMilestoneRevenue(false);
                              } else {
                                setSelectedProjectedIdx(hIdx);
                                const svc = hypotheticalServices[hIdx];
                                if (!serviceKPIs[svc.id] && svc.configurableKPIs?.length > 0) { serviceKPIs[svc.id] = svc.configurableKPIs.map((k, i) => ({ key: k.key, label: k.label, unit: k.unit === '$' ? '$' : k.unit === 'x' ? 'x' : '%', axis: k.unit === '$' ? 'left' : 'right', color: `rgba(${120 + i * 40}, ${100 + i * 30}, ${200 - i * 20}, 0.9)` })); }
                                if (serviceKPIs[svc.id]) { const vk = {}; serviceKPIs[svc.id].forEach(k => { vk[k.key] = true; }); setVisibleKPIs(vk); }
                                setSelectedMilestone(svc); setSelectedCapability(svc.type === 'direct_revenue' && !svc.category ? svc : null); setSelectedTask(svc.category ? svc : null); setShowMilestoneRevenue(true);
                              }
                            }}>{h.name}</text>);
                          }
                        }
                      }
                    });
                    return elements;
                  })()}
                  {/* Stroke lines rendered on top of polygon fills so they stay visible */}
                  {channelsToFill.map(ch => {
                    const isSelected = selectedBreakdownChannel === ch.key;
                    const points = [];
                    activeData.forEach(dp => {
                      const x = xAxis.scale(dp.month);
                      const y = yAxis.scale(dp[ch.stackKey] || 0);
                      if (x != null && y != null) points.push(`${x},${y}`);
                    });
                    if (points.length < 2) return null;
                    let strokeColor, strokeW, strokeOpacity;
                    if (!hasSelection) {
                      strokeColor = ch.color; strokeW = 1; strokeOpacity = 0.35;
                    } else if (isSelected) {
                      strokeColor = ch.color; strokeW = 2.5; strokeOpacity = 1;
                    } else {
                      strokeColor = ch.color; strokeW = 1; strokeOpacity = 0.3;
                    }
                    return <polyline key={`stroke-${ch.key}`} points={points.join(' ')} fill="none" stroke={strokeColor} strokeWidth={strokeW} strokeOpacity={strokeOpacity} strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: 'none' }} />;
                  })}
                  </g>);
                }} />
              )}


              {/* Band labels inside each stacked area */}
              {showTodayBreakdown && breakdownData && (
                <Customized component={({ xAxisMap, yAxisMap }) => {
                  const xAxis = xAxisMap && Object.values(xAxisMap)[0];
                  const yAxis = yAxisMap && Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis || !xAxis.scale || !yAxis.scale) return null;
                  const activeData = adjustedBreakdownData || breakdownData;
                  const midIdx = Math.floor(activeData.length * 0.55);
                  const dp = activeData[midIdx];
                  if (!dp) return null;
                  const xPixel = xAxis.scale(dp.month);
                  if (xPixel == null) return null;
                  const labels = [];
                  const channelsInOrder = breakdownChannels;
                  let prevStackVal = 0;
                  const currentDp = activeData.find(d => d.index === currentMonthIndex) || dp;
                  const totalRev = currentDp.totalRevenue || 1;
                  channelsInOrder.forEach((ch) => {
                    const topVal = dp[ch.stackKey] || 0;
                    const bandHeight = topVal - prevStackVal;
                    if (bandHeight > 0) {
                      const midVal = prevStackVal + bandHeight / 2;
                      const yPixel = yAxis.scale(midVal);
                      if (yPixel != null) {
                        const topPixel = yAxis.scale(topVal);
                        const bottomPixel = yAxis.scale(prevStackVal);
                        const pixelHeight = Math.abs(bottomPixel - topPixel);
                        if (pixelHeight > 18) {
                          const isLabelSelected = selectedBreakdownChannel === ch.key;
                          const hasLabelSelection = selectedBreakdownChannel != null;
                          const nameFontSize = pixelHeight > 30 ? 11 : 9;
                          const chRevenue = currentDp[`_${ch.key === 'paidSocial' ? 'ps' : ch.key === 'paidSearch' ? 'psr' : ch.key === 'seo' ? 'se' : ch.key === 'email' ? 'em' : ch.key === 'affiliate' ? 'af' : 'ot'}`] || (currentDp[ch.stackKey] - (breakdownChannels.indexOf(ch) > 0 ? (currentDp[breakdownChannels[breakdownChannels.indexOf(ch) - 1].stackKey] || 0) : 0));
                          const pct = totalRev > 0 ? Math.round(chRevenue / totalRev * 100) : 0;
                          // Channel name + %
                          labels.push(
                            <text key={`label-${ch.key}`} x={xPixel} y={yPixel} textAnchor="middle" dominantBaseline="central"
                              fill={hasLabelSelection && !isLabelSelected ? `${ch.color}` : ch.color} fontSize={nameFontSize} fontWeight={isLabelSelected ? 700 : 600}
                              style={{ pointerEvents: 'none', userSelect: 'none' }}
                              opacity={hasLabelSelection && !isLabelSelected ? 0.35 : 0.85}>
                              {ch.name} ({pct}%)
                            </text>
                          );
                        }
                      }
                    }
                    prevStackVal = topVal;
                  });
                  return <g>{labels}</g>;
                }} />
              )}

              {/* Event revenue — darker red-orange, clearly dashed, distinct from main */}
              {showMilestoneRevenue && selectedMilestone?.revenueMetric && <Line yAxisId="left" type="monotone" dataKey={selectedMilestone.type === 'direct_revenue' ? selectedMilestone.revenueMetric : 'incrementalRevenue'} stroke="oklch(0.55 0.22 15)" strokeWidth={3} strokeDasharray="10 5" dot={(p) => { const dk = selectedMilestone.type === 'direct_revenue' ? selectedMilestone.revenueMetric : 'incrementalRevenue'; const v = p.payload[dk]; if (v == null) return null; return <circle cx={p.cx} cy={p.cy} r={4} fill="oklch(0.55 0.22 15)" stroke={theme.background} strokeWidth={2} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setClickedLineData({ name: selectedMilestone.name + ' Revenue', value: formatCurrency(v), color: 'oklch(0.55 0.22 15)', x: p.cx, y: p.cy, month: p.payload.month }); }} />; }} activeDot={false} name="Event Revenue" />}


              {/* Fees */}
              {showActualFees && <Line yAxisId="left" type="monotone" dataKey="actualFees" stroke={theme.chart2} strokeWidth={4} strokeDasharray="8 4" dot={(p) => <circle cx={p.cx} cy={p.cy} r={4} fill={theme.chart2} stroke={theme.background} strokeWidth={1} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setShowFeePanel(true); setFeePanelMonth(p.payload.month); setClickedLineData(null); }} />} activeDot={false} name="Actual Fees" />}
              {showActualFees && projectedData && <Line yAxisId="left" type="monotone" dataKey="projectedFees" stroke="rgba(239,68,68,0.7)" strokeWidth={3} strokeDasharray="4 3" dot={(p) => { if (p.payload.projectedFees == null) return null; return <circle cx={p.cx} cy={p.cy} r={3} fill="rgba(239,68,68,0.7)" stroke={theme.background} strokeWidth={1} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setShowFeePanel(true); setFeePanelMonth(p.payload.month); setClickedLineData(null); }} />; }} activeDot={false} name="Projected Fees" connectNulls />}
              {showStandardFees && <Line yAxisId="left" type="monotone" dataKey="standardFees" stroke={theme.chart5} strokeWidth={4} strokeDasharray="3 3" dot={(p) => <circle cx={p.cx} cy={p.cy} r={4} fill={theme.chart5} stroke={theme.background} strokeWidth={1} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setClickedLineData({ name: 'Standard Fees', value: formatCurrency(p.payload.standardFees), color: theme.chart5, x: p.cx, y: p.cy, month: p.payload.month }); }} />} activeDot={false} name="Standard Fees" />}

              {/* KPI lines — axis auto-derived: '$' or large values use left (revenue scale), '%'/'x'/small values use right */}
              {selectedMilestone && (serviceKPIs[selectedMilestone.id] || []).filter(kpi => visibleKPIs[kpi.key]).map(kpi => {
                const autoAxis = kpi.unit === '$' ? 'left' : kpi.unit === '%' || kpi.unit === 'x' || kpi.unit === 's' ? 'right' : (() => { const sample = visibleData.find(d => d[kpi.key] != null && d[kpi.key] > 0); return sample && sample[kpi.key] > 200 ? 'left' : 'right'; })();
                return (
                <Line key={kpi.key} yAxisId={autoAxis} type="monotone" dataKey={kpi.key} stroke={kpi.color} strokeWidth={2}
                  dot={(p) => { const v = p.payload[kpi.key]; if (v == null || isNaN(v)) return null; return <circle cx={p.cx} cy={p.cy} r={3} fill={kpi.color} stroke={theme.background} strokeWidth={1} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setShowKPIPanel(true); setKpiPanelMonth(p.payload.month); setClickedLineData(null); }} />; }}
                  strokeDasharray="4 2" name={kpi.label} connectNulls activeDot={false} />
                );
              })}
              {/* Fallback: render KPI lines from configurableKPIs if serviceKPIs not found */}
              {selectedProjectedIdx != null && selectedMilestone && !serviceKPIs[selectedMilestone.id] && (selectedMilestone.configurableKPIs || []).filter(kpi => visibleKPIs[kpi.key]).map((kpi, i) => {
                const autoAxis = kpi.unit === '$' ? 'left' : kpi.unit === '%' || kpi.unit === 'x' || kpi.unit === 's' ? 'right' : (() => { const sample = visibleData.find(d => d[kpi.key] != null && d[kpi.key] > 0); return sample && sample[kpi.key] > 200 ? 'left' : 'right'; })();
                return (
                <Line key={`cfgkpi-${kpi.key}`} yAxisId={autoAxis} type="monotone" dataKey={kpi.key} stroke={`rgba(${120 + i * 40}, ${100 + i * 30}, ${200 - i * 20}, 0.9)`} strokeWidth={2}
                  dot={(p) => { const v = p.payload[kpi.key]; if (v == null || isNaN(v)) return null; const unit = kpi.unit; let f; if (unit === '$') f = `$${Math.round(v).toLocaleString()}`; else if (unit === '%') f = `${v.toFixed(1)}%`; else if (unit === 'x') f = `${v.toFixed(1)}x`; else f = Math.round(v).toLocaleString(); return <circle cx={p.cx} cy={p.cy} r={3} fill={`rgba(${120 + i * 40}, ${100 + i * 30}, ${200 - i * 20}, 0.9)`} stroke={theme.background} strokeWidth={1} />; }}
                  strokeDasharray="4 2" name={kpi.label} connectNulls activeDot={false} />
                );
              })}

              {/* Tags — vertical dashed lines with interpolated day-level positioning */}
              {tags.length > 0 && (
                <Customized component={({ xAxisMap, yAxisMap }) => {
                  const xAxis = xAxisMap && Object.values(xAxisMap)[0];
                  const yAxis = yAxisMap && Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis || !xAxis.scale || !yAxis.scale) return null;
                  const chartSource = breakdownData || projectedData || displayData;
                  if (!chartSource || chartSource.length < 2) return null;
                  const elements = [];
                  const tagPos = [];
                  const tagColor = 'rgba(245,158,11,0.85)';
                  const tagColorLight = 'rgba(245,158,11,0.25)';
                  tags.forEach(tag => {
                    // Find two adjacent month data points to interpolate between
                    const baseIdx = chartSource.findIndex(d => d.index === tag.monthIndex);
                    if (baseIdx < 0) return;
                    const baseDp = chartSource[baseIdx];
                    const nextDp = baseIdx < chartSource.length - 1 ? chartSource[baseIdx + 1] : null;
                    const baseX = xAxis.scale(baseDp.month);
                    if (baseX == null) return;
                    let xPos;
                    if (nextDp) {
                      const nextX = xAxis.scale(nextDp.month);
                      if (nextX != null) {
                        const frac = (tag.dayOfMonth - 1) / tag.daysInMonth;
                        xPos = baseX + (nextX - baseX) * frac;
                      } else {
                        xPos = baseX;
                      }
                    } else {
                      xPos = baseX;
                    }
                    // Get chart vertical bounds
                    const yTop = 8;
                    const allVals = chartSource.map(d => d.projectedRevenue || d.stack_projected || d.stack_other || d.totalRevenue);
                    const maxVal = Math.max(...allVals);
                    const yBottom = yAxis.scale(0) || yAxis.scale(Math.min(...chartSource.map(d => d.totalRevenue)) * 0.8);
                    const yTopLine = yAxis.scale(maxVal * 0.98) || yTop;
                    const isSelected = selectedTag?.id === tag.id;
                    const active = isSelected;
                    // Dashed vertical line (visual only)
                    elements.push(
                      <line key={`tagline-${tag.id}`} x1={xPos} y1={yTopLine} x2={xPos} y2={yBottom}
                        stroke={active ? tagColor : tagColorLight} strokeWidth={active ? 2 : 1.5} strokeDasharray="6 4"
                        style={{ pointerEvents: 'none', transition: 'stroke 0.15s, stroke-width 0.15s' }} />
                    );
                    // Rotated label (visual only — click handled by HTML overlay)
                    elements.push(
                      <text key={`taglbl-${tag.id}`} x={xPos} y={yTopLine - 6}
                        textAnchor="start" dominantBaseline="middle"
                        fill={active ? tagColor : 'rgba(245,158,11,0.6)'}
                        fontSize={10} fontWeight={active ? 700 : 600}
                        transform={`rotate(-35, ${xPos}, ${yTopLine - 6})`}
                        style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.15s' }}>
                        {tag.label}
                      </text>
                    );
                    // Store position for HTML overlay click target
                    tagPos.push({ id: tag.id, x: xPos, yTop: yTopLine, label: tag.label, date: tag.date, description: tag.description, tag });
                  });
                  const posJson = JSON.stringify(tagPos);
                  setTimeout(() => setTagPositions(JSON.parse(posJson)), 0);
                  return <g>{elements}</g>;
                }} />
              )}

              {/* Today line */}
              {(() => {
                const todayLabel = timeGranularity === 'Q' ? 'Q1 2026' : timeGranularity === 'Y' ? '2026' : 'Feb 2026';
                return chartData.some(d => d.month === todayLabel) && <ReferenceLine yAxisId="left" x={todayLabel} stroke={theme.textMuted} strokeWidth={1} strokeDasharray="4 4" label={{ value: 'Today', position: 'insideTopRight', fill: theme.text, fontSize: 12, fontWeight: 700, offset: 8 }} />;
              })()}

              {/* Selected milestone vertical line */}
              {selectedMilestone && (() => { const h = hypotheticalServices.find(h => h.id === selectedMilestone.id); const x = (selectedMilestone.monthIndex != null ? MONTHS[selectedMilestone.monthIndex] : null) || (h ? h.startMonthLabel : null); if (!x) return null; return <ReferenceLine yAxisId="left" x={x} stroke={selectedMilestone.color} strokeWidth={2} strokeDasharray="5 5" isFront label={{ value: selectedMilestone.name, position: 'top', fill: selectedMilestone.color, fontSize: 12, fontWeight: 700 }} />; })()}

              {/* Priority 1+2: Milestone dots — Capabilities LARGER (r=10, glow), Tasks SMALLER (r=6, no glow) */}
              {showRevenue && allMilestoneItems.map(item => {
                const dp = (projectedData || visibleData).find(d => d.month === MONTHS[item.monthIndex]);
                if (!dp) return null;
                const isCap = capabilities.some(c => c.id === item.id);
                return <ReferenceDot key={`ms-${item.id}`} yAxisId="left" x={MONTHS[item.monthIndex]} y={dp.totalRevenue}
                  r={isCap ? 10 : 6} fill={item.color} stroke={theme.background} strokeWidth={isCap ? 3 : 2} isFront
                  style={{ cursor: 'pointer', filter: isCap ? `drop-shadow(0 0 6px ${item.color})` : 'none' }}
                  onClick={() => { if (isCap) handleSelectCapability(item); else handleSelectTask(item); }} />;
              })}

              {/* Projected capability dots (dashed outline) */}
              {showRevenue && hypotheticalServices.map(h => {
                const dp = (projectedData || visibleData).find(d => d.month === h.startMonthLabel);
                if (!dp) return null;
                return <ReferenceDot key={`hp-${h.id}`} yAxisId="left" x={h.startMonthLabel} y={dp.projectedRevenue || dp.totalRevenue}
                  r={10} fill="transparent" stroke={h.color} strokeWidth={3} isFront
                  style={{ cursor: 'pointer', filter: `drop-shadow(0 0 6px ${h.color})` }} />;
              })}
              {/* Original total revenue line — rendered LAST so it draws on top of stacked areas */}
              {adjustedBreakdownData && <Line yAxisId="left" type="monotone" dataKey="originalTotalRevenue" stroke="#ec4899" strokeWidth={4} strokeDasharray="10 6" dot={false} activeDot={false} name="Original Revenue" opacity={0.85} />}
              {/* Projected total revenue line — thick solid line at new topline */}
              {adjustedBreakdownData && <Line yAxisId="left" type="monotone" dataKey="adjustedTotalRevenue" stroke={theme.primary} strokeWidth={4} dot={false} activeDot={false} name="Projected Revenue" opacity={0.9} />}

            </ComposedChart>
          </ResponsiveContainer>

          {/* Clicked tooltip */}
          {clickedLineData && !showTodayBreakdown && <div style={{ position: 'absolute', right: '60px', top: '100px', fontSize: '14px', fontWeight: 700, color: clickedLineData.color, zIndex: 100, pointerEvents: 'none', whiteSpace: 'nowrap', background: theme.surface, padding: '6px 14px', borderRadius: '4px', border: `2px solid ${clickedLineData.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>{clickedLineData.name}: {clickedLineData.value} <span style={{ fontSize: '11px', fontWeight: 500, color: theme.muted, marginLeft: '6px' }}>{clickedLineData.month}</span></div>}

          {/* HTML overlay click targets for tag labels */}
          {tagPositions.length > 0 && tagPositions.map(tp => (
            <div key={`tag-click-${tp.id}`}
              onClick={(e) => {
                e.stopPropagation();
                areaClickGuard.current = true;
                setTimeout(() => { areaClickGuard.current = false; }, 100);
                setSelectedTag(prev => prev?.id === tp.id ? null : tp.tag);
                setSelectedCapability(null); setSelectedTask(null);
              }}
              style={{
                position: 'absolute',
                left: `${tp.x + 20 - 10}px`,
                top: `${tp.yTop + 56 + 4 + (showTodayBreakdown ? 48 : 0) - 30}px`,
                width: `${Math.max(60, tp.label.length * 7)}px`,
                height: '24px',
                cursor: 'pointer',
                zIndex: 65,
                pointerEvents: 'auto',
              }}
            />
          ))}

          {/* Tag detail box — HTML overlay, shown when a tag is clicked */}
          {selectedTag && (() => {
            const tagIdx = data.findIndex(d => d.month === selectedTag.month);
            if (tagIdx < 0) return null;
            return (
              <div style={{
                position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 110, pointerEvents: 'auto',
                background: theme.surface, border: '2px solid rgba(245,158,11,0.5)', borderTop: '3px solid rgba(245,158,11,1)',
                borderRadius: '8px', padding: '10px 14px', minWidth: '180px', maxWidth: '300px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(245,158,11,1)' }}>{selectedTag.label}</span>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedTag(null); }} style={{ background: 'transparent', border: 'none', fontSize: '14px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ fontSize: '10px', color: theme.muted, marginBottom: selectedTag.description ? '6px' : 0 }}>{selectedTag.date}</div>
                {selectedTag.description && <div style={{ fontSize: '11px', color: theme.text, lineHeight: '1.4' }}>{selectedTag.description}</div>}
              </div>
            );
          })()}

          {/* Dropdowns Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0 4px 0', flexWrap: 'wrap' }}>

            <button onClick={goToToday} style={btnStyle(false, theme.border)}>Today</button>

            {/* Milestones */}
            <div style={{ position: 'relative' }}>
              <button onClick={(e) => { e.stopPropagation(); setCapabilitiesDropdownOpen(!capabilitiesDropdownOpen); setMilestoneDropdownOpen(false); setLineDropdownOpen(false); setTagDropdownOpen(false); setAddingTag(false); }} style={btnStyle(selectedCapability || selectedTask, (selectedCapability || selectedTask)?.color)}>
                Milestones{selectedCapability ? `: ${selectedCapability.name}` : selectedTask ? `: ${selectedTask.name}` : ''}
                <span style={{ fontSize: '10px' }}>▼</span>
              </button>
              {capabilitiesDropdownOpen && (
                <div data-dropdown-menu style={{ ...ddStyle, minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <input type="text" placeholder="Search milestones..." value={capabilitySearchFilter} onChange={(e) => setCapabilitySearchFilter(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '13px', background: theme.background, color: theme.text, outline: 'none' }} />
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: '360px', flex: '1 1 auto' }}>
                    <div style={{ padding: '6px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: theme.muted, background: theme.background }}>Channels</div>
                    {capabilities.filter(c => c.engaged && c.id !== 'other').filter(c => c.name.toLowerCase().includes(capabilitySearchFilter.toLowerCase())).map(cap => (
                      <div key={cap.id} onClick={() => { handleSelectCapability(cap); setCapabilitiesDropdownOpen(false); }} style={ddItem(selectedCapability?.id === cap.id, cap.color)}>
                        {selectedCapability?.id === cap.id && '● '}{cap.name}<span style={{ fontSize: '11px', fontWeight: 400, color: theme.muted, marginLeft: 'auto' }}>{cap.date}</span>
                      </div>
                    ))}
                    <div style={{ padding: '6px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: theme.muted, background: theme.background, borderTop: `2px solid ${theme.border}` }}>Tasks</div>
                    {tasks.filter(t => t.completed).filter(t => t.name.toLowerCase().includes(capabilitySearchFilter.toLowerCase())).map(task => (
                      <div key={task.id} onClick={() => { handleSelectTask(task); setCapabilitiesDropdownOpen(false); }} style={{ ...ddItem(selectedTask?.id === task.id, task.color), fontWeight: 700 }}>
                        {selectedTask?.id === task.id && '● '}{task.name}
                        <span style={{ fontSize: '11px', fontWeight: 400, color: theme.muted, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>{task.date}{task.category && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'rgba(128,128,128,0.1)' }}>{task.category}</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* Tags */}
            <div style={{ position: 'relative' }}>
              <button onClick={(e) => { e.stopPropagation(); setTagDropdownOpen(!tagDropdownOpen); setCapabilitiesDropdownOpen(false); setMilestoneDropdownOpen(false); setLineDropdownOpen(false); if (tagDropdownOpen) setAddingTag(false); }} style={btnStyle(selectedTag || tags.length > 0, 'rgba(245,158,11,1)')}>
                Tags
                <span style={{ fontSize: '10px' }}>▼</span>
              </button>
              {tagDropdownOpen && (
                <div data-dropdown-menu style={{ ...ddStyle, minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                  {/* Search box */}
                  {tags.length > 0 && (
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                      <input type="text" placeholder="Search tags..." value={tagSearchFilter} onChange={(e) => setTagSearchFilter(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '13px', background: theme.background, color: theme.text, outline: 'none' }} />
                    </div>
                  )}
                  {/* Scrollable tags list */}
                  <div style={{ overflowY: 'auto', flex: '1 1 auto' }}>
                    {tags.length === 0 && (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: theme.muted }}>No tags yet. Add one to annotate your timeline.</div>
                    )}
                    {tags.filter(t => t.label.toLowerCase().includes(tagSearchFilter.toLowerCase()) || (t.description || '').toLowerCase().includes(tagSearchFilter.toLowerCase())).sort((a, b) => a.fractionalIndex - b.fractionalIndex).map(tag => (
                      <div key={tag.id} onClick={() => { setSelectedTag(prev => prev?.id === tag.id ? null : tag); setSelectedCapability(null); setSelectedTask(null); setTagDropdownOpen(false); setTagSearchFilter(''); scrollToMonth(tag.monthIndex); }} style={{ ...ddItem(selectedTag?.id === tag.id, 'rgba(245,158,11,1)'), flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                          {selectedTag?.id === tag.id && <span style={{ color: 'rgba(245,158,11,1)' }}>●</span>}
                          <span style={{ fontWeight: 600 }}>{tag.label}</span>
                          <span style={{ fontSize: '11px', fontWeight: 400, color: theme.muted, marginLeft: 'auto' }}>{tag.date}</span>
                        </div>
                        {tag.description && <div style={{ fontSize: '11px', color: theme.muted, paddingLeft: selectedTag?.id === tag.id ? '22px' : '0' }}>{tag.description}</div>}
                      </div>
                    ))}
                  </div>
                  {/* Pinned bottom — Add a New Tag */}
                  <div style={{ borderTop: `2px solid ${theme.border}`, padding: '8px 16px', flexShrink: 0 }}>
                    <div onClick={(e) => { e.stopPropagation(); setAddingTag(true); setTagDropdownOpen(false); }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'rgba(245,158,11,1)', display: 'flex', alignItems: 'center', gap: '6px' }}>+ Add a New Tag</div>
                  </div>
                </div>
              )}
              {/* Add Tag modal — opens outside dropdown like Create Task */}
              {addingTag && (
                <div data-dropdown-menu onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '4px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '340px', padding: '16px', zIndex: 110 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, color: theme.text, fontSize: '14px', fontWeight: 700 }}>Add a New Tag</h4>
                    <button onClick={() => { setAddingTag(false); setNewTagLabel(''); setNewTagDescription(''); setNewTagDate(''); }} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '6px' }}>Label *</label>
                    <input type="text" placeholder="e.g. PR Campaign Kicked Off" value={newTagLabel} onChange={(e) => setNewTagLabel(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '8px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.background, color: theme.text, outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '6px' }}>Date *</label>
                    <input type="date" min="2023-08-01" max="2028-07-31" value={newTagDate} onClick={(e) => { e.stopPropagation(); try { e.target.showPicker(); } catch(_) {} }} onChange={(e) => setNewTagDate(e.target.value)} style={{ width: '100%', padding: '8px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.background, color: theme.text, cursor: 'pointer', outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '6px' }}>Description (optional)</label>
                    <input type="text" placeholder="What happened and why it matters" value={newTagDescription} onChange={(e) => setNewTagDescription(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '8px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.background, color: theme.text, outline: 'none' }} />
                  </div>
                  <button disabled={!newTagLabel || !newTagDate} onClick={addTag} style={{ width: '100%', padding: '10px', background: (newTagLabel && newTagDate) ? 'rgba(245,158,11,1)' : theme.muted, color: '#fff', border: 'none', borderRadius: '4px', cursor: (newTagLabel && newTagDate) ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '13px', opacity: (newTagLabel && newTagDate) ? 1 : 0.5 }}>Add to Chart</button>
                </div>
              )}
            </div>
            {/* Recommended */}
            <div style={{ position: 'relative' }}>
              <button onClick={(e) => { e.stopPropagation(); setMilestoneDropdownOpen(!milestoneDropdownOpen); setCapabilitiesDropdownOpen(false); setLineDropdownOpen(false); setTagDropdownOpen(false); setAddingTag(false); }} style={{...btnStyle(false, theme.border), color: theme.primary, fontWeight: 600}}>
                💡 Recommendations
                {(() => { const count = hypotheticalServices.length; return count > 0 ? <span style={{ background: theme.primary, color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{count}</span> : null; })()}
                <span style={{ fontSize: '10px' }}>▼</span>
              </button>
              {milestoneDropdownOpen && (
                <div data-dropdown-menu style={{ ...ddStyle, minWidth: '340px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <input type="text" placeholder="Search recommended..." value={taskSearchFilter} onChange={(e) => setTaskSearchFilter(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '13px', background: theme.background, color: theme.text, outline: 'none' }} />
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: '360px', flex: '1 1 auto' }}>
                    <div style={{ padding: '6px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: theme.muted, background: theme.background, display: 'flex', alignItems: 'center', gap: '8px' }}>Channels <span style={{ background: theme.muted, color: theme.surface, borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{capabilities.filter(c => !c.engaged).length}</span></div>
                    {capabilities.filter(c => !c.engaged).filter(c => c.name.toLowerCase().includes(taskSearchFilter.toLowerCase())).map(cap => {
                      const isH = hypotheticalServices.some(h => h.id === cap.id);
                      return (
                        <div key={cap.id} onClick={(e) => { e.stopPropagation(); if (isH) { setHypotheticalServices(p => p.filter(h => h.id !== cap.id)); } else { setConfiguringService(cap); setConfigStartMonth(''); const ik = {}; (cap.configurableKPIs || []).forEach(k => { ik[k.key] = { target: k.industry }; }); setConfigKPIs(ik); } }} style={{ ...ddItem(false, theme.text), fontWeight: 400 }}>
                          <span style={{ color: isH ? theme.primary : theme.muted, fontWeight: 700, width: '16px', fontSize: '14px' }}>{isH ? '✓' : ''}</span>
                          {cap.name}
                          {isH && <span style={{ fontSize: '11px', color: theme.muted, marginLeft: 'auto' }}>{hypotheticalServices.find(h => h.id === cap.id)?.startDate}</span>}
                        </div>
                      );
                    })}
                    <div style={{ padding: '6px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: theme.muted, background: theme.background, borderTop: `2px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>Tasks <span style={{ background: theme.muted, color: theme.surface, borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{tasks.filter(t => !t.completed).length}</span></div>
                    {tasks.filter(t => !t.completed).filter(t => t.name.toLowerCase().includes(taskSearchFilter.toLowerCase())).map(task => {
                      const isH = hypotheticalServices.some(h => h.id === task.id);
                      return (
                      <div key={task.id} onClick={(e) => { e.stopPropagation(); if (isH) { setHypotheticalServices(p => p.filter(h => h.id !== task.id)); setSelectedTask(null); setSelectedMilestone(null); } else { setConfiguringTask(task); setConfigStartMonth(''); const ik = {}; (task.configurableKPIs || []).forEach(k => { ik[k.key] = { target: k.industry }; }); setConfigKPIs(ik); setMilestoneDropdownOpen(false); } }}
                        style={{ ...ddItem(false, task.color), fontWeight: 400 }}>
                        <span style={{ color: isH ? theme.primary : theme.muted, fontWeight: 700, width: '16px', fontSize: '14px' }}>{isH ? '✓' : ''}</span>
                        {task.name}
                        {isH && <span style={{ fontSize: '11px', color: theme.muted, marginLeft: '8px' }}>{hypotheticalServices.find(h => h.id === task.id)?.startDate}</span>}
                        {task.category && !isH && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '3px', marginLeft: 'auto', background: task.category === 'Traffic' ? 'rgba(54,162,235,0.15)' : task.category === 'Conversion' ? 'rgba(255,159,64,0.15)' : 'rgba(153,102,255,0.15)', color: task.category === 'Traffic' ? theme.chart2 : task.category === 'Conversion' ? theme.chart4 : theme.chart1 }}>{task.category}</span>}
                      </div>
                      );
                    })}
                    {hypotheticalServices.filter(h => h.id.startsWith('custom_')).length > 0 && <>
                      <div style={{ padding: '6px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: theme.muted, background: theme.background, borderTop: `2px solid ${theme.border}` }}>Custom</div>
                      {hypotheticalServices.filter(h => h.id.startsWith('custom_')).map(task => (
                        <div key={task.id} onClick={(e) => e.stopPropagation()} style={{ ...ddItem(selectedTask?.id === task.id, task.color), fontWeight: selectedTask?.id === task.id ? 700 : 400 }}>
                          <span style={{ color: theme.primary, fontWeight: 700, width: '16px', fontSize: '14px' }}>✓</span>
                          <span onClick={() => { setSelectedTask(task); setSelectedMilestone(task); setSelectedCapability(null); setMilestoneDropdownOpen(false); if (serviceKPIs[task.id]) { const k = {}; serviceKPIs[task.id].forEach(kpi => { k[kpi.key] = true; }); setVisibleKPIs(k); } }} style={{ cursor: 'pointer', flex: 1 }}>{task.name}</span>
                          <span style={{ fontSize: '11px', color: theme.muted, marginLeft: '8px' }}>{task.startDate}</span>
                          <span onClick={(e) => { e.stopPropagation(); setHypotheticalServices(p => p.filter(h => h.id !== task.id)); if (selectedTask?.id === task.id) { setSelectedTask(null); setSelectedMilestone(null); } }} style={{ cursor: 'pointer', color: theme.muted, fontSize: '14px', marginLeft: '8px', fontWeight: 700 }}>×</span>
                        </div>
                      ))}
                    </>}
                  </div>
                  <div style={{ borderTop: `2px solid ${theme.border}`, padding: '8px 16px', flexShrink: 0 }}>
                    <div onClick={(e) => { e.stopPropagation(); setCreatingTask(true); setNewTaskName(''); setNewTaskCategory(''); setConfigKPIs({}); setConfigStartMonth(''); setMilestoneDropdownOpen(false); }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'rgba(245,158,11,1)', display: 'flex', alignItems: 'center', gap: '6px' }}>+ Add a New Task</div>
                  </div>
                </div>
              )}
              {/* Inline config modal — Recommended Channel */}
              {configuringService && (
                <div data-dropdown-menu onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '100%', left: '270px', marginBottom: '4px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '380px', maxHeight: '480px', overflowY: 'auto', padding: '16px', zIndex: 110 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: configuringService.color, fontSize: '14px', fontWeight: 700 }}>{configuringService.name}</h4>
                    <button onClick={() => { setConfiguringService(null); setConfigKPIs({}); setConfigStartDay(''); }} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: theme.textMuted, lineHeight: 1.4 }}>{configuringService.description}</p>
                  {configuringService.configurableKPIs?.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '8px' }}>Target KPIs</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: '6px', marginBottom: '6px' }}>
                        {['Metric','Current','Industry','Target'].map(h => <span key={h} style={{ fontSize: '10px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase', textAlign: h === 'Metric' ? 'left' : 'center' }}>{h}</span>)}
                      </div>
                      {configuringService.configurableKPIs.map(kpi => {
                        const tv = configKPIs[kpi.key]?.target !== undefined ? configKPIs[kpi.key].target : kpi.industry;
                        return (
                          <div key={kpi.key} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: '6px', alignItems: 'center', padding: '6px 2px', borderBottom: `1px solid ${theme.border}` }}>
                            <span style={{ fontSize: '12px', color: theme.text, fontWeight: 500 }}>{kpi.label}</span>
                            <span style={{ fontSize: '12px', color: theme.muted, textAlign: 'center' }}>{kpi.current}{kpi.unit}</span>
                            <button onClick={() => setConfigKPIs(p => ({ ...p, [kpi.key]: { ...p[kpi.key], target: kpi.industry } }))} style={{ fontSize: '12px', color: tv === kpi.industry ? configuringService.color : theme.chart2, background: tv === kpi.industry ? `${configuringService.color}15` : 'transparent', border: `1px solid ${tv === kpi.industry ? configuringService.color : 'transparent'}`, borderRadius: '3px', cursor: 'pointer', padding: '2px 4px', fontWeight: tv === kpi.industry ? 700 : 400, textAlign: 'center' }}>{kpi.industry}{kpi.unit}</button>
                            <input type="number" value={tv} onChange={(e) => setConfigKPIs(p => ({ ...p, [kpi.key]: { ...p[kpi.key], target: Number(e.target.value) } }))} style={{ width: '100%', padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '12px', background: theme.background, color: theme.text, textAlign: 'center', fontWeight: 600, outline: 'none' }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {(() => { const kpis = configuringService.configurableKPIs || []; const bl = configuringService.projectedLift; let lm = 1; if (kpis.length > 0) { let tr = 0; kpis.forEach(k => { const t = configKPIs[k.key]?.target !== undefined ? configKPIs[k.key].target : k.industry; const r = k.industry > 0 ? t / k.industry : 1; tr += k.lowerIsBetter ? (2 - r) : r; }); lm = tr / kpis.length; } const el = bl * lm; const tr = data.find(d => d.index === currentMonthIndex)?.totalRevenue || 700000; return (
                    <div style={{ background: theme.background, borderRadius: '4px', padding: '10px', marginBottom: '14px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span style={{ color: theme.textMuted }}>Projected Revenue Lift:</span><span style={{ color: configuringService.color, fontWeight: 700 }}>+{(el * 100).toFixed(1)}%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Est. Monthly Impact:</span><span style={{ color: theme.text, fontWeight: 700 }}>+{formatCurrency(Math.round(tr * el))}/mo</span></div>
                    </div>
                  ); })()}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: theme.muted, whiteSpace: 'nowrap' }}>Start:</span>
                      <input type="date" min="2026-02-13" max="2028-07-31" value={configStartMonth} onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }} onChange={(e) => setConfigStartMonth(e.target.value)} style={{ padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '11px', background: theme.background, color: theme.text, cursor: 'pointer', width: 'auto' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '6px' }}>Costs</label>
                    {configCosts.map((cost, ci) => (
                      <div key={ci} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: theme.muted }}>$</span>
                        <input type="number" placeholder="0" value={cost.amount} onChange={(e) => { const c = [...configCosts]; c[ci] = { ...c[ci], amount: e.target.value }; setConfigCosts(c); }} style={{ width: '90px', padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '11px', background: theme.background, color: theme.text, textAlign: 'right' }} />
                        <select value={cost.frequency} onChange={(e) => { const c = [...configCosts]; c[ci] = { ...c[ci], frequency: e.target.value }; setConfigCosts(c); }} style={{ padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '11px', background: theme.background, color: theme.text, cursor: 'pointer' }}>
                          <option value="one-time">One-time</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        {configCosts.length > 1 && <button onClick={() => setConfigCosts(p => p.filter((_, i) => i !== ci))} style={{ background: 'transparent', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>}
                      </div>
                    ))}
                    <button onClick={() => setConfigCosts(p => [...p, { amount: '', frequency: 'one-time' }])} style={{ background: 'transparent', border: `1px dashed ${theme.border}`, borderRadius: '3px', padding: '3px 8px', fontSize: '10px', color: theme.primary, cursor: 'pointer', fontWeight: 600 }}>+ Add cost</button>
                    {configCosts.some(c => c.amount) && (() => {
                      const totalOneTime = configCosts.filter(c => c.frequency === 'one-time' && c.amount).reduce((s, c) => s + Number(c.amount), 0);
                      const totalMonthly = configCosts.filter(c => c.frequency === 'monthly' && c.amount).reduce((s, c) => s + Number(c.amount), 0);
                      return (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px' }}>
                          {totalOneTime > 0 && <span style={{ color: theme.textMuted }}>One-time: <span style={{ fontWeight: 700, color: theme.text }}>${totalOneTime.toLocaleString()}</span></span>}
                          {totalMonthly > 0 && <span style={{ color: theme.textMuted }}>Recurring: <span style={{ fontWeight: 700, color: theme.text }}>${Math.round(totalMonthly).toLocaleString()}/mo</span></span>}
                        </div>
                      );
                    })()}
                  </div>
                  <button disabled={!configStartMonth} onClick={() => {
                    const dt = new Date(configStartMonth + 'T00:00:00'); const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const monthLabel = `${ml[dt.getMonth()]} ${dt.getFullYear()}`; const sp = data.find(dp => dp.month === monthLabel); if (!sp) return;
                    const kpis = configuringService.configurableKPIs || []; const bl = configuringService.projectedLift; let lm = 1;
                    if (kpis.length > 0) { let tr = 0; kpis.forEach(k => { const t = configKPIs[k.key]?.target !== undefined ? configKPIs[k.key].target : k.industry; const r = k.industry > 0 ? t / k.industry : 1; tr += k.lowerIsBetter ? (2 - r) : r; }); lm = tr / kpis.length; }
                    const displayDate = `${ml[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
                    const validCosts = configCosts.filter(c => c.amount && Number(c.amount) > 0).map(c => ({ amount: Number(c.amount), frequency: c.frequency }));
                    const hypo = { ...configuringService, startMonthIndex: sp.index, startDate: displayDate, startMonthLabel: monthLabel, projectedLift: bl * lm, configuredKPIs: { ...configKPIs }, costs: validCosts };
                    setHypotheticalServices(p => [...p.filter(h => h.id !== configuringService.id), hypo]);
                    if (configuringService.configurableKPIs?.length > 0) {
                      serviceKPIs[configuringService.id] = configuringService.configurableKPIs.map((k, i) => ({ key: k.key, label: k.label, unit: k.unit === '$' ? '$' : k.unit === 'x' ? 'x' : '%', axis: k.unit === '$' ? 'left' : 'right', color: `rgba(${120 + i * 40}, ${100 + i * 30}, ${200 - i * 20}, 0.9)` }));
                    }
                    setVisibleKPIs({});
                    setConfiguringService(null); setConfigKPIs({}); setConfigCosts([{ amount: '', frequency: 'one-time' }]); setConfigStartDay(''); setShowActualFees(false); setShowStandardFees(false);
                    setMilestoneDropdownOpen(false);
                    setSelectedCapability(configuringService); setSelectedMilestone(configuringService); setSelectedTask(null);
                    scrollToMonth(sp.index);
                  }} style={{ width: '100%', padding: '10px', background: configStartMonth ? configuringService.color : theme.muted, color: '#fff', border: 'none', borderRadius: '4px', cursor: configStartMonth ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '13px', opacity: configStartMonth ? 1 : 0.5 }}>Add to Chart</button>
                </div>
              )}
              {/* Task config modal */}
              {configuringTask && (
                <div data-dropdown-menu onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '100%', left: '0', marginBottom: '4px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '380px', maxHeight: '480px', overflowY: 'auto', padding: '16px', zIndex: 110 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: configuringTask.color, fontSize: '14px', fontWeight: 700 }}>{configuringTask.name}</h4>
                      {configuringTask.category && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '3px', marginTop: '4px', display: 'inline-block', background: configuringTask.category === 'Traffic' ? 'rgba(54,162,235,0.15)' : configuringTask.category === 'Conversion' ? 'rgba(255,159,64,0.15)' : 'rgba(153,102,255,0.15)', color: configuringTask.category === 'Traffic' ? theme.chart2 : configuringTask.category === 'Conversion' ? theme.chart4 : theme.chart1 }}>{configuringTask.category}</span>}
                    </div>
                    <button onClick={() => { setConfiguringTask(null); setConfigKPIs({}); setConfigCosts([{ amount: '', frequency: 'one-time' }]); setConfigStartDay(''); }} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.textMuted, lineHeight: 1.4 }}>{configuringTask.taskDescription}</p>
                  {configuringTask.recommendation && <div style={{ background: theme.background, borderRadius: '4px', padding: '8px 10px', marginBottom: '12px', fontSize: '11px', color: theme.text, lineHeight: 1.4, borderLeft: `3px solid ${configuringTask.color}` }}>{configuringTask.recommendation}</div>}
                  {configuringTask.configurableKPIs?.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '8px' }}>Target KPIs</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: '6px', marginBottom: '6px' }}>
                        {['Metric','Current','Industry','Target'].map(h => <span key={h} style={{ fontSize: '10px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase', textAlign: h === 'Metric' ? 'left' : 'center' }}>{h}</span>)}
                      </div>
                      {configuringTask.configurableKPIs.map(kpi => {
                        const tv = configKPIs[kpi.key]?.target !== undefined ? configKPIs[kpi.key].target : kpi.industry;
                        return (
                          <div key={kpi.key} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: '6px', alignItems: 'center', padding: '6px 2px', borderBottom: `1px solid ${theme.border}` }}>
                            <span style={{ fontSize: '12px', color: theme.text, fontWeight: 500 }}>{kpi.label}</span>
                            <span style={{ fontSize: '12px', color: theme.muted, textAlign: 'center' }}>{kpi.current}{kpi.unit}</span>
                            <button onClick={() => setConfigKPIs(p => ({ ...p, [kpi.key]: { ...p[kpi.key], target: kpi.industry } }))} style={{ fontSize: '12px', color: tv === kpi.industry ? configuringTask.color : theme.chart2, background: tv === kpi.industry ? `${configuringTask.color}15` : 'transparent', border: `1px solid ${tv === kpi.industry ? configuringTask.color : 'transparent'}`, borderRadius: '3px', cursor: 'pointer', padding: '2px 4px', fontWeight: tv === kpi.industry ? 700 : 400, textAlign: 'center' }}>{kpi.industry}{kpi.unit}</button>
                            <input type="number" value={tv} onChange={(e) => setConfigKPIs(p => ({ ...p, [kpi.key]: { ...p[kpi.key], target: Number(e.target.value) } }))} style={{ width: '100%', padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '12px', background: theme.background, color: theme.text, textAlign: 'center', fontWeight: 600, outline: 'none' }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {(() => { const kpis = configuringTask.configurableKPIs || []; const bl = configuringTask.projectedLift || 0.05; let lm = 1; if (kpis.length > 0) { let tr = 0; kpis.forEach(k => { const t = configKPIs[k.key]?.target !== undefined ? configKPIs[k.key].target : k.industry; const r = k.industry > 0 ? t / k.industry : 1; tr += k.lowerIsBetter ? (2 - r) : r; }); lm = tr / kpis.length; } const el = bl * lm; const cr = data.find(d => d.index === currentMonthIndex)?.totalRevenue || 700000; return (
                    <div style={{ background: theme.background, borderRadius: '4px', padding: '10px', marginBottom: '14px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span style={{ color: theme.textMuted }}>Projected Revenue Lift:</span><span style={{ color: configuringTask.color, fontWeight: 700 }}>+{(el * 100).toFixed(1)}%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Est. Monthly Impact:</span><span style={{ color: theme.text, fontWeight: 700 }}>+{formatCurrency(Math.round(cr * el))}/mo</span></div>
                    </div>
                  ); })()}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '6px' }}>Costs</label>
                    {configCosts.map((cost, ci) => (
                      <div key={ci} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: theme.muted }}>$</span>
                        <input type="number" placeholder="0" value={cost.amount} onChange={(e) => { const c = [...configCosts]; c[ci] = { ...c[ci], amount: e.target.value }; setConfigCosts(c); }} style={{ width: '90px', padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '11px', background: theme.background, color: theme.text, textAlign: 'right' }} />
                        <select value={cost.frequency} onChange={(e) => { const c = [...configCosts]; c[ci] = { ...c[ci], frequency: e.target.value }; setConfigCosts(c); }} style={{ padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '11px', background: theme.background, color: theme.text, cursor: 'pointer' }}>
                          <option value="one-time">One-time</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        {configCosts.length > 1 && <button onClick={() => setConfigCosts(p => p.filter((_, i) => i !== ci))} style={{ background: 'transparent', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>}
                      </div>
                    ))}
                    <button onClick={() => setConfigCosts(p => [...p, { amount: '', frequency: 'one-time' }])} style={{ background: 'transparent', border: `1px dashed ${theme.border}`, borderRadius: '3px', padding: '3px 8px', fontSize: '10px', color: theme.primary, cursor: 'pointer', fontWeight: 600 }}>+ Add cost</button>
                    {configCosts.some(c => c.amount) && (() => {
                      const totalOneTime = configCosts.filter(c => c.frequency === 'one-time' && c.amount).reduce((s, c) => s + Number(c.amount), 0);
                      const totalMonthly = configCosts.filter(c => c.frequency === 'monthly' && c.amount).reduce((s, c) => s + Number(c.amount), 0);
                      return (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px' }}>
                          {totalOneTime > 0 && <span style={{ color: theme.textMuted }}>One-time: <span style={{ fontWeight: 700, color: theme.text }}>${totalOneTime.toLocaleString()}</span></span>}
                          {totalMonthly > 0 && <span style={{ color: theme.textMuted }}>Recurring: <span style={{ fontWeight: 700, color: theme.text }}>${Math.round(totalMonthly).toLocaleString()}/mo</span></span>}
                        </div>
                      );
                    })()}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: theme.muted, whiteSpace: 'nowrap' }}>Start:</span>
                      <input type="date" min="2026-02-13" max="2028-07-31" value={configStartMonth} onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }} onChange={(e) => setConfigStartMonth(e.target.value)} style={{ padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '11px', background: theme.background, color: theme.text, cursor: 'pointer', width: 'auto' }} />
                    </div>
                  </div>
                  <button disabled={!configStartMonth} onClick={() => {
                    const dt = new Date(configStartMonth + 'T00:00:00'); const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const monthLabel = `${ml[dt.getMonth()]} ${dt.getFullYear()}`; const sp = data.find(dp => dp.month === monthLabel); if (!sp) return;
                    const kpis = configuringTask.configurableKPIs || []; const bl = configuringTask.projectedLift || 0.05; let lm = 1;
                    if (kpis.length > 0) { let tr = 0; kpis.forEach(k => { const t = configKPIs[k.key]?.target !== undefined ? configKPIs[k.key].target : k.industry; const r = k.industry > 0 ? t / k.industry : 1; tr += k.lowerIsBetter ? (2 - r) : r; }); lm = tr / kpis.length; }
                    const displayDate = `${ml[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
                    const validCosts = configCosts.filter(c => c.amount && Number(c.amount) > 0).map(c => ({ amount: Number(c.amount), frequency: c.frequency }));
                    const hypo = { ...configuringTask, startMonthIndex: sp.index, startDate: displayDate, startMonthLabel: monthLabel, projectedLift: bl * lm, configuredKPIs: { ...configKPIs }, costs: validCosts };
                    setHypotheticalServices(p => [...p.filter(h => h.id !== configuringTask.id), hypo]);
                    if (configuringTask.configurableKPIs?.length > 0) {
                      serviceKPIs[configuringTask.id] = configuringTask.configurableKPIs.map((k, i) => ({ key: k.key, label: k.label, unit: k.unit === '$' ? '$' : k.unit === 'x' ? 'x' : '%', axis: k.unit === '$' ? 'left' : 'right', color: `rgba(${120 + i * 40}, ${100 + i * 30}, ${200 - i * 20}, 0.9)` }));
                    }
                    setVisibleKPIs({});
                    setConfiguringTask(null); setConfigKPIs({}); setConfigCosts([{ amount: '', frequency: 'one-time' }]); setConfigStartDay(''); setShowActualFees(false); setShowStandardFees(false);
                    setMilestoneDropdownOpen(false);
                    setSelectedTask(configuringTask); setSelectedMilestone(configuringTask); setSelectedCapability(null);
                    scrollToMonth(sp.index);
                  }} style={{ width: '100%', padding: '10px', background: configStartMonth ? configuringTask.color : theme.muted, color: '#fff', border: 'none', borderRadius: '4px', cursor: configStartMonth ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '13px', opacity: configStartMonth ? 1 : 0.5 }}>Add to Chart</button>
                </div>
              )}
              {/* Create Task modal */}
              {creatingTask && (
                <div data-dropdown-menu onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', width: '380px', minHeight: '480px', maxHeight: '520px', overflowY: 'auto', padding: '16px', zIndex: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, color: theme.text, fontSize: '14px', fontWeight: 700 }}>Add a New Task</h4>
                    <button onClick={() => { setCreatingTask(false); setNewTaskName(''); setNewTaskCategory(''); setConfigKPIs({}); setConfigCosts([{ amount: '', frequency: 'one-time' }]); setConfigStartMonth(''); }} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '6px' }}>Task Name</label>
                    <input type="text" placeholder="e.g. Landing Page Redesign" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '8px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.background, color: theme.text, outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '6px' }}>Task Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Traffic', 'Conversion', 'Retention'].map(cat => {
                        const catBg = cat === 'Traffic' ? 'rgba(54,162,235,0.15)' : cat === 'Conversion' ? 'rgba(255,159,64,0.15)' : 'rgba(153,102,255,0.15)';
                        const catColor = cat === 'Traffic' ? theme.chart2 : cat === 'Conversion' ? theme.chart4 : theme.chart1;
                        return <button key={cat} onClick={() => { setNewTaskCategory(cat); const ik = {}; (categoryKPIs[cat].configurableKPIs || []).forEach(k => { ik[k.key] = { target: k.industry }; }); setConfigKPIs(ik); }} style={{ padding: '6px 14px', borderRadius: '4px', border: `1px solid ${newTaskCategory === cat ? catColor : theme.border}`, background: newTaskCategory === cat ? catBg : 'transparent', color: newTaskCategory === cat ? catColor : theme.text, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{cat}</button>;
                      })}
                    </div>
                  </div>
                  {newTaskCategory && categoryKPIs[newTaskCategory] && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '8px' }}>Target KPIs</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: '6px', marginBottom: '6px' }}>
                        {['Metric','Current','Industry','Target'].map(h => <span key={h} style={{ fontSize: '10px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase', textAlign: h === 'Metric' ? 'left' : 'center' }}>{h}</span>)}
                      </div>
                      {categoryKPIs[newTaskCategory].configurableKPIs.map(kpi => {
                        const tv = configKPIs[kpi.key]?.target !== undefined ? configKPIs[kpi.key].target : kpi.industry;
                        const catColor = newTaskCategory === 'Traffic' ? theme.chart2 : newTaskCategory === 'Conversion' ? theme.chart4 : theme.chart1;
                        return (
                          <div key={kpi.key} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: '6px', alignItems: 'center', padding: '6px 2px', borderBottom: `1px solid ${theme.border}` }}>
                            <span style={{ fontSize: '12px', color: theme.text, fontWeight: 500 }}>{kpi.label}</span>
                            <span style={{ fontSize: '12px', color: theme.muted, textAlign: 'center' }}>{kpi.current}{kpi.unit}</span>
                            <button onClick={() => setConfigKPIs(p => ({ ...p, [kpi.key]: { ...p[kpi.key], target: kpi.industry } }))} style={{ fontSize: '12px', color: tv === kpi.industry ? catColor : theme.chart2, background: tv === kpi.industry ? `${catColor}15` : 'transparent', border: `1px solid ${tv === kpi.industry ? catColor : 'transparent'}`, borderRadius: '3px', cursor: 'pointer', padding: '2px 4px', fontWeight: tv === kpi.industry ? 700 : 400, textAlign: 'center' }}>{kpi.industry}{kpi.unit}</button>
                            <input type="number" value={tv} onChange={(e) => setConfigKPIs(p => ({ ...p, [kpi.key]: { ...p[kpi.key], target: Number(e.target.value) } }))} style={{ width: '100%', padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '12px', background: theme.background, color: theme.text, textAlign: 'center', fontWeight: 600, outline: 'none' }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {newTaskCategory && (() => { const kpis = categoryKPIs[newTaskCategory]?.configurableKPIs || []; const bl = 0.05; let lm = 1; if (kpis.length > 0) { let tr = 0; kpis.forEach(k => { const t = configKPIs[k.key]?.target !== undefined ? configKPIs[k.key].target : k.industry; const r = k.industry > 0 ? t / k.industry : 1; tr += k.lowerIsBetter ? (2 - r) : r; }); lm = tr / kpis.length; } const el = bl * lm; const cr = data.find(d => d.index === currentMonthIndex)?.totalRevenue || 700000; return (
                    <div style={{ background: theme.background, borderRadius: '4px', padding: '10px', marginBottom: '14px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span style={{ color: theme.textMuted }}>Projected Revenue Lift:</span><span style={{ color: newTaskCategory === 'Traffic' ? theme.chart2 : newTaskCategory === 'Conversion' ? theme.chart4 : theme.chart1, fontWeight: 700 }}>+{(el * 100).toFixed(1)}%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.textMuted }}>Est. Monthly Impact:</span><span style={{ color: theme.text, fontWeight: 700 }}>+{formatCurrency(Math.round(cr * el))}/mo</span></div>
                    </div>
                  ); })()}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: theme.muted, whiteSpace: 'nowrap' }}>Start:</span>
                      <input type="date" min="2026-02-13" max="2028-07-31" value={configStartMonth} onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }} onChange={(e) => setConfigStartMonth(e.target.value)} style={{ padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '11px', background: theme.background, color: theme.text, cursor: 'pointer', width: 'auto' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: theme.text, display: 'block', marginBottom: '6px' }}>Costs</label>
                    {configCosts.map((cost, ci) => (
                      <div key={ci} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: theme.muted }}>$</span>
                        <input type="number" placeholder="0" value={cost.amount} onChange={(e) => { const c = [...configCosts]; c[ci] = { ...c[ci], amount: e.target.value }; setConfigCosts(c); }} style={{ width: '90px', padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '11px', background: theme.background, color: theme.text, textAlign: 'right' }} />
                        <select value={cost.frequency} onChange={(e) => { const c = [...configCosts]; c[ci] = { ...c[ci], frequency: e.target.value }; setConfigCosts(c); }} style={{ padding: '4px 6px', border: `1px solid ${theme.border}`, borderRadius: '3px', fontSize: '11px', background: theme.background, color: theme.text, cursor: 'pointer' }}>
                          <option value="one-time">One-time</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        {configCosts.length > 1 && <button onClick={() => setConfigCosts(p => p.filter((_, i) => i !== ci))} style={{ background: 'transparent', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>}
                      </div>
                    ))}
                    <button onClick={() => setConfigCosts(p => [...p, { amount: '', frequency: 'one-time' }])} style={{ background: 'transparent', border: `1px dashed ${theme.border}`, borderRadius: '3px', padding: '3px 8px', fontSize: '10px', color: theme.primary, cursor: 'pointer', fontWeight: 600 }}>+ Add cost</button>
                    {configCosts.some(c => c.amount) && (() => {
                      const totalOneTime = configCosts.filter(c => c.frequency === 'one-time' && c.amount).reduce((s, c) => s + Number(c.amount), 0);
                      const totalMonthly = configCosts.filter(c => c.frequency === 'monthly' && c.amount).reduce((s, c) => s + Number(c.amount), 0);
                      return (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px' }}>
                          {totalOneTime > 0 && <span style={{ color: theme.textMuted }}>One-time: <span style={{ fontWeight: 700, color: theme.text }}>${totalOneTime.toLocaleString()}</span></span>}
                          {totalMonthly > 0 && <span style={{ color: theme.textMuted }}>Recurring: <span style={{ fontWeight: 700, color: theme.text }}>${Math.round(totalMonthly).toLocaleString()}/mo</span></span>}
                        </div>
                      );
                    })()}
                  </div>
                  <button disabled={!newTaskName || !newTaskCategory || !configStartMonth} onClick={() => {
                    const dt = new Date(configStartMonth + 'T00:00:00'); const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const monthLabel = `${ml[dt.getMonth()]} ${dt.getFullYear()}`; const sp = data.find(dp => dp.month === monthLabel); if (!sp) return;
                    const catColor = newTaskCategory === 'Traffic' ? theme.chart2 : newTaskCategory === 'Conversion' ? theme.chart4 : theme.chart1;
                    const kpis = categoryKPIs[newTaskCategory].configurableKPIs; const bl = 0.05; let lm = 1;
                    let tr = 0; kpis.forEach(k => { const t = configKPIs[k.key]?.target !== undefined ? configKPIs[k.key].target : k.industry; const r = k.industry > 0 ? t / k.industry : 1; tr += k.lowerIsBetter ? (2 - r) : r; }); lm = tr / kpis.length;
                    const displayDate = `${ml[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
                    const taskId = `custom_${Date.now()}`;
                    const newTask = { id: taskId, name: newTaskName, date: null, monthIndex: null, description: newTaskName, color: catColor, type: 'conversion_optimizer', completed: false, category: newTaskCategory, taskDescription: newTaskName, kpis: {}, projectedLift: bl * lm, configurableKPIs: kpis, startMonthIndex: sp.index, startDate: displayDate, startMonthLabel: monthLabel, configuredKPIs: { ...configKPIs }, costs: configCosts.filter(c => c.amount && Number(c.amount) > 0).map(c => ({ amount: Number(c.amount), frequency: c.frequency })) };
                    setHypotheticalServices(p => [...p, newTask]);
                    serviceKPIs[taskId] = categoryKPIs[newTaskCategory].serviceKPIs;
                    setVisibleKPIs({});
                    setCreatingTask(false); setNewTaskName(''); setNewTaskCategory(''); setConfigKPIs({}); setConfigCosts([{ amount: '', frequency: 'one-time' }]); setConfigStartMonth('');
                    setSelectedTask(newTask); setSelectedMilestone(newTask); setSelectedCapability(null);
                    scrollToMonth(sp.index);
                  }} style={{ width: '100%', padding: '10px', background: (newTaskName && newTaskCategory && configStartMonth) ? (newTaskCategory === 'Traffic' ? theme.chart2 : newTaskCategory === 'Conversion' ? theme.chart4 : theme.chart1) : theme.muted, color: '#fff', border: 'none', borderRadius: '4px', cursor: (newTaskName && newTaskCategory && configStartMonth) ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '13px', opacity: (newTaskName && newTaskCategory && configStartMonth) ? 1 : 0.5 }}>Add to Chart</button>
                </div>
              )}
            </div>


            {/* Timeline controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 auto', justifyContent: 'center', maxWidth: '440px' }}>
              <button onClick={() => panLeft(6)} disabled={!canGoLeft} style={{ width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${canGoLeft ? theme.border : 'transparent'}`, background: canGoLeft ? theme.surface : 'transparent', color: canGoLeft ? theme.text : theme.muted, cursor: canGoLeft ? 'pointer' : 'default', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canGoLeft ? 1 : 0.3 }}>◀</button>
              <div style={{ flex: '1 1 auto', position: 'relative', height: '24px', minWidth: '80px' }}>
                <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '4px', background: theme.border, borderRadius: '2px' }} />
                <div style={{ position: 'absolute', top: '8px', left: `${(visibleRangeStart / maxMonthIndex) * 100}%`, width: `${((visibleRangeEnd - visibleRangeStart) / maxMonthIndex) * 100}%`, height: '8px', background: theme.primary, borderRadius: '4px', transition: isDragging ? 'none' : 'left 0.3s, width 0.3s', opacity: 0.6 }} />
                {allMilestoneItems.map(m => <div key={m.id} style={{ position: 'absolute', top: '6px', left: `${(m.monthIndex / maxMonthIndex) * 100}%`, width: '3px', height: '12px', background: m.color, borderRadius: '2px', opacity: 0.7 }} />)}
              </div>
              <button onClick={() => panRight(6)} disabled={!canGoRight} style={{ width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${canGoRight ? theme.border : 'transparent'}`, background: canGoRight ? theme.surface : 'transparent', color: canGoRight ? theme.text : theme.muted, cursor: canGoRight ? 'pointer' : 'default', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canGoRight ? 1 : 0.3 }}>▶</button>
              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                <button onClick={zoomOut} style={{ width: '24px', height: '24px', borderRadius: '4px 0 0 4px', border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, cursor: 'pointer', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: visibleWindow < maxMonthIndex + 1 ? 1 : 0.3 }}>−</button>
                <button onClick={zoomIn} style={{ width: '24px', height: '24px', borderRadius: '0 4px 4px 0', border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, cursor: 'pointer', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: visibleWindow > 6 ? 1 : 0.3 }}>+</button>
              </div>
            </div>

            {/* Granularity toggle */}
            <div style={{ display: 'flex', gap: '0px', flexShrink: 0, border: `1px solid ${theme.border}`, borderRadius: '4px', overflow: 'hidden', marginLeft: '16px' }}>
              {[{ key: 'M', label: 'M' }, { key: 'Q', label: 'Q' }].map(g => (
                <button key={g.key} onClick={() => setTimeGranularity(g.key)} style={{
                  padding: '6px 12px', border: 'none', borderRight: g.key !== 'Q' ? `1px solid ${theme.border}` : 'none',
                  background: timeGranularity === g.key ? theme.primary : theme.surface,
                  color: timeGranularity === g.key ? '#fff' : theme.text,
                  cursor: 'pointer', fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px'
                }}>{g.label}</button>
              ))}
            </div>

            {/* Contributions/Adjust */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
              <button onClick={toggleContribution} style={{ ...btnStyle(showTodayBreakdown, showTodayBreakdown ? theme.primary : theme.border), background: showTodayBreakdown ? `${theme.primary}15` : theme.surface, minWidth: '130px', justifyContent: 'center' }}>{contributionButtonLabel}</button>
              {/* Goals */}
              <button onClick={(e) => { e.stopPropagation(); setShowGoalsPanel(p => !p); setGoalPlan(null); if (goalApplied) setGoalApplied(false); }} style={{ ...btnStyle(showGoalsPanel || goalApplied, goalApplied ? 'rgba(16,185,129,1)' : '#ec4899'), fontWeight: 700, color: showGoalsPanel ? '#ec4899' : goalApplied ? '#fff' : '#ec4899', background: showGoalsPanel ? '#ec489920' : goalApplied ? 'rgba(16,185,129,1)' : theme.surface, display: 'flex', alignItems: 'center', gap: '5px' }}>
                🎯 Goals {goalApplied && <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.3)', padding: '1px 5px', borderRadius: '8px', fontWeight: 700 }}>Active</span>}
              </button>
            </div>

            {/* Reset — right-aligned */}
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={() => { setSelectedCapability(null); setSelectedTask(null); setSelectedMilestone(null); setVisibleKPIs({}); setShowActualFees(true); setShowStandardFees(false); setShowMilestoneRevenue(false); setShowTodayBreakdown(false); setSelectedBreakdownChannel(null); setCapabilitiesDropdownOpen(false); setMilestoneDropdownOpen(false); setHypotheticalServices([]); setSelectedProjectedIdx(null); setShowCompareMode(false); setCompareFromIndex(null); setCompareToIndex(null); setCompareFromIndex2(null); setCompareToIndex2(null); setClickedLineData(null); setShowSummaryModal(false); setLineDropdownOpen(false); setShowContributionPanel(false); setShowKPIPanel(false); setKpiScenarioAdjustments({}); setShowFeePanel(false); setRevenueDrilldown(false); setShowChannelBar(true); setAdjustedBenchmarks({}); setChannelBenchmarks({ paidSocial: 22, paidSearch: 18, seo: 25, email: 20, affiliate: 10, other: 5 }); const h = Math.floor(visibleWindow / 2); const s = Math.max(0, currentMonthIndex - h); setVisibleRangeStart(s); setVisibleRangeEnd(Math.min(maxMonthIndex, s + visibleWindow - 1)); }} style={btnStyle(false, theme.border)}>Reset</button>
            </div>

          </div>
        </div>

        {/* Theme toggle + Config — bottom right below chart box */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
          <button onClick={() => setConfigOpen(true)} style={{ padding: '4px 12px', background: '#f0f0f0', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>⚙️ Config</button>
          <button
            onClick={() => setDarkMode(prev => !prev)}
            onMouseEnter={() => setThemeHover(true)}
            onMouseLeave={() => setThemeHover(false)}
            style={{
              width: '38px', height: '28px', borderRadius: '4px',
              border: `1.5px solid ${themeHover ? theme.primary : theme.toggleBorder}`,
              background: themeHover ? (darkMode ? theme.primary : theme.toggleHoverBg) : theme.toggleBg,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: themeHover ? `0 0 12px ${theme.glow.pink}` : 'none',
            }}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              /* Sun icon for dark mode */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeHover ? '#fff' : theme.toggleIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              /* Moon icon for light mode */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeHover ? theme.primary : theme.toggleIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
        </div>


      </div>

      {/* Summary Side Panel */}
      {/* Channel Contribution — right-side panel */}
      {showContributionPanel && <div onClick={() => setShowContributionPanel(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 299 }} />}
      {showContributionPanel && (() => {
        const currentData = data[currentMonthIndex];
        const totalRev = currentData?.totalRevenue || 1;
        const defaultBenchmarks = { paidSocial: 22, paidSearch: 18, seo: 25, email: 20, affiliate: 10, other: 5 };
        const allChannels = breakdownChannels.filter(c => c.capabilityId).map(c => {
          const rev = currentData?.[c.key] || 0;
          const pct = totalRev > 0 ? (rev / totalRev * 100) : 0;
          const bench = channelBenchmarks[c.key] ?? c.industryBenchmark;
          const cap = capabilities.find(cap => cap.id === c.capabilityId);
          const kpis = cap ? (serviceKPIs[cap.id] || []) : [];
          const allKPIs = kpis.map(kpi => {
            const val = currentData?.[kpi.key];
            const industry = cap?.kpis?.[kpi.key]?.industry;
            if (val == null || industry == null) return null;
            const lowerIsBetter = kpi.key === 'cpa' || kpi.key === 'bounceRate' || kpi.key === 'avgPosition' || kpi.key === 'commissionRate';
            const kpiGap = lowerIsBetter ? (val - industry) : (industry - val);
            return { ...kpi, current: val, industry, gap: kpiGap, lowerIsBetter, beating: kpiGap <= 0 };
          }).filter(Boolean);
          const belowBenchKPIs = allKPIs.filter(k => !k.beating);
          return { ...c, rev, pct, bench, gap: bench - pct, gapRev: Math.round(totalRev * Math.max(0, bench - pct) / 100), kpis: allKPIs, belowKpis: belowBenchKPIs, industryBench: c.industryBenchmark };
        });
        const totalOpp = allChannels.reduce((sum, c) => sum + c.gapRev, 0);
        const totalAnnualOpp = totalOpp * 12;
        const hasAdjustments = Object.keys(adjustedBenchmarks).length > 0;
        const fmtV = (v, unit) => { if (v == null) return '—'; if (unit === '$') return `$${Math.round(v).toLocaleString()}`; if (unit === '%') return `${Number(v).toFixed(1)}%`; if (unit === 'x') return `${Number(v).toFixed(1)}x`; return Math.round(v).toLocaleString(); };
        return (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', background: theme.surface, borderLeft: `1px solid ${theme.border}`, boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: theme.text }}>Channel Contribution</div>
                  <div style={{ fontSize: '11px', color: theme.muted, marginTop: '2px' }}>Adjust targets to model revenue opportunity</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasAdjustments && (
                    <button onClick={() => { setChannelBenchmarks(defaultBenchmarks); setAdjustedBenchmarks({}); }} style={{ padding: '4px 12px', background: 'transparent', border: `1px solid rgba(245,158,11,0.4)`, borderRadius: '4px', cursor: 'pointer', color: 'rgba(245,158,11,1)', fontSize: '11px', fontWeight: 600 }}>Reset All</button>
                  )}
                  <button onClick={() => setShowContributionPanel(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
                </div>
              </div>
              {/* Total opportunity summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: totalOpp > 0 ? 'rgba(245,158,11,0.06)' : 'rgba(34,197,94,0.06)', border: `1px solid ${totalOpp > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: '6px', marginTop: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: totalOpp > 0 ? 'rgba(245,158,11,0.9)' : 'rgba(34,197,94,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Portfolio Opportunity</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: theme.text }}>{formatCurrency(totalOpp)}<span style={{ fontSize: '11px', fontWeight: 500, color: theme.muted }}>/mo</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', color: theme.muted }}>Annual</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>{formatCurrency(totalAnnualOpp)}</div>
                </div>
              </div>
            </div>
            {/* Scrollable channel list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...allChannels].reverse().map(c => {
                  const isExpanded = expandedContributionChannel === c.key;
                  const isAdjusted = adjustedBenchmarks[c.key];
                  return (
                    <div key={c.key} style={{ background: theme.background, border: `1px solid ${isExpanded ? c.color + '40' : theme.border}`, borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                      {/* Channel header row */}
                      <div onClick={() => setExpandedContributionChannel(prev => prev === c.key ? null : c.key)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>{c.name}</span>
                            {isAdjusted && <span style={{ fontSize: '8px', fontWeight: 600, padding: '1px 5px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,0.9)' }}>Modified</span>}
                          </div>
                          {/* Compact progress bar */}
                          <div style={{ position: 'relative', height: '6px', background: `${theme.border}80`, borderRadius: '3px', marginTop: '4px' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${Math.min(100, c.pct / Math.max(c.bench, c.pct) * 100)}%`, background: c.gap > 1 ? c.color : 'rgba(34,197,94,0.8)', borderRadius: '3px', transition: 'width 0.2s' }} />
                            {c.gap > 1 && <div style={{ position: 'absolute', top: '-1px', left: `${Math.min(100, c.bench / Math.max(c.bench, c.pct) * 100)}%`, height: '8px', width: '2px', background: theme.text, borderRadius: '1px' }} />}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text }}>{c.pct.toFixed(0)}%<span style={{ fontSize: '10px', fontWeight: 500, color: theme.muted }}> / {c.bench}%</span></div>
                          {c.gap > 1 ? (
                            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(245,158,11,0.9)' }}>+{formatCurrency(c.gapRev)}/mo</div>
                          ) : (
                            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(34,197,94,0.8)' }}>✓ On track</div>
                          )}
                        </div>
                        <span style={{ fontSize: '10px', color: theme.muted, flexShrink: 0 }}>{isExpanded ? '▾' : '▸'}</span>
                      </div>
                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ padding: '0 12px 12px', borderTop: `1px solid ${theme.border}` }}>
                          {/* Slider */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0 8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: theme.muted, whiteSpace: 'nowrap' }}>Target</span>
                            <input type="range" min="0" max="50" step="1" value={c.bench} onChange={(e) => {
                              const val = Number(e.target.value);
                              setChannelBenchmarks(prev => ({ ...prev, [c.key]: val }));
                              setAdjustedBenchmarks(prev => ({ ...prev, [c.key]: true }));
                            }} style={{ flex: 1, cursor: 'pointer', accentColor: c.color }} />
                            <span style={{ fontSize: '16px', fontWeight: 700, color: theme.text, minWidth: '40px', textAlign: 'right' }}>{c.bench}%</span>
                            {c.bench !== c.industryBench && (
                              <button onClick={() => { setChannelBenchmarks(prev => ({ ...prev, [c.key]: c.industryBench })); const updated = { ...adjustedBenchmarks }; delete updated[c.key]; setAdjustedBenchmarks(updated); }} style={{ fontSize: '9px', padding: '2px 8px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '3px', cursor: 'pointer', color: theme.muted, whiteSpace: 'nowrap' }}>Reset to {c.industryBench}%</button>
                            )}
                          </div>
                          {/* Revenue numbers */}
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: theme.muted, marginBottom: c.kpis.length > 0 && c.gap > 1 ? '8px' : '0' }}>
                            <span>Current: <strong style={{ color: theme.text }}>{formatCurrency(c.rev)}</strong></span>
                            {c.gap > 1 && <span>Opportunity: <strong style={{ color: 'rgba(245,158,11,0.9)' }}>{formatCurrency(c.gapRev)}/mo</strong> ({formatCurrency(c.gapRev * 12)}/yr)</span>}
                          </div>
                          {/* KPIs — targets adapt dynamically with contribution slider */}
                          {c.kpis.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                              {(() => {
                                const scaleFactor = c.pct > 0 ? c.bench / c.pct : 1;
                                const needsImprovement = scaleFactor > 1.01;
                                return (<>
                                  <div style={{ fontSize: '9px', fontWeight: 700, color: needsImprovement ? 'rgba(245,158,11,0.9)' : theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    {needsImprovement ? `KPIs Needed for ${c.bench}%` : 'Current vs Industry'}
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {c.kpis.slice(0, 4).map(kpi => {
                                      const requiredVal = needsImprovement
                                        ? (kpi.lowerIsBetter ? kpi.current / scaleFactor : kpi.current * scaleFactor)
                                        : kpi.industry;
                                      const targetVal = kpi.unit === '$' ? Math.round(requiredVal) : kpi.unit === '%' ? Math.round(requiredVal * 10) / 10 : kpi.unit === 'x' ? Math.round(requiredVal * 10) / 10 : Math.round(requiredVal);
                                      const atOrBeating = needsImprovement ? false : kpi.beating;
                                      return (
                                        <div key={kpi.key} style={{ flex: '1 1 85px', padding: '4px 8px', background: theme.surface, borderRadius: '4px', border: `1px solid ${atOrBeating ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'}`, borderLeft: `3px solid ${atOrBeating ? 'rgba(34,197,94,0.5)' : 'rgba(245,158,11,0.5)'}` }}>
                                          <div style={{ fontSize: '8px', color: theme.muted }}>{kpi.label}</div>
                                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: theme.text }}>{fmtV(kpi.current, kpi.unit)}</span>
                                            <span style={{ fontSize: '9px', color: atOrBeating ? 'rgba(34,197,94,0.8)' : 'rgba(245,158,11,0.8)' }}>{atOrBeating ? '✓' : '→'}</span>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: needsImprovement ? 'rgba(245,158,11,1)' : atOrBeating ? 'rgba(34,197,94,0.8)' : theme.muted }}>{fmtV(targetVal, kpi.unit)}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>);
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Goals Panel ──────────────────────────────────────────── */}
      {showGoalsPanel && <div onClick={() => setShowGoalsPanel(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 299, background: 'rgba(0,0,0,0.15)' }} />}
      {showGoalsPanel && (() => {
        const currentData = data[currentMonthIndex];
        const currentTotal = currentData?.totalRevenue || 0;
        const fmtV = (v, unit) => {
          if (v == null || isNaN(v)) return '—';
          if (unit === '$') return `$${Math.round(v).toLocaleString()}`;
          if (unit === '%') return `${Number(v).toFixed(1)}%`;
          if (unit === 'x') return `${Number(v).toFixed(1)}x`;
          return Math.round(v).toLocaleString();
        };

        // Channel definitions with speed ranking (fastest → slowest to impact)
        const goalChannels = [
          { key: 'paidSocial', name: 'Paid Social', color: 'oklch(0.55 0.22 10)', speed: 1, speedLabel: 'Fastest', capId: 'retargeting', engaged: capabilities.find(c=>c.id==='paidSocial')?.engaged, currentRevKey: 'paidSocial',
            kpiTargets: [{ key: 'roas', label: 'ROAS', unit: 'x', current: currentData?.roas, industry: 2.8, topPerf: 5.5 }, { key: 'ctr', label: 'CTR', unit: '%', current: currentData?.ctr, industry: 1.9, topPerf: 4.8 }, { key: 'cpa', label: 'CPA', unit: '$', current: currentData?.cpa, industry: 62, topPerf: 35, lowerIsBetter: true }],
            tip: 'Scale ad spend and improve ROAS — immediate revenue response within days.' },
          { key: 'paidSearch', name: 'Paid Search', color: 'oklch(0.58 0.18 30)', speed: 1, speedLabel: 'Fast', capId: 'paidSearch', engaged: capabilities.find(c=>c.id==='paidSearch')?.engaged, currentRevKey: 'paidSearch',
            kpiTargets: [{ key: 'roas', label: 'ROAS', unit: 'x', current: currentData?.roas, industry: 3.2, topPerf: 6.0 }, { key: 'ctr', label: 'CTR', unit: '%', current: currentData?.ctr, industry: 2.5, topPerf: 4.8 }, { key: 'cpa', label: 'CPA', unit: '$', current: currentData?.cpa, industry: 52, topPerf: 28, lowerIsBetter: true }],
            tip: 'Expand keyword coverage and raise Quality Score — results typically within 2–4 weeks.' },
          { key: 'email', name: 'Email Marketing', color: 'oklch(0.56 0.16 40)', speed: 2, speedLabel: 'Fast', capId: 'email', engaged: capabilities.find(c=>c.id==='email')?.engaged, currentRevKey: 'email',
            kpiTargets: [{ key: 'emailROI', label: 'Email ROI', unit: 'x', current: currentData?.emailROI, industry: 35, topPerf: 55 }, { key: 'emailOpenRate', label: 'Open Rate', unit: '%', current: currentData?.emailOpenRate, industry: 22, topPerf: 32 }, { key: 'emailClickRate', label: 'Click Rate', unit: '%', current: currentData?.emailClickRate, industry: 3.2, topPerf: 5.5 }],
            tip: 'Launch flows or campaigns — email revenue impact lands within 2–6 weeks.' },
          { key: 'affiliate', name: 'Affiliate', color: 'oklch(0.50 0.20 355)', speed: 3, speedLabel: 'Medium', capId: 'affiliate', engaged: capabilities.find(c=>c.id==='affiliate')?.engaged, currentRevKey: 'affiliate',
            kpiTargets: [{ key: 'activePartners', label: 'Partners', unit: '', current: currentData?.activePartners, industry: 15, topPerf: 45 }, { key: 'avgPartnerRevenue', label: 'Rev/Partner', unit: '$', current: currentData?.avgPartnerRevenue, industry: 1500, topPerf: 4500 }, { key: 'commissionRate', label: 'Commission', unit: '%', current: currentData?.commissionRate, industry: 10, topPerf: 8.5, lowerIsBetter: true }],
            tip: 'Recruit new partners and activate existing ones — ramps over 1–3 months.' },
          { key: 'seo', name: 'SEO', color: 'oklch(0.52 0.18 25)', speed: 4, speedLabel: 'Slow', capId: 'seo', engaged: capabilities.find(c=>c.id==='seo')?.engaged, currentRevKey: 'seo',
            kpiTargets: [{ key: 'organicTraffic', label: 'Org. Traffic', unit: '', current: currentData?.organicTraffic, industry: 22000, topPerf: 52000 }, { key: 'organicConversionRate', label: 'Org. CVR', unit: '%', current: currentData?.organicConversionRate, industry: 2.2, topPerf: 4.0 }, { key: 'avgPosition', label: 'Avg Position', unit: '', current: currentData?.avgPosition, industry: 12, topPerf: 4.2, lowerIsBetter: true }],
            tip: 'Content and technical SEO investment — expect meaningful gains in 3–6 months.' },
        ];

        // Compute goal target revenue
        const computeGoalTotal = () => {
          if (goalMode === 'total') {
            return parseFloat(goalTotalRevenue?.replace(/[^0-9.]/g, '') || 0) || 0;
          } else {
            return Object.values(goalChannelValues).reduce((s, v) => s + (parseFloat(v?.replace(/[^0-9.]/g, '') || 0) || 0), 0) + (currentData?.other || 0);
          }
        };

        const goalTotal = computeGoalTotal();
        const gap = Math.max(0, goalTotal - currentTotal);
        const gapPct = currentTotal > 0 ? ((goalTotal - currentTotal) / currentTotal * 100) : 0;

        // Parse target date to get target month index
        const parseTargetMonthIndex = () => {
          if (!goalTargetDate) return null;
          const dt = new Date(goalTargetDate + 'T00:00:00');
          const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const label = `${ml[dt.getMonth()]} ${dt.getFullYear()}`;
          return data.findIndex(d => d.month === label);
        };
        const targetMonthIdx = parseTargetMonthIndex();
        const monthsToGoal = targetMonthIdx != null && targetMonthIdx > currentMonthIndex ? targetMonthIdx - currentMonthIndex : null;

        // Generate plan: allocate gap across channels fastest-first
        const generatePlan = () => {
          if (!goalTotal || goalTotal <= currentTotal) return null;
          const sortedChannels = [...goalChannels].sort((a, b) => a.speed - b.speed);
          let remainingGap = gap;
          const allocations = [];
          sortedChannels.forEach(ch => {
            if (remainingGap <= 0) return;
            const currentRev = currentData?.[ch.currentRevKey] || 0;
            let targetRev, channelGap;
            if (goalMode === 'channel') {
              const enteredGoal = parseFloat(goalChannelValues[ch.key]?.replace(/[^0-9.]/g, '') || 0) || 0;
              if (enteredGoal <= currentRev) return;
              channelGap = enteredGoal - currentRev;
              targetRev = enteredGoal;
            } else {
              // Allocate up to 35% of remaining gap to each channel, weighted by speed rank
              const speedWeights = { 1: 0.32, 2: 0.28, 3: 0.22, 4: 0.18 };
              const w = speedWeights[ch.speed] || 0.2;
              channelGap = Math.min(remainingGap, Math.round(gap * w));
              targetRev = currentRev + channelGap;
            }
            if (channelGap <= 0) return;
            remainingGap -= channelGap;
            const liftPct = currentTotal > 0 ? channelGap / currentTotal : 0;
            const scaleFactor = currentRev > 0 ? targetRev / currentRev : 1;
            // Compute needed KPI targets based on scaling
            const kpiNeeds = ch.kpiTargets.map(k => ({
              ...k,
              target: k.lowerIsBetter
                ? Math.max(k.topPerf, Math.round((k.current || k.industry) / scaleFactor * 10) / 10)
                : Math.min(k.topPerf, Math.round((k.current || k.industry) * scaleFactor * 10) / 10),
            }));
            allocations.push({ ...ch, currentRev, targetRev, channelGap, liftPct, kpiNeeds });
          });
          return { allocations, totalGap: gap, coveredGap: gap - Math.max(0, remainingGap), uncoveredGap: Math.max(0, remainingGap) };
        };

        const plan = goalPlan;

        // Apply plan to chart
        const applyPlanToChart = () => {
          if (!plan || !targetMonthIdx || targetMonthIdx <= currentMonthIndex) return;
          const newHypos = plan.allocations.map(alloc => {
            const capMatch = capabilities.find(c => c.id === alloc.key || c.id === alloc.capId);
            const existingHypo = hypotheticalServices.find(h => h.id === `goal_${alloc.key}`);
            return {
              id: `goal_${alloc.key}`,
              name: `${alloc.name} Goal`,
              color: alloc.color,
              type: 'direct_revenue',
              revenueMetric: alloc.currentRevKey,
              projectedLift: alloc.liftPct,
              startMonthIndex: currentMonthIndex + 1,
              startDate: MONTHS[currentMonthIndex + 1] || '',
              startMonthLabel: MONTHS[currentMonthIndex + 1] || '',
              engaged: false,
              configurableKPIs: alloc.kpiNeeds.map(k => ({ key: k.key, label: k.label, unit: k.unit, current: k.current, industry: k.target, description: k.label })),
              configuredKPIs: alloc.kpiNeeds.reduce((acc, k) => ({ ...acc, [k.key]: { target: k.target } }), {}),
              isGoalPlan: true,
            };
          });
          // Remove previous goal entries and add new ones
          setHypotheticalServices(prev => [...prev.filter(h => !h.isGoalPlan), ...newHypos]);
          setGoalApplied(true);
          setShowGoalsPanel(false);
          // Turn on breakdown to visualize
          setShowTodayBreakdown(true);
        };

        const clearGoalPlan = () => {
          setHypotheticalServices(prev => prev.filter(h => !h.isGoalPlan));
          setGoalApplied(false);
          setGoalPlan(null);
          setGoalTotalRevenue('');
          setGoalTargetDate('');
          setGoalChannelValues({ paidSocial: '', paidSearch: '', seo: '', email: '', affiliate: '' });
        };

        const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${theme.border}`, borderRadius: '6px', fontSize: '13px', background: theme.background, color: theme.text, outline: 'none', boxSizing: 'border-box' };
        const sectionLabel = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: theme.muted, marginBottom: '6px', display: 'block' };

        return (
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', background: theme.surface, borderLeft: `3px solid #ec4899`, boxShadow: '-8px 0 40px rgba(236,72,153,0.12)', zIndex: 300, display: 'flex', flexDirection: 'column', fontFamily: 'Outfit, sans-serif' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ec4899', letterSpacing: '-0.3px' }}>🎯 Revenue Goals</div>
                  <div style={{ fontSize: '11px', color: theme.muted, marginTop: '2px' }}>Set a target and get a data-driven plan</div>
                </div>
                <button onClick={() => setShowGoalsPanel(false)} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1, marginTop: '2px' }}>×</button>
              </div>
              {/* Current Revenue summary */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <div style={{ flex: 1, padding: '10px 12px', background: `${theme.primary}10`, border: `1px solid ${theme.primary}25`, borderRadius: '8px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: theme.primary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Revenue</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: theme.text, marginTop: '2px' }}>{formatCurrency(currentTotal)}</div>
                  <div style={{ fontSize: '10px', color: theme.muted }}>{MONTHS[currentMonthIndex]}</div>
                </div>
                {goalTotal > currentTotal && (
                  <div style={{ flex: 1, padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(16,185,129,1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Goal Revenue</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: theme.text, marginTop: '2px' }}>{formatCurrency(goalTotal)}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(16,185,129,0.8)', fontWeight: 600 }}>+{formatCurrency(gap)} gap (+{gapPct.toFixed(1)}%)</div>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

              {/* Goal Input Mode Toggle */}
              <div style={{ marginBottom: '18px' }}>
                <span style={sectionLabel}>Goal Type</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[{ id: 'total', label: '📊 Total Revenue' }, { id: 'channel', label: '📡 By Channel' }].map(m => (
                    <button key={m.id} onClick={() => { setGoalMode(m.id); setGoalPlan(null); }} style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${goalMode === m.id ? '#ec4899' : theme.border}`, background: goalMode === m.id ? '#ec489915' : 'transparent', color: goalMode === m.id ? '#ec4899' : theme.textMuted, fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>{m.label}</button>
                  ))}
                </div>
              </div>

              {/* Total Revenue Goal Input */}
              {goalMode === 'total' && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={sectionLabel}>Target Monthly Revenue</span>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: theme.muted, fontWeight: 700 }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g. 1,200,000"
                      value={goalTotalRevenue}
                      onChange={(e) => { setGoalTotalRevenue(e.target.value); setGoalPlan(null); }}
                      style={{ ...inputStyle, paddingLeft: '24px' }}
                    />
                  </div>
                  {goalTotal > 0 && goalTotal <= currentTotal && (
                    <div style={{ fontSize: '11px', color: 'rgba(239,68,68,0.9)', marginTop: '4px', fontWeight: 600 }}>⚠ Goal must be higher than current revenue</div>
                  )}
                </div>
              )}

              {/* Per-Channel Revenue Goal Inputs */}
              {goalMode === 'channel' && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={sectionLabel}>Target Revenue by Channel</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {goalChannels.map(ch => {
                      const curRev = currentData?.[ch.currentRevKey] || 0;
                      const entered = parseFloat(goalChannelValues[ch.key]?.replace(/[^0-9.]/g, '') || 0) || 0;
                      const chGap = entered - curRev;
                      return (
                        <div key={ch.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: theme.background, borderRadius: '6px', border: `1px solid ${chGap > 0 ? ch.color + '40' : theme.border}` }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ch.color, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: theme.text }}>{ch.name}</div>
                            <div style={{ fontSize: '10px', color: theme.muted }}>Now: {formatCurrency(curRev)}</div>
                          </div>
                          <div style={{ position: 'relative', width: '130px' }}>
                            <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: theme.muted, fontWeight: 700, pointerEvents: 'none' }}>$</span>
                            <input
                              type="text"
                              placeholder={Math.round(curRev).toLocaleString()}
                              value={goalChannelValues[ch.key]}
                              onChange={(e) => { setGoalChannelValues(p => ({ ...p, [ch.key]: e.target.value })); setGoalPlan(null); }}
                              style={{ width: '100%', padding: '6px 8px 6px 20px', border: `1px solid ${chGap > 0 ? ch.color : theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.surface, color: theme.text, outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          {chGap > 0 && <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(16,185,129,1)', whiteSpace: 'nowrap' }}>+{formatCurrency(chGap)}</div>}
                        </div>
                      );
                    })}
                    {/* Other/Direct — display only */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: theme.background, borderRadius: '6px', border: `1px solid ${theme.border}`, opacity: 0.7 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(0.58 0.10 20)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}><div style={{ fontSize: '11px', fontWeight: 700, color: theme.text }}>Other / Direct</div><div style={{ fontSize: '10px', color: theme.muted }}>Not adjustable</div></div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: theme.muted }}>{formatCurrency(currentData?.other || 0)}</div>
                    </div>
                  </div>
                  {goalTotal > 0 && <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '8px', padding: '6px 10px', background: theme.background, borderRadius: '4px' }}>Combined Goal Total: <strong style={{ color: theme.text }}>{formatCurrency(goalTotal)}</strong> {goalTotal > currentTotal ? <span style={{ color: 'rgba(16,185,129,1)', fontWeight: 600 }}>(+{formatCurrency(gap)})</span> : <span style={{ color: 'rgba(239,68,68,0.9)', fontWeight: 600 }}>↓ below current</span>}</div>}
                </div>
              )}

              {/* Target Date */}
              <div style={{ marginBottom: '20px' }}>
                <span style={sectionLabel}>Target Date to Achieve Goal</span>
                <input
                  type="month"
                  min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 2).padStart(2,'0')}`}
                  max="2028-07"
                  value={goalTargetDate}
                  onChange={(e) => { setGoalTargetDate(e.target.value); setGoalPlan(null); }}
                  style={{ ...inputStyle, cursor: 'pointer', colorScheme: darkMode ? 'dark' : 'light' }}
                />
                {monthsToGoal != null && <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>📅 {monthsToGoal} month{monthsToGoal !== 1 ? 's' : ''} to reach goal</div>}
              </div>

              {/* Generate Plan button */}
              {goalTotal > currentTotal && goalTargetDate && !plan && (
                <button onClick={() => setGoalPlan(generatePlan())} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ec4899, #be185d)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.3px', boxShadow: '0 4px 16px rgba(236,72,153,0.3)', marginBottom: '16px' }}>
                  ✨ Generate Growth Plan
                </button>
              )}

              {/* ── Plan Results ── */}
              {plan && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: theme.text }}>Your Growth Plan</div>
                    <div style={{ flex: 1, height: '1px', background: theme.border }} />
                    <button onClick={() => setGoalPlan(null)} style={{ background: 'transparent', border: 'none', fontSize: '11px', color: theme.muted, cursor: 'pointer', padding: 0, fontWeight: 600 }}>Edit ✎</button>
                  </div>

                  {/* Gap Summary */}
                  <div style={{ padding: '12px', background: `rgba(236,72,153,0.06)`, border: '1px solid rgba(236,72,153,0.2)', borderRadius: '8px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: theme.text }}>Revenue Gap</span>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#ec4899' }}>+{formatCurrency(gap)}/mo</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                      <span style={{ color: theme.muted }}>Covered by plan: <strong style={{ color: 'rgba(16,185,129,1)' }}>{formatCurrency(plan.coveredGap)}</strong></span>
                      {plan.uncoveredGap > 5000 && <span style={{ color: theme.muted }}>Remaining: <strong style={{ color: 'rgba(245,158,11,1)' }}>{formatCurrency(plan.uncoveredGap)}</strong></span>}
                    </div>
                    {monthsToGoal && <div style={{ height: '4px', background: theme.border, borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(100, plan.coveredGap / plan.totalGap * 100)}%`, background: 'linear-gradient(90deg, #ec4899, #10b981)', borderRadius: '2px', transition: 'width 0.4s' }} /></div>}
                  </div>

                  {/* Channel Allocations — fastest first */}
                  <div style={{ fontSize: '10px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Recommended Channel Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {plan.allocations.map((alloc, i) => (
                      <div key={alloc.key} style={{ padding: '12px 14px', background: theme.background, borderRadius: '8px', borderLeft: `3px solid ${alloc.color}`, border: `1px solid ${alloc.color}30`, borderLeftWidth: '3px' }}>
                        {/* Channel header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: alloc.color }}>{alloc.name}</span>
                            <span style={{ fontSize: '8px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: alloc.speed <= 1 ? 'rgba(16,185,129,0.12)' : alloc.speed === 2 ? 'rgba(59,130,246,0.12)' : alloc.speed === 3 ? 'rgba(245,158,11,0.12)' : 'rgba(156,163,175,0.15)', color: alloc.speed <= 1 ? 'rgba(16,185,129,1)' : alloc.speed === 2 ? 'rgba(59,130,246,1)' : alloc.speed === 3 ? 'rgba(245,158,11,1)' : theme.muted }}>⚡ {alloc.speedLabel}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(16,185,129,1)' }}>+{formatCurrency(alloc.channelGap)}/mo</div>
                            <div style={{ fontSize: '10px', color: theme.muted }}>{formatCurrency(alloc.currentRev)} → {formatCurrency(alloc.targetRev)}</div>
                          </div>
                        </div>
                        {/* Tip */}
                        <div style={{ fontSize: '10px', color: theme.textMuted, lineHeight: '1.4', marginBottom: '8px' }}>{alloc.tip}</div>
                        {/* KPI targets */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {alloc.kpiNeeds.map(kpi => {
                            const changed = kpi.target !== kpi.current;
                            return (
                              <div key={kpi.key} style={{ padding: '4px 8px', background: theme.surface, borderRadius: '5px', border: `1px solid ${changed ? alloc.color + '40' : theme.border}` }}>
                                <div style={{ fontSize: '8px', color: theme.muted, fontWeight: 600 }}>{kpi.label}</div>
                                <div style={{ fontSize: '11px', fontWeight: 700 }}>
                                  <span style={{ color: theme.muted }}>{fmtV(kpi.current, kpi.unit)}</span>
                                  {changed && <><span style={{ color: theme.muted }}> → </span><span style={{ color: alloc.color }}>{fmtV(kpi.target, kpi.unit)}</span></>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Uncovered gap note */}
                  {plan.uncoveredGap > 10000 && (
                    <div style={{ padding: '10px 12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', fontSize: '11px', color: theme.textMuted, marginBottom: '14px', lineHeight: '1.5' }}>
                      💡 <strong style={{ color: 'rgba(245,158,11,1)' }}>{formatCurrency(plan.uncoveredGap)}</strong> of the gap isn't covered by current channels. Consider adding <strong>SMS Marketing</strong>, <strong>Influencer Partnerships</strong>, or <strong>Amazon Ads</strong> from Recommendations.
                    </div>
                  )}

                  {/* Apply to Chart */}
                  {targetMonthIdx && targetMonthIdx > currentMonthIndex ? (
                    <button onClick={applyPlanToChart} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.25)', marginBottom: '8px', letterSpacing: '0.3px' }}>
                      📈 Apply Plan to Chart
                    </button>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'rgba(245,158,11,1)', fontWeight: 600, padding: '8px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: '6px', marginBottom: '8px' }}>⚠ Set a future target date to apply this plan to the chart.</div>
                  )}
                  <div style={{ fontSize: '10px', color: theme.muted, textAlign: 'center', lineHeight: '1.4' }}>This will add projected channel bands to the chart matching your goal trajectory.</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: `1px solid ${theme.border}`, flexShrink: 0, display: 'flex', gap: '10px' }}>
              {goalApplied && (
                <button onClick={clearGoalPlan} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '6px', color: 'rgba(239,68,68,0.8)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>✕ Clear Goal Plan</button>
              )}
              <button onClick={() => setShowGoalsPanel(false)} style={{ flex: 1, padding: '10px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.text, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        );
      })()}

      {/* Fee Detail Panel — right-side panel triggered by clicking Agency Fees data points */}
      {showFeePanel && <div onClick={() => setShowFeePanel(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 299 }} />}
      {showFeePanel && (() => {
        const monthData = data.find(d => d.month === feePanelMonth) || data[currentMonthIndex];
        const idx = monthData?.index ?? currentMonthIndex;
        const totalRev = monthData?.totalRevenue || 1;
        const actualFees = monthData?.actualFees || 0;
        const feeRate = totalRev > 0 ? (actualFees / totalRev * 100) : 15;
        const projData = projectedData?.find(d => d.month === feePanelMonth);
        const projFees = projData?.projectedFees;
        const hasProjected = projFees != null && hypotheticalServices.length > 0;
        // Fee type breakdown percentages — per channel overrides
        const defaultFeeTypes = [
          { label: 'Management', pct: 0.55 },
          { label: '% of Media Spend', pct: 0.45 },
        ];
        const channelFeeTypes = {
          paidSocial: defaultFeeTypes,
          paidSearch: defaultFeeTypes,
          seo: [{ label: 'Management', pct: 1.0 }],
          email: [{ label: 'Management', pct: 1.0 }],
          affiliate: [{ label: 'Management', pct: 0.55 }, { label: '% of Affiliate Sales', pct: 0.45 }],
        };
        // Fee by channel with nested types
        const channelFeesList = breakdownChannels.filter(c => c.capabilityId && c.key !== 'other').map(ch => {
          const chRev = monthData?.[ch.key] || 0;
          const chPct = totalRev > 0 ? chRev / totalRev : 0;
          const chFee = Math.round(actualFees * chPct);
          const projChFee = hasProjected ? Math.round(projFees * chPct) : null;
          const feeTypes = channelFeeTypes[ch.key] || defaultFeeTypes;
          const types = feeTypes.map(ft => ({ label: ft.label, fee: Math.round(chFee * ft.pct), projFee: hasProjected && projChFee ? Math.round(projChFee * ft.pct) : null }));
          return { ...ch, rev: chRev, fee: chFee, projFee: projChFee, types };
        }).filter(c => c.rev > 0);
        const channelFees = channelFeesList;
        // Task costs — from both completed tasks and hypothetical services
        const completedTaskCosts = tasks.filter(t => t.costs?.length > 0).map(t => {
          let total = 0;
          t.costs.forEach(c => {
            if (c.monthIndex === idx) total += c.amount;
          });
          if (total === 0) return null;
          return { name: t.name, color: t.color || theme.chart5, total, detail: t.costs.filter(c => c.monthIndex === idx).map(c => ({ amount: c.amount, label: 'One-time' })) };
        }).filter(Boolean);
        const hypoTaskCosts = hypotheticalServices.filter(h => h.costs?.length > 0 && idx >= (h.startMonthIndex ?? Infinity)).map(h => {
          let monthly = 0, oneTime = 0;
          h.costs.forEach(c => {
            if (c.frequency === 'monthly') monthly += c.amount;
            else if (c.frequency === 'one-time' && idx === h.startMonthIndex) oneTime += c.amount;
          });
          const total = monthly + oneTime;
          if (total === 0) return null;
          return { name: h.name, color: h.color || theme.chart5, monthly, oneTime, total };
        }).filter(Boolean);
        const taskCosts = [...completedTaskCosts, ...hypoTaskCosts];
        const totalTaskCosts = taskCosts.reduce((s, t) => s + t.total, 0);
        return (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', background: theme.surface, borderLeft: `1px solid ${theme.border}`, boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: theme.chart2 }}>Agency Fee Breakdown</div>
                  <div style={{ fontSize: '11px', color: theme.muted, marginTop: '2px' }}>{feePanelMonth} · Rate: {feeRate.toFixed(1)}%</div>
                </div>
                <button onClick={() => setShowFeePanel(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <div style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', background: `${theme.chart2}10`, border: `1px solid ${theme.chart2}30` }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actual Fees</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: theme.text }}>{formatCurrency(actualFees)}</div>
                  <div style={{ fontSize: '10px', color: theme.muted }}>on {formatCurrency(totalRev)} revenue</div>
                </div>
                {hasProjected && (
                  <div style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projected Fees</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: theme.text }}>{formatCurrency(projFees)}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(239,68,68,0.8)' }}>+{formatCurrency(projFees - actualFees)} from new services</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {/* Fee by Channel with nested types */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>By Channel</div>
                {channelFees.map(ch => (
                  <div key={ch.key} style={{ marginBottom: '12px', padding: '10px 12px', background: theme.background, borderRadius: '6px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: ch.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: theme.text }}>{ch.name}</div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>{formatCurrency(ch.fee)}</span>
                        {hasProjected && ch.projFee != null && ch.projFee !== ch.fee && (
                          <span style={{ fontSize: '11px', color: 'rgba(239,68,68,0.8)', marginLeft: '6px' }}>→ {formatCurrency(ch.projFee)}</span>
                        )}
                      </div>
                    </div>
                    {ch.types.map((ft, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0 3px 18px', fontSize: '11px' }}>
                        <span style={{ color: theme.muted }}>{ft.label}</span>
                        <span style={{ color: theme.text, fontWeight: 500 }}>
                          {formatCurrency(ft.fee)}
                          {hasProjected && ft.projFee != null && ft.projFee !== ft.fee && (
                            <span style={{ color: 'rgba(239,68,68,0.7)', marginLeft: '4px' }}>→ {formatCurrency(ft.projFee)}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {/* Task Costs */}
              {taskCosts.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Task Costs</div>
                  {taskCosts.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>{t.name}</div>
                        <div style={{ fontSize: '10px', color: theme.muted }}>
                          {t.monthly > 0 && <span>{formatCurrency(t.monthly)}/mo</span>}
                          {t.monthly > 0 && t.oneTime > 0 && <span> + </span>}
                          {t.oneTime > 0 && <span>{formatCurrency(t.oneTime)} one-time</span>}
                          {!t.monthly && !t.oneTime && <span>{formatCurrency(t.total)} one-time</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text }}>{formatCurrency(t.total)}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '12px', fontWeight: 700 }}>
                    <span style={{ color: theme.muted }}>Total Task Costs</span>
                    <span style={{ color: theme.text }}>{formatCurrency(totalTaskCosts)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* KPI Detail Panel — right-side panel triggered by clicking KPI data points */}
      {showKPIPanel && <div onClick={() => setShowKPIPanel(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 299 }} />}
      {showKPIPanel && selectedMilestone && (() => {
        const cap = capabilities.find(c => c.id === selectedMilestone.id) || selectedMilestone;
        const kpis = serviceKPIs[selectedMilestone.id] || [];
        const monthData = data.find(d => d.month === kpiPanelMonth) || data[currentMonthIndex];
        const fmtV = (v, unit) => { if (v == null) return '—'; if (unit === '$') return `$${Math.round(v).toLocaleString()}`; if (unit === '%') return `${Number(v).toFixed(1)}%`; if (unit === 'x') return `${Number(v).toFixed(1)}x`; if (unit === 's') return `${Number(v).toFixed(1)}s`; return Math.round(v).toLocaleString(); };
        const capKpis = cap?.kpis || {};
        return (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: theme.surface, borderLeft: `1px solid ${theme.border}`, boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: cap.color || theme.primary }}>{cap.name || 'KPI Detail'}</div>
                  <div style={{ fontSize: '11px', color: theme.muted, marginTop: '2px' }}>{kpiPanelMonth || monthData?.month}</div>
                </div>
                <button onClick={() => setShowKPIPanel(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {/* Scenario impact summary */}
              {Object.keys(kpiScenarioAdjustments).length > 0 && (() => {
                const clickedMd = kpiPanelMonth ? data.find(d => d.month === kpiPanelMonth) : null;
                const startIdx = clickedMd ? clickedMd.index : currentMonthIndex;
                const targetIdx = Math.min(startIdx + 3, data.length - 1);
                const currentRev = data[startIdx]?.totalRevenue || 0;
                const scenarioRev = scenarioData ? (scenarioData.find(d => d.index === targetIdx)?.scenarioRevenue || currentRev) : currentRev;
                const liftPct = currentRev > 0 ? ((scenarioRev - currentRev) / currentRev * 100) : 0;
                const liftAmt = scenarioRev - currentRev;
                return (
                  <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(245,158,11,1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projected Revenue Impact</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: theme.text, marginTop: '2px' }}>{liftPct >= 0 ? '+' : ''}{liftPct.toFixed(1)}% <span style={{ fontSize: '12px', fontWeight: 500, color: theme.muted }}>({liftAmt >= 0 ? '+' : ''}{formatCurrency(Math.abs(liftAmt))}/mo)</span></div>
                      </div>
                      <button onClick={() => setKpiScenarioAdjustments({})} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 600, color: 'rgba(245,158,11,1)' }}>Clear All</button>
                    </div>
                  </div>
                );
              })()}
              {kpis.length === 0 && <div style={{ fontSize: '13px', color: theme.muted, textAlign: 'center', padding: '24px 0' }}>No KPIs available for this milestone.</div>}
              {kpis.map(kpi => {
                const currentVal = monthData?.[kpi.key];
                const kpiMeta = capKpis[kpi.key] || {};
                const industry = kpiMeta.industry;
                const acadacaAvg = kpiMeta.acadacaAvg;
                const topPerformers = kpiMeta.topPerformers;
                const lowerIsBetter = kpi.key === 'cpa' || kpi.key === 'bounceRate' || kpi.key === 'avgPosition' || kpi.key === 'commissionRate';
                const beatsIndustry = industry != null && currentVal != null ? (lowerIsBetter ? currentVal <= industry : currentVal >= industry) : null;
                const beatsAcadaca = acadacaAvg != null && currentVal != null ? (lowerIsBetter ? currentVal <= acadacaAvg : currentVal >= acadacaAvg) : null;
                const scenarioVal = kpiScenarioAdjustments[kpi.key];
                const hasAdjustment = scenarioVal != null;
                const sliderMin = currentVal != null ? (lowerIsBetter ? currentVal * 0.3 : currentVal * 0.5) : 0;
                const sliderMax = topPerformers || (currentVal != null ? (lowerIsBetter ? currentVal * 1.5 : currentVal * 2.5) : 100);
                const displayScenarioVal = hasAdjustment ? scenarioVal : currentVal;
                const scenarioChangePct = hasAdjustment && currentVal ? ((scenarioVal - currentVal) / Math.abs(currentVal) * 100) : null;
                return (
                  <div key={kpi.key} style={{ marginBottom: '16px', padding: '14px', background: hasAdjustment ? 'rgba(245,158,11,0.04)' : theme.background, borderRadius: '8px', border: `1px solid ${hasAdjustment ? 'rgba(245,158,11,0.3)' : theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: kpi.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>{kpi.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        {hasAdjustment && <span style={{ fontSize: '12px', color: theme.muted, textDecoration: 'line-through' }}>{fmtV(currentVal, kpi.unit)}</span>}
                        <span style={{ fontSize: '18px', fontWeight: 700, color: hasAdjustment ? 'rgba(245,158,11,1)' : theme.text }}>{fmtV(displayScenarioVal, kpi.unit)}</span>
                        {scenarioChangePct != null && <span style={{ fontSize: '10px', fontWeight: 600, color: (lowerIsBetter ? scenarioChangePct < 0 : scenarioChangePct > 0) ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)' }}>{scenarioChangePct >= 0 ? '+' : ''}{scenarioChangePct.toFixed(1)}%</span>}
                      </div>
                    </div>
                    {/* Scenario slider */}
                    <div style={{ marginBottom: '10px', padding: '6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        
                        <input type="range" min={sliderMin} max={sliderMax} step={kpi.unit === '$' ? 1 : kpi.unit === '%' ? 0.1 : kpi.unit === 'x' ? 0.1 : 1} value={displayScenarioVal || 0} onChange={(e) => { const v = parseFloat(e.target.value); setKpiScenarioAdjustments(prev => ({ ...prev, [kpi.key]: v })); }} style={{ flex: 1, accentColor: 'rgba(245,158,11,1)', cursor: 'pointer' }} />
                        {hasAdjustment && <button onClick={() => { setKpiScenarioAdjustments(prev => { const next = { ...prev }; delete next[kpi.key]; return next; }); }} style={{ padding: '1px 6px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '3px', cursor: 'pointer', fontSize: '9px', color: theme.muted }}>×</button>}
                      </div>

                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {industry != null && (
                        <div style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', background: beatsIndustry ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${beatsIndustry ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                          <div style={{ fontSize: '9px', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Industry</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>{fmtV(industry, kpi.unit)}</div>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: beatsIndustry ? 'rgba(34,197,94,0.9)' : 'rgba(245,158,11,0.9)', marginTop: '2px' }}>{beatsIndustry ? '✓ Beating' : '↗ Below'}</div>
                        </div>
                      )}


                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Compare Periods — right-side panel */}
      {showCompareMode && selectedBreakdownChannel && (() => {
        const isRevenueCompare = selectedBreakdownChannel === 'totalRevenue';
        const ch = isRevenueCompare ? { key: 'totalRevenue', name: 'Total Revenue', color: theme.primary } : breakdownChannels.find(c => c.key === selectedBreakdownChannel);
        if (!ch) return null;
        const cap = isRevenueCompare ? null : (ch.capabilityId ? capabilities.find(c => c.id === ch.capabilityId) : null);
        const kpis = isRevenueCompare ? (serviceKPIs['overall'] || []) : (cap ? (serviceKPIs[cap.id] || []) : []);
        const fmtV = (v, unit) => { if (v == null) return '—'; if (unit === '$') return `$${Math.round(v).toLocaleString()}`; if (unit === '%') return `${Number(v).toFixed(1)}%`; if (unit === 'x') return `${Number(v).toFixed(1)}x`; return Math.round(v).toLocaleString(); };
        const aggregateRange = (startIdx, endIdx) => {
          const s = Math.min(startIdx, endIdx); const e = Math.max(startIdx, endIdx);
          const slice = data.filter(d => d.index >= s && d.index <= e);
          if (slice.length === 0) return null;
          const result = { _count: slice.length, _label: slice.length === 1 ? MONTHS[s] : `${MONTHS[s]} – ${MONTHS[e]}` };
          [ch.key, 'totalRevenue'].forEach(k => { result[k] = slice.reduce((sum, d) => sum + (d[k] || 0), 0); });
          kpis.map(k => k.key).forEach(k => { const vals = slice.filter(d => d[k] != null); result[k] = vals.length > 0 ? vals.reduce((sum, d) => sum + d[k], 0) / vals.length : null; });
          return result;
        };
        const periodA = aggregateRange(compareFromIndex ?? 0, compareToIndex ?? 0);
        const periodB = aggregateRange(compareFromIndex2 ?? currentMonthIndex, compareToIndex2 ?? currentMonthIndex);
        const revA = periodA?.[ch.key] || 0;
        const revB = periodB?.[ch.key] || 0;
        const revGrowth = revA > 0 ? ((revB - revA) / revA * 100) : 0;
        return (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', background: theme.surface, borderLeft: `1px solid ${theme.border}`, boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: ch.color }}>Compare Periods — {ch.name}</div>
                  <div style={{ fontSize: '11px', color: theme.muted, marginTop: '2px' }}>Select two time ranges to compare performance</div>
                </div>
                <button onClick={() => setShowCompareMode(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Range selectors */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>Period A</span>
                  <input type="date" value={(() => { const m = MONTHS[compareFromIndex ?? 0]; if (!m) return ''; const [mon, yr] = m.split(' '); const mi = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mon); return `${yr}-${String(mi + 1).padStart(2, '0')}-01`; })()} onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }} onChange={(e) => { if (!e.target.value) return; const d = new Date(e.target.value); const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]; const label = `${ml} ${d.getUTCFullYear()}`; const idx = data.findIndex(r => r.month === label); if (idx >= 0) setCompareFromIndex(idx); }} style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.background, color: theme.text, fontWeight: 600, cursor: 'pointer', flex: 1 }} />
                  <span style={{ fontSize: '11px', color: theme.muted }}>to</span>
                  <input type="date" value={(() => { const m = MONTHS[compareToIndex ?? 0]; if (!m) return ''; const [mon, yr] = m.split(' '); const mi = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mon); return `${yr}-${String(mi + 1).padStart(2, '0')}-01`; })()} onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }} onChange={(e) => { if (!e.target.value) return; const d = new Date(e.target.value); const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]; const label = `${ml} ${d.getUTCFullYear()}`; const idx = data.findIndex(r => r.month === label); if (idx >= 0) setCompareToIndex(idx); }} style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.background, color: theme.text, fontWeight: 600, cursor: 'pointer', flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>Period B</span>
                  <input type="date" value={(() => { const m = MONTHS[compareFromIndex2 ?? currentMonthIndex]; if (!m) return ''; const [mon, yr] = m.split(' '); const mi = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mon); return `${yr}-${String(mi + 1).padStart(2, '0')}-01`; })()} onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }} onChange={(e) => { if (!e.target.value) return; const d = new Date(e.target.value); const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]; const label = `${ml} ${d.getUTCFullYear()}`; const idx = data.findIndex(r => r.month === label); if (idx >= 0) setCompareFromIndex2(idx); }} style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.background, color: theme.text, fontWeight: 600, cursor: 'pointer', flex: 1 }} />
                  <span style={{ fontSize: '11px', color: theme.muted }}>to</span>
                  <input type="date" value={(() => { const m = MONTHS[compareToIndex2 ?? currentMonthIndex]; if (!m) return ''; const [mon, yr] = m.split(' '); const mi = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mon); return `${yr}-${String(mi + 1).padStart(2, '0')}-01`; })()} onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }} onChange={(e) => { if (!e.target.value) return; const d = new Date(e.target.value); const ml = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]; const label = `${ml} ${d.getUTCFullYear()}`; const idx = data.findIndex(r => r.month === label); if (idx >= 0) setCompareToIndex2(idx); }} style={{ padding: '6px 10px', border: `1px solid ${theme.border}`, borderRadius: '4px', fontSize: '12px', background: theme.background, color: theme.text, fontWeight: 600, cursor: 'pointer', flex: 1 }} />
                </div>
              </div>
              {/* Revenue comparison */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '16px', background: theme.background, borderRadius: '8px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '10px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Period A</div>
                  <div style={{ fontSize: '10px', color: theme.muted, marginBottom: '4px' }}>{periodA?._label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: theme.muted }}>{formatCurrency(revA)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: ch.color, fontWeight: 700 }}>→</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: revGrowth >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)' }}>{revGrowth >= 0 ? '+' : ''}{revGrowth.toFixed(0)}%</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '10px', color: theme.muted, fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Period B</div>
                  <div style={{ fontSize: '10px', color: theme.muted, marginBottom: '4px' }}>{periodB?._label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: theme.text }}>{formatCurrency(revB)}</div>
                </div>
              </div>
              {/* KPI comparison table */}
              {kpis.length > 0 && (
                <div style={{ borderRadius: '6px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '0', background: theme.background, padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    {['KPI', 'Period A', 'Period B', 'Industry', 'Change'].map(h => (
                      <span key={h} style={{ fontSize: '10px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                    ))}
                  </div>
                  {kpis.map((kpi, idx) => {
                    const valA = periodA?.[kpi.key];
                    const valB = periodB?.[kpi.key];
                    const industry = cap?.kpis?.[kpi.key]?.industry;
                    const delta = (valA != null && valB != null && valA !== 0) ? ((valB - valA) / Math.abs(valA) * 100) : null;
                    const beatsIndustry = industry != null && valB != null ? valB >= industry : null;
                    return (
                      <div key={kpi.key} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '0', padding: '10px 14px', borderBottom: idx < kpis.length - 1 ? `1px solid ${theme.border}` : 'none', background: idx % 2 === 0 ? theme.surface : theme.background }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text }}>{kpi.label}</span>
                        <span style={{ fontSize: '12px', color: theme.muted }}>{fmtV(valA, kpi.unit)}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: theme.text }}>{fmtV(valB, kpi.unit)}</span>
                        <span style={{ fontSize: '12px', color: beatsIndustry === true ? 'rgba(34,197,94,1)' : beatsIndustry === false ? 'rgba(245,158,11,0.9)' : theme.muted, fontWeight: beatsIndustry != null ? 600 : 400 }}>
                          {fmtV(industry, kpi.unit)} {beatsIndustry === true ? '✓' : beatsIndustry === false ? '↗' : ''}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: delta != null ? (delta >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)') : theme.muted }}>
                          {delta != null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {showSummaryModal && (() => {
        const currentMo = MONTHS[currentMonthIndex];
        const currentD = data[currentMonthIndex];
        const prevD = data[currentMonthIndex - 1];
        const selCh = selectedBreakdownChannel ? breakdownChannels.find(c => c.key === selectedBreakdownChannel) : null;
        const selCap = selCh?.capabilityId ? capabilities.find(c => c.id === selCh.capabilityId) : null;
        const isChannel = summaryScope === 'channel' && selCh;
        const fmtV = (v, unit) => {
          if (v == null) return '—';
          if (unit === '$') return `$${Math.round(v).toLocaleString()}`;
          if (unit === '%') return `${Number(v).toFixed(1)}%`;
          if (unit === 'x') return `${Number(v).toFixed(1)}x`;
          return Math.round(v).toLocaleString();
        };
        const moChange = (key) => {
          const curr = currentD?.[key]; const prev = prevD?.[key];
          if (curr == null || prev == null || prev === 0) return null;
          return ((curr - prev) / Math.abs(prev) * 100);
        };
        // AI narrative generators
        const kpiNarrative = (kpi, val, industry, beats, delta) => {
          if (val == null) return '';
          const dir = delta > 0 ? 'improved' : delta < 0 ? 'declined' : 'held steady';
          const vs = beats ? `outperforming the industry benchmark of ${fmtV(industry, kpi.unit)}` : `trailing the industry benchmark of ${fmtV(industry, kpi.unit)}`;
          const action = beats ? 'Continue current strategy to maintain this advantage.' : 'This represents an opportunity for optimization — targeted improvements here could meaningfully impact revenue.';
          return `${kpi.label} ${dir} to ${fmtV(val, kpi.unit)}${delta != null ? ` (${delta > 0 ? '+' : ''}${delta.toFixed(1)}% MoM)` : ''}, ${industry != null ? vs : 'with no industry benchmark available'}. ${industry != null ? action : ''}`;
        };
        const channelNarrative = (ch, capObj) => {
          const val = currentD?.[ch.key] || 0;
          const prevVal = prevD?.[ch.key] || 0;
          const pct = Math.round((val / (currentD?.totalRevenue || 1)) * 100);
          const momDelta = prevVal > 0 ? ((val - prevVal) / prevVal * 100) : 0;
          const topKpis = capObj ? (serviceKPIs[capObj.id] || []).slice(0, 2) : [];
          const kpiInsights = topKpis.map(kpi => {
            const kVal = currentD?.[kpi.key];
            const industry = capObj?.kpis?.[kpi.key]?.industry;
            return kVal != null && industry != null ? (kVal >= industry ? `${kpi.label} exceeds benchmark` : `${kpi.label} trails benchmark`) : null;
          }).filter(Boolean);
          const trend = momDelta > 5 ? 'strong upward momentum' : momDelta > 0 ? 'steady growth' : momDelta > -5 ? 'relatively flat performance' : 'a declining trend that warrants attention';
          return `This channel shows ${trend} with ${momDelta > 0 ? '+' : ''}${momDelta.toFixed(1)}% month-over-month change. ${kpiInsights.length > 0 ? kpiInsights.join('; ') + '.' : ''}`;
        };
        const portfolioNarrative = () => {
          const total = currentD?.totalRevenue || 0;
          const prevTotal = prevD?.totalRevenue || 0;
          const growth = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : 0;
          const topChannel = breakdownChannels.filter(c => c.capabilityId && c.key !== 'other').sort((a, b) => (currentD?.[b.key] || 0) - (currentD?.[a.key] || 0))[0];
          const fastestGrowing = breakdownChannels.filter(c => c.capabilityId && c.key !== 'other').map(ch => {
            const curr = currentD?.[ch.key] || 0; const prev = prevD?.[ch.key] || 0;
            return { ...ch, growth: prev > 0 ? ((curr - prev) / prev * 100) : 0 };
          }).sort((a, b) => b.growth - a.growth)[0];
          return `Total portfolio revenue reached ${formatCurrency(total)} in ${currentMo}, ${growth >= 0 ? 'up' : 'down'} ${Math.abs(growth).toFixed(1)}% from the prior month. ${topChannel ? `${topChannel.name} remains the largest revenue driver at ${formatCurrency(currentD?.[topChannel.key] || 0)}.` : ''} ${fastestGrowing && fastestGrowing.growth > 0 ? `${fastestGrowing.name} showed the strongest momentum with +${fastestGrowing.growth.toFixed(1)}% growth, signaling effective campaign execution.` : ''} Overall, the channel mix is ${breakdownChannels.filter(c => c.capabilityId && c.key !== 'other' && ((currentD?.[c.key] || 0) / total) > 0.15).length >= 3 ? 'well-diversified, reducing single-channel dependency risk' : 'concentrated — consider expanding underweight channels to reduce risk'}.`;
        };
        // Context: active changes
        const hasScenario = Object.keys(kpiScenarioAdjustments).length > 0;
        const hasContribAdj = Object.keys(adjustedBenchmarks).length > 0;
        const hasRecommendations = hypotheticalServices.length > 0;
        const scenarioStartData = kpiPanelMonth ? data.find(d => d.month === kpiPanelMonth) : null;
        const scenarioStartIdx = scenarioStartData ? scenarioStartData.index : currentMonthIndex;
        const scenarioTargetIdx = Math.min(scenarioStartIdx + 3, data.length - 1);
        const scenarioCurrentRev = data[scenarioStartIdx]?.totalRevenue || 0;
        const scenarioTargetRev = scenarioData?.find(d => d.index === scenarioTargetIdx)?.scenarioRevenue || scenarioCurrentRev;
        const scenarioLiftPct = scenarioCurrentRev > 0 ? ((scenarioTargetRev - scenarioCurrentRev) / scenarioCurrentRev * 100) : 0;
        const scenarioLiftAmt = scenarioTargetRev - scenarioCurrentRev;
        return (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', background: theme.surface, borderLeft: `1px solid ${theme.border}`, boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: theme.text }}>{isChannel ? `${selCh.name} Summary` : 'Portfolio Summary'}</div>
                  <div style={{ fontSize: '11px', color: theme.muted, marginTop: '2px' }}>{currentMo} {isChannel && showCompareMode ? '• Includes period comparison' : ''}{(hasScenario || hasContribAdj || hasRecommendations) ? ` • ${[hasScenario ? 'KPI scenario' : '', hasContribAdj ? 'mix changes' : '', hasRecommendations ? `${hypotheticalServices.length} recommendation${hypotheticalServices.length > 1 ? 's' : ''}`  : ''].filter(Boolean).join(', ')} active` : ''}</div>
                </div>
                <button onClick={() => setShowSummaryModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.textMuted, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            </div>
            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {isChannel ? (<>
                {/* AI Overview */}
                <div style={{ padding: '14px', background: `${selCh.color}08`, borderLeft: `3px solid ${selCh.color}`, borderRadius: '0 6px 6px 0', marginBottom: '20px', fontSize: '13px', lineHeight: '1.7', color: theme.text }}>
                  <span style={{ fontWeight: 700, color: selCh.color }}>{selCh.name}</span> is currently generating <span style={{ fontWeight: 700 }}>{formatCurrency(currentD?.[selCh.key] || 0)}</span> in monthly revenue, representing {Math.round(((currentD?.[selCh.key] || 0) / (currentD?.totalRevenue || 1)) * 100)}% of total portfolio revenue. {channelNarrative(selCh, selCap)}
                </div>
                {/* KPIs with AI narratives */}
                <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '12px' }}>Key Metrics</div>
                {selCap && (serviceKPIs[selCap.id] || []).map(kpi => {
                  const val = currentD?.[kpi.key];
                  const industry = selCap.kpis?.[kpi.key]?.industry;
                  const beats = industry != null && val != null ? val >= industry : null;
                  const delta = moChange(kpi.key);
                  return (
                    <div key={kpi.key} style={{ marginBottom: '16px', padding: '12px', background: theme.background, borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: theme.text }}>{kpi.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: theme.text }}>{fmtV(val, kpi.unit)}</span>
                          {delta != null && <span style={{ fontSize: '10px', fontWeight: 700, color: delta >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)', padding: '2px 6px', borderRadius: '10px', background: delta >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span>}
                        </div>
                      </div>
                      {industry != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <div style={{ flex: 1, height: '4px', background: theme.border, borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, (val / (industry * 1.5)) * 100)}%`, background: beats ? 'rgba(34,197,94,0.6)' : 'rgba(245,158,11,0.6)', borderRadius: '2px' }} />
                          </div>
                          <span style={{ fontSize: '10px', color: beats ? 'rgba(34,197,94,1)' : 'rgba(245,158,11,0.9)', fontWeight: 600, whiteSpace: 'nowrap' }}>Ind: {fmtV(industry, kpi.unit)} {beats ? '✓' : '↗'}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '11px', lineHeight: '1.6', color: theme.textMuted }}>{kpiNarrative(kpi, val, industry, beats, delta)}</div>
                    </div>
                  );
                })}
                {/* Comparison context */}
                {showCompareMode && <div style={{ marginTop: '8px', padding: '12px', background: theme.background, borderRadius: '6px', borderLeft: `3px solid ${selCh.color}` }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px', color: theme.text }}>Period Comparison Active</div>
                  <div style={{ fontSize: '11px', color: theme.muted, lineHeight: '1.6' }}>Comparing <span style={{ fontWeight: 600 }}>{MONTHS[compareFromIndex ?? 0]} – {MONTHS[compareToIndex ?? 0]}</span> vs <span style={{ fontWeight: 600 }}>{MONTHS[compareFromIndex2 ?? currentMonthIndex]} – {MONTHS[compareToIndex2 ?? currentMonthIndex]}</span>. Refer to the comparison table in the detail panel for full period-over-period KPI analysis.</div>
                </div>}
              </>) : (<>
                {/* AI Portfolio Overview */}
                <div style={{ padding: '14px', background: `${theme.primary}08`, borderLeft: `3px solid ${theme.primary}`, borderRadius: '0 6px 6px 0', marginBottom: '20px', fontSize: '13px', lineHeight: '1.7', color: theme.text }}>
                  {portfolioNarrative()}
                </div>
                {/* Channel-by-channel breakdown with AI narratives */}
                <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '12px' }}>Channel Performance</div>
                {breakdownChannels.filter(c => c.capabilityId).map(ch => {
                  const val = currentD?.[ch.key] || 0;
                  const pct = Math.round((val / (currentD?.totalRevenue || 1)) * 100);
                  const capObj = capabilities.find(c => c.id === ch.capabilityId);
                  const momDelta = moChange(ch.key);
                  return (
                    <div key={ch.key} style={{ marginBottom: '18px', padding: '14px', background: theme.background, borderRadius: '6px', borderLeft: `3px solid ${ch.color}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: ch.color }}>{ch.name}</span>
                        <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '14px', color: theme.text }}>{formatCurrency(val)}</span>
                        <span style={{ fontSize: '10px', color: theme.muted }}>({pct}%)</span>
                        {momDelta != null && <span style={{ fontSize: '10px', fontWeight: 700, color: momDelta >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)', padding: '2px 6px', borderRadius: '10px', background: momDelta >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>{momDelta >= 0 ? '+' : ''}{momDelta.toFixed(1)}%</span>}
                      </div>
                      {/* KPI pills */}
                      {capObj && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {(serviceKPIs[capObj.id] || []).slice(0, 3).map(kpi => {
                          const kVal = currentD?.[kpi.key];
                          const industry = capObj.kpis?.[kpi.key]?.industry;
                          const beats = industry != null && kVal != null ? kVal >= industry : null;
                          return <span key={kpi.key} style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: beats ? 'rgba(34,197,94,0.1)' : beats === false ? 'rgba(245,158,11,0.1)' : theme.surface, color: beats ? 'rgba(34,197,94,1)' : beats === false ? 'rgba(245,158,11,0.9)' : theme.muted, border: `1px solid ${beats ? 'rgba(34,197,94,0.2)' : beats === false ? 'rgba(245,158,11,0.2)' : theme.border}` }}>{kpi.label}: {fmtV(kVal, kpi.unit)} {beats != null && (beats ? '✓' : '↗')}</span>;
                        })}
                      </div>}
                      {/* AI narrative */}
                      <div style={{ fontSize: '11px', lineHeight: '1.6', color: theme.textMuted }}>{channelNarrative(ch, capObj)}</div>
                    </div>
                  );
                })}
              </>)}

              {/* Active Changes Section */}
              {(hasScenario || hasContribAdj || hasRecommendations) && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '12px' }}>Active Modeling</div>

                  {/* KPI Scenario */}
                  {hasScenario && (
                    <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(245,158,11,0.05)', borderRadius: '6px', borderLeft: '3px solid rgba(245,158,11,1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '12px', color: 'rgba(245,158,11,1)' }}>KPI Scenario Adjustment</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: scenarioLiftPct >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)' }}>{scenarioLiftPct >= 0 ? '+' : ''}{scenarioLiftPct.toFixed(1)}%</span>
                      </div>
                      <div style={{ fontSize: '11px', lineHeight: '1.6', color: theme.textMuted }}>
                        {Object.keys(kpiScenarioAdjustments).length} KPI{Object.keys(kpiScenarioAdjustments).length > 1 ? 's' : ''} adjusted{kpiPanelMonth ? ` from ${kpiPanelMonth}` : ''}, projecting a {scenarioLiftPct >= 0 ? 'revenue increase' : 'revenue decrease'} of {formatCurrency(Math.abs(scenarioLiftAmt))}/mo ({scenarioLiftPct >= 0 ? '+' : ''}{scenarioLiftPct.toFixed(1)}%) once fully ramped. This scenario models the compound effect of these improvements on overall revenue growth.
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {Object.entries(kpiScenarioAdjustments).map(([key, val]) => {
                          const allKpis = Object.values(serviceKPIs).flat();
                          const kpiDef = allKpis.find(k => k.key === key);
                          const origVal = data[scenarioStartIdx]?.[key];
                          const changePct = origVal ? ((val - origVal) / Math.abs(origVal) * 100) : 0;
                          return <span key={key} style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,1)', border: '1px solid rgba(245,158,11,0.25)' }}>{kpiDef?.label || key}: {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%</span>;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Contribution Adjustments */}
                  {hasContribAdj && (
                    <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(59,130,246,0.05)', borderRadius: '6px', borderLeft: '3px solid rgba(59,130,246,1)' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: 'rgba(59,130,246,1)', marginBottom: '6px' }}>Channel Mix Adjustments</div>
                      <div style={{ fontSize: '11px', lineHeight: '1.6', color: theme.textMuted }}>
                        {Object.keys(adjustedBenchmarks).length} channel{Object.keys(adjustedBenchmarks).length > 1 ? 's' : ''} have been rebalanced from their current contribution levels. This models a shift in channel investment strategy — the breakdown chart reflects the target mix.
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {Object.entries(adjustedBenchmarks).map(([key, val]) => {
                          const ch = breakdownChannels.find(c => c.key === key);
                          const origBench = channelBenchmarks[key] || 0;
                          const diff = val - origBench;
                          return <span key={key} style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: `${ch?.color || theme.primary}15`, color: ch?.color || theme.primary, border: `1px solid ${ch?.color || theme.primary}30` }}>{ch?.name || key}: {origBench}% → {val}% ({diff >= 0 ? '+' : ''}{diff}%)</span>;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Recommendations */}
                  {hasRecommendations && (
                    <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(239,68,68,0.05)', borderRadius: '6px', borderLeft: `3px solid ${theme.primary}` }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: theme.primary, marginBottom: '6px' }}>Active Recommendations ({hypotheticalServices.length})</div>
                      <div style={{ fontSize: '11px', lineHeight: '1.6', color: theme.textMuted }}>
                        {hypotheticalServices.length} projected channel{hypotheticalServices.length > 1 ? 's' : ''} added to the forecast, contributing an estimated +{formatCurrency(hypotheticalServices.reduce((s, h) => s + Math.round((data[currentMonthIndex]?.totalRevenue || 0) * h.projectedLift), 0))}/mo in additional revenue at full ramp.
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {hypotheticalServices.map(h => (
                          <span key={h.id} style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: `${theme.primary}10`, color: theme.primary, border: `1px solid ${theme.primary}30` }}>{h.name}: +{(h.projectedLift * 100).toFixed(0)}%</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Footer actions — pinned to bottom */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button onClick={() => {}} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${theme.primary}`, background: `${theme.primary}10`, color: theme.primary, fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>✉ Email Report</button>
                <button onClick={() => {}} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>↓ Download PDF</button>
              </div>
              <div style={{ padding: '8px 10px', background: theme.background, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: theme.text }}>Schedule:</span>
                {['Weekly', 'Monthly', 'Quarterly'].map(freq => (
                  <span key={freq} style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', background: `${theme.primary}10`, color: theme.primary, border: `1px solid ${theme.primary}30` }}>{freq}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AcadacaGrowthChart;
