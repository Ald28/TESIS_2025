import 'package:flutter/material.dart';
import 'package:frondend/services/api_service.dart';
import 'package:frondend/classes/metodo_relajacion.dart';
import 'package:frondend/classes/psicologo.dart';
import 'package:video_player/video_player.dart';

class PaginaHome extends StatefulWidget {
  const PaginaHome({Key? key}) : super(key: key);

  @override
  State<PaginaHome> createState() => _PaginaHomeState();
}

class _PaginaHomeState extends State<PaginaHome> {
  late Future<List<MetodoRelajacion>> _metodosFuture;
  late Future<List<Psicologo>> _psicologosFuture;

  List<MetodoRelajacion> _todosLosMetodos = [];
  List<String> _categorias = [];

  String? _categoriaSeleccionada;

  @override
  void initState() {
    super.initState();

    _metodosFuture = ApiService.fetchMetodosRelajacion().then((metodos) {
      _todosLosMetodos = metodos;

      if (metodos.isNotEmpty) {
        _categorias = metodos
            .map((m) => m.categoria.trim().toLowerCase())
            .toSet()
            .toList();
      }

      return metodos;
    });

    _psicologosFuture = ApiService.fetchPsicologos();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.all(12),
          child: Text(
            "Buscar por doctor:",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
        FutureBuilder<List<Psicologo>>(
          future: _psicologosFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const SizedBox(
                height: 90,
                child: Center(child: CircularProgressIndicator()),
              );
            } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
              return const SizedBox(height: 90);
            }

            final psicologos = snapshot.data!;
            return SizedBox(
              height: 90,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: psicologos.length,
                itemBuilder: (context, index) {
                  final p = psicologos[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Column(
                      children: [
                        Container(
                          width: 55,
                          height: 55,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            image: DecorationImage(
                              image: (p.fotoUrl != null && p.fotoUrl!.isNotEmpty)
                                  ? NetworkImage(p.fotoUrl!)
                                  : const AssetImage('assets/images/default_user.png') as ImageProvider,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          p.nombre.split(" ").first,
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  );
                },
              ),
            );
          },
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              const Text("Métodos de relajación:"),
              const SizedBox(width: 10),
              Expanded(
                child: DropdownButton<String>(
                  isExpanded: true,
                  hint: const Text("Categorías de estrés"),
                  value: _categoriaSeleccionada,
                  items: _categorias.map((cat) {
                    return DropdownMenuItem<String>(
                      value: cat,
                      child: Text(cat[0].toUpperCase() + cat.substring(1)),
                    );
                  }).toList()
                    ..insert(
                      0,
                      const DropdownMenuItem<String>(
                        value: null,
                        child: Text("Todas las categorías"),
                      ),
                    ),
                  onChanged: (value) {
                    setState(() {
                      _categoriaSeleccionada = value;
                    });
                  },
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Expanded(
          child: FutureBuilder<List<MetodoRelajacion>>(
            future: _metodosFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
              } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Center(child: Text('No hay métodos de relajación disponibles.'));
              }

              final metodosFiltrados = _categoriaSeleccionada == null
                  ? _todosLosMetodos
                  : _todosLosMetodos
                      .where((m) => m.categoria.trim().toLowerCase() == _categoriaSeleccionada)
                      .toList();

              return ListView.builder(
                itemCount: metodosFiltrados.length,
                itemBuilder: (context, index) {
                  final metodo = metodosFiltrados[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(metodo.titulo, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          Text(metodo.descripcion),
                          const SizedBox(height: 6),
                          Text("Psicólogo: ${metodo.psicologo}"),
                          Text("Categoría: ${metodo.categoria}"),
                          const SizedBox(height: 10),
                          AspectRatio(
                            aspectRatio: 16 / 9,
                            child: VideoPlayerWidget(url: metodo.archivo),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

class VideoPlayerWidget extends StatefulWidget {
  final String url;
  const VideoPlayerWidget({Key? key, required this.url}) : super(key: key);

  @override
  State<VideoPlayerWidget> createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  late VideoPlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.url))
      ..initialize().then((_) {
        setState(() {});
        _controller.play();
        _controller.setLooping(true);
      });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return _controller.value.isInitialized
        ? VideoPlayer(_controller)
        : const Center(child: CircularProgressIndicator());
  }
}
