import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Declarar qz como variable global
declare global {
  interface Window {
    qz: any;
  }
}

function App() {
  const [count, setCount] = useState(0)
  const [qzReady, setQzReady] = useState(false)
  const [printers, setPrinters] = useState<string[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')

  // Obtener la URL base de manera dinámica
  const baseUrl = window.location.origin

  useEffect(() => {
    // Cargar el script de QZ Tray
    const script = document.createElement('script')
    script.src = '/qz-tray.js'
    script.onload = () => {
      initializeQZ()
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const initializeQZ = async () => {
    try {
      if (!window.qz) {
        console.error('QZ Tray no está disponible')
        return
      }

      // Conectar a QZ Tray
      await window.qz.websocket.connect()
      console.log('Conectado a QZ Tray')
      setQzReady(true)

      // Obtener lista de impresoras
      const printerList = await window.qz.printers.find()
      setPrinters(printerList)
      
      // Seleccionar automáticamente una impresora térmica si existe
      const thermalPrinter = printerList.find((p: string) => 
        p.toLowerCase().includes('thermal') || 
        p.toLowerCase().includes('80mm') ||
        p.toLowerCase().includes('pos')
      )
      if (thermalPrinter) {
        setSelectedPrinter(thermalPrinter)
      }
    } catch (error) {
      console.error('Error conectando a QZ Tray:', error)
    }
  }

  const printReceipt = async () => {
    if (!selectedPrinter) {
      alert('Por favor selecciona una impresora')
      return
    }

    try {
      const config = window.qz.configs.create(selectedPrinter)
      // Datos ESC/POS para impresora térmica de 80mm
      const data = [
        '\x1B\x40', // Inicializar impresora
        '\x1B\x61\x01', // Centrar texto
        '\x1D\x21\x11', // Texto doble tamaño
        'TICKET DE PRUEBA\n',
        '\x1D\x21\x00', // Tamaño normal
        '\x1B\x61\x00', // Alinear izquierda
        '================================\n',
        'Producto 1           $10.00\n',
        'Producto 2           $15.50\n',
        '================================\n',
        '\x1B\x61\x02', // Alinear derecha
        'Total: $25.50\n',
        '\x1B\x61\x01', // Centrar
        '\n\nGracias por su compra!\n',
        '\x1D\x56\x42\x00' // Cortar papel
      ]

      await window.qz.print(config, data)
      console.log('Impresión enviada correctamente')
    } catch (error) {
      console.error('Error al imprimir:', error)
      alert('Error al imprimir: ' + error)
    }
  }

  const printImage = async () => {
    if (!selectedPrinter) {
      alert('Por favor selecciona una impresora')
      return
    }

    try {
      const config = window.qz.configs.create(selectedPrinter)
      // URL dinámica de la imagen
      const imageUrl = `${baseUrl}/miimagen.png`
      await window.qz.print(config, [{ type: 'image', data: imageUrl }])
      console.log('Imagen enviada a imprimir')
    } catch (error) {
      console.error('Error al imprimir imagen:', error)
      alert('Error al imprimir imagen: ' + error)
    }
  }  

  const printPDF = async () => {
    if (!selectedPrinter) {
      alert('Por favor selecciona una impresora')
      return
    }

    try {
      const config = window.qz.configs.create(selectedPrinter)
      // URL dinámica del PDF
      const pdfUrl = `${baseUrl}/miarchivo.pdf`
      await window.qz.print(config, [{ type: 'pdf', data: pdfUrl }])
      console.log('PDF enviado a imprimir')
    } catch (error) {
      console.error('Error al imprimir PDF:', error)
      alert('Error al imprimir PDF: ' + error)
    }
  }

  const printA4PDF = async () => {
    if (!selectedPrinter) {
      alert('Por favor selecciona una impresora')
      return
    }

    try {
      const config = window.qz.configs.create(selectedPrinter)
      // URL dinámica del PDF A4
      const pdfUrl = `${baseUrl}/miarchivoA4.pdf`
      await window.qz.print(config, [{ type: 'pdf', data: pdfUrl }])
      console.log('PDF A4 enviado a imprimir')
    } catch (error) {
      console.error('Error al imprimir PDF A4:', error)
      alert('Error al imprimir PDF A4: ' + error)
    }
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>QZ Tray + React</h1>
      
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <p>Estado QZ Tray: {qzReady ? '✅ Conectado' : '❌ Desconectado'}</p>
        </div>

        {qzReady && (
          <div style={{ marginBottom: '20px' }}>
            <label>Seleccionar impresora:</label>
            <select 
              value={selectedPrinter} 
              onChange={(e) => setSelectedPrinter(e.target.value)}
              style={{ margin: '10px', padding: '5px' }}
            >
              <option value="">-- Seleccionar --</option>
              {printers.map((printer, index) => (
                <option key={index} value={printer}>{printer}</option>
              ))}
            </select>
          </div>
        )}

        <button 
          onClick={printReceipt}
          disabled={!qzReady || !selectedPrinter}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: qzReady && selectedPrinter ? '#007acc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: qzReady && selectedPrinter ? 'pointer' : 'not-allowed'
          }}
        >
          Imprimir Ticket (80mm)
        </button>

        <button
          onClick={printPDF}
          disabled={!qzReady || !selectedPrinter}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: qzReady && selectedPrinter ? '#007acc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: qzReady && selectedPrinter ? 'pointer' : 'not-allowed',
            marginTop: '10px'
          }}
        >
          Imprimir PDF
        </button>
        <button
          onClick={printA4PDF}
          disabled={!qzReady || !selectedPrinter}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: qzReady && selectedPrinter ? '#007acc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: qzReady && selectedPrinter ? 'pointer' : 'not-allowed',
            marginTop: '10px'
          }}
        >
          Imprimir PDF A4
        </button>
        <button
          onClick={printImage}
          disabled={!qzReady || !selectedPrinter}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: qzReady && selectedPrinter ? '#007acc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: qzReady && selectedPrinter ? 'pointer' : 'not-allowed',
            marginTop: '10px'
          }}
        >
          Imprimir Imagen
        </button>
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </div>
    </>
  )
}

export default App