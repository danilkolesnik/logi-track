interface DeliveredIconProps {
  className?: string;
}

export function DeliveredIcon({ className = 'w-6 h-6 text-green-600' }: DeliveredIconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
