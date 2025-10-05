import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanLocationName(location: string): string {
  if (location.includes('/')) {
    return location.split('/')[1].trim();
  }
  return location;
}
