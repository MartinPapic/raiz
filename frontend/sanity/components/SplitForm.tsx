import { Flex, Box, Card, Button } from '@sanity/ui'
import { ChevronRightIcon, SparklesIcon } from '@sanity/icons'
import { useState } from 'react'
import { RaizAIPane } from './RaizAIPane'

export function SplitForm(props: any) {
    // Adapt Input Props to View Props for RaizAIPane
    // Input props: value (current doc), schemaType
    // View props expected: document: { displayed: ... }, documentId, schemaType

    // Safety check: ensure value exists
    if (!props.value) {
        return props.renderDefault(props)
    }

    const aiPaneProps = {
        document: { displayed: props.value },
        documentId: props.value._id.replace(/^drafts\./, ''),
        schemaType: props.schemaType.name
    }

    const [isOpen, setIsOpen] = useState(false)

    return (
        <Flex direction={['column', 'column', 'row']} height="fill" overflow="hidden" style={{ position: 'relative' }}>
            {/* Main Content: Standard Form */}
            <Box flex={1} overflow="auto">
                {props.renderDefault(props)}
            </Box>

            {/* Toggle Button (Floating - Fixed relative to pane) */}
            <Card
                shadow={2}
                radius={3}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '64px',
                    zIndex: 200
                }}
            >
                <Button
                    icon={isOpen ? ChevronRightIcon : SparklesIcon}
                    mode="bleed"
                    tone={isOpen ? 'default' : 'primary'}
                    onClick={() => setIsOpen(!isOpen)}
                    tooltipProps={{ content: isOpen ? 'Hide AI Assistant' : 'Show AI Assistant' }}
                />
            </Card>

            {/* Sidebar: AI Pane (Collapsible) */}
            {isOpen && (
                <Box
                    width={['100%', '100%', '300px', '350px']}
                    style={{ flexShrink: 0 }}
                    overflow="auto"
                    height="fill"
                >
                    <Card height="fill" borderLeft tone="transparent">
                        <RaizAIPane {...aiPaneProps} />
                    </Card>
                </Box>
            )}
        </Flex>
    )
}
