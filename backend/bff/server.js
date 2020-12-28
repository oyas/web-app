const { ApolloServer, gql } = require("apollo-server")
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const PROTO_PATH = __dirname + '/../protos/helloworld/helloworld.proto';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    time: String
  }

  type Mutation {
    addBook(title: String, author: String): Book
  }
`

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
]

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
    time: () => Date.now(),
  },
  Mutation: {
    addBook: async (_, { title, author }) => {
      let result = await new Promise((resolve, reject) =>
        client.sayHello({ name: author }, function (err, response) {
          if (err) {
            return reject(err)
          }
          resolve(response)
        })
      )
      console.log("gRPC result:", result)
      let book = { title, author: result.message }
      books.push(book)
      console.log("addBook() called: books =", books)
      return book
    },
  },
}

// setup gRPC client
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;
const client = new hello_proto.Greeter(
  process.env.API_URL_GREETER,
  grpc.credentials.createInsecure()
);

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
