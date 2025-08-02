import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/users'
import { useLinkTypesStore } from '@/stores/linkTypes'
import { api } from '@/utils/api'
import { helpers } from '@/utils/helpers'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/supabase'

export const useProfiles = (profileId = null, initialSlug = null) => {
  const userStore = useUserStore()
  const linkTypesStore = useLinkTypesStore()
  
  const state = {
    displayName: ref(''),
    tagline: ref(''),
    description: ref(''),
    links: ref([]),
    loading: ref(false),
    error: ref(''),
    errorField: ref(''),
    profileSlug: ref(initialSlug || ''),
    slug: ref(''),
    slugAvailability: ref('') // '', 'checking', 'available', 'unavailable'
  }

  const publicUrl = computed(() => `${window.location.origin}/p/${state.slug.value || state.profileSlug.value}`)

  // Validación del slug
  const validateSlug = (slug) => {
    return slug.length >= 3 && /^[a-z0-9-]+$/.test(slug)
  }

  // Verificación de disponibilidad del slug
  // En useProfiles.js - reemplaza la función checkSlugAvailability con esta versión
  const checkSlugAvailability = async () => {
    if (!state.slug.value || !validateSlug(state.slug.value)) {
      return;
    }

    try {
      state.slugAvailability.value = 'checking';
      
      // Solo verificamos disponibilidad sin comparar con ID para nuevos perfiles
      const { available, error: checkError } = await api.checkSlugAvailability(
        state.slug.value,
        'profiles',
        profileId || undefined // Solo pasa el ID si existe
      );
      
      if (checkError) throw checkError;
      
      state.slugAvailability.value = available ? 'available' : 'unavailable';
    } catch (err) {
      state.slugAvailability.value = 'unavailable';
      console.error('Error checking slug availability:', err);
    }
  };

  // Debounce para verificación automática
  let slugCheckTimeout
  const onSlugInput = () => {
    // Resetear estado
    state.slugAvailability.value = ''
    
    // Cancelar timeout anterior
    if (slugCheckTimeout) {
      clearTimeout(slugCheckTimeout)
    }
    
    // Verificar después de 500ms de inactividad
    if (state.slug.value && validateSlug(state.slug.value)) {
      slugCheckTimeout = setTimeout(() => {
        checkSlugAvailability()
      }, 500)
    }
  }

  const addLink = (type = 'custom') => {
    const linkType = linkTypesStore.getLinkType(type)
    
    state.links.value.push({ 
      id: uuidv4(),
      type: linkType.value,
      title: linkType.needsName ? '' : linkType.label,
      url: '',
      position: state.links.value.length,
      profile_id: profileId || null,
      needsName: linkType.needsName || false,
      error: false
    })
  }

  const validateLinks = (links) => {
    const invalidLinks = links.filter(link => {
      const linkType = linkTypesStore.getLinkType(link.type)
      
      // Validar título si es necesario
      if (linkType.needsName && !link.title?.trim()) {
        return true
      }
      
      // Validar URL - pasar el tipo para formateo correcto
      const formattedUrl = helpers.formatUrl(link.url?.trim(), link.type)
      if (!formattedUrl) return true
      
      // Asignar el URL formateado
      link.url = formattedUrl
      return false
    })
    
    if (invalidLinks.length > 0) {
      invalidLinks.forEach(link => link.error = true)
      throw new Error(`Links inválidos: ${invalidLinks.map(l => l.title || 'sin título').join(', ')}`)
    }
  }

  const removeLink = (index) => {
    if (state.links.value[index].id) {
      state.links.value[index]._deleted = true
    } else {
      state.links.value.splice(index, 1)
    }
    
    state.links.value = state.links.value
      .filter(link => !link._deleted)
      .map((link, i) => ({ ...link, position: i }))
  }

  const loadProfile = async () => {
    try {
      state.loading.value = true
      state.error.value = ''

      let profileData
      
      if (initialSlug) {
        const { data, error } = await api.getFullProfileBySlug(initialSlug)
        if (error || !data) throw new Error('Perfil no encontrado')
        profileData = data
      } else if (profileId) {
        const { data, error } = await api.getById('profiles', profileId)
        if (error || !data) throw new Error('Perfil no encontrado')
        profileData = data
      } else {
        throw new Error('Se requiere ID o slug del perfil')
      }

      state.displayName.value = profileData.display_name || ''
      state.tagline.value = profileData.tagline || ''
      state.description.value = profileData.description || ''
      state.profileSlug.value = profileData.slug || ''
      state.slug.value = profileData.slug || ''

      // Asegurar que los links tengan el type correcto
      state.links.value = (profileData.links || []).map(link => {
        const linkType = linkTypesStore.getLinkType(link.type)
        return {
          ...link,
          needsName: linkType.needsName || false,
          error: false
        }
      })
    } catch (err) {
      state.error.value = helpers.extractErrorMessage(err)
    } finally {
      state.loading.value = false
    }
  }

  const prepareLinks = () => {
    return state.links.value
      .filter(link => !link._deleted)
      .map((link, i) => ({
        id: link.id || undefined,
        title: link.title?.trim() || '',
        url: helpers.formatUrl(link.url?.trim(), link.type) || '',
        position: i,
        profile_id: profileId,
        type: link.type || 'custom'
      }))
  }

  const saveProfile = async () => {
    try {
      state.loading.value = true;
      state.error.value = '';
      state.errorField.value = '';

      if (!userStore.user) {
        throw new Error('Debes iniciar sesión para guardar un perfil');
      }

      if (!state.displayName.value.trim()) {
        state.errorField.value = 'displayName';
        throw new Error('El nombre público es obligatorio');
      }

      // Validar slug si se proporciona
      if (state.slug.value && !validateSlug(state.slug.value)) {
        state.errorField.value = 'slug';
        throw new Error('El slug solo puede contener letras minúsculas, números y guiones. Mínimo 3 caracteres.');
      }

      // Verificar disponibilidad del slug si se proporciona
      if (state.slug.value) {
        const { available, error: checkError } = await api.checkSlugAvailability(
          state.slug.value,
          'profiles',
          profileId || undefined // Solo pasa el ID si existe
        );

        if (checkError) throw checkError;
        if (!available) {
          state.errorField.value = 'slug';
          throw new Error('El slug ya está en uso');
        }
      }

      validateLinks(state.links.value);
      const formattedLinks = prepareLinks();

      if (profileId) {
        return await updateExistingProfile(formattedLinks);
      } else {
        return await createNewProfile(formattedLinks);
      }
    } catch (err) {
      state.error.value = err.message;
      console.error('Error en saveProfile:', err);
      return false;
    } finally {
      state.loading.value = false;
    }
  }

  const createNewProfile = async (links) => {
    // Si no se proporciona slug, generar uno basado en el nombre
    const finalSlug = state.slug.value || helpers.generateSlug(state.displayName.value)

    const { available, error: slugError } = await api.checkSlugAvailability(finalSlug)
    if (slugError || !available) {
      throw new Error('El slug ya está en uso. Por favor, elige otro.')
    }

    const profileData = {
      display_name: state.displayName.value.trim(),
      tagline: state.tagline.value.trim(),
      description: state.description.value.trim(),
      slug: finalSlug,
      active: true,
      user_id: userStore.user.id
    }

    const { data: profile, error: profileError } = await userStore.createProfile(profileData)
    if (profileError) throw profileError

    const linksWithProfileId = links.map(link => ({
      ...link,
      profile_id: profile.id
    }))

    const { data: createdLinks, error: linksError } = await api.create('links', linksWithProfileId)
    if (linksError) throw linksError

    state.links.value = createdLinks || linksWithProfileId
    return profile
  }

  const updateExistingProfile = async (links) => {
    try {
      const { error: profileError } = await userStore.updateProfile(profileId, {
        display_name: state.displayName.value.trim(),
        tagline: state.tagline.value.trim(),
        description: state.description.value.trim(),
        slug: state.slug.value.trim() // Actualizar el slug si ha cambiado
      })
      
      if (profileError) throw profileError

      const linksToSave = links.map((link, i) => ({
        ...link,
        title: link.title.trim(),
        url: helpers.formatUrl(link.url.trim(), link.type),
        position: i,
        profile_id: profileId
      }))

      const { data: updatedLinks, error: linksError } = await api.updateProfileLinks(profileId, linksToSave)
      if (linksError) throw linksError

      state.links.value = updatedLinks || []
      return true
    } catch (err) {
      state.error.value = `Error al guardar cambios: ${err.message}`
      console.error('Error en updateExistingProfile:', err)
      return false
    }
  }

  return {
    ...state,
    publicUrl,
    addLink,
    removeLink,
    loadProfile,
    saveProfile,
    validateSlug,
    checkSlugAvailability,
    onSlugInput
  }
}