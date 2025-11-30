import { Article } from './types';

// In a real SSG, these would be generated from Markdown files.
export const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'basta-hantverksol-gotoburg',
    title: 'De bästa ställena för hantverksöl i staden',
    excerpt: 'Från mikrobryggerier i hamnen till mysiga källarpubar – här hittar du stadens bästa IPA och lager.',
    author: 'Johan Andersson',
    publishedAt: '24 oktober 2023',
    category: 'Mat & Dryck',
    imageUrl: 'https://picsum.photos/800/400?random=10',
    content: [
      "Ölkulturen i staden har exploderat de senaste åren. Det som en gång var en handfull entusiaster har växt till en levande industri som lockar besökare från hela landet.",
      "Vi har besökt de hetaste bryggerierna just nu. I det gamla industriområdet vid vattnet hittar vi 'Hamnens Humle', som specialiserar sig på syrliga ales och tunga stouts.",
      "För den som föredrar en klassisk miljö rekommenderas 'Källarmästarens' i centrum. Här serveras öl på fat direkt från tankarna, och maten är anpassad för att komplettera drycken perfekt.",
      "Trenden går tydligt mot lokalproducerade ingredienser. Många bryggare samarbetar nu med bönder i regionen för att ta fram unik malt och humle.",
      "Oavsett om du är en erfaren ölkännare eller bara nyfiken, finns det något att upptäcka i stadens glödheta ölkarta."
    ]
  },
  {
    id: '2',
    slug: 'hostvandring-naturreservat',
    title: 'Guide: Höstvandring i våra vackra naturreservat',
    excerpt: 'När löven skiftar färg är det dags att snöra på sig kängorna. Här är lederna du inte får missa.',
    author: 'Anna Berg',
    publishedAt: '22 oktober 2023',
    category: 'Natur',
    imageUrl: 'https://picsum.photos/800/400?random=11',
    content: [
      "Hösten är kanske den bästa tiden för vandring. Luften är krispig, myggorna är borta och naturen bjuder på en färgsprakande show.",
      "Ett stenkast från centrum ligger 'Stora Skogens' naturreservat. Den 10 km långa slingan runt sjön är perfekt för en dagstur. Glöm inte att packa med kaffe och bullar.",
      "För den mer äventyrlige rekommenderas 'Klippleden'. Den är mer krävande med branta partier, men utsikten från toppen över skärgården är värd varje svett-droppe.",
      "Tänk på att klä dig efter lager-på-lager-principen och att alltid respektera allemansrätten. Lämna inget annat än fotspår efter dig.",
      "Många leder har nyligen rustats upp med nya grillplatser och vindskydd, vilket gör det enkelt att förlänga turen med en övernattning."
    ]
  },
  {
    id: '3',
    slug: 'framtidens-arbetsplats',
    title: 'Så formar hybridarbete stadens kontor',
    excerpt: 'Allt fler företag ställer om till flexibla lösningar. Vad innebär det för stadskärnan och arbetstagarna?',
    author: 'Karin Nilsson',
    publishedAt: '20 oktober 2023',
    category: 'Arbete',
    imageUrl: 'https://picsum.photos/800/400?random=12',
    content: [
      "Kontorslandskapen gapar inte längre tomma, men de är inte heller fulla som förr. Den hybrida modellen har kommit för att stanna.",
      "Företag i regionen rapporterar att anställda mår bättre och presterar högre när de får styra sin tid. Men det kräver också ny teknik och nya ledarskapsstrategier.",
      "Många kontor byggs nu om till mötesplatser snarare än produktionsytor. Fokus ligger på kreativa rum och sociala ytor där teamen kan samlas de dagar de är på plats.",
      "Samtidigt ser vi en ökning av co-working spaces i förorterna. Folk vill ha kontorets bekvämlighet men slippa pendlingen in till city varje dag.",
      "Utmaningen framåt blir att behålla företagskulturen när vi inte ses vid kaffemaskinen varje dag. Digitala fikor i all ära, men det fysiska mötet är fortfarande oslagbart."
    ]
  },
  {
    id: '4',
    slug: 'helgens-aktiviteter-familj',
    title: 'Helgens bästa aktiviteter för hela familjen',
    excerpt: 'Från barnteater till skridskoåkning – här är tipsen som räddar helgen.',
    author: 'Mikael Svensson',
    publishedAt: '18 oktober 2023',
    category: 'Aktiviteter',
    imageUrl: 'https://picsum.photos/800/400?random=13',
    content: [
      "Det kan vara svårt att hitta aktiviteter som passar både stora och små. Men staden bubblar av liv just nu.",
      "På lördag öppnar ishallen för allmänhetens åkning. Det är gratis inträde och finns skridskor att hyra för en billig peng.",
      "Stadsmuseet har precis invigt sin nya interaktiva utställning om vikingatiden. Här får barnen klä ut sig, prova svärd och lära sig historia på ett lekfullt sätt.",
      "För de som vill vara utomhus anordnas en tipspromenad i stadsparken med fina priser. Startskottet går klockan 11 vid stora fontänen.",
      "Oavsett vad ni väljer, se till att njuta av den lediga tiden tillsammans. Ibland är en enkel picknick i parken det allra bästa äventyret."
    ]
  },
  {
    id: '5',
    slug: 'brunch-guiden-2024',
    title: 'Stora Brunch-guiden: Här äter du bäst',
    excerpt: 'Ägg benedict, amerikanska pannkakor eller en fräsch smoothie bowl? Vi listar favoriterna.',
    author: 'Sofia Lind',
    publishedAt: '15 oktober 2023',
    category: 'Mat & Dryck',
    imageUrl: 'https://picsum.photos/800/400?random=14',
    content: [
      "Det finns få saker som slår en långdragen söndagsbrunch. Det är måltiden där allt är tillåtet, från sött till salt.",
      "Café 'Hörnet' har länge varit en favorit med sina enorma avokadomackor. Kön ringlar ofta lång, så kom i tid eller boka bord.",
      "Nykomlingen 'Greta's' satsar helt vegetariskt. Deras veganska 'bacon' gjord på rispapper har blivit en viral succé på sociala medier.",
      "För den som vill ha lyx rekommenderar vi hotellbruncherna nere vid vattnet. Där ingår ofta ett glas bubbel och utsikten är svårslagen.",
      "Brunch är mer än bara mat, det är ett socialt umgänge. Så samla vännerna och unna er en riktigt god start på dagen."
    ]
  }
];