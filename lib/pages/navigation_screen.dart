import 'package:flutter/material.dart';
import 'pagina_home.dart';
import 'pagina_user.dart';
import 'pagina_edit.dart';
import 'pagina_favorito.dart';
import 'pagina_chat.dart';
import 'detalle_psicologo_page.dart';
import '../classes/psicologo.dart';

class NavigationScreen extends StatefulWidget {
  const NavigationScreen({Key? key}) : super(key: key);

  @override
  _NavigationScreenState createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  int _paginaActual = 0;
  Psicologo? _psicologoSeleccionado;

  late List<Widget> _paginas;

  final List<String> _titulos = [
    'Inicio',
    'Chat',
    'Favoritos',
    'Editar',
    'Usuario',
    'Detalle Psicólogo',
  ];

  @override
  void initState() {
    super.initState();

    _paginas = [
      PaginaHome(
        onSeleccionarPsicologo: (psicologo) {
          setState(() {
            _psicologoSeleccionado = psicologo;
            if (_paginas.length == 5) {
              _paginas.add(PaginaDetallePsicologo(psicologo: psicologo));
            } else {
              _paginas[5] = PaginaDetallePsicologo(psicologo: psicologo);
            }

            _paginaActual = 5;
          });
        },
      ),
      const PaginaChat(),
      const PaginaFavorito(),
      const PaginaEdit(),
      const PaginaUser(),
    ];
  }

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
          currentIndex: _paginaActual > 4 ? 0 : _paginaActual,
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
