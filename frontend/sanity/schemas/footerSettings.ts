import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'footerSettings',
    title: 'Configuración de Footer',
    type: 'document',
    fields: [
        defineField({
            name: 'missionStatement',
            title: 'Misión Editorial (Breve)',
            description: 'Una o dos líneas que resumen el propósito del medio.',
            type: 'text',
            rows: 3,
            validation: Rule => Rule.required().max(200)
        }),
        defineField({
            name: 'transparencyLinks',
            title: 'Enlaces de Transparencia',
            description: 'Enlaces a páginas institucionales (Quiénes somos, Ética, etc.)',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'label', type: 'string', title: 'Texto del Enlace' },
                        { name: 'url', type: 'url', title: 'URL Destino', validation: Rule => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }) }
                    ]
                }
            ]
        }),
        defineField({
            name: 'sectionLinks',
            title: 'Enlaces de Secciones (Opcional)',
            description: 'Si se deja vacío, se pueden usar las categorías por defecto en el frontend.',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'label', type: 'string', title: 'Nombre Sección' },
                        { name: 'url', type: 'string', title: 'Path (ej: /politica)' }
                    ]
                }
            ]
        }),
        defineField({
            name: 'socialMedia',
            title: 'Redes Sociales',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'platform', type: 'string', title: 'Plataforma', options: { list: ['Twitter/X', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube'] } },
                        { name: 'url', type: 'url', title: 'URL Perfil' }
                    ]
                }
            ]
        }),
        defineField({
            name: 'contactLegal',
            title: 'Texto Legal y Contacto',
            type: 'object',
            fields: [
                { name: 'legalText', type: 'string', title: 'Copyright Line' },
                { name: 'contactEmail', type: 'string', title: 'Email de Contacto' }
            ]
        })
    ],
    preview: {
        prepare() {
            return {
                title: 'Configuración del Footer'
            }
        }
    }
})
