import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

// First, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

export async function GET() {

  const privateKey = process.env.SUPABASE_PRIVATE_KEY;
  if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error(`Expected env var SUPABASE_URL`);

  const client = createClient(url, privateKey);

  const docs = `La genesi degli ospedali psichiatrici imolesi nasce dall'attività del dott. Luigi Lolli che, nel 1844, presso lo storico ospedale cittadino di Santa Maria della Scaletta, aprì un primo reparto psichiatrico noto come "Asilo", con circa 80 posti letto. 
  Successivamente, nel 1869, viste le crescenti necessità del territorio, il dott. Lolli avviò la costruzione di un nuovo manicomio omonimo, con capacità di circa 800 posti letto, adiacente alla sede storica dell'ospedale imolese oggi denominato "Ospedale Vecchio". 
  Dopo alcuni anni, anche il nuovo ampliamento risultò insufficiente e così, sul terreno dell'orto chiamato "Osservanza", di proprietà dell'ospedale e vicino al convento quattrocentesco dei Frati Osservanti (da cui deriva il nome), Lolli decise di costruire un manicomio aggiuntivo detto di "complemento". 
  Nasce così l'ospedale psichiatrico dell'Osservanza. 
  I lavori iniziarono nel 1881 e continuarono senza interruzioni fino al completamento nel 1890; progettista dell’impianto generale e dei primi fabbricati fu l’ingegnere imolese Felice Orsini.
  Il disegno generale del complesso prende spunto prevalentemente dagli schemi proposti dall'architettura francese, con un impianto definito da padiglioni disposti simmetricamente e tra loro paralleli, circondati da prati e giardini. 
  Il complesso dell'Osservanza, in origine, era costituito da sei padiglioni per il ricovero di varie categorie di pazienti, un padiglione per i servizi generali, la cucina e il guardaroba, un edificio destinato agli ambulatori, la lavanderia e l'asciugatoio a vapore, officine e botteghe artigianali per i lavoranti e alloggi per il direttore, medici e impiegati. Nel corso degli anni, il manicomio continuò a subire modifiche nel tentativo di diventare sempre più capiente e funzionale. 
  Nei primi anni ‘50 e ‘60 del ‘900, grazie a una serie di imponenti lavori di ristrutturazione e nuove costruzioni, il manicomio aumentò notevolmente la capacità dei posti letto, migliorando nel contempo le condizioni di vita dei degenti. Il manicomio è stato dismesso a partire dal 1996. Nel 2004 il Ministero dei Beni Culturali ha decretato il valore monumentale dell’intero comparto Osservanza in virtù del perfetto stato di conservazione dell’impianto manicomiale originario, tutelando al contempo il parco e i fabbricati. 
  Tutte le trasformazioni nell’area sono  vincolate dal Decreto di tutela e disciplinate da uno specifico Piano Particolareggiato di Iniziativa Pubblica. 
  Nel 2016, a seguito della riqualificazione e messa in sicurezza del parco e dei padiglioni e della realizzazione ex novo delle reti tecnologiche (teleriscaldamento, rete idrica ed elettrica, sistema fognario), grazie al finanziamento della regione Emilia-Romagna, il parco è stato riaperto alla cittadinanza.
  Il fabbricato denominato Padiglione 10-12 fa parte del nucleo storico originario del complesso Osservanza, edificato tra il 1890 e il 1910; più precisamente è collocato nel nucleo centrale dell'ex ospedale, costituito dai padiglioni che ospitavano i degenti.Il compendio è composto da due volumi a due piani e da un corpo di collegamento monopiano, edificato negli anni tra il 1940 e il 1950.
  In origine i due padiglioni erano separati e il cortile risultava recintato.
  I padiglioni erano destinati al ricovero dei degenti e costituiti da sale ricreative comuni, dormitori, locali per i servizi o guardiole per medici e infermieri, oltre a piccole camere per pazienti con specifiche problematiche. 
  Il fabbricato è stato dismesso dai primi anni 2000.
  Il Piano Nazionale di Ripresa e Resilienza (PNRR) è un programma di investimenti e riforme attraverso il quale l'Italia intende utilizzare i fondi europei Next Generation EU. Si tratta di uno strumento straordinario e temporaneo dell'Unione Europea che mira a sostenere e stimolare l'economia. Nel contesto della Missione 5 “Infrastrutture sociali, famiglie, comunità e terzo settore”  le Città Metropolitane del territorio nazionale hanno presentato candidature per i Piani Urbani Integrati (P.U.I.), riguardanti la Componente 2, Investimento 2.2. 
  Con il Decreto Ministeriale del 22/04/2022 è stato approvato l'elenco definitivo dei P.U.I. presentati e la Città Metropolitana di Bologna ha ottenuto il finanziamento, per il periodo 2022-2026, per l’attuazione di proposte sul territorio provinciale che costituiscono il Piano Urbano Integrato "Rete Metropolitana per la Conoscenza. La Grande Bologna". All'interno di questo si inserisce il P.U.I. "Parco dell'Innovazione - Complesso Osservanza in Imola" costituito da quattro interventi edilizi ed una quinta linea di finanziamento per servizi connessi.
  Il finanziamento prevede il restauro e risanamento conservativo di 4 fabbricati: 
  Intervento 1-Padiglione 1 
  Nuova sede Accademia Musicale Internazionale
  Intervento 2-Ex Artieri 
  Spazi per Innovazione e sostenibilità
  Intervento 3-Padiglioni 10 e 12 
  Nuova sede Circondario Imolese - Laboratorio storia della psichiatria
  Intervento 4-Ex Cabina elettrica 
  lnfopoint/Laboratorio cicloturismo metropolitano
    
  `;

  const promise = chunkText({ text: docs, length: docs.length, chunkLenght: 100, ridondanza: 10 }).map(async (chunk) => {
    return await SupabaseVectorStore.fromTexts(
      chunk,
      chunk.map(() => ({ id: randomUUID() })),
      new OpenAIEmbeddings(),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      }
    );
  });
  
  await Promise.all(promise);

  return NextResponse.json({ promise }, { status: 200 });

};

const chunkText = ({ text, length, chunkLenght, ridondanza }: { text: string; length: number; chunkLenght: number; ridondanza: number; }) : string[][] => {
  
  const chunk: string[][] = [];
  const tempChunk: string[] = [];
  const batchGroup = 100
  
  for (var a = 0; a < length; a = a + chunkLenght - ridondanza) {
    tempChunk.push(text.slice(a, a + chunkLenght));
    if (tempChunk.length >= batchGroup) {
      chunk.push([...tempChunk])
      tempChunk.length = 0
    }
  }

  chunk.push([...tempChunk])

  return chunk;
};