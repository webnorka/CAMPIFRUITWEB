import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { X, Upload, Scissors, Check, RefreshCw } from 'lucide-react';

export default function ImageUpload({ onUpload, currentImage }) {
    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
            setIsCropping(true);
        };
        reader.readAsDataURL(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels);

            // Format filename: timestamp-random.jpg
            const filename = `upload-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;

            // Import supabase dynamically or from props/context if not available, 
            // but we can import it at top actually.
            // Let's assume we import supabase from utils
            const { data, error } = await import('../utils/supabaseClient')
                .then(m => m.supabase.storage
                    .from('product-images')
                    .upload(filename, croppedBlob, {
                        cacheControl: '3600',
                        upsert: false
                    })
                );

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = await import('../utils/supabaseClient')
                .then(m => m.supabase.storage
                    .from('product-images')
                    .getPublicUrl(data.path)
                );

            onUpload(publicUrl);
            setIsCropping(false);
            setImage(null);

        } catch (e) {
            console.error('Upload failed:', e);
            alert('Error al subir imagen: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="label-text">Imagen del Producto</label>

            {!isCropping ? (
                <div
                    {...getRootProps()}
                    className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                        }`}
                >
                    <input {...getInputProps()} />

                    {currentImage ? (
                        <>
                            <img
                                src={currentImage}
                                alt="Product preview"
                                className="absolute inset-0 w-full h-full object-cover opacity-40"
                            />
                            <div className="relative z-10 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2">
                                <RefreshCw className="w-6 h-6 text-primary-600" />
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cambiar Imagen</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <Upload className="w-6 h-6 text-primary-600" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-sm font-bold text-gray-900">Arrastra o haz clic</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 5MB</p>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="fixed inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center p-4 sm:p-8">
                    <div className="relative w-full max-w-2xl aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-primary-600" />
                                <span className="font-bold text-gray-900">Recortar Imagen</span>
                            </div>
                            <button
                                onClick={() => setIsCropping(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative flex-1 h-[calc(100%-120px)] mt-16 bg-gray-50">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-between gap-6">
                            <div className="flex-1 flex items-center gap-4">
                                <span className="text-xs font-bold text-gray-400 uppercase">Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="btn-primary flex items-center gap-2 py-3 px-8 shadow-xl shadow-primary-500/20"
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Aplicar y Subir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
