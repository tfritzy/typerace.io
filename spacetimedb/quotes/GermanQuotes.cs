using System;

public struct Quote
{
    public string Id;
    public string Text;
    public string Author;
}

public static class GermanQuotes
{
    public static readonly Quote[] Quotes = new Quote[]
    {
        new Quote { Id = "https://de.wikiquote.org/wiki/Peter_Schaar", Text = "Eine Sicherheitspolitik, die sich darauf konzentriert, immer mehr Daten anzuhäufen, ist selbst ein Sicherheitsrisiko.", Author = "Peter Schaar" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Edward_Abbey", Text = "Wachstum um des Wachstums willen ist die Ideologie der Krebszelle.", Author = "Edward Abbey" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Alpen", Text = "Nun ging mir eine neue Welt auf. Ich näherte mich den Gebirgen, die sich nach und nach entwickelten.", Author = "Alpen" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Evelyn_Hamann", Text = "Liebe Evelyn! Dein Timing war immer perfekt - nur heute hast Du die Reihenfolge nicht eingehalten. Na warte!", Author = "Evelyn Hamann" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Frage", Text = "Aber es gibt Fragen, zu deren Beantwortung ein langes Leben notwendig ist.", Author = "Frage" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Waldemar_Bonsels", Text = "Das beste Buch ist aber das, welches dem Leser seinen eigenen Reichtum fühlbar macht.", Author = "Waldemar Bonsels" },
        new Quote { Id = "https://de.wikiquote.org/wiki/S%C3%BC%C3%9F", Text = "Abwechslung in allem ist süß.", Author = "Süß" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Bernhard_von_B%C3%BClow", Text = "Mit einem Worte: wir wollen niemand in den Schatten stellen, aber wir verlangen auch unseren Platz an der Sonne.", Author = "Bernhard von Bülow" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Emmanuel_Joseph_Siey%C3%A8s", Text = "Sie wollen frei sein, und verstehen nicht, gerecht zu sein.", Author = "Emmanuel Joseph Sieyès" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Arthur_Moeller_van_den_Bruck", Text = "Politik läßt sich rückgängig machen, Geschichte nicht.", Author = "Arthur Moeller van den Bruck" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Werden", Text = "Aus Fluch wird Fluch.", Author = "Werden" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Brand_%28Feuer%29", Text = "Ich bin nur Flamme, Durst und Schrei und Brand.", Author = "Brand (Feuer)" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Arglosigkeit", Text = "Das Lachen verlangt Arglosigkeit, die meisten Menschen lachen aber am häufigsten boshaft.", Author = "Arglosigkeit" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Ursula_Lehr", Text = "Wer die Abtreibungszahlen senken will, muß für Kindergartenplätze und Tagesbetreuung auch für die ganz Kleinen sorgen.", Author = "Ursula Lehr" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Mathias_Knei%C3%9Fl", Text = "Die Woche fängt gut an.", Author = "Mathias Kneißl" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Otto_Ludwig", Text = "Glück ist wie Sonne. Ein wenig Schatten muß sein, wenn's dem Menschen wohl werden soll.", Author = "Otto Ludwig" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Peter_Turrini", Text = "Der heutige Mensch ist weder gut noch böse, nur noch egozentrisch.", Author = "Peter Turrini" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Philipp_Mi%C3%9Ffelder", Text = "Die Werte der Großeltern sollten wieder eine stärkere Rolle spielen.", Author = "Philipp Mißfelder" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Heiligtum", Text = "Ein Briefkasten heißt nur so; in Wahrheit ist er das Sanktuarium menschlichen Gedankenaustausches.", Author = "Heiligtum" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Franziska_zu_Reventlow", Text = "Alles Fühlende leidet in mir, aber mein Wille ist stets mein Bezwinger und Freudenbringer.", Author = "Franziska zu Reventlow" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Dagmar_Metzger", Text = "Auch Politiker sind Vorbilder. Sie sollten sich an das halten, was sie vor der Wahl versprechen.", Author = "Dagmar Metzger" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Paul-Henri_Thiry_D%27Holbach", Text = "Der Mensch ist darum unglücklich, weil er die Natur verkennt.", Author = "Paul-Henri Thiry D'Holbach" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Primo_Levi", Text = "Es ist geschehen, und folglich kann es wieder geschehen: darin liegt der Kern dessen, was wir zu sagen haben.", Author = "Primo Levi" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Lachen", Text = "Das Lächeln wird nicht gelehrt, es trägt in sich einen gemeinverständlichen Sinn.", Author = "Lachen" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Anspruch", Text = "Die Ansprüche, die ein Mensch an andre stellt, stehn gewöhnlich in umgekehrtem Verhältnis zu seinen Leistungen.", Author = "Anspruch" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Spanische_Sprichw%C3%B6rter", Text = "Alles besiegt die Liebe, alles erreicht das Geld, alles endet mit dem Tode, alles verschlingt die Zeit.", Author = "Spanische Sprichwörter" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Oliviero_Toscani", Text = "Betrachten ist ein schöpferischer Akt.", Author = "Oliviero Toscani" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Klaus_Wowereit", Text = "Berlin ist arm, aber sexy.", Author = "Klaus Wowereit" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Fritz_Teufel", Text = "Solidarität, das ist eine Droge, die high macht, andererseits auch abhängig.", Author = "Fritz Teufel" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Pierre_Bourdieu", Text = "So macht uns die Soziologie paradoxerweise frei, indem sie uns von der Illusion der Freiheit befreit.", Author = "Pierre Bourdieu" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Ulrich_Wickert", Text = "[…] einen angenehmen Abend und eine geruhsame Nacht.", Author = "Ulrich Wickert" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Jackson_Pollock", Text = "Vor einiger Zeit schrieb ein Kritiker, meine Bilder hätten weder Anfang noch Ende. Das meinte er nicht als Kompliment, aber es war eins. Es war ein feines Kompliment", Author = "Jackson Pollock" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Franz_Beckenbauer", Text = "Johan war der bessere Spieler, aber ich war Weltmeister.", Author = "Franz Beckenbauer" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Woody_Allen", Text = "Ich habe keine Angst vor dem Tod, ich möchte nur nicht dabeisein, wenn’s passiert.", Author = "Woody Allen" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Birgitta_von_Schweden", Text = "Die Sonne ist nicht verschwunden, weil die Blinden sie nicht sehen.", Author = "Birgitta von Schweden" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Vince_Ebert", Text = "Ohne den elektrischen Strom hätten wir innerhalb kürzester Zeit Zustände, wie sie noch nicht einmal im Odenwald vorkommen.", Author = "Vince Ebert" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Sten_Nadolny", Text = "Es gibt zwei Sorten von Männern. Die einen verstehen etwas von Frauen, die anderen sind solche, die einfach Frauen verstehen. Ich weiß nicht, welche Sorte mir verdächtiger ist.", Author = "Sten Nadolny" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Maximilian_Scheer", Text = "Freunde sprechen miteinander in achtungsvoller Offenheit.", Author = "Maximilian Scheer" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Kai_Hensel", Text = "Die besten sind das Maß, an dem die übrigen gemessen werden.", Author = "Kai Hensel" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Josef_Reding", Text = "Das schwerste Wort heißt nicht Popocatépetl wie der Berg in Mexiko und nicht Chichicastenango wie der Ort in Guatemala und nicht Ouagadougou wie die Stadt in Afrika. Das schwerste Wort heißt für viele: „Danke.", Author = "Josef Reding" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Eugen_Drewermann", Text = "Das Maß unserer Menschlichkeit bestimmt sich wesentlich danach, inwieweit wir über Worte verfügen, die das Erleben und die Gefühlswelt von Menschen auszudrücken vermögen.", Author = "Eugen Drewermann" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Josef_Joffe", Text = "Versuche nie durch Konspiration zu erklären, was auf Chaos oder Inkompetenz zurückgeführt werden muss.", Author = "Josef Joffe" },
        new Quote { Id = "https://de.wikiquote.org/wiki/A", Text = "Wer a sagt, der muss nicht b sagen. Er kann auch erkennen, dass a falsch war.", Author = "A" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Ernst_Ludwig_Kirchner", Text = "Ein einiges Europa wäre das Ende der Kriege und es wird kommen, aber wann?", Author = "Ernst Ludwig Kirchner" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Barthold_Heinrich_Brockes", Text = "Der Narr lebt arm, um reich zu sterben.", Author = "Barthold Heinrich Brockes" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Pendel", Text = "Das Pendel muss zwischen Einsamkeit und Gemeinsamkeit, zwischen Einkehr und Rückkehr schwingen.", Author = "Pendel" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Peter_Hartz", Text = "Der wahre Grund für die Arbeitslosigkeit ist die Gleichgültigkeit der Nichtbetroffenen.", Author = "Peter Hartz" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Steuern", Text = "Die Kritik ist eine Steuer, die der Neid dem Talent auferlegt.", Author = "Steuern" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Joachim_Kr%C3%B3l", Text = "Den Kindern sage ich, spielt draußen.", Author = "Joachim Król" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Wurzel", Text = "Die Bäume mit tiefen Wurzeln sind die, die hoch wachsen.", Author = "Wurzel" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Vorsatz", Text = "Alle guten Vorsätze haben etwas Verhängnisvolles: Sie werden zu früh gefasst.", Author = "Vorsatz" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Harald_Welzer", Text = "Der Klimawandel wird zu einer Häufung sozialer Katastrophen führen.", Author = "Harald Welzer" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Wert", Text = "Alle wertvollen Gefühle – für einen Menschen wie für einen Glauben, eine Scholle, ein Land – sind konservativ.", Author = "Wert" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Professor", Text = "Ich habe absolut kein Verständnis für Professoren, die damit prahlen, wie viele Studenten bei ihnen durchfallen. Solche Horrorszenarien schüren bei jungen Menschen doch bloß die Angst vor technischen Fächern.", Author = "Professor" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Suchen", Text = "Alles auf Erden lässt sich finden, wenn man nur zu suchen sich nicht verdrießen lässt.", Author = "Suchen" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Satz", Text = "Ein Aphoristiker sagt, ohne viele Worte zu machen, alles in einem Satz.", Author = "Satz" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Hans_Henny_Jahnn", Text = "Ich führe mich auf wie einer, der nur halb geboren wurde.", Author = "Hans Henny Jahnn" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Lyndon_B._Johnson", Text = "John Kennedy wurde ermordet, und auch ich werde ermordet (...) der einzige Unterschied ist: Ich lebe.", Author = "Lyndon B. Johnson" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Elazar_Benyo%C3%ABtz", Text = "Das Gute im Menschen – sein schlechtes Gewissen.", Author = "Elazar Benyoëtz" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Arnold_Zweig", Text = "Aber wer nicht mit den Leidenden fühlt, stärkt die Mörder.", Author = "Arnold Zweig" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Axel_Hacke", Text = "Die Globalisierung ist von den Vögeln erfunden worden, seit Jahrtausenden fliegen sie um die Welt.", Author = "Axel Hacke" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Roman_Herzog", Text = "Es gibt einen alten Spruch: Die ganze Dunkelheit der Welt reicht nicht aus, das Licht einer einzigen Kerze zu löschen.", Author = "Roman Herzog" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Uwe_Timm", Text = "Auch das begleitet mich jetzt in den letzten Tagen, nach sieben Monaten Schreiben, ein Druck auf der linken Brust, hin und wieder beim Durchatmen. Es sind nicht Schmerzen, kein Stechen, ein sanfter Druck, so ist das Herz spürbar geworden.", Author = "Uwe Timm" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Das_Alte", Text = "Jede große Reform hat nicht darin bestanden, etwas Neues zu tun, sondern etwas Altes abzuschaffen.", Author = "Das Alte" },
        new Quote { Id = "https://de.wikiquote.org/wiki/S._Ramanujan", Text = "Eine Gleichung hat für mich keinen Sinn, es sei denn, sie drückt einen Gedanken Gottes aus.", Author = "S. Ramanujan" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Novalis", Text = "Der Mensch vermag in jedem Augenblick ein übersinnliches Wesen zu sein. Ohne dies wäre er nicht Weltbürger - er wäre ein Tier.", Author = "Novalis" },
        new Quote { Id = "https://de.wikiquote.org/wiki/Zeile", Text = "Zeile für Zeile // Meine eigene Wüste // Zeile für Zeile // Mein Paradies.", Author = "Zeile" }
    };
}