import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function CodeBlockComponent({ node, updateAttributes, extension, editor }) {
    const { attrs: { language: defaultLanguage } } = node;
    const isEditable = editor.isEditable;

    return (
        <NodeViewWrapper className="code-block relative my-4 rounded-lg overflow-hidden border border-border bg-[#282c34] shadow-sm">
            {/* macOS-style Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-[#181a1f]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" /> {/* Red */}
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /> {/* Yellow */}
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" /> {/* Green */}
                </div>
                <div className="relative group">
                    <select
                        contentEditable={false}
                        defaultValue={defaultLanguage || 'text'}
                        onChange={(event) => updateAttributes({ language: event.target.value })}
                        className="bg-transparent text-xs font-mono text-muted-foreground focus:outline-none cursor-pointer appearance-none pr-2 text-center hover:text-white transition-colors"
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
                <div className="w-12" /> {/* Spacer for centering */}
            </div>

            {/* Code Content */}
            <div className="relative">
                {!isEditable ? (
                    <SyntaxHighlighter
                        language={defaultLanguage || 'text'}
                        style={atomDark}
                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.875rem', fontWeight: 600 }}
                        wrapLines={true}
                        wrapLongLines={true}
                    >
                        {node.textContent}
                    </SyntaxHighlighter>
                ) : (
                    <pre className="m-0 p-4 overflow-x-auto bg-[#282c34] text-sm font-mono font-semibold text-[#abb2bf]">
                        <NodeViewContent as="code" className={`language-${defaultLanguage}`} />
                    </pre>
                )}
            </div>
        </NodeViewWrapper>
    );
}
