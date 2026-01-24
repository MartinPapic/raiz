import { Card, Stack, Text, Button, Flex, Box, Label, TextArea, Spinner } from '@sanity/ui'
import { SparklesIcon } from '@sanity/icons'
import { useState } from 'react'
import { useDocumentOperation } from 'sanity'

export function RaizAIPane(props: any) {
    const { documentId, schemaType, document } = props
    const displayed = document.displayed
    const { patch } = useDocumentOperation(documentId, schemaType)

    const [isLoading, setIsLoading] = useState(false)
    const [analysis, setAnalysis] = useState<{
        suggestedTitle: string,
        suggestedSummary: string,
        keywords: string[]
    } | null>(null)

    // Analyze Logic
    const handleAnalyze = async () => {
        setIsLoading(true)
        try {
            const content = displayed.body
                ? (Array.isArray(displayed.body) ? JSON.stringify(displayed.body) : displayed.body)
                : displayed.lead || ''

            const res = await fetch('http://localhost:8000/api/ai/analyze-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: displayed.title || '', content })
            })

            if (!res.ok) {
                const errorText = await res.text()
                console.error("Analysis failed", res.status, errorText)
                setAnalysis({
                    suggestedTitle: `Error: ${res.status}`,
                    suggestedSummary: `Backend returned error: ${errorText}`,
                    keywords: []
                })
                return
            }
            const data = await res.json()
            setAnalysis(data)
        } catch (error: any) {
            console.error("Error analyzing:", error)
            setAnalysis({
                suggestedTitle: `Connection Error`,
                suggestedSummary: `Error: ${error.message}`,
                keywords: []
            })
        } finally {
            setIsLoading(false)
        }
    }

    const applyTitle = () => {
        if (analysis?.suggestedTitle) patch.execute([{ set: { title: analysis.suggestedTitle } }])
    }
    const applySummary = () => {
        if (analysis?.suggestedSummary) patch.execute([{ set: { lead: analysis.suggestedSummary } }])
    }
    const addKeywords = () => {
        if (analysis?.keywords) {
            patch.execute([
                { setIfMissing: { seo: { keywords: [] } } },
                { insert: { after: 'seo.keywords[-1]', items: analysis.keywords } }
            ])
        }
    }

    // Tabs & Other State
    const [activeTab, setActiveTab] = useState<'analyze' | 'refine' | 'audit'>('analyze')
    const [auditReport, setAuditReport] = useState<string | null>(null)
    const [refineInstruction, setRefineInstruction] = useState('')
    const [refinedContent, setRefinedContent] = useState<string | null>(null)

    const handleRefine = async () => {
        if (!refineInstruction) return
        setIsLoading(true)
        try {
            const content = displayed.body
                ? (Array.isArray(displayed.body) ? JSON.stringify(displayed.body) : displayed.body)
                : displayed.lead || ''

            const res = await fetch('http://localhost:8000/api/ai/refine-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, instruction: refineInstruction })
            })
            if (!res.ok) throw new Error(await res.text())
            const data = await res.json()
            setRefinedContent(data.refined_content)
        } catch (error: any) {
            console.error("Refine error", error)
            alert(`Error: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAudit = async () => {
        setIsLoading(true)
        try {
            const content = displayed.body
                ? (Array.isArray(displayed.body) ? JSON.stringify(displayed.body) : displayed.body)
                : displayed.lead || ''

            // We use lead or summary as reference if available
            const reference = displayed.lead || ''

            const res = await fetch('http://localhost:8000/api/ai/audit-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, reference_content: reference })
            })
            if (!res.ok) throw new Error(await res.text())
            const data = await res.json()
            setAuditReport(data.audit_report)
        } catch (error: any) {
            console.error("Audit error", error)
            alert(`Error: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    // Apply refined content back to body (Tricky with Portable Text, assuming string for now or basic block)
    // For MVP we might just copy to clipboard or alert user to manually update if it's complex PT
    const copyRefined = () => {
        if (refinedContent) {
            navigator.clipboard.writeText(refinedContent)
            alert("Contenido copiado al portapapeles. Pégalo en el editor.")
        }
    }

    return (
        <Card padding={4} height="fill">
            <Stack space={4}>
                <Flex align="center" justify="space-between">
                    <Text size={2} weight="bold">
                        <SparklesIcon style={{ marginRight: '8px' }} />
                        Raíz AI
                    </Text>
                    <Flex gap={2}>
                        <Button
                            mode={activeTab === 'analyze' ? 'default' : 'ghost'}
                            text="SEO"
                            fontSize={1}
                            onClick={() => setActiveTab('analyze')}
                            padding={2}
                        />
                        <Button
                            mode={activeTab === 'refine' ? 'default' : 'ghost'}
                            text="Refinar"
                            fontSize={1}
                            onClick={() => setActiveTab('refine')}
                            padding={2}
                        />
                        <Button
                            mode={activeTab === 'audit' ? 'default' : 'ghost'}
                            text="Auditar"
                            fontSize={1}
                            onClick={() => setActiveTab('audit')}
                            padding={2}
                        />
                    </Flex>
                </Flex>

                {isLoading && (
                    <Flex align="center" justify="center" padding={4}>
                        <Spinner muted />
                    </Flex>
                )}

                {!isLoading && activeTab === 'analyze' && (
                    <Stack space={3}>
                        <Card padding={3} radius={2} shadow={1} tone="primary">
                            <Text size={1}>Generar títulos y resúmenes SEO.</Text>
                            <Box marginTop={3}>
                                <Button
                                    text="Analizar Artículo"
                                    tone="primary"
                                    onClick={handleAnalyze}
                                />
                            </Box>
                        </Card>
                        {analysis && (
                            <Stack space={4} paddingTop={2}>
                                <Box>
                                    <Label>Título Sugerido</Label>
                                    <Flex gap={2} marginTop={2}>
                                        <TextArea
                                            rows={2}
                                            value={analysis.suggestedTitle}
                                            onChange={(e) => setAnalysis({ ...analysis, suggestedTitle: e.currentTarget.value })}
                                        />
                                        <Button text="Aplicar" onClick={applyTitle} tone="positive" mode="ghost" />
                                    </Flex>
                                </Box>
                                <Box>
                                    <Label>Resumen Sugerido</Label>
                                    <Flex gap={2} marginTop={2}>
                                        <TextArea
                                            rows={4}
                                            value={analysis.suggestedSummary}
                                            onChange={(e) => setAnalysis({ ...analysis, suggestedSummary: e.currentTarget.value })}
                                        />
                                        <Button text="Aplicar" onClick={applySummary} tone="positive" mode="ghost" />
                                    </Flex>
                                </Box>
                            </Stack>
                        )}
                    </Stack>
                )}

                {!isLoading && activeTab === 'refine' && (
                    <Stack space={3}>
                        <Label>Instrucción de Refinamiento</Label>
                        <TextArea
                            rows={3}
                            placeholder="Ej: Corregir gramática, hacer más formal..."
                            value={refineInstruction}
                            onChange={(e) => setRefineInstruction(e.currentTarget.value)}
                        />
                        <Flex gap={2} wrap="wrap">
                            {[
                                "Corregir gramática y estilo",
                                "Hacer más conciso",
                                "Tono más formal",
                                "Simplificar lenguaje"
                            ].map(opt => (
                                <Button
                                    key={opt}
                                    text={opt}
                                    mode="ghost"
                                    fontSize={1}
                                    onClick={() => setRefineInstruction(opt)}
                                />
                            ))}
                        </Flex>
                        <Button text="Refinar Texto" tone="primary" onClick={handleRefine} disabled={!refineInstruction} />

                        {refinedContent && (
                            <Box marginTop={3}>
                                <Label>Resultado</Label>
                                <Card padding={3} radius={2} border marginTop={2} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <Text size={1}>{refinedContent}</Text>
                                </Card>
                                <Box marginTop={2}>
                                    <Button text="Copiar al Portapapeles" onClick={copyRefined} tone="positive" mode="ghost" />
                                </Box>
                            </Box>
                        )}
                    </Stack>
                )}

                {!isLoading && activeTab === 'audit' && (
                    <Stack space={3}>
                        <Card padding={3} radius={2} tone="caution">
                            <Text size={1}>La auditoría verifica el cumplimiento de estándares editoriales y posibles sesgos.</Text>
                            <Box marginTop={3}>
                                <Button
                                    text="Auditar Artículo"
                                    tone="caution"
                                    onClick={handleAudit}
                                />
                            </Box>
                        </Card>
                        {auditReport && (
                            <Box marginTop={3}>
                                <Label>Reporte</Label>
                                <Card padding={3} radius={2} border marginTop={2} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <Text size={1} style={{ whiteSpace: 'pre-wrap' }}>{auditReport}</Text>
                                </Card>
                            </Box>
                        )}
                    </Stack>
                )}

            </Stack>
        </Card>
    )
}
