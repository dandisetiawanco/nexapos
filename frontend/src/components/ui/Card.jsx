import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={twMerge(
                'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, title, subtitle, ...props }) {
    return (
        <div className={twMerge('p-6 space-y-1', className)} {...props}>
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
            {children}
        </div>
    );
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={twMerge('p-6 pt-0', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children, ...props }) {
    return (
        <div className={twMerge('p-6 pt-0 flex items-center', className)} {...props}>
            {children}
        </div>
    );
}
