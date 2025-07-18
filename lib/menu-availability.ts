export interface AvailabilitySchedule {
  weekdays?: { start: string; end: string }
  saturday?: { start: string; end: string }
  sunday?: { start: string; end: string }
}

export interface MenuItemWithSchedule {
  id: string
  name: string
  description: string
  price: string
  category: string
  is_lunch_item?: boolean
  availability_schedule?: AvailabilitySchedule
  available: boolean
  [key: string]: any
}

/**
 * Kontrollerar om en meny-item är tillgänglig baserat på aktuell tid
 */
export function isMenuItemAvailable(item: MenuItemWithSchedule): boolean {
  // Om objektet inte har ett schema, är det alltid tillgängligt (om available = true)
  if (!item.availability_schedule || !item.is_lunch_item) {
    return item.available
  }

  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 100 + now.getMinutes() // e.g., 14:30 = 1430

  let todaySchedule: { start: string; end: string } | undefined

  if (currentDay === 0) { // Sunday - No lunch on Sunday
    return false
  } else if (currentDay === 6) { // Saturday
    todaySchedule = item.availability_schedule.saturday
  } else { // Monday-Friday
    todaySchedule = item.availability_schedule.weekdays
  }

  // Om det inte finns ett schema för idag, är objektet inte tillgängligt
  if (!todaySchedule) {
    return false
  }

  // Konvertera tider till numeriskt format för jämförelse
  const startTime = parseTimeToNumber(todaySchedule.start)
  const endTime = parseTimeToNumber(todaySchedule.end)

  // Kontrollera om aktuell tid är inom tillgänglighetstiderna
  return currentTime >= startTime && currentTime <= endTime && item.available
}

/**
 * Konverterar tid från "HH:MM" format till numeriskt format (HHMM)
 */
function parseTimeToNumber(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 100 + minutes
}

/**
 * Kontrollerar om lunch-menyn är tillgänglig just nu
 */
export function isLunchMenuAvailable(): boolean {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 100 + now.getMinutes()

  // No lunch on Sunday (restaurant opens at 15:00)
  if (currentDay === 0) {
    return false
  }

  let startTime: number
  const endTime = 1500 // 15:00

  if (currentDay === 6) { // Saturday
    startTime = 1200 // 12:00
  } else { // Monday-Friday
    startTime = 1100 // 11:00
  }

  return currentTime >= startTime && currentTime <= endTime
}

/**
 * Returnerar nästa tid när lunch-menyn blir tillgänglig
 */
export function getNextLunchAvailability(): string {
  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = now.getHours() * 100 + now.getMinutes()

  // Om det är lördag och innan 12:00
  if (currentDay === 6 && currentTime < 1200) {
    return "12:00 idag"
  }

  // Om det är någon annan dag (inte lördag eller söndag) och innan 11:00
  if (currentDay !== 6 && currentDay !== 0 && currentTime < 1100) {
    return "11:00 idag"
  }

  // Om det är söndag, visa måndag
  if (currentDay === 0) {
    return "11:00 imorgon (måndag)"
  }

  // Om det är efter lunch-tid, visa nästa dag
  if (currentTime > 1500) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDay = tomorrow.getDay()
    
    if (tomorrowDay === 6) { // Tomorrow is Saturday
      return "12:00 imorgon"
    } else if (tomorrowDay === 0) { // Tomorrow is Sunday - skip to Monday
      const monday = new Date(now)
      monday.setDate(monday.getDate() + 2)
      return "11:00 på måndag"
    } else {
      return "11:00 imorgon"
    }
  }

  return "Inte tillgänglig"
}

/**
 * Filtrerar meny-items baserat på deras tillgänglighet
 */
export function filterAvailableMenuItems(items: MenuItemWithSchedule[]): MenuItemWithSchedule[] {
  return items.filter(item => isMenuItemAvailable(item))
} 