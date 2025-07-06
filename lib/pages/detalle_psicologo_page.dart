import 'package:flutter/material.dart';
import '../classes/psicologo.dart';
import '../services/api_service.dart';
import '../classes/disponibilidad.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import 'dart:convert';

class PaginaDetallePsicologo extends StatefulWidget {
  final Psicologo? psicologo;

  const PaginaDetallePsicologo({super.key, this.psicologo});

  @override
  State<PaginaDetallePsicologo> createState() => _PaginaDetallePsicologoState();
}

class _PaginaDetallePsicologoState extends State<PaginaDetallePsicologo> {
  static const Color cyanColor = Color(0xFF00AEEF);
  String? token;
  int? estudianteId;
  DateTime fechaSeleccionada = DateTime.now();

  @override
  void initState() {
    super.initState();
    _cargarEstudianteId();

    Timer.periodic(const Duration(seconds: 90), (timer) {
      if (mounted && token != null) {
        setState(() {});
      }
    });
  }

  Future<Map<String, dynamic>> obtenerDisponibilidadYHorasOcupadas(int psicologoId, String token, DateTime fecha) async {
    final disponibilidad = await ApiService.fetchDisponibilidad(psicologoId);
    final horasOcupadas = await ApiService.fetchHorasOcupadas(psicologoId, fecha, token);

    return {
      'disponibilidad': disponibilidad,
      'horasOcupadasSet': horasOcupadas
          .map((h) => "${normalizarHora(h['hora_inicio'])}-${normalizarHora(h['hora_fin'])}")
          .toSet(),
    };
  }

  List<Map<String, String>> generarBloquesHorario(String horaInicio, String horaFin) {
    List<Map<String, String>> bloques = [];

    TimeOfDay inicio = TimeOfDay(
      hour: int.parse(horaInicio.split(":")[0]),
      minute: int.parse(horaInicio.split(":")[1]),
    );
    TimeOfDay fin = TimeOfDay(
      hour: int.parse(horaFin.split(":")[0]),
      minute: int.parse(horaFin.split(":")[1]),
    );

    while (true) {
      final siguiente = TimeOfDay(
        hour: inicio.minute + 30 >= 60 ? inicio.hour + 1 : inicio.hour,
        minute: (inicio.minute + 30) % 60,
      );

      final bloqueTerminaDespuesDelLimite =
          (siguiente.hour > fin.hour) || (siguiente.hour == fin.hour && siguiente.minute > fin.minute);

      if (bloqueTerminaDespuesDelLimite) break;

      bloques.add({
        'inicio': '${inicio.hour.toString().padLeft(2, '0')}:${inicio.minute.toString().padLeft(2, '0')}:00',
        'fin': '${siguiente.hour.toString().padLeft(2, '0')}:${siguiente.minute.toString().padLeft(2, '0')}:00',
      });

      inicio = siguiente;
    }

    return bloques;
  }

  String determinarTurno(String horaInicio) {
    final hora = int.parse(horaInicio.split(":")[0]);
    return hora < 14 ? 'Mañana' : 'Tarde';
  }

  Map<String, List<Map<String, String>>> agruparPorTurno(List<Map<String, String>> bloques) {
    Map<String, List<Map<String, String>>> turnosAgrupados = {
      'Mañana': [],
      'Tarde': [],
    };

    for (var bloque in bloques) {
      final turno = determinarTurno(bloque['inicio']!);
      turnosAgrupados[turno]!.add(bloque);
    }

    turnosAgrupados.removeWhere((key, value) => value.isEmpty);
    return turnosAgrupados;
  }

  Future<void> _cargarEstudianteId() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      estudianteId = prefs.getInt('estudiante_id');
      token = prefs.getString('token');
    });
  }

  String formatHora(TimeOfDay hora) {
    return '${hora.hour.toString().padLeft(2, '0')}:${hora.minute.toString().padLeft(2, '0')}:00';
  }

  String normalizarHora(String hora) {
    final partes = hora.split(':');
    final h = partes[0].padLeft(2, '0');
    final m = partes[1].padLeft(2, '0');
    return '$h:$m:00';
  }

  String obtenerNombreDia(DateTime fecha) {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    return dias[fecha.weekday - 1];
  }

  void _showCustomSnackBar({
    required String title,
    required String message,
    required IconData icon,
    required Color color,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    message,
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Widget _buildTurnoSection({
    required String turno,
    required List<Map<String, String>> bloques,
    required Set<String> horasOcupadasSet,
    required ThemeData theme,
  }) {
    if (bloques.isEmpty) return const SizedBox.shrink();

    final isManana = turno == 'Mañana';
    final turnoColor = isManana ? Colors.orange : Colors.indigo;
    final turnoIcon = isManana ? Icons.wb_sunny : Icons.nightlight_round;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: [
            turnoColor.withOpacity(0.1),
            turnoColor.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: turnoColor.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: turnoColor.withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: turnoColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    turnoIcon,
                    color: turnoColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  turno,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: turnoColor,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: turnoColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${bloques.length} horarios',
                    style: TextStyle(
                      color: turnoColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 2.0,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: bloques.length,
              itemBuilder: (context, index) {
                final bloque = bloques[index];
                final bloqueKey = "${bloque['inicio']}-${bloque['fin']}";
                final ocupado = horasOcupadasSet.contains(bloqueKey);

                return _buildHorarioCard(
                  bloque: bloque,
                  ocupado: ocupado,
                  turnoColor: turnoColor,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHorarioCard({
    required Map<String, String> bloque,
    required bool ocupado,
    required Color turnoColor,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: ocupado ? Colors.grey[100] : Colors.white,
        border: Border.all(
          color: ocupado ? Colors.grey[300]! : turnoColor.withOpacity(0.3),
          width: 1.5,
        ),
        boxShadow: ocupado
            ? null
            : [
                BoxShadow(
                  color: turnoColor.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: ocupado ? null : () => _agendarCita(bloque),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      ocupado ? Icons.schedule_outlined : Icons.access_time,
                      size: 16,
                      color: ocupado ? Colors.grey[500] : turnoColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      "${bloque['inicio']!.substring(0, 5)} - ${bloque['fin']!.substring(0, 5)}",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: ocupado ? Colors.grey[600] : turnoColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: ocupado 
                        ? Colors.red.withOpacity(0.1) 
                        : Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    ocupado ? "Ocupado" : "Disponible",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: ocupado ? Colors.red[700] : Colors.green[700],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _agendarCita(Map<String, String> bloque) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const Center(child: CircularProgressIndicator());
      },
    );

    try {
      final inicioParts = bloque['inicio']!.split(':').map(int.parse).toList();
      final finParts = bloque['fin']!.split(':').map(int.parse).toList();

      final inicioLima = DateTime(
        fechaSeleccionada.year,
        fechaSeleccionada.month,
        fechaSeleccionada.day,
        inicioParts[0],
        inicioParts[1],
      );

      final finLima = DateTime(
        fechaSeleccionada.year,
        fechaSeleccionada.month,
        fechaSeleccionada.day,
        finParts[0],
        finParts[1],
      );

      await ApiService.crearCita(
        psicologoId: widget.psicologo!.id,
        estudianteId: estudianteId!,
        fecha: fechaSeleccionada,
        horaInicio: normalizarHora('${inicioLima.hour}:${inicioLima.minute}'),
        horaFin: normalizarHora('${finLima.hour}:${finLima.minute}'),
        token: token!,
      );

      Navigator.of(context).pop();

      _showCustomSnackBar(
        title: "Éxito",
        message: "Cita creada correctamente.",
        icon: Icons.check_circle_outline,
        color: Colors.green,
      );

      setState(() {
        fechaSeleccionada = fechaSeleccionada;
      });
    } catch (e) {
      Navigator.of(context).pop();

      String mensajeLimpio = "Ocurrió un error al agendar la cita";

      try {
        final partes = e.toString().split('Exception:');
        if (partes.length > 1) {
          final posibleJson = partes[1].trim();
          final indexJson = posibleJson.indexOf('{');

          if (indexJson != -1) {
            final jsonSolo = posibleJson.substring(indexJson);
            final decoded = jsonDecode(jsonSolo);
            if (decoded is Map && decoded.containsKey('message')) {
              final mensajeBackend = decoded['message'].toString().toLowerCase();

              if (mensajeBackend.contains("no está disponible") ||
                  mensajeBackend.contains("no esta disponible") ||
                  mensajeBackend.contains("ya ha sido tomada") ||
                  mensajeBackend.contains("ya no está disponible")) {
                mensajeLimpio = "Ese horario ya no está disponible. Por favor, selecciona otro.";
              } else {
                mensajeLimpio = decoded['message'];
              }
            }
          }
        }
      } catch (e) {
        debugPrint("❌ Error al intentar leer el mensaje del backend: $e");
      }

      _showCustomSnackBar(
        title: "Error",
        message: mensajeLimpio,
        icon: Icons.error_outline,
        color: Colors.red,
      );
    }
  }

  Widget _buildCitasActivas(ThemeData theme) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: (token != null) ? ApiService.fetchCitasActivas(token!) : Future.value([]),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          print("❌ Error al obtener citas activas: ${snapshot.error}");
          return const Text("❌ Error al cargar citas activas");
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return _buildEmptyState("No tienes citas activas", Icons.event_busy);
        }

        final citas = snapshot.data!.where((cita) => cita['estado'] == 'pendiente').toList();
        if (citas.isEmpty) {
          return _buildEmptyState("No tienes citas pendientes", Icons.event_available);
        }

        return Container(
          margin: const EdgeInsets.only(top: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.event_note,
                      color: cyanColor,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    "Tus citas activas",
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ...citas.map((cita) => _buildCitaCard(cita, theme)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCitaCard(Map<String, dynamic> cita, ThemeData theme) {
    final fecha = cita['fecha_inicio'].toString().substring(0, 10);
    final horaInicio = cita['fecha_inicio'].toString().substring(11, 16);
    final horaFin = cita['fecha_fin'].toString().substring(11, 16);
    final nombrePsico = "${cita['psicologo_nombre']} ${cita['psicologo_apellido']}";

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: [
            theme.colorScheme.primary.withOpacity(0.05),
            theme.colorScheme.primary.withOpacity(0.02),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: theme.colorScheme.primary.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withOpacity(0.1),
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
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today,
                        size: 14,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        fecha,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(
                        Icons.access_time,
                        size: 14,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        "$horaInicio - $horaFin",
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.cancel_outlined,
                  color: Colors.red,
                  size: 20,
                ),
              ),
              onPressed: () async {
                try {
                  await ApiService.cancelarCita(
                    citaId: cita['id'],
                    estudianteId: estudianteId!,
                    token: token!,
                  );

                  _showCustomSnackBar(
                    title: "Cancelado",
                    message: "Cita cancelada correctamente",
                    icon: Icons.cancel,
                    color: Colors.orange,
                  );

                  setState(() {});
                } catch (e) {
                  _showCustomSnackBar(
                    title: "Error",
                    message: "No se pudo cancelar la cita",
                    icon: Icons.error_outline,
                    color: Colors.red,
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 16,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final psicologo = widget.psicologo;
    final theme = Theme.of(context);

    if (psicologo == null) {
      return const Center(child: Text("No se seleccionó un psicólogo"));
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220.0,
            backgroundColor: Colors.transparent,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  (psicologo.fotoUrl != null && psicologo.fotoUrl!.isNotEmpty)
                      ? Image.network(
                          psicologo.fotoUrl!,
                          fit: BoxFit.cover,
                        )
                      : const Image(
                          image: AssetImage('assets/images/default_user.png'),
                          fit: BoxFit.cover,
                        ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.5),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Text(
                      psicologo.nombre,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Información de contacto
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Información de contacto",
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Divider(),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.phone, color: cyanColor),
                              const SizedBox(width: 12),
                              Text(
                                psicologo.telefono ?? 'No disponible',
                                style: theme.textTheme.bodyLarge,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Icon(Icons.email, color: cyanColor),
                              const SizedBox(width: 12),
                              Text(
                                psicologo.email ?? 'No disponible',
                                style: theme.textTheme.bodyLarge,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),
                  
                  // Sección de agendar cita
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  Icons.calendar_month,
                                  color: cyanColor,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                "Agendar una cita",
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const Divider(),
                          const SizedBox(height: 8),
                          Text(
                            "Seleccione fecha y hora para su consulta",
                            style: theme.textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 16),
                          
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: theme.colorScheme.primary.withOpacity(0.2),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        "Fecha seleccionada",
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        "${fechaSeleccionada.day}/${fechaSeleccionada.month}/${fechaSeleccionada.year}",
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  ElevatedButton.icon(
                                    icon: const Icon(Icons.calendar_today, size: 18),
                                    label: const Text("Cambiar"),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: cyanColor,
                                      foregroundColor: Colors.white,
                                    ),
                                    onPressed: () async {
                                      final DateTime? nuevaFecha = await showDatePicker(
                                        context: context,
                                        initialDate: fechaSeleccionada,
                                        firstDate: DateTime.now(),
                                        lastDate: DateTime.now().add(const Duration(days: 30)),
                                        locale: const Locale("es", "ES"),
                                      );

                                      if (nuevaFecha != null && nuevaFecha != fechaSeleccionada) {
                                        setState(() {
                                          fechaSeleccionada = nuevaFecha;
                                        });
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ),
                          
                          const SizedBox(height: 24),

                          FutureBuilder<Map<String, dynamic>>(
                            key: ValueKey(fechaSeleccionada),
                            future: (token != null)
                                ? obtenerDisponibilidadYHorasOcupadas(psicologo.id, token!, fechaSeleccionada)
                                : Future.value({}),
                            builder: (context, snapshot) {
                              if (snapshot.connectionState == ConnectionState.waiting) {
                                return const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(32),
                                    child: CircularProgressIndicator(),
                                  ),
                                );
                              }

                              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                                return _buildEmptyState(
                                  "No se pudo cargar la disponibilidad",
                                  Icons.error_outline,
                                );
                              }

                              final disponibilidad = snapshot.data!['disponibilidad'] as List<Disponibilidad>;
                              final horasOcupadasSet = snapshot.data!['horasOcupadasSet'] as Set<String>;

                              List<Map<String, String>> todosLosBloques = [];

                              for (var disp in disponibilidad.where((d) => 
                                  d.dia.toLowerCase() == obtenerNombreDia(fechaSeleccionada).toLowerCase())) {
                                final bloques = generarBloquesHorario(disp.horaInicio, disp.horaFin);
                                todosLosBloques.addAll(bloques);
                              }

                              if (todosLosBloques.isEmpty) {
                                return _buildEmptyState(
                                  "No hay horarios disponibles para esta fecha",
                                  Icons.schedule_outlined,
                                );
                              }

                              final turnosAgrupados = agruparPorTurno(todosLosBloques);

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Horarios disponibles",
                                    style: theme.textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: cyanColor,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  
                                  ...turnosAgrupados.entries.map((entry) {
                                    return _buildTurnoSection(
                                      turno: entry.key,
                                      bloques: entry.value,
                                      horasOcupadasSet: horasOcupadasSet,
                                      theme: theme,
                                    );
                                  }).toList(),
                                ],
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),

                  _buildCitasActivas(theme),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}