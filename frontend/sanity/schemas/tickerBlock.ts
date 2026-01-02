import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'tickerBlock',
    title: 'News Ticker Block',
    type: 'object',
    fields: [
        defineField({
            name: 'content',
            title: 'Ticker Text',
            type: 'string',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'link',
            title: 'Link (Optional)',
            type: 'url'
        }),
        defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Breaking News (Red)', value: 'breaking' },
                    { title: 'Trending (Green)', value: 'trending' },
                    { title: 'Info (Gray)', value: 'info' }
                ],
                layout: 'radio'
            },
            initialValue: 'breaking'
        })
    ],
    preview: {
        select: {
            content: 'content',
            type: 'type'
        },
        prepare({ content, type }) {
            return {
                title: 'Ticker: ' + content,
                subtitle: type
            }
        }
    }
})
