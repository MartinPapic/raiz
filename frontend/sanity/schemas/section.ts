import { defineType } from 'sanity'

export default defineType({
    name: 'section',
    title: 'Sección (Suplemento)',
    type: 'string',
    options: {
        list: [
            { title: 'Economía', value: 'economia' },
            { title: 'Política', value: 'politica' },
            { title: 'Cultura', value: 'cultura' },
            { title: 'Tecnología', value: 'tecnologia' },
            { title: 'Medio Ambiente', value: 'medio-ambiente' },
            { title: 'Opinión', value: 'opinion' },
            { title: 'Panoramas', value: 'panoramas' },
            { title: 'Regional', value: 'regional' },
            { title: 'Destacados', value: 'destacados' },
        ],
    },
})
