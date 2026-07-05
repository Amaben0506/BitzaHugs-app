import type React from 'react';

export const FREE_LIMITS: {
  childProfiles: number;
  activeRoutines: number;
  supportPlans: number;
  hugiMessagesPerDay: number;
  journalHistoryDays: number;
  moodHistoryDays: number;
  communityPostsPerMonth: number;
  communityRooms: number;
  activeShareCodes: number;
  appointments: number;
  pdfExports: number;
};

export const PREMIUM_CONTEXTS: Record<string, {
  title: string;
  description: string;
  icon?: string;
  benefits?: string[];
}>;

export function PremiumProvider(props: { children: React.ReactNode }): JSX.Element;

export function usePremium(): {
  isPremium: boolean;
  status: 'loading' | 'checking' | 'active' | 'free' | 'error';
  isLoading: boolean;
  error: string | null;
  lastCheckedAt: string | null;
  refreshPremium: () => Promise<{ isPremium: boolean; error?: string | null }>;
  showPremiumUpgrade: (config?: Record<string, any>) => void;
  closePremiumUpgrade: () => void;
  requirePremium: (config?: Record<string, any>) => boolean;
};

export function getHugiUsage(): Promise<{ periodKey: string; count: number }>;
export function getRemainingHugiMessages(): Promise<number>;
export function recordHugiMessageUsed(): Promise<{ periodKey: string; count: number }>;
export function getCommunityPostUsage(): Promise<{ periodKey: string; count: number }>;
export function recordCommunityPostCreated(): Promise<{ periodKey: string; count: number }>;
export function isWithinHistoryWindow(dateValue: string, days: number): boolean;
export function showUpgradeAlertFallback(navigation: any, feature?: string): void;
