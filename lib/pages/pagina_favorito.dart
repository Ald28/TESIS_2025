import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class PaginaFavorito extends StatefulWidget {
  const PaginaFavorito({Key? key}) : super(key: key);

  @override
  State<PaginaFavorito> createState() => _PaginaFavoritoState();
}

class _PaginaFavoritoState extends State<PaginaFavorito> {
  String? token;
  int? estudianteId;

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
        body: Column(
          children: [
            Container(
              color: Colors.white,
              child: const TabBar(
                labelColor: Colors.deepPurple,
                unselectedLabelColor: Colors.black54,
                indicatorColor: Colors.deepPurple,
                tabs: [
                  Tab(icon: Icon(Icons.event_available), text: "Citas Activas"),
                  Tab(icon: Icon(Icons.history), text: "Historial"),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [

                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: FutureBuilder<List<Map<String, dynamic>>>(
                      future: token != null ? ApiService.fetchCitasActivas(token!) : Future.value([]),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const Center(child: CircularProgressIndicator());
                        } else if (snapshot.hasError) {
                          return const Center(child: Text("❌ Error al cargar citas activas"));
                        }

                        final citasPendientes = snapshot.data
                                ?.where((c) => c['estado'] == 'pendiente' || c['estado'] == 'aceptada')
                                .toList() ??
                            [];

                        if (citasPendientes.isEmpty) {
                          return const Center(child: Text("No tienes citas activas"));
                        }

                        return ListView.builder(
                          itemCount: citasPendientes.length,
                          itemBuilder: (context, index) {
                            final cita = citasPendientes[index];
                            final fecha = cita['fecha_inicio'].toString().substring(0, 10);
                            final horaInicio = cita['fecha_inicio'].toString().substring(11, 16);
                            final horaFin = cita['fecha_fin'].toString().substring(11, 16);
                            final nombrePsico = "${cita['psicologo_nombre']} ${cita['psicologo_apellido']}";

                            return Card(
                              elevation: 4,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              child: ListTile(
                                leading: const Icon(Icons.person, color: Colors.blueAccent),
                                title: Text(nombrePsico, style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text("$fecha de $horaInicio a $horaFin"),
                                trailing: Text(cita['estado'], style: const TextStyle(color: Colors.orange)),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: FutureBuilder<List<Map<String, dynamic>>>(
                      future: estudianteId != null ? ApiService.fetchCitasFinalizadas(estudianteId!) : Future.value([]),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const Center(child: CircularProgressIndicator());
                        } else if (snapshot.hasError) {
                          return const Center(child: Text("❌ Error al cargar historial de citas"));
                        }

                        final finalizadas = snapshot.data ?? [];

                        if (finalizadas.isEmpty) {
                          return const Center(child: Text("No tienes citas finalizadas"));
                        }

                        return ListView.builder(
                          itemCount: finalizadas.length,
                          itemBuilder: (context, index) {
                            final cita = finalizadas[index];
                            final fecha = cita['fecha_inicio'].toString().substring(0, 10);
                            final nombrePsico =
                                "${cita['nombre_psicologo']} ${cita['apellido_psicologo']}";

                            return Card(
                              color: Colors.grey[100],
                              elevation: 3,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              child: ListTile(
                                leading: const Icon(Icons.check_circle, color: Colors.green),
                                title: Text(nombrePsico),
                                subtitle: Text("Realizada el $fecha"),
                              ),
                            );
                          },
                        );
                      },
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
}
