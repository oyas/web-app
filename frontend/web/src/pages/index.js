import React, { useState, useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import Layout from "../components/layout"

const IndexPage = () => {
  // ----------------------
  // BUILD TIME DATA FETCHING USING GRAPHQL
  // ----------------------
  const staticData = useStaticQuery(graphql`
    query {
      bff {
        books {
          title
          author
        }
        time
      }
    }
  `).bff

  // ----------------------
  // RUNTIME DATA FETCHING
  // ----------------------
  const [runtimeData, setRuntimeData] = useState(0)
  useEffect(() => {
    // get data from bff
    fetch(`http://localhost:4000/graphql?query={
      books {
        title
      },
      time
    }`)
      .then(response => response.json()) // parse JSON from request
      .then(resultData => {
        setRuntimeData(resultData.data)
      })
  }, [])

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
        {parseInt(runtimeData.time) && new Date(parseInt(runtimeData.time)).toISOString()}
      </p>
    </Layout>
  )
}

export default IndexPage
