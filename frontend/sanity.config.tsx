'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...index]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { SEOPane } from 'sanity-plugin-seo-pane'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schema'

// Custom Navbar Component
const CustomNavbar = (props: any) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            {/* Custom Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Left: Logo & Tagline */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '30px', fontWeight: '700', color: '#16a34a', lineHeight: '1' }}>Raíz</span>
                        </a>
                        <span style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            display: 'none',
                            '@media (min-width: 640px)': { display: 'inline-block' }
                        } as any}>
                            Medio Inteligente Sostenible
                        </span>
                    </div>

                    {/* Right: Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Admin Links */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a
                                href="/lector"
                                style={{
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#f3e8ff', // purple-100
                                    color: '#7e22ce', // purple-700
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                Lector de noticias
                            </a>
                            <a
                                href="/studio"
                                style={{
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#dcfce7', // green-100
                                    color: '#15803d', // green-700
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                📝 CMS
                            </a>
                            <a
                                href="/lector/layout-editor"
                                style={{
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#dbeafe', // blue-100
                                    color: '#1d4ed8', // blue-700
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                🎨 Portada
                            </a>
                        </div>

                        <a
                            href="/"
                            style={{
                                color: '#dc2626', // red-600
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginLeft: '8px'
                            }}
                        >
                            Salir
                        </a>
                    </div>
                </div>
            </div>
            {/* Default Sanity Navbar */}
            {props.renderDefault(props)}
        </div>
    )
}

// Custom Logo Component for the default Studio navbar (hidden or styled to match)
const CustomLogo = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>Raíz CMS</span>
        </div>
    )
}

export default defineConfig({
    basePath: '/studio',
    projectId: projectId || '',
    dataset: dataset || '',
    title: 'Raíz CMS',
    // Add and edit the content schema in the './sanity/schema' folder
    schema,
    plugins: [
        structureTool({
            defaultDocumentNode: (S, { schemaType }) => {
                if (schemaType === 'article') {
                    return S.document().views([
                        S.view.form(),
                        S.view
                            .component(SEOPane)
                            .options({
                                // Retrieve the keywords and synonyms at the given dot-notation strings
                                keywords: `seo.keywords`,
                                synonyms: `seo.synonyms`,
                                url: (doc: any) => doc?.slug?.current
                                    ? `http://localhost:3000/article/${doc.slug.current}`
                                    : 'http://localhost:3000',
                            })
                            .title('SEO')
                    ])
                }
                return S.document().views([S.view.form()])
            }
        }),
        // Vision is a tool that lets you query your content with GROQ in the studio
        // https://www.sanity.io/docs/the-vision-plugin
        visionTool({ defaultApiVersion: apiVersion }),
    ],
    studio: {
        components: {
            navbar: CustomNavbar,
            logo: CustomLogo,
        }
    }
})
