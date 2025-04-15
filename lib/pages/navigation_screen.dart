import 'package:flutter/material.dart';
import 'pagina_home.dart';
import 'pagina_user.dart';
import 'pagina_edit.dart';
import 'pagina_favorito.dart';
import 'pagina_chat.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class NavigationScreen extends StatefulWidget {
  const NavigationScreen({Key? key}) : super(key: key);

  @override
  _NavigationScreenState createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  int _paginaActual = 0;

  final List<String> _titulos = [
    'Inicio',
    'Chat',
    'Favoritos',
    'Editar',
    'Usuario',
  ];

  final List<Widget> _paginas = [
    PaginaHome(),
    PaginaChat(),
    PaginaFavorito(),
    PaginaEdit(),
    PaginaUser(),
  ];

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.indigo,
        title: Row(
          children: [

            Image.asset(
              'assets/images/superior.png',
              height: 28,
            ),
            const SizedBox(width: 8),


            Expanded(
              child: Align(
                alignment: Alignment.center,
                child: Text(
                  _titulos[_paginaActual], 
                  style: const TextStyle(fontSize: 20),
                ),
              ),
            ),
          ],
        ),
      ),



        body: _paginas[_paginaActual],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _paginaActual,
          onTap: (index) {
            setState(() {
              _paginaActual = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home, size: 20), label: "Inicio"),
            BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline, size: 20), label: "Chat"),
            BottomNavigationBarItem(icon: Icon(Icons.favorite, size: 20), label: "Favoritos"),
            BottomNavigationBarItem(icon: Icon(Icons.edit, size: 20), label: "Editar"),
            BottomNavigationBarItem(icon: Icon(Icons.supervised_user_circle, size: 20), label: "Usuario"),
          ],
        ),
      ),
    );
  }
}
