
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const PageContainer = ({ 
  children, 
  className, 
  title, 
  description, 
  action,
  maxWidth = '2xl' 
}: PageContainerProps) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-none'
  };

  return (
    <div className={cn("container mx-auto generous-padding", maxWidthClasses[maxWidth], className)}>
      {(title || description || action) && (
        <div className="generous-margin">
          <div className="flex items-start justify-between generous-gap">
            <div className="space-y-2">
              {title && (
                <h1 className="text-hierarchy-hero tracking-tight">{title}</h1>
              )}
              {description && (
                <p className="text-hierarchy-caption max-w-2xl">{description}</p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0 loading-fade-in">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="loading-fade-in">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
