import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFB2EBF2),
      //el appbar te da un espacio en al aprte superior para poder tener un esapcio para poner botones
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Color(0xFFB2EBF2),////esta es otra forma alternativa de poner : colorTheme.of(context).primaryColor
                                            /////pero esa otra forma que es el colorTheme.of(context).primaryColor se define o
                                            ///defini en el main.dart
      ),
      body: Center(
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 30, bottom: 50),
              child:Image.asset(
                'assets/logologin2.png',  // Ruta de la imagen en assets
                height: 100,  // Ajusta el tamaño según necesites
              ),
            ),
            Card(
              margin: const EdgeInsets.all(20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(13)),
                /////////////////aqui con el Theme.of(context).primaryColor se agarra el color que se designo como primary
                ///en el main asi qe uchecar eso
              color: Color.fromARGB(255, 122, 203, 214),
              child:ListView(
                shrinkWrap: true,
                padding: const EdgeInsets.all(10),
                children: [
                  Container(
                    height: 50,
                    margin: const EdgeInsets.only(top: 10 , bottom: 25),
                    child: const Center(
                      child: Text('Cuestionario inicial', 
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 20,
                      ),
                      ),
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(color:Colors.black),
                      gradient: LinearGradient(
                        begin: Alignment.topRight,
                        end: Alignment.bottomLeft,
                        colors: [
                          const Color.fromARGB(255, 159, 218, 193),
                          const Color.fromARGB(255, 108, 230, 169),
                        ]),
                        borderRadius: BorderRadius.circular(10),
  
                    ),
                  ),
                  OutlinedButton(
                    onPressed: (){
                      Navigator.pushNamed(context, '/quiz-page');
                    },
                     child: Text('Comenzar'),
                     style: OutlinedButton.styleFrom(
                       foregroundColor: Colors.white,
                       backgroundColor: Colors.green,
                       elevation: 4,
                       side: const BorderSide(width: 1),
                     ),
                  ),  
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}