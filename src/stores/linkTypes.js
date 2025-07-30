// stores/linkTypes.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useLinkTypesStore = defineStore('linkTypes', () => {
  // Definición completa de tipos de links
  const allLinkTypes = ref([
    { value: 'website', label: 'Sitio Web', baseUrl: '', needsName: true },
    { value: 'facebook', label: 'Facebook', baseUrl: 'https://facebook.com/' },
    { value: 'instagram', label: 'Instagram', baseUrl: 'https://instagram.com/' },
    { value: 'twitter', label: 'Twitter', baseUrl: 'https://twitter.com/' },
    { value: 'linkedin', label: 'LinkedIn', baseUrl: 'https://linkedin.com/in/' },
    { value: 'youtube', label: 'YouTube', baseUrl: 'https://youtube.com/c/' },
    { value: 'whatsapp', label: 'WhatsApp', baseUrl: 'https://wa.me/' },
    { value: 'email', label: 'Email', baseUrl: 'mailto:' },
    { value: 'phone', label: 'Teléfono', baseUrl: 'tel:' },
    { value: 'custom', label: 'Personalizado', baseUrl: '', needsName: true }
  ])

  // Tipos principales para botones
  const mainLinkTypes = ref(['website', 'instagram', 'facebook', 'whatsapp', 'email'])
  
  const otherLinkTypes = computed(() => 
    allLinkTypes.value.filter(type => !mainLinkTypes.value.includes(type.value))
  )

  const getLinkType = (type) => {
    return allLinkTypes.value.find(t => t.value === type) || { label: 'Personalizado', needsName: true }
  }

  const getLinkPlaceholder = (type) => {
    const placeholders = {
      website: 'https://tusitio.com',
      facebook: 'facebook.com/tuUsuario',
      instagram: 'instagram.com/tuUsuario',
      twitter: 'twitter.com/tuUsuario',
      linkedin: 'linkedin.com/in/tuPerfil',
      youtube: 'youtube.com/c/tuCanal',
      whatsapp: 'número con código de país',
      email: 'tu@email.com',
      phone: '+541112345678',
      custom: 'https://ejemplo.com'
    }
    return placeholders[type] || 'Ingresa la URL'
  }

  const shouldShowTitleInput = (type) => {
    const linkType = getLinkType(type)
    return linkType.needsName || false
  }

  const formatSocialUrl = (link) => {
    const linkType = getLinkType(link.type)
    
    if (!linkType?.baseUrl || link.url.startsWith(linkType.baseUrl)) {
      return link.url
    }

    if (linkType.baseUrl && !link.url.startsWith('http') && 
        !link.url.startsWith('mailto:') && !link.url.startsWith('tel:')) {
      const cleanValue = link.url.replace(/^@/, '').replace(/\s+/g, '')
      if (cleanValue) {
        return linkType.baseUrl + cleanValue
      }
    }
    
    return link.url
  }

  return {
    allLinkTypes,
    mainLinkTypes,
    otherLinkTypes,
    getLinkType,
    getLinkPlaceholder,
    shouldShowTitleInput,
    formatSocialUrl
  }
})