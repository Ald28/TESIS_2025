import 'package:flutter/material.dart';
import 'package:frondend/classes/quiz.dart';

class ResultsPage extends StatelessWidget {
  const ResultsPage({Key? key, required this.quiz}) : super(key: key);
  final Quiz quiz;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFB2EBF2),
      appBar: AppBar(
        title: Text(quiz.name),
        backgroundColor: Color(0xFFB2EBF2),
        elevation: 0,
      ),
      body: Center(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(left: 3, right: 3, top: 2, bottom: 2),
              decoration: BoxDecoration(
                border: Border.all(
                  color: Colors.black,
                  width: 1,
                ),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Text('Preguntas: ${quiz.questions.length}',
                      style: Theme.of(context).textTheme.bodyLarge),
                  Text('Puntaje: ${quiz.right} / ${quiz.totalPoints}',
                      style: Theme.of(context).textTheme.bodyLarge),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: quiz.questions.length,
                itemBuilder: (_, index) {
                  return Card(
                    color: quiz.questions[index].correct
                        ? Colors.green.shade200
                        : Colors.red.shade200,
                    child: ListTile(
                      leading: quiz.questions[index].correct
                          ? Icon(
                              Icons.check,
                              color: Colors.green.shade900,
                            )
                          : Icon(
                              Icons.close,
                              color: Colors.red.shade900,
                            ),
                      title: Text(quiz.questions[index].pregunta),
                      subtitle: Text(quiz.questions[index].selected ?? 'No respondida'),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
