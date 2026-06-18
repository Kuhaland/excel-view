import { computed } from 'vue'

const email = 'leehx78@smartscore.kr'
const name = computed(() => email.split('@')[0])
const initial = computed(() => name.value.charAt(0).toUpperCase())

export function useUser() {
  return { email, name, initial }
}
