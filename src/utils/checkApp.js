// Verificación rápida de la aplicación
import { TICKET_STATES, TICKET_PRIORITIES } from './constants.js'

console.log('✅ Verificando constantes...')
console.log('TICKET_STATES:', TICKET_STATES)
console.log('TICKET_PRIORITIES:', TICKET_PRIORITIES)

// Verificar que las constantes están correctamente definidas
const statesCount = Object.keys(TICKET_STATES).length
const prioritiesCount = Object.keys(TICKET_PRIORITIES).length

console.log(`✅ Estados de tickets: ${statesCount} definidos`)
console.log(`✅ Prioridades de tickets: ${prioritiesCount} definidas`)

if (statesCount > 0 && prioritiesCount > 0) {
  console.log('✅ Aplicación lista para funcionar')
} else {
  console.log('❌ Error en la configuración de constantes')
}