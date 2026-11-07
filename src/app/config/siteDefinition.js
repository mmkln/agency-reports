import alpineLogoUrl from '../../assets/agency-logo.png'
import campaignLevelLogoUrl from '../../assets/campaign-level-logo.svg'

const SITE_VARIANTS = Object.freeze({
  ALPINE: 'alpine',
  CAMPAIGN_LEVEL: 'campaign-level',
})

const alpineSite = Object.freeze({
  brand: Object.freeze({
    allowInversion: true,
    logoFit: 'contain',
    logoUrl: alpineLogoUrl,
    name: 'Alpine Marketing',
  }),
  documentTitle: 'Client Dashboard | Alpine Marketing',
  key: SITE_VARIANTS.ALPINE,
  landingEnabled: false,
  manifestPath: 'site.webmanifest',
  mode: 'white-label',
})

const campaignLevelSite = Object.freeze({
  brand: Object.freeze({
    allowInversion: false,
    logoFit: 'contain',
    logoUrl: campaignLevelLogoUrl,
    name: 'Campaign Level',
  }),
  documentTitle: 'Campaign Level | Client-ready campaign reporting',
  key: SITE_VARIANTS.CAMPAIGN_LEVEL,
  landingEnabled: true,
  manifestPath: 'campaign-level.webmanifest',
  mode: 'platform',
})

export const siteDefinition = import.meta.env.VITE_SITE_VARIANT === SITE_VARIANTS.CAMPAIGN_LEVEL
  ? campaignLevelSite
  : alpineSite
