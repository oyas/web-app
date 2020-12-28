/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  siteMetadata: {
    title: `Web-app`,
  },
  /* Your site config here */
  plugins: [
    {
      resolve: `gatsby-source-graphql`,
      options: {
        typeName: `bff`,
        fieldName: `bff`,
        url: `${process.env.API_URL_BFF}/graphql`,
        headers: {},
      },
    },
    'gatsby-theme-material-ui',
    'gatsby-plugin-emotion'
  ],
}
