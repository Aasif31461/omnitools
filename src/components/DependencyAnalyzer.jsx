import React, { useState, useMemo, useEffect } from 'react';
import {
    Upload, FileJson, Search, AlertTriangle, Package, ChevronRight,
    ChevronDown, ShieldCheck, ShieldAlert, X, ExternalLink,
    GitBranch, Tag, Calendar, Layers, Box, Info, Terminal,
    Download, Globe, User, Code, Database, Cpu, ArrowUpDown, ArrowUp, ArrowDown,
    List, GitGraph, Plus, Minus, Maximize, RefreshCw, Copy, Check, Filter, ArrowRight
} from 'lucide-react';

// --- Utility Components ---

const Badge = ({ children, className = "", color = "blue" }) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        slate: "bg-slate-800 text-slate-400 border-slate-700",
        orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${colors[color] || colors.slate} ${className}`}>
            {children}
        </span>
    );
};

const StatCard = ({ label, value, icon: Icon, color = "blue", subtext = "" }) => {
    const colors = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    };

    return (
        <div className={`bg-slate-900/40 backdrop-blur-sm border p-4 rounded-xl flex items-center gap-4 transition-all hover:bg-slate-900/60 ${colors[color].replace('text-', 'border-').split(' ')[2] || 'border-slate-800'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]} border-none`}>
                <Icon size={24} />
            </div>
            <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-0.5">{label}</div>
                <div className="text-2xl font-bold text-white leading-none">{value}</div>
                {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
            </div>
        </div>
    );
};

// --- Helper Components ---
const SimpleMarkdown = ({ content }) => {
    if (!content) return null;

    // Split by newlines and process
    const lines = content.split('\n');
    let inList = false;

    return (
        <div className="text-sm text-slate-400 leading-relaxed space-y-2">
            {lines.map((line, idx) => {
                // Headers (### )
                if (line.trim().startsWith('### ')) {
                    return <h4 key={idx} className="text-white font-bold mt-4 mb-2 text-base">{line.replace('### ', '')}</h4>;
                }

                // Bold (**text**) - basic replacement for key terms
                const parts = line.split(/(\*\*.*?\*\*)/g);
                const processedLine = parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="text-slate-200 font-semibold">{part.slice(2, -2)}</strong>;
                    }
                    // Links ([text](url)) - basic regex
                    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                    const linkParts = [];
                    let lastIndex = 0;
                    let match;
                    while ((match = linkRegex.exec(part)) !== null) {
                        if (match.index > lastIndex) {
                            linkParts.push(part.slice(lastIndex, match.index));
                        }
                        linkParts.push(
                            <a key={`${i}-${lastIndex}`} href={match[2]} target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300 hover:underline">
                                {match[1]}
                            </a>
                        );
                        lastIndex = linkRegex.lastIndex;
                    }
                    if (lastIndex < part.length) {
                        linkParts.push(part.slice(lastIndex));
                    }
                    return linkParts.length > 0 ? linkParts : part;
                });

                // List Items (* or - )
                if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                    return (
                        <div key={idx} className="flex items-start gap-2 ml-2">
                            <div className="w-1 h-1 rounded-full bg-slate-500 mt-2 shrink-0" />
                            <span>{processedLine}</span>
                        </div>
                    );
                }

                // Empty lines
                if (!line.trim()) return <div key={idx} className="h-2" />;

                return <div key={idx}>{processedLine}</div>;
            })}
        </div>
    );
};

// --- Helper Logic ---
const parseVersion = (v) => {
    if (!v) return [0, 0, 0];
    const clean = v.replace(/^[^\d]+/, '').split('-')[0]; // Remove prefixes like ^, ~ and suffixes like -next
    return clean.split('.').map(n => parseInt(n, 10) || 0);
};

// Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
const compareVersions = (v1, v2) => {
    const p1 = parseVersion(v1);
    const p2 = parseVersion(v2);

    for (let i = 0; i < 3; i++) {
        if (p1[i] > p2[i]) return 1;
        if (p1[i] < p2[i]) return -1;
    }
    return 0; // Equal
};

const isVersionAffected = (version, range) => {
    // Basic implementation for "introduced" and "fixed" events
    const events = range.events || [];
    let introduced = '0.0.0';
    let fixed = null;

    events.forEach(e => {
        if (e.introduced) introduced = e.introduced;
        if (e.fixed) fixed = e.fixed;
    });

    // Check if version >= introduced
    const gteIntro = compareVersions(version, introduced) >= 0;

    // Check if version < fixed (if fixed is defined)
    const ltFixed = fixed ? compareVersions(version, fixed) < 0 : true;

    return gteIntro && ltFixed;
};

const getApplicableFix = (currentVersion, affectedList) => {
    if (!affectedList || affectedList.length === 0) return null;

    // Iterate through all affected ranges to find the one that matches our current version
    for (const item of affectedList) {
        if (item.ranges) {
            for (const range of item.ranges) {
                if (isVersionAffected(currentVersion, range)) {
                    // Found the range triggering this vulnerability
                    const fixedEvent = range.events?.find(e => e.fixed);
                    if (fixedEvent) return fixedEvent.fixed;
                }
            }
        }
    }
    return null; // No applicable fix found (or unknown)
};

// --- Main Component ---

// --- Dependency Tree Component ---

const DependencyTree = ({ dependencies, allPackages, onSelect, depth = 0, forcedExpanded = new Set(), searchQuery = '', compact = false }) => {
    const [expanded, setExpanded] = useState({});

    // Update expanded state when forcedExpanded changes
    useEffect(() => {
        if (forcedExpanded.size > 0) {
            const newExpanded = { ...expanded };
            Object.keys(dependencies).forEach(name => {
                if (forcedExpanded.has(name)) {
                    newExpanded[name] = true;
                }
            });
            setExpanded(newExpanded);
        }
    }, [forcedExpanded, dependencies]);

    if (!dependencies || Object.keys(dependencies).length === 0) {
        return <div className="text-slate-500 text-xs italic py-2 pl-6">No dependencies</div>;
    }

    const toggleExpand = (name, e) => {
        if (e) e.stopPropagation();
        setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
    };

    // Level colors for the tree line
    const levelColors = [
        'border-blue-500/30',
        'border-emerald-500/30',
        'border-purple-500/30',
        'border-amber-500/30',
        'border-rose-500/30'
    ];
    const lineColor = levelColors[depth % levelColors.length];

    // Dynamic styles based on compact mode
    const paddingLeft = compact ? 'pl-3' : 'pl-6';
    const marginLeft = compact ? 'ml-1.5' : 'ml-3';
    const itemPadding = compact ? 'py-1.5 px-2' : 'py-2 px-3';
    const gap = compact ? 'gap-2' : 'gap-3';

    return (
        <div className={`${paddingLeft} border-l ${lineColor} ${marginLeft} transition-colors duration-300`}>
            {Object.entries(dependencies).map(([name, versionRange]) => {
                // Handle case where version is an object (legacy lockfiles)
                const version = typeof versionRange === 'object' ? versionRange.version : versionRange;
                const pkgData = allPackages.find(p => p.name === name);
                const hasChildren = pkgData && pkgData.requires && Object.keys(pkgData.requires).length > 0;
                const isExpanded = expanded[name];

                // Check if this node matches the search query
                let isMatch = false;
                if (searchQuery) {
                    const isExact = searchQuery.startsWith('"') && searchQuery.endsWith('"');
                    const query = isExact ? searchQuery.slice(1, -1).toLowerCase() : searchQuery.toLowerCase();

                    if (isExact) {
                        isMatch = name.toLowerCase() === query;
                    } else {
                        isMatch = name.toLowerCase().includes(query);
                    }
                }

                return (
                    <div key={name} className="my-1">
                        <div
                            className={`flex items-center ${gap} ${itemPadding} rounded-lg cursor-pointer transition-all duration-200 group border ${isMatch
                                ? 'bg-primary-500/20 border-primary-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                : isExpanded
                                    ? 'bg-slate-800/40 border-slate-800/50'
                                    : 'border-transparent hover:bg-slate-800/30 hover:border-slate-800/30'
                                }`}
                            onClick={(e) => hasChildren && toggleExpand(name, e)}
                        >
                            {/* Expand/Collapse Icon */}
                            <div className="w-4 flex justify-center shrink-0">
                                {hasChildren ? (
                                    <ChevronRight size={compact ? 14 : 16} className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-slate-300' : ''}`} />
                                ) : (
                                    <div className="w-4" /> // Spacer
                                )}
                            </div>

                            {/* Package Icon */}
                            <div className={`p-1 rounded-md shrink-0 ${pkgData ? "bg-primary-500/10 text-primary-400" : "bg-slate-800 text-slate-600"}`}>
                                <Package size={compact ? 14 : 16} />
                            </div>

                            {/* Name & Version */}
                            <div className={`flex-1 flex items-center ${gap} min-w-0`}>
                                <span className={`text-sm font-medium font-mono truncate ${pkgData ? "text-slate-200 group-hover:text-primary-300" : "text-slate-500"} transition-colors`}>
                                    {name}
                                </span>

                                {/* Search/Info Icon - Now positioned before version */}
                                {pkgData && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(pkgData);
                                        }}
                                        className="p-1 rounded bg-slate-800/50 text-slate-500 hover:text-white hover:bg-primary-600 transition-all opacity-0 group-hover:opacity-100 scale-90 hover:scale-100 shrink-0"
                                        title="View Details"
                                    >
                                        <Search size={12} />
                                    </button>
                                )}

                                <span className="text-xs text-slate-500 bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800/50 font-mono group-hover:border-slate-700 transition-colors whitespace-nowrap">
                                    {version}
                                </span>

                                {pkgData?.dev && (
                                    <span className="text-[10px] font-medium text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0">
                                        DEV
                                    </span>
                                )}
                            </div>
                        </div>

                        {isExpanded && hasChildren && (
                            <div className="animate-fade-in">
                                <DependencyTree
                                    dependencies={pkgData.requires}
                                    allPackages={allPackages}
                                    onSelect={onSelect}
                                    depth={depth + 1}
                                    forcedExpanded={forcedExpanded}
                                    searchQuery={searchQuery}
                                    compact={compact}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// --- Dependency Graph Component (Tree View) ---

const DependencyGraph = ({ root, allPackages, onSelect, searchQuery = '' }) => {
    const [rootExpanded, setRootExpanded] = useState(true);
    const [forcedExpanded, setForcedExpanded] = useState(new Set());
    const [foundPaths, setFoundPaths] = useState([]);
    const [treeKey, setTreeKey] = useState(0);

    // Search and Expand Logic
    const [copied, setCopied] = useState(false);

    // Search and Expand Logic
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setForcedExpanded(new Set());
            setFoundPaths([]);
            return;
        }

        const matches = new Set();
        const paths = [];

        const search = (deps, path = []) => {
            if (!deps) return;

            Object.entries(deps).forEach(([name, versionRange]) => {
                const version = typeof versionRange === 'object' ? versionRange.version : versionRange;
                // Store both name and version in the path
                const currentPath = [...path, { name, version }];

                // If match found
                let isMatch = false;
                const isExact = searchQuery.startsWith('"') && searchQuery.endsWith('"');
                const query = isExact ? searchQuery.slice(1, -1).toLowerCase() : searchQuery.toLowerCase();

                if (isExact) {
                    isMatch = name.toLowerCase() === query;
                } else {
                    isMatch = name.toLowerCase().includes(query);
                }

                if (isMatch) {
                    // Add all parents to forcedExpanded (using just name for expansion logic)
                    currentPath.forEach(p => matches.add(p.name));
                    // Add full path object
                    paths.push(currentPath);
                }

                // Recursive search
                const pkgData = allPackages.find(p => p.name === name);
                if (pkgData && pkgData.requires) {
                    search(pkgData.requires, currentPath);
                }
            });
        };

        search(root.dependencies);
        search(root.devDependencies);

        setForcedExpanded(matches);
        setFoundPaths(paths);
        if (matches.size > 0) {
            setRootExpanded(true);
        }
    }, [searchQuery, root, allPackages]);

    const handleCollapseAll = () => {
        setTreeKey(prev => prev + 1);
        setForcedExpanded(new Set());
        setRootExpanded(true); // Keep root open
    };

    const handleCopyPaths = () => {
        const text = foundPaths.map(path =>
            path.map(p => `${p.name}@${p.version}`).join(' > ')
        ).join('\n');

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 bg-slate-950 overflow-y-auto p-6">
            <div className="w-full">
                <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                    {/* Header Section */}
                    <div className="flex flex-col gap-6 mb-8 pb-6 border-b border-slate-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setRootExpanded(!rootExpanded)}
                                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-all hover:text-white"
                                >
                                    <ChevronRight size={24} className={`transition-transform duration-200 ${rootExpanded ? 'rotate-90' : ''}`} />
                                </button>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/5 flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/10">
                                    <Box size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{root.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">v{root.version}</span>
                                        <span className="text-xs text-slate-500">{root.description}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleCollapseAll}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-all flex items-center gap-2"
                                >
                                    <Minus size={12} />
                                    Collapse All
                                </button>
                                <div className="flex flex-col items-end px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800/50">
                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Deps</span>
                                    <span className="text-xl font-bold text-slate-200">
                                        {(Object.keys(root.dependencies || {}).length + Object.keys(root.devDependencies || {}).length).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search Paths Display */}
                        {foundPaths.length > 0 && (
                            <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 animate-fade-in">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Search size={12} />
                                        Found {foundPaths.length} paths for "{searchQuery}"
                                    </div>
                                    <button
                                        onClick={handleCopyPaths}
                                        className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                                    >
                                        {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                                        {copied ? 'Copied' : 'Copy Paths'}
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1 max-h-64 overflow-auto custom-scrollbar bg-slate-950/50 p-3 rounded-lg border border-slate-800/30">
                                    {foundPaths.map((path, index) => (
                                        <div key={index} className="text-sm font-mono text-slate-400 hover:text-primary-400 transition-colors cursor-default whitespace-nowrap flex items-center">
                                            <span className="text-slate-600 mr-3 select-none text-xs w-6 text-right shrink-0">#{index + 1}</span>
                                            <span>
                                                {path.map((part, i, arr) => (
                                                    <span key={i}>
                                                        <span className={i === arr.length - 1 ? "text-primary-400 font-bold" : ""}>
                                                            {part.name}<span className="text-slate-600">@{part.version}</span>
                                                        </span>
                                                        {i < arr.length - 1 && <span className="mx-2 text-slate-700">&gt;</span>}
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tree Content */}
                    {rootExpanded && (
                        <div className="animate-fade-in space-y-8">
                            {/* Production Dependencies */}
                            {root.dependencies && Object.keys(root.dependencies).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-emerald-400 mb-4 px-4 uppercase tracking-wider">
                                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                            <Database size={16} />
                                        </div>
                                        Production Dependencies
                                        <span className="text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-400 border border-emerald-500/20">
                                            {Object.keys(root.dependencies).length}
                                        </span>
                                    </div>
                                    <DependencyTree
                                        key={`prod-${treeKey}`}
                                        dependencies={root.dependencies}
                                        allPackages={allPackages}
                                        onSelect={onSelect}
                                        forcedExpanded={forcedExpanded}
                                        searchQuery={searchQuery}
                                    />
                                </div>
                            )}

                            {/* Dev Dependencies */}
                            {root.devDependencies && Object.keys(root.devDependencies).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-yellow-400 mb-4 px-4 uppercase tracking-wider">
                                        <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                                            <Code size={16} />
                                        </div>
                                        Development Dependencies
                                        <span className="text-xs bg-yellow-500/10 px-2 py-0.5 rounded-full text-yellow-400 border border-yellow-500/20">
                                            {Object.keys(root.devDependencies).length}
                                        </span>
                                    </div>
                                    <DependencyTree
                                        key={`dev-${treeKey}`}
                                        dependencies={root.devDependencies}
                                        allPackages={allPackages}
                                        onSelect={onSelect}
                                        forcedExpanded={forcedExpanded}
                                        searchQuery={searchQuery}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const DependencyAnalyzer = () => {
    const [data, setData] = useState(null);
    const [projectInfo, setProjectInfo] = useState(null);
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState(null); // 'package' or 'lock'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [pkgDetails, setPkgDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [updates, setUpdates] = useState({});
    const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'prod', 'dev', 'scripts'
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'tree'
    const [viewMode, setViewMode] = useState('list'); // 'list', 'graph'

    // --- File Processing ---

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFile = (file) => {
        setError(null);
        if (file.type !== "application/json" && !file.name.endsWith('.json')) {
            setError("Please upload a valid JSON file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);

                // Extract Project Info
                const rootPkg = (json.packages && json.packages[""]) || json;
                const info = {
                    name: rootPkg.name || json.name || 'Untitled Project',
                    version: rootPkg.version || json.version || '0.0.0',
                    description: rootPkg.description || json.description || 'No description provided',
                    author: typeof rootPkg.author === 'string' ? rootPkg.author : (rootPkg.author?.name || json.author?.name || 'Unknown'),
                    license: rootPkg.license || json.license || 'UNLICENSED',
                    scripts: rootPkg.scripts || json.scripts || {},
                    engines: rootPkg.engines || json.engines || {},
                    private: rootPkg.private || json.private || false,
                    dependencies: rootPkg.dependencies || json.dependencies || {},
                    devDependencies: rootPkg.devDependencies || json.devDependencies || {}
                };
                setProjectInfo(info);
                setFileName(file.name);

                if (json.lockfileVersion) {
                    // package-lock.json
                    setFileType('lock');
                    processLockFile(json);
                } else if (json.dependencies || json.devDependencies) {
                    // package.json
                    setFileType('package');
                    processPackageFile(json);
                } else {
                    if (json.name || json.scripts) {
                        setFileType('package');
                        processPackageFile(json);
                    } else {
                        setError("Could not detect valid dependency structure.");
                    }
                }
            } catch (err) {
                setError("Error parsing JSON file.");
            }
        };
        reader.readAsText(file);
    };

    const processPackageFile = (json) => {
        const deps = { ...json.dependencies };
        const devDeps = { ...json.devDependencies };

        const list = [
            ...Object.entries(deps).map(([k, v]) => ({ name: k, version: v, type: 'prod', requires: {} })),
            ...Object.entries(devDeps).map(([k, v]) => ({ name: k, version: v, type: 'dev', requires: {} }))
        ];
        setData(list);
    };

    const processLockFile = (json) => {
        let list = [];

        if (json.packages) {
            list = Object.entries(json.packages)
                .filter(([k]) => k !== "")
                .map(([path, info]) => {
                    const name = path.split('node_modules/').pop();
                    return {
                        name: name,
                        version: info.version,
                        path: path,
                        resolved: info.resolved,
                        integrity: info.integrity,
                        dev: info.dev,
                        requires: info.dependencies || {}, // v2/v3 uses 'dependencies' for sub-deps
                        type: info.dev ? 'dev' : 'prod'
                    };
                });
        } else if (json.dependencies) {
            const flatten = (deps) => {
                let res = [];
                Object.entries(deps).forEach(([name, info]) => {
                    res.push({
                        name: name,
                        version: info.version,
                        dev: info.dev,
                        type: info.dev ? 'dev' : 'prod',
                        requires: info.requires || {}
                    });
                    if (info.dependencies) {
                        res = [...res, ...flatten(info.dependencies)];
                    }
                });
                return res;
            };
            list = flatten(json.dependencies);
        }

        const unique = new Map();
        list.forEach(item => {
            const key = `${item.name}@${item.version}`;
            if (!unique.has(key)) unique.set(key, item);
        });

        setData(Array.from(unique.values()));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const reset = () => {
        setData(null);
        setProjectInfo(null);
        setFileName('');
        setFileType(null);
        setSearchQuery('');
        setSelectedPkg(null);
        setPkgDetails({});
        setError(null);
        setFilter('all');
        setActiveTab('overview');
        setViewMode('list');
    };

    // --- Helper Functions ---
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // --- API Integration ---

    const fetchPackageDetails = async (name, version) => {
        // If we already have details for this specific version, don't refetch
        // UNLESS the vulnerability data is incomplete (missing summary/details from batch scan)
        if (pkgDetails[name] && pkgDetails[name].versionChecked === version) {
            const hasIncompleteVulns = pkgDetails[name].vulnerabilities?.some(v => !v.summary && !v.details);
            if (!hasIncompleteVulns) return;
        }

        setLoadingDetails(true);
        try {
            const results = await Promise.allSettled([
                fetch(`https://registry.npmjs.org/${name}/latest`),
                fetch(`https://api.npmjs.org/downloads/point/last-week/${name}`),
                fetch('https://api.osv.dev/v1/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        package: { name: name, ecosystem: 'npm' },
                        version: version
                    })
                })
            ]);

            const [metaResult, downloadsResult, vulnsResult] = results;

            let meta = {};
            if (metaResult.status === 'fulfilled' && metaResult.value.ok) {
                try { meta = await metaResult.value.json(); } catch (e) { console.warn("Failed to parse meta json", e); }
            }

            let downloads = {};
            if (downloadsResult.status === 'fulfilled' && downloadsResult.value.ok) {
                 try { downloads = await downloadsResult.value.json(); } catch (e) { console.warn("Failed to parse downloads json", e); }
            }

            let vulns = {};
            if (vulnsResult.status === 'fulfilled' && vulnsResult.value.ok) {
                 try { vulns = await vulnsResult.value.json(); } catch (e) { console.warn("Failed to parse vulns json", e); }
            }

            setPkgDetails(prev => ({
                ...prev,
                [name]: {
                    ...meta,
                    downloads: downloads.downloads,
                    latestVersion: meta.version,
                    unpackedSize: meta.dist?.unpackedSize,
                    vulnerabilities: vulns.vulns || (prev[name]?.vulnerabilities || []), // Use new vulns, or fall back to existing if fetch failed (but if fetch success and empty, it uses [])
                    versionChecked: version
                }
            }));
        } catch (err) {
            console.error("Failed to fetch package info", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        if (selectedPkg) {
            const cleanVersion = selectedPkg.version?.replace(/[\^~]/g, '') || '0.0.0';
            fetchPackageDetails(selectedPkg.name, cleanVersion);
            setActiveTab('overview'); // Reset tab on new selection
        }
    }, [selectedPkg]);

    // --- Bulk Update Checker ---

    const checkForUpdates = async () => {
        if (isCheckingUpdates || !data) return;
        setIsCheckingUpdates(true);

        const directDeps = new Set([
            ...Object.keys(projectInfo?.dependencies || {}),
            ...Object.keys(projectInfo?.devDependencies || {})
        ]);
        const packagesToCheck = data.filter(p => p.version && p.name && directDeps.has(p.name));
        const batchSize = 5;

        for (let i = 0; i < packagesToCheck.length; i += batchSize) {
            const batch = packagesToCheck.slice(i, i + batchSize);
            await Promise.all(batch.map(async (pkg) => {
                try {
                    const res = await fetch(`https://registry.npmjs.org/${pkg.name}/latest`);
                    if (res.ok) {
                        const meta = await res.json();
                        setUpdates(prev => ({
                            ...prev,
                            [pkg.name]: {
                                latest: meta.version,
                                current: pkg.version
                            }
                        }));
                    }
                } catch (e) {
                    // Ignore errors for individual packages
                }
            }));
        }
        setIsCheckingUpdates(false);
    };

    const [isCheckingVulns, setIsCheckingVulns] = useState(false);

    const checkAllVulnerabilities = async () => {
        if (isCheckingVulns || !data) return;
        setIsCheckingVulns(true);

        try {
            // Prepare batch query
            const queries = data
                .filter(p => p.version && p.name)
                .map(p => ({
                    package: { name: p.name, ecosystem: 'npm' },
                    version: p.version.replace(/[\^~]/g, '')
                }));

            // OSV batch API allows up to 1000 queries per request
            // We'll chunk it just in case, though 1000 is usually plenty for typical projects
            const chunkSize = 1000;
            for (let i = 0; i < queries.length; i += chunkSize) {
                const chunk = queries.slice(i, i + chunkSize);
                const res = await fetch('https://api.osv.dev/v1/querybatch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ queries: chunk })
                });

                if (res.ok) {
                    const result = await res.json();
                    const results = result.results || [];

                    setPkgDetails(prev => {
                        const next = { ...prev };
                        chunk.forEach((q, idx) => {
                            const vulns = results[idx]?.vulns || [];
                            if (vulns.length > 0) {
                                const pkgName = q.package.name;
                                next[pkgName] = {
                                    ...(next[pkgName] || {}),
                                    vulnerabilities: vulns,
                                    versionChecked: q.version
                                };
                            }
                        });
                        return next;
                    });
                }
            }
        } catch (err) {
            console.error("Failed to check vulnerabilities", err);
        } finally {
            setIsCheckingVulns(false);
        }
    };

    // --- Derived State ---

    const [showVulnerableOnly, setShowVulnerableOnly] = useState(false);

    const totalVulnerabilities = useMemo(() => {
        if (!data) return 0;
        return data.reduce((acc, pkg) => {
            return acc + (pkgDetails[pkg.name]?.vulnerabilities?.length || 0);
        }, 0);
    }, [data, pkgDetails]);

    const vulnerablePackagesCount = useMemo(() => {
        if (!data) return 0;
        return data.filter(pkg => (pkgDetails[pkg.name]?.vulnerabilities?.length || 0) > 0).length;
    }, [data, pkgDetails]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!data) return [];
        let res = [...data];

        // Apply type filter (prod/dev/all)
        if (filter === 'prod') res = res.filter(d => d.type === 'prod' || (!d.dev && !d.type));
        if (filter === 'dev') res = res.filter(d => d.dev || d.type === 'dev');

        // Apply search filter
        if (searchQuery) {
            const isExact = searchQuery.startsWith('"') && searchQuery.endsWith('"');
            const query = isExact ? searchQuery.slice(1, -1).toLowerCase() : searchQuery.toLowerCase();

            res = res.filter(d => {
                if (isExact) {
                    return d.name.toLowerCase() === query;
                }
                return d.name.toLowerCase().includes(query) ||
                    (d.version && d.version.toLowerCase().includes(query));
            });
        }

        // Apply vulnerability filter
        if (showVulnerableOnly) {
            res = res.filter(pkg => (pkgDetails[pkg.name]?.vulnerabilities?.length || 0) > 0);
        }

        // Sorting
        res.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return res;
    }, [data, searchQuery, filter, sortConfig, pkgDetails, showVulnerableOnly]);

    const stats = useMemo(() => {
        if (!data) return null;
        const total = data.length;
        const dev = data.filter(d => d.dev || d.type === 'dev').length;
        const prod = total - dev;
        const scriptsCount = projectInfo?.scripts ? Object.keys(projectInfo.scripts).length : 0;
        return { total, dev, prod, scriptsCount };
    }, [data, projectInfo]);



    // --- Render Helpers ---

    const renderDetailsPanel = () => {
        if (!selectedPkg) return null;

        const details = pkgDetails[selectedPkg.name];
        const isLoading = loadingDetails && !details;

        // Version Comparison Logic
        const cleanVersion = (v) => v?.replace(/[\^~]/g, '') || '0.0.0';
        const currentVer = cleanVersion(selectedPkg.version);
        const latestVer = details?.latestVersion || currentVer;
        const isOutdated = details && currentVer !== latestVer && selectedPkg.version !== 'latest';
        const vulnerabilities = details?.vulnerabilities || [];
        const hasVulnerabilities = vulnerabilities.length > 0;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPkg(null)} />
                <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl transform transition-all overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                        <button onClick={() => setSelectedPkg(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors z-10">
                            <X size={20} />
                        </button>

                        <div className="mt-2 flex-1 flex flex-col">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 shrink-0">
                                    <Package size={32} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-bold text-white break-all leading-tight mb-2">{selectedPkg.name}</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge color="blue" className="font-mono">v{selectedPkg.version}</Badge>

                                        {selectedPkg.dev || selectedPkg.type === 'dev' ?
                                            <Badge color="yellow">Dev</Badge> :
                                            <Badge color="green">Prod</Badge>
                                        }

                                        {isOutdated && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse">
                                                <AlertTriangle size={12} />
                                                Update: v{latestVer}
                                            </div>
                                        )}

                                        {hasVulnerabilities && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                                <ShieldAlert size={12} />
                                                {vulnerabilities.length} Vulnerabilit{vulnerabilities.length === 1 ? 'y' : 'ies'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 bg-slate-950/50 p-1 rounded-xl mb-6 border border-slate-800">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('tree')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'tree' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Dependencies
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'security' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Security
                                </button>
                            </div>

                            {activeTab === 'overview' && (
                                isLoading ? (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="h-20 bg-slate-800 rounded-xl"></div>
                                            <div className="h-20 bg-slate-800 rounded-xl"></div>
                                        </div>
                                    </div>
                                ) : details ? (
                                    <div className="space-y-6 animate-fade-in">
                                        <p className="text-slate-300 leading-relaxed text-sm">
                                            {details.description || "No description available."}
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1 font-semibold uppercase tracking-wider">
                                                    <Download size={12} /> Weekly Downloads
                                                </div>
                                                <div className="font-bold text-white text-lg">
                                                    {details.downloads ? details.downloads.toLocaleString() : "N/A"}
                                                </div>
                                            </div>

                                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1 font-semibold uppercase tracking-wider">
                                                    <Database size={12} /> Bundle Size
                                                </div>
                                                <div className="font-bold text-white text-lg">
                                                    {details.unpackedSize ? formatBytes(details.unpackedSize) : "N/A"}
                                                </div>
                                            </div>

                                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1 font-semibold uppercase tracking-wider">
                                                    <Tag size={12} /> License
                                                </div>
                                                <div className="font-bold text-white text-lg truncate" title={details.license}>
                                                    {details.license || "Unknown"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Links</h4>
                                            <div className="flex flex-col gap-2">
                                                {details.homepage && (
                                                    <a href={details.homepage} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors group">
                                                        <span className="flex items-center gap-2 text-slate-300 group-hover:text-white text-sm"><Globe size={16} /> Homepage</span>
                                                        <ExternalLink size={14} className="text-slate-500 group-hover:text-white" />
                                                    </a>
                                                )}
                                                <a href={`https://www.npmjs.com/package/${selectedPkg.name}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors group">
                                                    <span className="flex items-center gap-2 text-slate-300 group-hover:text-white text-sm"><Box size={16} /> NPM Registry</span>
                                                    <ExternalLink size={14} className="text-slate-500 group-hover:text-white" />
                                                </a>
                                            </div>
                                        </div>

                                        {details.author && (
                                            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500">Main Author</div>
                                                    <div className="font-medium text-white">{details.author.name}</div>
                                                    {details.author.email && <div className="text-xs text-slate-400">{details.author.email}</div>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 text-sm italic text-center py-8">
                                        Could not fetch additional details.
                                    </div>
                                )
                            )}

                            {activeTab === 'tree' && (
                                <div className="flex-1 overflow-y-auto custom-scrollbar animate-fade-in">
                                    <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-4">
                                        <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                            <GitBranch size={16} className="text-primary-500" />
                                            Dependency Graph
                                        </h4>
                                        {selectedPkg.requires && Object.keys(selectedPkg.requires).length > 0 ? (
                                            <div className="overflow-x-auto pb-4 -mx-2 px-2">
                                                <DependencyTree
                                                    dependencies={selectedPkg.requires}
                                                    allPackages={data}
                                                    onSelect={setSelectedPkg}
                                                    compact={true}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-500 text-sm">
                                                <Package size={32} className="mx-auto mb-2 opacity-50" />
                                                No dependencies found for this package.
                                                {fileType === 'package' && (
                                                    <div className="mt-2 text-xs text-yellow-500/80">
                                                        Note: Sub-dependencies are only available when using package-lock.json
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="flex-1 overflow-y-auto custom-scrollbar animate-fade-in">
                                    {isLoading ? (
                                        <div className="space-y-4 p-4 animate-pulse">
                                            <div className="h-20 bg-slate-800 rounded-xl"></div>
                                            <div className="h-20 bg-slate-800 rounded-xl"></div>
                                        </div>
                                    ) : hasVulnerabilities ? (
                                        <div className="space-y-6 p-4 sm:p-6">

                                            {/* Top Summary Card */}
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-start gap-4">
                                                <div className="p-3 bg-red-500/20 rounded-lg text-red-500 shrink-0">
                                                    <ShieldAlert size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-red-400 font-bold text-lg mb-1">Security Issues Found</h4>
                                                    <p className="text-red-300/80 text-sm leading-relaxed">
                                                        This version of <span className="font-mono bg-red-500/10 px-1 py-0.5 rounded text-red-300">{selectedPkg.name}</span> has {vulnerabilities.length} known vulnerabilit{vulnerabilities.length === 1 ? 'y' : 'ies'}.
                                                        Recommended action: upgrade to a patched version immediately.
                                                    </p>
                                                </div>
                                            </div>

                                            {vulnerabilities.map((vuln) => {
                                                const severity = vuln.database_specific?.severity || "UNKNOWN";
                                                const severityColor = {
                                                    CRITICAL: "bg-red-500 text-white border-red-600 shadow-red-500/20",
                                                    HIGH: "bg-orange-600 text-white border-orange-600 shadow-orange-600/20",
                                                    MODERATE: "bg-yellow-500 text-black border-yellow-600 shadow-yellow-500/20",
                                                    LOW: "bg-slate-500 text-white border-slate-600",
                                                    UNKNOWN: "bg-slate-700 text-slate-300 border-slate-600"
                                                }[severity.toUpperCase()] || "bg-slate-700 text-slate-300 border-slate-600";

                                                const applicableFix = getApplicableFix(currentVer, vuln.affected);

                                                return (
                                                    <div key={vuln.id} className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all shadow-sm">

                                                        {/* Vuln Header */}
                                                        <div className="p-5 border-b border-slate-800/50 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-lg ${severityColor}`}>
                                                                    {severity}
                                                                </span>
                                                                <span className="text-slate-400 font-mono text-sm">
                                                                    {vuln.id}
                                                                    {vuln.aliases && vuln.aliases.length > 0 && (
                                                                        <span className="ml-2 opacity-75">({vuln.aliases[0]})</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <a
                                                                href={`https://osv.dev/vulnerability/${vuln.id}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs font-medium text-primary-400 hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                                                            >
                                                                View on OSV <ExternalLink size={12} />
                                                            </a>
                                                        </div>

                                                        <div className="p-6 space-y-6">
                                                            {/* Title */}
                                                            <div>
                                                                <h5 className="text-lg font-bold text-white mb-2 leading-snug">
                                                                    {vuln.summary || "Security Vulnerability Detected"}
                                                                </h5>
                                                                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Calendar size={14} />
                                                                        Published: {vuln.published ? new Date(vuln.published).toLocaleDateString() : 'N/A'}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <RefreshCw size={14} />
                                                                        Modified: {vuln.modified ? new Date(vuln.modified).toLocaleDateString() : 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Fix Info Banner */}
                                                            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current</span>
                                                                    <span className="font-mono text-sm text-red-400 bg-red-500/10 px-2 py-0.5 rounded w-fit border border-red-500/20">
                                                                        v{currentVer}
                                                                    </span>
                                                                </div>

                                                                <div className="hidden sm:block text-slate-700">
                                                                    <ArrowRight size={20} />
                                                                </div>

                                                                <div className="flex flex-col gap-1 w-full sm:w-auto">
                                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fixed In</span>
                                                                    {applicableFix ? (
                                                                        <span className="font-mono text-sm text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-fit border border-emerald-500/20 flex items-center gap-2">
                                                                            v{applicableFix} <Check size={12} />
                                                                        </span>
                                                                    ) : (
                                                                        <span className="font-mono text-sm text-slate-400 bg-slate-800 px-2 py-0.5 rounded w-fit">
                                                                            Analysis inconclusive
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Markdown Details */}
                                                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                                                                <SimpleMarkdown content={vuln.details} />
                                                            </div>

                                                            {/* References */}
                                                            {vuln.references && vuln.references.length > 0 && (
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">References</div>
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {vuln.references.map((ref, i) => (
                                                                            <a key={i} href={ref.url} target="_blank" rel="noreferrer" className="text-sm text-primary-400 hover:text-white truncate flex items-center gap-2 transition-colors group p-2 rounded hover:bg-slate-800">
                                                                                <ExternalLink size={14} className="text-primary-500/50 group-hover:text-primary-400" />
                                                                                <span className="truncate">{ref.url}</span>
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                                <ShieldCheck size={40} />
                                            </div>
                                            <h4 className="text-2xl font-bold text-white mb-2">System Secure</h4>
                                            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                                                Based on the OSV database, no known vulnerabilities affect version <span className="font-mono text-emerald-400">v{currentVer}</span> of this package.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-slate-600 opacity-50" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="text-primary-500" />
            : <ArrowDown size={14} className="text-primary-500" />;
    };



    return (
        <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Package size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-none">Dependency Analyzer</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Project Intelligence Tool</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {data && (
                        <>
                            <button
                                onClick={checkAllVulnerabilities}
                                disabled={isCheckingVulns}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isCheckingVulns ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20'}`}
                            >
                                <ShieldAlert size={14} className={isCheckingVulns ? "animate-pulse" : ""} />
                                {isCheckingVulns ? 'Scanning...' : 'Scan Vulns'}
                            </button>
                            <button
                                onClick={checkForUpdates}
                                disabled={isCheckingUpdates}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isCheckingUpdates ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
                            >
                                <RefreshCw size={14} className={isCheckingUpdates ? "animate-spin" : ""} />
                                {isCheckingUpdates ? 'Checking...' : 'Check Updates'}
                            </button>
                            <button onClick={reset} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors text-sm font-medium">
                                <Upload size={14} />
                                New Scan
                            </button>
                        </>
                    )}


                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {!data ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        <div
                            className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center transition-all duration-300 group ${dragActive ? 'border-primary-500 bg-primary-500/5 scale-[1.02]' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/30'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-black/50 group-hover:scale-110 transition-transform duration-300 relative">
                                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
                                <FileJson className="text-primary-500 relative z-10" size={48} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">Drop package.json here</h3>
                            <p className="text-slate-400 mb-10 max-w-md leading-relaxed text-lg">
                                Unlock insights about your project's dependencies, scripts, and security posture.
                            </p>

                            <label className="relative group/btn">
                                <input type="file" className="hidden" accept=".json" onChange={handleFileChange} />
                                <span className="px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-white/10 flex items-center gap-2">
                                    <Upload size={20} />
                                    Select File
                                </span>
                            </label>

                            {error && (
                                <div className="mt-8 flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-xl text-sm border border-red-500/20 animate-fade-in">
                                    <AlertTriangle size={16} />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-y-auto pb-20">
                        {/* Project Hero Section */}
                        <div className="p-8 pb-0">
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-bold text-white">{projectInfo.name}</h1>
                                            <Badge color="blue" className="text-sm px-2 py-1">v{projectInfo.version}</Badge>
                                            {projectInfo.private && <Badge color="slate" className="text-sm px-2 py-1">Private</Badge>}
                                        </div>
                                        <p className="text-slate-400 max-w-2xl mb-6 text-lg">{projectInfo.description}</p>

                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                                                <User size={14} /> {projectInfo.author}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                                                <Tag size={14} /> {projectInfo.license}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                                                <Cpu size={14} /> {projectInfo.engines && Object.keys(projectInfo.engines).length > 0 ? Object.keys(projectInfo.engines).join(', ') : 'Any Engine'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 min-w-[300px]">
                                        <StatCard label="Total Deps" value={stats.total} icon={Database} color="blue" />
                                        <StatCard label="Scripts" value={stats.scriptsCount} icon={Terminal} color="purple" />
                                        <StatCard label="Production" value={stats.prod} icon={Box} color="green" />
                                        <StatCard label="Dev Deps" value={stats.dev} icon={Code} color="orange" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 mx-6 mt-6 rounded-t-2xl shadow-xl">
                            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'all'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    All <span className={`text-xs px-1.5 py-0.5 rounded ${filter === 'all' ? 'bg-white/20' : 'bg-slate-800'}`}>{stats.total}</span>
                                </button>
                                <button
                                    onClick={() => setFilter('prod')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'prod'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    Prod <span className={`text-xs px-1.5 py-0.5 rounded ${filter === 'prod' ? 'bg-white/20' : 'bg-slate-800'}`}>{stats.prod}</span>
                                </button>
                                <button
                                    onClick={() => setFilter('dev')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'dev'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    Dev <span className={`text-xs px-1.5 py-0.5 rounded ${filter === 'dev' ? 'bg-white/20' : 'bg-slate-800'}`}>{stats.dev}</span>
                                </button>
                                <button
                                    onClick={() => setFilter('scripts')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'scripts'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    Scripts <span className={`text-xs px-1.5 py-0.5 rounded ${filter === 'scripts' ? 'bg-white/20' : 'bg-slate-800'}`}>{stats.scriptsCount}</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {fileType === 'package' && (
                                    <div className="hidden md:flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                        <AlertTriangle size={12} />
                                        Direct deps only. Use package-lock.json for full tree.
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search dependencies..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 border border-slate-700"
                                        />
                                    </div>
                                    {totalVulnerabilities > 0 && (
                                        <button
                                            onClick={() => setShowVulnerableOnly(!showVulnerableOnly)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${showVulnerableOnly ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
                                        >
                                            <Filter size={14} />
                                            {showVulnerableOnly ? 'Show All' : 'Vulnerable Only'}
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
                                                {vulnerablePackagesCount}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vulnerability Summary Banner */}
                        {totalVulnerabilities > 0 && (
                            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center justify-between animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-red-500/20 rounded-lg text-red-500">
                                        <ShieldAlert size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-red-400 font-bold text-sm">Security Alert</h3>
                                        <p className="text-red-400/70 text-xs">
                                            Found <span className="font-bold text-red-400">{totalVulnerabilities}</span> vulnerabilities across <span className="font-bold text-red-400">{vulnerablePackagesCount}</span> packages.
                                        </p>
                                    </div>
                                </div>
                                {!showVulnerableOnly && (
                                    <button
                                        onClick={() => setShowVulnerableOnly(true)}
                                        className="text-xs font-medium text-red-400 hover:text-red-300 underline underline-offset-2"
                                    >
                                        Filter Vulnerable Packages
                                    </button>
                                )}
                            </div>
                        )}

                        {/* View Toggle */}
                        <div className="px-6 pb-4 flex justify-end">
                            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <List size={16} /> List
                                </button>
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'graph' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <GitGraph size={16} /> Graph
                                </button>
                            </div>
                        </div>


                        {/* Content Area */}
                        <div className="flex-1 bg-slate-950 mx-6 mb-6 rounded-b-2xl border-x border-b border-slate-800/50 overflow-hidden flex flex-col min-h-[75vh]">
                            {viewMode === 'list' ? (
                                filter === 'scripts' ? (
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(projectInfo.scripts).filter(([k]) => {
                                            const isExact = searchQuery.startsWith('"') && searchQuery.endsWith('"');
                                            const query = isExact ? searchQuery.slice(1, -1).toLowerCase() : searchQuery.toLowerCase();
                                            if (isExact) return k.toLowerCase() === query;
                                            return k.toLowerCase().includes(query);
                                        }).map(([key, cmd]) => (
                                            <div key={key} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-primary-500/50 transition-colors group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-mono font-bold text-primary-400">{key}</div>
                                                    <Terminal size={16} className="text-slate-600 group-hover:text-primary-500 transition-colors" />
                                                </div>
                                                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/50 font-mono text-xs text-slate-400 break-all">
                                                    {cmd}
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(projectInfo.scripts).length === 0 && (
                                            <div className="col-span-full text-center py-12 text-slate-500">No scripts found.</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto h-full">
                                        <table className="w-full text-left border-collapse relative">
                                            <thead>
                                                <tr className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                                                    <th
                                                        className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        <div className="flex items-center gap-2">Package <SortIcon column="name" /></div>
                                                    </th>
                                                    <th
                                                        className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                                                        onClick={() => handleSort('version')}
                                                    >
                                                        <div className="flex items-center gap-2">Version <SortIcon column="version" /></div>
                                                    </th>
                                                    <th
                                                        className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                                                        onClick={() => handleSort('type')}
                                                    >
                                                        <div className="flex items-center gap-2">Type <SortIcon column="type" /></div>
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                        License
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                        Downloads
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {sortedData.map((pkg, idx) => {
                                                    const details = pkgDetails[pkg.name];
                                                    return (
                                                        <tr
                                                            key={`${pkg.name}-${pkg.version}`}
                                                            onClick={() => setSelectedPkg(pkg)}
                                                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${pkg.dev || pkg.type === 'dev' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                                        <Package size={16} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-slate-200 group-hover:text-primary-400 transition-colors flex items-center gap-2">
                                                                            {pkg.name}
                                                                            {updates[pkg.name] && updates[pkg.name].latest !== pkg.version.replace(/[\^~]/, '') && (
                                                                                <span className="flex h-2 w-2 rounded-full bg-orange-500" title={`Update available: ${updates[pkg.name].latest}`}></span>
                                                                            )}
                                                                            {details?.vulnerabilities?.length > 0 && (
                                                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                                                                    <ShieldAlert size={10} />
                                                                                    {details.vulnerabilities.length}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500">{pkg.description || 'No description'}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col items-start gap-1">
                                                                    <span className="text-sm font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                                                        v{pkg.version}
                                                                    </span>
                                                                    {updates[pkg.name] && updates[pkg.name].latest !== pkg.version.replace(/[\^~]/, '') && (
                                                                        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                                                                            → v{updates[pkg.name].latest}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>            <td className="px-6 py-4">
                                                                {pkg.dev || pkg.type === 'dev' ? (
                                                                    <Badge color="yellow">Dev</Badge>
                                                                ) : (
                                                                    <Badge color="green">Prod</Badge>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {details ? (
                                                                    <span className="text-xs text-slate-400">{details.license || "Unknown"}</span>
                                                                ) : (
                                                                    <span className="text-xs text-slate-600">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {details?.downloads ? (
                                                                    <span className="text-xs font-medium text-slate-300">{details.downloads.toLocaleString()}</span>
                                                                ) : (
                                                                    <span className="text-xs text-slate-600">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                                                                    <ChevronRight size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {sortedData.length === 0 && (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                            No dependencies found matching "{searchQuery}"
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
                                <DependencyGraph
                                    root={{
                                        name: projectInfo.name,
                                        version: projectInfo.version,
                                        type: 'root',
                                        dependencies: projectInfo.dependencies,
                                        devDependencies: projectInfo.devDependencies,
                                        description: projectInfo.description
                                    }}
                                    allPackages={data}
                                    onSelect={setSelectedPkg}
                                    searchQuery={searchQuery}
                                />
                            )}
                        </div>

                        {/* Details Panel Overlay */}
                        {selectedPkg && renderDetailsPanel()}
                    </div>
                )}
            </div>
        </div >
    );
};

export default DependencyAnalyzer;
