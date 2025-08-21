const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testLiga() {
  try {
    // Login
    console.log('🔍 Haciendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/usuarios/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    
    // Crear equipos para la liga
    console.log('🏟️ Creando equipos para la liga...');
    const equipos = [];
    for (let i = 1; i <= 4; i++) {
      const equipoRes = await axios.post(`${API_BASE_URL}/equipos`, {
        nombre: `Equipo Liga ${i}`
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      equipos.push(equipoRes.data.equipo);
      console.log(`✅ Equipo creado: ${equipoRes.data.equipo.nombre}`);
    }
    
    // Crear torneo de liga
    console.log('🏆 Creando torneo de liga...');
    const torneoRes = await axios.post(`${API_BASE_URL}/torneos`, {
      nombre: 'Liga de Prueba 2024',
      tipo: 'liga',
      equiposNuevos: equipos.map(e => e.nombre)
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const torneo = torneoRes.data.torneo;
    console.log(`✅ Torneo creado: ${torneo.nombre} (ID: ${torneo.id})`);
    
    // Obtener partidos del torneo
    console.log('📊 Obteniendo partidos del torneo...');
    const partidosRes = await axios.get(`${API_BASE_URL}/partidos/torneo/${torneo.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const partidos = partidosRes.data.partidos;
    console.log(`📈 Partidos generados: ${partidos.length}`);
    
    // Simular algunos resultados
    console.log('⚽ Simulando resultados...');
    const resultados = [
      { partidoId: partidos[0].id, golesLocal: 2, golesVisitante: 1 },
      { partidoId: partidos[1].id, golesLocal: 0, golesVisitante: 0 },
      { partidoId: partidos[2].id, golesLocal: 3, golesVisitante: 2 },
      { partidoId: partidos[3].id, golesLocal: 1, golesVisitante: 1 },
      { partidoId: partidos[4].id, golesLocal: 2, golesVisitante: 0 },
      { partidoId: partidos[5].id, golesLocal: 1, golesVisitante: 3 }
    ];
    
    for (const resultado of resultados) {
      await axios.put(`${API_BASE_URL}/partidos/${resultado.partidoId}/resultado`, {
        golesLocal: resultado.golesLocal,
        golesVisitante: resultado.golesVisitante
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`✅ Resultado registrado: ${resultado.golesLocal}-${resultado.golesVisitante}`);
    }
    
    // Verificar detalles del torneo
    console.log('🔍 Verificando detalles del torneo...');
    const torneoDetalleRes = await axios.get(`${API_BASE_URL}/torneos/${torneo.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const torneoDetalle = torneoDetalleRes.data.torneo;
    console.log('📊 Detalles del torneo:');
    console.log(`   Nombre: ${torneoDetalle.nombre}`);
    console.log(`   Estado: ${torneoDetalle.estado}`);
    console.log(`   Campeón: ${torneoDetalle.campeon?.nombre || 'No hay campeón aún'}`);
    
    console.log('\n✅ Prueba de liga completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLiga();
