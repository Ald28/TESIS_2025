import 'package:flutter/material.dart';
import 'package:frondend/classes/notificacion_model.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class PaginaEdit extends StatefulWidget {
  const PaginaEdit({super.key});

  @override
  State<PaginaEdit> createState() => _PaginaEditState();
}

class _PaginaEditState extends State<PaginaEdit> {
  late Future<List<Notificacion>> _notificacionesFuture;

  @override
  void initState() {
    super.initState();
    _cargarNotificaciones();

    // Escuchar notificaciones en primer plano
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Notificación recibida: ${message.notification?.title}');
      _cargarNotificaciones(); // actualiza la lista al recibir
    });
  }

  void _cargarNotificaciones() async {
    final prefs = await SharedPreferences.getInstance();
    final usuarioId = prefs.getInt('usuario_id');

    if (usuarioId != null) {
      setState(() {
        _notificacionesFuture = ApiService().fetchNotificaciones(usuarioId);
      });
    } else {
      print("usuario_id no encontrado en SharedPreferences");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("No se encontró el ID del usuario.")),
      );
    }
  }

  void _eliminarNotificacion(int id) async {
    try {
      await ApiService().eliminarNotificacion(id);
      _cargarNotificaciones(); // actualiza la lista
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Notificación eliminada")),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error al eliminar: $e")),
      );
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
      body: FutureBuilder<List<Notificacion>>(
        future: _notificacionesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("No hay notificaciones"));
          } else {
            final notificaciones = snapshot.data!;
            return ListView.builder(
              itemCount: notificaciones.length,
              itemBuilder: (context, index) {
                final notif = notificaciones[index];
                return Dismissible(
                  key: Key(notif.id.toString()),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    color: Colors.red,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  onDismissed: (direction) {
                    _eliminarNotificacion(notif.id);
                  },
                  child: Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: ListTile(
                      leading: const Icon(Icons.notifications),
                      title: Text(notif.titulo),
                      subtitle: Text(notif.mensaje),
                      trailing: Text(
                        notif.fechaEnvio.split("T").first,
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ),
                  ),
                );
              },
            );
          }
        },
      ),
    );
  }
}
