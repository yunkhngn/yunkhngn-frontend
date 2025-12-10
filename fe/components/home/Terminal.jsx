import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minus } from 'lucide-react';
import { useRouter } from 'next/router';

const FILES = {
    'about.txt': "Hi, I'm Khoa Nguyen (yun.khngn). I'm a Software Developer, Graphic Designer, and Guitarist.",
    'contact.md': "Email: khoa@yunkhngn.dev\nGithub: github.com/yunkhngn\nFacebook: facebook.com/yunkhngn",
    'projects': {
        type: 'dir',
        content: ['portfolio-website', 'christmas-tree', 'tarot-reading']
    },
    'socials.json': JSON.stringify({
        facebook: "https://facebook.com/yunkhngn",
        github: "https://github.com/yunkhngn",
        linkedin: "https://linkedin.com/in/yunkhngn"
    }, null, 2)
};

export default function Terminal() {
    const [history, setHistory] = useState([
        { type: 'output', content: 'Welcome to Yunkhngn Terminal v1.0.0' },
        { type: 'output', content: "Type 'help' to see available commands." }
    ]);
    const [input, setInput] = useState('');
    const [currentDir, setCurrentDir] = useState('~');
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = (cmd) => {
        const args = cmd.trim().split(' ');
        const command = args[0].toLowerCase();
        const param = args[1];

        switch (command) {
            case 'help':
                return [
                    'Available commands:',
                    '  help        - Show this help message',
                    '  ls          - List files in current directory',
                    '  cat [file]  - Show file content',
                    '  cd [dir]    - Change directory',
                    '  clear       - Clear terminal screen',
                    '  whoami      - Display current user',
                    '  date        - Display current date',
                    '  open [page] - Navigate to page (e.g., open blog)'
                ].join('\n');

            case 'ls':
                if (currentDir === '~') {
                    return Object.keys(FILES).map(k => FILES[k].type === 'dir' ? `${k}/` : k).join('  ');
                } else if (currentDir === '~/projects') {
                    return FILES['projects'].content.join('  ');
                }
                return '';

            case 'cat':
                if (!param) return 'Usage: cat [filename]';
                if (currentDir === '~') {
                    if (FILES[param] && typeof FILES[param] === 'string') return FILES[param];
                    if (FILES[param]?.type === 'dir') return `cat: ${param}: Is a directory`;
                }
                return `cat: ${param}: No such file or directory`;

            case 'cd':
                if (!param || param === '~') {
                    setCurrentDir('~');
                    return '';
                }
                if (param === 'projects' && currentDir === '~') {
                    setCurrentDir('~/projects');
                    return '';
                }
                if (param === '..' && currentDir !== '~') {
                    setCurrentDir('~');
                    return '';
                }
                return `cd: ${param}: No such directory`;

            case 'clear':
                setHistory([]);
                return null;

            case 'whoami':
                return 'guest';

            case 'date':
                return new Date().toString();

            case 'open':
                if (!param) return 'Usage: open [page] (e.g., blog, project, contact)';
                const validPages = ['blog', 'project', 'contact', 'about', 'gallery', 'showcase'];
                if (validPages.includes(param)) {
                    router.push(`/${param}`);
                    return `Opening /${param}...`;
                }
                return `Page not found. Try: ${validPages.join(', ')}`;

            default:
                return `command not found: ${command}`;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newHistory = [...history, { type: 'command', content: input }];
        const output = handleCommand(input);

        if (output !== null) {
            if (typeof output === 'string') {
                newHistory.push({ type: 'output', content: output });
            }
            setHistory(newHistory);
        }

        setInput('');
    };

    return (
        <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-gray-800 bg-black/95 shadow-2xl font-mono text-sm md:text-base my-12">
            {/* Terminal Header */}
            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-gray-400 text-xs flex items-center gap-2">
                    <TerminalIcon size={14} />
                    <span>guest@yunkhngn.dev:~</span>
                </div>
                <div className="opacity-0">
                    {/* Spacer for centering */}
                    <div className="w-12" />
                </div>
            </div>

            {/* Terminal Body */}
            <div
                ref={scrollRef}
                className="p-4 h-[400px] overflow-y-auto text-green-400"
                onClick={() => inputRef.current?.focus()}
            >
                {history.map((line, i) => (
                    <div key={i} className="mb-1 whitespace-pre-wrap break-words">
                        {line.type === 'command' ? (
                            <div className="flex gap-2 text-white">
                                <span className="text-blue-400 leading-tight">guest@yunkhngn:</span>
                                <span className="text-yellow-400 leading-tight">{currentDir}$</span>
                                <span>{line.content}</span>
                            </div>
                        ) : (
                            <div className="opacity-90">{line.content}</div>
                        )}
                    </div>
                ))}

                <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
                    <span className="text-blue-400 leading-tight">guest@yunkhngn:</span>
                    <span className="text-yellow-400 leading-tight">{currentDir}$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-white border-none p-0 focus:ring-0"
                        autoFocus
                        spellCheck="false"
                        autoComplete="off"
                    />
                </form>
            </div>
        </div>
    );
}
