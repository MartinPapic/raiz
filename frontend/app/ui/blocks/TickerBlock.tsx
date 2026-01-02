import Link from 'next/link';

export default function TickerBlock({ data }: { data: any }) {
    const { content, link, type = 'breaking' } = data;

    const colors: any = {
        breaking: 'bg-red-600 text-white',
        trending: 'bg-green-600 text-white',
        info: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };

    const labels: any = {
        breaking: 'ÚLTIMA HORA',
        trending: 'TENDENCIA',
        info: 'INFO'
    };

    const Layout = (
        <div className="flex items-center w-full overflow-hidden text-sm font-medium h-10">
            <div className={`px-4 h-full flex items-center font-bold tracking-wider shrink-0 ${colors[type]}`}>
                {labels[type]}
            </div>
            <div className="px-4 flex-1 truncate bg-white dark:bg-gray-900 border-y border-r dark:border-gray-800 h-full flex items-center">
                <span className="animate-marquee whitespace-nowrap md:animate-none">
                    {content}
                </span>
            </div>
        </div>
    );

    if (link) {
        return <Link href={link} className="block hover:opacity-90">{Layout}</Link>;
    }

    return Layout;
}
