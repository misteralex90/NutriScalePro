/**
 * NutriScale Pro — UI Motion System
 *
 * Barrel export: import anything motion‑related from 'src/ui'.
 *
 * CSS spec lives in ./motion.css (import it once in main.jsx).
 */

export { default as Modal } from './Modal';
export { default as Dropdown, DropdownItem, Select } from './Dropdown';
export { ToastProvider, useToast } from './Toast';
export { default as Tooltip } from './Tooltip';
export { default as Drawer } from './Drawer';
export { useMotion, useFocusTrap, useEscapeKey, useClickOutside } from './useMotion';
