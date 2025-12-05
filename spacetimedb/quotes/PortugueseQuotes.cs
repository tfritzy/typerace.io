using System;
using System.Linq;


namespace StdbModule;
public static partial class PortugueseQuotes
{
    public static readonly Quote[] Quotes = 
        FernandoPessoa.Quotes
        .Concat(JoséSaramago.Quotes)
        .Concat(MachadodeAssis.Quotes)
        .Concat(PauloCoelho.Quotes)
        .Concat(ClariceLispector.Quotes)
        .Concat(CarlosDrummonddeAndrade.Quotes)
        .Concat(JorgeAmado.Quotes)
        .Concat(GuimarãesRosa.Quotes)
        .Concat(MáriodeAndrade.Quotes)
        .Concat(OswalddeAndrade.Quotes)
        .Concat(ManuelBandeira.Quotes)
        .Concat(CecíliaMeireles.Quotes)
        .Concat(ViniciusdeMoraes.Quotes)
        .Concat(JoãoCabraldeMeloNeto.Quotes)
        .Concat(GracilianoRamos.Quotes)
        .Concat(RacheldeQueiroz.Quotes)
        .Concat(ÉricoVeríssimo.Quotes)
        .Concat(MonteiroLobato.Quotes)
        .Concat(AluísioAzevedo.Quotes)
        .Concat(JosédeAlencar.Quotes)
        .Concat(CastroAlves.Quotes)
        .Concat(GonçalvesDias.Quotes)
        .Concat(ÁlvaresdeAzevedo.Quotes)
        .Concat(OlavoBilac.Quotes)
        .Concat(CruzeSousa.Quotes)
        .Concat(AugustodosAnjos.Quotes)
        .Concat(BernardoGuimarães.Quotes)
        .Concat(EuclidesdaCunha.Quotes)
        .Concat(AlphonsusdeGuimaraens.Quotes)
        .Concat(FernandoSabino.Quotes)
        .Concat(RubemBraga.Quotes)
        .Concat(OttoLaraResende.Quotes)
        .Concat(PauloMendesCampos.Quotes)
        .Concat(ChicoBuarque.Quotes)
        .Concat(AntónioLoboAntunes.Quotes)
        .Concat(AlmeidaGarrett.Quotes)
        .Concat(AlexandreHerculano.Quotes)
        .Concat(CamiloCasteloBranco.Quotes)
        .Concat(GuerraJunqueiro.Quotes)
        .Concat(AnterodeQuental.Quotes)
        .Concat(FlorbelaEspanca.Quotes)
        .Concat(MiguelTorga.Quotes)
        .Concat(VergílioFerreira.Quotes)
        .Concat(JoséRégio.Quotes)
        .Concat(AquilinoRibeiro.Quotes)
        .ToArray();
}