import 'package:frondend/classes/question.dart';

class Quiz {
  final String name;
  final List<Question> questions;
  int right = 0;

  Quiz({required this.name, required this.questions});

  int get totalPoints {
    int total = 0;
    for (var question in questions) {
      total += question.respuestas.fold(0, (sum, answer) => sum + answer.puntaje);
    }
    return total;
  }
}
