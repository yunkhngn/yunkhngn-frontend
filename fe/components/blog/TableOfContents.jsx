import { useEffect, useState } from 'react';

export default function TableOfContents({ selector = '.prose' }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        let intersectionObserver = null;

        const collectHeadings = () => {
            const elements = Array.from(document.querySelectorAll(`${selector} h2, ${selector} h3`));
            if (elements.length === 0) return false;

            const headingData = elements.map((element, index) => {
                if (!element.id) {
                    const textId = element.innerText
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '');
                    element.id = textId || `heading-${index}`;
                }

                return {
                    id: element.id,
                    text: element.innerText,
                    level: Number(element.tagName.replace('H', '')),
                    top: element.offsetTop
                };
            });

            setHeadings(headingData);

            // Set up Intersection Observer once headings are found
            if (intersectionObserver) intersectionObserver.disconnect();
            intersectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveId(entry.target.id);
                        }
                    });
                },
                { rootMargin: '0px 0px -80% 0px', threshold: 0.1 }
            );
            elements.forEach((elem) => intersectionObserver.observe(elem));

            return true;
        };

        // Try immediately first (in case content is already rendered)
        if (collectHeadings()) return () => intersectionObserver?.disconnect();

        // TipTapViewer loads lazily — watch for DOM changes until headings appear
        const container = document.querySelector(selector);
        const mutationObserver = new MutationObserver(() => {
            if (collectHeadings()) {
                mutationObserver.disconnect();
            }
        });

        mutationObserver.observe(container || document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            mutationObserver.disconnect();
            intersectionObserver?.disconnect();
        };
    }, [selector]);

    if (headings.length === 0) return null;

    return (
        <div className="sticky top-32 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl space-y-4 shadow-sm w-full max-w-[250px] ml-auto hidden xl:block">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                Table of Contents
            </h4>
            <nav className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {headings.map((heading) => (
                    <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(heading.id);
                            if (element) {
                                // Scroll with offset for fixed header
                                const y = element.getBoundingClientRect().top + window.scrollY - 100;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                            }
                        }}
                        className={`text-sm transition-all duration-200 block truncate ${heading.level === 3 ? 'pl-4' : ''
                            } ${activeId === heading.id
                                ? 'text-primary font-medium border-l-2 border-primary pl-2 -ml-[2px]'
                                : 'text-muted-foreground hover:text-foreground hover:translate-x-1 border-l-2 border-transparent pl-2 -ml-[2px]'
                            }`}
                        title={heading.text}
                    >
                        {heading.text}
                    </a>
                ))}
            </nav>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: var(--border);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
