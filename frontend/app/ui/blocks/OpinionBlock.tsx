/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Article } from '../../model';

export default function OpinionBlock({ data }: { data: any }) {
    const { items = [], title, background } = data;

    return (
        <div className={`py-12 px-4 ${background ? '' : 'bg-stone-100 dark:bg-stone-900'} rounded-xl my-8`}>
            {title && (
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-serif font-bold italic text-gray-800 dark:text-gray-100 relative inline-block">
                        <span className="relative z-10 px-4">{title}</span>
                        <span className="absolute bottom-2 left-0 w-full h-3 bg-yellow-200 dark:bg-yellow-800 -z-0 opacity-50"></span>
                    </h3>
                </div>
            )}

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((article: Article) => (
                    <Link href={`/${article.url}`} key={article.id} className="group text-center flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform duration-300">
                                {article.author && typeof article.author !== 'string' && (article.author as any).image?.asset?._ref ? (
                                    // TODO: Resolve author image properly if needed, for now fallback or main image
                                    <img src={article.main_image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-2xl font-serif text-gray-600">
                                        {(typeof article.author === 'string' ? article.author : article.author?.name || 'A').charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-full">
                                Opinión
                            </div>
                        </div>

                        <h4 className="font-serif text-xl font-bold leading-tight mb-2 group-hover:text-green-700 transition-colors">
                            {article.title}
                        </h4>

                        <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-auto pt-2 border-t border-gray-300 dark:border-gray-700 w-12 mx-auto">
                            {typeof article.author === 'string' ? article.author : article.author?.name}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
