import 'package:flutter/material.dart';
import '../classes/psicologo.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

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

    if (psicologo == null) {
      return const Center(child: Text("No se seleccionó un psicólogo"));
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: double.infinity,
            height: 200,
            child: (psicologo.fotoUrl != null && psicologo.fotoUrl!.isNotEmpty)
                ? Image.network(psicologo.fotoUrl!, fit: BoxFit.cover)
                : const Image(
                    image: AssetImage('assets/images/default_user.png'),
                    fit: BoxFit.cover,
                  ),
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                Text(
                  psicologo.nombre,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
                Text("Teléfono: ${psicologo.telefono ?? 'No disponible'}"),
                const SizedBox(height: 6),
                Text("Correo: ${psicologo.email ?? 'No disponible'}"),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            "Agendar Cita:",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: ElevatedButton(
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
                );
                if (fecha == null) return;

                final TimeOfDay? horaInicio = await showTimePicker(
                  context: context,
                  initialTime: const TimeOfDay(hour: 9, minute: 0),
                );
                if (horaInicio == null) return;

                final TimeOfDay? horaFin = await showTimePicker(
                  context: context,
                  initialTime: horaInicio.replacing(
                    minute: (horaInicio.minute + 30) % 60,
                    hour: horaInicio.minute >= 30 ? horaInicio.hour + 1 : horaInicio.hour,
                  ),
                );
                if (horaFin == null) return;

                final int inicioMin = horaInicio.hour * 60 + horaInicio.minute;
                final int finMin = horaFin.hour * 60 + horaFin.minute;
                final int duracion = finMin - inicioMin;

                if (duracion < 30 || duracion > 60) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("La cita debe durar entre 30 minutos y 1 hora")),
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

                try {
                  await ApiService.crearCita(
                  psicologoId: psicologo.id,
                  estudianteId: estudianteId!,
                  fecha: fecha, 
                  horaInicio: formatHora(horaInicio), 
                  horaFin: formatHora(horaFin),       
                  token: token!,
                );
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("✅ Cita creada correctamente.")),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("❌ $e")),
                  );
                }
              },
              child: const Text("Separar Cita Manualmente"),
            ),
          ),
        ],
      ),
    );
  }
}
