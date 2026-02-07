export default function SkeletonCard() {
    return (
        <div className="card-bento overflow-hidden flex flex-col h-full bg-white animate-pulse">
            {/* Image placeholder */}
            <div className="m-3 sm:m-5 rounded-[1.5rem] sm:rounded-[2rem] aspect-square bg-forest/5" />

            {/* Content */}
            <div className="p-5 sm:p-8 pt-0 flex-1 flex flex-col">
                {/* Category */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="h-2.5 w-16 bg-forest/5 rounded-full" />
                </div>

                {/* Name */}
                <div className="h-5 sm:h-6 w-3/4 bg-forest/8 rounded-lg mb-2 sm:mb-3" />

                {/* Description */}
                <div className="space-y-2 mb-6 sm:mb-8">
                    <div className="h-3 w-full bg-forest/5 rounded-full" />
                    <div className="h-3 w-2/3 bg-forest/5 rounded-full" />
                </div>

                {/* Price + Button */}
                <div className="mt-auto flex items-center justify-between gap-3 sm:gap-4">
                    <div className="h-7 w-20 bg-forest/8 rounded-lg" />
                    <div className="h-12 sm:h-14 w-[110px] sm:w-[140px] bg-forest/5 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
