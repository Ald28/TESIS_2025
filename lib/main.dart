import 'package:flutter/material.dart';
import 'package:frondend/pages/home_page.dart';
import 'package:frondend/pages/quiz_page.dart';
import 'package:frondend/pages/login.dart';
import 'package:frondend/pages/verification_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      debugShowCheckedModeBanner: false, //// con este debugshowc.... se quita el banner que dice debug en flutter cuando se navega
      ///////en el themedata se especifica como colores primarios o como queremos que sea un texto dándole diseño y demás
      ///también a los cuadros se les puede dar estilo desde aquí y se llama algo así Theme.of(context).primaryColor
      ///indicando el color y para ponerle estilo a un texto es así: Theme.of(context).textTheme.headlineLarge,
      ///y para cambiar el color de fondo a algún lugar es así o definir el color: Theme.of(context).primaryColor 
      ///en el código hay que revisar, de este modo también es para llamar al body para darle estilo
      ///a las letras color: Theme.of(context).textTheme.bodyLarge
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        textTheme: TextTheme(
          headlineSmall: TextStyle(
            color: Colors.black,
            fontSize: 22,
            fontWeight: FontWeight.w500,
            shadows: [
              Shadow(
                color: Colors.green.withOpacity(.3),
                offset: const Offset(3, 3),
                blurRadius: 5,
              ),
            ],
          ),
          headlineMedium: TextStyle(
            color: Colors.purple.shade200,
            fontSize: 20,
          ),
          bodyLarge: const TextStyle(
            color: Colors.black,
            fontSize: 12,
          ),
        ),
        /// los card utilizan el cardTheme por defecto aquí podemos configurarlo cómo se verían 
        cardTheme: CardTheme(
          elevation: 6,
          color: const Color(0xFFB2EBF2),///color del fondo de mi cuadro de preguntas
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const Login(),
        '/home': (context) => const HomePage(),
        '/verification': (context) {
          final String email = ModalRoute.of(context)!.settings.arguments as String;
          return VerificationPage(email: email);
        },
        '/quiz-page': (context) => const QuizPage(),
      },
    );
  }
}
