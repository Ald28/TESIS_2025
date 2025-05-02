import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../classes/metodo_relajacion.dart';

class PaginaDetalleMetodo extends StatelessWidget {
  final MetodoRelajacion metodo;

  const PaginaDetalleMetodo({Key? key, required this.metodo}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final esVideo = metodo.url.toLowerCase().endsWith('.mp4');

    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FC),
      body: SingleChildScrollView(
        child: Column(
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
              child: esVideo
                  ? VideoDetalle(url: metodo.url)
                  : Image.network(
                      metodo.url,
                      width: double.infinity,
                      height: 240,
                      fit: BoxFit.cover,
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Card(
                elevation: 3,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        metodo.titulo,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.person_outline, color: Colors.indigo),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              metodo.psicologo,
                              style: const TextStyle(fontSize: 16, color: Colors.black87),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          const Icon(Icons.category_outlined, color: Colors.indigo),
                          const SizedBox(width: 8),
                          Text(
                            metodo.categoria,
                            style: const TextStyle(fontSize: 15, color: Colors.black54),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(thickness: 1, color: Colors.black12),
                      const SizedBox(height: 12),
                      Text(
                        metodo.descripcion,
                        style: const TextStyle(fontSize: 15, color: Colors.black87, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class VideoDetalle extends StatefulWidget {
  final String url;
  const VideoDetalle({Key? key, required this.url}) : super(key: key);

  @override
  State<VideoDetalle> createState() => _VideoDetalleState();
}

class _VideoDetalleState extends State<VideoDetalle> {
  late VideoPlayerController _controller;
  bool _showControls = true;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.url))
      ..initialize().then((_) {
        setState(() {});
        _controller.setLooping(false);
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
            onTap: () => setState(() => _showControls = !_showControls),
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
                      _controller.value.isPlaying ? Icons.pause_circle : Icons.play_circle,
                      size: 60,
                      color: Colors.white.withOpacity(0.9),
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
        : const SizedBox(
            height: 240,
            child: Center(child: CircularProgressIndicator()),
          );
  }
}
