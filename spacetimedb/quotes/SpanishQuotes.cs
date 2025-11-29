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
        new Quote { Id = "https://es.wikiquote.org/wiki/Refranes_en_espa%C3%B1ol_%28L%29", Text = "La abadesa más segura, la de edad madura.", Author = "Refranes en español (L)" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Re%C3%ADr_y_llorar", Text = "Cuando la vida te presente razones para llorar, demuéstrale que tienes mil y una razones para reír.[1] anónimo", Author = "Reír y llorar" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Sublime", Text = "Las cualidades sublimes infunden respeto; las bellas, amor.", Author = "Sublime" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Lidia_Sogandares", Text = "Desde que tengo conciencia, abrigaba el ansia de ser médica. Ese deseo mío era algo insólito. Todos me decían que no lograría nunca mi anhelo y que pronto me aburriría.", Author = "Lidia Sogandares" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Humberto_Salvador", Text = "La naturaleza nos impone la suprema norma de la perpetua revolución estética.", Author = "Humberto Salvador" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Maitena_Monroy", Text = "A pesar de todos los logros, las mujeres seguimos siendo agredidas, acosadas, violadas, asesinadas... Frente a esta realidad hay que dotarse de recursos personales y colectivos que permitan poder actuar en lo concreto.", Author = "Maitena Monroy" },
        new Quote { Id = "https://es.wikiquote.org/wiki/David_Hilbert", Text = "La Física es demasiado importante para ser dejada a los físicos.", Author = "David Hilbert" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Ant%C3%B3nio_de_Oliveira_Salazar", Text = "El pasado de nuestro país está lleno de gloria, de heroísmo; pero lo que hemos necesitado, y especialmente en los últimos cien años, ha sido menos brillantez y más resistencia, algo menos llamativo pero con más perspectiva.", Author = "António de Oliveira Salazar" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Lydia_Hung_Wong", Text = "Hay una serie de beneficios que conlleva aprender y practicar música. Te desarrolla los dos hemisferios del cerebro, lo emocional, lo social, la disciplina y la concentración en el pensamiento lógico matemático.", Author = "Lydia Hung Wong" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Carlos_Humberto_Perette", Text = "Nuestro gobierno está dispuesto a convocar a todos los argentinos en esa tarea. Nadie puede renunciar a su deber. Con el esfuerzo común lograremos salvar a la República.", Author = "Carlos Humberto Perette" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Mira_Rai", Text = "Empecé a correr para escapar de mi futuro.", Author = "Mira Rai" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Soledades._Galer%C3%ADas._Otros_poemas", Text = "He andado muchos caminos,he abierto muchas veredas,he navegado en cien mares,y atracado en cien riberas.", Author = "Soledades. Galerías. Otros poemas" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Ellen_Johnson-Sirleaf", Text = "El tamaño de tus sueños siempre debe exceder su capacidad actual para lograrlos. Si tus sueños no te asustan, no son lo suficientemente grandes.", Author = "Ellen Johnson-Sirleaf" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Gabriela_Calistro_Rivera", Text = "Una de las cosas que me fascinan de la astronomía es la perspectiva sobre la posición en el universo. Somos tan pequeños. Hay una imagen de la Tierra desde el exterior, donde observas que es un pixel. Todo lo que nos agobia, los problemas que hay, son tan pequeños.", Author = "Gabriela Calistro Rivera" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Oliver_Sacks", Text = "Al examinar las enfermedades, adquirimos conocimientos sobre anatomía, fisiología y biología. Al examinar a la persona enferma, obtenemos sabiduría sobre la vida.", Author = "Oliver Sacks" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Luis_Cernuda", Text = "Abajo todo, todo, excepto la derrota.", Author = "Luis Cernuda" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Planta", Text = "Si haces planes para un año, siembra arroz. Si los haces para dos lustros, planta árboles. Si los haces para toda la vida, educa a una persona.[15] proverbios chinos", Author = "Planta" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Momo", Text = "Fueron pocos meses los que pasaron así, y no obstante fue la temporada más larga que Momo experimentó jamás. Porque el verdadero tiempo no se puede medir por el reloj o el calendario.", Author = "Momo" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Denis_Diderot", Text = "Se habla sin cesar contra las pasiones. Se las considera la fuente de todo mal humano, pero se olvida que también lo son de todo placer.", Author = "Denis Diderot" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Anna_Sewell", Text = "Un objetivo especial era promover la amabilidad, la simpatía y un trato comprensivo de los caballos.", Author = "Anna Sewell" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Helio_Pedregal", Text = "Fingimos que no sabemos para no comprometernos.", Author = "Helio Pedregal" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Alberto_Ascari", Text = "Siempre había sido mi norma, después de un accidente, conducir más rápido que nunca.", Author = "Alberto Ascari" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Cristina_Lobaiza_Estrada", Text = "Una mujer que dice de sí misma que está sola no necesita explicarle a nadie de qué está hablando: la soledad de una mujer siempre es soledad de hombre.", Author = "Cristina Lobaiza Estrada" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Optimismo_y_pesimismo", Text = "Optimista es el que os mira a los ojos, pesimista, el que os mira a los pies.", Author = "Optimismo y pesimismo" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Tesoro", Text = "La gente cree que es tesoro todo lo que vale mucho, pero el verdadero tesoro es lo que no se puede vender.", Author = "Tesoro" },
        new Quote { Id = "https://es.wikiquote.org/wiki/J._G._Ballard", Text = "Todo se está convirtiendo en ciencia ficción. De los márgenes de una literatura casi invisible ha brotado la realidad entera del siglo XX.", Author = "J. G. Ballard" },
        new Quote { Id = "https://es.wikiquote.org/wiki/Juan_Luis_Cebri%C3%A1n", Text = "Cuando queda tiempo para aburrirse, yo procuro aburrirme, porque el aburrimiento es una forma de descanso. [1].", Author = "Juan Luis Cebrián" }
    };
}