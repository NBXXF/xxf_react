import {clsx, type ClassValue} from 'clsx'
import {twMerge} from "tailwind-merge";


/**
 * // ❌ 直接用 twMerge 很麻烦
 * twMerge(`base ${isActive ? 'bg-blue-500' : ''} ${isDisabled ? 'opacity-50' : ''}`)
 *
 * // ✅ 用 cn 更简洁
 * cn('base', isActive && 'bg-blue-500', isDisabled && 'opacity-50')
 * cn('base', { 'bg-blue-500': isActive, 'opacity-50': isDisabled })
 *
 * 合并css样式
 * @param inputs
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}