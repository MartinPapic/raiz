import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'listBlock',
    title: 'List Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'List Title',
            type: 'string',
            initialValue: 'More News'
        }),
        defineField({
            name: 'items',
            title: 'Articles',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'article' }] }]
        })
    ],
    preview: {
        select: {
            title: 'title',
            items: 'items'
        },
        prepare({ title, items }) {
            return {
                title: title || 'List Block',
                subtitle: `${items?.length || 0} Articles (List)`
            }
        }
    }
})
