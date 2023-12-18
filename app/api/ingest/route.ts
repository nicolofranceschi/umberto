import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// First, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

export async function GET(request: Request) {

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
  
  `;

  const promise = chunkText({ text: docs, length: docs.length, chunkLenght: 100, ridondanza: 10 }).map(async (chunk) => {
    return await SupabaseVectorStore.fromTexts(
      chunk,
      chunk.map((text) => ({ id: randomUUID() })),
      new OpenAIEmbeddings(),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      }
    );
  });
  
  await Promise.all(promise);

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