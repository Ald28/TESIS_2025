class Answer {
  final String texto;
  final int puntaje;
  final int preguntaId; 

  Answer({required this.texto, required this.puntaje, required this.preguntaId});

  factory Answer.fromJson(Map<String, dynamic> json) {
    return Answer(
      texto: json['txt_opcion'] ?? "", 
      puntaje: int.tryParse(json['puntaje'].toString()) ?? 0, 
      preguntaId: int.tryParse(json['pregunta_id'].toString()) ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'txt_opcion': texto,
      'puntaje': puntaje,
      'pregunta_id': preguntaId,
    };
  }
}

class Question {
  final int id; 
  final String pregunta;
  final String tipo;
  final int cuestionarioId;
  List<Answer> respuestas = [];
  String? selected;
  bool correct = false;

  Question({
    required this.id,
    required this.pregunta,
    required this.tipo,
    required this.cuestionarioId,
    this.respuestas = const [],
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: int.tryParse(json['id'].toString()) ?? 0,
      pregunta: json['txt_pregunta'] ?? "",
      tipo: json['tipo_pregunta'] ?? "",
      cuestionarioId: int.tryParse(json['cuestionario_id'].toString()) ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'txt_pregunta': pregunta,
      'tipo_pregunta': tipo,
      'cuestionario_id': cuestionarioId,
      'respuestas': respuestas.map((e) => e.toJson()).toList(),
    };
  }
}