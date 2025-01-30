import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomIds(min: number, max: number, count: number): number[] {
  const ids = new Set<number>();
  while (ids.size < count) {
    const random_id = Math.floor(Math.random() * (max - min + 1)) + min;
    ids.add(random_id);
  }
  return [...ids];
}

