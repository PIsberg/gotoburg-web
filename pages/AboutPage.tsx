import React from 'react';
import { Link } from 'react-router-dom';
import StaticPage, { Section } from '../components/StaticPage';

const AboutPage: React.FC = () => (
    <StaticPage
        title="Om GotoBurg"
        intro="GotoBurg är en fristående sajt om Göteborg: mat och dryck, natur, kultur, sport och sådant som händer i staden just nu."
    >
        <Section heading="Vad vi gör">
            <p>
                GotoBurg samlar tips och reportage om Göteborg och Västsverige. Vi skriver om
                restauranger och kaféer, om vandringsleder och badplatser, om konserter, utställningar
                och evenemang, och om hur det är att bo och arbeta i staden. Materialet riktar sig både
                till dig som bor här och till dig som är på besök.
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
                Vi kontrollerar öppettider, adresser, priser och datum mot verksamhetens egna kanaler
                innan publicering. Uppgifter av den typen ändras ofta, så kontrollera gärna en extra gång
                innan du åker.
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
                GotoBurg finansieras av annonser och i vissa fall av affiliatelänkar, det vill säga länkar
                där vi får en ersättning om du bokar eller köper något. Sådana länkar märks ut i
                artikeln. Ersättningen påverkar inte vad vi väljer att skriva om eller hur vi bedömer
                det vi skriver om. Vi tar inte betalt för positiv omskrivning.
            </p>
            <p>
                Läs mer i våra <Link to="/villkor" className="text-blue-600 hover:underline">villkor</Link> och i{' '}
                <Link to="/integritetspolicy" className="text-blue-600 hover:underline">integritetspolicyn</Link>.
            </p>
        </Section>
    </StaticPage>
);

export default AboutPage;
