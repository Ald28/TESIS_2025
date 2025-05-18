import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import 'dart:async';

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
    Timer.periodic(const Duration(seconds: 60), (timer) {
      if (mounted && token != null) {
        setState(() {});
      }
    });
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
    return Scaffold(
      appBar: AppBar(title: const Text("Historial de Citas")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Citas Activas", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            FutureBuilder<List<Map<String, dynamic>>>(
              future: token != null ? ApiService.fetchCitasActivas(token!) : Future.value([]),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Row(
                    children: const [
                      Icon(Icons.close, color: Colors.red),
                      SizedBox(width: 6),
                      Text("Error al cargar citas activas"),
                    ],
                  );
                }

                final citasPendientes = snapshot.data?.where((c) => c['estado'] == 'pendiente' || c['estado'] == 'aceptada').toList() ?? [];

                if (citasPendientes.isEmpty) {
                  return const Text("No tienes citas activas");
                }

                return Column(
                  children: citasPendientes.map((cita) {
                    final fecha = cita['fecha_inicio'].toString().substring(0, 10);
                    final horaInicio = cita['fecha_inicio'].toString().substring(11, 16);
                    final horaFin = cita['fecha_fin'].toString().substring(11, 16);
                    final nombrePsico = "${cita['psicologo_nombre']} ${cita['psicologo_apellido']}";

                    return Card(
                      child: ListTile(
                        title: Text(nombrePsico),
                        subtitle: Text("$fecha de $horaInicio a $horaFin"),
                        trailing: Text(cita['estado'], style: const TextStyle(color: Colors.orange)),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
            const SizedBox(height: 24),
            const Text("Historial de Citas Finalizadas", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            FutureBuilder<List<Map<String, dynamic>>>(
              future: estudianteId != null ? ApiService.fetchCitasFinalizadas(estudianteId!) : Future.value([]),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return const Text("❌ Error al cargar historial de citas");
                }

                final finalizadas = snapshot.data ?? [];

                if (finalizadas.isEmpty) {
                  return const Text("No tienes citas finalizadas");
                }

                return Column(
                  children: finalizadas.map((cita) {
                    final fecha = cita['fecha_inicio'].toString().substring(0, 10);
                    final nombrePsico = "${cita['nombre_psicologo']} ${cita['apellido_psicologo']}";
                    return ListTile(
                      title: Text(nombrePsico),
                      subtitle: Text("Realizada el $fecha"),
                      leading: const Icon(Icons.check_circle, color: Colors.green),
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}