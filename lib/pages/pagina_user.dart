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

class _PaginaUserState extends State<PaginaUser> {
  Future<Estudiante?>? _perfilFuture;
  final TextEditingController _fechaController = TextEditingController();
  final TextEditingController _carreraController = TextEditingController();
  final TextEditingController _cicloController = TextEditingController();

  bool _editando = false;
  File? _imagenPerfil;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _cargarPerfil();
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
          _carreraController.text = perfil.carrera ?? '';
          _cicloController.text = perfil.ciclo ?? '';
        }
      });
    }
  }

  Future<void> _seleccionarImagen() async {
    final XFile? imagen = await _picker.pickImage(source: ImageSource.gallery);
    if (imagen != null) {
      setState(() {
        _imagenPerfil = File(imagen.path);
      });
    }
  }

  Future<void> _guardarPerfil() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null || token.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("❌ Sesión expirada. Vuelve a iniciar sesión.")),
      );
      return;
    }

    int? multimediaId;
    if (_imagenPerfil != null) {
      multimediaId = await ApiService.subirImagen(_imagenPerfil!);
      if (multimediaId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("❌ Error al subir imagen")),
        );
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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("✅ Cambios guardados exitosamente")),
      );
      setState(() => _editando = false);
      _cargarPerfil();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("❌ Error al guardar cambios")),
      );
    }
  }

  @override
  void dispose() {
    _fechaController.dispose();
    _carreraController.dispose();
    _cicloController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mi Perfil")),
      body: FutureBuilder<Estudiante?>(
        future: _perfilFuture ?? Future.value(null),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (!snapshot.hasData || snapshot.data == null) {
            return const Center(child: Text('No se pudo cargar el perfil.'));
          }

          final estudiante = snapshot.data!;

          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        GestureDetector(
                          onTap: _editando ? _seleccionarImagen : null,
                          child: CircleAvatar(
                            radius: 35,
                            backgroundImage: _imagenPerfil != null
                                ? FileImage(_imagenPerfil!)
                                : (estudiante.foto != null && estudiante.foto!.isNotEmpty)
                                    ? NetworkImage(estudiante.foto!)
                                    : const AssetImage('assets/images/default_user.png') as ImageProvider,
                            child: _editando
                                ? const Align(
                                    alignment: Alignment.bottomRight,
                                    child: Icon(Icons.edit, size: 16, color: Colors.white),
                                  )
                                : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(estudiante.nombreCompleto,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                              const SizedBox(height: 4),
                              Text(estudiante.email, style: const TextStyle(color: Colors.grey)),
                            ],
                          ),
                        ),
                        TextButton(
                          onPressed: () async {
                            final prefs = await SharedPreferences.getInstance();
                            await prefs.clear();
                            Navigator.pushReplacementNamed(context, '/');
                          },
                          child: const Text("Cerrar sesión", style: TextStyle(color: Colors.red)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Divider(),
                    _buildInfoRow("Nombre:", estudiante.nombreCompleto),
                    _buildInfoRow("Correo:", estudiante.email),

                    // Fecha de nacimiento
                    _editando
                        ? _buildInput("Fecha de nacimiento", _fechaController, isDate: true)
                        : _buildInfoRow(
                            "Fecha de nacimiento:",
                            _fechaController.text.isNotEmpty ? _fechaController.text : "No disponible",
                          ),

                    // Carrera
                    _editando
                        ? _buildInput("Carrera", _carreraController)
                        : _buildInfoRow(
                            "Carrera:",
                            _carreraController.text.isNotEmpty ? _carreraController.text : "No disponible",
                          ),

                    // Ciclo Dropdown
                    _editando
                        ? Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: DropdownButtonFormField<String>(
                              value: _cicloController.text.isNotEmpty ? _cicloController.text : null,
                              decoration: const InputDecoration(
                                labelText: "Ciclo",
                                border: OutlineInputBorder(),
                              ),
                              items: List.generate(6, (index) {
                                final ciclo = (index + 1).toString();
                                return DropdownMenuItem(value: ciclo, child: Text("Ciclo $ciclo"));
                              }),
                              onChanged: (value) {
                                setState(() {
                                  _cicloController.text = value ?? '';
                                });
                              },
                            ),
                          )
                        : _buildInfoRow(
                            "Ciclo:",
                            _cicloController.text.isNotEmpty ? _cicloController.text : "No disponible",
                          ),

                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        if (_editando) {
                          _guardarPerfil();
                        } else {
                          setState(() => _editando = true);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                        backgroundColor: _editando ? Colors.green : Colors.blue,
                      ),
                      child: Text(_editando ? "Guardar cambios" : "Editar datos"),
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

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          Flexible(child: Text(value, textAlign: TextAlign.right)),
        ],
      ),
    );
  }

  Widget _buildInput(String label, TextEditingController controller, {bool isDate = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextField(
        controller: controller,
        readOnly: isDate,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          suffixIcon: isDate ? const Icon(Icons.calendar_today) : null,
        ),
        onTap: isDate
            ? () async {
                FocusScope.of(context).requestFocus(FocusNode());
                final DateTime? picked = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime(1950),
                  lastDate: DateTime.now(),
                );
                if (picked != null) {
                  controller.text = "${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                }
              }
            : null,
      ),
    );
  }
}
