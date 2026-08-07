import React from 'react';
import { Link } from 'react-router-dom';
import StaticPage, { Section } from '../components/StaticPage';
import { openConsentSettings } from '../components/CookieConsent';

const PrivacyPage: React.FC = () => (
    <StaticPage
        title="Integritetspolicy och cookies"
        updatedAt="7 augusti 2026"
        intro="Här beskrivs vilka uppgifter GotoBurg samlar in, varför, och hur du ändrar dig."
    >
        <Section heading="Personuppgiftsansvarig">
            <p>
                GotoBurg (www.gotoburg.se) drivs av Peter Isberg, som är personuppgiftsansvarig för
                behandlingen som beskrivs på den här sidan. Kontakt:{' '}
                <a href="mailto:peter@gotoburg.se" className="text-blue-600 hover:underline">peter@gotoburg.se</a>.
            </p>
        </Section>

        <Section heading="Vad vi samlar in">
            <p>
                Du behöver inget konto för att läsa GotoBurg och vi har inget formulär som samlar in
                namn eller adress. De uppgifter som behandlas kommer från tredjepartstjänster som körs
                på sajten:
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <strong>Google Analytics 4</strong> (mät-id G-E8GTTBK08V). Samlar in besöksstatistik:
                    vilka sidor som läses, ungefärlig geografisk plats baserad på IP-adress, enhetstyp,
                    webbläsare och varifrån du kom till sajten.
                </li>
                <li>
                    <strong>Google AdSense</strong> (utgivar-id ca-pub-2203695397498260). Visar annonser
                    och kan använda cookies och liknande tekniker för att mäta annonsvisningar och, om du
                    samtycker, för att anpassa annonser efter dina intressen.
                </li>
                <li>
                    <strong>Google Maps</strong> på sidan Utforska Staden. Kartan laddas från Google och
                    din IP-adress når då Google. Kartan visar var våra artiklar utspelar sig; vi hämtar
                    inte in din egen position.
                </li>
                <li>
                    <strong>Ditt cookie-val</strong> sparas lokalt i din webbläsare (localStorage) så att
                    vi slipper fråga vid varje besök. Det värdet skickas inte till oss.
                </li>
            </ul>
        </Section>

        <Section heading="Rättslig grund">
            <p>
                Cookies och liknande tekniker för statistik och annonser sätts först när du har samtyckt,
                enligt lagen om elektronisk kommunikation och artikel 6.1 a i GDPR. Väljer du att neka
                körs sajten vidare utan mät- och annonscookies, och Googles taggar får en signal om att
                inte lagra något på din enhet. Annonser kan fortfarande visas, men då utan personanpassning.
            </p>
            <p>
                Uppgifter som behövs för att sajten ska fungera säkert behandlas med stöd av vårt
                berättigade intresse enligt artikel 6.1 f.
            </p>
        </Section>

        <Section heading="Vi delar med">
            <p>
                Google Ireland Limited och Google LLC, i egenskap av leverantörer av Analytics, AdSense
                och Maps. Google kan överföra uppgifter till länder utanför EU/EES. Överföringen sker med
                stöd av EU-kommissionens beslut om adekvat skyddsnivå för USA (Data Privacy Framework)
                eller standardavtalsklausuler. Vi säljer inte vidare några uppgifter.
            </p>
            <p>
                Så här behandlar Google data från sajter som använder deras tjänster:{' '}
                <a
                    href="https://policies.google.com/technologies/partner-sites"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    policies.google.com/technologies/partner-sites
                </a>.
            </p>
        </Section>

        <Section heading="Hur länge">
            <p>
                Besöksstatistik i Google Analytics lagras enligt Googles inställning för
                användardata, som på GotoBurg är satt till den kortaste tillgängliga perioden.
                Annonscookies har olika livslängd beroende på syfte, normalt upp till tretton månader.
                Ditt cookie-val ligger kvar i webbläsaren tills du rensar den eller ändrar valet.
            </p>
        </Section>

        <Section heading="Ändra eller återkalla ditt val">
            <p>
                Du kan när som helst ändra dig. Det påverkar inte lagligheten av behandlingen innan du
                återkallade samtycket.
            </p>
            <p>
                <button
                    type="button"
                    onClick={openConsentSettings}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-700 transition-colors"
                >
                    Ändra cookie-inställningar
                </button>
            </p>
            <p>
                Du kan också blockera eller radera cookies i webbläsarens egna inställningar, och slå av
                personanpassade annonser hos Google på{' '}
                <a
                    href="https://myadcenter.google.com/"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    myadcenter.google.com
                </a>.
            </p>
        </Section>

        <Section heading="Dina rättigheter">
            <p>
                Du har rätt att begära utdrag över de uppgifter vi behandlar om dig, att få felaktiga
                uppgifter rättade, att få uppgifter raderade, att begära begränsning av behandlingen och
                att invända mot den. Mejla{' '}
                <a href="mailto:peter@gotoburg.se" className="text-blue-600 hover:underline">peter@gotoburg.se</a>{' '}
                så återkommer vi inom en månad.
            </p>
            <p>
                Är du inte nöjd med hur vi hanterar dina uppgifter kan du klaga hos
                Integritetsskyddsmyndigheten (IMY),{' '}
                <a
                    href="https://www.imy.se/"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    imy.se
                </a>.
            </p>
        </Section>

        <Section heading="Ändringar">
            <p>
                Vi uppdaterar den här sidan när tjänsterna på sajten ändras. Datumet högst upp visar när
                den senast ändrades. Se även våra{' '}
                <Link to="/villkor" className="text-blue-600 hover:underline">villkor</Link>.
            </p>
        </Section>
    </StaticPage>
);

export default PrivacyPage;
