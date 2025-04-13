import 'package:flutter/material.dart';

class PaginaUser extends StatelessWidget {
  const PaginaUser({Key? key}) : super(key: key); 

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Center(
              child: Text("User", style: TextStyle(fontSize: 30)),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/');
                },
                icon: const Icon(Icons.exit_to_app),
                label: const Text("Salir"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  minimumSize: const Size(double.infinity, 50),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
