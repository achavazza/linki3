import { supabase } from '@/supabase'

/**
 * @typedef {Object} QueryResult
 * @property {any|null} data - Los datos devueltos por la consulta
 * @property {Error|null} error - El error ocurrido, si aplica
 */

/**
 * @typedef {Object} SlugAvailability
 * @property {boolean} available - Indica si el slug está disponible
 * @property {Error|null} error - Error ocurrido durante la verificación
 */

export const api = {
  /**
   * Ejecuta una consulta con manejo de errores estándar
   * @template T
   * @param {import('@supabase/supabase-js').PostgrestQueryBuilder<T>} query - La consulta de Supabase
   * @param {string} [errorMessage='Error en la operación'] - Mensaje de error personalizado
   * @returns {Promise<QueryResult>}
   */
  async executeQuery(query, errorMessage = 'Error en la operación') {
    try {
      const { data, error } = await query
      
      if (error) {
        console.error(`${errorMessage}:`, error)
        return { data: null, error: new Error(error.message) }
      }
      
      return { data, error: null }
    } catch (err) {
      console.error(`${errorMessage}:`, err)
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  },

  /**
   * Obtiene un único registro por ID
   * @template T
   * @param {string} table - Nombre de la tabla
   * @param {string|number} id - ID del registro
   * @returns {Promise<QueryResult<T>>}
   */
  async getById(table, id) {
    return this.executeQuery(
      supabase.from(table).select('*').eq('id', id).single(),
      `Error al obtener ${table} por ID`
    )
  },

  /**
   * Obtiene un único registro por slug
   * @template T
   * @param {string} table - Nombre de la tabla
   * @param {string} slug - Slug del registro
   * @returns {Promise<QueryResult<T>>}
   */
  async getBySlug(table, slug) {
    return this.executeQuery(
      supabase.from(table).select('*').eq('slug', slug).single(),
      `Error al obtener ${table} por slug`
    )
  },

  /**
   * Obtiene todos los registros de una tabla con filtros opcionales
   * @template T
   * @param {string} table - Nombre de la tabla
   * @param {Object.<string, any>} [filters={}] - Filtros a aplicar
   * @param {string} [orderBy='created_at'] - Campo para ordenar
   * @param {boolean} [ascending=true] - Orden ascendente
   * @param {string[]} [select='*'] - Campos a seleccionar
   * @returns {Promise<QueryResult<T[]>>}
   */
  async getAll(
    table, 
    filters = {}, 
    orderBy = 'created_at', 
    ascending = true,
    select = '*'
  ) {
    let query = supabase.from(table).select(select)
    
    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    
    // Ordenar si se especifica
    if (orderBy) {
      query = query.order(orderBy, { ascending })
    }
    
    return this.executeQuery(query, `Error al obtener registros de ${table}`)
  },

  /**
   * Crea un nuevo registro
   * @template T
   * @param {string} table - Nombre de la tabla
   * @param {Partial<T>|Partial<T>[]} records - Datos del registro o array de registros
   * @returns {Promise<QueryResult<T>>}
   */
  async create(table, records) {
    // Si es un array, usar insert en lugar de insert().single()
    if (Array.isArray(records)) {
      return this.executeQuery(
        supabase.from(table).insert(records).select(),
        `Error al crear registros en ${table}`
      )
    }
    // Para un solo registro
    return this.executeQuery(
      supabase.from(table).insert(records).select().single(),
      `Error al crear registro en ${table}`
    )
  },

  /**
   * Actualiza un registro
   * @template T
   * @param {string} table - Nombre de la tabla
   * @param {string|number} id - ID del registro
   * @param {Partial<T>} updates - Campos a actualizar
   * @returns {Promise<QueryResult<T>>}
   */
  async update(table, id, updates) {
    return this.executeQuery(
      supabase.from(table).update(updates).eq('id', id).select().single(),
      `Error al actualizar registro en ${table}`
    )
  },

  /**
   * Elimina un registro
   * @param {string} table - Nombre de la tabla
   * @param {string|number} id - ID del registro
   * @returns {Promise<QueryResult<void>>}
   */
  async delete(table, id) {
    return this.executeQuery(
      supabase.from(table).delete().eq('id', id),
      `Error al eliminar registro de ${table}`
    )
  },

  /**
   * Verifica si un slug está disponible
   * @param {string} slug - Slug a verificar
   * @param {string} [table='profiles'] - Tabla donde verificar
   * @param {string} [excludeId] - ID a excluir (para actualizaciones)
   * @returns {Promise<SlugAvailability>}
   */
  async checkSlugAvailability(slug, table = 'profiles', excludeId = null) {
    try {
      let query = supabase.from(table)
        .select('id')
        .eq('slug', slug);
      
      // Solo agregamos la condición neq si tenemos un excludeId válido
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Error checking slug availability:', error);
        return { available: false, error: new Error(error.message) };
      }
      
      return {
        available: !data,
        error: null
      };
    } catch (err) {
      console.error('Error in checkSlugAvailability:', err);
      return {
        available: false,
        error: err instanceof Error ? err : new Error(String(err))
      };
    }
  },

  /**
   * Obtiene un perfil completo por slug (con sus links)
   * @param {string} slug - Slug del perfil
   * @returns {Promise<QueryResult>}
   */
  async getFullProfileBySlug(slug) {
    try {
      // 1. Obtener el perfil principal
      const { data: profile, error: profileError } = await this.getBySlug('profiles', slug)
      
      if (profileError || !profile) {
        return { data: null, error: profileError || new Error('Perfil no encontrado') }
      }
      
      // 2. Obtener los links del perfil
      const { data: links, error: linksError } = await this.getAll(
        'links',
        { profile_id: profile.id },
        'position'
      )
      
      if (linksError) {
        console.error('Error al obtener links del perfil:', linksError)
        // Devolver el perfil sin links en este caso
        return { data: { ...profile, links: [] }, error: null }
      }
      
      return { 
        data: { 
          ...profile, 
          links: links || [] 
        }, 
        error: null 
      }
    } catch (err) {
      console.error('Error en getFullProfileBySlug:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Crea un nuevo perfil con validación de slug
   * @param {Object} profileData - Datos del perfil (debe incluir slug)
   * @param {Array} [links=[]] - Links del perfil
   * @returns {Promise<QueryResult>}
   */
  async createProfileWithSlug(profileData, links = []) {
    try {
      // Validar que el slug venga en los datos
      if (!profileData.slug) {
        throw new Error('El slug es requerido para crear un perfil')
      }

      // 1. Verificar que el slug esté disponible
      const { available, error: slugError } = await this.checkSlugAvailability(profileData.slug)
      
      if (slugError) throw slugError
      if (!available) throw new Error('El slug ya está en uso')

      // 2. Crear el perfil
      const { data: profile, error: profileError } = await this.create('profiles', profileData)
      
      if (profileError || !profile) {
        throw profileError || new Error('Error al crear el perfil')
      }

      // 3. Si hay links, crearlos
      if (links.length > 0) {
        const linksWithProfileId = links.map(link => ({
          ...link,
          profile_id: profile.id
        }))

        const { error: linksError } = await this.create('links', linksWithProfileId)
        if (linksError) throw linksError
      }

      // 4. Devolver el perfil con sus links
      return await this.getFullProfileBySlug(profile.slug)
    } catch (err) {
      console.error('Error en createProfileWithSlug:', err)
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  },

  /**
   * Actualiza un perfil y sus links con validación de slug
   * @param {string} profileId - ID del perfil a actualizar
   * @param {Object} profileData - Nuevos datos del perfil
   * @param {Array} links - Nuevos links del perfil
   * @returns {Promise<QueryResult>}
   */
  async updateProfileWithSlug(profileId, profileData, links = []) {
    try {
      // Si se está actualizando el slug, verificar disponibilidad
      if (profileData.slug) {
        const { available, error: slugError } = await this.checkSlugAvailability(
          profileData.slug,
          'profiles',
          profileId
        )
        
        if (slugError) throw slugError
        if (!available) throw new Error('El nuevo slug ya está en uso')
      }

      // 1. Actualizar el perfil
      const { data: profile, error: profileError } = await this.update(
        'profiles',
        profileId,
        profileData
      )
      
      if (profileError || !profile) {
        throw profileError || new Error('Error al actualizar el perfil')
      }

      // 2. Actualizar los links (primero eliminar los existentes)
      await this.deleteAllProfileLinks(profileId)

      if (links.length > 0) {
        const linksWithProfileId = links.map((link, index) => ({
          ...link,
          profile_id: profileId,
          position: index
        }))

        const { error: linksError } = await this.create('links', linksWithProfileId)
        if (linksError) throw linksError
      }

      // 3. Devolver el perfil actualizado con sus links
      return await this.getFullProfileBySlug(profile.slug)
    } catch (err) {
      console.error('Error en updateProfileWithSlug:', err)
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  },

  /**
   * Realiza una consulta personalizada con paginación
   * @template T
   * @param {string} table - Nombre de la tabla
   * @param {Object} options - Opciones de consulta
   * @param {string} [options.select='*'] - Campos a seleccionar
   * @param {Object} [options.filters={}] - Filtros a aplicar
   * @param {string} [options.orderBy] - Campo para ordenar
   * @param {boolean} [options.ascending=true] - Orden ascendente
   * @param {number} [options.page=1] - Página actual
   * @param {number} [options.pageSize=10] - Tamaño de página
   * @returns {Promise<{data: T[], count: number, error: Error|null}>}
   */
  async paginatedQuery(table, options = {}) {
    const {
      select = '*',
      filters = {},
      orderBy,
      ascending = true,
      page = 1,
      pageSize = 10
    } = options
    
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    let query = supabase.from(table)
      .select(select, { count: 'exact' })
      .range(from, to)
    
    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    
    // Ordenar
    if (orderBy) {
      query = query.order(orderBy, { ascending })
    }
    
    try {
      const { data, error, count } = await query
      
      if (error) {
        console.error(`Error en consulta paginada a ${table}:`, error)
        return { data: null, count: 0, error: new Error(error.message) }
      }
      
      return { data, count, error: null }
    } catch (err) {
      console.error(`Error en consulta paginada a ${table}:`, err)
      return { data: null, count: 0, error: err instanceof Error ? err : new Error(String(err)) }
    }
  },

  /**
   * Realiza una operación upsert (insertar o actualizar) en una tabla
   * @template T
   * @param {string} table - Nombre de la tabla
   * @param {Array<Partial<T>>} records - Datos a upsert
   * @param {string} [onConflict='id'] - Campo para conflicto
   * @returns {Promise<QueryResult<T[]>>}
   */
  async upsert(table, records, onConflict = 'id') {
    return this.executeQuery(
      supabase.from(table)
        .upsert(records, { onConflict })
        .select(),
      `Error al hacer upsert en ${table}`
    )
  },

  /**
   * Actualiza los links de un perfil (elimina los antiguos y crea nuevos)
   * @param {string} profileId - ID del perfil
   * @param {Array} links - Lista de links a guardar
   * @returns {Promise<QueryResult>}
   */
  async updateProfileLinks(profileId, links) {
    try {
      // 1. Primero eliminar los links existentes
      const { error: deleteError } = await supabase
        .from('links')
        .delete()
        .eq('profile_id', profileId)
      
      if (deleteError) throw deleteError
      
      // 2. Si no hay links para insertar, retornar éxito
      if (!links || links.length === 0) {
        return { data: [], error: null }
      }
      
      // 3. Preparar los datos para insertar (asegurando el campo type)
      const linksToInsert = links.map(link => ({
        title: link.title,
        url: link.url,
        position: link.position,
        profile_id: profileId,
        type: link.type || 'custom' // Valor por defecto si no viene type
      }))
      
      // 4. Insertar los nuevos links
      const { data, error } = await supabase
        .from('links')
        .insert(linksToInsert)
        .select()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error en updateProfileLinks:', error)
      return { data: null, error }
    }
  },

  /**
   * Elimina todos los links de un perfil
   * @param {string} profileId - ID del perfil
   * @returns {Promise<QueryResult>}
   */
  async deleteAllProfileLinks(profileId) {
    return this.executeQuery(
      supabase.from('links').delete().eq('profile_id', profileId),
      `Error al eliminar links del perfil ${profileId}`
    )
  },

  /**
   * Obtiene perfiles sugeridos basados en búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} [limit=5] - Límite de resultados
   * @returns {Promise<QueryResult>}
   */
  async searchProfiles(searchTerm, limit = 5) {
    return this.executeQuery(
      supabase.from('profiles')
        .select('*')
        .or(`display_name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(limit),
      'Error al buscar perfiles'
    )
  }
}