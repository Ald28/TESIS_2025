import 'package:flutter/material.dart';
import 'package:frondend/classes/notificacion_model.dart';
import '../services/api_service.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class PaginaEdit extends StatefulWidget {
  const PaginaEdit({super.key});

  @override
  State<PaginaEdit> createState() => _PaginaEditState();
}

class _PaginaEditState extends State<PaginaEdit> with TickerProviderStateMixin {
  List<Notificacion> _notificacionesGuardadas = [];
  bool _isLoading = true;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _setupFirebaseMessaging();
    _cargarNotificaciones();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _setupFirebaseMessaging() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.notification != null) {
        final title = message.notification!.title ?? 'Notificación';
        final body = message.notification!.body ?? '';
        print('📲 Notificación recibida: $title - $body');

        _showCustomSnackBar(
          title: title,
          message: body,
          icon: Icons.notifications_active,
          color: const Color(0xFF4A90E2),
        );

        _cargarNotificaciones();
      }
    });
  }

  void _cargarNotificaciones() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final data = await ApiService.listarNotificacionesGuardadas();
      setState(() {
        _notificacionesGuardadas = data;
        _isLoading = false;
      });
      _animationController.forward();
    } catch (e) {
      print("❌ Error al cargar notificaciones: $e");
      setState(() {
        _isLoading = false;
      });
      
      if (mounted) {
        _showCustomSnackBar(
          title: "Error",
          message: "No se pudieron cargar las notificaciones",
          icon: Icons.error_outline,
          color: Colors.red,
        );
      }
    }
  }

  void _eliminarNotificacion(int id) async {
    try {
      await ApiService.eliminarNotificacion(id);
      _cargarNotificaciones();
      
      if (mounted) {
        _showCustomSnackBar(
          title: "Eliminado",
          message: "Notificación eliminada correctamente",
          icon: Icons.check_circle_outline,
          color: Colors.green,
        );
      }
    } catch (e) {
      if (mounted) {
        _showCustomSnackBar(
          title: "Error",
          message: "No se pudo eliminar la notificación",
          icon: Icons.error_outline,
          color: Colors.red,
        );
      }
    }
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

  IconData _getNotificationIcon(String titulo) {
    final tituloLower = titulo.toLowerCase();
    if (tituloLower.contains('cita') || tituloLower.contains('sesión')) {
      return Icons.event_available;
    } else if (tituloLower.contains('mensaje') || tituloLower.contains('chat')) {
      return Icons.message;
    } else if (tituloLower.contains('recordatorio')) {
      return Icons.alarm;
    } else if (tituloLower.contains('urgente') || tituloLower.contains('importante')) {
      return Icons.priority_high;
    }
    return Icons.notifications;
  }

  Color _getNotificationColor(String titulo) {
    final tituloLower = titulo.toLowerCase();
    if (tituloLower.contains('urgente')) {
      return Colors.red.shade100;
    } else if (tituloLower.contains('cita') || tituloLower.contains('sesión')) {
      return Colors.blue.shade50;
    } else if (tituloLower.contains('mensaje')) {
      return Colors.green.shade50;
    }
    return Colors.grey.shade50;
  }

  String _formatFecha(String fecha) {
    try {
      final fechaDateTime = DateTime.parse(fecha);
      final ahora = DateTime.now();
      final diferencia = ahora.difference(fechaDateTime).inDays;
      
      if (diferencia == 0) {
        return "Hoy";
      } else if (diferencia == 1) {
        return "Ayer";
      } else if (diferencia < 7) {
        return "Hace $diferencia días";
      } else {
        return "${fechaDateTime.day}/${fechaDateTime.month}/${fechaDateTime.year}";
      }
    } catch (e) {
      return fecha.split("T").first;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: Color(0xFF4A90E2)),
                  SizedBox(height: 16),
                  Text(
                    "Cargando notificaciones...",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            )
          : _notificacionesGuardadas.isEmpty
              ? _buildEmptyState()
              : _buildNotificationsList(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none_outlined,
            size: 80,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            "No tienes notificaciones",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Cuando recibas notificaciones, aparecerán aquí",
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _cargarNotificaciones,
            icon: const Icon(Icons.refresh),
            label: const Text("Actualizar"),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4A90E2),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationsList() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: RefreshIndicator(
        onRefresh: () async {
          _cargarNotificaciones();
        },
        color: const Color(0xFF4A90E2),
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _notificacionesGuardadas.length,
          itemBuilder: (context, index) {
            final notif = _notificacionesGuardadas[index];
            return _buildNotificationCard(notif, index);
          },
        ),
      ),
    );
  }

  Widget _buildNotificationCard(Notificacion notif, int index) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 300 + (index * 100)),
      curve: Curves.easeOutBack,
      margin: const EdgeInsets.only(bottom: 12),
      child: Dismissible(
        key: Key(notif.id.toString()),
        direction: DismissDirection.endToStart,
        background: Container(
          decoration: BoxDecoration(
            color: Colors.red,
            borderRadius: BorderRadius.circular(16),
          ),
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.delete_outline, color: Colors.white, size: 28),
              SizedBox(height: 4),
              Text(
                "Eliminar",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        confirmDismiss: (direction) async {
          return await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              title: const Text("Confirmar eliminación"),
              content: const Text("¿Estás seguro de que quieres eliminar esta notificación?"),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text("Cancelar"),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: const Text("Eliminar", style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          );
        },
        onDismissed: (_) => _eliminarNotificacion(notif.id),
        child: Container(
          decoration: BoxDecoration(
            color: _getNotificationColor(notif.titulo),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF4A90E2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _getNotificationIcon(notif.titulo),
                color: Colors.white,
                size: 24,
              ),
            ),
            title: Text(
              notif.titulo,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: Color(0xFF2C3E50),
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                Text(
                  notif.mensaje,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade700,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.schedule,
                      size: 14,
                      color: Colors.grey.shade500,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _formatFecha(notif.fechaenvio),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade500,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            trailing: Icon(
              Icons.chevron_right,
              color: Colors.grey.shade400,
            ),
          ),
        ),
      ),
    );
  }
}