import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

function AboutShort() {
  return (
    <div
    style={{
      display: `flex`,
      marginBottom: rhythm(2.5),
    }}
  >
    <p>
      Listicles on software developement where one item must be by the author.
    </p>
  </div> 
  )
}
function About() {
  return (
          <div
            style={{
              display: `flex`,
              marginBottom: rhythm(2.5),
            }}
          >
            <p>
              Listicles on software developement where one item must be by the author.
            </p>
          </div>
        )
    
}

export default About
