import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

function Bio (props) {
        return (
          <div
            style={{
              display: `flex`,
              marginBottom: rhythm(2.5),
            }}
          >
            <p>
              Written by <strong>{props.author}</strong>.  
            <br/>
            <div dangerouslySetInnerHTML={{ __html: props.bio }} />
            
            </p>
          </div>
        )
      }

export default Bio
