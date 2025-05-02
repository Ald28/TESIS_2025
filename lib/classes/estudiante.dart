class Estudiante {
  final String nombreCompleto;
  final String email;

  Estudiante({
    required this.nombreCompleto,
    required this.email,
  });

  factory Estudiante.fromJson(Map<String, dynamic> json) {
    final nombre = json['nombre'] ?? '';
    final apellido = json['apellido'] ?? '';
    final email = json['correo'] ?? ''; 
    return Estudiante(
      nombreCompleto: '$nombre $apellido',
      email: email,
    );
  }
}
