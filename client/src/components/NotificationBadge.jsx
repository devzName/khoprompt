const NotificationBadge = ({ count }) => {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;
