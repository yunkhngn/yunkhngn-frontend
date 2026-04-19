import {
    SETTINGS_CACHE_KEY,
    readCachedSettings,
    writeCachedSettings,
} from '@/lib/settingsCache'

describe('settings cache', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('returns null when no cache exists', () => {
        expect(readCachedSettings()).toBeNull()
    })

    it('writes and reads settings from localStorage', () => {
        const settings = { bio: 'Hello', homepage_description: '<p>Welcome</p>' }

        writeCachedSettings(settings)

        expect(readCachedSettings()).toEqual(settings)
    })

    it('returns null when cache JSON is invalid', () => {
        window.localStorage.setItem(SETTINGS_CACHE_KEY, '{broken json')

        expect(readCachedSettings()).toBeNull()
    })

    it('returns null when cache is expired', () => {
        window.localStorage.setItem(
            SETTINGS_CACHE_KEY,
            JSON.stringify({
                data: { bio: 'old' },
                createdAt: Date.now() - 1000 * 60 * 60 * 25,
            }),
        )

        expect(readCachedSettings()).toBeNull()
    })
})
