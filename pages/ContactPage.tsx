import React from 'react';
import { Link } from 'react-router-dom';
import StaticPage, { Section } from '../components/StaticPage';

const MAIL = 'peter@gotoburg.se';

const ContactPage: React.FC = () => (
    <StaticPage
        title="Kontakta oss"
        intro="Tips, rättelser, annonsering eller frågor om personuppgifter: allt går till samma inkorg."
    >
        <Section heading="Mejl">
            <p>
                <a href={`mailto:${MAIL}`} className="text-blue-600 hover:underline font-semibold">{MAIL}</a>
            </p>
            <p>
                Vi svarar normalt inom några arbetsdagar. Skriv gärna vad ärendet gäller i ämnesraden,
                det gör att rätt sak hamnar högst upp.
            </p>
        </Section>

        <Section heading="Tipsa redaktionen">
            <p>
                Har du ett ställe, ett evenemang eller en historia som borde stå på GotoBurg? Mejla{' '}
                <a href={`mailto:${MAIL}?subject=Tips`} className="text-blue-600 hover:underline">{MAIL}</a>{' '}
                med rubriken Tips. Berätta vad det gäller, var det ligger och varför det är värt att
                skriva om. Vi läser allt, men hinner inte svara på varje tips.
            </p>
        </Section>

        <Section heading="Rättelser">
            <p>
                Har vi skrivit något som är fel, mejla{' '}
                <a href={`mailto:${MAIL}?subject=Rattelse`} className="text-blue-600 hover:underline">{MAIL}</a>{' '}
                med rubriken Rättelse och en länk till artikeln. Vi rättar sakfel så snart vi har
                verifierat dem.
            </p>
        </Section>

        <Section heading="Annonsera">
            <p>
                Vill du synas hos oss, mejla{' '}
                <a href={`mailto:${MAIL}?subject=Annonsering`} className="text-blue-600 hover:underline">{MAIL}</a>{' '}
                med rubriken Annonsering, så återkommer vi med format, räckvidd och priser. Annonssamarbeten
                märks alltid ut och påverkar inte det redaktionella innehållet.
            </p>
        </Section>

        <Section heading="Personuppgifter och cookies">
            <p>
                Frågor om hur vi behandlar personuppgifter, eller begäran om registerutdrag eller radering,
                skickas till <a href={`mailto:${MAIL}?subject=GDPR`} className="text-blue-600 hover:underline">{MAIL}</a>{' '}
                med rubriken GDPR. Hur vi hanterar uppgifter beskrivs i{' '}
                <Link to="/integritetspolicy" className="text-blue-600 hover:underline">integritetspolicyn</Link>.
            </p>
        </Section>
    </StaticPage>
);

export default ContactPage;
