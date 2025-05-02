class MetodoRelajacion {
  final int id;
  final String titulo;
  final String descripcion;
  final String url;
  final String psicologo;
  final String categoria;

  MetodoRelajacion({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.url,
    required this.psicologo,
    required this.categoria,
  });

  factory MetodoRelajacion.fromJson(Map<String, dynamic> json) {
  return MetodoRelajacion(
    id: json['id'],
    titulo: json['titulo'],
    descripcion: json['descripcion'],
    url: json['multimedia_url'],
    psicologo: '${json['nombre'] ?? ''} ${json['apellido'] ?? ''}', // ✅
    categoria: 'general', // o json['categoria'] si luego lo agregas
  );
}
}
