import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'heroBlock',
    title: 'Hero Block',
    type: 'object',
    fields: [
        defineField({
            name: 'article',
            title: 'Article',
            type: 'reference',
            to: [{ type: 'article' }],
        }),
        defineField({
            name: 'layoutVariant',
            title: 'Variant',
            type: 'string',
            options: {
                list: [
                    { title: 'Fullscreen', value: 'fullscreen' },
                    { title: 'Split', value: 'split' },
                ],
                layout: 'radio'
            },
            initialValue: 'fullscreen'
        }),
        defineField({
            name: 'customHeadline',
            title: 'Custom Headline (Optional)',
            type: 'string',
            description: 'Override the article title for this specific placement'
        })
    ],
    preview: {
        select: {
            title: 'article.title',
            variant: 'layoutVariant',
            media: 'article.mainImage'
        },
        prepare({ title, variant, media }) {
            return {
                title: title || 'Empty Hero',
                subtitle: `Hero (${variant})`,
                media
            }
        }
    }
})
