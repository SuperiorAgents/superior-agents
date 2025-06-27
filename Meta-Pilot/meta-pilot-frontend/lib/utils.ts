import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date, formatStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return formatStr
    .replace('yyyy', date.getFullYear().toString())
    .replace('yy', date.getFullYear().toString().slice(-2))
    .replace('MMMM', months[date.getMonth()])
    .replace('MMM', months[date.getMonth()])
    .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
    .replace('M', (date.getMonth() + 1).toString())
    .replace('dd', date.getDate().toString().padStart(2, '0'))
    .replace('d', date.getDate().toString())
    .replace('HH', date.getHours().toString().padStart(2, '0'))
    .replace('H', date.getHours().toString())
    .replace('hh', (date.getHours() % 12 || 12).toString().padStart(2, '0'))
    .replace('h', (date.getHours() % 12 || 12).toString())
    .replace('mm', date.getMinutes().toString().padStart(2, '0'))
    .replace('m', date.getMinutes().toString())
    .replace('ss', date.getSeconds().toString().padStart(2, '0'))
    .replace('s', date.getSeconds().toString())
    .replace('a', date.getHours() < 12 ? 'am' : 'pm')
    .replace('PP', `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`)
    .replace('E', days[date.getDay()]);
};

