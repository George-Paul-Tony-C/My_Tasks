import { useState } from 'react';

export default function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full mb-2 w-max bg-gray-700 text-white text-xs rounded py-1 px-2">
          {content}
        </div>
      )}
    </div>
  );
}
