import { type SchemaTypeDefinition } from 'sanity'

import blockContent from './schemas/blockContent'
import category from './schemas/category'
import article from './schemas/article'
import author from './schemas/author'
import homepage from './schemas/homepage'
import heroBlock from './schemas/heroBlock'
import gridBlock from './schemas/gridBlock'
import listBlock from './schemas/listBlock'
import opinionBlock from './schemas/opinionBlock'
import tickerBlock from './schemas/tickerBlock'

import footerSettings from './schemas/footerSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [article, author, category, blockContent, homepage, heroBlock, gridBlock, listBlock, opinionBlock, tickerBlock, footerSettings],
}
