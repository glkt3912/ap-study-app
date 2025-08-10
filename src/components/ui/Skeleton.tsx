'use client';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
}

export function Skeleton({ className = '', height = 'h-4', width = 'w-full' }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${height} ${width} ${className}`} />;
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card-primary ${className}`}>
      <div className="p-4 sm:p-6">
        <Skeleton height='h-6' width='w-3/4' className='mb-4' />
        <Skeleton height='h-4' width='w-full' className='mb-2' />
        <Skeleton height='h-4' width='w-5/6' className='mb-2' />
        <Skeleton height='h-4' width='w-4/5' />
      </div>
    </div>
  );
}

export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card-primary ${className}`}>
      <div className="p-4 sm:p-6">
        <Skeleton height='h-6' width='w-1/2' className='mb-4' />
        <div className='h-[200px] bg-slate-100 dark:bg-slate-700 rounded animate-pulse' />
      </div>
    </div>
  );
}
