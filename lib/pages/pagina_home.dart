import 'package:flutter/material.dart';
import 'package:frondend/services/api_service.dart';
import 'package:frondend/classes/metodo_relajacion.dart';
import 'package:frondend/classes/psicologo.dart';
import 'package:video_player/video_player.dart';
import 'detalle_metodo_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PaginaHome extends StatefulWidget {
  final Function(Psicologo)? onSeleccionarPsicologo;
  final Function(MetodoRelajacion)? onSeleccionarMetodo;

  
  const PaginaHome({Key? key, this.onSeleccionarPsicologo, this.onSeleccionarMetodo}) : super(key: key);


  @override
  State<PaginaHome> createState() => _PaginaHomeState();
}

class _PaginaHomeState extends State<PaginaHome> {
  late Future<List<MetodoRelajacion>> _metodosFuture;
  late Future<List<Psicologo>> _psicologosFuture;

  List<MetodoRelajacion> _todosLosMetodos = [];
  List<String> _categorias = [];

  String? _categoriaSeleccionada;
  Set<int> _favoritos = {};
  bool mostrarPrivados = false;

  @override
void initState() {
  super.initState();
  _cargarDatos();
  
}

void _cargarDatos() async {
  const estudianteId = 2;

  Future<List<MetodoRelajacion>> futureMetodos;
  if (mostrarPrivados) {
    futureMetodos = ApiService.fetchMetodosPrivados(estudianteId);
  } else {
    futureMetodos = ApiService.fetchMetodosRecomendados();
  }

  _metodosFuture = futureMetodos.then((metodos) async {
    _todosLosMetodos = metodos;
    _categorias = metodos.map((m) => m.categoria.trim().toLowerCase()).toSet().toList();

    final favoritos = await ApiService.fetchFavoritos(estudianteId);
    setState(() {
      _favoritos = favoritos.map((m) => m.id).toSet();
    });

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
                        GestureDetector(
                          onTap: () {
                            if (widget.onSeleccionarPsicologo != null) {
                              widget.onSeleccionarPsicologo!(p);
                            }
                          },
                          child: Container(
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
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      mostrarPrivados = false;
                    });
                    _cargarDatos();
                  },
                  child: const Text('Recomendados'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: mostrarPrivados ? Colors.grey : Colors.blue,
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      mostrarPrivados = true;
                    });
                    _cargarDatos();
                  },
                  child: const Text('Mis Privados'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: mostrarPrivados ? Colors.blue : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
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
                  return GestureDetector(
                    onTap: () {
                      if (widget.onSeleccionarMetodo != null) {
                        widget.onSeleccionarMetodo!(metodo);
                      }
                    },
                    child: Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(15),
                              bottomLeft: Radius.circular(15),
                            ),
                            child: SizedBox(
                              width: 130,
                              height: 130,
                              child: metodo.url.endsWith('.mp4')
                                  ? VideoPlayerWidget(url: metodo.url)
                                  : Image.network(
                                      metodo.url,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return const Center(child: Text('Error cargando imagen'));
                                      },
                                    ),
                            ),
                          ),
                          Expanded(
                            child: Stack(
                              children: [
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        metodo.titulo,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        metodo.descripcion,
                                        maxLines: 3,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          const Icon(Icons.person, size: 16),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Text(
                                              "Dr. ${metodo.psicologo}",
                                              style: const TextStyle(fontSize: 13),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                Positioned(
                                  top: 4,
                                  right: 4,
                                  child: IconButton(
                                    icon: Icon(
                                      _favoritos.contains(metodo.id)
                                          ? Icons.favorite
                                          : Icons.favorite_border,
                                      color: Colors.red,
                                    ),
                                    onPressed: () async {
                                      const usuarioId = 2;
                                      final yaEsFavorito = _favoritos.contains(metodo.id);

                                      setState(() {
                                        if (yaEsFavorito) {
                                          _favoritos.remove(metodo.id);
                                        } else {
                                          _favoritos.add(metodo.id);
                                        }
                                      });

                                      if (yaEsFavorito) {
                                        await ApiService.eliminarFavorito(usuarioId, metodo.id);
                                      } else {
                                        await ApiService.agregarFavorito(usuarioId, metodo.id);
                                      }
                                    },
                                  ),
                                ),
                              ],
                            ),
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
  bool _showControls = true;
  

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.url))
      ..initialize().then((_) {
        setState(() {});
        _controller.setLooping(true);///esto genera un bucle 
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
        ? GestureDetector(
            onTap: () {
              setState(() {
                _showControls = !_showControls;
              });
            },
            child: Stack(
              alignment: Alignment.center,
              children: [
                AspectRatio(
                  aspectRatio: _controller.value.aspectRatio,
                  child: VideoPlayer(_controller),
                ),
                if (_showControls)
                  IconButton(
                    icon: Icon(
                      _controller.value.isPlaying
                          ? Icons.pause_circle_filled
                          : Icons.play_circle_fill,
                      size: 60,
                      color: Colors.white,
                    ),
                    onPressed: () {
                      setState(() {
                        if (_controller.value.isPlaying) {
                          _controller.pause();
                        } else {
                          _controller.play();
                          _showControls = false; 
                        }
                      });
                    },
                  ),
              ],
            ),
          )
        : const Center(child: CircularProgressIndicator());
  }
}
