import 'package:flutter/material.dart';
import 'package:frondend/services/api_service.dart';
import 'package:frondend/classes/metodo_relajacion.dart';
import 'package:video_player/video_player.dart';

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
    const usuarioId = 2; // ID temporal de prueba
    final favoritos = await ApiService.fetchFavoritos(usuarioId);
    setState(() {
      _favoritos = favoritos;
    });
  }

  Future<void> _toggleFavorito(MetodoRelajacion metodo) async {
    const usuarioId = 2;
    await ApiService.eliminarFavorito(usuarioId, metodo.id);
    setState(() {
      _favoritos.removeWhere((m) => m.id == metodo.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false, 
        toolbarHeight: 0, 
      ),

      body: _favoritos.isEmpty
          ? const Center(child: Text("No tienes favoritos aún."))
          : ListView.builder(
              itemCount: _favoritos.length,
              itemBuilder: (context, index) {
                final metodo = _favoritos[index];
                return Card(
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
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
                                icon: const Icon(Icons.favorite, color: Colors.red),
                                onPressed: () => _toggleFavorito(metodo),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );

              },
            ),
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
