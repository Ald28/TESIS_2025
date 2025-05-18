import 'package:flutter/material.dart';
import '../classes/psicologo.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

class PaginaDetallePsicologo extends StatefulWidget {
  final Psicologo? psicologo;

  const PaginaDetallePsicologo({Key? key, this.psicologo}) : super(key: key);

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

  Timer.periodic(const Duration(seconds: 40), (timer) {
    if (mounted && token != null) {
      setState(() {});
    }
  });
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
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                if (estudianteId == null || token == null) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text("❌ No se encontró el estudiante o el token")),
                                  );
                                  return;
                                }

                                final DateTime? fecha = await showDatePicker(
                                  context: context,
                                  initialDate: DateTime.now().add(const Duration(days: 1)),
                                  firstDate: DateTime.now(),
                                  lastDate: DateTime.now().add(const Duration(days: 30)),
                                  builder: (context, child) {
                                    return Theme(
                                      data: Theme.of(context).copyWith(
                                        colorScheme: ColorScheme.light(
                                          primary: theme.colorScheme.primary,
                                          onPrimary: Colors.white,
                                          surface: Colors.white,
                                          onSurface: Colors.black,
                                        ),
                                      ),
                                      child: child!,
                                    );
                                  },
                                );
                                if (fecha == null) return;

                                final TimeOfDay? horaInicio = await showTimePicker(
                                  context: context,
                                  initialTime: const TimeOfDay(hour: 9, minute: 0),
                                  builder: (context, child) {
                                    return Theme(
                                      data: Theme.of(context).copyWith(
                                        colorScheme: ColorScheme.light(
                                          primary: theme.colorScheme.primary,
                                        ),
                                      ),
                                      child: child!,
                                    );
                                  },
                                );
                                if (horaInicio == null) return;

                                final TimeOfDay? horaFin = await showTimePicker(
                                  context: context,
                                  initialTime: horaInicio.replacing(
                                    minute: (horaInicio.minute + 30) % 60,
                                    hour: horaInicio.minute >= 30 ? horaInicio.hour + 1 : horaInicio.hour,
                                  ),
                                  builder: (context, child) {
                                    return Theme(
                                      data: Theme.of(context).copyWith(
                                        colorScheme: ColorScheme.light(
                                          primary: theme.colorScheme.primary,
                                        ),
                                      ),
                                      child: child!,
                                    );
                                  },
                                );
                                if (horaFin == null) return;

                                final int inicioMin = horaInicio.hour * 60 + horaInicio.minute;
                                final int finMin = horaFin.hour * 60 + horaFin.minute;
                                final int duracion = finMin - inicioMin;

                                if (duracion < 30 || duracion > 60) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text("La cita debe durar entre 30 minutos y 1 hora"),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                  return;
                                }
                                
                                final DateTime fechaInicioCompleta = DateTime(
                                  fecha.year,
                                  fecha.month,
                                  fecha.day,
                                  horaInicio.hour,
                                  horaInicio.minute,
                                );

                                final DateTime fechaFinCompleta = DateTime(
                                  fecha.year,
                                  fecha.month,
                                  fecha.day,
                                  horaFin.hour,
                                  horaFin.minute,
                                );
                                
                                print('📅 Enviando cita para fecha_inicio: ${fechaInicioCompleta.toIso8601String()}');
                                print('🕒 Inicio: ${fechaInicioCompleta.toIso8601String()}');
                                print('🕒 Fin: ${fechaFinCompleta.toIso8601String()}');
                                print("⚠️ USANDO ApiService.crearCita");

                                showDialog(
                                  context: context,
                                  barrierDismissible: false,
                                  builder: (BuildContext context) {
                                    return const Center(
                                      child: CircularProgressIndicator(),
                                    );
                                  },
                                );

                                try {
                                  await ApiService.crearCita(
                                    psicologoId: psicologo.id,
                                    estudianteId: estudianteId!,
                                    fecha: fecha, 
                                    horaInicio: formatHora(horaInicio), 
                                    horaFin: formatHora(horaFin),       
                                    token: token!,
                                  );
                                  
                                  Navigator.of(context).pop(); // Cierra el diálogo de carga
                                  
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text("✅ Cita creada correctamente."),
                                      backgroundColor: Colors.green,
                                    ),
                                  );
                                } catch (e) {
                                  Navigator.of(context).pop(); // Cierra el diálogo de carga
                                  
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text("❌ $e"),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              },
                              icon: const Icon(Icons.calendar_today),
                              label: const Text("Agendar Cita"),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 15),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8.0),
                            child: Text(
                              "Las citas tienen una duración de entre 30 minutos y 1 hora",
                              style: TextStyle(
                                fontSize: 12,
                                fontStyle: FontStyle.italic,
                                color: Colors.grey,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          (token == null)
                            ? const Center(child: CircularProgressIndicator())
                            : FutureBuilder<List<Map<String, dynamic>>>(
                                future: ApiService.fetchHorasOcupadas(psicologo.id, DateTime.now(), token!),
                                builder: (context, snapshot) {
                                  if (snapshot.connectionState == ConnectionState.waiting) {
                                    return const Center(child: CircularProgressIndicator());
                                  } else if (snapshot.hasError) {
                                    return Row(
                                      children: const [
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
                                    }).toList(),

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
                        return Column(
                          children: const [
                            Icon(Icons.event_busy, size: 40, color: Colors.grey),
                            SizedBox(height: 8),
                            Text("No tienes citas activas"),
                          ],
                        );
                      }

                      final citas = snapshot.data!.where((cita) => cita['estado'] == 'pendiente').toList();
                      if (citas.isEmpty) {
                        return Column(
                          children: const [
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