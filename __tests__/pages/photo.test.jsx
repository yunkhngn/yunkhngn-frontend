/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Photo from '@/pages/photo'

jest.mock('next/image', () => {
    return function MockNextImage({ fill, blurDataURL, placeholder, ...props }) {
        return <img {...props} />
    }
})

jest.mock('@/components/ui/Dialog', () => ({
    Dialog: ({ open, children }) => (open ? <div>{children}</div> : null),
    DialogContent: ({ children }) => <div>{children}</div>,
}))

jest.mock('@/components/template/Default/Layout', () => {
    return function MockLayout({ children }) {
        return <div>{children}</div>
    }
})

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        user: null,
        signInAnonymously: jest.fn(),
    }),
}))

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

jest.mock('@/lib/cloudinary', () => ({
    getOptimizedUrl: (url) => url,
    getBlurUrl: () => '',
}))

describe('Photo page lightbox loading', () => {
    beforeEach(() => {
        global.IntersectionObserver = class {
            disconnect() { }
            observe() { }
        }

        global.fetch = jest.fn((url) => {
            if (String(url).includes('/albums')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [],
                })
            }

            if (String(url).includes('/gallery/tags')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [],
                })
            }

            if (String(url).includes('/gallery?')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        data: [
                            {
                                id: 1,
                                imageUrl: 'https://example.com/photo.jpg',
                                caption: 'Live show',
                                width: 1200,
                                height: 800,
                            },
                        ],
                        totalPages: 1,
                    }),
                })
            }

            if (String(url).includes('/photo-reactions/')) {
                return new Promise(() => { })
            }

            return Promise.resolve({
                ok: true,
                json: async () => ({}),
                blob: async () => new Blob(),
            })
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('shows a skeleton while the lightbox image is loading', async () => {
        const { container } = render(<Photo />)

        await waitFor(() => {
            expect(screen.getAllByAltText('Live show').length).toBeGreaterThan(0)
        })

        fireEvent.click(screen.getAllByAltText('Live show')[0])

        expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    })

    it('keeps lightbox image visible after load event', async () => {
        render(<Photo />)

        await waitFor(() => {
            expect(screen.getAllByAltText('Live show').length).toBeGreaterThan(0)
        })

        fireEvent.click(screen.getAllByAltText('Live show')[0])

        await waitFor(() => {
            expect(screen.getAllByAltText('Live show').length).toBeGreaterThan(1)
        })

        const modalImage = screen.getAllByAltText('Live show')[1]
        fireEvent.load(modalImage)

        await waitFor(() => {
            expect(modalImage).toHaveClass('opacity-100')
        })
    })
})
