import 'package:flutter/material.dart';
import 'package:frondend/services/api_service.dart';
import 'package:frondend/classes/metodo_relajacion.dart';
import 'package:frondend/classes/psicologo.dart';
import 'package:video_player/video_player.dart';
import 'package:frondend/pages/detalle_metodo_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PaginaHome extends StatefulWidget {
  final Function(Psicologo)? onSeleccionarPsicologo;
  final Function(MetodoRelajacion)? onSeleccionarMetodo;

  const PaginaHome({super.key, this.onSeleccionarPsicologo, this.onSeleccionarMetodo});

  @override
  State<PaginaHome> createState() => _PaginaHomeState();
}

class _PaginaHomeState extends State<PaginaHome> {
  late Future<List<MetodoRelajacion>> _metodosFuture;
  late Future<List<Psicologo>> _psicologosFuture;

  List<MetodoRelajacion> _todosLosMetodos = [];

  bool mostrarPrivados = false;
  bool _datosCargados = false;

  // Paleta de colores
  static const Color cyanColor = Color(0xFF00AEEF);
  static const Color blackColor = Color(0xFF231F20);
  static const Color gray80Color = Color(0xFF4D4D4D);
  static const Color gray50Color = Color(0xFF808080);
  static const Color gray30Color = Color(0xFFB3B3B3);

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  void _cargarDatos() async {
    final prefs = await SharedPreferences.getInstance();
    final estudianteId = prefs.getInt('estudiante_id');
    if (estudianteId == null) {
      print("No se encontró el ID del estudiante");
      return;
    }

    Future<List<MetodoRelajacion>> futureMetodos;
    if (mostrarPrivados) {
      futureMetodos = ApiService.fetchMetodosPrivados(estudianteId);
    } else {
      futureMetodos = ApiService.fetchMetodosRecomendados();
    }

    _metodosFuture = futureMetodos.then((metodos) {
      _todosLosMetodos = metodos;
      return metodos;
    });

    _psicologosFuture = ApiService.fetchPsicologos();

    setState(() {
      _datosCargados = true;
    });
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
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    message,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_datosCargados) {
      return Center(
        child: CircularProgressIndicator(
          color: cyanColor,
          strokeWidth: 3,
        ),
      );
    }

    return Container(
      color: Colors.grey[50],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header con degradado cyan
          Container(
            decoration: BoxDecoration(
              color: cyanColor, // Color sólido cyan
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.psychology,
                          color: Colors.white,
                          size: 28,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          "Relajación Mental",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Encuentra tu método de relajación ideal",
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Sección de doctores
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Icon(
                  Icons.local_hospital,
                  color: gray80Color,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  "Buscar por doctor",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: blackColor,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Lista de doctores
          FutureBuilder<List<Psicologo>>(
            future: _psicologosFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Container(
                  height: 100,
                  child: Center(
                    child: CircularProgressIndicator(
                      color: cyanColor,
                      strokeWidth: 2,
                    ),
                  ),
                );
              } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                return Container(
                  height: 100,
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: gray30Color.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text(
                      "No hay doctores disponibles",
                      style: TextStyle(
                        color: gray50Color,
                        fontSize: 14,
                      ),
                    ),
                  ),
                );
              }

              final psicologos = snapshot.data!;
              return Container(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: psicologos.length,
                  itemBuilder: (context, index) {
                    final p = psicologos[index];
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      child: GestureDetector(
                        onTap: () {
                          if (widget.onSeleccionarPsicologo != null) {
                            widget.onSeleccionarPsicologo!(p);
                          }
                        },
                        child: Column(
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: cyanColor,
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: cyanColor.withOpacity(0.2),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ClipOval(
                                child: (p.fotoUrl != null && p.fotoUrl!.isNotEmpty)
                                    ? Image.network(
                                        p.fotoUrl!,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return Container(
                                            color: gray30Color,
                                            child: Icon(
                                              Icons.person,
                                              color: gray50Color,
                                              size: 32,
                                            ),
                                          );
                                        },
                                      )
                                    : Container(
                                        color: gray30Color,
                                        child: Icon(
                                          Icons.person,
                                          color: gray50Color,
                                          size: 32,
                                        ),
                                      ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              p.nombre.split(" ").first,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: blackColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // Botones de filtro
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Expanded(
                  child: _buildFilterButton(
                    text: 'Recomendados',
                    isSelected: !mostrarPrivados,
                    onTap: () {
                      setState(() {
                        mostrarPrivados = false;
                      });
                      _cargarDatos();
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildFilterButton(
                    text: 'Mis Privados',
                    isSelected: mostrarPrivados,
                    onTap: () {
                      setState(() {
                        mostrarPrivados = true;
                      });
                      _cargarDatos();
                    },
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Lista de métodos
          Expanded(
            child: FutureBuilder<List<MetodoRelajacion>>(
              future: _metodosFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(
                    child: CircularProgressIndicator(
                      color: cyanColor,
                      strokeWidth: 3,
                    ),
                  );
                }

                if (snapshot.hasError) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    _showCustomSnackBar(
                      title: "Error",
                      message: "No se pudieron cargar los métodos de relajación.",
                      icon: Icons.error_outline,
                      color: Colors.red,
                    );
                  });

                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: gray50Color,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Error al cargar los datos',
                          style: TextStyle(
                            fontSize: 16,
                            color: gray80Color,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    _showCustomSnackBar(
                      title: "Sin resultados",
                      message: "No hay métodos de relajación disponibles.",
                      icon: Icons.info_outline,
                      color: cyanColor,
                    );
                  });

                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.psychology_outlined,
                          size: 64,
                          color: gray50Color,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No hay métodos de relajación disponibles.',
                          style: TextStyle(
                            fontSize: 16,
                            color: gray80Color,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                final metodosFiltrados = _todosLosMetodos;

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: metodosFiltrados.length,
                  itemBuilder: (context, index) {
                    final metodo = metodosFiltrados[index];
                    return _buildMetodoCard(metodo);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterButton({
    required String text,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? cyanColor : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? cyanColor : gray30Color,
            width: 1.5,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: cyanColor.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Center(
          child: Text(
            text,
            style: TextStyle(
              color: isSelected ? Colors.white : gray80Color,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetodoCard(MetodoRelajacion metodo) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: GestureDetector(
        onTap: () {
          if (widget.onSeleccionarMetodo != null) {
            widget.onSeleccionarMetodo!(metodo);
          }
        },
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  bottomLeft: Radius.circular(20),
                ),
                child: Container(
                  width: 120,
                  height: 140,
                  child: metodo.url.endsWith('.mp4')
                      ? VideoPlayerWidget(url: metodo.url)
                      : Image.network(
                          metodo.url,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: gray30Color,
                              child: Icon(
                                Icons.image_not_supported,
                                color: gray50Color,
                                size: 32,
                              ),
                            );
                          },
                        ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        metodo.titulo,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: blackColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        metodo.descripcion,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 13,
                          color: gray80Color,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: cyanColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              Icons.person,
                              size: 16,
                              color: cyanColor,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              "Dr. ${metodo.psicologo}",
                              style: TextStyle(
                                fontSize: 13,
                                color: gray80Color,
                                fontWeight: FontWeight.w500,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class VideoPlayerWidget extends StatefulWidget {
  final String url;
  const VideoPlayerWidget({super.key, required this.url});

  @override
  State<VideoPlayerWidget> createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  late VideoPlayerController _controller;
  bool _showControls = true;

  static const Color cyanColor = Color(0xFF00AEEF);

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
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: Icon(
                        _controller.value.isPlaying
                            ? Icons.pause_circle_filled
                            : Icons.play_circle_fill,
                        size: 50,
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
                  ),
              ],
            ),
          )
        : Center(
            child: CircularProgressIndicator(
              color: cyanColor,
              strokeWidth: 2,
            ),
          );
  }
}