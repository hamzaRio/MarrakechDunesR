// Image utility functions for handling asset imports in Vite
import { asset } from "./env";

const fallbackAgafay = import.meta.env.VITE_FALLBACK_IMAGE_AGAFAY;
const fallbackBalloon = import.meta.env.VITE_FALLBACK_IMAGE_BALLOON;
const fallbackEssaouira = import.meta.env.VITE_FALLBACK_IMAGE_ESSAOUIRA;
const fallbackOuzoud = import.meta.env.VITE_FALLBACK_IMAGE_OUZOUD;
const fallbackDefault = import.meta.env.VITE_FALLBACK_IMAGE_DEFAULT;

export const getAssetUrl = (filename: string): string => {
  // Force cache-busting for all authentic images
  const cacheBuster = `?v=${Date.now()}`;
  
  // Always serve from backend assets with cache busting
  if (filename.startsWith('/attached_assets/')) {
    // Remove /attached_assets/ prefix since asset() will handle it
    const cleanFilename = filename.replace('/attached_assets/', '');
    return asset(cleanFilename) + cacheBuster;
  }
  
  // Add cache busting to all image URLs
  return asset(filename) + cacheBuster;
};

export const getActivityFallbackImage = (activityName: string): string => {
  const name = activityName.toLowerCase();
  
  if (name.includes('agafay') || name.includes('desert')) {
    return fallbackAgafay || fallbackDefault;
  } else if (name.includes('balloon') || name.includes('montgolfière')) {
    return fallbackBalloon || fallbackDefault;
  } else if (name.includes('essaouira')) {
    return fallbackEssaouira || fallbackDefault;
  } else if (name.includes('ourika')) {
    return asset("Ourika Valley Day Trip1_1751114166831.jpg");
  } else if (name.includes('ouzoud')) {
    return fallbackOuzoud || fallbackDefault;
  }

  // Default fallback
  return fallbackDefault || "";
};