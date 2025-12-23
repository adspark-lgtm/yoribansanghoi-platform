'use client';

import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

const colorClasses = {
  primary: 'border-primary/30 border-t-primary',
  white: 'border-white/30 border-t-white',
  gray: 'border-gray-200 border-t-gray-600',
};

export function Spinner({ size = 'md', color = 'primary' }: SpinnerProps) {
  return (
    <div
      className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = '로딩 중...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 text-center shadow-2xl"
      >
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </motion.div>
    </div>
  );
}

interface LoadingDotsProps {
  color?: 'primary' | 'gray' | 'white';
}

export function LoadingDots({ color = 'primary' }: LoadingDotsProps) {
  const colorClass = {
    primary: 'bg-primary',
    gray: 'bg-gray-400',
    white: 'bg-white',
  }[color];

  return (
    <div className="flex gap-1 justify-center items-center">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-2 h-2 rounded-full ${colorClass}`}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Skeleton Components
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <Skeleton className="w-16 h-16 rounded-xl mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-gray-50 border-b">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4 p-4 border-b last:border-0">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonFactoryCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex gap-6">
        <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between mb-4">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Indicator
interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'primary' | 'green' | 'blue' | 'yellow';
}

const progressColors = {
  primary: 'from-primary to-primary-light',
  green: 'from-green-500 to-green-400',
  blue: 'from-blue-500 to-blue-400',
  yellow: 'from-yellow-500 to-yellow-400',
};

const progressSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

export function Progress({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  color = 'primary',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>진행률</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${progressSizes[size]}`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${progressColors[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
