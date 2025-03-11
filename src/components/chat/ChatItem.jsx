const ChatItem = ({ chat, onLoadChat, onDeleteChat, isDeleting, isActive }) => {
  return (
    <div
      className={`group relative flex items-center gap-3 rounded-md border ${
        isActive ? "border-[#e5e5e5] bg-white" : "border-transparent hover:border-[#e5e5e5] hover:bg-[#f5f5f5]"
      } px-3 py-2 transition-colors duration-200`}
      role="button"
      onClick={() => onLoadChat(chat.id)}
    >
      {/* Chat icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-[#1a1a1a]" : "text-[#666666]"}`}
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      {/* Chat title */}
      <span className={`line-clamp-1 flex-1 text-sm ${isActive ? "text-[#1a1a1a]" : "text-[#666666]"}`}>
        {chat.title || "Nuevo chat"}
      </span>

      {/* Delete button */}
      <button
        type="button"
        className={`flex-shrink-0 rounded-md p-1 opacity-0 transition-opacity duration-200 hover:bg-[#f0f0f0] group-hover:opacity-100 ${
          isActive ? "text-[#1a1a1a]" : "text-[#666666]"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onDeleteChat(chat.id);
        }}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#666666]"></div>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatItem;
