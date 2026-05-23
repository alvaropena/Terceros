import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// --- FUNCIÓN FETCH ACTUALIZADA PARA SOPORTAR FILTROS ---
const fetchTerceros = async ({ queryKey }) => {
  const [_key, pageIndex, searchTerm, advancedFilters] = queryKey;
  const paginaDjango = pageIndex + 1; 

  const url = new URL('http://127.0.0.1:8000/api/terceros/');
  url.searchParams.append('page', paginaDjango);
  
  if (searchTerm) {
    url.searchParams.append('search', searchTerm);
  }

  // Recorremos los filtros avanzados y los agregamos a la URL si no están vacíos
  if (advancedFilters) {
    Object.keys(advancedFilters).forEach(key => {
      if (advancedFilters[key] !== '') {
        url.searchParams.append(key, advancedFilters[key]);
      }
    });
  }

  const respuesta = await fetch(url.toString());
  if (!respuesta.ok) {
    throw new Error('Hubo un problema contactando al servidor');
  }
  return respuesta.json();
};

export default function DirectorioTerceros() {
  const queryClient = useQueryClient();

  // --- ESTADOS DE VISTA Y BÚSQUEDA ---
  const [vistaActual, setVistaActual] = useState('lista'); 
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS DE FILTROS AVANZADOS NUEVOS ---
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    nombres: '',
    telefono_1: '',
    telefono_2: '',
    pais: '',
    regimen: '',
    autoretenedor: '',
    pos_num: ''
  });
  // Estado temporal para el modal antes de hacer clic en "Aplicar"
  const [tempFilters, setTempFilters] = useState(advancedFilters); 

  // --- ESTADOS DEL MODAL DE TERCEROS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); 
  const [terceroSeleccionado, setTerceroSeleccionado] = useState(null);

  const estadoInicialFormulario = {
    nit: '', digito: '', nombres: '', tipo_identificacion: 'N',
    telefono_1: '', telefono_2: '', ciudad: '', direccion: '', 
    mail: '', regimen: 'No especificado', 
    gran_contribuyente: 0, autoretenedor: 0, pos_num: '',
    fax: '', apartado_aereo: '', pais: 'Colombia'
  };

  const [formData, setFormData] = useState(estadoInicialFormulario);

  // --- CONFIGURACIÓN AG GRID ---
  const gridRef = useRef();

  const columnDefs = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 90, filter: 'agNumberColumnFilter' },
    { field: 'nit', headerName: 'NIT', filter: 'agTextColumnFilter' },
    { field: 'nombres', headerName: 'NOMBRE', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'telefono_1', headerName: 'TELÉFONO', filter: 'agTextColumnFilter' },
    { field: 'ciudad', headerName: 'CIUDAD', filter: 'agTextColumnFilter' },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    floatingFilter: true,
  }), []);

  const exportarCSV = () => {
    gridRef.current.api.exportDataAsCsv({
      fileName: 'Terceros_Exportacion.csv'
    });
  };

  // --- CONSULTAS AL BACKEND (TanStack Query) ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['terceros', page, searchTerm, advancedFilters], 
    queryFn: fetchTerceros,
    keepPreviousData: true, 
  });

  const crearMutacion = useMutation({
    mutationFn: async (nuevoRegistro) => {
      const respuesta = await fetch('http://127.0.0.1:8000/api/terceros/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRegistro)
      });
      if (!respuesta.ok) throw new Error(JSON.stringify(await respuesta.json())); 
      return respuesta.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['terceros']);
      cerrarModal();
      alert("¡Tercero guardado con éxito!");
    },
    onError: (error) => alert("Django rechazó los datos:\n" + error.message)
  });

  const actualizarMutacion = useMutation({
    mutationFn: async (datosActualizados) => {
      const respuesta = await fetch(`http://127.0.0.1:8000/api/terceros/${datosActualizados.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      });
      if (!respuesta.ok) throw new Error(JSON.stringify(await respuesta.json())); 
      return respuesta.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['terceros']);
      cerrarModal();
      alert("¡Registro actualizado con éxito!");
    },
    onError: (error) => alert("Django rechazó los datos:\n" + error.message)
  });

  // --- MANEJADORES DE EVENTOS ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleIntegerChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value, 10) });
  };

  const guardarCambios = () => {
    if (modalMode === 'crear') crearMutacion.mutate(formData);
    else if (modalMode === 'editar') actualizarMutacion.mutate(formData);
  };

  // --- MANEJADORES DE FILTROS AVANZADOS ---
  const handleTempFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters({ ...tempFilters, [name]: value });
  };

  const aplicarFiltros = () => {
    setAdvancedFilters(tempFilters);
    setPage(0); 
    setIsFilterModalOpen(false);
  };

  const limpiarFiltros = () => {
    const vacio = { nombres: '', telefono_1: '', telefono_2: '', pais: '', regimen: '', autoretenedor: '', pos_num: '' };
    setTempFilters(vacio);
    setAdvancedFilters(vacio);
    setPage(0);
    setIsFilterModalOpen(false);
  };

  // Verifica si hay algún filtro activo para encender la "luz" del botón
  const hayFiltrosActivos = Object.values(advancedFilters).some(val => val !== '');

  // --- MANEJADORES DEL MODAL ---
  const abrirModalCrear = () => {
    setModalMode('crear');
    setTerceroSeleccionado(null);
    setFormData(estadoInicialFormulario);
    setIsModalOpen(true);
  };

  const abrirModalVer = (tercero) => {
    setModalMode('ver');
    setTerceroSeleccionado(tercero);
    setIsModalOpen(true);
  };

  const abrirModalEditar = () => {
    setModalMode('editar');
    setFormData({ ...terceroSeleccionado, telefono_1: terceroSeleccionado.telefono_1 || '', ciudad: terceroSeleccionado.ciudad || '', direccion: terceroSeleccionado.direccion || '', mail: terceroSeleccionado.mail || '', pos_num: terceroSeleccionado.pos_num || '' });
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setTimeout(() => { setTerceroSeleccionado(null); setModalMode(''); setFormData(estadoInicialFormulario); }, 200); 
  };

  const rows = data?.results || [];
  const totalRegistros = data?.count || 0; 
  const totalPages = Math.ceil(totalRegistros / 50);
  const estaGuardando = crearMutacion.isLoading || actualizarMutacion.isLoading;

  return (
    <div className="relative p-8 bg-gray-50 min-h-screen">
      
      {/* --- MODAL DE FILTROS AVANZADOS (AMPLIADO) --- */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-800">Filtros Avanzados</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 text-sm text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nombre o Razón Social</label>
                  <input type="text" name="nombres" value={tempFilters.nombres} onChange={handleTempFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Buscar por nombre..." />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono 1</label>
                  <input type="text" name="telefono_1" value={tempFilters.telefono_1} onChange={handleTempFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Ej: 311..." />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono 2</label>
                  <input type="text" name="telefono_2" value={tempFilters.telefono_2} onChange={handleTempFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">País</label>
                  <input type="text" name="pais" value={tempFilters.pais} onChange={handleTempFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Ej: Colombia" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Número POS</label>
                  <input type="text" name="pos_num" value={tempFilters.pos_num} onChange={handleTempFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Ej: 13" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Régimen</label>
                  <select name="regimen" value={tempFilters.regimen} onChange={handleTempFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">Todos</option>
                    <option value="C">Común</option>
                    <option value="S">Simplificado</option>
                    <option value="No especificado">No especificado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Autorretenedor</label>
                  <select name="autoretenedor" value={tempFilters.autoretenedor} onChange={handleTempFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">Todos</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-slate-50 rounded-b-xl">
              <button onClick={limpiarFiltros} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors">
                Limpiar todo
              </button>
              <div className="flex gap-2">
                <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 border border-gray-300 bg-white rounded-md text-slate-700 hover:bg-gray-100 font-medium text-sm transition-colors shadow-sm">
                  Cancelar
                </button>
                <button onClick={aplicarFiltros} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PRINCIPAL (Crear, Editar, Ver) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {modalMode === 'crear' && 'Registrar Nuevo Tercero'}
                {modalMode === 'editar' && 'Editar Registro'}
                {modalMode === 'ver' && 'Perfil Completo del Tercero'}
              </h2>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-red-500 font-bold text-xl transition-colors">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto text-slate-600">
              {modalMode === 'crear' || modalMode === 'editar' ? (
                <div className="space-y-6">
                  {/* SECCIÓN 1: DATOS BÁSICOS */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm border-b border-gray-200 pb-2 mb-4">Información Comercial</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">NIT / Documento</label><input type="text" name="nit" value={formData.nit || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Ej: 900123456" /></div>
                      <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dígito</label><input type="text" name="digito" value={formData.digito || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Ej: 1" /></div>
                      <div className="col-span-2"><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre o Razón Social</label><input type="text" name="nombres" value={formData.nombres || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Nombre completo..." /></div>
                      <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono Principal</label><input type="text" name="telefono_1" value={formData.telefono_1 || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" /></div>
                      <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ciudad</label><input type="text" name="ciudad" value={formData.ciudad || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" /></div>
                      <div className="col-span-2"><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección</label><input type="text" name="direccion" value={formData.direccion || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" /></div>
                      <div className="col-span-2"><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label><input type="email" name="mail" value={formData.mail || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" /></div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: DATOS TRIBUTARIOS */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-slate-800 text-sm border-b border-gray-200 pb-2 mb-4">Información Tributaria</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Régimen</label>
                        <select name="regimen" value={formData.regimen} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white">
                          <option value="No especificado">No especificado</option><option value="C">Común</option><option value="S">Simplificado</option>
                        </select>
                      </div>
                      <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Número POS</label><input type="text" name="pos_num" value={formData.pos_num || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Ej: 13" /></div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gran Contribuyente</label>
                        <select name="gran_contribuyente" value={formData.gran_contribuyente || 0} onChange={handleIntegerChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white">
                          <option value={0}>NO</option><option value={1}>SÍ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Autoretenedor</label>
                        <select name="autoretenedor" value={formData.autoretenedor || 0} onChange={handleIntegerChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white">
                          <option value={0}>NO</option><option value={1}>SÍ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg">
                    <h3 className="font-bold text-blue-900 text-xl">{terceroSeleccionado?.nombres}</h3>
                    <div className="flex items-center gap-2 mt-1 text-blue-700">
                      <span className="font-semibold">{terceroSeleccionado?.tipo_identificacion === 'C' ? 'Cédula:' : terceroSeleccionado?.tipo_identificacion === 'N' ? 'NIT:' : 'Doc:'}</span>
                      <span>{terceroSeleccionado?.nit} {terceroSeleccionado?.digito ? `- ${terceroSeleccionado.digito}` : ''}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-800 border-b border-gray-200 pb-2 mb-4">Contacto y Ubicación</h4>
                      <div className="space-y-4 text-sm">
                        <div><span className="block text-xs font-bold text-slate-400 uppercase">Correo Electrónico</span><span className="font-medium text-slate-800">{terceroSeleccionado?.mail || 'No registrado'}</span></div>
                        <div className="grid grid-cols-2 gap-4"><div><span className="block text-xs font-bold text-slate-400 uppercase">Teléfono 1</span><span className="font-medium text-slate-800">{terceroSeleccionado?.telefono_1 || '---'}</span></div><div><span className="block text-xs font-bold text-slate-400 uppercase">Teléfono 2</span><span className="font-medium text-slate-800">{terceroSeleccionado?.telefono_2 || '---'}</span></div></div>
                        <div className="grid grid-cols-2 gap-4"><div><span className="block text-xs font-bold text-slate-400 uppercase">Ciudad</span><span className="font-medium text-slate-800">{terceroSeleccionado?.ciudad || '---'}</span></div><div><span className="block text-xs font-bold text-slate-400 uppercase">País</span><span className="font-medium text-slate-800">{terceroSeleccionado?.pais || 'Colombia'}</span></div></div>
                        <div><span className="block text-xs font-bold text-slate-400 uppercase">Dirección</span><span className="font-medium text-slate-800">{terceroSeleccionado?.direccion || 'No registrada'}</span></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 border-b border-gray-200 pb-2 mb-4">Perfil Tributario</h4>
                      <div className="space-y-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div><span className="block text-xs font-bold text-slate-400 uppercase">Régimen</span><span className="font-medium text-slate-800">{terceroSeleccionado?.regimen === 'C' ? 'Común' : terceroSeleccionado?.regimen === 'S' ? 'Simplificado' : terceroSeleccionado?.regimen || 'No especificado'}</span></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><span className="block text-xs font-bold text-slate-400 uppercase">Gran Contribuyente</span><span className={`font-medium px-2 py-1 rounded text-xs ${terceroSeleccionado?.gran_contribuyente === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{terceroSeleccionado?.gran_contribuyente === 1 ? 'SÍ' : 'NO'}</span></div>
                          <div><span className="block text-xs font-bold text-slate-400 uppercase">Autoretenedor</span><span className={`font-medium px-2 py-1 rounded text-xs ${terceroSeleccionado?.autoretenedor === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{terceroSeleccionado?.autoretenedor === 1 ? 'SÍ' : 'NO'}</span></div>
                        </div>
                        <div><span className="block text-xs font-bold text-slate-400 uppercase">Número POS</span><span className="font-medium text-slate-800">{terceroSeleccionado?.pos_num || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl shrink-0">
              <button onClick={cerrarModal} className="px-4 py-2 border border-gray-300 bg-white rounded-md text-slate-700 hover:bg-gray-100 font-medium text-sm transition-colors shadow-sm">Cerrar</button>
              {modalMode === 'ver' && <button onClick={abrirModalEditar} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">Editar Tercero</button>}
              {(modalMode === 'crear' || modalMode === 'editar') && (
                <button onClick={guardarCambios} disabled={estaGuardando} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                  {estaGuardando ? 'Guardando...' : 'Guardar Tercero'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- PANEL PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Directorio de Terceros</h1>
            <p className="text-sm text-slate-500 mt-1">Gestiona los clientes, proveedores y contactos de la plataforma.</p>
          </div>
          
          <div className="flex space-x-3 items-center">
            {vistaActual === 'tabla' && (
              <button onClick={exportarCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                ⬇ Exportar CSV
              </button>
            )}

            <div className="bg-gray-200 p-1 rounded flex">
              <button onClick={() => setVistaActual('lista')} className={`px-4 py-1.5 rounded text-sm font-medium transition ${vistaActual === 'lista' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>Vista Listado</button>
              <button onClick={() => setVistaActual('tabla')} className={`px-4 py-1.5 rounded text-sm font-medium transition ${vistaActual === 'tabla' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>Vista Tabla</button>
            </div>

            <button onClick={abrirModalCrear} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
              + Nuevo Registro
            </button>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA Y BOTÓN DE FILTROS AVANZADOS */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar por NIT o Nombre en el servidor..."
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className={`px-4 py-2 border rounded-md font-medium text-sm transition-colors shadow-sm flex items-center gap-2
              ${hayFiltrosActivos 
                ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
                : 'border-gray-300 bg-white text-slate-700 hover:bg-gray-50'}`}
          >
            Filtros Avanzados
            {/* Indicador visual de filtros activos */}
            {hayFiltrosActivos && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* RENDERIZADO CONDICIONAL DE LA TABLA */}
        {vistaActual === 'lista' ? (
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th><th className="px-6 py-4">NIT</th><th className="px-6 py-4">NOMBRE</th><th className="px-6 py-4">TELÉFONO</th><th className="px-6 py-4">CIUDAD</th><th className="px-6 py-4">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-slate-600">
                  {isLoading && rows.length === 0 && <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Sincronizando...</td></tr>}
                  {isError && <tr><td colSpan="6" className="px-6 py-8 text-center text-red-500">Error: {error.message}</td></tr>}
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{row.id}</td>
                      <td className="px-6 py-4">{row.nit}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{row.nombres}</td>
                      <td className="px-6 py-4">{row.telefono_1 || '---'}</td>
                      <td className="px-6 py-4">{row.ciudad}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => abrirModalVer(row)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Ver detalle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Mostrando página <span className="font-medium text-slate-700">{page + 1}</span> de <span className="font-medium text-slate-700">{totalPages || 1}</span> 
                <span className="hidden sm:inline"> ({totalRegistros} registros en total)</span>
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors">Anterior</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1 || totalPages === 0} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors">Siguiente</button>
              </div>
            </div>
          </div>

        ) : (

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 h-[600px]">
            <div className="ag-theme-alpine w-full h-full">
              <AgGridReact
                ref={gridRef}
                rowData={rows} 
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={false} 
              />
            </div>
          </div>

        )}
      </div>
    </div>
  );
}