import 'package:flutter/material.dart';
// import 'package:shared_preferences/shared_preferences.dart';

import '../services/api_service.dart';
import '../classes/metodo_relajacion.dart';

class PaginaFavorito extends StatefulWidget {
  const PaginaFavorito({Key? key}) : super(key: key);

  @override
  State<PaginaFavorito> createState() => _PaginaFavoritoState();
}

class _PaginaFavoritoState extends State<PaginaFavorito> {
  List<MetodoRelajacion> _favoritos = [];

  @override
  void initState() {
    super.initState();
    _cargarFavoritos();
  }

  Future<void> _cargarFavoritos() async {
    // final prefs = await SharedPreferences.getInstance();
    // final usuarioId = prefs.getInt('usuario_id');
    // if (usuarioId == null) return;
    const usuarioId = 4; // ID temporal de prueba

    final todos = await ApiService.fetchMetodosRelajacion();
    final ids = await ApiService.fetchFavoritos(usuarioId);
    setState(() {
      _favoritos = todos.where((m) => ids.contains(m.id)).toList();
    });
  }

  Future<void> _toggleFavorito(MetodoRelajacion metodo) async {
    //final prefs = await SharedPreferences.getInstance();
    //final usuarioId = prefs.getInt('usuario_id');
    //if (usuarioId == null) return;

    const usuarioId = 4;// ID temporal de prueba


    await ApiService.eliminarFavorito(usuarioId, metodo.id);

    setState(() {
      _favoritos.removeWhere((m) => m.id == metodo.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mis Favoritos")),
      body: _favoritos.isEmpty
          ? const Center(child: Text("No tienes favoritos aún."))
          : ListView.builder(
              itemCount: _favoritos.length,
              itemBuilder: (context, index) {
                final metodo = _favoritos[index];
                return Card(
                  margin: const EdgeInsets.all(12),
                  child: ListTile(
                    title: Text(metodo.titulo),
                    subtitle: Text(metodo.descripcion),
                    trailing: IconButton(
                      icon: const Icon(Icons.favorite, color: Colors.red),
                      onPressed: () => _toggleFavorito(metodo),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
