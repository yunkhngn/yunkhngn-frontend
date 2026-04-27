import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minus } from 'lucide-react';
import { useRouter } from 'next/router';
import { stripHtml } from '@/lib/utils';

export default function Terminal({ embedded = false, className = '' }) {
    const [history, setHistory] = useState([
        { type: 'output', content: 'Welcome to yunkhngn terminal v1.2.4' },
        { type: 'output', content: "Type 'help' to see available commands." }
    ]);
    const [input, setInput] = useState('');
    const [currentDir, setCurrentDir] = useState('~');
    const [isChatMode, setIsChatMode] = useState(false);
    const [chatContext, setChatContext] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [fileSystem, setFileSystem] = useState({
        'about.txt': "Loading...",
        'contact.md': "Loading...",
        'projects': {
            type: 'dir',
            content: []
        },
        'socials.json': "{}"
    });

    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, reposRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/github/repos`)
                ]);

                const updates = {};

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    const settings = settingsData.reduce((acc, curr) => {
                        acc[curr.settingTitle] = curr.content;
                        return acc;
                    }, {});

                    // Update about.txt
                    const bioText = settings.bio ? stripHtml(settings.bio) : "Hi, I'm Khoa Nguyen.";
                    updates['about.txt'] = bioText;

                    // Update socials.json
                    const socials = {
                        facebook: settings.facebook,
                        github: settings.github,
                        linkedin: settings.linkedin,
                        instagram: settings.instagram
                    };
                    // Remove undefined keys
                    Object.keys(socials).forEach(key => socials[key] === undefined && delete socials[key]);
                    updates['socials.json'] = JSON.stringify(socials, null, 2);

                    // Update contact.md
                    updates['contact.md'] = [
                        `Email: ${settings.email || 'khoa@yunkhngn.dev'}`,
                        settings.github && `Github: ${settings.github}`,
                        settings.facebook && `Facebook: ${settings.facebook}`,
                        settings.linkedin && `LinkedIn: ${settings.linkedin}`
                    ].filter(Boolean).join('\n');
                }

                if (reposRes.ok) {
                    const repos = await reposRes.json();
                    const repoNames = repos.map(repo => repo.name);
                    const repoUrls = repos.reduce((acc, repo) => ({ ...acc, [repo.name]: repo.html_url }), {});

                    updates['projects'] = {
                        type: 'dir',
                        content: repoNames,
                        metadata: repoUrls
                    };
                }

                setFileSystem(prev => ({
                    ...prev,
                    ...updates
                }));
            } catch (error) {
                console.error("Failed to fetch terminal data", error);
                setHistory(prev => [...prev, { type: 'output', content: 'Error: Failed to load system data.' }]);
            }
        };

        fetchData();
    }, []);

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
                    '  khoa-cli    - Start Khoa chatbot CLI',
                    '  ls          - List files in current directory',
                    '  cat [file]  - Show file content',
                    '  cd [dir]    - Change directory',
                    '  clear       - Clear terminal screen',
                    '  whoami      - Display current user',
                    '  date        - Display current date',
                    '  open [page] - Navigate to page/project (e.g., blog, project-name)'
                ].join('\n');

            case 'khoa-cli':
                setIsChatMode(true);
                return 'Entering Khoa CLI v1.0.0... Type \'exit\' to return.';

            case 'ls':
                if (currentDir === '~') {
                    return Object.keys(fileSystem).map(k => fileSystem[k].type === 'dir' ? `${k}/` : k).join('  ');
                } else if (currentDir === '~/projects') {
                    return fileSystem['projects'].content.join('  ');
                }
                return '';

            case 'cat':
                if (!param) return 'Usage: cat [filename]';
                if (currentDir === '~') {
                    const file = fileSystem[param];
                    if (file && typeof file === 'string') return file;
                    if (file?.type === 'dir') return `cat: ${param}: Is a directory`;
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
                return 'nerd';

            case 'date':
                return new Date().toString();

            case 'open':
                if (!param) return 'Usage: open [page/project]';

                // Check internal pages
                const validPages = ['blog', 'project', 'contact', 'about', 'gallery', 'showcase'];
                if (validPages.includes(param)) {
                    router.push(`/${param}`);
                    return `Opening /${param}...`;
                }

                // Check projects (GitHub repos)
                const projectUrl = fileSystem['projects']?.metadata?.[param];
                if (projectUrl) {
                    window.open(projectUrl, '_blank');
                    return `Opening ${param} on GitHub...`;
                }

                return `Page or project not found. Try: ${validPages.join(', ')} or listed projects.`;

            default:
                return `command not found: ${command}`;
        }
    };

    const handleChat = async (msg) => {
        if (msg.trim().toLowerCase() === 'exit') {
            setIsChatMode(false);
            setChatContext([]);
            return 'Exiting Khoa CLI...';
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    history: JSON.stringify(chatContext.slice(-10))
                })
            });

            if (!res.ok) throw new Error('API Error');
            const data = await res.json();

            setChatContext(prev => [...prev, { role: 'user', content: msg }, { role: 'assistant', content: data.response }]);
            return data.response;
        } catch (error) {
            console.error(error);
            return 'Error: Could not connect to Khoa\'s brain. Try again later.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const cmd = input;
        setInput('');

        // Add command/message to history immediately
        setHistory(prev => [...prev, { type: 'command', content: cmd, isChat: isChatMode }]);

        if (isChatMode) {
            setIsThinking(true);
            const response = await handleChat(cmd);
            setIsThinking(false);
            if (response) {
                setHistory(prev => [...prev, { type: 'output', content: response }]);
            }
        } else {
            const output = handleCommand(cmd);
            if (output !== null) {
                setHistory(prev => [...prev, { type: 'output', content: output }]);
            }
        }
    };

    return (
        <div className={`w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-gray-800 bg-black/95 shadow-2xl font-mono text-sm md:text-base ${!embedded ? 'my-12' : ''} ${className}`}>
            {/* Terminal Header - Only show if not embedded */}
            {!embedded && (
                <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-gray-400 text-xs flex items-center gap-2">
                        <TerminalIcon size={14} />
                        <span>nerd@yunkhngn.dev:~</span>
                    </div>
                    <div className="opacity-0">
                        {/* Spacer for centering */}
                        <div className="w-12" />
                    </div>
                </div>
            )}

            {/* Terminal Body */}
            <div
                ref={scrollRef}
                className="p-4 h-[650px] overflow-y-auto text-green-400"
                onClick={() => inputRef.current?.focus()}
            >
                {history.map((line, i) => (
                    <div key={i} className="mb-1 whitespace-pre-wrap break-words">
                        {line.type === 'command' ? (
                            <div className="flex gap-2 text-white">
                                {line.isChat ? (
                                    <span className="text-purple-400 leading-tight">&gt;&gt;&gt;</span>
                                ) : (
                                    <>
                                        <span className="text-blue-400 leading-tight">nerd@yunkhngn:</span>
                                        <span className="text-yellow-400 leading-tight">{currentDir}$</span>
                                    </>
                                )}
                                <span>{line.content}</span>
                            </div>
                        ) : (
                            <div className="opacity-90">{line.content}</div>
                        )}
                    </div>
                ))}

                {isThinking && (
                    <div className="mb-1 text-purple-400 animate-pulse">
                        &gt;&gt;&gt; Thinking...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
                    {isChatMode ? (
                        <span className="text-purple-400 leading-tight">&gt;&gt;&gt;</span>
                    ) : (
                        <>
                            <span className="text-blue-400 leading-tight">nerd@yunkhngn:</span>
                            <span className="text-yellow-400 leading-tight">{currentDir}$</span>
                        </>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-white border-none p-0 focus:ring-0"
                        spellCheck="false"
                        autoComplete="off"
                        disabled={isThinking}

                    />
                </form>
            </div>
        </div>
    );
}
