import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge', () => {
    it('renders the badge with text', () => {
        render(<Badge>Test Badge</Badge>)
        const badge = screen.getByText('Test Badge')
        expect(badge).toBeInTheDocument()
    })

    it('applies default variant class', () => {
        render(<Badge>Default</Badge>)
        const badge = screen.getByText('Default')
        expect(badge).toHaveClass('bg-primary')
    })

    it('applies secondary variant class', () => {
        render(<Badge variant="secondary">Secondary</Badge>)
        const badge = screen.getByText('Secondary')
        expect(badge).toHaveClass('bg-secondary')
    })
})
