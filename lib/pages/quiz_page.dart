import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:frondend/classes/question.dart';
import 'package:frondend/classes/quiz.dart';
import 'package:frondend/pages/results_page.dart';

class QuizPage extends StatefulWidget {
  const QuizPage({super.key});

  @override
  State<QuizPage> createState() => _QuizPageState();
}

class _QuizPageState extends State<QuizPage> {
  int totalQuestions = 5;
  int totalOptions = 4;
  int questionIndex = 0;
  int progressIndex = 0;
  Quiz quiz = Quiz(name: "Preguntas", questions: []);

  // Aquí usamos HTTP para obtener las preguntas desde la API
  Future<void> fetchQuestions() async {
    final response = await http.get(Uri.parse('http://192.168.177.181:8081/preguntas')); // Cambia la URL segun sea la api, esta es con mi api de mi pc

    if (response.statusCode == 200) {
      print(response.body); // Verifica la respuesta de la API
      final List<dynamic> data = json.decode(response.body);
      List<int> optionList = List<int>.generate(data.length, (i) => i);
      List<int> questionsAdded = [];

      while (quiz.questions.length < totalQuestions) {
        optionList.shuffle();
        int answer = optionList[0];
        if (questionsAdded.contains(answer)) continue;
        questionsAdded.add(answer);

        List<Answer> otherOptions = [];
        for (var option in optionList.sublist(1, totalOptions)) {
          otherOptions.add(Answer.fromJson(data[option]['respuestas'][0]));
        }

        Question question = Question.fromJson(data[answer]);
        question.respuestas.addAll(otherOptions);
        quiz.questions.add(question);
      }

      setState(() {});
    } else {
      throw Exception('Error al cargar las preguntas');
    }
  }

  @override
  void initState() {
    super.initState();
    fetchQuestions(); // Llamada para obtener las preguntas de la API
  }

  void _optionSelected(Answer selected) {
    quiz.questions[questionIndex].selected = selected.texto;
    Answer selectedAnswer = quiz.questions[questionIndex].respuestas.firstWhere((res) => res.texto == selected.texto);

    if (selectedAnswer.puntaje == selectedAnswer.puntaje) {
      quiz.questions[questionIndex].correct = true;
      quiz.right += selectedAnswer.puntaje;
    }

    progressIndex += 1;

    if (questionIndex < totalQuestions - 1) {
      questionIndex += 1;
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => ResultsPage(quiz: quiz),
        ),
      );
    }
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFB2EBF2),
      appBar: AppBar(
        title: Text(quiz.name),
        backgroundColor: Color(0xFFB2EBF2),
        elevation: 0,
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 30),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(15),
              child: LinearProgressIndicator(
                color: Colors.amber.shade900,
                value: progressIndex / totalQuestions,
                minHeight: 20,
              ),
            ),
          ),
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
                              itemCount: totalOptions,
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
                                    title: Text(quiz.questions[questionIndex].respuestas[index].texto,
                                        style: Theme.of(context).textTheme.bodyLarge),
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
                  : const CircularProgressIndicator(),
            ),
          ),
          TextButton(
            onPressed: () {
              _optionSelected(quiz.questions[questionIndex].respuestas[0]);  // Asegúrate de seleccionar una respuesta válida
            },
            child: Text('Siguiente', style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
