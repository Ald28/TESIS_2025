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
  String dni = dniController.text.trim(); // Obtener DNI

  if (email.isEmpty || password.isEmpty || dni.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Correo, contraseña y DNI son obligatorios'), backgroundColor: Colors.red),
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

  var response = await ApiService.login(email, password, dni);
  print("Respuesta procesada: $response");

  if (response.containsKey("error")) {
    print("Error recibido: ${response["detalle"]}");
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error en el servidor: ${response["detalle"]}'), backgroundColor: Colors.red),
      );
    }
  } else if (response.containsKey("message")) {
    String message = response["message"];
    
    print("Mensaje recibido: $message");

    if (message.contains("autenticar el token")) {
      print("Redirigiendo a verificación...");
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/verification', arguments: email);
      }
    } else {
      print("Inicio de sesión exitoso: $message");
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    }
  } else {
    print("Respuesta inesperada del servidor.");
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