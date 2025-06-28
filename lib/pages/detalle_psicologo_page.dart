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
                              Icon(Icons.phone, color: theme.colorScheme.primary),
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
                              Icon(Icons.email, color: theme.colorScheme.primary),
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
                            "Agendar una cita",
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Divider(),
                          const SizedBox(height: 8),
                          Text(
                            "Seleccione fecha y hora para su consulta",
                            style: theme.textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            height: 80,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "Fecha seleccionada: ${fechaSeleccionada.day}/${fechaSeleccionada.month}/${fechaSeleccionada.year}",
                                  style: const TextStyle(fontSize: 16),
                                ),
                                ElevatedButton.icon(
                                  icon: const Icon(Icons.calendar_today, size: 18),
                                  label: const Text("Cambiar fecha"),
                                  onPressed: () async {
                                    final DateTime? nuevaFecha = await showDatePicker(
                                      context: context,
                                      initialDate: fechaSeleccionada,
                                      firstDate: DateTime.now(),
                                      lastDate: DateTime.now().add(const Duration(days: 30)),
                                      locale: const Locale("es", "ES"),
                                    );

                                    if (nuevaFecha != null && nuevaFecha != fechaSeleccionada) {
                                      print("Fecha seleccionada: $nuevaFecha");
                                      setState(() {
                                        fechaSeleccionada = nuevaFecha;
                                      });
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          FutureBuilder<Map<String, dynamic>>(
                            key: ValueKey(fechaSeleccionada),
                            future: (token != null)
                              ? obtenerDisponibilidadYHorasOcupadas(psicologo.id, token!, fechaSeleccionada)
                              : Future.value({}),

                            builder: (context, snapshot) {
                              if (snapshot.connectionState == ConnectionState.waiting) {
                                return const Center(child: CircularProgressIndicator());
                              }

                              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                                return const Text("No se pudo cargar la disponibilidad.");
                              }

                              final disponibilidad = snapshot.data!['disponibilidad'] as List<Disponibilidad>;
                              final horasOcupadasSet = snapshot.data!['horasOcupadasSet'] as Set<String>;

                              final diasAgrupados = <String, List<Map<String, String>>>{};

                              for (var disp in disponibilidad.where((d) => d.dia.toLowerCase() == obtenerNombreDia(fechaSeleccionada).toLowerCase())) {

                                final bloques = generarBloquesHorario(disp.horaInicio, disp.horaFin);

                                if (bloques.isNotEmpty) {
                                  if (!diasAgrupados.containsKey(disp.dia)) {
                                    diasAgrupados[disp.dia] = [];
                                  }
                                  diasAgrupados[disp.dia]!.addAll(bloques);
                                }
                              }

                              return Column(
                                children: diasAgrupados.entries.map((entry) {
                                  return ExpansionTile(
                                      title: Text(
                                        entry.key[0].toUpperCase() + entry.key.substring(1),
                                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                      children: entry.value.map((bloque) {
                                        final bloqueKey = "${bloque['inicio']}-${bloque['fin']}";
                                        final ocupado = horasOcupadasSet.contains(bloqueKey);

                                        return Container(
                                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.grey[50],
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: Colors.grey[300]!),
                                          ),
                                          child: ListTile(
                                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                            title: Text(
                                              "${bloque['inicio']!.substring(0, 5)} - ${bloque['fin']!.substring(0, 5)}",
                                              style: const TextStyle(fontSize: 16),
                                            ),
                                            trailing: ElevatedButton.icon(
                                                onPressed: ocupado
                                                    ? null
                                                    : () async {
                                                        final fechaCita = fechaSeleccionada;

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
                                                            psicologoId: psicologo.id,
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
                                                      },
                                                icon: Icon(
                                                  Icons.schedule,
                                                  size: 16,
                                                  color: ocupado ? Colors.grey[600] : Colors.white,
                                                ),
                                                label: Text(
                                                  ocupado ? "Ocupado" : "Agendar",
                                                  style: TextStyle(
                                                    color: ocupado ? Colors.grey[600] : Colors.white,
                                                  ),
                                                ),
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: ocupado ? Colors.grey[300] : Theme.of(context).colorScheme.primary,
                                                  foregroundColor: ocupado ? Colors.grey[600] : Colors.white,
                                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                                ),
                                              ),

                                          ),
                                        );
                                      }).toList(),
                                    );

                                }).toList(),
                              );
                            },
                          ),

                        const SizedBox(height: 16),
                                               
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  FutureBuilder<List<Map<String, dynamic>>>(
                    future: (token != null) ? ApiService.fetchCitasActivas(token!) : Future.value([]),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      } else if (snapshot.hasError) {
                         print("❌ Error al obtener citas activas: ${snapshot.error}");
                          return const Text("❌ Error al cargar citas activas");
                      } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                        return const Column(
                          children: [
                            Icon(Icons.event_busy, size: 40, color: Colors.grey),
                            SizedBox(height: 8),
                            Text("No tienes citas activas"),
                          ],
                        );
                      }

                      final citas = snapshot.data!.where((cita) => cita['estado'] == 'pendiente').toList();
                      if (citas.isEmpty) {
                        return const Column(
                          children: [
                            Icon(Icons.event_available, size: 40, color: Colors.grey),
                            SizedBox(height: 8),
                            Text("No tienes citas pendientes"),
                          ],
                        );
                      }

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Tus citas activas",
                            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          ...citas.map((cita) {
                            final fecha = cita['fecha_inicio'].toString().substring(0, 10);
                            final horaInicio = cita['fecha_inicio'].toString().substring(11, 16);
                            final horaFin = cita['fecha_fin'].toString().substring(11, 16);
                            final nombrePsico = "${cita['psicologo_nombre']} ${cita['psicologo_apellido']}";

                            return Card(
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              child: ListTile(
                                title: Text(nombrePsico),
                                subtitle: Text("$fecha de $horaInicio a $horaFin"),
                                trailing: IconButton(
                                  icon: const Icon(Icons.cancel, color: Colors.red),
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
                              ),
                            );
                          }),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}