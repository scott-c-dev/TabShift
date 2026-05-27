import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Divactive Tab Manager',
  version: '0.0.0',
  description: 'Internal Chrome extension for managing tabs across windows.',
  action: {
    default_popup: 'index.html',
    default_title: 'Divactive Tab Manager',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  permissions: ['contextMenus', 'tabs'],
})
