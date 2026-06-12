import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React, { useMemo, useState } from 'react';
import { common, createLowlight } from 'lowlight';
import { Copy, Check } from 'lucide-react';

const lowlight = createLowlight(common);

const LANGUAGE_ALIASES = { html: 'xml', text: 'plaintext' };

function hastToReact(nodes, keyPrefix) {
    return nodes.map((node, index) => {
        if (node.type === 'text') return node.value;
        if (node.type !== 'element') return null;
        const key = `${keyPrefix}-${index}`;
        const className = Array.isArray(node.properties?.className)
            ? node.properties.className.join(' ')
            : undefined;
        return React.createElement(
            node.tagName,
            { key, className },
            hastToReact(node.children || [], key),
        );
    });
}

function HighlightedCode({ code, language }) {
    const children = useMemo(() => {
        const lang = LANGUAGE_ALIASES[language] || language;
        try {
            const tree = lang && lang !== 'null' && lowlight.registered(lang)
                ? lowlight.highlight(lang, code)
                : lowlight.highlightAuto(code);
            return hastToReact(tree.children, 'hl');
        } catch {
            return code;
        }
    }, [code, language]);

    return <code className="hljs">{children}</code>;
}

export default function CodeBlockComponent({ node, updateAttributes, extension, editor }) {
    const { attrs: { language: defaultLanguage } } = node;
    const isEditable = editor.isEditable;
    const [copied, setCopied] = useState(false);

    return (
        <NodeViewWrapper className="code-block relative my-4 rounded-lg overflow-hidden border border-border bg-[#282c34] shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-[#181a1f]">
                <div className="flex items-center gap-2 w-16">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="relative group flex-1 flex justify-center">
                    <select
                        contentEditable={false}
                        defaultValue={defaultLanguage || 'text'}
                        onChange={(event) => updateAttributes({ language: event.target.value })}
                        className="bg-transparent text-xs font-mono text-muted-foreground focus:outline-none cursor-pointer appearance-none text-center hover:text-white transition-colors"
                        disabled={!isEditable}
                    >
                        <option value="null">auto</option>
                        <option value="text">text</option>
                        <option value="javascript">javascript</option>
                        <option value="typescript">typescript</option>
                        <option value="bash">bash</option>
                        <option value="html">html</option>
                        <option value="css">css</option>
                        <option value="json">json</option>
                        <option value="python">python</option>
                        <option value="java">java</option>
                        <option value="cpp">cpp</option>
                        <option value="go">go</option>
                        <option value="rust">rust</option>
                        <option value="sql">sql</option>
                        <option value="yaml">yaml</option>
                        <option value="xml">xml</option>
                    </select>
                </div>
                <div className="w-16 flex justify-end">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(node.textContent);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-muted-foreground hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                        title="Copy code"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <div className="relative">
                {!isEditable ? (
                    <pre className="m-0 p-4 overflow-x-auto bg-[#282c34] text-sm font-mono font-semibold text-[#abb2bf] whitespace-pre-wrap break-words">
                        <HighlightedCode code={node.textContent} language={defaultLanguage} />
                    </pre>
                ) : (
                    <pre className="m-0 p-4 overflow-x-auto bg-[#282c34] text-sm font-mono font-semibold text-[#abb2bf]">
                        <NodeViewContent as="code" className={`language-${defaultLanguage}`} />
                    </pre>
                )}
            </div>
        </NodeViewWrapper>
    );
}
