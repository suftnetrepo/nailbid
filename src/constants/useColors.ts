import { useColorScheme } from 'react-native'
import { useThemeStore } from '../stores'
import { LightColors, DarkColors, type ThemeColors } from './themes'

/**
 * Resolves the active palette: an explicit 'light'/'dark' choice wins,
 * otherwise follows the device's own appearance setting.
 */
export const useColors = (): ThemeColors => {
  const mode   = useThemeStore((s) => s.mode)
  const system = useColorScheme()
  const resolved = mode === 'system' ? (system ?? 'light') : mode
  return resolved === 'dark' ? DarkColors : LightColors
}

/** Same resolution, without subscribing a component to re-renders — for one-off reads outside render (e.g. building share text). */
export const getColors = (): ThemeColors => {
  const mode = useThemeStore.getState().mode
  return mode === 'dark' ? DarkColors : LightColors
}

/** Resolved 'light' | 'dark' — for the odd case that needs the mode itself (e.g. StatusBar style), not just colours. */
export const useIsDark = (): boolean => {
  const mode   = useThemeStore((s) => s.mode)
  const system = useColorScheme()
  const resolved = mode === 'system' ? (system ?? 'light') : mode
  return resolved === 'dark'
}
