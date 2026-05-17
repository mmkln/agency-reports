import { CLIENT_TYPES, CLIENT_TYPE_META } from '../../entities/client'
import {
  CLINIC_PROFILE_SPECIALTY_META,
  CLINIC_SERVICE_LINE_STATUS_META,
  normalizeClinicLocation,
  normalizeClinicProfile,
  normalizeClinicServiceLine,
} from '../../entities/clinic'
import { USER_ROLES } from '../../entities/profile'
import { canAccessClient } from '../policies/accessPolicy'

function sortRawByDisplayOrder(left, right) {
  return (left.display_order ?? 0) - (right.display_order ?? 0)
    || left.name.localeCompare(right.name)
}

function mapLocation(location) {
  const normalizedLocation = normalizeClinicLocation(location)

  return {
    address: normalizedLocation.address,
    city: normalizedLocation.city,
    clientId: normalizedLocation.client_id,
    displayOrder: normalizedLocation.display_order,
    id: normalizedLocation.id,
    isActive: normalizedLocation.is_active,
    name: normalizedLocation.name,
    updatedAt: normalizedLocation.updated_at,
  }
}

function mapServiceLine(serviceLine, locationsById) {
  const normalizedServiceLine = normalizeClinicServiceLine(serviceLine)
  const locations = normalizedServiceLine.location_ids
    .map((locationId) => locationsById.get(locationId))
    .filter(Boolean)

  return {
    averageValue: normalizedServiceLine.average_value,
    capacityNote: normalizedServiceLine.capacity_note,
    clientId: normalizedServiceLine.client_id,
    displayOrder: normalizedServiceLine.display_order,
    id: normalizedServiceLine.id,
    locationIds: normalizedServiceLine.location_ids,
    locations,
    name: normalizedServiceLine.name,
    primaryChannel: normalizedServiceLine.primary_channel,
    status: normalizedServiceLine.status,
    statusMeta: CLINIC_SERVICE_LINE_STATUS_META[normalizedServiceLine.status],
    targetMonthlyBookings: normalizedServiceLine.target_monthly_bookings,
    updatedAt: normalizedServiceLine.updated_at,
  }
}

function mapProfile(profile) {
  if (!profile) {
    return null
  }

  const normalizedProfile = normalizeClinicProfile(profile)

  return {
    capacityNotes: normalizedProfile.capacity_notes,
    clientId: normalizedProfile.client_id,
    id: normalizedProfile.id,
    insuranceModel: normalizedProfile.insurance_model,
    primaryGoal: normalizedProfile.primary_goal,
    specialty: normalizedProfile.specialty,
    specialtyMeta: CLINIC_PROFILE_SPECIALTY_META[normalizedProfile.specialty],
    updatedAt: normalizedProfile.updated_at,
  }
}

function canReadClinicClient({ client, clientId, viewer }) {
  if (!client || client.type !== CLIENT_TYPES.CLINIC) {
    return false
  }

  if (viewer?.role === USER_ROLES.AGENCY_ADMIN) {
    return Boolean(viewer.agencyId && client.agency_id === viewer.agencyId)
  }

  return canAccessClient(viewer, clientId)
}

export function getClientClinicFoundationPage({
  clientId,
  repositories,
  viewer,
}) {
  const client = repositories.clients.findById(clientId)

  if (!canReadClinicClient({ client, clientId, viewer })) {
    return {
      reason: 'access_denied',
      status: 'error',
    }
  }

  const locations = (repositories.clinicLocations?.listByClientId(clientId) ?? [])
    .sort(sortRawByDisplayOrder)
    .map(mapLocation)
  const locationsById = new Map(locations.map((location) => [location.id, location]))
  const serviceLines = (repositories.clinicServiceLines?.listByClientId(clientId) ?? [])
    .sort(sortRawByDisplayOrder)
    .map((serviceLine) => mapServiceLine(serviceLine, locationsById))
  const profileRecord = repositories.clinicProfiles?.listByClientId(clientId)?.[0] ?? null

  return {
    client: {
      id: client.id,
      name: client.name,
      portalSlug: client.portal_slug,
      type: client.type,
      typeMeta: CLIENT_TYPE_META[client.type],
    },
    locations,
    profile: mapProfile(profileRecord),
    serviceLines,
    status: 'ready',
  }
}

export function getClientClinicServiceLinesPage(input) {
  const foundationPage = getClientClinicFoundationPage(input)

  if (foundationPage.status === 'error') {
    return foundationPage
  }

  return {
    client: foundationPage.client,
    isEmpty: foundationPage.serviceLines.length === 0,
    locations: foundationPage.locations,
    profile: foundationPage.profile,
    serviceLines: foundationPage.serviceLines,
    status: 'ready',
  }
}
