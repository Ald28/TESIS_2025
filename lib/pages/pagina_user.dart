import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../classes/estudiante.dart';

class PaginaUser extends StatefulWidget {
  const PaginaUser({Key? key}) : super(key: key);

  @override
  State<PaginaUser> createState() => _PaginaUserState();
}

class _PaginaUserState extends State<PaginaUser> {
  late Future<Estudiante?> _perfilFuture;

  @override
  void initState() {
    super.initState();
    int usuarioId = 4; // Cambia esto por el ID real del estudiante logueado // ID temporal de prueba
    _perfilFuture = ApiService.fetchPerfilEstudiante(usuarioId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FutureBuilder<Estudiante?>(
          future: _perfilFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (!snapshot.hasData || snapshot.data == null) {
              return const Center(child: Text('No se pudo cargar el perfil.'));
            }

            final estudiante = snapshot.data!;

            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const CircleAvatar(
                        radius: 35,
                        backgroundImage: AssetImage('assets/images/default_user.png'),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              estudiante.nombreCompleto,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              estudiante.email,
                              style: const TextStyle(fontSize: 14, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pushReplacementNamed(context, '/');
                    },
                    icon: const Icon(Icons.exit_to_app),
                    label: const Text("Salir"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      minimumSize: const Size(double.infinity, 50),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
