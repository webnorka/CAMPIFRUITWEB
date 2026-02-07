import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, Check, X, Loader2, Table2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useFamilies } from '../context/FamiliesContext';
import { useProducts } from '../context/ProductsContext';

const CSV_COLUMNS = [
    { key: 'id', label: 'ID', required: false },
    { key: 'name', label: 'Nombre', required: true },
    { key: 'description', label: 'Descripción', required: false },
    { key: 'price', label: 'Precio', required: true },
    { key: 'offer_price', label: 'Precio Oferta', required: false },
    { key: 'on_sale', label: 'En Oferta', required: false },
    { key: 'category', label: 'Categoría', required: false },
    { key: 'family', label: 'Familia', required: false },
    { key: 'weight', label: 'Peso', required: false },
    { key: 'stock', label: 'Stock', required: false },
    { key: 'sku', label: 'SKU', required: false },
    { key: 'image', label: 'Imagen URL', required: false }
];

function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function parseCSV(text) {
    const lines = [];
    let current = '';
    let inQuotes = false;
    const rows = [];

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (i + 1 < text.length && text[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                lines.push(current);
                current = '';
            } else if (ch === '\n' || ch === '\r') {
                if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') i++;
                lines.push(current);
                current = '';
                if (lines.length > 0) rows.push([...lines]);
                lines.length = 0;
            } else {
                current += ch;
            }
        }
    }
    lines.push(current);
    if (lines.length > 0) rows.push([...lines]);

    return rows;
}

export default function BulkImportExport() {
    const { families } = useFamilies();
    const { products, refreshProducts } = useProducts();
    const [tab, setTab] = useState('export');
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [preview, setPreview] = useState(null); // { headers, rows, errors }
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    // ── EXPORT ──────────────────────────────────────────────────
    const handleExport = async () => {
        setExporting(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, families!products_family_id_fkey(name)')
                .order('name');

            if (error) throw error;

            const header = CSV_COLUMNS.map(c => c.label).join(',');
            const rows = (data || []).map(p => {
                return CSV_COLUMNS.map(c => {
                    if (c.key === 'family') return escapeCSV(p.families?.name || '');
                    if (c.key === 'on_sale') return p.on_sale ? 'Sí' : 'No';
                    return escapeCSV(p[c.key]);
                }).join(',');
            });

            const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM for Excel
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `productos_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
        } finally {
            setExporting(false);
        }
    };

    // ── IMPORT ──────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            const rows = parseCSV(text);
            if (rows.length < 2) {
                setPreview({ headers: [], rows: [], errors: ['El archivo está vacío o no tiene datos'] });
                return;
            }

            const headers = rows[0].map(h => h.trim());
            const dataRows = rows.slice(1).filter(r => r.some(cell => cell.trim()));
            const errors = [];

            // Validate headers
            const nameIdx = headers.findIndex(h => h.toLowerCase() === 'nombre');
            const priceIdx = headers.findIndex(h => h.toLowerCase() === 'precio');
            if (nameIdx === -1) errors.push('Falta la columna "Nombre" (obligatoria)');
            if (priceIdx === -1) errors.push('Falta la columna "Precio" (obligatoria)');

            // Map headers to keys
            const headerMap = headers.map(h => {
                const col = CSV_COLUMNS.find(c => c.label.toLowerCase() === h.toLowerCase());
                return col ? col.key : null;
            });

            // Validate rows
            const parsedRows = dataRows.map((row, i) => {
                const obj = {};
                headerMap.forEach((key, j) => {
                    if (key) obj[key] = row[j]?.trim() || '';
                });

                if (!obj.name) errors.push(`Fila ${i + 2}: nombre vacío`);
                if (obj.price && isNaN(Number(obj.price))) errors.push(`Fila ${i + 2}: precio no válido "${obj.price}"`);

                return obj;
            });

            setPreview({ headers: headerMap, rows: parsedRows, errors });
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!preview || preview.errors.length > 0) return;
        setImporting(true);
        setImportResult(null);

        let added = 0, updated = 0, skipped = 0;
        const importErrors = [];

        try {
            for (const row of preview.rows) {
                try {
                    // Resolve family
                    let familyId = null;
                    if (row.family) {
                        const match = families.find(f =>
                            f.name.toLowerCase() === row.family.toLowerCase()
                        );
                        if (match) familyId = match.id;
                    }

                    const productData = {
                        name: row.name,
                        description: row.description || null,
                        price: Number(row.price) || 0,
                        offer_price: Number(row.offer_price) || 0,
                        on_sale: row.on_sale?.toLowerCase() === 'sí' || row.on_sale?.toLowerCase() === 'si' || row.on_sale === 'true',
                        category: row.category || null,
                        family_id: familyId,
                        weight: row.weight || null,
                        stock: row.stock !== '' ? Number(row.stock) : null,
                        sku: row.sku || null,
                        image: row.image || null
                    };

                    if (row.id) {
                        // Update existing product
                        const { error } = await supabase
                            .from('products')
                            .update(productData)
                            .eq('id', row.id);
                        if (error) throw error;
                        updated++;
                    } else {
                        // Insert new product
                        const { error } = await supabase
                            .from('products')
                            .insert([{ ...productData, id: crypto.randomUUID() }]);
                        if (error) throw error;
                        added++;
                    }
                } catch (err) {
                    skipped++;
                    importErrors.push(`"${row.name}": ${err.message}`);
                }
            }

            setImportResult({ added, updated, skipped, errors: importErrors });
            if (refreshProducts) refreshProducts();
            setPreview(null);
        } catch (err) {
            console.error('Import error:', err);
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Table2 className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-display font-black text-forest">Importar / Exportar</h2>
                    <p className="text-xs text-forest/40 font-bold uppercase tracking-widest">Gestión masiva de productos</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => { setTab('export'); setPreview(null); setImportResult(null); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'export'
                        ? 'bg-forest text-accent shadow-lg shadow-forest/20'
                        : 'bg-white text-forest/40 border border-forest/10 hover:border-forest/20'
                        }`}
                >
                    <Download className="w-4 h-4" /> Exportar
                </button>
                <button
                    onClick={() => { setTab('import'); setImportResult(null); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'import'
                        ? 'bg-forest text-accent shadow-lg shadow-forest/20'
                        : 'bg-white text-forest/40 border border-forest/10 hover:border-forest/20'
                        }`}
                >
                    <Upload className="w-4 h-4" /> Importar
                </button>
            </div>

            {/* EXPORT TAB */}
            {tab === 'export' && (
                <div className="bg-white rounded-3xl p-8 border border-forest/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-5 h-5 text-forest/30" />
                        <h3 className="text-lg font-black text-forest">Exportar Catálogo Completo</h3>
                    </div>
                    <p className="text-sm text-forest/50 font-medium mb-6">
                        Descarga todos los productos en formato CSV. Incluye nombre, precio, stock, familia y más.
                        Puedes editar el archivo y volver a importarlo.
                    </p>
                    <div className="bg-organic rounded-2xl p-4 mb-6">
                        <p className="text-xs font-bold text-forest/30 mb-2">Columnas incluidas:</p>
                        <div className="flex flex-wrap gap-2">
                            {CSV_COLUMNS.map(c => (
                                <span key={c.key} className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${c.required ? 'bg-primary-50 text-primary-500' : 'bg-forest/5 text-forest/30'
                                    }`}>
                                    {c.label}{c.required ? ' *' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="h-12 px-8 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/90 transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? 'Exportando...' : `Exportar ${products.length} Productos`}
                    </button>
                </div>
            )}

            {/* IMPORT TAB */}
            {tab === 'import' && (
                <div className="space-y-6">
                    {/* Upload Area */}
                    <div className="bg-white rounded-3xl p-8 border border-forest/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Upload className="w-5 h-5 text-forest/30" />
                            <h3 className="text-lg font-black text-forest">Importar Productos desde CSV</h3>
                        </div>
                        <p className="text-sm text-forest/50 font-medium mb-4">
                            Sube un archivo CSV con los productos. Si incluyes la columna "ID", se actualizarán los productos existentes.
                            Los productos sin ID se crearán como nuevos.
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,text/csv"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className="block w-full text-center py-8 border-2 border-dashed border-forest/10 rounded-2xl cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all"
                        >
                            <Upload className="w-8 h-8 mx-auto text-forest/20 mb-2" />
                            <p className="text-sm font-bold text-forest/40">Haz clic para seleccionar un archivo CSV</p>
                            <p className="text-[10px] text-forest/20 font-medium mt-1">O arrastra y suelta aquí</p>
                        </label>
                    </div>

                    {/* Preview Table */}
                    {preview && (
                        <div className="bg-white rounded-3xl p-6 border border-forest/5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-forest">
                                    Vista Previa — {preview.rows.length} producto{preview.rows.length !== 1 ? 's' : ''}
                                </h3>
                                <button onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    className="p-2 text-forest/20 hover:text-forest rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Errors */}
                            {preview.errors.length > 0 && (
                                <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-4">
                                    <p className="text-xs font-black text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" /> Errores encontrados
                                    </p>
                                    <ul className="space-y-1">
                                        {preview.errors.map((e, i) => (
                                            <li key={i} className="text-xs text-rose-600 font-medium">{e}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Data Preview */}
                            <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-forest/5">
                                <table className="w-full text-xs">
                                    <thead className="bg-organic sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-black text-forest/30 uppercase tracking-wider">#</th>
                                            <th className="px-3 py-2 text-left font-black text-forest/30 uppercase tracking-wider">Nombre</th>
                                            <th className="px-3 py-2 text-left font-black text-forest/30 uppercase tracking-wider">Precio</th>
                                            <th className="px-3 py-2 text-left font-black text-forest/30 uppercase tracking-wider">Familia</th>
                                            <th className="px-3 py-2 text-left font-black text-forest/30 uppercase tracking-wider">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.slice(0, 20).map((row, i) => (
                                            <tr key={i} className="border-t border-forest/5 hover:bg-organic/50">
                                                <td className="px-3 py-2 text-forest/30">{i + 1}</td>
                                                <td className="px-3 py-2 font-bold text-forest">{row.name || '—'}</td>
                                                <td className="px-3 py-2 text-forest/60">{row.price || '—'}</td>
                                                <td className="px-3 py-2 text-forest/40">{row.family || '—'}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${row.id ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'
                                                        }`}>
                                                        {row.id ? 'Actualizar' : 'Nuevo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {preview.rows.length > 20 && (
                                            <tr>
                                                <td colSpan="5" className="px-3 py-2 text-center text-forest/30 text-[10px] font-bold">
                                                    ...y {preview.rows.length - 20} más
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Import Button */}
                            <div className="mt-4 flex items-center gap-4">
                                <button
                                    onClick={handleImport}
                                    disabled={importing || preview.errors.length > 0}
                                    className="h-11 px-8 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/90 transition-all disabled:opacity-50 flex items-center gap-3"
                                >
                                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {importing ? 'Importando...' : `Importar ${preview.rows.length} Productos`}
                                </button>
                                {preview.errors.length > 0 && (
                                    <p className="text-xs text-rose-500 font-bold">Corrige los errores antes de importar</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Import Result */}
                    {importResult && (
                        <div className="bg-white rounded-3xl p-6 border border-forest/5 shadow-sm">
                            <h3 className="text-sm font-black text-forest mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-500" /> Importación Completada
                            </h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-green-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-black text-green-600">{importResult.added}</p>
                                    <p className="text-[10px] font-black text-green-400 uppercase tracking-wider">Creados</p>
                                </div>
                                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-black text-amber-600">{importResult.updated}</p>
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Actualizados</p>
                                </div>
                                <div className="bg-rose-50 rounded-2xl p-4 text-center">
                                    <p className="text-2xl font-black text-rose-600">{importResult.skipped}</p>
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Errores</p>
                                </div>
                            </div>
                            {importResult.errors.length > 0 && (
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                                    <ul className="space-y-1">
                                        {importResult.errors.map((e, i) => (
                                            <li key={i} className="text-xs text-rose-600 font-medium">{e}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
