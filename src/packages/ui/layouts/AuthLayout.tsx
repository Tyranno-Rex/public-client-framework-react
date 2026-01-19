/**
 * AuthLayout - Layout for authentication pages (login, register, etc.)
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface AuthLayoutProps {
  children: ReactNode;
  /** Logo element */
  logo?: ReactNode;
  /** Title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Footer content (links, etc.) */
  footer?: ReactNode;
  /** Background variant */
  variant?: 'default' | 'gradient' | 'image';
  /** Background image URL (for 'image' variant) */
  backgroundImage?: string;
  /** Additional class name */
  className?: string;
}

export function AuthLayout({
  children,
  logo,
  title,
  subtitle,
  footer,
  variant = 'default',
  backgroundImage,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        variant === 'default' && 'bg-gray-50 dark:bg-dark-bg',
        variant === 'gradient' && 'bg-gradient-to-br from-primary-500 to-primary-700',
        className
      )}
      style={
        variant === 'image' && backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Overlay for image variant */}
      {variant === 'image' && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'w-full max-w-md',
            variant !== 'default' && 'bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6'
          )}
        >
          {/* Logo */}
          {logo && (
            <div className="flex justify-center mb-8">
              {logo}
            </div>
          )}

          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className={cn(
                  'text-2xl font-bold',
                  variant === 'default' ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                )}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className={cn(
                  'mt-2 text-sm',
                  variant === 'default' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Form Card (for default variant) */}
          {variant === 'default' ? (
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm p-6">
              {children}
            </div>
          ) : (
            children
          )}
        </motion.div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="py-6 text-center relative z-10">
          <div className={cn(
            'text-sm',
            variant === 'default'
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-white/70'
          )}>
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}
