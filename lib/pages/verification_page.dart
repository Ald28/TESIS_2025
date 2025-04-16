import 'package:flutter/material.dart';
import '../services/api_service.dart';

class VerificationPage extends StatefulWidget {
  final String email;

  const VerificationPage({super.key, required this.email});

  @override
  State<VerificationPage> createState() => _VerificationPageState();
}

class _VerificationPageState extends State<VerificationPage> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController codeController = TextEditingController();
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    emailController.text = widget.email; // Cargar el email recibido en el campo
  }

  void verifyCode() async {
  String email = emailController.text.trim();
  String code = codeController.text.trim();

  if (email.isEmpty || code.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('El correo y el código son obligatorios'), backgroundColor: Colors.red),
    );
    return;
  }

  setState(() {
    isLoading = true;
  });

  try {
    var response = await ApiService.verificarCodigo(email, code);
    print("Respuesta de verificación: $response");

    // Ahora verificamos si la respuesta tiene la clave "mensaje"
    if (response.containsKey("mensaje")) {
      print("Código verificado correctamente: ${response["mensaje"]}");

      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(context, '/quiz-page', (route) => false);
      }
    } else {
      print("Error en la verificación: ${response["detalle"]}");
      throw Exception(response["detalle"] ?? "Error desconocido");
    }
  } catch (e) {
    print("Error en la verificación: $e");
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error en la verificación: $e'), backgroundColor: Colors.red),
      );
    }
  } finally {
    setState(() {
      isLoading = false;
    });
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFB2EBF2),
      appBar: AppBar(
        title: const Center(child: Text("Verificación")),
        backgroundColor: const Color(0xFFB2EBF2),
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Ingresa tu correo electrónico",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: "Correo electrónico",
                  border: OutlineInputBorder(),
                ),
                readOnly: true, 
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              "Ingresa el código de verificación",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: TextField(
                controller: codeController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Código",
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: isLoading ? null : verifyCode,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent),
              child: isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text("Verificar", style: TextStyle(color: Colors.white, fontSize: 18)),
            ),
            TextButton(
              onPressed: isLoading
                  ? null
                  : () async {
                      setState(() {
                        isLoading = true;
                      });

                      var response = await ApiService.reenviarCodigo(emailController.text.trim());

                      setState(() {
                        isLoading = false;
                      });

                      if (response.containsKey("error")) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error: ${response["detalle"]}'), backgroundColor: Colors.red),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Código reenviado exitosamente'), backgroundColor: Colors.green),
                        );
                      }
                    },
              child: const Text(
                "¿No recibiste el código? Reenviar",
                style: TextStyle(color: Colors.blueAccent),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
