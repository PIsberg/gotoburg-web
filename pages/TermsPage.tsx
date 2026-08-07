import React from 'react';
import { Link } from 'react-router-dom';
import StaticPage, { Section } from '../components/StaticPage';

const TermsPage: React.FC = () => (
    <StaticPage
        title="Användarvillkor"
        updatedAt="7 augusti 2026"
        intro="Villkoren gäller för dig som besöker www.gotoburg.se."
    >
        <Section heading="Innehållet är information, inte rådgivning">
            <p>
                GotoBurg publicerar tips och reportage om Göteborg. Vi kontrollerar uppgifter före
                publicering, men öppettider, priser, adresser och programpunkter ändras och kan hinna bli
                inaktuella. Kontrollera med verksamheten eller arrangören innan du planerar utifrån en
                artikel. Vi ansvarar inte för skada som uppstår för att du förlitat dig på uppgifter här.
            </p>
        </Section>

        <Section heading="Upphovsrätt">
            <p>
                Texter, bilder och grafik på GotoBurg är skyddade av upphovsrätt. Du får citera kortare
                utdrag om du anger GotoBurg som källa och länkar till artikeln. För att återpublicera
                längre avsnitt eller bilder krävs skriftligt tillstånd; mejla{' '}
                <a href="mailto:peter@gotoburg.se" className="text-blue-600 hover:underline">peter@gotoburg.se</a>.
            </p>
            <p>
                Anser du att material på sajten gör intrång i din upphovsrätt, hör av dig med en länk och
                en beskrivning så tar vi bort det medan vi utreder.
            </p>
        </Section>

        <Section heading="Annonser och affiliatelänkar">
            <p>
                Sajten finansieras av annonser som levereras av Google AdSense, och i vissa artiklar av
                affiliatelänkar som ger oss ersättning om du bokar eller köper något. Sådana länkar märks
                ut. Vi ansvarar inte för innehållet på sidor som annonser eller länkar leder till, och
                ersättningen påverkar inte våra redaktionella bedömningar.
            </p>
        </Section>

        <Section heading="Länkar till andra sajter">
            <p>
                Vi länkar till restauranger, arrangörer, kommunala sidor och andra externa källor. Vi
                kontrollerar inte innehållet på dessa sidor löpande och ansvarar inte för det.
            </p>
        </Section>

        <Section heading="Personuppgifter">
            <p>
                Hur vi behandlar personuppgifter och cookies beskrivs i{' '}
                <Link to="/integritetspolicy" className="text-blue-600 hover:underline">integritetspolicyn</Link>.
            </p>
        </Section>

        <Section heading="Ändringar och tillämplig lag">
            <p>
                Villkoren kan ändras. Datumet högst upp visar när de senast uppdaterades. Svensk lag
                gäller för användningen av sajten.
            </p>
        </Section>
    </StaticPage>
);

export default TermsPage;
