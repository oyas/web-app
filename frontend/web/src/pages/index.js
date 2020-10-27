import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import Layout from "../components/layout"


// This query is executed at build time by Gatsby.
const GATSBY_QUERY = graphql`
  query {
    bff {
      books {
        title
        author
      }
      time
    }
  }
`

// This query is executed at run time by Apollo.
const APOLLO_QUERY = gql`
  {
    books {
      title
    },
    time
  }
`

const IndexPage = () => {
  // ----------------------
  // BUILD TIME DATA FETCHING USING GRAPHQL
  // ----------------------
  const staticData = useStaticQuery(GATSBY_QUERY).bff

  // ----------------------
  // RUNTIME DATA FETCHING
  // ----------------------
  const { loading, error, data: runtimeData } = useQuery(APOLLO_QUERY);

  return (
    <Layout>
      <h1>Examples</h1>
      <h2>Build Time</h2>
      <p>
        {JSON.stringify(staticData)}
      </p>
      <p>
        {new Date(parseInt(staticData.time)).toISOString()}
      </p>
      <h2>Runtime</h2>
      <p>{JSON.stringify(runtimeData)}</p>
      <p>
        {loading && <span>Loading...</span>}
        {error && <span style={{color: "red"}}>Error: ${error.message}</span>}
        {runtimeData && parseInt(runtimeData.time) && new Date(parseInt(runtimeData.time)).toISOString()}
      </p>
    </Layout>
  )
}

export default IndexPage
