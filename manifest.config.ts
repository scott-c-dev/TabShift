import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
import { COMMAND_CURRENT_AND_LEFT, COMMAND_CURRENT_AND_RIGHT } from './src/constants'

export default defineManifest({
  manifest_version: 3,
  name: packageJson.displayName,
  version: packageJson.version,
  description: packageJson.description,
  icons: {
    16: 'src/assets/icons/icon16.png',
    32: 'src/assets/icons/icon32.png',
    48: 'src/assets/icons/icon48.png',
    128: 'src/assets/icons/icon128.png',
  },
  action: {
    default_icon: {
      16: 'src/assets/icons/icon16.png',
      32: 'src/assets/icons/icon32.png',
      48: 'src/assets/icons/icon48.png',
      128: 'src/assets/icons/icon128.png',
    },
    default_popup: 'index.html',
    default_title: packageJson.displayName,
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  commands: {
    _execute_action: {
      suggested_key: {
        default: 'Alt+Shift+M',
        mac: 'MacCtrl+Shift+M',
      },
      description: 'Open TabShift to merge windows',
    },
    [COMMAND_CURRENT_AND_RIGHT]: {
      suggested_key: {
        default: 'Alt+Shift+Right',
        mac: 'MacCtrl+Shift+Right',
      },
      description: 'Move this & right tabs to new window',
    },
    [COMMAND_CURRENT_AND_LEFT]: {
      suggested_key: {
        default: 'Alt+Shift+Left',
        mac: 'MacCtrl+Shift+Left',
      },
      description: 'Move this & left tabs to new window',
    },
  },
  permissions: ['contextMenus', 'tabs'],
})
