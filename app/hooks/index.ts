/**
 * Central export file for all custom hooks
 * 
 * Usage:
 * import { useTimer, useDebounce, useLocalStorage } from '@/app/hooks';
 */

// Custom Business Logic Hooks
export { useTimer } from './useCustomHooks';
export { useDebounce } from './useCustomHooks';
export { useLocalStorage } from './useCustomHooks';
export { usePrevious } from './useCustomHooks';
export { useAsync } from './useCustomHooks';
export { useBoolean } from './useCustomHooks';
export { useArray } from './useCustomHooks';
export { useObject } from './useCustomHooks';
export { useForm } from './useCustomHooks';
export { useClickOutside } from './useCustomHooks';
export { useCopyToClipboard } from './useCustomHooks';
export { useMediaQuery } from './useCustomHooks';
export { useWindowSize } from './useCustomHooks';
export { useFetch } from './useCustomHooks';

// Form Validation Hooks
export { useFormValidation } from './useFormValidation';

// API & Data Fetching Hooks (from api.helpers)
export { useQuery, useMutation, useCachedQuery } from '@/app/utils/api.helpers';
