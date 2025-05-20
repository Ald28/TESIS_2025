class Estudiante {
  final String nombreCompleto;
  final String email;
  final String? fechaNacimiento;
  final String? telefono;
  final String? carrera;
  final String? ciclo;
  final String? foto;

  Estudiante({
    required this.nombreCompleto,
    required this.email,
    this.fechaNacimiento,
    this.telefono,
    this.carrera,
    this.ciclo,
    this.foto,
  });

  factory Estudiante.fromJson(Map<String, dynamic> json) {
    final nombre = json['nombre'] ?? '';
    final apellido = json['apellido'] ?? '';
    final email = json['correo'] ?? '';
    final fechaNacimiento = json['fecha_nacimiento'];
    final telefono = json['telefono'];
    final carrera = json['carrera'];
    final ciclo = json['ciclo'];
    final foto = json['foto'];

    return Estudiante(
      nombreCompleto: '$nombre $apellido',
      email: email,
      fechaNacimiento: fechaNacimiento,
      telefono: telefono,
      carrera: carrera,
      ciclo: ciclo,
      foto: foto,
    );
  }
}
