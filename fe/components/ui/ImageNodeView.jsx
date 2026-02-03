import { NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';

export default function ImageNodeView(props) {
    const { node, updateAttributes, selected } = props;
    const [isHovered, setIsHovered] = useState(false);
    const [caption, setCaption] = useState(node.attrs.alt || '');

    // Synchronize local state with node attributes
    useEffect(() => {
        if (caption !== (node.attrs.alt || '')) {
            setCaption(node.attrs.alt || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node.attrs.alt]);

    const handleCaptionChange = (e) => {
        const value = e.target.value;
        setCaption(value);
        updateAttributes({ alt: value });
    };

    return (
        <NodeViewWrapper className="image-node-view relative inline-block max-w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`relative group transition-all duration-200 ${selected ? 'ring-2 ring-primary ring-offset-2 rounded-3xl' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    className="rounded-3xl border-2 border-dashed border-muted-foreground/20 p-2 max-w-full mx-auto block"
                />

                {/* Caption Input - Visible on hover or when selected */}
                <div
                    className={`absolute bottom-4 left-1/2 -translate-x-1/2 min-w-[200px] max-w-[90%] transition-opacity duration-200 
                    ${isHovered || selected || caption ? 'opacity-100 visibile' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}
                    `}
                >
                    <input
                        type="text"
                        value={caption}
                        onChange={handleCaptionChange}
                        placeholder="Write a caption..."
                        className="w-full px-3 py-1.5 text-xs text-center bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/70"
                    />
                </div>
            </div>
        </NodeViewWrapper>
    );
}
