import 'package:flutter/material.dart';
import '../classes/psicologo.dart';

class PaginaDetallePsicologo extends StatelessWidget {
  final Psicologo? psicologo;

  const PaginaDetallePsicologo({Key? key, this.psicologo}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (psicologo == null) {
      return const Center(child: Text("No se seleccionó un psicólogo"));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Imagen superior de ancho completo
        SizedBox(
          width: double.infinity,
          height: 200,
          child: (psicologo!.fotoUrl != null && psicologo!.fotoUrl!.isNotEmpty)
              ? Image.network(
                  psicologo!.fotoUrl!,
                  fit: BoxFit.cover,
                )
              : const Image(
                  image: AssetImage('assets/images/default_user.png'),
                  fit: BoxFit.cover,
                ),
        ),

        const SizedBox(height: 20),

        // Datos centrados
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              Text(
                psicologo!.nombre,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              Text(
                "Teléfono: ${psicologo!.telefono ?? 'No disponible'}",
                style: const TextStyle(fontSize: 16),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                "Correo: ${psicologo!.email ?? 'No disponible'}",
                style: const TextStyle(fontSize: 16),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
