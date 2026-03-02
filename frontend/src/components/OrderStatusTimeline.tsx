import { Check, Clock, Package, Truck, Home } from 'lucide-react';
import { OrderStatus } from '../backend';

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

const steps = [
  { key: OrderStatus.processing, label: 'Processing', icon: Clock, desc: 'Order received' },
  { key: OrderStatus.confirmed, label: 'Confirmed', icon: Check, desc: 'Payment verified' },
  { key: OrderStatus.shipped, label: 'Shipped', icon: Truck, desc: 'On the way' },
  { key: OrderStatus.delivered, label: 'Delivered', icon: Home, desc: 'Arrived safely' },
];

const statusOrder = [
  OrderStatus.processing,
  OrderStatus.confirmed,
  OrderStatus.shipped,
  OrderStatus.delivered,
];

export default function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="w-full py-6">
      <div className="relative flex items-start justify-between">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-px bg-gold/10 z-0" />
        <div
          className="absolute top-5 left-0 h-px bg-gold z-0 transition-all duration-700"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gold border-gold text-charcoal'
                    : isCurrent
                    ? 'bg-charcoal border-gold text-gold shadow-[0_0_16px_oklch(0.78_0.09_85/0.4)]'
                    : 'bg-charcoal border-gold/20 text-cream/20'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-center">
                <p className={`font-sans text-xs font-medium tracking-wider uppercase ${
                  isCurrent ? 'text-gold' : isCompleted ? 'text-cream/70' : 'text-cream/25'
                }`}>
                  {step.label}
                </p>
                <p className={`font-sans text-xs mt-0.5 ${
                  isCurrent ? 'text-cream/60' : isCompleted ? 'text-cream/40' : 'text-cream/15'
                }`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
