import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'gridBlock',
    title: 'Grid Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title (Optional)',
            type: 'string',
            initialValue: 'Latest News'
        }),
        defineField({
            name: 'columns',
            title: 'Columns',
            type: 'number',
            options: {
                list: [2, 3]
            },
            initialValue: 3,
            hidden: ({ parent }) => parent?.layoutVariant === 'mosaic' // Hide columns if mosaic
        }),
        defineField({
            name: 'layoutVariant',
            title: 'Layout Variant',
            type: 'string',
            options: {
                list: [
                    { title: 'Default Grid', value: 'default' },
                    { title: 'Mosaic (Featured Left)', value: 'mosaic' }
                ],
                layout: 'radio'
            },
            initialValue: 'default'
        }),
        defineField({
            name: 'items',
            title: 'Articles',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'article' }] }],
            validation: Rule => Rule.max(6)
        })
    ],
    preview: {
        select: {
            title: 'title',
            items: 'items'
        },
        prepare({ title, items }) {
            return {
                title: title || 'Grid Block',
                subtitle: `${items?.length || 0} Articles`
            }
        }
    }
})
