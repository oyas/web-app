import React from "react"
import { graphql } from "gatsby"
import { Link } from "gatsby"

import Layout from "../components/layout"

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark, allMarkdownRemark } = data // data.markdownRemark holds your post data
  const { frontmatter, html } = markdownRemark
  const edge = allMarkdownRemark.edges.find(
    el => el.node.frontmatter.slug === frontmatter.slug
  )
  console.log(allMarkdownRemark)
  console.log(edge)
  return (
    <Layout>
      <div className="blog-post-container">
        <div className="blog-post">
          <h1>{frontmatter.title}</h1>
          <p>{frontmatter.date}</p>
          <br />
          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <br />
          <ul>
            {edge.previous && (
              <li>
                Back:
                <Link to={edge.previous.frontmatter.slug}>
                  {edge.previous.frontmatter.title}
                </Link>
              </li>
            )}
            {edge.next != null && (
              <li>
                Next:
                <Link to={edge.next.frontmatter.slug}>
                  {edge.next.frontmatter.title}
                </Link>
              </li>
            )}
          </ul>
          <br />
        </div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        slug
        title
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
    ) {
      edges {
        node {
          frontmatter {
            slug
            title
          }
        }
        next {
          frontmatter {
            slug
            title
          }
        }
        previous {
          frontmatter {
            slug
            title
          }
        }
      }
    }
  }
`
