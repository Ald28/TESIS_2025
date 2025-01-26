import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Container(
          width: double.infinity,
          height: double.infinity,
          color: const Color(0xFFB2EBF2), // Fondo azul claro
          child: Column(
            children: [
              // Espaciador para empujar el logotipo al centro
              const Spacer(),
              // Logotipo en el centro
              Image.asset(
                'assets/logologin.png', // Asegúrate de tener tu logo en esta ruta
                height: 100,
              ),
              const SizedBox(height: 20),
              // Texto debajo del logotipo (opcional, puedes añadirlo)
              const Text(
                'CALMATEC',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              // Otro espaciador para empujar el botón hacia abajo
              const Spacer(),
              GestureDetector(
                onTap: () {
                  print("Continuar con Google");
                },
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 4,
                        spreadRadius: 2,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset(
                        'assets/google_icon.png', 
                        height: 20,
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Continue with Google',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.black54,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
