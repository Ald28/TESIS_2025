class Estudiante {
  final String nombreCompleto;
  final String email;

  Estudiante({
    required this.nombreCompleto,
    required this.email,
  });

  factory Estudiante.fromJson(Map<String, dynamic> json) {
    final nombre = json['nombre'] ?? '';
    final apellidoPaterno = json['apellido_paterno'] ?? '';
    final apellidoMaterno = json['apellido_materno'] ?? '';
    final email = json['email'] ?? '';
    return Estudiante(
      nombreCompleto: '$nombre $apellidoPaterno $apellidoMaterno',
      email: email,
    );
  }
}
