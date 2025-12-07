using System;
using System.Linq;

namespace StdbModule;

public static partial class PortugueseQuotes
{
    public static readonly Quote[] Quotes =
        AlbertoCaeiro.Quotes
        .Concat(AlexandreHerculano.Quotes)
        .Concat(AlmeidaGarrett.Quotes)
        .Concat(AlphonsusdeGuimaraens.Quotes)
        .Concat(AnterodeQuental.Quotes)
        .Concat(AntónioLoboAntunes.Quotes)
        .Concat(AquilinoRibeiro.Quotes)
        .Concat(AugustodosAnjos.Quotes)
        .Concat(BernardoGuimarães.Quotes)
        .Concat(BernardoSoares.Quotes)
        .Concat(CamiloCasteloBranco.Quotes)
        .Concat(CarlosDrummonddeAndrade.Quotes)
        .Concat(CastroAlves.Quotes)
        .Concat(CecíliaMeireles.Quotes)
        .Concat(ChicoBuarque.Quotes)
        .Concat(ClariceLispector.Quotes)
        .Concat(CruzeSousa.Quotes)
        .Concat(EuclidesdaCunha.Quotes)
        .Concat(EugêniaCâmara.Quotes)
        .Concat(FernandoPessoa.Quotes)
        .Concat(FernandoSabino.Quotes)
        .Concat(FlorbelaEspanca.Quotes)
        .Concat(GonçalvesDias.Quotes)
        .Concat(GracilianoRamos.Quotes)
        .Concat(GuerraJunqueiro.Quotes)
        .Concat(GuimarãesRosa.Quotes)
        .Concat(JorgeAmado.Quotes)
        .Concat(JoséRégio.Quotes)
        .Concat(JoséSaramago.Quotes)
        .Concat(JosédeAlencar.Quotes)
        .Concat(JoãoCabraldeMeloNeto.Quotes)
        .Concat(MachadodeAssis.Quotes)
        .Concat(ManuelBandeira.Quotes)
        .Concat(MiguelTorga.Quotes)
        .Concat(MonteiroLobato.Quotes)
        .Concat(MáriodeAndrade.Quotes)
        .Concat(OlavoBilac.Quotes)
        .Concat(OswalddeAndrade.Quotes)
        .Concat(OttoLaraResende.Quotes)
        .Concat(PauloCoelho.Quotes)
        .Concat(PauloMendesCampos.Quotes)
        .Concat(RacheldeQueiroz.Quotes)
        .Concat(RicardoReis.Quotes)
        .Concat(RubemBraga.Quotes)
        .Concat(VergílioFerreira.Quotes)
        .Concat(ViniciusdeMoraes.Quotes)
        .Concat(ÁlvaresdeAzevedo.Quotes)
        .Concat(ÁlvarodeCampos.Quotes)
        .Concat(ÉricoVeríssimo.Quotes)
        .ToArray();
}