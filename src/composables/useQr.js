import { nextTick } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { helpers } from '@/utils/helpers'

export const useQr = () => {
  /**
   * Genera y descarga un QR en formato PNG
   * @param {Ref} canvasRef - Referencia al contenedor del canvas
   * @param {string} filename - Nombre del archivo (sin extensión)
   * @param {string} [text] - Texto opcional para el QR (si no se usa el componente)
   * @param {number} [size=150] - Tamaño del QR
   * @param {string} [level='M'] - Nivel de corrección de errores (L, M, Q, H)
   */
  const downloadQr = async (canvasRef, filename, text = null, size = 150, level = 'M') => {
    try {
      await nextTick()
      
      let canvas
      let tempDiv = null
      
      if (canvasRef?.value) {
        canvas = canvasRef.value.querySelector('canvas')
      }
      
      // Si no hay canvasRef pero hay texto, generamos QR dinámicamente
      if (!canvas && text) {
        tempDiv = document.createElement('div')
        tempDiv.style.position = 'absolute'
        tempDiv.style.left = '-9999px'
        document.body.appendChild(tempDiv)
        
        const QrComponent = {
          template: '<qrcode-vue :value="text" :size="size" :level="level" render-as="canvas" />',
          components: { QrcodeVue },
          props: ['text', 'size', 'level']
        }
        
        const app = createApp(QrComponent, { text, size, level })
        app.mount(tempDiv)
        await nextTick()
        canvas = tempDiv.querySelector('canvas')
      }
      
      if (!canvas) {
        throw new Error('No se pudo generar el código QR')
      }

      const url = canvas.toDataURL('image/png')
      helpers.downloadFile(url, `${filename}.png`, 'image/png')
      
    } catch (error) {
      console.error('Error al descargar QR:', error)
      throw new Error('No se pudo generar el código QR. Asegúrate de que el perfil tenga un nombre válido.')
    } finally {
      if (tempDiv) {
        document.body.removeChild(tempDiv)
      }
    }
  }

  /**
   * Genera y descarga un QR en formato SVG
   * @param {Ref} svgRef - Referencia al contenedor del SVG
   * @param {string} filename - Nombre del archivo (sin extensión)
   * @param {string} [text] - Texto opcional para el QR (si no se usa el componente)
   * @param {number} [size=150] - Tamaño del QR
   * @param {string} [level='M'] - Nivel de corrección de errores (L, M, Q, H)
   */
  const downloadQrSvg = async (svgRef, filename, text = null, size = 150, level = 'M') => {
    try {
      await nextTick()
      
      let svg
      
      if (svgRef.value) {
        svg = svgRef.value.querySelector('svg')
      }
      
      // Si no hay svgRef pero hay texto, generamos QR dinámicamente
      if (!svg && text) {
        const tempDiv = document.createElement('div')
        document.body.appendChild(tempDiv)
        
        const QrComponent = {
          template: '<qrcode-vue :value="text" :size="size" :level="level" render-as="svg" />',
          components: { QrcodeVue },
          props: ['text', 'size', 'level']
        }
        
        const app = createApp(QrComponent, { text, size, level })
        app.mount(tempDiv)
        await nextTick()
        svg = tempDiv.querySelector('svg')
      }
      
      if (!svg) {
        throw new Error('No se pudo generar el código QR')
      }
      
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svg)
      
      helpers.downloadFile(svgString, `${filename}.svg`, 'image/svg+xml')
      
      if (text) {
        document.body.removeChild(svg.parentElement)
      }
    } catch (error) {
      console.error('Error al descargar QR SVG:', error)
      throw new Error('No se pudo descargar el código QR en formato SVG')
    }
  }

  /**
   * Genera un QR como Data URL (para previsualización)
   * @param {string} text - Texto para codificar
   * @param {number} [size=150] - Tamaño del QR
   * @param {string} [level='M'] - Nivel de corrección de errores
   * @param {string} [format='png'] - Formato de salida (png o svg)
   * @returns {Promise<string>} - Data URL del QR
   */
  const generateQrDataUrl = async (text, size = 150, level = 'M', format = 'png') => {
    try {
      const tempDiv = document.createElement('div')
      document.body.appendChild(tempDiv)
      
      const QrComponent = {
        template: `<qrcode-vue :value="text" :size="size" :level="level" render-as="${format}" />`,
        components: { QrcodeVue },
        props: ['text', 'size', 'level']
      }
      
      const app = createApp(QrComponent, { text, size, level })
      app.mount(tempDiv)
      await nextTick()
      
      let dataUrl
      if (format === 'png') {
        const canvas = tempDiv.querySelector('canvas')
        if (!canvas) throw new Error('No se pudo generar el QR')
        dataUrl = canvas.toDataURL('image/png')
      } else {
        const svg = tempDiv.querySelector('svg')
        if (!svg) throw new Error('No se pudo generar el QR')
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        const serializer = new XMLSerializer()
        const svgString = serializer.serializeToString(svg)
        dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`
      }
      
      document.body.removeChild(tempDiv)
      return dataUrl
    } catch (error) {
      console.error('Error al generar QR:', error)
      throw new Error('No se pudo generar el código QR')
    }
  }

  return {
    QrcodeVue,
    downloadQr,
    downloadQrSvg,
    generateQrDataUrl
  }
}