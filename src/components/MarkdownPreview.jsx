import React, { useState } from 'react';

const MarkdownPreview = () => {
    const [markdown, setMarkdown] = useState('# Hello World\n\nThis is a **live** markdown preview.\n\n- Item 1\n- Item 2\n\n## Subheader\n\n> Blockquote example');

    const parseMarkdown = (md) => {
        let html = md
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-white">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 text-white">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 text-white">$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong class="text-primary-400">$1</strong>')
            .replace(/\*(.*)\*/gim, '<em class="text-emerald-400">$1</em>')
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4">$1</blockquote>')
            .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>')
            .replace(/\n/gim, '<br />');
        return { __html: html };
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">Markdown Previewer</h2>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2">Markdown Input</label>
                    <textarea
                        value={markdown}
                        onChange={e => setMarkdown(e.target.value)}
                        className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-300 font-mono text-sm focus:border-primary-500 outline-none resize-none transition-colors custom-scrollbar"
                        placeholder="Type markdown here..."
                    ></textarea>
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-bold text-emerald-500 uppercase mb-2">Live Preview</label>
                    <div
                        className="flex-1 w-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 overflow-y-auto custom-scrollbar prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={parseMarkdown(markdown)}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default MarkdownPreview;
