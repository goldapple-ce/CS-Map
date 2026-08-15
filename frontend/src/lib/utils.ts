import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** 조건부 className을 결합하고 충돌하는 Tailwind class를 정리한다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
