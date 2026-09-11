import * as ImagePicker from 'expo-image-picker'
import { actionSheetService, toastService } from 'fluent-styles'

// expo-image-picker's base64 output is always JPEG data regardless of the
// source image's original format — see the library's own ImagePicker.types.
export const LOGO_MIME_TYPE = 'image/jpeg'

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  // Compressed enough to keep the SQLite row and the exported PDF's HTML
  // small — a business logo doesn't need to be full camera resolution.
  quality: 0.6,
  base64: true,
}

const fromCamera = async (): Promise<string | null> => {
  const perm = await ImagePicker.requestCameraPermissionsAsync()
  if (!perm.granted) {
    toastService.error('Camera access needed', 'Enable it in Settings to scan a logo.')
    return null
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
  return result.canceled ? null : (result.assets[0]?.base64 ?? null)
}

const fromLibrary = async (): Promise<string | null> => {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!perm.granted) {
    toastService.error('Photo library access needed', 'Enable it in Settings to choose a logo.')
    return null
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS)
  return result.canceled ? null : (result.assets[0]?.base64 ?? null)
}

/**
 * Opens an action sheet (Take Photo / Choose from Library, plus Remove Logo
 * if one is already set) and resolves with the picked base64 JPEG, `null`
 * if the user chose to remove the logo, or `undefined` if they cancelled
 * without making a choice — callers should only act on a defined result.
 */
export const pickBusinessLogo = (hasExistingLogo: boolean): Promise<string | null | undefined> =>
  new Promise((resolve) => {
    actionSheetService.show({
      title: 'Business logo',
      items: [
        {
          icon: '📷',
          label: 'Take Photo',
          onPress: async () => resolve(await fromCamera() ?? undefined),
        },
        {
          icon: '🖼️',
          label: 'Choose from Library',
          onPress: async () => resolve(await fromLibrary() ?? undefined),
        },
        ...(hasExistingLogo
          ? [{
              icon: '🗑️',
              label: 'Remove Logo',
              variant: 'destructive' as const,
              onPress: () => resolve(null),
            }]
          : []),
      ],
      showCancel: true,
      onCancel: () => resolve(undefined),
    })
  })
