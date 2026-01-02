import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'opinionBlock',
    title: 'Opinion/Columnists Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'Opinión'
        }),
        defineField({
            name: 'items',
            title: 'Opinion Articles',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'article' }] }],
            validation: Rule => Rule.max(4)
        })
    ],
    preview: {
        select: {
            title: 'title',
            items: 'items'
        },
        prepare({ title, items }) {
            return {
                title: title || 'Opinion Block',
                subtitle: `${items?.length || 0} Columnists`
            }
        }
    }
})
