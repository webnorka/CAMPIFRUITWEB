import { useState } from 'react';
import { useConfirm } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Save,
    GripVertical,
    Layers,
    Image as ImageIcon,
    CheckCircle2,
    Eye,
    EyeOff
} from 'lucide-react';
import { useFamilies } from '../context/FamiliesContext';
import ImageUpload from '../components/ImageUpload';

export default function FamiliesEditor() {
    const confirm = useConfirm();
    const toast = useToast();
    const { families, loading, addFamily, editFamily, deleteFamily, reorderFamilies } = useFamilies();
    const [editingFamily, setEditingFamily] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', image: '' });
    const [draggedItem, setDraggedItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAdd = () => {
        setIsAdding(true);
        setEditingFamily(null);
        setFormData({ name: '', description: '', image: '' });
    };

    const handleEdit = (family) => {
        setEditingFamily(family);
        setIsAdding(false);
        setFormData({
            name: family.name,
            description: family.description || '',
            image: family.image || ''
        });
    };

    const handleCancel = () => {
        setEditingFamily(null);
        setIsAdding(false);
        setFormData({ name: '', description: '', image: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            if (isAdding) {
                await addFamily(formData);
            } else if (editingFamily) {
                await editFamily(editingFamily.id, formData);
            }
            handleCancel();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch {
            toast.error('Error al guardar la familia');
        }
    };

    const handleDelete = async (id) => {
        if (!await confirm('¿Eliminar esta familia? Los productos asociados quedarán sin categoría.')) return;
        try {
            await deleteFamily(id);
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const handleToggleActive = async (family) => {
        try {
            await editFamily(family.id, { active: !family.active });
        } catch {
            toast.error('Error al cambiar estado');
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e, family) => {
        setDraggedItem(family);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetFamily) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetFamily.id) return;

        const newOrder = [...families];
        const draggedIndex = newOrder.findIndex(f => f.id === draggedItem.id);
        const targetIndex = newOrder.findIndex(f => f.id === targetFamily.id);

        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);

        await reorderFamilies(newOrder);
        setDraggedItem(null);
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-display font-black text-forest tracking-tight">Familias de Productos</h2>
                    <p className="text-forest/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        Organiza tu catálogo en categorías
                    </p>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-3 bg-forest text-accent px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-forest/20 hover:scale-105 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Familia
                </button>
            </div>

            {/* Success toast */}
            {showSuccess && (
                <div className="fixed top-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Guardado correctamente</span>
                </div>
            )}

            {/* Add/Edit Form */}
            {(isAdding || editingFamily) && (
                <div className="card-bento bg-white mb-8 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-display font-black text-forest">
                                {isAdding ? 'Nueva Familia' : 'Editar Familia'}
                            </h3>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5 text-forest/40" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                    placeholder="Ej: Frutas Tropicales"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                    placeholder="Descripción breve"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                Imagen de Cabecera
                            </label>
                            <ImageUpload
                                currentImage={formData.image}
                                onUpload={(url) => setFormData({ ...formData, image: url })}
                                folder="families"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-4 text-forest/40 font-black uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition-all text-[10px]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-3 bg-forest text-accent px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-forest/20 hover:scale-105 transition-all"
                            >
                                <Save className="w-4 h-4" />
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Families List */}
            <div className="card-bento bg-white">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-forest/30">Cargando familias...</p>
                    </div>
                ) : families.length === 0 ? (
                    <div className="py-20 text-center">
                        <Layers className="w-16 h-16 text-forest/5 mx-auto mb-6" />
                        <p className="font-black text-forest/20 uppercase tracking-widest text-sm mb-6">No hay familias creadas</p>
                        <button
                            onClick={handleAdd}
                            className="text-accent-dark font-bold hover:underline"
                        >
                            Crear la primera familia
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-forest/5">
                        {families.map((family) => (
                            <div
                                key={family.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, family)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, family)}
                                className={`flex items-center gap-6 p-6 hover:bg-organic/30 transition-all cursor-move ${draggedItem?.id === family.id ? 'opacity-50' : ''
                                    } ${!family.active ? 'opacity-50' : ''}`}
                            >
                                {/* Drag Handle */}
                                <div className="text-forest/20 hover:text-forest/40 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                {/* Image */}
                                <div className="w-16 h-16 rounded-2xl bg-organic overflow-hidden flex-shrink-0">
                                    {family.image ? (
                                        <img src={family.image} alt={family.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-forest/10" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-forest text-lg truncate">{family.name}</h4>
                                    <p className="text-forest/40 text-sm truncate">{family.description || 'Sin descripción'}</p>
                                    <p className="text-[10px] font-bold text-forest/20 uppercase tracking-widest mt-1">
                                        /{family.slug}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(family)}
                                        className={`p-3 rounded-xl transition-all ${family.active
                                            ? 'hover:bg-emerald-50 text-emerald-500'
                                            : 'hover:bg-gray-100 text-forest/20'
                                            }`}
                                        title={family.active ? 'Visible' : 'Oculta'}
                                    >
                                        {family.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(family)}
                                        className="p-3 hover:bg-forest/5 rounded-xl transition-all text-forest/40 hover:text-forest"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(family.id)}
                                        className="p-3 hover:bg-rose-50 rounded-xl transition-all text-rose-300 hover:text-rose-500"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
