import { sanitizeRichTextToPlainText } from '@/lib/sanitizeRichText'

describe('sanitizeRichTextToPlainText', () => {
    it('removes HTML tags and keeps readable text', () => {
        const input = '<p>Hello <strong>world</strong></p>'

        expect(sanitizeRichTextToPlainText(input)).toBe('Hello world')
    })

    it('removes scripts from user-provided content', () => {
        const input = '<p>Hi</p><script>alert(1)</script>'

        expect(sanitizeRichTextToPlainText(input)).toBe('Hi')
    })

    it('returns empty string for non-string input', () => {
        expect(sanitizeRichTextToPlainText(null)).toBe('')
    })
})
