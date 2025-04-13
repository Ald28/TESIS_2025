import 'package:flutter/material.dart';
import 'package:frondend/classes/question.dart';
import 'package:frondend/classes/quiz.dart';
import 'package:frondend/pages/results_page.dart';
import 'package:frondend/services/api_service.dart';

class QuizPage extends StatefulWidget {
  const QuizPage({super.key});

  @override
  State<QuizPage> createState() => _QuizPageState();
}

class _QuizPageState extends State<QuizPage> {
  int totalQuestions = 4;
  int questionIndex = 0;
  int progressIndex = 0;
  Quiz quiz = Quiz(name: "Preguntas", questions: []);

  /// Obtener preguntas desde la API
  Future<void> _loadQuestions() async {
  try {
    List<Question> allQuestions = [];

    //  cargar preguntas del 1 al 50
    for (int id = 1; id <= 50; id++) {
      List<Question> loadedQuestions = await ApiService.fetchQuestions(id);
      allQuestions.addAll(loadedQuestions);
    }

    // Filtrar preguntas que tengan al menos una respuesta
    allQuestions = allQuestions.where((q) => q.respuestas.isNotEmpty).toList();
    allQuestions.shuffle(); // Mezclar aleatoriamente

    setState(() {
      quiz.questions.clear();
      quiz.questions.addAll(allQuestions.take(4)); // Solo 4 preguntas al azar
      totalQuestions = quiz.questions.length;
    });
  } catch (e) {
    print("❌ Error al cargar preguntas: $e");
  }
}

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  /// Método para manejar selección de respuesta
  void _optionSelected(Answer selected) {
    quiz.questions[questionIndex].selected = selected.texto;
    bool isCorrect = selected.puntaje > 0;

    if (isCorrect) {
      quiz.questions[questionIndex].correct = true;
      quiz.right += selected.puntaje;
    }

    progressIndex += 1;

    if (questionIndex < totalQuestions - 1) {
      setState(() {
        questionIndex += 1;
      });
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => ResultsPage(quiz: quiz), // Pasamos el objeto Quiz a ResultsPage
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFB2EBF2),
      appBar: AppBar(
        title: Text(quiz.name),
        backgroundColor: const Color(0xFFB2EBF2),
        elevation: 0,
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // Barra de progreso
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 30),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(15),
              child: LinearProgressIndicator(
                color: Colors.amber.shade900,
                value: totalQuestions > 0 ? progressIndex / totalQuestions : 0,
                minHeight: 20,
              ),
            ),
          ),
          // Pregunta y opciones
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 500),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 25, vertical: 20),
              child: quiz.questions.isNotEmpty
                  ? Card(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            margin: const EdgeInsets.all(30),
                            child: Text(
                              quiz.questions[questionIndex].pregunta,
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                          ),
                          Flexible(
                            child: ListView.builder(
                              itemCount: quiz.questions[questionIndex].respuestas.length,
                              itemBuilder: (_, index) {
                                return Container(
                                  margin: const EdgeInsets.all(5),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: Colors.green, width: 2),
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  child: ListTile(
                                    shape: const RoundedRectangleBorder(
                                      borderRadius: BorderRadius.all(Radius.circular(15)),
                                    ),
                                    leading: Text('${index + 1}', style: Theme.of(context).textTheme.bodyLarge),
                                    title: Text(
                                      quiz.questions[questionIndex].respuestas[index].texto,
                                      style: Theme.of(context).textTheme.bodyLarge,
                                    ),
                                    onTap: () {
                                      _optionSelected(quiz.questions[questionIndex].respuestas[index]);
                                    },
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    )
                  : const Center(child: CircularProgressIndicator()), // Indicador de carga
            ),
          ),
          // Botón de siguiente
          TextButton(
            onPressed: () {
              _optionSelected(quiz.questions[questionIndex].respuestas[0]);
            },
            child: Text('Siguiente', style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
