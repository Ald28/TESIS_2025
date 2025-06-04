import 'package:flutter/material.dart';
import 'package:frondend/classes/notificacion_model.dart';
import '../services/api_service.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class PaginaEdit extends StatefulWidget {
  const PaginaEdit({super.key});

  @override
  State<PaginaEdit> createState() => _PaginaEditState();
}

class _PaginaEditState extends State<PaginaEdit> {
  List<Notificacion> _notificacionesGuardadas = [];

  @override
  void initState() {
    super.initState();

  
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.notification != null) {
        final title = message.notification!.title ?? 'Notificación';
        final body = message.notification!.body ?? '';
        print('📲 Notificación recibida: $title - $body');

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("$title: $body")),
        );

        _cargarNotificaciones();
      }
    });

    _cargarNotificaciones(); 
  }

  void _cargarNotificaciones() async {
    try {
      final data = await ApiService.listarNotificacionesGuardadas();
      setState(() {
        _notificacionesGuardadas = data;
      });
    } catch (e) {
      print("❌ Error al cargar notificaciones: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error al cargar notificaciones: $e")),
        );
      }
    }
  }

  void _eliminarNotificacion(int id) async {
    try {
      await ApiService.eliminarNotificacion(id);
      _cargarNotificaciones();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Notificación eliminada")),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error al eliminar: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Notificaciones"),
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: _notificacionesGuardadas.isEmpty
          ? const Center(child: Text("No hay notificaciones"))
          : ListView.builder(
              itemCount: _notificacionesGuardadas.length,
              itemBuilder: (context, index) {
                final notif = _notificacionesGuardadas[index];
                return Dismissible(
                  key: Key(notif.id.toString()),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    color: Colors.red,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  onDismissed: (_) => _eliminarNotificacion(notif.id),
                  child: Card(
                    margin:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: ListTile(
                      leading: const Icon(Icons.notifications),
                      title: Text(notif.titulo),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(notif.mensaje),
                          Text(
                            "📅 ${notif.fechaenvio.split("T").first}",
                            style: const TextStyle(
                                fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
