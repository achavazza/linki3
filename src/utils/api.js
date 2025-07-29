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
   * @param {Partial<T>} record - Datos del registro
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
   * @param {string} [field='slug'] - Campo a verificar
   * @returns {Promise<SlugAvailability>}
   */
  async checkSlugAvailability(slug, table = 'profiles', field = 'slug') {
    const { data, error } = await this.executeQuery(
      supabase.from(table).select('id').eq(field, slug).maybeSingle(),
      'Error al verificar disponibilidad de slug'
    )
    
    return {
      available: !data,
      error
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
      const { error: deleteError } = await this.executeQuery(
        supabase.from('links')
          .delete()
          .eq('profile_id', profileId)
      );
      
      if (deleteError) throw deleteError;
      
      // 2. Validar que hay links para insertar
      if (!links || links.length === 0) {
        return { data: [], error: null };
      }
      
      // 3. Insertar los nuevos links
      const { data, error } = await this.executeQuery(
        supabase.from('links')
          .insert(links)
          .select()
      );
      
      if (error) throw error;
      
      // Verificar que se crearon los links
      if (!data || data.length === 0) {
        throw new Error('No se crearon los links');
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error en updateProfileLinks:', error);
      return { data: null, error };
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
  }
}