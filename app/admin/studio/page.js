'use client'

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Car, Euro, TrendingUp, AlertCircle, Target, Monitor, Server, Code } from 'lucide-react';

export default function TaxiAdsBusinessModel() {
  // Estados para todos los parámetros editables
  const [numTaxis, setNumTaxis] = useState(50);
  const [costePorTaxi, setCostePorTaxi] = useState(200);
  const [maxAnunciosMes, setMaxAnunciosMes] = useState(108);
  const [precioAnuncio, setPrecioAnuncio] = useState(175);
  const [anunciosVendidos, setAnunciosVendidos] = useState(80);
  const [objetivoMin, setObjetivoMin] = useState(15000);
  const [objetivoMax, setObjetivoMax] = useState(20000);
  
  // Nuevos costes
  const [costeDesarrollo, setCosteDesarrollo] = useState(12000);
  const [costeServidor, setCosteServidor] = useState(200);
  const [costePantalla, setCostePantalla] = useState(250);
  const [proyeccionAnios, setProyeccionAnios] = useState(3);

  // Cálculos automáticos
  const costePantallasTotal = numTaxis * costePantalla;
  const costeOperativoMensual = (numTaxis * costePorTaxi) + costeServidor;
  const costeDesarrolloMensual = costeDesarrollo / 12; // Amortización anual
  const costeTotalMensual = costeOperativoMensual + costeDesarrolloMensual;
  
  const ingresosTotal = anunciosVendidos * precioAnuncio;
  const beneficioNeto = ingresosTotal - costeTotalMensual;
  const margenBeneficio = ingresosTotal > 0 ? ((beneficioNeto / ingresosTotal) * 100).toFixed(1) : 0;
  const ocupacionAnuncios = maxAnunciosMes > 0 ? ((anunciosVendidos / maxAnunciosMes) * 100).toFixed(1) : 0;
  
  // ROI y periodo de recuperación
  const inversionInicial = costeDesarrollo + costePantallasTotal;
  const roi = inversionInicial > 0 ? ((beneficioNeto * 12 / inversionInicial) * 100).toFixed(1) : 0;
  const mesesRecuperacion = beneficioNeto > 0 ? Math.ceil(inversionInicial / beneficioNeto) : 0;
  
  // Verificar si cumple objetivos
  const cumpleObjetivo = beneficioNeto >= objetivoMin && beneficioNeto <= objetivoMax;
  const porDebajo = beneficioNeto < objetivoMin;
  const porEncima = beneficioNeto > objetivoMax;

  // Datos para gráficas
  const datosFinancieros = [
    { name: 'Ingresos', valor: ingresosTotal, color: '#10b981' },
    { name: 'Costes Taxis', valor: numTaxis * costePorTaxi, color: '#ef4444' },
    { name: 'Servidor', valor: costeServidor, color: '#f59e0b' },
    { name: 'Desarrollo', valor: costeDesarrolloMensual, color: '#8b5cf6' },
    { name: 'Beneficio', valor: beneficioNeto, color: beneficioNeto >= 0 ? '#3b82f6' : '#dc2626' }
  ];

  // Proyección multi-año
  const generarProyeccion = () => {
    const meses = proyeccionAnios * 12;
    const datos = [];
    let beneficioAcumulado = -inversionInicial;
    
    for (let i = 0; i < meses; i++) {
      beneficioAcumulado += beneficioNeto;
      datos.push({
        mes: i + 1,
        periodo: `${Math.floor(i/12)}a ${i%12}m`,
        ingresos: ingresosTotal,
        costes: costeTotalMensual,
        beneficio: beneficioNeto,
        beneficioAcumulado: beneficioAcumulado
      });
    }
    return datos;
  };

  const datosProyeccion = generarProyeccion();

  const datosOcupacion = [
    { name: 'Vendidos', value: anunciosVendidos, color: '#3b82f6' },
    { name: 'Disponibles', value: maxAnunciosMes - anunciosVendidos, color: '#e5e7eb' }
  ];

  const datosCostes = [
    { name: 'Taxis', value: ((numTaxis * costePorTaxi) / costeTotalMensual * 100).toFixed(1), color: '#ef4444' },
    { name: 'Servidor', value: (costeServidor / costeTotalMensual * 100).toFixed(1), color: '#f59e0b' },
    { name: 'Desarrollo', value: (costeDesarrolloMensual / costeTotalMensual * 100).toFixed(1), color: '#8b5cf6' }
  ];

  // Calcular precio mínimo necesario para alcanzar objetivo mínimo
  const precioMinimoNecesario = anunciosVendidos > 0 
    ? Math.ceil((objetivoMin + costeTotalMensual) / anunciosVendidos)
    : 0;

  // Calcular anuncios necesarios al precio actual para alcanzar objetivo
  const anunciosNecesarios = precioAnuncio > 0
    ? Math.ceil((objetivoMin + costeTotalMensual) / precioAnuncio)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Modelo de Negocio - Publicidad en Taxis
          </h1>
          <p className="text-slate-300 text-lg">Analiza y optimiza tu modelo de negocio en tiempo real</p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className={`bg-slate-800/50 backdrop-blur rounded-2xl p-6 border ${beneficioNeto >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">Beneficio Neto</h3>
              <TrendingUp className={`w-5 h-5 ${beneficioNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <p className={`text-2xl font-bold ${beneficioNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {beneficioNeto.toLocaleString('es-ES')}€/mes
            </p>
            <div className="mt-2">
              {cumpleObjetivo && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                  ✓ En objetivo
                </span>
              )}
              {porDebajo && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                  ↓ Bajo objetivo
                </span>
              )}
              {porEncima && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  ↑ Sobre objetivo
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">ROI Anual</h3>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {roi}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Recuperación: {mesesRecuperacion} meses
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">Inversión Inicial</h3>
              <Code className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {inversionInicial.toLocaleString('es-ES')}€
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Desarrollo + Pantallas
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">Ingresos</h3>
              <Euro className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {ingresosTotal.toLocaleString('es-ES')}€/mes
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {anunciosVendidos} anuncios
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 text-sm">Costes Totales</h3>
              <Car className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">
              {costeTotalMensual.toLocaleString('es-ES')}€/mes
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Margen: {margenBeneficio}%
            </p>
          </div>
        </div>

        {/* Controles Interactivos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Configuración de Flota */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold mb-6 text-blue-400">Configuración de Flota</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Número de Taxis: <span className="text-white font-semibold">{numTaxis}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={numTaxis}
                  onChange={(e) => setNumTaxis(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Coste por Taxi (€/mes): <span className="text-white font-semibold">{costePorTaxi}€</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={costePorTaxi}
                  onChange={(e) => setCostePorTaxi(Number(e.target.value))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Coste Pantalla/Taxi: <span className="text-white font-semibold">{costePantalla}€</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={costePantalla}
                  onChange={(e) => setCostePantalla(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>100€</span>
                  <span>500€</span>
                </div>
                <p className="text-xs text-amber-400 mt-2">
                  Total pantallas: {costePantallasTotal.toLocaleString('es-ES')}€
                </p>
              </div>
            </div>
          </div>

          {/* Configuración de Anuncios */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold mb-6 text-emerald-400">Configuración de Anuncios</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Precio por Anuncio (€/mes): <span className="text-white font-semibold">{precioAnuncio}€</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={precioAnuncio}
                  onChange={(e) => setPrecioAnuncio(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>50€</span>
                  <span>300€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Anuncios Vendidos: <span className="text-white font-semibold">{anunciosVendidos}/{maxAnunciosMes}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={maxAnunciosMes}
                  value={anunciosVendidos}
                  onChange={(e) => setAnunciosVendidos(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-blue-400 mt-2">
                  Ocupación: {ocupacionAnuncios}%
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Máximo Anuncios/Mes: <span className="text-white font-semibold">{maxAnunciosMes}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={maxAnunciosMes}
                  onChange={(e) => setMaxAnunciosMes(Number(e.target.value))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Objetivo Mín (€)</label>
                  <input
                    type="number"
                    value={objetivoMin}
                    onChange={(e) => setObjetivoMin(Number(e.target.value))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Objetivo Máx (€)</label>
                  <input
                    type="number"
                    value={objetivoMax}
                    onChange={(e) => setObjetivoMax(Number(e.target.value))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Costes de Infraestructura */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold mb-6 text-purple-400">Costes de Infraestructura</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Coste Desarrollo: <span className="text-white font-semibold">{costeDesarrollo.toLocaleString('es-ES')}€</span>
                </label>
                <input
                  type="range"
                  min="3000"
                  max="25000"
                  step="1000"
                  value={costeDesarrollo}
                  onChange={(e) => setCosteDesarrollo(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>3.000€</span>
                  <span>25.000€</span>
                </div>
                <p className="text-xs text-purple-400 mt-2">
                  Amortización: {costeDesarrolloMensual.toFixed(0)}€/mes
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Servidor/BD (€/mes): <span className="text-white font-semibold">{costeServidor}€</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={costeServidor}
                  onChange={(e) => setCosteServidor(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>50€</span>
                  <span>500€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Proyección (años): <span className="text-white font-semibold">{proyeccionAnios}</span>
                </label>
                <div className="flex gap-2">
                  {[1, 3, 5].map(anos => (
                    <button
                      key={anos}
                      onClick={() => setProyeccionAnios(anos)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                        proyeccionAnios === anos 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {anos} año{anos > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        {!cumpleObjetivo && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Recomendaciones para alcanzar el objetivo</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Para alcanzar {objetivoMin}€ con {anunciosVendidos} anuncios, necesitas un precio mínimo de <span className="font-semibold text-white">{precioMinimoNecesario}€</span> por anuncio</li>
                  <li>• Con el precio actual de {precioAnuncio}€, necesitas vender al menos <span className="font-semibold text-white">{anunciosNecesarios} anuncios</span></li>
                  <li>• El periodo de recuperación actual es de <span className="font-semibold text-white">{mesesRecuperacion} meses</span></li>
                  <li>• Considera optimizar los costes de infraestructura o aumentar el volumen de ventas</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Gráficas Primera Fila */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Proyección a {proyeccionAnios} año{proyeccionAnios > 1 ? 's' : ''}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosProyeccion.filter((_, i) => i % 3 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="periodo" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value) => `${value.toLocaleString('es-ES')}€`}
                />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Ingresos" />
                <Line type="monotone" dataKey="costes" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Costes" />
                <Line type="monotone" dataKey="beneficioAcumulado" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} name="Beneficio Acumulado" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Desglose Financiero Mensual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosFinancieros}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value) => `${value.toLocaleString('es-ES')}€`}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {datosFinancieros.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficas Segunda Fila */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Ocupación de Anuncios</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={datosOcupacion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {datosOcupacion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-2xl font-bold text-blue-400">{ocupacionAnuncios}%</p>
              <p className="text-sm text-slate-400">Tasa de ocupación</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Distribución de Costes</h3>
            <div className="space-y-4">
              {datosCostes.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-400">{item.name}</span>
                    <span className="text-sm font-semibold">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total mensual</span>
                <span className="text-xl font-bold text-red-400">
                  {costeTotalMensual.toLocaleString('es-ES')}€
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Métricas Clave</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">Inversión inicial</span>
                <span className="font-semibold text-purple-400">{inversionInicial.toLocaleString('es-ES')}€</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">ROI anual</span>
                <span className="font-semibold text-blue-400">{roi}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">Recuperación</span>
                <span className="font-semibold text-amber-400">{mesesRecuperacion} meses</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Beneficio anual</span>
                <span className={`font-semibold ${beneficioNeto * 12 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(beneficioNeto * 12).toLocaleString('es-ES')}€
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}