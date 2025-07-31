import { nextTick } from 'vue'
import { helpers } from '@/utils/helpers'

export const useQr = () => {
  /**
   * Descarga un QR como PNG desde un <canvas>
   * @param {Ref<HTMLCanvasElement>} canvasRef
   * @param {string} filename - Nombre del archivo sin extensión
   */
  const downloadQr = async (canvasRef, filename) => {
    try {
      await nextTick()

      const canvas = canvasRef.value
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('No se encontró un elemento <canvas> válido')
      }

      const url = canvas.toDataURL('image/png')
      helpers.downloadFile(url, `${filename}.png`, 'image/png')
    } catch (error) {
      console.error('Error al descargar QR PNG:', error)
      throw new Error('No se pudo generar el código QR en PNG.')
    }
  }

  /**
   * Descarga un QR como SVG desde un <svg>
   * @param {Ref<SVGElement>} svgRef
   * @param {string} filename - Nombre del archivo sin extensión
   */
  const downloadQrSvg = async (svgRef, filename) => {
    try {
      await nextTick()

      const svg = svgRef.value
      if (!(svg instanceof SVGElement)) {
        throw new Error('No se encontró un elemento <svg> válido')
      }

      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svg)

      helpers.downloadFile(svgString, `${filename}.svg`, 'image/svg+xml')
    } catch (error) {
      console.error('Error al descargar QR SVG:', error)
      throw new Error('No se pudo generar el código QR en SVG.')
    }
  }

  /**
   * Genera un QR en base64 (Data URL)
   * @param {string} text
   * @param {number} [size=150]
   * @param {string} [level='M']
   * @param {'png'|'svg'} [format='png']
   * @returns {Promise<string>} - Data URL del QR
   */
  const generateQrDataUrl = async (text, size = 150, level = 'M', format = 'png') => {
    try {
      const tempDiv = document.createElement('div')
      document.body.appendChild(tempDiv)

      const qrComponent = document.createElement('div')
      qrComponent.innerHTML = `<qrcode-vue value="${text}" size="${size}" level="${level}" render-as="${format}" />`
      tempDiv.appendChild(qrComponent)

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
      throw new Error('No se pudo generar el código QR como Data URL.')
    }
  }

  return {
    downloadQr,
    downloadQrSvg,
    generateQrDataUrl
  }
}
