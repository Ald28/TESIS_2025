class Notificacion {
  final int id;
  final String titulo;
  final String mensaje;
  final String tipo;
  final String fechaenvio;

  Notificacion({
    required this.id,
    required this.titulo,
    required this.mensaje,
    required this.tipo,
    required this.fechaenvio,
  });

  factory Notificacion.fromJson(Map<String, dynamic> json) {
  return Notificacion(
    id: json['id'],
    titulo: json['titulo'],
    mensaje: json['mensaje'],
    tipo: json['tipo'],
    fechaenvio: json['fecha_envio'],
  );
}
}
