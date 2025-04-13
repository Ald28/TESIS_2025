class MetodoRelajacion {
  final int id;
  final String titulo;
  final String descripcion;
  final String archivo;
  final String psicologo;
  final String categoria;

  MetodoRelajacion({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.archivo,
    required this.psicologo,
    required this.categoria,
  });

  factory MetodoRelajacion.fromJson(Map<String, dynamic> json) {
    return MetodoRelajacion(
      id: json['id'],
      titulo: json['titulo'],
      descripcion: json['descripcion'],
      archivo: json['archivo'],
      psicologo: json['psicologo'],
      categoria: json['categoria'],
    );
  }
}
