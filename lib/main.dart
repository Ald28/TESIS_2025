import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:frondend/pages/login.dart';
import 'package:frondend/pages/quiz_page.dart';
import 'package:frondend/pages/home_page.dart';
import 'package:flutter_localizations/flutter_localizations.dart';


final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(); 
  } catch (e) {
    print("Firebase init error: $e");
  }

  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  if (message.notification != null) {
    final context = navigatorKey.currentContext!;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          "${message.notification!.title}: ${message.notification!.body}",
        ),
      ),
    );
  }
});


  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey, 
      title: 'Flutter Demo',
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('es', 'ES'), // Español
        Locale('en', 'US'), // Inglés (opcional)
      ],
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
        cardTheme: CardTheme(
          elevation: 6,
          color: const Color(0xFFB2EBF2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const Login(),
        '/home': (context) => const HomePage(),
        '/quiz-page': (context) => const QuizPage(),
        '/home-page': (context) => const HomePage(),
      },
    );
  }
}
