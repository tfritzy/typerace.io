using System;

public struct Quote
{
    public string Id;
    public string Text;
    public string Author;
}

public static class SpanishQuotes
{
    public static readonly Quote[] Quotes = new Quote[]
    {
        new Quote { Id = "https://es.wikiquote.org/wiki/Mar%C3%ADa_Bastidas_Aliaga", Text = "Los periodos de crisis económica golpean más duramente a las mujeres que a los hombres, esto se debe en parte, a que la mujer por su mayor interacción social en distintos roles (madre, esposa, ama de casa y trabajadora) se ve involucrada en múltiples escenarios sociales.", Author = "María Bastidas Aliaga" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Machado_de_Assis", Text = "Al ganador las patatas.", Author = "Machado de Assis" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Jane_Goodall", Text = "Ahora que finalmente nos hemos dado cuenta del terrible daño que hemos ocasionado al medio ambiente, estamos extremando nuestro ingenio para hallar soluciones tecnológicas.", Author = "Jane Goodall" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Miguel_Grau", Text = "Como del carbón sale el diamante, así de la negrura de esta guerra sale Grau.", Author = "Miguel Grau" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Compa%C3%B1%C3%ADa_de_Jes%C3%BAs", Text = "A la mayor gloria de Dios.[Ad maiorem Dei gloriam].", Author = "Compañía de Jesús" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Mar%C3%ADa_Eugenia_Vidal", Text = "Cuando uno está tan expuesto es inevitable que los que están al lado también. Y eso puede ser un desincentivo. Les pasa a mis hijos y a mis padres. Pero cuando el amor aparece de verdad todo eso es secundario.", Author = "María Eugenia Vidal" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Larry_Ellison", Text = "Construir Oracle para mí, fue como hacer un rompecabezas para niño.", Author = "Larry Ellison" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Mira_Rai", Text = "Empecé a correr para escapar de mi futuro.", Author = "Mira Rai" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Celia_Villalobos", Text = "Estos socialistas son al petroleo lo que Carmen Machi a los yogures bifidus", Author = "Celia Villalobos" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Juan_V%C3%A1zquez_de_Mella", Text = "El movimiento bolcheviquista tiene origen, impulso y dirección judaica", Author = "Juan Vázquez de Mella" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Lidia_Sogandares", Text = "Desde que tengo conciencia, abrigaba el ansia de ser médica. Ese deseo mío era algo insólito. Todos me decían que no lograría nunca mi anhelo y que pronto me aburriría.", Author = "Lidia Sogandares" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Hermann_von_Helmholtz", Text = "La cantidad de fuerza que puede ponerse en práctica en la totalidad de la naturaleza es inmutable, y no puede ser aumentada ni disminuida.", Author = "Hermann von Helmholtz" },
        new Quote { Id = "https://es.wikiquote.org/wiki/LeBron_James", Text = "No necesito demasiado. El glamour y todas esas cosas no me excitan. Estoy contento por tener al baloncesto en mi vida.", Author = "LeBron James" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Antonia_Gimeno_Travesset", Text = "La felicidad al reunirnos lo superaba todo. Jugábamos al aire libre aunque lloviera; los vestuarios no tenían agua caliente, muchas pistas eran de tierra y los balones de cuero, parecidos a los antiguos de fútbol​.", Author = "Antonia Gimeno Travesset" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Barbara_Tuchman", Text = "El objetivo del escritor es -o debería ser- mantener la atención del lector.", Author = "Barbara Tuchman" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Edgar_Allan_Poe", Text = "Cuando un loco parece completamente sensato es ya el momento de ponerle la camisa de fuerza.", Author = "Edgar Allan Poe" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Steven_Weinberg", Text = "El propósito de mi trabajo no es que la vida sea mejor. Lo que quiero es que sea más interesante.", Author = "Steven Weinberg" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Antonio_Gala", Text = "El escritor, muchas veces, es como un caballo de carreras que ha perdido su jinete y ya no sabe por qué está corriendo ni dónde está la meta y, sin embargo, se le exige seguir corriendo aunque no sepa ni hacia dónde ni por qué razón", Author = "Antonio Gala" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Miguel_D%C3%ADaz-Canel", Text = "Jamás cederemos ante presiones o amenazas. Los cambios que sean necesarios los seguirá decidiendo soberanamente el pueblo cubano..", Author = "Miguel Díaz-Canel" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Villano", Text = "La misma energía que lleva a un hombre a convertirse en villano, haría de él algo útil para la sociedad si esa sociedad estuviese bien organizada.", Author = "Villano" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Marcellin_Berthelot", Text = "No quiero que la química degenere en una religión; No quiero que el químico crea en la existencia de átomos como el cristiano cree en la existencia de Cristo en la hostia de la comunión.", Author = "Marcellin Berthelot" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Dominique_de_Villepin", Text = "Así que nadie puede afirmar en estos momentos que el camino de la guerra será más corto que el de las inspecciones. Como tampoco puede nadie afirmar que esa opción desembocaría en un mundo más seguro, más justo y estable. Y es que la guerra siempre es la prueba de un fracaso.", Author = "Dominique de Villepin" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Robert_Schuman", Text = "La libertad asusta cuando se ha perdido la costumbre de utilizarla.", Author = "Robert Schuman" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Juan_Pablo_Montoya", Text = "Aunque soy un conductor agresivo y lucho por el éxito, ciertamente no morderé a nadie, si es el ejemplo de Mike Tyson el que utilizamos....", Author = "Juan Pablo Montoya" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Carles_Puigdemont", Text = "Los invasores serán expulsados de Catalunya, como lo fueron en Bélgica, y nuestra tierra volverá a ser, bajo la república, en la paz y en el trabajo, señora de sus libertades y sus destinos..", Author = "Carles Puigdemont" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Stirling_Moss", Text = "Creo que si un hombre quisiera caminar sobre el agua, y estuviera preparado para dejarse la vida en ello, podría conseguirlo.", Author = "Stirling Moss" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Georg_Christoph_Lichtenberg", Text = "Quien busque la injusticia no necesitará lámpara.[29]<", Author = "Georg Christoph Lichtenberg" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Proverbio", Text = "Quien no da un proverbio, no llega a viejo.", Author = "Proverbio" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Elena_Moncada", Text = "Para mí la prostitución no es un trabajo porque no se lo recomendarías a un hijo, hija, alguna amiga, gente querida. Esto no se lo recomendás a nadie, acá nos sos dueña de tu cuerpo, nunca podés elegir: siempre te elijen.", Author = "Elena Moncada" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Rescate_en_el_tiempo", Text = "No me importa mi futuro. Me importa el futuro del futuro.", Author = "Rescate en el tiempo" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Joaqu%C3%ADn_Leguina", Text = "Tienen que dedicarse a estudiar.", Author = "Joaquín Leguina" },
        new Quote { Id = "https://es.wikiquote.org/wiki/R%C3%B3mulo_Escobar_Bethancourt", Text = "La Revolución panameña, señores, no transita por una carretera. Estamos abriendo una trocha y algún día esta trocha será una avenida ancha que conduzca al bienestar y felicidad del panameño.", Author = "Rómulo Escobar Bethancourt" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Jos%C3%A9_Luis_Rodr%C3%ADguez_Zapatero", Text = "Mi abuelo pedía en el testamento que, cuando fuera posible, se rehabilitara su nombre, para que quedara claro que no fue un traidor a la patria. Sin duda alguna, la figura de mi abuelo ha tenido mucho peso en mi vida.", Author = "José Luis Rodríguez Zapatero" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Keith_Richards", Text = "Cuando estás creciendo, hay dos lugares institucionales que te afectan más poderosamente: la iglesia, que pertenece a Dios, y la biblioteca pública, que te pertenece. La biblioteca pública es un gran ecualizador.", Author = "Keith Richards" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Refranes_en_espa%C3%B1ol_%28B%29", Text = "Barriga caliente, pie durmiente.", Author = "Refranes en español (B)" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Apaga_y_v%C3%A1monos", Text = "Vino Federico II, se extendió su espíritu maligno y apaga y vámonos.", Author = "Apaga y vámonos" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Andr%C3%A9i_Tarkovski", Text = "[El cine] abrió las posibilidades de recrear, de una forma nueva, la autentica atmósfera de la guerra, con su concentración hipertensa de nervios, invisible en la superficie pero haciéndose notar como un estruendo bajo la tierra.", Author = "Andréi Tarkovski" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Ramiro_Ledesma_Ramos", Text = "España lleva doscientos o más años ensayando el mejor modo de morir.", Author = "Ramiro Ledesma Ramos" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Anita_Berber", Text = "Bailamos a la muerte, a la enfermedad, al embarazo, a la sífilis, a la locura, a la hambruna, a la discapacidad y nadie nos toma en serio.", Author = "Anita Berber" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Juan_Luis_Cebri%C3%A1n", Text = "Cuando queda tiempo para aburrirse, yo procuro aburrirme, porque el aburrimiento es una forma de descanso. [1].", Author = "Juan Luis Cebrián" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Javier_Milei", Text = "Viva la libertad, carajo.", Author = "Javier Milei" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Burjasot", Text = "Burjassot es machote, y Godella es hembra.", Author = "Burjasot" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Amigo", Text = "Soy gran amigo y hago todo lo posible para que la gente me aprecie. Lo que más vale en la vida son los amigos. De eso estoy seguro y siempre lo he dicho. Desgraciadamente, por los caminos de la vida también se encuentra gente desleal.", Author = "Amigo" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Richard_Feynman", Text = "Feynman [es] la combinación imposible de físico teórico y artista de circo, todo movimiento corporal y efectos de sonido.", Author = "Richard Feynman" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Carlos_Slim", Text = "El trabajo bien hecho no es sólo una responsabilidad con la sociedad, es también una necesidad emocional.", Author = "Carlos Slim" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Marco_Enr%C3%ADquez-Ominami", Text = "Proponemos hablar de sexo, en Chile se habla poco de sexo y le hemos dejado este espacio a programas de televisión y al bloqueo de los conservadores (2013).", Author = "Marco Enríquez-Ominami" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Federico_Moccia", Text = "La felicidad no es una meta, sino un estilo de vida.", Author = "Federico Moccia" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Rodolfo_Valentino", Text = "El gigoló con el que sueñan todas las mujeres.", Author = "Rodolfo Valentino" },
        new Quote { Id = "https://es.wikiquote.org/wiki/David_Bohm", Text = "El Universo consiste en luz helada.", Author = "David Bohm" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Retener", Text = "Es inútil querer retener el agua entre los dedos.[8] proverbios malgaches", Author = "Retener" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Pie", Text = "Buscarle cinco pies al gato.", Author = "Pie" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Bor%C3%ADs_Gryzlov", Text = "El Parlamento no es lugar para la discusión.", Author = "Borís Gryzlov" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Rafael_Bielsa", Text = "[...] la mayoría de los ciudadanos no existe como comunidad. Entonces todo se fragmenta, y con el tiempo se envilece el ejercicio democrático del poder", Author = "Rafael Bielsa" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Elvis_Presley", Text = "Cuando las cosas van mal, no vayas con ellas.", Author = "Elvis Presley" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Magaly_Pineda", Text = "No hay que perder la capacidad de asombro, es lo más importante, uno puede ponerse viejo siendo joven, cuando una pierde la capacidad de asombrarse y preguntarse de por qué pasan las cosas.", Author = "Magaly Pineda" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Raquel_Rosario_S%C3%A1nchez", Text = "Es siniestro meterle en la cabeza a una persona menor de edad que su cuerpo es su enemigo.", Author = "Raquel Rosario Sánchez" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Octave_Mirbeau", Text = "Aunque yo era un hombre honorable a sus ojos, ella no me amaba. Pero en el momento en que comprendió lo que yo era, cuando respiró el verdadero y repugnante olor de mi alma, nació el amor en ella, ¡porque me ama! ¡Bien bien! No hay nada real, entonces, excepto el mal.", Author = "Octave Mirbeau" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Art_Buchwald", Text = "Morir es fácil. Lo difícil es encontrar aparcamiento.", Author = "Art Buchwald" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Paula_Oliveto", Text = "El peronista te acompaña al cementerio, pero no se mete con vos en el cajón.", Author = "Paula Oliveto" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Andr%C3%A9_Maurois", Text = "Ser sincero no es decir todo lo que se piensa, sino no decir nunca lo contrario de lo que pensamos.[60]>", Author = "André Maurois" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Francisco_Silvela", Text = "Madrid, en verano, sin familia y con dinero, Baden Baden.", Author = "Francisco Silvela" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Alejandro_Guillier", Text = "Le meteremos la mano en el bolsillo a quienes concentran el ingreso, para que ayuden a hacer patria alguna vez.", Author = "Alejandro Guillier" },
        new Quote { Id = "https://es.wikiquote.org/wiki/John_Galsworthy", Text = "El hombre de acción a quien se le obliga a adoptar un estado pensativo se siente infeliz hasta poder librarse de dicha obligación.", Author = "John Galsworthy" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Richard_Wilkinson", Text = "Los más violentos criminales en nuestras prisiones habían sido ellos mismos, víctimas de un grado de maltrato infantil que estaba más allá de la escala de lo que jamás pensé que se pudiera aplicar al término de abuso infantil.", Author = "Richard Wilkinson" }
    };
}