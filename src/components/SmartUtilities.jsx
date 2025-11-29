import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    Link as LinkIcon,
    User,
    BookOpen,
    Download,
    Share2,
    Copy,
    Check,
    ExternalLink,
    CalendarPlus,
    AlertTriangle,
    AlertCircle,
    Mail,
    MessageCircle,
    QrCode,
    Smartphone
} from 'lucide-react';

export default function SmartUtilities({ showToast }) {
    const [activeTab, setActiveTab] = useState('parser');

    return (
        <div className="h-full flex flex-col p-6 max-w-7xl mx-auto">
            {/* Tabs Header */}
            <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1">
                <button
                    onClick={() => setActiveTab('parser')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'parser'
                            ? 'text-indigo-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <BookOpen size={18} />
                        Event Parser
                    </div>
                    {activeTab === 'parser' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'whatsapp'
                            ? 'text-green-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <MessageCircle size={18} />
                        WhatsApp Direct
                    </div>
                    {activeTab === 'whatsapp' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'parser' ? (
                    <EventParser showToast={showToast} />
                ) : (
                    <WhatsAppDirect showToast={showToast} />
                )}
            </div>
        </div>
    );
}

function EventParser({ showToast }) {
    const [inputText, setInputText] = useState('');
    const [events, setEvents] = useState([]);
    const [globalWarnings, setGlobalWarnings] = useState([]);

    const parseText = (text) => {
        const newEvents = [];
        const warnings = [];

        // 1. Extract Date (Global)
        const dateRegex = /Date:\s*(?<date>[^\n]+)/i;
        const dateMatch = text.match(dateRegex);
        let baseDate = null;

        if (dateMatch) {
            baseDate = dateMatch.groups.date.trim();
        } else {
            warnings.push("No 'Date:' found in text. Using today's date.");
            baseDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        // 2. Split into blocks based on "Time:"
        const blocks = text.split(/Time:\s*/i).slice(1);

        if (blocks.length === 0 && text.trim().length > 0) {
            warnings.push("No events found. Looked for 'Time:' keyword.");
        }

        blocks.forEach(block => {
            const eventWarnings = [];

            const timeMatch = block.match(/^([^\n]+)/);
            const timeStr = timeMatch ? timeMatch[1].trim() : "Unknown Time";

            let startTime = "";
            let endTime = "";

            if (timeStr.includes("-")) {
                const parts = timeStr.split("-");
                startTime = parts[0].trim();
                endTime = parts[1].trim();
            } else {
                startTime = timeStr;
                endTime = timeStr;
                eventWarnings.push("Time format unclear (expected 'Start - End')");
            }

            const subjectMatch = block.match(/Subject:\s*([^\n]+)/i);
            const subject = subjectMatch ? subjectMatch[1].trim() : "Unknown Subject";
            if (!subjectMatch) eventWarnings.push("Missing 'Subject:'");

            const facultyMatch = block.match(/Faculty:\s*([^\n]+)/i);
            const faculty = facultyMatch ? facultyMatch[1].trim() : "Unknown Faculty";
            if (!facultyMatch) eventWarnings.push("Missing 'Faculty:'");

            const linkMatch = block.match(/Link:\s*(https?:\/\/[^\s]+)/i);
            const link = linkMatch ? linkMatch[1].trim() : "";
            if (!linkMatch) eventWarnings.push("Missing 'Link:' or invalid URL");

            newEvents.push({
                id: Math.random().toString(36).substr(2, 9),
                date: baseDate,
                time: timeStr,
                startTime,
                endTime,
                subject,
                faculty,
                link,
                warnings: eventWarnings
            });
        });

        setEvents(newEvents);
        setGlobalWarnings(warnings);

        if (newEvents.length > 0 && showToast) {
            showToast(`Found ${newEvents.length} events!`);
        }
    };

    const handleInputChange = (e) => {
        const text = e.target.value;
        setInputText(text);
        parseText(text);
    };

    const formatLocalTime = (dateStr, timeStr) => {
        try {
            const d = new Date(`${dateStr} ${timeStr}`);
            if (isNaN(d.getTime())) return null;
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        } catch (e) {
            return null;
        }
    };

    const generateGoogleCalendarUrl = (event) => {
        try {
            const start = formatLocalTime(event.date, event.startTime);
            const end = formatLocalTime(event.date, event.endTime);
            if (!start || !end) return null;

            const title = encodeURIComponent(event.subject);
            const details = encodeURIComponent(`Faculty: ${event.faculty}\nLink: ${event.link}`);
            const location = encodeURIComponent("Online (Microsoft Teams)");

            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
        } catch (e) {
            return null;
        }
    };

    const generateOutlookCalendarUrl = (event) => {
        try {
            const startDateTimeStr = `${event.date} ${event.startTime}`;
            const endDateTimeStr = `${event.date} ${event.endTime}`;
            const startDate = new Date(startDateTimeStr);
            const endDate = new Date(endDateTimeStr);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

            const start = startDate.toISOString();
            const end = endDate.toISOString();
            const subject = encodeURIComponent(event.subject);
            const body = encodeURIComponent(`Faculty: ${event.faculty}\nLink: ${event.link}`);
            const location = encodeURIComponent("Online (Microsoft Teams)");

            return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${start}&enddt=${end}&body=${body}&location=${location}`;
        } catch (e) {
            return null;
        }
    };

    const downloadIcs = (event) => {
        downloadBatchIcs([event], `${event.subject.replace(/\s+/g, '_')}.ics`);
    };

    const downloadBatchIcs = (eventsList, filename) => {
        if (eventsList.length === 0) return;
        try {
            const now = new Date().toISOString().replace(/-|:|\.\d\d\d/g, "");
            let icsBody = "";
            eventsList.forEach(event => {
                const start = formatLocalTime(event.date, event.startTime);
                const end = formatLocalTime(event.date, event.endTime);
                if (start && end) {
                    icsBody += `BEGIN:VEVENT
UID:${event.id}@omnitools.app
DTSTAMP:${now}
DTSTART;TZID=Asia/Kolkata:${start}
DTEND;TZID=Asia/Kolkata:${end}
SUMMARY:${event.subject} — Live Class
DESCRIPTION:Faculty: ${event.faculty}\\nJoin link: ${event.link}
URL:${event.link}
END:VEVENT
`;
                }
            });

            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OmniTools//LinkExtractor//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VTIMEZONE
TZID:Asia/Kolkata
X-LIC-LOCATION:Asia/Kolkata
BEGIN:STANDARD
TZOFFSETFROM:+0530
TZOFFSETTO:+0530
TZNAME:IST
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE
${icsBody}END:VCALENDAR`;

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || `Full_Schedule_${eventsList[0].date.replace(/\s+/g, '_')}.ics`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (showToast) showToast("Schedule downloaded!");
        } catch (e) {
            console.error("Error generating ICS", e);
        }
    };

    const generateSummaryGoogleUrl = () => {
        if (events.length === 0) return null;
        try {
            const firstEvent = events[0];
            const lastEvent = events[events.length - 1];
            const start = formatLocalTime(firstEvent.date, firstEvent.startTime);
            const end = formatLocalTime(lastEvent.date, lastEvent.endTime);
            if (!start || !end) return null;

            const title = encodeURIComponent(`Daily Classes - ${firstEvent.date}`);
            let description = "TODAY'S SCHEDULE:\\n\\n";
            events.forEach(e => {
                description += `📚 ${e.subject}\\n⏰ ${e.time}\\n👨‍🏫 ${e.faculty}\\n🔗 ${e.link}\\n\\n`;
            });
            const details = encodeURIComponent(description);
            const location = encodeURIComponent("Online");
            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
        } catch (e) {
            return null;
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            {/* Input Section */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <BookOpen size={20} />
                        </div>
                        Input Text
                    </h2>
                    <textarea
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Paste your schedule text here...
Example:
📚Date: 29 November 2025 
⏰Time: 2:30 PM - 3:30 PM
📚Subject: Math
..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
                    />

                    {globalWarnings.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-500 text-sm font-semibold mb-1">
                                <AlertTriangle size={16} />
                                <span>Parsing Warnings</span>
                            </div>
                            <ul className="list-disc list-inside text-xs text-yellow-200/80 space-y-1">
                                {globalWarnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Output Section */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                            <Calendar size={20} />
                        </div>
                        Extracted Events ({events.length})
                    </h2>

                    {events.length > 0 && (
                        <div className="flex gap-2">
                            <a
                                href={generateSummaryGoogleUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                <CalendarPlus size={14} />
                                Summary Event
                            </a>
                            <button
                                onClick={() => downloadBatchIcs(events)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                <Download size={14} />
                                Download All
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {events.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl p-8">
                            <Calendar size={48} className="mb-4 opacity-50" />
                            <p>No events found yet.</p>
                            <p className="text-sm mt-2">Paste text on the left to extract details.</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className={`bg-slate-900 border rounded-xl p-5 transition-colors shadow-sm ${event.warnings.length > 0 ? 'border-yellow-500/50' : 'border-slate-800 hover:border-slate-700'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{event.subject}</h3>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <User size={14} />
                                            <span>{event.faculty}</span>
                                        </div>
                                    </div>
                                </div>

                                {event.warnings.length > 0 && (
                                    <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                                        <AlertCircle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                                        <div className="text-xs text-yellow-200/80">
                                            {event.warnings.map((w, i) => <div key={i}>{w}</div>)}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center gap-2 text-sm text-slate-300">
                                        <Calendar size={14} className="text-indigo-400" />
                                        {event.date}
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center gap-2 text-sm text-slate-300">
                                        <Clock size={14} className="text-orange-400" />
                                        {event.time}
                                    </div>
                                </div>

                                {event.link && (
                                    <div className="flex items-center gap-2 mb-4 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 text-xs break-all">
                                        <LinkIcon size={14} className="shrink-0" />
                                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                            {event.link}
                                        </a>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <a
                                        href={generateGoogleCalendarUrl(event)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors min-w-[120px] ${!event.link ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                                        onClick={(e) => !event.link && e.preventDefault()}
                                    >
                                        <CalendarPlus size={16} />
                                        Google
                                    </a>
                                    <a
                                        href={generateOutlookCalendarUrl(event)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors min-w-[120px] ${!event.link ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'}`}
                                        onClick={(e) => !event.link && e.preventDefault()}
                                    >
                                        <Mail size={16} />
                                        Outlook
                                    </a>
                                    <button
                                        onClick={() => downloadIcs(event)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors min-w-[120px]"
                                    >
                                        <Download size={16} />
                                        .ics
                                    </button>
                                    <a
                                        href={event.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors min-w-[120px] ${!event.link ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                        onClick={(e) => !event.link && e.preventDefault()}
                                    >
                                        <ExternalLink size={16} />
                                        Join
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function WhatsAppDirect() {
    const [countryCode, setCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');

    const fullNumber = `${countryCode.replace('+', '')}${phoneNumber}`;
    const whatsappUrl = `https://wa.me/${fullNumber}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}`;

    const handleOpenWhatsApp = () => {
        if (!phoneNumber) return;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col gap-6 shadow-xl">
                <div className="text-center">
                    <div className="inline-flex p-3 bg-green-500/20 rounded-xl text-green-400 mb-4">
                        <MessageCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">WhatsApp Direct</h2>
                    <p className="text-slate-400 text-sm">Chat with anyone without saving their number.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Country Code</label>
                        <input
                            type="text"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono"
                            placeholder="+91"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pl-10 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono text-lg"
                                placeholder="9876543210"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleOpenWhatsApp}
                        disabled={!phoneNumber}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${phoneNumber
                                ? 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <MessageCircle size={20} />
                        Start Chat
                    </button>
                </div>

                {phoneNumber && (
                    <div className="border-t border-slate-800 pt-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-xs font-medium text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <QrCode size={14} />
                            Scan to Chat
                        </p>
                        <div className="p-3 bg-white rounded-xl shadow-lg">
                            <img
                                src={qrUrl}
                                alt="WhatsApp QR Code"
                                className="w-40 h-40"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
