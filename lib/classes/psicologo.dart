class Psicologo {
  final String nombre;
  final String? fotoUrl;

  Psicologo({required this.nombre, this.fotoUrl});

  factory Psicologo.fromJson(Map<String, dynamic> json) {
    return Psicologo(
      nombre: json['nombre_completo'],
      fotoUrl: null, 
    );
  }
}
