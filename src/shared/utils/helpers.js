/**
 * Format date to locale string
 * @param {string|Date} date
 * @param {string} locale
 * @returns {string}
 */
export const formatDate = (date, locale = 'id-ID') => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale)
}

/**
 * Format datetime to locale string
 * @param {string|Date} date
 * @param {string} locale
 * @returns {string}
 */
export const formatDateTime = (date, locale = 'id-ID') => {
  if (!date) return ''
  return new Date(date).toLocaleString(locale)
}

/**
 * Check if token is expired
 * @param {string} expiresAt
 * @returns {boolean}
 */
export const isTokenExpired = (expiresAt) => {
  if (!expiresAt) return true
  return new Date(expiresAt) < new Date()
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} { isValid, message }
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password minimal 8 karakter' }
  }
  return { isValid: true, message: '' }
}

/**
 * Get initials from name
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
