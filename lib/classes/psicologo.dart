class Psicologo {
  final int id;
  final String nombre;
  final String? fotoUrl;
  final String? email;
  final String? telefono;

  Psicologo({
    required this.id, 
    required this.nombre,
    this.fotoUrl,
    this.email,
    this.telefono,
  });

  factory Psicologo.fromJson(Map<String, dynamic> json) {
    print(json);
    return Psicologo(
      id: json['psicologo_id'], 
      nombre: "${json['nombre']} ${json['apellido']}",
      fotoUrl: json['foto_perfil'],
      email: json['correo'],
      telefono: json['telefono'],
    );
  }
}
