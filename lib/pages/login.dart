import 'package:flutter/material.dart';
import '../services/api_service.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController dniController = TextEditingController(); // Nuevo campo DNI
  bool isLoading = false;

  // Validación de correo electrónico
  bool isValidEmail(String email) {
    String emailRegex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
    return RegExp(emailRegex).hasMatch(email);
  }

  void login() async {
  String email = emailController.text.trim();
  String password = passwordController.text.trim();
  String dni = dniController.text.trim(); // solo si es nuevo

  if (email.isEmpty || password.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Correo y contraseña son obligatorios'), backgroundColor: Colors.red),
    );
    return;
  }

  if (!isValidEmail(email)) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Ingrese un correo válido'), backgroundColor: Colors.red),
    );
    return;
  }

  setState(() {
    isLoading = true;
  });

  // Intentar login primero
  var loginResponse = await ApiService.soloLogin(email, password);

  if (loginResponse.containsKey("error")) {
    // Si no está registrado, pedir DNI y registrar
    if (dni.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Usuario no encontrado. Ingresa tu DNI para registrarte.'), backgroundColor: Colors.orange),
      );
    } else {
      var registroResponse = await ApiService.loginOrRegister(email, password, dni);

      if (registroResponse.containsKey("error")) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error en registro: ${registroResponse["detalle"]}'), backgroundColor: Colors.red),
        );
      } else {
        Navigator.pushReplacementNamed(context, '/verification', arguments: email);
      }
    }
  } else {
    // Login exitoso
    Navigator.pushReplacementNamed(context, '/home');
  }

  setState(() {
    isLoading = false;
  });
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        color: const Color(0xFFB2EBF2),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/logologin2.png',
              height: 200,
            ),
            const SizedBox(height: 20),
            TextField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Correo electrónico',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Contraseña',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: dniController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'DNI',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 30),
            Stack(
              alignment: Alignment.center,
              children: [
                ElevatedButton(
                  onPressed: isLoading ? null : login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueAccent,
                    padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 15),
                  ),
                  child: const Text(
                    'Iniciar Sesión',
                    style: TextStyle(fontSize: 18, color: Colors.white),
                  ),
                ),
                if (isLoading)
                  const CircularProgressIndicator(color: Colors.white),
              ],
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: () {
                print("Continuar con Google");
              },
              child: Container(
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
                      'Continuar con Google',
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
    );
  }
}