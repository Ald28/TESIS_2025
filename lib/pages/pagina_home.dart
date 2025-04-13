import 'package:flutter/material.dart';
import 'package:frondend/services/api_service.dart';
import 'package:frondend/classes/metodo_relajacion.dart';

import 'package:video_player/video_player.dart';

class PaginaHome extends StatefulWidget {
  const PaginaHome({Key? key}) : super(key: key);

  @override
  State<PaginaHome> createState() => _PaginaHomeState();
}

class _PaginaHomeState extends State<PaginaHome> {
  late Future<List<MetodoRelajacion>> _metodosFuture;

  @override
  void initState() {
    super.initState();
    _metodosFuture = ApiService.fetchMetodosRelajacion();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<MetodoRelajacion>>(
      future: _metodosFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No hay métodos de relajación disponibles.'));
        }

        final metodos = snapshot.data!;
        return ListView.builder(
          itemCount: metodos.length,
          itemBuilder: (context, index) {
            final metodo = metodos[index];
            return Card(
              margin: const EdgeInsets.all(10),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(metodo.titulo, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
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
