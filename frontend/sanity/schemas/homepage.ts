import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'homepage',
    title: 'Homepage Edition',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Edition Name',
            type: 'string',
            description: 'Internal name for this edition (e.g., "Morning Edition", "Breaking News")',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'isActive',
            title: 'Active on Site',
            type: 'boolean',
            description: 'If true, this layout will be served to the public. Only one should be active at a time (logic handled by frontend).',
            initialValue: false
        }),
        defineField({
            name: 'layout',
            title: 'Layout Blocks',
            type: 'array',
            of: [
                { type: 'heroBlock' },
                { type: 'gridBlock' },
                { type: 'listBlock' }
            ],
            description: 'Drag and drop blocks to compose the home page.'
        })
    ],
    preview: {
        select: {
            title: 'title',
            isActive: 'isActive'
        },
        prepare({ title, isActive }) {
            return {
                title: title,
                subtitle: isActive ? '🟢 Live' : '⚪ Draft/Inactive'
            }
        }
    }
})
