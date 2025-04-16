class Favorito {
  final int metodoId;

  Favorito({required this.metodoId});

  factory Favorito.fromJson(Map<String, dynamic> json) {
    return Favorito(metodoId: json['metodo_id']);
  }
}
