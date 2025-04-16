class Psicologo {
  final String nombre;
  final String? fotoUrl;
  final String? email;
  final String? telefono;

  Psicologo({
    required this.nombre,
    this.fotoUrl,
    this.email,
    this.telefono,
  });

  factory Psicologo.fromJson(Map<String, dynamic> json) {
    return Psicologo(
      nombre: json['nombre_completo'],
      fotoUrl: json['imagen_url'],
      email: json['email'],
      telefono: json['telefono'],
    );
  }
}
