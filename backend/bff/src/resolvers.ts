import { Resolvers } from "./generated/resolvers";
import api from "@opentelemetry/api";
import { promisify } from "util";
import { Clients } from "./grpc-clients";
import { ContextType } from "./context";

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
export function makeResolvers(clients: Clients): Resolvers<ContextType> {
  const books = [
    {
      title: "The Awakening",
      author: "Kate Chopin",
    },
    {
      title: "City of Glass",
      author: "Paul Auster",
    },
  ];

  return {
    Query: {
      books: () => books,
      articles: async (_, args, ctx) => {
        let span = api.trace.getSpan(api.context.active())
        console.log("traceId=" + span?.spanContext().traceId);
        console.log("context: ", ctx);
        console.log("Exchanged token: ", await ctx.getExchangedToken());
        const articlesGetArticles = promisify(
          clients.articles.GetArticles
        ).bind(clients.articles);
        const result = await articlesGetArticles({
          time: args.time || 0,
        }).catch((err: any) => {
          console.log(err);
        });
        console.log("[query articles] gRPC result:", result);
        return result ? (result.articles as any) : [];
      },
      time: () => Date.now().toString(),
    },
    Mutation: {
      addBook: async (_, { title, author }) => {
        let book = { title, author: author };
        // books.push(book)
        console.log("addBook() called: books =", books);
        return book;
      },
      postArticle: async (_, args) => {
        let userId = args.userId || "";
        let digest = args.digest || "";
        let span = api.trace.getSpan(api.context.active())
        console.log("traceId=" + span?.spanContext().traceId);
        const articlesPost = promisify(clients.articles.Post).bind(
          clients.articles
        );
        const result = await articlesPost({ userId, digest }).catch(
          (err: any) => {
            console.log(err);
            return { article: {} };
          }
        );
        console.log("gRPC result:", result);
        return result ? (result.article as any) : null;
      },
    },
  };
}
