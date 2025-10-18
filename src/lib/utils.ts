import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOpeningHours(openingHours: any) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return days.map((day, index) => {
    const hours = openingHours[day]
    if (!hours || hours.open === 'closed') {
      return `${dayNames[index]}: Closed`
    }
    return `${dayNames[index]}: ${hours.open} - ${hours.close}`
  })
}

// Generate a URL-friendly slug from a name/title
export function slugify(input: string): string {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}
