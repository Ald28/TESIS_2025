import 'package:flutter/material.dart';
import '../classes/psicologo.dart';
import '../services/api_service.dart';
import '../classes/disponibilidad.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

class PaginaDetallePsicologo extends StatefulWidget {
  final Psicologo? psicologo;

  const PaginaDetallePsicologo({super.key, this.psicologo});

  @override
  State<PaginaDetallePsicologo> createState() => _PaginaDetallePsicologoState();
}

class _PaginaDetallePsicologoState extends State<PaginaDetallePsicologo> {
  String? token;
  int? estudianteId;

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

  while (inicio.hour < fin.hour || (inicio.hour == fin.hour && inicio.minute < fin.minute)) {
    final siguiente = TimeOfDay(
      hour: inicio.minute + 30 >= 60 ? inicio.hour + 1 : inicio.hour,
      minute: (inicio.minute + 30) % 60,
    );

    if (siguiente.hour > fin.hour || (siguiente.hour == fin.hour && siguiente.minute > fin.minute)) {
      break;
    }

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

  // Remover turnos vacíos
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

DateTime obtenerFechaProxima(String diaSemana) {
  final diasSemana = {
    'lunes': DateTime.monday,
    'martes': DateTime.tuesday,
    'miércoles': DateTime.wednesday,
    'jueves': DateTime.thursday,
    'viernes': DateTime.friday,
    'sábado': DateTime.saturday,
    'domingo': DateTime.sunday,
  };

  final hoy = DateTime.now();
  final objetivo = diasSemana[diaSemana.toLowerCase()]!;
  int diferencia = (objetivo - hoy.weekday + 7) % 7;
  diferencia = diferencia == 0 ? 7 : diferencia; 

  return hoy.add(Duration(days: diferencia));
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
                          FutureBuilder<List<Disponibilidad>>(
                          future: ApiService.fetchDisponibilidad(psicologo.id),
                          builder: (context, snapshot) {
                            if (snapshot.connectionState == ConnectionState.waiting) {
                              return const Center(child: CircularProgressIndicator());
                            }
                            if (snapshot.hasError) {
                              return const Text('❌ Error al cargar disponibilidad');
                            }

                            final disponibilidades = snapshot.data!;
                            final diasAgrupados = <String, List<Map<String, String>>>{};

                            for (var disp in disponibilidades) {
                              final bloques = generarBloquesHorario(disp.horaInicio, disp.horaFin);
                              diasAgrupados.update(disp.dia, (list) => list + bloques, ifAbsent: () => bloques);
                            }

                            return Column(
                              children: diasAgrupados.entries.map((entry) {
                                final turnosAgrupados = agruparPorTurno(entry.value);
                                
                                return ExpansionTile(
                                  title: Text(
                                    entry.key[0].toUpperCase() + entry.key.substring(1),
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                  children: turnosAgrupados.entries.map((turnoEntry) {
                                    return ExpansionTile(
                                      title: Row(
                                        children: [
                                          Icon(
                                            turnoEntry.key == 'Mañana' ? Icons.wb_sunny : Icons.nights_stay,
                                            color: turnoEntry.key == 'Mañana' ? Colors.orange : Colors.indigo,
                                            size: 20,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            turnoEntry.key,
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w600,
                                              color: turnoEntry.key == 'Mañana' ? Colors.orange[700] : Colors.indigo[700],
                                            ),
                                          ),
                                        ],
                                      ),
                                      children: turnoEntry.value.map((bloque) {
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
                                              onPressed: () async {
                                                final fechaSeleccionada = obtenerFechaProxima(entry.key);
                                                showDialog(
                                                  context: context,
                                                  barrierDismissible: false,
                                                  builder: (BuildContext context) {
                                                    return const Center(child: CircularProgressIndicator());
                                                  },
                                                );

                                                try {
                                                  await ApiService.crearCita(
                                                    psicologoId: psicologo.id,
                                                    estudianteId: estudianteId!,
                                                    fecha: fechaSeleccionada,
                                                    horaInicio: bloque['inicio']!,
                                                    horaFin: bloque['fin']!,
                                                    token: token!,
                                                  );
                                                  Navigator.of(context).pop();
                                                  ScaffoldMessenger.of(context).showSnackBar(
                                                    const SnackBar(
                                                      content: Text("✅ Cita creada correctamente."),
                                                      backgroundColor: Colors.green,
                                                    ),
                                                  );
                                                  setState(() {});
                                                } catch (e) {
                                                  Navigator.of(context).pop();
                                                  ScaffoldMessenger.of(context).showSnackBar(
                                                    SnackBar(
                                                      content: Text("❌ $e"),
                                                      backgroundColor: Colors.red,
                                                    ),
                                                  );
                                                }
                                              },
                                              icon: const Icon(Icons.schedule, size: 16),
                                              label: const Text("Agendar"),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: theme.colorScheme.primary,
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                              ),
                                            ),
                                          ),
                                        );
                                      }).toList(),
                                    );
                                  }).toList(),
                                );
                              }).toList(),
                            );
                          },
                        ),
                        const SizedBox(height: 16),
                                               
                          const SizedBox(height: 16),
                    
                          (token == null)
                            ? const Center(child: CircularProgressIndicator())
                            : FutureBuilder<List<Map<String, dynamic>>>(
                                future: ApiService.fetchHorasOcupadas(psicologo.id, DateTime.now(), token!),
                                builder: (context, snapshot) {
                                  if (snapshot.connectionState == ConnectionState.waiting) {
                                    return const Center(child: CircularProgressIndicator());
                                  } else if (snapshot.hasError) {
                                    return const Row(
                                      children: [
                                        Icon(Icons.error, color: Colors.red),
                                        SizedBox(width: 6),
                                        Text("Error al cargar horas ocupadas"),
                                      ],
                                    );
                                  }

                                  final horas = snapshot.data ?? [];
                                  if (horas.isEmpty) {
                                    return const Text("No hay horas ocupadas hoy.");
                                  }

                                  return Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text("Horas ocupadas:", style: TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 8),
                                      ...horas.map((h) {
                                      final inicio = h['hora_inicio'];
                                      final fin = h['hora_fin'];
                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 8.0),
                                        child: Text("⛔ $inicio - $fin", style: const TextStyle(color: Colors.redAccent)),
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

                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text("✅ Cita cancelada")),
                                      );

                                      setState(() {}); // Refrescar
                                    } catch (e) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text("❌ Error al cancelar: $e")),
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