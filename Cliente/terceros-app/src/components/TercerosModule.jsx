import React, { useState } from 'react';

// Datos de prueba basados en tu estructura actual
const mockTerceros = [
  { id: 1, nit: '830011790', nombre: 'Alvaro Peña Moreno', telefono: '3115618736', direccion: 'Calle 128 B No. 18-11', ciudad: 'Bogotá', email: 'alvaro@ejemplo.com' },
  { id: 2, nit: '80555321', nombre: 'Catalina Jaramillo', telefono: '3112334543', direccion: 'Carrera 230 No. 23 -45', ciudad: 'Medellín', email: 'catalina@gmail.com' },
  { id: 3, nit: '9002', nombre: 'BCH663.BMW 318I/93', telefono: '6167753', direccion: 'CR 53 103B 20', ciudad: 'Bogotá', email: 'email@email.com' },
];

export default function TercerosModule() {
  const [selectedTercero, setSelectedTercero] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      
      {/* Encabezado del Módulo */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Directorio de Terceros</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona los clientes, proveedores y contactos de la plataforma.</p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          + Nuevo Registro
        </button>
      </div>

      {/* Barra de Herramientas y Filtros */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por NIT o Nombre..."
          className="w-full max-w-md rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Filtros Avanzados
        </button>
      </div>

      {/* Contenedor de la Tabla (Maestro) */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto h-[600px]"> {/* Altura fija para scroll interno */}
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="sticky top-0 bg-gray-100 uppercase text-gray-700 text-xs font-semibold z-10 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">NIT</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Ciudad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockTerceros.map((tercero) => (
                <tr 
                  key={tercero.id} 
                  onClick={() => setSelectedTercero(tercero)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">{tercero.id}</td>
                  <td className="px-6 py-3">{tercero.nit}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{tercero.nombre}</td>
                  <td className="px-6 py-3">{tercero.telefono}</td>
                  <td className="px-6 py-3">{tercero.ciudad}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">Ver detalle</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Lateral Deslizante (Detalle / Update) */}
      {selectedTercero && (
        <>
          {/* Overlay oscuro de fondo */}
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedTercero(null)}
          />
          
          {/* Panel Lateral */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Detalle del Registro</h2>
              <button 
                onClick={() => setSelectedTercero(null)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              {/* Formulario de vista/edición */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIT</label>
                  <input type="text" defaultValue={selectedTercero.nit} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Razón Social / Nombre</label>
                  <input type="text" defaultValue={selectedTercero.nombre} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input type="text" defaultValue={selectedTercero.telefono} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                    <input type="text" defaultValue={selectedTercero.ciudad} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input type="text" defaultValue={selectedTercero.direccion} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input type="email" defaultValue={selectedTercero.email} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 absolute bottom-0 w-full">
              <button 
                onClick={() => setSelectedTercero(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
                Guardar Cambios
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}