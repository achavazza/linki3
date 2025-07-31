/**
 * Funciones de ayuda generales
 */
export const helpers = {
  /**
   * Genera un slug a partir de un texto
   * @param {string} text - Texto a convertir
   * @returns {string} - Slug generado
   */
  generateSlug(text) {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  },

  
  /**
   * Formatea una URL asegurando que tenga protocolo http/https
   * @param {string} url - URL a formatear
   * @returns {string} - URL formateada
   */
  formatUrl(url, type = '') {
  if (!url) return '';

  url = url.trim();

    switch (type) {
      case 'email':
        // Asegura el esquema mailto:
        url = url.replace(/^mailto:/, '');
        return `mailto:${url}`;

      case 'whatsapp':
        // Extrae solo los números
        const whatsappNumber = url.replace(/[^\d]/g, '');
        return `https://wa.me/${whatsappNumber}`;

      case 'phone':
      case 'tel':
        const phoneNumber = url.replace(/[^\d\+]/g, '');
        return `tel:${phoneNumber}`;

      case 'website':
        // Si ya tiene http(s), no tocar
        if (/^https?:\/\//i.test(url)) return url;
        return `https://${url}`;

      default:
        // Manejo general: email, tel, wa, o url por defecto
        if (url.includes('@')) {
          return `mailto:${url.replace(/^mailto:/, '')}`;
        }

        if (/^[\d\+][\d\s\-\(\)]+$/.test(url)) {
          return `tel:${url.replace(/[^\d\+]/g, '')}`;
        }

        if (/^https?:\/\/wa\.me\/.+$/i.test(url) ||
            /^https?:\/\/api\.whatsapp\.com\/send\?.+$/i.test(url)) {
          return url;
        }

        if (/^[\d\s\-\(\)]+$/.test(url)) {
          return `https://wa.me/${url.replace(/[^\d]/g, '')}`;
        }

        // Si tiene http(s) ya está bien
        if (/^https?:\/\//i.test(url)) {
          return url;
        }

        // Asume que es sitio web
        return `https://${url}`;
    }
  },

  /**
   * Descarga un archivo
   * @param {string} content - Contenido o URL del archivo
   * @param {string} filename - Nombre del archivo
   * @param {string} type - Tipo MIME del archivo
   */
  downloadFile(content, filename, type = '') {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  },

  /**
   * Copia texto al portapapeles
   * @param {string} text - Texto a copiar
   * @returns {Promise<boolean>} - True si tuvo éxito
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
      return false
    }
  },

  /**
   * Debounce para optimizar eventos frecuentes
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} - Función debounceada
   */
  debounce(func, wait = 300) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  },

  /**
   * Throttle para limitar la frecuencia de ejecución
   * @param {Function} func - Función a ejecutar
   * @param {number} limit - Tiempo límite en ms
   * @returns {Function} - Función throttleada
   */
  throttle(func, limit = 300) {
    let inThrottle
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  /**
   * Formatea una fecha a formato legible
   * @param {Date|string} date - Fecha a formatear
   * @param {string} locale - Locale (ej: 'es-AR')
   * @param {object} options - Opciones de formato
   * @returns {string} - Fecha formateada
   */
  formatDate(date, locale = 'es-AR', options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }
    
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleDateString(locale, defaultOptions)
  },

  /**
     * Extrae mensajes de error de diferentes formatos
     * @param {Error|object|string} error - Objeto de error
     * @returns {string} - Mensaje de error legible
     */
    extractErrorMessage(error) {
    if (!error) return ''
    if (typeof error === 'string') return error
    if (error.message) return error.message
    if (error.error?.message) return error.error.message
    return 'Ocurrió un error inesperado'
    }
}