
import { CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react';

interface OrderStatusProgressProps {
  currentStatus: string;
  size?: 'sm' | 'default';
}

const OrderStatusProgress = ({ currentStatus, size = 'default' }: OrderStatusProgressProps) => {
  const steps = [
    { key: 'PENDING_CONFIRMATION', label: 'Pending', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
    { key: 'OUT_FOR_DELIVERY', label: 'In Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Package }
  ];

  const getCurrentStepIndex = () => {
    if (currentStatus === 'CANCELLED') return -1;
    return steps.findIndex(step => step.key === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = currentStatus === 'CANCELLED';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const dotSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className={iconSize} />
          <span className="font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full max-w-lg">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`${dotSize} rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                <Icon className={iconSize} />
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusProgress;
