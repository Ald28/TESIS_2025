class Disponibilidad {
  final int id;
  final String dia;
  final String horaInicio;
  final String horaFin;

  Disponibilidad({
    required this.id,
    required this.dia,
    required this.horaInicio,
    required this.horaFin,
  });

  factory Disponibilidad.fromJson(Map<String, dynamic> json) {
    return Disponibilidad(
      id: json['id'],
      dia: json['dia'],
      horaInicio: json['hora_inicio'],
      horaFin: json['hora_fin'],
    );
  }
}

