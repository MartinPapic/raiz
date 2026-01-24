import { defineField, defineType } from 'sanity'
import { SplitForm } from '../components/SplitForm'

export default defineType({
    name: 'article',
    title: 'Article',
    type: 'document',
    components: {
        input: SplitForm
    },
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'lead',
            title: 'Lead (Bajada)',
            type: 'text',
            rows: 3,
            description: 'Short summary displayed below the title in the home page.',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: { type: 'author' },
        }),
        defineField({
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'category' } }],
        }),
        defineField({
            name: 'section',
            title: 'Sección / Suplemento',
            type: 'section',
            description: 'Selecciona la sección principal de este artículo.'
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
        }),
        defineField({
            name: 'featured',
            title: 'Destacado de Portada',
            type: 'boolean',
            description: 'Check this to make this article appear in the main hero slot.',
            initialValue: false,
        }),
        defineField({
            name: 'body',
            title: 'Body',
            type: 'blockContent',
        }),
        defineField({
            name: 'seo',
            title: 'SEO & Social',
            type: 'object',
            fields: [
                {
                    name: 'description',
                    title: 'Meta Description',
                    type: 'text',
                    rows: 3,
                    description: 'Optional. Overrides the "Lead" for search engines.'
                },
                {
                    name: 'keywords',
                    title: 'Keywords',
                    type: 'array',
                    of: [{ type: 'string' }],
                    options: { layout: 'tags' }
                },
                {
                    name: 'synonyms',
                    title: 'Synonyms',
                    type: 'string',
                    description: 'Comma-separated list of synonyms for SEO analysis.'
                }
            ]
        }),
    ],

    preview: {
        select: {
            title: 'title',
            author: 'author.name',
            media: 'mainImage',
        },
        prepare(selection) {
            const { author } = selection
            return { ...selection, subtitle: author && `by ${author}` }
        },
    },
})
