import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
    FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const AttendanceTracker = () => {
    // --- State Configuration ---
    // --- State Configuration with Persistence ---
    const [mainTitle, setMainTitle] = useState(() => localStorage.getItem('at_mainTitle') || "Employees Monthly Attendance");
    const [title, setTitle] = useState(() => localStorage.getItem('at_title') || "Organization Name");

    const [currentDate, setCurrentDate] = useState(() => {
        const savedDate = localStorage.getItem('at_currentDate');
        return savedDate ? new Date(savedDate) : new Date();
    });

    const [employees, setEmployees] = useState(() => {
        const savedEmps = localStorage.getItem('at_employees');
        return savedEmps ? JSON.parse(savedEmps) : [
            { id: 1, name: "Employee 1", attendance: { 1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'A' } },
            { id: 2, name: "Employee 2", attendance: { 1: 'P', 2: 'P' } },
            { id: 3, name: "Employee 3", attendance: {} },
        ];
    });
    const [newEmployeeName, setNewEmployeeName] = useState("");

    // --- Persistence Effects ---
    useEffect(() => { localStorage.setItem('at_mainTitle', mainTitle); }, [mainTitle]);
    useEffect(() => { localStorage.setItem('at_title', title); }, [title]);
    useEffect(() => { localStorage.setItem('at_currentDate', currentDate.toString()); }, [currentDate]);
    useEffect(() => { localStorage.setItem('at_employees', JSON.stringify(employees)); }, [employees]);

    const clearData = () => {
        if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
            setMainTitle("Employees Monthly Attendance");
            setTitle("Organization Name");
            setCurrentDate(new Date());
            setEmployees([
                { id: 1, name: "Employee 1", attendance: {} },
                { id: 2, name: "Employee 2", attendance: {} },
                { id: 3, name: "Employee 3", attendance: {} },
            ]);
            localStorage.removeItem('at_mainTitle');
            localStorage.removeItem('at_title');
            localStorage.removeItem('at_currentDate');
            localStorage.removeItem('at_employees');
        }
    };

    // --- Derived State (Date Logic) ---
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const daysInMonth = useMemo(() => {
        return new Date(year, month + 1, 0).getDate();
    }, [year, month]);

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const daysArray = useMemo(() => {
        return Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month, i + 1);
            return {
                date: i + 1,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2) // Su, Mo, Tu
            };
        });
    }, [year, month, daysInMonth]);

    // --- Selection & Bulk Action State ---
    const [selection, setSelection] = useState(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null); // { empId, day }

    // --- Handlers ---
    const handleMonthChange = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
        setSelection(new Set()); // Clear selection on month change
    };

    const updateEmployeeName = (id, newName) => {
        setEmployees(employees.map(e => e.id === id ? { ...e, name: newName } : e));
    };

    const addEmployee = (e) => {
        e.preventDefault();
        if (!newEmployeeName.trim()) return;
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        setEmployees([...employees, { id: newId, name: newEmployeeName, attendance: {} }]);
        setNewEmployeeName("");
    };

    const removeEmployee = (id) => {
        setEmployees(employees.filter(e => e.id !== id));
    };

    // --- Selection Logic ---
    const handleMouseDown = (empId, day, e) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        setDragStart({ empId, day });

        // If ctrl/cmd key not pressed, clear previous selection
        const newSelection = (e.ctrlKey || e.metaKey) ? new Set(selection) : new Set();
        newSelection.add(`${empId}-${day}`);
        setSelection(newSelection);
    };

    const handleMouseEnter = (empId, day) => {
        if (!isDragging || !dragStart) return;

        // Rectangle Selection Logic
        const startEmpIndex = employees.findIndex(e => e.id === dragStart.empId);
        const currentEmpIndex = employees.findIndex(e => e.id === empId);
        const startDay = dragStart.day;
        const currentDay = day;

        const minEmpIdx = Math.min(startEmpIndex, currentEmpIndex);
        const maxEmpIdx = Math.max(startEmpIndex, currentEmpIndex);
        const minDay = Math.min(startDay, currentDay);
        const maxDay = Math.max(startDay, currentDay);

        const newSelection = new Set(); // For drag, we often want to replace current "drag session" selection, but complexity suggests simple adding or just recalculating the box.
        // Simplest User Exp: Recalculate the box from start to current

        // Note: Preserving complex multi-box selection is hard. Let's just do one box at a time for simplicity or strict box.
        // If we want to support Ctrl+Click + Drag, we'd need to keep 'initialSelectionBeforeDrag'.
        // Let's stick to simple single box for now for robustness.

        for (let i = minEmpIdx; i <= maxEmpIdx; i++) {
            const eId = employees[i].id;
            for (let d = minDay; d <= maxDay; d++) {
                newSelection.add(`${eId}-${d}`);
            }
        }
        setSelection(newSelection);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                setDragStart(null);
            }
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging]);

    // Single Click Toggle (only if selection size is 1 and it's the clicked cell)
    // Actually, mouseup logic on cell might be better, but we used global mouseup.
    // Let's rely on the Bulk Actions for everything OR allow single click toggle if selection is 1.
    const handleCellClick = (empId, day) => {
        // Toggle logic moved here, but we need to distinquish click vs drag.
        // If we just clicked (mousedown + up on same cell), selection size is 1.
        if (selection.size === 1 && selection.has(`${empId}-${day}`)) {
            toggleAttendance(empId, day);
        }
    };
    // Re-attach onClick to the div? No, onMouseDown captures it. 
    // We can just add a separate simple "toggle" if we want, but "Bulk Mode" suggests we might just use the toolbar?
    // User Requirement: "multiselect date cells if we want to quickly put "P"/"PP"/"A" or blank".
    // It implies we can still do single click.
    // Let's use `onClick` on the cell div. The `onClick` fires after MouseUp. 
    // If we dragged, `onClick` still fires.
    // We can check if selection size > 1.

    const toggleAttendance = (empId, day) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === empId) {
                const currentStatus = emp.attendance[day];
                let nextStatus;
                // Cycle: P -> PP -> A -> Empty
                if (currentStatus === 'P') nextStatus = 'PP';
                else if (currentStatus === 'PP') nextStatus = 'A';
                else if (currentStatus === 'A') nextStatus = undefined;
                else nextStatus = 'P';
                return { ...emp, attendance: { ...emp.attendance, [day]: nextStatus } };
            }
            return emp;
        }));
    };

    const bulkUpdate = (status) => {
        if (selection.size === 0) return;

        setEmployees(prev => prev.map(emp => {
            const newAttendance = { ...emp.attendance };
            let hasChanges = false;

            selection.forEach(key => {
                const [selEmpId, selDay] = key.split('-').map(Number);
                if (selEmpId === emp.id) {
                    if (status === undefined) {
                        delete newAttendance[selDay];
                    } else {
                        newAttendance[selDay] = status;
                    }
                    hasChanges = true;
                }
            });

            return hasChanges ? { ...emp, attendance: newAttendance } : emp;
        }));
        setSelection(new Set()); // Clear after update
    };

    const getStatusColor = (status) => {
        if (status === 'P') return 'text-emerald-400 font-bold bg-emerald-500/10';
        if (status === 'PP') return 'text-emerald-300 font-bold bg-emerald-500/20'; // Distinct style for PP
        if (status === 'A') return 'text-red-400 font-bold bg-red-500/10';
        return 'hover:bg-slate-800 text-slate-600';
    };

    const getCounts = (attendance) => {
        let p = 0;
        let a = 0;
        Object.values(attendance).forEach(val => {
            if (typeof val === 'string') {
                p += (val.match(/P/g) || []).length;
                a += (val.match(/A/g) || []).length;
            }
        });
        return { p, a };
    };

    // --- Export Logic ---

    const generatePDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape

        // Exact Colors from Reference
        const deepBlue = [54, 95, 145]; // #365f91
        const lightBlue = [220, 230, 241]; // #dce6f1
        const totalsGrey = [217, 217, 217]; // #d9d9d9

        // --- Manual Header Drawing (Pre-table) ---
        const bannerHeight = 12;
        const pageWidth = doc.internal.pageSize.getWidth(); // ~297mm
        const margin = 14;
        const tableWidth = pageWidth - (margin * 2);

        // 1. Top Banner: Editable Main Title
        doc.setFillColor(...deepBlue);
        doc.rect(margin, 10, tableWidth, bannerHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(mainTitle, pageWidth / 2, 10 + (bannerHeight / 1.5), { align: "center" });

        // 2. Legend & Date Row
        const row2Y = 10 + bannerHeight;
        const row2Height = 8;

        // Legend A
        const legendWidth = 25;
        const legendX = margin + 35;
        doc.setFillColor(...lightBlue); // Ensure Blue Fill
        doc.rect(legendX, row2Y, legendWidth, row2Height, 'F');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("A - Absent", legendX + (legendWidth / 2), row2Y + 5.5, { align: "center" });

        // Legend P
        const legendPX = legendX + legendWidth + 5;
        doc.setFillColor(...lightBlue); // EXPLICIT Reset Check
        doc.rect(legendPX, row2Y, legendWidth, row2Height, 'F');
        doc.setTextColor(0, 0, 0); // Text Black
        doc.text("P - Present", legendPX + (legendWidth / 2), row2Y + 5.5, { align: "center" });

        // Month/Year Box (Right aligned)
        const dateBoxWidth = 30;
        const dateBoxX = pageWidth - margin - dateBoxWidth;

        // Month Label & Value
        // Background for label - Explicit White
        doc.setFillColor(255, 255, 255);
        doc.rect(dateBoxX - 25, row2Y, 25, row2Height, 'F');

        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Month", dateBoxX - 2, row2Y + 5.5, { align: "right" });

        doc.setDrawColor(150);
        doc.setFillColor(255, 255, 255); // Background for value box
        doc.rect(dateBoxX, row2Y, dateBoxWidth, row2Height, 'FD'); // Fill and Draw
        doc.text(monthName, dateBoxX + (dateBoxWidth / 2), row2Y + 5.5, { align: "center" });

        // Year Label & Value
        const row3Y = row2Y + row2Height;

        // Background for label - Explicit White
        doc.setFillColor(255, 255, 255);
        doc.rect(dateBoxX - 25, row3Y, 25, row2Height, 'F');

        doc.text("Year", dateBoxX - 2, row3Y + 5.5, { align: "right" });

        doc.setFillColor(255, 255, 255); // Background for value box
        doc.rect(dateBoxX, row3Y, dateBoxWidth, row2Height, 'FD');
        doc.text(year.toString(), dateBoxX + (dateBoxWidth / 2), row3Y + 5.5, { align: "center" });

        // 3. Organization Title
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(title, pageWidth / 2, row3Y + 6, { align: "center" });

        // --- Table Data Preparation ---

        const head = [
            [
                { content: 'Employees', colSpan: 2, styles: { halign: 'left', fillColor: deepBlue, textColor: 255 } },
                ...daysArray.map(d => ({ content: d.dayName, styles: { halign: 'center', fillColor: deepBlue, textColor: 255 } })),
                { content: 'Totals', colSpan: 2, styles: { halign: 'center', fillColor: deepBlue, textColor: 255 } }
            ],
            [
                { content: 'ID', styles: { halign: 'center', fillColor: deepBlue, textColor: 255, cellWidth: 10 } },
                { content: 'Name', styles: { halign: 'left', fillColor: deepBlue, textColor: 255 } },
                ...daysArray.map(d => ({ content: d.date.toString(), styles: { halign: 'center', fillColor: deepBlue, textColor: 255 } })),
                { content: 'P', styles: { halign: 'center', fillColor: deepBlue, textColor: 255, cellWidth: 8 } },
                { content: 'A', styles: { halign: 'center', fillColor: deepBlue, textColor: 255, cellWidth: 8 } }
            ]
        ];

        const body = employees.map(emp => {
            const { p, a } = getCounts(emp.attendance);
            return [
                emp.id,
                emp.name,
                ...daysArray.map(d => emp.attendance[d.date] || ''),
                p,
                a || '-'
            ];
        });

        const totalP = employees.reduce((acc, emp) => acc + getCounts(emp.attendance).p, 0);
        const totalA = employees.reduce((acc, emp) => acc + getCounts(emp.attendance).a, 0);

        // Footer Row
        const footer = [
            { content: 'Totals', colSpan: 2 + daysArray.length, styles: { halign: 'right', fontStyle: 'bold', fillColor: totalsGrey } },
            { content: totalP, styles: { halign: 'center', fontStyle: 'bold', fillColor: totalsGrey } },
            { content: totalA, styles: { halign: 'center', fontStyle: 'bold', fillColor: totalsGrey } }
        ];
        body.push(footer);

        autoTable(doc, {
            head: head,
            body: body,
            startY: row3Y + 12, // Start below manual headers
            theme: 'grid',
            styles: {
                fontSize: 8,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
                textColor: 50,
                cellPadding: 1.5
            },
            headStyles: {
                lineWidth: 0.1,
                lineColor: [255, 255, 255]
            },
            didParseCell: function (data) {
                // Body P/A Color Logic
                if (data.section === 'body' && data.row.index < employees.length) {
                    const content = data.cell.raw;
                    if (content && typeof content === 'string') {
                        if (content.includes('P')) {
                            data.cell.styles.textColor = [0, 0, 0];
                        } else if (content.includes('A')) {
                            data.cell.styles.textColor = [200, 0, 0];
                        }
                    }
                }
                if (data.row.index === body.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        doc.save(`${title.replace(/ /g, '_')}_${monthName}_${year}.pdf`);
    };

    const generateExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(monthName);

        // Define Styles
        const deepBlueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF365F91' } };
        const lightBlueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
        const whiteText = { color: { argb: 'FFFFFFFF' }, bold: true };
        const blackText = { color: { argb: 'FF000000' } };
        const boldText = { bold: true };
        const centerAlign = { vertical: 'middle', horizontal: 'center' };
        const leftAlign = { vertical: 'middle', horizontal: 'left' };
        const borderStyle = {
            top: { style: 'thin', color: { argb: 'FF999999' } },
            left: { style: 'thin', color: { argb: 'FF999999' } },
            bottom: { style: 'thin', color: { argb: 'FF999999' } },
            right: { style: 'thin', color: { argb: 'FF999999' } }
        };

        const totalCols = daysArray.length + 4; // ID, Name, Days..., P, A

        // 1. Title Row
        worksheet.mergeCells(1, 1, 1, totalCols);
        const titleCell = worksheet.getCell(1, 1);
        titleCell.value = mainTitle;
        titleCell.fill = deepBlueFill;
        titleCell.font = { ...whiteText, size: 16 };
        titleCell.alignment = centerAlign;
        worksheet.getRow(1).height = 30;

        // 2. Legend & Date Row (Row 2 & 3)
        // Legend A
        worksheet.mergeCells(2, 2, 2, 3);
        const legendACell = worksheet.getCell(2, 2);
        legendACell.value = 'A - Absent';
        legendACell.fill = lightBlueFill;
        legendACell.alignment = centerAlign;
        legendACell.border = borderStyle;

        // Legend P
        worksheet.mergeCells(2, 4, 2, 5);
        const legendPCell = worksheet.getCell(2, 4);
        legendPCell.value = 'P - Present';
        legendPCell.fill = lightBlueFill;
        legendPCell.alignment = centerAlign;
        legendPCell.border = borderStyle;

        // Month
        const monthLabelCell = worksheet.getCell(2, totalCols - 2);
        monthLabelCell.value = 'Month';
        monthLabelCell.font = boldText;
        monthLabelCell.alignment = { horizontal: 'right' };

        const monthValCell = worksheet.getCell(2, totalCols - 1);
        monthValCell.value = monthName;
        monthValCell.alignment = centerAlign;
        monthValCell.border = borderStyle;
        worksheet.mergeCells(2, totalCols - 1, 2, totalCols);

        // Year
        const yearLabelCell = worksheet.getCell(3, totalCols - 2);
        yearLabelCell.value = 'Year';
        yearLabelCell.font = boldText;
        yearLabelCell.alignment = { horizontal: 'right' };

        const yearValCell = worksheet.getCell(3, totalCols - 1);
        yearValCell.value = year;
        yearValCell.alignment = centerAlign;
        yearValCell.border = borderStyle;
        worksheet.mergeCells(3, totalCols - 1, 3, totalCols);

        // Organization Title (Row 4)
        worksheet.mergeCells(4, 1, 4, totalCols);
        const orgCell = worksheet.getCell(4, 1);
        orgCell.value = title;
        orgCell.font = { size: 14, bold: true };
        orgCell.alignment = centerAlign;
        worksheet.getRow(4).height = 25;

        // 3. Table Headers
        // Row 5: "Employees", Days, "Totals"
        worksheet.mergeCells(5, 1, 5, 2); // Employees
        const empHeader = worksheet.getCell(5, 1);
        empHeader.value = 'Employees';
        empHeader.fill = deepBlueFill;
        empHeader.font = whiteText;
        empHeader.alignment = centerAlign;
        empHeader.border = borderStyle;

        daysArray.forEach((d, i) => {
            const cell = worksheet.getCell(5, 3 + i);
            cell.value = d.dayName;
            cell.fill = deepBlueFill;
            cell.font = { ...whiteText, size: 9 };
            cell.alignment = centerAlign;
            cell.border = borderStyle;
        });

        worksheet.mergeCells(5, totalCols - 1, 5, totalCols); // Totals header
        const totalsHeader = worksheet.getCell(5, totalCols - 1);
        totalsHeader.value = 'Totals';
        totalsHeader.fill = deepBlueFill;
        totalsHeader.font = whiteText;
        totalsHeader.alignment = centerAlign;
        totalsHeader.border = borderStyle;

        // Row 6: ID, Name, Dates, P, A
        const subHeaderRow = worksheet.getRow(6);
        subHeaderRow.values = ['ID', 'Name', ...daysArray.map(d => d.date), 'P', 'A'];
        subHeaderRow.eachCell((cell, colNumber) => {
            cell.fill = deepBlueFill;
            cell.font = whiteText;
            cell.alignment = centerAlign;
            cell.border = borderStyle;
        });

        // Col Widths
        worksheet.getColumn(1).width = 8; // ID
        worksheet.getColumn(2).width = 25; // Name
        for (let i = 3; i <= totalCols; i++) worksheet.getColumn(i).width = 4; // Days & Totals compact (will expand for headers if needed)
        worksheet.getColumn(totalCols - 1).width = 6;
        worksheet.getColumn(totalCols).width = 6;


        // 4. Data Rows
        employees.forEach(emp => {
            const { p, a } = getCounts(emp.attendance);
            const rowValues = [emp.id, emp.name];
            daysArray.forEach(d => {
                rowValues.push(emp.attendance[d.date] || '');
            });
            rowValues.push(p);
            rowValues.push(a || '-');

            const row = worksheet.addRow(rowValues);

            // Apply Borders & Styles
            row.eachCell((cell, colNumber) => {
                cell.border = borderStyle;
                cell.alignment = centerAlign;

                // Color Logic
                if (colNumber > 2 && colNumber <= daysArray.length + 2) {
                    const val = cell.value;
                    if (val && typeof val === 'string') {
                        if (val.includes('P')) {
                            // cell.font = { color: { argb: 'FF000000' } }; // Black default, explicitly set if needed
                        } else if (val.includes('A')) {
                            cell.font = { color: { argb: 'FFFF0000' }, bold: true }; // Red
                        }
                    }
                }
            });
            // ID & Name alignment
            row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
        });

        // 5. Totals Row
        const totalP = employees.reduce((acc, emp) => acc + getCounts(emp.attendance).p, 0);
        const totalA = employees.reduce((acc, emp) => acc + getCounts(emp.attendance).a, 0);

        const footerRow = worksheet.addRow([]);
        worksheet.mergeCells(footerRow.number, 1, footerRow.number, totalCols - 2);
        const footerLabel = worksheet.getCell(footerRow.number, 1);
        footerLabel.value = 'Totals';
        footerLabel.alignment = { horizontal: 'right', vertical: 'middle' };
        footerLabel.font = boldText;
        footerLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

        const pTotalCell = worksheet.getCell(footerRow.number, totalCols - 1);
        pTotalCell.value = totalP;
        pTotalCell.alignment = centerAlign;
        pTotalCell.font = boldText;
        pTotalCell.border = borderStyle;
        pTotalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

        const aTotalCell = worksheet.getCell(footerRow.number, totalCols);
        aTotalCell.value = totalA;
        aTotalCell.alignment = centerAlign;
        aTotalCell.font = boldText;
        aTotalCell.border = borderStyle;
        aTotalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

        // Buffer & Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${title.replace(/ /g, '_')}_${monthName}_${year}.xlsx`);
    };

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:w-auto">
                    <input
                        type="text"
                        value={mainTitle}
                        onChange={(e) => setMainTitle(e.target.value)}
                        className="text-3xl font-bold bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none transition-colors text-slate-100 placeholder-slate-600 w-full"
                    />
                    <p className="text-slate-400 mt-1">Manage monthly attendance for employees</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={generateExcel}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        <FileSpreadsheet size={18} />
                        Excel
                    </button>
                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-red-500/20 transition-all hover:scale-105"
                    >
                        <FileText size={18} />
                        PDF
                    </button>
                    <button
                        onClick={clearData}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium shadow-lg transition-all hover:scale-105"
                    >
                        <Trash2 size={18} />
                        Clear
                    </button>
                </div>
            </div>


            <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                {/* Controls */}
                <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col md:flex-row items-center gap-6 justify-between bg-slate-900">

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 shadow-sm">
                            <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white"><ChevronLeft size={20} /></button>
                            <div className="w-40 text-center">
                                <div className="text-sm text-slate-500 font-medium">{year}</div>
                                <div className="text-lg font-bold text-slate-200">{monthName}</div>
                            </div>
                            <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="flex-1 max-w-lg w-full">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-center text-xl font-semibold bg-transparent border-b-2 border-slate-800 focus:border-blue-500 focus:outline-none transition-colors px-4 py-2 text-slate-200 placeholder-slate-600"
                            placeholder="Enter Organization/Sheet Title"
                        />
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <div className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">P - Present</div>
                            <div className="text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">A - Absent</div>
                        </div>
                    </div>
                </div>

                {/* Bulk Action Toolbar */}
                {selection.size > 1 && (
                    <div className="bg-blue-600/20 border-b border-blue-500/30 p-2 flex items-center justify-between px-6 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="text-blue-200 font-medium text-sm">
                            {selection.size} cell{selection.size > 1 ? 's' : ''} selected
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => bulkUpdate('P')} className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded text-xs font-bold transition-colors">Mark P</button>
                            <button onClick={() => bulkUpdate('PP')} className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold transition-colors">Mark PP</button>
                            <button onClick={() => bulkUpdate('A')} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded text-xs font-bold transition-colors">Mark A</button>
                            <button onClick={() => bulkUpdate(undefined)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 rounded text-xs transition-colors">Clear</button>
                            <div className="w-px h-4 bg-blue-500/30 mx-2"></div>
                            <button onClick={() => setSelection(new Set())} className="text-slate-400 hover:text-white text-xs">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-xs">
                                <th className="p-4 w-16 text-center font-medium">ID</th>
                                <th className="p-4 min-w-[180px] font-medium">Name</th>
                                {daysArray.map(day => (
                                    <th key={day.date} className="p-1 px-2 text-center min-w-[36px] font-medium border-l border-slate-800">
                                        <div className="text-[10px] text-slate-500">{day.dayName}</div>
                                        <div className="text-slate-300 text-sm">{day.date}</div>
                                    </th>
                                ))}
                                <th className="p-3 text-center min-w-[50px] bg-emerald-950/30 text-emerald-500 border-l border-slate-800">P</th>
                                <th className="p-3 text-center min-w-[50px] bg-red-950/30 text-red-500 border-l border-slate-800">A</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {employees.map(emp => {
                                const { p, a } = getCounts(emp.attendance);
                                return (
                                    <tr key={emp.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-3 text-center font-medium text-slate-500">{emp.id}</td>
                                        <td className="p-3 font-medium text-slate-300">
                                            <input
                                                type="text"
                                                value={emp.name}
                                                onChange={(e) => updateEmployeeName(emp.id, e.target.value)}
                                                className="bg-transparent border-none focus:ring-0 w-full text-slate-300 placeholder-slate-600"
                                            />
                                        </td>
                                        {daysArray.map(day => (
                                            <td key={day.date} className="p-0 border-l border-slate-800/50 relative">
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(emp.id, day.date, e)}
                                                    onMouseEnter={() => handleMouseEnter(emp.id, day.date)}
                                                    onClick={() => selection.size <= 1 && toggleAttendance(emp.id, day.date)}
                                                    className={`w-full h-10 flex items-center justify-center cursor-pointer transition-all select-none
                                                        ${getStatusColor(emp.attendance[day.date])}
                                                        ${selection.has(`${emp.id}-${day.date}`) ? 'ring-2 ring-blue-500 z-10 bg-blue-500/20' : ''}
                                                    `}
                                                    title="Click to toggle, Drag to select multiple"
                                                >
                                                    {emp.attendance[day.date]}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="p-3 text-center font-bold text-emerald-500 bg-emerald-500/5 border-l border-slate-800">{p}</td>
                                        <td className="p-3 text-center font-bold text-red-500 bg-red-500/5 border-l border-slate-800">{a || '-'}</td>
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => removeEmployee(emp.id)}
                                                className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Add Employee Row */}
                            <tr className="bg-slate-900 border-t-2 border-slate-800">
                                <td className="p-3 text-center text-slate-600">#</td>
                                <td className="p-2" colSpan={1}>
                                    <form onSubmit={addEmployee} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newEmployeeName}
                                            onChange={(e) => setNewEmployeeName(e.target.value)}
                                            placeholder="Add new employee..."
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none text-slate-200 placeholder-slate-500"
                                        />
                                        <button type="submit" className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </form>
                                </td>
                                <td colSpan={daysArray.length + 3}></td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-950 font-bold text-slate-500 border-t border-slate-800">
                                <td colSpan={2} className="p-3 text-right">Running Totals</td>
                                {daysArray.map(day => (
                                    <td key={day.date} className="p-2 text-center text-xs text-slate-600 border-l border-slate-800">

                                    </td>
                                ))}
                                <td className="p-3 text-center text-emerald-600 bg-emerald-900/10 border-l border-slate-800">
                                    {employees.reduce((acc, emp) => acc + getCounts(emp.attendance).p, 0)}
                                </td>
                                <td className="p-3 text-center text-red-600 bg-red-900/10 border-l border-slate-800">
                                    {employees.reduce((acc, emp) => acc + getCounts(emp.attendance).a, 0)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default AttendanceTracker;
