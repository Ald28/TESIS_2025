import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class PaginaFavorito extends StatefulWidget {
  const PaginaFavorito({super.key});

  @override
  State<PaginaFavorito> createState() => _PaginaFavoritoState();
}

class _PaginaFavoritoState extends State<PaginaFavorito> {
  String? token;
  int? estudianteId;
  
  // Color cian definido
  final Color cyanColor = Color(0xFF00AEEF);

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  Future<void> _cargarDatos() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      token = prefs.getString('token');
      estudianteId = prefs.getInt('estudiante_id');
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: Colors.grey[50],
        body: Column(
          children: [
            // Tab Bar sin AppBar
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: SafeArea(
                child: TabBar(
                  labelColor: cyanColor,
                  unselectedLabelColor: Colors.grey,
                  indicatorColor: cyanColor,
                  indicatorWeight: 3,
                  labelStyle: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                  tabs: [
                    Tab(
                      icon: Icon(Icons.schedule, size: 20),
                      text: "Citas Activas",
                    ),
                    Tab(
                      icon: Icon(Icons.history, size: 20),
                      text: "Historial",
                    ),
                  ],
                ),
              ),
            ),
            // Contenido de las tabs
            Expanded(
              child: TabBarView(
                children: [
                  // Tab de Citas Activas
                  _buildCitasActivas(),
                  // Tab de Historial
                  _buildHistorial(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCitasActivas() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: FutureBuilder<List<Map<String, dynamic>>>(
        future: token != null ? ApiService.fetchCitasActivas(token!) : Future.value([]),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildLoadingState();
          } else if (snapshot.hasError) {
            return _buildErrorState("Error al cargar citas activas");
          }

          final citasPendientes = snapshot.data
                  ?.where((c) => c['estado'] == 'pendiente' || c['estado'] == 'aceptada')
                  .toList() ??
              [];

          if (citasPendientes.isEmpty) {
            return _buildEmptyState(
              icon: Icons.event_available,
              title: "No tienes citas activas",
              subtitle: "Cuando tengas citas programadas aparecerán aquí",
            );
          }

          return ListView.builder(
            itemCount: citasPendientes.length,
            itemBuilder: (context, index) {
              final cita = citasPendientes[index];
              return _buildCitaActivaCard(cita);
            },
          );
        },
      ),
    );
  }

  Widget _buildHistorial() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: FutureBuilder<List<Map<String, dynamic>>>(
        future: estudianteId != null ? ApiService.fetchCitasFinalizadas(estudianteId!) : Future.value([]),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildLoadingState();
          } else if (snapshot.hasError) {
            return _buildErrorState("Error al cargar historial de citas");
          }

          final finalizadas = snapshot.data ?? [];

          if (finalizadas.isEmpty) {
            return _buildEmptyState(
              icon: Icons.history,
              title: "No tienes citas finalizadas",
              subtitle: "Tu historial de citas aparecerá aquí",
            );
          }

          return ListView.builder(
            itemCount: finalizadas.length,
            itemBuilder: (context, index) {
              final cita = finalizadas[index];
              return _buildCitaHistorialCard(cita);
            },
          );
        },
      ),
    );
  }

  Widget _buildCitaActivaCard(Map<String, dynamic> cita) {
    final fecha = cita['fecha_inicio'].toString().substring(0, 10);
    final horaInicio = cita['fecha_inicio'].toString().substring(11, 16);
    final horaFin = cita['fecha_fin'].toString().substring(11, 16);
    final nombrePsico = "${cita['psicologo_nombre']} ${cita['psicologo_apellido']}";
    final estado = cita['estado'];

    final fechaFormateada = _formatearFecha(fecha);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: cyanColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.psychology,
                    color: cyanColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        nombrePsico,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Psicólogo Clínico',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),

                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _buildEstadoChip(estado),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: () async {
                        try {
                          await ApiService.cancelarCita(
                            citaId: cita['id'],
                            estudianteId: estudianteId!,
                            token: token!,
                          );

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text("Cita cancelada correctamente"),
                              backgroundColor: Colors.orange,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              margin: const EdgeInsets.all(16),
                              duration: const Duration(seconds: 3),
                            ),
                          );

                          setState(() {});
                        } catch (e) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text("No se pudo cancelar la cita"),
                              backgroundColor: Colors.red,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              margin: const EdgeInsets.all(16),
                              duration: const Duration(seconds: 3),
                            ),
                          );
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.red.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.cancel_outlined, size: 14, color: Colors.red),
                            SizedBox(width: 4),
                            Text(
                              "Cancelar",
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.red,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    color: Colors.grey[600],
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    fechaFormateada,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const Spacer(),
                  Icon(
                    Icons.access_time,
                    color: Colors.grey[600],
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '$horaInicio - $horaFin',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCitaHistorialCard(Map<String, dynamic> cita) {
    final fecha = cita['fecha_inicio'].toString().substring(0, 10);
    final nombrePsico = "${cita['nombre_psicologo']} ${cita['apellido_psicologo']}";
    final fechaFormateada = _formatearFecha(fecha);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nombrePsico,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Realizada el $fechaFormateada',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: Colors.grey[400],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEstadoChip(String estado) {
    Color color;
    String texto;
    IconData icon;

    switch (estado.toLowerCase()) {
      case 'pendiente':
        color = Colors.orange;
        texto = 'Pendiente';
        icon = Icons.schedule;
        break;
      case 'aceptada':
        color = Colors.green;
        texto = 'Confirmada';
        icon = Icons.check_circle;
        break;
      default:
        color = Colors.grey;
        texto = estado;
        icon = Icons.info;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            texto,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: cyanColor),
          SizedBox(height: 16),
          Text(
            'Cargando citas...',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String mensaje) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.red[300],
          ),
          const SizedBox(height: 16),
          Text(
            mensaje,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.red,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  String _formatearFecha(String fecha) {
    final partes = fecha.split('-');
    final meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    final anio = partes[0];
    final mes = int.parse(partes[1]);
    final dia = int.parse(partes[2]);
    
    return '$dia de ${meses[mes - 1]} de $anio';
  }
}