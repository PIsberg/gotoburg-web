import React from 'react';
import { Link } from 'react-router-dom';
import StaticPage, { Section } from '../components/StaticPage';

const AboutPage: React.FC = () => (
    <StaticPage
        title="Om GotoBurg"
        intro="GotoBurg är en fristående sajt om Göteborg: mat och dryck, natur, kultur, aktiviteter, arbetsliv och sådant som händer i staden just nu."
    >
        <Section heading="Vad vi gör">
            <p>
                GotoBurg samlar guider och artiklar om Göteborg och Västsverige. Vi skriver om
                restauranger och barer, om naturreservat och vandringsleder, om konsthallar och
                livemusik, om nya stadsdelar och om hur det är att arbeta i staden. Materialet riktar sig
                både till dig som bor här och till dig som är på besök.
            </p>
            <p>
                Sajten drivs som ett självständigt projekt och är inte kopplad till någon myndighet,
                turistorganisation eller mediekoncern.
            </p>
        </Section>

        <Section heading="Vem som står bakom">
            <p>
                GotoBurg drivs av Peter Isberg, som är ansvarig utgivare och redaktör. Vilka som
                skriver på sajten, och vad var och en bevakar, står på{' '}
                <Link to="/redaktionen" className="text-blue-600 hover:underline">redaktionssidan</Link>.
                Har du frågor om en artikel, ett tips eller ett samarbete når du oss på{' '}
                <a href="mailto:peter@gotoburg.se" className="text-blue-600 hover:underline">peter@gotoburg.se</a>{' '}
                eller via <Link to="/kontakt" className="text-blue-600 hover:underline">kontaktsidan</Link>.
            </p>
        </Section>

        <Section heading="Så arbetar vi med innehållet">
            <p>
                Varje artikel har en mänsklig redaktör som ansvarar för vad som publiceras. Vi använder
                AI-verktyg som stöd i researchfasen och för utkast, men inget publiceras utan att en
                redaktör har läst igenom texten, kontrollerat sakuppgifterna och redigerat den. Texter
                som inte klarar den granskningen publiceras inte.
            </p>
            <p>
                Vi skriver inte som om vi har varit på ett ställe när vi inte har varit där. En artikel
                som bygger på ett eget besök säger det, och när besöket gjordes. Övriga artiklar bygger på
                verksamhetens egna uppgifter, på publicerad kritik som vi anger källan till och på
                allmän kunskap om ämnet, och är skrivna så att de inte ger sken av något annat. Vi
                återger inte andras betyg och omdömen från recensionssajter.
            </p>
            <p>
                Uppgifter som ändras ofta, som öppettider, priser och bokningsregler, kontrollerar vi mot
                verksamhetens egna kanaler, alltså dess webbplats eller bokningssida. Datumet för den
                kontrollen står längst ned i artikeln. Det vi inte kan bekräfta där tar vi inte med.
                Sådant ändras, så kontrollera gärna en extra gång innan du åker.
            </p>
        </Section>

        <Section heading="Rättelser">
            <p>
                Hittar du ett fel vill vi veta det. Mejla{' '}
                <a href="mailto:peter@gotoburg.se" className="text-blue-600 hover:underline">peter@gotoburg.se</a>{' '}
                med en länk till artikeln och en beskrivning av vad som är fel. Vi rättar sakfel så snart
                vi har verifierat dem, och skriver ut i artikeln vad som ändrats när ändringen är av
                betydelse för innehållet.
            </p>
        </Section>

        <Section heading="Hur sajten finansieras">
            <p>
                GotoBurg ska finansieras av annonser. Sajten har inga affiliatelänkar, alltså länkar där
                vi får ersättning om du bokar eller köper något, och skulle vi börja använda sådana märks
                de ut i artikeln. Vi tar inte betalt för positiv omskrivning.
            </p>
            <p>
                Läs mer i våra <Link to="/villkor" className="text-blue-600 hover:underline">villkor</Link> och i{' '}
                <Link to="/integritetspolicy" className="text-blue-600 hover:underline">integritetspolicyn</Link>.
            </p>
        </Section>
    </StaticPage>
);

export default AboutPage;
