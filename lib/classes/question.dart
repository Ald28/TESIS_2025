class Answer {
  final String texto;
  final int puntaje;

  Answer({required this.texto, required this.puntaje});

  factory Answer.fromJson(Map<String, dynamic> json) {
    return Answer(
      texto: json['texto'],
      puntaje: json['puntaje'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'texto': texto,
      'puntaje': puntaje,
    };
  }
}


class Question {
  final int id;
  final String pregunta;
  List<Answer> respuestas;
  String? selected; // Agregamos esta propiedad para la respuesta seleccionada
  bool correct = false; // Agregamos esta propiedad para verificar si la respuesta es correcta

  Question({
    required this.id,
    required this.pregunta,
    required this.respuestas,
  });

  // Método para convertir JSON en un objeto Question
  factory Question.fromJson(Map<String, dynamic> json) {
    var list = json['respuestas'] as List;
    List<Answer> respuestaList = list.map((i) => Answer.fromJson(i)).toList();

    return Question(
      id: json['id'],
      pregunta: json['pregunta'],
      respuestas: respuestaList,
    );
  }

  // Método opcional para convertir un objeto Question a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'pregunta': pregunta,
      'respuestas': respuestas.map((e) => e.toJson()).toList(),
    };
  }
}

