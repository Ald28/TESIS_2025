import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../classes/estudiante.dart';

class PaginaUser extends StatefulWidget {
  const PaginaUser({super.key});

  @override
  State<PaginaUser> createState() => _PaginaUserState();
}

class _PaginaUserState extends State<PaginaUser> with TickerProviderStateMixin {
  Future<Estudiante?>? _perfilFuture;
  final TextEditingController _fechaController = TextEditingController();
  final TextEditingController _carreraController = TextEditingController();
  final TextEditingController _cicloController = TextEditingController();

  bool _editando = false;
  bool _guardando = false;
  File? _imagenPerfil;
  final ImagePicker _picker = ImagePicker();
  
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  final List<String> carreras = [
    'Mecatrónica Industrial',
    'Electricidad Industrial',
    'Electricidad y Automatización Industrial',
    'Tecnología Mecánica',
    'Logística Digital',
    'Administración y Emprendimiento',
    'Marketing Digital',
    'Diseño Industrial',
    'Tecnología de la Producción',
    'Producción y Gestión Industrial',
    'Mecánica y Gestión Automotriz',
    'Gestión y Mantenimiento de Maquinaria Pesada',
    'Aviación y Mecánica',
    'Mantenimiento y Gestión de Plantas Industriales',
    'Tecnología Mecánica Eléctrica',
    'Mantenimiento de Equipo Pesado',
    'Topografía y Geomática',
    'Procesos Químicos y Metalúrgicos',
    'Operaciones Mineras',
    'Operación de Plantas',
    'Gestión de Seguridad y Salud del Trabajo',
    'Ciberseguridad',
    'Diseño y Desarrollo de Software',
    'Diseño y Desarrollo de Simuladores',
    'Administración de Redes y Comunicación',
    'Big Data y Ciencia de Datos',
    'Modelado y Animación Digital'
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _cargarPerfil();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _fechaController.dispose();
    _carreraController.dispose();
    _cicloController.dispose();
    super.dispose();
  }

  Future<void> _cargarPerfil() async {
    final prefs = await SharedPreferences.getInstance();
    final usuarioId = prefs.getInt('usuario_id');

    if (usuarioId != null) {
      final perfil = await ApiService.fetchPerfilEstudiante(usuarioId);
      setState(() {
        _perfilFuture = Future.value(perfil);
        if (perfil != null) {
          _fechaController.text = (perfil.fechaNacimiento != null && perfil.fechaNacimiento!.contains('T'))
              ? perfil.fechaNacimiento!.split('T').first
              : perfil.fechaNacimiento ?? '';
          _carreraController.text = carreras.contains(perfil.carrera) ? perfil.carrera! : '';
          _cicloController.text = perfil.ciclo ?? '';
        }
      });
      _animationController.forward();
    }
  }

  Future<void> _seleccionarImagen() async {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildImagePickerBottomSheet(),
    );
  }

  Widget _buildImagePickerBottomSheet() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              height: 4,
              width: 40,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Seleccionar foto de perfil',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildImageOption(
                  icon: Icons.photo_library,
                  label: 'Galería',
                  onTap: () => _pickImage(ImageSource.gallery),
                ),
                _buildImageOption(
                  icon: Icons.camera_alt,
                  label: 'Cámara',
                  onTap: () => _pickImage(ImageSource.camera),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildImageOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.blue.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.blue.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 32, color: Colors.blue),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    Navigator.pop(context);
    final XFile? imagen = await _picker.pickImage(
      source: source,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 80,
    );
    if (imagen != null) {
      setState(() {
        _imagenPerfil = File(imagen.path);
      });
    }
  }

  Future<void> _guardarPerfil() async {
    setState(() => _guardando = true);
    
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    if (token == null || token.isEmpty) {
      _showSnackBar("❌ Sesión expirada. Vuelve a iniciar sesión.", Colors.red);
      setState(() => _guardando = false);
      return;
    }

    int? multimediaId;
    if (_imagenPerfil != null) {
      multimediaId = await ApiService.subirImagen(_imagenPerfil!);
      if (multimediaId == null) {
        _showSnackBar("❌ Error al subir imagen", Colors.red);
        setState(() => _guardando = false);
        return;
      }
    }

    final success = await ApiService.editarPerfilEstudiante(
      fechaNacimiento: _fechaController.text.split('T').first,
      carrera: _carreraController.text,
      ciclo: _cicloController.text,
      multimediaId: multimediaId,
    );

    if (success) {
      _showSnackBar("✅ Cambios guardados exitosamente", Colors.green);
      setState(() {
        _editando = false;
        _guardando = false;
      });
      _cargarPerfil();
    } else {
      _showSnackBar("❌ Error al guardar cambios", Colors.red);
      setState(() => _guardando = false);
    }
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: FutureBuilder<Estudiante?>(
        future: _perfilFuture ?? Future.value(null),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (!snapshot.hasData || snapshot.data == null) {
            return _buildErrorState();
          }

          final estudiante = snapshot.data!;

          return CustomScrollView(
            slivers: [
              _buildSliverAppBar(estudiante),
              SliverToBoxAdapter(
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: _buildProfileContent(estudiante),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No se pudo cargar el perfil',
            style: TextStyle(fontSize: 18, color: Colors.grey[600]),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _cargarPerfil,
            icon: const Icon(Icons.refresh),
            label: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(Estudiante estudiante) {
    return SliverAppBar(
      expandedHeight: 200,
      floating: false,
      pinned: true,
      backgroundColor: Colors.blue,
      actions: [
        PopupMenuButton<String>(
          onSelected: (value) async {
            if (value == 'logout') {
              _showLogoutDialog();
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'logout',
              child: Row(
                children: [
                  Icon(Icons.logout, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Cerrar sesión'),
                ],
              ),
            ),
          ],
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
      
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.blue, Colors.blue.shade700],
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 20),
                _buildProfileImage(estudiante),
                const SizedBox(height: 12),
                Text(
                  estudiante.nombreCompleto,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  estudiante.email,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileImage(Estudiante estudiante) {
    return GestureDetector(
      onTap: _editando ? _seleccionarImagen : null,
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: CircleAvatar(
              radius: 45,
              backgroundImage: _imagenPerfil != null
                  ? FileImage(_imagenPerfil!)
                  : (estudiante.foto != null && estudiante.foto!.isNotEmpty)
                      ? NetworkImage(estudiante.foto!)
                      : const AssetImage('assets/images/default_user.png') as ImageProvider,
            ),
          ),
          if (_editando)
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: Colors.blue,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.edit, size: 16, color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProfileContent(Estudiante estudiante) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildInfoCard(estudiante),
          const SizedBox(height: 16),
          _buildActionButton(),
        ],
      ),
    );
  }

  Widget _buildInfoCard(Estudiante estudiante) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.person, color: Colors.blue, size: 24),
                const SizedBox(width: 8),
                const Text(
                  'Información Personal',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildInfoField(
              icon: Icons.account_circle,
              label: 'Nombre completo',
              value: estudiante.nombreCompleto,
              isEditable: false,
            ),
            _buildInfoField(
              icon: Icons.email,
              label: 'Correo electrónico',
              value: estudiante.email,
              isEditable: false,
            ),
            _buildDateField(),
            _buildCareerField(),
            _buildCycleField(),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoField({
    required IconData icon,
    required String label,
    required String value,
    bool isEditable = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey[600], size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value.isEmpty ? 'No disponible' : value,
                  style: TextStyle(
                    fontSize: 16,
                    color: value.isEmpty ? Colors.grey[400] : Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateField() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(Icons.cake, color: Colors.grey[600], size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: _editando
                ? TextFormField(
                    controller: _fechaController,
                    readOnly: true,
                    decoration: InputDecoration(
                      labelText: 'Fecha de nacimiento',
                      suffixIcon: const Icon(Icons.calendar_today),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onTap: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(1950),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null) {
                        _fechaController.text = "${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                      }
                    },
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Fecha de nacimiento',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _fechaController.text.isEmpty ? 'No disponible' : _fechaController.text,
                        style: TextStyle(
                          fontSize: 16,
                          color: _fechaController.text.isEmpty ? Colors.grey[400] : Colors.black87,
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCareerField() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(Icons.school, color: Colors.grey[600], size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: _editando
                ? DropdownButtonFormField<String>(
                    value: carreras.contains(_carreraController.text) ? _carreraController.text : null,
                    decoration: InputDecoration(
                      labelText: 'Carrera',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      prefixIcon: const Icon(Icons.school),
                    ),
                    items: carreras.map((carrera) {
                      return DropdownMenuItem<String>(
                        value: carrera,
                        child: Text(carrera, overflow: TextOverflow.ellipsis),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _carreraController.text = value ?? '';
                      });
                    },
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Carrera',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _carreraController.text.isEmpty ? 'No disponible' : _carreraController.text,
                        style: TextStyle(
                          fontSize: 16,
                          color: _carreraController.text.isEmpty ? Colors.grey[400] : Colors.black87,
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCycleField() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(Icons.calendar_view_week, color: Colors.grey[600], size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: _editando
                ? DropdownButtonFormField<String>(
                    value: _cicloController.text.isNotEmpty ? _cicloController.text : null,
                    decoration: InputDecoration(
                      labelText: 'Ciclo',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      prefixIcon: const Icon(Icons.calendar_view_week),
                    ),
                    items: List.generate(6, (index) {
                      final ciclo = (index + 1).toString();
                      return DropdownMenuItem(
                        value: ciclo,
                        child: Text("Ciclo $ciclo"),
                      );
                    }),
                    onChanged: (value) {
                      setState(() {
                        _cicloController.text = value ?? '';
                      });
                    },
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ciclo',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _cicloController.text.isEmpty ? 'No disponible' : 'Ciclo ${_cicloController.text}',
                        style: TextStyle(
                          fontSize: 16,
                          color: _cicloController.text.isEmpty ? Colors.grey[400] : Colors.black87,
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton() {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: _guardando ? null : () {
          if (_editando) {
            _guardarPerfil();
          } else {
            setState(() => _editando = true);
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: _editando ? Colors.green : Colors.blue,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
        ),
        child: _guardando
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(_editando ? Icons.save : Icons.edit),
                  const SizedBox(width: 8),
                  Text(
                    _editando ? "Guardar cambios" : "Editar perfil",
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cerrar sesión'),
        content: const Text('¿Estás seguro de que quieres cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              Navigator.pushReplacementNamed(context, '/');
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Cerrar sesión'),
          ),
        ],
      ),
    );
  }
}