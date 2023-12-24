"use client";

import { useRef, useState } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { LoadingCircle, SendIcon } from "./icons";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";

const examples = [
  "Raccontami la storia dell’Osservanza a partire dal dopo guerra",
  "Quali sono gli interventi previsti ?",
  "Come sarà alla fine dei lavori l’Osservanza ?",
];

const ideas = [
  "Perché è stato chiuso l'ospedale psichiatrico di Imola ?",
  "Quali sono gli interventi previsti ?",
  "A cosa porterà l'intervento all EX cabina elettrica ?",
  "Ci saranno spazi destinati all'innovazione e alla sostenibilità ?",
  "Come sono nati gli ospedali psichiatrici imolesi ?",
  "Cosa è il Piano Nazionale di Ripresa e Resilienza (PNRR) ?",
  "Cosa prevede il restauro dell'Osservanza ?",
  "Quale è l'importo del FINANZIAMENTO NEXT GENERATION UE ?",
  "Quanto sarà la superficie rigenerata ?",
]

const getRandom = (arr: string[]): string[] => arr.sort(() => 0.5 - Math.random()).slice(0, 3);

export default function Chat() {

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [randomIdeas, setRandomIdeas] = useState(getRandom(ideas));

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        va.track("Rate limited");
        return;
      } else {
        va.track("Chat initiated");
      }
    },
    onError: (error) => {
      va.track("Chat errored", {
        input,
        error: error.message,
      });
    },
  });

  const disabled = isLoading || input.length === 0;

  const selectRandomIdeas = (idea: string) => {
    setRandomIdeas(getRandom(ideas));
    setInput(idea)
  }

  return (
    <main className="flex flex-col items-center justify-between pb-40">
      {messages.length > 0 ? (
        messages.map((message, i) => (
          <div
            key={i}
            className={clsx(
              "flex w-full items-center justify-center border-b border-gray-200 py-8",
              message.role === "user" ? "bg-white" : "bg-gray-100",
            )}
          >
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
              <div
                className={clsx(
                  "p-1.5 text-white",
                  message.role === "assistant" ? "bg-green-500" : "bg-black",
                )}
              >
                {message.role === "user" ? (
                  <User width={20} />
                ) : (
                  <Bot width={20} />
                )}
              </div>
              <ReactMarkdown
                className="prose mt-1 w-full break-words prose-p:leading-relaxed"
                remarkPlugins={[remarkGfm]}
                components={{
                  // open links in new tab
                  a: (props) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))
      ) : (
        <div className="border-gray-200sm:mx-0 mx-5 mt-20 max-w-screen-md rounded-md border sm:w-full">
          <div className="flex flex-col space-y-4 p-7 sm:p-10">
            <h1 className="text-lg font-semibold text-black">
              Parla con Umberto
            </h1>
            <p className="text-gray-500">
              Umberto è un “umarell” chatbot che sfrutta il potere dell’intelligenza artificiale per dare informazioni e dettagli sull’Osservanza nella maniera più accurata possibile e come tutti gli “umarell” sa anche il dialetto, che aspetti?
            </p>
            <p>Chiedigli ciò che preferisci!</p>
          </div>
          <div className="flex flex-col space-y-4 border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
            {examples.map((example, i) => (
              <button
                key={i}
                className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                onClick={() => {
                  setInput(example);
                  inputRef.current?.focus();
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-gray-100 to-gray-100 p-5 pb-3 sm:px-0">
        <div className="flex w-full gap-2 h-10 max-w-screen-md overflow-x-auto thumb pb-1">
          {randomIdeas.map((idea, i) => (
            <button onClick={() => selectRandomIdeas(idea)} key={i} className="px-2 p-1 hover:text-gray-600 whitespace-nowrap flex items-center border-gray-200 bg-white border text-gray-400 rounded-lg max-w-screen-md">
              <p>{idea}</p>
            </button>
          ))}
        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full max-w-screen-md rounded-xl border border-gray-200 bg-white px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Manda Messaggio"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="w-full pr-10 focus:outline-none"
          />
          <button
            className={clsx(
              "absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
              disabled
                ? "cursor-not-allowed bg-white"
                : "bg-green-500 hover:bg-green-600",
            )}
            disabled={disabled}
          >
            {isLoading ? (
              <LoadingCircle />
            ) : (
              <SendIcon
                className={clsx(
                  "h-4 w-4",
                  input.length === 0 ? "text-gray-300" : "text-white",
                )}
              />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400">
          Built with{" "}
          <a
            href="https://cinzia.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            Cinzia.app
          </a>.
        </p>
      </div>
    </main>
  );
}
